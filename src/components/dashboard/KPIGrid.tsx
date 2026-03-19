import { KPICard } from './KPICard'
import type { KPICardData } from '@/data/types'

interface KPIGridProps {
  items: KPICardData[]
  columns?: number
}

export function KPIGrid({ items, columns = 4 }: KPIGridProps) {
  const colClass =
    columns >= 6
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
      : columns >= 4
        ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid gap-3 sm:gap-4 ${colClass}`}>
      {items.map((item, i) => (
        <KPICard key={item.label} {...item} delay={i * 80} />
      ))}
    </div>
  )
}
