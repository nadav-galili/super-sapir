import { motion } from 'motion/react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { formatCurrencyShort } from '@/lib/format'

interface GaugeKPI {
  label: string
  value: number
  target: number
  format: 'currency' | 'percent'
}

interface KPIGaugeRowROGProps {
  items: GaugeKPI[]
}

// Classic Red / Orange / Green
function getScoreColor(ratio: number): string {
  if (ratio >= 0.95) return '#22C55E'
  if (ratio >= 0.85) return '#F97316'
  return '#EF4444'
}

function DarkGauge({ ratio, size = 80, strokeWidth = 7 }: { ratio: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(ratio, 1) * circumference)
  const color = getScoreColor(ratio)
  const pct = Math.round(ratio * 100)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full blur-md opacity-30"
        style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }}
      />
      <svg className="w-full h-full -rotate-90 relative z-10" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span className="text-2xl font-bold font-mono text-white" dir="ltr">
          {pct}%
        </span>
      </div>
    </div>
  )
}

function DarkGaugeCard({ item, index }: { item: GaugeKPI; index: number }) {
  const ratio = item.target > 0 ? item.value / item.target : 1
  const animatedValue = useAnimatedCounter(item.value, 1400, index * 100)
  const color = getScoreColor(ratio)

  const formattedValue = item.format === 'currency'
    ? formatCurrencyShort(animatedValue)
    : `${animatedValue.toFixed(1)}%`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
      className="flex flex-col items-center gap-2 px-2"
    >
      <DarkGauge ratio={ratio} />
      <div className="text-center">
        <p className="text-xl font-bold font-mono tabular-nums" style={{ color }} dir="ltr">
          {formattedValue}
        </p>
        <p className="text-[16px] text-white/40 mt-0.5">{item.label}</p>
      </div>
    </motion.div>
  )
}

export function KPIGaugeRowROG({ items }: KPIGaugeRowROGProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-[16px] bg-gradient-to-l from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border border-white/5 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {items.map((item, i) => (
          <DarkGaugeCard key={item.label} item={item} index={i} />
        ))}
      </div>

      {/* Color legend — ROG */}
      <div className="flex items-center justify-center gap-5 mt-4 text-[16px] text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
          95%+
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F97316] inline-block" />
          85-95%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block" />
          &lt;85%
        </span>
      </div>
    </motion.div>
  )
}
