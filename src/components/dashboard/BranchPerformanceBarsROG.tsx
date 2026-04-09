import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import { allBranches } from '@/data/mock-branches'

const ROG_CHART_COLORS = ['#EF4444', '#22C55E', '#F97316', '#FBBF24', '#A0AEC0']

export function BranchPerformanceBarsROG() {
  const navigate = useNavigate()

  const top5 = useMemo(() =>
    [...allBranches]
      .sort((a, b) => b.metrics.totalSales - a.metrics.totalSales)
      .slice(0, 5),
    [],
  )

  const maxSales = top5[0]?.metrics.totalSales ?? 1

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-[#F97316]" />
          <CardTitle className="text-2xl text-[#2D3748]">ביצועי סניפים מובילים</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {top5.map((branch, i) => {
          const pct = (branch.metrics.totalSales / maxSales) * 100
          const growth = branch.metrics.yoyGrowth
          const color = ROG_CHART_COLORS[i]

          return (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => navigate({ to: '/store-manager/$branchId', params: { branchId: branch.id } })}
              className="cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-lg font-medium text-[#2D3748] group-hover:text-[#EF4444] transition-colors">
                    {branch.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold font-mono text-[#2D3748]" dir="ltr">
                    {formatCurrencyShort(branch.metrics.totalSales)}
                  </span>
                  <span
                    className={`text-base font-semibold font-mono ${growth >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
                    dir="ltr"
                  >
                    {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-[#FFF0EA] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
