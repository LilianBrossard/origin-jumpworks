import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Inter_Tight, Jost } from "next/font/google";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { ArrowRight, Button } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { Monogram } from "@/components/ui/Monogram";
import { Rule } from "@/components/ui/Rule";
import { ShipPicture } from "@/components/ui/ShipPicture";
import { SpecList } from "@/components/ui/SpecList";
import { Tag } from "@/components/ui/Tag";
import { TextLink } from "@/components/ui/TextLink";
import { Annotation, Eyebrow, Heading, Lead } from "@/components/ui/Typography";
import type { Locale } from "@/i18n/routing";
import { getShip } from "@/lib/data";
import { contrastRatio, wcagLevel } from "@/lib/design/contrast";
import {
  DECORATIVE_TOKENS,
  TEXT_TOKENS,
  parseThemeTokens,
  type ThemeName,
} from "@/lib/design/tokens";
import { fontDisplay } from "@/lib/fonts";
import { PageTransition } from "@/components/layout/PageTransition";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/design">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "design" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

// Polices comparées pour les titres, chargées uniquement sur cette page.
const jost = Jost({ subsets: ["latin"], weight: ["200", "300"] });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["200", "300"] });

const themes = parseThemeTokens(
  readFileSync(path.join(process.cwd(), "styles/tokens.css"), "utf8"),
);

/* ---------------------------------------------------------------- Mise en page */

function Section({
  index,
  title,
  intro,
  children,
}: {
  index: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="container-page py-20 md:py-28" aria-labelledby={`s-${index}`}>
      <Rule label={index} ticks className="mb-10" />
      <div className="mb-12 grid gap-6 md:grid-cols-12">
        <Heading id={`s-${index}`} size="md" className="md:col-span-5">
          {title}
        </Heading>
        {intro && <Lead className="md:col-span-6 md:col-start-7 md:text-lg">{intro}</Lead>}
      </div>
      {children}
    </section>
  );
}

/** Rend le même contenu dans les deux thèmes, côte à côte. */
function BothThemes({
  labels,
  children,
}: {
  labels: Record<ThemeName, string>;
  children: (theme: ThemeName) => ReactNode;
}) {
  return (
    <div className="grid gap-px bg-line lg:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-bg p-6 text-ink sm:p-10">
          <Annotation className="mb-8">{labels[theme]}</Annotation>
          {children(theme)}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Page */

export default async function DesignPage({ params }: PageProps<"/[locale]/design">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("design");
  const ship = getShip("890-jump");
  const nf = new Intl.NumberFormat(locale);
  const labels = { light: t("themeLight"), dark: t("themeDark") };

  return (
    <PageTransition>
      <div>
        {/* Ouverture */}
        <header className="container-page flex min-h-[70vh] flex-col justify-end gap-10 pt-28 pb-16">
          <Monogram className="h-14 w-14" />
          <div className="space-y-6">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <Heading as="h1" size="xl">
              {t("title")}
            </Heading>
            <Lead>{t("lead")}</Lead>
          </div>
          <div className="flex flex-wrap gap-3">
            <Annotation>v1.0</Annotation>
            <Annotation>WCAG 2.2 AA</Annotation>
            <Annotation>{t("systemTheme")}</Annotation>
          </div>
        </header>

        {/* 01 Couleurs */}
        <Section index="01" title={t("colors.title")} intro={t("colors.intro")}>
          <BothThemes labels={labels}>
            {(theme) => {
              const c = themes[theme];
              return (
                <div className="space-y-8">
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {(["bg", "surface", "accent", "accent-glow"] as const).map((token) => (
                      <li key={token} className="space-y-2">
                        <span
                          className="block aspect-square border border-line"
                          style={{ background: `var(--${token})` }}
                        />
                        <span className="block font-mono text-xs text-ink">--{token}</span>
                        <span className="block font-mono text-xs text-ink-muted uppercase">
                          {c[token]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      {t("colors.caption", { theme: labels[theme] })}
                    </caption>
                    <thead>
                      <tr className="border-b border-line text-eyebrow text-ink-muted uppercase">
                        <th scope="col" className="py-2 font-medium">
                          {t("colors.text")}
                        </th>
                        <th scope="col" className="py-2 font-medium">
                          {t("colors.onBg")}
                        </th>
                        <th scope="col" className="py-2 font-medium">
                          {t("colors.onSurface")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {TEXT_TOKENS.map((token) => (
                        <tr key={token} className="border-b border-line">
                          <th
                            scope="row"
                            className="py-3 font-normal"
                            style={{ color: `var(--${token})` }}
                          >
                            --{token}
                          </th>
                          {(["bg", "surface"] as const).map((bg) => {
                            const r = contrastRatio(c[token]!, c[bg]!);
                            return (
                              <td key={bg} className="py-3 font-mono text-xs tabular-nums">
                                {r.toFixed(2)}:1 <span className="text-accent">{wcagLevel(r)}</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-sm text-ink-muted">
                    {t("colors.decorative")}{" "}
                    {DECORATIVE_TOKENS.map((tok) => (
                      <code key={tok} className="mr-2 font-mono text-xs">
                        --{tok}
                      </code>
                    ))}
                  </p>
                </div>
              );
            }}
          </BothThemes>
        </Section>

        {/* 02 Typographie */}
        <Section index="02" title={t("type.title")} intro={t("type.intro")}>
          <div className="space-y-12">
            <div className="space-y-6">
              <Annotation>display-xl · Outfit 200</Annotation>
              <Heading as="p" size="xl">
                890 Jump
              </Heading>
              <Annotation>display-lg · Outfit 200</Annotation>
              <Heading as="p" size="lg">
                Ownership as a lifestyle
              </Heading>
              <Annotation>display-md · Outfit 300</Annotation>
              <Heading as="p" size="md">
                {t("type.sampleMd")}
              </Heading>
              <Annotation>lead · Inter 300</Annotation>
              <Lead>{t("type.sampleLead")}</Lead>
              <Annotation>body · Inter 400 · 17 px</Annotation>
              <p className="max-w-[65ch]">{t("type.sampleBody")}</p>
            </div>

            <Frame className="p-6 sm:p-10">
              <Eyebrow className="mb-8">{t("type.choice")}</Eyebrow>
              <ul className="space-y-8">
                {[
                  { name: "Outfit", className: fontDisplay.className, note: t("type.outfit") },
                  { name: "Jost", className: jost.className, note: t("type.jost") },
                  {
                    name: "Inter Tight",
                    className: interTight.className,
                    note: t("type.interTight"),
                  },
                ].map((f) => (
                  <li key={f.name} className="grid items-baseline gap-2 md:grid-cols-12">
                    <div className="md:col-span-3">
                      <p className="font-mono text-xs text-ink">{f.name}</p>
                      <p className="text-xs text-ink-muted">{f.note}</p>
                    </div>
                    <p
                      className={`${f.className} text-display-md font-extralight tracking-[0.12em] uppercase md:col-span-9`}
                    >
                      Origin Jumpworks 890
                    </p>
                  </li>
                ))}
              </ul>
            </Frame>
          </div>
        </Section>

        {/* 03 Composants */}
        <Section index="03" title={t("components.title")} intro={t("components.intro")}>
          <BothThemes labels={labels}>
            {() => (
              <div className="space-y-10">
                <div className="flex flex-wrap items-center gap-4">
                  <Button trailing={<ArrowRight />}>{t("components.discover")}</Button>
                  <Button variant="ghost">{t("components.compare")}</Button>
                  <Button disabled>{t("components.disabled")}</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Tag accent>Prestige</Tag>
                  <Tag>Luxury Touring</Tag>
                  <Tag>Capital</Tag>
                </div>
                <p>
                  {t.rich("components.linkSentence", {
                    internal: (chunks) => <TextLink href="/">{chunks}</TextLink>,
                    external: (chunks) => (
                      <TextLink href="https://starcitizen.tools" external>
                        {chunks}
                      </TextLink>
                    ),
                  })}
                </p>
                <Frame ticks filled className="p-6">
                  <Eyebrow className="mb-3">{t("components.frame")}</Eyebrow>
                  <p className="text-sm text-ink-muted">{t("components.frameText")}</p>
                </Frame>
                <div className="space-y-4">
                  <Rule label={t("components.ruleLabel")} />
                  <Rule ticks />
                </div>
                <div className="flex items-center gap-6">
                  <Monogram className="h-12 w-12" title={t("components.monogram")} />
                  <Annotation>ORIG-890</Annotation>
                  <Annotation>1:400</Annotation>
                </div>
              </div>
            )}
          </BothThemes>
        </Section>

        {/* 04 Exemple */}
        {ship && (
          <Section index="04" title={t("example.title")} intro={t("example.intro")}>
            <div className="grid gap-10 lg:grid-cols-12">
              <Frame ticks className="lg:col-span-7">
                <ShipPicture
                  image={ship.images.hero}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="aspect-video chamfer"
                  alt={t("example.alt", { name: ship.name })}
                />
              </Frame>
              <div className="space-y-6 lg:col-span-5">
                <Eyebrow>{ship.role}</Eyebrow>
                <Heading size="lg">{ship.name}</Heading>
                <SpecList
                  columns={1}
                  items={[
                    {
                      label: t("example.length"),
                      value: nf.format(ship.dimensions.length),
                      unit: "m",
                    },
                    {
                      label: t("example.crew"),
                      value:
                        ship.crew.min === ship.crew.max
                          ? ship.crew.max
                          : `${ship.crew.min}–${ship.crew.max}`,
                    },
                    { label: t("example.cargo"), value: nf.format(ship.cargoSCU), unit: "SCU" },
                    {
                      label: t("example.maxSpeed"),
                      value: nf.format(ship.speed.max),
                      unit: "m/s",
                    },
                  ]}
                />
                <p className="text-xs text-ink-muted">
                  {t("example.credit", {
                    author: ship.images.hero.credit.author,
                    license: ship.images.hero.credit.license,
                  })}
                </p>
              </div>
            </div>
          </Section>
        )}

        {/* 05 Mouvement */}
        <Section index="05" title={t("motion.title")} intro={t("motion.intro")}>
          <SpecList
            columns={3}
            items={[
              { label: t("motion.fast"), value: "240", unit: "ms" },
              { label: t("motion.base"), value: "600", unit: "ms" },
              { label: t("motion.slow"), value: "1200", unit: "ms" },
              { label: t("motion.easing"), value: "ease-out" },
              { label: t("motion.curve"), value: "0.22, 1, 0.36, 1" },
              { label: t("motion.bounce"), value: t("motion.never") },
            ]}
          />
        </Section>
      </div>
    </PageTransition>
  );
}
