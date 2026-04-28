import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrencyShort } from "@/lib/format";
import type { ChainPromotion } from "@/data/mock-chain-promotions";

const DAYS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

interface PromotionDailyChartProps {
  promotion: ChainPromotion;
}

// ─── Custom Tooltip ──────────────────────────────────────────────
interface TooltipEntry {
  day: string;
  actual: number;
  baseline: number;
  uplift: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TooltipEntry }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div
      className="bg-white border border-[#FFE8DE] rounded-[10px] px-4 py-3 shadow-sm"
      dir="rtl"
      style={{ minWidth: 160 }}
    >
      {/* Thin top accent bar */}
      <div
        className="h-0.5 w-full rounded-full bg-[#DC4E59] mb-3 -mx-4 px-4"
        style={{
          width: "calc(100% + 2rem)",
          marginLeft: "-1rem",
          marginRight: "-1rem",
        }}
      />
      <p className="text-[15px] font-medium text-[#788390] mb-2 tracking-[0.05em]">
        {label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[16px] text-[#4A5568]">
            <span className="w-2 h-2 rounded-full bg-[#DC4E59] shrink-0" />
            מכירות בפועל
          </span>
          <span
            className="font-mono text-[18px] font-semibold text-[#2D3748]"
            dir="ltr"
          >
            {formatCurrencyShort(d.actual)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[16px] text-[#4A5568]">
            <span className="w-2 h-2 rounded-full bg-[#788390] shrink-0" />
            בסיס
          </span>
          <span className="font-mono text-[18px] text-[#788390]" dir="ltr">
            {formatCurrencyShort(d.baseline)}
          </span>
        </div>
        {d.uplift > 0 && (
          <div className="pt-1.5 mt-1.5 border-t border-[#FFF0EA] flex items-center justify-between gap-4">
            <span className="text-[15px] text-[#788390]">עלייה</span>
            <span
              className="font-mono text-[18px] font-semibold text-[#10B981]"
              dir="ltr"
            >
              +{formatCurrencyShort(d.uplift)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pulsing peak dot ────────────────────────────────────────────
function PeakDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <motion.circle
        cx={cx}
        cy={cy}
        r={7}
        fill="#DC4E59"
        opacity={0.18}
        animate={{ r: [7, 14, 7], opacity: [0.18, 0, 0.18] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx={cx} cy={cy} r={4} fill="#DC4E59" />
      <circle cx={cx} cy={cy} r={2} fill="white" />
    </g>
  );
}

export function PromotionDailyChart({ promotion }: PromotionDailyChartProps) {
  const data = useMemo(() => {
    return DAYS_HE.map((day, i) => ({
      day,
      actual: promotion.dailySales[i],
      baseline: promotion.dailyBaseline[i],
      uplift: Math.max(0, promotion.dailySales[i] - promotion.dailyBaseline[i]),
    }));
  }, [promotion]);

  // Find the day with max uplift for the peak dot
  const peakDay = useMemo(() => {
    let maxUplift = -Infinity;
    let maxDay = data[0]?.day ?? "";
    for (const d of data) {
      if (d.uplift > maxUplift) {
        maxUplift = d.uplift;
        maxDay = d.day;
      }
    }
    return maxDay;
  }, [data]);

  const peakEntry = data.find((d) => d.day === peakDay);

  return (
    <motion.div
      key={promotion.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="bg-white border border-[#FFE8DE] rounded-[16px] p-5 h-full flex flex-col"
    >
      {/* Chart header — compact, not a screaming H1 */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-[10px] overflow-hidden border border-[#FFE8DE] shrink-0 bg-[#FDF8F6]">
          <img
            src={promotion.imageUrl}
            alt={promotion.productName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] uppercase tracking-[0.08em] text-[#788390] font-medium leading-none mb-1">
            {promotion.promoType}
            <span className="mx-2 text-[#FFE8DE]">·</span>
            <span dir="ltr" className="font-mono">
              {promotion.daysRemaining} ימים נותרו
            </span>
          </p>
          <h3 className="text-[20px] font-semibold text-[#2D3748] truncate leading-snug">
            {promotion.name}
          </h3>
          <p className="text-[16px] text-[#788390] truncate mt-0.5">
            {promotion.productName}
          </p>
        </div>
      </div>

      {/* Section divider */}
      <div className="h-px bg-[#FFF0EA] mb-4" />

      {/* Chart — must be in dir="ltr" per CLAUDE.md */}
      <AnimatePresence mode="wait">
        <motion.div
          key={promotion.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          <div dir="ltr" className="h-[280px] md:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
              >
                {/* Horizontal gridlines only — NO vertical */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#FFF0EA"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{
                    fontSize: 16,
                    fill: "#788390",
                    fontFamily: "Rubik, sans-serif",
                  }}
                  tickLine={false}
                  axisLine={{ stroke: "#FFE8DE" }}
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                  tick={{
                    fontSize: 16,
                    fill: "#788390",
                    fontFamily: "Rubik, sans-serif",
                  }}
                  tickLine={false}
                  axisLine={{ stroke: "#FFE8DE" }}
                  width={42}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "#FFE8DE", strokeWidth: 1 }}
                />

                {/* Uplift area — two stacked Areas: invisible baseline as base, uplift shaded on top */}
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stackId="uplift-stack"
                  stroke="none"
                  fill="transparent"
                  fillOpacity={0}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="uplift"
                  stackId="uplift-stack"
                  stroke="none"
                  fill="rgba(220,78,89,0.16)"
                  fillOpacity={1}
                  animationDuration={900}
                  isAnimationActive
                />

                {/* Baseline dashed line */}
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#788390"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  dot={false}
                  animationDuration={900}
                />

                {/* Actual sales line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#DC4E59"
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={900}
                />

                {/* Peak dot — pulsing reference point */}
                {peakEntry && (
                  <ReferenceDot
                    x={peakEntry.day}
                    y={peakEntry.actual}
                    shape={(props) => (
                      <PeakDot
                        cx={props.cx as number}
                        cy={props.cy as number}
                      />
                    )}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Custom legend — compact inline, no Recharts default */}
      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[#FFF0EA]">
        <span className="flex items-center gap-2 text-[16px] text-[#4A5568]">
          <span className="w-5 h-[2.5px] rounded-full bg-[#DC4E59] shrink-0" />
          <span>מכירות בפועל</span>
          <span
            className="font-mono text-[#2D3748] font-semibold ms-1"
            dir="ltr"
          >
            {formatCurrencyShort(promotion.sales)}
          </span>
        </span>
        <span className="flex items-center gap-2 text-[16px] text-[#4A5568]">
          {/* Dashed baseline swatch */}
          <svg width="20" height="3" className="shrink-0">
            <line
              x1="0"
              y1="1.5"
              x2="20"
              y2="1.5"
              stroke="#788390"
              strokeWidth="2"
              strokeDasharray="5 2"
            />
          </svg>
          <span>בסיס</span>
        </span>
      </div>
    </motion.div>
  );
}
