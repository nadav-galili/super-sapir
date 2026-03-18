import type { Branch } from './types'
import { MONTHS_HE } from './constants'

export const haderaBranch: Branch = {
  id: 'hadera-44',
  name: 'חדרה',
  branchNumber: 44,
  regionId: 'north',
  lat: 32.4340,
  lng: 34.9196,
  metrics: {
    totalSales: 15_200_000,
    networkSales: 9_900_000,
    internetSales: 5_300_000,
    avgBasket: 37_506,
    customersPerDay: 270,
    qualityScore: 70,
    salaryCostPercent: 8.4,
    supplyRate: 93,
    meatWastePercent: 2.8,
    complaints: 12,
    staffingGaps: 3,
    overtimeHours: 145,
    turnoverRate: 14,
    totalEmployees: 85,
    yoyGrowth: 4.2,
  },
  departments: [
    { id: 'fruits', name: 'פירות וירקות', sales: 2_280_000, sharePercent: 15.0, targetShare: 14.5, yoyChange: 5.1, isPrivateLabel: false },
    { id: 'dairy', name: 'מוצרי חלב', sales: 2_128_000, sharePercent: 14.0, targetShare: 14.0, yoyChange: 3.2, isPrivateLabel: false },
    { id: 'meat', name: 'בשר ועוף', sales: 1_824_000, sharePercent: 12.0, targetShare: 12.5, yoyChange: -1.5, isPrivateLabel: false },
    { id: 'bakery', name: 'מאפייה', sales: 1_216_000, sharePercent: 8.0, targetShare: 7.5, yoyChange: 6.8, isPrivateLabel: false },
    { id: 'deli', name: 'מעדניה', sales: 1_064_000, sharePercent: 7.0, targetShare: 7.0, yoyChange: 2.1, isPrivateLabel: false },
    { id: 'frozen', name: 'קפואים', sales: 912_000, sharePercent: 6.0, targetShare: 6.5, yoyChange: -2.3, isPrivateLabel: false },
    { id: 'drinks', name: 'משקאות', sales: 1_368_000, sharePercent: 9.0, targetShare: 8.5, yoyChange: 7.2, isPrivateLabel: false },
    { id: 'snacks', name: 'חטיפים וממתקים', sales: 760_000, sharePercent: 5.0, targetShare: 5.0, yoyChange: 1.8, isPrivateLabel: false },
    { id: 'cleaning', name: 'ניקיון', sales: 608_000, sharePercent: 4.0, targetShare: 4.5, yoyChange: -0.5, isPrivateLabel: false },
    { id: 'hygiene', name: 'היגיינה וטיפוח', sales: 456_000, sharePercent: 3.0, targetShare: 3.5, yoyChange: 4.0, isPrivateLabel: false },
    { id: 'baby', name: 'תינוקות', sales: 304_000, sharePercent: 2.0, targetShare: 2.0, yoyChange: -3.1, isPrivateLabel: false },
    { id: 'pets', name: 'בעלי חיים', sales: 228_000, sharePercent: 1.5, targetShare: 1.5, yoyChange: 8.5, isPrivateLabel: false },
    { id: 'organic', name: 'אורגני ובריאות', sales: 456_000, sharePercent: 3.0, targetShare: 3.0, yoyChange: 12.3, isPrivateLabel: false },
    { id: 'wine', name: 'יינות ואלכוהול', sales: 760_000, sharePercent: 5.0, targetShare: 4.5, yoyChange: 3.7, isPrivateLabel: false },
    { id: 'general', name: 'מכולת כללית', sales: 836_000, sharePercent: 5.5, targetShare: 6.0, yoyChange: -1.2, isPrivateLabel: true },
  ],
  monthlyTrends: MONTHS_HE.map((month, i) => {
    const baseTotal = 15_200_000 / 12
    const seasonality = [0.85, 0.82, 0.95, 1.02, 1.05, 1.08, 1.0, 0.98, 1.15, 1.02, 0.95, 1.13]
    const total = Math.round(baseTotal * seasonality[i])
    const networkRatio = 0.65
    return {
      month,
      monthNum: i + 1,
      totalSales: total,
      networkSales: Math.round(total * networkRatio),
      internetSales: Math.round(total * (1 - networkRatio)),
      customers: Math.round(270 * seasonality[i]),
      avgBasket: Math.round(37_506 * (0.95 + Math.random() * 0.1)),
    }
  }),
}
