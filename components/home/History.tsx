import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const EVENTS = ["founding", "rise", "lines", "terra", "today"] as const;

/** 3. Histoire : une frise verticale, un trait fin qui relie les dates. */
export function History() {
  const t = useTranslations("home.history");
  return (
    <section aria-labelledby="histoire-titre" className="container-page py-24 md:py-40">
      <SectionHeading id="histoire-titre" label={t("label")} title={t("title")} thread="right" />
      <ol className="relative md:ml-[calc(100%/12*2)]">
        {/* Le fil de la frise */}
        <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-line" />
        {EVENTS.map((key, i) => (
          <Reveal as="li" key={key} delay={i * 80} className="relative pb-14 pl-12 last:pb-0">
            <span
              aria-hidden
              className="absolute top-2 left-0 h-[11px] w-[11px] rotate-45 border border-accent bg-bg"
            />
            <div className="grid gap-3 md:grid-cols-10 md:gap-10">
              <p className="font-mono text-sm tracking-[0.12em] text-accent md:col-span-2">
                {t(`events.${key}.year`)}
              </p>
              <div className="space-y-2 md:col-span-6">
                <h3 className="font-display text-2xl font-light text-ink">
                  {t(`events.${key}.title`)}
                </h3>
                <p className="leading-relaxed text-pretty text-ink-muted">
                  {t(`events.${key}.text`)}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
