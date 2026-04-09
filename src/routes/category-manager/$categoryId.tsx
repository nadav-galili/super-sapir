import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { PromotionCard } from '@/components/dashboard/PromotionCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { CategorySuppliersDashboard } from '@/components/dashboard/CategorySuppliersDashboard'
import { CategoryAIBriefing } from '@/components/dashboard/CategoryAIBriefing'
import { allBranches } from '@/data/mock-branches'
import { DEPARTMENT_NAMES, MONTHS_HE } from '@/data/constants'
import { formatCurrencyShort } from '@/lib/format'
import type { KPICardData, Promotion } from '@/data/types'

interface BranchCategoryRow {
  branchName: string
  sales: number
  targetSales: number
  targetAchievement: number
  grossMarginPercent: number
  inventoryDays: number
  yoyChange: number
  stockoutRate: number
}

type AlertSeverity = 'critical' | 'warning'
type AlertKind = 'target-miss' | 'stockout' | 'margin-drop' | 'sales-decline'

interface BranchAlert {
  branchName: string
  kind: AlertKind
  severity: AlertSeverity
  headline: string
  detail: string
}

const ALERT_CONFIG: Record<AlertKind, { label: string; color: string; bg: string }> = {
  'target-miss': { label: 'החמצת יעד', color: '#DC4E59', bg: 'bg-[#DC4E59]/10' },
  'stockout': { label: 'חוסרים', color: '#F6B93B', bg: 'bg-[#F6B93B]/10' },
  'margin-drop': { label: 'שחיקת רווח', color: '#6C5CE7', bg: 'bg-[#6C5CE7]/10' },
  'sales-decline': { label: 'ירידת מכירות', color: '#DC4E59', bg: 'bg-[#DC4E59]/10' },
}

// Seasonal weights for monthly target distribution: higher in holiday/summer months
const SEASONAL_WEIGHTS = [0.88, 0.85, 0.95, 1.08, 1.02, 1.05, 1.04, 1.00, 1.10, 1.06, 0.98, 0.99]

function CategoryDrillDown() {
  const { categoryId } = Route.useParams()
  const categoryName = DEPARTMENT_NAMES[categoryId] ?? categoryId

  // Single pass over allBranches to collect everything
  const derived = useMemo(() => {
    const rows: BranchCategoryRow[] = []
    let totalInventoryDays = 0
    let totalStockout = 0
    const monthlyTrend = new Array(12).fill(0)
    const monthlyTarget = new Array(12).fill(0)
    const promotions: Promotion[] = []

    for (let bi = 0; bi < allBranches.length; bi++) {
      const branch = allBranches[bi]
      const dept = branch.departments.find(d => d.id === categoryId)
      if (!dept) continue

      const seed = (bi * 7 + categoryId.length * 13) % 17
      const targetVariation = 0.92 + (seed / 17) * 0.16
      const adjustedTarget = dept.targetSales * targetVariation

      rows.push({
        branchName: branch.name,
        sales: dept.sales,
        targetSales: adjustedTarget,
        targetAchievement: adjustedTarget > 0 ? (dept.sales / adjustedTarget) * 100 : 100,
        grossMarginPercent: dept.grossMarginPercent,
        inventoryDays: dept.inventoryDays,
        yoyChange: dept.yoyChange,
        stockoutRate: dept.stockoutRate,
      })

      totalInventoryDays += dept.inventoryDays
      totalStockout += dept.stockoutRate
      for (let i = 0; i < 12; i++) {
        monthlyTrend[i] += dept.monthlyTrend[i] ?? 0
        monthlyTarget[i] += (dept.targetSales / 12) * SEASONAL_WEIGHTS[i]
      }
      promotions.push(...dept.promotions)
    }

    rows.sort((a, b) => b.sales - a.sales)

    const count = rows.length || 1
    const totalSales = rows.reduce((s, b) => s + b.sales, 0)
    const totalTarget = rows.reduce((s, b) => s + b.targetSales, 0)
    const avgMargin = +(rows.reduce((s, b) => s + b.grossMarginPercent, 0) / count).toFixed(1)
    const avgInventoryDays = Math.round(totalInventoryDays / count)
    const avgStockout = +(totalStockout / count).toFixed(1)
    const targetAchievement = totalTarget > 0 ? ((totalSales - totalTarget) / totalTarget) * 100 : 0

    const chartData = monthlyTrend.map((sales, i) => ({
      month: MONTHS_HE[i],
      sales: Math.round(sales / 1000),
      target: Math.round(monthlyTarget[i] / 1000),
    }))

    // Derive branch alerts
    const networkAvgMargin = avgMargin
    const alerts: BranchAlert[] = []

    for (const row of rows) {
      if (row.targetAchievement < 90) {
        alerts.push({
          branchName: row.branchName,
          kind: 'target-miss',
          severity: row.targetAchievement < 80 ? 'critical' : 'warning',
          headline: `עמידה ביעד ${row.targetAchievement.toFixed(0)}%`,
          detail: `פער של ${formatCurrencyShort(row.targetSales - row.sales)} מהיעד`,
        })
      }
      if (row.stockoutRate > 3.5) {
        alerts.push({
          branchName: row.branchName,
          kind: 'stockout',
          severity: row.stockoutRate > 5 ? 'critical' : 'warning',
          headline: `חוסרים ${row.stockoutRate}%`,
          detail: `${row.inventoryDays} ימי מלאי בלבד`,
        })
      }
      if (row.grossMarginPercent < networkAvgMargin - 3) {
        alerts.push({
          branchName: row.branchName,
          kind: 'margin-drop',
          severity: row.grossMarginPercent < networkAvgMargin - 5 ? 'critical' : 'warning',
          headline: `רווח ${row.grossMarginPercent}% (ממוצע ${networkAvgMargin}%)`,
          detail: `פער של ${(networkAvgMargin - row.grossMarginPercent).toFixed(1)}% מהממוצע`,
        })
      }
      if (row.yoyChange < -5) {
        alerts.push({
          branchName: row.branchName,
          kind: 'sales-decline',
          severity: row.yoyChange < -10 ? 'critical' : 'warning',
          headline: `ירידה של ${Math.abs(row.yoyChange).toFixed(1)}% שנתי`,
          detail: `מכירות ${formatCurrencyShort(row.sales)}`,
        })
      }
    }

    // Sort: critical first, then by kind
    alerts.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1
      return 0
    })

    // Group alerts by branch for table display
    const groupedAlerts = new Map<string, BranchAlert[]>()
    for (const a of alerts) {
      const list = groupedAlerts.get(a.branchName) ?? []
      list.push(a)
      groupedAlerts.set(a.branchName, list)
    }

    return {
      rows, totalSales, avgMargin, avgInventoryDays, avgStockout,
      targetAchievement, chartData, promotions: promotions.slice(0, 3),
      alerts, groupedAlerts: Array.from(groupedAlerts.entries()),
    }
  }, [categoryId])

  const { rows: branchData, totalSales, avgMargin, avgInventoryDays, avgStockout, targetAchievement, chartData, promotions, alerts, groupedAlerts } = derived

  if (branchData.length === 0) {
    return (
      <PageContainer>
        <Breadcrumbs items={[{ label: 'מנהל קטגוריה', to: '/category-manager' }]} />
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-[#2D3748]">הקטגוריה לא נמצאה</h2>
          <p className="text-[#4A5568] mt-2">הקטגוריה &quot;{categoryId}&quot; לא קיימת במערכת</p>
        </div>
      </PageContainer>
    )
  }

  const kpis: KPICardData[] = [
    {
      label: 'מכירות כוללות',
      value: totalSales,
      format: 'currencyShort',
      trend: +targetAchievement.toFixed(1),
      trendLabel: 'מול יעד',
      gradient: targetAchievement >= 0 ? 'green' : 'red',
    },
    {
      label: 'רווח גולמי',
      value: avgMargin,
      format: 'percent',
      trend: 0.8,
      trendLabel: 'שנתי',
      gradient: avgMargin >= 20 ? 'purple' : 'red',
    },
    {
      label: 'ממוצע ימי מלאי',
      value: avgInventoryDays,
      format: 'number',
      trend: 1.2,
      trendLabel: 'שנתי',
      gradient: 'blue',
    },
    {
      label: 'שיעור חוסרים',
      value: avgStockout,
      format: 'percent',
      trend: avgStockout > 3 ? -avgStockout : avgStockout,
      trendLabel: '',
      gradient: avgStockout > 4 ? 'red' : avgStockout > 2 ? 'orange' : 'green',
    },
  ]

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'מנהל קטגוריה', to: '/category-manager' },
          { label: categoryName },
        ]}
      />

      <h2 className="text-4xl font-bold text-[#2D3748]">{categoryName}</h2>

      <CategoryAIBriefing categoryId={categoryId} categoryName={categoryName} />

      <KPIGrid items={kpis} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <Card className="border-warm-border rounded-[16px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#2D3748]">מגמת מכירות — {categoryName} (12 חודשים)</CardTitle>
          </CardHeader>
          <CardContent>
            <div dir="ltr" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 16, fill: '#4A5568' }} />
                  <YAxis
                    tickFormatter={(v: number) => formatCurrencyShort(v * 1000)}
                    tick={{ fontSize: 16, fill: '#A0AEC0' }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `₪${Number(value).toLocaleString()}K`,
                      name === 'sales' ? 'מכירות' : 'יעד',
                    ]}
                    contentStyle={{ direction: 'rtl', borderRadius: '10px', border: '1px solid #FFE8DE', fontSize: 18, color: '#2D3748' }}
                    itemStyle={{ color: '#4A5568' }}
                    labelStyle={{ color: '#2D3748', fontWeight: 600 }}
                  />
                  <Legend
                    formatter={(v: string) => <span style={{ color: '#4A5568' }}>{v === 'sales' ? 'מכירות' : 'יעד'}</span>}
                    iconType="plainline"
                    wrapperStyle={{ fontSize: 18, paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="rgba(220, 78, 89, 0.15)"
                    stroke="#DC4E59"
                    strokeWidth={2}
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#F6B93B"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#F6B93B' }}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <CategorySuppliersDashboard categoryId={categoryId} categoryName={categoryName} />

      <PromotionCard promotions={promotions} categoryName={categoryName} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-[#DC4E59]" />
                <CardTitle className="text-2xl text-[#2D3748]">
                  חריגות סניפים — {categoryName}
                </CardTitle>
              </div>
              <span className="text-lg text-[#A0AEC0]">
                {alerts.length > 0
                  ? `${alerts.length} חריגות ב-${groupedAlerts.length} סניפים`
                  : 'אין חריגות'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#2EC4D5] mb-3" />
                <p className="text-xl font-semibold text-[#2D3748]">כל הסניפים תקינים</p>
                <p className="text-lg text-[#A0AEC0] mt-1">לא זוהו חריגות בקטגוריה זו</p>
              </div>
            ) : (
              <div className="overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[500px] text-lg">
                  <thead>
                    <tr className="border-b border-[#FFF0EA]">
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">סניף</th>
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">חריגות</th>
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">פירוט</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedAlerts.map(([branch, branchAlerts], i) => {
                      const hasCritical = branchAlerts.some(a => a.severity === 'critical')
                      return (
                        <motion.tr
                          key={branch}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`border-b border-[#FFF0EA] ${hasCritical ? 'bg-[#DC4E59]/[0.03]' : 'hover:bg-[#FDF8F6]'} transition-colors`}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              {hasCritical && <span className="w-2 h-2 rounded-full bg-[#DC4E59] shrink-0" />}
                              <span className="font-medium text-[#2D3748] text-[20px]">{branch}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {branchAlerts.map(a => {
                                const cfg = ALERT_CONFIG[a.kind]
                                return (
                                  <span
                                    key={a.kind}
                                    className="text-[15px] font-bold px-2 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: cfg.color }}
                                  >
                                    {cfg.label}
                                  </span>
                                )
                              })}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-0.5">
                              {branchAlerts.map(a => (
                                <p key={a.kind} className="text-[18px] text-[#4A5568]">
                                  {a.headline}
                                </p>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager/$categoryId')({
  component: CategoryDrillDown,
})
