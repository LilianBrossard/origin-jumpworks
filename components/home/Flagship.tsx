import { useLocale, useTranslations } from "next-intl";
import { Frame } from "@/components/ui/Frame";
import { Reveal } from "@/components/ui/Reveal";
import { Rule } from "@/components/ui/Rule";
import { ShipPicture } from "@/components/ui/ShipPicture";
import { SpecList } from "@/components/ui/SpecList";
import { Eyebrow, Heading, Lead } from "@/components/ui/Typography";
import type { Ship } from "@/lib/data/schema";
import { formatCrew, formatNumber, formatUSD } from "@/lib/format";

/** 5. Vaisseau amiral : le 890 Jump en grand, caractéristiques en valeurs fixes. */
export function Flagship({ ship }: { ship: Ship }) {
  const t = useTranslations("home.flagship");
  const locale = useLocale();
  const image = ship.images.gallery[0] ?? ship.images.hero;

  return (
    <section aria-labelledby="amiral-titre" className="py-24 md:py-40">
      <div className="container-page">
        <Rule label={t("label")} ticks thread="right" className="mb-10" />
      </div>
      <Reveal className="container-page">
        <Frame ticks>
          <ShipPicture
            image={image}
            sizes="100vw"
            alt={t("imageAlt")}
            className="aspect-[4/3] chamfer sm:aspect-[21/9]"
          />
        </Frame>
        <p className="mt-3 text-right text-xs text-ink-muted">
          {t("credit", { author: image.credit.author })}
        </p>
      </Reveal>

      <div className="container-page mt-14 grid gap-12 lg:grid-cols-12">
        <Reveal className="space-y-6 lg:col-span-6">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <Heading id="amiral-titre" size="xl">
            {t("title")}
          </Heading>
          <Lead>{t("lead")}</Lead>
        </Reveal>
        <Reveal delay={150} className="lg:col-span-5 lg:col-start-8 lg:self-end">
          <SpecList
            columns={1}
            items={[
              {
                label: t("length"),
                value: formatNumber(locale, ship.dimensions.length),
                unit: "m",
              },
              { label: t("crew"), value: formatCrew(ship.crew) },
              { label: t("cargo"), value: formatNumber(locale, ship.cargoSCU), unit: "SCU" },
              { label: t("speed"), value: formatNumber(locale, ship.speed.max), unit: "m/s" },
              ...(ship.pledge.msrpUSD
                ? [{ label: t("pledge"), value: formatUSD(locale, ship.pledge.msrpUSD) }]
                : []),
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}
