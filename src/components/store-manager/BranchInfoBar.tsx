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
      className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200/80"
    >
      {/* Top accent stripe */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1e40af, #0d9488, #1e40af)' }} />

      <div className="p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">סניף {info.name} #{info.branchNumber}</h2>
            <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {info.manager}
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                מנהל אזור: {info.divisionManager}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white">
            <Award className="w-4 h-4" />
            <span className="text-sm font-bold">דירוג {info.grade}</span>
          </div>
          {info.hasInternet && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">אינטרנט פעיל</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <Ruler className="w-4 h-4" />
            <span className="text-sm" dir="ltr">{info.sellingArea.toLocaleString()} מ"ר</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
