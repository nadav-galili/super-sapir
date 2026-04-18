import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calcMetrics } from '@/lib/promo-simulator/calc'
import { formatCurrency, formatNumber } from '@/lib/format'
import { getKpiStatusColor, KPI_STATUS } from '@/lib/colors'
import { UpliftChart } from './UpliftChart'
import type { SimulatorState } from '@/lib/promo-simulator/state'

interface Step5ForecastProps {
  state: SimulatorState
  onChange: (update: Partial<SimulatorState>) => void
}

const LABEL = 'text-[15px] font-medium text-[#4A5568] mb-1.5 block'
const INPUT_CLS =
  'flex h-10 w-full items-center rounded-[10px] border border-[#FFE8DE] bg-white px-3 py-2 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FDF8F6] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40 font-mono'

interface KpiCardProps {
  title: string
  value: string
  sub: string
  accent?: string
}

function KpiCard({ title, value, sub, accent = KPI_STATUS.good }: KpiCardProps) {
  return (
    <Card className="border-[#FFE8DE] rounded-[16px]">
      <CardContent className="p-5 min-w-0">
        <p className="text-[15px] font-medium text-[#A0AEC0] uppercase tracking-wide whitespace-nowrap truncate">
          {title}
        </p>
        <p
          className="text-2xl font-bold font-mono mt-1 whitespace-nowrap truncate"
          style={{ color: accent }}
          dir="ltr"
        >
          {value}
        </p>
        <p className="text-[15px] text-[#4A5568] mt-1 whitespace-nowrap truncate" dir="ltr">
          {sub}
        </p>
      </CardContent>
    </Card>
  )
}

export function Step5Forecast({ state, onChange }: Step5ForecastProps) {
  const m = calcMetrics(state)
  const breakEvenStr = Number.isFinite(m.breakEvenUnits)
    ? formatNumber(m.breakEvenUnits)
    : '—'
  const coverageColor = getKpiStatusColor(Math.min(m.stockCoverage / 100, 1))
  const roiColor =
    m.roi >= 15 ? KPI_STATUS.good : m.roi >= 0 ? KPI_STATUS.warning : KPI_STATUS.bad
  const revenueColor = getKpiStatusColor(
    m.baseRevenue > 0 ? m.promoRevenue / m.baseRevenue : 1
  )
  const profitColor = getKpiStatusColor(
    m.baseProfit > 0 ? m.promoProfit / m.baseProfit : m.promoProfit > 0 ? 1 : 0.5
  )
  const upliftColor = getKpiStatusColor(
    state.upliftPct >= 15 ? 1 : state.upliftPct >= 5 ? 0.9 : 0.7
  )
  const breakEvenColor = Number.isFinite(m.breakEvenUnits)
    ? getKpiStatusColor(
        m.breakEvenUnits > 0 && m.promoUnits > 0
          ? Math.min(m.promoUnits / m.breakEvenUnits, 2)
          : 0.5
      )
    : KPI_STATUS.bad

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#FFE8DE] rounded-[16px]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#2D3748]">
              יעדים / תחזית
            </CardTitle>
            <p className="text-lg text-[#4A5568] text-balance">
              הזן את הנתונים הצפויים — ה-KPI יתעדכנו בזמן&nbsp;אמת
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={LABEL} htmlFor="f-base-units">
                מכר בסיסי צפוי (יחידות)
              </label>
              <input
                id="f-base-units"
                type="number"
                min={0}
                value={state.baseUnits}
                onChange={(e) =>
                  onChange({ baseUnits: Number(e.target.value) || 0 })
                }
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="f-unit-price">
                מחיר רגיל ליחידה
              </label>
              <input
                id="f-unit-price"
                type="number"
                min={0}
                step={0.1}
                value={state.unitPrice}
                onChange={(e) =>
                  onChange({ unitPrice: Number(e.target.value) || 0 })
                }
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="f-unit-cost">
                עלות ליחידה
              </label>
              <input
                id="f-unit-cost"
                type="number"
                min={0}
                step={0.1}
                value={state.unitCost}
                onChange={(e) =>
                  onChange({ unitCost: Number(e.target.value) || 0 })
                }
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={LABEL} htmlFor="f-uplift">
                  גידול צפוי במכר (%)
                </label>
                <span
                  className="text-xl font-mono font-bold"
                  style={{ color: '#DC4E59' }}
                  dir="ltr"
                >
                  {state.upliftPct}%
                </span>
              </div>
              <input
                id="f-uplift"
                type="range"
                min={0}
                max={80}
                step={1}
                value={state.upliftPct}
                onChange={(e) =>
                  onChange({ upliftPct: Number(e.target.value) })
                }
                className="w-full h-2 rounded-[5px] accent-[#DC4E59]"
                style={{
                  background: `linear-gradient(90deg, #DC4E59 0%, #DC4E59 ${(state.upliftPct / 80) * 100}%, #FFE8DE ${(state.upliftPct / 80) * 100}%, #FFE8DE 100%)`,
                }}
                dir="ltr"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="f-stock">
                מלאי זמין ליחידות
              </label>
              <input
                id="f-stock"
                type="number"
                min={0}
                value={state.stockUnits}
                onChange={(e) =>
                  onChange({ stockUnits: Number(e.target.value) || 0 })
                }
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          <KpiCard
            title="פדיון צפוי"
            value={formatCurrency(m.promoRevenue)}
            sub={`בסיס: ${formatCurrency(m.baseRevenue)}`}
            accent={revenueColor}
          />
          <KpiCard
            title="רווח גולמי צפוי"
            value={formatCurrency(m.promoProfit)}
            sub={`בסיס: ${formatCurrency(m.baseProfit)}`}
            accent={profitColor}
          />
          <KpiCard
            title="יחידות במבצע"
            value={formatNumber(m.promoUnits)}
            sub="כולל uplift"
            accent={upliftColor}
          />
          <KpiCard
            title="Break-even"
            value={breakEvenStr}
            sub="יחידות לאיזון"
            accent={breakEvenColor}
          />
          <KpiCard
            title="ROI"
            value={`${m.roi}%`}
            sub="אומדן מול השקעה"
            accent={roiColor}
          />
          <KpiCard
            title="כיסוי מלאי"
            value={`${m.stockCoverage}%`}
            sub="מלאי מול תחזית"
            accent={coverageColor}
          />
        </div>
      </div>

      <UpliftChart state={state} />
    </div>
  )
}
