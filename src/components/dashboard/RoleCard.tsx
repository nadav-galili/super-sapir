import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoleCardProps {
  title: string
  description: string
  icon: LucideIcon
  to: string
  gradient: string
  delay?: number
}

export function RoleCard({ title, description, icon: Icon, to, gradient, delay = 0 }: RoleCardProps) {
  return (
    <Link to={to}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay / 1000, type: 'spring', stiffness: 300, damping: 24 }}
        whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden rounded-2xl p-8 text-white cursor-pointer shadow-lg h-full',
        )}
        style={{ background: gradient }}
      >
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-sm text-white/80 leading-relaxed">{description}</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
      </motion.div>
    </Link>
  )
}
