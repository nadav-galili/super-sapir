import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type PeriodType = "yearly" | "monthly" | "weekly";

export interface TimePeriod {
  type: PeriodType;
  month?: number; // 1-12, only for monthly
  week?: number; // 1-52, only for weekly
}

const MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

function getWeekLabel(week: number): string {
  return `שבוע ${week}`;
}

export function getPeriodLabel(period: TimePeriod): string {
  if (period.type === "yearly") return "שנה מצטברת";
  if (period.type === "monthly" && period.month)
    return MONTHS[period.month - 1];
  if (period.type === "weekly" && period.week) return getWeekLabel(period.week);
  return "";
}

interface TimePeriodFilterProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  variant?: "light" | "dark";
}

export function TimePeriodFilter({
  value,
  onChange,
  variant = "light",
}: TimePeriodFilterProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const isDark = variant === "dark";

  function selectType(type: PeriodType) {
    if (type === "yearly") {
      onChange({ type: "yearly" });
      setShowDropdown(false);
    } else if (type === "monthly") {
      onChange({ type: "monthly", month: value.month || 12 });
    } else {
      onChange({ type: "weekly", week: value.week || 1 });
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown((s) => !s)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] border text-lg font-semibold transition-all ${
          isDark
            ? "bg-white/[0.06] border-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.09]"
            : "bg-white border-[#FFE8DE] text-[#2D3748] hover:shadow-md"
        }`}
      >
        <Calendar
          className={`w-5 h-5 ${isDark ? "text-[#2EC4D5]" : "text-[#6C5CE7]"}`}
        />
        <span>{getPeriodLabel(value)}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isDark ? "text-white/45" : "text-[#A0AEC0]"} ${showDropdown ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 end-0 z-50 bg-white rounded-[12px] border border-[#FFE8DE] shadow-lg p-3 min-w-[280px]"
          >
            {/* Period type buttons */}
            <div className="flex gap-1 mb-3 bg-[#FDF8F6] p-1 rounded-[10px]">
              {[
                { type: "yearly" as const, label: "שנתי" },
                { type: "monthly" as const, label: "חודשי" },
                { type: "weekly" as const, label: "שבועי" },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => selectType(opt.type)}
                  className={`flex-1 px-3 py-2 rounded-[8px] text-[16px] font-medium transition-all ${
                    value.type === opt.type
                      ? "bg-white text-[#6C5CE7] shadow-sm"
                      : "text-[#4A5568] hover:bg-white/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Month picker */}
            {value.type === "monthly" && (
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange({ type: "monthly", month: i + 1 });
                      setShowDropdown(false);
                    }}
                    className={`px-2 py-2 rounded-[8px] text-[16px] font-medium transition-all ${
                      value.month === i + 1
                        ? "bg-[#6C5CE7] text-white shadow-sm"
                        : "text-[#4A5568] hover:bg-[#FDF8F6]"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* Week picker */}
            {value.type === "weekly" && (
              <div className="max-h-[240px] overflow-y-auto grid grid-cols-4 gap-1.5">
                {Array.from({ length: 52 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange({ type: "weekly", week: i + 1 });
                      setShowDropdown(false);
                    }}
                    className={`px-2 py-2 rounded-[8px] text-[16px] font-medium transition-all ${
                      value.week === i + 1
                        ? "bg-[#6C5CE7] text-white shadow-sm"
                        : "text-[#4A5568] hover:bg-[#FDF8F6]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Yearly — just close */}
            {value.type === "yearly" && (
              <p className="text-[16px] text-[#A0AEC0] text-center py-2">
                נתונים מצטברים מתחילת השנה
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getPeriodBaseShare(period: TimePeriod): number {
  if (period.type === "yearly") return 1;

  if (period.type === "monthly" && period.month) {
    const monthlyWeights = [
      0.075, 0.073, 0.08, 0.081, 0.084, 0.082, 0.086, 0.087, 0.084, 0.089,
      0.091, 0.088,
    ];
    return monthlyWeights[period.month - 1] ?? 1 / 12;
  }

  if (period.type === "weekly" && period.week) {
    const seasonalWave = Math.sin(period.week * 0.75) * 0.0018;
    return Math.max(0.014, 1 / 52 + seasonalWave);
  }

  return 1;
}

function getPeriodPerformanceFactor(period: TimePeriod): number {
  if (period.type === "yearly") return 1;

  let seed = 0;
  if (period.type === "monthly" && period.month) {
    seed = period.month;
  } else if (period.type === "weekly" && period.week) {
    seed = period.week + 100;
  }

  const hash = Math.sin(seed * 9301 + 49297) * 0.5 + 0.5;
  return 0.9 + hash * 0.18;
}

/**
 * Returns the actual-value multiplier for the selected period:
 * expected period share of the year, plus a modest deterministic performance factor.
 */
export function getPeriodMultiplier(period: TimePeriod): number {
  if (period.type === "yearly") return 1;
  return getPeriodBaseShare(period) * getPeriodPerformanceFactor(period);
}

/**
 * Returns the target multiplier for the selected period.
 * Targets follow the period share itself so attainment can move realistically.
 */
export function getPeriodTargetMultiplier(period: TimePeriod): number {
  return getPeriodBaseShare(period);
}

/**
 * Returns a small deterministic jitter (0.92–1.08) for percentage KPIs,
 * so they shift slightly per period while staying realistic.
 */
export function getPeriodJitter(period: TimePeriod, index: number): number {
  if (period.type === "yearly") return 1;
  let seed = index * 17;
  if (period.type === "monthly" && period.month) {
    seed += period.month * 31;
  } else if (period.type === "weekly" && period.week) {
    seed += (period.week + 100) * 31;
  }
  const hash = Math.sin(seed * 7919 + 104729) * 0.5 + 0.5;
  return 0.92 + hash * 0.16;
}
