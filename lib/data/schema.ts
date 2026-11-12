import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Images                                                                      */
/* -------------------------------------------------------------------------- */

export const ImageSourceSchema = z.object({
  width: z.number().int().positive(),
  /** Chemin public, ex. `/ships/890-jump/hero-1920.avif` */
  src: z.string().startsWith("/"),
});

export const ImageCreditSchema = z.object({
  author: z.string(),
  license: z.string(),
  /** Page du fichier sur starcitizen.tools */
  sourceUrl: z.url(),
});

export const ImageAssetSchema = z.object({
  id: z.string(),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  avif: z.array(ImageSourceSchema).min(1),
  webp: z.array(ImageSourceSchema).min(1),
  /** Aperçu flou minuscule, en data URI WebP */
  lqip: z.string().startsWith("data:image/webp;base64,"),
  credit: ImageCreditSchema,
});
export type ImageAsset = z.infer<typeof ImageAssetSchema>;

/* -------------------------------------------------------------------------- */
/* Vaisseau                                                                    */
/* -------------------------------------------------------------------------- */

export const RANGES = ["personal", "touring", "racing", "prestige", "gravlev"] as const;
export const RangeSchema = z.enum(RANGES);
export type Range = z.infer<typeof RangeSchema>;

export const OfferSchema = z.object({
  terminal: z.string(),
  /** Identifiant de lieu (slug), relié à `locations.json` */
  locationId: z.string(),
  priceAUEC: z.number().positive(),
  updatedAt: z.iso.datetime({ offset: true }),
  gameVersion: z.string(),
  uexUrl: z.url().optional(),
});
export type Offer = z.infer<typeof OfferSchema>;

const LocalizedText = z.object({ en: z.string().min(1), fr: z.string().min(1).optional() });

export const ShipSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  range: RangeSchema,
  /** Ordre d'affichage dans la flotte (petit → grand) */
  order: z.number().int(),
  role: z.string(),
  career: z.string().optional(),
  /** Libellé de taille donné par le jeu : Small, Large, Capital… */
  size: z.string(),
  sizeClass: z.number().int().nonnegative().optional(),
  crew: z
    .object({ min: z.number().int().nonnegative(), max: z.number().int().nonnegative() })
    .refine((c) => c.min <= c.max, "crew.min doit être ≤ crew.max"),
  cargoSCU: z.number().nonnegative(),
  dimensions: z.object({ length: z.number(), beam: z.number(), height: z.number() }),
  massKg: z.number().positive(),
  speed: z.object({ scm: z.number().nonnegative(), max: z.number().nonnegative() }),
  quantum: z.object({ speedMs: z.number().positive(), rangeM: z.number().positive() }).optional(),
  shieldHp: z.number().nonnegative().optional(),
  hullHp: z.number().nonnegative().optional(),
  description: LocalizedText,
  pledge: z.object({
    msrpUSD: z.number().positive().optional(),
    originalUSD: z.number().positive().optional(),
    availability: z.string().optional(),
    url: z.url().optional(),
  }),
  ingame: z.object({
    buy: z.array(OfferSchema),
    rent: z.array(OfferSchema),
  }),
  dates: z.object({
    concept: z.string().optional(),
    addedInVersion: z.string().optional(),
  }),
  paints: z.array(z.string()),
  links: z.object({
    wiki: z.url(),
    brochure: z.url().optional(),
    trailer: z.url().optional(),
  }),
  images: z.object({
    hero: ImageAssetSchema,
    /** Vue de profil (bâbord), base du comparateur d'échelle */
    side: ImageAssetSchema.optional(),
    /** Silhouette de profil (PNG à transparence), recadrée : sa largeur = la longueur du vaisseau */
    silhouette: z
      .object({
        src: z.string().startsWith("/"),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .optional(),
    /** Carte de profondeur de la vue principale (blanc = proche), pour l'effet de relief */
    depth: z
      .object({ src: z.string().startsWith("/"), width: z.number().int().positive() })
      .optional(),
    gallery: z.array(ImageAssetSchema),
  }),
  source: z.object({
    apiUrl: z.url(),
    wikiPage: z.string(),
    gameVersion: z.string(),
    fetchedAt: z.iso.datetime({ offset: true }),
  }),
});
export type Ship = z.infer<typeof ShipSchema>;

/* -------------------------------------------------------------------------- */
/* Lieux et méta                                                               */
/* -------------------------------------------------------------------------- */

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  parent: z.string().optional(),
  system: z.string(),
});
export type Location = z.infer<typeof LocationSchema>;
export const LocationsSchema = z.array(LocationSchema);

export const MetaSchema = z.object({
  fetchedAt: z.iso.datetime({ offset: true }),
  /** Version du jeu la plus récente rencontrée dans les données */
  gameVersion: z.string(),
  /** Date de la donnée de prix UEX la plus récente */
  pricesUpdatedAt: z.iso.datetime({ offset: true }).optional(),
  shipCount: z.number().int(),
  harvestVersion: z.string(),
  sources: z.array(z.object({ name: z.string(), url: z.url(), license: z.string() })),
});
export type Meta = z.infer<typeof MetaSchema>;
