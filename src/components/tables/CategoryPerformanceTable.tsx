import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyShort } from '@/lib/format'
import type { CategorySnapshot } from '@/lib/category-manager'

interface CategoryPerformanceTableProps {
  snapshots: CategorySnapshot[]
}

type SortKey = 'name' | 'sales' | 'yoyChange' | 'grossMargin' | 'status'

const STATUS_CONFIG = {
  opportunity: { label: 'ביצוע טוב', color: 'bg-[#2EC4D5]/10 text-[#2EC4D5] border-[#2EC4D5]/20' },
  danger: { label: 'חריג', color: 'bg-[#DC4E59]/10 text-[#DC4E59] border-[#DC4E59]/20' },
  monitor: { label: 'עוקב', color: 'bg-[#F6B93B]/10 text-[#F6B93B] border-[#F6B93B]/20' },
} as const

export function CategoryPerformanceTable({ snapshots }: CategoryPerformanceTableProps) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('sales')
  const [sortDesc, setSortDesc] = useState(true)

  const sorted = useMemo(() => {
    const copy = [...snapshots]
    copy.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.category.name.localeCompare(b.category.name, 'he'); break
        case 'sales': cmp = a.category.sales - b.category.sales; break
        case 'yoyChange': cmp = a.category.yoyChange - b.category.yoyChange; break
        case 'grossMargin': cmp = a.normalizedGrossMarginPercent - b.normalizedGrossMarginPercent; break
        case 'status': {
          const order = { danger: 0, monitor: 1, opportunity: 2 }
          cmp = order[a.status] - order[b.status]
          break
        }
      }
      return sortDesc ? -cmp : cmp
    })
    return copy
  }, [snapshots, sortKey, sortDesc])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortKey(key)
      setSortDesc(true)
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null
    return sortDesc
      ? <ChevronDown className="w-3 h-3 inline-block" />
      : <ChevronUp className="w-3 h-3 inline-block" />
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">ביצועי קטגוריות</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-border">
                <th
                  className="text-right py-2.5 px-4 text-[11px] font-semibold text-[#A0AEC0] cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort('name')}
                >
                  קטגוריה <SortIcon col="name" />
                </th>
                <th
                  className="text-right py-2.5 px-4 text-[11px] font-semibold text-[#A0AEC0] cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort('sales')}
                >
                  מכירות ₪ <SortIcon col="sales" />
                </th>
                <th
                  className="text-right py-2.5 px-4 text-[11px] font-semibold text-[#A0AEC0] cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort('yoyChange')}
                >
                  שינוי שנתי % <SortIcon col="yoyChange" />
                </th>
                <th
                  className="text-right py-2.5 px-4 text-[11px] font-semibold text-[#A0AEC0] cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort('grossMargin')}
                >
                  רווח גולמי % <SortIcon col="grossMargin" />
                </th>
                <th
                  className="text-right py-2.5 px-4 text-[11px] font-semibold text-[#A0AEC0] cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort('status')}
                >
                  סטטוס <SortIcon col="status" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((snap, i) => {
                const statusCfg = STATUS_CONFIG[snap.status]
                const yoyPositive = snap.category.yoyChange >= 0
                return (
                  <motion.tr
                    key={snap.category.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    onClick={() => navigate({ to: '/category-manager/$categoryId', params: { categoryId: snap.category.id } })}
                    className="cursor-pointer border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                  >
                    <td className="py-2.5 px-4 font-medium text-[#2D3748] text-[13px]">
                      {snap.category.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[13px] text-[#2D3748]" dir="ltr">
                      {formatCurrencyShort(snap.category.sales)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-semibold text-[13px] ${yoyPositive ? 'text-[#2EC4D5]' : 'text-[#DC4E59]'}`}
                        dir="ltr"
                      >
                        {yoyPositive ? '+' : ''}{snap.category.yoyChange}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[13px] text-[#2D3748]" dir="ltr">
                      {snap.normalizedGrossMarginPercent}%
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-[20px] border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
