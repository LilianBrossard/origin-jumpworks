import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

/** Liste « a.b.c » de toutes les clés feuilles d'un objet de traductions. */
function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("traductions", () => {
  it("le français et l'anglais ont exactement les mêmes clés", () => {
    expect(keys(en).sort()).toEqual(keys(fr).sort());
  });

  it("aucune traduction n'est vide", () => {
    const empty = (obj: object): string[] =>
      keys(obj).filter((k) => {
        const value = k
          .split(".")
          .reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], obj);
        return typeof value !== "string" || value.trim() === "";
      });
    expect(empty(fr)).toEqual([]);
    expect(empty(en)).toEqual([]);
  });
});
