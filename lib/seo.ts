import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Lien canonique et équivalents dans les autres langues (hreflang) pour une page.
 * `path` est le chemin sans langue, ex. "/fleet/890-jump" (ou "" pour l'accueil).
 */
export function localeAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const url = (l: string) => `/${l}${path}/`.replace(/\/+$/, "/");
  return {
    canonical: url(locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, url(l)])),
      "x-default": url(routing.defaultLocale),
    },
  };
}
