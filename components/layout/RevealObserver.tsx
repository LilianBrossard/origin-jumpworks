"use client";

import { useEffect } from "react";

/**
 * Observateur unique des apparitions au défilement (`data-reveal`) pour tout le site.
 * Un seul composant client au lieu d'un par bloc : beaucoup moins de travail
 * d'hydratation pour React. Les pages chargées ensuite sont prises en compte
 * grâce à un MutationObserver.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    const scan = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => io.observe(el));
    };
    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n instanceof Element) {
            if (n.matches("[data-reveal]:not([data-revealed])")) io.observe(n);
            scan(n);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
