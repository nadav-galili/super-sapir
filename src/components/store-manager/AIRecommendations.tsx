import { motion, AnimatePresence } from 'motion/react'
import { ShoppingCart, Settings, Users, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TypingText } from '@/components/ui/typing-text'
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
  isStreaming: boolean
}

export function AIRecommendations({ recommendations, isLoading, isStreaming }: AIRecommendationsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-warm-border rounded-[16px] overflow-hidden">
            <div className="h-0.5 w-full ai-shimmer-border" />
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] ai-shimmer" />
                <div className="h-4 ai-shimmer rounded flex-1" style={{ animationDelay: `${i * 0.2}s` }} />
              </div>
              <div className="h-3 ai-shimmer rounded" style={{ width: '90%', animationDelay: `${i * 0.2 + 0.1}s` }} />
              <div className="h-3 ai-shimmer rounded" style={{ width: '70%', animationDelay: `${i * 0.2 + 0.2}s` }} />
              <div className="flex items-center justify-between pt-1">
                <div className="h-5 w-20 ai-shimmer rounded-full" style={{ animationDelay: `${i * 0.2 + 0.3}s` }} />
                <div className="h-3 w-16 ai-shimmer rounded" style={{ animationDelay: `${i * 0.2 + 0.3}s` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!recommendations?.length) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {recommendations.map((rec, i) => {
          const config = CATEGORY_CONFIG[rec.category] ?? CATEGORY_CONFIG.operations
          const Icon = config.icon
          return (
            <motion.div
              key={`${rec.category}-${i}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Card className="border-warm-border rounded-[16px] h-full overflow-hidden">
                <div className="h-0.5 w-full" style={{ background: config.color }} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: `${config.bg}15` }}>
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <h4 className="text-sm font-bold text-[#2D3748] flex-1">
                      <TypingText text={rec.title} speed={10} animate={isStreaming} />
                    </h4>
                  </div>
                  <p className="text-xs text-[#4A5568] leading-relaxed">
                    <TypingText text={rec.description} speed={8} animate={isStreaming} />
                  </p>
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
      </AnimatePresence>
    </div>
  )
}
