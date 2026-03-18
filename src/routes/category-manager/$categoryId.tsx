import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatBadge } from '@/components/dashboard/StatBadge'
import { Separator } from '@/components/ui/separator'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { motion } from 'motion/react'
import { allBranches } from '@/data/mock-branches'
import { DEPARTMENT_NAMES } from '@/data/constants'
import { formatCurrencyShort } from '@/lib/format'
import { CHART_COLORS } from '@/lib/colors'
import type { KPICardData } from '@/data/types'

function CategoryDrillDown() {
  const { categoryId } = Route.useParams()
  const categoryName = DEPARTMENT_NAMES[categoryId] ?? categoryId

  const branchData = allBranches.map(branch => {
    const dept = branch.departments.find(d => d.id === categoryId)
    return {
      branchName: branch.name,
      sales: dept?.sales ?? 0,
      yoyChange: dept?.yoyChange ?? 0,
      sharePercent: dept?.sharePercent ?? 0,
    }
  }).sort((a, b) => b.sales - a.sales)

  const totalSales = branchData.reduce((s, b) => s + b.sales, 0)
  const avgYoy = +(branchData.reduce((s, b) => s + b.yoyChange, 0) / branchData.length).toFixed(1)
  const avgShare = +(branchData.reduce((s, b) => s + b.sharePercent, 0) / branchData.length).toFixed(1)

  const kpis: KPICardData[] = [
    { label: 'מכירות כוללות', value: totalSales, format: 'currencyShort', trend: avgYoy, trendLabel: 'שנתי', gradient: 'green' },
    { label: 'סניפים', value: branchData.length, format: 'number', trend: 0, trendLabel: '', gradient: 'blue' },
    { label: 'נתח ממוצע', value: avgShare * 10, format: 'percent', trend: 0.5, trendLabel: 'שנתי', gradient: 'orange' },
    { label: 'צמיחה ממוצעת', value: Math.abs(avgYoy * 10), format: 'percent', trend: avgYoy, trendLabel: '', gradient: avgYoy >= 0 ? 'teal' : 'red' },
  ]

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'מנהל קטגוריה', to: '/category-manager' },
          { label: categoryName },
        ]}
      />

      <h2 className="text-2xl font-bold">{categoryName}</h2>

      <KPIGrid items={kpis} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">מכירות לפי סניף - {categoryName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div dir="ltr" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="branchName" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [formatCurrencyShort(value as number), 'מכירות']}
                    contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
                  />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]} animationDuration={1200}>
                    {branchData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">פירוט לפי סניף</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {branchData.map((b, i) => (
            <div key={i}>
              <StatBadge
                label={b.branchName}
                value={formatCurrencyShort(b.sales)}
                delta={b.yoyChange}
              />
              {i < branchData.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager/$categoryId')({
  component: CategoryDrillDown,
})
