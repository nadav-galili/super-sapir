import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon: LucideIcon
  accentColor?: string
}

export function SectionHeader({ title, subtitle, icon: Icon, accentColor = '#DC4E59' }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}12` }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-[#2D3748]">{title}</h2>
        {subtitle && <p className="text-[13px] text-[#A0AEC0] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#FFE8DE] to-transparent ms-3" />
    </motion.div>
  )
}
