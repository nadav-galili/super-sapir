import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import { getDeltaStatusColor } from '@/lib/colors'
import type { CategorySummary } from '@/data/mock-categories'

interface CategoryBubbleChartProps {
  data: CategorySummary[]
}

interface BubbleTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CategorySummary & { z: number } }>
}

function CustomTooltip({ active, payload }: BubbleTooltipProps) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-white rounded-[10px] border border-[#FFE8DE] p-3 shadow-sm" dir="rtl">
      <p className="font-semibold text-[#2D3748] mb-1">{d.name}</p>
      <p className="text-sm text-[#4A5568]">מכירות: <span className="font-mono" dir="ltr">{formatCurrencyShort(d.sales)}</span></p>
      <p className="text-sm text-[#4A5568]">רווח גולמי: <span className="font-mono" dir="ltr">{d.grossMarginPercent}%</span></p>
      <p className="text-sm" style={{ color: getDeltaStatusColor(d.yoyChange) }}>
        צמיחה: <span className="font-mono" dir="ltr">{d.yoyChange > 0 ? '+' : ''}{d.yoyChange}%</span>
      </p>
    </div>
  )
}

export function CategoryBubbleChart({ data }: CategoryBubbleChartProps) {
  const navigate = useNavigate()

  const chartData = data.map(d => ({
    id: d.id,
    name: d.name,
    sales: d.sales,
    grossMarginPercent: d.grossMarginPercent,
    yoyChange: d.yoyChange,
    x: d.sales,
    y: d.grossMarginPercent,
    z: Math.max(Math.abs(d.yoyChange) * 80, 200),
    color: getDeltaStatusColor(d.yoyChange),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            מפת קטגוריות — גודל = צמיחה, צבע = מגמה, X = מכירות, Y = רווחיות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="מכירות"
                  tickFormatter={(v: number) => formatCurrencyShort(v)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="רווח גולמי %"
                  unit="%"
                  tick={{ fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="z" range={[200, 2000]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  data={chartData}
                  animationDuration={1000}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(entry: any) => {
                    if (entry?.id) {
                      navigate({ to: '/category-manager/$categoryId', params: { categoryId: entry.id } })
                    }
                  }}
                  cursor="pointer"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => {
                    const { cx, cy, fill, payload } = props
                    const r = Math.sqrt(payload.z) / 2
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.7} stroke={fill} strokeWidth={1} />
                        <text
                          x={cx}
                          y={cy - r - 6}
                          textAnchor="middle"
                          fill="#2D3748"
                          fontSize={11}
                          fontWeight={500}
                        >
                          {payload.name}
                        </text>
                      </g>
                    )
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={entry.color}
                      fillOpacity={0.7}
                      stroke={entry.color}
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
