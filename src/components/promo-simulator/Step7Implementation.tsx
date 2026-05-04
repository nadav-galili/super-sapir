import { Box, Check, Megaphone, Monitor, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type {
  ImplementationSlice,
  SliceSetter,
} from "@/lib/promo-simulator/state";
import { StepHeader } from "./StepHeader";

interface Step7ImplementationProps {
  impl: ImplementationSlice;
  onChange: SliceSetter<ImplementationSlice>;
}

const CHECKS: {
  field: "signage" | "shelf" | "training" | "cashierBrief";
  label: string;
  desc: string;
}[] = [
  {
    field: "signage",
    label: "שילוט מוכן",
    desc: "שלטי מדף, מחיר, מדבקות ו-POS הופקו ומוכנים לפריסה.",
  },
  {
    field: "shelf",
    label: "מיקום מדף / במה",
    desc: "נקבעה במה באיזור בעל תנועה או מיקום עיני קהל במדף.",
  },
  {
    field: "training",
    label: "הדרכת עובדים",
    desc: "המוכרים מבינים את המבצע ויודעים לענות ללקוחות.",
  },
  {
    field: "cashierBrief",
    label: "תדריך קופאים",
    desc: "הקופאים יודעים לבדוק עדכון מחיר בקופה ולתת מענה בזמן אמת.",
  },
];

const TIPS: { icon: typeof Monitor; title: string; body: string }[] = [
  {
    icon: Monitor,
    title: "POS / במות",
    body: "מבצע טוב מתחיל מנוכחות פיזית. במה בקדמת החנות + שילוט גדול = טריגר קל לקליטה.",
  },
  {
    icon: Box,
    title: "מלאי",
    body: "ודא שהמלאי בחזית המדף והאחורי מותאם לכמות הצפויה כדי למנוע חוסר בשיא המבצע.",
  },
  {
    icon: Users,
    title: "תדריך קצר",
    body: "תדריך של 10 דקות לכל המשמרת בעובדי הרצפה והקופאים מעלה את אפקטיביות המבצע.",
  },
];

export function Step7Implementation({
  impl,
  onChange,
}: Step7ImplementationProps) {
  const readyCount = CHECKS.filter((c) => Boolean(impl[c.field])).length;
  const total = CHECKS.length;
  const allReady = readyCount === total;
  const anyReady = readyCount > 0;
  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardContent className="pt-6 space-y-6">
        <StepHeader
          step={6}
          title="הנחיות לשטח"
          description="ודא שהמבצע מוכן להשקה — שילוט, מדף, הדרכה ותדריך"
          icon={Megaphone}
          pill={{
            label: `מוכנות ${readyCount}/${total}`,
            bg: allReady ? "#ECFDF5" : anyReady ? "#FFFBEB" : "#FFF1F2",
            border: allReady ? "#A7F3D0" : anyReady ? "#FCD34D" : "#FDA4AF",
            text: allReady ? "#065F46" : anyReady ? "#92400E" : "#9F1239",
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHECKS.map((c) => {
            const checked = Boolean(impl[c.field]);
            return (
              <button
                type="button"
                key={c.field}
                onClick={() => onChange({ [c.field]: !checked })}
                className="text-right rounded-[16px] border-2 p-4 transition-all hover:-translate-y-0.5"
                style={{
                  background: checked ? "rgba(16, 185, 129, 0.06)" : "#FFFFFF",
                  borderColor: checked ? "#10B981" : "#E7E0D8",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 w-6 h-6 shrink-0 rounded-[6px] border-2 flex items-center justify-center transition-colors"
                    style={{
                      background: checked ? "#10B981" : "#FFFFFF",
                      borderColor: checked ? "#10B981" : "#788390",
                    }}
                  >
                    {checked && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </span>
                  <div>
                    <p className="text-xl font-semibold text-[#2D3748]">
                      {c.label}
                    </p>
                    <p className="text-[16px] text-[#4A5568] mt-1 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIPS.map((t) => (
            <div
              key={t.title}
              className="rounded-[16px] border border-[#E7E0D8] bg-white p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #2EC4D5, #5DD8E3)",
                  }}
                >
                  <t.icon className="w-4 h-4 text-white" />
                </span>
                <h4 className="text-xl font-semibold text-[#2D3748]">
                  {t.title}
                </h4>
              </div>
              <p className="text-[16px] text-[#4A5568] leading-relaxed">
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
