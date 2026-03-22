import type { ComparisonMode } from '@/data/types'

interface ComparisonToggleProps {
  value: ComparisonMode
  onChange: (mode: ComparisonMode) => void
}

const OPTIONS: { value: ComparisonMode; label: string }[] = [
  { value: 'vs-target', label: 'מול יעד' },
  { value: 'vs-last-year', label: 'מול שנה קודמת' },
  { value: 'vs-last-month', label: 'מול חודש קודם' },
]

export function ComparisonToggle({ value, onChange }: ComparisonToggleProps) {
  return (
    <div className="inline-flex rounded-[10px] border border-[#FFE8DE] bg-white p-1 gap-1">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => opt.value !== value && onChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-all ${
            value === opt.value
              ? 'bg-[#DC4E59] text-white shadow-sm'
              : 'text-[#4A5568] hover:bg-[#FDF8F6]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
