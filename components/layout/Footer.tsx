import { getLocale, getTranslations } from "next-intl/server";
import { Monogram } from "@/components/ui/Monogram";
import { TextLink } from "@/components/ui/TextLink";
import { Link } from "@/i18n/navigation";
import { getMeta } from "@/lib/data";
import { AUTHOR, REPO_URL } from "@/lib/site";
import { LanguageSwitch, MotionToggle, ThemeSwitch } from "./Preferences";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tPrefs = await getTranslations("prefs");
  const locale = await getLocale();
  const meta = getMeta();
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(meta.pricesUpdatedAt ?? meta.fetchedAt),
  );
  const version = meta.gameVersion.split("-")[0] ?? meta.gameVersion;

  const linkClass = "link-line text-sm text-ink-muted hover:text-ink";

  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="space-y-5 md:col-span-4">
          <Monogram className="h-10 w-10" />
          <p className="max-w-xs text-sm leading-relaxed text-ink-muted">{t("tagline")}</p>
        </div>

        <nav aria-label={t("explore")} className="space-y-4 md:col-span-2">
          <h2 className="text-eyebrow font-medium text-accent uppercase">{t("explore")}</h2>
          <ul className="space-y-2">
            {(
              [
                ["/", "home"],
                ["/fleet", "fleet"],
                ["/compare", "compare"],
                ["/design", "design"],
              ] as const
            ).map(([href, key]) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {tNav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4 md:col-span-3">
          <h2 className="text-eyebrow font-medium text-accent uppercase">{t("data")}</h2>
          <p className="text-sm text-ink-muted">{t("dataLine", { version, date })}</p>
          <ul className="space-y-2">
            {meta.sources.map((s) => (
              <li key={s.url}>
                <TextLink href={s.url} external className="text-sm text-ink-muted">
                  {s.name}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 md:col-span-3">
          <h2 className="text-eyebrow font-medium text-accent uppercase">{t("project")}</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/credits" className={linkClass}>
                {t("allCredits")}
              </Link>
            </li>
            <li>
              <TextLink href={REPO_URL} external className="text-sm text-ink-muted">
                {t("sourceCode")}
              </TextLink>
            </li>
            <li className="text-sm text-ink-muted">{t("author", { name: AUTHOR.name })}</li>
          </ul>
        </div>
      </div>

      {/* Réglages */}
      <div className="border-t border-line">
        <div className="container-page flex flex-wrap items-center gap-x-10 gap-y-4 py-6">
          <h2 className="sr-only">{tPrefs("title")}</h2>
          <LanguageSwitch variant="full" />
          <ThemeSwitch variant="full" />
          <MotionToggle variant="full" />
        </div>
      </div>

      {/* Avertissement : toujours visible */}
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl text-xs leading-relaxed text-ink-muted">{t("disclaimer")}</p>
          <p className="shrink-0 border border-line-strong px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
            {t("madeByCommunity")}
          </p>
        </div>
      </div>
    </footer>
  );
}
