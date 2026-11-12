import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ComparePanel } from "@/components/fleet/ComparePanel";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Locale } from "@/i18n/routing";
import { getShips } from "@/lib/data";
import { toSummary } from "@/lib/data/summary";
import { PageTransition } from "@/components/layout/PageTransition";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/compare">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "compare" });
  return {
    alternates: localeAlternates(locale as Locale, "/compare"),
    title: t("title"),
    description: t("lead"),
  };
}

export default async function ComparePage({ params }: PageProps<"/[locale]/compare">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("compare");
  const ships = getShips().map(toSummary);

  return (
    <PageTransition>
      <div className="pb-24">
        <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <div className="container-page">
          {/* Le choix vient de l'URL : rendu côté navigateur, après le premier affichage */}
          <Suspense fallback={<p className="text-ink-muted">{t("empty")}</p>}>
            <ComparePanel ships={ships} />
          </Suspense>
        </div>
      </div>
    </PageTransition>
  );
}
