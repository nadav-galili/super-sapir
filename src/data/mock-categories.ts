import { allBranches } from './mock-branches'
import type { DepartmentMetrics, Promotion } from './types'

export interface CategorySummary extends Omit<DepartmentMetrics, 'monthlyTrend' | 'promotions'> {
  branchCount: number
  bestBranch: string
  worstBranch: string
  avgMonthlyTrend: number[]
  allPromotions: Promotion[]
  branches: {
    name: string
    sales: number
    grossMarginPercent: number
    inventoryTurnover: number
    stockoutRate: number
    inventoryDays: number
    yoyChange: number
    targetSales: number
    lastYearSales: number
  }[]
}

export function getCategorySummaries(): CategorySummary[] {
  const deptMap = new Map<string, {
    sales: number
    targetSales: number
    lastYearSales: number
    yoyChanges: number[]
    margins: number[]
    turnovers: number[]
    stockouts: number[]
    inventoryDaysList: number[]
    monthlyTrends: number[][]
    promotions: Promotion[]
    branches: {
      name: string
      sales: number
      grossMarginPercent: number
      inventoryTurnover: number
      stockoutRate: number
      inventoryDays: number
      yoyChange: number
      targetSales: number
      lastYearSales: number
    }[]
  }>()

  for (const branch of allBranches) {
    for (const dept of branch.departments) {
      const existing = deptMap.get(dept.id) ?? {
        sales: 0, targetSales: 0, lastYearSales: 0,
        yoyChanges: [], margins: [], turnovers: [],
        stockouts: [], inventoryDaysList: [], monthlyTrends: [],
        promotions: [], branches: [],
      }
      existing.sales += dept.sales
      existing.targetSales += dept.targetSales
      existing.lastYearSales += dept.lastYearSales
      existing.yoyChanges.push(dept.yoyChange)
      existing.margins.push(dept.grossMarginPercent)
      existing.turnovers.push(dept.inventoryTurnover)
      existing.stockouts.push(dept.stockoutRate)
      existing.inventoryDaysList.push(dept.inventoryDays)
      existing.monthlyTrends.push(dept.monthlyTrend)
      existing.promotions.push(...dept.promotions)
      existing.branches.push({
        name: branch.name,
        sales: dept.sales,
        grossMarginPercent: dept.grossMarginPercent,
        inventoryTurnover: dept.inventoryTurnover,
        stockoutRate: dept.stockoutRate,
        inventoryDays: dept.inventoryDays,
        yoyChange: dept.yoyChange,
        targetSales: dept.targetSales,
        lastYearSales: dept.lastYearSales,
      })
      deptMap.set(dept.id, existing)
    }
  }

  const totalAllSales = Array.from(deptMap.values()).reduce((s, d) => s + d.sales, 0)

  return Array.from(deptMap.entries()).map(([id, data]) => {
    const sorted = [...data.branches].sort((a, b) => b.sales - a.sales)
    const avg = (arr: number[]) => +(arr.reduce((s, c) => s + c, 0) / arr.length).toFixed(1)

    const avgMonthlyTrend = Array.from({ length: 12 }, (_, i) =>
      data.monthlyTrends.reduce((sum, trend) => sum + (trend[i] ?? 0), 0)
    )

    const base = allBranches[0].departments.find(d => d.id === id)!

    return {
      id,
      name: base.name,
      sales: data.sales,
      sharePercent: +((data.sales / totalAllSales) * 100).toFixed(1),
      targetShare: base.targetShare,
      yoyChange: avg(data.yoyChanges),
      grossMarginPercent: avg(data.margins),
      inventoryTurnover: avg(data.turnovers),
      stockoutRate: avg(data.stockouts),
      inventoryDays: Math.round(data.inventoryDaysList.reduce((s, c) => s + c, 0) / data.inventoryDaysList.length),
      targetSales: data.targetSales,
      lastYearSales: data.lastYearSales,
      branchCount: data.branches.length,
      bestBranch: sorted[0].name,
      worstBranch: sorted[sorted.length - 1].name,
      avgMonthlyTrend,
      allPromotions: data.promotions.slice(0, 5),
      branches: sorted,
    }
  }).sort((a, b) => b.sales - a.sales)
}
