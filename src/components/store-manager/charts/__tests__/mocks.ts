// Shared mock data used by the chart component tests. Not a fixture
// of real data — each value is chosen so tests can assert on unique
// strings appearing in the rendered SSR output.
import type {
  BranchFullReport,
  DepartmentSales,
  MonthlyDetail,
} from "@/data/hadera-real";
import type { AnomalyResult } from "@/lib/ai";

export const mockMonthly: MonthlyDetail[] = Array.from(
  { length: 12 },
  (_, i) => ({
    month: `${i + 1}`,
    monthNum: i + 1,
    currentSales: 1_000_000 + i * 10_000,
    lastYearSales: 900_000 + i * 10_000,
    yoyChange: 5,
    businessDaysImpact: 0,
    salaryCostPercent: 8,
    supplyRate: 90,
    shopperUsage: 30,
    qualityScore: 80,
    freshQualityScore: 85,
    focusReports: 4,
    customerComplaints: 2,
    meatWastePercent: 3,
  })
);

export const mockDepartments: DepartmentSales[] = [
  {
    id: "grocery",
    name: "מכולת-MOCK",
    category: "food",
    currentMonth: 500_000,
    yearToDate: 6_000_000,
    yoyChangePercent: 5.2,
    sharePercent: 22,
    targetSharePercent: 20,
    shareChangePercent: 2,
    avgDaysOfInventory: 12,
  },
  {
    id: "dairy",
    name: "חלב-MOCK",
    category: "food",
    currentMonth: 300_000,
    yearToDate: 3_800_000,
    yoyChangePercent: -8.1,
    sharePercent: 14,
    targetSharePercent: 15,
    shareChangePercent: -1,
    avgDaysOfInventory: 8,
  },
  {
    id: "vegetables",
    name: "ירקות-MOCK",
    category: "fresh",
    currentMonth: 220_000,
    yearToDate: 2_700_000,
    yoyChangePercent: 3.4,
    sharePercent: 10,
    targetSharePercent: 9,
    shareChangePercent: 1,
    avgDaysOfInventory: 3,
  },
];

export const mockHr: BranchFullReport["hr"] = {
  authorized: 90,
  actual: 84,
  salaryCostPercent: 8.4,
  salaryTarget: 7.5,
  productivityRanking: 21,
  turnoverRate: 77,
  turnoverRanking: 12,
  recruitmentTotal: 45,
  placementCompanyPercent: 18,
  salaryExpense: {
    current: 750_000,
    monthlyAvg2025: 720_000,
    monthlyAvg2024: 700_000,
  },
  salaryPercentOfRevenue: {
    current: 8.4,
    target: 7.5,
    threeYearAvg: [8.4, 7.8, 7.5],
  },
  staffing: [
    { role: "צוות ניהולי-MOCK", authorized: 5, actual: 4, gap: -1 },
    { role: "ירקות-MOCK", authorized: 8, actual: 9, gap: 1 },
  ],
};

export const mockCompliance: BranchFullReport["compliance"] = {
  highInventory: { target: 60, actual: 55, met: true, ranking: 20 },
  missingActivities: {
    fixedTarget: 120,
    timeTarget: 131,
    actual: 110,
    deviation: 10,
    met: true,
    ranking: 18,
  },
  returns: {
    target: 100,
    advancePercent: 90,
    timeTarget: 90,
    actual: 98,
    met: true,
    ranking: 12,
  },
  redAlerts: {
    target: 40,
    actual: 35,
    redSubscriptions: 22,
    rate: 12,
    met: true,
    ranking: 28,
  },
};

export const mockExpenses: BranchFullReport["expenses"] = [
  {
    name: "שכר-MOCK",
    currentMonth: 700_000,
    monthlyAvg2025: 680_000,
    monthlyAvg2024: 650_000,
    percentOfRevenue: 8.4,
  },
  {
    name: "שכירות-MOCK",
    currentMonth: 250_000,
    monthlyAvg2025: 245_000,
    monthlyAvg2024: 240_000,
    percentOfRevenue: 3.5,
  },
];

export const mockReport: BranchFullReport = {
  info: {
    branchNumber: 99,
    name: "סניף-MOCK",
    manager: "מנהל-MOCK",
    divisionManager: "אגף-MOCK",
    grade: "A",
    sellingArea: 3000,
    revenuePerMeter: 3500,
  },
  sales: {
    network: {
      current: 10_500_000,
      lastYear: 10_000_000,
      target: 11_000_000,
      monthlyAvg2025: 10_500_000,
      ranking: 25,
      yoyChange: 5,
      vsTarget: 0,
    },
    total: {
      current: 10_500_000,
      lastYear: 10_000_000,
      target: 11_000_000,
      monthlyAvg2025: 10_500_000,
      yoyChange: 5,
      vsTarget: 0,
    },
    avgBasket: { current: 140, change: 3.2, ranking: 14 },
    customers: { current: 75_000, target: 80_000, change: 1.5, ranking: 20 },
    revenuePerMeter: { ranking: 20, change: 2.1 },
  },
  targets: { revenueToStore: 3000, salaryCostTarget: 7.5, qualityTarget: 85 },
  operations: {
    qualityScore: { current: 85, target: 85, ranking: 12 },
    freshQualityScore: { current: 92 },
    supplyRate: { current: 91, shopperPercent: 88, ranking: 10 },
    avgDaysOfInventory: { current: 14, target: 14 },
    meatWaste: 3,
    fishWaste: 0,
    customerComplaints: { current: 3, target: 5 },
    focusReports: { current: 4, target: 10 },
    shopperUsage: { superSapir: 33, shufersal: 18 },
    annualWaste: {
      amount: 40_000,
      percent: 0.4,
      prev2024: 30_000,
      prev2023: 50_000,
    },
  },
  compliance: mockCompliance,
  hr: mockHr,
  departments: mockDepartments,
  monthly: mockMonthly,
  expenses: mockExpenses,
};

export const mockAnomalies: AnomalyResult[] = [
  {
    departmentId: "dairy",
    departmentName: "חלב-MOCK",
    deviation: -13.1,
    severity: "warning",
    tooltipText: "חלב-MOCK anomaly",
  },
];
