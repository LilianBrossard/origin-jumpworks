import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/* Audit d'accessibilité automatique (axe-core, WCAG 2.2 A et AA), dans les deux thèmes. */

const PAGES = [
  "/fr/",
  "/en/",
  "/fr/fleet/",
  "/fr/fleet/890-jump/",
  "/en/fleet/x1/",
  "/fr/compare/?ships=890-jump,600i-explorer",
  "/fr/credits/",
  "/fr/design/",
];

for (const scheme of ["dark", "light"] as const) {
  test.describe(`thème ${scheme}`, () => {
    test.use({ colorScheme: scheme, reducedMotion: "reduce" });

    for (const url of PAGES) {
      test(`${url} sans violation WCAG AA`, async ({ page }, info) => {
        test.skip(info.project.name === "mobile", "un seul format suffit pour axe");
        await page.goto(url);
        // Tout le contenu apparu (les apparitions au défilement sont instantanées ici)
        await page.evaluate(() =>
          document
            .querySelectorAll("[data-reveal]")
            .forEach((e) => e.setAttribute("data-revealed", "")),
        );
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .exclude("canvas")
          .analyze();
        const summary = results.violations.map(
          (v) =>
            `${v.id} (${v.impact}) : ${v.nodes
              .map((n) => n.target.join(" "))
              .slice(0, 3)
              .join(" | ")}`,
        );
        expect(summary).toEqual([]);
      });
    }
  });
}
