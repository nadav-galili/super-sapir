import { motion } from 'motion/react'
import { MapPin, User, Award, Wifi, Ruler, Users } from 'lucide-react'
import type { BranchInfo } from '@/data/hadera-real'

interface BranchInfoBarProps {
  info: BranchInfo
}

export function BranchInfoBar({ info }: BranchInfoBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden p-6 text-white shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      {/* Decorative mesh gradient */}
      <div className="absolute inset-0 opacity-30" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.2) 0%, transparent 50%)',
      }} />

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">סניף {info.name} #{info.branchNumber}</h2>
              <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-300">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {info.manager}
                </span>
                <span className="text-slate-500">|</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  מנהל אזור: {info.divisionManager}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 backdrop-blur-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">דירוג {info.grade}</span>
          </div>
          {info.hasInternet && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25 backdrop-blur-sm">
              <Wifi className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">אינטרנט פעיל</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-500/15 border border-slate-500/25 backdrop-blur-sm">
            <Ruler className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300" dir="ltr">{info.sellingArea.toLocaleString()} מ"ר</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
