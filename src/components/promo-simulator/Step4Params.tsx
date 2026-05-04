import {
  ArrowLeft,
  Calculator,
  Database,
  Info,
  Lock,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { LiquidCard } from "@/components/ui/liquid-glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { StepHeader } from "./StepHeader";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  calcForScenario,
  verdictLabel,
  type PromoMetrics,
} from "@/lib/promo-simulator/calc";
import {
  SCENARIOS,
  SCENARIO_LABEL,
  type Scenario,
  type SimulatorState,
} from "@/lib/promo-simulator/state";

const SCENARIO_DESC: Record<Scenario, string> = {
  pessimistic: "uplift נמוך",
  base: "הפרמטרים הנוכחיים שלך",
  optimistic: "uplift גבוה",
};

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

// Headline-strip motion variants — section reveals on mount, tiles fade up
// in sequence so the eye lands on the verdict first, then on each metric.
const stripContainer = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 140,
      damping: 22,
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};
const stripItem = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 180, damping: 20 },
  },
};

interface Step4ParamsProps {
  state: SimulatorState;
  metrics: PromoMetrics;
  onChange: (update: Partial<SimulatorState>) => void;
}

const LABEL =
  "text-[15px] font-medium text-[#4A5568] mb-1.5 flex items-center justify-between";
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
    <LiquidCard
      className={`!gap-2 !py-5 px-4 text-center ${
        highlight
          ? "!border-[#7DD3DD] bg-[#E8F9FB]/60"
          : "!border-[#E7E0D8] bg-white/70"
      }`}
    >
      <div className="text-[15px] text-[#788390]">{label}</div>
      <div
        className="text-3xl font-mono font-bold tracking-tight"
        style={{ color: highlight ? "#0E7C8A" : toneColor }}
        dir="ltr"
      >
        {value}
      </div>
      {sub && (
        <div className="text-[15px] text-[#788390]" dir="ltr">
          {sub}
        </div>
      )}
    </LiquidCard>
  );
}

export function Step4Params({ state, metrics, onChange }: Step4ParamsProps) {
  const m = metrics;
  const saving = state.unitPrice - m.effectivePrice;
  const savingPct = Math.round(m.effectiveDiscount * 100);
  const verdict = VERDICT_COLOR[m.verdict];
  const durationDays = Math.max(1, Math.round(state.durationWeeks * 7));

  // ── Scenario comparison + break-even (was: Step 5) ─────────────────────
  const scenarioMetrics: Record<Scenario, PromoMetrics> = {
    pessimistic: calcForScenario(state, "pessimistic"),
    base: calcForScenario(state, "base"),
    optimistic: calcForScenario(state, "optimistic"),
  };
  const selectedScenario = scenarioMetrics[state.selectedScenario];

  const scenarioBars = SCENARIOS.map((sc) => ({
    name: SCENARIO_LABEL[sc],
    profit: scenarioMetrics[sc].netProfit,
    isSelected: sc === state.selectedScenario,
  }));

  // Sensitivity curve: for each candidate discount, what uplift % is needed
  // for the promo to break-even against no-promo? Uses the same canonical
  // formula as `calcMetrics`:
  //   breakEvenUnits = ⌈(baseProfit + mktCost + cannibLoss) ÷ promoUnitProfit⌉
  //   uplift%        = (breakEvenUnits − baseUnits) / baseUnits × 100
  // Constants across the curve: baseUnits, baseProfit, mktCost, cannibLoss,
  // promoUnitCost, opsCost. Variable: pp (price after discount).
  const beDiscounts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const beCurve = beDiscounts.map((d) => {
    const pp = state.unitPrice * (1 - d / 100);
    const beMargin = pp - state.promoUnitCost - state.opsCost;
    const beUnits =
      beMargin > 0
        ? Math.ceil((m.baseProfit + state.mktCost + m.cannibLoss) / beMargin)
        : Infinity;
    const minUpliftPct =
      Number.isFinite(beUnits) && state.baseUnits > 0
        ? Math.min(
            300,
            Math.max(
              0,
              Math.round(((beUnits - state.baseUnits) / state.baseUnits) * 100)
            )
          )
        : 300;
    return {
      discount: `${d}%`,
      "uplift נדרש (%)": minUpliftPct,
      "uplift שלך (%)": Math.round(state.upliftPct),
    };
  });

  // Break-even comes from the canonical resolver (calc.ts) so the numbers
  // here match Tab 2 exactly. True break-even: total promo units required
  // for promo profit to match the no-promo baseline profit:
  //   breakEvenUnits = ceil((baseProfit + mktCost + cannibLoss) / promoUnitProfit)
  // The minimum uplift % needed is the gap between break-even units and the
  // current base, expressed as a % of base.
  const beUnitsNow = m.breakEvenUnits;
  const minUplift =
    Number.isFinite(beUnitsNow) && state.baseUnits > 0
      ? Math.max(
          0,
          Math.round(((beUnitsNow - state.baseUnits) / state.baseUnits) * 100)
        )
      : 999;
  const safetyMargin = Math.round(state.upliftPct) - minUplift;

  const gmRisk = riskInverse(m.promoGrossMargin, 20, 10);
  const upliftRisk = riskInverse(state.upliftPct, 25, 10);
  const riskScore =
    [gmRisk, upliftRisk].filter((x) => x === "high").length * 50 +
    [gmRisk, upliftRisk].filter((x) => x === "mid").length * 25;
  const totalRiskLevel: "low" | "mid" | "high" =
    riskScore >= 66 ? "high" : riskScore >= 33 ? "mid" : "low";

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardContent className="pt-6">
        <StepHeader
          step={4}
          title="פרטי המבצע ותוצאות"
          description="ניתוח כדאיות מבצעים — פרמטרים פיננסיים ותוצאה מיידית"
          icon={Calculator}
          pill={{
            label: verdictLabel(m.verdict),
            bg: verdict.bg,
            border: verdict.border,
            text: verdict.text,
          }}
        />
        <Tabs defaultValue="params" dir="rtl" className="w-full">
          <TabsList className="bg-[#FAF8F5] border border-[#E7E0D8] rounded-[10px] h-auto p-1">
            <TabsTrigger
              value="params"
              className="text-[16px] data-[state=active]:bg-white data-[state=active]:text-[#2D3748] px-4 py-1.5"
            >
              פרטי המבצע
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-[16px] data-[state=active]:bg-white data-[state=active]:text-[#2D3748] px-4 py-1.5"
            >
              תחזית ביצועים
            </TabsTrigger>
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

          {/* TAB 1 — PARAMS — "Ledger vs Workbench"
              Two visually distinct cards make it instantly clear what comes
              from the system and what the manager controls:
              • RIGHT (in RTL) = ההחלטות שלך — manager inputs, warm accent
                stripe, prominent sliders, white surface.
              • LEFT (in RTL) = נתוני מערכת — ERP-sourced read-only fields,
                dashed separators, locked feel, paper-cool surface. */}
          <TabsContent value="params" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Manager inputs — first in DOM ⇒ right side in RTL */}
              <section className="relative overflow-hidden rounded-[16px] border border-[#F1D0CF] bg-gradient-to-br from-white via-white to-[#FFF6F2] p-5 shadow-[0_10px_30px_-22px_rgba(220,78,89,0.4)]">
                <span
                  aria-hidden
                  className="absolute inset-y-5 right-0 w-[3px] rounded-full bg-gradient-to-b from-[#DC4E59] to-[#E8777F]"
                />
                <header className="mb-5 flex items-start gap-3 ps-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#DC4E59] to-[#E8777F] text-white shadow-[0_6px_14px_-6px_rgba(220,78,89,0.6)]">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold uppercase tracking-[0.14em] text-[#DC4E59]">
                      ההחלטות שלך
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-[#2D3748]">
                      פרמטרים שאתה שולט בהם
                    </h3>
                    <p className="mt-1 text-[15px] text-[#788390]">
                      הזז סליידרים — התוצאות מתעדכנות מיידית.
                    </p>
                  </div>
                </header>

                <div className="space-y-5 ps-2">
                  {/* Supplier promo cost */}
                  <div>
                    <label className={LABEL} htmlFor="f-promo-cost">
                      <span className="flex items-center gap-2">
                        <span>מחיר קנייה בהנחה (מבצע)</span>
                        {(() => {
                          const supplierDiscPct =
                            state.unitCost > 0
                              ? Math.round(
                                  ((state.unitCost - state.promoUnitCost) /
                                    state.unitCost) *
                                    100
                                )
                              : 0;
                          if (supplierDiscPct <= 0) return null;
                          return (
                            <span className="rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-2 py-0.5 text-[15px] font-semibold">
                              הנחת ספק -{supplierDiscPct}%
                            </span>
                          );
                        })()}
                      </span>
                      <span className={VALUE} dir="ltr">
                        ₪{state.promoUnitCost.toFixed(2)}
                      </span>
                    </label>
                    <input
                      id="f-promo-cost"
                      type="range"
                      min={0}
                      max={state.unitCost}
                      step={0.1}
                      value={state.promoUnitCost}
                      onChange={(e) =>
                        onChange({ promoUnitCost: Number(e.target.value) })
                      }
                      className={RANGE}
                      style={{
                        background: rangeBg(
                          state.promoUnitCost,
                          state.unitCost
                        ),
                      }}
                      dir="ltr"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[15px] text-[#788390] me-1">
                        קיצור — הנחת ספק:
                      </span>
                      {[0, 5, 10, 15, 20].map((pct) => {
                        const target =
                          Math.round(state.unitCost * (1 - pct / 100) * 100) /
                          100;
                        const isActive =
                          Math.abs(state.promoUnitCost - target) < 0.01;
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => onChange({ promoUnitCost: target })}
                            className={`rounded-[20px] border px-2.5 py-0.5 text-[15px] font-medium transition-colors ${
                              isActive
                                ? "border-[#DC4E59] bg-[#DC4E59] text-white"
                                : "border-[#E7E0D8] bg-white text-[#4A5568] hover:bg-[#FAF8F5]"
                            }`}
                          >
                            {pct === 0 ? "ללא" : `-${pct}%`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-[#F1EBE3]" />

                  {/* Discount % */}
                  <div>
                    <label className={LABEL} htmlFor="f-discount">
                      גובה ההנחה לקונה
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

                  <div className="border-t border-[#F1EBE3]" />

                  {/* Uplift % */}
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
                    <div className="mt-1 text-[15px] text-[#788390]">
                      כמה אחוזים מעבר למכירות הבסיס אתה צופה שייווצרו בזכות
                      המבצע.
                    </div>
                  </div>

                  <div className="border-t border-[#F1EBE3]" />

                  {/* Extra costs */}
                  <div>
                    <label className={LABEL} htmlFor="f-extra-costs">
                      עלויות נוספות (₪)
                      <span className={VALUE} dir="ltr">
                        ₪{formatNumber(state.mktCost)}
                      </span>
                    </label>
                    <input
                      id="f-extra-costs"
                      type="range"
                      min={0}
                      max={50000}
                      step={100}
                      value={state.mktCost}
                      onChange={(e) =>
                        onChange({ mktCost: Number(e.target.value) })
                      }
                      className={RANGE}
                      style={{ background: rangeBg(state.mktCost, 50000) }}
                      dir="ltr"
                    />
                    <div className="mt-1 text-[15px] text-[#788390]">
                      שיווק, תפעול נוסף, קניבליזציה — סך הוצאות צד מעבר להנחה
                      הישירה.
                    </div>
                  </div>
                </div>
              </section>

              {/* ERP read-only — second in DOM ⇒ left side in RTL */}
              <section className="relative overflow-hidden rounded-[16px] border border-[#E5DBC8] bg-[#FBFAF7] p-5">
                <header className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F4F6] border border-[#7DD3DD] text-[#0E7C8A]">
                    <Database className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold uppercase tracking-[0.14em] text-[#0E7C8A]">
                      נתוני מערכת
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-[#2D3748]">
                      מתעדכן אוטומטית מה-ERP
                    </h3>
                    <p className="mt-1 text-[15px] text-[#788390]">
                      ערכי קריאה בלבד. לא ניתן לעריכה כאן.
                    </p>
                  </div>
                  <Lock
                    className="h-4 w-4 text-[#A0AEC0] mt-1"
                    aria-label="קריאה בלבד"
                  />
                </header>

                <dl className="space-y-0">
                  <ErpFieldRow
                    label="סוג המבצע"
                    sub="נבחר משלב 3"
                    value={
                      state.promoType ? (
                        <span className="text-[16px] font-medium text-[#2D3748]">
                          {state.promoType}
                        </span>
                      ) : (
                        <span className="text-[16px] text-[#A0AEC0]">
                          טרם נבחר
                        </span>
                      )
                    }
                  />
                  <ErpFieldRow
                    label="מחיר מכירה רגיל"
                    sub="מחיר קטלוגי של המוצר"
                    value={
                      <span
                        className="text-xl font-mono font-semibold text-[#2D3748]"
                        dir="ltr"
                      >
                        ₪{state.unitPrice.toFixed(2)}
                      </span>
                    }
                  />
                  <ErpFieldRow
                    label="מחיר קנייה"
                    sub="מחיר ספק מהמערכת"
                    value={
                      <span
                        className="text-xl font-mono font-semibold text-[#2D3748]"
                        dir="ltr"
                      >
                        ₪{state.unitCost.toFixed(2)}
                      </span>
                    }
                  />
                  <ErpFieldRow
                    label="מכירות בסיס בתקופה"
                    sub={`ממוצע מכר היסטורי — כ-${formatNumber(Math.round(state.baseUnits / durationDays))} יח'/יום`}
                    value={
                      <span
                        className="text-xl font-mono font-semibold text-[#2D3748]"
                        dir="ltr"
                      >
                        {formatNumber(state.baseUnits)} יח'
                      </span>
                    }
                  />
                  <ErpFieldRow
                    label="משך המבצע"
                    sub="נבחר משלב 1"
                    value={
                      <span className="text-[16px] font-medium text-[#2D3748]">
                        {state.durationWeeks} שבועות ({durationDays} ימים)
                      </span>
                    }
                  />
                </dl>
              </section>
            </div>

            {/* Live price preview — full-width strip below the two cards.
                Treats the discount transformation as the "result of the
                inputs above" — neutral surface, prominent typography. */}
            <div className="mt-4 rounded-[16px] border border-[#E7E0D8] bg-gradient-to-l from-[#F8FCFD] via-white to-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[15px] text-[#788390]">מחיר רגיל</div>
                    <div
                      className="text-2xl font-mono font-semibold text-[#2D3748]"
                      dir="ltr"
                    >
                      ₪{state.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <ArrowLeft className="h-6 w-6 text-[#A0AEC0]" aria-hidden />
                  <div>
                    <div className="text-[15px] text-[#788390]">
                      מחיר לאחר הנחה
                    </div>
                    <div
                      className="text-2xl font-mono font-semibold"
                      style={{ color: "#2EC4D5" }}
                      dir="ltr"
                    >
                      ₪{m.effectivePrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-4 py-1.5 text-[16px] font-medium">
                  הנחה לקונה ₪{saving.toFixed(2)} ({savingPct}%)
                </span>
              </div>
            </div>

            {/* Headline metric strip — emphasized as the verdict at a glance.
                Entry animation runs once on mount; metric values update in
                place when sliders move (no reveal re-trigger). */}
            <motion.section
              initial="hidden"
              animate="show"
              variants={stripContainer}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="relative mt-6 overflow-hidden rounded-[20px] border border-[#E7E0D8] bg-gradient-to-br from-[#FFF8F4] via-[#FAF8F5] to-[#F1EBE3] p-5 shadow-[0_18px_40px_-26px_rgba(220,78,89,0.28)]"
            >
              <span
                aria-hidden
                className="absolute inset-y-4 right-0 w-[3px] rounded-full bg-gradient-to-b from-[#DC4E59] to-[#E8777F]"
              />
              <motion.header
                variants={stripItem}
                className="mb-4 flex items-baseline justify-between gap-3 ps-2"
              >
                <div>
                  <div className="text-[15px] uppercase tracking-[0.14em] text-[#DC4E59]">
                    תמונת מצב פיננסית
                  </div>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-[#2D3748]">
                    מבט-על בארבעה מספרים
                  </h3>
                </div>
                <motion.span
                  variants={stripItem}
                  className="inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[15px] font-semibold transition-colors"
                  style={{
                    background: verdict.bg,
                    borderColor: verdict.border,
                    color: verdict.text,
                  }}
                >
                  {verdictLabel(m.verdict)}
                </motion.span>
              </motion.header>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.div variants={stripItem}>
                  <MetricTile
                    label="מחיר לאחר הנחה"
                    value={`₪${m.effectivePrice.toFixed(2)}`}
                    sub={`הנחה לקונה של ${savingPct}%`}
                    highlight
                  />
                </motion.div>
                <motion.div variants={stripItem}>
                  <MetricTile
                    label="רווחיות גולמית רגילה"
                    value={`${m.baseGrossMargin.toFixed(1)}%`}
                    sub="לפני מבצע"
                  />
                </motion.div>
                <motion.div variants={stripItem}>
                  <MetricTile
                    label="רווחיות גולמית במבצע"
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
                </motion.div>
                <motion.div variants={stripItem}>
                  <MetricTile
                    label="רווח נוסף נטו"
                    value={formatCurrency(m.netProfit)}
                    sub="מול בסיס"
                    tone={m.netProfit >= 0 ? "positive" : "negative"}
                  />
                </motion.div>
              </div>
            </motion.section>
          </TabsContent>

          {/* TAB 2 — RESULTS */}
          <TabsContent value="results" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  מדדי ביצוע
                </div>
                <ResultRow
                  label="מכירות בסיס (תקופה)"
                  value={`${formatNumber(state.baseUnits)} יח'`}
                  info="כמות יחידות שהיו נמכרות בתקופה זו ללא מבצע. זהו הבסיס להשוואה."
                />
                <ResultRow
                  label="מכירות במבצע (תקופה)"
                  value={`${formatNumber(m.promoUnits)} יח'`}
                  info={`מכירות צפויות במבצע = מכירות בסיס × (1 + uplift%).\n= ${formatNumber(state.baseUnits)} × (1 + ${state.upliftPct}%)\n= ${formatNumber(m.promoUnits)} יח'`}
                />
                <ResultRow
                  label="יחידות נוספות"
                  value={`${formatNumber(m.extraUnits)} יח'`}
                  tone="positive"
                  info={`התוספת שהמבצע צפוי לייצר.\npromoUnits − baseUnits\n= ${formatNumber(m.promoUnits)} − ${formatNumber(state.baseUnits)} = ${formatNumber(m.extraUnits)}`}
                />
                <ResultRow
                  label="מחיר רגיל"
                  value={`₪${state.unitPrice.toFixed(2)}`}
                  info="המחיר הרגיל של המוצר ללא מבצע. ערך מהמערכת — מחיר קטלוגי."
                />
                <ResultRow
                  label="מחיר לאחר הנחה"
                  value={`₪${m.effectivePrice.toFixed(2)} (-${savingPct}%)`}
                  highlight
                  info={`מחיר רגיל × (1 − הנחה אפקטיבית)\n= ₪${state.unitPrice.toFixed(2)} × (1 − ${m.effectiveDiscount.toFixed(2)})\n= ₪${m.effectivePrice.toFixed(2)}\nההנחה האפקטיבית מותאמת לסוג המבצע (BOGO≈50%, מועדון×0.6).`}
                />
                <ResultRow
                  label="שולי רווח גולמי רגיל"
                  value={`${m.baseGrossMargin.toFixed(1)}%`}
                  info={`(unitPrice − unitCost) ÷ unitPrice × 100\n= (₪${state.unitPrice.toFixed(2)} − ₪${state.unitCost.toFixed(2)}) ÷ ₪${state.unitPrice.toFixed(2)}\n= ${m.baseGrossMargin.toFixed(1)}%`}
                />
                <ResultRow
                  label="שולי רווח גולמי מבצע"
                  value={`${m.promoGrossMargin.toFixed(1)}%`}
                  info={`(effectivePrice − promoUnitCost) ÷ effectivePrice × 100\n= (₪${m.effectivePrice.toFixed(2)} − ₪${state.promoUnitCost.toFixed(2)}) ÷ ₪${m.effectivePrice.toFixed(2)}\n= ${m.promoGrossMargin.toFixed(1)}%`}
                />
                <ResultRow
                  label="נקודת איזון (יח')"
                  value={
                    Number.isFinite(m.breakEvenUnits)
                      ? `${formatNumber(m.breakEvenUnits)} יח'`
                      : "לא ניתן לאיזון"
                  }
                  tone={
                    !Number.isFinite(m.breakEvenUnits)
                      ? "negative"
                      : m.breakEvenUnits <= m.promoUnits
                        ? "positive"
                        : "neutral"
                  }
                  info={`כמה יחידות במבצע צריך למכור כדי שהמבצע יחזיר את עצמו — כלומר, רווח עם המבצע ≥ רווח ללא מבצע.\n⌈(baseProfit + עלויות נוספות + cannibLoss) ÷ (מחיר מבצע − מחיר קנייה במבצע − opsCost)⌉\n= ⌈(${formatCurrency(m.baseProfit)} + ${formatCurrency(state.mktCost)} + ${formatCurrency(m.cannibLoss)}) ÷ (₪${m.effectivePrice.toFixed(2)} − ₪${state.promoUnitCost.toFixed(2)} − ₪${state.opsCost.toFixed(2)})⌉\n= ${Number.isFinite(m.breakEvenUnits) ? formatNumber(m.breakEvenUnits) : "—"} יח'\n\nתחזית מכירות נוכחית: ${formatNumber(m.promoUnits)} יח'. ${Number.isFinite(m.breakEvenUnits) ? (m.breakEvenUnits <= m.promoUnits ? "✓ מעבר לנקודת האיזון — המבצע כדאי." : "✗ מתחת לנקודת האיזון — המבצע מפסיד מול תרחיש 'ללא מבצע'.") : ""}`}
                />
              </div>

              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  תוצאות פיננסיות
                </div>
                <ResultRow
                  label="הכנסה רגילה (תקופה)"
                  value={formatCurrency(m.baseRevenue)}
                  info={`מכירות בסיס × מחיר רגיל\n= ${formatNumber(state.baseUnits)} × ₪${state.unitPrice.toFixed(2)}\n= ${formatCurrency(m.baseRevenue)}`}
                />
                <ResultRow
                  label="הכנסה במבצע (תקופה)"
                  value={formatCurrency(m.promoRevenue)}
                  info={`מכירות במבצע × מחיר מבצע\n= ${formatNumber(m.promoUnits)} × ₪${m.effectivePrice.toFixed(2)}\n= ${formatCurrency(m.promoRevenue)}`}
                />
                <ResultRow
                  label="גידול הכנסות"
                  value={formatCurrency(m.promoRevenue - m.baseRevenue)}
                  tone={
                    m.promoRevenue >= m.baseRevenue ? "positive" : "negative"
                  }
                  info={`הכנסה במבצע − הכנסה רגילה\n= ${formatCurrency(m.promoRevenue)} − ${formatCurrency(m.baseRevenue)}\n= ${formatCurrency(m.promoRevenue - m.baseRevenue)}\nשים לב: גידול הכנסות אינו רווח — צריך לנכות את ההנחה ועלויות שיווק.`}
                />
                <ResultRow
                  label="סך הנחה ללקוחות"
                  value={formatCurrency(
                    Math.round(
                      (state.unitPrice - m.effectivePrice) * m.promoUnits
                    )
                  )}
                  tone="negative"
                  info={`סך הסכום שניתן ללקוחות כהנחה.\n(מחיר רגיל − מחיר מבצע) × promoUnits\n= (₪${state.unitPrice.toFixed(2)} − ₪${m.effectivePrice.toFixed(2)}) × ${formatNumber(m.promoUnits)}\nתיאורי בלבד — לא מנוכה ישירות מהרווח. רק החלק על מכירות הבסיס הוא "מרווח שאבד"; ההנחה על יחידות נוספות מומנה משולי רווח חדשים.`}
                />
                <ResultRow
                  label="עלויות נוספות"
                  value={formatCurrency(state.mktCost)}
                  tone="negative"
                  info="שיווק, תפעול נוסף, קניבליזציה. ערך הסליידר 'עלויות נוספות'. ערך זה כן מנוכה מהרווח התוספתי הנטו."
                />
                <ResultRow
                  label="רווח תוספתי נטו"
                  value={formatCurrency(m.netProfit)}
                  tone={m.netProfit >= 0 ? "positive" : "negative"}
                  bold
                  info={`promoProfit − baseProfit − mktCost − cannibLoss\n= ${formatCurrency(m.promoProfit)} − ${formatCurrency(m.baseProfit)} − ${formatCurrency(state.mktCost)} − ${formatCurrency(m.cannibLoss)}\n= ${formatCurrency(m.netProfit)}\n\nההפרש בין רווח עם מבצע לרווח ללא מבצע, אחרי שיווק וקניבליזציה.`}
                />
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
                  : `כדאיות גבולית: מחיר המבצע ₪${m.effectivePrice.toFixed(2)} (הנחה ${savingPct}%) — הרווח חיובי אך נמוך. בדוק את הנחת ה-uplift או הפחת את העלויות הנוספות.`}
            </div>
          </TabsContent>

          {/* TAB 3 — SCENARIO COMPARISON */}
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
                      <RechartsTooltip
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
                <ResultRow
                  label="uplift אפקטיבי"
                  value={`${Math.round((selectedScenario.extraUnits / Math.max(state.baseUnits, 1)) * 100)}%`}
                />
                <ResultRow
                  label="מחיר לאחר הנחה"
                  value={`₪${selectedScenario.effectivePrice.toFixed(2)}`}
                  highlight
                />
                <ResultRow
                  label="מכירות נוספות (יח')"
                  value={`${formatNumber(selectedScenario.extraUnits)} יח'`}
                />
                <ResultRow
                  label="רווח תוספתי"
                  value={formatCurrency(selectedScenario.netProfit)}
                  tone={
                    selectedScenario.netProfit >= 0 ? "positive" : "negative"
                  }
                  bold
                />
                <ResultRow
                  label="הערכה"
                  value={verdictLabel(selectedScenario.verdict)}
                  tone={
                    selectedScenario.verdict === "worthIt"
                      ? "positive"
                      : selectedScenario.verdict === "notWorthIt"
                        ? "negative"
                        : "neutral"
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 4 — BREAK-EVEN */}
          <TabsContent value="breakeven" className="mt-4">
            <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5 mb-4">
              <div className="text-lg font-semibold text-[#2D3748] mb-1">
                מפת נקודת איזון — uplift נדרש לפי גובה הנחה
              </div>
              <div className="text-[15px] text-[#788390] mb-3">
                לכל גובה הנחה: כמה אחוז uplift במכירות נדרש כדי שהמבצע לא יפסיד
                מול תרחיש "ללא מבצע".
              </div>
              <div dir="ltr" className="w-full h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={beCurve}
                    margin={{ top: 10, right: 20, left: 30, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EBE3" />
                    <XAxis
                      dataKey="discount"
                      tick={{ fontSize: 16, fill: "#4A5568" }}
                      label={{
                        value: "גובה הנחה (%)",
                        position: "insideBottom",
                        offset: -16,
                        fill: "#2D3748",
                        fontSize: 16,
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 16, fill: "#4A5568" }}
                      tickFormatter={(v) => `${v}%`}
                      label={{
                        value: "uplift נדרש (%)",
                        angle: -90,
                        position: "insideLeft",
                        offset: -10,
                        style: {
                          textAnchor: "middle",
                          fill: "#2D3748",
                          fontSize: 16,
                        },
                      }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E7E0D8",
                        borderRadius: 10,
                        fontSize: 16,
                      }}
                      formatter={(v) =>
                        typeof v === "number" ? `${v}%` : String(v)
                      }
                      labelFormatter={(label) => `הנחה: ${label}`}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 16, paddingTop: 8 }}
                      verticalAlign="top"
                    />
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
                <ResultRow
                  label="הנחה אפקטיבית"
                  value={`${Math.round(m.effectiveDiscount * 100)}%`}
                  info={`הנחה לאחר התאמה לסוג מבצע. עבור "מארז" המערכת מעגלת ל-50% (BOGO ≈ 50% על היחידה השנייה); עבור "מועדון/נקודות" מוכפל ב-0.6.\nנוסחה: discountPct × גורם סוג המבצע`}
                />
                <ResultRow
                  label="מחיר לאחר הנחה"
                  value={`₪${m.effectivePrice.toFixed(2)}`}
                  highlight
                  info={`מחיר רגיל × (1 − הנחה אפקטיבית)\n= ₪${state.unitPrice.toFixed(2)} × (1 − ${m.effectiveDiscount.toFixed(2)})`}
                />
                <ResultRow
                  label="uplift מינימלי לאיזון"
                  value={`${minUplift}%`}
                  info={`כמה אחוזי uplift נדרשים כדי שהמבצע יחזיר את עצמו (רווח עם המבצע ≥ רווח ללא מבצע).\nנוסחה: (נקודת איזון − מכירות בסיס) ÷ מכירות בסיס × 100\n= (${formatNumber(beUnitsNow)} − ${formatNumber(state.baseUnits)}) ÷ ${formatNumber(state.baseUnits)} × 100\n= ${minUplift}%`}
                />
                <ResultRow
                  label="uplift שהוגדר"
                  value={`${Math.round(state.upliftPct)}%`}
                  info="ערך הסליידר 'צפי גידול בביקוש' מטאב 'פרטי המבצע'."
                />
                <ResultRow
                  label="מרווח ביטחון"
                  value={`${safetyMargin >= 0 ? "+" : ""}${safetyMargin}%`}
                  tone={safetyMargin >= 0 ? "positive" : "negative"}
                  bold
                  info={`uplift שהוגדר − uplift מינימלי לאיזון\n= ${Math.round(state.upliftPct)}% − ${minUplift}% = ${safetyMargin}%\nחיובי = יש מרווח, שלילי = ההנחה לא מוחזרת.`}
                />
                <ResultRow
                  label="סך מכירות לאיזון"
                  value={
                    Number.isFinite(beUnitsNow)
                      ? `${formatNumber(beUnitsNow)} יח'`
                      : "לא ניתן לאיזון"
                  }
                  info={`סך היחידות במבצע שצריך למכור כדי שהמבצע יחזיר את עצמו.\nנוסחה: ⌈(baseProfit + עלויות נוספות + cannibLoss) ÷ (מחיר מבצע − מחיר קנייה במבצע − עלות תפעול)⌉\n= ⌈(${formatCurrency(m.baseProfit)} + ${formatCurrency(state.mktCost)} + ${formatCurrency(m.cannibLoss)}) ÷ (₪${m.effectivePrice.toFixed(2)} − ₪${state.promoUnitCost.toFixed(2)} − ₪${state.opsCost.toFixed(2)})⌉`}
                />
              </div>

              <div className="rounded-[16px] border border-[#E7E0D8] bg-white p-5">
                <div className="text-lg font-semibold text-[#2D3748] mb-3">
                  גורמי סיכון
                </div>
                <div className="flex items-center justify-between border-b border-[#F1EBE3] py-2">
                  <span className="text-[16px] text-[#4A5568]">
                    סיכון צמצום מרווח
                  </span>
                  <span
                    className="text-[16px] font-medium"
                    style={{ color: RISK_COLOR[gmRisk] }}
                  >
                    {RISK_LABEL[gmRisk]}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#F1EBE3] py-2">
                  <span className="text-[16px] text-[#4A5568]">
                    סיכון uplift נמוך
                  </span>
                  <span
                    className="text-[16px] font-medium"
                    style={{ color: RISK_COLOR[upliftRisk] }}
                  >
                    {RISK_LABEL[upliftRisk]}
                  </span>
                </div>
                <ResultRow
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

interface ResultRowProps {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
  bold?: boolean;
  highlight?: boolean;
  /** Inline subtext shown under the label — describes the calculation. */
  formula?: string;
  /** Long-form explanation revealed via the ⓘ tooltip. */
  info?: string;
}

function FormulaTooltipContent({ text }: { text: string }) {
  return (
    <div className="space-y-1">
      {text.split("\n").map((line, i) => (
        <div key={i} className="font-mono text-[14px]">
          {line}
        </div>
      ))}
    </div>
  );
}

function ResultRow({
  label,
  value,
  tone = "neutral",
  bold,
  highlight,
  formula,
  info,
}: ResultRowProps) {
  const color = highlight
    ? "#2EC4D5"
    : tone === "positive"
      ? "#10B981"
      : tone === "negative"
        ? "#F43F5E"
        : "#2D3748";
  return (
    <div className="flex items-start justify-between border-b border-[#F1EBE3] last:border-b-0 py-2 gap-3">
      <div className="flex flex-col items-start min-w-0">
        <span className="text-[16px] text-[#4A5568] flex items-center gap-1.5">
          {label}
          {info && (
            <Tooltip content={<FormulaTooltipContent text={info} />} width="md">
              <Info
                className="h-3.5 w-3.5 text-[#A0AEC0] hover:text-[#2EC4D5] cursor-help"
                aria-label="הסבר חישוב"
              />
            </Tooltip>
          )}
        </span>
        {formula && (
          <span
            className="text-[15px] text-[#A0AEC0] font-mono mt-0.5"
            dir="ltr"
          >
            {formula}
          </span>
        )}
      </div>
      <span
        className={`font-mono ${bold ? "font-bold" : "font-medium"} shrink-0`}
        style={{ color, fontSize: 16 }}
        dir="ltr"
      >
        {value}
      </span>
    </div>
  );
}

interface ErpFieldRowProps {
  label: string;
  sub?: string;
  value: ReactNode;
}

/**
 * Read-only ERP field. Dashed bottom separator + muted left-side label
 * communicates "fixed/system data" without forbidding interaction visually.
 * Used inside the "נתוני מערכת" card on Tab 1.
 */
function ErpFieldRow({ label, sub, value }: ErpFieldRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-dashed border-[#E5DBC8] last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-[16px] text-[#4A5568] font-medium">{label}</div>
        {sub && <div className="text-[15px] text-[#A0AEC0] mt-0.5">{sub}</div>}
      </div>
      <div className="shrink-0 text-end">{value}</div>
    </div>
  );
}
