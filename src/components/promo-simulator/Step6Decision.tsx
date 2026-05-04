import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  FileSignature,
  Scale,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { verdictLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import {
  DECISIONS,
  DECISION_LABEL,
  SCENARIO_LABEL,
  type Decision,
  type SimulatorState,
} from "@/lib/promo-simulator/state";
import { StepHeader } from "./StepHeader";

interface Step6DecisionProps {
  state: SimulatorState;
  metrics: PromoMetrics;
  onChange: (
    update: Partial<Pick<SimulatorState, "analysisNote" | "decision">>
  ) => void;
}

const VERDICT_THEME = {
  worthIt: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#065F46",
    accent: "#10B981",
    softBg: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 60%)",
    headline: "המבצע כדאי",
    rationale:
      "הניתוח תומך בהפעלת המבצע — הרווח התוספתי חיובי והמרווח הגולמי שמור.",
  },
  borderline: {
    bg: "#FFFBEB",
    border: "#FCD34D",
    text: "#92400E",
    accent: "#F59E0B",
    softBg: "linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 60%)",
    headline: "כדאיות גבולית",
    rationale:
      "המבצע על הגבול — שווה לבחון התאמות (הנחה, uplift, עלות שיווק) לפני אישור.",
  },
  notWorthIt: {
    bg: "#FFF1F2",
    border: "#FDA4AF",
    text: "#9F1239",
    accent: "#F43F5E",
    softBg: "linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 60%)",
    headline: "המבצע לא כדאי",
    rationale:
      "הניתוח אינו תומך — הרווח הנטו שלילי או המרווח שחוק. כדאי לדחות או לשפר תנאים.",
  },
} as const;

const DECISION_META: Record<
  Exclude<Decision, "">,
  {
    icon: typeof Check;
    accent: string;
    bgSelected: string;
    borderSelected: string;
    desc: string;
  }
> = {
  approve: {
    icon: Check,
    accent: "#10B981",
    bgSelected: "#ECFDF5",
    borderSelected: "#10B981",
    desc: "הניתוח תומך בהפעלת המבצע. ממשיכים ליישום בשטח.",
  },
  revise: {
    icon: AlertTriangle,
    accent: "#F59E0B",
    bgSelected: "#FFFBEB",
    borderSelected: "#F59E0B",
    desc: "המבצע אפשרי אך דורש התאמות (הנחה, uplift, עלות שיווק) לפני ההפעלה.",
  },
  reject: {
    icon: X,
    accent: "#F43F5E",
    bgSelected: "#FFF1F2",
    borderSelected: "#F43F5E",
    desc: "הניתוח אינו תומך — לא להפעיל. כדאי לתעד את הסיבה לארכיון.",
  },
};

interface KpiPillProps {
  title: string;
  value: string;
  sub: string;
  accent?: string;
}

/**
 * Compact evidence pill — small KPI cards used inside the verdict panel as
 * "supporting evidence" rather than the headline number.
 */
function KpiPill({ title, value, sub, accent = "#2D3748" }: KpiPillProps) {
  return (
    <div className="rounded-[12px] border border-[#E7E0D8] bg-white/80 backdrop-blur-sm p-4 flex flex-col gap-1">
      <p className="text-[15px] font-medium text-[#788390] uppercase tracking-wide">
        {title}
      </p>
      <p
        className="text-2xl font-bold font-mono"
        style={{ color: accent }}
        dir="ltr"
      >
        {value}
      </p>
      <p className="text-[15px] text-[#4A5568]">{sub}</p>
    </div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 160, damping: 22 },
  },
};

export function Step6Decision({
  state,
  metrics: m,
  onChange,
}: Step6DecisionProps) {
  const theme = VERDICT_THEME[m.verdict];
  const netProfitColor = m.netProfit >= 0 ? "#10B981" : "#F43F5E";
  // ROI is undefined without a marketing investment (would be a div-by-zero).
  // When there's no spend, swap the middle pill to gross-margin-in-promo —
  // a metric that's always meaningful at the same "ratio" register.
  const hasInvestment = state.mktCost > 0;
  const middleTitle = hasInvestment ? "ROI" : "מרווח גולמי במבצע";
  const middleValue = hasInvestment
    ? `${m.roi}%`
    : `${m.promoGrossMargin.toFixed(1)}%`;
  const middleSub = hasInvestment ? "על עלות השיווק" : "אחרי הנחה לקונה ולספק";
  const middleColor = hasInvestment
    ? m.roi >= 0
      ? "#10B981"
      : "#F43F5E"
    : m.promoGrossMargin >= 10
      ? "#10B981"
      : m.promoGrossMargin >= 0
        ? "#F59E0B"
        : "#F43F5E";
  const selectedDecisionMeta = state.decision
    ? DECISION_META[state.decision]
    : undefined;

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardContent className="pt-6 space-y-6">
        <StepHeader
          step={5}
          title="אישור מבצע"
          description="סקור את ההמלצה, אשר את ההחלטה, ותעד את ההצדקה לארכיון."
          icon={FileSignature}
          pill={{
            label: verdictLabel(m.verdict),
            bg: theme.bg,
            border: theme.border,
            text: theme.text,
          }}
        />
        {/* ── EVIDENCE PANEL ──────────────────────────────────────────
            The system's recommendation as a single visual unit:
            big verdict + 1-line rationale + 3 supporting KPI pills. */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={sectionVariants}
          className="relative overflow-hidden rounded-[16px] border p-5"
          style={{
            background: theme.softBg,
            borderColor: theme.border,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-y-5 right-0 w-[3px] rounded-full"
            style={{ background: theme.accent }}
          />

          <div className="flex items-start gap-4 ps-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md"
              style={{ background: theme.accent }}
            >
              <Scale className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <div
                className="text-[15px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: theme.accent }}
              >
                המלצת המערכת
              </div>
              <h3
                className="text-3xl font-bold tracking-tight mt-1"
                style={{ color: theme.text }}
              >
                {theme.headline}
              </h3>
              <p className="mt-2 text-[16px] text-[#4A5568] leading-relaxed">
                {theme.rationale}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiPill
              title="רווח תוספתי נטו"
              value={formatCurrency(m.netProfit)}
              sub="אחרי שיווק וקניבליזציה"
              accent={netProfitColor}
            />
            <KpiPill
              title={middleTitle}
              value={middleValue}
              sub={middleSub}
              accent={middleColor}
            />
            <KpiPill
              title="תרחיש נבחר"
              value={SCENARIO_LABEL[state.selectedScenario]}
              sub="מתוך השוואת התרחישים"
              accent="#6C5CE7"
            />
          </div>
        </motion.section>

        {/* ── SIGN-OFF PANEL ───────────────────────────────────────────
            The decision moment. Visual treatment evokes a sign-off
            document: clear eyebrow, three large decision cards, and
            a tinted justification field that picks up the chosen
            decision's accent. */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={sectionVariants}
          transition={{ delay: 0.08 }}
          className="rounded-[16px] border border-[#E7E0D8] bg-white p-5"
        >
          <header className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1F0] border border-[#FDA4AF] text-[#DC4E59]">
              <ClipboardCheck className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold uppercase tracking-[0.14em] text-[#DC4E59]">
                ההחלטה שלך
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#2D3748]">
                בחר אחת משלוש האפשרויות ותעד את ההצדקה
              </h3>
            </div>
            {state.decision && selectedDecisionMeta && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[15px] font-semibold border shrink-0"
                style={{
                  background: selectedDecisionMeta.bgSelected,
                  borderColor: selectedDecisionMeta.borderSelected,
                  color: selectedDecisionMeta.accent,
                }}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                נבחר: {DECISION_LABEL[state.decision]}
              </span>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DECISIONS.map((d) => {
              const meta = DECISION_META[d];
              const isSel = state.decision === d;
              const Icon = meta.icon;
              return (
                <motion.button
                  key={d}
                  type="button"
                  onClick={() => onChange({ decision: d })}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 22,
                  }}
                  className="text-right rounded-[16px] border-2 p-4 transition-shadow"
                  style={{
                    background: isSel ? meta.bgSelected : "#FFFFFF",
                    borderColor: isSel ? meta.borderSelected : "#E7E0D8",
                    boxShadow: isSel
                      ? `0 12px 28px -16px ${meta.accent}66`
                      : "none",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-10 h-10 shrink-0 rounded-[10px] flex items-center justify-center transition-colors"
                      style={{
                        background: isSel ? meta.accent : "#F1EBE3",
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: isSel ? "#FFFFFF" : meta.accent }}
                        strokeWidth={2.5}
                      />
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-xl font-semibold"
                        style={{ color: isSel ? meta.accent : "#2D3748" }}
                      >
                        {DECISION_LABEL[d]}
                      </p>
                      <p className="text-[16px] text-[#4A5568] mt-1 leading-relaxed">
                        {meta.desc}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Justification — visually linked to the chosen decision via
              a left accent stripe in that decision's color. */}
          <div
            className="mt-5 rounded-[12px] border bg-[#FAF8F5] p-4 transition-colors"
            style={{
              borderColor: selectedDecisionMeta?.borderSelected ?? "#E7E0D8",
            }}
          >
            <label
              htmlFor="analysis-note"
              className="text-[16px] font-semibold text-[#2D3748] mb-1 block"
            >
              הצדקה ותובנות
            </label>
            <p className="text-[15px] text-[#788390] mb-3">
              תעד את הנימוקים — מדוע ההחלטה הזאת? אילו הנחות יסוד? מה הסיכונים
              המרכזיים?
              {state.decision === "revise" ? " אילו תיקונים נדרשים?" : ""}
            </p>
            <textarea
              id="analysis-note"
              value={state.analysisNote}
              onChange={(e) => onChange({ analysisNote: e.target.value })}
              placeholder={
                state.decision === "reject"
                  ? "למשל: הרווח התוספתי שלילי גם בתרחיש האופטימי. נמתין לעליית מחירי הקטגוריה."
                  : state.decision === "revise"
                    ? "למשל: להפחית את ההנחה ל-12% ולחבר את המבצע למוצר עוגן משלים. uplift הצפוי יישאר ריאלי."
                    : "למשל: ה-verdict כדאי, התרחיש השמרני עדיין רווחי. סיכונים מרכזיים: זמינות מלאי, תחרות הוזלה אצל המתחרה."
              }
              className="w-full min-h-[180px] rounded-[10px] border border-[#E7E0D8] bg-white p-4 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40 leading-relaxed resize-y"
            />
          </div>
        </motion.section>
      </CardContent>
    </Card>
  );
}
