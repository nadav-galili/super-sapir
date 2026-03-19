import { useState } from 'react'
import { Link, useMatchRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Store, Map, ShoppingCart,
  PanelRightClose, PanelRightOpen,
  Package, Users, LayoutGrid, Receipt, ShieldCheck, BarChart3, Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const generalNavItems = [
  { to: '/', label: 'סקירה כללית', icon: LayoutDashboard },
  { to: '/store-manager', label: 'מנהל סניף', icon: Store },
  { to: '/division-manager', label: 'מנהל אזור', icon: Map },
  { to: '/category-manager', label: 'מנהל קטגוריה', icon: ShoppingCart },
] as const

const storeCategories = [
  { view: 'overview', label: 'סקירה כללית', icon: LayoutDashboard },
  { view: 'inventory', label: 'מלאי', icon: Package },
  { view: 'hr', label: 'כח אדם', icon: Users },
  { view: 'departments', label: 'מחלקות', icon: LayoutGrid },
  { view: 'costs', label: 'הוצאות ועלויות', icon: Receipt },
  { view: 'quality', label: 'בקרת איכות', icon: ShieldCheck },
  { view: 'reports', label: 'דוחות', icon: BarChart3 },
  { view: 'alerts', label: 'התראות', icon: Bell },
] as const

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const matchRoute = useMatchRoute()
  const location = useLocation()
  const navigate = useNavigate()

  const isStoreManager = !!matchRoute({ to: '/store-manager', fuzzy: true })
  const activeView = isStoreManager
    ? (location.search as Record<string, string>).view || 'overview'
    : null

  function NavItem({ to, label, icon: Icon, isActive }: {
    to: string; label: string; icon: typeof LayoutDashboard; isActive: boolean
  }) {
    return (
      <Link to={to}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer',
            isActive
              ? 'bg-slate-800 text-white font-medium'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <Icon className={cn('w-4.5 h-4.5 shrink-0', collapsed && 'mx-auto')} />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm whitespace-nowrap overflow-hidden"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    )
  }

  function CategoryItem({ view, label, icon: Icon }: {
    view: string; label: string; icon: typeof LayoutDashboard
  }) {
    const isActive = activeView === view
    return (
      <button
        onClick={() => navigate({
          to: '/store-manager',
          search: { view },
        })}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer w-full text-right',
          isActive
            ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        )}
      >
        <Icon className={cn('w-4 h-4 shrink-0', collapsed && 'mx-auto', isActive && 'text-teal-600')} />
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-[13px] whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-screen bg-white border-s border-border z-40 flex flex-col shadow-sm"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-base text-slate-800">Sapir Analytics</span>
            </motion.div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -start-3 top-[4.5rem] w-6 h-6 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
      >
        {collapsed ? <PanelRightOpen className="w-3 h-3" /> : <PanelRightClose className="w-3 h-3" />}
      </button>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {isStoreManager ? (
          <>
            {/* Store Manager Categories */}
            <div className="py-3 px-2">
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ניווט סניף
                </p>
              )}
              <div className="space-y-0.5">
                {storeCategories.map(cat => (
                  <CategoryItem key={cat.view} {...cat} />
                ))}
              </div>
            </div>

            <Separator className="mx-3" />

            {/* General nav at bottom */}
            <div className="py-3 px-2">
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ניווט ראשי
                </p>
              )}
              <div className="space-y-0.5">
                {generalNavItems.map(item => {
                  const isActive = item.to === '/'
                    ? !!matchRoute({ to: '/', fuzzy: false })
                    : item.to !== '/store-manager' && !!matchRoute({ to: item.to, fuzzy: true })
                  return <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} isActive={isActive} />
                })}
              </div>
            </div>
          </>
        ) : (
          /* Normal navigation */
          <nav className="py-3 px-2 space-y-0.5">
            {generalNavItems.map(item => {
              const isActive = item.to === '/'
                ? !!matchRoute({ to: '/', fuzzy: false })
                : !!matchRoute({ to: item.to, fuzzy: true })
              return <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} isActive={isActive} />
            })}
          </nav>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[10px] text-muted-foreground text-center">
              דצמבר 2025
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
