import { access, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { ImageAsset } from "../../lib/data/schema";
import { GALLERY_EXCLUDE, GALLERY_MAX, GALLERY_MIN_WIDTH, IMAGE_WIDTHS } from "./config";
import { getBuffer } from "./http";
import type { WikiImageInfo } from "./sources";

const PUBLIC_DIR = path.resolve("public");

/* -------------------------------------------------------------------------- */
/* Sélection des images                                                        */
/* -------------------------------------------------------------------------- */

const VIEW_RE =
  /^(.+?)_in_space_-_(isometric|port|above|front|rear|below)(?:_\d+)?\.(?:jpe?g|png)$/i;

type ViewFile = { file: string; prefix: string; view: string };

function parseView(file: string): ViewFile | null {
  const m = VIEW_RE.exec(file);
  if (!m?.[1] || !m[2]) return null;
  return { file, prefix: m[1], view: m[2].toLowerCase() };
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim();

/**
 * Repère les vues studio du modèle de base et en déduit les noms des coloris
 * à partir des vues isométriques des variantes.
 *
 * Le modèle de base est celui qui a un jeu de vues complet (au moins isométrique
 * et profil) ; les coloris n'ont en général qu'une vue isométrique. À égalité,
 * on prend le préfixe le plus court.
 *
 * @param otherShips noms et slugs des autres vaisseaux, pour ne pas les prendre pour des coloris
 */
export function pickViews(files: string[], otherShips: string[]) {
  const views = files.map(parseView).filter((v): v is ViewFile => v !== null);
  const iso = views.filter((v) => v.view === "isometric");
  if (iso.length === 0) return { isometric: undefined, port: undefined, paints: [] as string[] };

  const hasPort = (prefix: string) =>
    views.some((v) => v.view === "port" && norm(v.prefix) === norm(prefix));
  const complete = iso.filter((v) => hasPort(v.prefix));
  const pool = complete.length ? complete : iso;
  const base = pool.reduce((a, b) => (b.prefix.length < a.prefix.length ? b : a)).prefix;
  const sameBase = (v: ViewFile) => norm(v.prefix) === norm(base);

  // Racine commune (ex. « 600i » pour « 600i_Explorer ») : les coloris s'écrivent « 600i_<coloris> ».
  const root = base.split("_")[0] ?? base;
  const others = new Set(otherShips.map(norm));

  const paints = iso
    .filter((v) => !sameBase(v) && norm(v.prefix).startsWith(norm(root) + " "))
    .map((v) => {
      // On retire la racine, et le nom complet du modèle s'il est répété (« 100i_Flame » ou « 600i_Explorer_Flame »).
      const rest = norm(v.prefix).startsWith(norm(base) + " ")
        ? v.prefix.slice(base.length + 1)
        : v.prefix.slice(root.length + 1);
      return rest.replace(/_/g, " ").trim();
    })
    .filter((name) => name && !others.has(norm(name)) && !others.has(norm(`${root} ${name}`)));

  return {
    isometric: iso.find(sameBase)?.file,
    port: views.find((v) => sameBase(v) && v.view === "port")?.file,
    paints: [...new Set(paints)],
  };
}

/** Candidats pour la galerie : fichiers non exclus par les règles automatiques ou manuelles. */
export function galleryCandidates(files: string[], extraExcludes: string[] = []) {
  return files.filter(
    (f) => !GALLERY_EXCLUDE.some((re) => re.test(f)) && !extraExcludes.includes(f),
  );
}

/** Garde les images assez grandes, dans l'ordre de la page, dans la limite fixée. */
export function selectGallery(candidates: string[], infos: Map<string, WikiImageInfo>) {
  return candidates
    .map((f) => infos.get(f))
    .filter(
      (i): i is WikiImageInfo =>
        !!i && /image\/(jpeg|png)/.test(i.mime) && i.width >= GALLERY_MIN_WIDTH,
    )
    .slice(0, GALLERY_MAX);
}

/* -------------------------------------------------------------------------- */
/* Traitement                                                                  */
/* -------------------------------------------------------------------------- */

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function altFromFile(file: string) {
  return file
    .replace(/\.[a-z]+$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

/**
 * Télécharge une image, la décline en AVIF et WebP à plusieurs largeurs
 * et génère un aperçu flou. Les fichiers déjà présents ne sont pas réencodés.
 */
export async function processImage(
  info: WikiImageInfo,
  shipSlug: string,
  id: string,
  options: { force?: boolean; dryRun?: boolean; previous?: ImageAsset } = {},
): Promise<ImageAsset> {
  // Si l'image à cet emplacement vient d'un autre fichier qu'avant, on réencode.
  const force =
    options.force ||
    (options.previous !== undefined && options.previous.credit.sourceUrl !== info.descriptionUrl);
  const outDir = path.join(PUBLIC_DIR, "ships", shipSlug);
  const original = await getBuffer(info.url);
  const image = sharp(original, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const srcWidth = meta.width ?? info.width;
  const srcHeight = meta.height ?? info.height;

  // Largeurs à produire, sans jamais agrandir l'original.
  let widths = IMAGE_WIDTHS.filter((w) => w <= srcWidth);
  if (widths.length === 0) widths = [srcWidth];

  const avif: ImageAsset["avif"] = [];
  const webp: ImageAsset["webp"] = [];
  if (!options.dryRun) await mkdir(outDir, { recursive: true });

  for (const w of widths) {
    for (const format of ["avif", "webp"] as const) {
      const name = `${id}-${w}.${format}`;
      const file = path.join(outDir, name);
      const src = `/ships/${shipSlug}/${name}`;
      (format === "avif" ? avif : webp).push({ width: w, src });
      if (options.dryRun || (!force && (await exists(file)))) continue;
      const pipeline = image.clone().resize({ width: w, withoutEnlargement: true });
      if (format === "avif") await pipeline.avif({ quality: 55, effort: 4 }).toFile(file);
      else await pipeline.webp({ quality: 76 }).toFile(file);
    }
  }

  const lqipBuffer = await image.clone().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();

  return {
    id,
    // Certaines descriptions du wiki sont des fragments (« of the 890 Jump ») : repli sur le nom du fichier.
    alt:
      info.description && /^[A-Z0-9]/.test(info.description)
        ? info.description
        : altFromFile(info.file),
    width: widths[widths.length - 1] ?? srcWidth,
    height: Math.round(((widths[widths.length - 1] ?? srcWidth) * srcHeight) / srcWidth),
    avif,
    webp,
    lqip: `data:image/webp;base64,${lqipBuffer.toString("base64")}`,
    credit: {
      author: info.author,
      license: info.license,
      sourceUrl: info.descriptionUrl,
    },
  };
}

/** Supprime du dossier d'un vaisseau les fichiers qui ne sont plus référencés. */
export async function pruneShipImages(shipSlug: string, assets: ImageAsset[]) {
  const dir = path.join(PUBLIC_DIR, "ships", shipSlug);
  const keep = new Set(
    assets.flatMap((a) => [...a.avif, ...a.webp]).map((s) => path.basename(s.src)),
  );
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  // Les fichiers ajoutés à la main (ex. cartes de profondeur `depth-*`) sont conservés.
  const stale = files.filter(
    (f) => /^(hero|side|gallery-\d+)-\d+\.(avif|webp)$/.test(f) && !keep.has(f),
  );
  for (const f of stale) await rm(path.join(dir, f));
  return stale;
}
