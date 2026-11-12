import { describe, expect, it } from "vitest";
import { countUntil } from "../components/three/threadPath";
import { formatAUEC, formatCrew, shortVersion } from "../lib/format";

const nbsp = (s: string) => s.replace(/[  ]/g, " ");

describe("mise en forme", () => {
  it("équipage fixe ou variable", () => {
    expect(formatCrew({ min: 8, max: 8 })).toBe("8");
    expect(formatCrew({ min: 1, max: 3 })).toBe("1–3");
  });

  it("prix en aUEC selon la langue", () => {
    expect(nbsp(formatAUEC("fr", 62088400))).toBe("62 088 400 aUEC");
    expect(formatAUEC("en", 62088400)).toBe("62,088,400 aUEC");
  });

  it("version courte du jeu", () => {
    expect(shortVersion("4.10.2-LIVE.12881860")).toBe("4.10.2");
  });
});

describe("fil d'or", () => {
  // Profondeur maximale atteinte, point par point (toujours croissante)
  const reach = new Float32Array([0, 100, 200, 200, 350, 500]);

  it("compte les points déjà atteints pour une profondeur donnée", () => {
    expect(countUntil(reach, -1)).toBe(0);
    expect(countUntil(reach, 0)).toBe(1);
    expect(countUntil(reach, 200)).toBe(4);
    expect(countUntil(reach, 499)).toBe(5);
    expect(countUntil(reach, 10_000)).toBe(6);
  });
});
