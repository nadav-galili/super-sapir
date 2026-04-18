// Pure unit tests for the shared anomaly detectors. These cover the
// three surfaces (department / category / chain) and are the only
// place anomaly thresholds are exercised.

import { describe, expect, it } from "vitest";
import {
  detectCategoryAnomalies,
  detectChainAnomalies,
  detectDepartmentAnomalies,
} from "./anomalies";
import type { DepartmentSales } from "@/data/hadera-real";

function dept(
  id: string,
  yoy: number,
  overrides: Partial<DepartmentSales> = {}
): DepartmentSales {
  return {
    id,
    name: id,
    category: "food",
    currentMonth: 100_000,
    yearToDate: 1_000_000,
    yoyChangePercent: yoy,
    sharePercent: 10,
    targetSharePercent: 10,
    shareChangePercent: 0,
    avgDaysOfInventory: 10,
    ...overrides,
  };
}

describe("detectDepartmentAnomalies", () => {
  it("skips departments whose deviation from store average is under 10pp", () => {
    const departments = [dept("a", 5), dept("b", -3), dept("c", 9)];
    const anomalies = detectDepartmentAnomalies(departments, 0);
    expect(anomalies).toHaveLength(0);
  });

  it("flags >=10 as warning and >=15 as critical", () => {
    const departments = [dept("warn", 12), dept("crit", 20)];
    const anomalies = detectDepartmentAnomalies(departments, 0);
    const warn = anomalies.find((a) => a.departmentId === "warn");
    const crit = anomalies.find((a) => a.departmentId === "crit");
    expect(warn?.severity).toBe("warning");
    expect(crit?.severity).toBe("critical");
  });

  it("sorts by absolute deviation descending", () => {
    const departments = [dept("mild", 11), dept("wild", -20), dept("mid", 14)];
    const anomalies = detectDepartmentAnomalies(departments, 0);
    expect(anomalies.map((a) => a.departmentId)).toEqual([
      "wild",
      "mid",
      "mild",
    ]);
  });

  it("subtracts store average before comparing", () => {
    // dept yoy of 10 with a store average of 10 = zero deviation.
    const anomalies = detectDepartmentAnomalies([dept("flat", 10)], 10);
    expect(anomalies).toHaveLength(0);
  });
});

describe("detectCategoryAnomalies", () => {
  it("returns empty when no thresholds are crossed", () => {
    const out = detectCategoryAnomalies({
      totalSales: 1_000_000,
      totalTarget: 1_000_000,
      suppliers: [
        {
          name: "ok",
          sales: 100,
          targetSales: 100,
          stockoutRate: 2,
          grossProfitPercent: 25,
        },
      ],
      branches: [{ name: "ok", yoy: 2, stockout: 2 }],
    });
    expect(out).toEqual([]);
  });

  it("flags category under 95% of target", () => {
    const out = detectCategoryAnomalies({
      totalSales: 900_000,
      totalTarget: 1_000_000,
      suppliers: [],
      branches: [],
    });
    expect(out.length).toBeGreaterThan(0);
    expect(out[0]).toContain("90.0%");
  });

  it("flags supplier target-miss, high stockout and low margin", () => {
    const out = detectCategoryAnomalies({
      totalSales: 1_000_000,
      totalTarget: 1_000_000,
      suppliers: [
        {
          name: "X",
          sales: 50,
          targetSales: 100, // 50% of target
          stockoutRate: 10, // > 4
          grossProfitPercent: 5, // < 18
        },
      ],
      branches: [],
    });
    expect(out.some((s) => s.includes("מפספס יעד"))).toBe(true);
    expect(out.some((s) => s.includes("חוסרים גבוה"))).toBe(true);
    expect(out.some((s) => s.includes("רווח גולמי נמוך"))).toBe(true);
  });

  it("flags branches with sharp YoY drop or critical stockout", () => {
    const out = detectCategoryAnomalies({
      totalSales: 1_000_000,
      totalTarget: 1_000_000,
      suppliers: [],
      branches: [
        { name: "A", yoy: -9, stockout: 2 },
        { name: "B", yoy: 1, stockout: 6 },
      ],
    });
    expect(out.some((s) => s.includes("A"))).toBe(true);
    expect(out.some((s) => s.includes("B"))).toBe(true);
  });
});

describe("detectChainAnomalies", () => {
  it("flags chain below 98% of target", () => {
    const out = detectChainAnomalies({
      totalSales: 970_000,
      totalTarget: 1_000_000,
      categories: [],
      suppliers: [],
      promotions: [],
    });
    expect(out[0]).toContain("הרשת");
  });

  it("flags low-ROI promotions", () => {
    const out = detectChainAnomalies({
      totalSales: 1_000_000,
      totalTarget: 1_000_000,
      categories: [],
      suppliers: [],
      promotions: [{ name: "P", roi: 1.0 }],
    });
    expect(out.some((s) => s.includes("P") && s.includes("ROI"))).toBe(true);
  });

  it("returns empty when everything is healthy", () => {
    const out = detectChainAnomalies({
      totalSales: 1_000_000,
      totalTarget: 1_000_000,
      categories: [
        {
          name: "c",
          sales: 100,
          targetSales: 100,
          stockoutRate: 2,
          grossMarginPercent: 25,
        },
      ],
      suppliers: [
        {
          name: "s",
          sales: 100,
          targetSales: 100,
          grossProfitPercent: 25,
        },
      ],
      promotions: [{ name: "p", roi: 3 }],
    });
    expect(out).toEqual([]);
  });
});
