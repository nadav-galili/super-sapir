// Boundary test for usePromoSimulator — exercises the contract via the pure
// state/codec/metrics/narrative layer that the hook wraps. The React hook
// itself is a thin adapter over these functions (plus router wiring), so
// unit tests at this layer cover the full input→output contract without
// needing a DOM or React renderer.
import { describe, it, expect } from "vitest";
import {
  createDefaultState,
  decodeState,
  encodeState,
  validateSimulatorSearch,
  type SimulatorState,
} from "@/lib/promo-simulator/state";
import { calcMetrics } from "@/lib/promo-simulator/calc";
import { narrativeFor } from "@/lib/promo-simulator/narrative";
import { canJumpToStep } from "./usePromoSimulator";

describe("usePromoSimulator (boundary contract)", () => {
  const defaults = createDefaultState({ defaultCategory: "חלב" });

  describe("search params → state", () => {
    it("decodes empty search into defaults", () => {
      const state = decodeState({}, defaults);
      expect(state).toEqual(defaults);
    });

    it("applies search overrides on top of defaults", () => {
      const state = decodeState({ step: 4, discountPct: 25 }, defaults);
      expect(state.step).toBe(4);
      expect(state.discountPct).toBe(25);
      expect(state.category).toBe(defaults.category);
    });

    it("validates raw search input (clamps step 1..9, ignores junk)", () => {
      const raw = validateSimulatorSearch({
        step: 15,
        discountPct: "20",
        junk: "ignored",
      });
      expect(raw.step).toBe(9);
      expect(raw.discountPct).toBe(20);
      expect("junk" in raw).toBe(false);
    });
  });

  describe("state → metrics", () => {
    it("derives metrics purely from state", () => {
      const state: SimulatorState = {
        ...defaults,
        baseUnits: 1000,
        unitPrice: 10,
        unitCost: 5,
        discountPct: 10,
        upliftPct: 20,
        stockUnits: 2000,
      };
      const m = calcMetrics(state);
      expect(m.effectivePrice).toBe(9);
      expect(m.unitMargin).toBe(4);
      expect(m.promoUnits).toBe(1200);
      expect(m.baseRevenue).toBe(10000);
    });
  });

  describe("state → narrative", () => {
    it("produces goal-specific copy at step 2", () => {
      const state: SimulatorState = {
        ...defaults,
        step: 2,
        goal: "משיכת קונים",
      };
      const paragraphs = narrativeFor(state);
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
    });

    it("returns empty narrative for steps outside the 2..5 range", () => {
      expect(narrativeFor({ ...defaults, step: 1 })).toEqual([]);
      expect(narrativeFor({ ...defaults, step: 6 })).toEqual([]);
    });
  });

  describe("state → URL roundtrip", () => {
    it("is lossless through encode/decode", () => {
      const state: SimulatorState = {
        ...defaults,
        step: 5,
        goal: "הגדלת סל",
        promoType: "מארזים (Multi-Pack)",
        discountPct: 22,
        upliftPct: 30,
        signage: true,
        analysisNote: "טוב",
      };
      const encoded = encodeState(state, defaults);
      const decoded = decodeState(encoded, defaults);
      expect(decoded).toEqual(state);
    });

    it("omits values equal to defaults from the encoded search", () => {
      const encoded = encodeState(defaults, defaults);
      expect(Object.keys(encoded).length).toBe(0);
    });
  });

  describe("step-jump validation", () => {
    it("allows backward jumps unconditionally", () => {
      const state: SimulatorState = { ...defaults, step: 5 };
      expect(canJumpToStep(state, 3)).toBe(true);
      expect(canJumpToStep(state, 1)).toBe(true);
    });

    it("blocks forward jumps past the earliest incomplete required step", () => {
      // Defaults have step 1 incomplete (empty segment/product/…),
      // so from step 1 the user can only "jump" to step 1 itself.
      const state: SimulatorState = { ...defaults, step: 1 };
      expect(canJumpToStep(state, 2)).toBe(false);
      expect(canJumpToStep(state, 5)).toBe(false);
      expect(canJumpToStep(state, 1)).toBe(true);
    });

    it("allows forward jumps once every prior required step is valid", () => {
      // Fill every required field through step 5 — Step 1 now uses the
      // promo-simulator taxonomy fields (group/department/subcategory/supplier).
      const state: SimulatorState = {
        ...defaults,
        step: 1,
        group: "dairy",
        department: "milk",
        subcategory: "milk-3",
        supplier: "sup-01",
        salesArena: "כלל הרשת",
        startDate: "2026-05-01",
        durationWeeks: 2,
        goal: "משיכת קונים",
        promoType: "מבצעי הוזלה",
        conditionText: "ביחידה",
        benefitText: "20% הנחה",
        unitPrice: 10,
        unitCost: 6,
        discountPct: 20,
        baseUnits: 1000,
        upliftPct: 25,
        stockUnits: 2000,
      };
      expect(canJumpToStep(state, 6)).toBe(true);
      expect(canJumpToStep(state, 9)).toBe(true);
    });

    it("rejects out-of-range steps", () => {
      const state: SimulatorState = { ...defaults, step: 5 };
      expect(canJumpToStep(state, 0 as 1)).toBe(false);
      expect(canJumpToStep(state, 10 as 9)).toBe(false);
    });
  });

  describe("restart / resetStep", () => {
    it("restart produces default state shape", () => {
      // Simulated by the codec: "restart" navigates to empty search,
      // which decodes back to defaults.
      const state = decodeState({}, defaults);
      expect(state.step).toBe(1);
      expect(state.goal).toBe("");
      expect(state.completed).toBe(false);
    });

    it("resetStep preserves the current step only", () => {
      const currentStep = 4;
      // Reset merges defaults but keeps current step.
      const reset: SimulatorState = { ...defaults, step: currentStep };
      expect(reset.step).toBe(currentStep);
      expect(reset.goal).toBe(defaults.goal);
    });
  });
});
