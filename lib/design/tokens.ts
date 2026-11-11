/**
 * Lecture des couleurs déclarées dans `styles/tokens.css`.
 * Sert au test de contraste et à la page /design : le CSS reste la seule source de vérité.
 */

export type ThemeName = "light" | "dark";
export type ThemeColors = Record<string, string>;

function block(css: string, selector: string) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Bloc introuvable : ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

function vars(body: string): ThemeColors {
  const out: ThemeColors = {};
  for (const m of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    if (m[1] && m[2]) out[m[1]] = m[2].trim();
  }
  return out;
}

export function parseThemeTokens(css: string): Record<ThemeName, ThemeColors> {
  return {
    light: vars(block(css, '[data-theme="light"] {')),
    dark: vars(block(css, '[data-theme="dark"] {')),
  };
}

/** Couleurs utilisées pour du texte : elles doivent atteindre AA sur bg et surface. */
export const TEXT_TOKENS = ["ink", "ink-muted", "accent"] as const;
export const BACKGROUND_TOKENS = ["bg", "surface"] as const;
/** Couleurs décoratives : traits, halos, 3D. Jamais pour du texte. */
export const DECORATIVE_TOKENS = ["line", "line-strong", "accent-glow"] as const;
