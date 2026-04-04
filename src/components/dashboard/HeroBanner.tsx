import { motion } from 'motion/react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { formatCurrencyShort } from '@/lib/format'

interface HeroBannerProps {
  totalSales: number
  targetSales: number
  branchCount: number
  categoryCount: number
}

function BigGauge({ ratio }: { ratio: number }) {
  const size = 160
  const strokeWidth = 12
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(ratio, 1) * circumference)
  const pct = Math.round(ratio * 100)
  const animatedPct = useAnimatedCounter(pct, 1800, 300)

  const color = ratio >= 0.95 ? '#2EC4D5' : ratio >= 0.85 ? '#F6B93B' : '#DC4E59'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.15)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, delay: 0.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono text-white" dir="ltr">
          {animatedPct}%
        </span>
        <span className="text-xs text-white/60 mt-0.5">עמידה ביעד</span>
      </div>
    </div>
  )
}

export function HeroBanner({ totalSales, targetSales, branchCount, categoryCount }: HeroBannerProps) {
  const ratio = targetSales > 0 ? totalSales / targetSales : 1
  const animatedSales = useAnimatedCounter(totalSales, 1600, 200)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-[20px] overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero/supermarket-banner.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 min-h-[220px]">
        {/* Left — Title + stats */}
        <div className="flex-1 text-right">
          <motion.h1
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2"
          >
            מנהל קטגוריה
            <br />
            <span className="text-[#DC4E59]">רשתי</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-white/50 mb-5"
          >
            סקירת ביצועים כלל-רשתית לכל הקטגוריות והסניפים
          </motion.p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-[12px] px-4 py-2.5 border border-white/10"
            >
              <p className="text-[11px] text-white/50">מכירות רשת</p>
              <p className="text-lg font-bold font-mono text-white" dir="ltr">
                {formatCurrencyShort(animatedSales)}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-[12px] px-4 py-2.5 border border-white/10"
            >
              <p className="text-[11px] text-white/50">סניפים</p>
              <p className="text-lg font-bold text-white">{branchCount}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-[12px] px-4 py-2.5 border border-white/10"
            >
              <p className="text-[11px] text-white/50">קטגוריות</p>
              <p className="text-lg font-bold text-white">{categoryCount}</p>
            </motion.div>
          </div>
        </div>

        {/* Right — Big gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
          className="shrink-0"
        >
          <BigGauge ratio={ratio} />
        </motion.div>
      </div>
    </motion.div>
  )
}
