import { CatmullRomCurve3, Vector3 } from "three";

/**
 * Tracé du fil d'or, calculé à partir des repères posés dans la page :
 *
 *   data-thread="start"        point de départ (ouverture)
 *   data-thread="left|right"   le fil passe au début / à la fin de l'élément (les filets numérotés)
 *   data-thread="end"          le monogramme de fin : le fil le redessine (barre + cercle)
 *
 * Coordonnées monde : x = pixels depuis la gauche, y = −pixels depuis le haut du document.
 */

type Anchor = { kind: string; x: number; y: number; w: number; h: number };

/** Position dans le document par les offsets : ignore les `transform` (apparitions en cours). */
function docRect(el: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

export function readAnchors(): Anchor[] {
  return [...document.querySelectorAll<HTMLElement>("[data-thread]")]
    .map((el) => ({ kind: el.dataset.thread ?? "left", ...docRect(el) }))
    .filter((a) => a.w > 0 || a.h > 0)
    .sort((a, b) => a.y - b.y);
}

export type ThreadPath = {
  /** Points échantillonnés à intervalle régulier, en coordonnées monde */
  points: Vector3[];
  /** Pour chaque point, la plus grande profondeur (y document) atteinte jusque-là */
  reach: Float32Array;
};

export function buildThread(viewportWidth: number, spacing = 5): ThreadPath | null {
  const anchors = readAnchors();
  if (anchors.length < 2) return null;

  // Sur petit écran, le texte occupe toute la largeur : le fil reste dans la marge gauche
  // (ondulation légère) pour ne pas traverser les paragraphes.
  const narrow = viewportWidth < 768;
  const gutter = Math.min(40, Math.max(16, viewportWidth * 0.04));
  const clampX = (x: number) => Math.min(viewportWidth - 10, Math.max(10, x));
  const sideX = (a: Anchor) => {
    if (narrow) return gutter / 2;
    return a.kind === "right" ? clampX(a.x + a.w + 28) : clampX(a.x - 28);
  };

  const raw: Vector3[] = [];
  const push = (x: number, y: number, z = 0) => raw.push(new Vector3(x, -y, z));

  const first = anchors[0]!;
  // Le fil descend depuis le haut de la page jusqu'au premier repère.
  push(sideX(first), 0);

  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i]!;
    const next = anchors[i + 1];

    if (a.kind === "end") {
      // Monogramme : viewBox 48 × 48, cercle de rayon 15.5, barre de 2 à 46.
      const cx = a.x + a.w / 2;
      const cy = a.y + a.h / 2;
      const r = (a.w * 15.5) / 48;
      const half = (a.w * 22) / 48;
      // Approche douce par la gauche, puis la barre jusqu'au bord droit du cercle…
      push(Math.max(gutter / 2, cx - half - 150), cy - 90, narrow ? 0 : -20);
      push(cx - half - 40, cy - 6);
      for (let x = cx - half; x <= cx + r; x += 6) push(x, cy);
      // …le tour complet du cercle (sens horaire à l'écran)…
      const steps = 96;
      for (let s = 1; s <= steps; s++) {
        const t = (s / steps) * Math.PI * 2;
        push(cx + r * Math.cos(t), cy + r * Math.sin(t));
      }
      // …et la fin de la barre.
      for (let x = cx + r + 6; x <= cx + half; x += 6) push(x, cy);
      break;
    }

    const ax = sideX(a);
    const ay = a.y + a.h / 2;
    push(ax, ay);

    if (next) {
      // Entre deux repères, le fil ondule et prend un peu de profondeur.
      const nx = next.kind === "end" ? next.x : sideX(next);
      const ny = next.y + next.h / 2;
      const gap = ny - ay;
      if (narrow) {
        // Petite ondulation dans la marge, sans profondeur
        if (next.kind !== "end") {
          push(ax + gutter * 0.15, ay + gap / 3);
          push(ax - gutter * 0.15, ay + (gap * 2) / 3);
        }
      } else {
        const dir = ax < viewportWidth / 2 ? 1 : -1;
        const swing = dir * viewportWidth * 0.2;
        push(ax + (nx - ax) / 3 + swing, ay + gap / 3, -70);
        push(ax + ((nx - ax) * 2) / 3 + swing * 0.4, ay + (gap * 2) / 3, 40);
      }
    }
  }

  const curve = new CatmullRomCurve3(raw, false, "centripetal");
  const count = Math.max(2, Math.round(curve.getLength() / spacing));
  const points = curve.getSpacedPoints(count);

  const reach = new Float32Array(points.length);
  let max = -Infinity;
  points.forEach((p, i) => {
    max = Math.max(max, -p.y);
    reach[i] = max;
  });
  return { points, reach };
}

/** Nombre de points à tracer pour que le fil atteigne la profondeur `y` du document. */
export function countUntil(reach: Float32Array, y: number) {
  let lo = 0;
  let hi = reach.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((reach[mid] ?? 0) <= y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
