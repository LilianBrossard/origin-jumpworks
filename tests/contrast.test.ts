import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../lib/design/contrast";
import { BACKGROUND_TOKENS, TEXT_TOKENS, parseThemeTokens } from "../lib/design/tokens";

const css = readFileSync(path.resolve("styles/tokens.css"), "utf8");
const themes = parseThemeTokens(css);

describe("tokens de couleur", () => {
  for (const [name, colors] of Object.entries(themes)) {
    describe(`thème ${name}`, () => {
      for (const text of TEXT_TOKENS) {
        for (const bg of BACKGROUND_TOKENS) {
          it(`--${text} sur --${bg} atteint AA (≥ 4.5:1)`, () => {
            const fg = colors[text];
            const back = colors[bg];
            expect(fg, `--${text} manquant`).toBeDefined();
            expect(back, `--${bg} manquant`).toBeDefined();
            expect(contrastRatio(fg!, back!)).toBeGreaterThanOrEqual(4.5);
          });
        }
      }
    });
  }

  it("le bloc sombre du réglage système est identique au thème sombre forcé", () => {
    const start = css.indexOf("@media (prefers-color-scheme: dark)");
    const media = css.slice(start);
    const body = media.slice(media.indexOf("{", media.indexOf(":root")) + 1);
    const system: Record<string, string> = {};
    for (const m of body.slice(0, body.indexOf("}")).matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      if (m[1] && m[2]) system[m[1]] = m[2].trim();
    }
    expect(system).toEqual(themes.dark);
  });
});
