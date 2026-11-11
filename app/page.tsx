import Link from "next/link";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { STORAGE_KEYS } from "@/lib/preferences";

export const metadata: Metadata = {
  title: "Origin Jumpworks",
  robots: { index: false },
};

/*
 * Export statique : pas de middleware pour détecter la langue.
 * Cette page choisit /fr/ ou /en/ dans le navigateur : préférence mémorisée,
 * sinon langue du navigateur, sinon français.
 */
const script = `(function(){var l=null;try{l=localStorage.getItem("${STORAGE_KEYS.locale}")}catch(e){}var s=${JSON.stringify(routing.locales)};if(s.indexOf(l)<0){l="${routing.defaultLocale}";var n=navigator.languages||[navigator.language||""];for(var i=0;i<n.length;i++){var c=String(n[i]).slice(0,2).toLowerCase();if(s.indexOf(c)>=0){l=c;break}}}location.replace("/"+l+"/"+location.search+location.hash)})();`;

export default function LanguageRedirect() {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </head>
      <body className="flex min-h-screen items-center justify-center font-sans">
        <noscript>
          <p className="flex gap-6 text-sm tracking-[0.2em] uppercase">
            <Link href="/fr/" hrefLang="fr" lang="fr">
              Français
            </Link>
            <Link href="/en/" hrefLang="en" lang="en">
              English
            </Link>
          </p>
        </noscript>
      </body>
    </html>
  );
}
