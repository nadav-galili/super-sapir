import { motion } from 'motion/react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { formatCurrencyShort } from '@/lib/format'
import { Activity } from 'lucide-react'

interface HeroBannerROGProps {
  totalSales: number
  targetSales: number
  branchCount: number
  categoryCount: number
}

const GAUGE_SIZE = 180
const GAUGE_STROKE = 14
const GAUGE_R = (GAUGE_SIZE - GAUGE_STROKE) / 2

const TICK_MARKS = Array.from({ length: 40 }, (_, i) => {
  const angle = (i / 40) * 360 - 90
  const rad = (angle * Math.PI) / 180
  return {
    x1: GAUGE_SIZE / 2 + (GAUGE_R + 4) * Math.cos(rad),
    y1: GAUGE_SIZE / 2 + (GAUGE_R + 4) * Math.sin(rad),
    x2: GAUGE_SIZE / 2 + (GAUGE_R + 8) * Math.cos(rad),
    y2: GAUGE_SIZE / 2 + (GAUGE_R + 8) * Math.sin(rad),
  }
})

function BigGauge({ ratio }: { ratio: number }) {
  const size = GAUGE_SIZE
  const r = GAUGE_R
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(ratio, 1) * circumference)
  const pct = Math.round(ratio * 100)
  const animatedPct = useAnimatedCounter(pct, 1800, 300)

  // Classic ROG colors
  const color = ratio >= 0.95 ? '#22C55E' : ratio >= 0.85 ? '#F97316' : '#EF4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute -inset-3 rounded-full border-2 opacity-0"
        style={{ borderColor: color }}
        animate={{ opacity: [0, 0.3, 0], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute -inset-4 rounded-full blur-xl opacity-20"
        style={{ background: color }}
      />

      <svg className="w-full h-full -rotate-90 relative z-10" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.1)"
          strokeWidth={GAUGE_STROKE}
        />
        {TICK_MARKS.map((t, i) => (
          <line
            key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="rgba(255,255,255,0.08)" strokeWidth={1}
          />
        ))}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color}
          strokeWidth={GAUGE_STROKE} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, delay: 0.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <span className="text-6xl font-bold font-mono text-white tracking-tight" dir="ltr">
          {animatedPct}<span className="text-3xl text-white/60">%</span>
        </span>
        <span className="text-base text-white/50 mt-1 tracking-wide">עמידה ביעד</span>
      </div>
    </div>
  )
}

interface StatPillProps {
  label: string
  value: string | number
  delay: number
  mono?: boolean
}

function StatPill({ label, value, delay, mono }: StatPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/[0.07] backdrop-blur-md rounded-[14px] px-5 py-3 border border-white/[0.08] hover:bg-white/[0.12] transition-colors"
    >
      <p className="text-[16px] text-white/40 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold text-white mt-0.5 ${mono ? 'font-mono' : ''}`} dir="ltr">
        {value}
      </p>
    </motion.div>
  )
}

export function HeroBannerROG({ totalSales, targetSales, branchCount, categoryCount }: HeroBannerROGProps) {
  const ratio = targetSales > 0 ? totalSales / targetSales : 1
  const animatedSales = useAnimatedCounter(totalSales, 1600, 200)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-[20px] overflow-hidden shadow-xl"
    >
      <div className="absolute inset-0">
        <img
          src="/hero/supermarket-banner.jpg"
          alt=""
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12 min-h-[280px]">
        <div className="flex-1 text-right">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm rounded-full px-3 py-1 mb-4 border border-white/[0.08]"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-[#22C55E]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[16px] text-white/50 font-medium">
              <Activity className="w-3 h-3 inline-block me-1" />
              נתונים בזמן אמת
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-5xl sm:text-6xl font-bold text-white leading-[1.15] mb-3"
          >
            ניהול סחר
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-lg text-white/40 mb-6 max-w-md"
          >
            סקירת ביצועים כלל-רשתית לכל הקטגוריות והסניפים
          </motion.p>

          <div className="flex flex-wrap gap-3">
            <StatPill label="מכירות רשת" value={formatCurrencyShort(animatedSales)} delay={0.45} mono />
            <StatPill label="סניפים" value={branchCount} delay={0.55} />
            <StatPill label="קטגוריות" value={categoryCount} delay={0.65} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 180, damping: 18 }}
          className="shrink-0"
        >
          <BigGauge ratio={ratio} />
        </motion.div>
      </div>
    </motion.div>
  )
}
