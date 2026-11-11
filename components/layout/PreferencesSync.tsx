"use client";

import { useLocale } from "next-intl";
import { useLayoutEffect } from "react";
import { applyStoredPreferences } from "@/lib/preferences";

/**
 * Au changement de langue, Next rend à nouveau la mise en page racine et React
 * remplace les attributs de <html>, ce qui efface `data-theme` et `data-motion`
 * posés par le script initial. On les réapplique avant l'affichage.
 */
export function PreferencesSync() {
  const locale = useLocale();
  useLayoutEffect(() => {
    applyStoredPreferences();
  }, [locale]);
  return null;
}
