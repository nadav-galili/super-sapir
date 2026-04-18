import { motion } from "motion/react";
import { Target } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { formatCurrencyShort } from "@/lib/format";
import { KPI_STATUS } from "@/lib/colors";
import {
  getSalesColor,
  getMarginColor,
  getSupplyColor,
  getQualityColor,
} from "@/lib/kpi/resolvers";

// ─── Public types (API unchanged) ────────────────────────────────

interface GaugeKPI {
  label: string;
  value: number;
  target: number;
  format: "currency" | "percent";
}

interface KPIGaugeRowProps {
  items: GaugeKPI[];
}

// ─── Per-label resolver map ───────────────────────────────────────
// Selects the semantically correct color resolver for each KPI so we
// never hardcode thresholds or pass direction flags at the call site.

function resolveKpiColor(item: GaugeKPI): string {
  const { label, value, target } = item;
  if (label === "רווח גולמי") {
    return getMarginColor({ marginPercent: value });
  }
  if (label === "זמינות מדף") {
    return getSupplyColor({ ratePercent: value });
  }
  if (label === "ציון איכות") {
    return getQualityColor({ score: value, maxScore: target });
  }
  // סל ממוצע ללקוח + מכירות מבצעים → sales/target ratio resolver
  return getSalesColor({ actual: value, target });
}

// ─── Gauge SVG ────────────────────────────────────────────────────

interface DarkGaugeProps {
  actual: number;
  target: number;
  size: number;
  strokeWidth: number;
  color: string;
  index: number;
}

function DarkGauge({
  actual,
  target,
  size,
  strokeWidth,
  color,
  index,
}: DarkGaugeProps) {
  const ratio = target > 0 ? actual / target : 1;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - Math.min(ratio, 1) * circumference;
  const pct = Math.round(ratio * 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Subtle ambient glow — transform-only, no neon outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`,
          filter: "blur(6px)",
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{
          duration: 2.8 + index * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <svg
        className="w-full h-full -rotate-90 relative z-10"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 18,
            delay: 0.2 + index * 0.07,
          }}
        />
      </svg>

      {/* Centered pct label */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span
          className="font-bold font-mono text-white leading-none"
          style={{ fontSize: size >= 100 ? 22 : 17 }}
          dir="ltr"
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── Individual KPI cell ──────────────────────────────────────────

interface GaugeCellProps {
  item: GaugeKPI;
  index: number;
  /** primary = larger, supporting = smaller */
  size: "primary" | "supporting";
}

function GaugeCell({ item, index, size }: GaugeCellProps) {
  const gaugeSize = size === "primary" ? 108 : 80;
  const strokeWidth = size === "primary" ? 9 : 7;
  const color = resolveKpiColor(item);
  const animated = useAnimatedCounter(item.value, 1400, 100 + index * 90);

  const formattedValue =
    item.format === "currency"
      ? formatCurrencyShort(animated)
      : `${typeof animated === "number" ? animated.toFixed(item.value % 1 !== 0 ? 1 : 0) : animated}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.1 + index * 0.08,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className="flex flex-col items-center gap-3"
    >
      <DarkGauge
        actual={item.value}
        target={item.target}
        size={gaugeSize}
        strokeWidth={strokeWidth}
        color={color}
        index={index}
      />

      <div className="text-center space-y-0.5">
        <p
          className="font-bold font-mono tabular-nums leading-none"
          style={{
            color,
            fontSize: size === "primary" ? 22 : 18,
          }}
          dir="ltr"
        >
          {formattedValue}
        </p>
        <p
          className="text-white/50 leading-tight"
          style={{ fontSize: size === "primary" ? 16 : 15 }}
        >
          {item.label}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main export (API unchanged) ─────────────────────────────────

export function KPIGaugeRow({ items }: KPIGaugeRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, type: "spring", stiffness: 100, damping: 20 }}
      className="rounded-[16px] overflow-hidden border border-white/5"
      style={{
        background:
          "linear-gradient(160deg, #1a1a2e 0%, #16213e 55%, #1a1a2e 100%)",
      }}
    >
      {/* Internal header — absorbs the removed route-level paragraph */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[8px] flex items-center justify-center"
            style={{ background: "rgba(220,78,89,0.18)" }}
          >
            <Target className="w-4 h-4 text-[#DC4E59]" />
          </div>
          <span className="text-[18px] font-semibold text-white/80 leading-none">
            כל המדדים מוצגים ביחס ליעד
          </span>
        </div>

        {/* Traffic-light legend — compact, right-aligned */}
        <div className="hidden sm:flex items-center gap-4 text-[15px] text-white/40">
          <span className="flex items-center gap-1.5">
            <motion.span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: KPI_STATUS.good }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            95%+
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: KPI_STATUS.warning }}
            />
            85–95%
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: KPI_STATUS.bad }}
            />
            &lt;85%
          </span>
        </div>
      </div>

      {/* Gauge strip:
          - First item rendered at "primary" size (slightly larger).
          - Remaining items at "supporting" size.
          - Dividers between items via divide-x.
          - Horizontal scroll on small viewports. */}
      <div
        className="flex items-end divide-x divide-white/[0.07] overflow-x-auto py-6 px-2"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            className="flex-1 min-w-[110px] flex justify-center px-2"
          >
            <GaugeCell
              item={item}
              index={i}
              size={i === 0 ? "primary" : "supporting"}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
