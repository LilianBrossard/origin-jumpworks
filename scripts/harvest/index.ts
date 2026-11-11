/**
 * Collecte des données de la flotte Origin Jumpworks.
 *
 *   pnpm harvest                 tout récupérer (données fraîches, images en cache si déjà là)
 *   pnpm harvest --ship=890-jump un seul vaisseau
 *   pnpm harvest --skip-images   données et prix seulement, images conservées
 *   pnpm harvest --force-images  réencoder toutes les images
 *   pnpm harvest --cached        réutiliser les réponses en cache (développement)
 *   pnpm harvest --dry-run       ne rien écrire
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import {
  LocationsSchema,
  MetaSchema,
  ShipSchema,
  type ImageAsset,
  type Location,
  type Offer,
  type Ship,
} from "../../lib/data/schema";
import { EXCLUDED_API_SLUGS, HARVEST_VERSION, SHIPS, WIKI_BASE } from "./config";
import { getBuffer, setRefresh } from "./http";
import { extractSilhouette } from "./silhouette";
import {
  galleryCandidates,
  pickViews,
  processImage,
  pruneShipImages,
  selectGallery,
} from "./images";
import {
  getVehicle,
  getWikiImageInfo,
  getWikiPageImages,
  listOriginVehicles,
  type ApiOffer,
  type ApiVehicle,
} from "./sources";

const DATA_DIR = path.resolve("data");
const SHIPS_DIR = path.join(DATA_DIR, "ships");

const { values: args } = parseArgs({
  options: {
    ship: { type: "string" },
    "skip-images": { type: "boolean", default: false },
    "force-images": { type: "boolean", default: false },
    cached: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
});

setRefresh(!args.cached);
const dryRun = args["dry-run"];

const log = (...m: unknown[]) => console.log("›", ...m);
const warn = (...m: unknown[]) => console.warn("⚠", ...m);

/* -------------------------------------------------------------------------- */

const locations = new Map<string, Location>();

function toOffers(list: ApiOffer[], kind: "buy" | "rent"): Offer[] {
  const out: Offer[] = [];
  for (const o of list) {
    const price = kind === "buy" ? o.price_buy : o.price_rent;
    if (!price || price <= 0) continue; // UEX utilise 0 pour « non vendu ici »
    const loc = o.starmap_location;
    const locationId =
      loc?.slug ??
      o.terminal_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    if (!locations.has(locationId)) {
      locations.set(locationId, {
        id: locationId,
        name: loc?.name ?? o.terminal_name,
        type: loc?.type_name ?? "Unknown",
        parent: loc?.parent_name ?? undefined,
        system: loc?.star_system_name ?? "Stanton",
      });
    }
    out.push({
      terminal: o.terminal_name,
      locationId,
      priceAUEC: price,
      updatedAt: o.date_updated,
      gameVersion: o.game_version,
      uexUrl: o.uex_link,
    });
  }
  return out.sort((a, b) => a.priceAUEC - b.priceAUEC);
}

function wikiPageFrom(v: ApiVehicle, fallback?: string) {
  if (fallback) return fallback;
  const url = v.curated_data?.page_url;
  if (!url)
    throw new Error(`Pas de page wiki connue pour ${v.slug} : ajouter wikiPage dans config.ts`);
  return decodeURIComponent(new URL(url).pathname.slice(1));
}

async function readExisting(slug: string): Promise<Ship | undefined> {
  try {
    return ShipSchema.parse(
      JSON.parse(await readFile(path.join(SHIPS_DIR, `${slug}.json`), "utf8")),
    );
  } catch {
    return undefined;
  }
}

async function harvestShip(apiSlug: string, allNames: string[]): Promise<Ship> {
  const cfg = SHIPS[apiSlug];
  if (!cfg) throw new Error(`Vaisseau inconnu : ${apiSlug}`);
  const v = await getVehicle(apiSlug);
  const wikiPage = wikiPageFrom(v, cfg.wikiPage);
  const fetchedAt = new Date().toISOString();

  // Images ---------------------------------------------------------------
  let images: Ship["images"];
  let paints: string[];
  const page = await getWikiPageImages(wikiPage);
  const views = pickViews(
    page.images,
    allNames.filter((n) => n !== v.name && n !== cfg.slug),
  );
  paints = views.paints;

  const existing = await readExisting(cfg.slug);
  if (args["skip-images"]) {
    if (!existing) throw new Error(`--skip-images : aucune donnée existante pour ${cfg.slug}`);
    images = existing.images;
    paints = paints.length ? paints : existing.paints;
  } else {
    if (!views.isometric) throw new Error(`Aucune vue isométrique trouvée sur ${wikiPage}`);
    const candidates = galleryCandidates(page.images, cfg.excludeImages);
    const wanted = [views.isometric, views.port, ...candidates].filter((f): f is string => !!f);
    const infos = await getWikiImageInfo(wanted);

    const opts = { force: args["force-images"], dryRun };
    const heroInfo = infos.get(views.isometric);
    if (!heroInfo) throw new Error(`Métadonnées introuvables pour ${views.isometric}`);
    const hero = await processImage(heroInfo, cfg.slug, "hero", {
      ...opts,
      previous: existing?.images.hero,
    });
    const sideInfo = views.port ? infos.get(views.port) : undefined;
    const side = sideInfo
      ? await processImage(sideInfo, cfg.slug, "side", { ...opts, previous: existing?.images.side })
      : undefined;

    const gallery: ImageAsset[] = [];
    for (const [i, info] of selectGallery(candidates, infos).entries()) {
      gallery.push(
        await processImage(info, cfg.slug, `gallery-${String(i + 1).padStart(2, "0")}`, {
          ...opts,
          previous: existing?.images.gallery[i],
        }),
      );
    }
    // Silhouette de profil pour le comparateur d'échelle (toujours régénérée, c'est rapide).
    let silhouette: Ship["images"]["silhouette"];
    if (sideInfo) {
      const sil = await extractSilhouette(await getBuffer(sideInfo.url), cfg.silhouetteThreshold);
      silhouette = {
        src: `/ships/${cfg.slug}/silhouette.png`,
        width: sil.width,
        height: sil.height,
      };
      if (!dryRun) {
        await mkdir(path.resolve("public/ships", cfg.slug), { recursive: true });
        await writeFile(path.resolve("public/ships", cfg.slug, "silhouette.png"), sil.png);
      }
    }

    images = { hero, side, silhouette, gallery };
    if (!dryRun) {
      const removed = await pruneShipImages(cfg.slug, [hero, ...(side ? [side] : []), ...gallery]);
      if (removed.length) log(`  ${removed.length} image(s) obsolète(s) supprimée(s)`);
    }
  }

  // Fiche -------------------------------------------------------------------
  const cd = v.curated_data ?? {};
  const ship: Ship = {
    slug: cfg.slug,
    name: v.name,
    range: cfg.range,
    order: cfg.order,
    role: v.role ?? "—",
    career: v.career ?? undefined,
    size: v.size?.en_EN ?? "—",
    sizeClass: v.size_class ?? undefined,
    // L'API inverse parfois min et max (600i Touring : 5 / 3).
    crew: {
      min: Math.min(v.crew.min ?? 1, v.crew.max ?? v.crew.min ?? 1),
      max: Math.max(v.crew.min ?? 1, v.crew.max ?? v.crew.min ?? 1),
    },
    cargoSCU: v.cargo_capacity ?? 0,
    dimensions: { length: v.sizes.length, beam: v.sizes.beam, height: v.sizes.height },
    massKg: v.mass_total ?? v.mass ?? 0,
    speed: { scm: v.speed?.scm ?? 0, max: v.speed?.max ?? 0 },
    quantum:
      v.quantum?.quantum_speed && v.quantum.quantum_range
        ? { speedMs: v.quantum.quantum_speed, rangeM: v.quantum.quantum_range }
        : undefined,
    shieldHp: v.shield_hp ?? undefined,
    hullHp: v.health ?? undefined,
    description: {
      en: v.description?.en_EN || v.game_description?.en_EN || "",
      fr: existing?.description.fr, // traduction manuelle conservée
    },
    pledge: {
      msrpUSD: v.msrp ?? undefined,
      originalUSD: cd.original_pledge_price ?? undefined,
      availability: cd.pledge_availability ?? undefined,
      url: v.pledge_url ?? undefined,
    },
    ingame: {
      buy: toOffers(v.uex_prices?.purchase ?? [], "buy"),
      rent: toOffers(v.uex_prices?.rental ?? [], "rent"),
    },
    dates: {
      concept: cd.concept_date ?? undefined,
      addedInVersion: cd.added_in_version ?? undefined,
    },
    paints,
    links: {
      wiki: `${WIKI_BASE}/${encodeURI(page.title.replace(/ /g, "_"))}`,
      brochure: cd.brochure_url ?? undefined,
      trailer: cd.trailer_url ?? undefined,
    },
    images,
    source: { apiUrl: v.link, wikiPage: page.title, gameVersion: v.version, fetchedAt },
  };

  return ShipSchema.parse(ship);
}

/* -------------------------------------------------------------------------- */

function compareVersions(a: string, b: string) {
  const num = (s: string) => s.match(/\d+/g)?.map(Number) ?? [];
  const [x, y] = [num(a), num(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

async function main() {
  log("Liste des véhicules Origin…");
  const all = await listOriginVehicles();
  const flyable = all.filter((v) => v.status === "flight-ready" && !EXCLUDED_API_SLUGS.has(v.slug));

  const unknown = flyable.filter((v) => !SHIPS[v.slug]);
  for (const u of unknown)
    warn(`Nouveau vaisseau jouable ignoré : ${u.slug} (à ajouter dans config.ts)`);
  const missing = Object.keys(SHIPS).filter((s) => !flyable.some((v) => v.slug === s));
  for (const m of missing) warn(`Vaisseau configuré absent ou plus jouable : ${m}`);

  let targets = flyable.filter((v) => SHIPS[v.slug]).map((v) => v.slug);
  if (args.ship) {
    targets = targets.filter((s) => SHIPS[s]?.slug === args.ship);
    if (!targets.length) throw new Error(`--ship=${args.ship} ne correspond à aucun vaisseau`);
  }

  // Noms et slugs de tous les véhicules, pour ne pas confondre un autre vaisseau avec un coloris.
  const allNames = [...all.map((v) => v.name), ...Object.values(SHIPS).map((c) => c.slug)];
  const ships: Ship[] = [];
  for (const apiSlug of targets) {
    log(`${SHIPS[apiSlug]?.slug} …`);
    const ship = await harvestShip(apiSlug, allNames);
    log(
      `  ✓ ${ship.name} — ${ship.images.gallery.length} images de galerie, ` +
        `${ship.ingame.buy.length} achat(s), ${ship.ingame.rent.length} location(s), ${ship.paints.length} coloris`,
    );
    ships.push(ship);
  }

  if (dryRun) {
    log("Dry run : aucun fichier écrit.");
    return;
  }

  await mkdir(SHIPS_DIR, { recursive: true });
  for (const ship of ships) {
    await writeFile(
      path.join(SHIPS_DIR, `${ship.slug}.json`),
      JSON.stringify(ship, null, 2) + "\n",
    );
  }

  // Un passage complet supprime les fiches de vaisseaux qui ne sont plus dans la liste.
  if (!args.ship) {
    const keep = new Set(ships.map((s) => `${s.slug}.json`));
    for (const f of await readdir(SHIPS_DIR)) {
      if (f.endsWith(".json") && !keep.has(f)) {
        warn(`Suppression de la fiche obsolète ${f}`);
        await rm(path.join(SHIPS_DIR, f));
        await rm(path.resolve("public/ships", f.replace(/\.json$/, "")), {
          recursive: true,
          force: true,
        });
      }
    }
  }

  // Lieux et méta sont recalculés depuis toutes les fiches présentes.
  const allShips: Ship[] = [];
  for (const f of await readdir(SHIPS_DIR)) {
    if (f.endsWith(".json")) {
      allShips.push(ShipSchema.parse(JSON.parse(await readFile(path.join(SHIPS_DIR, f), "utf8"))));
    }
  }
  const usedLocations = new Set(
    allShips.flatMap((s) => [...s.ingame.buy, ...s.ingame.rent].map((o) => o.locationId)),
  );
  const previousLocations: Location[] = await readFile(
    path.join(DATA_DIR, "locations.json"),
    "utf8",
  )
    .then((t) => LocationsSchema.parse(JSON.parse(t)))
    .catch(() => []);
  for (const l of previousLocations) if (!locations.has(l.id)) locations.set(l.id, l);
  const locList = LocationsSchema.parse(
    [...locations.values()]
      .filter((l) => usedLocations.has(l.id))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
  await writeFile(path.join(DATA_DIR, "locations.json"), JSON.stringify(locList, null, 2) + "\n");

  const offers = allShips.flatMap((s) => [...s.ingame.buy, ...s.ingame.rent]);
  const meta = MetaSchema.parse({
    fetchedAt: new Date().toISOString(),
    gameVersion:
      allShips
        .map((s) => s.source.gameVersion)
        .sort(compareVersions)
        .at(-1) ?? "?",
    pricesUpdatedAt: offers
      .map((o) => new Date(o.updatedAt).toISOString())
      .sort()
      .at(-1),
    shipCount: allShips.length,
    harvestVersion: HARVEST_VERSION,
    sources: [
      {
        name: "Star Citizen Wiki API",
        url: "https://api.star-citizen.wiki",
        license: "Données de jeu © Cloud Imperium Games",
      },
      {
        name: "starcitizen.tools",
        url: "https://starcitizen.tools",
        license: "CC BY-SA 4.0 (textes) — images : voir chaque crédit",
      },
      {
        name: "UEX Corp",
        url: "https://uexcorp.space",
        license: "Prix en jeu relevés par la communauté",
      },
    ],
  });
  await writeFile(path.join(DATA_DIR, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  log(
    `Terminé : ${allShips.length} vaisseaux, ${locList.length} lieux, patch ${meta.gameVersion}.`,
  );
}

main().catch((error: unknown) => {
  console.error("✗", error instanceof Error ? error.message : error);
  process.exit(1);
});
