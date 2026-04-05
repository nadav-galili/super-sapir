import { allBranches } from '@/data/mock-branches'
import { getCategorySuppliers } from '@/data/mock-category-suppliers'
import { DEPARTMENT_NAMES } from '@/data/constants'
import { formatCurrencyShort } from '@/lib/format'
import type { BriefingItem, Recommendation } from '@/lib/ai'

export type { BriefingItem, Recommendation }

export interface CategoryAIResult {
  briefing: BriefingItem[]
  recommendations: Recommendation[]
}

export function buildCategoryPromptPayload(categoryId: string) {
  const categoryName = DEPARTMENT_NAMES[categoryId] ?? categoryId

  // Aggregate category data across branches
  const branchData: { name: string; sales: number; target: number; yoy: number; stockout: number; margin: number }[] = []

  for (const branch of allBranches) {
    const dept = branch.departments.find(d => d.id === categoryId)
    if (!dept) continue
    branchData.push({
      name: branch.name,
      sales: dept.sales,
      target: dept.targetSales,
      yoy: dept.yoyChange,
      stockout: dept.stockoutRate,
      margin: dept.grossMarginPercent,
    })
  }

  const totalSales = branchData.reduce((s, b) => s + b.sales, 0)
  const totalTarget = branchData.reduce((s, b) => s + b.target, 0)
  const avgMargin = branchData.length > 0
    ? +(branchData.reduce((s, b) => s + b.margin, 0) / branchData.length).toFixed(1)
    : 0
  const avgStockout = branchData.length > 0
    ? +(branchData.reduce((s, b) => s + b.stockout, 0) / branchData.length).toFixed(1)
    : 0

  // Supplier data
  const suppliers = getCategorySuppliers(categoryId)
  const supplierSummary = suppliers.map(s => ({
    name: s.name,
    sales: formatCurrencyShort(s.sales),
    targetAchievement: s.targetSales > 0 ? `${((s.sales / s.targetSales) * 100).toFixed(1)}%` : 'N/A',
    grossProfit: `${s.grossProfitPercent}%`,
    stockoutRate: `${s.stockoutRate}%`,
    productCount: s.productCount,
  }))

  // Detect anomalies for the prompt
  const anomalies: string[] = []

  const targetPct = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 100
  if (targetPct < 95) {
    anomalies.push(`הקטגוריה עומדת על ${targetPct.toFixed(1)}% מהיעד — פער של ${formatCurrencyShort(totalTarget - totalSales)}`)
  }

  for (const s of suppliers) {
    const sPct = s.targetSales > 0 ? (s.sales / s.targetSales) * 100 : 100
    if (sPct < 90) anomalies.push(`ספק ${s.name} מפספס יעד (${sPct.toFixed(0)}% בלבד)`)
    if (s.stockoutRate > 4) anomalies.push(`ספק ${s.name} — שיעור חוסרים גבוה (${s.stockoutRate}%)`)
    if (s.grossProfitPercent < 18) anomalies.push(`ספק ${s.name} — רווח גולמי נמוך (${s.grossProfitPercent}%)`)
  }

  for (const b of branchData) {
    if (b.yoy < -8) anomalies.push(`סניף ${b.name} — ירידה חדה של ${Math.abs(b.yoy).toFixed(1)}% שנתי`)
    if (b.stockout > 5) anomalies.push(`סניף ${b.name} — חוסרים קריטיים (${b.stockout}%)`)
  }

  return {
    category: categoryName,
    categoryId,
    summary: {
      totalSales: formatCurrencyShort(totalSales),
      totalTarget: formatCurrencyShort(totalTarget),
      targetAchievement: `${targetPct.toFixed(1)}%`,
      avgGrossMargin: `${avgMargin}%`,
      avgStockout: `${avgStockout}%`,
      branchCount: branchData.length,
      supplierCount: suppliers.length,
    },
    suppliers: supplierSummary,
    branchPerformance: branchData.map(b => ({
      name: b.name,
      sales: formatCurrencyShort(b.sales),
      yoy: `${b.yoy > 0 ? '+' : ''}${b.yoy}%`,
      stockout: `${b.stockout}%`,
    })),
    anomalies,
  }
}
