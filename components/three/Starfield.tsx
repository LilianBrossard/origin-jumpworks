"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  ShaderMaterial,
  Vector2,
} from "three";
import type { ThemeColors } from "./useThemeColors";

const vertex = /* glsl */ `
  attribute vec3 aBase;   // x (0–1), y (0–1), profondeur (0 = loin, 1 = proche)
  attribute float aSeed;
  uniform float uScroll;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    // Parallaxe : les étoiles proches défilent un peu plus vite que les lointaines,
    // toutes nettement plus lentement que la page. Le champ se répète verticalement.
    float speed = mix(0.03, 0.22, aBase.z);
    float h = uRes.y * 1.25;
    float y = mod(aBase.y * h - uScroll * speed, h) - uRes.y * 0.125;
    float x = aBase.x * uRes.x;
    gl_Position = vec4(x / uRes.x * 2.0 - 1.0, 1.0 - y / uRes.y * 2.0, 0.0, 1.0);

    // Scintillement lent et irrégulier
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.35 + aSeed * 1.2) + aSeed * 50.0);
    vAlpha = twinkle * mix(0.3, 1.0, aBase.z);
    vAccent = step(0.92, aSeed);
    gl_PointSize = mix(1.0, 2.4, aBase.z * aBase.z) * uPixelRatio;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uColor, uAccent, vAccent), a * vAlpha * uOpacity);
  }
`;

/**
 * M · Fond étoilé : un champ de points très discret, en espace écran (indépendant de la
 * caméra), qui dérive lentement au défilement. Discret dans le thème clair.
 */
export function Starfield({ colors }: { colors: ThemeColors }) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const material = useRef<ShaderMaterial>(null);

  // Densité proportionnelle à la surface de l'écran
  const count = Math.round(Math.min(900, (size.width * size.height) / 2600));

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const base = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      base[i * 3] = Math.random();
      base[i * 3 + 1] = Math.random();
      base[i * 3 + 2] = Math.pow(Math.random(), 2.2); // surtout des étoiles lointaines
      seed[i] = Math.random();
    }
    g.setAttribute("aBase", new BufferAttribute(base, 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 1));
    // Positions factices : le vertex shader calcule tout
    g.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uScroll: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uColor: { value: new Color() },
      uAccent: { value: new Color() },
      uOpacity: { value: 1 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    uniforms.uScroll.value = window.scrollY;
    uniforms.uRes.value.set(size.width, size.height);
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uPixelRatio.value = dpr;
  });

  useEffect(() => {
    uniforms.uColor.value.set(colors.ink);
    uniforms.uAccent.value.set(colors.dark ? colors.glow : colors.accent);
    uniforms.uOpacity.value = colors.dark ? 0.85 : 0.35;
    if (material.current) {
      material.current.blending = colors.dark ? AdditiveBlending : NormalBlending;
      material.current.needsUpdate = true;
    }
  }, [colors, uniforms]);

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-1}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </points>
  );
}
