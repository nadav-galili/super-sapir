import { motion } from 'motion/react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { formatCurrencyShort, formatNumber, formatPercent, formatCompact } from '@/lib/format'
import { PALETTE } from '@/lib/colors'
import type { KPICardData } from '@/data/types'

interface KPICardProps extends KPICardData {
  delay?: number
}

const ACCENT_MAP: Record<string, { border: string; text: string }> = {
  green:  { border: PALETTE.cyan,   text: PALETTE.cyan },
  blue:   { border: PALETTE.cyan,   text: PALETTE.cyan },
  purple: { border: PALETTE.violet, text: PALETTE.violet },
  teal:   { border: PALETTE.cyan,   text: PALETTE.cyan },
  orange: { border: PALETTE.amber,  text: PALETTE.amber },
  pink:   { border: PALETTE.red,    text: PALETTE.red },
  red:    { border: PALETTE.red,    text: PALETTE.red },
}

function formatValue(value: number, format: KPICardData['format']): string {
  switch (format) {
    case 'currency': return `₪ ${formatNumber(value)}`
    case 'currencyShort': return formatCurrencyShort(value)
    case 'percent': return formatPercent(value)
    case 'compact': return formatCompact(value)
    case 'number': return formatNumber(value)
  }
}

export function KPICard({ label, value, format, trend, trendLabel, gradient, delay = 0 }: KPICardProps) {
  const animatedValue = useAnimatedCounter(value, 1500, delay)
  const accent = ACCENT_MAP[gradient] ?? ACCENT_MAP.blue
  const isPositive = trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -2, boxShadow: 'rgba(220, 78, 89, 0.08) 0px 8px 24px' }}
      className="relative overflow-hidden rounded-[16px] bg-white border border-warm-border cursor-default"
    >
      <div className="p-4">
        <p className="text-xs font-medium text-warm-muted mb-1">{label}</p>
        <p className="text-2xl font-bold font-mono tabular-nums" style={{ color: accent.text }} dir="ltr">
          {formatValue(animatedValue, format)}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-[20px] ${
            isPositive ? 'bg-[#2EC4D5]/10 text-[#2EC4D5]' : 'bg-[#DC4E59]/10 text-[#DC4E59]'
          }`} dir="ltr">
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span className="text-[11px] text-warm-muted">{trendLabel}</span>
        </div>
      </div>
    </motion.div>
  )
}
