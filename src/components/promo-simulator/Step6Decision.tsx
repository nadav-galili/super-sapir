import { Check, AlertTriangle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { verdictLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import {
  DECISIONS,
  DECISION_LABEL,
  SCENARIO_LABEL,
  type Decision,
  type SimulatorState,
} from "@/lib/promo-simulator/state";

interface Step6DecisionProps {
  state: SimulatorState;
  metrics: PromoMetrics;
  onChange: (
    update: Partial<Pick<SimulatorState, "analysisNote" | "decision">>
  ) => void;
}

const VERDICT_COLOR = {
  worthIt: { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" },
  borderline: { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E" },
  notWorthIt: { bg: "#FFF1F2", border: "#FDA4AF", text: "#9F1239" },
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

interface KpiTileProps {
  title: string;
  value: string;
  sub: string;
  accent?: string;
}

function KpiTile({ title, value, sub, accent = "#2D3748" }: KpiTileProps) {
  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardContent className="p-5">
        <p className="text-[15px] font-medium text-[#788390] uppercase tracking-wide">
          {title}
        </p>
        <p
          className="text-3xl font-bold font-mono mt-1"
          style={{ color: accent }}
          dir="ltr"
        >
          {value}
        </p>
        <p className="text-[15px] text-[#4A5568] mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

export function Step6Decision({
  state,
  metrics: m,
  onChange,
}: Step6DecisionProps) {
  const verdict = VERDICT_COLOR[m.verdict];
  const netProfitColor = m.netProfit >= 0 ? "#10B981" : "#F43F5E";
  const roiColor = m.roi >= 0 ? "#10B981" : "#F43F5E";

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-2xl text-[#2D3748]">
            החלטה והצדקה
          </CardTitle>
          <p className="text-lg text-[#4A5568]">
            סיכום הניתוח מהשלבים 4–5 ותיעוד ההחלטה לפני יישום
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-4 py-1.5 text-[16px] font-semibold border"
          style={{
            background: verdict.bg,
            borderColor: verdict.border,
            color: verdict.text,
          }}
        >
          {verdictLabel(m.verdict)}
        </span>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Headline KPIs from steps 4 + 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiTile
            title="רווח תוספתי נטו"
            value={formatCurrency(m.netProfit)}
            sub="אחרי שיווק וקניבליזציה"
            accent={netProfitColor}
          />
          <KpiTile
            title="ROI"
            value={`${m.roi}%`}
            sub="על עלות השיווק"
            accent={roiColor}
          />
          <KpiTile
            title="תרחיש נבחר"
            value={SCENARIO_LABEL[state.selectedScenario]}
            sub="מתוך השוואת התרחישים"
            accent="#6C5CE7"
          />
        </div>

        {/* Decision selector */}
        <div>
          <h3 className="text-xl font-semibold text-[#2D3748] mb-3">ההחלטה</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DECISIONS.map((d) => {
              const meta = DECISION_META[d];
              const isSel = state.decision === d;
              const Icon = meta.icon;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChange({ decision: d })}
                  className="text-right rounded-[16px] border-2 p-4 transition-all hover:-translate-y-0.5"
                  style={{
                    background: isSel ? meta.bgSelected : "#FFFFFF",
                    borderColor: isSel ? meta.borderSelected : "#E7E0D8",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center"
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
                    <div>
                      <p className="text-xl font-semibold text-[#2D3748]">
                        {DECISION_LABEL[d]}
                      </p>
                      <p className="text-[16px] text-[#4A5568] mt-1 leading-relaxed">
                        {meta.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Justification textarea */}
        <div>
          <label
            htmlFor="analysis-note"
            className="text-[16px] font-semibold text-[#2D3748] mb-1.5 block"
          >
            הצדקה ותובנות
          </label>
          <p className="text-[15px] text-[#788390] mb-2">
            תעד את הנימוקים — מדוע ההחלטה הזאת? אילו הנחות יסוד? מה הסיכונים
            המרכזיים? אם בחרת &quot;לאשר עם תיקונים&quot; — אילו תיקונים נדרשים?
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
            className="w-full min-h-[220px] rounded-[10px] border border-[#E7E0D8] bg-white p-4 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40 leading-relaxed resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
}
