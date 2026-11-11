"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType } from "react";

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Délai en ms, pour décaler les éléments d'un même groupe */
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Apparition douce (fondu + léger glissement) quand l'élément entre à l'écran.
 * Le contenu n'est masqué que si JavaScript tourne (`html[data-js]`, voir globals.css) ;
 * en animations réduites, il apparaît sans transition.
 */
export function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  style,
  ...rest
}: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    />
  );
}
