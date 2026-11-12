import type { Range } from "../../lib/data/schema";

export const HARVEST_VERSION = "1.0.0";
export const USER_AGENT = "origin-jumpworks-fansite/1.0 (non-commercial fan project)";

export const API_BASE = "https://api.star-citizen.wiki/api/v2";
export const WIKI_API = "https://starcitizen.tools/api.php";
export const WIKI_BASE = "https://starcitizen.tools";

/** Délai minimal entre deux requêtes vers un même hôte (ms). */
export const MIN_DELAY_MS = 1000;

/** Nombre maximal d'images de galerie par vaisseau. */
export const GALLERY_MAX = 8;
/** Largeur minimale d'une image de galerie (px). */
export const GALLERY_MIN_WIDTH = 1280;
/** Largeurs générées pour chaque image (px). */
export const IMAGE_WIDTHS = [960, 1920];

/**
 * Vaisseaux exclus même s'ils sont marqués « flight-ready » dans l'API
 * (éditions spéciales sans données propres).
 */
export const EXCLUDED_API_SLUGS = new Set(["orig-600i-bis2951", "orig-600i-executive-edition"]);

type ShipConfig = {
  /** Slug utilisé sur le site */
  slug: string;
  /** Nom affiché, quand celui de l'API ne suffit pas (« 600i » → « 600i Explorer ») */
  displayName?: string;
  range: Range;
  order: number;
  /** Titre de la page starcitizen.tools, quand l'API ne le fournit pas */
  wikiPage?: string;
  /** Fichiers de galerie à exclure en plus des règles automatiques */
  excludeImages?: string[];
  /** Seuil de luminosité de la silhouette (défaut 40), à relever si le fond contient une nébuleuse */
  silhouetteThreshold?: number;
};

/** Réglages par vaisseau, indexés par le slug de l'API. */
export const SHIPS: Record<string, ShipConfig> = {
  "orig-100i": { slug: "100i", range: "personal", order: 10 },
  "orig-125a": { slug: "125a", range: "personal", order: 11 },
  "orig-135c": { slug: "135c", range: "personal", order: 12 },
  "orig-300i": { slug: "300i", range: "personal", order: 20, silhouetteThreshold: 70 },
  "orig-315p": { slug: "315p", range: "personal", order: 21 },
  "orig-325a": { slug: "325a", range: "personal", order: 22 },
  "orig-350r": { slug: "350r", range: "racing", order: 30 },
  "orig-m50": { slug: "m50", range: "racing", order: 31 },
  "orig-m80": { slug: "m80", range: "racing", order: 32 },
  "orig-400i": { slug: "400i", range: "touring", order: 40 },
  "orig-600i": {
    slug: "600i-explorer",
    displayName: "600i Explorer",
    range: "touring",
    order: 41,
  },
  "orig-600i-touring": {
    slug: "600i-touring",
    range: "touring",
    order: 42,
    silhouetteThreshold: 70,
  },
  "orig-85x": { slug: "85x", range: "prestige", order: 50 },
  "orig-890jump": { slug: "890-jump", range: "prestige", order: 51 },
  "orig-x1": { slug: "x1", range: "gravlev", order: 60, wikiPage: "X1" },
  "orig-x1-velocity": { slug: "x1-velocity", range: "gravlev", order: 61, wikiPage: "X1_Velocity" },
  "orig-x1-force": { slug: "x1-force", range: "gravlev", order: 62, wikiPage: "X1_Force" },
};

/** Règles d'exclusion automatiques pour la galerie (nom de fichier). */
export const GALLERY_EXCLUDE = [
  /\.svg$/i,
  /placeholder/i,
  /_in_space_-_/i, // vues studio, traitées à part
  /wip/i,
  /^sc-icon/i,
  /^rsi/i,
  /logo/i,
  /comparison/i,
  /schematic|blueprint|ortho/i,
];
