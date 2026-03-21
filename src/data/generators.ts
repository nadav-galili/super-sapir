import type { Branch, BranchMetrics, DepartmentMetrics, MonthlyTrend } from './types'
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

function generateDepartments(totalSales: number): DepartmentMetrics[] {
  return haderaBranch.departments.map(dept => ({
    ...dept,
    sales: Math.round(totalSales * (dept.sharePercent / 100) * (0.85 + Math.random() * 0.3)),
    yoyChange: +(dept.yoyChange + (Math.random() * 6 - 3)).toFixed(1),
  }))
}

function generateMonthlyTrends(totalSales: number): MonthlyTrend[] {
  const baseMonthly = totalSales / 12
  const seasonality = [0.85, 0.82, 0.95, 1.02, 1.05, 1.08, 1.0, 0.98, 1.15, 1.02, 0.95, 1.13]
  return MONTHS_HE.map((month, i) => {
    const total = Math.round(baseMonthly * seasonality[i] * (0.95 + Math.random() * 0.1))
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
