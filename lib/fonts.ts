import { Inter, JetBrains_Mono, Outfit } from "next/font/google";

/** Titres : géométrique, utilisée en graisses fines (200–300). */
export const fontDisplay = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--ff-display",
  display: "swap",
});

/** Texte courant : lisibilité avant tout. */
export const fontBody = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--ff-body",
  display: "swap",
});

/** Codes et annotations techniques (ORIG-890, échelles). */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--ff-mono",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;
