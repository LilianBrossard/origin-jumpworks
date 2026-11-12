import { useLocale, useTranslations } from "next-intl";
import { DragScroll } from "@/components/ui/DragScroll";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import type { Ship } from "@/lib/data/schema";
import { formatNumber } from "@/lib/format";
import { SectionHeading } from "./SectionHeading";

/** Pixels par mètre : le 890 Jump (210 m) mesure ainsi environ 1 400 px. */
const PX_PER_M = 6.6;

/**
 * 6. Échelle : toutes les silhouettes de profil, alignées sur une même ligne de sol
 * et à la même échelle. Les silhouettes sont des masques teintés par la couleur
 * du thème. Défilement horizontal : glisser à la souris (avec inertie), au doigt, ou au clavier.
 */
export function ScaleLineup({ ships }: { ships: Ship[] }) {
  const t = useTranslations("home.scale");
  const locale = useLocale();
  const lineup = ships
    .filter((s) => s.images.silhouette)
    .sort((a, b) => a.dimensions.length - b.dimensions.length);

  return (
    <section aria-labelledby="echelle-titre" className="py-24 md:py-40">
      <div className="container-page">
        <SectionHeading
          id="echelle-titre"
          label={t("label")}
          title={t("title")}
          lead={t("lead")}
          thread="left"
        />
      </div>

      <Reveal>
        <DragScroll
          role="region"
          aria-label={t("region")}
          tabIndex={0}
          className="scrollbar-thin [mask-image:linear-gradient(to_right,transparent,black_var(--gutter),black_calc(100%_-_var(--gutter)*2),transparent)] pb-6 focus-visible:outline-offset-[-2px]"
        >
          <ul className="flex w-max items-end gap-10 pr-[calc(var(--gutter)*3)] pl-[var(--gutter)] md:gap-14">
            {lineup.map((ship) => {
              const sil = ship.images.silhouette!;
              const width = ship.dimensions.length * PX_PER_M;
              const height = (width * sil.height) / sil.width;
              const mask = `url(${sil.src})`;
              return (
                <li key={ship.slug} className="flex shrink-0 flex-col">
                  <div className="flex min-w-20 items-end border-b border-line-strong pb-px">
                    <span
                      aria-hidden
                      className="block bg-ink transition-colors duration-(--duration-base) hover:bg-accent"
                      style={{
                        width,
                        height,
                        maskImage: mask,
                        WebkitMaskImage: mask,
                        maskSize: "100% 100%",
                        WebkitMaskSize: "100% 100%",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                      }}
                    />
                  </div>
                  <Link
                    href={`/fleet/${ship.slug}`}
                    draggable={false}
                    className="mt-3 w-fit font-display text-sm font-light whitespace-nowrap text-ink hover:text-accent"
                  >
                    {ship.name}
                  </Link>
                  <p className="font-mono text-xs text-ink-muted">
                    {t("meters", { value: formatNumber(locale, ship.dimensions.length) })}
                  </p>
                </li>
              );
            })}
          </ul>
        </DragScroll>
      </Reveal>

      <div className="container-page mt-6 flex items-center justify-between gap-6">
        {/* Barre d'échelle : 10 m */}
        <div aria-hidden className="flex items-center gap-3 font-mono text-xs text-ink-muted">
          <span
            className="block h-2 border-x border-b border-ink-muted"
            style={{ width: 10 * PX_PER_M }}
          />
          10 m
        </div>
        <p className="text-xs tracking-wide-2 text-ink-muted uppercase">{t("hint")} →</p>
      </div>
    </section>
  );
}
