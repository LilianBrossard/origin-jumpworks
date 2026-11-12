"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { RANGES, type Range } from "@/lib/data/schema";
import type { ShipSummary } from "@/lib/data/summary";
import { ShipCard } from "./ShipCard";

const SORTS = ["order", "length", "cargo", "price"] as const;
type Sort = (typeof SORTS)[number];

const sorters: Record<Sort, (a: ShipSummary, b: ShipSummary) => number> = {
  order: (a, b) => a.order - b.order,
  length: (a, b) => a.length - b.length,
  cargo: (a, b) => b.cargoSCU - a.cargoSCU || a.order - b.order,
  // Les vaisseaux non vendus en jeu vont à la fin
  price: (a, b) => (a.minPriceAUEC ?? Infinity) - (b.minPriceAUEC ?? Infinity),
};

/**
 * Grille de la flotte avec filtre par gamme et tri.
 * L'état est conservé dans l'URL (?range=racing&sort=length) : partageable et
 * compatible avec les boutons Précédent / Suivant du navigateur.
 */
export function FleetBrowser({ ships }: { ships: ShipSummary[] }) {
  const t = useTranslations("fleet");
  const tr = useTranslations("home.ranges");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rangeParam = params.get("range");
  const range = RANGES.includes(rangeParam as Range) ? (rangeParam as Range) : null;
  const sortParam = params.get("sort");
  const sort: Sort = SORTS.includes(sortParam as Sort) ? (sortParam as Sort) : "order";

  const visible = useMemo(
    () => ships.filter((s) => !range || s.range === range).sort(sorters[sort]),
    [ships, range, sort],
  );

  const update = (next: { range?: Range | null; sort?: Sort }) => {
    const q = new URLSearchParams(params.toString());
    const r = next.range === undefined ? range : next.range;
    const s = next.sort ?? sort;
    if (r) q.set("range", r);
    else q.delete("range");
    if (s !== "order") q.set("sort", s);
    else q.delete("sort");
    const query = q.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const chip = (active: boolean) =>
    cn(
      "min-h-10 border px-4 text-xs font-medium tracking-wide-2 uppercase transition-colors duration-(--duration-fast)",
      active ? "border-accent text-accent" : "border-line-strong text-ink-muted hover:text-ink",
    );

  return (
    <div>
      <div className="mb-12 flex flex-col gap-6 border-y border-line py-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t("filterLabel")} className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={range === null}
            onClick={() => update({ range: null })}
            className={chip(range === null)}
          >
            {t("all")}
          </button>
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => update({ range: r })}
              className={chip(range === r)}
            >
              {tr(`${r}.name`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="fleet-sort" className="text-eyebrow font-medium text-ink-muted uppercase">
            {t("sortLabel")}
          </label>
          <select
            id="fleet-sort"
            value={sort}
            onChange={(e) => update({ sort: e.target.value as Sort })}
            className="min-h-10 border border-line-strong bg-bg px-3 text-sm text-ink"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t(`sort.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p
        aria-live="polite"
        className="mb-8 font-mono text-xs tracking-[0.12em] text-ink-muted uppercase"
      >
        {t("results", { count: visible.length })}
      </p>

      <FleetGrid ships={visible} />
    </div>
  );
}

/** Grille seule : aussi utilisée comme contenu statique avant le chargement de JavaScript. */
export function FleetGrid({ ships }: { ships: ShipSummary[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
      {ships.map((ship) => (
        <li key={ship.slug}>
          <ShipCard ship={ship} />
        </li>
      ))}
    </ul>
  );
}
