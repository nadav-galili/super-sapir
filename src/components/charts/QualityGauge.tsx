import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { getPerformanceColor } from '@/lib/colors'

interface QualityGaugeProps {
  score: number
  maxScore?: number
  title?: string
}

export function QualityGauge({ score, maxScore = 100, title = 'ציון איכות' }: QualityGaugeProps) {
  const animatedScore = useAnimatedCounter(score, 1500, 400)
  const color = getPerformanceColor(score, maxScore)
  const percentage = (score / maxScore) * 100
  const circumference = 2 * Math.PI * 60
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-[#2D3748]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#FFE8DE" strokeWidth="10" />
            <motion.circle
              cx="70" cy="70" r="60" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono" style={{ color }} dir="ltr">{animatedScore}</span>
            <span className="text-xs text-[#A0AEC0]">מתוך {maxScore}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
