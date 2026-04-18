import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusLabel, type PromoMetrics, type PromoStatus } from '@/lib/promo-simulator/calc'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { SimulatorState } from '@/lib/promo-simulator/state'

interface Step8AnalysisProps {
  analysisNote: string
  metrics: PromoMetrics
  onChange: (update: Partial<Pick<SimulatorState, 'analysisNote'>>) => void
}

const STATUS_BADGE: Record<
  PromoStatus,
  { bg: string; color: string; border: string }
> = {
  worthIt: {
    bg: 'rgba(16, 185, 129, 0.16)',
    color: '#047857',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  needsImprovement: {
    bg: 'rgba(251, 191, 36, 0.16)',
    color: '#92400E',
    border: 'rgba(251, 191, 36, 0.4)',
  },
  notWorthIt: {
    bg: 'rgba(244, 63, 94, 0.14)',
    color: '#9F1239',
    border: 'rgba(244, 63, 94, 0.35)',
  },
}

function signed(value: number): string {
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

function signedUnits(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const formatted = formatNumber(Math.abs(Math.round(value)))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

interface MetricCardProps {
  title: string
  value: string
  sub: string
  accent?: string
}

function MetricCard({
  title,
  value,
  sub,
  accent = '#DC4E59',
}: MetricCardProps) {
  return (
    <Card className="border-[#FFE8DE] rounded-[16px]">
      <CardContent className="p-5">
        <p className="text-[15px] font-medium text-[#A0AEC0] uppercase tracking-wide">
          {title}
        </p>
        <p
          className="text-3xl font-bold font-mono mt-1"
          style={{ color: accent }}
          dir="ltr"
        >
          {value}
        </p>
        <p className="text-[15px] text-[#4A5568] mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

export function Step8Analysis({ analysisNote, metrics: m, onChange }: Step8AnalysisProps) {
  const profitDelta = m.promoProfit - m.baseProfit
  const breakEvenDelta = Number.isFinite(m.breakEvenUnits)
    ? m.promoUnits - m.breakEvenUnits
    : Number.NaN
  const badge = STATUS_BADGE[m.status]

  return (
    <Card className="border-[#FFE8DE] rounded-[16px]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-2xl text-[#2D3748]">
              ניתוח והערכה
            </CardTitle>
            <p className="text-lg text-[#4A5568]">
              הערכה כללית וכתיבת תובנות על בסיס הנתונים
            </p>
          </div>
          <span
            className="inline-flex items-center rounded-[20px] px-4 py-1.5 text-[16px] font-semibold border"
            style={{
              background: badge.bg,
              color: badge.color,
              borderColor: badge.border,
            }}
          >
            {statusLabel(m.status)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 content-start">
            <MetricCard
              title="רווח מול בסיס"
              value={signed(profitDelta)}
              sub="הפרש רווח גולמי: מבצע − בסיס"
              accent={profitDelta >= 0 ? '#10B981' : '#F43F5E'}
            />
            <MetricCard
              title="פער ל-Break-Even"
              value={signedUnits(breakEvenDelta)}
              sub="יחידות מעל / מתחת לנקודת האיזון"
              accent={
                Number.isFinite(breakEvenDelta) && breakEvenDelta >= 0
                  ? '#10B981'
                  : '#F43F5E'
              }
            />
            <MetricCard
              title="כיסוי מלאי"
              value={`${m.stockCoverage}%`}
              sub="מלאי זמין מול תחזית"
              accent={m.stockCoverage >= 100 ? '#10B981' : '#F6B93B'}
            />
          </div>

          <div>
            <label
              htmlFor="analysis-note"
              className="text-[15px] font-medium text-[#4A5568] mb-1.5 block"
            >
              הערכה חופשית
            </label>
            <textarea
              id="analysis-note"
              value={analysisNote}
              onChange={(e) => onChange({ analysisNote: e.target.value })}
              placeholder="כתוב כאן את ההערכה שלך — למשל: האם המבצע מאזן בין גידול נפח לרווחיות? מה הסיכונים? מה נדרש כדי לעבור לסטטוס 'כדאי'?"
              className="w-full min-h-[260px] rounded-[10px] border border-[#FFE8DE] bg-white p-4 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FDF8F6] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40 leading-relaxed resize-y"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
