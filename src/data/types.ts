export interface Branch {
  id: string
  name: string
  branchNumber: number
  regionId: string
  lat: number
  lng: number
  metrics: BranchMetrics
  departments: DepartmentMetrics[]
  monthlyTrends: MonthlyTrend[]
}

export interface BranchMetrics {
  totalSales: number
  networkSales: number
  avgBasket: number
  customersPerDay: number
  qualityScore: number
  salaryCostPercent: number
  supplyRate: number
  meatWastePercent: number
  complaints: number
  staffingGaps: number
  overtimeHours: number
  turnoverRate: number
  totalEmployees: number
  yoyGrowth: number
}

export interface DepartmentMetrics {
  id: string
  name: string
  sales: number
  sharePercent: number
  targetShare: number
  yoyChange: number
  isPrivateLabel: boolean
}

export interface MonthlyTrend {
  month: string
  monthNum: number
  totalSales: number
  networkSales: number
  customers: number
  avgBasket: number
}

export interface Region {
  id: string
  name: string
  color: string
  branches: string[]
}

export interface CompetitorData {
  id: string
  name: string
  avgBasket: number
  qualityScore: number
  priceIndex: number
  marketShare: number
}

export interface KPICardData {
  label: string
  value: number
  format: 'currency' | 'currencyShort' | 'number' | 'percent' | 'compact'
  trend: number
  trendLabel: string
  gradient: 'green' | 'blue' | 'orange' | 'purple' | 'teal' | 'pink' | 'red'
  icon?: string
}
