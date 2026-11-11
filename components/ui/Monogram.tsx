import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  /** Titre accessible ; sans titre, le monogramme est décoratif. */
  title?: string;
};

/**
 * Monogramme « O » réinterprété : un cercle et un trait horizontal qui le traverse.
 * Ce n'est volontairement pas le logo officiel d'Origin Jumpworks.
 */
export function Monogram({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-10 w-10 text-ink", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="24" cy="24" r="15.5" vectorEffect="non-scaling-stroke" />
      <line x1="2" y1="24" x2="46" y2="24" vectorEffect="non-scaling-stroke" />
      <line
        x1="24"
        y1="6"
        x2="24"
        y2="10"
        className="text-accent"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
