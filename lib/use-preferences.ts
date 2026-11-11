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
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    write(STORAGE_KEYS.theme, next === "system" ? null : next);
  };
  return [theme, setTheme] as const;
}

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
