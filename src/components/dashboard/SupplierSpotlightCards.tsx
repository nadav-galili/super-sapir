import { useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Award } from "lucide-react";
import { formatCurrencyShort } from "@/lib/format";
import { usePeriodMultiplier } from "@/contexts/PeriodContext";
import { SupplierLogo } from "@/components/dashboard/SupplierLogo";
import { getSalesColor, getMarginColor } from "@/lib/kpi/resolvers";
import {
  getMostProfitableSupplier,
  getAtRiskSupplier,
  getFastestGrowingSupplier,
  type ChainSupplier,
} from "@/data/mock-suppliers";

// ─── Mini sparkline bar (purely visual, ratio-based) ────────────────────────
function MiniSparkline({ actual, target }: { actual: number; target: number }) {
  const ratio = target > 0 ? Math.min(actual / target, 1.1) : 1;
  const pct = Math.round(ratio * 100);
  const color = getSalesColor({ actual, target });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[#788390] uppercase tracking-[0.08em]"
          style={{ fontSize: 15 }}
        >
          עמידה ביעד
        </span>
        <span
          className="font-mono font-semibold"
          style={{ fontSize: 18, color }}
          dir="ltr"
        >
          {pct}%
        </span>
      </div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 5, background: "#FFF0EA" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.3,
          }}
        />
      </div>
    </div>
  );
}

// ─── Hero supplier card (top) ────────────────────────────────────────────────
interface HeroSupplierCardProps {
  supplier: ChainSupplier;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  metricLabel: string;
  metricValue: string;
  metricColor: string;
  m: number;
}

function HeroSupplierCard({
  supplier,
  title,
  icon,
  accentColor,
  metricLabel,
  metricValue,
  metricColor,
  m,
}: HeroSupplierCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 20 }}
      className="relative overflow-hidden rounded-[16px] bg-white border border-[#FFE8DE]"
      style={{
        boxShadow: "0 10px 30px -15px rgba(220,78,89,0.15)",
      }}
    >
      {/* 3px accent top-bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
        }}
      />

      <div className="p-5">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-[10px]"
            style={{ background: `${accentColor}18` }}
          >
            {icon}
          </span>
          <span
            className="font-medium text-[#788390] uppercase tracking-[0.08em]"
            style={{ fontSize: 15 }}
          >
            {title}
          </span>
        </div>

        {/* Supplier identity — logo + name side by side */}
        <div className="flex items-center gap-3 mb-3">
          {/* Logo: 56×56, perpetual slow glow via motion */}
          <div className="relative shrink-0">
            <motion.div
              className="absolute -inset-2 rounded-[16px] pointer-events-none"
              style={{ background: `${accentColor}22` }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="relative rounded-[12px] overflow-hidden border border-[#FFE8DE] bg-white"
              style={{ width: 56, height: 56 }}
            >
              <SupplierLogo name={supplier.name} size={56} />
            </div>
          </div>

          {/* Name + headline metric stack */}
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-[#2D3748] leading-tight truncate"
              style={{ fontSize: 22 }}
            >
              {supplier.name}
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className="font-mono font-bold"
                style={{ fontSize: 28, color: metricColor }}
                dir="ltr"
              >
                {metricValue}
              </span>
              <span className="text-[#788390]" style={{ fontSize: 15 }}>
                {metricLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Sales sub-stat */}
        <div className="pt-3 border-t border-[#FFF0EA]">
          <div className="flex items-center justify-between">
            <span className="text-[#788390]" style={{ fontSize: 16 }}>
              מכירות
            </span>
            <span
              className="font-mono font-semibold text-[#2D3748]"
              style={{ fontSize: 18 }}
              dir="ltr"
            >
              {formatCurrencyShort(supplier.sales * m)}
            </span>
          </div>
        </div>

        {/* Mini sparkline at bottom */}
        <MiniSparkline actual={supplier.sales} target={supplier.targetSales} />
      </div>
    </motion.div>
  );
}

// ─── Supporting capsule row (divided, no per-supplier box) ───────────────────
interface CapsuleRowProps {
  supplier: ChainSupplier;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  metricLabel: string;
  metricValue: string;
  metricColor: string;
  delay: number;
}

function CapsuleRow({
  supplier,
  title,
  icon,
  accentColor,
  metricLabel,
  metricValue,
  metricColor,
  delay,
}: CapsuleRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", stiffness: 100, damping: 20 }}
      className="py-4 flex items-center gap-3"
    >
      {/* Logo: 32×32 */}
      <div
        className="shrink-0 rounded-[10px] overflow-hidden border border-[#FFE8DE] bg-white"
        style={{ width: 32, height: 32 }}
      >
        <SupplierLogo name={supplier.name} size={32} />
      </div>

      {/* Title + supplier name */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[#788390] uppercase tracking-[0.08em] leading-none"
          style={{ fontSize: 15 }}
        >
          {title}
        </p>
        <p
          className="font-medium text-[#2D3748] mt-0.5 truncate"
          style={{ fontSize: 18 }}
        >
          {supplier.name}
        </p>
      </div>

      {/* Accent icon + headline metric */}
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-[8px]"
          style={{ background: `${accentColor}18` }}
        >
          {icon}
        </span>
        <span
          className="font-mono font-semibold"
          style={{ fontSize: 18, color: metricColor }}
          dir="ltr"
        >
          {metricValue}
          <span
            className="text-[#788390] font-normal ms-0.5"
            style={{ fontSize: 15 }}
          >
            {metricLabel}
          </span>
        </span>
      </div>
    </motion.div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function SupplierSpotlightCards() {
  const m = usePeriodMultiplier();
  const profitable = useMemo(() => getMostProfitableSupplier(), []);
  const atRisk = useMemo(() => getAtRiskSupplier(), []);
  const growing = useMemo(() => getFastestGrowingSupplier(), []);

  const atRiskPct =
    atRisk.targetSales > 0 ? (atRisk.sales / atRisk.targetSales) * 100 : 100;
  const growingPct =
    growing.targetSales > 0 ? (growing.sales / growing.targetSales) * 100 : 100;

  const profitMarginColor = getMarginColor({
    marginPercent: profitable.grossProfitPercent,
  });
  const atRiskSalesColor = getSalesColor({
    actual: atRisk.sales,
    target: atRisk.targetSales,
  });
  const growingSalesColor = getSalesColor({
    actual: growing.sales,
    target: growing.targetSales,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
      className="flex flex-col gap-0"
    >
      {/* Hero card — most profitable supplier (largest, asymmetric weight) */}
      <HeroSupplierCard
        supplier={profitable}
        title="ספק מוביל ברווחיות"
        icon={<Award className="w-3.5 h-3.5" style={{ color: "#6C5CE7" }} />}
        accentColor="#6C5CE7"
        metricLabel="רווח גולמי"
        metricValue={`${profitable.grossProfitPercent}%`}
        metricColor={profitMarginColor}
        m={m}
      />

      {/* Divider + supporting capsule rows — no individual boxes */}
      <div className="divide-y divide-[#FFF0EA]">
        <CapsuleRow
          supplier={atRisk}
          title="ספק בסיכון"
          icon={
            <TrendingDown className="w-3 h-3" style={{ color: "#DC4E59" }} />
          }
          accentColor="#DC4E59"
          metricLabel="%"
          metricValue={atRiskPct.toFixed(1)}
          metricColor={atRiskSalesColor}
          delay={0.22}
        />
        <CapsuleRow
          supplier={growing}
          title="ספק צומח"
          icon={<TrendingUp className="w-3 h-3" style={{ color: "#2EC4D5" }} />}
          accentColor="#2EC4D5"
          metricLabel="%"
          metricValue={growingPct.toFixed(1)}
          metricColor={growingSalesColor}
          delay={0.28}
        />
      </div>
    </motion.div>
  );
}
