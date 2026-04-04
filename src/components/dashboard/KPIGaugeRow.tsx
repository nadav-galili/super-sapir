import { motion } from 'motion/react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { formatCurrencyShort } from '@/lib/format'

interface GaugeKPI {
  label: string
  value: number
  target: number
  format: 'currency' | 'percent'
  unit?: string
}

interface KPIGaugeRowProps {
  items: GaugeKPI[]
}

function getScoreColor(ratio: number): string {
  if (ratio >= 0.95) return '#2EC4D5'   // good — cyan
  if (ratio >= 0.85) return '#F6B93B'   // medium — amber
  return '#DC4E59'                       // bad — red
}

function getScoreLabel(ratio: number): string {
  if (ratio >= 0.95) return 'טוב'
  if (ratio >= 0.85) return 'בינוני'
  return 'חריג'
}

function MiniGauge({ ratio, size = 72, strokeWidth = 6 }: { ratio: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const cappedRatio = Math.min(ratio, 1.15)
  const offset = circumference - (Math.min(cappedRatio, 1) * circumference)
  const color = getScoreColor(ratio)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#FFE8DE"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold font-mono" style={{ color }} dir="ltr">
          {Math.round(ratio * 100)}%
        </span>
      </div>
    </div>
  )
}

function GaugeCard({ item, index }: { item: GaugeKPI; index: number }) {
  const ratio = item.target > 0 ? item.value / item.target : 1
  const animatedValue = useAnimatedCounter(item.value, 1400, index * 100)
  const color = getScoreColor(ratio)

  const formattedValue = item.format === 'currency'
    ? formatCurrencyShort(animatedValue)
    : `${animatedValue.toFixed(1)}%`
  const formattedTarget = item.format === 'currency'
    ? formatCurrencyShort(item.target)
    : `${item.target.toFixed(1)}%`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -2, boxShadow: 'rgba(220, 78, 89, 0.08) 0px 8px 24px' }}
      className="relative overflow-hidden rounded-[16px] bg-white border border-warm-border"
    >
      <div className="p-3 sm:p-4 flex flex-col items-center gap-2">
        <p className="text-sm font-semibold text-[#2D3748] truncate w-full text-center">{item.label}</p>
        <MiniGauge ratio={ratio} />
        <div className="text-center">
          <p className="text-lg font-bold font-mono tabular-nums" style={{ color }} dir="ltr">
            {formattedValue}
          </p>
          <p className="text-[11px] text-[#A0AEC0] mt-0.5">
            יעד: <span className="font-mono" dir="ltr">{formattedTarget}</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function KPIGaugeRow({ items }: KPIGaugeRowProps) {
  return (
    <div className="space-y-3">
      <div className={`grid gap-2 sm:gap-4 ${
        items.length >= 6
          ? 'grid-cols-3 sm:grid-cols-3 lg:grid-cols-6'
          : items.length === 5
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
      }`}>
        {items.map((item, i) => (
          <GaugeCard key={item.label} item={item} index={i} />
        ))}
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-5 text-xs text-[#4A5568]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2EC4D5] inline-block" />
          טוב (95%+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F6B93B] inline-block" />
          בינוני (85-95%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC4E59] inline-block" />
          חריג (&lt;85%)
        </span>
      </div>
    </div>
  )
}
