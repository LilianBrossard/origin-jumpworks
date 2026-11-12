"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
  type PerspectiveCamera,
  type Texture,
} from "three";
import { cameraDistance, FOV } from "./camera";
import type { ThemeColors } from "./useThemeColors";

/**
 * Silhouettes utilisées par les nuées (vues de profil, nez à gauche → vol de droite à gauche).
 * Largeur à l'écran en px, plus petite pour donner l'impression d'éloignement.
 */
const FLOCK_SHIPS = [
  { slug: "100i", width: 22 },
  { slug: "125a", width: 22 },
  { slug: "135c", width: 22 },
  { slug: "300i", width: 28 },
  { slug: "315p", width: 28 },
  { slug: "325a", width: 28 },
  { slug: "350r", width: 28 },
  { slug: "400i", width: 40 },
];
const SOLO = { slug: "m50", width: 26 };

/** Profondeur des nuées derrière le plan de la page (px) */
const DEPTH = 600;

type Bird = {
  mesh: Mesh;
  slug: string;
  offset: [number, number];
  x: number;
  y: number;
  /** Taille à l'écran (px), pour savoir si un clic touche ce vaisseau */
  w: number;
  h: number;
};
type Flight = {
  birds: Bird[];
  leaderX: number;
  baseY: number;
  speed: number; // px/s
  phase: number;
  solo: boolean;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * M2 · Les nuées : de temps en temps (toutes les 20 à 40 s), une petite formation de
 * vaisseaux traverse le ciel au loin, comme des oiseaux. Parfois, un M50 passe seul, vite.
 * Les silhouettes suivent la caméra : elles appartiennent au ciel, pas à la page.
 */
export function Flock({
  colors,
  onSelect,
}: {
  colors: ThemeColors;
  /** Bonus caché : un clic sur un vaisseau de la nuée ouvre sa fiche */
  onSelect?: (slug: string) => void;
}) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const group = useRef<Group>(null);
  const flight = useRef<Flight | null>(null);
  const nextAt = useRef(0);

  const textures = useMemo(() => {
    const loader = new TextureLoader();
    const map = new Map<string, { tex: Texture; aspect: number }>();
    for (const s of [...FLOCK_SHIPS, SOLO]) {
      const entry = { tex: null as unknown as Texture, aspect: 4 };
      entry.tex = loader.load(`/ships/${s.slug}/silhouette.png`, (t) => {
        const img = t.image as { width: number; height: number };
        entry.aspect = img.width / img.height;
      });
      entry.tex.colorSpace = SRGBColorSpace;
      map.set(s.slug, entry);
    }
    return map;
  }, []);

  const material = useMemo(
    () => new MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.5 }),
    [],
  );
  const plane = useMemo(() => new PlaneGeometry(1, 1), []);

  useEffect(() => {
    material.color.set(colors.ink);
    // Thème clair : silhouettes plus soutenues pour rester lisibles sur l'ivoire
    material.opacity = colors.dark ? 0.42 : 0.6;
    // Les vaisseaux déjà en vol changent aussi de teinte
    for (const b of flight.current?.birds ?? []) {
      const m = b.mesh.material as MeshBasicMaterial;
      m.color.copy(material.color);
      m.opacity = material.opacity;
    }
  }, [colors, material]);

  useEffect(
    () => () => {
      plane.dispose();
      material.dispose();
      for (const { tex } of textures.values()) tex.dispose();
    },
    [plane, material, textures],
  );

  // Bonus caché : survol et clic sur les vaisseaux de la nuée. Le canvas laisse passer
  // les événements ; on teste donc nous-mêmes la position du pointeur à l'écran.
  // Les liens, boutons et champs gardent toujours la priorité.
  useEffect(() => {
    if (!onSelect) return;
    const INTERACTIVE = "a, button, input, select, textarea, label, summary, dialog, [role=button]";
    let hovered: Bird | null = null;

    const hit = (e: PointerEvent | MouseEvent) => {
      const f = flight.current;
      if (!f) return null;
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return null;
      const k = (cameraDistance(size.height) + DEPTH) / cameraDistance(size.height);
      for (const b of f.birds) {
        const sx = size.width / 2 + b.x / k;
        const sy = size.height / 2 - b.y / k;
        if (Math.abs(e.clientX - sx) < b.w / 2 + 8 && Math.abs(e.clientY - sy) < b.h / 2 + 10) {
          return b;
        }
      }
      return null;
    };

    const setHover = (b: Bird | null) => {
      if (hovered === b) return;
      if (hovered) (hovered.mesh.material as MeshBasicMaterial).opacity = material.opacity;
      hovered = b;
      if (b) (b.mesh.material as MeshBasicMaterial).opacity = Math.min(1, material.opacity + 0.35);
      document.documentElement.style.cursor = b ? "pointer" : "";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setHover(hit(e));
    };
    const onClick = (e: MouseEvent) => {
      const b = hit(e);
      if (!b) return;
      setHover(null);
      onSelect(b.slug);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      setHover(null);
    };
  }, [onSelect, size, material]);

  /** Demi-largeur et demi-hauteur visibles à la profondeur des nuées */
  const halfView = () => {
    const d = cameraDistance(size.height) + DEPTH;
    const halfH = d * Math.tan((FOV * Math.PI) / 360);
    return { halfW: halfH * (size.width / size.height), halfH };
  };

  const launch = () => {
    const g = group.current;
    if (!g) return;
    const { halfW, halfH } = halfView();
    const solo = Math.random() < 0.25;
    const scale = (cameraDistance(size.height) + DEPTH) / cameraDistance(size.height);
    const birds: Bird[] = [];

    const add = (slug: string, width: number, offset: [number, number]) => {
      const entry = textures.get(slug);
      if (!entry) return;
      const mat = material.clone();
      mat.map = entry.tex;
      const mesh = new Mesh(plane, mat);
      const w = width * scale;
      mesh.scale.set(w, w / entry.aspect, 1);
      g.add(mesh);
      birds.push({ mesh, slug, offset, x: 0, y: 0, w: width, h: width / entry.aspect });
    };

    if (solo) {
      add(SOLO.slug, SOLO.width, [0, 0]);
    } else {
      // Formation en V : chef devant, ailiers de part et d'autre, de plus en plus en arrière
      const n = Math.floor(rand(5, 9));
      for (let i = 0; i < n; i++) {
        const rank = Math.ceil(i / 2);
        const side = i % 2 === 0 ? 1 : -1;
        const ship = FLOCK_SHIPS[Math.floor(Math.random() * FLOCK_SHIPS.length)]!;
        add(ship.slug, ship.width * rand(0.85, 1.1), [
          rank * rand(40, 56) * scale,
          side * rank * rand(18, 26) * scale,
        ]);
      }
    }

    const leaderX = halfW + 120 * scale;
    const baseY = rand(-halfH * 0.55, halfH * 0.6);
    for (const b of birds) {
      b.x = leaderX + b.offset[0];
      b.y = baseY + b.offset[1];
    }
    flight.current = {
      birds,
      leaderX,
      baseY,
      speed: (solo ? rand(380, 460) : rand(70, 110)) * scale,
      phase: Math.random() * Math.PI * 2,
      solo,
    };
  };

  const land = () => {
    const f = flight.current;
    const g = group.current;
    if (!f || !g) return;
    for (const b of f.birds) {
      g.remove(b.mesh);
      (b.mesh.material as MeshBasicMaterial).dispose();
    }
    flight.current = null;
  };

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const now = clock.elapsedTime;
    const dt = Math.min(delta, 0.1);

    // Le groupe suit la caméra : les nuées restent dans le ciel quand on défile.
    g.position.set(camera.position.x, camera.position.y, -DEPTH);

    if (!flight.current) {
      if (nextAt.current === 0) nextAt.current = now + rand(6, 10); // premier passage
      if (now >= nextAt.current) launch();
      return;
    }

    const f = flight.current;
    f.leaderX -= f.speed * dt;
    const t = now + f.phase;
    const leaderY = f.baseY + Math.sin(t * 0.35) * 30 + Math.sin(t * 0.9) * 6;

    for (const b of f.birds) {
      // Chaque vaisseau rejoint sa place dans la formation avec un léger retard élastique
      const tx = f.leaderX + b.offset[0] + Math.sin(t * 1.3 + b.offset[1]) * 4;
      const ty = leaderY + b.offset[1] + Math.cos(t * 1.1 + b.offset[0]) * 3;
      const k = 1 - Math.exp(-dt * 2.5);
      b.x += (tx - b.x) * (f.solo ? 1 : k);
      b.y += (ty - b.y) * (f.solo ? 1 : k);
      b.mesh.position.set(b.x, b.y, 0);
      // Légère inclinaison dans les virages
      b.mesh.rotation.z = (ty - b.y) * 0.004;
    }

    const { halfW } = halfView();
    const last = Math.max(...f.birds.map((b) => b.x));
    if (last < -halfW - 200) {
      land();
      nextAt.current = now + rand(20, 40);
    }
  });

  return <group ref={group} renderOrder={0} />;
}
