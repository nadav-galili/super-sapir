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
  // Promo simulator extension — see decisions/2026-05-02-promo-simulator-taxonomy.md
  {
    id: "sup-26",
    name: "קוקה קולה",
    sales: 4_300_000,
    targetSales: 4_500_000,
    grossProfitPercent: 24.6,
  },
  {
    id: "sup-27",
    name: "טמפו",
    sales: 2_900_000,
    targetSales: 3_100_000,
    grossProfitPercent: 26.2,
  },
  {
    id: "sup-28",
    name: "רד בול",
    sales: 1_650_000,
    targetSales: 1_500_000,
    grossProfitPercent: 32.4,
  },
  {
    id: "sup-29",
    name: "נביעות",
    sales: 2_100_000,
    targetSales: 2_000_000,
    grossProfitPercent: 19.8,
  },
  {
    id: "sup-30",
    name: "עין גדי",
    sales: 1_240_000,
    targetSales: 1_300_000,
    grossProfitPercent: 21.5,
  },
  {
    id: "sup-31",
    name: "יקבי הרי גליל",
    sales: 1_780_000,
    targetSales: 1_700_000,
    grossProfitPercent: 33.1,
  },
  {
    id: "sup-32",
    name: "ברקן",
    sales: 1_540_000,
    targetSales: 1_600_000,
    grossProfitPercent: 31.2,
  },
  {
    id: "sup-33",
    name: "יקבי כרמל",
    sales: 1_320_000,
    targetSales: 1_400_000,
    grossProfitPercent: 30.5,
  },
  {
    id: "sup-34",
    name: "יטבתה",
    sales: 2_650_000,
    targetSales: 2_700_000,
    grossProfitPercent: 22.8,
  },
  {
    id: "sup-35",
    name: "גד",
    sales: 1_180_000,
    targetSales: 1_100_000,
    grossProfitPercent: 28.9,
  },
  {
    id: "sup-36",
    name: "סוגת",
    sales: 1_960_000,
    targetSales: 2_000_000,
    grossProfitPercent: 18.2,
  },
  {
    id: "sup-37",
    name: "ברילה",
    sales: 1_420_000,
    targetSales: 1_500_000,
    grossProfitPercent: 27.6,
  },
  {
    id: "sup-38",
    name: "אגרקסקו",
    sales: 2_750_000,
    targetSales: 2_600_000,
    grossProfitPercent: 38.1,
  },
  {
    id: "sup-39",
    name: "יבול שדות",
    sales: 1_870_000,
    targetSales: 1_900_000,
    grossProfitPercent: 35.4,
  },
  {
    id: "sup-40",
    name: "מהדרין",
    sales: 2_140_000,
    targetSales: 2_250_000,
    grossProfitPercent: 33.7,
  },
  {
    id: "sup-41",
    name: "פרי גן",
    sales: 1_640_000,
    targetSales: 1_700_000,
    grossProfitPercent: 36.8,
  },
  {
    id: "sup-42",
    name: "ירקות השרון",
    sales: 1_980_000,
    targetSales: 1_900_000,
    grossProfitPercent: 34.2,
  },
  {
    id: "sup-43",
    name: "עוף העמק",
    sales: 2_420_000,
    targetSales: 2_500_000,
    grossProfitPercent: 16.8,
  },
  {
    id: "sup-44",
    name: "עוף טוב",
    sales: 2_180_000,
    targetSales: 2_100_000,
    grossProfitPercent: 17.5,
  },
  {
    id: "sup-45",
    name: "מאמא עוף",
    sales: 1_540_000,
    targetSales: 1_600_000,
    grossProfitPercent: 18.2,
  },
  {
    id: "sup-46",
    name: "Pyrex",
    sales: 720_000,
    targetSales: 800_000,
    grossProfitPercent: 36.4,
  },
  {
    id: "sup-47",
    name: "Tefal",
    sales: 980_000,
    targetSales: 950_000,
    grossProfitPercent: 34.8,
  },
  {
    id: "sup-48",
    name: "נעמן",
    sales: 540_000,
    targetSales: 600_000,
    grossProfitPercent: 31.2,
  },
  {
    id: "sup-49",
    name: "Arcosteel",
    sales: 460_000,
    targetSales: 500_000,
    grossProfitPercent: 33.6,
  },
  {
    id: "sup-50",
    name: "סלמון נורווגי בע״מ",
    sales: 1_320_000,
    targetSales: 1_400_000,
    grossProfitPercent: 19.4,
  },
];

export function getTopSuppliers(): ChainSupplier[] {
  return suppliers;
}

export function getSupplierById(id: string): ChainSupplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getSuppliersByIds(ids: readonly string[]): ChainSupplier[] {
  return ids
    .map((id) => suppliers.find((s) => s.id === id))
    .filter((s): s is ChainSupplier => s !== undefined);
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
