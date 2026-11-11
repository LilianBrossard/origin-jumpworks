import type { ReactNode } from "react";
import { Eyebrow, Heading, Lead } from "@/components/ui/Typography";

/** Ouverture standard d'une page intérieure, sous l'en-tête fixe. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="container-page space-y-6 pt-36 pb-16 md:pt-44">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Heading as="h1" size="lg">
        {title}
      </Heading>
      {lead && <Lead>{lead}</Lead>}
      {children}
    </header>
  );
}
