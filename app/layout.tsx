import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

/**
 * Mise en page racine « transparente » : les balises <html> et <body> sont posées
 * par `app/[locale]/layout.tsx` (pour avoir le bon `lang`), par la page de redirection
 * `app/page.tsx` et par `app/not-found.tsx`.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return children;
}
