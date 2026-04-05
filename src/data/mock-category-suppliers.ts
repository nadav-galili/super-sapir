export interface CategorySupplier {
  id: string
  name: string
  sales: number
  targetSales: number
  grossProfitPercent: number
  stockoutRate: number
  productCount: number
}

// Suppliers per category/department — realistic Israeli suppliers
const CATEGORY_SUPPLIERS: Record<string, CategorySupplier[]> = {
  vegetables: [
    { id: 'vs-01', name: 'ירקות השרון', sales: 420_000, targetSales: 450_000, grossProfitPercent: 34.2, stockoutRate: 2.8, productCount: 45 },
    { id: 'vs-02', name: 'מחסני ירק בע״מ', sales: 380_000, targetSales: 360_000, grossProfitPercent: 31.5, stockoutRate: 3.1, productCount: 38 },
    { id: 'vs-03', name: 'פרי גן', sales: 310_000, targetSales: 340_000, grossProfitPercent: 36.8, stockoutRate: 4.2, productCount: 32 },
    { id: 'vs-04', name: 'טרי מהשדה', sales: 195_000, targetSales: 200_000, grossProfitPercent: 29.4, stockoutRate: 1.9, productCount: 28 },
    { id: 'vs-05', name: 'אגרקסקו', sales: 140_000, targetSales: 130_000, grossProfitPercent: 38.1, stockoutRate: 2.5, productCount: 22 },
  ],
  grocery: [
    { id: 'gr-01', name: 'אסם-נסטלה', sales: 680_000, targetSales: 720_000, grossProfitPercent: 26.1, stockoutRate: 1.5, productCount: 120 },
    { id: 'gr-02', name: 'שטראוס', sales: 520_000, targetSales: 490_000, grossProfitPercent: 28.4, stockoutRate: 1.2, productCount: 95 },
    { id: 'gr-03', name: 'עלית', sales: 410_000, targetSales: 380_000, grossProfitPercent: 33.5, stockoutRate: 1.8, productCount: 65 },
    { id: 'gr-04', name: 'יוניליוור', sales: 280_000, targetSales: 310_000, grossProfitPercent: 24.8, stockoutRate: 2.1, productCount: 78 },
    { id: 'gr-05', name: 'דיפלומט', sales: 136_000, targetSales: 126_000, grossProfitPercent: 22.3, stockoutRate: 2.8, productCount: 52 },
  ],
  dairy: [
    { id: 'da-01', name: 'תנובה', sales: 580_000, targetSales: 620_000, grossProfitPercent: 22.8, stockoutRate: 2.0, productCount: 85 },
    { id: 'da-02', name: 'שטראוס', sales: 390_000, targetSales: 370_000, grossProfitPercent: 25.6, stockoutRate: 1.8, productCount: 62 },
    { id: 'da-03', name: 'טרה', sales: 210_000, targetSales: 230_000, grossProfitPercent: 21.4, stockoutRate: 2.5, productCount: 45 },
    { id: 'da-04', name: 'גד', sales: 95_000, targetSales: 88_000, grossProfitPercent: 28.9, stockoutRate: 1.5, productCount: 28 },
    { id: 'da-05', name: 'שסטוביץ', sales: 51_000, targetSales: 55_000, grossProfitPercent: 19.2, stockoutRate: 3.4, productCount: 18 },
  ],
  'home-products': [
    { id: 'hp-01', name: 'סנו', sales: 320_000, targetSales: 340_000, grossProfitPercent: 31.2, stockoutRate: 2.8, productCount: 55 },
    { id: 'hp-02', name: 'P&G', sales: 280_000, targetSales: 260_000, grossProfitPercent: 28.7, stockoutRate: 1.6, productCount: 48 },
    { id: 'hp-03', name: 'קימברלי קלארק', sales: 195_000, targetSales: 210_000, grossProfitPercent: 21.3, stockoutRate: 3.2, productCount: 32 },
    { id: 'hp-04', name: 'יוניליוור', sales: 110_000, targetSales: 105_000, grossProfitPercent: 25.8, stockoutRate: 2.1, productCount: 26 },
    { id: 'hp-05', name: 'הנקל', sales: 58_000, targetSales: 65_000, grossProfitPercent: 23.4, stockoutRate: 4.1, productCount: 18 },
  ],
  drinks: [
    { id: 'dr-01', name: 'קוקה קולה', sales: 310_000, targetSales: 290_000, grossProfitPercent: 24.8, stockoutRate: 1.2, productCount: 35 },
    { id: 'dr-02', name: 'שטראוס מים', sales: 230_000, targetSales: 250_000, grossProfitPercent: 22.1, stockoutRate: 1.8, productCount: 28 },
    { id: 'dr-03', name: 'טמפו', sales: 180_000, targetSales: 170_000, grossProfitPercent: 26.3, stockoutRate: 2.4, productCount: 22 },
    { id: 'dr-04', name: 'פריגת', sales: 98_000, targetSales: 110_000, grossProfitPercent: 27.5, stockoutRate: 3.1, productCount: 18 },
    { id: 'dr-05', name: 'ברוקסטון', sales: 60_000, targetSales: 58_000, grossProfitPercent: 29.8, stockoutRate: 2.0, productCount: 12 },
  ],
  frozen: [
    { id: 'fr-01', name: 'שסטוביץ', sales: 290_000, targetSales: 310_000, grossProfitPercent: 19.8, stockoutRate: 3.5, productCount: 42 },
    { id: 'fr-02', name: 'תנובה', sales: 240_000, targetSales: 220_000, grossProfitPercent: 22.4, stockoutRate: 2.2, productCount: 35 },
    { id: 'fr-03', name: 'נסטלה', sales: 180_000, targetSales: 195_000, grossProfitPercent: 26.1, stockoutRate: 2.8, productCount: 28 },
    { id: 'fr-04', name: 'סוגת', sales: 96_000, targetSales: 88_000, grossProfitPercent: 21.5, stockoutRate: 1.9, productCount: 18 },
    { id: 'fr-05', name: 'פלדמן', sales: 50_000, targetSales: 55_000, grossProfitPercent: 18.2, stockoutRate: 4.5, productCount: 12 },
  ],
  household: [
    { id: 'hh-01', name: 'סנו', sales: 120_000, targetSales: 130_000, grossProfitPercent: 29.8, stockoutRate: 2.5, productCount: 38 },
    { id: 'hh-02', name: 'הנקל', sales: 85_000, targetSales: 80_000, grossProfitPercent: 24.6, stockoutRate: 3.1, productCount: 25 },
    { id: 'hh-03', name: 'P&G', sales: 72_000, targetSales: 78_000, grossProfitPercent: 27.2, stockoutRate: 2.0, productCount: 22 },
    { id: 'hh-04', name: 'טאצ׳', sales: 33_000, targetSales: 30_000, grossProfitPercent: 22.1, stockoutRate: 3.8, productCount: 15 },
    { id: 'hh-05', name: 'יוניליוור', sales: 21_000, targetSales: 24_000, grossProfitPercent: 25.4, stockoutRate: 2.8, productCount: 12 },
  ],
  'fresh-meat': [
    { id: 'fm-01', name: 'עוף העמק', sales: 85_000, targetSales: 95_000, grossProfitPercent: 16.8, stockoutRate: 5.2, productCount: 15 },
    { id: 'fm-02', name: 'זוגלובק', sales: 68_000, targetSales: 62_000, grossProfitPercent: 18.5, stockoutRate: 3.8, productCount: 12 },
    { id: 'fm-03', name: 'סוגת בשרים', sales: 45_000, targetSales: 50_000, grossProfitPercent: 15.2, stockoutRate: 6.1, productCount: 10 },
    { id: 'fm-04', name: 'דבח הצפון', sales: 31_000, targetSales: 28_000, grossProfitPercent: 14.8, stockoutRate: 4.2, productCount: 8 },
  ],
  bread: [
    { id: 'br-01', name: 'ברמן', sales: 72_000, targetSales: 68_000, grossProfitPercent: 35.8, stockoutRate: 2.1, productCount: 18 },
    { id: 'br-02', name: 'אנג׳ל', sales: 58_000, targetSales: 65_000, grossProfitPercent: 33.2, stockoutRate: 3.4, productCount: 15 },
    { id: 'br-03', name: 'לחמי', sales: 42_000, targetSales: 40_000, grossProfitPercent: 38.5, stockoutRate: 1.8, productCount: 12 },
    { id: 'br-04', name: 'מאפיות רמט', sales: 32_000, targetSales: 35_000, grossProfitPercent: 31.4, stockoutRate: 2.8, productCount: 10 },
  ],
  baby: [
    { id: 'bb-01', name: 'קימברלי קלארק', sales: 62_000, targetSales: 58_000, grossProfitPercent: 18.9, stockoutRate: 3.5, productCount: 12 },
    { id: 'bb-02', name: 'P&G', sales: 48_000, targetSales: 52_000, grossProfitPercent: 21.4, stockoutRate: 2.8, productCount: 10 },
    { id: 'bb-03', name: 'מטרנה', sales: 35_000, targetSales: 32_000, grossProfitPercent: 24.6, stockoutRate: 1.5, productCount: 8 },
    { id: 'bb-04', name: 'היפ', sales: 18_000, targetSales: 20_000, grossProfitPercent: 28.2, stockoutRate: 4.2, productCount: 6 },
  ],
  pastries: [
    { id: 'pa-01', name: 'ברמן', sales: 52_000, targetSales: 48_000, grossProfitPercent: 38.5, stockoutRate: 1.8, productCount: 14 },
    { id: 'pa-02', name: 'אנג׳ל', sales: 42_000, targetSales: 45_000, grossProfitPercent: 36.2, stockoutRate: 2.5, productCount: 12 },
    { id: 'pa-03', name: 'מאפיות ברדה', sales: 28_000, targetSales: 26_000, grossProfitPercent: 40.1, stockoutRate: 2.2, productCount: 8 },
    { id: 'pa-04', name: 'לחמי', sales: 18_000, targetSales: 20_000, grossProfitPercent: 34.8, stockoutRate: 3.1, productCount: 6 },
  ],
  deli: [
    { id: 'de-01', name: 'תנובה', sales: 52_000, targetSales: 55_000, grossProfitPercent: 28.4, stockoutRate: 2.2, productCount: 18 },
    { id: 'de-02', name: 'גד', sales: 38_000, targetSales: 35_000, grossProfitPercent: 31.2, stockoutRate: 1.8, productCount: 14 },
    { id: 'de-03', name: 'שטראוס', sales: 28_000, targetSales: 30_000, grossProfitPercent: 26.8, stockoutRate: 2.8, productCount: 10 },
    { id: 'de-04', name: 'גבינות הגליל', sales: 21_000, targetSales: 18_000, grossProfitPercent: 33.5, stockoutRate: 3.5, productCount: 8 },
  ],
  organic: [
    { id: 'or-01', name: 'הרדוף', sales: 32_000, targetSales: 30_000, grossProfitPercent: 38.5, stockoutRate: 2.8, productCount: 22 },
    { id: 'or-02', name: 'כרמית', sales: 22_000, targetSales: 25_000, grossProfitPercent: 42.1, stockoutRate: 3.5, productCount: 15 },
    { id: 'or-03', name: 'סודות המזרח', sales: 18_000, targetSales: 16_000, grossProfitPercent: 45.2, stockoutRate: 2.2, productCount: 12 },
    { id: 'or-04', name: 'ביונד', sales: 13_000, targetSales: 14_000, grossProfitPercent: 36.8, stockoutRate: 4.1, productCount: 8 },
  ],
  'fresh-fish': [
    { id: 'ff-01', name: 'דגי תבור', sales: 28_000, targetSales: 30_000, grossProfitPercent: 23.5, stockoutRate: 4.2, productCount: 10 },
    { id: 'ff-02', name: 'דגת', sales: 22_000, targetSales: 20_000, grossProfitPercent: 21.8, stockoutRate: 3.5, productCount: 8 },
    { id: 'ff-03', name: 'פישרמן', sales: 14_000, targetSales: 15_000, grossProfitPercent: 25.2, stockoutRate: 5.1, productCount: 6 },
    { id: 'ff-04', name: 'נורוויגן', sales: 8_000, targetSales: 7_000, grossProfitPercent: 28.4, stockoutRate: 3.8, productCount: 4 },
  ],
}

export function getCategorySuppliers(categoryId: string): CategorySupplier[] {
  return CATEGORY_SUPPLIERS[categoryId] ?? []
}
