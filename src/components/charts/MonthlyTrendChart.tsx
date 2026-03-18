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
                  <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInternet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrencyShort(value as number),
                    name === 'networkSales' ? 'מכירות רשת' : 'מכירות אינטרנט',
                  ]}
                  labelFormatter={(label) => String(label)}
                  contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
                />
                <Legend
                  formatter={(value: string) =>
                    value === 'networkSales' ? 'מכירות רשת' : 'מכירות אינטרנט'
                  }
                />
                <Area
                  type="monotone"
                  dataKey="networkSales"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNetwork)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="internetSales"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInternet)"
                  animationDuration={1500}
                  animationBegin={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
