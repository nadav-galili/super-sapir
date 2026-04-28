import { useMemo } from "react";
import { motion } from "motion/react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { formatCurrencyShort } from "@/lib/format";
import { getGrowthColor } from "@/lib/kpi/resolvers";
import type { CategorySnapshot } from "@/lib/category-manager";

interface CategoryDonutProps {
  snapshots: CategorySnapshot[];
}

// Single-accent palette: primary red slice, then desaturated neutrals.
// Avoids the "rainbow donut" anti-pattern.
const DONUT_PALETTE = [
  "#DC4E59", // primary — largest slice, accent red
  "#788390", // muted grey — second
  "#C4CDD7", // lighter grey — third
  "#D6DDE4", // near-white grey — fourth
  "#E8EDF2", // faintest — "others"
];

export function CategoryDonut({ snapshots }: CategoryDonutProps) {
  const {
    slices,
    segments,
    totalYoy,
    totalSales,
    size,
    strokeWidth,
    r,
    circumference,
  } = useMemo(() => {
    const sorted = [...snapshots].sort(
      (a, b) => b.category.sales - a.category.sales
    );
    const total = sorted.reduce((sum, s) => sum + s.category.sales, 0);
    const top4 = sorted.slice(0, 4);
    const otherSales = sorted
      .slice(4)
      .reduce((sum, s) => sum + s.category.sales, 0);

    const items = [
      ...top4.map((s, i) => ({
        label: s.category.name,
        value: s.category.sales,
        pct: total > 0 ? (s.category.sales / total) * 100 : 0,
        color: DONUT_PALETTE[i] ?? DONUT_PALETTE[4],
      })),
      ...(otherSales > 0
        ? [
            {
              label: "אחרים",
              value: otherSales,
              pct: total > 0 ? (otherSales / total) * 100 : 0,
              color: DONUT_PALETTE[4],
            },
          ]
        : []),
    ];

    const avgYoy =
      sorted.length > 0
        ? sorted.reduce((sum, s) => sum + s.category.yoyChange, 0) /
          sorted.length
        : 0;

    const donutSize = 148;
    const donutStroke = 20;
    const donutR = (donutSize - donutStroke) / 2;
    const circ = 2 * Math.PI * donutR;

    let segOffset = 0;
    const segs = items.map((slice) => {
      const length = (slice.pct / 100) * circ;
      const gap = 3;
      const seg = {
        ...slice,
        dashOffset: segOffset,
        dashLength: Math.max(length - gap, 1),
      };
      segOffset += length;
      return seg;
    });

    return {
      slices: items,
      segments: segs,
      totalYoy: +avgYoy.toFixed(1),
      totalSales: total,
      size: donutSize,
      strokeWidth: donutStroke,
      r: donutR,
      circumference: circ,
    };
  }, [snapshots]);

  const animatedYoy = useAnimatedCounter(Math.abs(totalYoy), 1200, 400);
  const animatedTotal = useAnimatedCounter(totalSales, 1400, 200);
  const yoyPositive = totalYoy >= 0;
  const yoyColor = getGrowthColor({ changePercent: totalYoy });

  return (
    // No wrapping Card box — breathes on the page surface per anti-card-overuse directive
    <div className="bg-white border border-[#FFE8DE] rounded-[16px] p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-[3px] h-5 rounded-full bg-[#DC4E59] shrink-0" />
        <h3 className="text-[20px] font-semibold text-[#2D3748]">
          חלוקת מכירות
        </h3>
      </div>

      {/* Chart must be wrapped in dir="ltr" per Recharts convention (SVG-based, same rule applies) */}
      <div dir="ltr">
        <div className="flex items-center gap-5">
          {/* Donut SVG */}
          <div
            className="relative shrink-0"
            style={{ width: size, height: size }}
          >
            <svg
              className="w-full h-full -rotate-90"
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#F5E6DE"
                strokeWidth={strokeWidth}
              />
              {/* Segments — staggered fade-in */}
              {segments.map((seg, i) => (
                <motion.circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="butt"
                  strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
                  strokeDashoffset={-seg.dashOffset}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: 0.2 + i * 0.07,
                  }}
                />
              ))}
            </svg>

            {/* Center: total sales value + YoY delta */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span
                className="text-[17px] font-bold font-mono text-[#2D3748] leading-none"
                dir="ltr"
              >
                {formatCurrencyShort(animatedTotal)}
              </span>
              <span className="text-[15px] text-[#788390] leading-none">
                סה"כ
              </span>
              <span
                className="text-[15px] font-mono font-semibold leading-none mt-0.5"
                style={{ color: yoyColor }}
                dir="ltr"
              >
                {yoyPositive ? "+" : "-"}
                {animatedYoy.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Custom legend — compact divided list, no extra boxes */}
          <div className="flex-1 divide-y divide-[#FFF0EA]" dir="rtl">
            {slices.map((slice, i) => (
              <motion.div
                key={slice.label}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: 0.3 + i * 0.06,
                }}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-[17px] text-[#4A5568] leading-none">
                    {slice.label}
                  </span>
                </div>
                <span
                  className="text-[17px] font-bold font-mono text-[#2D3748] leading-none"
                  dir="ltr"
                >
                  {slice.pct.toFixed(1)}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
