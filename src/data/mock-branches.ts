import type { Branch } from './types'
import { haderaBranch } from './hadera-branch'
import { generateBranch } from './generators'

const mockBranchDefs: { id: string; name: string; num: number; region: string; lat: number; lng: number; scale: number; format: 'big' | 'city' }[] = [
  { id: 'haifa-12', name: 'חיפה', num: 12, region: 'north', lat: 32.7940, lng: 34.9896, scale: 1.3, format: 'city' },
  { id: 'afula-28', name: 'עפולה', num: 28, region: 'north', lat: 32.6070, lng: 35.2882, scale: 0.7, format: 'city' },
  { id: 'tiberias-35', name: 'טבריה', num: 35, region: 'north', lat: 32.7922, lng: 35.5312, scale: 0.6, format: 'city' },
  { id: 'netanya-18', name: 'נתניה', num: 18, region: 'center', lat: 32.3215, lng: 34.8532, scale: 1.1, format: 'city' },
  { id: 'tlv-03', name: 'תל אביב', num: 3, region: 'center', lat: 32.0853, lng: 34.7818, scale: 1.5, format: 'big' },
  { id: 'kfar-saba-22', name: 'כפר סבא', num: 22, region: 'center', lat: 32.1780, lng: 34.9070, scale: 0.9, format: 'city' },
  { id: 'modiin-31', name: 'מודיעין', num: 31, region: 'center', lat: 31.8969, lng: 35.0104, scale: 0.85, format: 'city' },
  { id: 'rishon-07', name: 'ראשון לציון', num: 7, region: 'south', lat: 31.9730, lng: 34.7925, scale: 1.2, format: 'big' },
  { id: 'ashdod-15', name: 'אשדוד', num: 15, region: 'south', lat: 31.8014, lng: 34.6435, scale: 1.0, format: 'city' },
  { id: 'beer-sheva-25', name: 'באר שבע', num: 25, region: 'south', lat: 31.2518, lng: 34.7913, scale: 1.1, format: 'city' },
  { id: 'eilat-40', name: 'אילת', num: 40, region: 'south', lat: 29.5569, lng: 34.9498, scale: 0.5, format: 'city' },
]

export const allBranches: Branch[] = [
  haderaBranch,
  ...mockBranchDefs.map(d =>
    generateBranch(d.id, d.name, d.num, d.region, d.lat, d.lng, d.scale, d.format)
  ),
]

export function getBranch(id: string): Branch | undefined {
  return allBranches.find(b => b.id === id)
}

export function getBranchesByRegion(regionId: string): Branch[] {
  return allBranches.filter(b => b.regionId === regionId)
}
