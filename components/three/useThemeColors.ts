"use client";

import { useEffect, useState } from "react";

export type ThemeColors = {
  ink: string;
  accent: string;
  glow: string;
  dark: boolean;
};

function read(): ThemeColors {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const bg = get("--bg", "#0a0d12");
  // Thème sombre si le fond est sombre (luminance approximative de la couleur hexadécimale)
  const n = parseInt(bg.replace("#", ""), 16);
  const lum = ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114;
  return {
    ink: get("--ink", "#ece7dd"),
    accent: get("--accent", "#c9b37e"),
    glow: get("--accent-glow", "#e6d3a3"),
    dark: lum < 128,
  };
}

/** Couleurs du thème courant, mises à jour quand le thème change (réglage du site ou du système). */
export function useThemeColors() {
  const [colors, setColors] = useState<ThemeColors>(() => read());

  useEffect(() => {
    const update = () => setColors(read());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return colors;
}
