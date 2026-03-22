import { ArrowUpDown } from 'lucide-react'

interface SortHeaderProps {
  column: { toggleSorting: () => void }
  label: string
}

export function SortHeader({ column, label }: SortHeaderProps) {
  return (
    <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
      {label} <ArrowUpDown className="w-3 h-3" />
    </button>
  )
}
