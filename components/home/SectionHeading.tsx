import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Rule } from "@/components/ui/Rule";
import { Heading, Lead } from "@/components/ui/Typography";

/** En-tête commun aux sections de l'accueil : filet numéroté, titre, chapeau. */
export function SectionHeading({
  id,
  label,
  title,
  lead,
  thread,
  children,
}: {
  id: string;
  /** Côté par lequel passe le fil d'or */
  thread?: "left" | "right";
  label: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-14 md:mb-20">
      <Rule label={label} ticks thread={thread} className="mb-10" />
      <Reveal className="grid gap-6 md:grid-cols-12">
        <Heading id={id} size="lg" className="md:col-span-6">
          {title}
        </Heading>
        {lead && <Lead className="md:col-span-5 md:col-start-8 md:self-end">{lead}</Lead>}
        {children}
      </Reveal>
    </div>
  );
}
