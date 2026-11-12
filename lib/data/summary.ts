import type { ImageAsset, Range, Ship } from "./schema";

/**
 * Version allégée d'un vaisseau, transmise aux composants client (flotte, comparateur) :
 * seulement ce qu'ils affichent, pour ne pas alourdir la page.
 */
export type ShipSummary = {
  slug: string;
  name: string;
  range: Range;
  order: number;
  role: string;
  size: string;
  crew: { min: number; max: number };
  length: number;
  beam: number;
  height: number;
  massKg: number;
  cargoSCU: number;
  scm: number;
  maxSpeed: number;
  shieldHp?: number;
  /** Prix d'achat le plus bas en jeu, s'il est vendu */
  minPriceAUEC?: number;
  hero: ImageAsset;
  silhouette?: { src: string; width: number; height: number };
};

export function toSummary(ship: Ship): ShipSummary {
  const prices = ship.ingame.buy.map((o) => o.priceAUEC);
  return {
    slug: ship.slug,
    name: ship.name,
    range: ship.range,
    order: ship.order,
    role: ship.role,
    size: ship.size,
    crew: ship.crew,
    length: ship.dimensions.length,
    beam: ship.dimensions.beam,
    height: ship.dimensions.height,
    massKg: ship.massKg,
    cargoSCU: ship.cargoSCU,
    scm: ship.speed.scm,
    maxSpeed: ship.speed.max,
    shieldHp: ship.shieldHp,
    minPriceAUEC: prices.length ? Math.min(...prices) : undefined,
    hero: ship.images.hero,
    silhouette: ship.images.silhouette,
  };
}
