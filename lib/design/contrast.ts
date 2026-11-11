/** Calcul du contraste WCAG 2.x entre deux couleurs hexadécimales opaques (#rrggbb). */

function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Couleur non supportée : ${hex}`);
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Seuils WCAG : AA texte courant 4.5, AA grand texte 3, AAA texte courant 7. */
export function wcagLevel(ratio: number): "AAA" | "AA" | "AA large" | "—" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "—";
}
