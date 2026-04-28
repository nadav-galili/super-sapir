import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import { formatCurrency } from "@/lib/format";
import type { SimulatorState } from "@/lib/promo-simulator/state";

interface PromoSummaryCardProps {
  state: SimulatorState;
  metrics: PromoMetrics;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[#F1EBE3] last:border-b-0">
      <span className="text-[16px] text-[#4A5568]">{label}</span>
      <span className="text-[16px] font-semibold text-[#2D3748] text-left">
        {value || "—"}
      </span>
    </div>
  );
}

export function PromoSummaryCard({ state, metrics: m }: PromoSummaryCardProps) {
  const conditionBenefit = [state.conditionText, state.benefitText]
    .filter(Boolean)
    .join(" → ");

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
          <Row label="רווח צפוי" value={formatCurrency(m.promoProfit)} />
          <Row label="סטטוס" value={statusLabel(m.status)} />
        </div>
      </CardContent>
    </Card>
  );
}
