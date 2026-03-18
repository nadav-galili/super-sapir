import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart'
import { DepartmentBarChart } from '@/components/charts/DepartmentBarChart'
import { QualityGauge } from '@/components/charts/QualityGauge'
import { StatBadge } from '@/components/dashboard/StatBadge'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { allBranches, getBranch } from '@/data/mock-branches'
import { COMPETITORS } from '@/data/constants'
import { formatCurrencyShort, formatNumber } from '@/lib/format'
import type { KPICardData } from '@/data/types'

function StoreManagerPage() {
  const [selectedBranchId, setSelectedBranchId] = useState('hadera-44')
  const branch = getBranch(selectedBranchId) ?? allBranches[0]
  const m = branch.metrics

  const kpis: KPICardData[] = [
    { label: 'מכירות כוללות', value: m.totalSales, format: 'currencyShort', trend: m.yoyGrowth, trendLabel: 'שנתי', gradient: 'green' },
    { label: 'מכירות אינטרנט', value: m.internetSales, format: 'currencyShort', trend: 12.5, trendLabel: 'שנתי', gradient: 'blue' },
    { label: 'סל ממוצע', value: m.avgBasket, format: 'currency', trend: 3.2, trendLabel: 'שנתי', gradient: 'teal' },
    { label: 'לקוחות/יום', value: m.customersPerDay, format: 'number', trend: 1.8, trendLabel: 'שנתי', gradient: 'orange' },
    { label: 'עלות שכר', value: m.salaryCostPercent * 10, format: 'percent', trend: -0.5, trendLabel: 'שנתי', gradient: 'purple' },
  ]

  const branchOptions = allBranches.map(b => ({
    value: b.id,
    label: `${b.name} #${b.branchNumber}`,
  }))

  return (
    <PageContainer>
      <div className="flex items-center gap-4">
        <Select
          options={branchOptions}
          value={selectedBranchId}
          onChange={e => setSelectedBranchId(e.target.value)}
          className="w-64"
        />
      </div>

      <KPIGrid items={kpis} columns={5} />

      <MonthlyTrendChart data={branch.monthlyTrends} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DepartmentBarChart data={branch.departments} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <QualityGauge score={m.qualityScore} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">תפעול ואיכות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <StatBadge label="אחוז אספקה" value={`${m.supplyRate}%`} delta={1.2} />
              <Separator />
              <StatBadge label="בזבוז בשר" value={`${m.meatWastePercent}%`} delta={-0.3} />
              <Separator />
              <StatBadge label="תלונות" value={formatNumber(m.complaints)} delta={-15} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">כח אדם</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <StatBadge label="עובדים" value={formatNumber(m.totalEmployees)} />
              <Separator />
              <StatBadge label="חוסרי כח אדם" value={formatNumber(m.staffingGaps)} />
              <Separator />
              <StatBadge label="שעות נוספות" value={formatNumber(m.overtimeHours)} delta={5.2} />
              <Separator />
              <StatBadge label="תחלופה" value={`${m.turnoverRate}%`} delta={-2.1} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">השוואת מתחרים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">מתחרה</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">סל ממוצע</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">ציון איכות</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">מדד מחירים</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">נתח שוק</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-blue-50/50 font-medium">
                  <td className="px-4 py-2.5">רמי לוי (אנחנו)</td>
                  <td className="px-4 py-2.5" dir="ltr">{formatCurrencyShort(m.avgBasket)}</td>
                  <td className="px-4 py-2.5" dir="ltr">{m.qualityScore}</td>
                  <td className="px-4 py-2.5" dir="ltr">96</td>
                  <td className="px-4 py-2.5" dir="ltr">18%</td>
                </tr>
                {COMPETITORS.map(c => (
                  <tr key={c.id} className="border-b hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-2.5">{c.name}</td>
                    <td className="px-4 py-2.5" dir="ltr">{formatCurrencyShort(c.avgBasket)}</td>
                    <td className="px-4 py-2.5" dir="ltr">{c.qualityScore}</td>
                    <td className="px-4 py-2.5" dir="ltr">{c.priceIndex}</td>
                    <td className="px-4 py-2.5" dir="ltr">{c.marketShare}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export const Route = createFileRoute('/store-manager/')({
  component: StoreManagerPage,
})
