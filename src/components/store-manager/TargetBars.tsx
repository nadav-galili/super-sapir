import { motion } from 'motion/react'
import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import type { SalesData } from '@/data/hadera-real'

interface TargetBarProps {
  label: string
  actual: number
  target: number
  vsTarget: number
  ranking?: number
  delay?: number
}

function TargetBar({ label, actual, target, vsTarget, ranking, delay = 0 }: TargetBarProps) {
  const pct = Math.min((actual / target) * 100, 100)

  let barColor = '#2EC4D5' // good
  if (pct < 85) barColor = '#DC4E59' // bad
  else if (pct < 95) barColor = '#F6B93B' // warning

  return (
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="space-y-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#2D3748]">{label}</span>
          {ranking && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-[20px] bg-[#FDF8F6] text-[#A0AEC0] font-medium border border-warm-border" dir="ltr">
              #{ranking}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#A0AEC0] tabular-nums font-mono text-xs sm:text-sm" dir="ltr">
            {formatCurrencyShort(actual)} / {formatCurrencyShort(target)}
          </span>
          <span className={`font-bold tabular-nums font-mono text-xs sm:text-sm ${vsTarget >= 0 ? 'text-[#2EC4D5]' : 'text-[#DC4E59]'}`} dir="ltr">
            {vsTarget > 0 ? '+' : ''}{vsTarget}%
          </span>
        </div>
      </div>
      <div className="relative h-3.5 bg-[#FDF8F6] rounded-[5px] overflow-hidden border border-warm-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay / 1000 + 0.3, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-y-0 right-0 rounded-[5px]"
          style={{ background: barColor }}
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay / 1000 + 1 }}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white font-mono"
          dir="ltr"
        >
          {pct.toFixed(1)}%
        </motion.span>
      </div>
    </motion.div>
  )
}

export function TargetBars({ sales }: { sales: SalesData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className="border-warm-border rounded-[16px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#2D3748]">
            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B7FED)' }}>
              <Target className="w-4 h-4 text-white" />
            </div>
            עמידה ביעדים — דצמבר 2025
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-[#A0AEC0] pb-2 border-b border-dashed border-warm-separator">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm" style={{ background: '#2EC4D5' }} />
              עמד ביעד (≥95%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm" style={{ background: '#F6B93B' }} />
              קרוב ליעד (85-95%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm" style={{ background: '#DC4E59' }} />
              מתחת ליעד (&lt;85%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded-[20px] bg-[#FDF8F6] text-[#A0AEC0] font-medium border border-warm-border">#N</span>
              דירוג ברשת
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-[#2D3748] font-mono">X ₪ / Y ₪</span>
              בפועל / יעד חודשי
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-[#DC4E59] font-mono">-N%</span>
              סטייה מהיעד
            </span>
          </div>

          <TargetBar label='סה"כ מכירות' actual={sales.total.current} target={sales.total.target} vsTarget={sales.total.vsTarget} delay={0} />
          <TargetBar label="מכירות רשת" actual={sales.network.current} target={sales.network.target} vsTarget={sales.network.vsTarget} ranking={sales.network.ranking} delay={120} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
