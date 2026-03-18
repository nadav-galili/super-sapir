import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { formatCurrencyShort } from '@/lib/format'
import type { Branch } from '@/data/types'

interface ComparisonChartProps {
  branches: Branch[]
  title?: string
}

export function ComparisonChart({ branches, title = 'השוואת סניפים' }: ComparisonChartProps) {
  const data = branches.map(b => ({
    name: b.name,
    totalSales: b.metrics.totalSales,
    quality: b.metrics.qualityScore,
    growth: b.metrics.yoyGrowth,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => {
                    const v = value as number
                    if (name === 'totalSales') return [formatCurrencyShort(v), 'מכירות']
                    if (name === 'quality') return [v, 'ציון איכות']
                    return [`${v}%`, 'צמיחה']
                  }}
                  contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
                />
                <Legend
                  formatter={(value: string) => {
                    if (value === 'totalSales') return 'מכירות'
                    if (value === 'quality') return 'ציון איכות'
                    return 'צמיחה'
                  }}
                />
                <Bar yAxisId="left" dataKey="totalSales" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1200} />
                <Bar yAxisId="right" dataKey="quality" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1200} animationBegin={200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
