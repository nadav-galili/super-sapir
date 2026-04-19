export interface ChainSupplier {
  id: string;
  name: string;
  sales: number;
  targetSales: number;
  grossProfitPercent: number;
}

const suppliers: ChainSupplier[] = [
  {
    id: "sup-01",
    name: "תנובה",
    sales: 18_420_000,
    targetSales: 19_000_000,
    grossProfitPercent: 24.2,
  },
  {
    id: "sup-02",
    name: "שטראוס",
    sales: 14_850_000,
    targetSales: 14_200_000,
    grossProfitPercent: 27.8,
  },
  {
    id: "sup-03",
    name: "אסם-נסטלה",
    sales: 12_300_000,
    targetSales: 13_100_000,
    grossProfitPercent: 26.1,
  },
  {
    id: "sup-04",
    name: "יוניליוור",
    sales: 9_780_000,
    targetSales: 10_500_000,
    grossProfitPercent: 29.4,
  },
  {
    id: "sup-05",
    name: "דיפלומט",
    sales: 8_640_000,
    targetSales: 8_200_000,
    grossProfitPercent: 22.6,
  },
  {
    id: "sup-06",
    name: "סנו",
    sales: 7_120_000,
    targetSales: 7_500_000,
    grossProfitPercent: 31.2,
  },
  {
    id: "sup-07",
    name: "עלית",
    sales: 6_950_000,
    targetSales: 6_400_000,
    grossProfitPercent: 33.5,
  },
  {
    id: "sup-08",
    name: "שסטוביץ",
    sales: 5_430_000,
    targetSales: 5_800_000,
    grossProfitPercent: 18.9,
  },
  {
    id: "sup-09",
    name: "P&G",
    sales: 4_870_000,
    targetSales: 5_200_000,
    grossProfitPercent: 28.7,
  },
  {
    id: "sup-10",
    name: "קימברלי קלארק",
    sales: 4_210_000,
    targetSales: 4_000_000,
    grossProfitPercent: 21.3,
  },
  {
    id: "sup-11",
    name: "אוסם",
    sales: 3_980_000,
    targetSales: 4_100_000,
    grossProfitPercent: 25.6,
  },
  {
    id: "sup-12",
    name: "נסטלה ישראל",
    sales: 3_740_000,
    targetSales: 3_500_000,
    grossProfitPercent: 30.1,
  },
  {
    id: "sup-13",
    name: "טרה",
    sales: 3_510_000,
    targetSales: 3_800_000,
    grossProfitPercent: 23.4,
  },
  {
    id: "sup-14",
    name: "ברמן",
    sales: 3_280_000,
    targetSales: 3_200_000,
    grossProfitPercent: 19.7,
  },
  {
    id: "sup-15",
    name: "הנקל",
    sales: 3_050_000,
    targetSales: 3_300_000,
    grossProfitPercent: 32.8,
  },
  {
    id: "sup-17",
    name: "כצט",
    sales: 2_640_000,
    targetSales: 2_900_000,
    grossProfitPercent: 20.5,
  },
  {
    id: "sup-18",
    name: "מאיר עזריה",
    sales: 2_410_000,
    targetSales: 2_300_000,
    grossProfitPercent: 26.9,
  },
  {
    id: "sup-19",
    name: "ג׳ונסון",
    sales: 2_180_000,
    targetSales: 2_400_000,
    grossProfitPercent: 28.3,
  },
  {
    id: "sup-20",
    name: "זוגלובק",
    sales: 1_960_000,
    targetSales: 2_100_000,
    grossProfitPercent: 22.1,
  },
  {
    id: "sup-21",
    name: "פריגת",
    sales: 1_750_000,
    targetSales: 1_600_000,
    grossProfitPercent: 34.6,
  },
  {
    id: "sup-22",
    name: "ויסוצקי",
    sales: 1_530_000,
    targetSales: 1_700_000,
    grossProfitPercent: 29.0,
  },
  {
    id: "sup-23",
    name: "אחוה",
    sales: 1_320_000,
    targetSales: 1_250_000,
    grossProfitPercent: 27.4,
  },
  {
    id: "sup-24",
    name: "גלידות שטראוס",
    sales: 1_100_000,
    targetSales: 1_200_000,
    grossProfitPercent: 31.7,
  },
  {
    id: "sup-25",
    name: "יפאורה תבורי",
    sales: 980_000,
    targetSales: 1_050_000,
    grossProfitPercent: 24.8,
  },
];

export function getTopSuppliers(): ChainSupplier[] {
  return suppliers;
}

export function getMostProfitableSupplier(): ChainSupplier {
  return suppliers.reduce((best, s) =>
    s.grossProfitPercent > best.grossProfitPercent ? s : best
  );
}

export function getAtRiskSupplier(): ChainSupplier {
  return suppliers.reduce((worst, s) => {
    const worstPct =
      worst.targetSales > 0 ? worst.sales / worst.targetSales : 1;
    const sPct = s.targetSales > 0 ? s.sales / s.targetSales : 1;
    return sPct < worstPct ? s : worst;
  });
}

export function getFastestGrowingSupplier(): ChainSupplier {
  return suppliers.reduce((best, s) => {
    const bestPct = best.targetSales > 0 ? best.sales / best.targetSales : 1;
    const sPct = s.targetSales > 0 ? s.sales / s.targetSales : 1;
    return sPct > bestPct ? s : best;
  });
}
