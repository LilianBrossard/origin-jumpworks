import { useTranslations } from "next-intl";
import { ArrowRight, Button } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { Reveal } from "@/components/ui/Reveal";
import { ShipPicture } from "@/components/ui/ShipPicture";
import { Annotation } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { RANGES, type Range, type Ship } from "@/lib/data/schema";
import { SectionHeading } from "./SectionHeading";

/** Vaisseau dont l'image représente chaque gamme. */
const COVER: Record<Range, string> = {
  personal: "300i",
  touring: "600i-explorer",
  racing: "m50",
  prestige: "85x",
  gravlev: "x1-velocity",
};

/** 4. Les gammes : une composition éditoriale par gamme, image et liste alternées. */
export function Ranges({ ships }: { ships: Ship[] }) {
  const t = useTranslations("home.ranges");

  return (
    <section aria-labelledby="gammes-titre" className="container-page py-24 md:py-40">
      <SectionHeading id="gammes-titre" label={t("label")} title={t("title")} thread="left" />

      <div className="space-y-24 md:space-y-36">
        {RANGES.map((range, i) => {
          const members = ships.filter((s) => s.range === range);
          const cover = ships.find((s) => s.slug === COVER[range]) ?? members[0];
          if (!cover) return null;
          const flip = i % 2 === 1;
          return (
            <article
              key={range}
              aria-labelledby={`gamme-${range}`}
              className="grid items-center gap-10 lg:grid-cols-12"
            >
              <Reveal className={cn("lg:col-span-7", flip && "lg:order-2 lg:col-start-6")}>
                <Frame ticks>
                  <ShipPicture
                    image={cover.images.hero}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    alt={cover.name}
                    className="aspect-[16/10] chamfer"
                  />
                </Frame>
              </Reveal>

              <Reveal
                delay={120}
                className={cn(
                  "space-y-6 lg:col-span-4",
                  flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9",
                )}
              >
                <Annotation>
                  {String(i + 1).padStart(2, "0")} · {t("count", { count: members.length })}
                </Annotation>
                <h3
                  id={`gamme-${range}`}
                  className="font-display text-display-md font-extralight tracking-wide-2 text-ink uppercase"
                >
                  {t(`${range}.name`)}
                </h3>
                <p className="leading-relaxed text-pretty text-ink-muted">{t(`${range}.text`)}</p>
                <ul className="border-t border-line">
                  {members.map((ship) => (
                    <li
                      key={ship.slug}
                      className="flex items-baseline justify-between gap-6 border-b border-line py-3"
                    >
                      <span className="font-display text-lg font-light text-ink">{ship.name}</span>
                      <span className="text-right text-xs text-ink-muted">{ship.role}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </article>
          );
        })}
      </div>

      <Reveal className="mt-20 flex justify-center">
        <Button href="/fleet" trailing={<ArrowRight />}>
          {t("cta")}
        </Button>
      </Reveal>
    </section>
  );
}
