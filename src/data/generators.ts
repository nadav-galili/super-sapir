import type { Branch, BranchMetrics, DepartmentMetrics, MonthlyTrend, Promotion } from './types'
import { haderaBranch } from './hadera-branch'
import { MONTHS_HE } from './constants'

function randomVariance(base: number, pct: number): number {
  return Math.round(base * (1 + (Math.random() * 2 - 1) * pct))
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function generateMetrics(scale: number): BranchMetrics {
  const base = haderaBranch.metrics
  const totalSales = randomVariance(base.totalSales * scale, 0.15)
  return {
    totalSales,
    networkSales: totalSales,
    avgBasket: randomVariance(base.avgBasket, 0.2),
    customersPerDay: randomVariance(base.customersPerDay * scale, 0.15),
    qualityScore: clamp(randomVariance(base.qualityScore, 0.15), 40, 95),
    salaryCostPercent: +(base.salaryCostPercent + (Math.random() * 3 - 1.5)).toFixed(1),
    supplyRate: clamp(randomVariance(base.supplyRate, 0.05), 80, 99),
    meatWastePercent: +(base.meatWastePercent + (Math.random() * 2 - 1)).toFixed(1),
    complaints: randomVariance(base.complaints, 0.5),
    staffingGaps: Math.round(Math.random() * 6),
    overtimeHours: randomVariance(base.overtimeHours, 0.3),
    turnoverRate: clamp(randomVariance(base.turnoverRate, 0.3), 5, 30),
    totalEmployees: randomVariance(base.totalEmployees * scale, 0.1),
    yoyGrowth: +((Math.random() * 12 - 3).toFixed(1)),
  }
}

const SEASONALITY = [0.85, 0.82, 0.95, 1.02, 1.05, 1.08, 1.0, 0.98, 1.15, 1.02, 0.95, 1.13]

function generateDeptMonthlyTrend(annualSales: number): number[] {
  const baseMonthly = annualSales / 12
  return SEASONALITY.map(s => Math.round(baseMonthly * s * (0.92 + Math.random() * 0.16)))
}

function generatePromotions(categoryName: string): Promotion[] {
  const promoTypes = ['1+1', 'שני ב-50%', 'הנחה 30%', 'חבילה משפחתית', 'סוף שבוע']
  const count = 2 + Math.floor(Math.random() * 2) // 2-3
  return Array.from({ length: count }, (_, i) => {
    const baselineSales = Math.round(50_000 + Math.random() * 200_000)
    const uplift = +(10 + Math.random() * 40).toFixed(1)
    const actualSales = Math.round(baselineSales * (1 + uplift / 100))
    const tradeSpend = Math.round(baselineSales * (0.03 + Math.random() * 0.07))
    const profit = (actualSales - baselineSales) * 0.25 - tradeSpend
    const roi = Math.round((profit / tradeSpend) * 100)
    const monthIdx = Math.max(0, 10 - i * 2)
    const startDay = 1 + Math.floor(Math.random() * 14)
    const endDay = startDay + 10 + Math.floor(Math.random() * 7)
    return {
      name: `מבצע ${promoTypes[Math.floor(Math.random() * promoTypes.length)]} ${categoryName}`,
      period: `${startDay}-${endDay} ${MONTHS_HE[monthIdx]} 2025`,
      baselineSales,
      actualSales,
      upliftPercent: uplift,
      roi,
      hasCannibalization: Math.random() > 0.6,
    }
  })
}

function generateDepartments(totalSales: number): DepartmentMetrics[] {
  return haderaBranch.departments.map(dept => {
    const sales = Math.round(totalSales * (dept.sharePercent / 100) * (0.85 + Math.random() * 0.3))
    const yoyChange = +(dept.yoyChange + (Math.random() * 6 - 3)).toFixed(1)
    const lastYearSales = Math.round(sales / (1 + yoyChange / 100))
    const targetSales = Math.round(sales * (dept.targetShare / dept.sharePercent))

    return {
      id: dept.id,
      name: dept.name,
      sharePercent: dept.sharePercent,
      targetShare: dept.targetShare,
      sales,
      yoyChange,
      grossMarginPercent: +(dept.grossMarginPercent + (Math.random() * 6 - 3)).toFixed(1),
      inventoryTurnover: +(dept.inventoryTurnover * (0.8 + Math.random() * 0.4)).toFixed(1),
      stockoutRate: +Math.max(0, dept.stockoutRate + (Math.random() * 2 - 1)).toFixed(1),
      inventoryDays: Math.max(1, Math.round(dept.inventoryDays * (0.8 + Math.random() * 0.4))),
      targetSales,
      lastYearSales,
      monthlyTrend: generateDeptMonthlyTrend(sales),
      promotions: generatePromotions(dept.name),
    }
  })
}

function generateMonthlyTrends(totalSales: number): MonthlyTrend[] {
  const baseMonthly = totalSales / 12
  return MONTHS_HE.map((month, i) => {
    const total = Math.round(baseMonthly * SEASONALITY[i] * (0.95 + Math.random() * 0.1))
    return {
      month,
      monthNum: i + 1,
      totalSales: total,
      networkSales: total,
      customers: Math.round((total / 37_000) * (0.9 + Math.random() * 0.2)),
      avgBasket: randomVariance(37_506, 0.15),
    }
  })
}

export function generateBranch(
  id: string,
  name: string,
  branchNumber: number,
  regionId: string,
  lat: number,
  lng: number,
  scale = 1
): Branch {
  const metrics = generateMetrics(scale)
  return {
    id,
    name,
    branchNumber,
    regionId,
    lat,
    lng,
    metrics,
    departments: generateDepartments(metrics.totalSales),
    monthlyTrends: generateMonthlyTrends(metrics.totalSales),
  }
}
