/**
 * Préférences du visiteur : thème, animations, langue.
 * Stockées dans localStorage et appliquées sur <html> avant le premier rendu
 * (script inline) pour éviter tout flash.
 */

export const STORAGE_KEYS = {
  theme: "oj-theme",
  motion: "oj-motion",
  locale: "oj-locale",
} as const;

export type ThemePreference = "system" | "light" | "dark";
export type MotionPreference = "system" | "reduced";

/**
 * Script exécuté dans <head> avant l'affichage. Sans préférence enregistrée,
 * aucun attribut n'est posé : le CSS suit alors le réglage du système.
 */
export const PREFERENCES_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("${STORAGE_KEYS.theme}");if(t==="light"||t==="dark")d.setAttribute("data-theme",t);if(localStorage.getItem("${STORAGE_KEYS.motion}")==="reduced")d.setAttribute("data-motion","reduced");}catch(e){}})();`;
