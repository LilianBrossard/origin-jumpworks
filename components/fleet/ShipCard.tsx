"use client";

import { useLocale, useTranslations } from "next-intl";
import { ShipPicture } from "@/components/ui/ShipPicture";
import { Link } from "@/i18n/navigation";
import type { ShipSummary } from "@/lib/data/summary";
import { formatAUEC, formatNumber } from "@/lib/format";

/** Carte d'un vaisseau dans la grille de la flotte. Toute la carte est cliquable. */
export function ShipCard({ ship }: { ship: ShipSummary }) {
  const t = useTranslations("fleet");
  const tr = useTranslations("home.ranges");
  const locale = useLocale();

  return (
    <article className="group relative">
      <div className="relative overflow-hidden">
        <span aria-hidden className="absolute inset-0 bg-line chamfer" />
        <ShipPicture
          image={ship.hero}
          alt=""
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
          className="relative m-px aspect-[16/10] chamfer"
          imgClassName="transition-transform duration-(--duration-slow) ease-(--ease-out) group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl font-light text-ink">
          <Link
            href={`/fleet/${ship.slug}`}
            aria-label={t("view", { name: ship.name })}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {ship.name}
          </Link>
        </h2>
        <span className="text-eyebrow font-medium text-accent uppercase">
          {tr(`${ship.range}.name`)}
        </span>
      </div>
      <p className="mt-1 flex flex-wrap justify-between gap-x-4 text-sm text-ink-muted">
        <span>{ship.role}</span>
        <span className="font-mono text-xs">
          {formatNumber(locale, ship.length)} m ·{" "}
          {ship.minPriceAUEC
            ? t("from", { price: formatAUEC(locale, ship.minPriceAUEC) })
            : t("notSold")}
        </span>
      </p>
      {/* Anneau de focus sur toute la carte (le lien couvre la carte) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 hidden outline-2 outline-offset-0 outline-(--focus) group-has-[:focus-visible]:block"
      />
    </article>
  );
}
