import { getLocale, getTranslations } from "next-intl/server";
import { CommunityLogo } from "@/components/ui/CommunityLogo";
import { Monogram } from "@/components/ui/Monogram";
import { TextLink } from "@/components/ui/TextLink";
import { Link } from "@/i18n/navigation";
import { getMeta } from "@/lib/data";
import { AUTHOR, CIG_LEGAL_NOTICE, REPO_URL } from "@/lib/site";
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
    <footer className="relative z-[1] mt-auto border-t border-line">
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
            <li className="text-sm text-ink-muted">
              {t.rich("author", {
                name: AUTHOR.name,
                link: (chunks) => (
                  <TextLink href={AUTHOR.url} external className="text-sm">
                    {chunks}
                  </TextLink>
                ),
              })}
            </li>
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

      {/* Mentions du fan kit CIG : logo officiel + mention légale exacte (≥ 10 pt), sur toutes les pages */}
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-6 py-8 sm:flex-row sm:items-center">
          <CommunityLogo alt={t("madeByCommunity")} className="h-20 w-20" />
          <div className="max-w-4xl space-y-2 text-sm leading-relaxed text-ink-muted">
            <p>{t("disclaimer")}</p>
            <p lang="en">{CIG_LEGAL_NOTICE}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
