import { Activity, Check, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getProgressColor, getStatusColor } from "@/lib/kpi/resolvers";
import { statusLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import type { ControlSlice, SliceSetter } from "@/lib/promo-simulator/state";
import { StepHeader } from "./StepHeader";

interface Step8ControlProps {
  control: ControlSlice;
  metrics: PromoMetrics;
  readinessCount: number;
  onChange: SliceSetter<ControlSlice>;
}

const CHECKS: {
  field: "controlPrice" | "controlStock" | "controlDisplay";
  label: string;
}[] = [
  { field: "controlPrice", label: "המחיר מוצג נכון" },
  { field: "controlStock", label: "אין חוסר מלאי" },
  { field: "controlDisplay", label: "יש נראות מספקת" },
];

export function Step8Control({
  control,
  metrics: m,
  readinessCount,
  onChange,
}: Step8ControlProps) {
  const statusColor = getStatusColor({
    status:
      m.status === "worthIt"
        ? "green"
        : m.status === "needsImprovement"
          ? "yellow"
          : "red",
  });
  const pace = Math.min(
    100,
    Math.round((m.promoUnits / Math.max(m.breakEvenUnits, 1)) * 100)
  );
  const paceFinite = Number.isFinite(pace) ? pace : 0;
  const paceColor = getProgressColor({ percent: paceFinite });
  const readinessColor = getProgressColor({
    percent: (readinessCount / 4) * 100,
  });

  const statusPill =
    m.status === "worthIt"
      ? { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" }
      : m.status === "needsImprovement"
        ? { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E" }
        : { bg: "#FFF1F2", border: "#FDA4AF", text: "#9F1239" };

  return (
    <div className="space-y-4">
      <Card className="border-[#E7E0D8] rounded-[16px]">
        <CardContent className="pt-6">
          <StepHeader
            step={7}
            title="בקרה"
            description="וידוא תקינות בזמן הרצה — מחיר, מלאי, נראות"
            icon={Activity}
            pill={{ label: statusLabel(m.status), ...statusPill }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHECKS.map((c) => {
              const checked = Boolean(control[c.field]);
              return (
                <button
                  type="button"
                  key={c.field}
                  onClick={() => onChange({ [c.field]: !checked })}
                  className="text-right rounded-[16px] border-2 p-4 transition-all hover:-translate-y-0.5 flex items-center gap-3"
                  style={{
                    background: checked
                      ? "rgba(16, 185, 129, 0.06)"
                      : "#FFFFFF",
                    borderColor: checked ? "#10B981" : "#E7E0D8",
                  }}
                >
                  <span
                    className="w-6 h-6 shrink-0 rounded-[6px] border-2 flex items-center justify-center transition-colors"
                    style={{
                      background: checked ? "#10B981" : "#FFFFFF",
                      borderColor: checked ? "#10B981" : "#788390",
                    }}
                  >
                    {checked && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </span>
                  <p className="text-xl font-semibold text-[#2D3748]">
                    {c.label}
                  </p>
                </button>
              );
            })}

            <div
              className="rounded-[16px] border-2 p-4 flex items-start gap-3"
              style={{
                borderColor: "#6C5CE7",
                background: "#6C5CE70D",
              }}
            >
              <span
                className="w-8 h-8 shrink-0 rounded-[10px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #6C5CE7, #8B7FED)",
                }}
              >
                <HelpCircle className="w-4 h-4 text-white" />
              </span>
              <div>
                <p className="text-xl font-semibold text-[#2D3748]">
                  שאלה להתבוננות
                </p>
                <p className="text-[16px] text-[#4A5568] mt-1 leading-relaxed">
                  האם המבצע מתקשר בצורה ברורה הזדמנות של &quot;כאן ועכשיו&quot;?
                  ללקוח צריך להיות ברור שמדובר בחלון זמן מוגבל ושהערך המיידי
                  משמעותי.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard
          title="סטטוס מבצע"
          value={statusLabel(m.status)}
          color={statusColor}
          sub="הערכה כללית"
        />
        <KpiCard
          title="קצב מול תחזית"
          value={`${paceFinite}%`}
          color={paceColor}
          sub="מכר בפועל מול break-even"
        />
        <KpiCard
          title="מוכנות תפעולית"
          value={`${readinessCount}/4`}
          color={readinessColor}
          sub="שילוט / מדף / הדרכה / קופאים"
        />
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardContent className="p-5">
        <p className="text-[15px] font-medium text-[#788390] uppercase tracking-wide">
          {title}
        </p>
        <p className="text-3xl font-bold mt-1" style={{ color }} dir="ltr">
          {value}
        </p>
        <p className="text-[15px] text-[#4A5568] mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
