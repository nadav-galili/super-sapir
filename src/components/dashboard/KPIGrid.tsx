import { KPICard } from './KPICard'
import type { KPICardData } from '@/data/types'

interface KPIGridProps {
  items: KPICardData[]
  columns?: number
}

export function KPIGrid({ items, columns = 4 }: KPIGridProps) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, items.length)}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <KPICard key={item.label} {...item} delay={i * 80} />
      ))}
    </div>
  )
}
