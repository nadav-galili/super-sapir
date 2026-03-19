import { motion } from 'motion/react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { formatCurrencyShort, formatNumber, formatPercent, formatCompact } from '@/lib/format'
import type { KPICardData } from '@/data/types'

interface KPICardProps extends KPICardData {
  delay?: number
}

const ACCENT_COLORS: Record<string, { border: string; text: string; trendBg: string }> = {
  green:  { border: '#0f766e', text: '#0f766e', trendBg: 'bg-teal-50 text-teal-700' },
  blue:   { border: '#1e40af', text: '#1e40af', trendBg: 'bg-blue-50 text-blue-700' },
  purple: { border: '#6d28d9', text: '#6d28d9', trendBg: 'bg-violet-50 text-violet-700' },
  teal:   { border: '#0e7490', text: '#0e7490', trendBg: 'bg-cyan-50 text-cyan-700' },
  orange: { border: '#c2410c', text: '#c2410c', trendBg: 'bg-orange-50 text-orange-700' },
  pink:   { border: '#be185d', text: '#be185d', trendBg: 'bg-pink-50 text-pink-700' },
  red:    { border: '#b91c1c', text: '#b91c1c', trendBg: 'bg-red-50 text-red-700' },
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
  const accent = ACCENT_COLORS[gradient] ?? ACCENT_COLORS.blue
  const isPositive = trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      className="relative overflow-hidden rounded-xl bg-white border border-gray-200/80 shadow-sm cursor-default"
    >
      {/* Left accent border */}
      <div
        className="absolute top-0 right-0 w-1 h-full rounded-r-xl"
        style={{ background: accent.border }}
      />

      <div className="p-4 pr-5">
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        <p
          className="text-2xl font-bold font-mono tabular-nums tracking-tight"
          style={{ color: accent.text }}
          dir="ltr"
        >
          {formatValue(animatedValue, format)}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`} dir="ltr">
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span className="text-[10px] text-slate-400">{trendLabel}</span>
        </div>
      </div>
    </motion.div>
  )
}
