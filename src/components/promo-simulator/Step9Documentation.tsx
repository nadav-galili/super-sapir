import { FileCheck2, Table } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verdictLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import { formatCurrency } from "@/lib/format";
import { PromoSummaryCard } from "./PromoSummaryCard";
import {
  DECISION_LABEL,
  type SimulatorState,
} from "@/lib/promo-simulator/state";
import { findSegmentById } from "@/data/mock-taxonomy";
import { StepHeader } from "./StepHeader";

const VERDICT_PILL = {
  worthIt: { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" },
  borderline: { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E" },
  notWorthIt: { bg: "#FFF1F2", border: "#FDA4AF", text: "#9F1239" },
} as const;

interface Step9DocumentationProps {
  state: SimulatorState;
  metrics: PromoMetrics;
  onChange: (update: Partial<Pick<SimulatorState, "documentation">>) => void;
}

const TABLE_HEADERS = [
  "סוג מבצע",
  "פורמט",
  "קהל יעד",
  "התניה",
  "הטבה",
  "הערכת כדאיות",
  "החלטה",
  "תקופה",
  "עלות שיווק",
  "רווח תוספתי נטו",
  "uplift",
] as const;

export function Step9Documentation({
  state,
  metrics: m,
  onChange,
}: Step9DocumentationProps) {
  const period = state.startDate
    ? `${state.startDate} · ${state.durationWeeks} שבועות`
    : "—";
  const decisionLabel = state.decision ? DECISION_LABEL[state.decision] : "—";

  const segmentLabel = findSegmentById(state.segment)?.nameHe ?? state.segment;

  const row: string[] = [
    state.promoType || "—",
    state.salesArena || "—",
    segmentLabel || "—",
    state.conditionText || "—",
    state.benefitText || "—",
    verdictLabel(m.verdict),
    decisionLabel,
    period,
    formatCurrency(state.mktCost),
    formatCurrency(m.netProfit),
    `+${state.upliftPct}%`,
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#E7E0D8] rounded-[16px]">
          <CardContent className="pt-6">
            <StepHeader
              step={7}
              title="תיעוד"
              description="תעד את המבצע להעברה להנהלה ולארכיון"
              icon={FileCheck2}
              pill={{
                label: verdictLabel(m.verdict),
                ...VERDICT_PILL[m.verdict],
              }}
            />
            <label
              htmlFor="documentation"
              className="text-[16px] font-semibold text-[#2D3748] mb-1.5 block"
            >
              תיעוד מלא
            </label>
            <textarea
              id="documentation"
              value={state.documentation}
              onChange={(e) => onChange({ documentation: e.target.value })}
              placeholder="תעד כאן את ההחלטות, ההנחות, והאחראים. לדוגמה: מטרה עסקית, הצדקה לבחירת סוג המבצע, סיכונים מזוהים, תוכנית מעקב."
              className="w-full min-h-[300px] rounded-[10px] border border-[#E7E0D8] bg-white p-4 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40 leading-relaxed resize-y"
            />
          </CardContent>
        </Card>

        <PromoSummaryCard state={state} metrics={m} />
      </div>

      <Card className="border-[#E7E0D8] rounded-[16px]">
        <CardHeader className="border-b border-[#F1EBE3]">
          <CardTitle className="text-xl text-[#2D3748] flex items-center gap-2">
            <Table className="h-5 w-5 text-[#DC4E59]" strokeWidth={2.2} />
            טבלת סיכום מבצע
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="text-[15px] font-semibold text-[#788390] uppercase tracking-wide px-3 py-2 border-b border-[#F1EBE3]"
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
                      className="text-[16px] text-[#2D3748] px-3 py-3 border-b border-[#F1EBE3] align-top"
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
