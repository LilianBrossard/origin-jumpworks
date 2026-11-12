import type { Metadata } from "next";
import Link from "next/link";
import { CommunityLogo } from "@/components/ui/CommunityLogo";
import { fontVariables } from "@/lib/fonts";
import { PREFERENCES_SCRIPT } from "@/lib/preferences";
import { CIG_LEGAL_NOTICE } from "@/lib/site";

export const metadata: Metadata = {
  title: "404 · Origin Jumpworks",
  robots: { index: false },
};

const mask = "url(/ships/m50/silhouette.png)";

/**
 * Page 404 globale (`out/404.html`), hors de toute langue : elle est bilingue.
 * Un M50 égaré dérive lentement dans le vide, autour d'une orbite en pointillés.
 */
export default function NotFound() {
  return (
    <html lang="fr" className={`${fontVariables} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }} />
      </head>
      <body className="relative flex min-h-full flex-col overflow-x-hidden">
        <main className="relative flex flex-1 flex-col items-center justify-center gap-12 px-6 py-24 text-center">
          {/* Le vide : une orbite, et un vaisseau perdu qui dérive */}
          <div aria-hidden className="relative h-56 w-full max-w-xl">
            <span className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-line-strong" />
            <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
            <span
              className="absolute top-1/2 left-0 block h-[18px] w-[84px] animate-[drift_38s_linear_infinite] bg-ink"
              style={{
                maskImage: mask,
                WebkitMaskImage: mask,
                maskSize: "100% 100%",
                WebkitMaskSize: "100% 100%",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              }}
            />
            <p className="absolute right-0 bottom-0 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted">
              <span>Coordonnées inconnues</span>
              <span className="mx-2">·</span>
              <span lang="en">Unknown coordinates</span>
            </p>
          </div>

          <div className="space-y-4">
            <p className="font-display text-display-xl font-extralight tracking-[0.12em] text-ink">
              404
            </p>
            <h1 className="font-display text-display-md font-extralight tracking-[0.12em] uppercase">
              Perdu dans le vide
            </h1>
            <p
              lang="en"
              className="font-display text-xl font-extralight tracking-[0.12em] text-ink-muted uppercase"
            >
              Lost in the void
            </p>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-ink-muted">
            Cette page n’existe pas, ou plus.{" "}
            <span lang="en">This page does not exist, or no longer does.</span>
          </p>

          <nav
            aria-label="Retour · Back"
            className="flex gap-8 text-xs font-medium tracking-[0.2em] uppercase"
          >
            <Link className="link-line" href="/fr/" hrefLang="fr">
              Accueil
            </Link>
            <Link className="link-line" href="/en/" hrefLang="en" lang="en">
              Home
            </Link>
          </nav>
        </main>

        <footer className="flex flex-col items-center gap-4 border-t border-line px-6 py-6 sm:flex-row sm:justify-center">
          <CommunityLogo alt="Made by the Community" className="h-14 w-14" />
          <p lang="en" className="max-w-3xl text-sm leading-relaxed text-ink-muted">
            {CIG_LEGAL_NOTICE}
          </p>
        </footer>
      </body>
    </html>
  );
}
