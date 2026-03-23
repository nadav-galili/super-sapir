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
import { PALETTE } from '@/lib/colors'
import type { CategorySnapshot } from '@/lib/category-manager'

interface CategoryPriorityMatrixProps {
  data: CategorySnapshot[]
}

interface MatrixTooltipProps {
  active?: boolean
  payload?: Array<{ payload: MatrixChartPoint }>
}

type MatrixLabelAnchor = 'start' | 'middle' | 'end'

interface MatrixChartPoint extends CategorySnapshot {
  plotX: number
  plotY: number
  z: number
  fill: string
  labelDx: number
  labelDy: number
  labelAnchor: MatrixLabelAnchor
  labelLines: string[]
  labelWidth: number
  labelHeight: number
}

const LABEL_PLACEMENTS: Array<{ dx: number; dy: number; anchor: MatrixLabelAnchor }> = [
  { dx: 0, dy: -18, anchor: 'middle' },
  { dx: -18, dy: -28, anchor: 'end' },
  { dx: 18, dy: -28, anchor: 'start' },
  { dx: -24, dy: -10, anchor: 'end' },
  { dx: 24, dy: -10, anchor: 'start' },
  { dx: -14, dy: -42, anchor: 'end' },
  { dx: 14, dy: -42, anchor: 'start' },
]

const BUBBLE_OFFSETS = [
  { dx: 0, dy: 0 },
  { dx: -0.45, dy: 0.28 },
  { dx: 0.45, dy: -0.24 },
  { dx: -0.8, dy: 0.58 },
  { dx: 0.8, dy: -0.5 },
  { dx: -1.15, dy: -0.08 },
  { dx: 1.15, dy: 0.1 },
]

function splitLabel(name: string): string[] {
  const words = name.split(' ')
  if (name.length <= 10 || words.length === 1) return [name]

  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (candidate.length <= 10 || currentLine.length === 0) {
      currentLine = candidate
      continue
    }

    lines.push(currentLine)
    currentLine = word
  }

  if (currentLine) lines.push(currentLine)
  if (lines.length <= 2) return lines

  return [lines[0], lines.slice(1).join(' ')]
}

function getNearbyPoints(points: MatrixChartPoint[], point: MatrixChartPoint) {
  return points.filter((candidate) => (
    candidate.category.id !== point.category.id
    && Math.abs(candidate.comparisonChange - point.comparisonChange) <= 1.8
    && Math.abs(candidate.normalizedGrossMarginPercent - point.normalizedGrossMarginPercent) <= 1.2
  ))
}

function getConflictingPoints(points: MatrixChartPoint[], point: MatrixChartPoint) {
  return points.filter((candidate) => (
    candidate.category.id !== point.category.id
    && Math.abs(candidate.plotX - point.plotX) <= 2.3
    && Math.abs(candidate.plotY - point.plotY) <= 1.5
  ))
}

function buildChartData(data: CategorySnapshot[]): MatrixChartPoint[] {
  const LINE_HEIGHT = 12
  const basePoints: MatrixChartPoint[] = data.map((item) => {
    const labelLines = splitLabel(item.category.name)
    return {
      ...item,
      plotX: item.comparisonChange,
      plotY: item.normalizedGrossMarginPercent,
      z: Math.max(item.category.sharePercent * 70, 500),
      fill: item.status === 'danger'
        ? PALETTE.red
        : item.status === 'opportunity'
          ? PALETTE.cyan
          : PALETTE.amber,
      labelDx: 0,
      labelDy: -18,
      labelAnchor: 'middle',
      labelLines,
      labelWidth: Math.max(...labelLines.map((l) => l.length), 4) * 7 + 10,
      labelHeight: labelLines.length * LINE_HEIGHT + 6,
    }
  })

  const sortedPoints = [...basePoints].sort((a, b) => {
    if (a.comparisonChange !== b.comparisonChange) return a.comparisonChange - b.comparisonChange
    return b.normalizedGrossMarginPercent - a.normalizedGrossMarginPercent
  })

  for (const point of sortedPoints) {
    const nearbyPoints = getNearbyPoints(sortedPoints, point)
    const usedOffsets = new Set(
      nearbyPoints
        .filter((candidate) => candidate.plotX !== candidate.comparisonChange || candidate.plotY !== candidate.normalizedGrossMarginPercent)
        .map((candidate) => `${(candidate.plotX - candidate.comparisonChange).toFixed(2)}:${(candidate.plotY - candidate.normalizedGrossMarginPercent).toFixed(2)}`),
    )

    const preferredOffset = BUBBLE_OFFSETS.find((offset) => {
      const key = `${offset.dx.toFixed(2)}:${offset.dy.toFixed(2)}`
      return !usedOffsets.has(key)
    }) ?? BUBBLE_OFFSETS[nearbyPoints.length % BUBBLE_OFFSETS.length]

    point.plotX = +(point.comparisonChange + preferredOffset.dx).toFixed(2)
    point.plotY = +(point.normalizedGrossMarginPercent + preferredOffset.dy).toFixed(2)
  }

  for (const point of sortedPoints) {
    const conflictingPoints = getConflictingPoints(sortedPoints, point)
    const usedPlacements = new Set(
      conflictingPoints
        .filter((candidate) => candidate.labelDy !== -18 || candidate.labelDx !== 0)
        .map((candidate) => `${candidate.labelDx}:${candidate.labelDy}:${candidate.labelAnchor}`),
    )

    const preferredPlacement = LABEL_PLACEMENTS.find((placement) => {
      const key = `${placement.dx}:${placement.dy}:${placement.anchor}`
      return !usedPlacements.has(key)
    }) ?? LABEL_PLACEMENTS[conflictingPoints.length % LABEL_PLACEMENTS.length]

    point.labelDx = preferredPlacement.dx
    point.labelDy = preferredPlacement.dy
    point.labelAnchor = preferredPlacement.anchor
  }

  return basePoints
}

function MatrixTooltip({ active, payload }: MatrixTooltipProps) {
  if (!active || !payload?.[0]) return null

  const item = payload[0].payload

  return (
    <div className="rounded-[12px] border border-[#FFE8DE] bg-white p-3 shadow-sm" dir="rtl">
      <p className="mb-1 font-semibold text-[#2D3748]">{item.category.name}</p>
      <p className="text-sm text-[#4A5568]">
        ביצוע: <span className="font-mono" dir="ltr">{item.comparisonChange > 0 ? '+' : ''}{item.comparisonChange.toFixed(1)}%</span>
      </p>
      <p className="text-sm text-[#4A5568]">
        רווח גולמי: <span className="font-mono" dir="ltr">{item.normalizedGrossMarginPercent.toFixed(1)}%</span>
      </p>
      <p className="mt-1 text-xs text-[#A0AEC0]">{item.focusAction}</p>
    </div>
  )
}

export function CategoryPriorityMatrix({ data }: CategoryPriorityMatrixProps) {
  const averageMargin = data.length > 0
    ? data.reduce((sum, item) => sum + item.normalizedGrossMarginPercent, 0) / data.length
    : 0

  const chartData = buildChartData(data)

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

            <div dir="ltr" className="h-[300px] sm:h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 40, right: 12, bottom: 12, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5E6DE" />
                  <XAxis
                    type="number"
                    dataKey="plotX"
                    name="ביצוע"
                    unit="%"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="plotY"
                    name="רווח גולמי"
                    unit="%"
                    tick={{ fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[300, 2000]} />
                  <ReferenceLine x={0} stroke="#A0AEC0" strokeDasharray="4 4" />
                  <ReferenceLine y={averageMargin} stroke="#A0AEC0" strokeDasharray="4 4" />
                  <Tooltip content={<MatrixTooltip />} />
                  <Scatter
                    data={chartData}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    shape={(props: any) => {
                      const { cx, cy, fill, payload } = props as { cx: number; cy: number; fill: string; payload: MatrixChartPoint }
                      const r = Math.sqrt(payload.z) / 1.5
                      const labelX = cx + payload.labelDx
                      const labelY = cy + payload.labelDy
                      const { labelWidth: width, labelHeight: height } = payload
                      const boxX = payload.labelAnchor === 'middle'
                        ? labelX - width / 2
                        : payload.labelAnchor === 'start'
                          ? labelX - 4
                          : labelX - width + 4
                      const boxY = labelY - height + 2

                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.78} stroke={fill} strokeWidth={1.5} />
                          {(payload.labelDx !== 0 || payload.labelDy < -22) && (
                            <line
                              x1={cx}
                              y1={cy - 4}
                              x2={labelX}
                              y2={labelY - 4}
                              stroke="#D9C7BE"
                              strokeWidth={1}
                              strokeDasharray="2 2"
                            />
                          )}
                          <rect
                            x={boxX}
                            y={boxY}
                            width={width}
                            height={height}
                            rx={6}
                            fill="rgba(253, 248, 246, 0.92)"
                          />
                          <text
                            x={labelX}
                            y={labelY - (payload.labelLines.length - 1) * 6}
                            textAnchor={payload.labelAnchor}
                            fontSize={11}
                            fontWeight={500}
                            fill="#4A5568"
                            direction="rtl"
                          >
                            {payload.labelLines.map((line: string, index: number) => (
                              <tspan key={`${payload.category.id}-${line}`} x={labelX} dy={index === 0 ? 0 : 12}>
                                {line}
                              </tspan>
                            ))}
                          </text>
                        </g>
                      )
                    }}
                  >
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
