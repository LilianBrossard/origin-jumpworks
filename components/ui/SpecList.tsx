import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Spec = {
  label: string;
  value: ReactNode;
  /** Unité affichée en plus petit après la valeur */
  unit?: string;
};

type SpecListProps = {
  items: Spec[];
  columns?: 1 | 2 | 3;
  className?: string;
};

/** Liste de caractéristiques (liste de définitions). Valeurs fixes : aucun compteur animé. */
export function SpecList({ items, columns = 2, className }: SpecListProps) {
  return (
    <dl
      className={cn(
        "grid gap-x-10",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-6 border-b border-line py-3"
        >
          <dt className="text-eyebrow font-medium text-ink-muted uppercase">{item.label}</dt>
          <dd className="font-display text-xl font-light text-ink tabular-nums">
            {item.value}
            {item.unit && (
              <span className="ml-1.5 font-sans text-xs text-ink-muted">{item.unit}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
