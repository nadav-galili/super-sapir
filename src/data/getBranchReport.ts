// Single boundary to fetch the rich `BranchFullReport` shape for any
// branch id. For Hadera it returns the curated real report verbatim.
// For synthetic branches it inflates the flat `Branch` shape using
// deterministic seeded random values.
//
// This replaces the implicit `branchToFullReport` adapter that used to
// live inside the store-manager route component.
import type { Branch } from "./types";
import { haderaFullReport, type BranchFullReport } from "./hadera-real";
import { allBranches, getBranch } from "./mock-branches";
import { WORKING_DAYS_PER_MONTH } from "./constants";
import { seededBool, seededFloat, seededInt } from "./rng";

export const HADERA_BRANCH_ID = "hadera-44";

// Hebrew name pools used to produce stable mock manager / division
// manager names for synthetic branches.
const MOCK_FIRST_NAMES = [
  "דני",
  "רונן",
  "שירה",
  "נועה",
  "עמית",
  "אורן",
  "מיכל",
  "תמר",
  "אלון",
  "יעל",
  "גלעד",
  "ליאור",
];
const MOCK_LAST_NAMES = [
  "פרץ",
  "מזרחי",
  "אברהם",
  "דוד",
  "ביטון",
  "שלום",
  "חדד",
  "עמר",
  "נחום",
  "אוחיון",
  "ברק",
  "סויסה",
];
const MOCK_DIV_FIRST = [
  "רונית",
  "אייל",
  "חנה",
  "משה",
  "דנה",
  "עידו",
  "סיגל",
  "בועז",
  "קרן",
  "אסף",
  "הדר",
  "נדב",
];
const MOCK_DIV_LAST = [
  "גולן",
  "שפירא",
  "יוסף",
  "רוזן",
  "קפלן",
  "אלוני",
  "הררי",
  "טל",
  "ניסים",
  "בן דוד",
  "זמיר",
  "עוז",
];

function pickName(arr: readonly string[], seed: number, coeff: number): string {
  const i = Math.abs(Math.round(Math.sin(seed * coeff) * 1000)) % arr.length;
  return arr[i];
}

function mockManagerName(seed: number): string {
  return `${pickName(MOCK_FIRST_NAMES, seed, 5.731)} ${pickName(MOCK_LAST_NAMES, seed, 3.917)}`;
}

function mockDivisionManagerName(seed: number): string {
  return `${pickName(MOCK_DIV_FIRST, seed, 7.213)} ${pickName(MOCK_DIV_LAST, seed, 2.549)}`;
}

function branchReportSeed(branch: Branch): number {
  // Stable seed per branch: same (branchNumber, id) always produces the
  // same inflated report. This mirrors the scheme used by the adapter
  // that previously lived inside the route.
  return branch.branchNumber * 1000 + branch.id.length * 37;
}

/**
 * Inflate a generic `Branch` into the full `BranchFullReport` shape using
 * deterministic seeded random values. Pure.
 */
export function inflateBranchReport(branch: Branch): BranchFullReport {
  const m = branch.metrics;
  const seed = branchReportSeed(branch);

  return {
    info: {
      branchNumber: branch.branchNumber,
      name: branch.name,
      manager: mockManagerName(seed),
      divisionManager: mockDivisionManagerName(seed),
      grade: m.qualityScore >= 80 ? "A" : m.qualityScore >= 60 ? "B" : "C",
      sellingArea: seededInt(seed, 1, 2500, 4000),
      revenuePerMeter: Math.round(m.totalSales / 3000),
    },
    sales: {
      network: {
        current: m.networkSales,
        lastYear: Math.round(m.networkSales * 0.95),
        target: Math.round(m.networkSales * 1.05),
        monthlyAvg2025: m.networkSales,
        ranking: seededInt(seed, 2, 20, 50),
        yoyChange: m.yoyGrowth,
        vsTarget: +(m.yoyGrowth - 5).toFixed(1),
      },
      total: {
        current: m.totalSales,
        lastYear: Math.round(m.totalSales * 0.97),
        target: Math.round(m.totalSales * 1.05),
        monthlyAvg2025: m.totalSales,
        yoyChange: m.yoyGrowth,
        vsTarget: +(m.yoyGrowth - 5).toFixed(1),
      },
      avgBasket: {
        current: Math.round(
          m.totalSales / (m.customersPerDay * WORKING_DAYS_PER_MONTH)
        ),
        change: seededFloat(seed, 6, -2, 8),
        ranking: seededInt(seed, 7, 8, 24),
      },
      customers: {
        current: m.customersPerDay * WORKING_DAYS_PER_MONTH,
        target: m.customersPerDay * 25,
        change: seededFloat(seed, 8, -3, 5),
        ranking: seededInt(seed, 9, 18, 34),
      },
      revenuePerMeter: {
        ranking: seededInt(seed, 10, 18, 42),
        change: seededFloat(seed, 11, -8, 4),
      },
    },
    targets: { revenueToStore: 3000, salaryCostTarget: 7.5, qualityTarget: 85 },
    operations: {
      qualityScore: {
        current: m.qualityScore,
        target: 85,
        ranking: seededInt(seed, 12, 30, 50),
      },
      freshQualityScore: { current: seededInt(seed, 13, 85, 100) },
      supplyRate: { current: m.supplyRate, shopperPercent: 88, ranking: 10 },
      avgDaysOfInventory: { current: seededInt(seed, 50, 10, 22), target: 14 },
      meatWaste: m.meatWastePercent,
      fishWaste: 0,
      customerComplaints: { current: m.complaints, target: 5 },
      focusReports: { current: 4, target: 10 },
      shopperUsage: { superSapir: 33, shufersal: 18 },
      annualWaste: {
        amount: Math.round(m.totalSales * 0.004),
        percent: 0.4,
        prev2024: Math.round(m.totalSales * 0.003),
        prev2023: Math.round(m.totalSales * 0.005),
      },
    },
    compliance: {
      highInventory: {
        target: 60,
        actual: seededInt(seed, 14, 55, 75),
        met: seededBool(seed, 15),
        ranking: seededInt(seed, 16, 20, 50),
      },
      missingActivities: {
        fixedTarget: 120,
        timeTarget: 131,
        actual: seededInt(seed, 17, 110, 140),
        deviation: seededInt(seed, 18, 8, 18),
        met: seededBool(seed, 19),
        ranking: seededInt(seed, 20, 15, 45),
      },
      returns: {
        target: 100,
        advancePercent: 90,
        timeTarget: 90,
        actual: seededInt(seed, 21, 95, 105),
        met: seededBool(seed, 22, 0.4),
        ranking: seededInt(seed, 23, 1, 41),
      },
      redAlerts: {
        target: 40,
        actual: seededInt(seed, 24, 30, 50),
        redSubscriptions: seededInt(seed, 25, 15, 30),
        rate: seededInt(seed, 26, 10, 15),
        met: seededBool(seed, 27),
        ranking: seededInt(seed, 28, 20, 55),
      },
    },
    hr: {
      authorized: m.totalEmployees - seededInt(seed, 29, 0, 8),
      actual: m.totalEmployees,
      salaryCostPercent: m.salaryCostPercent,
      salaryTarget: 7.5,
      productivityRanking: seededInt(seed, 30, 30, 55),
      turnoverRate: seededInt(seed, 31, 60, 90),
      turnoverRanking: seededInt(seed, 32, 20, 45),
      recruitmentTotal: seededInt(seed, 33, 50, 90),
      placementCompanyPercent: seededInt(seed, 34, 15, 25),
      salaryExpense: {
        current: Math.round((m.totalSales * m.salaryCostPercent) / 100),
        monthlyAvg2025: Math.round(m.totalSales * 0.08),
        monthlyAvg2024: Math.round(m.totalSales * 0.075),
      },
      salaryPercentOfRevenue: {
        current: m.salaryCostPercent,
        target: 7.5,
        threeYearAvg: [m.salaryCostPercent, 7.8, 7.5],
      },
      staffing: [
        { role: "צוות ניהולי", authorized: 5, actual: 4.5, gap: -0.5 },
        { role: "ירקות", authorized: 8, actual: 9, gap: 1 },
        { role: "מחסן", authorized: 7, actual: 8, gap: 1 },
        { role: "סדרנות", authorized: 20, actual: 22, gap: 2 },
        { role: "קופה/ית", authorized: 10, actual: 9, gap: -1 },
      ],
    },
    departments: branch.departments.map((d, i) => {
      const cat = (
        ["vegetables", "fresh-meat", "fresh-fish", "deli", "pastries"].includes(
          d.id
        )
          ? "fresh"
          : [
                "grocery",
                "bread",
                "drinks",
                "frozen",
                "dairy",
                "organic",
              ].includes(d.id)
            ? "food"
            : "nonfood"
      ) as "fresh" | "food" | "nonfood";
      const daysBase = cat === "fresh" ? 3 : cat === "food" ? 14 : 25;
      return {
        id: d.id,
        name: d.name,
        category: cat,
        currentMonth: d.sales,
        yearToDate: Math.round(d.sales * 1.05),
        yoyChangePercent: d.yoyChange,
        sharePercent: d.sharePercent,
        targetSharePercent: d.targetShare,
        shareChangePercent: +(d.sharePercent - d.targetShare).toFixed(1),
        avgDaysOfInventory: seededInt(
          seed,
          60 + i,
          Math.max(1, daysBase - 4),
          daysBase + 8
        ),
      };
    }),
    monthly: branch.monthlyTrends.map((t) => ({
      month: t.month,
      monthNum: t.monthNum,
      currentSales: t.totalSales,
      lastYearSales: Math.round(t.totalSales * 0.97),
      yoyChange: seededFloat(seed + t.monthNum, 35, -4, 8),
      businessDaysImpact: seededFloat(seed + t.monthNum, 36, -3, 3),
      salaryCostPercent: seededFloat(seed + t.monthNum, 37, 7, 9.5),
      supplyRate: seededInt(seed + t.monthNum, 38, 88, 96),
      shopperUsage: seededInt(seed + t.monthNum, 39, 25, 35),
      qualityScore: seededInt(seed + t.monthNum, 40, 60, 90),
      freshQualityScore: seededInt(seed + t.monthNum, 41, 70, 100),
      focusReports: seededInt(seed + t.monthNum, 42, 0, 15),
      customerComplaints: seededInt(seed + t.monthNum, 43, 0, 6),
      meatWastePercent: seededFloat(seed + t.monthNum, 44, 0, 8),
    })),
    expenses: [
      {
        name: "שכר",
        currentMonth: Math.round((m.totalSales * m.salaryCostPercent) / 100),
        monthlyAvg2025: Math.round(m.totalSales * 0.08),
        monthlyAvg2024: Math.round(m.totalSales * 0.075),
        percentOfRevenue: m.salaryCostPercent,
      },
      {
        name: "שכר דירה, אריזה",
        currentMonth: Math.round(m.totalSales * 0.035),
        monthlyAvg2025: Math.round(m.totalSales * 0.035),
        monthlyAvg2024: Math.round(m.totalSales * 0.033),
        percentOfRevenue: 3.5,
      },
      {
        name: "חשמל",
        currentMonth: Math.round(m.totalSales * 0.006),
        monthlyAvg2025: Math.round(m.totalSales * 0.006),
        monthlyAvg2024: Math.round(m.totalSales * 0.006),
        percentOfRevenue: 0.6,
      },
      {
        name: "שמירה",
        currentMonth: Math.round(m.totalSales * 0.003),
        monthlyAvg2025: Math.round(m.totalSales * 0.003),
        monthlyAvg2024: Math.round(m.totalSales * 0.003),
        percentOfRevenue: 0.3,
      },
    ],
  };
}

/**
 * Single boundary for obtaining a full report for any branch id.
 * Hadera returns the curated real report verbatim; synthetic branches
 * are inflated on demand. Returns `null` if the id is unknown.
 */
export function getBranchReport(branchId: string): BranchFullReport | null {
  if (branchId === HADERA_BRANCH_ID) return haderaFullReport;
  const branch = getBranch(branchId);
  if (!branch) return null;
  return inflateBranchReport(branch);
}

/** Convenience: the first branch (Hadera) as a guaranteed fallback. */
export function getBranchReportOrFallback(branchId: string): BranchFullReport {
  return getBranchReport(branchId) ?? inflateBranchReport(allBranches[0]);
}
