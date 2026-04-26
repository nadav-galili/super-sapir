import { useState } from "react";
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

// Three-letter Hebrew month abbreviations — used by the inline-mode
// horizontal month scrubber so the whole year fits in one row.
const MONTH_ABBR = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יונ",
  "יול",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
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
  panelPlacement?: "side-start" | "side-end" | "bottom";
  /**
   * `dropdown` (default): renders a button trigger; clicking opens a panel.
   * `inline`: renders type tabs + the active type's picker always visible —
   * no click required, currently-selected period stays highlighted.
   */
  mode?: "dropdown" | "inline";
}

export function TimePeriodFilter({
  value,
  onChange,
  variant = "light",
  panelPlacement = "side-start",
  mode = "dropdown",
}: TimePeriodFilterProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const isDark = variant === "dark";
  const [activeType, setActiveType] = useState<PeriodType>(value.type);
  const [rangeDraft, setRangeDraft] = useState<TimePeriod>(
    value.type === "range" ? value : getDefaultRangePeriod()
  );

  // Sync local draft state from `value` prop without an effect — store the
  // last-seen value and update during render if it changed.
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setActiveType(value.type);
    if (value.type === "range") {
      setRangeDraft(value);
    }
  }

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

  const panelPlacementClass =
    panelPlacement === "bottom"
      ? "sm:top-full sm:mt-3 sm:end-0 sm:w-[360px]"
      : panelPlacement === "side-end"
        ? "sm:top-0 sm:mt-0 sm:start-auto sm:end-[calc(100%+12px)] sm:w-[360px]"
        : "sm:top-0 sm:mt-0 sm:end-auto sm:start-[calc(100%+12px)] sm:w-[360px]";

  // Shared panel body — type tabs + active type's picker. Used by both
  // the dropdown panel (rendered conditionally on click) and the inline
  // mode (rendered always).
  const panelBody = (
    <>
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
    </>
  );

  if (mode === "inline") {
    // Editorial chronograph design — flows on the dark hero surface
    // without an inner card. Hierarchy comes from typography and a
    // sliding accent underline (motion's layoutId) that connects the
    // type tabs and the month scrubber as one continuous mechanism.
    //   - Cyan underline picks WHICH KIND of period (yearly/monthly/range)
    //   - Red underline picks WHICH EXACT month
    // The light variant is supported for non-hero placements but the
    // surface is designed primarily for the dark hero strip.
    const eyebrowColor = isDark ? "text-white/40" : "text-[#A0AEC0]";
    const headingColor = isDark ? "text-white" : "text-[#2D3748]";
    const dividerColor = isDark ? "border-white/[0.06]" : "border-[#F5E6DE]";
    const tabIdleColor = isDark
      ? "text-white/40 hover:text-white/75"
      : "text-[#A0AEC0] hover:text-[#4A5568]";
    const tabActiveColor = isDark ? "text-white" : "text-[#2D3748]";
    const monthIdleColor = isDark
      ? "text-white/35 hover:text-white/75"
      : "text-[#A0AEC0] hover:text-[#4A5568]";
    const monthActiveColor = isDark ? "text-white" : "text-[#2D3748]";
    const dateBorderIdle = isDark ? "border-white/15" : "border-[#FFE8DE]";
    const dateInputColor = isDark ? "text-white" : "text-[#2D3748]";

    return (
      <div dir="rtl" className="space-y-5">
        {/* Editorial header — small eyebrow over a generous display period.
            Re-keying the motion.p on label change replays the entry so
            switching periods feels like a chronograph hand snapping in. */}
        <div>
          <p className={`text-[15px] font-semibold ${eyebrowColor}`}>
            טווח ניתוח
          </p>
          <motion.p
            key={getPeriodLabel(value)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`mt-1 text-3xl font-bold tracking-tight tabular-nums leading-tight ${headingColor}`}
          >
            {getPeriodLabel(value)}
          </motion.p>
        </div>

        {/* Type tabs — text-only, sliding cyan accent underline */}
        <div
          className={`flex items-center gap-1 border-t pt-3 ${dividerColor}`}
        >
          {[
            { type: "yearly" as const, label: "שנה" },
            { type: "monthly" as const, label: "חודש" },
            { type: "range" as const, label: "טווח" },
          ].map((opt) => {
            const isActive = activeType === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => selectType(opt.type)}
                className="relative px-3 py-2"
              >
                <span
                  className={`text-[18px] font-semibold transition-colors ${
                    isActive ? tabActiveColor : tabIdleColor
                  }`}
                >
                  {opt.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="period-type-underline"
                    className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[#2EC4D5]"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active picker — only monthly + range render a sub-row;
            yearly is fully expressed by the heading above. */}
        <AnimatePresence mode="wait" initial={false}>
          {activeType === "monthly" && (
            <motion.div
              key="month-scrubber"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-end justify-between gap-2">
                {MONTH_ABBR.map((abbr, i) => {
                  const isSelected =
                    value.type === "monthly" && value.month === i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        onChange({ type: "monthly", month: i + 1 })
                      }
                      className="relative flex-1 py-2"
                    >
                      <span
                        className={`block text-[16px] font-semibold tabular-nums transition-colors ${
                          isSelected ? monthActiveColor : monthIdleColor
                        }`}
                      >
                        {abbr}
                      </span>
                      {isSelected && (
                        <motion.span
                          layoutId="period-month-underline"
                          className="absolute inset-x-1 -bottom-0.5 h-[2px] rounded-full bg-[#DC4E59]"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeType === "range" && (
            <motion.div
              key="range-picker"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-end gap-4"
            >
              <label className="flex-1 block">
                <span
                  className={`block text-[15px] font-semibold mb-1 ${eyebrowColor}`}
                >
                  מתאריך
                </span>
                <input
                  type="date"
                  value={rangeDraft.fromDate ?? ""}
                  onChange={(e) => applyRange({ fromDate: e.target.value })}
                  style={{ colorScheme: isDark ? "dark" : "light" }}
                  className={`w-full bg-transparent border-0 border-b ${dateBorderIdle} px-0 py-1.5 text-[16px] font-semibold tabular-nums outline-none transition-colors focus:border-[#2EC4D5] ${dateInputColor}`}
                />
              </label>
              <label className="flex-1 block">
                <span
                  className={`block text-[15px] font-semibold mb-1 ${eyebrowColor}`}
                >
                  עד
                </span>
                <input
                  type="date"
                  value={rangeDraft.toDate ?? ""}
                  onChange={(e) => applyRange({ toDate: e.target.value })}
                  style={{ colorScheme: isDark ? "dark" : "light" }}
                  className={`w-full bg-transparent border-0 border-b ${dateBorderIdle} px-0 py-1.5 text-[16px] font-semibold tabular-nums outline-none transition-colors focus:border-[#2EC4D5] ${dateInputColor}`}
                />
              </label>
              <button
                onClick={commitRange}
                className="text-[15px] font-bold text-[#2EC4D5] hover:text-[#5DD8E3] py-1.5 transition-colors whitespace-nowrap"
              >
                החל ←
              </button>
            </motion.div>
          )}

          {activeType === "yearly" && (
            <motion.p
              key="yearly-caption"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-[15px] ${eyebrowColor}`}
            >
              מציג ביצועים מצטברים מתחילת השנה
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
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
            className={`absolute top-full mt-3 end-0 z-[80] w-[min(92vw,340px)] rounded-[16px] border border-[#FFE8DE] bg-white p-4 shadow-[0_20px_40px_-18px_rgba(45,55,72,0.24)] ${panelPlacementClass}`}
          >
            <div className="mb-3">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#A0AEC0]">
                בחירת תקופה
              </p>
              <p className="mt-1 text-[14px] text-[#4A5568]">
                שנה, חודש או טווח תאריכים לעדכון כל המדדים בדף
              </p>
            </div>
            {panelBody}
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

export function getPeriodTargetShare(period: TimePeriod): number {
  return getPeriodBaseShare(period);
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

function getPeriodSeed(period: TimePeriod): number {
  if (period.type === "yearly") return 0;
  if (period.type === "monthly" && period.month) return period.month * 97;
  if (period.type === "range" && period.fromDate && period.toDate) {
    return `${period.fromDate}:${period.toDate}`
      .split("")
      .reduce((sum, ch, index) => sum + ch.charCodeAt(0) * (index + 5), 0);
  }
  return 0;
}

const KPI_STATUS_FACTORS = {
  strong: [1.06, 1.02, 1.04, 1.08, 1.03],
  good: [1.01, 0.99, 1.0, 1.02, 0.98],
  medium: [0.95, 0.94, 0.955, 0.93, 0.9],
  weak: [0.88, 0.87, 0.91, 0.84, 0.8],
};

const MONTHLY_STATUS_PATTERNS = [
  ["good", "strong", "medium", "good", "weak"],
  ["medium", "good", "good", "weak", "strong"],
  ["good", "weak", "strong", "medium", "good"],
  ["strong", "medium", "good", "good", "weak"],
  ["good", "good", "weak", "strong", "medium"],
  ["weak", "strong", "medium", "good", "good"],
  ["good", "medium", "good", "weak", "strong"],
  ["strong", "good", "weak", "medium", "good"],
  ["medium", "good", "strong", "good", "weak"],
  ["good", "weak", "medium", "strong", "good"],
  ["strong", "good", "good", "medium", "weak"],
  ["good", "medium", "weak", "good", "strong"],
] as const;

type KpiStatus = keyof typeof KPI_STATUS_FACTORS;

/**
 * Shapes each selected period into a realistic KPI mix:
 * mostly successful, with one medium KPI and sometimes one weak KPI.
 */
export function getPeriodKpiFactor(period: TimePeriod, index: number): number {
  if (period.type === "yearly")
    return [1.01, 0.99, 1.0, 1.02, 0.97][index] ?? 1;

  const seed = getPeriodSeed(period);
  const pattern =
    period.type === "monthly" && period.month
      ? MONTHLY_STATUS_PATTERNS[period.month - 1]
      : MONTHLY_STATUS_PATTERNS[
          Math.abs(seed) % MONTHLY_STATUS_PATTERNS.length
        ];
  const status = (pattern[index] ?? "good") as KpiStatus;
  const base = KPI_STATUS_FACTORS[status][index] ?? 1;
  const microVariance =
    (Math.sin((seed + index * 43) * 157) * 0.5 + 0.5) * 0.025;

  return +(base + microVariance).toFixed(3);
}
