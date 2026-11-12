import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getMeta, getShips } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// Export statique : généré une fois au build.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(getMeta().fetchedAt);
  const paths = [
    "",
    "/fleet",
    "/compare",
    "/credits",
    "/design",
    ...getShips().map((s) => `/fleet/${s.slug}`),
  ];
  const url = (locale: string, path: string) => `${SITE_URL}/${locale}${path}/`;

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: url(locale, path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path.startsWith("/fleet/") ? 0.7 : 0.5,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
      },
    })),
  );
}
