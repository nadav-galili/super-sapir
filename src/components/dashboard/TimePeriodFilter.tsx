import { useEffect, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type PeriodType = "yearly" | "monthly" | "range";

export interface TimePeriod {
  type: PeriodType;
  month?: number; // 1-12, only for monthly
  fromDate?: string; // YYYY-MM-DD, only for range
  toDate?: string; // YYYY-MM-DD, only for range
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

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatDisplayDate(date: string): string {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
}

function getDefaultRangePeriod(): TimePeriod {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return {
    type: "range",
    fromDate: `${year}-${pad2(month + 1)}-01`,
    toDate: `${year}-${pad2(month + 1)}-${pad2(lastDayOfMonth)}`,
  };
}

function getPeriodDescriptor(period: TimePeriod): string {
  if (period.type === "yearly") return "תצוגת סיכום מתחילת השנה";
  if (period.type === "monthly") return "כל המדדים מחושבים לפי החודש הנבחר";
  if (period.type === "range") return "כל המדדים מחושבים לפי טווח התאריכים";
  return "";
}

export function getPeriodLabel(period: TimePeriod): string {
  if (period.type === "yearly") return "שנה מצטברת";
  if (period.type === "monthly" && period.month)
    return MONTHS[period.month - 1];
  if (period.type === "range" && period.fromDate && period.toDate) {
    return `${formatDisplayDate(period.fromDate)} עד ${formatDisplayDate(period.toDate)}`;
  }
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
  const [activeType, setActiveType] = useState<PeriodType>(value.type);
  const [rangeDraft, setRangeDraft] = useState<TimePeriod>(
    value.type === "range" ? value : getDefaultRangePeriod()
  );

  useEffect(() => {
    setActiveType(value.type);
    if (value.type === "range") {
      setRangeDraft(value);
    }
  }, [value]);

  function selectType(type: PeriodType) {
    setActiveType(type);
    if (type === "yearly") {
      onChange({ type: "yearly" });
      setShowDropdown(false);
    } else if (type === "monthly") {
      onChange({ type: "monthly", month: value.month || 12 });
    } else {
      setRangeDraft(value.type === "range" ? value : getDefaultRangePeriod());
    }
  }

  function applyRange(next: Partial<TimePeriod>) {
    setRangeDraft((current) => ({
      ...current,
      ...next,
      type: "range" as const,
    }));
  }

  function commitRange() {
    if (!rangeDraft.fromDate || !rangeDraft.toDate) return;
    const from = new Date(rangeDraft.fromDate);
    const to = new Date(rangeDraft.toDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
    const draft = {
      ...rangeDraft,
      type: "range" as const,
    };
    if (from > to) {
      onChange({
        type: "range",
        fromDate: rangeDraft.toDate,
        toDate: rangeDraft.fromDate,
      });
    } else {
      onChange(draft);
    }
    setActiveType("range");
    setShowDropdown(false);
  }

  return (
    <div className="relative z-30">
      <button
        onClick={() => setShowDropdown((s) => !s)}
        className={`inline-flex min-w-[260px] items-center justify-between gap-3 rounded-[14px] border px-4 py-3 text-right transition-all ${
          isDark
            ? "bg-white/[0.06] border-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.09]"
            : "bg-white border-[#FFE8DE] text-[#2D3748] shadow-sm hover:shadow-md"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
              isDark
                ? "border border-white/10 bg-white/[0.06]"
                : "border border-[#FFE8DE] bg-[#FDF8F6]"
            }`}
          >
            <Calendar
              className={`w-5 h-5 ${isDark ? "text-[#2EC4D5]" : "text-[#6C5CE7]"}`}
            />
          </div>
          <div className="min-w-0">
            <p
              className={`text-[11px] font-semibold tracking-[0.12em] ${
                isDark ? "text-white/45" : "text-[#A0AEC0]"
              }`}
            >
              טווח ניתוח
            </p>
            <p
              className={`truncate text-[18px] font-semibold leading-tight ${
                isDark ? "text-white" : "text-[#2D3748]"
              }`}
            >
              {getPeriodLabel(value)}
            </p>
            <p
              className={`truncate text-[12px] ${
                isDark ? "text-white/55" : "text-[#A0AEC0]"
              }`}
            >
              {getPeriodDescriptor(value)}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${isDark ? "text-white/45" : "text-[#A0AEC0]"} ${showDropdown ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-3 end-0 z-[80] w-[min(92vw,340px)] rounded-[16px] border border-[#FFE8DE] bg-white p-4 shadow-[0_20px_40px_-18px_rgba(45,55,72,0.24)] sm:top-0 sm:mt-0 sm:end-auto sm:start-[calc(100%+12px)] sm:w-[360px]"
          >
            <div className="mb-3">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#A0AEC0]">
                בחירת תקופה
              </p>
              <p className="mt-1 text-[14px] text-[#4A5568]">
                שנה, חודש או טווח תאריכים לעדכון כל המדדים בדף
              </p>
            </div>

            <div className="mb-4 flex gap-1 rounded-[12px] bg-[#FDF8F6] p-1">
              {[
                { type: "yearly" as const, label: "שנה" },
                { type: "monthly" as const, label: "חודש" },
                { type: "range" as const, label: "טווח" },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => selectType(opt.type)}
                  className={`flex-1 rounded-[10px] px-3 py-2 text-[15px] font-semibold transition-all ${
                    activeType === opt.type
                      ? "bg-white text-[#DC4E59] shadow-sm"
                      : "text-[#4A5568] hover:bg-white/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Month picker */}
            {activeType === "monthly" && (
              <div>
                <p className="mb-2 text-[12px] font-semibold text-[#A0AEC0]">
                  בחר חודש
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {MONTHS.map((name, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onChange({ type: "monthly", month: i + 1 });
                        setShowDropdown(false);
                      }}
                      className={`rounded-[12px] px-2 py-3 text-[14px] font-semibold leading-tight transition-all ${
                        value.type === "monthly" && value.month === i + 1
                          ? "bg-[#DC4E59] text-white shadow-sm"
                          : "border border-[#FFF0EA] text-[#4A5568] hover:bg-[#FDF8F6]"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Range picker */}
            {activeType === "range" && (
              <div>
                <p className="mb-2 text-[12px] font-semibold text-[#A0AEC0]">
                  בחר טווח תאריכים
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[12px] font-semibold text-[#A0AEC0]">
                      מתאריך
                    </span>
                    <input
                      type="date"
                      value={rangeDraft.fromDate ?? ""}
                      onChange={(e) => applyRange({ fromDate: e.target.value })}
                      className="w-full rounded-[12px] border border-[#FFF0EA] px-3 py-3 text-[14px] font-medium text-[#2D3748] outline-none transition-colors focus:border-[#DC4E59]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[12px] font-semibold text-[#A0AEC0]">
                      עד תאריך
                    </span>
                    <input
                      type="date"
                      value={rangeDraft.toDate ?? ""}
                      onChange={(e) => applyRange({ toDate: e.target.value })}
                      className="w-full rounded-[12px] border border-[#FFF0EA] px-3 py-3 text-[14px] font-medium text-[#2D3748] outline-none transition-colors focus:border-[#DC4E59]"
                    />
                  </label>
                  <button
                    onClick={commitRange}
                    className="rounded-[12px] bg-[#DC4E59] px-4 py-3 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#c9444f]"
                  >
                    החל טווח
                  </button>
                </div>
              </div>
            )}

            {/* Yearly — just close */}
            {activeType === "yearly" && (
              <div className="rounded-[12px] border border-[#FFF0EA] bg-[#FDF8F6] px-4 py-4 text-center">
                <p className="text-[15px] font-semibold text-[#2D3748]">
                  תצוגה שנתית
                </p>
                <p className="mt-1 text-[13px] text-[#A0AEC0]">
                  הדף מציג ביצועים מצטברים מתחילת השנה
                </p>
              </div>
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

  if (period.type === "range" && period.fromDate && period.toDate) {
    const from = new Date(period.fromDate);
    const to = new Date(period.toDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 1;
    const start = from <= to ? from : to;
    const end = from <= to ? to : from;
    const diffDays =
      Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return Math.max(0.01, Math.min(1, diffDays / 365));
  }

  return 1;
}

function getPeriodPerformanceFactor(period: TimePeriod): number {
  if (period.type === "yearly") return 1;

  let seed = 0;
  if (period.type === "monthly" && period.month) {
    seed = period.month;
  } else if (period.type === "range" && period.fromDate && period.toDate) {
    seed = `${period.fromDate}:${period.toDate}`
      .split("")
      .reduce((sum, ch, index) => sum + ch.charCodeAt(0) * (index + 1), 0);
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
  } else if (period.type === "range" && period.fromDate && period.toDate) {
    seed += `${period.fromDate}:${period.toDate}`
      .split("")
      .reduce(
        (sum, ch, charIndex) => sum + ch.charCodeAt(0) * (charIndex + 3),
        0
      );
  }
  const hash = Math.sin(seed * 7919 + 104729) * 0.5 + 0.5;
  return 0.92 + hash * 0.16;
}
