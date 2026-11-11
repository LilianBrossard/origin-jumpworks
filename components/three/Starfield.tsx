"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
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
  uniform float uLight;   // 1 = thème clair
  varying float vAlpha;
  varying float vAccent;
  varying float vSize;

  void main() {
    // Parallaxe : les étoiles proches défilent un peu plus vite que les lointaines,
    // toutes nettement plus lentement que la page. Le champ se répète verticalement.
    float speed = mix(0.03, 0.22, aBase.z);
    float h = uRes.y * 1.25;
    float y = mod(aBase.y * h - uScroll * speed, h) - uRes.y * 0.125;
    float x = aBase.x * uRes.x;
    gl_Position = vec4(x / uRes.x * 2.0 - 1.0, 1.0 - y / uRes.y * 2.0, 0.0, 1.0);
    vAccent = step(0.92, aSeed);

    if (uLight > 0.5) {
      // Thème clair : seule une étoile sur six subsiste, sous forme de fine croix
      // (repère de plan technique), sans scintillement.
      if (aSeed > 0.16) {
        // Hors champ (une taille nulle serait ramenée à 1 px par certains GPU)
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        gl_PointSize = 0.0;
        vSize = 0.0;
        vAlpha = 0.0;
        return;
      }
      vSize = mix(11.0, 15.0, aBase.z) * uPixelRatio;
      gl_PointSize = vSize;
      vAlpha = mix(0.55, 1.0, aBase.z);
      return;
    }

    // Thème sombre : points ronds qui scintillent lentement
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.35 + aSeed * 1.2) + aSeed * 50.0);
    vAlpha = twinkle * mix(0.3, 1.0, aBase.z);
    vSize = mix(1.0, 2.4, aBase.z * aBase.z) * uPixelRatio;
    gl_PointSize = vSize;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uLight;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vAccent;
  varying float vSize;

  void main() {
    vec3 color = mix(uColor, uAccent, vAccent);
    if (uLight > 0.5) {
      if (vSize < 1.0) discard;
      // Croix d'un pixel, aux branches qui s'effacent vers les extrémités
      vec2 q = (gl_PointCoord - 0.5) * vSize;
      float arm = 0.55 * uPixelRatio;
      float onArm = max(step(abs(q.x), arm), step(abs(q.y), arm));
      float fade = 1.0 - smoothstep(vSize * 0.28, vSize * 0.5, max(abs(q.x), abs(q.y)));
      float a = onArm * fade * vAlpha * uOpacity;
      if (a < 0.01) discard;
      gl_FragColor = vec4(color, a);
      return;
    }
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(color, a * vAlpha * uOpacity);
  }
`;

/**
 * M · Fond étoilé : un champ de points très discret, en espace écran (indépendant de la
 * caméra), qui dérive lentement au défilement. En thème clair, les points ronds se liraient
 * comme des poussières sur l'écran : il ne reste alors que quelques fines croix, comme les
 * repères d'un plan technique.
 */
export function Starfield({ colors }: { colors: ThemeColors }) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

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

  // Matériau créé à la main : on agit ensuite toujours sur `material.uniforms`
  // (three.js / R3F copient l'objet `uniforms` passé en propriété).
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uScroll: { value: 0 },
          uRes: { value: new Vector2(1, 1) },
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uColor: { value: new Color() },
          uAccent: { value: new Color() },
          uOpacity: { value: 1 },
          uLight: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    const u = material.uniforms;
    u.uScroll!.value = window.scrollY;
    (u.uRes!.value as Vector2).set(size.width, size.height);
    u.uTime!.value = clock.elapsedTime;
    u.uPixelRatio!.value = dpr;
  });

  useEffect(() => {
    const u = material.uniforms;
    (u.uColor!.value as Color).set(colors.ink);
    (u.uAccent!.value as Color).set(colors.dark ? colors.glow : colors.accent);
    u.uOpacity!.value = colors.dark ? 0.85 : 0.32;
    u.uLight!.value = colors.dark ? 0 : 1;
    material.blending = colors.dark ? AdditiveBlending : NormalBlending;
    material.needsUpdate = true;
  }, [colors, material]);

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />;
}
