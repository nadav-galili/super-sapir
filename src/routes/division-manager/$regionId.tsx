import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { IsraelMap } from '@/components/map/IsraelMap'
import { BranchRankingTable } from '@/components/tables/BranchRankingTable'
import { ComparisonChart } from '@/components/charts/ComparisonChart'
import { getBranchesByRegion } from '@/data/mock-branches'
import { REGIONS } from '@/data/constants'
import type { KPICardData } from '@/data/types'

function RegionDrillDown() {
  const { regionId } = Route.useParams()
  const navigate = useNavigate()
  const region = REGIONS.find(r => r.id === regionId)
  const branches = getBranchesByRegion(regionId)

  const totalSales = branches.reduce((s, b) => s + b.metrics.totalSales, 0)
  const avgQuality = Math.round(branches.reduce((s, b) => s + b.metrics.qualityScore, 0) / branches.length)
  const avgGrowth = +(branches.reduce((s, b) => s + b.metrics.yoyGrowth, 0) / branches.length).toFixed(1)
  const totalEmployees = branches.reduce((s, b) => s + b.metrics.totalEmployees, 0)

  const kpis: KPICardData[] = [
    { label: 'מכירות אזוריות', value: totalSales, format: 'currencyShort', trend: avgGrowth, trendLabel: 'צמיחה' },
    { label: 'סניפים', value: branches.length, format: 'number', trend: 0, trendLabel: '' },
    { label: 'ציון איכות ממוצע', value: avgQuality, format: 'number', trend: 1.5, trendLabel: 'שנתי', target: 85 },
    { label: 'עובדים', value: totalEmployees, format: 'number', trend: 2.0, trendLabel: 'שנתי' },
  ]

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'מנהל אזור', to: '/division-manager' },
          { label: `אזור ${region?.name ?? regionId}` },
        ]}
      />

      <h2 className="text-2xl font-bold">אזור {region?.name ?? regionId}</h2>

      <KPIGrid items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IsraelMap
          branches={branches}
          onBranchClick={(id) =>
            navigate({ to: '/store-manager/$branchId', params: { branchId: id } })
          }
        />
        <BranchRankingTable branches={branches} title={`דירוג סניפי ${region?.name}`} />
      </div>

      <ComparisonChart branches={branches} title={`השוואת סניפי אזור ${region?.name}`} />
    </PageContainer>
  )
}

export const Route = createFileRoute('/division-manager/$regionId')({
  component: RegionDrillDown,
})
