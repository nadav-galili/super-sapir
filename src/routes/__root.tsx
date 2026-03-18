import { createRootRoute, Outlet, useMatches } from '@tanstack/react-router'
import { DirectionProvider } from '@radix-ui/react-direction'
import { AnimatePresence } from 'motion/react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

const pageTitles: Record<string, string> = {
  '/': 'סקירה כללית',
  '/store-manager': 'לוח בקרה - מנהל סניף',
  '/division-manager': 'לוח בקרה - מנהל אזור',
  '/category-manager': 'לוח בקרה - מנהל קטגוריה',
}

function RootLayout() {
  const matches = useMatches()
  const currentPath = matches[matches.length - 1]?.pathname ?? '/'
  const basePath = '/' + (currentPath.split('/')[1] ?? '')
  const title = pageTitles[basePath] ?? 'Sapir Analytics'

  return (
    <DirectionProvider dir="rtl">
      <div className="min-h-screen bg-gray-50/50">
        <Sidebar />
        <div className="me-[280px] transition-all duration-300">
          <Header title={title} />
          <main>
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </main>
        </div>
      </div>
    </DirectionProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
