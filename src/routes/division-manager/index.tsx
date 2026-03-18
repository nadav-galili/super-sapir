import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { IsraelMap } from '@/components/map/IsraelMap'
import { BranchRankingTable } from '@/components/tables/BranchRankingTable'
import { ComparisonChart } from '@/components/charts/ComparisonChart'
import { allBranches } from '@/data/mock-branches'
import { getCompanyTotals, getRegionSummaries } from '@/data/mock-regions'
import type { KPICardData } from '@/data/types'

function DivisionManagerPage() {
  const navigate = useNavigate()
  const totals = getCompanyTotals()
  const regions = getRegionSummaries()

  const kpis: KPICardData[] = regions.map((r, i) => ({
    label: `אזור ${r.name}`,
    value: r.totalSales,
    format: 'currencyShort' as const,
    trend: r.avgGrowth,
    trendLabel: 'צמיחה',
    gradient: (['blue', 'green', 'orange'] as const)[i],
  }))

  kpis.push({
    label: 'סה"כ חברה',
    value: totals.totalSales,
    format: 'currencyShort',
    trend: totals.avgGrowth,
    trendLabel: 'צמיחה',
    gradient: 'purple',
  })

  const sortedByPerformance = [...allBranches].sort(
    (a, b) => b.metrics.totalSales - a.metrics.totalSales
  )
  const topAndBottom = [
    ...sortedByPerformance.slice(0, 3),
    ...sortedByPerformance.slice(-3),
  ]

  return (
    <PageContainer>
      <KPIGrid items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IsraelMap
          branches={allBranches}
          onBranchClick={(id) =>
            navigate({ to: '/store-manager/$branchId', params: { branchId: id } })
          }
        />
        <BranchRankingTable branches={allBranches} />
      </div>

      <ComparisonChart branches={topAndBottom} title="השוואה: 3 מובילים vs 3 אחרונים" />
    </PageContainer>
  )
}

export const Route = createFileRoute('/division-manager/')({
  component: DivisionManagerPage,
})
