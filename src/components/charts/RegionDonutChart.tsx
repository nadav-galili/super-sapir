import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { formatCurrencyShort } from '@/lib/format'
import type { RegionSummary } from '@/data/mock-regions'

interface RegionDonutChartProps {
  data: RegionSummary[]
}

export function RegionDonutChart({ data }: RegionDonutChartProps) {
  const chartData = data.map(r => ({
    name: r.name,
    value: r.totalSales,
    color: r.color,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">התפלגות הכנסות לפי אזור</CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={300}
                  animationDuration={1000}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrencyShort(value as number)}
                  contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
                />
                <Legend
                  formatter={(value: string) => <span style={{ direction: 'rtl' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
