export interface ChainSupplier {
  id: string
  name: string
  sales: number
  targetSales: number
  grossProfitPercent: number
}

const suppliers: ChainSupplier[] = [
  { id: 'sup-01', name: 'תנובה', sales: 18_420_000, targetSales: 19_000_000, grossProfitPercent: 24.2 },
  { id: 'sup-02', name: 'שטראוס', sales: 14_850_000, targetSales: 14_200_000, grossProfitPercent: 27.8 },
  { id: 'sup-03', name: 'אסם-נסטלה', sales: 12_300_000, targetSales: 13_100_000, grossProfitPercent: 26.1 },
  { id: 'sup-04', name: 'יוניליוור', sales: 9_780_000, targetSales: 10_500_000, grossProfitPercent: 29.4 },
  { id: 'sup-05', name: 'דיפלומט', sales: 8_640_000, targetSales: 8_200_000, grossProfitPercent: 22.6 },
  { id: 'sup-06', name: 'סנו', sales: 7_120_000, targetSales: 7_500_000, grossProfitPercent: 31.2 },
  { id: 'sup-07', name: 'עלית', sales: 6_950_000, targetSales: 6_400_000, grossProfitPercent: 33.5 },
  { id: 'sup-08', name: 'שסטוביץ', sales: 5_430_000, targetSales: 5_800_000, grossProfitPercent: 18.9 },
  { id: 'sup-09', name: 'P&G', sales: 4_870_000, targetSales: 5_200_000, grossProfitPercent: 28.7 },
  { id: 'sup-10', name: 'קימברלי קלארק', sales: 4_210_000, targetSales: 4_000_000, grossProfitPercent: 21.3 },
]

export function getTopSuppliers(): ChainSupplier[] {
  return suppliers
}

export function getMostProfitableSupplier(): ChainSupplier {
  return suppliers.reduce((best, s) => s.grossProfitPercent > best.grossProfitPercent ? s : best)
}

export function getAtRiskSupplier(): ChainSupplier {
  return suppliers.reduce((worst, s) => {
    const worstPct = worst.targetSales > 0 ? worst.sales / worst.targetSales : 1
    const sPct = s.targetSales > 0 ? s.sales / s.targetSales : 1
    return sPct < worstPct ? s : worst
  })
}

export function getFastestGrowingSupplier(): ChainSupplier {
  return suppliers.reduce((best, s) => {
    const bestPct = best.targetSales > 0 ? best.sales / best.targetSales : 1
    const sPct = s.targetSales > 0 ? s.sales / s.targetSales : 1
    return sPct > bestPct ? s : best
  })
}
