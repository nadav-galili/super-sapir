import { useMemo, useState } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type SortingState, type ColumnDef,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComparisonToggle } from '@/components/dashboard/ComparisonToggle'
import { SortHeader } from '@/components/tables/SortHeader'
import { formatCurrencyShort } from '@/lib/format'
import { CATEGORY_MANAGER_INVENTORY_DAYS_GOAL, CATEGORY_MANAGER_MARGIN_BASELINE, getComparisonLabel, type CategorySnapshot } from '@/lib/category-manager'
import type { ComparisonMode } from '@/data/types'

interface CategoryTableProps {
  data: CategorySnapshot[]
  comparisonMode: ComparisonMode
  onComparisonChange: (mode: ComparisonMode) => void
}

function getInventoryDaysColor(inventoryDays: number): string {
  if (inventoryDays > CATEGORY_MANAGER_INVENTORY_DAYS_GOAL) return '#DC4E59'
  if (inventoryDays >= CATEGORY_MANAGER_INVENTORY_DAYS_GOAL - 1) return '#F6B93B'
  return '#2EC4D5'
}

export function CategoryTable({ data, comparisonMode, onComparisonChange }: CategoryTableProps) {
  const comparisonLabel = getComparisonLabel(comparisonMode)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'downsideEstimate', desc: true }])

  const columns = useMemo<ColumnDef<CategorySnapshot>[]>(() => [
    {
      accessorKey: 'category.name',
      header: 'קטגוריה',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#2D3748]">{row.original.category.name}</span>
            <Badge
              variant={
                row.original.status === 'danger'
                  ? 'destructive'
                  : row.original.status === 'opportunity'
                    ? 'success'
                    : 'warning'
              }
            >
              {row.original.status === 'danger'
                ? 'טיפול מיידי'
                : row.original.status === 'opportunity'
                  ? 'פוטנציאל'
                  : 'מעקב'}
            </Badge>
          </div>
          <p className="text-xs text-[#A0AEC0]">{row.original.focusAction}</p>
        </div>
      ),
    },
    {
      accessorKey: 'comparisonChange',
      header: ({ column }) => <SortHeader column={column} label="ביצוע" />,
      cell: ({ getValue }) => (
        <span
          className="font-semibold font-mono"
          dir="ltr"
          style={{ color: (getValue() as number) >= 0 ? '#2EC4D5' : '#DC4E59' }}
        >
          {(getValue() as number) > 0 ? '+' : ''}{(getValue() as number).toFixed(1)}%
        </span>
      ),
    },
    {
      accessorKey: 'shareGap',
      header: ({ column }) => <SortHeader column={column} label="פער נתח" />,
      cell: ({ getValue }) => {
        const val = getValue() as number
        return (
          <span className="font-mono" dir="ltr" style={{ color: val >= 0 ? '#2EC4D5' : '#DC4E59' }}>
            {val > 0 ? '+' : ''}{val.toFixed(1)}%
          </span>
        )
      },
    },
    {
      accessorKey: 'normalizedGrossMarginPercent',
      header: ({ column }) => <SortHeader column={column} label='רווח גולמי' />,
      cell: ({ getValue }) => {
        const val = getValue() as number
        return (
          <span className="font-mono" dir="ltr" style={{ color: val >= CATEGORY_MANAGER_MARGIN_BASELINE ? '#2D3748' : '#DC4E59' }}>
            {val.toFixed(1)}%
          </span>
        )
      },
    },
    {
      accessorKey: 'inventoryDays',
      header: ({ column }) => <SortHeader column={column} label="ימי מלאי" />,
      cell: ({ getValue }) => {
        const inventoryDays = getValue() as number
        const delta = inventoryDays - CATEGORY_MANAGER_INVENTORY_DAYS_GOAL

        return (
          <div className="space-y-0.5">
            <p>
              <span
                className="font-mono font-semibold tabular-nums"
                style={{ color: getInventoryDaysColor(inventoryDays) }}
              >
                {inventoryDays}
              </span>
            </p>
            <p className="whitespace-nowrap text-[11px] text-[#A0AEC0]">
              {delta > 0 ? `${delta}+ מעל היעד` : delta < 0 ? `${Math.abs(delta)} מתחת ליעד` : 'בדיוק ביעד'}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: 'stockoutExposure',
      header: ({ column }) => <SortHeader column={column} label="פדיון בסיכון" />,
      cell: ({ getValue }) => <span className="font-semibold font-mono" dir="ltr">{formatCurrencyShort(getValue() as number)}</span>,
    },
    {
      accessorKey: 'avgPromoRoi',
      header: ({ column }) => <SortHeader column={column} label='ROI מבצעים' />,
      cell: ({ row, getValue }) => {
        const value = getValue() as number
        return (
          <div className="space-y-0.5 whitespace-nowrap">
            <p><span className="font-mono font-semibold text-[#2EC4D5]">{value.toFixed(2)}x</span></p>
            <p className="text-[11px] text-[#A0AEC0]">uplift {row.original.avgPromoUplift.toFixed(1)}%</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'weakBranchCount',
      header: ({ column }) => <SortHeader column={column} label="פער סניפים" />,
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs text-[#4A5568]">
          <p>{row.original.weakBranchCount} סניפים חלשים</p>
          <p className="text-[#A0AEC0]">
            {row.original.topBranchName} מול {row.original.weakestBranchName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'downsideEstimate',
      header: ({ column }) => <SortHeader column={column} label="השפעה" />,
      cell: ({ row }) => {
        const impact = row.original.status === 'opportunity'
          ? row.original.upsideEstimate
          : row.original.downsideEstimate

        return (
          <div className="space-y-0.5 whitespace-nowrap">
            <p>
              <span
                className="font-semibold font-mono"
                style={{ color: row.original.status === 'opportunity' ? '#2EC4D5' : '#DC4E59' }}
              >
                {formatCurrencyShort(impact)}
              </span>
            </p>
            <p className="text-[11px] text-[#A0AEC0]">
              {row.original.status === 'opportunity' ? 'פוטנציאל' : 'סיכון'} מוערך
            </p>
          </div>
        )
      },
    },
    {
      id: 'action',
      header: 'קפיצה',
      cell: ({ row }) => (
        <Link
          to="/category-manager/$categoryId"
          params={{ categoryId: row.original.category.id }}
          className="text-[#DC4E59] hover:text-[#E8777F] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      ),
      size: 40,
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-[#2D3748]">לוח פעולה לפי קטגוריה</CardTitle>
              <p className="mt-1 text-xs sm:text-sm text-[#4A5568]">
                השוואה פעילה: {comparisonLabel} | יעד ימי מלאי: {CATEGORY_MANAGER_INVENTORY_DAYS_GOAL}
              </p>
            </div>
            <ComparisonToggle value={comparisonMode} onChange={onComparisonChange} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[800px] text-sm">
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
  )
}
