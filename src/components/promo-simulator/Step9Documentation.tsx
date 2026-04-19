import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import { formatCurrency } from "@/lib/format";
import { PromoSummaryCard } from "./PromoSummaryCard";
import type { SimulatorState } from "@/lib/promo-simulator/state";
import { findSegmentById } from "@/data/mock-taxonomy";

interface Step9DocumentationProps {
  state: SimulatorState;
  metrics: PromoMetrics;
  onChange: (update: Partial<Pick<SimulatorState, "documentation">>) => void;
}

const TABLE_HEADERS = [
  "סוג מבצע",
  "זירה",
  "קהל יעד",
  "התניה",
  "הטבה",
  "משמעות ההטבה",
  "תקופה",
  "עלות מימוש",
  "גידול ריאלי",
] as const;

export function Step9Documentation({
  state,
  metrics: m,
  onChange,
}: Step9DocumentationProps) {
  const benefitMeaning =
    state.conditionText || state.benefitText
      ? `${statusLabel(m.status)} · רווח ${formatCurrency(m.promoProfit)}`
      : "—";
  const period = state.startDate
    ? `${state.startDate} · ${state.durationWeeks} שבועות`
    : "—";
  const cost = formatCurrency(m.investment);
  const realGrowth = `+${state.upliftPct}%`;

  const segmentLabel = findSegmentById(state.segment)?.nameHe ?? state.segment;

  const row: string[] = [
    state.promoType || "—",
    state.salesArena || "—",
    segmentLabel || "—",
    state.conditionText || "—",
    state.benefitText || "—",
    benefitMeaning,
    period,
    cost,
    realGrowth,
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#FFE8DE] rounded-[16px]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#2D3748]">תיעוד</CardTitle>
            <p className="text-lg text-[#4A5568]">
              תעד את המבצע להעברה להנהלה ולארכיון
            </p>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="documentation"
              className="text-[15px] font-medium text-[#4A5568] mb-1.5 block"
            >
              תיעוד מלא
            </label>
            <textarea
              id="documentation"
              value={state.documentation}
              onChange={(e) => onChange({ documentation: e.target.value })}
              placeholder="תעד כאן את ההחלטות, ההנחות, והאחראים. לדוגמה: מטרה עסקית, הצדקה לבחירת סוג המבצע, סיכונים מזוהים, תוכנית מעקב."
              className="w-full min-h-[300px] rounded-[10px] border border-[#FFE8DE] bg-white p-4 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FDF8F6] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40 leading-relaxed resize-y"
            />
          </CardContent>
        </Card>

        <PromoSummaryCard state={state} metrics={m} />
      </div>

      <Card className="border-[#FFE8DE] rounded-[16px]">
        <CardHeader>
          <CardTitle className="text-xl text-[#2D3748]">
            טבלת סיכום מבצע
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="text-[15px] font-semibold text-[#A0AEC0] uppercase tracking-wide px-3 py-2 border-b border-[#FFF0EA]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className="text-[16px] text-[#2D3748] px-3 py-3 border-b border-[#FFF0EA] align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
