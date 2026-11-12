/**
 * URL publique du site.
 * Ordre : variable explicite, sinon le domaine de production fourni par Vercel au build,
 * sinon le serveur local.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const REPO_URL = "https://github.com/LilianBrossard/origin-jumpworks";
export const AUTHOR = {
  name: "Lilian Brossard",
  url: "https://lilian-brossard.vercel.app/",
  github: "https://github.com/LilianBrossard",
};

/**
 * Mention exigée par l'accord du fan kit CIG (article 2g), à reproduire mot pour mot
 * et en anglais, de façon visible (≥ 10 pt) sur toutes les pages, y compris l'accueil.
 */
export const CIG_LEGAL_NOTICE =
  "This site is not endorsed by or affiliated with the Cloud Imperium or Roberts Space Industries group of companies. All game content and materials are copyright Cloud Imperium Rights LLC and Cloud Imperium Rights Ltd.. Star Citizen®, Squadron 42®, Roberts Space Industries®, and Cloud Imperium® are registered trademarks of Cloud Imperium Rights LLC. All rights reserved.";
