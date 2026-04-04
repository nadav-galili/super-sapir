import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Megaphone, GitCompare, LayoutGrid } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { HeroBanner } from '@/components/dashboard/HeroBanner'
import { QuickStatCards } from '@/components/dashboard/QuickStatCards'
import { KPIGaugeRow } from '@/components/dashboard/KPIGaugeRow'
import { CategorySpotlight } from '@/components/dashboard/CategorySpotlight'
import { CategoryDonut } from '@/components/dashboard/CategoryDonut'
import { PromotionDailyChart } from '@/components/charts/PromotionDailyChart'
import { PromotionsTable } from '@/components/tables/PromotionsTable'
import { CategoryPerformanceTable } from '@/components/tables/CategoryPerformanceTable'
import { HeroItemCards } from '@/components/dashboard/HeroItemCards'
import { BranchPerformanceBars } from '@/components/dashboard/BranchPerformanceBars'
import { BranchComparisonChart } from '@/components/charts/BranchComparisonChart'
import { SectionHeader } from '@/components/dashboard/SectionHeader'
import { allBranches } from '@/data/mock-branches'
import { getCategorySummaries } from '@/data/mock-categories'
import { getChainPromotions } from '@/data/mock-chain-promotions'
import { deriveCategorySnapshots } from '@/lib/category-manager'

function CategoryManagerV2Page() {
  const promotions = useMemo(() => getChainPromotions(), [])
  const [selectedPromo, setSelectedPromo] = useState(promotions[0])
  const categorySnapshots = useMemo(() => {
    const cats = getCategorySummaries()
    return deriveCategorySnapshots(cats, 'vs-last-year')
  }, [])

  const { totalSales, totalTargetSales, gaugeKpis } = useMemo(() => {
    const sales = allBranches.reduce((sum, b) => sum + b.metrics.totalSales, 0)
    const target = allBranches.reduce((sum, b) => {
      return sum + b.departments.reduce((ds, d) => ds + d.targetSales, 0)
    }, 0)

    const avgGrossMargin = allBranches.reduce((sum, b) => {
      const branchMargin = b.departments.reduce((ds, d) => ds + d.grossMarginPercent * d.sales, 0)
        / b.departments.reduce((ds, d) => ds + d.sales, 0)
      return sum + branchMargin
    }, 0) / allBranches.length

    const avgBasket = allBranches.reduce((sum, b) => sum + b.metrics.avgBasket, 0) / allBranches.length
    const avgSupplyRate = allBranches.reduce((sum, b) => sum + b.metrics.supplyRate, 0) / allBranches.length
    const avgQuality = allBranches.reduce((sum, b) => sum + b.metrics.qualityScore, 0) / allBranches.length

    const totalPromoSales = allBranches.reduce((sum, b) => {
      return sum + b.departments.reduce((ds, d) => {
        return ds + d.promotions.reduce((ps, p) => ps + p.actualSales, 0)
      }, 0)
    }, 0)
    const promoSalesPercent = sales > 0 ? (totalPromoSales / sales) * 100 : 0

    return {
      totalSales: sales,
      totalTargetSales: target,
      gaugeKpis: [
        { label: 'רווח גולמי', value: +avgGrossMargin.toFixed(1), target: 30, format: 'percent' as const },
        { label: 'סל ממוצע ללקוח', value: Math.round(avgBasket), target: 280, format: 'currency' as const },
        { label: 'זמינות מדף', value: +avgSupplyRate.toFixed(1), target: 98, format: 'percent' as const },
        { label: 'ציון איכות', value: +avgQuality.toFixed(0), target: 100, format: 'percent' as const },
        { label: 'מכירות מבצעים', value: +promoSalesPercent.toFixed(1), target: 15, format: 'percent' as const },
      ],
    }
  }, [])

  return (
    <PageContainer>
      <HeroBanner
        totalSales={totalSales}
        targetSales={totalTargetSales}
        branchCount={allBranches.length}
        categoryCount={categorySnapshots.length}
      />

      <QuickStatCards />

      <KPIGaugeRow items={gaugeKpis} />

      <SectionHeader
        title="קטגוריות מובילות"
        subtitle="4 הקטגוריות המובילות במכירות"
        icon={LayoutGrid}
        accentColor="#6C5CE7"
      />
      <CategorySpotlight snapshots={categorySnapshots} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4 items-start">
        <CategoryPerformanceTable snapshots={categorySnapshots} />
        <div className="flex flex-col gap-4">
          <CategoryDonut snapshots={categorySnapshots} />
          <HeroItemCards vertical />
        </div>
      </div>

      <SectionHeader
        title="ניתוח מבצעים"
        subtitle="מעקב ביצועי מבצעים ברמת הרשת"
        icon={Megaphone}
        accentColor="#DC4E59"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PromotionDailyChart promotion={selectedPromo} />
        <PromotionsTable
          promotions={promotions}
          selectedId={selectedPromo.id}
          onSelect={setSelectedPromo}
        />
      </div>

      <SectionHeader
        title="השוואת סניפים"
        subtitle="5 הסניפים המובילים ברשת"
        icon={GitCompare}
        accentColor="#2EC4D5"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BranchPerformanceBars />
        <BranchComparisonChart />
      </div>
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager-v2/')({
  component: CategoryManagerV2Page,
})
