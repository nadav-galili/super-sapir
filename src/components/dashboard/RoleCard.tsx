import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { type LucideIcon, ArrowLeft } from 'lucide-react'

interface RoleCardProps {
  title: string
  description: string
  icon: LucideIcon
  to: string
  accentColor: string
  delay?: number
}

export function RoleCard({ title, description, icon: Icon, to, accentColor, delay = 0 }: RoleCardProps) {
  return (
    <Link to={to}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay / 1000, type: 'spring', stiffness: 300, damping: 24 }}
        whileHover={{ y: -3, boxShadow: 'rgba(220, 78, 89, 0.08) 0px 12px 32px' }}
        whileTap={{ scale: 0.99 }}
        className="relative overflow-hidden rounded-[16px] p-6 bg-white border border-warm-border cursor-pointer h-full transition-shadow"
      >
        {/* Top accent stripe */}
        <div className="absolute top-0 right-0 left-0 h-1 rounded-t-[16px]" style={{ background: accentColor }} />

        <div className="w-12 h-12 rounded-[10px] flex items-center justify-center mb-4" style={{ background: `${accentColor}15` }}>
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        <h3 className="text-lg font-bold text-[#2D3748] mb-2">{title}</h3>
        <p className="text-sm text-[#A0AEC0] leading-relaxed mb-4">{description}</p>
        <div className="flex items-center gap-1 text-sm font-medium" style={{ color: accentColor }}>
          <span>צפייה</span>
          <ArrowLeft className="w-4 h-4" />
        </div>
      </motion.div>
    </Link>
  )
}
