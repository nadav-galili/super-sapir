import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export type PeriodType = 'yearly' | 'monthly' | 'weekly'

export interface TimePeriod {
  type: PeriodType
  month?: number // 1-12, only for monthly
  week?: number  // 1-52, only for weekly
}

const MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

function getWeekLabel(week: number): string {
  return `שבוע ${week}`
}

function getPeriodLabel(period: TimePeriod): string {
  if (period.type === 'yearly') return 'שנה מצטברת'
  if (period.type === 'monthly' && period.month) return MONTHS[period.month - 1]
  if (period.type === 'weekly' && period.week) return getWeekLabel(period.week)
  return ''
}

interface TimePeriodFilterProps {
  value: TimePeriod
  onChange: (period: TimePeriod) => void
}

export function TimePeriodFilter({ value, onChange }: TimePeriodFilterProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  function selectType(type: PeriodType) {
    if (type === 'yearly') {
      onChange({ type: 'yearly' })
      setShowDropdown(false)
    } else if (type === 'monthly') {
      onChange({ type: 'monthly', month: value.month || 12 })
    } else {
      onChange({ type: 'weekly', week: value.week || 1 })
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(s => !s)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-white border border-[#FFE8DE] text-lg font-medium text-[#2D3748] transition-all hover:shadow-md"
      >
        <Calendar className="w-5 h-5 text-[#6C5CE7]" />
        <span>{getPeriodLabel(value)}</span>
        <ChevronDown className={`w-4 h-4 text-[#A0AEC0] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 end-0 z-50 bg-white rounded-[12px] border border-[#FFE8DE] shadow-lg p-3 min-w-[280px]"
          >
            {/* Period type buttons */}
            <div className="flex gap-1 mb-3 bg-[#FDF8F6] p-1 rounded-[10px]">
              {([
                { type: 'yearly' as const, label: 'שנתי' },
                { type: 'monthly' as const, label: 'חודשי' },
                { type: 'weekly' as const, label: 'שבועי' },
              ]).map(opt => (
                <button
                  key={opt.type}
                  onClick={() => selectType(opt.type)}
                  className={`flex-1 px-3 py-2 rounded-[8px] text-[16px] font-medium transition-all ${
                    value.type === opt.type
                      ? 'bg-white text-[#6C5CE7] shadow-sm'
                      : 'text-[#4A5568] hover:bg-white/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Month picker */}
            {value.type === 'monthly' && (
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => { onChange({ type: 'monthly', month: i + 1 }); setShowDropdown(false) }}
                    className={`px-2 py-2 rounded-[8px] text-[16px] font-medium transition-all ${
                      value.month === i + 1
                        ? 'bg-[#6C5CE7] text-white shadow-sm'
                        : 'text-[#4A5568] hover:bg-[#FDF8F6]'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* Week picker */}
            {value.type === 'weekly' && (
              <div className="max-h-[240px] overflow-y-auto grid grid-cols-4 gap-1.5">
                {Array.from({ length: 52 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => { onChange({ type: 'weekly', week: i + 1 }); setShowDropdown(false) }}
                    className={`px-2 py-2 rounded-[8px] text-[16px] font-medium transition-all ${
                      value.week === i + 1
                        ? 'bg-[#6C5CE7] text-white shadow-sm'
                        : 'text-[#4A5568] hover:bg-[#FDF8F6]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Yearly — just close */}
            {value.type === 'yearly' && (
              <p className="text-[16px] text-[#A0AEC0] text-center py-2">נתונים מצטברים מתחילת השנה</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Returns a deterministic multiplier (0.6–1.15) for a given period,
 * so mock data visibly changes when switching time periods.
 */
export function getPeriodMultiplier(period: TimePeriod): number {
  if (period.type === 'yearly') return 1
  let seed = 0
  if (period.type === 'monthly' && period.month) {
    seed = period.month
  } else if (period.type === 'weekly' && period.week) {
    seed = period.week + 100
  }
  // Simple hash → value between 0.6 and 1.15
  const hash = Math.sin(seed * 9301 + 49297) * 0.5 + 0.5 // 0–1
  return 0.6 + hash * 0.55
}

/**
 * Returns a small deterministic jitter (0.92–1.08) for percentage KPIs,
 * so they shift slightly per period while staying realistic.
 */
export function getPeriodJitter(period: TimePeriod, index: number): number {
  if (period.type === 'yearly') return 1
  let seed = index * 17
  if (period.type === 'monthly' && period.month) {
    seed += period.month * 31
  } else if (period.type === 'weekly' && period.week) {
    seed += (period.week + 100) * 31
  }
  const hash = Math.sin(seed * 7919 + 104729) * 0.5 + 0.5
  return 0.92 + hash * 0.16
}
