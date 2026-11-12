"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { ShipSummary } from "@/lib/data/summary";
import { formatAUEC, formatCrew, formatNumber } from "@/lib/format";

const SLOTS = 3;
/** Teinte de chaque vaisseau dans la superposition et la légende */
const TINTS = ["bg-ink", "bg-accent", "bg-ink-muted"] as const;
const TEXT_TINTS = ["text-ink", "text-accent", "text-ink-muted"] as const;

type Row = {
  key: string;
  get: (s: ShipSummary) => number | undefined;
  format: (v: number, s: ShipSummary) => string;
  /** Sens de la « meilleure » valeur ; absent pour les dimensions (ni mieux ni moins bien) */
  better?: "max" | "min";
};

/**
 * Comparateur : jusqu'à trois vaisseaux, choisis dans des listes. Le choix est gardé
 * dans l'URL (?ships=890-jump,600i-explorer) pour pouvoir être partagé.
 */
export function ComparePanel({ ships }: { ships: ShipSummary[] }) {
  const t = useTranslations("compare");
  const ts = useTranslations("ship.specs");
  const locale = useLocale();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const bySlug = new Map(ships.map((s) => [s.slug, s]));

  const chosen = (params.get("ships") ?? "")
    .split(",")
    .map((s) => bySlug.get(s.trim()))
    .slice(0, SLOTS);
  const slots = Array.from({ length: SLOTS }, (_, i) => chosen[i]);
  const selected = slots.filter((s): s is ShipSummary => !!s);

  const setSlot = (i: number, slug: string) => {
    const next = slots.map((s) => s?.slug ?? "");
    next[i] = slug;
    const list = next.filter(Boolean);
    router.replace(list.length ? `${pathname}?ships=${list.join(",")}` : pathname, {
      scroll: false,
    });
  };

  const nf = (v: number, o?: Intl.NumberFormatOptions) => formatNumber(locale, v, o);
  const rows: Row[] = [
    { key: "length", get: (s) => s.length, format: (v) => `${nf(v)} m` },
    { key: "beam", get: (s) => s.beam, format: (v) => `${nf(v)} m` },
    { key: "height", get: (s) => s.height, format: (v) => `${nf(v)} m` },
    {
      key: "mass",
      get: (s) => s.massKg,
      format: (v) => `${nf(v / 1000, { maximumFractionDigits: 1 })} t`,
    },
    { key: "crew", get: (s) => s.crew.max, format: (_, s) => formatCrew(s.crew) },
    { key: "cargo", get: (s) => s.cargoSCU, format: (v) => `${nf(v)} SCU`, better: "max" },
    { key: "scm", get: (s) => s.scm, format: (v) => `${nf(v)} m/s`, better: "max" },
    { key: "max", get: (s) => s.maxSpeed, format: (v) => `${nf(v)} m/s`, better: "max" },
    { key: "shield", get: (s) => s.shieldHp, format: (v) => `${nf(v)} HP`, better: "max" },
  ];

  const best = (row: Row) => {
    if (!row.better || selected.length < 2) return undefined;
    const values = selected.map(row.get).filter((v): v is number => v !== undefined);
    if (values.length < 2) return undefined;
    const target = row.better === "max" ? Math.max(...values) : Math.min(...values);
    // Pas de mise en avant si tout le monde est à égalité
    return values.every((v) => v === target) ? undefined : target;
  };

  const maxLength = Math.max(1, ...selected.map((s) => s.length));
  const prices = selected.map((s) => s.minPriceAUEC).filter((v): v is number => v !== undefined);
  const bestPrice =
    prices.length >= 2 && new Set(prices).size > 1 ? Math.min(...prices) : undefined;

  return (
    <div className="space-y-16">
      {/* Choix */}
      <div className="grid gap-4 md:grid-cols-3">
        {slots.map((s, i) => (
          <div key={i} className="space-y-2">
            <label
              htmlFor={`compare-${i}`}
              className="flex items-center gap-2 text-eyebrow font-medium text-ink-muted uppercase"
            >
              <span aria-hidden className={cn("h-2 w-2", TINTS[i])} />
              {t("slot", { n: i + 1 })}
            </label>
            <select
              id={`compare-${i}`}
              value={s?.slug ?? ""}
              onChange={(e) => setSlot(i, e.target.value)}
              className="min-h-11 w-full border border-line-strong bg-bg px-3 text-ink"
            >
              <option value="">{t("none")}</option>
              {ships.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {selected.length < 2 && <p className="text-ink-muted">{t("empty")}</p>}

      {/* Silhouettes superposées, alignées sur la poupe, à la même échelle */}
      {selected.length > 0 && (
        <section aria-label={t("scaleTitle")} className="space-y-4">
          <h2 className="text-eyebrow font-medium text-accent uppercase">{t("scaleTitle")}</h2>
          <div aria-hidden className="relative border-b border-line-strong">
            {/* Hauteur réservée par la silhouette la plus haute */}
            <div
              style={{
                paddingBottom: `${Math.max(
                  ...selected.map((s) =>
                    s.silhouette
                      ? (s.length / maxLength) * (s.silhouette.height / s.silhouette.width) * 100
                      : 0,
                  ),
                )}%`,
              }}
            />
            {slots.map((s, i) => {
              if (!s?.silhouette) return null;
              const mask = `url(${s.silhouette.src})`;
              return (
                <span
                  key={s.slug}
                  className={cn("absolute bottom-0 left-0 block opacity-45", TINTS[i])}
                  style={{
                    width: `${(s.length / maxLength) * 100}%`,
                    aspectRatio: `${s.silhouette.width} / ${s.silhouette.height}`,
                    maskImage: mask,
                    WebkitMaskImage: mask,
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                  }}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Tableau des caractéristiques */}
      {selected.length > 0 && (
        <section aria-label={t("specsTitle")} className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <caption className="sr-only">{t("specsTitle")}</caption>
            <thead>
              <tr className="border-b border-line-strong">
                <td />
                {slots.map((s, i) =>
                  s ? (
                    <th key={s.slug} scope="col" className="py-4 pr-4 align-bottom">
                      <Link
                        href={`/fleet/${s.slug}`}
                        className={cn(
                          "link-line font-display text-base font-light sm:text-xl",
                          TEXT_TINTS[i],
                        )}
                      >
                        {s.name}
                      </Link>
                    </th>
                  ) : null,
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const top = best(row);
                return (
                  <tr key={row.key} className="border-b border-line">
                    <th
                      scope="row"
                      className="py-3 pr-4 text-eyebrow font-medium text-ink-muted uppercase"
                    >
                      {ts(row.key as "length")}
                    </th>
                    {selected.map((s) => {
                      const v = row.get(s);
                      const isBest = top !== undefined && v === top;
                      return (
                        <td
                          key={s.slug}
                          className={cn(
                            "py-3 pr-4 font-mono text-xs tabular-nums",
                            isBest ? "text-accent" : "text-ink",
                          )}
                        >
                          {v === undefined ? "—" : row.format(v, s)}
                          {isBest && <span className="sr-only"> ({t("best")})</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-b border-line">
                <th
                  scope="row"
                  className="py-3 pr-4 text-eyebrow font-medium text-ink-muted uppercase"
                >
                  aUEC
                </th>
                {selected.map((s) => {
                  const isBest = bestPrice !== undefined && s.minPriceAUEC === bestPrice;
                  return (
                    <td
                      key={s.slug}
                      className={cn(
                        "py-3 pr-4 font-mono text-xs tabular-nums",
                        isBest ? "text-accent" : "text-ink",
                      )}
                    >
                      {s.minPriceAUEC ? formatAUEC(locale, s.minPriceAUEC) : "—"}
                      {isBest && <span className="sr-only"> ({t("best")})</span>}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
