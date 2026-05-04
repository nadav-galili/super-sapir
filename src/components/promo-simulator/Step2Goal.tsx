import { Target } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { usePromoTaxonomy } from "@/contexts/PromoTaxonomyContext";
import type { Goal } from "@/lib/promo-simulator/taxonomy";
import type { SimulatorState } from "@/lib/promo-simulator/state";
import { StepHeader } from "./StepHeader";

interface Step2GoalProps {
  goal: SimulatorState["goal"];
  onChange: (
    update: Partial<Pick<SimulatorState, "goal" | "promoType">>
  ) => void;
}

export function Step2Goal({ goal, onChange }: Step2GoalProps) {
  const reduceMotion = useReducedMotion();
  const { goals, goalDescriptions } = usePromoTaxonomy();
  const pick = (g: Goal) => {
    if (goal === g) {
      onChange({ goal: g });
      return;
    }
    // Side effect: clear downstream promo type when goal changes
    onChange({ goal: g, promoType: "" });
  };

  return (
    <Card className="border-[#E7E0D8] rounded-[16px]">
      <CardContent className="pt-6">
        <StepHeader
          step={2}
          title="בחירת מטרה"
          description="בחר את המטרה האסטרטגית של המבצע — היא תקבע את סוג המבצע המומלץ"
          icon={Target}
          pill={
            goal
              ? {
                  label: `נבחר: ${goal}`,
                  bg: "#ECFDF5",
                  border: "#A7F3D0",
                  text: "#065F46",
                }
              : undefined
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g, i) => {
            const isActive = goal === g;
            return (
              <motion.button
                type="button"
                key={g}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => pick(g)}
                className="text-right rounded-[16px] border-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(220,78,89,0.10)]"
                style={{
                  background: isActive ? "rgba(16, 185, 129, 0.07)" : "#FFFFFF",
                  borderColor: isActive ? "#10B981" : "#E7E0D8",
                  boxShadow: isActive
                    ? "0 8px 20px rgba(16, 185, 129, 0.12)"
                    : "0 2px 6px rgba(220, 78, 89, 0.04)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#2D3748]">{g}</h3>
                  <span
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isActive ? "#10B981" : "#788390",
                      background: isActive ? "#10B981" : "transparent",
                    }}
                  >
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </span>
                </div>
                <p className="text-[16px] text-[#4A5568] leading-relaxed">
                  {goalDescriptions[g]}
                </p>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
