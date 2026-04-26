// Pure-derivation tests for the per-month sales-target module.
// Per-month target preserves seasonality from last year and scales by
// the annual growth multiplier (target / lastYear). Status is the
// three-band traffic light: <99% red, 99–101% yellow, >101% green.
import { describe, expect, it } from "vitest";
import { deriveMonthlyTargets } from "./monthly-targets";
import type { MonthlyDetail } from "@/data/hadera-real";

const partial = (overrides: Partial<MonthlyDetail>): MonthlyDetail => ({
  month: "ינו'",
  monthNum: 1,
  currentSales: 0,
  lastYearSales: 0,
  yoyChange: 0,
  businessDaysImpact: 0,
  salaryCostPercent: 0,
  supplyRate: 0,
  shopperUsage: 0,
  qualityScore: 0,
  freshQualityScore: 0,
  focusReports: 0,
  customerComplaints: 0,
  meatWastePercent: 0,
  ...overrides,
});

describe("deriveMonthlyTargets", () => {
  it("computes per-month target as lastYear × growthMultiplier", () => {
    const months: MonthlyDetail[] = [
      partial({ monthNum: 1, currentSales: 110, lastYearSales: 100 }),
      partial({ monthNum: 2, currentSales: 220, lastYearSales: 200 }),
    ];
    // multiplier = 360 / 300 = 1.2 → targets 120, 240
    const result = deriveMonthlyTargets(months, 360, 300);
    expect(result[0].target).toBeCloseTo(120, 5);
    expect(result[1].target).toBeCloseTo(240, 5);
  });

  it("annotates each month with vsTargetPercent (actual / target * 100)", () => {
    const months: MonthlyDetail[] = [
      partial({ monthNum: 1, currentSales: 120, lastYearSales: 100 }),
    ];
    // target = 100 × 1.2 = 120 → 120/120 = 100%
    const result = deriveMonthlyTargets(months, 120, 100);
    expect(result[0].vsTargetPercent).toBeCloseTo(100, 5);
  });

  it("returns yellow for ratios in the 99–101 band", () => {
    const months: MonthlyDetail[] = [
      // exactly at 99
      partial({ monthNum: 1, currentSales: 99, lastYearSales: 100 }),
      // exactly at 101
      partial({ monthNum: 2, currentSales: 101, lastYearSales: 100 }),
      // exactly at 100
      partial({ monthNum: 3, currentSales: 100, lastYearSales: 100 }),
    ];
    const result = deriveMonthlyTargets(months, 300, 300); // multiplier 1
    expect(result[0].status).toBe("yellow");
    expect(result[1].status).toBe("yellow");
    expect(result[2].status).toBe("yellow");
  });

  it("returns red below 99% and green above 101%", () => {
    const months: MonthlyDetail[] = [
      partial({ monthNum: 1, currentSales: 98.99, lastYearSales: 100 }),
      partial({ monthNum: 2, currentSales: 101.01, lastYearSales: 100 }),
    ];
    const result = deriveMonthlyTargets(months, 200, 200); // multiplier 1
    expect(result[0].status).toBe("red");
    expect(result[1].status).toBe("green");
  });

  it("falls back to neutral status when annual lastYear is zero", () => {
    const months: MonthlyDetail[] = [
      partial({ monthNum: 1, currentSales: 100, lastYearSales: 0 }),
    ];
    const result = deriveMonthlyTargets(months, 100, 0);
    expect(result[0].target).toBe(0);
    expect(result[0].status).toBe("yellow");
  });

  it("falls back to neutral status when annual target is zero", () => {
    const months: MonthlyDetail[] = [
      partial({ monthNum: 1, currentSales: 100, lastYearSales: 100 }),
    ];
    const result = deriveMonthlyTargets(months, 0, 1200);
    expect(result[0].target).toBe(0);
    expect(result[0].status).toBe("yellow");
  });

  it("preserves the sum invariant: per-month targets sum ≈ annual target", () => {
    // Realistic seasonal pattern
    const months: MonthlyDetail[] = Array.from({ length: 12 }, (_, i) =>
      partial({
        monthNum: i + 1,
        currentSales: 0,
        lastYearSales: 800_000 + i * 25_000,
      })
    );
    const annualLastYear = months.reduce((s, m) => s + m.lastYearSales, 0);
    const annualTarget = annualLastYear * 1.07;
    const result = deriveMonthlyTargets(months, annualTarget, annualLastYear);
    const sumTargets = result.reduce((s, m) => s + m.target, 0);
    // within 0.001% rounding tolerance
    expect(Math.abs(sumTargets - annualTarget)).toBeLessThan(
      annualTarget * 1e-6
    );
  });
});
