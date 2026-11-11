import { useTranslations } from "next-intl";
import { ArrowRight, Button } from "@/components/ui/Button";
import { Monogram } from "@/components/ui/Monogram";
import { Reveal } from "@/components/ui/Reveal";
import { Heading, Lead } from "@/components/ui/Typography";

/** 8. Fin de la descente : le monogramme, et les chemins vers la flotte. */
export function Outro() {
  const t = useTranslations("home.outro");
  return (
    <section
      aria-labelledby="fin-titre"
      className="container-page flex flex-col items-center gap-8 py-32 text-center md:py-48"
    >
      <Reveal className="flex flex-col items-center gap-8">
        <span data-thread="end" className="block">
          <Monogram className="h-20 w-20 transition-opacity duration-(--duration-slow)" />
        </span>
        <Heading id="fin-titre" size="lg">
          {t("title")}
        </Heading>
        <Lead className="mx-auto">{t("lead")}</Lead>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Button href="/fleet" trailing={<ArrowRight />}>
            {t("fleet")}
          </Button>
          <Button href="/compare" variant="ghost">
            {t("compare")}
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
