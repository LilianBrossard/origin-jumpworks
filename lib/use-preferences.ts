"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS, type MotionPreference, type ThemePreference } from "./preferences";

/*
 * Petit magasin partagé : tous les sélecteurs (en-tête, pied de page) restent
 * synchronisés, y compris entre onglets grâce à l'événement `storage`.
 */

const EVENT = "oj-preferences";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // stockage indisponible (navigation privée stricte) : la préférence vaut pour la page
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/* ---------------------------------------------------------------- Thème */

const getTheme = (): ThemePreference => {
  const v = read(STORAGE_KEYS.theme);
  return v === "light" || v === "dark" ? v : "system";
};

export function useThemePreference() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system" as const);
  const setTheme = (next: ThemePreference) => {
    const root = document.documentElement;
    const apply = () => {
      if (next === "system") root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", next);
      write(STORAGE_KEYS.theme, next === "system" ? null : next);
    };

    // M5 · Lever / coucher de soleil, seulement si le thème affiché change vraiment
    const before = effectiveTheme();
    const after = next === "system" ? systemTheme() : next;
    if (
      before === after ||
      getReduced() ||
      document.visibilityState !== "visible" ||
      typeof document.startViewTransition !== "function"
    ) {
      apply();
      return;
    }
    root.dataset.themeTransition = after === "light" ? "sunrise" : "sunset";
    let applied = false;
    const once = () => {
      if (applied) return;
      applied = true;
      apply();
    };
    const transition = document.startViewTransition(once);
    // Filet de sécurité : si la transition ne démarre pas, le thème s'applique quand même.
    const fallback = window.setTimeout(() => {
      transition.skipTransition();
      once();
      delete root.dataset.themeTransition;
    }, 300);
    transition.updateCallbackDone.finally(() => window.clearTimeout(fallback));
    transition.finished.finally(() => delete root.dataset.themeTransition);
  };
  return [theme, setTheme] as const;
}

const systemTheme = (): "light" | "dark" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/** Thème réellement affiché : préférence enregistrée, sinon celui du système. */
const effectiveTheme = (): "light" | "dark" => {
  const t = getTheme();
  return t === "system" ? systemTheme() : t;
};

/* ---------------------------------------------------------------- Animations */

const getMotion = (): MotionPreference =>
  read(STORAGE_KEYS.motion) === "reduced" ? "reduced" : "system";

export function useMotionPreference() {
  const motion = useSyncExternalStore(subscribe, getMotion, () => "system" as const);
  const setMotion = (next: MotionPreference) => {
    const root = document.documentElement;
    if (next === "reduced") root.setAttribute("data-motion", "reduced");
    else root.removeAttribute("data-motion");
    write(STORAGE_KEYS.motion, next === "reduced" ? "reduced" : null);
  };
  return [motion, setMotion] as const;
}

/* ---------------------------------------------------------------- Mouvement effectif */

function subscribeReduced(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  const unsub = subscribe(callback);
  return () => {
    mq.removeEventListener("change", callback);
    unsub();
  };
}

const getReduced = () =>
  getMotion() === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Vrai si les animations doivent être réduites : réglage du système ou option du site.
 * À utiliser pour toute animation pilotée en JavaScript (3D, défilement fluide…).
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, getReduced, () => false);
}

/* ---------------------------------------------------------------- Langue */

export function rememberLocale(locale: string) {
  write(STORAGE_KEYS.locale, locale);
}
