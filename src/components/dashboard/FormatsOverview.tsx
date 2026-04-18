import { useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getSalesColor } from "@/lib/kpi/resolvers";
import { formatCurrencyShort } from "@/lib/format";
import {
  getPeriodJitter,
  getPeriodMultiplier,
  type TimePeriod,
} from "@/components/dashboard/TimePeriodFilter";
import type { Branch } from "@/data/types";
import { allBranches } from "@/data/mock-branches";

interface FormatKPI {
  label: string;
  value: number;
  target: number;
  yoyDelta: number;
  format: "currency" | "percent";
}

function computeFormatKPIs(
  branches: Branch[],
  period: TimePeriod,
  seedOffset: number
): FormatKPI[] {
  const count = branches.length;
  if (count === 0) return [];

  const multiplier = getPeriodMultiplier(period);
  const j = (i: number) => getPeriodJitter(period, i + seedOffset);

  const totalSales =
    branches.reduce((s, b) => s + b.metrics.totalSales, 0) * multiplier;
  const totalTarget =
    branches.reduce((s, b) => {
      return s + b.departments.reduce((ds, d) => ds + d.targetSales, 0);
    }, 0) * multiplier;

  const avgGrossMargin =
    (branches.reduce((s, b) => {
      const branchMargin =
        b.departments.reduce(
          (ds, d) => ds + d.grossMarginPercent * d.sales,
          0
        ) / b.departments.reduce((ds, d) => ds + d.sales, 0);
      return s + branchMargin;
    }, 0) /
      count) *
    j(1);

  const avgStockoutRate =
    (branches.reduce((s, b) => {
      const branchStockout =
        b.departments.reduce((ds, d) => ds + d.stockoutRate, 0) /
        b.departments.length;
      return s + branchStockout;
    }, 0) /
      count) *
    j(2);

  const avgQuality =
    (branches.reduce((s, b) => s + b.metrics.qualityScore, 0) / count) * j(3);
  const avgSupplyRate =
    (branches.reduce((s, b) => s + b.metrics.supplyRate, 0) / count) * j(4);

  const avgYoy =
    (branches.reduce((s, b) => s + b.metrics.yoyGrowth, 0) / count) * j(0);

  return [
    {
      label: "מכירות",
      value: totalSales,
      target: totalTarget,
      yoyDelta: avgYoy,
      format: "currency",
    },
    {
      label: "רווח גולמי",
      value: avgGrossMargin,
      target: 30,
      yoyDelta: avgYoy * 0.4 + 1.2,
      format: "percent",
    },
    {
      label: "חוסרים",
      value: 100 - avgStockoutRate,
      target: 98,
      yoyDelta: 1.5 - avgStockoutRate * 0.2,
      format: "percent",
    },
    {
      label: "ציון תפעול",
      value: avgQuality,
      target: 100,
      yoyDelta: avgYoy * 0.3 + 2.0,
      format: "percent",
    },
    {
      label: "שביעות רצון",
      value: avgSupplyRate,
      target: 98,
      yoyDelta: avgYoy * 0.2 + 0.8,
      format: "percent",
    },
  ];
}

function KPIProgressBar({ kpi, index }: { kpi: FormatKPI; index: number }) {
  const ratio = kpi.target > 0 ? kpi.value / kpi.target : 1;
  const color = getSalesColor({ actual: kpi.value, target: kpi.target });
  const pct = Math.min(ratio * 100, 100);
  const isPositive = kpi.yoyDelta >= 0;

  const displayValue =
    kpi.format === "currency"
      ? formatCurrencyShort(kpi.value)
      : `${kpi.value.toFixed(2)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-[16px] text-[#4A5568] font-medium">
          {kpi.label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold font-mono text-[#2D3748]"
            dir="ltr"
          >
            {displayValue}
          </span>
          <span
            className="inline-flex items-center gap-0.5 text-[15px] font-medium font-mono"
            style={{ color: isPositive ? "#10B981" : "#F43F5E" }}
            dir="ltr"
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {isPositive ? "+" : ""}
            {kpi.yoyDelta.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-[5px] bg-[#FDF8F6] overflow-hidden">
        <motion.div
          className="h-full rounded-[5px]"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 1,
            delay: 0.2 + index * 0.08,
            ease: "easeOut",
          }}
        />
      </div>
    </motion.div>
  );
}

function FormatCard({
  title,
  branchCount,
  kpis,
  delay,
}: {
  title: string;
  branchCount: number;
  kpis: FormatKPI[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex-1 bg-white rounded-[16px] border border-[#FFE8DE] p-6 hover:shadow-[0_4px_20px_rgba(220,78,89,0.08)] transition-shadow"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-2xl font-bold text-[#2D3748]">{title}</h3>
        <span className="text-[16px] text-[#A0AEC0] font-medium">
          {branchCount} סניפים
        </span>
      </div>
      <div className="space-y-4">
        {kpis.map((kpi, i) => (
          <KPIProgressBar key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

export function FormatsOverview({ period }: { period: TimePeriod }) {
  const { bigBranches, cityBranches } = useMemo(
    () => ({
      bigBranches: allBranches.filter((b) => b.format === "big"),
      cityBranches: allBranches.filter((b) => b.format === "city"),
    }),
    []
  );

  const bigKpis = useMemo(
    () => computeFormatKPIs(bigBranches, period, 0),
    [bigBranches, period]
  );
  const cityKpis = useMemo(
    () => computeFormatKPIs(cityBranches, period, 10),
    [cityBranches, period]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormatCard
        title="חנויות גדולות"
        branchCount={bigBranches.length}
        kpis={bigKpis}
        delay={0.1}
      />
      <FormatCard
        title="חנויות עיר"
        branchCount={cityBranches.length}
        kpis={cityKpis}
        delay={0.2}
      />
    </div>
  );
}
