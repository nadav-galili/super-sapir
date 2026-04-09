import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'motion/react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-lg text-muted-foreground mb-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-1"
        >
          {i > 0 && <ChevronLeft className="w-4 h-4" />}
          {item.to && i < items.length - 1 ? (
            <Link to={item.to} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </motion.div>
      ))}
    </nav>
  )
}
