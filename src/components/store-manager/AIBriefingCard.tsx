import { motion } from 'motion/react'
import { Sparkles, AlertTriangle, TrendingUp, Target, Users, Shield, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BriefingItem } from '@/lib/ai'

const ICON_MAP = {
  alert: AlertTriangle,
  trend: TrendingUp,
  target: Target,
  staff: Users,
  quality: Shield,
}

interface AIBriefingCardProps {
  briefing: BriefingItem[] | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function AIBriefingCard({ briefing, isLoading, error, onRetry }: AIBriefingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-warm-border rounded-[16px] overflow-hidden">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6C5CE7, #8B7FED, #DC4E59)' }} />
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-[#2D3748]">
            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B7FED)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            תדריך AI
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B7FED)', color: 'white' }}>
              AI
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-[#FDF8F6] animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-[#FDF8F6] rounded animate-pulse" style={{ width: `${85 - i * 10}%` }} />
                    {i === 0 && <div className="h-3 bg-[#FDF8F6] rounded animate-pulse w-[60%]" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#DC4E59]">לא ניתן לטעון ניתוח AI</span>
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[8px] border border-warm-border text-[#4A5568] hover:bg-[#FDF8F6]"
              >
                <RefreshCw className="w-3 h-3" />
                נסה שוב
              </button>
            </div>
          )}

          {briefing && (
            <div className="space-y-3">
              {briefing
                .sort((a, b) => a.priority - b.priority)
                .map((item, i) => {
                  const Icon = ICON_MAP[item.icon] ?? AlertTriangle
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: item.priority === 1 ? '#DC4E59' : item.priority === 2 ? '#F6B93B' : '#2EC4D5', opacity: 0.15 }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: item.priority === 1 ? '#DC4E59' : item.priority === 2 ? '#F6B93B' : '#2EC4D5' }} />
                      </div>
                      <p className="text-sm text-[#4A5568] leading-relaxed">{item.text}</p>
                    </motion.div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
