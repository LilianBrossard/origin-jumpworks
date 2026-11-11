import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ArrowRight, Button } from "@/components/ui/Button";
import { Monogram } from "@/components/ui/Monogram";
import { Eyebrow, Heading, Lead } from "@/components/ui/Typography";
import type { Locale } from "@/i18n/routing";

// Accueil provisoire : la longue descente arrive à l'étape 5.
export default function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("home");

  return (
    <section className="container-page flex min-h-svh flex-col justify-center gap-10 pt-24 pb-16">
      <Monogram className="h-14 w-14" />
      <div className="space-y-6">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <Heading as="h1" size="xl">
          {t("title")}
        </Heading>
        <Lead>{t("lead")}</Lead>
      </div>
      <div>
        <Button href="/design" trailing={<ArrowRight />}>
          {t("cta")}
        </Button>
      </div>
    </section>
  );
}
