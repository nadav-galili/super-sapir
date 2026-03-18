import { REGIONS } from './constants'
import { allBranches } from './mock-branches'

export interface RegionSummary {
  id: string
  name: string
  color: string
  totalSales: number
  branchCount: number
  avgQuality: number
  avgGrowth: number
  totalEmployees: number
}

export function getRegionSummaries(): RegionSummary[] {
  return REGIONS.map(region => {
    const branches = allBranches.filter(b => b.regionId === region.id)
    const totalSales = branches.reduce((s, b) => s + b.metrics.totalSales, 0)
    const avgQuality = Math.round(
      branches.reduce((s, b) => s + b.metrics.qualityScore, 0) / branches.length
    )
    const avgGrowth = +(
      branches.reduce((s, b) => s + b.metrics.yoyGrowth, 0) / branches.length
    ).toFixed(1)
    const totalEmployees = branches.reduce((s, b) => s + b.metrics.totalEmployees, 0)
    return {
      id: region.id,
      name: region.name,
      color: region.color,
      totalSales,
      branchCount: branches.length,
      avgQuality,
      avgGrowth,
      totalEmployees,
    }
  })
}

export function getCompanyTotals() {
  const totalSales = allBranches.reduce((s, b) => s + b.metrics.totalSales, 0)
  const avgQuality = Math.round(
    allBranches.reduce((s, b) => s + b.metrics.qualityScore, 0) / allBranches.length
  )
  const totalEmployees = allBranches.reduce((s, b) => s + b.metrics.totalEmployees, 0)
  const avgGrowth = +(
    allBranches.reduce((s, b) => s + b.metrics.yoyGrowth, 0) / allBranches.length
  ).toFixed(1)
  return { totalSales, avgQuality, totalEmployees, branchCount: allBranches.length, avgGrowth }
}
