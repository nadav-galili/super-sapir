import { motion } from "motion/react";
import { Activity, TrendingUp, PiggyBank, Package } from "lucide-react";
import {
  getGrowthColor,
  getPromotionColor,
  getStatusColor,
  getSupplyColor,
} from "@/lib/kpi/resolvers";
import { formatCurrency } from "@/lib/format";
import { statusLabel, type PromoMetrics } from "@/lib/promo-simulator/calc";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { NumberTicker } from "@/components/ui/number-ticker";

interface LiveKPIPanelProps {
  metrics: PromoMetrics;
}

export function LiveKPIPanel({ metrics: m }: LiveKPIPanelProps) {
  const statusColor = getStatusColor({
    status:
      m.status === "worthIt"
        ? "green"
        : m.status === "needsImprovement"
          ? "yellow"
          : "red",
  });
  const profitDelta = m.promoProfit - m.baseProfit;
  const coverageColor = getSupplyColor({ ratePercent: m.stockCoverage });
  const roiColor = getPromotionColor({ roiPercent: m.roi });
  const profitColor = getGrowthColor({
    changePercent: profitDelta >= 0 ? 100 : -100,
  });

  // Debounce raw metric values by ~250ms so rapid slider drags settle to a
  // single ticker animation toward the final value, not a chase of intermediates.
  const roiTarget = useDebouncedValue(m.roi, 250);
  const profitTarget = useDebouncedValue(profitDelta, 250);
  const coverageTarget = useDebouncedValue(m.stockCoverage, 250);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="lg:sticky lg:top-[120px]"
    >
      <div className="rounded-[16px] border border-[#FFE8DE] bg-white shadow-sm overflow-hidden">
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg, #DC4E59, #E8777F)",
          }}
        />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-[10px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #DC4E59, #E8777F)",
              }}
            >
              <Activity className="w-4 h-4 text-white" />
            </span>
            <h3 className="text-xl font-bold text-[#2D3748]">KPI חי</h3>
          </div>

          <div
            className="rounded-[20px] px-4 py-2 text-center text-[16px] font-semibold"
            style={{ background: `${statusColor}1A`, color: statusColor }}
          >
            {statusLabel(m.status)}
          </div>

          <div className="space-y-3">
            <Row
              icon={<TrendingUp className="w-4 h-4" />}
              label="ROI חזוי"
              color={roiColor}
            >
              <NumberTicker value={roiTarget} suffix="%" />
            </Row>
            <Row
              icon={<PiggyBank className="w-4 h-4" />}
              label="רווח מול בסיס"
              color={profitColor}
            >
              <NumberTicker
                value={profitTarget}
                format={(n) => `${n >= 0 ? "+" : ""}${formatCurrency(n)}`}
              />
            </Row>
            <Row
              icon={<Package className="w-4 h-4" />}
              label="כיסוי מלאי"
              color={coverageColor}
            >
              <NumberTicker value={coverageTarget} suffix="%" />
            </Row>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Row({
  icon,
  label,
  color,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[#FDF8F6] px-3 py-2.5">
      <span className="inline-flex items-center gap-2 text-[15px] font-medium text-[#4A5568]">
        <span style={{ color }}>{icon}</span>
        {label}
      </span>
      <span className="text-xl font-mono font-bold" style={{ color }} dir="ltr">
        {children}
      </span>
    </div>
  );
}
