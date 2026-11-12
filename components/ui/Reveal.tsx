import type { ComponentPropsWithoutRef, ElementType } from "react";

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Délai en ms, pour décaler les éléments d'un même groupe */
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Apparition douce (fondu + léger glissement) quand l'élément entre à l'écran.
 *
 * Simple marqueur `data-reveal`, sans JavaScript propre : un seul observateur pour
 * tout le site (`RevealObserver`, dans la mise en page) ajoute `data-revealed`.
 * Le contenu n'est masqué que si JavaScript tourne (`html[data-js]`, voir globals.css) ;
 * en animations réduites, il apparaît sans transition.
 */
export function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  style,
  ...rest
}: RevealProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      data-reveal=""
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    />
  );
}
