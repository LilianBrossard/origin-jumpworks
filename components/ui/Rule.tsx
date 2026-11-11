import { cn } from "@/lib/cn";

type RuleProps = {
  /** Texte placé au début du filet (ex. numéro de section) */
  label?: string;
  /** Marques verticales aux extrémités */
  ticks?: boolean;
  /** Repère du fil d'or (3D) : il passera au début ou à la fin de ce filet */
  thread?: "left" | "right";
  className?: string;
};

/** Filet horizontal d'un pixel, avec libellé et marques optionnels. Décoratif. */
export function Rule({ label, ticks = false, thread, className }: RuleProps) {
  return (
    <div
      aria-hidden
      data-thread={thread}
      className={cn("flex items-center gap-4 text-ink-muted", className)}
    >
      {ticks && <span className="h-3 w-px bg-line-strong" />}
      {label && <span className="font-mono text-[0.6875rem] tracking-[0.12em]">{label}</span>}
      <span className="h-px flex-1 bg-line" />
      {ticks && <span className="h-3 w-px bg-line-strong" />}
    </div>
  );
}
