import { useState, useCallback, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import {
  Check,
  Download,
  Archive,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { PromoSummaryCard } from './PromoSummaryCard'
import { PromoFullReport } from './PromoFullReport'
import { exportElementToPdf } from '@/lib/promo-simulator/export-pdf'
import type { SimulatorState } from '@/lib/promo-simulator/state'

function safeFileSegment(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]+/gu, '')
    .slice(0, 40)
}

interface SuccessScreenProps {
  state: SimulatorState
  onRestart: () => void
}

interface ActionButton {
  key: string
  label: string
  toast: string
  icon: typeof Download
  onClickExtra?: () => void
  suppressToast?: boolean
}

export function SuccessScreen({ state, onRestart }: SuccessScreenProps) {
  const [toastText, setToastText] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()

  const showToast = useCallback((text: string) => {
    setToastText(text)
    const id = window.setTimeout(() => setToastText(null), 2400)
    return () => window.clearTimeout(id)
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    if (!reportRef.current || isExporting) return
    setIsExporting(true)
    showToast('PDF הורדה החלה')
    try {
      const parts = [
        'promo',
        safeFileSegment(state.category),
        safeFileSegment(state.product),
      ].filter(Boolean)
      const filename = `${parts.join('-') || 'promo'}.pdf`
      await exportElementToPdf(reportRef.current, { filename })
    } catch (err) {
      console.error('PDF export failed', err)
      showToast('שגיאה ביצירת PDF')
    } finally {
      setIsExporting(false)
    }
  }, [isExporting, showToast, state.category, state.product])

  const actions: ActionButton[] = [
    {
      key: 'pdf',
      label: isExporting ? 'מכין PDF…' : 'הורד PDF',
      toast: '',
      icon: Download,
      onClickExtra: handleDownloadPdf,
      suppressToast: true,
    },
    {
      key: 'archive',
      label: 'הוסף לארכיון מבצעים',
      toast: 'נשמר בארכיון',
      icon: Archive,
    },
    {
      key: 'share',
      label: 'שתף עם המנהל',
      toast: 'הקישור נשלח למנהל',
      icon: Share2,
    },
    {
      key: 'new',
      label: 'מבצע חדש',
      toast: 'מתחיל מבצע חדש',
      icon: Sparkles,
      onClickExtra: onRestart,
    },
  ]

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-start pt-8 pb-12 px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4">
          <motion.div
            initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(16, 185, 129, 0.14)',
              boxShadow: '0 0 0 10px rgba(16, 185, 129, 0.06)',
            }}
          >
            <motion.div
              animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
              }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#10B981' }}
            >
              <Check className="w-9 h-9 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-5xl font-bold text-[#2D3748]"
          >
            המבצע מוכן
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="text-xl text-[#4A5568]"
          >
            כל שלבי התכנון הושלמו. ניתן להוריד, לשתף או לשמור בארכיון.
          </motion.p>
        </div>

        <PromoSummaryCard state={state} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((a, i) => {
            const Icon = a.icon
            return (
              <motion.button
                key={a.key}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                onClick={() => {
                  if (!a.suppressToast && a.toast) showToast(a.toast)
                  a.onClickExtra?.()
                }}
                disabled={a.key === 'pdf' && isExporting}
                className="inline-flex flex-col items-center justify-center gap-2 rounded-[10px] border border-[#FFE8DE] bg-white px-4 py-5 text-[16px] font-medium text-[#4A5568] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(220,78,89,0.08)] disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0"
              >
                <Icon className="w-5 h-5 text-[#DC4E59]" />
                <span className="text-center leading-tight">{a.label}</span>
              </motion.button>
            )
          })}
        </div>

        <div className="flex justify-center">
          <Link
            to="/category-manager"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#FFE8DE] bg-white px-5 py-2.5 text-[16px] font-medium text-[#4A5568] transition-colors hover:bg-[#FDF8F6]"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לקטגוריות
          </Link>
        </div>
      </div>

      {toastText && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-[10px] bg-[#2D3748] text-white px-5 py-3 text-[16px] font-medium shadow-lg z-50"
        >
          {toastText}
        </motion.div>
      )}

      {/* Off-screen full report — used only for PDF capture. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: -10000,
          width: 800,
          pointerEvents: 'none',
          opacity: 0,
        }}
      >
        <div ref={reportRef}>
          <PromoFullReport state={state} />
        </div>
      </div>
    </div>
  )
}
