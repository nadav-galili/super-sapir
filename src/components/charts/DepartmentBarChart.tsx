import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { formatCurrencyShort } from '@/lib/format'
import { getDeltaStatusColor } from '@/lib/colors'
import type { DepartmentMetrics } from '@/data/types'

interface DepartmentBarChartProps {
  data: DepartmentMetrics[]
  title?: string
}

export function DepartmentBarChart({ data, title = 'פילוח לפי מחלקה' }: DepartmentBarChartProps) {
  const sorted = [...data].sort((a, b) => b.sales - a.sales)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sorted}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={75}
                />
                <Tooltip
                  formatter={(value) => [formatCurrencyShort(value as number), 'מכירות']}
                  contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
                />
                <Bar dataKey="sales" radius={[0, 4, 4, 0]} animationDuration={1200}>
                  {sorted.map((entry, i) => (
                    <Cell key={i} fill={getDeltaStatusColor(entry.yoyChange)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
