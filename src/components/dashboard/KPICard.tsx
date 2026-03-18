import { motion } from 'motion/react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { formatCurrencyShort, formatNumber, formatPercent, formatCompact } from '@/lib/format'
import { GRADIENT_PRESETS, type GradientPreset } from '@/lib/colors'
import type { KPICardData } from '@/data/types'

interface KPICardProps extends KPICardData {
  delay?: number
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
  const colors = GRADIENT_PRESETS[gradient as GradientPreset]
  const isPositive = trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      className="relative overflow-hidden rounded-xl p-5 text-white shadow-lg cursor-default"
      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
    >
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-3xl font-bold mt-1 tabular-nums" dir="ltr">
          {formatValue(animatedValue, format)}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-white/90" />
          ) : (
            <TrendingDown className="w-4 h-4 text-white/90" />
          )}
          <span className="text-sm text-white/90" dir="ltr">
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-white/60">{trendLabel}</span>
        </div>
      </div>
      {/* Decorative circle */}
      <div
        className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-20"
        style={{ background: colors.from }}
      />
    </motion.div>
  )
}
