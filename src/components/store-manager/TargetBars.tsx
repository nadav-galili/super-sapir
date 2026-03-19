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
  const isGood = pct >= 95
  const isWarn = pct >= 85 && pct < 95

  const barGradient = isGood
    ? 'from-emerald-500 to-teal-400'
    : isWarn
      ? 'from-amber-500 to-orange-400'
      : 'from-red-500 to-rose-400'

  return (
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {ranking && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium" dir="ltr">
              #{ranking}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground tabular-nums" dir="ltr">
            {formatCurrencyShort(actual)} / {formatCurrencyShort(target)}
          </span>
          <span
            className={`font-bold tabular-nums ${vsTarget >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
            dir="ltr"
          >
            {vsTarget > 0 ? '+' : ''}{vsTarget}%
          </span>
        </div>
      </div>
      <div className="relative h-3.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay / 1000 + 0.3, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`absolute inset-y-0 right-0 bg-gradient-to-l ${barGradient} rounded-full`}
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay / 1000 + 1 }}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/90"
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
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            עמידה ביעדים — דצמבר 2025
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground pb-2 border-b border-dashed border-gray-200">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm bg-gradient-to-l from-emerald-500 to-teal-400" />
              עמד ביעד (≥95%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm bg-gradient-to-l from-amber-500 to-orange-400" />
              קרוב ליעד (85-95%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm bg-gradient-to-l from-red-500 to-rose-400" />
              מתחת ליעד (&lt;85%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">#N</span>
              דירוג ברשת
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">X ₪ / Y ₪</span>
              בפועל / יעד חודשי
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-red-500">-N%</span>
              סטייה מהיעד
            </span>
          </div>

          <TargetBar
            label='סה"כ מכירות'
            actual={sales.total.current}
            target={sales.total.target}
            vsTarget={sales.total.vsTarget}
            delay={0}
          />
          <TargetBar
            label="מכירות רשת"
            actual={sales.network.current}
            target={sales.network.target}
            vsTarget={sales.network.vsTarget}
            ranking={sales.network.ranking}
            delay={120}
          />
          <TargetBar
            label="מכירות אינטרנט"
            actual={sales.internet.current}
            target={sales.internet.target}
            vsTarget={sales.internet.vsTarget}
            ranking={sales.internet.ranking}
            delay={240}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
