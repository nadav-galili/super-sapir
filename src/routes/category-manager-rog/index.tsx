import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Megaphone, GitCompare, LayoutGrid, Truck } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { HeroBannerROG } from '@/components/dashboard/HeroBannerROG'
import { QuickStatCardsROG } from '@/components/dashboard/QuickStatCardsROG'
import { KPIGaugeRowROG } from '@/components/dashboard/KPIGaugeRowROG'
import { CategorySpotlightROG } from '@/components/dashboard/CategorySpotlightROG'
import { CategoryDonutROG } from '@/components/dashboard/CategoryDonutROG'
import { PromotionDailyChartROG } from '@/components/charts/PromotionDailyChartROG'
import { PromotionsTableROG } from '@/components/tables/PromotionsTableROG'
import { CategoryPerformanceTableROG } from '@/components/tables/CategoryPerformanceTableROG'
import { HeroItemCardsROG } from '@/components/dashboard/HeroItemCardsROG'
import { BranchPerformanceBarsROG } from '@/components/dashboard/BranchPerformanceBarsROG'
import { BranchComparisonChartROG } from '@/components/charts/BranchComparisonChartROG'
import { SectionHeader } from '@/components/dashboard/SectionHeader'
import { SuppliersTableROG } from '@/components/tables/SuppliersTableROG'
import { SupplierSpotlightCardsROG } from '@/components/dashboard/SupplierSpotlightCardsROG'
import { allBranches } from '@/data/mock-branches'
import { getCategorySummaries } from '@/data/mock-categories'
import { getChainPromotions } from '@/data/mock-chain-promotions'
import { deriveCategorySnapshots } from '@/lib/category-manager'

function CategoryManagerROGPage() {
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
      <HeroBannerROG
        totalSales={totalSales}
        targetSales={totalTargetSales}
        branchCount={allBranches.length}
        categoryCount={categorySnapshots.length}
      />

      <QuickStatCardsROG />

      <KPIGaugeRowROG items={gaugeKpis} />

      <SectionHeader
        title="קטגוריות מובילות"
        subtitle="4 הקטגוריות המובילות במכירות"
        icon={LayoutGrid}
        accentColor="#F97316"
      />
      <CategorySpotlightROG snapshots={categorySnapshots} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4 items-start">
        <CategoryPerformanceTableROG snapshots={categorySnapshots} />
        <div className="flex flex-col gap-4">
          <CategoryDonutROG snapshots={categorySnapshots} />
          <HeroItemCardsROG vertical />
        </div>
      </div>

      <SectionHeader
        title="ספקים מובילים"
        subtitle="10 הספקים המובילים ברשת לפי מכירות"
        icon={Truck}
        accentColor="#F97316"
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4 items-start">
        <SuppliersTableROG />
        <SupplierSpotlightCardsROG />
      </div>

      <SectionHeader
        title="ניתוח מבצעים"
        subtitle="מעקב ביצועי מבצעים ברמת הרשת"
        icon={Megaphone}
        accentColor="#EF4444"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PromotionDailyChartROG promotion={selectedPromo} />
        <PromotionsTableROG
          promotions={promotions}
          selectedId={selectedPromo.id}
          onSelect={setSelectedPromo}
        />
      </div>

      <SectionHeader
        title="השוואת סניפים"
        subtitle="5 הסניפים המובילים ברשת"
        icon={GitCompare}
        accentColor="#22C55E"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BranchPerformanceBarsROG />
        <BranchComparisonChartROG />
      </div>
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager-rog/')({
  component: CategoryManagerROGPage,
})
