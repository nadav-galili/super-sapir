import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { PromotionCard } from '@/components/dashboard/PromotionCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type SortingState, type ColumnDef,
} from '@tanstack/react-table'
import { motion } from 'motion/react'
import { SortHeader } from '@/components/tables/SortHeader'
import { allBranches } from '@/data/mock-branches'
import { DEPARTMENT_NAMES, MONTHS_HE } from '@/data/constants'
import { formatCurrencyShort, formatPercent } from '@/lib/format'
import { getGrowthColor, getTargetColor, getMarginColor } from '@/lib/colors'
import type { KPICardData, Promotion } from '@/data/types'

interface BranchCategoryRow {
  branchName: string
  sales: number
  targetSales: number
  targetAchievement: number
  grossMarginPercent: number
  inventoryDays: number
  yoyChange: number
}

// Seasonal weights for monthly target distribution: higher in holiday/summer months
const SEASONAL_WEIGHTS = [0.88, 0.85, 0.95, 1.08, 1.02, 1.05, 1.04, 1.00, 1.10, 1.06, 0.98, 0.99]

function CategoryDrillDown() {
  const { categoryId } = Route.useParams()
  const categoryName = DEPARTMENT_NAMES[categoryId] ?? categoryId

  // Single pass over allBranches to collect everything
  const derived = useMemo(() => {
    const rows: BranchCategoryRow[] = []
    let totalTurnover = 0
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
      })

      totalTurnover += dept.inventoryTurnover
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
    const avgTurnover = +(totalTurnover / count).toFixed(1)
    const avgStockout = +(totalStockout / count).toFixed(1)
    const targetAchievement = totalTarget > 0 ? ((totalSales - totalTarget) / totalTarget) * 100 : 0

    return {
      rows, totalSales, avgMargin, avgTurnover, avgStockout,
      targetAchievement, monthlyTrend, monthlyTarget, promotions: promotions.slice(0, 3),
    }
  }, [categoryId])

  const { rows: branchData, totalSales, avgMargin, avgTurnover, avgStockout, targetAchievement, monthlyTrend, monthlyTarget, promotions } = derived

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
      value: avgTurnover,
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

  const [sorting, setSorting] = useState<SortingState>([{ id: 'sales', desc: true }])

  const columns = useMemo<ColumnDef<BranchCategoryRow>[]>(() => [
    {
      accessorKey: 'branchName',
      header: 'סניף',
      cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: 'sales',
      header: ({ column }) => <SortHeader column={column} label="מכירות" />,
      cell: ({ getValue }) => <span className="font-semibold font-mono" dir="ltr">{formatCurrencyShort(getValue() as number)}</span>,
    },
    {
      accessorKey: 'targetAchievement',
      header: ({ column }) => <SortHeader column={column} label="עמידה ביעד" />,
      cell: ({ getValue }) => {
        const val = getValue() as number
        return (
          <span className="font-mono" dir="ltr" style={{ color: getTargetColor(val) }}>
            {val.toFixed(0)}%
          </span>
        )
      },
    },
    {
      accessorKey: 'grossMarginPercent',
      header: ({ column }) => <SortHeader column={column} label="רווח גולמי %" />,
      cell: ({ getValue }) => {
        const val = getValue() as number
        return <span className="font-mono" dir="ltr" style={{ color: getMarginColor(val) }}>{val.toFixed(1)}%</span>
      },
    },
    {
      accessorKey: 'inventoryDays',
      header: ({ column }) => <SortHeader column={column} label="ימי מלאי" />,
      cell: ({ getValue }) => <span className="font-mono" dir="ltr">{getValue() as number}</span>,
    },
    {
      accessorKey: 'yoyChange',
      header: ({ column }) => <SortHeader column={column} label="שינוי שנתי" />,
      cell: ({ getValue }) => {
        const change = getValue() as number
        return (
          <span style={{ color: getGrowthColor(change) }} className="font-semibold font-mono" dir="ltr">
            {change > 0 ? '+' : ''}{formatPercent(change)}
          </span>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data: branchData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'מנהל קטגוריה', to: '/category-manager' },
          { label: categoryName },
        ]}
      />

      <h2 className="text-2xl font-bold text-[#2D3748]">{categoryName}</h2>

      <KPIGrid items={kpis} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <Card className="border-warm-border rounded-[16px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#2D3748]">מגמת מכירות — {categoryName} (12 חודשים)</CardTitle>
          </CardHeader>
          <CardContent>
            <div dir="ltr" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyTrend.map((sales, i) => ({
                    month: MONTHS_HE[i],
                    sales: Math.round(sales / 1000),
                    target: Math.round(monthlyTarget[i] / 1000),
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A5568' }} />
                  <YAxis
                    tickFormatter={(v: number) => formatCurrencyShort(v * 1000)}
                    tick={{ fontSize: 11, fill: '#A0AEC0' }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `₪${Number(value).toLocaleString()}K`,
                      name === 'sales' ? 'מכירות' : 'יעד',
                    ]}
                    contentStyle={{ direction: 'rtl', borderRadius: '10px', border: '1px solid #FFE8DE', fontSize: 12, color: '#2D3748' }}
                    itemStyle={{ color: '#4A5568' }}
                    labelStyle={{ color: '#2D3748', fontWeight: 600 }}
                  />
                  <Legend
                    formatter={(v: string) => <span style={{ color: '#4A5568' }}>{v === 'sales' ? 'מכירות' : 'יעד'}</span>}
                    iconType="plainline"
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">השוואת סניפים — {categoryName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id} className="border-b border-[#FFF0EA]">
                      {hg.headers.map(header => (
                        <th key={header.id} className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-3 py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <PromotionCard promotions={promotions} categoryName={categoryName} />
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager/$categoryId')({
  component: CategoryDrillDown,
})
