import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ArrowUpDown, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort, formatPercent } from '@/lib/format'
import { getGrowthColor } from '@/lib/colors'
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
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          מכירות <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="font-semibold" dir="ltr">{formatCurrencyShort(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: 'sharePercent',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          נתח % <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => <span dir="ltr">{(getValue() as number).toFixed(1)}%</span>,
    },
    {
      accessorKey: 'targetShare',
      header: 'יעד %',
      cell: ({ getValue }) => <span className="text-muted-foreground" dir="ltr">{(getValue() as number).toFixed(1)}%</span>,
    },
    {
      accessorKey: 'yoyChange',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          שינוי שנתי <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => {
        const change = getValue() as number
        return (
          <span style={{ color: getGrowthColor(change) }} className="font-semibold" dir="ltr">
            {change > 0 ? '+' : ''}{formatPercent(change)}
          </span>
        )
      },
    },
    {
      accessorKey: 'bestBranch',
      header: 'סניף מוביל',
      cell: ({ getValue }) => <span className="text-sm">{getValue() as string}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link
          to="/category-manager/$categoryId"
          params={{ categoryId: row.original.id }}
          className="text-blue-500 hover:text-blue-700"
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
      transition={{ delay: 0.4, duration: 0.5 }}
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
                  <tr key={hg.id} className="border-b">
                    {hg.headers.map(header => (
                      <th key={header.id} className="px-3 py-2 text-right font-medium text-muted-foreground">
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
                    className="border-b hover:bg-accent/50 transition-colors"
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
