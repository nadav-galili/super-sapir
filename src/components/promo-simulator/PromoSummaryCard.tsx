import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verdictLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import { formatCurrency } from "@/lib/format";
import {
  DECISION_LABEL,
  type SimulatorState,
} from "@/lib/promo-simulator/state";

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
      <span className="text-[16px] font-semibold text-left" style={{ color }}>
        {value || "—"}
      </span>
    </div>
  );
}

export function PromoSummaryCard({ state, metrics: m }: PromoSummaryCardProps) {
  const conditionBenefit = [state.conditionText, state.benefitText]
    .filter(Boolean)
    .join(" → ");
  const decisionLabel = state.decision ? DECISION_LABEL[state.decision] : "—";

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardHeader>
        <CardTitle className="text-xl text-[#2D3748]">תקציר תיק מבצע</CardTitle>
        <p className="text-[16px] text-[#4A5568]">סיכום הבחירות בכל השלבים</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          <Row label="קטגוריה" value={state.category} />
          <Row label="מוצר" value={state.product} />
          <Row label="מטרה" value={state.goal} />
          <Row label="סוג מבצע" value={state.promoType} />
          <Row label="התניה + הטבה" value={conditionBenefit} />
          <Row label="פדיון צפוי" value={formatCurrency(m.promoRevenue)} />
          <Row
            label="רווח תוספתי נטו"
            value={formatCurrency(m.netProfit)}
            tone={m.netProfit >= 0 ? "positive" : "negative"}
          />
          <Row
            label="ROI"
            value={`${m.roi}%`}
            tone={m.roi >= 0 ? "positive" : "negative"}
          />
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
          <Row label="החלטה" value={decisionLabel} />
        </div>
      </CardContent>
    </Card>
  );
}
