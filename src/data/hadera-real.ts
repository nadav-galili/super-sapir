// Complete real data from Hadera Branch #44 Management Report - November 2025
// Source: דוח ניהולי מסכם סניף חדרה לחודש 12/25

import { MONTHS_HE } from './constants'

export interface BranchFullReport {
  info: BranchInfo
  sales: SalesData
  targets: TargetData
  operations: OperationsData
  compliance: ComplianceData
  hr: HRData
  departments: DepartmentSales[]
  monthly: MonthlyDetail[]
  expenses: ExpenseItem[]
}

export interface BranchInfo {
  branchNumber: number
  name: string
  manager: string
  divisionManager: string
  grade: string
  sellingArea: number // sqm, no warehouse
  revenuePerMeter: number
}

export interface SalesData {
  network: { current: number; lastYear: number; target: number; monthlyAvg2025: number; ranking: number; yoyChange: number; vsTarget: number }
  total: { current: number; lastYear: number; target: number; monthlyAvg2025: number; yoyChange: number; vsTarget: number }
  avgBasket: { current: number; change: number; ranking: number }
  customers: { current: number; target: number; change: number; ranking: number }
  revenuePerMeter: { ranking: number; change: number }
}

export interface TargetData {
  revenueToStore: number
  salaryCostTarget: number
  qualityTarget: number
}

export interface OperationsData {
  qualityScore: { current: number; target: number; ranking: number }
  freshQualityScore: { current: number }
  supplyRate: { current: number; shopperPercent: number; ranking: number }
  avgDaysOfInventory: { current: number; target: number }
  meatWaste: number
  fishWaste: number
  customerComplaints: { current: number; target: number }
  focusReports: { current: number; target: number }
  shopperUsage: { superSapir: number; shufersal: number }
  annualWaste: { amount: number; percent: number; prev2024: number; prev2023: number }
}

export interface ComplianceData {
  highInventory: { target: number; actual: number; met: boolean; ranking: number }
  missingActivities: { fixedTarget: number; timeTarget: number; actual: number; deviation: number; met: boolean; ranking: number }
  returns: { target: number; advancePercent: number; timeTarget: number; actual: number; met: boolean; ranking: number }
  redAlerts: { target: number; actual: number; redSubscriptions: number; rate: number; met: boolean; ranking: number }
}

export interface HRData {
  authorized: number
  actual: number
  salaryCostPercent: number
  salaryTarget: number
  productivityRanking: number
  turnoverRate: number
  turnoverRanking: number
  recruitmentTotal: number
  placementCompanyPercent: number
  staffing: StaffingRow[]
  salaryExpense: { current: number; monthlyAvg2025: number; monthlyAvg2024: number }
  salaryPercentOfRevenue: { current: number; target: number; threeYearAvg: number[] }
}

export interface StaffingRow {
  role: string
  authorized: number
  actual: number
  gap: number
}

export interface DepartmentSales {
  id: string
  name: string
  category: 'fresh' | 'food' | 'nonfood'
  currentMonth: number
  yearToDate: number
  yoyChangePercent: number
  sharePercent: number
  targetSharePercent: number
  shareChangePercent: number
  avgDaysOfInventory: number
}

export interface MonthlyDetail {
  month: string
  monthNum: number
  currentSales: number
  lastYearSales: number
  yoyChange: number
  businessDaysImpact: number
  salaryCostPercent: number
  supplyRate: number
  shopperUsage: number
  qualityScore: number
  freshQualityScore: number
  focusReports: number
  customerComplaints: number
  meatWastePercent: number
}

export interface ExpenseItem {
  name: string
  currentMonth: number
  monthlyAvg2025: number
  monthlyAvg2024: number
  percentOfRevenue: number
}

// ============================================================
// REAL DATA FROM PDF
// ============================================================

export const haderaFullReport: BranchFullReport = {
  info: {
    branchNumber: 44,
    name: 'חדרה',
    manager: 'יוסי כהן',
    divisionManager: 'אבי לוי',
    grade: 'A',
    sellingArea: 3080,
    revenuePerMeter: 5090,
  },

  sales: {
    network: {
      current: 9_903_162,
      lastYear: 9_356_118,
      target: 9_920_000,
      monthlyAvg2025: 9_804_904,
      ranking: 25,
      yoyChange: 5.8,
      vsTarget: -0.2,
    },
    total: {
      current: 9_903_162,
      lastYear: 9_356_118,
      target: 9_920_000,
      monthlyAvg2025: 9_804_904,
      yoyChange: 5.8,
      vsTarget: -0.2,
    },
    avgBasket: { current: 257, change: 8.2, ranking: 13 },
    customers: { current: 38_643, target: 37_506, change: -5.0, ranking: 35 },
    revenuePerMeter: { ranking: 52, change: -41.5 },
  },

  targets: {
    revenueToStore: 3_217,
    salaryCostTarget: 7.5,
    qualityTarget: 85,
  },

  operations: {
    qualityScore: { current: 70, target: 85, ranking: 45 },
    freshQualityScore: { current: 88 },
    supplyRate: { current: 96, shopperPercent: 89, ranking: 8 },
    avgDaysOfInventory: { current: 16, target: 14 },
    meatWaste: 7.1,
    fishWaste: 0,
    customerComplaints: { current: 2, target: 2 },
    focusReports: { current: 5, target: 10 },
    shopperUsage: { superSapir: 35.1, shufersal: 17.4 },
    annualWaste: { amount: 850_479, percent: 0.47, prev2024: 467_181, prev2023: 845_198 },
  },

  compliance: {
    highInventory: { target: 60, actual: 67, met: false, ranking: 35 },
    missingActivities: { fixedTarget: 120, timeTarget: 131, actual: 125, deviation: 13.4, met: false, ranking: 25 },
    returns: { target: 100, advancePercent: 90, timeTarget: 90, actual: 100, met: true, ranking: 1 },
    redAlerts: { target: 40, actual: 44, redSubscriptions: 24, rate: 13.0, met: false, ranking: 53 },
  },

  hr: {
    authorized: 98,
    actual: 104,
    salaryCostPercent: 8.4,
    salaryTarget: 7.5,
    productivityRanking: 54,
    turnoverRate: 81.6,
    turnoverRanking: 30,
    recruitmentTotal: 85,
    placementCompanyPercent: 20,
    salaryExpense: { current: 831_947, monthlyAvg2025: 813_971, monthlyAvg2024: 760_722 },
    salaryPercentOfRevenue: { current: 8.4, target: 7.5, threeYearAvg: [8.4, 7.6, 7.4] },
    staffing: [
      { role: 'צוות ניהולי', authorized: 5, actual: 4.7, gap: -0.3 },
      { role: 'סגן מנהל', authorized: 3, actual: 3.4, gap: 0.4 },
      { role: 'בשר ועוף טרי', authorized: 5, actual: 4.6, gap: -0.4 },
      { role: 'גבינות מעדניה', authorized: 4, actual: 3.0, gap: -1.0 },
      { role: 'ירקות', authorized: 9, actual: 11.5, gap: 2.5 },
      { role: 'מחסן', authorized: 8, actual: 9.2, gap: 1.2 },
      { role: 'ניקיון', authorized: 4, actual: 5.6, gap: 1.6 },
      { role: 'עגלות', authorized: 2, actual: 2.5, gap: 0.5 },
      { role: 'חלב', authorized: 5, actual: 6.7, gap: 1.7 },
      { role: 'סדרנות', authorized: 26, actual: 29.4, gap: 3.4 },
      { role: 'קופה/ית', authorized: 12, actual: 11.0, gap: -1.0 },
      { role: 'קופה ראשית', authorized: 3, actual: 3.2, gap: 0.2 },
      { role: 'קו קופות ושופר', authorized: 4, actual: 3.9, gap: -0.1 },
      { role: 'קופות עגישות', authorized: 3, actual: 1.8, gap: -1.2 },
      { role: 'שמירה', authorized: 2, actual: 2.6, gap: 0.6 },
      { role: 'פיצוחים', authorized: 2, actual: 0, gap: -2.0 },
      { role: 'קבצ', authorized: 1, actual: 1.1, gap: 0.1 },
    ],
  },

  departments: [
    // טרי (Fresh) — lower inventory days (perishable)
    { id: 'vegetables', name: 'ירקות', category: 'fresh', currentMonth: 1_445_717, yearToDate: 1_505_767, yoyChangePercent: 4.2, sharePercent: 15.4, targetSharePercent: 16.0, shareChangePercent: -1.3, avgDaysOfInventory: 4 },
    { id: 'fresh-meat', name: 'בשר טרי', category: 'fresh', currentMonth: 229_475, yearToDate: 180_313, yoyChangePercent: -21.4, sharePercent: 2.4, targetSharePercent: 2.7, shareChangePercent: -25.6, avgDaysOfInventory: 3 },
    { id: 'fresh-fish', name: 'דגים טריים', category: 'fresh', currentMonth: 71_680, yearToDate: 77_330, yoyChangePercent: 7.9, sharePercent: 0.8, targetSharePercent: 0.8, shareChangePercent: 2.2, avgDaysOfInventory: 2 },
    { id: 'deli', name: 'גבינת מעדניה', category: 'fresh', currentMonth: 138_891, yearToDate: 129_129, yoyChangePercent: -7.0, sharePercent: 1.5, targetSharePercent: 1.5, shareChangePercent: -11.9, avgDaysOfInventory: 5 },
    { id: 'pastries', name: 'מאפים', category: 'fresh', currentMonth: 139_603, yearToDate: 142_634, yoyChangePercent: 2.2, sharePercent: 1.5, targetSharePercent: 1.5, shareChangePercent: -3.2, avgDaysOfInventory: 2 },
    // מזון (Food) — mid-range
    { id: 'bread', name: 'לחם ומאפים', category: 'food', currentMonth: 204_117, yearToDate: 233_962, yoyChangePercent: 14.6, sharePercent: 2.2, targetSharePercent: 2.4, shareChangePercent: 8.6, avgDaysOfInventory: 3 },
    { id: 'grocery', name: 'מכולת', category: 'food', currentMonth: 2_026_339, yearToDate: 2_103_981, yoyChangePercent: 3.8, sharePercent: 21.6, targetSharePercent: 21.3, shareChangePercent: -1.6, avgDaysOfInventory: 18 },
    { id: 'drinks', name: 'שתיה', category: 'food', currentMonth: 878_077, yearToDate: 939_201, yoyChangePercent: 7.0, sharePercent: 9.4, targetSharePercent: 9.5, shareChangePercent: 1.3, avgDaysOfInventory: 21 },
    { id: 'frozen', name: 'קפואים', category: 'food', currentMonth: 856_002, yearToDate: 870_403, yoyChangePercent: 1.7, sharePercent: 9.1, targetSharePercent: 8.8, shareChangePercent: -3.7, avgDaysOfInventory: 25 },
    { id: 'dairy', name: 'מוצרי חלב', category: 'food', currentMonth: 1_325_976, yearToDate: 1_479_980, yoyChangePercent: 11.6, sharePercent: 14.1, targetSharePercent: 14.9, shareChangePercent: 5.7, avgDaysOfInventory: 8 },
    { id: 'organic', name: 'אורגני ובריאות', category: 'food', currentMonth: 84_806, yearToDate: 87_485, yoyChangePercent: 3.2, sharePercent: 0.9, targetSharePercent: 0.9, shareChangePercent: -2.3, avgDaysOfInventory: 15 },
    // נון-פוד (Non-Food) — higher inventory days
    { id: 'home-products', name: 'נון-פוד', category: 'nonfood', currentMonth: 962_978, yearToDate: 1_007_346, yoyChangePercent: 4.6, sharePercent: 10.3, targetSharePercent: 10.2, shareChangePercent: -0.9, avgDaysOfInventory: 28 },
    { id: 'household', name: 'מוצרים לבית', category: 'nonfood', currentMonth: 330_683, yearToDate: 537_273, yoyChangePercent: 62.5, sharePercent: 3.5, targetSharePercent: 5.4, shareChangePercent: 53.9, avgDaysOfInventory: 32 },
    { id: 'baby', name: 'תינוקות', category: 'nonfood', currentMonth: 163_196, yearToDate: 198_797, yoyChangePercent: 21.8, sharePercent: 1.7, targetSharePercent: 2.0, shareChangePercent: 15.4, avgDaysOfInventory: 30 },
  ],

  monthly: [
    { month: MONTHS_HE[0], monthNum: 1, currentSales: 9_069_933, lastYearSales: 9_940_043, yoyChange: -8.8, businessDaysImpact: 1.5, salaryCostPercent: 8.4, supplyRate: 90, shopperUsage: 25, qualityScore: 82, freshQualityScore: 99, focusReports: 8, customerComplaints: 4, meatWastePercent: 3.1 },
    { month: MONTHS_HE[1], monthNum: 2, currentSales: 8_178_761, lastYearSales: 9_246_983, yoyChange: -11.6, businessDaysImpact: -5.5, salaryCostPercent: 9.1, supplyRate: 91, shopperUsage: 29, qualityScore: 82, freshQualityScore: 100, focusReports: 17, customerComplaints: 2, meatWastePercent: 2.5 },
    { month: MONTHS_HE[2], monthNum: 3, currentSales: 9_389_274, lastYearSales: 9_068_076, yoyChange: 3.5, businessDaysImpact: 4.0, salaryCostPercent: 8.8, supplyRate: 91, shopperUsage: 30, qualityScore: 65, freshQualityScore: 59, focusReports: 9, customerComplaints: 1, meatWastePercent: 10.3 },
    { month: MONTHS_HE[3], monthNum: 4, currentSales: 11_168_947, lastYearSales: 11_476_140, yoyChange: -2.7, businessDaysImpact: 4.0, salaryCostPercent: 7.4, supplyRate: 90, shopperUsage: 32, qualityScore: 76, freshQualityScore: 100, focusReports: 9, customerComplaints: 2, meatWastePercent: 4.2 },
    { month: MONTHS_HE[4], monthNum: 5, currentSales: 10_109_075, lastYearSales: 10_975_714, yoyChange: -7.9, businessDaysImpact: -5.0, salaryCostPercent: 7.9, supplyRate: 92, shopperUsage: 33, qualityScore: 74, freshQualityScore: 99, focusReports: 12, customerComplaints: 0, meatWastePercent: 5.4 },
    { month: MONTHS_HE[5], monthNum: 6, currentSales: 9_606_749, lastYearSales: 9_630_847, yoyChange: -0.3, businessDaysImpact: 3.0, salaryCostPercent: 8.8, supplyRate: 93, shopperUsage: 35, qualityScore: 75, freshQualityScore: 100, focusReports: 4, customerComplaints: 2, meatWastePercent: 5.3 },
    { month: MONTHS_HE[6], monthNum: 7, currentSales: 10_143_356, lastYearSales: 10_227_348, yoyChange: -0.8, businessDaysImpact: 3.0, salaryCostPercent: 8.1, supplyRate: 95, shopperUsage: 35, qualityScore: 73, freshQualityScore: 68, focusReports: 5, customerComplaints: 3, meatWastePercent: 4.4 },
    { month: MONTHS_HE[7], monthNum: 8, currentSales: 9_850_473, lastYearSales: 10_160_752, yoyChange: -3.1, businessDaysImpact: -3.0, salaryCostPercent: 8.3, supplyRate: 94, shopperUsage: 35, qualityScore: 70, freshQualityScore: 100, focusReports: 8, customerComplaints: 5, meatWastePercent: 4.9 },
    { month: MONTHS_HE[8], monthNum: 9, currentSales: 11_241_167, lastYearSales: 11_199_542, yoyChange: 0.4, businessDaysImpact: -4.0, salaryCostPercent: 7.6, supplyRate: 96, shopperUsage: 35, qualityScore: 82, freshQualityScore: 97, focusReports: 1, customerComplaints: 1, meatWastePercent: 0.0 },
    { month: MONTHS_HE[9], monthNum: 10, currentSales: 10_135_494, lastYearSales: 9_784_099, yoyChange: 3.6, businessDaysImpact: -1.0, salaryCostPercent: 8.5, supplyRate: 96, shopperUsage: 35, qualityScore: 85, freshQualityScore: 100, focusReports: 6, customerComplaints: 1, meatWastePercent: 9.5 },
    { month: MONTHS_HE[10], monthNum: 11, currentSales: 8_862_436, lastYearSales: 9_000_718, yoyChange: -1.5, businessDaysImpact: -0.5, salaryCostPercent: 8.8, supplyRate: 95, shopperUsage: 35, qualityScore: 90, freshQualityScore: 101, focusReports: 3, customerComplaints: 6, meatWastePercent: 0.0 },
    { month: MONTHS_HE[11], monthNum: 12, currentSales: 9_903_162, lastYearSales: 9_356_118, yoyChange: 5.8, businessDaysImpact: 3.0, salaryCostPercent: 8.4, supplyRate: 96, shopperUsage: 35, qualityScore: 70, freshQualityScore: 88, focusReports: 5, customerComplaints: 2, meatWastePercent: 7.1 },
  ],

  expenses: [
    { name: 'שכר', currentMonth: 831_947, monthlyAvg2025: 813_971, monthlyAvg2024: 742_000, percentOfRevenue: 5.6 },
    { name: 'שכ״ד, ארנונה וניהול', currentMonth: 532_000, monthlyAvg2025: 532_000, monthlyAvg2024: 506_867, percentOfRevenue: 3.6 },
    { name: 'חשמל', currentMonth: 72_609, monthlyAvg2025: 90_449, monthlyAvg2024: 44_273, percentOfRevenue: 0.6 },
    { name: 'שונות', currentMonth: 40_728, monthlyAvg2025: 46_489, monthlyAvg2024: 40_728, percentOfRevenue: 0.3 },
    { name: 'אחזקה', currentMonth: 27_163, monthlyAvg2025: 25_522, monthlyAvg2024: 27_163, percentOfRevenue: 0.2 },
    { name: 'נלוות לשכר', currentMonth: 12_386, monthlyAvg2025: 12_386, monthlyAvg2024: 12_386, percentOfRevenue: 0.2 },
    { name: 'שמירה', currentMonth: 7_122, monthlyAvg2025: 9_712, monthlyAvg2024: 7_122, percentOfRevenue: 0.1 },
  ],
}
