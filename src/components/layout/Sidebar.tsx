import { useState, useEffect } from 'react'
import { Link, useMatchRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Store, Map, ShoppingCart,
  PanelRightClose, PanelRightOpen,
  Package, Users, LayoutGrid, Receipt, ShieldCheck, BarChart3, Bell,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const matchRoute = useMatchRoute()
  const location = useLocation()
  const navigate = useNavigate()

  const isStoreManager = !!matchRoute({ to: '/store-manager', fuzzy: true })
  const activeView = isStoreManager
    ? (location.search as Record<string, string>).view || 'overview'
    : null

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.()
  }, [location.pathname, location.search, onMobileClose])

  function NavItem({ to, label, icon: Icon, isActive }: {
    to: string; label: string; icon: typeof LayoutDashboard; isActive: boolean
  }) {
    return (
      <Link to={to}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-[10px] transition-colors cursor-pointer',
            isActive
              ? 'bg-[#DC4E59]/8 text-[#DC4E59] font-medium'
              : 'text-[#4A5568] hover:bg-[#FDF8F6] hover:text-[#2D3748]'
          )}
        >
          <Icon className={cn('w-[18px] h-[18px] shrink-0', !mobileOpen && collapsed && 'lg:mx-auto')} />
          <AnimatePresence mode="wait">
            {(mobileOpen || !collapsed) && (
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
        onClick={() => navigate({ to: '/store-manager', search: { view } })}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-[10px] transition-all cursor-pointer w-full text-right',
          isActive
            ? 'bg-[#DC4E59]/8 text-[#DC4E59] font-semibold border border-[#DC4E59]/15'
            : 'text-[#4A5568] hover:bg-[#FDF8F6] hover:text-[#2D3748]'
        )}
      >
        <Icon className={cn('w-4 h-4 shrink-0', !mobileOpen && collapsed && 'lg:mx-auto')} />
        <AnimatePresence mode="wait">
          {(mobileOpen || !collapsed) && (
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

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-warm-border justify-between">
        <AnimatePresence mode="wait">
          {(mobileOpen || !collapsed) ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DC4E59, #E8777F)' }}>
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-base text-[#2D3748]">Sapir Analytics</span>
            </motion.div>
          ) : (
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #DC4E59, #E8777F)' }}>
              <span className="text-white font-bold text-sm">S</span>
            </div>
          )}
        </AnimatePresence>
        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded-[10px] text-[#A0AEC0] hover:bg-[#FDF8F6]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {isStoreManager ? (
          <>
            <div className="py-3 px-2">
              {(mobileOpen || !collapsed) && (
                <p className="px-3 pb-2 text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider">ניווט סניף</p>
              )}
              <div className="space-y-0.5">
                {storeCategories.map(cat => <CategoryItem key={cat.view} {...cat} />)}
              </div>
            </div>
            <div className="mx-3 h-px bg-warm-separator" />
            <div className="py-3 px-2">
              {(mobileOpen || !collapsed) && (
                <p className="px-3 pb-2 text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider">ניווט ראשי</p>
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
      <div className="p-3 border-t border-warm-border">
        <AnimatePresence mode="wait">
          {(mobileOpen || !collapsed) && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[11px] text-[#A0AEC0] text-center">דצמבר 2025</motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex fixed top-0 right-0 h-screen bg-white border-s border-warm-border z-40 flex-col"
      >
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -start-3 top-[4.5rem] w-6 h-6 rounded-full bg-white border border-warm-border flex items-center justify-center hover:bg-[#FDF8F6] transition-colors"
        >
          {collapsed ? <PanelRightOpen className="w-3 h-3 text-[#A0AEC0]" /> : <PanelRightClose className="w-3 h-3 text-[#A0AEC0]" />}
        </button>
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 right-0 h-screen w-[280px] bg-white border-s border-warm-border z-50 flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
