import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Export statique : pas de middleware, chaque page vit sous /fr/ ou /en/.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
