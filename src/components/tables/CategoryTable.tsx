import { useMemo, useState } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type SortingState, type ColumnDef,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SortHeader } from '@/components/tables/SortHeader'
import { formatCurrencyShort, formatPercent } from '@/lib/format'
import { getGrowthColor, getTargetColor, getMarginColor } from '@/lib/colors'
import type { CategorySummary } from '@/data/mock-categories'

interface CategoryTableProps {
  data: CategorySummary[]
}

export function CategoryTable({ data }: CategoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'sales', desc: true }])

  const columns = useMemo<ColumnDef<CategorySummary>[]>(() => [
    {
      accessorKey: 'name',
      header: 'קטגוריה',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'sales',
      header: ({ column }) => <SortHeader column={column} label="מכירות" />,
      cell: ({ getValue }) => (
        <span className="font-semibold font-mono" dir="ltr">{formatCurrencyShort(getValue() as number)}</span>
      ),
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
      id: 'targetAchievement',
      header: ({ column }) => <SortHeader column={column} label="עמידה ביעד" />,
      accessorFn: (row) => row.targetSales > 0 ? (row.sales / row.targetSales) * 100 : 100,
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
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link
          to="/category-manager/$categoryId"
          params={{ categoryId: row.original.id }}
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
          <CardTitle className="text-lg">טבלת קטגוריות מפורטת</CardTitle>
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
  )
}
