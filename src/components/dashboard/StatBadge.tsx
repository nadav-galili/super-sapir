import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatBadgeProps {
  label: string
  value: string
  delta?: number
  className?: string
}

export function StatBadge({ label, value, delta, className }: StatBadgeProps) {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm" dir="ltr">{value}</span>
        {delta !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs',
              delta > 0 && 'text-emerald-600',
              delta < 0 && 'text-red-500',
              delta === 0 && 'text-muted-foreground'
            )}
          >
            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            <span dir="ltr">{delta > 0 ? '+' : ''}{delta}%</span>
          </span>
        )}
      </div>
    </div>
  )
}
