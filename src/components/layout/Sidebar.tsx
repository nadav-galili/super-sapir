import { Link, useMatchRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { currentMonthYear } from '@/data/constants'
import {
  LayoutDashboard, Store, Map, ShoppingCart, BarChart3,
  Package, Users, LayoutGrid, Bell, Sparkles,
} from 'lucide-react'
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { BrandLogo } from '@/components/branding/BrandLogo'

const generalNavItems = [
  { to: '/', label: 'סקירה כללית', icon: LayoutDashboard },
  { to: '/store-manager', label: 'מנהל סניף', icon: Store },
  { to: '/division-manager', label: 'מנהל אזור', icon: Map },
  { to: '/category-manager', label: 'מנהל קטגוריה', icon: ShoppingCart },
  { to: '/category-manager-v2', label: 'מנהל קטגוריה V2', icon: BarChart3 },
] as const

const storeCategories = [
  { view: 'overview', label: 'סקירה כללית', icon: LayoutDashboard },
  { view: 'inventory', label: 'מלאי', icon: Package },
  { view: 'hr', label: 'כח אדם', icon: Users },
  { view: 'departments', label: 'מחלקות', icon: LayoutGrid },

  { view: 'alerts', label: 'התראות', icon: Bell },
  { view: 'ai', label: 'ניתוח AI', icon: Sparkles },
] as const

function SidebarLogo() {
  const { state } = useSidebar()
  const expanded = state === 'expanded'

  return <BrandLogo size={36} showName={expanded} compact />
}

export function AppSidebar() {
  const matchRoute = useMatchRoute()
  const location = useLocation()
  const navigate = useNavigate()
  const { state, isMobile, setOpenMobile } = useSidebar()

  const isStoreManager = !!matchRoute({ to: '/store-manager', fuzzy: true })
  const activeView = isStoreManager
    ? (location.search as Record<string, string>).view || 'overview'
    : null
  const expanded = state === 'expanded'

  const closeMobileOnNav = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <SidebarRoot side="right" collapsible="icon">
      {/* Collapse trigger — desktop only */}
      {!isMobile && (
        <SidebarTrigger className="absolute -start-3 top-[4.5rem] z-20" />
      )}

      <SidebarHeader className="h-14 justify-center px-4 border-b border-warm-border">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        {isStoreManager ? (
          <>
            {/* Store manager category nav */}
            <SidebarGroup>
              <SidebarGroupLabel>ניווט סניף</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {storeCategories.map((cat) => (
                    <SidebarMenuItem key={cat.view}>
                      <SidebarMenuButton
                        variant="category"
                        isActive={activeView === cat.view}
                        onClick={() => {
                          navigate({ to: '/store-manager', search: { view: cat.view } })
                          closeMobileOnNav()
                        }}
                      >
                        <cat.icon className="w-4 h-4 shrink-0" />
                        {expanded && <span>{cat.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* General nav (secondary when on store-manager) */}
            <SidebarGroup>
              <SidebarGroupLabel>ניווט ראשי</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {generalNavItems.map((item) => {
                    const isActive = item.to === '/'
                      ? !!matchRoute({ to: '/', fuzzy: false })
                      : item.to !== '/store-manager' && !!matchRoute({ to: item.to, fuzzy: true })
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link to={item.to} onClick={closeMobileOnNav}>
                            <item.icon className="w-[18px] h-[18px] shrink-0" />
                            {expanded && <span>{item.label}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {generalNavItems.map((item) => {
                  const isActive = item.to === '/'
                    ? !!matchRoute({ to: '/', fuzzy: false })
                    : !!matchRoute({ to: item.to, fuzzy: true })
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.to} onClick={closeMobileOnNav}>
                          <item.icon className="w-[18px] h-[18px] shrink-0" />
                          {expanded && <span>{item.label}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-warm-border">
        {expanded && (
          <p className="text-[11px] text-[#A0AEC0] text-center">{currentMonthYear()}</p>
        )}
      </SidebarFooter>
    </SidebarRoot>
  )
}
