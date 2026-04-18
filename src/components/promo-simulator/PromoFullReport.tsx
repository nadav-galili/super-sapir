import { calcMetrics, statusLabel } from '@/lib/promo-simulator/calc'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { SimulatorState } from '@/lib/promo-simulator/state'

interface PromoFullReportProps {
  state: SimulatorState
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[#FFF0EA] last:border-b-0">
      <span className="text-[14px] text-[#4A5568] shrink-0">{label}</span>
      <span className="text-[14px] font-semibold text-[#2D3748] text-left break-words">
        {value || '—'}
      </span>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[12px] border border-[#FFE8DE] bg-white p-5 break-inside-avoid">
      <h2 className="text-[18px] font-bold text-[#2D3748] mb-3 pb-2 border-b border-[#FFE8DE]">
        {title}
      </h2>
      <div className="space-y-0">{children}</div>
    </section>
  )
}

function boolLabel(v: boolean): string {
  return v ? 'כן' : 'לא'
}

function formatDateHe(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function PromoFullReport({ state }: PromoFullReportProps) {
  const m = calcMetrics(state)
  const conditionBenefit = [state.conditionText, state.benefitText]
    .filter(Boolean)
    .join(' → ')
  const breakEvenStr = Number.isFinite(m.breakEvenUnits)
    ? formatNumber(m.breakEvenUnits)
    : '—'
  const generatedAt = new Date().toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      dir="rtl"
      className="bg-[#FDF8F6] p-8 space-y-4"
      style={{ width: 800, fontFamily: 'Rubik, sans-serif' }}
    >
      <header className="space-y-1 pb-4 border-b border-[#FFE8DE]">
        <h1 className="text-[28px] font-bold text-[#2D3748]">תיק מבצע</h1>
        <p className="text-[14px] text-[#4A5568]">
          סימולטור מבצעים · {state.retailer || 'סופר ספיר'} · הופק {generatedAt}
        </p>
        {(state.product || state.category) && (
          <p className="text-[16px] font-semibold text-[#DC4E59]">
            {[state.category, state.product].filter(Boolean).join(' · ')}
          </p>
        )}
      </header>

      <Section title="רקע / בריף">
        <Row label="קטגוריה" value={state.category} />
        <Row label="סגמנט" value={state.segment} />
        <Row label="מוצר" value={state.product} />
        <Row label="זירת מכירה" value={state.salesArena} />
        <Row label="רשת" value={state.retailer} />
        <Row label="תאריך תחילת מבצע" value={formatDateHe(state.startDate)} />
        <Row
          label="משך המבצע"
          value={
            state.durationWeeks
              ? `${state.durationWeeks} שבועות`
              : ''
          }
        />
        <Row label="אחראי מכירות" value={state.salesOwner} />
      </Section>

      <Section title="מטרה וסוג מבצע">
        <Row label="מטרת המבצע" value={state.goal} />
        <Row label="סוג המבצע" value={state.promoType} />
      </Section>

      <Section title="התניה והטבה">
        <Row label="התניה" value={state.conditionText} />
        <Row label="הטבה" value={state.benefitText} />
        <Row label="תקציר" value={conditionBenefit} />
        <Row label="הנחה" value={`${state.discountPct}%`} />
      </Section>

      <Section title="יעדים ותחזית">
        <Row label="מכר בסיסי צפוי (יחידות)" value={formatNumber(state.baseUnits)} />
        <Row label="מחיר רגיל ליחידה" value={formatCurrency(state.unitPrice)} />
        <Row label="עלות ליחידה" value={formatCurrency(state.unitCost)} />
        <Row label="גידול צפוי במכר" value={`${state.upliftPct}%`} />
        <Row label="מלאי זמין ליחידות" value={formatNumber(state.stockUnits)} />
        <Row label="מחיר אפקטיבי ליחידה" value={formatCurrency(m.effectivePrice)} />
        <Row label="רווח ליחידה" value={formatCurrency(m.unitMargin)} />
      </Section>

      <Section title="KPI מפתח">
        <Row label="יחידות במבצע" value={formatNumber(m.promoUnits)} />
        <Row label="פדיון בסיס" value={formatCurrency(m.baseRevenue)} />
        <Row label="פדיון במבצע" value={formatCurrency(m.promoRevenue)} />
        <Row label="רווח בסיס" value={formatCurrency(m.baseProfit)} />
        <Row label="רווח במבצע" value={formatCurrency(m.promoProfit)} />
        <Row label="השקעה מוערכת" value={formatCurrency(m.investment)} />
        <Row label="ROI" value={`${m.roi}%`} />
        <Row label="Break-even (יחידות לאיזון)" value={breakEvenStr} />
        <Row label="כיסוי מלאי" value={`${m.stockCoverage}%`} />
        <Row label="סטטוס" value={statusLabel(m.status)} />
      </Section>

      <Section title="יישום בשטח">
        <Row label="שילוט" value={boolLabel(state.signage)} />
        <Row label="עמדות מדף" value={boolLabel(state.shelf)} />
        <Row label="הדרכת צוות" value={boolLabel(state.training)} />
        <Row label="תדריך קופות" value={boolLabel(state.cashierBrief)} />
      </Section>

      <Section title="בקרה">
        <Row label="בקרת מחיר" value={boolLabel(state.controlPrice)} />
        <Row label="בקרת מלאי" value={boolLabel(state.controlStock)} />
        <Row label="בקרת תצוגה" value={boolLabel(state.controlDisplay)} />
      </Section>

      {(state.analysisNote || state.documentation) && (
        <Section title="ניתוח ותיעוד">
          {state.analysisNote && (
            <div className="py-2 border-b border-[#FFF0EA]">
              <p className="text-[14px] text-[#4A5568] mb-1">הערות ניתוח</p>
              <p className="text-[14px] text-[#2D3748] whitespace-pre-wrap">
                {state.analysisNote}
              </p>
            </div>
          )}
          {state.documentation && (
            <div className="py-2">
              <p className="text-[14px] text-[#4A5568] mb-1">תיעוד</p>
              <p className="text-[14px] text-[#2D3748] whitespace-pre-wrap">
                {state.documentation}
              </p>
            </div>
          )}
        </Section>
      )}

      <footer className="pt-4 text-[12px] text-[#A0AEC0] text-center">
        RetailSkillz Analytics · תיק מבצע הופק אוטומטית מהסימולטור
      </footer>
    </div>
  )
}
