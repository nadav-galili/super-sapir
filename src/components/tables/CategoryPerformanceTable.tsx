import { useMemo, useState } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type SortingState, type ColumnDef,
} from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ArrowUpDown, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import type { CategorySnapshot } from '@/lib/category-manager'

interface CategoryPerformanceTableProps {
  snapshots: CategorySnapshot[]
}

const STATUS_CONFIG = {
  opportunity: { label: 'ביצוע טוב', color: 'bg-[#2EC4D5]/10 text-[#2EC4D5] border-[#2EC4D5]/20', barColor: '#2EC4D5' },
  danger: { label: 'חריג', color: 'bg-[#DC4E59]/10 text-[#DC4E59] border-[#DC4E59]/20', barColor: '#DC4E59' },
  monitor: { label: 'עוקב', color: 'bg-[#F6B93B]/10 text-[#F6B93B] border-[#F6B93B]/20', barColor: '#F6B93B' },
} as const

export function CategoryPerformanceTable({ snapshots }: CategoryPerformanceTableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'sales', desc: true }])

  const maxSales = useMemo(() => Math.max(...snapshots.map(s => s.category.sales)), [snapshots])

  const columns = useMemo<ColumnDef<CategorySnapshot>[]>(() => [
    {
      accessorKey: 'category.name',
      header: 'קטגוריה',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
            className="w-9 h-9 rounded-[10px] overflow-hidden border border-warm-border bg-[#FDF8F6] shrink-0"
          >
            <img
              src={`/categories/${row.original.category.id}.png`}
              alt={row.original.category.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <span className="font-medium text-[#2D3748]">{row.original.category.name}</span>
        </div>
      ),
    },
    {
      id: 'sales',
      accessorFn: (row) => row.category.sales,
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          מכירות ₪ <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row, getValue }) => {
        const sales = getValue() as number
        const pct = maxSales > 0 ? (sales / maxSales) * 100 : 0
        const barColor = STATUS_CONFIG[row.original.status].barColor
        return (
          <div className="min-w-[120px]">
            <span className="font-semibold font-mono text-[13px]" dir="ltr">{formatCurrencyShort(sales)}</span>
            <div className="mt-1 h-1.5 w-full bg-[#FFF0EA] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      },
    },
    {
      id: 'yoyChange',
      accessorFn: (row) => row.category.yoyChange,
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          שינוי שנתי % <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => {
        const val = getValue() as number
        return (
          <span
            className={`font-semibold font-mono ${val >= 0 ? 'text-[#2EC4D5]' : 'text-[#DC4E59]'}`}
            dir="ltr"
          >
            {val >= 0 ? '+' : ''}{val}%
          </span>
        )
      },
    },
    {
      id: 'grossMargin',
      accessorFn: (row) => row.normalizedGrossMarginPercent,
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          רווח גולמי % <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono" dir="ltr">{(getValue() as number).toFixed(1)}%</span>
      ),
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: 'סטטוס',
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status]
        return (
          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-[20px] border ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      },
      sortingFn: (a, b) => {
        const order = { danger: 0, monitor: 1, opportunity: 2 }
        return order[a.original.status] - order[b.original.status]
      },
    },
    {
      id: 'action',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate({ to: '/category-manager/$categoryId', params: { categoryId: row.original.category.id } })
          }}
          className="text-[#DC4E59] hover:text-[#E8777F] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      ),
      size: 40,
      enableSorting: false,
    },
  ], [navigate, maxSales])

  const table = useReactTable({
    data: snapshots,
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
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[#DC4E59]" />
            <CardTitle className="text-lg text-[#2D3748]">ביצועי קטגוריות</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px] text-sm">
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
                    onClick={() => navigate({ to: '/category-manager/$categoryId', params: { categoryId: row.original.category.id } })}
                    className="cursor-pointer border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
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
