import { Link } from "@/i18n/navigation";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost";

type CommonProps = {
  variant?: Variant;
  /** Icône ou flèche placée après le texte */
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ButtonProps =
  | (CommonProps &
      ({ href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children">))
  | (CommonProps & { href?: undefined } & Omit<
        ComponentPropsWithoutRef<"button">,
        "className" | "children"
      >);

/**
 * Bouton à coins coupés.
 *
 * Le contour est obtenu par deux calques découpés (bordure + fond, décalé de 1 px) :
 * un `clip-path` sur l'élément lui-même couperait l'anneau de focus, il est donc
 * appliqué aux calques intérieurs uniquement.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", trailing, className, children } = props;

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-colors duration-(--duration-fast) chamfer-sm",
          variant === "primary" ? "bg-accent" : "bg-line-strong group-hover:bg-ink-muted",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-px transition-colors duration-(--duration-base) ease-(--ease-out) chamfer-sm",
          variant === "primary" ? "bg-bg group-hover:bg-accent" : "bg-bg",
        )}
      />
      <span
        className={cn(
          "relative flex items-center gap-3 transition-colors duration-(--duration-base) ease-(--ease-out)",
          variant === "primary" ? "text-accent group-hover:text-bg" : "text-ink",
        )}
      >
        {children}
        {trailing && (
          <span
            aria-hidden
            className="transition-transform duration-(--duration-base) ease-(--ease-out) group-hover:translate-x-1"
          >
            {trailing}
          </span>
        )}
      </span>
    </>
  );

  const classes = cn(
    "group relative inline-flex min-h-11 items-center justify-center px-6 py-3",
    "text-xs font-medium tracking-wide-3 uppercase",
    "disabled:pointer-events-none disabled:opacity-40",
    className,
  );

  if (props.href !== undefined) {
    const { variant: _v, trailing: _t, className: _c, children: _ch, ...linkProps } = props;
    return (
      <Link className={classes} {...linkProps}>
        {inner}
      </Link>
    );
  }
  const { variant: _v, trailing: _t, className: _c, children: _ch, ...buttonProps } = props;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {inner}
    </button>
  );
}

/** Flèche fine, à utiliser avec `trailing`. */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 8"
      className={cn("h-2 w-6", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path d="M0 4h23M19.5 0.5 23 4l-3.5 3.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
