import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import type { CategorySnapshot } from '@/lib/category-manager'

interface CategoryPriorityMatrixProps {
  data: CategorySnapshot[]
}

interface MatrixTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CategorySnapshot & { x: number; y: number; z: number; fill: string } }>
}

function MatrixTooltip({ active, payload }: MatrixTooltipProps) {
  if (!active || !payload?.[0]) return null

  const item = payload[0].payload

  return (
    <div className="rounded-[12px] border border-[#FFE8DE] bg-white p-3 shadow-sm" dir="rtl">
      <p className="mb-1 font-semibold text-[#2D3748]">{item.category.name}</p>
      <p className="text-sm text-[#4A5568]">
        ביצוע: <span className="font-mono" dir="ltr">{item.x > 0 ? '+' : ''}{item.x.toFixed(1)}%</span>
      </p>
      <p className="text-sm text-[#4A5568]">
        רווח גולמי: <span className="font-mono" dir="ltr">{item.y.toFixed(1)}%</span>
      </p>
      <p className="text-sm text-[#4A5568]">
        חשיפת חוסרים: <span className="font-mono" dir="ltr">{formatCurrencyShort(item.stockoutExposure)}</span>
      </p>
      <p className="mt-1 text-xs text-[#A0AEC0]">{item.focusAction}</p>
    </div>
  )
}

export function CategoryPriorityMatrix({ data }: CategoryPriorityMatrixProps) {
  const averageMargin = data.length > 0
    ? data.reduce((sum, item) => sum + item.category.grossMarginPercent, 0) / data.length
    : 0

  const chartData = data.map((item) => ({
    ...item,
    x: item.comparisonChange,
    y: item.category.grossMarginPercent,
    z: Math.max(item.category.sharePercent * 35, 220),
    fill: item.status === 'danger'
      ? '#DC4E59'
      : item.status === 'opportunity'
        ? '#2EC4D5'
        : '#F6B93B',
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg text-[#2D3748]">מטריצת עדיפויות</CardTitle>
              <p className="mt-1 text-sm text-[#4A5568]">
                X = ביצוע, Y = רווח גולמי, גודל = נתח מכירות, צבע = עדיפות פעולה
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[#4A5568]">
              <span className="rounded-full bg-[#DC4E59]/10 px-2.5 py-1 text-[#DC4E59]">סיכון</span>
              <span className="rounded-full bg-[#2EC4D5]/10 px-2.5 py-1 text-[#2EC4D5]">הזדמנות</span>
              <span className="rounded-full bg-[#F6B93B]/10 px-2.5 py-1 text-[#F6B93B]">מעקב</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-6 top-2 z-10 hidden justify-between text-xs text-[#A0AEC0] md:flex" dir="ltr">
              <span>לשקם</span>
              <span>להאיץ</span>
            </div>
            <div className="pointer-events-none absolute inset-x-6 bottom-6 z-10 hidden justify-between text-xs text-[#A0AEC0] md:flex" dir="ltr">
              <span>סיכון</span>
              <span>להגן על רווח</span>
            </div>

            <div dir="ltr" className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 24, right: 16, bottom: 16, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5E6DE" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="ביצוע"
                    unit="%"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="רווח גולמי"
                    unit="%"
                    tick={{ fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[240, 1800]} />
                  <ReferenceLine x={0} stroke="#A0AEC0" strokeDasharray="4 4" />
                  <ReferenceLine y={averageMargin} stroke="#A0AEC0" strokeDasharray="4 4" />
                  <Tooltip content={<MatrixTooltip />} />
                  <Scatter data={chartData}>
                    {chartData.map((item) => (
                      <Cell
                        key={item.category.id}
                        fill={item.fill}
                        fillOpacity={0.78}
                        stroke={item.fill}
                        strokeWidth={1.5}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {chartData.slice(0, 3).map((item) => (
              <Link
                key={item.category.id}
                to="/category-manager/$categoryId"
                params={{ categoryId: item.category.id }}
                className="rounded-[14px] border border-[#FFE8DE] bg-[#FDF8F6] px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[#2D3748]">{item.category.name}</span>
                  <span className="font-mono text-xs text-[#4A5568]" dir="ltr">
                    {item.comparisonChange > 0 ? '+' : ''}{item.comparisonChange}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#A0AEC0]">{item.focusAction}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
