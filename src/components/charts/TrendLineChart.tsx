import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import { MONTHS_HE } from '@/data/constants'
import { PALETTE } from '@/lib/colors'

interface TrendLineChartProps {
  data: number[]
  title: string
}

export function TrendLineChart({ data, title }: TrendLineChartProps) {
  const chartData = data.map((value, i) => ({
    month: MONTHS_HE[i],
    value,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [formatCurrencyShort(value as number), 'מכירות']}
                  contentStyle={{ direction: 'rtl', borderRadius: '8px', border: '1px solid #FFE8DE' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={PALETTE.red}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: PALETTE.red, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: PALETTE.red }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
