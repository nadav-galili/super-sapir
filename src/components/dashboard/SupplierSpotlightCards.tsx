import { useMemo } from 'react'
import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Award } from 'lucide-react'
import { formatCurrencyShort } from '@/lib/format'
import { usePeriodMultiplier } from '@/contexts/PeriodContext'
import { SupplierLogo } from '@/components/dashboard/SupplierLogo'
import {
  getMostProfitableSupplier,
  getAtRiskSupplier,
  getFastestGrowingSupplier,
} from '@/data/mock-suppliers'

interface SupplierCardProps {
  title: string
  icon: React.ReactNode
  iconBg: string
  accentColor: string
  supplierName: string
  stats: { label: string; value: string; color: string }[]
  delay: number
}

function SupplierCard({ title, icon, iconBg, accentColor, supplierName, stats, delay }: SupplierCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ y: -4, boxShadow: `${accentColor}22 0px 12px 32px` }}
      className="relative overflow-hidden rounded-[16px] bg-white border border-warm-border cursor-default"
    >
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }} />
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${iconBg}`}>
            {icon}
          </span>
          <h3 className="text-lg font-bold text-[#2D3748]">{title}</h3>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <SupplierLogo name={supplierName} size={32} />
          <p className="text-xl font-bold text-[#2D3748]">{supplierName}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-[16px] text-[#A0AEC0]">{s.label}</p>
              <p className="text-lg font-bold font-mono" style={{ color: s.color }} dir="ltr">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function SupplierSpotlightCards() {
  const m = usePeriodMultiplier()
  const profitable = useMemo(() => getMostProfitableSupplier(), [])
  const atRisk = useMemo(() => getAtRiskSupplier(), [])
  const growing = useMemo(() => getFastestGrowingSupplier(), [])

  const atRiskPct = atRisk.targetSales > 0 ? (atRisk.sales / atRisk.targetSales) * 100 : 100
  const atRiskGap = (atRisk.targetSales - atRisk.sales) * m
  const growingPct = growing.targetSales > 0 ? (growing.sales / growing.targetSales) * 100 : 100

  return (
    <div className="flex flex-col gap-4">
      <SupplierCard
        title="ספק מוביל ברווחיות"
        icon={<Award className="w-4 h-4 text-[#6C5CE7]" />}
        iconBg="bg-[#6C5CE7]/10"
        accentColor="#6C5CE7"
        supplierName={profitable.name}
        delay={0.1}
        stats={[
          { label: 'רווח גולמי', value: `${profitable.grossProfitPercent}%`, color: '#6C5CE7' },
          { label: 'מכירות', value: formatCurrencyShort(profitable.sales * m), color: '#2D3748' },
        ]}
      />

      <SupplierCard
        title="ספק בסיכון — החמצת יעד"
        icon={<TrendingDown className="w-4 h-4 text-[#DC4E59]" />}
        iconBg="bg-[#DC4E59]/10"
        accentColor="#DC4E59"
        supplierName={atRisk.name}
        delay={0.2}
        stats={[
          { label: 'עמידה ביעד', value: `${atRiskPct.toFixed(1)}%`, color: '#DC4E59' },
          { label: 'פער מהיעד', value: formatCurrencyShort(atRiskGap), color: '#DC4E59' },
        ]}
      />

      <SupplierCard
        title="ספק צומח"
        icon={<TrendingUp className="w-4 h-4 text-[#2EC4D5]" />}
        iconBg="bg-[#2EC4D5]/10"
        accentColor="#2EC4D5"
        supplierName={growing.name}
        delay={0.3}
        stats={[
          { label: 'עמידה ביעד', value: `${growingPct.toFixed(1)}%`, color: '#2EC4D5' },
          { label: 'מכירות', value: formatCurrencyShort(growing.sales * m), color: '#2D3748' },
        ]}
      />
    </div>
  )
}
