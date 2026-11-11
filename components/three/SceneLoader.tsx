"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useReducedMotion } from "@/lib/use-preferences";

// Chargé à part : three.js n'alourdit pas le premier affichage.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Monte la scène 3D partagée (fond étoilé, fil d'or, nuées) une fois le contenu affiché,
 * seulement si WebGL est disponible et si les animations ne sont pas réduites.
 * Sinon : repli statique (un trait fin dans la marge de l'accueil).
 */
export function SceneLoader() {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    // Attend que le navigateur soit au repos : le contenu passe avant le décor.
    const start = () => {
      setWebgl(supportsWebGL());
      setReady(true);
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 300);
    return () => window.clearTimeout(id);
  }, []);

  const enabled = ready && webgl && !reduced;

  // Signale aux styles que la scène est active (le fil dessine alors le monogramme de fin).
  useEffect(() => {
    const root = document.documentElement;
    if (enabled) root.setAttribute("data-scene", "");
    else root.removeAttribute("data-scene");
  }, [enabled, pathname]);

  if (enabled) return <Scene pathname={pathname} />;

  // Repli : le fil, déjà tracé, en marge de l'accueil.
  if (pathname === "/") {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-[calc(var(--gutter)/2)] z-0 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent"
      />
    );
  }
  return null;
}
