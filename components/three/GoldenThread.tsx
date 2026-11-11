"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, CanvasTexture, NormalBlending, Sprite, SpriteMaterial } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { buildThread, countUntil, type ThreadPath } from "./threadPath";
import type { ThemeColors } from "./useThemeColors";

/** Halo doux pour la tête du fil */
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

/**
 * M1 · Le fil d'or : une ligne unique, très fine, qui se dessine au fil du défilement.
 * Elle passe par les filets numérotés des sections, ondule entre eux, glisse derrière
 * les images, puis redessine le monogramme en bas de page.
 */
export function GoldenThread({ colors }: { colors: ThemeColors }) {
  const size = useThree((s) => s.size);
  const path = useRef<ThreadPath | null>(null);
  const drawn = useRef(0);

  const { line, glow, tip } = useMemo(() => {
    const line = new Line2(
      new LineGeometry(),
      new LineMaterial({ linewidth: 1.3, transparent: true, depthWrite: false }),
    );
    const glow = new Line2(
      new LineGeometry(),
      new LineMaterial({ linewidth: 6, transparent: true, depthWrite: false }),
    );
    const tip = new Sprite(
      new SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false }),
    );
    tip.scale.set(26, 26, 1);
    for (const o of [line, glow, tip]) o.frustumCulled = false;
    return { line, glow, tip };
  }, []);

  // (Re)calcul du tracé : au montage, au redimensionnement et quand la page change de hauteur.
  useEffect(() => {
    let timer = 0;
    const rebuild = () => {
      const next = buildThread(size.width);
      path.current = next;
      if (!next) return;
      const flat = next.points.flatMap((p) => [p.x, p.y, p.z]);
      for (const l of [line, glow]) {
        l.geometry.dispose();
        l.geometry = new LineGeometry();
        l.geometry.setPositions(flat);
        l.computeLineDistances();
      }
      drawn.current = Math.min(drawn.current, next.points.length);
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(rebuild, 150);
    };
    rebuild();
    document.fonts?.ready.then(schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, [size.width, line, glow]);

  // Couleurs selon le thème
  useEffect(() => {
    const lm = line.material;
    const gm = glow.material;
    const tm = tip.material;
    lm.color.set(colors.accent);
    lm.opacity = colors.dark ? 0.95 : 0.9;
    gm.color.set(colors.dark ? colors.glow : colors.accent);
    gm.opacity = colors.dark ? 0.13 : 0.08;
    gm.blending = colors.dark ? AdditiveBlending : NormalBlending;
    tm.color.set(colors.dark ? colors.glow : colors.accent);
    tm.opacity = colors.dark ? 0.9 : 0.5;
    tm.blending = colors.dark ? AdditiveBlending : NormalBlending;
    for (const m of [lm, gm, tm]) m.needsUpdate = true;
  }, [colors, line, glow, tip]);

  useEffect(() => {
    line.material.resolution.set(size.width, size.height);
    glow.material.resolution.set(size.width, size.height);
  }, [size, line, glow]);

  useEffect(
    () => () => {
      for (const l of [line, glow]) {
        l.geometry.dispose();
        l.material.dispose();
      }
      tip.material.map?.dispose();
      tip.material.dispose();
    },
    [line, glow, tip],
  );

  useFrame((_, delta) => {
    const p = path.current;
    if (!p) {
      line.visible = glow.visible = tip.visible = false;
      return;
    }
    const total = p.points.length;
    const vh = size.height;
    const maxScroll = document.documentElement.scrollHeight - vh;
    // Le fil précède légèrement le regard : il atteint ~70 % de la hauteur d'écran.
    const target =
      window.scrollY >= maxScroll - 4 ? total : countUntil(p.reach, window.scrollY + vh * 0.72);

    // Avance amortie (jamais d'à-coup), un peu plus vive quand il y a du retard
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 3.2);
    drawn.current += (target - drawn.current) * k;
    const n = Math.max(0, Math.min(total, Math.round(drawn.current)));

    line.visible = glow.visible = n > 1;
    line.geometry.instanceCount = Math.max(0, n - 1);
    glow.geometry.instanceCount = Math.max(0, n - 1);

    const head = p.points[Math.max(0, n - 1)];
    tip.visible = n > 1 && n < total - 1;
    if (head) tip.position.copy(head);
  });

  return (
    <group>
      <primitive object={glow} />
      <primitive object={line} />
      <primitive object={tip} />
    </group>
  );
}
