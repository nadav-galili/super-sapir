import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatNumber } from "@/lib/format";
import { verdictLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import type { SimulatorState } from "@/lib/promo-simulator/state";

interface Step4ParamsProps {
  state: SimulatorState;
  metrics: PromoMetrics;
  onChange: (update: Partial<SimulatorState>) => void;
}

const LABEL =
  "text-[15px] font-medium text-[#4A5568] mb-1.5 flex items-center justify-between";
const TEXT_INPUT =
  "flex h-10 w-full items-center rounded-[10px] border border-[#E7E0D8] bg-white px-3 py-2 text-[16px] text-[#2D3748] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40";
const RANGE = "w-full h-2 rounded-[5px] accent-[#DC4E59]";
const VALUE = "text-lg font-mono font-semibold text-[#2D3748]";

const VERDICT_COLOR = {
  worthIt: { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" },
  borderline: { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E" },
  notWorthIt: { bg: "#FFF1F2", border: "#FDA4AF", text: "#9F1239" },
} as const;

function rangeBg(value: number, max: number, color = "#DC4E59"): string {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return `linear-gradient(90deg, ${color} 0%, ${color} ${pct}%, #E7E0D8 ${pct}%, #E7E0D8 100%)`;
}

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  tone?: "positive" | "negative" | "neutral";
}

function MetricTile({
  label,
  value,
  sub,
  highlight,
  tone = "neutral",
}: MetricTileProps) {
  const toneColor =
    tone === "positive"
      ? "#10B981"
      : tone === "negative"
        ? "#F43F5E"
        : "#2D3748";
  return (
    <div
      className={`rounded-[16px] p-4 text-center ${
        highlight
          ? "border border-[#7DD3DD] bg-[#E8F9FB]"
          : "border border-[#E7E0D8] bg-white"
      }`}
    >
      <div className="text-[15px] text-[#788390]">{label}</div>
      <div
        className="text-2xl font-mono font-bold mt-1"
        style={{ color: highlight ? "#0E7C8A" : toneColor }}
        dir="ltr"
      >
        {value}
      </div>
      {sub && (
        <div className="text-[15px] text-[#788390] mt-0.5" dir="ltr">
          {sub}
        </div>
      )}
    </div>
  );
}

export function Step4Params({ state, metrics, onChange }: Step4ParamsProps) {
  const m = metrics;
  const saving = state.unitPrice - m.effectivePrice;
  const savingPct = Math.round(m.effectiveDiscount * 100);
  const verdict = VERDICT_COLOR[m.verdict];
  const durationDays = Math.max(1, Math.round(state.durationWeeks * 7));

  const chartData = [
    {
      name: "מחיר",
      בסיס: Number(state.unitPrice.toFixed(2)),
      מבצע: Number(m.effectivePrice.toFixed(2)),
    },
    {
      name: "עלות",
      בסיס: Number(state.unitCost.toFixed(2)),
      מבצע: Number(state.unitCost.toFixed(2)),
    },
    {
      name: "מרווח/יח'",
      בסיס: Number((state.unitPrice - state.unitCost).toFixed(2)),
      מבצע: Number((m.effectivePrice - state.unitCost).toFixed(2)),
    },
  ];

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-2xl text-[#2D3748]">
            סימולטור ניתוח מבצעים
          </CardTitle>
          <p className="text-lg text-[#4A5568]">
            ניתוח כדאיות מבצעים — פרמטרים פיננסיים ותוצאה מיידית
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[15px] font-medium border"
          style={{
            background: verdict.bg,
            borderColor: verdict.border,
            color: verdict.text,
          }}
        >
          {verdictLabel(m.verdict)}
        </span>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="params" dir="rtl" className="w-full">
          <TabsList className="bg-[#FAF8F5] border border-[#E7E0D8] rounded-[10px] h-auto p-1">
            <TabsTrigger
              value="params"
              className="text-[16px] data-[state=active]:bg-white data-[state=active]:text-[#2D3748] px-4 py-1.5"
            >
              פרמטרי מבצע
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-[16px] data-[state=active]:bg-white data-[state=active]:text-[#2D3748] px-4 py-1.5"
            >
              תחזית ביצועים
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 — PARAMS */}
          <TabsContent value="params" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Product + discount */}
              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5 space-y-4">
                <div className="text-lg font-semibold text-[#2D3748]">
                  סוג המבצע ונתוני מוצר
                </div>

                <div className="rounded-[10px] bg-[#FAF8F5] border border-[#E7E0D8] p-3">
                  <div className="text-[15px] text-[#788390] mb-0.5">
                    סוג המבצע (משלב 3)
                  </div>
                  <div className="text-[16px] text-[#2D3748] font-medium">
                    {state.promoType || (
                      <span className="text-[#788390]">טרם נבחר</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-condition">
                    תנאי{" "}
                    <span className="text-[#788390] text-[14px]">
                      (אופציונלי)
                    </span>
                  </label>
                  <input
                    id="f-condition"
                    type="text"
                    value={state.conditionText}
                    onChange={(e) =>
                      onChange({ conditionText: e.target.value })
                    }
                    placeholder="למשל: ביחידה בודדת"
                    className={TEXT_INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="f-benefit">
                    הטבה{" "}
                    <span className="text-[#788390] text-[14px]">
                      (אופציונלי)
                    </span>
                  </label>
                  <input
                    id="f-benefit"
                    type="text"
                    value={state.benefitText}
                    onChange={(e) => onChange({ benefitText: e.target.value })}
                    placeholder="למשל: 25% הנחה"
                    className={TEXT_INPUT}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-price">
                    מחיר מכירה רגיל (₪)
                    <span className={VALUE} dir="ltr">
                      ₪{state.unitPrice}
                    </span>
                  </label>
                  <input
                    id="f-price"
                    type="range"
                    min={5}
                    max={200}
                    step={1}
                    value={state.unitPrice}
                    onChange={(e) =>
                      onChange({ unitPrice: Number(e.target.value) })
                    }
                    className={RANGE}
                    style={{ background: rangeBg(state.unitPrice, 200) }}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-cost">
                    עלות מוצר (₪)
                    <span className={VALUE} dir="ltr">
                      ₪{state.unitCost}
                    </span>
                  </label>
                  <input
                    id="f-cost"
                    type="range"
                    min={1}
                    max={Math.max(180, state.unitPrice)}
                    step={0.5}
                    value={state.unitCost}
                    onChange={(e) =>
                      onChange({ unitCost: Number(e.target.value) })
                    }
                    className={RANGE}
                    style={{
                      background: rangeBg(state.unitCost, 180, "#A0AEC0"),
                    }}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-discount">
                    גובה ההנחה / ההטבה (%)
                    <span
                      className={VALUE}
                      style={{ color: "#2EC4D5" }}
                      dir="ltr"
                    >
                      {state.discountPct}%
                    </span>
                  </label>
                  <input
                    id="f-discount"
                    type="range"
                    min={0}
                    max={70}
                    step={1}
                    value={state.discountPct}
                    onChange={(e) =>
                      onChange({ discountPct: Number(e.target.value) })
                    }
                    className="w-full h-2 rounded-[5px] accent-[#2EC4D5]"
                    style={{
                      background: rangeBg(state.discountPct, 70, "#2EC4D5"),
                    }}
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-[10px] bg-[#FAF8F5] border border-[#E7E0D8] p-3">
                  <div>
                    <div className="text-[15px] text-[#788390]">מחיר רגיל</div>
                    <div
                      className="text-lg font-mono font-semibold text-[#2D3748]"
                      dir="ltr"
                    >
                      ₪{state.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <span className="text-2xl text-[#A0AEC0]">←</span>
                  <div>
                    <div className="text-[15px] text-[#788390]">
                      מחיר לאחר הנחה
                    </div>
                    <div
                      className="text-lg font-mono font-semibold"
                      style={{ color: "#2EC4D5" }}
                      dir="ltr"
                    >
                      ₪{m.effectivePrice.toFixed(2)}
                    </div>
                  </div>
                  <span className="ms-auto rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-3 py-1 text-[15px]">
                    חיסכון ₪{saving.toFixed(2)} ({savingPct}%)
                  </span>
                </div>
              </div>

              {/* Demand + costs */}
              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5 space-y-4">
                <div className="text-lg font-semibold text-[#2D3748]">
                  פרמטרי ביקוש ועלויות
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-base-units">
                    מכירות בסיס בתקופה (יח')
                    <span className={VALUE} dir="ltr">
                      {formatNumber(state.baseUnits)}
                    </span>
                  </label>
                  <input
                    id="f-base-units"
                    type="range"
                    min={50}
                    max={10000}
                    step={50}
                    value={state.baseUnits}
                    onChange={(e) =>
                      onChange({ baseUnits: Number(e.target.value) })
                    }
                    className={RANGE}
                    style={{ background: rangeBg(state.baseUnits, 10000) }}
                    dir="ltr"
                  />
                  <div className="text-[14px] text-[#788390] mt-1" dir="rtl">
                    כ-{Math.round(state.baseUnits / durationDays)} יח'/יום ל-
                    {durationDays} ימים
                  </div>
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-uplift">
                    צפי גידול בביקוש — uplift (%)
                    <span
                      className={VALUE}
                      style={{ color: "#DC4E59" }}
                      dir="ltr"
                    >
                      {state.upliftPct}%
                    </span>
                  </label>
                  <input
                    id="f-uplift"
                    type="range"
                    min={0}
                    max={300}
                    step={5}
                    value={state.upliftPct}
                    onChange={(e) =>
                      onChange({ upliftPct: Number(e.target.value) })
                    }
                    className={RANGE}
                    style={{ background: rangeBg(state.upliftPct, 300) }}
                    dir="ltr"
                  />
                </div>

                <div className="rounded-[10px] bg-[#FAF8F5] border border-[#E7E0D8] p-3">
                  <div className="text-[15px] text-[#788390]">
                    משך המבצע (משלב 1)
                  </div>
                  <div className="text-[16px] text-[#2D3748] font-medium">
                    {state.durationWeeks} שבועות ({durationDays} ימים)
                  </div>
                </div>

                <hr className="border-[#F1EBE3]" />
                <div className="text-[16px] font-semibold text-[#2D3748]">
                  עלויות שיווק והפצה
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-mkt">
                    עלות שיווק חד-פעמית (₪)
                    <span className={VALUE} dir="ltr">
                      ₪{formatNumber(state.mktCost)}
                    </span>
                  </label>
                  <input
                    id="f-mkt"
                    type="range"
                    min={0}
                    max={50000}
                    step={500}
                    value={state.mktCost}
                    onChange={(e) =>
                      onChange({ mktCost: Number(e.target.value) })
                    }
                    className={RANGE}
                    style={{ background: rangeBg(state.mktCost, 50000) }}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-ops">
                    עלות תפעול נוספת ליח' (₪)
                    <span className={VALUE} dir="ltr">
                      ₪{state.opsCost.toFixed(1)}
                    </span>
                  </label>
                  <input
                    id="f-ops"
                    type="range"
                    min={0}
                    max={20}
                    step={0.5}
                    value={state.opsCost}
                    onChange={(e) =>
                      onChange({ opsCost: Number(e.target.value) })
                    }
                    className={RANGE}
                    style={{ background: rangeBg(state.opsCost, 20) }}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-cannib">
                    שיעור קניבליזציה (%)
                    <span
                      className={VALUE}
                      style={{ color: "#6C5CE7" }}
                      dir="ltr"
                    >
                      {state.cannibPct}%
                    </span>
                  </label>
                  <input
                    id="f-cannib"
                    type="range"
                    min={0}
                    max={80}
                    step={5}
                    value={state.cannibPct}
                    onChange={(e) =>
                      onChange({ cannibPct: Number(e.target.value) })
                    }
                    className="w-full h-2 rounded-[5px] accent-[#6C5CE7]"
                    style={{
                      background: rangeBg(state.cannibPct, 80, "#6C5CE7"),
                    }}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Headline metric strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              <MetricTile
                label="מחיר לאחר הנחה"
                value={`₪${m.effectivePrice.toFixed(2)}`}
                sub={`חיסכון של ${savingPct}%`}
                highlight
              />
              <MetricTile
                label="רווח גולמי רגיל"
                value={`${m.baseGrossMargin.toFixed(1)}%`}
                sub="לפני מבצע"
              />
              <MetricTile
                label="רווח גולמי במבצע"
                value={`${m.promoGrossMargin.toFixed(1)}%`}
                sub="לאחר הנחה"
                tone={
                  m.promoGrossMargin >= 10
                    ? "positive"
                    : m.promoGrossMargin >= 0
                      ? "neutral"
                      : "negative"
                }
              />
              <MetricTile
                label="רווח נוסף נטו"
                value={formatCurrency(m.netProfit)}
                sub="מול בסיס"
                tone={m.netProfit >= 0 ? "positive" : "negative"}
              />
              <MetricTile
                label="ROI מבצע"
                value={`${m.roi}%`}
                sub="על עלות שיווק"
                tone={m.roi >= 0 ? "positive" : "negative"}
              />
            </div>
          </TabsContent>

          {/* TAB 2 — RESULTS */}
          <TabsContent value="results" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  תוצאות פיננסיות
                </div>
                <ResultRow
                  label="הכנסה רגילה (תקופה)"
                  value={formatCurrency(m.baseRevenue)}
                />
                <ResultRow
                  label="הכנסה במבצע (תקופה)"
                  value={formatCurrency(m.promoRevenue)}
                />
                <ResultRow
                  label="גידול הכנסות"
                  value={formatCurrency(m.promoRevenue - m.baseRevenue)}
                  tone={
                    m.promoRevenue >= m.baseRevenue ? "positive" : "negative"
                  }
                />
                <ResultRow
                  label="עלות ההנחה הכוללת"
                  value={formatCurrency(
                    Math.round(
                      (state.unitPrice - m.effectivePrice) * m.promoUnits
                    )
                  )}
                  tone="negative"
                />
                <ResultRow
                  label="עלויות שיווק ותפעול"
                  value={formatCurrency(
                    Math.round(state.mktCost + state.opsCost * m.promoUnits)
                  )}
                  tone="negative"
                />
                <ResultRow
                  label="השפעת קניבליזציה"
                  value={formatCurrency(m.cannibLoss)}
                  tone="negative"
                />
                <ResultRow
                  label="רווח תוספתי נטו"
                  value={formatCurrency(m.netProfit)}
                  tone={m.netProfit >= 0 ? "positive" : "negative"}
                  bold
                />
              </div>

              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  מדדי ביצוע
                </div>
                <ResultRow
                  label="מכירות בסיס (תקופה)"
                  value={`${formatNumber(state.baseUnits)} יח'`}
                />
                <ResultRow
                  label="מכירות במבצע (תקופה)"
                  value={`${formatNumber(m.promoUnits)} יח'`}
                />
                <ResultRow
                  label="יחידות נוספות"
                  value={`${formatNumber(m.extraUnits)} יח'`}
                  tone="positive"
                />
                <ResultRow
                  label="מחיר רגיל"
                  value={`₪${state.unitPrice.toFixed(2)}`}
                />
                <ResultRow
                  label="מחיר לאחר הנחה"
                  value={`₪${m.effectivePrice.toFixed(2)} (-${savingPct}%)`}
                  highlight
                />
                <ResultRow
                  label="שולי רווח גולמי רגיל"
                  value={`${m.baseGrossMargin.toFixed(1)}%`}
                />
                <ResultRow
                  label="שולי רווח גולמי מבצע"
                  value={`${m.promoGrossMargin.toFixed(1)}%`}
                />
                <ResultRow
                  label="נקודת איזון (יח')"
                  value={
                    Number.isFinite(m.breakEvenUnits)
                      ? `${formatNumber(m.breakEvenUnits)} יח'`
                      : "לא ניתן לאיזון"
                  }
                />
                <ResultRow label="ROI" value={`${m.roi}%`} bold />
              </div>
            </div>

            <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5 mt-4">
              <div className="text-lg font-semibold text-[#2D3748] mb-3">
                גרף השוואת מחיר ורווחיות — בסיס מול מבצע
              </div>
              <div dir="ltr" className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EBE3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 16, fill: "#4A5568" }}
                    />
                    <YAxis tick={{ fontSize: 16, fill: "#4A5568" }} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E7E0D8",
                        borderRadius: 10,
                        fontSize: 16,
                      }}
                      formatter={(v: number) => `₪${v.toFixed(2)}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 16 }} />
                    <Bar
                      dataKey="בסיס"
                      fill="rgba(160, 174, 192, 0.6)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="מבצע" fill="#DC4E59" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              className="rounded-[10px] p-4 mt-4 text-[16px] border"
              style={{
                background: verdict.bg,
                borderColor: verdict.border,
                color: verdict.text,
              }}
            >
              {m.verdict === "worthIt"
                ? `המבצע כדאי: הרווח התוספתי חיובי והמרווח הגולמי שמור (${m.promoGrossMargin.toFixed(1)}%). מחיר המבצע ₪${m.effectivePrice.toFixed(2)} עדיין מעל עלות המוצר. מומלץ לאשר.`
                : m.verdict === "notWorthIt"
                  ? `המבצע לא כדאי: מחיר המבצע ₪${m.effectivePrice.toFixed(2)} קרוב מדי לעלות (₪${state.unitCost.toFixed(2)}) או שהרווח הנטו שלילי. שקול להפחית את ההנחה או להעלות את ה-uplift הצפוי.`
                  : `כדאיות גבולית: מחיר המבצע ₪${m.effectivePrice.toFixed(2)} (הנחה ${savingPct}%) — הרווח חיובי אך נמוך. בדוק את הנחת ה-uplift או הפחת את עלות השיווק.`}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
  bold?: boolean;
  highlight?: boolean;
}

function ResultRow({
  label,
  value,
  tone = "neutral",
  bold,
  highlight,
}: ResultRowProps) {
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
