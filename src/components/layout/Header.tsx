import { Calendar, Menu } from 'lucide-react'
import { currentMonthYear } from '@/data/constants'
import { useSidebar } from '@/components/ui/sidebar'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar()

  return (
    <header className="h-14 border-b border-warm-border bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-[10px] text-[#4A5568] hover:bg-[#FDF8F6] transition-colors"
            aria-label="תפריט"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-bold text-[#2D3748]">{title}</h1>
      </div>
      <div className="flex items-center gap-2 text-sm text-[#A0AEC0]">
        <Calendar className="w-4 h-4" />
        <span className="text-xs sm:text-sm">{currentMonthYear()}</span>
      </div>
    </header>
  )
}
