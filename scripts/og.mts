/**
 * Images de partage (Open Graph) : JPEG 1200 × 630 à partir des vues principales déjà
 * produites par `pnpm harvest`. Aucun téléchargement.
 *
 *   pnpm og
 */
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("public/og");
await mkdir(OUT, { recursive: true });

const files = (await readdir("data/ships")).filter((f) => f.endsWith(".json"));
for (const f of files) {
  const ship = JSON.parse(await readFile(path.join("data/ships", f), "utf8"));
  const src = ship.images.hero.webp.at(-1).src as string;
  await sharp(path.resolve("public", src.slice(1)))
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `${ship.slug}.jpg`));
  if (ship.slug === "890-jump") {
    // Image par défaut du site : le vaisseau amiral
    await sharp(path.join(OUT, "890-jump.jpg")).toFile(path.join(OUT, "default.jpg"));
  }
}
console.log(`og : ${files.length} images de partage générées.`);
