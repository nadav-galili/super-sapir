import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart'
import { DepartmentBarChart } from '@/components/charts/DepartmentBarChart'
import { QualityGauge } from '@/components/charts/QualityGauge'
import { StatBadge } from '@/components/dashboard/StatBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getBranch, allBranches } from '@/data/mock-branches'
import { formatNumber } from '@/lib/format'
import type { KPICardData } from '@/data/types'

function BranchDrillDown() {
  const { branchId } = Route.useParams()
  const branch = getBranch(branchId) ?? allBranches[0]
  const m = branch.metrics

  const kpis: KPICardData[] = [
    { label: 'מכירות כוללות', value: m.totalSales, format: 'currencyShort', trend: m.yoyGrowth, trendLabel: 'שנתי', gradient: 'green' },
    { label: 'מכירות אינטרנט', value: m.internetSales, format: 'currencyShort', trend: 12.5, trendLabel: 'שנתי', gradient: 'blue' },
    { label: 'סל ממוצע', value: m.avgBasket, format: 'currency', trend: 3.2, trendLabel: 'שנתי', gradient: 'teal' },
    { label: 'לקוחות/יום', value: m.customersPerDay, format: 'number', trend: 1.8, trendLabel: 'שנתי', gradient: 'orange' },
  ]

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'מנהל סניף', to: '/store-manager' },
          { label: `${branch.name} #${branch.branchNumber}` },
        ]}
      />

      <h2 className="text-2xl font-bold">סניף {branch.name} #{branch.branchNumber}</h2>

      <KPIGrid items={kpis} />
      <MonthlyTrendChart data={branch.monthlyTrends} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DepartmentBarChart data={branch.departments} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <QualityGauge score={m.qualityScore} />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">תפעול</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <StatBadge label="אחוז אספקה" value={`${m.supplyRate}%`} delta={1.2} />
              <Separator />
              <StatBadge label="בזבוז בשר" value={`${m.meatWastePercent}%`} delta={-0.3} />
              <Separator />
              <StatBadge label="תלונות" value={formatNumber(m.complaints)} />
              <Separator />
              <StatBadge label="עובדים" value={formatNumber(m.totalEmployees)} />
              <Separator />
              <StatBadge label="תחלופה" value={`${m.turnoverRate}%`} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export const Route = createFileRoute('/store-manager/$branchId')({
  component: BranchDrillDown,
})
