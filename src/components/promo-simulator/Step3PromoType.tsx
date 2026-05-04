import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePromoTaxonomy } from "@/contexts/PromoTaxonomyContext";
import type { Goal } from "@/lib/promo-simulator/taxonomy";
import type { SimulatorState } from "@/lib/promo-simulator/state";
import { StepHeader } from "./StepHeader";

interface Step3PromoTypeProps {
  goal: SimulatorState["goal"];
  promoType: string;
  onChange: (update: Partial<Pick<SimulatorState, "promoType">>) => void;
}

function Stars({ count }: { count: 1 | 2 | 3 }) {
  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`דירוג ${count} מתוך 3`}
    >
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i <= count ? "#F6B93B" : "transparent"}
          stroke={i <= count ? "#F6B93B" : "#788390"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function Step3PromoType({
  goal: goalProp,
  promoType,
  onChange,
}: Step3PromoTypeProps) {
  const reduceMotion = useReducedMotion();
  const { purposeMap } = usePromoTaxonomy();
  const goal = goalProp as Goal | "";

  if (!goal) {
    return (
      <Card className="border-[#E7E0D8] rounded-[16px]">
        <CardContent className="pt-6">
          <StepHeader
            step={3}
            title="בחירת סוג מבצע"
            description="הצעות סוגי מבצע יותאמו למטרה שתבחר בשלב 2"
            icon={Sparkles}
          />
          <div
            className="rounded-[16px] border-2 border-dashed p-10 text-center"
            style={{ borderColor: "#E7E0D8", background: "#FAF8F5" }}
          >
            <p className="text-xl font-semibold text-[#2D3748] mb-2">
              בחר מטרה בשלב הקודם כדי לקבל המלצות מותאמות
            </p>
            <p className="text-lg text-[#4A5568]">
              הצעות סוגי המבצע יותאמו למטרה שתבחר.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const options = purposeMap[goal] ?? [];

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardContent className="pt-6">
        <StepHeader
          step={3}
          title="בחירת סוג מבצע"
          description="סוגי המבצע המומלצים למטרה שבחרת, מדורגים לפי התאמה"
          icon={Sparkles}
          pill={{
            label: `מטרה: ${goal}`,
            bg: "#F0EEFE",
            border: "#C9C3F4",
            text: "#6C5CE7",
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((p, i) => {
            const isActive = promoType === p.name;
            return (
              <motion.button
                type="button"
                key={p.name}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => onChange({ promoType: p.name })}
                className="text-right rounded-[16px] border-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(220,78,89,0.10)]"
                style={{
                  background: isActive ? "rgba(220, 78, 89, 0.06)" : "#FFFFFF",
                  borderColor: isActive ? "#DC4E59" : "#E7E0D8",
                  boxShadow: isActive
                    ? "0 8px 20px rgba(220, 78, 89, 0.14)"
                    : "0 2px 6px rgba(220, 78, 89, 0.04)",
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#2D3748]">{p.name}</h3>
                  <span
                    className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[15px] font-mono font-semibold"
                    style={{ background: "#2EC4D51A", color: "#2EC4D5" }}
                    dir="ltr"
                  >
                    התאמה: {p.score}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Stars count={p.stars} />
                </div>
                <p className="text-[16px] text-[#4A5568] leading-relaxed">
                  {p.reason}
                </p>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
