import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Acquire } from "@/components/home/Acquire";
import { Flagship } from "@/components/home/Flagship";
import { Hero } from "@/components/home/Hero";
import { History } from "@/components/home/History";
import { Manifesto } from "@/components/home/Manifesto";
import { Outro } from "@/components/home/Outro";
import { Ranges } from "@/components/home/Ranges";
import { ScaleLineup } from "@/components/home/ScaleLineup";
import type { Locale } from "@/i18n/routing";
import { getLocations, getMeta, getShip, getShips } from "@/lib/data";
import { PageTransition } from "@/components/layout/PageTransition";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "home" });
  return {
    alternates: localeAlternates(locale as Locale, ""),
    title: { absolute: t("metaTitle") },
  };
}

/**
 * Accueil : la longue descente.
 * Ouverture → Manifeste → Histoire → Gammes → Vaisseau amiral → Échelle → Acquérir → Fin.
 * Le fil d'or et les nuées (3D) viendront s'y superposer à l'étape 6.
 */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const ships = getShips();
  const flagship = getShip("890-jump");
  if (!flagship) throw new Error("890 Jump introuvable dans les données");

  return (
    <PageTransition>
      <Hero ship={flagship} />
      <Manifesto />
      <History />
      <Ranges ships={ships} />
      <Flagship ship={flagship} />
      <ScaleLineup ships={ships} />
      <Acquire ships={ships} locations={getLocations()} meta={getMeta()} />
      <Outro />
    </PageTransition>
  );
}
