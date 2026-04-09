import { motion } from 'motion/react'
import { Megaphone, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import type { Promotion } from '@/data/types'

interface PromotionCardProps {
  promotions: Promotion[]
  categoryName: string
}

export function PromotionCard({ promotions, categoryName }: PromotionCardProps) {
  if (promotions.length === 0) return null

  const topPromos = promotions

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#6C5CE7]" />
            אפקטיביות מבצעים — {categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-lg">
              <thead>
                <tr className="border-b border-[#FFF0EA]">
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">מבצע</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">תקופה</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">בסיס</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">בפועל</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">עלייה</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">ROI</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">קניבליזציה</th>
                </tr>
              </thead>
              <tbody>
                {topPromos.map((promo, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-[#2D3748]">{promo.name}</td>
                    <td className="px-3 py-2.5 text-[#4A5568]"><span dir="ltr">{promo.period}</span></td>
                    <td className="px-3 py-2.5 font-mono text-[#4A5568]"><span dir="ltr">{formatCurrencyShort(promo.baselineSales)}</span></td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-[#2D3748]"><span dir="ltr">{formatCurrencyShort(promo.actualSales)}</span></td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[20px] bg-[#2EC4D5]/10 text-[#2EC4D5] text-base font-semibold font-mono" dir="ltr">
                        +{promo.upliftPercent}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[20px] text-base font-semibold font-mono ${
                        promo.roi > 0
                          ? 'bg-[#2EC4D5]/10 text-[#2EC4D5]'
                          : 'bg-[#DC4E59]/10 text-[#DC4E59]'
                      }`} dir="ltr">
                        {promo.roi}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {promo.hasCannibalization ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[20px] bg-[#F6B93B]/10 text-[#F6B93B] text-base font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          כן
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[20px] bg-[#A0AEC0]/10 text-[#A0AEC0] text-base font-medium">
                          לא
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-4">
            {topPromos.map((promo, i) => {
              const maxSales = Math.max(promo.baselineSales, promo.actualSales)
              return (
                <div key={i} className="space-y-2">
                  <p className="text-base font-medium text-[#4A5568]">{promo.name}</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[16px] text-[#A0AEC0] w-10 text-left">בסיס</span>
                      <div className="flex-1 h-5 bg-[#FDF8F6] rounded-[5px] overflow-hidden">
                        <div
                          className="h-full bg-[#A0AEC0] rounded-[5px]"
                          style={{ width: `${(promo.baselineSales / maxSales) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#2EC4D5] w-10 text-left font-medium">בפועל</span>
                      <div className="flex-1 h-5 bg-[#FDF8F6] rounded-[5px] overflow-hidden">
                        <div
                          className="h-full bg-[#2EC4D5] rounded-[5px]"
                          style={{ width: `${(promo.actualSales / maxSales) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
