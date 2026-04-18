import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calcMetrics } from '@/lib/promo-simulator/calc'
import type { SimulatorState } from '@/lib/promo-simulator/state'

interface UpliftChartProps {
  state: SimulatorState
}

export function UpliftChart({ state }: UpliftChartProps) {
  const m = calcMetrics(state)
  const weeks = Math.max(1, state.durationWeeks || 2)
  const baseRevenuePerWeek = Math.round(m.baseRevenue / weeks)
  const promoRevenuePerWeek = Math.round(m.promoRevenue / weeks)

  // Generate series: weekly revenue + cumulative promo line
  const data = Array.from({ length: weeks }, (_, i) => {
    const cum = promoRevenuePerWeek * (i + 1)
    return {
      week: `שבוע ${i + 1}`,
      base: baseRevenuePerWeek,
      promo: promoRevenuePerWeek,
      cumulative: cum,
    }
  })

  return (
    <Card className="border-[#FFE8DE] rounded-[16px]">
      <CardHeader>
        <CardTitle className="text-xl text-[#2D3748]">
          תחזית פדיון לפי שבוע
        </CardTitle>
        <p className="text-[16px] text-[#4A5568]">
          השוואת בסיס למבצע לאורך תקופת הקמפיין
        </p>
      </CardHeader>
      <CardContent>
        <div dir="ltr" className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 16, fill: '#4A5568' }}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`
                }
                tick={{ fontSize: 16, fill: '#A0AEC0' }}
                width={64}
              />
              <Tooltip
                formatter={(value, name) => {
                  const label =
                    name === 'base'
                      ? 'בסיס'
                      : name === 'promo'
                        ? 'מבצע'
                        : 'מצטבר'
                  return [`₪${Number(value).toLocaleString()}`, String(label)]
                }}
                contentStyle={{
                  direction: 'rtl',
                  borderRadius: '10px',
                  border: '1px solid #FFE8DE',
                  fontSize: 18,
                }}
              />
              <Legend
                formatter={(v: string) =>
                  v === 'base' ? 'בסיס' : v === 'promo' ? 'מבצע' : 'מצטבר'
                }
                iconType="circle"
                wrapperStyle={{ fontSize: 16, paddingTop: 8 }}
              />
              <Bar
                dataKey="base"
                fill="rgba(160, 174, 192, 0.5)"
                radius={[4, 4, 0, 0]}
                animationDuration={600}
              />
              <Bar
                dataKey="promo"
                fill="rgba(220, 78, 89, 0.75)"
                radius={[4, 4, 0, 0]}
                animationDuration={700}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#6C5CE7"
                strokeWidth={2}
                dot={{ r: 4, fill: '#6C5CE7' }}
                animationDuration={900}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
