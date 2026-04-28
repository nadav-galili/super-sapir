import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import {
  formatCurrencyShort,
  formatNumber,
  formatPercent,
  formatCompact,
} from "@/lib/format";
import {
  getCostColor,
  getCostDeltaColor,
  getGrowthColor,
  getSalesColor,
} from "@/lib/kpi/resolvers";
import type { KPICardData } from "@/data/types";

interface KPICardProps extends KPICardData {
  delay?: number;
}

function formatValue(value: number, format: KPICardData["format"]): string {
  switch (format) {
    case "currency":
      return `₪ ${formatNumber(value)}`;
    case "currencyShort":
      return formatCurrencyShort(value);
    case "percent":
      return formatPercent(value);
    case "compact":
      return formatCompact(value);
    case "number":
      return formatNumber(value);
  }
}

export function KPICard({
  label,
  value,
  format,
  trend,
  trendLabel,
  target,
  domain = "sales",
  delay = 0,
}: KPICardProps) {
  const animatedValue = useAnimatedCounter(value, 1500, delay);
  const isPositive = trend >= 0;

  const trendColor =
    domain === "cost"
      ? getCostDeltaColor({ changePercent: trend })
      : getGrowthColor({ changePercent: trend });

  const bigNumberColor =
    target != null
      ? domain === "cost"
        ? getCostColor({ actual: value, target })
        : getSalesColor({ actual: value, target })
      : trendColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: delay / 1000,
        type: "spring",
        stiffness: 300,
        damping: 24,
      }}
      whileHover={{ y: -2, boxShadow: "rgba(220, 78, 89, 0.08) 0px 8px 24px" }}
      className="relative overflow-hidden rounded-[16px] bg-white border border-warm-border cursor-default"
    >
      <div className="p-3 sm:p-4 text-center">
        <p className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-1 truncate">
          {label}
        </p>
        <p
          className="text-[26px] sm:text-[31px] font-bold font-mono tabular-nums"
          style={{ color: bigNumberColor }}
          dir="ltr"
        >
          {formatValue(animatedValue, format)}
        </p>
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
          <span
            className="inline-flex items-center gap-0.5 sm:gap-1 text-[15px] sm:text-base font-semibold px-1.5 sm:px-2 py-0.5 rounded-[20px]"
            style={{
              color: trendColor,
              backgroundColor: `${trendColor}18`,
            }}
            dir="ltr"
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isPositive ? "+" : ""}
            {trend}%
          </span>
          <span className="text-[15px] sm:text-[16px] text-warm-muted truncate">
            {trendLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
