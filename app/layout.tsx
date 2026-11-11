import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Origin Jumpworks",
  description:
    "Projet de fan non officiel consacré au constructeur Origin Jumpworks (Star Citizen).",
};

// Mise en page provisoire : polices, thèmes et langues arrivent aux étapes 3 et 4.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
