import { describe, it, expect } from "vitest";
import { narrativeFor } from "./narrative";
import { createDefaultState } from "./state";
import type { SimulatorState } from "./state";

function stateWith(overrides: Partial<SimulatorState>): SimulatorState {
  return { ...createDefaultState(), ...overrides };
}

describe("narrativeFor", () => {
  it("returns an empty array for steps that have no narrative (1, 6, 7, 8, 9)", () => {
    for (const step of [1, 6, 7, 8, 9] as const) {
      expect(narrativeFor(stateWith({ step }))).toEqual([]);
    }
  });

  describe("step 2 — goal", () => {
    it("prompts the user to pick a goal when empty", () => {
      const s = stateWith({ step: 2, goal: "" });
      const paragraphs = narrativeFor(s);
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0]).toContain("בחירת המטרה");
    });

    it.each([
      ["משיכת קונים"],
      ["הגדלת סל"],
      ["קניה חוזרת / נאמנות"],
      ["סטוק / מלאי"],
      ["אחר / חוצה קטגוריות"],
    ] as const)('returns goal-specific narrative for "%s"', (goal) => {
      const s = stateWith({ step: 2, goal });
      const paragraphs = narrativeFor(s);
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(paragraphs[0]).toBeTruthy();
    });
  });

  describe("step 3 — promo type", () => {
    it("prompts when no promo type is chosen", () => {
      const s = stateWith({ step: 3, goal: "משיכת קונים", promoType: "" });
      expect(narrativeFor(s)[0]).toContain("בחירת סוג המבצע");
    });

    it("returns override narrative for known goal+promoType combos", () => {
      const s = stateWith({
        step: 3,
        goal: "סטוק / מלאי",
        promoType: "מבצעי הוזלה",
      });
      const paragraphs = narrativeFor(s);
      expect(paragraphs[0]).toContain("פינוי מלאי");
    });

    it("falls back to generic commentary for unmatched combos", () => {
      const s = stateWith({
        step: 3,
        goal: "משיכת קונים",
        promoType: "קופונים דיגיטליים",
      });
      const paragraphs = narrativeFor(s);
      // Generic template mentions the chosen promo name in quotes
      expect(paragraphs[0]).toContain("קופונים דיגיטליים");
    });
  });

  describe("step 4 — params: verdict copy", () => {
    it("flags negative gross margin when discount exceeds cost", () => {
      const s = stateWith({
        step: 4,
        discountPct: 99,
        unitPrice: 10,
        unitCost: 8,
        baseUnits: 1000,
        promoType: "מבצעי הוזלה",
      });
      const text = narrativeFor(s).join(" ");
      expect(text).toMatch(/שלילי|מתחת לעלות/);
    });

    it("warns on high cannibalization (>25%)", () => {
      const s = stateWith({
        step: 4,
        discountPct: 15,
        cannibPct: 35,
        promoType: "מבצעי הוזלה",
      });
      const text = narrativeFor(s).join(" ");
      expect(text).toContain("קניבליזציה");
    });

    it("reports the verdict for a healthy promo", () => {
      const s = stateWith({
        step: 4,
        discountPct: 10,
        unitPrice: 30,
        unitCost: 10,
        baseUnits: 2000,
        upliftPct: 40,
        cannibPct: 5,
        mktCost: 2000,
        opsCost: 0.2,
        promoType: "מבצעי הוזלה",
      });
      const text = narrativeFor(s).join(" ");
      expect(text).toMatch(/כדאי|רווח תוספתי/);
    });
  });

  describe("step 5 — scenarios narrative", () => {
    it("mentions the selected scenario name", () => {
      const s = stateWith({ step: 5, selectedScenario: "optimistic" });
      const text = narrativeFor(s).join(" ");
      expect(text).toContain("אופטימי");
    });

    it("reports break-even when margin is positive", () => {
      const s = stateWith({
        step: 5,
        discountPct: 10,
        unitPrice: 20,
        unitCost: 10,
        opsCost: 0.5,
        baseUnits: 1000,
        upliftPct: 25,
      });
      const text = narrativeFor(s).join(" ");
      expect(text).toContain("נקודת האיזון");
    });

    it("explains lack of break-even when effective margin is non-positive", () => {
      const s = stateWith({
        step: 5,
        discountPct: 70,
        unitPrice: 10,
        unitCost: 8,
        opsCost: 5,
        promoType: "מבצעי הוזלה",
      });
      const text = narrativeFor(s).join(" ");
      expect(text).toMatch(/לא ניתן להגיע לאיזון|אינו חיובי/);
    });
  });
});
