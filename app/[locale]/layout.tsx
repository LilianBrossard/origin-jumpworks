import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PreferencesSync } from "@/components/layout/PreferencesSync";
import { RevealObserver } from "@/components/layout/RevealObserver";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SceneLoader } from "@/components/three/SceneLoader";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { PREFERENCES_SCRIPT } from "@/lib/preferences";

// Export statique : seules les langues connues sont générées.
export const dynamicParams = false;
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "fr" | "en", namespace: "meta" });
  return {
    title: { default: t("siteName"), template: `%s · ${t("siteName")}` },
    description: t("description"),
    openGraph: {
      siteName: t("siteName"),
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
      images: [{ url: "/og/default.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("a11y");

  // Seules les traductions utilisées par des composants client partent au navigateur
  // (les composants serveur sont déjà traduits dans le HTML).
  const all = await getMessages();
  const clientMessages = {
    a11y: all.a11y,
    nav: all.nav,
    prefs: all.prefs,
    fleet: all.fleet,
    compare: all.compare,
    ship: all.ship,
    home: { acquire: all.home.acquire, ranges: all.home.ranges },
  };

  return (
    // `suppressHydrationWarning` : data-theme / data-motion sont posés avant React par le script.
    <html lang={locale} className={`${fontVariables} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={clientMessages}>
          <PreferencesSync />
          <RevealObserver />
          <SmoothScroll />
          <SceneLoader />
          <a
            href="#contenu"
            className="fixed top-3 left-3 z-[60] -translate-y-20 bg-accent px-4 py-2 text-xs font-medium tracking-wide-2 text-bg uppercase transition-transform focus:translate-y-0"
          >
            {t("skipToContent")}
          </a>
          <Header />
          <main
            id="contenu"
            tabIndex={-1}
            className="relative z-[1] flex flex-1 flex-col outline-none *:min-w-0"
          >
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
