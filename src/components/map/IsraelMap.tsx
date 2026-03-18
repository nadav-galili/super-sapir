import { MapContainer, TileLayer } from 'react-leaflet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { BranchMarker } from './BranchMarker'
import type { Branch } from '@/data/types'
import 'leaflet/dist/leaflet.css'

interface IsraelMapProps {
  branches: Branch[]
  onBranchClick?: (branchId: string) => void
}

export function IsraelMap({ branches, onBranchClick }: IsraelMapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">מפת סניפים</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[550px] rounded-b-lg overflow-hidden">
            <MapContainer
              center={[31.5, 34.8]}
              zoom={8}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {branches.map((branch, i) => (
                <BranchMarker
                  key={branch.id}
                  branch={branch}
                  delay={i * 50}
                  onClick={() => onBranchClick?.(branch.id)}
                />
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
