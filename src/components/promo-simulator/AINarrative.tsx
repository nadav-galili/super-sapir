import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypingText } from '@/components/ui/typing-text'
import { narrativeFor } from '@/lib/promo-simulator/narrative'
import type { SimulatorState } from '@/lib/promo-simulator/state'

interface AINarrativeProps {
  state: SimulatorState
}

export function AINarrative({ state }: AINarrativeProps) {
  const paragraphs = narrativeFor(state)

  if (paragraphs.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="border-[#FFE8DE] rounded-[16px] overflow-hidden">
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #6C5CE7, #8B7FED, #DC4E59)',
          }}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2 text-[#2D3748]">
            <div
              className="w-7 h-7 rounded-[10px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #8B7FED)',
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            ניתוח AI — פרשנות יועץ
            <span
              className="text-[15px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #8B7FED)',
                color: 'white',
              }}
            >
              AI
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paragraphs.map((p) => (
              <p
                key={p}
                className="text-[18px] text-[#4A5568] leading-relaxed"
              >
                <TypingText text={p} speed={10} />
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
