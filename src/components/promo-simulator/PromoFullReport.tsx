import { verdictLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  DECISION_LABEL,
  SCENARIO_LABEL,
  type SimulatorState,
} from "@/lib/promo-simulator/state";
import { findSegmentById } from "@/data/mock-taxonomy";

function resolveSegmentLabel(segmentId: string): string {
  if (!segmentId) return "";
  return findSegmentById(segmentId)?.nameHe ?? segmentId;
}

interface PromoFullReportProps {
  state: SimulatorState;
  metrics: PromoMetrics;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[#F1EBE3] last:border-b-0">
      <span className="text-[14px] text-[#4A5568] shrink-0">{label}</span>
      <span className="text-[14px] font-semibold text-[#2D3748] text-left break-words">
        {value || "—"}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-[#E7E0D8] bg-white p-5 break-inside-avoid">
      <h2 className="text-[18px] font-bold text-[#2D3748] mb-3 pb-2 border-b border-[#E7E0D8]">
        {title}
      </h2>
      <div className="space-y-0">{children}</div>
    </section>
  );
}

function boolLabel(v: boolean): string {
  return v ? "כן" : "לא";
}

function formatDateHe(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function PromoFullReport({ state, metrics: m }: PromoFullReportProps) {
  const breakEvenStr = Number.isFinite(m.breakEvenUnits)
    ? formatNumber(m.breakEvenUnits)
    : "—";
  const generatedAt = new Date().toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      dir="rtl"
      className="bg-[#FAF8F5] p-8 space-y-4"
      style={{ width: 800, fontFamily: "Rubik, sans-serif" }}
    >
      <header className="space-y-1 pb-4 border-b border-[#E7E0D8]">
        <h1 className="text-[28px] font-bold text-[#2D3748]">תיק מבצע</h1>
        <p className="text-[14px] text-[#4A5568]">
          סימולטור מבצעים · {state.retailer || "סופר ספיר"} · הופק {generatedAt}
        </p>
        {(state.product || state.category) && (
          <p className="text-[16px] font-semibold text-[#DC4E59]">
            {[state.category, state.product].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      <Section title="רקע / בריף">
        <Row label="קטגוריה" value={state.category} />
        <Row label="סגמנט" value={resolveSegmentLabel(state.segment)} />
        <Row label="מוצר" value={state.product} />
        <Row label="פורמט" value={state.salesArena} />
        <Row label="רשת" value={state.retailer} />
        <Row label="תאריך תחילת מבצע" value={formatDateHe(state.startDate)} />
        <Row
          label="משך המבצע"
          value={state.durationWeeks ? `${state.durationWeeks} שבועות` : ""}
        />
        <Row label="מנהל קטגוריה" value={state.categoryManager} />
      </Section>

      <Section title="מטרה וסוג מבצע">
        <Row label="מטרת המבצע" value={state.goal} />
        <Row label="סוג המבצע" value={state.promoType} />
      </Section>

      <Section title="פרטי המבצע">
        <Row label="הנחה" value={`${state.discountPct}%`} />
        <Row
          label="מכירות בסיס בתקופה (יחידות)"
          value={formatNumber(state.baseUnits)}
        />
        <Row label="מחיר רגיל ליחידה" value={formatCurrency(state.unitPrice)} />
        <Row label="עלות ליחידה" value={formatCurrency(state.unitCost)} />
        <Row label="גידול צפוי במכר (uplift)" value={`${state.upliftPct}%`} />
        <Row label="עלות שיווק" value={formatCurrency(state.mktCost)} />
        <Row label="עלות תפעול ליחידה" value={formatCurrency(state.opsCost)} />
        <Row label="שיעור קניבליזציה" value={`${state.cannibPct}%`} />
        <Row
          label="מחיר אפקטיבי ליחידה"
          value={formatCurrency(m.effectivePrice)}
        />
        <Row label="רווח ליחידה" value={formatCurrency(m.unitMargin)} />
      </Section>

      <Section title="KPI מפתח">
        <Row label="יחידות במבצע" value={formatNumber(m.promoUnits)} />
        <Row label="יחידות נוספות" value={formatNumber(m.extraUnits)} />
        <Row label="פדיון בסיס" value={formatCurrency(m.baseRevenue)} />
        <Row label="פדיון במבצע" value={formatCurrency(m.promoRevenue)} />
        <Row label="רווח בסיס" value={formatCurrency(m.baseProfit)} />
        <Row label="רווח במבצע" value={formatCurrency(m.promoProfit)} />
        <Row label="השפעת קניבליזציה" value={formatCurrency(m.cannibLoss)} />
        <Row label="רווח תוספתי נטו" value={formatCurrency(m.netProfit)} />
        <Row label="שולי רווח גולמי בסיס" value={`${m.baseGrossMargin}%`} />
        <Row label="שולי רווח גולמי מבצע" value={`${m.promoGrossMargin}%`} />
        <Row label="ROI" value={`${m.roi}%`} />
        <Row label="Break-even (יחידות לאיזון)" value={breakEvenStr} />
        <Row label="הערכת כדאיות" value={verdictLabel(m.verdict)} />
        <Row
          label="תרחיש נבחר"
          value={SCENARIO_LABEL[state.selectedScenario]}
        />
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

      {(state.decision || state.analysisNote || state.documentation) && (
        <Section title="החלטה ותיעוד">
          {state.decision && (
            <Row label="החלטה" value={DECISION_LABEL[state.decision]} />
          )}
          {state.analysisNote && (
            <div className="py-2 border-b border-[#F1EBE3]">
              <p className="text-[14px] text-[#4A5568] mb-1">הצדקה ותובנות</p>
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

      <footer className="pt-4 text-[12px] text-[#788390] text-center">
        Retalio · תיק מבצע הופק אוטומטית מהסימולטור
      </footer>
    </div>
  );
}
