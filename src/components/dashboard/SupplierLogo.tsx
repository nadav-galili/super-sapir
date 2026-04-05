import { useState } from 'react'
import { getSupplierLogo } from '@/data/supplier-logos'

interface SupplierLogoProps {
  name: string
  size?: number
}

export function SupplierLogo({ name, size = 28 }: SupplierLogoProps) {
  const url = getSupplierLogo(name)
  const [failed, setFailed] = useState(false)

  const initials = name.slice(0, 2)

  if (!url || failed) {
    return (
      <div
        className="rounded-[8px] bg-[#FDF8F6] border border-warm-border flex items-center justify-center text-[11px] font-bold text-[#A0AEC0] shrink-0"
        style={{ width: size, height: size }}
      >
        {initials}
      </div>
    )
  }

  return (
    <div
      className="rounded-[8px] overflow-hidden border border-warm-border bg-white shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src={url}
        alt={name}
        className="w-full h-full object-contain p-0.5"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
