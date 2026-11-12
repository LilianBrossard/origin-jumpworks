import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityLogo } from "@/components/ui/CommunityLogo";
import { Rule } from "@/components/ui/Rule";
import { TextLink } from "@/components/ui/TextLink";
import { Heading } from "@/components/ui/Typography";
import type { Locale } from "@/i18n/routing";
import { getMeta, getShips } from "@/lib/data";
import type { ImageAsset } from "@/lib/data/schema";
import { AUTHOR, CIG_LEGAL_NOTICE, REPO_URL } from "@/lib/site";
import { PageTransition } from "@/components/layout/PageTransition";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "credits" });
  return {
    alternates: localeAlternates(locale as Locale, "/credits"),
    title: t("title"),
    description: t("lead"),
  };
}

const SOFTWARE = [
  { name: "Outfit", license: "SIL OFL 1.1", url: "https://fonts.google.com/specimen/Outfit" },
  { name: "Inter", license: "SIL OFL 1.1", url: "https://fonts.google.com/specimen/Inter" },
  {
    name: "JetBrains Mono",
    license: "SIL OFL 1.1",
    url: "https://fonts.google.com/specimen/JetBrains+Mono",
  },
  { name: "Next.js", license: "MIT", url: "https://nextjs.org" },
  { name: "React", license: "MIT", url: "https://react.dev" },
  { name: "Tailwind CSS", license: "MIT", url: "https://tailwindcss.com" },
  { name: "next-intl", license: "MIT", url: "https://next-intl.dev" },
  { name: "Zod", license: "MIT", url: "https://zod.dev" },
  { name: "sharp", license: "Apache 2.0", url: "https://sharp.pixelplumbing.com" },
];

function Block({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`c-${index}`} className="container-page py-12 md:py-16">
      <Rule label={index} className="mb-8" />
      <div className="grid gap-8 md:grid-cols-12">
        <Heading id={`c-${index}`} size="md" className="md:col-span-4">
          {title}
        </Heading>
        <div className="min-w-0 space-y-6 md:col-span-8">{children}</div>
      </div>
    </section>
  );
}

/** Associe une source de `meta.json` à son libellé de licence traduit. */
const sourceKey = (url: string) =>
  url.includes("api.star-citizen.wiki") ? "api" : url.includes("uexcorp") ? "uex" : "wiki";

const fileName = (url: string) =>
  decodeURIComponent(url.split("File:")[1] ?? url).replace(/_/g, " ");

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("credits");
  const tFooter = await getTranslations("footer");
  const meta = getMeta();
  const ships = getShips();
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(meta.pricesUpdatedAt ?? meta.fetchedAt),
  );
  const version = meta.gameVersion.split("-")[0] ?? meta.gameVersion;

  const roleOf = (image: ImageAsset) => {
    if (image.id === "hero") return t("role.hero");
    if (image.id === "side") return t("role.side");
    return t("role.gallery", { n: Number(image.id.replace("gallery-", "")) });
  };

  return (
    <PageTransition>
      <div className="pb-16">
        <PageHeader title={t("title")} lead={t("lead")} />

        <Block index="01" title={t("disclaimerTitle")}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <CommunityLogo alt={tFooter("madeByCommunity")} className="h-24 w-24" />
            <div className="space-y-4">
              <p className="max-w-[65ch]">{tFooter("disclaimer")}</p>
              <p lang="en" className="max-w-[65ch] text-sm text-ink-muted">
                {CIG_LEGAL_NOTICE}
              </p>
              <p className="text-sm text-ink-muted">
                {t.rich("fankit", {
                  link: (chunks) => (
                    <TextLink href="https://robertsspaceindustries.com/fankit" external>
                      {chunks}
                    </TextLink>
                  ),
                })}
              </p>
            </div>
          </div>
        </Block>

        <Block index="02" title={t("sourcesTitle")}>
          <p className="text-ink-muted">{t("sourcesLead", { date, version })}</p>
          <ul className="divide-y divide-line border-y border-line">
            {meta.sources.map((s) => (
              <li key={s.url} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3">
                <TextLink href={s.url} external>
                  {s.name}
                </TextLink>
                <span className="text-sm text-ink-muted">
                  {t(`sourceLicense.${sourceKey(s.url)}`)}
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block index="03" title={t("textsTitle")}>
          <p className="text-ink-muted">{t("textsLead")}</p>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {ships.map((ship) => (
              <li key={ship.slug}>
                <TextLink href={ship.links.wiki} external className="text-sm">
                  {ship.name}
                </TextLink>
              </li>
            ))}
          </ul>
        </Block>

        <Block index="04" title={t("imagesTitle")}>
          <p className="text-ink-muted">{t("imagesLead")}</p>
          <div className="border-t border-line">
            {ships.map((ship) => {
              const images = [
                ship.images.hero,
                ...(ship.images.side ? [ship.images.side] : []),
                ...ship.images.gallery,
              ];
              return (
                <details key={ship.slug} className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="font-display text-lg font-light">{ship.name}</span>
                    <span className="flex items-center gap-3 text-xs text-ink-muted">
                      {t("imageCount", { count: images.length })}
                      <span
                        aria-hidden
                        className="font-mono transition-transform duration-(--duration-base) group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <div className="overflow-x-auto pb-6">
                    <table className="w-full min-w-[36rem] text-left text-sm">
                      <caption className="sr-only">{ship.name}</caption>
                      <thead>
                        <tr className="border-b border-line text-eyebrow text-ink-muted uppercase">
                          <th scope="col" className="py-2 pr-4 font-medium">
                            {t("source")}
                          </th>
                          <th scope="col" className="py-2 pr-4 font-medium">
                            {t("author")}
                          </th>
                          <th scope="col" className="py-2 font-medium">
                            {t("license")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {images.map((image) => (
                          <tr key={image.id} className="border-b border-line last:border-0">
                            <th scope="row" className="py-2 pr-4 font-normal">
                              <span className="block text-xs text-ink-muted">{roleOf(image)}</span>
                              <TextLink href={image.credit.sourceUrl} external className="text-sm">
                                {fileName(image.credit.sourceUrl)}
                              </TextLink>
                            </th>
                            <td className="py-2 pr-4 text-ink-muted">{image.credit.author}</td>
                            <td className="py-2 text-ink-muted">{image.credit.license}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })}
          </div>
        </Block>

        <Block index="05" title={t("softwareTitle")}>
          <ul className="divide-y divide-line border-y border-line">
            {SOFTWARE.map((s) => (
              <li key={s.name} className="flex justify-between gap-6 py-3">
                <TextLink href={s.url} external>
                  {s.name}
                </TextLink>
                <span className="text-sm text-ink-muted">{s.license}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block index="06" title={t("codeTitle")}>
          <p className="text-ink-muted">{t("codeLead")}</p>
          <p className="text-ink-muted">
            {tFooter.rich("author", {
              name: AUTHOR.name,
              link: (chunks) => (
                <TextLink href={AUTHOR.url} external>
                  {chunks}
                </TextLink>
              ),
            })}
          </p>
          <p>
            <TextLink href={REPO_URL} external>
              {t("viewSource")}
            </TextLink>
          </p>
        </Block>
      </div>
    </PageTransition>
  );
}
