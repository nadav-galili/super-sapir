import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const SIDEBAR_WIDTH = '280px'
const SIDEBAR_WIDTH_ICON = '72px'

type SidebarContext = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider')
  return context
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) setOpenProp(openState)
      else _setOpen(openState)
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o)
  }, [isMobile, setOpen])

  const state = open ? 'expanded' : 'collapsed'

  const contextValue = React.useMemo<SidebarContext>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties
        }
        className={cn('group/sidebar-wrapper flex min-h-svh w-full overflow-x-hidden', props.className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  side = 'right',
  collapsible = 'icon',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div
        className={cn(
          'flex h-full w-[--sidebar-width] flex-col bg-white border-s border-warm-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="w-[--sidebar-width] bg-white p-0 [&>button]:hidden"
          style={{ '--sidebar-width': SIDEBAR_WIDTH } as React.CSSProperties}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="group peer hidden lg:block" data-state={state} data-collapsible={state === 'collapsed' ? collapsible : ''} data-side={side}>
      {/* Spacer that shrinks with the sidebar */}
      <div
        className="relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear"
        style={
          {
            width: state === 'collapsed' ? 'var(--sidebar-width-icon)' : 'var(--sidebar-width)',
          } as React.CSSProperties
        }
      />
      <div
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh flex-col lg:flex transition-[width] duration-200 ease-linear',
          side === 'right' ? 'right-0 border-s' : 'left-0 border-e',
          'w-[--sidebar-width] bg-white border-warm-border',
          state === 'collapsed' && 'w-[--sidebar-width-icon]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar, state } = useSidebar()

  return (
    <button
      data-sidebar="trigger"
      onClick={toggleSidebar}
      className={cn(
        'w-6 h-6 rounded-full bg-white border border-warm-border flex items-center justify-center hover:bg-[#FDF8F6] transition-colors',
        className
      )}
      {...props}
    >
      {state === 'collapsed' ? (
        <PanelRightOpen className="w-3 h-3 text-[#A0AEC0]" />
      ) : (
        <PanelRightClose className="w-3 h-3 text-[#A0AEC0]" />
      )}
    </button>
  )
}

export function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-[#FDF8F6] overflow-x-hidden',
        className
      )}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-sidebar="header" className={cn('flex flex-col gap-2', className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-sidebar="footer" className={cn('flex flex-col gap-2', className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="content"
      className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto', className)}
      {...props}
    />
  )
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-sidebar="group" className={cn('relative flex w-full min-w-0 flex-col py-2 px-2', className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<'div'>) {
  const { state } = useSidebar()
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        'px-3 pb-2 text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider truncate transition-[opacity] duration-200',
        state === 'collapsed' && 'opacity-0',
        className
      )}
      {...props}
    />
  )
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-sidebar="group-content" className={cn('w-full space-y-0.5', className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-0.5', className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-sidebar="menu-item" className={cn('group/menu-item relative', className)} {...props} />
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
  variant?: 'default' | 'category'
}) {
  const Comp = asChild ? Slot : 'button'
  const { state } = useSidebar()

  return (
    <Comp
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-right outline-none transition-colors',
        variant === 'category' ? 'text-[13px]' : 'text-sm',
        isActive
          ? variant === 'category'
            ? 'bg-[#DC4E59]/8 text-[#DC4E59] font-semibold border border-[#DC4E59]/15'
            : 'bg-[#DC4E59]/8 text-[#DC4E59] font-medium'
          : 'text-[#4A5568] hover:bg-[#FDF8F6] hover:text-[#2D3748]',
        state === 'collapsed' && 'justify-center px-2',
        className
      )}
      {...props}
    />
  )
}

export function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator className={cn('mx-3 bg-warm-separator', className)} {...props} />
}
