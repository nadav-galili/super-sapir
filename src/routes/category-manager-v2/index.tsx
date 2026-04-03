import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { PromotionDailyChart } from '@/components/charts/PromotionDailyChart'
import { PromotionsTable } from '@/components/tables/PromotionsTable'
import { CategoryPerformanceTable } from '@/components/tables/CategoryPerformanceTable'
import { HeroItemCards } from '@/components/dashboard/HeroItemCards'
import { allBranches } from '@/data/mock-branches'
import { getCategorySummaries } from '@/data/mock-categories'
import { getChainPromotions } from '@/data/mock-chain-promotions'
import { deriveCategorySnapshots } from '@/lib/category-manager'
import type { KPICardData } from '@/data/types'

function CategoryManagerV2Page() {
  const promotions = useMemo(() => getChainPromotions(), [])
  const [selectedPromo, setSelectedPromo] = useState(promotions[0])
  const categorySnapshots = useMemo(() => {
    const cats = getCategorySummaries()
    return deriveCategorySnapshots(cats, 'vs-last-year')
  }, [])

  const kpis = useMemo<KPICardData[]>(() => {
    const totalSales = allBranches.reduce((sum, b) => sum + b.metrics.totalSales, 0)
    const lastYearTotalSales = allBranches.reduce((sum, b) => {
      const growth = b.metrics.yoyGrowth / 100
      return sum + b.metrics.totalSales / (1 + growth)
    }, 0)
    const yoyChange = lastYearTotalSales > 0
      ? ((totalSales - lastYearTotalSales) / lastYearTotalSales) * 100
      : 0

    const avgGrossMargin = allBranches.reduce((sum, b) => {
      const branchMargin = b.departments.reduce((ds, d) => ds + d.grossMarginPercent * d.sales, 0)
        / b.departments.reduce((ds, d) => ds + d.sales, 0)
      return sum + branchMargin
    }, 0) / allBranches.length

    const avgBasket = allBranches.reduce((sum, b) => sum + b.metrics.avgBasket, 0) / allBranches.length

    const avgSupplyRate = allBranches.reduce((sum, b) => sum + b.metrics.supplyRate, 0) / allBranches.length

    const totalPromoSales = allBranches.reduce((sum, b) => {
      return sum + b.departments.reduce((ds, d) => {
        return ds + d.promotions.reduce((ps, p) => ps + p.actualSales, 0)
      }, 0)
    }, 0)
    const promoSalesPercent = totalSales > 0 ? (totalPromoSales / totalSales) * 100 : 0

    return [
      {
        label: 'מכירות רשת',
        value: totalSales,
        format: 'currencyShort',
        trend: +yoyChange.toFixed(1),
        trendLabel: 'שנה שעברה',
        gradient: 'pink',
      },
      {
        label: 'שינוי שנתי',
        value: +yoyChange.toFixed(1),
        format: 'percent',
        trend: +yoyChange.toFixed(1),
        trendLabel: 'YoY',
        gradient: yoyChange >= 0 ? 'green' : 'red',
      },
      {
        label: 'רווח גולמי',
        value: +avgGrossMargin.toFixed(1),
        format: 'percent',
        trend: +(avgGrossMargin - 25).toFixed(1),
        trendLabel: 'מול ממוצע ענף',
        gradient: 'purple',
      },
      {
        label: 'סל ממוצע ללקוח',
        value: Math.round(avgBasket),
        format: 'currency',
        trend: +((avgBasket - 240) / 240 * 100).toFixed(1),
        trendLabel: 'מול יעד',
        gradient: 'teal',
      },
      {
        label: 'זמינות מדף',
        value: +avgSupplyRate.toFixed(1),
        format: 'percent',
        trend: +(avgSupplyRate - 95).toFixed(1),
        trendLabel: 'מול יעד 95%',
        gradient: avgSupplyRate >= 95 ? 'green' : 'orange',
      },
      {
        label: 'מכירות מבצעים',
        value: +promoSalesPercent.toFixed(1),
        format: 'percent',
        trend: +(promoSalesPercent - 12).toFixed(1),
        trendLabel: 'מול ממוצע',
        gradient: 'orange',
      },
    ]
  }, [])

  return (
    <PageContainer>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#2D3748] mb-1">
          לוח בקרה — מנהל קטגוריה רשתי
        </h1>
        <p className="text-sm text-[#A0AEC0]">
          סקירת ביצועים כלל-רשתית לכל הקטגוריות והסניפים
        </p>
      </div>

      <KPIGrid items={kpis} columns={6} />

      {/* Hero Item Cards */}
      <HeroItemCards />

      {/* Category Performance Table */}
      <CategoryPerformanceTable snapshots={categorySnapshots} />

      {/* Promotion Analysis Section */}
      <div>
        <h2 className="text-lg font-bold text-[#2D3748] mb-3">ניתוח מבצעים</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PromotionDailyChart promotion={selectedPromo} />
          <PromotionsTable
            promotions={promotions}
            selectedId={selectedPromo.id}
            onSelect={setSelectedPromo}
          />
        </div>
      </div>
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager-v2/')({
  component: CategoryManagerV2Page,
})
