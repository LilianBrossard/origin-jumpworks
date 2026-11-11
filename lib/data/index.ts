import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import {
  LocationsSchema,
  MetaSchema,
  ShipSchema,
  type Location,
  type Meta,
  type Range,
  type Ship,
} from "./schema";

/**
 * Lecture des données générées par `pnpm harvest`.
 * Exécuté uniquement au build (composants serveur) : rien n'est envoyé au navigateur.
 */

const DATA_DIR = path.join(process.cwd(), "data");

const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8"));

export const getShips = cache((): Ship[] =>
  readdirSync(path.join(DATA_DIR, "ships"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => ShipSchema.parse(readJson(path.join("ships", f))))
    .sort((a, b) => a.order - b.order),
);

export const getShip = (slug: string): Ship | undefined => getShips().find((s) => s.slug === slug);

export const getShipsByRange = (range: Range): Ship[] =>
  getShips().filter((s) => s.range === range);

export const getLocations = cache((): Location[] =>
  LocationsSchema.parse(readJson("locations.json")),
);

export const getMeta = cache((): Meta => MetaSchema.parse(readJson("meta.json")));
