import { ViewTransition, type ReactNode } from "react";

/**
 * M3 · Saut quantique entre deux pages (View Transitions API, via React).
 * L'ancienne page s'éloigne et se brouille, la nouvelle arrive du fond ; les étoiles
 * filent en même temps (voir Starfield). Sans prise en charge du navigateur : pas
 * d'animation, la navigation reste normale. À placer dans chaque page (une mise en
 * page persiste entre les navigations, ses animations ne se déclencheraient pas).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="quantum-in" exit="quantum-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
