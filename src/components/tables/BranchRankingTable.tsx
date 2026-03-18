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
import { Badge } from '@/components/ui/badge'
import { formatCurrencyShort, formatPercent } from '@/lib/format'
import { getPerformanceColor } from '@/lib/colors'
import type { Branch } from '@/data/types'

interface BranchRankingTableProps {
  branches: Branch[]
  title?: string
}

export function BranchRankingTable({ branches, title = 'דירוג סניפים' }: BranchRankingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'totalSales', desc: true }])

  const columns = useMemo<ColumnDef<Branch>[]>(() => [
    {
      id: 'rank',
      header: '#',
      cell: ({ row }) => (
        <Badge
          variant={row.index < 3 ? 'default' : 'secondary'}
          className="w-7 h-7 rounded-full flex items-center justify-center p-0"
        >
          {row.index + 1}
        </Badge>
      ),
      enableSorting: false,
      size: 50,
    },
    {
      accessorKey: 'name',
      header: 'סניף',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">#{row.original.branchNumber}</span>
        </div>
      ),
    },
    {
      id: 'totalSales',
      accessorFn: (row) => row.metrics.totalSales,
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
      id: 'qualityScore',
      accessorFn: (row) => row.metrics.qualityScore,
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          איכות <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => {
        const score = getValue() as number
        return (
          <span className="font-semibold" style={{ color: getPerformanceColor(score) }} dir="ltr">
            {score}
          </span>
        )
      },
    },
    {
      id: 'yoyGrowth',
      accessorFn: (row) => row.metrics.yoyGrowth,
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          צמיחה <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => {
        const growth = getValue() as number
        return (
          <span className={growth >= 0 ? 'text-emerald-600' : 'text-red-500'} dir="ltr">
            {growth >= 0 ? '+' : ''}{formatPercent(growth)}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link
          to="/store-manager/$branchId"
          params={{ branchId: row.original.id }}
          className="text-blue-500 hover:text-blue-700"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      ),
      size: 40,
    },
  ], [])

  const table = useReactTable({
    data: branches,
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
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
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
                    transition={{ delay: i * 0.05 }}
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
