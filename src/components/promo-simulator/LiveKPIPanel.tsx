import { motion } from 'motion/react'
import { Activity, TrendingUp, PiggyBank, Package } from 'lucide-react'
import { getKpiStatusColor } from '@/lib/colors'
import { formatCurrency } from '@/lib/format'
import { calcMetrics, statusLabel, statusRatio } from '@/lib/promo-simulator/calc'
import type { SimulatorState } from '@/lib/promo-simulator/state'

interface LiveKPIPanelProps {
  state: SimulatorState
}

export function LiveKPIPanel({ state }: LiveKPIPanelProps) {
  const m = calcMetrics(state)
  const statusColor = getKpiStatusColor(statusRatio(m.status))
  const profitDelta = m.promoProfit - m.baseProfit
  const coverageRatio = Math.min(m.stockCoverage / 100, 1)
  const coverageColor = getKpiStatusColor(coverageRatio)
  const roiColor = getKpiStatusColor(m.roi >= 0 ? 1 : 0.5)
  const profitColor = getKpiStatusColor(profitDelta >= 0 ? 1 : 0.5)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="lg:sticky lg:top-[120px]"
    >
      <div className="rounded-[16px] border border-[#FFE8DE] bg-white shadow-sm overflow-hidden">
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #DC4E59, #E8777F)',
          }}
        />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #DC4E59, #E8777F)' }}
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
              value={`${m.roi}%`}
              color={roiColor}
            />
            <Row
              icon={<PiggyBank className="w-4 h-4" />}
              label="רווח מול בסיס"
              value={`${profitDelta >= 0 ? '+' : ''}${formatCurrency(profitDelta)}`}
              color={profitColor}
            />
            <Row
              icon={<Package className="w-4 h-4" />}
              label="כיסוי מלאי"
              value={`${m.stockCoverage}%`}
              color={coverageColor}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Row({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[#FDF8F6] px-3 py-2.5">
      <span className="inline-flex items-center gap-2 text-[15px] font-medium text-[#4A5568]">
        <span style={{ color }}>{icon}</span>
        {label}
      </span>
      <span
        className="text-xl font-mono font-bold"
        style={{ color }}
        dir="ltr"
      >
        {value}
      </span>
    </div>
  )
}
