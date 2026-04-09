import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import { usePeriodMultiplier } from '@/contexts/PeriodContext'
import { SupplierLogo } from '@/components/dashboard/SupplierLogo'
import { getTopSuppliers, type ChainSupplier } from '@/data/mock-suppliers'

const ROG_CHART_COLORS = ['#EF4444', '#22C55E', '#F97316', '#FBBF24', '#A0AEC0']
const PAGE_SIZE = 10

type SortKey = 'sales' | 'targetPct' | 'grossProfitPercent'
type SortDir = 'asc' | 'desc'

function getTargetPct(s: ChainSupplier) {
  return s.targetSales > 0 ? (s.sales / s.targetSales) * 100 : 100
}

export function SuppliersTableROG() {
  const m = usePeriodMultiplier()
  const allSuppliers = useMemo(() => getTopSuppliers().map(s => ({
    ...s,
    sales: Math.round(s.sales * m),
    targetSales: Math.round(s.targetSales * m),
  })), [m])
  const maxSales = allSuppliers[0]?.sales ?? 1
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sortKey) return allSuppliers
    const list = [...allSuppliers]
    list.sort((a, b) => {
      let av: number, bv: number
      if (sortKey === 'sales') { av = a.sales; bv = b.sales }
      else if (sortKey === 'targetPct') { av = getTargetPct(a); bv = getTargetPct(b) }
      else { av = a.grossProfitPercent; bv = b.grossProfitPercent }
      return sortDir === 'desc' ? bv - av : av - bv
    })
    return list
  }, [allSuppliers, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageSuppliers = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const globalOffset = page * PAGE_SIZE

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(0)
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="w-4 h-4 opacity-40" />
    return sortDir === 'desc'
      ? <ArrowDown className="w-4 h-4 text-[#F97316]" />
      : <ArrowUp className="w-4 h-4 text-[#F97316]" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card>
        <CardContent>
          <div className="overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[500px] text-lg">
              <thead>
                <tr className="border-b border-[#FFF0EA]">
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">#</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">ספק</th>
                  <th
                    className="px-3 py-2 text-right font-medium text-[#A0AEC0] cursor-pointer select-none hover:text-[#4A5568] transition-colors"
                    onClick={() => handleSort('sales')}
                  >
                    <span className="inline-flex items-center gap-1">מכירות ₪ <SortIcon column="sales" /></span>
                  </th>
                  <th
                    className="px-3 py-2 text-right font-medium text-[#A0AEC0] cursor-pointer select-none hover:text-[#4A5568] transition-colors"
                    onClick={() => handleSort('targetPct')}
                  >
                    <span className="inline-flex items-center gap-1">עמידה ביעד <SortIcon column="targetPct" /></span>
                  </th>
                  <th
                    className="px-3 py-2 text-right font-medium text-[#A0AEC0] cursor-pointer select-none hover:text-[#4A5568] transition-colors"
                    onClick={() => handleSort('grossProfitPercent')}
                  >
                    <span className="inline-flex items-center gap-1">רווח גולמי % <SortIcon column="grossProfitPercent" /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageSuppliers.map((sup, i) => {
                  const rank = globalOffset + i
                  const targetPct = getTargetPct(sup)
                  const hitTarget = targetPct >= 100
                  const barPct = (sup.sales / maxSales) * 100
                  const barColor = ROG_CHART_COLORS[rank % ROG_CHART_COLORS.length]

                  return (
                    <motion.tr
                      key={sup.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                    >
                      <td className="px-3 py-2.5 text-[20px] text-[#A0AEC0] font-mono">{rank + 1}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <SupplierLogo name={sup.name} />
                          <span className="font-medium text-[#2D3748] text-[20px] whitespace-nowrap">{sup.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 min-w-[120px]">
                        <span className="font-semibold font-mono text-[20px]" dir="ltr">
                          {formatCurrencyShort(sup.sales)}
                        </span>
                        <div className="mt-1 h-1.5 w-full bg-[#FFF0EA] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: barColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${barPct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`font-semibold font-mono text-[20px] ${hitTarget ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
                          dir="ltr"
                        >
                          {targetPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[20px]" dir="ltr">{sup.grossProfitPercent}%</span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 mt-2 border-t border-[#FFF0EA]">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
                className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#FFE8DE] text-[#4A5568] transition-all hover:bg-[#FDF8F6] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-[10px] text-lg font-medium transition-all ${
                      page === i
                        ? 'bg-[#F97316] text-white shadow-sm'
                        : 'text-[#4A5568] hover:bg-[#FDF8F6] border border-[#FFE8DE]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages - 1}
                className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#FFE8DE] text-[#4A5568] transition-all hover:bg-[#FDF8F6] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
