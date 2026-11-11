import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type TextLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  /** Lien externe : ouvre un nouvel onglet et l'annonce aux lecteurs d'écran */
  external?: boolean;
};

/** Lien de texte : un trait champagne se dessine de gauche à droite sur le filet au survol. */
export function TextLink({ external, className, children, ...rest }: TextLinkProps) {
  return (
    <Link
      className={cn("link-line text-ink hover:text-accent", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
      {external && <span className="sr-only"> (nouvel onglet)</span>}
    </Link>
  );
}
