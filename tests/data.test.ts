import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LocationsSchema, MetaSchema, ShipSchema, type Ship } from "../lib/data/schema";

/* Intégrité des données produites par `pnpm harvest` (relancé à la main : on vérifie le résultat). */

const DATA = path.resolve("data");
const read = (file: string): unknown => JSON.parse(readFileSync(path.join(DATA, file), "utf8"));
const ships: Ship[] = readdirSync(path.join(DATA, "ships"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => ShipSchema.parse(read(path.join("ships", f))));
const publicFile = (src: string) => existsSync(path.resolve("public", src.replace(/^\//, "")));

describe("données de la flotte", () => {
  it("contient les 17 vaisseaux jouables, aux slugs uniques", () => {
    expect(ships).toHaveLength(17);
    expect(new Set(ships.map((s) => s.slug)).size).toBe(ships.length);
  });

  it("meta.json et locations.json sont valides", () => {
    expect(() => MetaSchema.parse(read("meta.json"))).not.toThrow();
    expect(() => LocationsSchema.parse(read("locations.json"))).not.toThrow();
  });

  it("chaque offre pointe vers un lieu connu", () => {
    const ids = new Set(LocationsSchema.parse(read("locations.json")).map((l) => l.id));
    for (const s of ships) {
      for (const o of [...s.ingame.buy, ...s.ingame.rent])
        expect(ids, s.slug).toContain(o.locationId);
    }
  });

  it("chaque vaisseau a sa description française", () => {
    for (const s of ships) expect(s.description.fr, s.slug).toBeTruthy();
  });

  for (const s of ships) {
    it(`${s.slug} : tous les fichiers d'image existent`, () => {
      const assets = [
        s.images.hero,
        ...(s.images.side ? [s.images.side] : []),
        ...s.images.gallery,
      ];
      for (const a of assets) {
        for (const src of [...a.avif, ...a.webp]) expect(publicFile(src.src), src.src).toBe(true);
        expect(a.credit.author).not.toBe("");
      }
      if (s.images.silhouette) expect(publicFile(s.images.silhouette.src)).toBe(true);
      if (s.images.depth) expect(publicFile(s.images.depth.src)).toBe(true);
    });
  }
});
