import { Star, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { purposeMap, type Goal } from '@/lib/promo-simulator/taxonomy'
import type { SimulatorState } from '@/lib/promo-simulator/state'

interface Step3PromoTypeProps {
  state: SimulatorState
  onChange: (update: Partial<SimulatorState>) => void
}

function Stars({ count }: { count: 1 | 2 | 3 }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`דירוג ${count} מתוך 3`}>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i <= count ? '#F6B93B' : 'transparent'}
          stroke={i <= count ? '#F6B93B' : '#A0AEC0'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export function Step3PromoType({ state, onChange }: Step3PromoTypeProps) {
  const goal = state.goal as Goal | ''

  if (!goal) {
    return (
      <Card className="border-[#FFE8DE] rounded-[16px]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#2D3748]">בחירת סוג מבצע</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-[16px] border-2 border-dashed p-10 text-center"
            style={{ borderColor: '#FFE8DE', background: '#FDF8F6' }}
          >
            <p className="text-xl font-semibold text-[#2D3748] mb-2">
              בחר מטרה בשלב הקודם כדי לקבל המלצות מותאמות
            </p>
            <p className="text-lg text-[#4A5568]">
              הצעות סוגי המבצע יותאמו למטרה שתבחר.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const options = purposeMap[goal] ?? []

  return (
    <Card className="border-[#FFE8DE] rounded-[16px]">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-2xl text-[#2D3748]">בחירת סוג מבצע</CardTitle>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[15px] font-semibold"
            style={{ background: '#6C5CE71A', color: '#6C5CE7' }}
          >
            <ArrowLeft className="w-4 h-4" />
            מטרה: {goal}
          </span>
        </div>
        <p className="text-lg text-[#4A5568]">
          סוגי המבצע המומלצים למטרה שבחרת, מדורגים לפי התאמה
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((p) => {
            const isActive = state.promoType === p.name
            return (
              <button
                type="button"
                key={p.name}
                onClick={() => onChange({ promoType: p.name })}
                className="text-right rounded-[16px] border-2 p-5 transition-all hover:-translate-y-0.5"
                style={{
                  background: isActive ? 'rgba(220, 78, 89, 0.06)' : '#FFFFFF',
                  borderColor: isActive ? '#DC4E59' : '#FFE8DE',
                  boxShadow: isActive
                    ? '0 8px 20px rgba(220, 78, 89, 0.14)'
                    : '0 2px 6px rgba(220, 78, 89, 0.04)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#2D3748]">{p.name}</h3>
                  <span
                    className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[15px] font-mono font-semibold"
                    style={{ background: '#2EC4D51A', color: '#2EC4D5' }}
                    dir="ltr"
                  >
                    התאמה: {p.score}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Stars count={p.stars} />
                </div>
                <p className="text-[16px] text-[#4A5568] leading-relaxed">
                  {p.reason}
                </p>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
