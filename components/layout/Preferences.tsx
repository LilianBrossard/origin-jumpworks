"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";
import { IconMoon, IconMotion, IconSun, IconSystem } from "@/components/ui/Icons";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { ThemePreference } from "@/lib/preferences";
import { rememberLocale, useMotionPreference, useThemePreference } from "@/lib/use-preferences";

type Variant = "compact" | "full";

/* ---------------------------------------------------------------- Langue */

const LOCALE_LABELS: Record<string, string> = { fr: "Français", en: "English" };

export function LanguageSwitch({ variant = "compact" }: { variant?: Variant }) {
  const t = useTranslations("prefs");
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("language")}>
      <ul className="flex items-center gap-1 text-xs font-medium tracking-wide-2 uppercase">
        {routing.locales.map((locale, i) => (
          <li key={locale} className="flex items-center gap-1">
            {i > 0 && (
              <span aria-hidden className="text-line-strong">
                /
              </span>
            )}
            <Link
              href={pathname}
              locale={locale}
              lang={locale}
              hrefLang={locale}
              aria-current={locale === current ? "true" : undefined}
              onClick={() => rememberLocale(locale)}
              className={cn(
                "inline-flex min-h-6 min-w-6 items-center justify-center px-1 transition-colors duration-(--duration-fast)",
                locale === current ? "text-accent" : "text-ink-muted hover:text-ink",
              )}
            >
              {variant === "full" ? LOCALE_LABELS[locale] : locale.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------------------------------------------------------------- Thème */

const THEMES: {
  value: ThemePreference;
  Icon: typeof IconSun;
  key: "themeSystem" | "themeLight" | "themeDark";
}[] = [
  { value: "system", Icon: IconSystem, key: "themeSystem" },
  { value: "light", Icon: IconSun, key: "themeLight" },
  { value: "dark", Icon: IconMoon, key: "themeDark" },
];

/** Groupe de boutons radio natifs : flèches du clavier, lecteurs d'écran, tout fonctionne d'office. */
export function ThemeSwitch({ variant = "compact" }: { variant?: Variant }) {
  const t = useTranslations("prefs");
  const [theme, setTheme] = useThemePreference();
  const name = useId();

  return (
    <fieldset className="flex items-center gap-3">
      <legend
        className={cn(
          variant === "compact"
            ? "sr-only"
            : "float-left mr-1 text-eyebrow font-medium text-ink-muted uppercase",
        )}
      >
        {t("theme")}
      </legend>
      <div className="flex items-center">
        {THEMES.map(({ value, Icon, key }) => (
          <label
            key={value}
            title={t(key)}
            className={cn(
              "relative flex min-h-8 cursor-pointer items-center gap-2 px-2 transition-colors duration-(--duration-fast)",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--focus)",
              theme === value ? "text-accent" : "text-ink-muted hover:text-ink",
            )}
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={theme === value}
              onChange={() => setTheme(value)}
              className="sr-only"
            />
            <Icon />
            <span className={cn(variant === "compact" ? "sr-only" : "text-xs")}>{t(key)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ---------------------------------------------------------------- Animations */

export function MotionToggle({ variant = "compact" }: { variant?: Variant }) {
  const t = useTranslations("prefs");
  const [motion, setMotion] = useMotionPreference();
  const reduced = motion === "reduced";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      title={t("motion")}
      onClick={() => setMotion(reduced ? "system" : "reduced")}
      className={cn(
        "flex min-h-8 items-center gap-2 px-2 transition-colors duration-(--duration-fast)",
        reduced ? "text-accent" : "text-ink-muted hover:text-ink",
      )}
    >
      <IconMotion reduced={reduced} />
      <span className={cn(variant === "compact" ? "sr-only" : "text-xs")}>{t("motion")}</span>
      {variant === "full" && (
        <span aria-hidden className="text-xs text-ink-muted">
          · {reduced ? t("motionOn") : t("motionOff")}
        </span>
      )}
    </button>
  );
}
