import type { CategorySummary } from '@/data/mock-categories'
import type { ComparisonMode } from '@/data/types'

export interface CategorySnapshot {
  category: CategorySummary
  comparisonChange: number
  comparisonLabel: string
  targetAchievement: number
  shareGap: number
  grossProfit: number
  avgPromoRoi: number
  avgPromoUplift: number
  weakBranchCount: number
  branchSpread: number
  topBranchName: string
  weakestBranchName: string
  stockoutExposure: number
  downsideEstimate: number
  upsideEstimate: number
  dangerScore: number
  opportunityScore: number
  focusAction: string
  status: 'danger' | 'opportunity' | 'monitor'
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function getComparisonLabel(mode: ComparisonMode): string {
  switch (mode) {
    case 'vs-target':
      return 'מול יעד'
    case 'vs-last-year':
      return 'מול שנה קודמת'
    case 'vs-last-month':
      return 'מול חודש קודם'
  }
}

export function getCategoryComparison(category: CategorySummary, mode: ComparisonMode): number {
  switch (mode) {
    case 'vs-target':
      return category.targetSales > 0
        ? ((category.sales - category.targetSales) / category.targetSales) * 100
        : 0
    case 'vs-last-year':
      return category.lastYearSales > 0
        ? ((category.sales - category.lastYearSales) / category.lastYearSales) * 100
        : 0
    case 'vs-last-month': {
      const lastMonth = category.avgMonthlyTrend[11] ?? 0
      const previousMonth = category.avgMonthlyTrend[10] ?? 0
      return previousMonth > 0
        ? ((lastMonth - previousMonth) / previousMonth) * 100
        : 0
    }
  }
}

function getFocusAction(category: CategorySummary, shareGap: number, avgPromoRoi: number): string {
  if (category.stockoutRate >= 4) return 'לייצב זמינות בסניפים חלשים'
  if (category.grossMarginPercent < 20) return 'לבחון מחיר, הנחה ותמהיל'
  if (category.inventoryTurnover < 8) return 'לצמצם מלאי איטי'
  if (shareGap < 0) return 'להרחיב נתח מדף והפצה'
  if (avgPromoRoi >= 1.8) return 'להרחיב מבצע מנצח'
  return 'לשכפל ביצוע מסניף מוביל'
}

export function deriveCategorySnapshots(
  categories: CategorySummary[],
  comparisonMode: ComparisonMode,
): CategorySnapshot[] {
  const comparisonLabel = getComparisonLabel(comparisonMode)

  return categories.map((category) => {
    const comparisonChange = getCategoryComparison(category, comparisonMode)
    const targetAchievement = category.targetSales > 0 ? (category.sales / category.targetSales) * 100 : 100
    const shareGap = +(category.sharePercent - category.targetShare).toFixed(1)
    const grossProfit = category.sales * (category.grossMarginPercent / 100)
    const avgPromoRoi = +average(category.allPromotions.map((promo) => promo.roi)).toFixed(2)
    const avgPromoUplift = +average(category.allPromotions.map((promo) => promo.upliftPercent)).toFixed(1)

    const branchPerformance = category.branches.map((branch) => ({
      ...branch,
      targetAchievement: branch.targetSales > 0 ? (branch.sales / branch.targetSales) * 100 : 100,
    }))
    const sortedBranches = [...branchPerformance].sort((a, b) => b.targetAchievement - a.targetAchievement)
    const strongestBranch = sortedBranches[0]
    const weakestBranch = sortedBranches[sortedBranches.length - 1]
    const weakBranchCount = branchPerformance.filter(
      (branch) => branch.targetAchievement < 90 || branch.stockoutRate > 4 || branch.yoyChange < -5,
    ).length
    const branchSpread = strongestBranch && weakestBranch
      ? +(strongestBranch.targetAchievement - weakestBranch.targetAchievement).toFixed(1)
      : 0

    const stockoutExposure = category.sales * (category.stockoutRate / 100) * 0.65
    const marginPressure = category.grossMarginPercent < 20
      ? category.sales * ((20 - category.grossMarginPercent) / 100) * 0.6
      : 0
    const turnoverPressure = category.inventoryTurnover < 8
      ? category.sales * ((8 - category.inventoryTurnover) / 8) * 0.06
      : 0
    const downsideEstimate = Math.max(0, category.targetSales - category.sales) + stockoutExposure + marginPressure + turnoverPressure

    const whitespaceUpside = shareGap < 0 ? category.sales * (Math.abs(shareGap) / 100) * 0.45 : 0
    const promoUpside = avgPromoRoi > 1.2 ? category.sales * Math.min(avgPromoRoi - 1.2, 1.6) * 0.015 : 0
    const upsideEstimate = Math.max(0, category.targetSales - category.sales) * 0.7 + whitespaceUpside + promoUpside

    const dangerScore = (
      Math.max(0, -comparisonChange) * 2
      + Math.max(0, 20 - category.grossMarginPercent) * 3
      + category.stockoutRate * 2.5
      + Math.max(0, 8 - category.inventoryTurnover) * 2
      + weakBranchCount * 1.5
    )
    const opportunityScore = (
      Math.max(0, comparisonChange) * 1.4
      + Math.max(0, category.grossMarginPercent - 22) * 2
      + Math.max(0, -shareGap) * 2.5
      + Math.max(0, avgPromoRoi - 1.1) * 8
      + Math.max(0, 4 - category.stockoutRate) * 1.5
    )

    const status = dangerScore >= opportunityScore && dangerScore >= 24
      ? 'danger'
      : opportunityScore >= 22
        ? 'opportunity'
        : 'monitor'

    return {
      category,
      comparisonChange: +comparisonChange.toFixed(1),
      comparisonLabel,
      targetAchievement: +targetAchievement.toFixed(1),
      shareGap,
      grossProfit: Math.round(grossProfit),
      avgPromoRoi,
      avgPromoUplift,
      weakBranchCount,
      branchSpread,
      topBranchName: strongestBranch?.name ?? category.bestBranch,
      weakestBranchName: weakestBranch?.name ?? category.worstBranch,
      stockoutExposure: Math.round(stockoutExposure),
      downsideEstimate: Math.round(downsideEstimate),
      upsideEstimate: Math.round(upsideEstimate),
      dangerScore: +dangerScore.toFixed(1),
      opportunityScore: +opportunityScore.toFixed(1),
      focusAction: getFocusAction(category, shareGap, avgPromoRoi),
      status,
    }
  })
}
