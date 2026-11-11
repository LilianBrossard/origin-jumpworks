"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/use-preferences";

/**
 * Conteneur à défilement horizontal qu'on peut aussi « attraper » à la souris.
 *
 * - souris : glisser pour faire défiler, avec une inertie douce au relâchement ;
 * - molette : inchangée (on ne détourne pas la descente de la page) ;
 * - tactile et clavier : défilement natif, inchangé ;
 * - animations réduites : pas d'inertie.
 * Un clic n'est pas déclenché si l'on vient de faire glisser.
 */
export function DragScroll({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0; // px par ms
    let frame = 0;

    const stopInertia = () => cancelAnimationFrame(frame);

    const glide = () => {
      if (reduced) return;
      let v = velocity;
      let prev = performance.now();
      const step = (now: number) => {
        const dt = now - prev;
        prev = now;
        el.scrollLeft -= v * dt;
        v *= Math.pow(0.94, dt / 16); // frottement
        if (Math.abs(v) > 0.02) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stopInertia();
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      el.scrollLeft -= dx;
      moved += Math.abs(dx);
      const dt = Math.max(1, now - lastT);
      velocity = 0.8 * (dx / dt) + 0.2 * velocity;
      lastX = e.clientX;
      lastT = now;
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete el.dataset.dragging;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      // Pas d'inertie si la souris s'est arrêtée avant de relâcher
      if (performance.now() - lastT < 80) glide();
    };

    // Après un glisser, on neutralise le clic qui suit.
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      stopInertia();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={cn(
        "cursor-grab overflow-x-auto overscroll-x-contain select-none data-[dragging]:cursor-grabbing",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
