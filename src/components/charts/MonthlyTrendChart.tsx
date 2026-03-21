import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { formatCurrencyShort } from '@/lib/format'
import type { MonthlyTrend } from '@/data/types'

interface MonthlyTrendChartProps {
  data: MonthlyTrend[]
  title?: string
}

export function MonthlyTrendChart({ data, title = 'מגמת מכירות חודשית' }: MonthlyTrendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC4E59" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DC4E59" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [
                    formatCurrencyShort(value as number),
                    'מכירות',
                  ]}
                  labelFormatter={(label) => String(label)}
                  contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
                />
                <Legend
                  formatter={() => 'מכירות'}
                />
                <Area
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#DC4E59"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
