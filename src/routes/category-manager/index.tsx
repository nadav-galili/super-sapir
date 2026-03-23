import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, ShieldAlert, Store } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { ComparisonToggle } from '@/components/dashboard/ComparisonToggle'
import { CategoryActionPanel } from '@/components/dashboard/CategoryActionPanel'
import { CategoryPriorityMatrix } from '@/components/charts/CategoryPriorityMatrix'
import { CategoryTable } from '@/components/tables/CategoryTable'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCategorySummaries } from '@/data/mock-categories'
import type { KPICardData, ComparisonMode } from '@/data/types'
import { deriveCategorySnapshots, getComparisonLabel } from '@/lib/category-manager'
import { formatCurrencyShort } from '@/lib/format'

function CategoryManagerPage() {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs-target')
  const {
    snapshots,
    totalSales,
    totalTarget,
    totalLastYear,
    weightedMargin,
    weightedTargetAchievement,
    avgShareGap,
    totalStockoutExposure,
    weightedStockoutRate,
    avgPromoRoi,
    avgPromoUplift,
    dangerCount,
    dangerSalesShare,
  } = useMemo(() => {
    const cats = getCategorySummaries()
    const derivedSnapshots = deriveCategorySnapshots(cats, comparisonMode)
    const sales = cats.reduce((sum, category) => sum + category.sales, 0)
    const target = cats.reduce((sum, category) => sum + category.targetSales, 0)
    const lastYear = cats.reduce((sum, category) => sum + category.lastYearSales, 0)
    const grossProfit = derivedSnapshots.reduce((sum, snapshot) => sum + snapshot.grossProfit, 0)
    const stockoutExposure = derivedSnapshots.reduce((sum, snapshot) => sum + snapshot.stockoutExposure, 0)
    const dangerSales = derivedSnapshots
      .filter((snapshot) => snapshot.status === 'danger')
      .reduce((sum, snapshot) => sum + snapshot.category.sales, 0)

    return {
      snapshots: derivedSnapshots,
      totalSales: sales,
      totalTarget: target,
      totalLastYear: lastYear,
      weightedMargin: sales > 0 ? +((grossProfit / sales) * 100).toFixed(1) : 0,
      weightedTargetAchievement: target > 0 ? +((sales / target) * 100).toFixed(1) : 0,
      avgShareGap: derivedSnapshots.length > 0
        ? +(derivedSnapshots.reduce((sum, snapshot) => sum + snapshot.shareGap, 0) / derivedSnapshots.length).toFixed(1)
        : 0,
      totalStockoutExposure: Math.round(stockoutExposure),
      weightedStockoutRate: sales > 0 ? +((stockoutExposure / sales) * 100).toFixed(1) : 0,
      avgPromoRoi: derivedSnapshots.length > 0
        ? +(derivedSnapshots.reduce((sum, snapshot) => sum + snapshot.avgPromoRoi, 0) / derivedSnapshots.length).toFixed(2)
        : 0,
      avgPromoUplift: derivedSnapshots.length > 0
        ? +(derivedSnapshots.reduce((sum, snapshot) => sum + snapshot.avgPromoUplift, 0) / derivedSnapshots.length).toFixed(1)
        : 0,
      dangerCount: derivedSnapshots.filter((snapshot) => snapshot.status === 'danger').length,
      dangerSalesShare: sales > 0 ? +((dangerSales / sales) * 100).toFixed(1) : 0,
    }
  }, [comparisonMode])

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
      case 'vs-last-month': {
        const lastMonth = snapshots.reduce((sum, snapshot) => sum + (snapshot.category.avgMonthlyTrend[11] ?? 0), 0)
        const prevMonth = snapshots.reduce((sum, snapshot) => sum + (snapshot.category.avgMonthlyTrend[10] ?? 0), 0)
        const pct = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0
        return { trend: +pct.toFixed(1), label: 'מול חודש קודם' }
      }
    }
  }

  const comparison = getComparisonTrend()
  const topDangerItems = [...snapshots].sort((a, b) => b.downsideEstimate - a.downsideEstimate).slice(0, 4)
  const topOpportunityItems = [...snapshots].sort((a, b) => b.upsideEstimate - a.upsideEstimate).slice(0, 4)
  const topDanger = topDangerItems[0]
  const topOpportunity = topOpportunityItems[0]

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
      label: 'עמידה משוקללת ביעד',
      value: weightedTargetAchievement,
      format: 'percent',
      trend: comparison.trend,
      trendLabel: getComparisonLabel(comparisonMode),
      gradient: weightedTargetAchievement >= 100 ? 'green' : 'orange',
    },
    {
      label: 'רווח גולמי משוקלל',
      value: weightedMargin,
      format: 'percent',
      trend: avgShareGap,
      trendLabel: 'פער נתח',
      gradient: weightedMargin >= 20 ? 'purple' : 'red',
    },
    {
      label: 'פדיון בסיכון מחוסרים',
      value: totalStockoutExposure,
      format: 'currencyShort',
      trend: -weightedStockoutRate,
      trendLabel: 'חוסרים משוקלל',
      gradient: weightedStockoutRate > 2 ? 'red' : 'orange',
    },
    {
      label: 'ROI מבצעים ממוצע',
      value: avgPromoRoi,
      format: 'number',
      trend: avgPromoUplift,
      trendLabel: 'uplift',
      gradient: avgPromoRoi >= 1.7 ? 'green' : 'blue',
    },
    {
      label: 'קטגוריות לטיפול',
      value: dangerCount,
      format: 'number',
      trend: -dangerSalesShare,
      trendLabel: 'נתח מכירות בסיכון',
      gradient: dangerCount > 0 ? 'red' : 'green',
    },
  ]

  return (
    <PageContainer>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">מנהל קטגוריה</h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            לוח פעולה לזיהוי מהיר של קטגוריות בסיכון, הזדמנויות צמיחה ופערי ביצוע בין סניפים
          </p>
        </div>
        <ComparisonToggle value={comparisonMode} onChange={setComparisonMode} />
      </div>

      <Card className="overflow-hidden border-[#FFE8DE] bg-white">
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1.1fr_0.8fr]">
          <div className="rounded-[16px] bg-[#DC4E59]/6 p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#DC4E59]" />
              <p className="text-sm font-semibold text-[#2D3748]">הסיכון המרכזי</p>
            </div>
            <p className="mt-3 text-lg font-semibold text-[#2D3748]">{topDanger?.category.name}</p>
            <p className="mt-1 text-sm text-[#4A5568]">
              {topDanger
                ? `${topDanger.weakBranchCount} סניפים חלשים וחשיפה של ${formatCurrencyShort(topDanger.downsideEstimate)}`
                : 'אין קטגוריה חריגה כרגע'}
            </p>
            {topDanger && <p className="mt-2 text-xs text-[#A0AEC0]">{topDanger.focusAction}</p>}
          </div>

          <div className="rounded-[16px] bg-[#2EC4D5]/8 p-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-[#2EC4D5]" />
              <p className="text-sm font-semibold text-[#2D3748]">ההזדמנות המרכזית</p>
            </div>
            <p className="mt-3 text-lg font-semibold text-[#2D3748]">{topOpportunity?.category.name}</p>
            <p className="mt-1 text-sm text-[#4A5568]">
              {topOpportunity
                ? `פוטנציאל של ${formatCurrencyShort(topOpportunity.upsideEstimate)} עם ${topOpportunity.avgPromoRoi.toFixed(2)}x ROI מבצעים`
                : 'אין הזדמנות בולטת כרגע'}
            </p>
            {topOpportunity && <p className="mt-2 text-xs text-[#A0AEC0]">{topOpportunity.focusAction}</p>}
          </div>

          <div className="rounded-[16px] border border-[#FFE8DE] bg-[#FDF8F6] p-4">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-[#F6B93B]" />
              <p className="text-sm font-semibold text-[#2D3748]">מבט רשת</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="warning">{snapshots.length} קטגוריות</Badge>
              <Badge variant="success">{avgPromoUplift.toFixed(1)}% uplift ממוצע</Badge>
            </div>
            <p className="mt-3 text-sm text-[#4A5568]">
              {dangerSalesShare}% מהמכירות יושבות בקטגוריות שמסומנות כרגע לטיפול.
            </p>
            <p className="mt-2 text-xs text-[#A0AEC0]">
              השוואה פעילה: {getComparisonLabel(comparisonMode)}
            </p>
          </div>
        </CardContent>
      </Card>

      <KPIGrid items={kpis} columns={6} />

      <div className="grid gap-4 xl:grid-cols-2">
        <CategoryActionPanel title="סיכונים מיידיים" tone="danger" items={topDangerItems} />
        <CategoryActionPanel title="הזדמנויות לצמיחה" tone="opportunity" items={topOpportunityItems} />
      </div>

      <CategoryPriorityMatrix data={snapshots} />
      <CategoryTable data={snapshots} comparisonMode={comparisonMode} onComparisonChange={setComparisonMode} />
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager/')({
  component: CategoryManagerPage,
})
