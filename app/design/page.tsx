import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Inter_Tight, Jost } from "next/font/google";
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
import { contrastRatio, wcagLevel } from "@/lib/design/contrast";
import {
  DECORATIVE_TOKENS,
  TEXT_TOKENS,
  parseThemeTokens,
  type ThemeName,
} from "@/lib/design/tokens";
import { getShip } from "@/lib/data";
import { fontDisplay } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Système de design",
  description: "Tokens, typographie et composants du site Origin Jumpworks.",
};

// Polices candidates pour les titres, chargées uniquement sur cette page.
const jost = Jost({ subsets: ["latin"], weight: ["200", "300"] });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["200", "300"] });

const themes = parseThemeTokens(
  readFileSync(path.join(process.cwd(), "styles/tokens.css"), "utf8"),
);
const THEME_LABELS: Record<ThemeName, string> = {
  light: "Clair — Galerie",
  dark: "Sombre — Nuit sur New Austin",
};

const nf = new Intl.NumberFormat("fr-FR");

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
function BothThemes({ children }: { children: (theme: ThemeName) => ReactNode }) {
  return (
    <div className="grid gap-px bg-line lg:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-bg p-6 text-ink sm:p-10">
          <Annotation className="mb-8">{THEME_LABELS[theme]}</Annotation>
          {children(theme)}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Page */

export default function DesignPage() {
  const ship = getShip("890-jump");

  return (
    <main id="contenu">
      {/* Ouverture */}
      <header className="container-page flex min-h-[70vh] flex-col justify-end gap-10 pt-24 pb-16">
        <Monogram className="h-14 w-14" />
        <div className="space-y-6">
          <Eyebrow>Origin Jumpworks — Système de design</Eyebrow>
          <Heading as="h1" size="xl">
            Le trait d&apos;abord
          </Heading>
          <Lead>
            Des lignes d&apos;un pixel, beaucoup de vide, un mouvement lent. Chaque élément commence
            par son contour, puis la matière apparaît.
          </Lead>
        </div>
        <div className="flex flex-wrap gap-3">
          <Annotation>v1.0</Annotation>
          <Annotation>WCAG 2.2 AA</Annotation>
          <Annotation>Thème : système</Annotation>
        </div>
      </header>

      {/* 01 Couleurs */}
      <Section
        index="01"
        title="Couleurs"
        intro="Deux thèmes, une même retenue. Les couleurs de texte dépassent toutes 4.5:1 ; le halo et les traits sont réservés au décor. Ces ratios sont vérifiés par un test automatique."
      >
        <BothThemes>
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
                    Contraste des couleurs de texte, thème {theme}
                  </caption>
                  <thead>
                    <tr className="border-b border-line text-eyebrow text-ink-muted uppercase">
                      <th scope="col" className="py-2 font-medium">
                        Texte
                      </th>
                      <th scope="col" className="py-2 font-medium">
                        sur bg
                      </th>
                      <th scope="col" className="py-2 font-medium">
                        sur surface
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
                  Décoratives uniquement :{" "}
                  {DECORATIVE_TOKENS.map((t) => (
                    <code key={t} className="mr-2 font-mono text-xs">
                      --{t}
                    </code>
                  ))}
                </p>
              </div>
            );
          }}
        </BothThemes>
      </Section>

      {/* 02 Typographie */}
      <Section
        index="02"
        title="Typographie"
        intro="Titres géométriques en graisse fine, lettres espacées. Texte courant en Inter pour la lisibilité, codes techniques en JetBrains Mono."
      >
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
              Fondée en 2747, installée à New Austin depuis 2913
            </Heading>
            <Annotation>lead · Inter 300</Annotation>
            <Lead>
              Origin Jumpworks conçoit des vaisseaux comme on dessine un objet de luxe : des lignes
              épurées, des matériaux nobles, et l&apos;élégance comme fonction première.
            </Lead>
            <Annotation>body · Inter 400 · 17 px</Annotation>
            <p className="max-w-[65ch]">
              Le texte courant reste en graisse normale, avec un interlignage de 1.6 et une longueur
              de ligne limitée à 65 caractères, pour une lecture confortable dans les deux thèmes.
            </p>
          </div>

          <Frame className="p-6 sm:p-10">
            <Eyebrow className="mb-8">Choix de la police de titre</Eyebrow>
            <ul className="space-y-8">
              {[
                {
                  name: "Outfit",
                  className: fontDisplay.className,
                  note: "Retenue : plus ronde, plus douce",
                },
                {
                  name: "Jost",
                  className: jost.className,
                  note: "Choix initial : plus géométrique",
                },
                {
                  name: "Inter Tight",
                  className: interTight.className,
                  note: "Plus neutre, plus technique",
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
      <Section
        index="03"
        title="Composants"
        intro="Coins coupés à 45°, contours d'un pixel, aucun rebond. Le contour est tracé par des calques découpés pour ne jamais rogner l'anneau de focus."
      >
        <BothThemes>
          {() => (
            <div className="space-y-10">
              <div className="flex flex-wrap items-center gap-4">
                <Button trailing={<ArrowRight />}>Découvrir la flotte</Button>
                <Button variant="ghost">Comparer</Button>
                <Button disabled>Indisponible</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Tag accent>Prestige</Tag>
                <Tag>Luxury Touring</Tag>
                <Tag>Capital</Tag>
              </div>
              <p>
                Un lien interne vers la <TextLink href="/">page d&apos;accueil</TextLink> et un lien
                externe vers{" "}
                <TextLink href="https://starcitizen.tools" external>
                  starcitizen.tools
                </TextLink>
                .
              </p>
              <Frame ticks filled className="p-6">
                <Eyebrow className="mb-3">Cadre</Eyebrow>
                <p className="text-sm text-ink-muted">
                  Contour d&apos;un pixel, coins coupés, marques d&apos;angle optionnelles.
                </p>
              </Frame>
              <div className="space-y-4">
                <Rule label="01 — Manifeste" />
                <Rule ticks />
              </div>
              <div className="flex items-center gap-6">
                <Monogram className="h-12 w-12" title="Monogramme" />
                <Annotation>ORIG-890</Annotation>
                <Annotation>1:400</Annotation>
              </div>
            </div>
          )}
        </BothThemes>
      </Section>

      {/* 04 Exemple */}
      {ship && (
        <Section
          index="04"
          title="Mise en situation"
          intro="Image issue de la collecte (AVIF puis WebP, aperçu flou pendant le chargement) et fiche technique en valeurs fixes."
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <Frame ticks className="lg:col-span-7">
              <ShipPicture
                image={ship.images.hero}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="aspect-video chamfer"
                alt={`${ship.name}, vue isométrique en studio`}
              />
            </Frame>
            <div className="space-y-6 lg:col-span-5">
              <Eyebrow>{ship.role}</Eyebrow>
              <Heading size="lg">{ship.name}</Heading>
              <SpecList
                columns={1}
                items={[
                  { label: "Longueur", value: nf.format(ship.dimensions.length), unit: "m" },
                  {
                    label: "Équipage",
                    value:
                      ship.crew.min === ship.crew.max
                        ? ship.crew.max
                        : `${ship.crew.min}–${ship.crew.max}`,
                  },
                  { label: "Cargo", value: nf.format(ship.cargoSCU), unit: "SCU" },
                  { label: "Vitesse max.", value: nf.format(ship.speed.max), unit: "m/s" },
                ]}
              />
              <p className="text-xs text-ink-muted">
                Image : {ship.images.hero.credit.author}, {ship.images.hero.credit.license}.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* 05 Mouvement */}
      <Section
        index="05"
        title="Mouvement"
        intro="Lent, amorti, jamais saccadé. Une seule chose bouge fortement à la fois. Tout est désactivé si l'utilisateur demande moins d'animations."
      >
        <SpecList
          columns={3}
          items={[
            { label: "Rapide", value: "240", unit: "ms" },
            { label: "Base", value: "600", unit: "ms" },
            { label: "Lent", value: "1200", unit: "ms" },
            { label: "Amorti", value: "ease-out" },
            { label: "Courbe", value: "0.22, 1, 0.36, 1" },
            { label: "Rebond", value: "jamais" },
          ]}
        />
      </Section>
    </main>
  );
}
