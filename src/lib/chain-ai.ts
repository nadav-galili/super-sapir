import { allBranches } from '@/data/mock-branches'
import { getCategorySummaries } from '@/data/mock-categories'
import { getTopSuppliers } from '@/data/mock-suppliers'
import { getChainPromotions } from '@/data/mock-chain-promotions'
import { formatCurrencyShort } from '@/lib/format'
import type { CategoryInsightRow } from '@/lib/category-ai'

export type ChainInsightRow = CategoryInsightRow

export interface ChainAIResult {
  rows: ChainInsightRow[]
}

export function buildChainPromptPayload() {
  // ── Chain-level KPIs ──
  const branchCount = allBranches.length
  const totalSales = allBranches.reduce((s, b) => s + b.metrics.totalSales, 0)
  const totalTarget = allBranches.reduce((s, b) => {
    return s + b.departments.reduce((ds, d) => ds + d.targetSales, 0)
  }, 0)
  const targetPct = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 100
  const avgGrossMargin = +(
    allBranches.reduce((s, b) => {
      const deptSalesTotal = b.departments.reduce((ds, d) => ds + d.sales, 0)
      return s + (deptSalesTotal > 0
        ? b.departments.reduce((ds, d) => ds + d.grossMarginPercent * d.sales, 0) / deptSalesTotal
        : 0)
    }, 0) / branchCount
  ).toFixed(1)
  const avgSupplyRate = +(allBranches.reduce((s, b) => s + b.metrics.supplyRate, 0) / branchCount).toFixed(1)
  const avgQuality = +(allBranches.reduce((s, b) => s + b.metrics.qualityScore, 0) / branchCount).toFixed(0)

  // ── Categories ──
  const categories = getCategorySummaries()
  const categorySummary = categories.slice(0, 10).map(c => ({
    name: c.name,
    sales: formatCurrencyShort(c.sales),
    share: `${c.sharePercent}%`,
    yoyChange: `${c.yoyChange > 0 ? '+' : ''}${c.yoyChange}%`,
    grossMargin: `${c.grossMarginPercent}%`,
    stockoutRate: `${c.stockoutRate}%`,
    targetAchievement: c.targetSales > 0 ? `${((c.sales / c.targetSales) * 100).toFixed(1)}%` : 'N/A',
  }))

  // ── Suppliers ──
  const suppliers = getTopSuppliers()
  const supplierSummary = suppliers.slice(0, 12).map(s => ({
    name: s.name,
    sales: formatCurrencyShort(s.sales),
    targetAchievement: s.targetSales > 0 ? `${((s.sales / s.targetSales) * 100).toFixed(1)}%` : 'N/A',
    grossProfit: `${s.grossProfitPercent}%`,
  }))

  // ── Promotions ──
  const promotions = getChainPromotions()
  const promoSummary = promotions.map(p => ({
    name: p.name,
    type: p.promoType,
    sales: formatCurrencyShort(p.sales),
    uplift: `${p.upliftPercent}%`,
    roi: p.roi.toFixed(1),
    daysRemaining: p.daysRemaining,
  }))

  // ── Anomalies ──
  const anomalies: string[] = []

  if (targetPct < 98) {
    anomalies.push(`הרשת עומדת על ${targetPct.toFixed(1)}% מהיעד — פער של ${formatCurrencyShort(totalTarget - totalSales)}`)
  }

  for (const c of categories) {
    const cPct = c.targetSales > 0 ? (c.sales / c.targetSales) * 100 : 100
    if (cPct < 90) anomalies.push(`קטגוריית ${c.name} מתחת ליעד (${cPct.toFixed(0)}% בלבד)`)
    if (c.stockoutRate > 4) anomalies.push(`קטגוריית ${c.name} — חוסרים גבוהים (${c.stockoutRate}%)`)
    if (c.grossMarginPercent < 18) anomalies.push(`קטגוריית ${c.name} — רווח גולמי נמוך (${c.grossMarginPercent}%)`)
  }

  for (const s of suppliers) {
    const sPct = s.targetSales > 0 ? (s.sales / s.targetSales) * 100 : 100
    if (sPct < 88) anomalies.push(`ספק ${s.name} מתחת ליעד (${sPct.toFixed(0)}%)`)
    if (s.grossProfitPercent < 20) anomalies.push(`ספק ${s.name} — רווח גולמי נמוך (${s.grossProfitPercent}%)`)
  }

  for (const p of promotions) {
    if (p.roi < 1.5) anomalies.push(`מבצע "${p.name}" — ROI נמוך (${p.roi.toFixed(1)})`)
  }

  return {
    chainSummary: {
      branchCount,
      totalSales: formatCurrencyShort(totalSales),
      totalTarget: formatCurrencyShort(totalTarget),
      targetAchievement: `${targetPct.toFixed(1)}%`,
      avgGrossMargin: `${avgGrossMargin}%`,
      avgSupplyRate: `${avgSupplyRate}%`,
      avgQualityScore: avgQuality,
    },
    categories: categorySummary,
    suppliers: supplierSummary,
    promotions: promoSummary,
    anomalies,
  }
}
