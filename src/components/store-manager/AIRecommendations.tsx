import { motion } from 'motion/react'
import { ShoppingCart, Settings, Users, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Recommendation } from '@/lib/ai'

const CATEGORY_CONFIG = {
  sales: { icon: ShoppingCart, color: '#DC4E59', bg: '#DC4E59' },
  operations: { icon: Settings, color: '#2EC4D5', bg: '#2EC4D5' },
  hr: { icon: Users, color: '#6C5CE7', bg: '#6C5CE7' },
  compliance: { icon: Shield, color: '#F6B93B', bg: '#F6B93B' },
}

const IMPACT_COLORS = {
  high: 'bg-[#DC4E59]/10 text-[#DC4E59]',
  medium: 'bg-[#F6B93B]/10 text-[#F6B93B]',
  low: 'bg-[#2EC4D5]/10 text-[#2EC4D5]',
}

const IMPACT_LABELS = { high: 'השפעה גבוהה', medium: 'השפעה בינונית', low: 'השפעה נמוכה' }

interface AIRecommendationsProps {
  recommendations: Recommendation[] | null
  isLoading: boolean
}

export function AIRecommendations({ recommendations, isLoading }: AIRecommendationsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-warm-border rounded-[16px]">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] bg-[#FDF8F6] animate-pulse" />
                <div className="h-4 bg-[#FDF8F6] rounded animate-pulse flex-1" />
              </div>
              <div className="h-3 bg-[#FDF8F6] rounded animate-pulse w-[90%]" />
              <div className="h-3 bg-[#FDF8F6] rounded animate-pulse w-[70%]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!recommendations?.length) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {recommendations.map((rec, i) => {
        const config = CATEGORY_CONFIG[rec.category] ?? CATEGORY_CONFIG.operations
        const Icon = config.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Card className="border-warm-border rounded-[16px] h-full">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: `${config.bg}15` }}>
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <h4 className="text-sm font-bold text-[#2D3748] flex-1">{rec.title}</h4>
                </div>
                <p className="text-xs text-[#4A5568] leading-relaxed">{rec.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <Badge className={`text-[10px] ${IMPACT_COLORS[rec.impact]}`}>
                    {IMPACT_LABELS[rec.impact]}
                  </Badge>
                  <span className="text-[10px] text-[#A0AEC0]">{rec.estimatedEffect}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
