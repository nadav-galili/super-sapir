import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, AlertTriangle, TrendingUp, Target, Users, Shield, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BriefingItem } from '@/lib/ai'

const ICON_MAP = {
  alert: AlertTriangle,
  trend: TrendingUp,
  target: Target,
  staff: Users,
  quality: Shield,
}

const PRIORITY_COLORS: Record<number, string> = {
  1: '#DC4E59',
  2: '#F6B93B',
  3: '#2EC4D5',
  4: '#2EC4D5',
  5: '#2EC4D5',
}

interface AIBriefingCardProps {
  briefing: BriefingItem[] | null
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  onRetry: () => void
}

export function AIBriefingCard({ briefing, isLoading, isStreaming, error, onRetry }: AIBriefingCardProps) {
  const showShimmer = isLoading && !briefing

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-warm-border rounded-[16px] overflow-hidden relative">
        {/* Animated top border — shimmer while loading, static when done */}
        <div
          className={`h-1 w-full ${showShimmer ? 'ai-shimmer-border' : ''}`}
          style={!showShimmer ? { background: 'linear-gradient(90deg, #6C5CE7, #8B7FED, #DC4E59)' } : undefined}
        />

        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-[#2D3748]">
            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B7FED)' }}>
              {isLoading || isStreaming ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </div>
            תדריך AI
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B7FED)', color: 'white' }}>
              AI
            </span>
            {isStreaming && (
              <span className="text-[10px] text-[#6C5CE7] font-medium animate-pulse me-auto">מנתח...</span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Shimmer skeleton loading state */}
          {showShimmer && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded ai-shimmer shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 ai-shimmer rounded" style={{ width: `${85 - i * 10}%`, animationDelay: `${i * 0.15}s` }} />
                    {i < 2 && <div className="h-3 ai-shimmer rounded" style={{ width: `${60 - i * 10}%`, animationDelay: `${i * 0.15 + 0.1}s` }} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
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

          {/* Briefing items — appear one by one during streaming */}
          {briefing && briefing.length > 0 && (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {briefing
                  .sort((a, b) => a.priority - b.priority)
                  .map((item, i) => {
                    const Icon = ICON_MAP[item.icon] ?? AlertTriangle
                    const color = PRIORITY_COLORS[item.priority] ?? '#2EC4D5'
                    return (
                      <motion.div
                        key={`${item.priority}-${i}`}
                        initial={{ opacity: 0, x: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="flex items-start gap-3 overflow-hidden"
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${color}20` }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <p className="text-sm text-[#4A5568] leading-relaxed">
                          <TypingText text={item.text} />
                        </p>
                      </motion.div>
                    )
                  })}
              </AnimatePresence>

              {/* Streaming indicator after last item */}
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 ps-8"
                >
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TypingText({ text }: { text: string }) {
  const [length, setLength] = useState(0)
  const textRef = useRef(text)

  useEffect(() => {
    textRef.current = text
    setLength(0)
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i >= textRef.current.length) {
        setLength(textRef.current.length)
        clearInterval(interval)
      } else {
        setLength(i)
      }
    }, 12)
    return () => clearInterval(interval)
  }, [text])

  return (
    <>
      {text.slice(0, length)}
      {length < text.length && <span className="ai-cursor" />}
    </>
  )
}
