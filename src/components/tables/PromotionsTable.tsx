import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import type { ChainPromotion } from '@/data/mock-chain-promotions'

interface PromotionsTableProps {
  promotions: ChainPromotion[]
  selectedId: string
  onSelect: (promotion: ChainPromotion) => void
}

export function PromotionsTable({ promotions, selectedId, onSelect }: PromotionsTableProps) {
  const top10 = promotions.slice(0, 10)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">10 מבצעים מובילים</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-border">
                <th className="text-right py-2 px-3 text-[11px] font-semibold text-[#A0AEC0] whitespace-nowrap">שם מבצע</th>
                <th className="text-right py-2 px-3 text-[11px] font-semibold text-[#A0AEC0] whitespace-nowrap">מוצר</th>
                <th className="text-right py-2 px-3 text-[11px] font-semibold text-[#A0AEC0] whitespace-nowrap">סוג</th>
                <th className="text-right py-2 px-3 text-[11px] font-semibold text-[#A0AEC0] whitespace-nowrap" dir="ltr">₪ מכירות</th>
                <th className="text-right py-2 px-3 text-[11px] font-semibold text-[#A0AEC0] whitespace-nowrap">עלייה %</th>
                <th className="text-right py-2 px-3 text-[11px] font-semibold text-[#A0AEC0] whitespace-nowrap">ROI</th>
                <th className="text-right py-2 px-3 text-[11px] font-semibold text-[#A0AEC0] whitespace-nowrap">ימים</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((promo, i) => {
                const isSelected = promo.id === selectedId
                return (
                  <motion.tr
                    key={promo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    onClick={() => onSelect(promo)}
                    className={`cursor-pointer border-b border-[#FFF0EA] transition-colors ${
                      isSelected
                        ? 'bg-[#DC4E59]/5 border-s-2 border-s-[#DC4E59]'
                        : 'hover:bg-[#FDF8F6]'
                    }`}
                  >
                    <td className="py-2 px-3 font-medium text-[#2D3748] whitespace-nowrap text-[13px]">
                      {promo.name}
                    </td>
                    <td className="py-2 px-3 text-[#4A5568] whitespace-nowrap text-[13px]">
                      {promo.productName}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 text-[11px] rounded-[20px] bg-[#FDF8F6] border border-warm-border text-[#4A5568]">
                        {promo.promoType}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[13px] text-[#2D3748] whitespace-nowrap" dir="ltr">
                      {formatCurrencyShort(promo.sales)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="text-[#2EC4D5] font-semibold text-[13px]" dir="ltr">
                        +{promo.upliftPercent}%
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[13px] text-[#2D3748] whitespace-nowrap" dir="ltr">
                      {promo.roi.toFixed(1)}x
                    </td>
                    <td className="py-2 px-3 text-[13px] text-[#4A5568] whitespace-nowrap">
                      {promo.daysRemaining}
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
