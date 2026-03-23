import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { AlertTriangle, ArrowUpRight, Store, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyShort } from '@/lib/format'
import type { CategorySnapshot } from '@/lib/category-manager'

interface CategoryActionPanelProps {
  title: string
  tone: 'danger' | 'opportunity'
  items: CategorySnapshot[]
}

export function CategoryActionPanel({ title, tone, items }: CategoryActionPanelProps) {
  const Icon = tone === 'danger' ? TriangleAlert : ArrowUpRight
  const accentClass = tone === 'danger'
    ? 'text-[#DC4E59]'
    : 'text-[#2EC4D5]'

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-[#2D3748]">
          <Icon className={`w-5 h-5 ${accentClass}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => {
          const impact = tone === 'danger' ? item.downsideEstimate : item.upsideEstimate
          const label = tone === 'danger' ? 'סיכון מוערך' : 'פוטנציאל מוערך'
          const badgeVariant = tone === 'danger' ? 'destructive' : 'success'

          return (
            <motion.div
              key={`${tone}-${item.category.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Link
                to="/category-manager/$categoryId"
                params={{ categoryId: item.category.id }}
                className="block rounded-[16px] border border-[#FFE8DE] bg-[#FDF8F6] p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#2D3748]">{item.category.name}</p>
                      <Badge variant={badgeVariant}>{label}</Badge>
                    </div>
                    <p className="text-sm text-[#4A5568]">
                      {tone === 'danger'
                        ? `${item.weakBranchCount} סניפים חלשים, ${item.category.stockoutRate.toFixed(1)}% חוסרים, ${item.normalizedGrossMarginPercent.toFixed(1)}% רווחיות`
                        : `${item.avgPromoRoi.toFixed(2)}x ROI, ${item.shareGap.toFixed(1)}% פער נתח, ${item.normalizedGrossMarginPercent.toFixed(1)}% רווחיות`}
                    </p>
                    <p className="text-sm text-[#A0AEC0]">{item.focusAction}</p>
                  </div>

                  <div className="text-left shrink-0" dir="ltr">
                    <p className={`text-lg font-bold font-mono ${accentClass}`}>{formatCurrencyShort(impact)}</p>
                    <p className="text-[11px] text-[#A0AEC0]">{label}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#4A5568]">
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F6B93B]" />
                    {item.comparisonChange > 0 ? '+' : ''}{item.comparisonChange}% {item.comparisonLabel}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#2EC4D5]" />
                    מוביל: {item.topBranchName} | חלש: {item.weakestBranchName}
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
