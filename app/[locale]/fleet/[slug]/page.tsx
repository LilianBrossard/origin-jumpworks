import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { DepthImage } from "@/components/fleet/DepthImage";
import { Gallery } from "@/components/fleet/Gallery";
import { ArrowRight, Button } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { Reveal } from "@/components/ui/Reveal";
import { Rule } from "@/components/ui/Rule";
import { SpecList } from "@/components/ui/SpecList";
import { Tag } from "@/components/ui/Tag";
import { TextLink } from "@/components/ui/TextLink";
import { Annotation, Eyebrow, Heading, Lead } from "@/components/ui/Typography";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getLocations, getMeta, getShip, getShips } from "@/lib/data";
import {
  formatAUEC,
  formatCrew,
  formatDate,
  formatNumber,
  formatUSD,
  shortVersion,
} from "@/lib/format";

export const dynamicParams = false;
export function generateStaticParams() {
  return getShips().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/fleet/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const ship = getShip(slug);
  if (!ship) return {};
  const description = (locale === "fr" && ship.description.fr) || ship.description.en;
  return {
    title: ship.name,
    description: description.slice(0, 160),
    openGraph: { images: [ship.images.hero.webp.at(-1)?.src ?? ""] },
  };
}

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="container-page py-16 md:py-24">
      <Rule label={label} className="mb-10" />
      <div className="grid gap-10 lg:grid-cols-12">
        <Heading id={id} size="md" className="lg:col-span-4">
          {title}
        </Heading>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

export default async function ShipPage({ params }: PageProps<"/[locale]/fleet/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const ship = getShip(slug);
  if (!ship) notFound();

  const t = await getTranslations("ship");
  const tr = await getTranslations("home.ranges");
  const ships = getShips();
  const i = ships.findIndex((s) => s.slug === ship.slug);
  const prev = ships[(i - 1 + ships.length) % ships.length]!;
  const next = ships[(i + 1) % ships.length]!;
  const locations = new Map(getLocations().map((l) => [l.id, l]));
  const meta = getMeta();
  const nf = (v: number, o?: Intl.NumberFormatOptions) => formatNumber(locale, v, o);

  const frText = locale === "fr" ? ship.description.fr : undefined;
  const offers = [
    ...ship.ingame.buy.map((o) => ({ ...o, kind: "buy" as const })),
    ...ship.ingame.rent.map((o) => ({ ...o, kind: "rent" as const })),
  ];
  const gallery = [ship.images.hero, ...ship.images.gallery];
  const authors = [...new Set(gallery.map((g) => g.credit.author))].join(", ");

  return (
    <article className="pb-16">
      {/* En-tête */}
      <header className="container-page space-y-8 pt-32 md:pt-40">
        <Link
          href="/fleet"
          className="inline-flex link-line text-xs font-medium tracking-wide-3 text-ink-muted uppercase hover:text-ink"
        >
          ← {t("back")}
        </Link>
        <div className="space-y-5">
          <Eyebrow>
            {tr(`${ship.range}.name`)} · {ship.role}
          </Eyebrow>
          {/* Casse d'origine : « 600i », pas « 600I » */}
          <Heading as="h1" size="xl" className="normal-case!">
            {ship.name}
          </Heading>
          <div className="flex flex-wrap gap-4">
            <Annotation>{ship.size}</Annotation>
            <Annotation>{nf(ship.dimensions.length)} m</Annotation>
            {ship.dates.addedInVersion && <Annotation>{ship.dates.addedInVersion}</Annotation>}
          </div>
        </div>
        <Frame ticks>
          <DepthImage
            image={ship.images.hero}
            depthSrc={ship.images.depth?.src}
            alt={t("heroAlt", { name: ship.name })}
            priority
            className="aspect-[16/9] chamfer"
          />
        </Frame>
        {ship.images.depth && (
          <p aria-hidden className="hidden text-right text-xs text-ink-muted md:block">
            {t("depthHint")}
          </p>
        )}
      </header>

      {/* Présentation */}
      <Section id="presentation" label="01" title={t("overviewTitle")}>
        <Reveal className="space-y-4">
          {frText ? (
            <Lead className="max-w-none">{frText}</Lead>
          ) : (
            <>
              <Lead lang="en" className="max-w-none">
                {ship.description.en}
              </Lead>
              {locale !== "en" && <p className="text-xs text-ink-muted">{t("originalEnglish")}</p>}
            </>
          )}
        </Reveal>
      </Section>

      {/* Caractéristiques */}
      <Section id="caracteristiques" label="02" title={t("specsTitle")}>
        <SpecList
          columns={2}
          items={[
            { label: t("specs.length"), value: nf(ship.dimensions.length), unit: "m" },
            { label: t("specs.beam"), value: nf(ship.dimensions.beam), unit: "m" },
            { label: t("specs.height"), value: nf(ship.dimensions.height), unit: "m" },
            {
              label: t("specs.mass"),
              value: nf(ship.massKg / 1000, { maximumFractionDigits: 1 }),
              unit: "t",
            },
            { label: t("specs.crew"), value: formatCrew(ship.crew) },
            { label: t("specs.cargo"), value: nf(ship.cargoSCU), unit: "SCU" },
            { label: t("specs.scm"), value: nf(ship.speed.scm), unit: "m/s" },
            { label: t("specs.max"), value: nf(ship.speed.max), unit: "m/s" },
            ...(ship.quantum
              ? [
                  {
                    label: t("specs.quantum"),
                    value: nf(ship.quantum.speedMs / 1e6, { maximumFractionDigits: 0 }),
                    unit: "Mm/s",
                  },
                  {
                    label: t("specs.range"),
                    value: nf(ship.quantum.rangeM / 1e9, { maximumFractionDigits: 0 }),
                    unit: "Gm",
                  },
                ]
              : []),
            ...(ship.shieldHp
              ? [{ label: t("specs.shield"), value: nf(ship.shieldHp), unit: "HP" }]
              : []),
            ...(ship.hullHp
              ? [{ label: t("specs.hull"), value: nf(ship.hullHp), unit: "HP" }]
              : []),
          ]}
        />
      </Section>

      {/* Acquisition */}
      <Section id="acquisition" label="03" title={t("acquireTitle")}>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <Eyebrow>{t("inGame")}</Eyebrow>
            {offers.length === 0 ? (
              <p className="text-ink-muted">{t("noOffer")}</p>
            ) : (
              <table className="w-full text-left text-sm">
                <tbody>
                  {offers.map((o) => {
                    const loc = locations.get(o.locationId);
                    return (
                      <tr key={`${o.kind}-${o.terminal}`} className="border-b border-line">
                        <th scope="row" className="py-3 pr-4 font-normal">
                          <span className="block text-ink">
                            {loc?.name.replace(/([a-z])(\d)/i, "$1 $2") ?? o.terminal}
                          </span>
                          <span className="block text-xs text-ink-muted">
                            {o.terminal.split(" - ")[0]}
                            {loc?.parent ? ` · ${loc.parent}` : ""}
                          </span>
                        </th>
                        <td className="py-3 pr-4 text-xs tracking-wide-2 text-ink-muted uppercase">
                          {t(o.kind)}
                        </td>
                        <td className="py-3 text-right font-mono text-xs whitespace-nowrap text-ink tabular-nums">
                          {formatAUEC(locale, o.priceAUEC)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <p className="text-xs text-ink-muted">
              {t("pricesNote", {
                date: formatDate(locale, meta.pricesUpdatedAt ?? meta.fetchedAt),
                version: shortVersion(meta.gameVersion),
              })}
            </p>
          </div>
          <div className="space-y-4">
            <Eyebrow>{t("pledge")}</Eyebrow>
            {ship.pledge.msrpUSD && (
              <p className="font-display text-display-md font-extralight text-ink">
                {formatUSD(locale, ship.pledge.msrpUSD)}
              </p>
            )}
            <div className="space-y-1 text-sm text-ink-muted">
              {ship.pledge.originalUSD && ship.pledge.originalUSD !== ship.pledge.msrpUSD && (
                <p>{t("originalPrice", { price: formatUSD(locale, ship.pledge.originalUSD) })}</p>
              )}
              {ship.pledge.availability && <p lang="en">{ship.pledge.availability}</p>}
            </div>
            {ship.pledge.url && (
              <p>
                <TextLink href={ship.pledge.url} external className="text-sm">
                  {t("pledgeLink")}
                </TextLink>
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* Galerie */}
      <Section id="galerie" label="04" title={t("galleryTitle")}>
        <Gallery images={gallery} name={ship.name} />
        <p className="mt-6 text-xs text-ink-muted">{t("credits", { authors })}</p>
      </Section>

      {/* Coloris et liens */}
      <section aria-label={t("linksTitle")} className="container-page py-16 md:py-24">
        <Rule label="05" className="mb-10" />
        <div className="grid gap-12 md:grid-cols-2">
          {ship.paints.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-eyebrow font-medium text-accent uppercase">{t("paintsTitle")}</h2>
              <ul className="flex flex-wrap gap-2">
                {ship.paints.map((p) => (
                  <li key={p}>
                    <Tag lang="en">{p}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-4">
            <h2 className="text-eyebrow font-medium text-accent uppercase">{t("linksTitle")}</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <TextLink href={ship.links.wiki} external>
                  {t("wiki")}
                </TextLink>
              </li>
              {ship.links.brochure && (
                <li>
                  <TextLink href={ship.links.brochure} external>
                    {t("brochure")}
                  </TextLink>
                </li>
              )}
              {ship.links.trailer && (
                <li>
                  <TextLink href={ship.links.trailer} external>
                    {t("trailer")}
                  </TextLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Navigation entre vaisseaux */}
      <nav aria-label={t("back")} className="container-page">
        <div className="flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
          <Link href={`/fleet/${prev.slug}`} className="group space-y-1">
            <span className="block text-eyebrow font-medium text-ink-muted uppercase">
              ← {t("prev")}
            </span>
            <span className="block font-display text-2xl font-light text-ink group-hover:text-accent">
              {prev.name}
            </span>
          </Link>
          <Button href={`/compare?ships=${ship.slug}`} variant="ghost" trailing={<ArrowRight />}>
            {t("compare")}
          </Button>
          <Link href={`/fleet/${next.slug}`} className="group space-y-1 md:text-right">
            <span className="block text-eyebrow font-medium text-ink-muted uppercase">
              {t("next")} →
            </span>
            <span className="block font-display text-2xl font-light text-ink group-hover:text-accent">
              {next.name}
            </span>
          </Link>
        </div>
      </nav>
    </article>
  );
}
