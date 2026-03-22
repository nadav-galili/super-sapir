import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { PromotionCard } from '@/components/dashboard/PromotionCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type SortingState, type ColumnDef,
} from '@tanstack/react-table'
import { motion } from 'motion/react'
import { SortHeader } from '@/components/tables/SortHeader'
import { allBranches } from '@/data/mock-branches'
import { DEPARTMENT_NAMES } from '@/data/constants'
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

function CategoryDrillDown() {
  const { categoryId } = Route.useParams()
  const categoryName = DEPARTMENT_NAMES[categoryId] ?? categoryId

  // Single pass over allBranches to collect everything
  const derived = useMemo(() => {
    const rows: BranchCategoryRow[] = []
    let totalTurnover = 0
    let totalStockout = 0
    const monthlyTrend = new Array(12).fill(0)
    const promotions: Promotion[] = []

    for (const branch of allBranches) {
      const dept = branch.departments.find(d => d.id === categoryId)
      if (!dept) continue

      rows.push({
        branchName: branch.name,
        sales: dept.sales,
        targetSales: dept.targetSales,
        targetAchievement: dept.targetSales > 0 ? (dept.sales / dept.targetSales) * 100 : 100,
        grossMarginPercent: dept.grossMarginPercent,
        inventoryDays: dept.inventoryDays,
        yoyChange: dept.yoyChange,
      })

      totalTurnover += dept.inventoryTurnover
      totalStockout += dept.stockoutRate
      for (let i = 0; i < 12; i++) {
        monthlyTrend[i] += dept.monthlyTrend[i] ?? 0
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
      targetAchievement, monthlyTrend, promotions: promotions.slice(0, 3),
    }
  }, [categoryId])

  const { rows: branchData, totalSales, avgMargin, avgTurnover, avgStockout, targetAchievement, monthlyTrend, promotions } = derived

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
      label: 'מחזור מלאי',
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

      <TrendLineChart data={monthlyTrend} title={`מגמת מכירות — ${categoryName} (12 חודשים)`} />

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
