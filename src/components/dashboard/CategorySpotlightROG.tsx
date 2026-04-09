import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { formatCurrencyShort } from '@/lib/format'
import type { CategorySnapshot } from '@/lib/category-manager'

interface CategorySpotlightROGProps {
  snapshots: CategorySnapshot[]
}

// Classic ROG status badges
const STATUS_BADGE = {
  opportunity: { label: 'ביצוע טוב', bg: 'bg-[#22C55E]' },
  danger: { label: 'חריג', bg: 'bg-[#EF4444]' },
  monitor: { label: 'במעקב', bg: 'bg-[#F97316]' },
} as const

function SpotlightCard({ snap, index }: { snap: CategorySnapshot; index: number }) {
  const navigate = useNavigate()
  const badge = STATUS_BADGE[snap.status]
  const yoyPositive = snap.category.yoyChange >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate({ to: '/category-manager/$categoryId', params: { categoryId: snap.category.id } })}
      className="relative rounded-[16px] overflow-hidden cursor-pointer group h-[200px]"
    >
      <div className="absolute inset-0">
        <img
          src={`/categories/${snap.category.id}.png`}
          alt={snap.category.name}
          className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      </div>

      <div className="absolute top-3 start-3 z-10">
        <span className={`${badge.bg} text-white text-[15px] font-bold px-2.5 py-1 rounded-full`}>
          {badge.label}
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 z-10">
        <h3 className="text-2xl font-bold text-white mb-1">{snap.category.name}</h3>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[15px] text-white/50">מכירות</p>
            <p className="text-lg font-bold font-mono text-white" dir="ltr">
              {formatCurrencyShort(snap.category.sales)}
            </p>
          </div>
          <div>
            <p className="text-[15px] text-white/50">שינוי שנתי</p>
            <p className={`text-lg font-bold font-mono ${yoyPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`} dir="ltr">
              {yoyPositive ? '+' : ''}{snap.category.yoyChange}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function CategorySpotlightROG({ snapshots }: CategorySpotlightROGProps) {
  const top = useMemo(() =>
    [...snapshots].sort((a, b) => b.category.sales - a.category.sales).slice(0, 4),
    [snapshots],
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {top.map((snap, i) => (
        <SpotlightCard key={snap.category.id} snap={snap} index={i} />
      ))}
    </div>
  )
}
