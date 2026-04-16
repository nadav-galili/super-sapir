import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Megaphone, LayoutGrid, Truck } from 'lucide-react'
import { TimePeriodFilter, getPeriodMultiplier, getPeriodJitter, type TimePeriod } from '@/components/dashboard/TimePeriodFilter'
import { PeriodMultiplierProvider } from '@/contexts/PeriodContext'
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
import { SectionHeader } from '@/components/dashboard/SectionHeader'
import { SuppliersTable } from '@/components/tables/SuppliersTable'
import { SupplierSpotlightCards } from '@/components/dashboard/SupplierSpotlightCards'
import { ChainAIBriefing } from '@/components/dashboard/ChainAIBriefing'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { allBranches } from '@/data/mock-branches'
import { getCategorySummaries } from '@/data/mock-categories'
import { getChainPromotions } from '@/data/mock-chain-promotions'
import { deriveCategorySnapshots } from '@/lib/category-manager'

function CategoryManagerPage() {
  const rawPromotions = useMemo(() => getChainPromotions(), [])
  const [selectedPromoId, setSelectedPromoId] = useState(rawPromotions[0]?.id)
  const [period, setPeriod] = useState<TimePeriod>({ type: 'yearly' })
  const multiplier = getPeriodMultiplier(period)

  const promotions = useMemo(() => {
    if (multiplier === 1) return rawPromotions
    return rawPromotions.map(p => ({
      ...p,
      sales: Math.round(p.sales * multiplier),
      dailySales: p.dailySales.map(v => Math.round(v * multiplier)),
      dailyBaseline: p.dailyBaseline.map(v => Math.round(v * multiplier)),
    }))
  }, [rawPromotions, multiplier])
  const selectedPromo = promotions.find(p => p.id === selectedPromoId) ?? promotions[0]

  const categorySnapshots = useMemo(() => {
    const cats = getCategorySummaries()
    const snaps = deriveCategorySnapshots(cats, 'vs-last-year')
    if (multiplier === 1) return snaps
    return snaps.map(s => ({
      ...s,
      grossProfit: s.grossProfit * multiplier,
      category: {
        ...s.category,
        sales: Math.round(s.category.sales * multiplier),
        targetSales: Math.round(s.category.targetSales * multiplier),
        lastYearSales: Math.round(s.category.lastYearSales * multiplier),
      },
    }))
  }, [multiplier])

  const { totalSales, totalTargetSales, gaugeKpis } = useMemo(() => {
    const m = multiplier
    const sales = allBranches.reduce((sum, b) => sum + b.metrics.totalSales, 0) * m
    const target = allBranches.reduce((sum, b) => {
      return sum + b.departments.reduce((ds, d) => ds + d.targetSales, 0)
    }, 0) * m

    const j0 = getPeriodJitter(period, 0)
    const j2 = getPeriodJitter(period, 2)
    const j3 = getPeriodJitter(period, 3)
    const j4 = getPeriodJitter(period, 4)

    const avgGrossMargin = (allBranches.reduce((sum, b) => {
      const branchMargin = b.departments.reduce((ds, d) => ds + d.grossMarginPercent * d.sales, 0)
        / b.departments.reduce((ds, d) => ds + d.sales, 0)
      return sum + branchMargin
    }, 0) / allBranches.length) * j0

    const avgBasket = (allBranches.reduce((sum, b) => sum + b.metrics.avgBasket, 0) / allBranches.length) * m
    const avgSupplyRate = (allBranches.reduce((sum, b) => sum + b.metrics.supplyRate, 0) / allBranches.length) * j2
    const avgQuality = (allBranches.reduce((sum, b) => sum + b.metrics.qualityScore, 0) / allBranches.length) * j3

    const totalPromoSales = allBranches.reduce((sum, b) => {
      return sum + b.departments.reduce((ds, d) => {
        return ds + d.promotions.reduce((ps, p) => ps + p.actualSales, 0)
      }, 0)
    }, 0) * m * j4
    const promoSalesPercent = sales > 0 ? (totalPromoSales / sales) * 100 : 0

    return {
      totalSales: sales,
      totalTargetSales: target,
      gaugeKpis: [
        { label: 'רווח גולמי', value: +avgGrossMargin.toFixed(1), target: 30, format: 'percent' as const },
        { label: 'סל ממוצע ללקוח', value: Math.round(avgBasket), target: 280, format: 'currency' as const },
        { label: 'זמינות מדף', value: +avgSupplyRate.toFixed(1), target: 98, format: 'percent' as const },
        { label: 'ציון איכות', value: +avgQuality.toFixed(0), target: 100, format: 'percent' as const },
        { label: 'מכירות מבצעים', value: +promoSalesPercent.toFixed(1), target: 60, format: 'percent' as const },
      ],
    }
  }, [multiplier, period])

  return (
    <PeriodMultiplierProvider value={multiplier}>
    <PageContainer>
      <HeroBanner
        totalSales={totalSales}
        targetSales={totalTargetSales}
        branchCount={allBranches.length}
        categoryCount={categorySnapshots.length}
      />

      <ChainAIBriefing />

      <div className="flex justify-end">
        <TimePeriodFilter value={period} onChange={setPeriod} />
      </div>

      <QuickStatCards />

      <KPIGaugeRow items={gaugeKpis} />

      <Tabs defaultValue="categories" dir="rtl">
        <TabsList className="h-auto gap-1 bg-[#FDF8F6] p-1 rounded-[12px] border border-[#FFE8DE]">
          <TabsTrigger
            value="categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-lg font-medium text-[#4A5568] transition-all data-[state=active]:bg-white data-[state=active]:text-[#6C5CE7] data-[state=active]:shadow-sm"
          >
            <LayoutGrid className="w-5 h-5" />
            ביצועי קטגוריות
          </TabsTrigger>
          <TabsTrigger
            value="suppliers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-lg font-medium text-[#4A5568] transition-all data-[state=active]:bg-white data-[state=active]:text-[#F6B93B] data-[state=active]:shadow-sm"
          >
            <Truck className="w-5 h-5" />
            ספקים
          </TabsTrigger>
          <TabsTrigger
            value="promotions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-lg font-medium text-[#4A5568] transition-all data-[state=active]:bg-white data-[state=active]:text-[#DC4E59] data-[state=active]:shadow-sm"
          >
            <Megaphone className="w-5 h-5" />
            מבצעים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4 space-y-4">
          <h2 className="text-2xl font-bold text-[#2D3748]">ביצועי ספקים</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4 items-start">
            <SuppliersTable />
            <SupplierSpotlightCards />
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="mt-4 space-y-4">
          <h2 className="text-2xl font-bold text-[#2D3748]">ניתוח מבצעים</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PromotionDailyChart promotion={selectedPromo} />
            <PromotionsTable
              promotions={promotions}
              selectedId={selectedPromo.id}
              onSelect={(p) => setSelectedPromoId(p.id)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
    </PeriodMultiplierProvider>
  )
}

export const Route = createFileRoute('/category-manager/')({
  component: CategoryManagerPage,
})
