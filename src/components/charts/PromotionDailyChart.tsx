import { useMemo } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyShort } from '@/lib/format'
import type { ChainPromotion } from '@/data/mock-chain-promotions'

const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

interface PromotionDailyChartProps {
  promotion: ChainPromotion
}

export function PromotionDailyChart({ promotion }: PromotionDailyChartProps) {
  const data = useMemo(() =>
    DAYS_HE.map((day, i) => ({
      day,
      actual: promotion.dailySales[i],
      baseline: promotion.dailyBaseline[i],
    })),
    [promotion],
  )

  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-5">
        {/* Promotion details header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-[10px] overflow-hidden border border-warm-border shrink-0 bg-[#FDF8F6]">
            <img
              src={promotion.imageUrl}
              alt={promotion.productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#2D3748] truncate">{promotion.name}</h3>
            <p className="text-sm text-[#4A5568] truncate">{promotion.productName}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-[11px] border-warm-border">
                {promotion.promoType}
              </Badge>
              <Badge variant="outline" className="text-[11px] border-warm-border">
                {promotion.daysRemaining} ימים נותרו
              </Badge>
            </div>
          </div>
        </div>

        {/* Chart */}
        <AnimatePresence mode="wait">
          <motion.div
            key={promotion.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div dir="ltr" className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFF0EA" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                    tick={{ fontSize: 11 }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrencyShort(value as number),
                      name === 'actual' ? 'מכירות בפועל' : 'בסיס',
                    ]}
                    contentStyle={{ direction: 'rtl', borderRadius: '8px', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#A0AEC0"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={800}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#DC4E59"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#DC4E59' }}
                    animationDuration={800}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-[#4A5568]">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#DC4E59] inline-block rounded" />
            מכירות בפועל
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#A0AEC0] inline-block rounded border-dashed" style={{ borderTop: '2px dashed #A0AEC0', height: 0 }} />
            בסיס
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
