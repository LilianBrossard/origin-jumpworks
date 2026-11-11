"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatAUEC } from "@/lib/format";

export type Dealership = {
  id: string;
  city: string;
  planet: string;
  offers: { ship: string; kind: "buy" | "rent"; price: number }[];
};

/** Planètes de Stanton, dans l'ordre réel (I à IV). Position purement schématique. */
const PLANETS = [
  { name: "Hurston", orbit: 70, angle: 215 },
  { name: "Crusader", orbit: 112, angle: 320 },
  { name: "ArcCorp", orbit: 152, angle: 35 },
  { name: "microTech", orbit: 192, angle: 125 },
] as const;

const C = 210; // centre du schéma (viewBox 420 × 420)
const pos = (orbit: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: C + orbit * Math.cos(a), y: C + orbit * Math.sin(a) };
};

/**
 * Carte schématique de Stanton et offres par concession.
 * Le schéma est décoratif (survol = sélection) ; le choix au clavier et aux lecteurs
 * d'écran passe par les boutons, et le détail est annoncé dans une zone « live ».
 */
export function AcquireMap({ dealerships }: { dealerships: Dealership[] }) {
  const t = useTranslations("home.acquire");
  const locale = useLocale();
  const [selected, setSelected] = useState(dealerships[0]?.id);
  const current = dealerships.find((d) => d.id === selected) ?? dealerships[0];
  const byPlanet = new Map(dealerships.map((d) => [d.planet, d]));

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
      {/* Schéma */}
      <div className="lg:col-span-6">
        <svg
          viewBox="0 0 420 420"
          aria-hidden
          className="mx-auto w-full max-w-[32rem] overflow-visible text-ink"
        >
          {/* Étoile */}
          <circle cx={C} cy={C} r={4} className="fill-accent" />
          <circle cx={C} cy={C} r={11} fill="none" className="stroke-accent/50" strokeWidth={1} />
          <text
            x={C}
            y={C + 30}
            textAnchor="middle"
            className="fill-ink-muted font-mono text-[9px] tracking-[0.2em] uppercase"
          >
            {t("star")}
          </text>

          {PLANETS.map((p) => {
            const { x, y } = pos(p.orbit, p.angle);
            const dealer = byPlanet.get(p.name);
            const active = dealer && dealer.id === current?.id;
            return (
              <g key={p.name}>
                <circle
                  cx={C}
                  cy={C}
                  r={p.orbit}
                  fill="none"
                  strokeWidth={1}
                  className={cn(
                    "transition-colors duration-(--duration-base)",
                    active ? "stroke-accent/60" : "stroke-line",
                  )}
                />
                <g
                  className={cn(dealer && "cursor-pointer")}
                  onMouseEnter={dealer ? () => setSelected(dealer.id) : undefined}
                  onClick={dealer ? () => setSelected(dealer.id) : undefined}
                >
                  {/* Zone de survol plus large que le point */}
                  <circle cx={x} cy={y} r={22} fill="transparent" />
                  {dealer && (
                    <circle
                      cx={x}
                      cy={y}
                      r={14}
                      fill="none"
                      strokeWidth={1}
                      className={cn(
                        "stroke-accent transition-opacity duration-(--duration-base) ease-(--ease-out)",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={dealer ? 5 : 3.5}
                    strokeWidth={1}
                    className={cn(
                      "transition-colors duration-(--duration-base)",
                      active
                        ? "fill-accent stroke-accent"
                        : dealer
                          ? "fill-bg stroke-ink"
                          : "fill-bg stroke-line-strong",
                    )}
                  />
                  <text
                    x={x}
                    y={y - 22}
                    textAnchor="middle"
                    className={cn(
                      "font-mono text-[10px] tracking-[0.12em] uppercase",
                      active ? "fill-accent" : dealer ? "fill-ink" : "fill-ink-muted",
                    )}
                  >
                    {p.name}
                  </text>
                  {dealer && (
                    <text
                      x={x}
                      y={y + 28}
                      textAnchor="middle"
                      className="fill-ink-muted font-sans text-[10px]"
                    >
                      {dealer.city}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Choix et détail */}
      <div className="space-y-8 lg:col-span-5 lg:col-start-8">
        <div role="group" aria-label={t("choose")} className="flex flex-wrap gap-2">
          {dealerships.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={d.id === current?.id}
              onClick={() => setSelected(d.id)}
              className={cn(
                "min-h-11 border px-4 text-xs font-medium tracking-wide-2 uppercase transition-colors duration-(--duration-fast)",
                d.id === current?.id
                  ? "border-accent text-accent"
                  : "border-line-strong text-ink-muted hover:text-ink",
              )}
            >
              {d.city}
            </button>
          ))}
        </div>

        {/* Annonce pour les lecteurs d'écran (les panneaux visuels sont permutés en fondu) */}
        <p aria-live="polite" className="sr-only">
          {current && t("announce", { city: current.city, count: current.offers.length })}
        </p>

        {/*
          Tous les panneaux occupent la même cellule de grille : le bloc prend la hauteur
          du plus grand et ne « saute » plus d'une planète à l'autre. On passe de l'un à
          l'autre par un fondu enchaîné ; les lignes arrivent avec un léger décalage.
        */}
        <div className="grid">
          {dealerships.map((d) => {
            const active = d.id === current?.id;
            return (
              <div
                key={d.id}
                inert={!active}
                aria-hidden={!active}
                className={cn(
                  "col-start-1 row-start-1 transition-[opacity,translate,visibility] duration-(--duration-base) ease-(--ease-out)",
                  active
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-2 opacity-0",
                )}
              >
                <p className="font-display text-display-md font-extralight text-ink">{d.city}</p>
                <p className="mb-6 text-sm text-ink-muted">
                  {d.planet} · {t("star")}
                </p>
                {d.offers.length === 0 ? (
                  <p className="text-ink-muted">{t("none")}</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">{d.city}</caption>
                    <tbody>
                      {d.offers.map((o, i) => (
                        <tr
                          key={`${o.ship}-${o.kind}`}
                          className={cn(
                            "border-b border-line transition-[opacity,translate] duration-(--duration-base) ease-(--ease-out)",
                            active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                          )}
                          style={{ transitionDelay: active ? `${Math.min(i, 12) * 30}ms` : "0ms" }}
                        >
                          <th
                            scope="row"
                            className="py-3 pr-4 font-display text-base font-light text-ink"
                          >
                            {o.ship}
                          </th>
                          <td className="py-3 pr-4 text-xs tracking-wide-2 text-ink-muted uppercase">
                            {t(o.kind)}
                          </td>
                          <td className="py-3 text-right font-mono text-xs whitespace-nowrap text-ink tabular-nums">
                            {formatAUEC(locale, o.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
