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
  attribute float aSeed;  // tirage aléatoire : type d'étoile, couleur, rythme
  uniform float uScroll;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uLight;   // 1 = thème clair
  uniform float uWarp;    // élan du saut quantique (px), voir PageTransition
  varying float vAlpha;
  varying float vAccent;
  varying float vSize;
  varying float vSparkle; // 0 = point rond, 1 = étincelle à quatre branches

  void main() {
    // Parallaxe : les étoiles proches défilent un peu plus vite que les lointaines,
    // toutes nettement plus lentement que la page. Le champ se répète verticalement.
    float speed = mix(0.03, 0.22, aBase.z);
    float h = uRes.y * 1.25;
    // Saut quantique : toutes les étoiles filent vers le haut, les proches plus vite.
    float y = mod(aBase.y * h - uScroll * speed - uWarp * mix(0.35, 1.0, aBase.z), h) - uRes.y * 0.125;
    float x = aBase.x * uRes.x;
    gl_Position = vec4(x / uRes.x * 2.0 - 1.0, 1.0 - y / uRes.y * 2.0, 0.0, 1.0);

    // Respiration lente, propre à chaque étoile
    float breath = sin(uTime * (0.25 + fract(aSeed * 13.7) * 0.9) + aSeed * 60.0);

    // Répartition : grandes étincelles (rares), moyennes, puis une majorité de points fins
    float large = step(0.988, aSeed);
    float medium = step(0.93, aSeed) * (1.0 - large);
    vSparkle = max(large, medium);
    vAccent = step(0.6, fract(aSeed * 31.0)) * vSparkle; // une partie des étincelles en accent

    if (vSparkle > 0.5) {
      float base = large > 0.5 ? mix(22.0, 32.0, aBase.z) : mix(9.0, 15.0, aBase.z);
      vSize = base * (0.92 + 0.08 * breath) * uPixelRatio;
      vAlpha = 0.8 + 0.2 * breath;
    } else {
      // Points fins : plus discrets encore en thème clair, où ils se liraient comme des taches
      vSize = mix(1.0, mix(2.2, 1.4, uLight), aBase.z * aBase.z) * uPixelRatio;
      vAlpha = (0.6 + 0.4 * breath) * mix(0.3, 1.0, aBase.z) * mix(1.0, 0.45, uLight);
    }
    gl_PointSize = vSize;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vAccent;
  varying float vSize;
  varying float vSparkle;

  // Branche effilée et concave : demi-largeur qui se resserre vers la pointe.
  // a = position le long de la branche (0 au centre, 1 à la pointe), b = écart latéral.
  float ray(float a, float b, float width, float aa) {
    if (a >= 1.0) return 0.0;
    float w = width * pow(1.0 - a, 3.2);
    return 1.0 - smoothstep(w - aa, w + aa, b);
  }

  void main() {
    vec3 color = mix(uColor, uAccent, vAccent);

    if (vSparkle < 0.5) {
      float d = length(gl_PointCoord - 0.5);
      gl_FragColor = vec4(color, smoothstep(0.5, 0.0, d) * vAlpha * uOpacity);
      return;
    }

    // Étincelle : quatre longues branches (axes) + quatre courtes (diagonales) + un cœur
    vec2 p = (gl_PointCoord - 0.5) * 2.0;      // -1 … 1
    float ax = abs(p.x);
    float ay = abs(p.y);
    float aa = 2.0 / vSize;                     // un pixel, pour l'anticrénelage

    float main = max(ray(ax, ay, 0.24, aa), ray(ay, ax, 0.24, aa));
    float u = (ax + ay) * 0.7071;               // repère tourné de 45°
    float v = abs(ax - ay) * 0.7071;
    float diag = ray(u / 0.5, v / 0.5, 0.2, aa / 0.5);
    float core = 1.0 - smoothstep(0.13 - aa, 0.13 + aa, length(p));

    float a = max(max(main, diag), core) * vAlpha * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(color, a);
  }
`;

/**
 * M · Fond étoilé, en espace écran (indépendant de la caméra), qui dérive lentement au
 * défilement : une majorité de points fins et quelques étincelles à quatre branches
 * effilées (plus quatre courtes en diagonale), de tailles variées, qui respirent lentement.
 */
export function Starfield({ colors, pathname }: { colors: ThemeColors; pathname: string }) {
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
          uWarp: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  // Saut quantique : à chaque changement de page, élan de 1,6 écran en 0,9 s (accélération puis freinage).
  const warp = useRef({ base: 0, start: -1, first: true });
  useEffect(() => {
    if (warp.current.first) {
      warp.current.first = false; // pas d'élan au premier affichage
      return;
    }
    warp.current.start = performance.now();
  }, [pathname]);

  useFrame(({ clock }) => {
    const u = material.uniforms;
    const w = warp.current;
    if (w.start >= 0) {
      const t = Math.min(1, (performance.now() - w.start) / 900);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const jump = size.height * 1.6;
      u.uWarp!.value = w.base + jump * ease;
      if (t >= 1) {
        w.base += jump;
        w.start = -1;
      }
    }
    u.uScroll!.value = window.scrollY;
    (u.uRes!.value as Vector2).set(size.width, size.height);
    u.uTime!.value = clock.elapsedTime;
    u.uPixelRatio!.value = dpr;
  });

  useEffect(() => {
    const u = material.uniforms;
    (u.uColor!.value as Color).set(colors.ink);
    (u.uAccent!.value as Color).set(colors.dark ? colors.glow : colors.accent);
    u.uOpacity!.value = colors.dark ? 0.85 : 0.5;
    u.uLight!.value = colors.dark ? 0 : 1;
    material.blending = colors.dark ? AdditiveBlending : NormalBlending;
    material.needsUpdate = true;
  }, [colors, material]);

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />;
}
