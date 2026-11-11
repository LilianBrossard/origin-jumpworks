import { API_BASE, WIKI_API } from "./config";
import { getJson } from "./http";

/* -------------------------------------------------------------------------- */
/* API du Star Citizen Wiki (api.star-citizen.wiki)                            */
/* Seuls les champs utilisés sont typés.                                       */
/* -------------------------------------------------------------------------- */

type Localized = { en_EN?: string } | null;

type ApiOffer = {
  price_buy: number | null;
  price_rent: number | null;
  terminal_name: string;
  starmap_location: {
    slug: string;
    name: string;
    type_name: string;
    parent_name: string | null;
    star_system_name: string;
  } | null;
  date_updated: string;
  game_version: string;
  uex_link?: string;
};

export type ApiVehicle = {
  uuid: string;
  name: string;
  slug: string;
  link: string;
  sizes: { length: number; beam: number; height: number };
  mass_total: number | null;
  mass: number | null;
  cargo_capacity: number | null;
  crew: { min: number | null; max: number | null };
  health: number | null;
  shield_hp: number | null;
  speed: { scm: number | null; max: number | null } | null;
  quantum: { quantum_speed: number | null; quantum_range: number | null } | null;
  size_class: number | null;
  career: string | null;
  role: string | null;
  size: Localized;
  description: Localized;
  game_description: Localized;
  production_status: Localized;
  msrp: number | null;
  pledge_url: string | null;
  curated_data: {
    page_url?: string;
    trailer_url?: string | null;
    original_pledge_price?: number | null;
    added_in_version?: string | null;
    concept_date?: string | null;
    pledge_availability?: string | null;
    brochure_url?: string | null;
  } | null;
  uex_prices: { purchase: ApiOffer[]; rental: ApiOffer[] } | null;
  version: string;
};

export type { ApiOffer };

type Paginated<T> = { data: T[]; meta: { last_page: number } };

/** Liste les slugs API de tous les véhicules du constructeur ORIG. */
export async function listOriginVehicles(): Promise<
  { slug: string; name: string; status?: string }[]
> {
  const out: { slug: string; name: string; status?: string }[] = [];
  for (let page = 1; ; page++) {
    const url = `${API_BASE}/vehicles?filter%5Bmanufacturer%5D=ORIG&page%5Bsize%5D=100&page%5Bnumber%5D=${page}`;
    const res = await getJson<Paginated<ApiVehicle>>(url);
    for (const v of res.data)
      out.push({ slug: v.slug, name: v.name, status: v.production_status?.en_EN });
    if (page >= res.meta.last_page) break;
  }
  return out;
}

export async function getVehicle(apiSlug: string): Promise<ApiVehicle> {
  const res = await getJson<{ data: ApiVehicle }>(`${API_BASE}/vehicles/${apiSlug}`);
  return res.data;
}

/* -------------------------------------------------------------------------- */
/* MediaWiki (starcitizen.tools)                                               */
/* -------------------------------------------------------------------------- */

/** Renvoie le titre résolu de la page et la liste de ses images, dans l'ordre de la page. */
export async function getWikiPageImages(
  page: string,
): Promise<{ title: string; images: string[] }> {
  const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(page)}&prop=images&redirects=1&format=json&formatversion=2`;
  const res = await getJson<{
    parse?: { title: string; images: string[] };
    error?: { info: string };
  }>(url);
  if (!res.parse) throw new Error(`Page wiki introuvable : ${page} (${res.error?.info ?? "?"})`);
  return res.parse;
}

export type WikiImageInfo = {
  file: string;
  url: string;
  descriptionUrl: string;
  width: number;
  height: number;
  mime: string;
  author: string;
  license: string;
  description?: string;
};

const stripHtml = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Métadonnées (URL, taille, auteur, licence) d'une liste de fichiers. */
export async function getWikiImageInfo(files: string[]): Promise<Map<string, WikiImageInfo>> {
  const out = new Map<string, WikiImageInfo>();
  for (let i = 0; i < files.length; i += 50) {
    const batch = files.slice(i, i + 50);
    const titles = batch.map((f) => `File:${f}`).join("|");
    const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&formatversion=2`;
    type Page = {
      title: string;
      missing?: boolean;
      imageinfo?: {
        url: string;
        descriptionurl: string;
        width: number;
        height: number;
        mime: string;
        extmetadata?: Record<string, { value: string } | undefined>;
      }[];
    };
    const res = await getJson<{
      query: { pages: Page[]; normalized?: { from: string; to: string }[] };
    }>(url);
    // MediaWiki normalise les titres (`_` → espace) : on revient au nom d'origine.
    const back = new Map<string, string>();
    for (const n of res.query.normalized ?? []) back.set(n.to, n.from);
    for (const p of res.query.pages) {
      const info = p.imageinfo?.[0];
      if (p.missing || !info) continue;
      const meta = info.extmetadata ?? {};
      const file = (back.get(p.title) ?? p.title).replace(/^File:/, "");
      out.set(file, {
        file,
        url: info.url,
        descriptionUrl: info.descriptionurl,
        width: info.width,
        height: info.height,
        mime: info.mime,
        author: stripHtml(meta.Artist?.value ?? "Inconnu"),
        license: stripHtml(meta.LicenseShortName?.value ?? meta.UsageTerms?.value ?? "Inconnue"),
        description: meta.ImageDescription ? stripHtml(meta.ImageDescription.value) : undefined,
      });
    }
  }
  return out;
}
