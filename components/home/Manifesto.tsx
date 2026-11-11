import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { Rule } from "@/components/ui/Rule";

/** 2. Manifeste : une phrase, beaucoup de vide. */
export function Manifesto() {
  const t = useTranslations("home.manifesto");
  // Guillemets typographiques de la langue : « … » en français, “…” en anglais.
  const [open, close] = useLocale() === "fr" ? ["«", "»"] : ["“", "”"];
  return (
    <section
      id="manifeste"
      aria-labelledby="manifeste-titre"
      className="container-page py-28 md:py-48"
    >
      <h2 id="manifeste-titre" className="sr-only">
        {t("label")}
      </h2>
      <Rule label={t("label")} ticks className="mb-16 md:mb-24" />
      <div className="grid gap-12 md:grid-cols-12">
        <Reveal as="blockquote" className="md:col-span-9">
          <p className="font-display text-display-lg font-extralight text-balance text-ink">
            <span aria-hidden className="mr-2 text-accent">
              {open}
            </span>
            {t("quote")}
            <span aria-hidden className="ml-2 text-accent">
              {close}
            </span>
          </p>
        </Reveal>
        <Reveal delay={150} className="md:col-span-5 md:col-start-8">
          <p className="leading-relaxed text-pretty text-ink-muted">{t("body")}</p>
        </Reveal>
      </div>
    </section>
  );
}
