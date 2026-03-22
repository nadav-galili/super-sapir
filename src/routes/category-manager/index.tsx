import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { ComparisonToggle } from '@/components/dashboard/ComparisonToggle'
import { AlertsBar } from '@/components/dashboard/AlertsBar'
import { generateAlerts } from '@/lib/alerts'
import { CategoryBubbleChart } from '@/components/charts/CategoryBubbleChart'
import { CategoryTable } from '@/components/tables/CategoryTable'
import { getCategorySummaries } from '@/data/mock-categories'
import type { KPICardData, ComparisonMode } from '@/data/types'

function CategoryManagerPage() {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs-target')
  const { categories, alerts, totalSales, totalTarget, totalLastYear, avgMargin, avgTurnover } = useMemo(() => {
    const cats = getCategorySummaries()
    let sales = 0, target = 0, lastYear = 0, margin = 0, turnover = 0
    for (const c of cats) {
      sales += c.sales
      target += c.targetSales
      lastYear += c.lastYearSales
      margin += c.grossMarginPercent
      turnover += c.inventoryTurnover
    }
    const len = cats.length || 1
    return {
      categories: cats,
      alerts: generateAlerts(cats),
      totalSales: sales,
      totalTarget: target,
      totalLastYear: lastYear,
      avgMargin: +(margin / len).toFixed(1),
      avgTurnover: +(turnover / len).toFixed(1),
    }
  }, [])

  function getComparisonTrend(): { trend: number; label: string } {
    switch (comparisonMode) {
      case 'vs-target': {
        const pct = totalTarget > 0 ? ((totalSales - totalTarget) / totalTarget) * 100 : 0
        return { trend: +pct.toFixed(1), label: 'מול יעד' }
      }
      case 'vs-last-year': {
        const pct = totalLastYear > 0 ? ((totalSales - totalLastYear) / totalLastYear) * 100 : 0
        return { trend: +pct.toFixed(1), label: 'מול שנה קודמת' }
      }
      case 'vs-last-month':
        return { trend: -1.5, label: 'מול חודש קודם' }
    }
  }

  const comparison = getComparisonTrend()

  const kpis: KPICardData[] = [
    {
      label: 'סה"כ מכירות',
      value: totalSales,
      format: 'currencyShort',
      trend: comparison.trend,
      trendLabel: comparison.label,
      gradient: comparison.trend >= 0 ? 'green' : 'red',
    },
    {
      label: 'רווח גולמי ממוצע',
      value: avgMargin,
      format: 'percent',
      trend: 1.2,
      trendLabel: 'שנתי',
      gradient: 'purple',
    },
    {
      label: 'מחזור מלאי ממוצע',
      value: avgTurnover,
      format: 'number',
      trend: 0.8,
      trendLabel: 'שנתי',
      gradient: 'blue',
    },
    {
      label: 'התראות פעילות',
      value: alerts.length,
      format: 'number',
      trend: alerts.length > 3 ? -alerts.length : 0,
      trendLabel: alerts.length > 0 ? 'דורשות טיפול' : '',
      gradient: alerts.length > 3 ? 'red' : alerts.length > 0 ? 'orange' : 'green',
    },
  ]

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#2D3748]">מנהל קטגוריה</h1>
        <ComparisonToggle value={comparisonMode} onChange={setComparisonMode} />
      </div>
      <KPIGrid items={kpis} />
      <AlertsBar alerts={alerts} />
      <CategoryBubbleChart data={categories} />
      <CategoryTable data={categories} />
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager/')({
  component: CategoryManagerPage,
})
