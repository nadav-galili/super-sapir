import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getTargetStatusColor } from '@/lib/colors'
import { formatCurrencyShort } from '@/lib/format'
import type { Branch } from '@/data/types'

interface BranchMarkerProps {
  branch: Branch
  delay?: number
  onClick?: () => void
}

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

export function BranchMarker({ branch, onClick }: BranchMarkerProps) {
  const color = getTargetStatusColor(branch.metrics.qualityScore, 100)
  const icon = createColoredIcon(color)

  return (
    <Marker
      position={[branch.lat, branch.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick?.() }}
    >
      <Popup>
        <div dir="rtl" className="text-sm min-w-[180px]">
          <p className="font-bold text-base mb-1">{branch.name} #{branch.branchNumber}</p>
          <div className="space-y-1">
            <p>מכירות: <span className="font-semibold" dir="ltr">{formatCurrencyShort(branch.metrics.totalSales)}</span></p>
            <p>ציון איכות: <span className="font-semibold" dir="ltr">{branch.metrics.qualityScore}</span></p>
            <p>צמיחה: <span className="font-semibold" dir="ltr">{branch.metrics.yoyGrowth}%</span></p>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
