import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Placeholder } from "@/components/layout/Placeholder";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/compare">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "nav" });
  return { title: t("compare") };
}

// Provisoire : le comparateur arrive à l'étape 7.
export default function ComparePage({ params }: PageProps<"/[locale]/compare">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("nav");
  return <Placeholder title={t("compare")} />;
}
