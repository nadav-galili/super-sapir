// Branch generator — parametric.
//
// `generateBranch()` now takes an explicit template object (baseSeed +
// per-branch identity fields + a deterministic `seed` number) instead of
// having an implicit dependency on Hadera. The baseSeed defaults to
// HADERA_BRANCH_SEED for convenience, but callers can swap in any Branch.
//
// All randomness flows through `src/data/rng.ts` so calling
// `generateBranch(t)` twice with the same template produces the same
// output (determinism + snapshot-stable mock data).
import type {
  Branch,
  BranchMetrics,
  DepartmentMetrics,
  MonthlyTrend,
  Promotion,
} from "./types";
import { HADERA_BRANCH_SEED } from "./hadera-seed";
import { MONTHS_HE } from "./constants";
import { seededValue, seededInt as rngSeededInt } from "./rng";

export interface GenerateBranchTemplate {
  id: string;
  name: string;
  branchNumber: number;
  regionId: string;
  lat: number;
  lng: number;
  /** Per-branch deterministic seed. Same seed + same baseSeed → same output. */
  seed: number;
  scale?: number;
  format?: "big" | "city";
  /** Seed template to inflate (defaults to Hadera). */
  baseSeed?: Branch;
}

function rand(seed: number, offset: number): number {
  return seededValue(seed, offset);
}

function variance(
  seed: number,
  offset: number,
  base: number,
  pct: number
): number {
  return Math.round(base * (1 + (rand(seed, offset) * 2 - 1) * pct));
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function generateMetrics(
  seed: number,
  base: BranchMetrics,
  scale: number
): BranchMetrics {
  const totalSales = variance(seed, 1, base.totalSales * scale, 0.15);
  return {
    totalSales,
    networkSales: totalSales,
    avgBasket: variance(seed, 2, base.avgBasket, 0.2),
    customersPerDay: variance(seed, 3, base.customersPerDay * scale, 0.15),
    qualityScore: clamp(variance(seed, 4, base.qualityScore, 0.15), 40, 95),
    salaryCostPercent: +(
      base.salaryCostPercent +
      (rand(seed, 5) * 3 - 1.5)
    ).toFixed(1),
    supplyRate: clamp(variance(seed, 6, base.supplyRate, 0.05), 80, 99),
    meatWastePercent: +(
      base.meatWastePercent +
      (rand(seed, 7) * 2 - 1)
    ).toFixed(1),
    complaints: variance(seed, 8, base.complaints, 0.5),
    staffingGaps: Math.round(rand(seed, 9) * 6),
    overtimeHours: variance(seed, 10, base.overtimeHours, 0.3),
    turnoverRate: clamp(variance(seed, 11, base.turnoverRate, 0.3), 5, 30),
    totalEmployees: variance(seed, 12, base.totalEmployees * scale, 0.1),
    yoyGrowth: +(rand(seed, 13) * 12 - 3).toFixed(1),
  };
}

const SEASONALITY = [
  0.85, 0.82, 0.95, 1.02, 1.05, 1.08, 1.0, 0.98, 1.15, 1.02, 0.95, 1.13,
];

function generateDeptMonthlyTrend(seed: number, annualSales: number): number[] {
  const baseMonthly = annualSales / 12;
  return SEASONALITY.map((s, i) =>
    Math.round(baseMonthly * s * (0.92 + rand(seed, 100 + i) * 0.16))
  );
}

function generatePromotions(seed: number, categoryName: string): Promotion[] {
  const promoTypes = [
    "1+1",
    "שני ב-50%",
    "הנחה 30%",
    "חבילה משפחתית",
    "סוף שבוע",
  ];
  const count = 2 + Math.floor(rand(seed, 200) * 2); // 2-3
  return Array.from({ length: count }, (_, i) => {
    const off = 210 + i * 10;
    const baselineSales = Math.round(50_000 + rand(seed, off) * 200_000);
    const uplift = +(10 + rand(seed, off + 1) * 40).toFixed(1);
    const actualSales = Math.round(baselineSales * (1 + uplift / 100));
    const tradeSpend = Math.round(
      baselineSales * (0.03 + rand(seed, off + 2) * 0.07)
    );
    const profit = (actualSales - baselineSales) * 0.25 - tradeSpend;
    const roi = tradeSpend > 0 ? +(profit / tradeSpend + 1).toFixed(1) : 0;
    const monthIdx = Math.max(0, 10 - i * 2);
    const startDay = 1 + Math.floor(rand(seed, off + 3) * 14);
    const endDay = startDay + 10 + Math.floor(rand(seed, off + 4) * 7);
    return {
      name: `מבצע ${promoTypes[Math.floor(rand(seed, off + 5) * promoTypes.length)]} ${categoryName}`,
      period: `${startDay}-${endDay} ${MONTHS_HE[monthIdx]} 2025`,
      baselineSales,
      actualSales,
      upliftPercent: uplift,
      roi,
      hasCannibalization: rand(seed, off + 6) > 0.6,
    };
  });
}

function generateDepartments(
  seed: number,
  base: Branch,
  totalSales: number
): DepartmentMetrics[] {
  return base.departments.map((dept, di) => {
    const off = 300 + di * 20;
    const sales = Math.round(
      totalSales * (dept.sharePercent / 100) * (0.85 + rand(seed, off) * 0.3)
    );
    const yoyChange = +(dept.yoyChange + (rand(seed, off + 1) * 6 - 3)).toFixed(
      1
    );
    const divisor = 1 + yoyChange / 100;
    const lastYearSales = divisor > 0.01 ? Math.round(sales / divisor) : sales;
    const targetSales =
      dept.sharePercent > 0
        ? Math.round(sales * (dept.targetShare / dept.sharePercent))
        : sales;

    return {
      id: dept.id,
      name: dept.name,
      sharePercent: dept.sharePercent,
      targetShare: dept.targetShare,
      sales,
      yoyChange,
      grossMarginPercent: +(
        dept.grossMarginPercent +
        (rand(seed, off + 2) * 6 - 3)
      ).toFixed(1),
      inventoryTurnover: +(
        dept.inventoryTurnover *
        (0.8 + rand(seed, off + 3) * 0.4)
      ).toFixed(1),
      stockoutRate: +Math.max(
        0,
        dept.stockoutRate + (rand(seed, off + 4) * 2 - 1)
      ).toFixed(1),
      inventoryDays: Math.max(
        1,
        Math.round(dept.inventoryDays * (0.8 + rand(seed, off + 5) * 0.4))
      ),
      targetSales,
      lastYearSales,
      monthlyTrend: generateDeptMonthlyTrend(seed + di * 7, sales),
      promotions: generatePromotions(seed + di * 11, dept.name),
    };
  });
}

function generateMonthlyTrends(
  seed: number,
  totalSales: number
): MonthlyTrend[] {
  const baseMonthly = totalSales / 12;
  return MONTHS_HE.map((month, i) => {
    const total = Math.round(
      baseMonthly * SEASONALITY[i] * (0.95 + rand(seed, 600 + i) * 0.1)
    );
    return {
      month,
      monthNum: i + 1,
      totalSales: total,
      networkSales: total,
      customers: Math.round(
        (total / 37_000) * (0.9 + rand(seed, 620 + i) * 0.2)
      ),
      avgBasket: rngSeededInt(seed, 640 + i, 30_000, 45_000),
    };
  });
}

export function generateBranch(template: GenerateBranchTemplate): Branch {
  const {
    id,
    name,
    branchNumber,
    regionId,
    lat,
    lng,
    seed,
    scale = 1,
    format = "city",
    baseSeed = HADERA_BRANCH_SEED,
  } = template;

  const metrics = generateMetrics(seed, baseSeed.metrics, scale);
  return {
    id,
    name,
    branchNumber,
    regionId,
    format,
    lat,
    lng,
    metrics,
    departments: generateDepartments(seed, baseSeed, metrics.totalSales),
    monthlyTrends: generateMonthlyTrends(seed, metrics.totalSales),
  };
}
