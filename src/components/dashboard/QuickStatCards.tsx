import { useMemo } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Users, PackageCheck, AlertTriangle } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { usePeriodMultiplier } from "@/contexts/PeriodContext";
import { allBranches } from "@/data/mock-branches";

// ─── Types ────────────────────────────────────────────────────────

interface QuickStat {
  label: string;
  value: number;
  suffix: string;
  icon: typeof Users;
  /** hero = large primary stat; supporting = compact */
  role: "hero" | "supporting";
}

// ─── Hero stat block ──────────────────────────────────────────────

function HeroStatBlock({ stat, delay }: { stat: QuickStat; delay: number }) {
  const Icon = stat.icon;
  const animated = useAnimatedCounter(stat.value, 1400, delay * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100, damping: 20 }}
      className="flex flex-col justify-between py-6 ps-6 pe-8 md:pe-10"
    >
      {/* Icon pill */}
      <div
        className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg, #DC4E591A, #DC4E5929)" }}
      >
        <Icon className="w-5 h-5 text-[#DC4E59]" />
      </div>

      {/* Value */}
      <div>
        <p
          className="text-[15px] font-medium text-[#A0AEC0] uppercase tracking-[0.07em] mb-2"
          style={{ letterSpacing: "0.07em" }}
        >
          {stat.label}
        </p>
        <div className="flex items-baseline gap-1.5 leading-none" dir="ltr">
          <span className="text-4xl font-bold font-mono text-[#2D3748] tracking-tight">
            {String(animated)}
          </span>
          <span className="text-[18px] text-[#A0AEC0] font-normal">
            {stat.suffix}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Supporting stat block (compact, divider-separated) ───────────

function SupportingStatBlock({
  stat,
  delay,
}: {
  stat: QuickStat;
  delay: number;
}) {
  const Icon = stat.icon;
  const animated = useAnimatedCounter(stat.value, 1300, delay * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100, damping: 20 }}
      className="flex items-center gap-4 py-5 px-6 md:py-0 md:px-8"
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
        style={{ background: "rgba(220,78,89,0.08)" }}
      >
        <Icon className="w-4 h-4 text-[#DC4E59]" />
      </div>

      <div className="min-w-0">
        <p className="text-[15px] text-[#A0AEC0] leading-none mb-1.5">
          {stat.label}
        </p>
        <div className="flex items-baseline gap-1" dir="ltr">
          <span className="text-2xl font-bold font-mono text-[#2D3748] tracking-tight leading-none">
            {String(animated)}
          </span>
          <span className="text-[16px] text-[#A0AEC0]">{stat.suffix}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main export ─────────────────────────────────────────────────

export function QuickStatCards() {
  const m = usePeriodMultiplier();

  const stats = useMemo<QuickStat[]>(() => {
    const totalCustomers = Math.round(
      allBranches.reduce((sum, b) => sum + b.metrics.customersPerDay, 0) * m
    );
    const avgBasket = Math.round(
      (allBranches.reduce((sum, b) => sum + b.metrics.avgBasket, 0) /
        allBranches.length) *
        m
    );
    const avgSupply = +(
      allBranches.reduce((sum, b) => sum + b.metrics.supplyRate, 0) /
      allBranches.length
    ).toFixed(1);
    const totalComplaints = Math.round(
      allBranches.reduce((sum, b) => sum + b.metrics.complaints, 0) * m
    );

    return [
      {
        label: "לקוחות יומי",
        value: totalCustomers,
        suffix: "לקוחות",
        icon: Users,
        role: "hero" as const,
      },
      {
        label: "סל ממוצע",
        value: avgBasket,
        suffix: "₪",
        icon: ShoppingCart,
        role: "supporting" as const,
      },
      {
        label: "זמינות מדף",
        value: avgSupply,
        suffix: "%",
        icon: PackageCheck,
        role: "supporting" as const,
      },
      {
        label: "תלונות פתוחות",
        value: totalComplaints,
        suffix: "תלונות",
        icon: AlertTriangle,
        role: "supporting" as const,
      },
    ];
  }, [m]);

  const [hero, ...supporting] = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, type: "spring", stiffness: 100, damping: 20 }}
      className="rounded-[16px] bg-white border border-[#FFE8DE] overflow-hidden"
    >
      {/* Subtle top accent line — single accent, no rainbow */}
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #DC4E59 40%, transparent 100%)",
          opacity: 0.35,
        }}
      />

      {/*
        Bento layout:
        - Mobile:  stacked full-width rows, dividers horizontal
        - Desktop: hero stat (wider left col) | 3 supporting stats (divided right col)
      */}
      <div className="grid grid-cols-1 md:grid-cols-[clamp(220px,30%,280px)_minmax(0,1fr)]">
        {/* Hero stat — large number, more vertical breathing room */}
        <div className="border-b md:border-b-0 md:border-e border-[#FFF0EA]">
          <HeroStatBlock stat={hero} delay={0.1} />
        </div>

        {/* Supporting stats — divided horizontal rail (vertical dividers) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#FFF0EA]">
          {supporting.map((stat, i) => (
            <SupportingStatBlock
              key={stat.label}
              stat={stat}
              delay={0.18 + i * 0.08}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
