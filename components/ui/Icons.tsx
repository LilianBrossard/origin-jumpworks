import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

/* Icônes au trait d'un pixel, décoratives (aria-hidden) : le texte accessible est porté par le contrôle. */

function Icon({ className, children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden
      className={cn("h-4 w-4 shrink-0", className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSystem = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="6.5" vectorEffect="non-scaling-stroke" />
    <path d="M10 3.5a6.5 6.5 0 0 1 0 13Z" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconSun = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="3.5" vectorEffect="non-scaling-stroke" />
    <path
      d="M10 1.5v2.5M10 16v2.5M1.5 10H4M16 10h2.5M4 4l1.8 1.8M14.2 14.2 16 16M4 16l1.8-1.8M14.2 5.8 16 4"
      vectorEffect="non-scaling-stroke"
    />
  </Icon>
);

export const IconMoon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path
      d="M15.5 12.5A6.5 6.5 0 0 1 7.5 4.5a6.5 6.5 0 1 0 8 8Z"
      vectorEffect="non-scaling-stroke"
    />
  </Icon>
);

/** Animations : une trajectoire, barrée quand les animations sont réduites. */
export const IconMotion = ({ reduced, ...p }: SVGProps<SVGSVGElement> & { reduced?: boolean }) => (
  <Icon {...p}>
    <path d="M2 14c4 0 5-8 9-8 2.5 0 3.5 2 7 2" vectorEffect="non-scaling-stroke" />
    <circle cx="11" cy="6" r="1.5" fill="currentColor" stroke="none" />
    {reduced && <path d="M3 3l14 14" vectorEffect="non-scaling-stroke" />}
  </Icon>
);

export const IconMenu = ({ open, ...p }: SVGProps<SVGSVGElement> & { open?: boolean }) => (
  <Icon {...p}>
    {open ? (
      <path d="M4 4l12 12M16 4 4 16" vectorEffect="non-scaling-stroke" />
    ) : (
      <path d="M2 7h16M6 13h12" vectorEffect="non-scaling-stroke" />
    )}
  </Icon>
);

export const IconExternal = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8" vectorEffect="non-scaling-stroke" />
  </Icon>
);
