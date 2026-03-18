import { useState } from 'react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  Store,
  Map,
  ShoppingCart,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/', label: 'סקירה כללית', icon: LayoutDashboard },
  { to: '/store-manager', label: 'מנהל סניף', icon: Store },
  { to: '/division-manager', label: 'מנהל אזור', icon: Map },
  { to: '/category-manager', label: 'מנהל קטגוריה', icon: ShoppingCart },
] as const

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const matchRoute = useMatchRoute()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-screen bg-white border-s border-border z-40 flex flex-col shadow-sm"
    >
      {/* Logo area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sapir Analytics
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -start-3 top-20 w-6 h-6 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <PanelRightOpen className="w-3 h-3" />
        ) : (
          <PanelRightClose className="w-3 h-3" />
        )}
      </button>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(item => {
          const isActive = item.to === '/'
            ? matchRoute({ to: '/', fuzzy: false })
            : matchRoute({ to: item.to, fuzzy: true })
          const Icon = item.icon

          return (
            <Link key={item.to} to={item.to}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
                  isActive
                    ? 'bg-gradient-to-l from-blue-50 to-purple-50 text-blue-700 font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', collapsed && 'mx-auto')} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground text-center"
            >
              דצמבר 2025
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
