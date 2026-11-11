import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Origin Jumpworks", template: "%s · Origin Jumpworks" },
  description:
    "Projet de fan non officiel consacré au constructeur Origin Jumpworks (Star Citizen).",
};

// Langues et sélecteurs de thème arrivent à l'étape 4.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
