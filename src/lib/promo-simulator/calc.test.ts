import { describe, it, expect } from "vitest";
import { calcMetrics, calcForScenario, verdictLabel } from "./calc";
import { createDefaultState } from "./state";

describe("calcMetrics", () => {
  it("computes effective price from unit price and discount", () => {
    const s = createDefaultState();
    s.unitPrice = 20;
    s.discountPct = 25;
    const m = calcMetrics(s);
    expect(m.effectivePrice).toBeCloseTo(15, 2);
  });

  it("computes unit margin as effective price - unit cost", () => {
    const s = createDefaultState();
    s.unitPrice = 10;
    s.unitCost = 6;
    s.promoUnitCost = 6;
    s.discountPct = 20;
    const m = calcMetrics(s);
    // effectivePrice = 8, margin = 2
    expect(m.unitMargin).toBeCloseTo(2, 2);
  });

  it("computes promo units with uplift", () => {
    const s = createDefaultState();
    s.baseUnits = 1000;
    s.upliftPct = 25;
    const m = calcMetrics(s);
    expect(m.promoUnits).toBe(1250);
  });

  it("computes break-even units as promo units needed to match no-promo profit", () => {
    const s = createDefaultState();
    s.unitPrice = 10;
    s.unitCost = 6;
    s.promoUnitCost = 6;
    s.discountPct = 20;
    s.opsCost = 0.5;
    s.baseUnits = 1000;
    s.mktCost = 1500;
    const m = calcMetrics(s);
    // Total promo units required for: promoUnits × promoMargin
    //                                  ≥ baseProfit + investment + cannibLoss
    const beUnitProfit = m.effectivePrice - s.promoUnitCost - s.opsCost;
    const expected = Math.ceil(
      (m.baseProfit + m.investment + m.cannibLoss) / beUnitProfit
    );
    expect(m.breakEvenUnits).toBe(expected);
    // Sanity: with non-zero baseProfit, break-even must exceed pure-marketing
    // recovery (which would be just investment / margin).
    expect(m.breakEvenUnits).toBeGreaterThan(
      Math.ceil(m.investment / beUnitProfit)
    );
  });

  it("computes stock coverage as stock / promo units in percent", () => {
    const s = createDefaultState();
    s.baseUnits = 1000;
    s.upliftPct = 0;
    s.stockUnits = 1500;
    const m = calcMetrics(s);
    expect(m.stockCoverage).toBe(150);
  });

  it("computes ROI from profit delta vs investment", () => {
    const s = createDefaultState();
    const m = calcMetrics(s);
    // sanity: ROI is a finite integer
    expect(Number.isFinite(m.roi)).toBe(true);
  });

  describe("status enum", () => {
    it("returns notWorthIt when unit margin <= 0", () => {
      const s = createDefaultState();
      s.unitPrice = 10;
      s.unitCost = 10;
      s.promoUnitCost = 10;
      s.discountPct = 20;
      const m = calcMetrics(s);
      expect(m.status).toBe("notWorthIt");
    });

    it("returns notWorthIt when stock coverage < 80%", () => {
      const s = createDefaultState();
      s.baseUnits = 1000;
      s.upliftPct = 50; // promo units = 1500
      s.stockUnits = 1100; // ~73%
      const m = calcMetrics(s);
      expect(m.stockCoverage).toBeLessThan(80);
      expect(m.status).toBe("notWorthIt");
    });

    it("returns worthIt when promo profit >= base profit and coverage >= 100", () => {
      const s = createDefaultState();
      s.unitPrice = 20;
      s.unitCost = 5;
      s.promoUnitCost = 5;
      s.discountPct = 5; // modest discount → keeps margin high
      s.baseUnits = 500;
      s.upliftPct = 30;
      s.stockUnits = 1000; // plenty of stock
      const m = calcMetrics(s);
      expect(m.stockCoverage).toBeGreaterThanOrEqual(100);
      expect(m.promoProfit).toBeGreaterThanOrEqual(m.baseProfit);
      expect(m.status).toBe("worthIt");
    });

    it("returns needsImprovement when profit is positive but below base profit", () => {
      const s = createDefaultState();
      s.unitPrice = 10;
      s.unitCost = 6;
      s.promoUnitCost = 6;
      s.discountPct = 30; // aggressive discount
      s.baseUnits = 1000;
      s.upliftPct = 5; // small uplift → profit drops below baseline
      s.stockUnits = 2000; // plenty of stock
      const m = calcMetrics(s);
      expect(m.unitMargin).toBeGreaterThan(0);
      expect(m.stockCoverage).toBeGreaterThanOrEqual(100);
      expect(m.promoProfit).toBeLessThan(m.baseProfit);
      expect(m.status).toBe("needsImprovement");
    });
  });

  describe("Step 4+5 rebuild metrics", () => {
    it("netProfit subtracts marketing cost and cannibalization loss", () => {
      const s = createDefaultState();
      // Force a clean baseline: high margin, modest uplift, real cannibalization
      s.unitPrice = 20;
      s.unitCost = 8;
      s.promoUnitCost = 8;
      s.discountPct = 10;
      s.baseUnits = 1000;
      s.upliftPct = 30;
      s.cannibPct = 20;
      s.mktCost = 4000;
      s.opsCost = 0.5;
      s.promoType = "מבצעי הוזלה";
      const m = calcMetrics(s);
      // Hand-derived: effPrice=18, unitMargin=10, promoUnits=1300,
      // baseProfit = 1000 * 12 = 12000
      // promoUnitProfit = 10 - 0.5 = 9.5; promoProfit = 1300 * 9.5 = 12350
      // cannibUnits = 200; cannibLoss = 200 * 12 = 2400
      // netProfit = 12350 - 12000 - 4000 - 2400 = -6050
      expect(m.netProfit).toBe(-6050);
      expect(m.cannibLoss).toBe(2400);
      expect(m.cannibUnits).toBe(200);
    });

    it("verdict flips with scenario stress test", () => {
      const s = createDefaultState();
      s.unitPrice = 30;
      s.unitCost = 10;
      s.promoUnitCost = 10;
      s.discountPct = 15;
      s.baseUnits = 2000;
      s.upliftPct = 40;
      s.cannibPct = 10;
      s.mktCost = 3000;
      s.opsCost = 0.5;
      s.promoType = "מבצעי הוזלה";
      const optimistic = calcForScenario(s, "optimistic");
      const pessimistic = calcForScenario(s, "pessimistic");
      // Optimistic should net more profit than pessimistic
      expect(optimistic.netProfit).toBeGreaterThan(pessimistic.netProfit);
    });

    it("verdictLabel returns canonical Hebrew strings", () => {
      expect(verdictLabel("worthIt")).toBe("מבצע כדאי");
      expect(verdictLabel("borderline")).toBe("כדאיות גבולית");
      expect(verdictLabel("notWorthIt")).toBe("מבצע לא כדאי");
    });
  });

  describe("edge cases", () => {
    it("handles zero baseline units", () => {
      const s = createDefaultState();
      s.baseUnits = 0;
      const m = calcMetrics(s);
      expect(m.promoUnits).toBe(0);
      expect(m.stockCoverage).toBe(0);
    });

    it("handles zero stock with positive promo units", () => {
      const s = createDefaultState();
      s.stockUnits = 0;
      const m = calcMetrics(s);
      expect(m.stockCoverage).toBe(0);
      expect(m.status).toBe("notWorthIt");
    });
  });
});
