import { KPICardROG } from './KPICardROG'
import type { KPICardData } from '@/data/types'

interface KPIGridROGProps {
  items: KPICardData[]
  columns?: number
}

export function KPIGridROG({ items, columns = 4 }: KPIGridROGProps) {
  const colClass =
    columns >= 6
      ? 'grid-cols-3 sm:grid-cols-3 lg:grid-cols-6'
      : columns === 5
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        : columns >= 4
          ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid gap-2 sm:gap-4 ${colClass}`}>
      {items.map((item, i) => (
        <KPICardROG key={item.label} {...item} delay={i * 80} />
      ))}
    </div>
  )
}
