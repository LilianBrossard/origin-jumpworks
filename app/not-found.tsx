import Link from "next/link";
import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { PREFERENCES_SCRIPT } from "@/lib/preferences";

export const metadata: Metadata = {
  title: "404 · Origin Jumpworks",
  robots: { index: false },
};

/**
 * Page 404 globale (`out/404.html`). Hors de toute langue, elle est bilingue.
 * Version soignée prévue à l'étape 8.
 */
export default function NotFound() {
  return (
    <html lang="fr" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col items-center justify-center gap-10 p-8 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-ink-muted">404</p>
        <div className="space-y-3">
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
        <p className="flex gap-8 text-xs tracking-[0.2em] uppercase">
          <Link className="link-line" href="/fr/" hrefLang="fr">
            Accueil
          </Link>
          <Link className="link-line" href="/en/" hrefLang="en" lang="en">
            Home
          </Link>
        </p>
      </body>
    </html>
  );
}
