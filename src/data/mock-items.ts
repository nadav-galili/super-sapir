export interface ChainItem {
  id: string
  nameHe: string
  categoryId: string
  imageUrl: string
  monthlySales: number
  lastYearMonthlySales: number
  stockoutDays: number
  estimatedProfitLoss: number
  grossMarginPercent: number
}

const items: ChainItem[] = [
  { id: 'item-01', nameHe: 'חלב תנובה 3% 1 ליטר', categoryId: 'dairy', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=120&h=120&fit=crop', monthlySales: 482_000, lastYearMonthlySales: 445_000, stockoutDays: 2, estimatedProfitLoss: 28_500, grossMarginPercent: 22.4 },
  { id: 'item-02', nameHe: 'לחם אחיד פרוס 750 גר׳', categoryId: 'bread', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&h=120&fit=crop', monthlySales: 356_000, lastYearMonthlySales: 328_000, stockoutDays: 1, estimatedProfitLoss: 12_800, grossMarginPercent: 35.2 },
  { id: 'item-03', nameHe: 'ביצים L חופש 12 יח׳', categoryId: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=120&h=120&fit=crop', monthlySales: 412_000, lastYearMonthlySales: 389_000, stockoutDays: 3, estimatedProfitLoss: 45_200, grossMarginPercent: 18.6 },
  { id: 'item-04', nameHe: 'בננות קטיף 1 ק״ג', categoryId: 'vegetables', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=120&h=120&fit=crop', monthlySales: 389_000, lastYearMonthlySales: 362_000, stockoutDays: 0, estimatedProfitLoss: 0, grossMarginPercent: 38.5 },
  { id: 'item-05', nameHe: 'קוקה קולה 1.5 ליטר', categoryId: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=120&h=120&fit=crop', monthlySales: 524_000, lastYearMonthlySales: 498_000, stockoutDays: 0, estimatedProfitLoss: 0, grossMarginPercent: 24.8 },
  { id: 'item-06', nameHe: 'שוקולד פרה 100 גר׳', categoryId: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=120&h=120&fit=crop', monthlySales: 298_000, lastYearMonthlySales: 275_000, stockoutDays: 1, estimatedProfitLoss: 15_600, grossMarginPercent: 32.1 },
  { id: 'item-07', nameHe: 'עוף שלם קפוא 1.5 ק״ג', categoryId: 'frozen', imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=120&h=120&fit=crop', monthlySales: 367_000, lastYearMonthlySales: 342_000, stockoutDays: 4, estimatedProfitLoss: 52_800, grossMarginPercent: 19.3 },
  { id: 'item-08', nameHe: 'גבינה צהובה עמק 200 גר׳', categoryId: 'dairy', imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=120&h=120&fit=crop', monthlySales: 276_000, lastYearMonthlySales: 258_000, stockoutDays: 2, estimatedProfitLoss: 22_100, grossMarginPercent: 26.7 },
  { id: 'item-09', nameHe: 'שמן זית יד מרדכי 750 מ״ל', categoryId: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&h=120&fit=crop', monthlySales: 218_000, lastYearMonthlySales: 205_000, stockoutDays: 5, estimatedProfitLoss: 62_400, grossMarginPercent: 28.9 },
  { id: 'item-10', nameHe: 'נייר טואלט לילי 32 גלילים', categoryId: 'home-products', imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=120&h=120&fit=crop', monthlySales: 345_000, lastYearMonthlySales: 312_000, stockoutDays: 3, estimatedProfitLoss: 38_700, grossMarginPercent: 21.4 },
  { id: 'item-11', nameHe: 'יוגורט דנונה 200 גר׳', categoryId: 'dairy', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=120&h=120&fit=crop', monthlySales: 195_000, lastYearMonthlySales: 182_000, stockoutDays: 1, estimatedProfitLoss: 8_900, grossMarginPercent: 29.3 },
  { id: 'item-12', nameHe: 'פסטה ברילה 500 גר׳', categoryId: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=120&h=120&fit=crop', monthlySales: 156_000, lastYearMonthlySales: 148_000, stockoutDays: 0, estimatedProfitLoss: 0, grossMarginPercent: 30.5 },
  { id: 'item-13', nameHe: 'בשר טחון 500 גר׳', categoryId: 'fresh-meat', imageUrl: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=120&h=120&fit=crop', monthlySales: 312_000, lastYearMonthlySales: 295_000, stockoutDays: 6, estimatedProfitLoss: 78_500, grossMarginPercent: 16.8 },
  { id: 'item-14', nameHe: 'מיץ תפוזים פריגת 1 ליטר', categoryId: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=120&h=120&fit=crop', monthlySales: 187_000, lastYearMonthlySales: 176_000, stockoutDays: 0, estimatedProfitLoss: 0, grossMarginPercent: 27.2 },
  { id: 'item-15', nameHe: 'קפה עלית 200 גר׳', categoryId: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=120&h=120&fit=crop', monthlySales: 267_000, lastYearMonthlySales: 242_000, stockoutDays: 2, estimatedProfitLoss: 31_200, grossMarginPercent: 33.8 },
  { id: 'item-16', nameHe: 'אורז סוגת 1 ק״ג', categoryId: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&h=120&fit=crop', monthlySales: 143_000, lastYearMonthlySales: 138_000, stockoutDays: 0, estimatedProfitLoss: 0, grossMarginPercent: 25.6 },
  { id: 'item-17', nameHe: 'סבון כביסה סנו 3 ליטר', categoryId: 'household', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=120&h=120&fit=crop', monthlySales: 128_000, lastYearMonthlySales: 118_000, stockoutDays: 1, estimatedProfitLoss: 7_200, grossMarginPercent: 22.1 },
  { id: 'item-18', nameHe: 'עגבניות שרי 500 גר׳', categoryId: 'vegetables', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=120&h=120&fit=crop', monthlySales: 234_000, lastYearMonthlySales: 218_000, stockoutDays: 2, estimatedProfitLoss: 19_800, grossMarginPercent: 42.1 },
  { id: 'item-19', nameHe: 'חטיפי במבה 80 גר׳', categoryId: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=120&h=120&fit=crop', monthlySales: 198_000, lastYearMonthlySales: 185_000, stockoutDays: 0, estimatedProfitLoss: 0, grossMarginPercent: 36.4 },
  { id: 'item-20', nameHe: 'טונה סטארקיסט 160 גר׳', categoryId: 'grocery', imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=120&h=120&fit=crop', monthlySales: 167_000, lastYearMonthlySales: 159_000, stockoutDays: 1, estimatedProfitLoss: 9_400, grossMarginPercent: 27.8 },
  { id: 'item-21', nameHe: 'חטיף גרנולה 40 גר׳', categoryId: 'organic', imageUrl: 'https://images.unsplash.com/photo-1490567674467-4eea9cbdde69?w=120&h=120&fit=crop', monthlySales: 89_000, lastYearMonthlySales: 76_000, stockoutDays: 0, estimatedProfitLoss: 0, grossMarginPercent: 41.2 },
  { id: 'item-22', nameHe: 'פילה סלמון 300 גר׳', categoryId: 'fresh-fish', imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=120&h=120&fit=crop', monthlySales: 145_000, lastYearMonthlySales: 132_000, stockoutDays: 3, estimatedProfitLoss: 34_600, grossMarginPercent: 23.5 },
  { id: 'item-23', nameHe: 'חיתולי האגיס מידה 4', categoryId: 'baby', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&h=120&fit=crop', monthlySales: 176_000, lastYearMonthlySales: 165_000, stockoutDays: 4, estimatedProfitLoss: 42_300, grossMarginPercent: 18.9 },
  { id: 'item-24', nameHe: 'פיצה קפואה 430 גר׳', categoryId: 'frozen', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&h=120&fit=crop', monthlySales: 203_000, lastYearMonthlySales: 189_000, stockoutDays: 1, estimatedProfitLoss: 11_200, grossMarginPercent: 31.6 },
  { id: 'item-25', nameHe: 'חלה מתוקה שבת 500 גר׳', categoryId: 'pastries', imageUrl: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=120&h=120&fit=crop', monthlySales: 112_000, lastYearMonthlySales: 105_000, stockoutDays: 2, estimatedProfitLoss: 16_800, grossMarginPercent: 38.9 },
]

export function getChainItems(): ChainItem[] {
  return items
}

export function getTopStockoutItem(): ChainItem {
  return items.reduce((max, item) =>
    item.estimatedProfitLoss > max.estimatedProfitLoss ? item : max
  )
}

export function getTopSalesItem(): ChainItem {
  return items.reduce((max, item) =>
    item.monthlySales > max.monthlySales ? item : max
  )
}
