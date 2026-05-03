import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  calcForScenario,
  effectiveDiscountFor,
  verdictLabel,
  type PromoMetrics,
} from "@/lib/promo-simulator/calc";
import {
  SCENARIOS,
  SCENARIO_LABEL,
  type Scenario,
  type SimulatorState,
} from "@/lib/promo-simulator/state";

interface Step5ScenariosProps {
  state: SimulatorState;
  metrics: PromoMetrics;
  onChange: (update: Partial<SimulatorState>) => void;
}

const SCENARIO_DESC: Record<Scenario, string> = {
  pessimistic: "uplift נמוך, קניבליזציה גבוהה",
  base: "הפרמטרים הנוכחיים שלך",
  optimistic: "uplift גבוה, קניבליזציה נמוכה",
};

function riskLevel(
  value: number,
  lowAbove: number,
  midAbove: number
): "low" | "mid" | "high" {
  if (value >= lowAbove) return "low";
  if (value >= midAbove) return "mid";
  return "high";
}

function riskInverse(
  value: number,
  midBelow: number,
  highBelow: number
): "low" | "mid" | "high" {
  if (value < highBelow) return "low";
  if (value < midBelow) return "mid";
  return "high";
}

const RISK_LABEL: Record<"low" | "mid" | "high", string> = {
  low: "נמוך",
  mid: "בינוני",
  high: "גבוה",
};
const RISK_COLOR: Record<"low" | "mid" | "high", string> = {
  low: "#10B981",
  mid: "#FBBF24",
  high: "#F43F5E",
};

export function Step5Scenarios({
  state,
  metrics,
  onChange,
}: Step5ScenariosProps) {
  const scenarioMetrics: Record<Scenario, PromoMetrics> = {
    pessimistic: calcForScenario(state, "pessimistic"),
    base: calcForScenario(state, "base"),
    optimistic: calcForScenario(state, "optimistic"),
  };
  const selected = scenarioMetrics[state.selectedScenario];

  const scenarioBars = SCENARIOS.map((sc) => ({
    name: SCENARIO_LABEL[sc],
    profit: scenarioMetrics[sc].netProfit,
    isSelected: sc === state.selectedScenario,
  }));

  // Break-even curve: for a range of discount %, the minimum uplift needed for net-zero
  const discounts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const beCurve = discounts.map((d) => {
    const pp = state.unitPrice * (1 - d / 100);
    const margin = pp - state.unitCost - state.opsCost;
    const beUnits = margin > 0 ? state.mktCost / margin : Infinity;
    const minUpliftPct =
      Number.isFinite(beUnits) && state.baseUnits > 0
        ? Math.min(300, Math.round((beUnits / state.baseUnits) * 100))
        : 300;
    return {
      discount: `${d}%`,
      "uplift נדרש (%)": minUpliftPct,
      "uplift שלך (%)": Math.round(state.upliftPct),
    };
  });

  // Current break-even details
  const effDisc = effectiveDiscountFor(state.promoType, state.discountPct);
  const pp = state.unitPrice * (1 - effDisc);
  const margin = pp - state.unitCost - state.opsCost;
  const beUnits = margin > 0 ? Math.round(state.mktCost / margin) : Infinity;
  const minUplift =
    margin > 0 && state.baseUnits > 0
      ? Math.round((beUnits / state.baseUnits) * 100)
      : 999;
  const safetyMargin = Math.round(state.upliftPct) - minUplift;

  const gmRisk = riskInverse(metrics.promoGrossMargin, 20, 10);
  const cannibRisk = riskLevel(80 - state.cannibPct, 65, 50); // higher cannib → higher risk
  const roiRisk = riskInverse(metrics.roi, 50, 0);
  const riskScore =
    [gmRisk, cannibRisk, roiRisk].filter((x) => x === "high").length * 33 +
    [gmRisk, cannibRisk, roiRisk].filter((x) => x === "mid").length * 17;
  const totalRiskLevel =
    riskScore >= 66 ? "high" : riskScore >= 33 ? "mid" : "low";

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#2D3748]">
          השוואת תרחישים ונקודת איזון
        </CardTitle>
        <p className="text-lg text-[#4A5568]">
          ניתוח רגישות והיכן עובר הקו שמייצר רווח
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="compare" dir="rtl" className="w-full">
          <TabsList className="bg-[#FAF8F5] border border-[#E7E0D8] rounded-[10px] h-auto p-1">
            <TabsTrigger
              value="compare"
              className="text-[16px] data-[state=active]:bg-white data-[state=active]:text-[#2D3748] px-4 py-1.5"
            >
              השוואת תרחישים
            </TabsTrigger>
            <TabsTrigger
              value="breakeven"
              className="text-[16px] data-[state=active]:bg-white data-[state=active]:text-[#2D3748] px-4 py-1.5"
            >
              נקודת איזון
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 — COMPARE */}
          <TabsContent value="compare" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {SCENARIOS.map((sc) => {
                const isSel = sc === state.selectedScenario;
                return (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => onChange({ selectedScenario: sc })}
                    className={`text-right rounded-[12px] p-4 transition-all ${
                      isSel
                        ? "border-2 border-[#DC4E59] bg-[#FFF1F0]"
                        : "border border-[#E7E0D8] bg-white hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="text-[16px] font-semibold text-[#2D3748]">
                      תרחיש {SCENARIO_LABEL[sc]}
                    </div>
                    <div className="text-[15px] text-[#788390] mt-1">
                      {SCENARIO_DESC[sc]}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  ניתוח רגישות — ב-3 תרחישים
                </div>
                <div dir="ltr" className="w-full h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scenarioBars}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1EBE3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 16, fill: "#4A5568" }}
                      />
                      <YAxis
                        tick={{ fontSize: 16, fill: "#4A5568" }}
                        tickFormatter={(v) => `₪${Math.round(v / 1000)}K`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #E7E0D8",
                          borderRadius: 10,
                          fontSize: 16,
                        }}
                        formatter={(v) =>
                          typeof v === "number" ? formatCurrency(v) : String(v)
                        }
                      />
                      <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                        {scenarioBars.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.profit >= 0 ? "#10B981" : "#F43F5E"}
                            opacity={entry.isSelected ? 1 : 0.5}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  פרוט תרחיש נבחר — {SCENARIO_LABEL[state.selectedScenario]}
                </div>
                <Row
                  label="uplift אפקטיבי"
                  value={`${Math.round((selected.extraUnits / Math.max(state.baseUnits, 1)) * 100)}%`}
                />
                <Row
                  label="קניבליזציה אפקטיבית"
                  value={`${Math.round((selected.cannibUnits / Math.max(state.baseUnits, 1)) * 100)}%`}
                />
                <Row
                  label="מחיר לאחר הנחה"
                  value={`₪${selected.effectivePrice.toFixed(2)}`}
                  highlight
                />
                <Row
                  label="מכירות נוספות (יח')"
                  value={`${formatNumber(selected.extraUnits)} יח'`}
                />
                <Row
                  label="רווח תוספתי"
                  value={formatCurrency(selected.netProfit)}
                  tone={selected.netProfit >= 0 ? "positive" : "negative"}
                  bold
                />
                <Row
                  label="ROI"
                  value={`${selected.roi}%`}
                  tone={selected.roi >= 0 ? "positive" : "negative"}
                />
                <Row
                  label="הערכה"
                  value={verdictLabel(selected.verdict)}
                  tone={
                    selected.verdict === "worthIt"
                      ? "positive"
                      : selected.verdict === "notWorthIt"
                        ? "negative"
                        : "neutral"
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2 — BREAKEVEN */}
          <TabsContent value="breakeven" className="mt-4">
            <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5 mb-4">
              <div className="text-lg font-semibold text-[#2D3748] mb-3">
                מפת נקודת איזון — uplift נדרש לפי גובה הנחה
              </div>
              <div dir="ltr" className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={beCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EBE3" />
                    <XAxis
                      dataKey="discount"
                      tick={{ fontSize: 16, fill: "#4A5568" }}
                    />
                    <YAxis
                      tick={{ fontSize: 16, fill: "#4A5568" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E7E0D8",
                        borderRadius: 10,
                        fontSize: 16,
                      }}
                      formatter={(v) =>
                        typeof v === "number" ? `${v}%` : String(v)
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 16 }} />
                    <Line
                      type="monotone"
                      dataKey="uplift נדרש (%)"
                      stroke="#DC4E59"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="uplift שלך (%)"
                      stroke="#10B981"
                      strokeDasharray="6 3"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  נקודת איזון — הנחה נוכחית
                </div>
                <Row
                  label="הנחה אפקטיבית"
                  value={`${Math.round(effDisc * 100)}%`}
                />
                <Row
                  label="מחיר לאחר הנחה"
                  value={`₪${pp.toFixed(2)}`}
                  highlight
                />
                <Row label="uplift מינימלי לאיזון" value={`${minUplift}%`} />
                <Row
                  label="uplift שהוגדר"
                  value={`${Math.round(state.upliftPct)}%`}
                />
                <Row
                  label="מרווח ביטחון"
                  value={`${safetyMargin >= 0 ? "+" : ""}${safetyMargin}%`}
                  tone={safetyMargin >= 0 ? "positive" : "negative"}
                  bold
                />
                <Row
                  label="יחידות נוספות לאיזון"
                  value={
                    Number.isFinite(beUnits)
                      ? `${formatNumber(beUnits)} יח'`
                      : "לא ניתן לאיזון"
                  }
                />
              </div>

              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  גורמי סיכון
                </div>
                <RiskRow label="סיכון צמצום מרווח" level={gmRisk} />
                <RiskRow label="סיכון קניבליזציה" level={cannibRisk} />
                <RiskRow label="סיכון החזר ROI" level={roiRisk} />
                <Row
                  label="ציון סיכון כולל"
                  value={`${RISK_LABEL[totalRiskLevel]} (${Math.round(riskScore)}/100)`}
                  tone={
                    totalRiskLevel === "low"
                      ? "positive"
                      : totalRiskLevel === "high"
                        ? "negative"
                        : "neutral"
                  }
                  bold
                />
                <div className="mt-3">
                  <div className="text-[15px] text-[#788390] mb-1">
                    רמת סיכון כוללת
                  </div>
                  <div className="h-2.5 w-full rounded-[5px] bg-[#F1EBE3] overflow-hidden">
                    <div
                      className="h-full rounded-[5px] transition-all"
                      style={{
                        width: `${Math.round(riskScore)}%`,
                        background: RISK_COLOR[totalRiskLevel],
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface RowProps {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
  bold?: boolean;
  highlight?: boolean;
}
function Row({ label, value, tone = "neutral", bold, highlight }: RowProps) {
  const color = highlight
    ? "#2EC4D5"
    : tone === "positive"
      ? "#10B981"
      : tone === "negative"
        ? "#F43F5E"
        : "#2D3748";
  return (
    <div className="flex items-center justify-between border-b border-[#F1EBE3] last:border-b-0 py-2">
      <span className="text-[16px] text-[#4A5568]">{label}</span>
      <span
        className={`font-mono ${bold ? "font-bold" : "font-medium"}`}
        style={{ color, fontSize: 16 }}
        dir="ltr"
      >
        {value}
      </span>
    </div>
  );
}

function RiskRow({
  label,
  level,
}: {
  label: string;
  level: "low" | "mid" | "high";
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#F1EBE3] last:border-b-0 py-2">
      <span className="text-[16px] text-[#4A5568]">{label}</span>
      <span
        className="text-[16px] font-medium"
        style={{ color: RISK_COLOR[level] }}
      >
        {RISK_LABEL[level]}
      </span>
    </div>
  );
}
