import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import type { Location, Meta, Ship } from "@/lib/data/schema";
import { formatDate, shortVersion } from "@/lib/format";
import { AcquireMap, type Dealership } from "./AcquireMap";
import { SectionHeading } from "./SectionHeading";

/** 7. Où les acquérir : regroupe les offres de la flotte par concession. */
export function Acquire({
  ships,
  locations,
  meta,
}: {
  ships: Ship[];
  locations: Location[];
  meta: Meta;
}) {
  const t = useTranslations("home.acquire");
  const locale = useLocale();

  const dealerships: Dealership[] = locations
    .map((loc) => ({
      id: loc.id,
      city: loc.name.replace(/([a-z])(\d)/i, "$1 $2"), // « Area18 » → « Area 18 »
      planet: loc.parent ?? loc.system,
      offers: ships
        .flatMap((s) => [
          ...s.ingame.buy
            .filter((o) => o.locationId === loc.id)
            .map((o) => ({ ship: s.name, kind: "buy" as const, price: o.priceAUEC })),
          ...s.ingame.rent
            .filter((o) => o.locationId === loc.id)
            .map((o) => ({ ship: s.name, kind: "rent" as const, price: o.priceAUEC })),
        ])
        .sort((a, b) => a.price - b.price),
    }))
    // Ordre des planètes en partant de l'étoile
    .sort(
      (a, b) =>
        ["Hurston", "Crusader", "ArcCorp", "microTech"].indexOf(a.planet) -
        ["Hurston", "Crusader", "ArcCorp", "microTech"].indexOf(b.planet),
    );

  const unavailable = ships
    .filter((s) => s.ingame.buy.length === 0 && s.ingame.rent.length === 0)
    .map((s) => s.name);

  return (
    <section aria-labelledby="acquerir-titre" className="container-page py-24 md:py-40">
      <SectionHeading
        id="acquerir-titre"
        label={t("label")}
        title={t("title")}
        lead={t("lead")}
        thread="right"
      />
      <Reveal>
        <AcquireMap dealerships={dealerships} />
      </Reveal>
      <div className="mt-12 space-y-2 border-t border-line pt-6 text-sm text-ink-muted">
        {unavailable.length > 0 && (
          <p>{t("unavailable", { ships: new Intl.ListFormat(locale).format(unavailable) })}</p>
        )}
        <p>
          {t("dateLine", {
            date: formatDate(locale, meta.pricesUpdatedAt ?? meta.fetchedAt),
            version: shortVersion(meta.gameVersion),
          })}
        </p>
      </div>
    </section>
  );
}
