import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type FrameProps = ComponentPropsWithoutRef<"div"> & {
  /** Petites marques d'angle façon plan technique */
  ticks?: boolean;
  /** Contenu sur fond `surface` plutôt que transparent */
  filled?: boolean;
};

/**
 * Cadre à coins coupés et contour d'un pixel.
 * Comme pour le bouton, le contour vient de deux calques découpés.
 */
export function Frame({ ticks = false, filled = false, className, children, ...rest }: FrameProps) {
  return (
    <div className={cn("relative", className)} {...rest}>
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-line chamfer" />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-px chamfer",
          filled ? "bg-surface" : "bg-bg",
        )}
      />
      {ticks && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 right-6 h-4 w-px bg-accent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-6 -left-2 h-px w-4 bg-accent"
          />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
