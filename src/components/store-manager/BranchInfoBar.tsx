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
      className="relative rounded-[16px] overflow-hidden bg-white border border-warm-border"
    >
      {/* Top accent stripe */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #DC4E59, #2EC4D5)' }} />

      <div className="p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DC4E59, #E8777F)' }}>
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2D3748]">סניף {info.name} #{info.branchNumber}</h2>
            <div className="flex items-center gap-3 mt-0.5 text-sm text-[#A0AEC0]">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {info.manager}
              </span>
              <span className="text-warm-border">|</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                מנהל אזור: {info.divisionManager}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-white" style={{ background: 'linear-gradient(135deg, #DC4E59, #E8777F)' }}>
            <Award className="w-4 h-4" />
            <span className="text-sm font-bold">דירוג {info.grade}</span>
          </div>
          {info.hasInternet && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] bg-[#2EC4D5]/10 border border-[#2EC4D5]/20 text-[#2EC4D5]">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">אינטרנט פעיל</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] bg-[#FDF8F6] border border-warm-border text-[#4A5568]">
            <Ruler className="w-4 h-4" />
            <span className="text-sm" dir="ltr">{info.sellingArea.toLocaleString()} מ"ר</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
