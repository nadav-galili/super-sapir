import { createRootRoute, Outlet, useMatches } from '@tanstack/react-router'
import { DirectionProvider } from '@radix-ui/react-direction'
import { AnimatePresence } from 'motion/react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { APP_NAME } from '@/lib/branding'

const pageTitles: Record<string, string> = {
  '/': 'סקירה כללית',
  '/store-manager': 'לוח בקרה - מנהל סניף',
  '/division-manager': 'לוח בקרה - מנהל אזור',
  '/category-manager': 'לוח בקרה - מנהל קטגוריה',
  '/category-manager-v2': 'לוח בקרה - מנהל קטגוריה V2',
}

function RootLayout() {
  const matches = useMatches()
  const currentPath = matches[matches.length - 1]?.pathname ?? '/'
  const basePath = '/' + (currentPath.split('/')[1] ?? '')
  const title = pageTitles[basePath] ?? APP_NAME
  const isHome = currentPath === '/'

  if (isHome) {
    return (
      <DirectionProvider dir="rtl">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </DirectionProvider>
    )
  }

  return (
    <DirectionProvider dir="rtl">
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <Header title={title} />
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </SidebarInset>
      </SidebarProvider>
    </DirectionProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
