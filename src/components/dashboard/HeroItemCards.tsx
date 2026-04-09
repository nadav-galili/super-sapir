import { useMemo } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, TrendingUp, Megaphone } from 'lucide-react'
import { formatCurrencyShort } from '@/lib/format'
import { usePeriodMultiplier } from '@/contexts/PeriodContext'
import { getCategorySummaries } from '@/data/mock-categories'
import { getTopStockoutItem, getTopSalesItem, getTopPromoItem } from '@/data/mock-items'

interface HeroItemCardsProps {
  vertical?: boolean
}

interface SpotlightCardProps {
  title: string
  icon: React.ReactNode
  iconBg: string
  imageUrl: string
  productName: string
  categoryName: string
  stats: { label: string; value: string; color: string }[]
  delay: number
  accentColor: string
}

function SpotlightCard({ title, icon, iconBg, imageUrl, productName, categoryName, stats, delay, accentColor }: SpotlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ y: -4, boxShadow: `${accentColor}22 0px 12px 32px` }}
      className="relative overflow-hidden rounded-[16px] bg-white border border-warm-border group cursor-default"
    >
      {/* Accent top bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }} />

      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${iconBg}`}>
            {icon}
          </span>
          <h3 className="text-lg font-bold text-[#2D3748]">{title}</h3>
        </div>

        {/* Product row */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-[12px] overflow-hidden border border-warm-border shrink-0 bg-[#FDF8F6] shadow-sm"
          >
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-[#2D3748] truncate">{productName}</p>
            <p className="text-lg text-[#A0AEC0] mt-0.5">{categoryName}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
              {stats.map(s => (
                <div key={s.label}>
                  <p className="text-[16px] text-[#A0AEC0]">{s.label}</p>
                  <p className="text-lg font-bold font-mono" style={{ color: s.color }} dir="ltr">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function HeroItemCards({ vertical }: HeroItemCardsProps) {
  const m = usePeriodMultiplier()
  const stockoutItem = useMemo(() => getTopStockoutItem(), [])
  const topSalesItem = useMemo(() => getTopSalesItem(), [])
  const topPromoItem = useMemo(() => getTopPromoItem(), [])
  const categories = useMemo(() => getCategorySummaries(), [])

  const stockoutCatName = categories.find(c => c.id === stockoutItem.categoryId)?.name ?? stockoutItem.categoryId
  const topSalesCatName = categories.find(c => c.id === topSalesItem.categoryId)?.name ?? topSalesItem.categoryId
  const promoCatName = categories.find(c => c.id === topPromoItem.categoryId)?.name ?? topPromoItem.categoryId

  const yoyChange = topSalesItem.lastYearMonthlySales > 0
    ? ((topSalesItem.monthlySales * m - topSalesItem.lastYearMonthlySales) / topSalesItem.lastYearMonthlySales * 100)
    : 0

  return (
    <div className={vertical ? 'flex flex-col gap-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-4'}>
      <SpotlightCard
        title="פריט חסר — הפסד מוביל"
        icon={<AlertTriangle className="w-4 h-4 text-[#DC4E59]" />}
        iconBg="bg-[#DC4E59]/10"
        imageUrl="/hero/stockout-meat.jpg"
        productName={stockoutItem.nameHe}
        categoryName={stockoutCatName}
        accentColor="#DC4E59"
        delay={0.1}
        stats={[
          { label: 'ימי חוסר', value: `${Math.round(stockoutItem.stockoutDays * m)} ימים`, color: '#DC4E59' },
          { label: 'הפסד רווח', value: formatCurrencyShort(stockoutItem.estimatedProfitLoss * m), color: '#DC4E59' },
        ]}
      />

      <SpotlightCard
        title="פריט מוביל מכירות"
        icon={<TrendingUp className="w-4 h-4 text-[#2EC4D5]" />}
        iconBg="bg-[#2EC4D5]/10"
        imageUrl="/hero/top-sales-cola.jpg"
        productName={topSalesItem.nameHe}
        categoryName={topSalesCatName}
        accentColor="#2EC4D5"
        delay={0.2}
        stats={[
          { label: 'מכירות חודשי', value: formatCurrencyShort(topSalesItem.monthlySales * m), color: '#2EC4D5' },
          { label: 'מול שנה שעברה', value: `${yoyChange >= 0 ? '+' : ''}${yoyChange.toFixed(1)}%`, color: yoyChange >= 0 ? '#2EC4D5' : '#DC4E59' },
        ]}
      />

      <SpotlightCard
        title="פריט מוביל מבצעים"
        icon={<Megaphone className="w-4 h-4 text-[#6C5CE7]" />}
        iconBg="bg-[#6C5CE7]/10"
        imageUrl="/hero/promo-tissue.jpg"
        productName={topPromoItem.nameHe}
        categoryName={promoCatName}
        accentColor="#6C5CE7"
        delay={0.3}
        stats={[
          { label: 'מכירות מבצע', value: formatCurrencyShort((topPromoItem.promoSales ?? 0) * m), color: '#6C5CE7' },
          { label: 'עלייה במבצע', value: `+${topPromoItem.promoUpliftPercent ?? 0}%`, color: '#6C5CE7' },
        ]}
      />
    </div>
  )
}
