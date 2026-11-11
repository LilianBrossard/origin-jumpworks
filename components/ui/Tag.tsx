import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type TagProps = ComponentPropsWithoutRef<"span"> & { accent?: boolean };

/** Étiquette fine : gamme, rôle, taille. */
export function Tag({ accent = false, className, children, ...rest }: TagProps) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center px-3 py-1 text-[0.6875rem] font-medium tracking-wide-2 uppercase",
        accent ? "text-accent" : "text-ink-muted",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        className={cn("absolute inset-0 chamfer-sm", accent ? "bg-accent/60" : "bg-line-strong")}
        style={{ ["--chamfer-sm" as string]: "4px" }}
      />
      <span
        aria-hidden
        className="absolute inset-px bg-bg chamfer-sm"
        style={{ ["--chamfer-sm" as string]: "4px" }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}
