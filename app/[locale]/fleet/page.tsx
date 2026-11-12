import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { FleetBrowser, FleetGrid } from "@/components/fleet/FleetBrowser";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Locale } from "@/i18n/routing";
import { getShips } from "@/lib/data";
import { toSummary } from "@/lib/data/summary";
import { PageTransition } from "@/components/layout/PageTransition";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/fleet">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "fleet" });
  return { title: t("title"), description: t("lead", { count: getShips().length }) };
}

export default async function FleetPage({ params }: PageProps<"/[locale]/fleet">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("fleet");
  const ships = getShips().map(toSummary);

  return (
    <PageTransition>
      <div className="pb-24">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead", { count: ships.length })}
        />
        <div className="container-page">
          {/* Avant JavaScript (et pour les moteurs de recherche) : toute la flotte, sans filtre. */}
          <Suspense fallback={<FleetGrid ships={ships} />}>
            <FleetBrowser ships={ships} />
          </Suspense>
        </div>
      </div>
    </PageTransition>
  );
}
