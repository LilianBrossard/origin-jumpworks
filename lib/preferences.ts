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
 * Applique les préférences enregistrées sur <html>. Même logique que le script
 * ci-dessous, mais appelable depuis React (voir `PreferencesSync`).
 */
export function applyStoredPreferences() {
  const root = document.documentElement;
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.theme);
    if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
    if (localStorage.getItem(STORAGE_KEYS.motion) === "reduced") {
      root.setAttribute("data-motion", "reduced");
    } else {
      root.removeAttribute("data-motion");
    }
  } catch {
    // stockage indisponible : on garde le réglage du système
  }
}

/**
 * Script exécuté dans <head> avant l'affichage. Sans préférence enregistrée,
 * aucun attribut n'est posé : le CSS suit alors le réglage du système.
 */
export const PREFERENCES_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("${STORAGE_KEYS.theme}");if(t==="light"||t==="dark")d.setAttribute("data-theme",t);if(localStorage.getItem("${STORAGE_KEYS.motion}")==="reduced")d.setAttribute("data-motion","reduced");}catch(e){}})();`;
