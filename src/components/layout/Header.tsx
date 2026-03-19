import { Calendar } from 'lucide-react'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-14 border-b border-warm-border bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-bold text-[#2D3748]">{title}</h1>
      <div className="flex items-center gap-2 text-sm text-[#A0AEC0]">
        <Calendar className="w-4 h-4" />
        <span>דצמבר 2025</span>
      </div>
    </header>
  )
}
