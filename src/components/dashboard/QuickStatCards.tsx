import { useMemo } from 'react'
import { motion } from 'motion/react'
import { ShoppingCart, Users, PackageCheck, AlertTriangle } from 'lucide-react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { allBranches } from '@/data/mock-branches'

const ICONS = [ShoppingCart, Users, PackageCheck, AlertTriangle] as const

interface QuickStat {
  label: string
  value: number
  suffix: string
  icon: typeof ICONS[number]
  color: string
}

function StatCard({ stat, index }: { stat: QuickStat; index: number }) {
  const Icon = stat.icon
  const animated = useAnimatedCounter(stat.value, 1200, index * 120)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: 'rgba(220, 78, 89, 0.06) 0px 6px 20px' }}
      className="rounded-[14px] bg-white border border-warm-border p-4 flex items-center gap-3 cursor-default"
    >
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${stat.color}12` }}
      >
        <Icon className="w-5 h-5" style={{ color: stat.color }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono text-[#2D3748]" dir="ltr">{String(animated)}</span>
          <span className="text-[11px] text-[#A0AEC0]">{stat.suffix}</span>
        </div>
        <p className="text-[12px] text-[#A0AEC0] mt-0.5">{stat.label}</p>
      </div>
    </motion.div>
  )
}

export function QuickStatCards() {
  const stats = useMemo<QuickStat[]>(() => {
    const totalCustomers = allBranches.reduce((sum, b) => sum + b.metrics.customersPerDay, 0)
    const avgBasket = allBranches.reduce((sum, b) => sum + b.metrics.avgBasket, 0) / allBranches.length
    const avgSupply = allBranches.reduce((sum, b) => sum + b.metrics.supplyRate, 0) / allBranches.length
    const totalComplaints = allBranches.reduce((sum, b) => sum + b.metrics.complaints, 0)

    return [
      { label: 'לקוחות יומי', value: totalCustomers, suffix: 'לקוחות', icon: Users, color: '#2EC4D5' },
      { label: 'סל ממוצע', value: Math.round(avgBasket), suffix: '₪', icon: ShoppingCart, color: '#6C5CE7' },
      { label: 'זמינות מדף', value: +avgSupply.toFixed(1), suffix: '%', icon: PackageCheck, color: '#2EC4D5' },
      { label: 'תלונות פתוחות', value: totalComplaints, suffix: 'תלונות', icon: AlertTriangle, color: '#DC4E59' },
    ]
  }, [])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  )
}
