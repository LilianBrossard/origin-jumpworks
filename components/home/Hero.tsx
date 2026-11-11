import { useTranslations } from "next-intl";
import { Frame } from "@/components/ui/Frame";
import { ShipPicture } from "@/components/ui/ShipPicture";
import { Annotation, Eyebrow, Heading, Lead } from "@/components/ui/Typography";
import type { Ship } from "@/lib/data/schema";

/** 1. Ouverture : le nom de la maison, sa devise, et le vaisseau amiral. */
export function Hero({ ship }: { ship: Ship }) {
  const t = useTranslations("home.hero");

  return (
    <section
      aria-labelledby="accueil-titre"
      className="relative flex min-h-svh flex-col justify-end pt-28 pb-10"
    >
      <div className="container-page space-y-10 md:space-y-14">
        <div className="space-y-6">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <Heading as="h1" id="accueil-titre" size="xl" className="leading-[0.95]">
            {t("title")}
          </Heading>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="space-y-6 lg:col-span-4">
            <p className="font-display text-display-md font-extralight text-accent">
              {t("tagline")}
            </p>
            <Lead>{t("lead")}</Lead>
          </div>
          <Frame ticks className="lg:col-span-8">
            <ShipPicture
              image={ship.images.hero}
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              alt={t("imageAlt")}
              className="aspect-[16/9] chamfer"
            />
            <div className="pointer-events-none absolute right-5 bottom-4 flex gap-4">
              <Annotation className="text-[#ece7dd]/70 before:bg-[#c9b37e]">ORIG-890</Annotation>
              <Annotation className="text-[#ece7dd]/70 before:bg-[#c9b37e]">
                {ship.dimensions.length} m
              </Annotation>
            </div>
          </Frame>
        </div>

        <a
          href="#manifeste"
          className="group flex w-fit items-center gap-4 text-xs font-medium tracking-wide-3 text-ink-muted uppercase hover:text-ink"
        >
          <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[descend_2.4s_var(--ease-in-out)_infinite] bg-accent" />
          </span>
          {t("scroll")}
        </a>
      </div>
    </section>
  );
}
