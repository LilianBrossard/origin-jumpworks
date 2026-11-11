import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------- Sur-titre */

type EyebrowProps = ComponentPropsWithoutRef<"p"> & {
  /** Affiche un court filet avant le texte */
  rule?: boolean;
};

/** Sur-titre en capitales espacées, précédé d'un filet. */
export function Eyebrow({ rule = true, className, children, ...rest }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-sans text-eyebrow font-medium text-accent uppercase",
        className,
      )}
      {...rest}
    >
      {rule && <span aria-hidden className="h-px w-8 bg-current" />}
      {children}
    </p>
  );
}

/* ---------------------------------------------------------------- Titres */

const SIZES = {
  xl: "text-display-xl font-extralight uppercase",
  lg: "text-display-lg font-extralight uppercase",
  md: "text-display-md font-light",
} as const;

type HeadingProps<T extends ElementType> = {
  as?: T;
  size?: keyof typeof SIZES;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Titre éditorial en graisse fine. Le niveau (`as`) et la taille (`size`) sont indépendants. */
export function Heading<T extends ElementType = "h2">({
  as,
  size = "lg",
  className,
  ...rest
}: HeadingProps<T>) {
  const Tag: ElementType = as ?? "h2";
  return (
    <Tag className={cn("font-display text-balance text-ink", SIZES[size], className)} {...rest} />
  );
}

/* ---------------------------------------------------------------- Texte */

type LeadProps = ComponentPropsWithoutRef<"p">;

/** Paragraphe d'introduction, plus grand et plus aéré. */
export function Lead({ className, ...rest }: LeadProps) {
  return (
    <p
      className={cn(
        "max-w-[60ch] text-lg leading-relaxed font-light text-pretty text-ink-muted md:text-xl",
        className,
      )}
      {...rest}
    />
  );
}

/* ---------------------------------------------------------------- Annotation technique */

type AnnotationProps = ComponentPropsWithoutRef<"span">;

/** Code ou annotation façon plan technique : `ORIG-890`, `1:400`. Toujours fixe, jamais animé. */
export function Annotation({ className, ...rest }: AnnotationProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs font-light tracking-[0.08em] text-ink-muted uppercase",
        "before:inline-block before:h-2 before:w-px before:bg-accent before:content-['']",
        className,
      )}
      {...rest}
    />
  );
}
