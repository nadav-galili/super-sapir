import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verdictLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  DECISION_LABEL,
  SCENARIO_LABEL,
  type SimulatorState,
} from "@/lib/promo-simulator/state";
import { findSubCategoryById } from "@/data/mock-promo-taxonomy";
import { getSupplierById } from "@/data/mock-suppliers";
import { findSegmentById } from "@/data/mock-taxonomy";

interface PromoSummaryCardProps {
  state: SimulatorState;
  metrics: PromoMetrics;
}

interface RowProps {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

function Row({ label, value, tone = "neutral" }: RowProps) {
  const color =
    tone === "positive"
      ? "#10B981"
      : tone === "negative"
        ? "#F43F5E"
        : "#2D3748";
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[#F1EBE3] last:border-b-0">
      <span className="text-[16px] text-[#4A5568]">{label}</span>
      <span
        className="text-[16px] font-semibold text-left"
        style={{ color }}
        dir={value && /^[\d₪+\-,. %₪]+$/.test(value) ? "ltr" : "rtl"}
      >
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
    <div className="space-y-0">
      <div className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#DC4E59] mt-3 mb-1.5 first:mt-0">
        {title}
      </div>
      {children}
    </div>
  );
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

function computeEndDate(startDate: string, durationWeeks: number): string {
  if (!startDate || !Number.isFinite(durationWeeks) || durationWeeks <= 0)
    return "";
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.round(durationWeeks * 7));
  return d.toISOString().slice(0, 10);
}

export function PromoSummaryCard({ state, metrics: m }: PromoSummaryCardProps) {
  const subcategoryName =
    findSubCategoryById(state.subcategory)?.subCategory.nameHe ?? "";
  const supplierName = state.supplier
    ? (getSupplierById(state.supplier)?.name ?? "")
    : "";
  const segmentName = state.segment
    ? (findSegmentById(state.segment)?.nameHe ?? "")
    : "";
  const decisionLabel = state.decision ? DECISION_LABEL[state.decision] : "";

  const startDateLabel = formatDateHe(state.startDate);
  const endDateLabel = formatDateHe(
    computeEndDate(state.startDate, state.durationWeeks)
  );
  const periodLabel = startDateLabel
    ? `${startDateLabel}${endDateLabel ? ` ← ${endDateLabel}` : ""} · ${state.durationWeeks} שבועות`
    : "";

  const savingPct = Math.round(m.effectiveDiscount * 100);
  const priceLabel = `₪${state.unitPrice.toFixed(2)} → ₪${m.effectivePrice.toFixed(2)} (-${savingPct}%)`;

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardHeader>
        <CardTitle className="text-xl text-[#2D3748]">תקציר תיק מבצע</CardTitle>
        <p className="text-[16px] text-[#4A5568]">סיכום הבחירות בכל השלבים</p>
      </CardHeader>
      <CardContent>
        <Section title="מוצר ושיוך">
          <Row label="קטגוריה" value={state.category} />
          <Row label="תת-קטגוריה" value={subcategoryName} />
          <Row label="ספק" value={supplierName} />
          <Row label="במה" value={state.salesArena} />
          {segmentName && <Row label="קהל יעד" value={segmentName} />}
        </Section>

        <Section title="אסטרטגיה ותזמון">
          <Row label="מטרה" value={state.goal} />
          <Row label="סוג מבצע" value={state.promoType} />
          <Row label="תקופה" value={periodLabel} />
        </Section>

        <Section title="פרמטרים">
          <Row label="מחיר רגיל ← מבצע" value={priceLabel} />
          <Row label="uplift צפוי" value={`${state.upliftPct}%`} />
          <Row label="עלויות נוספות" value={formatCurrency(state.mktCost)} />
          <Row
            label="מכירות בסיס בתקופה"
            value={`${formatNumber(state.baseUnits)} יח'`}
          />
        </Section>

        <Section title="תוצאות פיננסיות">
          <Row label="פדיון צפוי" value={formatCurrency(m.promoRevenue)} />
          <Row
            label="רווח תוספתי נטו"
            value={formatCurrency(m.netProfit)}
            tone={m.netProfit >= 0 ? "positive" : "negative"}
          />
          {state.mktCost > 0 && (
            <Row
              label="ROI"
              value={`${m.roi}%`}
              tone={m.roi >= 0 ? "positive" : "negative"}
            />
          )}
          <Row
            label="הערכת כדאיות"
            value={verdictLabel(m.verdict)}
            tone={
              m.verdict === "worthIt"
                ? "positive"
                : m.verdict === "notWorthIt"
                  ? "negative"
                  : "neutral"
            }
          />
        </Section>

        <Section title="החלטה">
          <Row
            label="תרחיש נבחר"
            value={SCENARIO_LABEL[state.selectedScenario]}
          />
          <Row label="החלטת המנהל" value={decisionLabel} />
        </Section>
      </CardContent>
    </Card>
  );
}
