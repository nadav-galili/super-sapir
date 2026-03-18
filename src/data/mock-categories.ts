import { allBranches } from './mock-branches'
import type { DepartmentMetrics } from './types'

export interface CategorySummary extends DepartmentMetrics {
  branchCount: number
  bestBranch: string
  worstBranch: string
}

export function getCategorySummaries(): CategorySummary[] {
  const deptMap = new Map<string, { sales: number; yoyChanges: number[]; branches: { name: string; sales: number }[] }>()

  for (const branch of allBranches) {
    for (const dept of branch.departments) {
      const existing = deptMap.get(dept.id) ?? { sales: 0, yoyChanges: [], branches: [] }
      existing.sales += dept.sales
      existing.yoyChanges.push(dept.yoyChange)
      existing.branches.push({ name: branch.name, sales: dept.sales })
      deptMap.set(dept.id, existing)
    }
  }

  const totalAllSales = Array.from(deptMap.values()).reduce((s, d) => s + d.sales, 0)

  return Array.from(deptMap.entries()).map(([id, data]) => {
    const sorted = [...data.branches].sort((a, b) => b.sales - a.sales)
    const avgYoy = +(data.yoyChanges.reduce((s, c) => s + c, 0) / data.yoyChanges.length).toFixed(1)
    const base = allBranches[0].departments.find(d => d.id === id)!
    return {
      id,
      name: base.name,
      sales: data.sales,
      sharePercent: +((data.sales / totalAllSales) * 100).toFixed(1),
      targetShare: base.targetShare,
      yoyChange: avgYoy,
      isPrivateLabel: base.isPrivateLabel,
      branchCount: data.branches.length,
      bestBranch: sorted[0].name,
      worstBranch: sorted[sorted.length - 1].name,
    }
  }).sort((a, b) => b.sales - a.sales)
}
