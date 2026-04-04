import { useMemo } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, TrendingUp, Megaphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import { getCategorySummaries } from '@/data/mock-categories'
import { getTopStockoutItem, getTopSalesItem, getTopPromoItem } from '@/data/mock-items'

interface HeroItemCardsProps {
  vertical?: boolean
}

export function HeroItemCards({ vertical }: HeroItemCardsProps) {
  const stockoutItem = useMemo(() => getTopStockoutItem(), [])
  const topSalesItem = useMemo(() => getTopSalesItem(), [])
  const topPromoItem = useMemo(() => getTopPromoItem(), [])
  const categories = useMemo(() => getCategorySummaries(), [])

  const stockoutCatName = categories.find(c => c.id === stockoutItem.categoryId)?.name ?? stockoutItem.categoryId
  const topSalesCatName = categories.find(c => c.id === topSalesItem.categoryId)?.name ?? topSalesItem.categoryId
  const promoCatName = categories.find(c => c.id === topPromoItem.categoryId)?.name ?? topPromoItem.categoryId

  const yoyChange = topSalesItem.lastYearMonthlySales > 0
    ? ((topSalesItem.monthlySales - topSalesItem.lastYearMonthlySales) / topSalesItem.lastYearMonthlySales * 100)
    : 0

  return (
    <div className={vertical ? 'flex flex-col gap-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-4'}>
      {/* Stockout loss leader */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card className="h-full">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#DC4E59]/10">
                <AlertTriangle className="w-4 h-4 text-[#DC4E59]" />
              </span>
              <h3 className="text-sm font-bold text-[#2D3748]">פריט חסר — הפסד מוביל</h3>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-[10px] overflow-hidden border border-warm-border shrink-0 bg-[#FDF8F6]">
                <img
                  src={stockoutItem.imageUrl}
                  alt={stockoutItem.nameHe}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[#2D3748] truncate">{stockoutItem.nameHe}</p>
                <p className="text-sm text-[#4A5568] mt-0.5">{stockoutCatName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <div>
                    <p className="text-[11px] text-[#A0AEC0]">ימי חוסר</p>
                    <p className="text-sm font-bold text-[#DC4E59]">{stockoutItem.stockoutDays} ימים</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#A0AEC0]">הפסד רווח משוער</p>
                    <p className="text-sm font-bold text-[#DC4E59] font-mono" dir="ltr">
                      {formatCurrencyShort(stockoutItem.estimatedProfitLoss)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top sales item */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card className="h-full">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#2EC4D5]/10">
                <TrendingUp className="w-4 h-4 text-[#2EC4D5]" />
              </span>
              <h3 className="text-sm font-bold text-[#2D3748]">פריט מוביל מכירות</h3>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-[10px] overflow-hidden border border-warm-border shrink-0 bg-[#FDF8F6]">
                <img
                  src={topSalesItem.imageUrl}
                  alt={topSalesItem.nameHe}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[#2D3748] truncate">{topSalesItem.nameHe}</p>
                <p className="text-sm text-[#4A5568] mt-0.5">{topSalesCatName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <div>
                    <p className="text-[11px] text-[#A0AEC0]">מכירות חודשי</p>
                    <p className="text-sm font-bold text-[#2EC4D5] font-mono" dir="ltr">
                      {formatCurrencyShort(topSalesItem.monthlySales)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#A0AEC0]">מול שנה שעברה</p>
                    <p className={`text-sm font-bold font-mono ${yoyChange >= 0 ? 'text-[#2EC4D5]' : 'text-[#DC4E59]'}`} dir="ltr">
                      {yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top promo item */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card className="h-full">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#6C5CE7]/10">
                <Megaphone className="w-4 h-4 text-[#6C5CE7]" />
              </span>
              <h3 className="text-sm font-bold text-[#2D3748]">פריט מוביל מבצעים</h3>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-[10px] overflow-hidden border border-warm-border shrink-0 bg-[#FDF8F6]">
                <img
                  src={topPromoItem.imageUrl}
                  alt={topPromoItem.nameHe}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[#2D3748] truncate">{topPromoItem.nameHe}</p>
                <p className="text-sm text-[#4A5568] mt-0.5">{promoCatName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <div>
                    <p className="text-[11px] text-[#A0AEC0]">מכירות מבצע</p>
                    <p className="text-sm font-bold text-[#6C5CE7] font-mono" dir="ltr">
                      {formatCurrencyShort(topPromoItem.promoSales ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#A0AEC0]">עלייה במבצע</p>
                    <p className="text-sm font-bold text-[#6C5CE7] font-mono" dir="ltr">
                      +{topPromoItem.promoUpliftPercent ?? 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
