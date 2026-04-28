import { DEPARTMENT_NAMES, MONTHS_HE, REPORT_YEAR } from "@/data/constants";
import { getTopSuppliers, type ChainSupplier } from "@/data/mock-suppliers";
import {
  getPeriodMultiplier,
  getPeriodTargetShare,
  type TimePeriod,
} from "@/components/dashboard/TimePeriodFilter";

export interface SupplierCategoryMix {
  categoryId: string;
  categoryName: string;
  productExamples: string[];
  sharePercent: number;
  sales: number;
  targetSales: number;
  targetAchievement: number;
  grossProfitPercent: number;
  grossProfitTargetPercent: number;
  yoyGrowth: number;
}

export interface SupplierPerformance {
  supplier: ChainSupplier;
  period: TimePeriod;
  totalSales: number;
  totalTargetSales: number;
  targetAchievement: number;
  grossProfitPercent: number;
  grossProfitTargetPercent: number;
  grossProfitGap: number;
  networkGrowthPercent: number;
  supplierGrowthPercent: number;
  activeCategoryCount: number;
  productCount: number;
  categoryMix: SupplierCategoryMix[];
  monthlyTrend: {
    month: string;
    sales: number;
    target: number;
    grossProfitPercent: number;
  }[];
}

interface SupplierPortfolioCategory {
  categoryId: string;
  share: number;
  products: string[];
  marginBias?: number;
  growthBias?: number;
}

const SUPPLIER_PORTFOLIOS: Record<string, SupplierPortfolioCategory[]> = {
  "sup-01": [
    {
      categoryId: "dairy",
      share: 0.48,
      products: ["חלב תנובה", "קוטג׳ תנובה", "גבינה לבנה"],
      marginBias: -0.8,
    },
    {
      categoryId: "frozen",
      share: 0.22,
      products: ["סנפרוסט", "מעדנות", "ירקות קפואים"],
      marginBias: 1.5,
    },
    {
      categoryId: "fresh-meat",
      share: 0.18,
      products: ["מאמא עוף", "טירת צבי", "עוף מצונן"],
      marginBias: -1.2,
    },
    {
      categoryId: "deli",
      share: 0.12,
      products: ["גבינות מעדנייה", "גבינה צהובה", "מעדני חלב"],
      marginBias: 0.6,
    },
  ],
  "sup-02": [
    {
      categoryId: "dairy",
      share: 0.34,
      products: ["מילקי", "דנונה", "יוטבתה"],
      marginBias: -0.4,
    },
    {
      categoryId: "grocery",
      share: 0.24,
      products: ["קפה עלית", "יד מרדכי", "שוקולד פרה"],
      marginBias: 1.2,
    },
    {
      categoryId: "deli",
      share: 0.18,
      products: ["אחלה", "סלטים מצוננים", "ממרחים"],
      marginBias: 0.4,
    },
    {
      categoryId: "drinks",
      share: 0.12,
      products: ["קפה קר", "משקאות יוטבתה", "קפסולות קפה"],
      growthBias: 1.1,
    },
    {
      categoryId: "household",
      share: 0.12,
      products: ["חטיפים", "תפוצ׳יפס", "מסטיקים"],
      marginBias: 1.8,
    },
  ],
  "sup-03": [
    {
      categoryId: "grocery",
      share: 0.52,
      products: ["במבה", "ביסלי", "פתיתים"],
      marginBias: 0.7,
    },
    {
      categoryId: "baby",
      share: 0.16,
      products: ["מטרנה", "דייסות", "מזון תינוקות"],
      marginBias: -0.3,
    },
    {
      categoryId: "frozen",
      share: 0.14,
      products: ["טבעול", "שניצל צמחי", "ארוחות מוכנות"],
      marginBias: 1.0,
    },
    {
      categoryId: "deli",
      share: 0.1,
      products: ["צבר", "חומוס", "סלטים"],
      marginBias: -0.6,
    },
    {
      categoryId: "organic",
      share: 0.08,
      products: ["פיטנס", "דגני בוקר", "מוצרים מופחתי סוכר"],
      marginBias: 1.3,
    },
  ],
  "sup-04": [
    {
      categoryId: "grocery",
      share: 0.31,
      products: ["תלמה", "קנור", "ליפטון"],
      marginBias: 0.5,
    },
    {
      categoryId: "household",
      share: 0.28,
      products: ["בדין", "סיף", "פרסיל"],
      marginBias: 1.8,
    },
    {
      categoryId: "home-products",
      share: 0.22,
      products: ["דאב", "פינוק", "אקס"],
      marginBias: 2.1,
    },
    {
      categoryId: "frozen",
      share: 0.19,
      products: ["מגנום", "גלידות", "קינוחים קפואים"],
      growthBias: 1.6,
    },
  ],
  "sup-05": [
    {
      categoryId: "home-products",
      share: 0.45,
      products: ["ג׳ילט", "אורל בי", "פמפרס"],
      marginBias: 1.4,
    },
    {
      categoryId: "household",
      share: 0.32,
      products: ["אריאל", "פיירי", "מוצרי ניקוי"],
      marginBias: 0.8,
    },
    {
      categoryId: "baby",
      share: 0.23,
      products: ["חיתולים", "מגבונים", "טיפוח תינוקות"],
      marginBias: -0.6,
    },
  ],
  "sup-06": [
    {
      categoryId: "household",
      share: 0.78,
      products: ["סנו ז׳אוול", "סנו מקסימה", "סנו סושי"],
      marginBias: 1.9,
    },
    {
      categoryId: "home-products",
      share: 0.22,
      products: ["נייר אפייה", "שקיות אשפה", "מוצרי אחסון"],
      marginBias: 0.6,
    },
  ],
  "sup-07": [
    {
      categoryId: "grocery",
      share: 0.72,
      products: ["שוקולד פרה", "קפה עלית", "פסק זמן"],
      marginBias: 2.2,
    },
    {
      categoryId: "drinks",
      share: 0.28,
      products: ["קפה נמס", "קפסולות", "משקאות קפה"],
      marginBias: 1.1,
    },
  ],
  "sup-08": [
    {
      categoryId: "home-products",
      share: 0.46,
      products: ["קולגייט", "ספיד סטיק", "נויטרוג׳ינה"],
      marginBias: 1.5,
    },
    {
      categoryId: "grocery",
      share: 0.34,
      products: ["מאסטר שף", "ריו מרה", "Oatly"],
      marginBias: -0.4,
    },
    {
      categoryId: "household",
      share: 0.2,
      products: ["אג׳קס", "פרי", "מוצרי ניקוי"],
      marginBias: 0.9,
    },
  ],
  "sup-09": [
    {
      categoryId: "home-products",
      share: 0.42,
      products: ["ג׳ילט", "אורל בי", "אולד ספייס"],
      marginBias: 1.8,
    },
    {
      categoryId: "baby",
      share: 0.3,
      products: ["פמפרס", "מגבונים", "טיפוח תינוקות"],
      marginBias: -0.5,
    },
    {
      categoryId: "household",
      share: 0.28,
      products: ["אריאל", "פיירי", "טייד"],
      marginBias: 0.7,
    },
  ],
  "sup-10": [
    {
      categoryId: "home-products",
      share: 0.7,
      products: ["האגיס", "קלינקס", "קוטקס"],
      marginBias: -0.3,
    },
    {
      categoryId: "baby",
      share: 0.3,
      products: ["חיתולים", "מגבונים", "מוצרי תינוקות"],
      marginBias: -1.1,
    },
  ],
  "sup-11": [
    {
      categoryId: "grocery",
      share: 0.82,
      products: ["פתיתים", "במבה", "קטשופ אסם"],
      marginBias: 0.3,
    },
    {
      categoryId: "organic",
      share: 0.18,
      products: ["דגני בוקר", "חטיפים מופחתי סוכר", "מוצרים מועשרים"],
      marginBias: 0.9,
    },
  ],
  "sup-12": [
    {
      categoryId: "grocery",
      share: 0.58,
      products: ["נסקפה", "פיטנס", "קיטקט"],
      marginBias: 1.2,
    },
    {
      categoryId: "baby",
      share: 0.42,
      products: ["מטרנה", "גרבר", "דייסות"],
      marginBias: -0.2,
    },
  ],
  "sup-13": [
    {
      categoryId: "dairy",
      share: 1,
      products: ["חלב טרה", "מולר", "גבינות טרה"],
      marginBias: -1.3,
    },
  ],
  "sup-14": [
    {
      categoryId: "bread",
      share: 1,
      products: ["לחם ברמן", "לחמניות", "חלות"],
      marginBias: -1.0,
    },
  ],
  "sup-15": [
    {
      categoryId: "household",
      share: 0.62,
      products: ["פרסיל", "סומט", "סיליט"],
      marginBias: 1.7,
    },
    {
      categoryId: "home-products",
      share: 0.38,
      products: ["שוורצקופף", "טיפוח אישי", "מוצרי היגיינה"],
      marginBias: 2.0,
    },
  ],
  "sup-17": [
    {
      categoryId: "home-products",
      share: 0.76,
      products: ["טיפוח", "ויטמינים", "בריאות יומיומית"],
      marginBias: 0.8,
    },
    {
      categoryId: "baby",
      share: 0.24,
      products: ["מוצרי תינוקות", "משחות", "טיפוח עדין"],
      marginBias: -0.1,
    },
  ],
  "sup-18": [
    {
      categoryId: "vegetables",
      share: 1,
      products: ["ירקות ארוזים", "פירות עונה", "עשבי תיבול"],
      marginBias: -1.4,
      growthBias: -0.7,
    },
  ],
  "sup-19": [
    {
      categoryId: "home-products",
      share: 1,
      products: ["טיפוח תינוקות", "היגיינה", "בריאות המשפחה"],
      marginBias: 0.6,
    },
  ],
  "sup-20": [
    {
      categoryId: "fresh-meat",
      share: 0.72,
      products: ["נקניקים", "פסטרמה", "מוצרי בשר"],
      marginBias: -1.5,
    },
    {
      categoryId: "frozen",
      share: 0.28,
      products: ["שניצלים קפואים", "מוצרי בשר קפוא", "ארוחות מוכנות"],
      marginBias: -0.7,
    },
  ],
  "sup-21": [
    {
      categoryId: "drinks",
      share: 1,
      products: ["פריגת", "מיצים", "נקטרים"],
      marginBias: 1.4,
      growthBias: 1.2,
    },
  ],
  "sup-22": [
    {
      categoryId: "drinks",
      share: 0.68,
      products: ["תה ויסוצקי", "חליטות", "תה ירוק"],
      marginBias: 1.7,
    },
    {
      categoryId: "grocery",
      share: 0.32,
      products: ["עוגיות לצד תה", "חליטות", "מוצרים עונתיים"],
      marginBias: 0.8,
    },
  ],
  "sup-23": [
    {
      categoryId: "grocery",
      share: 0.76,
      products: ["טחינה אחוה", "חלוה", "ממרחים"],
      marginBias: 0.4,
    },
    {
      categoryId: "bread",
      share: 0.24,
      products: ["עוגות", "מאפים ארוזים", "מוצרי שומשום"],
      marginBias: -0.2,
    },
  ],
  "sup-24": [
    {
      categoryId: "frozen",
      share: 1,
      products: ["גלידות שטראוס", "מגנום", "קרמיסימו"],
      marginBias: 2.0,
      growthBias: 1.7,
    },
  ],
  "sup-25": [
    {
      categoryId: "drinks",
      share: 1,
      products: ["שוופס", "תפוזינה", "ספרינג"],
      marginBias: 0.9,
      growthBias: 1.1,
    },
  ],
};

const DEFAULT_PORTFOLIO: SupplierPortfolioCategory[] = [
  {
    categoryId: "grocery",
    share: 1,
    products: ["מוצר מוביל", "מוצר משלים", "מוצר עונתי"],
  },
];

function hashText(text: string): number {
  return text.split("").reduce((sum, ch, index) => {
    return sum + ch.charCodeAt(0) * (index + 11);
  }, 0);
}

function currentMonthToDatePeriod(): TimePeriod {
  const year = new Date().getFullYear() || REPORT_YEAR;
  const month = `${new Date().getMonth() + 1}`.padStart(2, "0");
  const day = `${new Date().getDate()}`.padStart(2, "0");
  return {
    type: "range",
    fromDate: `${year}-${month}-01`,
    toDate: `${year}-${month}-${day}`,
  };
}

function periodSeed(period: TimePeriod): number {
  return hashText(
    `${period.type}:${period.month ?? ""}:${period.fromDate ?? ""}:${period.toDate ?? ""}`
  );
}

function deterministicFactor(seed: number, min: number, max: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  const normalized = value - Math.floor(value);
  return min + normalized * (max - min);
}

function supplierPerformanceFactor(supplierId: string, period: TimePeriod) {
  const seed = hashText(supplierId) + periodSeed(period);
  return deterministicFactor(seed, 0.88, 1.11);
}

function supplierMarginDelta(supplierId: string, period: TimePeriod) {
  const seed = hashText(`${supplierId}:margin`) + periodSeed(period);
  return deterministicFactor(seed, -3.2, 2.8);
}

export function getSupplierById(supplierId: string): ChainSupplier | undefined {
  const decoded = decodeURIComponent(supplierId);
  return getTopSuppliers().find((s) => s.id === decoded || s.name === decoded);
}

export function getSupplierCurrentMonthToDatePeriod(): TimePeriod {
  return currentMonthToDatePeriod();
}

export function getSupplierPerformance(
  supplierId: string,
  period: TimePeriod = currentMonthToDatePeriod()
): SupplierPerformance | null {
  const supplier = getSupplierById(supplierId);
  if (!supplier) return null;

  const portfolio = SUPPLIER_PORTFOLIOS[supplier.id] ?? DEFAULT_PORTFOLIO;
  const actualMultiplier = getPeriodMultiplier(period);
  const targetMultiplier = getPeriodTargetShare(period);
  const performanceFactor = supplierPerformanceFactor(supplier.id, period);
  const marginDelta = supplierMarginDelta(supplier.id, period);
  const totalSales = supplier.sales * actualMultiplier * performanceFactor;
  const totalTargetSales = supplier.targetSales * targetMultiplier;
  const grossProfitPercent = +Math.max(
    12,
    supplier.grossProfitPercent + marginDelta
  ).toFixed(1);
  const grossProfitTargetPercent = +Math.min(
    36,
    Math.max(20, supplier.grossProfitPercent + 2.2)
  ).toFixed(1);
  const targetAchievement =
    totalTargetSales > 0 ? (totalSales / totalTargetSales) * 100 : 100;
  const supplierGrowthPercent = +(
    (performanceFactor - 1) * 100 +
    deterministicFactor(hashText(`${supplier.id}:growth`), -3.8, 4.2)
  ).toFixed(1);
  const networkGrowthPercent = 5.6;

  const categoryMix = portfolio.map((category, index) => {
    const categorySeed =
      hashText(`${supplier.id}:${category.categoryId}`) + periodSeed(period);
    const categoryFactor = deterministicFactor(categorySeed, 0.9, 1.1);
    const sales = totalSales * category.share * categoryFactor;
    const targetSales = totalTargetSales * category.share;
    const gross = +Math.max(
      10,
      grossProfitPercent +
        (category.marginBias ?? 0) +
        deterministicFactor(categorySeed + 7, -1.3, 1.4)
    ).toFixed(1);

    return {
      categoryId: category.categoryId,
      categoryName:
        DEPARTMENT_NAMES[category.categoryId] ?? category.categoryId,
      productExamples: category.products,
      sharePercent: +(category.share * 100).toFixed(1),
      sales: Math.round(sales),
      targetSales: Math.round(targetSales),
      targetAchievement: targetSales > 0 ? (sales / targetSales) * 100 : 100,
      grossProfitPercent: gross,
      grossProfitTargetPercent: +(
        grossProfitTargetPercent +
        index * 0.3
      ).toFixed(1),
      yoyGrowth: +(
        supplierGrowthPercent +
        (category.growthBias ?? 0) +
        deterministicFactor(categorySeed + 19, -2.5, 2.8)
      ).toFixed(1),
    };
  });

  const monthlyTrend = MONTHS_HE.map((month, index) => {
    const monthSeed = hashText(`${supplier.id}:${index}`);
    const seasonality = deterministicFactor(monthSeed, 0.86, 1.15);
    const actualFactor = deterministicFactor(
      monthSeed + periodSeed(period),
      0.9,
      1.12
    );
    const target = (supplier.targetSales / 12) * seasonality;
    const sales = (supplier.sales / 12) * seasonality * actualFactor;
    return {
      month,
      sales: Math.round(sales / 1000),
      target: Math.round(target / 1000),
      grossProfitPercent: +(
        supplier.grossProfitPercent +
        deterministicFactor(monthSeed + 101, -2.5, 2.5)
      ).toFixed(1),
    };
  });

  return {
    supplier,
    period,
    totalSales: Math.round(totalSales),
    totalTargetSales: Math.round(totalTargetSales),
    targetAchievement,
    grossProfitPercent,
    grossProfitTargetPercent,
    grossProfitGap: +(grossProfitPercent - grossProfitTargetPercent).toFixed(1),
    networkGrowthPercent,
    supplierGrowthPercent,
    activeCategoryCount: categoryMix.length,
    productCount: categoryMix.reduce(
      (sum, c) => sum + c.productExamples.length,
      0
    ),
    categoryMix,
    monthlyTrend,
  };
}
