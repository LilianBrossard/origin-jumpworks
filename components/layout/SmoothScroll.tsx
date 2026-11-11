"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useReducedMotion } from "@/lib/use-preferences";

let lenis: Lenis | null = null;

/**
 * Défilement fluide (Lenis), désactivé si l'utilisateur demande moins d'animations.
 * Les zones qui défilent seules (bande d'échelle, menu mobile) portent `data-lenis-prevent`.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, anchors: true, autoRaf: true });
    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, [reduced]);

  // Nouvelle page : on repart du haut, sans glisser depuis l'ancienne position.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
