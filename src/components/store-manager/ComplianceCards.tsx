import { motion } from 'motion/react'
import { CheckCircle2, XCircle, AlertTriangle, Package, RotateCcw, Bell, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ComplianceData } from '@/data/hadera-real'

interface ComplianceItemProps {
  icon: React.ReactNode
  label: string
  actual: number
  target: number
  met: boolean
  ranking: number
  detail?: string
  delay?: number
}

function ComplianceItem({ icon, label, actual, target, met, ranking, detail, delay = 0 }: ComplianceItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 300, damping: 24 }}
      className={`rounded-[16px] p-4 border transition-shadow hover:shadow-sm ${
        met
          ? 'border-[#2EC4D5]/25 bg-[#2EC4D5]/5'
          : 'border-[#DC4E59]/25 bg-[#DC4E59]/5'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${
            met ? 'bg-[#2EC4D5]/15 text-[#2EC4D5]' : 'bg-[#DC4E59]/15 text-[#DC4E59]'
          }`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2D3748]">{label}</p>
            <p className="text-xs text-[#A0AEC0] mt-0.5 font-mono" dir="ltr">
              {actual} / {target} (יעד)
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {met ? <CheckCircle2 className="w-5 h-5 text-[#2EC4D5]" /> : <XCircle className="w-5 h-5 text-[#DC4E59]" />}
          <span className="text-[10px] px-1.5 py-0.5 rounded-[20px] bg-white text-[#A0AEC0] font-medium border border-warm-border" dir="ltr">
            #{ranking}
          </span>
        </div>
      </div>
      {detail && (
        <p className="text-[11px] text-[#A0AEC0] mt-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {detail}
        </p>
      )}
    </motion.div>
  )
}

export function ComplianceCards({ compliance }: { compliance: ComplianceData }) {
  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-[#2D3748]">
          <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F6B93B, #F8CB6B)' }}>
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          עמידה ביעדים תפעוליים
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ComplianceItem icon={<RotateCcw className="w-4 h-4" />} label="חזרות" actual={compliance.returns.actual} target={compliance.returns.target} met={compliance.returns.met} ranking={compliance.returns.ranking} delay={0} />
          <ComplianceItem icon={<Package className="w-4 h-4" />} label="מלאי גבוה" actual={compliance.highInventory.actual} target={compliance.highInventory.target} met={compliance.highInventory.met} ranking={compliance.highInventory.ranking} delay={80} />
          <ComplianceItem icon={<Bell className="w-4 h-4" />} label="התראות אדומות" actual={compliance.redAlerts.actual} target={compliance.redAlerts.target} met={compliance.redAlerts.met} ranking={compliance.redAlerts.ranking} detail={`${compliance.redAlerts.redSubscriptions} חותמות אדומות (${compliance.redAlerts.rate}%)`} delay={160} />
          <ComplianceItem icon={<ShoppingCart className="w-4 h-4" />} label="חסרי פעילות" actual={compliance.missingActivities.actual} target={compliance.missingActivities.timeTarget} met={compliance.missingActivities.met} ranking={compliance.missingActivities.ranking} detail={`סטייה ${compliance.missingActivities.deviation}%`} delay={240} />
        </div>
      </CardContent>
    </Card>
  )
}
