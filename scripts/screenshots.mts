/**
 * Captures d'écran pour le README (docs/screenshots), prises sur le site exporté.
 *
 *   pnpm build && pnpm preview   (dans un autre terminal, port 3000)
 *   pnpm screenshots [url de base]
 */
import { mkdir } from "node:fs/promises";
import { chromium, devices } from "@playwright/test";
import sharp from "sharp";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = "docs/screenshots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });

type Shot = {
  name: string;
  path: string;
  scheme: "dark" | "light";
  mobile?: boolean;
  /** Élément à amener en haut de l'écran avant la capture */
  scrollTo?: string;
  offset?: number;
};

const shots: Shot[] = [
  { name: "accueil-sombre", path: "/fr/", scheme: "dark" },
  { name: "accueil-clair", path: "/fr/", scheme: "light" },
  { name: "manifeste-fil-or", path: "/fr/", scheme: "dark", scrollTo: "#manifeste", offset: -40 },
  { name: "echelle", path: "/fr/", scheme: "dark", scrollTo: "#echelle-titre", offset: -260 },
  { name: "acquerir", path: "/fr/", scheme: "light", scrollTo: "#acquerir-titre", offset: -160 },
  { name: "flotte", path: "/fr/fleet/", scheme: "dark", scrollTo: "main", offset: 220 },
  { name: "fiche-890-jump", path: "/fr/fleet/890-jump/", scheme: "dark" },
  {
    name: "comparateur",
    path: "/fr/compare/?ships=890-jump,600i-explorer,400i",
    scheme: "light",
    scrollTo: "#compare-0",
    offset: -120,
  },
  { name: "mobile-accueil", path: "/fr/", scheme: "dark", mobile: true },
  { name: "mobile-fiche", path: "/en/fleet/m50/", scheme: "light", mobile: true },
];

for (const s of shots) {
  const context = await browser.newContext({
    ...(s.mobile ? devices["Pixel 7"] : { viewport: { width: 1440, height: 900 } }),
    colorScheme: s.scheme,
    locale: "fr-FR",
  });
  const page = await context.newPage();
  await page.goto(BASE + s.path, { waitUntil: "load" });
  // Laisse la scène 3D se charger et le fil se dessiner
  await page.mouse.move(10, 10);
  await page.waitForTimeout(2500);
  if (s.scrollTo) {
    await page.evaluate(
      ({ sel, off }) => {
        const el = document.querySelector(sel);
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + off);
      },
      { sel: s.scrollTo, off: s.offset ?? 0 },
    );
  }
  await page.evaluate(() =>
    document.querySelectorAll("[data-reveal]").forEach((e) => e.setAttribute("data-revealed", "")),
  );
  await page.waitForTimeout(3500);
  const png = await page.screenshot();
  await sharp(png)
    .resize({ width: s.mobile ? 540 : 1440 })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${s.name}.webp`);
  console.log("✓", s.name);
  await context.close();
}

await browser.close();
