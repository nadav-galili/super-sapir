import type { CategoryAlert } from '@/data/types'
import type { CategorySummary } from '@/data/mock-categories'

export function generateAlerts(categories: CategorySummary[]): CategoryAlert[] {
  const alerts: CategoryAlert[] = []

  for (const cat of categories) {
    const targetAchievement = cat.targetSales > 0 ? (cat.sales / cat.targetSales) * 100 : 100

    if (targetAchievement < 90) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'target-miss',
        severity: 'high',
        label: 'החטאת יעד',
        value: `${targetAchievement.toFixed(0)}% מהיעד`,
      })
    }
    if (cat.grossMarginPercent < 20) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'margin-erosion',
        severity: 'high',
        label: 'שחיקת רווחיות',
        value: `${cat.grossMarginPercent.toFixed(1)}% רווח גולמי`,
      })
    }
    if (cat.stockoutRate > 4) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'stockout-risk',
        severity: 'medium',
        label: 'סיכון חוסרים',
        value: `${cat.stockoutRate.toFixed(1)}% חוסרים`,
      })
    }
    if (cat.yoyChange < -5) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'declining-sales',
        severity: 'medium',
        label: 'ירידה במכירות',
        value: `${cat.yoyChange.toFixed(1)}% שנתי`,
      })
    }
    if (cat.inventoryTurnover < 8) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'low-turnover',
        severity: 'low',
        label: 'מחזור מלאי נמוך',
        value: `${cat.inventoryTurnover.toFixed(1)}x`,
      })
    }
  }

  const order = { high: 0, medium: 1, low: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 5)
}
