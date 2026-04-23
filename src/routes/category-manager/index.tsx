import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Megaphone, LayoutGrid, Truck, Store, Sparkles } from "lucide-react";
import {
  TimePeriodFilter,
  getPeriodMultiplier,
  getPeriodTargetMultiplier,
  getPeriodKpiFactor,
  getPeriodLabel,
  type TimePeriod,
} from "@/components/dashboard/TimePeriodFilter";
import {
  PeriodMultiplierProvider,
  SelectedPeriodProvider,
} from "@/contexts/PeriodContext";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { KPIGaugeRow } from "@/components/dashboard/KPIGaugeRow";
import { CategorySpotlight } from "@/components/dashboard/CategorySpotlight";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { PromotionDailyChart } from "@/components/charts/PromotionDailyChart";
import { PromotionsTable } from "@/components/tables/PromotionsTable";
import { CategoryPerformanceTable } from "@/components/tables/CategoryPerformanceTable";
import { HeroItemCards } from "@/components/dashboard/HeroItemCards";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { SuppliersTable } from "@/components/tables/SuppliersTable";
import { SupplierSpotlightCards } from "@/components/dashboard/SupplierSpotlightCards";
import { ChainAIBriefing } from "@/components/dashboard/ChainAIBriefing";
import { FormatsOverview } from "@/components/dashboard/FormatsOverview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { allBranches } from "@/data/mock-branches";
import { getCategorySummaries } from "@/data/mock-categories";
import { getChainPromotions } from "@/data/mock-chain-promotions";
import { deriveCategorySnapshots } from "@/lib/category-manager";

function CategoryManagerPage() {
  const rawPromotions = useMemo(() => getChainPromotions(), []);
  const [selectedPromoId, setSelectedPromoId] = useState(rawPromotions[0]?.id);
  const [period, setPeriod] = useState<TimePeriod>({ type: "yearly" });
  const multiplier = getPeriodMultiplier(period);
  const targetMultiplier = getPeriodTargetMultiplier(period);

  const promotions = useMemo(() => {
    if (multiplier === 1) return rawPromotions;
    return rawPromotions.map((p) => ({
      ...p,
      sales: Math.round(p.sales * multiplier),
      dailySales: p.dailySales.map((v) => Math.round(v * multiplier)),
      dailyBaseline: p.dailyBaseline.map((v) => Math.round(v * multiplier)),
    }));
  }, [rawPromotions, multiplier]);
  const selectedPromo =
    promotions.find((p) => p.id === selectedPromoId) ?? promotions[0];

  const categorySnapshots = useMemo(() => {
    const cats = getCategorySummaries();
    const snaps = deriveCategorySnapshots(cats, "vs-last-year");
    if (multiplier === 1) return snaps;
    return snaps.map((s) => ({
      ...s,
      grossProfit: s.grossProfit * multiplier,
      category: {
        ...s.category,
        sales: Math.round(s.category.sales * multiplier),
        targetSales: Math.round(s.category.targetSales * multiplier),
        lastYearSales: Math.round(s.category.lastYearSales * multiplier),
      },
    }));
  }, [multiplier]);

  const { totalSales, totalTargetSales, gaugeKpis } = useMemo(() => {
    const m = multiplier;
    const sales =
      allBranches.reduce((sum, b) => sum + b.metrics.totalSales, 0) * m;
    const target =
      allBranches.reduce((sum, b) => {
        return sum + b.departments.reduce((ds, d) => ds + d.targetSales, 0);
      }, 0) * targetMultiplier;

    const j0 = getPeriodKpiFactor(period, 0);
    const j1 = getPeriodKpiFactor(period, 1);
    const j2 = getPeriodKpiFactor(period, 2);
    const j3 = getPeriodKpiFactor(period, 3);
    const j4 = getPeriodKpiFactor(period, 4);

    const avgGrossMargin =
      (allBranches.reduce((sum, b) => {
        const branchMargin =
          b.departments.reduce(
            (ds, d) => ds + d.grossMarginPercent * d.sales,
            0
          ) / b.departments.reduce((ds, d) => ds + d.sales, 0);
        return sum + branchMargin;
      }, 0) /
        allBranches.length) *
      j0;

    const avgBasket =
      (allBranches.reduce((sum, b) => sum + b.metrics.avgBasket, 0) /
        allBranches.length) *
      j1;
    const avgSupplyRate =
      (allBranches.reduce((sum, b) => sum + b.metrics.supplyRate, 0) /
        allBranches.length) *
      j2;
    const totalCustomers =
      allBranches.reduce((sum, b) => sum + b.metrics.customersPerDay, 0) *
      m *
      j3;
    const targetCustomers =
      allBranches.reduce((sum, b) => sum + b.metrics.customersPerDay, 0) *
      targetMultiplier;

    const totalPromoSales =
      allBranches.reduce((sum, b) => {
        return (
          sum +
          b.departments.reduce((ds, d) => {
            return ds + d.promotions.reduce((ps, p) => ps + p.actualSales, 0);
          }, 0)
        );
      }, 0) *
      m *
      j4;
    const promoSalesPercent = sales > 0 ? (totalPromoSales / sales) * 100 : 0;

    return {
      totalSales: sales,
      totalTargetSales: target,
      gaugeKpis: [
        {
          label: "רווח גולמי",
          value: +avgGrossMargin.toFixed(1),
          target: 30,
          format: "percent" as const,
        },
        {
          label: "סל ממוצע ללקוח",
          value: Math.round(avgBasket),
          target: 280,
          format: "currency" as const,
        },
        {
          label: "זמינות מדף",
          value: +avgSupplyRate.toFixed(1),
          target: 98,
          format: "percent" as const,
        },
        {
          label: "לקוחות",
          value: Math.round(totalCustomers),
          target: Math.max(1, Math.round(targetCustomers)),
          format: "number" as const,
        },
        {
          label: "מכירות מבצעים",
          value: +promoSalesPercent.toFixed(1),
          target: 60,
          format: "percent" as const,
        },
      ],
    };
  }, [multiplier, period, targetMultiplier]);

  return (
    <SelectedPeriodProvider value={period}>
      <PeriodMultiplierProvider value={multiplier}>
        <PageContainer>
          <HeroBanner
            totalSales={totalSales}
            targetSales={totalTargetSales}
            branchCount={allBranches.length}
            categoryCount={categorySnapshots.length}
            middleContent={
              <KPIGaugeRow items={gaugeKpis} variant="heroInline" />
            }
            periodControl={
              <TimePeriodFilter
                value={period}
                onChange={setPeriod}
                variant="dark"
              />
            }
            cta={
              <Link
                to="/category-manager/promo-simulator"
                className="inline-flex items-center gap-2 rounded-[10px] px-6 py-3 text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #DC4E59, #E8777F)",
                  boxShadow: "0 10px 25px rgba(220, 78, 89, 0.35)",
                }}
              >
                <Sparkles className="w-5 h-5" />
                סימולטור מבצע חדש
              </Link>
            }
          />

          <ChainAIBriefing />

          <Tabs defaultValue="formats" dir="rtl">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-[#FFE8DE]">
              <TabsList className="h-auto gap-6 bg-transparent p-0 rounded-none">
                <TabsTrigger
                  value="formats"
                  className="group relative inline-flex items-center gap-2 px-1 pb-3 rounded-none bg-transparent text-[17px] font-medium text-[#A0AEC0] hover:text-[#4A5568] data-[state=active]:bg-transparent data-[state=active]:text-[#2D3748] data-[state=active]:shadow-none transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-[#DC4E59] after:origin-center after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  <Store className="w-[18px] h-[18px]" strokeWidth={2} />
                  פורמטים
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="group relative inline-flex items-center gap-2 px-1 pb-3 rounded-none bg-transparent text-[17px] font-medium text-[#A0AEC0] hover:text-[#4A5568] data-[state=active]:bg-transparent data-[state=active]:text-[#2D3748] data-[state=active]:shadow-none transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-[#DC4E59] after:origin-center after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={2} />
                  ביצועי קטגוריות
                </TabsTrigger>
                <TabsTrigger
                  value="suppliers"
                  className="group relative inline-flex items-center gap-2 px-1 pb-3 rounded-none bg-transparent text-[17px] font-medium text-[#A0AEC0] hover:text-[#4A5568] data-[state=active]:bg-transparent data-[state=active]:text-[#2D3748] data-[state=active]:shadow-none transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-[#DC4E59] after:origin-center after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  <Truck className="w-[18px] h-[18px]" strokeWidth={2} />
                  ספקים
                </TabsTrigger>
                <TabsTrigger
                  value="promotions"
                  className="group relative inline-flex items-center gap-2 px-1 pb-3 rounded-none bg-transparent text-[17px] font-medium text-[#A0AEC0] hover:text-[#4A5568] data-[state=active]:bg-transparent data-[state=active]:text-[#2D3748] data-[state=active]:shadow-none transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-[#DC4E59] after:origin-center after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  <Megaphone className="w-[18px] h-[18px]" strokeWidth={2} />
                  מבצעים
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="formats" className="mt-4">
              <FormatsOverview period={period} />
            </TabsContent>

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
              <h2 className="text-2xl font-bold text-[#2D3748]">
                ביצועי ספקים
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4 items-start">
                <SuppliersTable />
                <SupplierSpotlightCards />
              </div>
            </TabsContent>

            <TabsContent value="promotions" className="mt-4 space-y-4">
              <h2 className="text-2xl font-bold text-[#2D3748]">
                ניתוח מבצעים
              </h2>
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
    </SelectedPeriodProvider>
  );
}

export const Route = createFileRoute("/category-manager/")({
  component: CategoryManagerPage,
});
