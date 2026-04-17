import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { CHART_COLORS, getDeltaStatusColor } from '@/lib/colors'
import type { CategorySnapshot } from '@/lib/category-manager'

interface CategoryDonutProps {
  snapshots: CategorySnapshot[]
}

export function CategoryDonut({ snapshots }: CategoryDonutProps) {
  const { slices, segments, totalYoy, size, strokeWidth, r, circumference } = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => b.category.sales - a.category.sales)
    const totalSales = sorted.reduce((sum, s) => sum + s.category.sales, 0)
    const top4 = sorted.slice(0, 4)
    const otherSales = sorted.slice(4).reduce((sum, s) => sum + s.category.sales, 0)

    const items = [
      ...top4.map((s, i) => ({
        label: s.category.name,
        value: s.category.sales,
        pct: totalSales > 0 ? (s.category.sales / totalSales) * 100 : 0,
        color: CHART_COLORS[i],
      })),
      ...(otherSales > 0
        ? [{
          label: 'אחרים',
          value: otherSales,
          pct: totalSales > 0 ? (otherSales / totalSales) * 100 : 0,
          color: CHART_COLORS[4],
        }]
        : []),
    ]

    // Average YoY
    const avgYoy = sorted.length > 0
      ? sorted.reduce((sum, s) => sum + s.category.yoyChange, 0) / sorted.length
      : 0

    const donutSize = 140
    const donutStroke = 18
    const donutR = (donutSize - donutStroke) / 2
    const circ = 2 * Math.PI * donutR

    let segOffset = 0
    const segs = items.map((slice) => {
      const length = (slice.pct / 100) * circ
      const gap = 3
      const seg = { ...slice, dashOffset: segOffset, dashLength: Math.max(length - gap, 1) }
      segOffset += length
      return seg
    })

    return { slices: items, segments: segs, totalYoy: +avgYoy.toFixed(1), size: donutSize, strokeWidth: donutStroke, r: donutR, circumference: circ }
  }, [snapshots])

  const animatedYoy = useAnimatedCounter(Math.abs(totalYoy), 1200, 400)
  const yoyPositive = totalYoy >= 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-[#2EC4D5]" />
          <CardTitle className="text-2xl text-[#2D3748]">חלוקת מכירות</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
              <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke="#FFF0EA" strokeWidth={strokeWidth}
              />
              {segments.map((seg, i) => (
                <motion.circle
                  key={seg.label}
                  cx={size / 2} cy={size / 2} r={r}
                  fill="none" stroke={seg.color}
                  strokeWidth={strokeWidth} strokeLinecap="butt"
                  strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
                  strokeDashoffset={-seg.dashOffset}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                />
              ))}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono" style={{ color: getDeltaStatusColor(totalYoy) }} dir="ltr">
                {yoyPositive ? '+' : '-'}{animatedYoy.toFixed(1)}%
              </span>
              <span className="text-[15px] text-[#A0AEC0]">שנתי</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5">
            {slices.map((slice) => (
              <div key={slice.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                  <span className="text-lg text-[#2D3748]">{slice.label}</span>
                </div>
                <span className="text-lg font-bold font-mono text-[#2D3748]" dir="ltr">
                  {slice.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
