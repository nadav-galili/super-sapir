import type { Region, CompetitorData } from './types'

export const REGIONS: Region[] = [
  {
    id: 'north',
    name: 'צפון',
    color: '#3b82f6',
    branches: ['hadera-44', 'haifa-12', 'afula-28', 'tiberias-35'],
  },
  {
    id: 'center',
    name: 'מרכז',
    color: '#10b981',
    branches: ['netanya-18', 'tlv-03', 'kfar-saba-22', 'modiin-31'],
  },
  {
    id: 'south',
    name: 'דרום',
    color: '#f59e0b',
    branches: ['rishon-07', 'ashdod-15', 'beer-sheva-25', 'eilat-40'],
  },
]

export const DEPARTMENT_NAMES: Record<string, string> = {
  fruits: 'פירות וירקות',
  dairy: 'מוצרי חלב',
  meat: 'בשר ועוף',
  bakery: 'מאפייה',
  deli: 'מעדניה',
  frozen: 'קפואים',
  drinks: 'משקאות',
  snacks: 'חטיפים וממתקים',
  cleaning: 'ניקיון',
  hygiene: 'היגיינה וטיפוח',
  baby: 'תינוקות',
  pets: 'בעלי חיים',
  organic: 'אורגני ובריאות',
  wine: 'יינות ואלכוהול',
  general: 'מכולת כללית',
}

export const COMPETITORS: CompetitorData[] = [
  { id: 'shufersal', name: 'שופרסל', avgBasket: 185, qualityScore: 72, priceIndex: 102, marketShare: 34 },
  { id: 'yochananof', name: 'יוחננוף', avgBasket: 210, qualityScore: 68, priceIndex: 98, marketShare: 12 },
  { id: 'osher-ad', name: 'אושר עד', avgBasket: 155, qualityScore: 65, priceIndex: 94, marketShare: 8 },
  { id: 'politzer', name: 'פוליצר', avgBasket: 195, qualityScore: 70, priceIndex: 100, marketShare: 5 },
]

export const MONTHS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

export const PERFORMANCE_THRESHOLDS = {
  quality: { good: 75, fair: 60, poor: 45 },
  salaryCost: { good: 8.0, fair: 9.0, poor: 10.0 },
  supplyRate: { good: 95, fair: 90, poor: 85 },
  meatWaste: { good: 2.0, fair: 3.0, poor: 4.0 },
}
