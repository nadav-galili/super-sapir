import { Calendar, Menu } from 'lucide-react'

interface HeaderProps {
  title: string
  onMenuToggle?: () => void
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  return (
    <header className="h-14 border-b border-warm-border bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-[10px] text-[#4A5568] hover:bg-[#FDF8F6] transition-colors"
          aria-label="תפריט"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-[#2D3748]">{title}</h1>
      </div>
      <div className="flex items-center gap-2 text-sm text-[#A0AEC0]">
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">דצמבר 2025</span>
        <span className="sm:hidden text-xs">12/2025</span>
      </div>
    </header>
  )
}
