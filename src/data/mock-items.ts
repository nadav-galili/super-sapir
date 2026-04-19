// Mock item catalogue (SKUs).
//
// `categoryId` is the departmentId (legacy naming — see context.md glossary).
// `segmentId` points to a Segment in mock-taxonomy.ts. The promo simulator
// uses the (departmentId, segmentId) pair to filter the Product picker.
export interface ChainItem {
  id: string;
  nameHe: string;
  categoryId: string;
  segmentId: string;
  imageUrl: string;
  monthlySales: number;
  lastYearMonthlySales: number;
  stockoutDays: number;
  estimatedProfitLoss: number;
  grossMarginPercent: number;
  promoSales?: number;
  promoUpliftPercent?: number;
}

// Default placeholder image for items that don't carry a hand-picked photo.
// The HeroItemCards component is the only consumer that renders the image
// today, and it already gracefully handles any URL.
const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop";

// Terse helper so we can keep the item table compact below.
function item(
  id: string,
  nameHe: string,
  categoryId: string,
  segmentId: string,
  monthlySales: number,
  grossMarginPercent: number,
  opts: Partial<
    Pick<
      ChainItem,
      | "imageUrl"
      | "lastYearMonthlySales"
      | "stockoutDays"
      | "estimatedProfitLoss"
      | "promoSales"
      | "promoUpliftPercent"
    >
  > = {}
): ChainItem {
  return {
    id,
    nameHe,
    categoryId,
    segmentId,
    imageUrl: opts.imageUrl ?? DEFAULT_IMG,
    monthlySales,
    lastYearMonthlySales:
      opts.lastYearMonthlySales ?? Math.round(monthlySales * 0.93),
    stockoutDays: opts.stockoutDays ?? 0,
    estimatedProfitLoss: opts.estimatedProfitLoss ?? 0,
    grossMarginPercent,
    promoSales: opts.promoSales,
    promoUpliftPercent: opts.promoUpliftPercent,
  };
}

const items: ChainItem[] = [
  // ─── dairy ──────────────────────────────────────────────────────────────
  item("item-01", "חלב תנובה 3% 1 ליטר", "dairy", "dairy-milk", 482_000, 22.4, {
    imageUrl:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=120&h=120&fit=crop",
    lastYearMonthlySales: 445_000,
    stockoutDays: 2,
    estimatedProfitLoss: 28_500,
    promoSales: 189_000,
    promoUpliftPercent: 64.2,
  }),
  item("item-50", "חלב תנובה 1% 1 ליטר", "dairy", "dairy-milk", 412_000, 21.8),
  item(
    "item-51",
    "חלב שטראוס מועשר 1 ליטר",
    "dairy",
    "dairy-milk",
    268_000,
    23.1
  ),
  item("item-52", "חלב טרה עמיד 1 ליטר", "dairy", "dairy-milk", 198_000, 20.4),
  item(
    "item-08",
    "גבינה צהובה עמק 200 גר׳",
    "dairy",
    "dairy-cheese-yellow",
    276_000,
    26.7,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=120&h=120&fit=crop",
      lastYearMonthlySales: 258_000,
      stockoutDays: 2,
      estimatedProfitLoss: 22_100,
    }
  ),
  item(
    "item-53",
    "גבינה צהובה גלבוע 200 גר׳",
    "dairy",
    "dairy-cheese-yellow",
    234_000,
    25.1
  ),
  item(
    "item-54",
    "גבינה צהובה תלמא 200 גר׳",
    "dairy",
    "dairy-cheese-yellow",
    187_000,
    24.3
  ),
  item(
    "item-55",
    "גבינה לבנה תנובה 5% 250 גר׳",
    "dairy",
    "dairy-cheese-white",
    298_000,
    28.4
  ),
  item(
    "item-56",
    "גבינת קוטג׳ תנובה 3% 250 גר׳",
    "dairy",
    "dairy-cheese-white",
    245_000,
    27.2
  ),
  item(
    "item-57",
    "גבינת לבנה שטראוס 9% 250 גר׳",
    "dairy",
    "dairy-cheese-white",
    198_000,
    26.8
  ),
  item(
    "item-11",
    "יוגורט דנונה 200 גר׳",
    "dairy",
    "dairy-yogurt",
    195_000,
    29.3,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=120&h=120&fit=crop",
      lastYearMonthlySales: 182_000,
      stockoutDays: 1,
      estimatedProfitLoss: 8_900,
    }
  ),
  item(
    "item-58",
    "יוגורט יופלה 150 גר׳",
    "dairy",
    "dairy-yogurt",
    178_000,
    28.9
  ),
  item(
    "item-59",
    "מעדן מילקי שטראוס 170 גר׳",
    "dairy",
    "dairy-yogurt",
    224_000,
    31.4
  ),
  item(
    "item-60",
    "מעדן פודינג תנובה 200 גר׳",
    "dairy",
    "dairy-yogurt",
    156_000,
    30.2
  ),
  item(
    "item-61",
    "חמאה תנובה 200 גר׳",
    "dairy",
    "dairy-butter-cream",
    189_000,
    24.8
  ),
  item(
    "item-62",
    "שמנת מתוקה 38% תנובה 250 מ״ל",
    "dairy",
    "dairy-butter-cream",
    142_000,
    26.1
  ),
  item(
    "item-63",
    "שמנת חמוצה 15% 200 גר׳",
    "dairy",
    "dairy-butter-cream",
    98_000,
    25.4
  ),
  item(
    "item-64",
    "חלב שקדים טבעי 1 ליטר",
    "dairy",
    "dairy-plant",
    87_000,
    32.1
  ),
  item(
    "item-65",
    "חלב שיבולת שועל 1 ליטר",
    "dairy",
    "dairy-plant",
    76_000,
    33.4
  ),
  item(
    "item-66",
    "יוגורט צמחי קוקוס 150 גר׳",
    "dairy",
    "dairy-plant",
    54_000,
    34.2
  ),

  // ─── grocery ────────────────────────────────────────────────────────────
  item(
    "item-12",
    "פסטה ברילה 500 גר׳",
    "grocery",
    "grocery-pasta-rice",
    156_000,
    30.5
  ),
  item(
    "item-16",
    "אורז סוגת 1 ק״ג",
    "grocery",
    "grocery-pasta-rice",
    143_000,
    25.6
  ),
  item(
    "item-67",
    "פסטה אסם ספגטי 500 גר׳",
    "grocery",
    "grocery-pasta-rice",
    118_000,
    29.8
  ),
  item(
    "item-68",
    "אורז בסמטי סוגת 1 ק״ג",
    "grocery",
    "grocery-pasta-rice",
    97_000,
    27.4
  ),
  item(
    "item-09",
    "שמן זית יד מרדכי 750 מ״ל",
    "grocery",
    "grocery-oil-vinegar",
    218_000,
    28.9,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&h=120&fit=crop",
      lastYearMonthlySales: 205_000,
      stockoutDays: 5,
      estimatedProfitLoss: 62_400,
    }
  ),
  item(
    "item-69",
    "שמן קנולה עין הברית 1 ליטר",
    "grocery",
    "grocery-oil-vinegar",
    187_000,
    22.4
  ),
  item(
    "item-70",
    "חומץ תפוחים טבעוני 500 מ״ל",
    "grocery",
    "grocery-oil-vinegar",
    78_000,
    34.1
  ),
  item(
    "item-20",
    "טונה סטארקיסט 160 גר׳",
    "grocery",
    "grocery-canned",
    167_000,
    27.8,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=120&h=120&fit=crop",
      lastYearMonthlySales: 159_000,
      stockoutDays: 1,
      estimatedProfitLoss: 9_400,
    }
  ),
  item(
    "item-71",
    "תירס שימורים 340 גר׳",
    "grocery",
    "grocery-canned",
    98_000,
    31.2
  ),
  item(
    "item-72",
    "שעועית אדומה 400 גר׳",
    "grocery",
    "grocery-canned",
    76_000,
    29.4
  ),
  item(
    "item-73",
    "רסק עגבניות 200 גר׳",
    "grocery",
    "grocery-canned",
    112_000,
    32.8
  ),
  item(
    "item-06",
    "שוקולד פרה 100 גר׳",
    "grocery",
    "grocery-snacks",
    298_000,
    32.1,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=120&h=120&fit=crop",
      lastYearMonthlySales: 275_000,
      stockoutDays: 1,
      estimatedProfitLoss: 15_600,
      promoSales: 156_000,
      promoUpliftPercent: 71.8,
    }
  ),
  item(
    "item-19",
    "חטיפי במבה 80 גר׳",
    "grocery",
    "grocery-snacks",
    198_000,
    36.4
  ),
  item(
    "item-74",
    "ביסלי גריל 70 גר׳",
    "grocery",
    "grocery-snacks",
    176_000,
    37.2
  ),
  item(
    "item-75",
    "עוגיות שוקו צ׳יפס 200 גר׳",
    "grocery",
    "grocery-snacks",
    145_000,
    35.8
  ),
  item(
    "item-15",
    "קפה עלית 200 גר׳",
    "grocery",
    "grocery-coffee-tea",
    267_000,
    33.8,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=120&h=120&fit=crop",
      lastYearMonthlySales: 242_000,
      stockoutDays: 2,
      estimatedProfitLoss: 31_200,
      promoSales: 174_000,
      promoUpliftPercent: 68.5,
    }
  ),
  item(
    "item-76",
    "קפה נמס נסקפה 200 גר׳",
    "grocery",
    "grocery-coffee-tea",
    189_000,
    31.4
  ),
  item(
    "item-77",
    "תה ויסוצקי 25 שקיות",
    "grocery",
    "grocery-coffee-tea",
    134_000,
    38.6
  ),
  item(
    "item-78",
    "קורנפלקס תלמה 500 גר׳",
    "grocery",
    "grocery-breakfast",
    187_000,
    29.7
  ),
  item(
    "item-79",
    "ממרח שוקולד נוטלה 400 גר׳",
    "grocery",
    "grocery-breakfast",
    212_000,
    33.2
  ),
  item(
    "item-80",
    "חלבה אחווה 500 גר׳",
    "grocery",
    "grocery-breakfast",
    98_000,
    36.4
  ),
  item(
    "item-81",
    "קמח שופרסל 1 ק״ג",
    "grocery",
    "grocery-baking",
    109_000,
    24.8
  ),
  item("item-82", "סוכר לבן 1 ק״ג", "grocery", "grocery-baking", 134_000, 22.1),
  item(
    "item-83",
    "אבקת אפייה 10 גר׳",
    "grocery",
    "grocery-baking",
    67_000,
    38.9
  ),
  item(
    "item-03",
    "ביצים L חופש 12 יח׳",
    "grocery",
    "grocery-eggs",
    412_000,
    18.6,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=120&h=120&fit=crop",
      lastYearMonthlySales: 389_000,
      stockoutDays: 3,
      estimatedProfitLoss: 45_200,
      promoSales: 142_000,
      promoUpliftPercent: 52.1,
    }
  ),
  item(
    "item-84",
    "ביצים אורגניות M 12 יח׳",
    "grocery",
    "grocery-eggs",
    178_000,
    24.2
  ),

  // ─── frozen ─────────────────────────────────────────────────────────────
  item(
    "item-07",
    "עוף שלם קפוא 1.5 ק״ג",
    "frozen",
    "frozen-meat",
    367_000,
    19.3,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=120&h=120&fit=crop",
      lastYearMonthlySales: 342_000,
      stockoutDays: 4,
      estimatedProfitLoss: 52_800,
    }
  ),
  item(
    "item-85",
    "שניצל עוף קפוא 1 ק״ג",
    "frozen",
    "frozen-meat",
    298_000,
    21.4
  ),
  item(
    "item-86",
    "המבורגרים קפואים 500 גר׳",
    "frozen",
    "frozen-meat",
    245_000,
    22.8
  ),
  item(
    "item-87",
    "פילה סלמון קפוא 500 גר׳",
    "frozen",
    "frozen-fish",
    187_000,
    24.1
  ),
  item(
    "item-88",
    "נתחי אמנון קפואים 500 גר׳",
    "frozen",
    "frozen-fish",
    132_000,
    23.4
  ),
  item(
    "item-89",
    "בורקס תרד קפוא 500 גר׳",
    "frozen",
    "frozen-pastry",
    156_000,
    30.2
  ),
  item(
    "item-90",
    "מלווח קפוא 400 גר׳",
    "frozen",
    "frozen-pastry",
    124_000,
    31.4
  ),
  item(
    "item-91",
    "סמבוסק קפוא 500 גר׳",
    "frozen",
    "frozen-pastry",
    98_000,
    32.1
  ),
  item(
    "item-24",
    "פיצה קפואה 430 גר׳",
    "frozen",
    "frozen-ready",
    203_000,
    31.6,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&h=120&fit=crop",
      lastYearMonthlySales: 189_000,
      stockoutDays: 1,
      estimatedProfitLoss: 11_200,
    }
  ),
  item(
    "item-92",
    "לזניה קפואה 350 גר׳",
    "frozen",
    "frozen-ready",
    134_000,
    28.7
  ),
  item(
    "item-93",
    "אורז מוקפץ עם ירקות 400 גר׳",
    "frozen",
    "frozen-ready",
    87_000,
    29.8
  ),
  item(
    "item-94",
    "אפונה קפואה 800 גר׳",
    "frozen",
    "frozen-vegetables",
    112_000,
    33.1
  ),
  item(
    "item-95",
    "תערובת ירקות קפואה 800 גר׳",
    "frozen",
    "frozen-vegetables",
    98_000,
    32.4
  ),
  item(
    "item-96",
    "שעועית ירוקה קפואה 800 גר׳",
    "frozen",
    "frozen-vegetables",
    76_000,
    31.8
  ),
  item(
    "item-97",
    "גלידת שטראוס וניל 1 ליטר",
    "frozen",
    "frozen-dessert",
    212_000,
    34.1
  ),
  item(
    "item-98",
    "גלידת בן אנד ג׳ריס 465 מ״ל",
    "frozen",
    "frozen-dessert",
    167_000,
    38.2
  ),
  item(
    "item-99",
    "ארטיק קליק 8 יח׳",
    "frozen",
    "frozen-dessert",
    134_000,
    36.4
  ),

  // ─── drinks ─────────────────────────────────────────────────────────────
  item(
    "item-05",
    "קוקה קולה 1.5 ליטר",
    "drinks",
    "drinks-carbonated",
    524_000,
    24.8,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=120&h=120&fit=crop",
      lastYearMonthlySales: 498_000,
      stockoutDays: 0,
      estimatedProfitLoss: 0,
      promoSales: 168_000,
      promoUpliftPercent: 47.5,
    }
  ),
  item(
    "item-100",
    "ספרייט 1.5 ליטר",
    "drinks",
    "drinks-carbonated",
    312_000,
    23.9
  ),
  item(
    "item-101",
    "פאנטה תפוז 1.5 ליטר",
    "drinks",
    "drinks-carbonated",
    245_000,
    24.2
  ),
  item(
    "item-14",
    "מיץ תפוזים פריגת 1 ליטר",
    "drinks",
    "drinks-juice",
    187_000,
    27.2,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=120&h=120&fit=crop",
      lastYearMonthlySales: 176_000,
      stockoutDays: 0,
      estimatedProfitLoss: 0,
    }
  ),
  item(
    "item-102",
    "מיץ ענבים פרי-ניצ 1 ליטר",
    "drinks",
    "drinks-juice",
    134_000,
    28.4
  ),
  item(
    "item-103",
    "מיץ תפוחים פרי-גת 1 ליטר",
    "drinks",
    "drinks-juice",
    156_000,
    27.8
  ),
  item(
    "item-104",
    "מים נביעות 1.5 ליטר",
    "drinks",
    "drinks-water",
    398_000,
    38.2
  ),
  item(
    "item-105",
    "מים עין גדי 1.5 ליטר",
    "drinks",
    "drinks-water",
    276_000,
    37.4
  ),
  item(
    "item-106",
    "מים מינרלים מי עדן 6 יח׳",
    "drinks",
    "drinks-water",
    212_000,
    35.8
  ),
  item(
    "item-107",
    "משקה אנרגיה XL 250 מ״ל",
    "drinks",
    "drinks-energy",
    145_000,
    41.2
  ),
  item(
    "item-108",
    "משקה איזוטוני פאוורייד 500 מ״ל",
    "drinks",
    "drinks-energy",
    98_000,
    39.8
  ),
  item(
    "item-109",
    "יין אדום רקנאטי 750 מ״ל",
    "drinks",
    "drinks-alcohol",
    187_000,
    32.4
  ),
  item(
    "item-110",
    "בירה גולדסטאר 6 פק",
    "drinks",
    "drinks-alcohol",
    234_000,
    28.7
  ),
  item(
    "item-111",
    "וודקה פינלנדיה 700 מ״ל",
    "drinks",
    "drinks-alcohol",
    123_000,
    30.2
  ),

  // ─── fresh-meat ─────────────────────────────────────────────────────────
  item(
    "item-13",
    "בשר טחון 500 גר׳",
    "fresh-meat",
    "fresh-meat-beef",
    312_000,
    16.8,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=120&h=120&fit=crop",
      lastYearMonthlySales: 295_000,
      stockoutDays: 6,
      estimatedProfitLoss: 78_500,
    }
  ),
  item(
    "item-112",
    "אנטריקוט בקר טרי 1 ק״ג",
    "fresh-meat",
    "fresh-meat-beef",
    287_000,
    18.4
  ),
  item(
    "item-113",
    "סינטה בקר 1 ק״ג",
    "fresh-meat",
    "fresh-meat-beef",
    234_000,
    17.9
  ),
  item(
    "item-114",
    "חזה עוף טרי 1 ק״ג",
    "fresh-meat",
    "fresh-meat-chicken",
    412_000,
    19.6
  ),
  item(
    "item-115",
    "כנפי עוף 1 ק״ג",
    "fresh-meat",
    "fresh-meat-chicken",
    245_000,
    21.2
  ),
  item(
    "item-116",
    "שוקי עוף 1 ק״ג",
    "fresh-meat",
    "fresh-meat-chicken",
    198_000,
    20.8
  ),
  item(
    "item-117",
    "חזה הודו טרי 1 ק״ג",
    "fresh-meat",
    "fresh-meat-turkey",
    156_000,
    22.4
  ),
  item(
    "item-118",
    "שווארמה הודו 500 גר׳",
    "fresh-meat",
    "fresh-meat-turkey",
    134_000,
    23.8
  ),
  item(
    "item-119",
    "כתף כבש 1 ק״ג",
    "fresh-meat",
    "fresh-meat-lamb",
    178_000,
    17.2
  ),
  item(
    "item-120",
    "צלעות כבש 1 ק״ג",
    "fresh-meat",
    "fresh-meat-lamb",
    145_000,
    18.6
  ),
  item(
    "item-121",
    "נקניקיה ויסוצקי 500 גר׳",
    "fresh-meat",
    "fresh-meat-deli",
    189_000,
    29.4
  ),
  item(
    "item-122",
    "פסטרמה טבעי 200 גר׳",
    "fresh-meat",
    "fresh-meat-deli",
    156_000,
    32.1
  ),

  // ─── fresh-fish ─────────────────────────────────────────────────────────
  item(
    "item-22",
    "פילה סלמון 300 גר׳",
    "fresh-fish",
    "fresh-fish-salmon",
    145_000,
    23.5,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=120&h=120&fit=crop",
      lastYearMonthlySales: 132_000,
      stockoutDays: 3,
      estimatedProfitLoss: 34_600,
    }
  ),
  item(
    "item-123",
    "סלמון שלם טרי 1 ק״ג",
    "fresh-fish",
    "fresh-fish-salmon",
    198_000,
    22.1
  ),
  item(
    "item-124",
    "פילה לברק 300 גר׳",
    "fresh-fish",
    "fresh-fish-whitefish",
    112_000,
    24.8
  ),
  item(
    "item-125",
    "דג אמנון טרי 1 ק״ג",
    "fresh-fish",
    "fresh-fish-whitefish",
    98_000,
    23.4
  ),
  item(
    "item-126",
    "שרימפס טרי 500 גר׳",
    "fresh-fish",
    "fresh-fish-seafood",
    87_000,
    28.2
  ),
  item(
    "item-127",
    "קלמארי 500 גר׳",
    "fresh-fish",
    "fresh-fish-seafood",
    67_000,
    29.4
  ),
  item(
    "item-128",
    "סלמון מעושן 200 גר׳",
    "fresh-fish",
    "fresh-fish-smoked",
    134_000,
    32.8
  ),
  item(
    "item-129",
    "פורל מעושן 150 גר׳",
    "fresh-fish",
    "fresh-fish-smoked",
    78_000,
    33.4
  ),

  // ─── bread ──────────────────────────────────────────────────────────────
  item(
    "item-02",
    "לחם אחיד פרוס 750 גר׳",
    "bread",
    "bread-sliced",
    356_000,
    35.2,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&h=120&fit=crop",
      lastYearMonthlySales: 328_000,
      stockoutDays: 1,
      estimatedProfitLoss: 12_800,
    }
  ),
  item(
    "item-130",
    "לחם כהה פרוס 750 גר׳",
    "bread",
    "bread-sliced",
    198_000,
    34.1
  ),
  item(
    "item-131",
    "לחם שיפון פרוס 500 גר׳",
    "bread",
    "bread-sliced",
    134_000,
    36.4
  ),
  item(
    "item-132",
    "באגט מחמצת 400 גר׳",
    "bread",
    "bread-artisan",
    112_000,
    41.2
  ),
  item("item-133", "לחם כפרי 800 גר׳", "bread", "bread-artisan", 98_000, 40.8),
  item("item-134", "פיתות לבנות 6 יח׳", "bread", "bread-pita", 178_000, 38.4),
  item(
    "item-135",
    "לחמניות המבורגר 6 יח׳",
    "bread",
    "bread-pita",
    134_000,
    37.2
  ),
  item(
    "item-136",
    "מצות חוצות שריד 1 ק״ג",
    "bread",
    "bread-crackers",
    87_000,
    42.1
  ),
  item(
    "item-137",
    "קרקר מלוח תפוגן 200 גר׳",
    "bread",
    "bread-crackers",
    98_000,
    39.4
  ),

  // ─── vegetables ─────────────────────────────────────────────────────────
  item(
    "item-04",
    "בננות קטיף 1 ק״ג",
    "vegetables",
    "veg-fruit",
    389_000,
    38.5,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=120&h=120&fit=crop",
      lastYearMonthlySales: 362_000,
      stockoutDays: 0,
      estimatedProfitLoss: 0,
    }
  ),
  item(
    "item-18",
    "עגבניות שרי 500 גר׳",
    "vegetables",
    "veg-fruit",
    234_000,
    42.1,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=120&h=120&fit=crop",
      lastYearMonthlySales: 218_000,
      stockoutDays: 2,
      estimatedProfitLoss: 19_800,
    }
  ),
  item(
    "item-138",
    "תפוחי עץ אדומים 1 ק״ג",
    "vegetables",
    "veg-fruit",
    212_000,
    40.8
  ),
  item("item-139", "חסה ערבית אגודה", "vegetables", "veg-leafy", 156_000, 45.2),
  item("item-140", "תרד טרי 200 גר׳", "vegetables", "veg-leafy", 98_000, 43.4),
  item("item-141", "רוקט טרי 100 גר׳", "vegetables", "veg-leafy", 67_000, 44.8),
  item("item-142", "תפוחי אדמה 2 ק״ג", "vegetables", "veg-root", 234_000, 38.2),
  item("item-143", "בצל יבש 1 ק״ג", "vegetables", "veg-root", 178_000, 37.4),
  item("item-144", "גזר 1 ק״ג", "vegetables", "veg-root", 156_000, 38.9),
  item("item-145", "תפוזים 1 ק״ג", "vegetables", "veg-citrus", 198_000, 39.8),
  item(
    "item-146",
    "לימונים 500 גר׳",
    "vegetables",
    "veg-citrus",
    134_000,
    41.4
  ),
  item("item-147", "קלמנטינה 1 ק״ג", "vegetables", "veg-citrus", 145_000, 40.1),
  item(
    "item-148",
    "פטרוזיליה 100 גר׳",
    "vegetables",
    "veg-herbs",
    87_000,
    46.2
  ),
  item("item-149", "כוסברה 100 גר׳", "vegetables", "veg-herbs", 67_000, 45.8),
  item("item-150", "נענע 100 גר׳", "vegetables", "veg-herbs", 56_000, 47.1),
  item(
    "item-151",
    "עגבניות אורגניות 500 גר׳",
    "vegetables",
    "veg-organic",
    112_000,
    48.4
  ),
  item(
    "item-152",
    "מלפפונים אורגניים 500 גר׳",
    "vegetables",
    "veg-organic",
    98_000,
    47.2
  ),

  // ─── pastries ───────────────────────────────────────────────────────────
  item(
    "item-25",
    "חלה מתוקה שבת 500 גר׳",
    "pastries",
    "pastries-sabbath",
    112_000,
    38.9,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=120&h=120&fit=crop",
      lastYearMonthlySales: 105_000,
      stockoutDays: 2,
      estimatedProfitLoss: 16_800,
    }
  ),
  item(
    "item-153",
    "חלה קלועה 600 גר׳",
    "pastries",
    "pastries-sabbath",
    98_000,
    37.4
  ),
  item(
    "item-154",
    "רוגלך שוקולד 300 גר׳",
    "pastries",
    "pastries-sweet",
    134_000,
    42.1
  ),
  item(
    "item-155",
    "עוגת שמרים שוקולד 450 גר׳",
    "pastries",
    "pastries-sweet",
    156_000,
    41.2
  ),
  item(
    "item-156",
    "בורקס גבינה 400 גר׳",
    "pastries",
    "pastries-savory",
    178_000,
    34.8
  ),
  item(
    "item-157",
    "מאפה זעתר 400 גר׳",
    "pastries",
    "pastries-savory",
    112_000,
    36.4
  ),
  item(
    "item-158",
    "עוגת גבינה 500 גר׳",
    "pastries",
    "pastries-cake",
    189_000,
    39.8
  ),
  item(
    "item-159",
    "עוגיות שמרים 300 גר׳",
    "pastries",
    "pastries-cake",
    98_000,
    41.2
  ),

  // ─── household ──────────────────────────────────────────────────────────
  item(
    "item-17",
    "סבון כביסה סנו 3 ליטר",
    "household",
    "household-laundry",
    128_000,
    22.1,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=120&h=120&fit=crop",
      lastYearMonthlySales: 118_000,
      stockoutDays: 1,
      estimatedProfitLoss: 7_200,
    }
  ),
  item(
    "item-160",
    "אבקת כביסה אריאל 2 ק״ג",
    "household",
    "household-laundry",
    189_000,
    24.8
  ),
  item(
    "item-161",
    "מרכך כביסה סיליון 1 ליטר",
    "household",
    "household-laundry",
    112_000,
    26.4
  ),
  item(
    "item-162",
    "סבון כלים פיירי 750 מ״ל",
    "household",
    "household-dish",
    156_000,
    28.2
  ),
  item(
    "item-163",
    "טבליות מדיח קלגון 30 יח׳",
    "household",
    "household-dish",
    134_000,
    27.4
  ),
  item(
    "item-164",
    "חומר ניקוי סיף 750 מ״ל",
    "household",
    "household-surface",
    98_000,
    29.8
  ),
  item(
    "item-165",
    "אקונומיקה סנו 4 ליטר",
    "household",
    "household-surface",
    112_000,
    25.4
  ),
  item(
    "item-166",
    "שמפו גוון 700 מ״ל",
    "household",
    "household-bath",
    145_000,
    30.2
  ),
  item(
    "item-167",
    "סבון גוף דאב 500 מ״ל",
    "household",
    "household-bath",
    134_000,
    32.4
  ),

  // ─── home-products ──────────────────────────────────────────────────────
  item(
    "item-10",
    "נייר טואלט לילי 32 גלילים",
    "home-products",
    "home-paper",
    345_000,
    21.4,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=120&h=120&fit=crop",
      lastYearMonthlySales: 312_000,
      stockoutDays: 3,
      estimatedProfitLoss: 38_700,
      promoSales: 198_000,
      promoUpliftPercent: 82.3,
    }
  ),
  item(
    "item-168",
    "ממחטות נייר קלינקס 200 יח׳",
    "home-products",
    "home-paper",
    198_000,
    24.8
  ),
  item(
    "item-169",
    "מגבות נייר סנו 4 גלילים",
    "home-products",
    "home-paper",
    167_000,
    23.2
  ),
  item(
    "item-170",
    "צלחות חד-פעמיות 50 יח׳",
    "home-products",
    "home-disposable",
    87_000,
    31.2
  ),
  item(
    "item-171",
    "כוסות חד-פעמיות 50 יח׳",
    "home-products",
    "home-disposable",
    76_000,
    30.4
  ),
  item(
    "item-172",
    "סכום חד-פעמי 100 יח׳",
    "home-products",
    "home-disposable",
    56_000,
    32.8
  ),
  item(
    "item-173",
    "קופסאות אחסון 3 יח׳",
    "home-products",
    "home-storage",
    98_000,
    33.4
  ),
  item(
    "item-174",
    "נייר אפייה 20 מ׳",
    "home-products",
    "home-storage",
    78_000,
    34.8
  ),
  item(
    "item-175",
    "שקיות זבל 30 ליטר 50 יח׳",
    "home-products",
    "home-bags",
    112_000,
    28.4
  ),
  item(
    "item-176",
    "שקיות קפואים 24X36 50 יח׳",
    "home-products",
    "home-bags",
    87_000,
    29.8
  ),

  // ─── baby ───────────────────────────────────────────────────────────────
  item(
    "item-23",
    "חיתולי האגיס מידה 4",
    "baby",
    "baby-diapers",
    176_000,
    18.9,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&h=120&fit=crop",
      lastYearMonthlySales: 165_000,
      stockoutDays: 4,
      estimatedProfitLoss: 42_300,
    }
  ),
  item(
    "item-177",
    "חיתולי פמפרס מידה 3",
    "baby",
    "baby-diapers",
    156_000,
    19.4
  ),
  item(
    "item-178",
    "מגבוני תינוקות האגיס 72 יח׳",
    "baby",
    "baby-diapers",
    112_000,
    22.1
  ),
  item("item-179", "מטרנה שלב 1 700 גר׳", "baby", "baby-food", 189_000, 17.4),
  item(
    "item-180",
    "מחית תפוח עץ גרבר 110 גר׳",
    "baby",
    "baby-food",
    78_000,
    25.8
  ),
  item("item-181", "קרם תחת לתינוק 100 מ״ל", "baby", "baby-care", 87_000, 28.4),
  item(
    "item-182",
    "שמפו תינוקות ג׳ונסון 300 מ״ל",
    "baby",
    "baby-care",
    98_000,
    27.2
  ),
  item(
    "item-183",
    "בקבוקי האכלה אבנט 250 מ״ל",
    "baby",
    "baby-accessories",
    67_000,
    30.4
  ),
  item(
    "item-184",
    "מוצץ NUK 0-6 חודשים",
    "baby",
    "baby-accessories",
    45_000,
    32.8
  ),

  // ─── deli ───────────────────────────────────────────────────────────────
  item("item-185", "פטה יווני 200 גר׳", "deli", "deli-cheese", 134_000, 34.2),
  item(
    "item-186",
    "גבינת בולגרית 200 גר׳",
    "deli",
    "deli-cheese",
    112_000,
    33.4
  ),
  item("item-187", "מוצרלה טרייה 250 גר׳", "deli", "deli-cheese", 98_000, 32.8),
  item("item-188", "סלט חצילים 250 גר׳", "deli", "deli-salads", 87_000, 38.4),
  item("item-189", "סלט טחינה 250 גר׳", "deli", "deli-salads", 112_000, 37.2),
  item("item-190", "חומוס ביתי 250 גר׳", "deli", "deli-salads", 134_000, 36.8),
  item(
    "item-191",
    "זיתי קלמטה 300 גר׳",
    "deli",
    "deli-antipasti",
    76_000,
    40.1
  ),
  item(
    "item-192",
    "עגבניות מיובשות 200 גר׳",
    "deli",
    "deli-antipasti",
    67_000,
    41.2
  ),
  item(
    "item-193",
    "פסטרמה מעושנת 150 גר׳",
    "deli",
    "deli-smoked",
    98_000,
    38.9
  ),
  item(
    "item-194",
    "סלמון מעושן דלי 100 גר׳",
    "deli",
    "deli-smoked",
    87_000,
    39.8
  ),

  // ─── organic ────────────────────────────────────────────────────────────
  item(
    "item-21",
    "חטיף גרנולה 40 גר׳",
    "organic",
    "organic-snacks",
    89_000,
    41.2,
    {
      imageUrl:
        "https://images.unsplash.com/photo-1490567674467-4eea9cbdde69?w=120&h=120&fit=crop",
      lastYearMonthlySales: 76_000,
      stockoutDays: 0,
      estimatedProfitLoss: 0,
    }
  ),
  item(
    "item-195",
    "חטיף פרי יבש 30 גר׳",
    "organic",
    "organic-snacks",
    67_000,
    42.4
  ),
  item(
    "item-196",
    "אגוזים מעורבים אורגני 200 גר׳",
    "organic",
    "organic-snacks",
    98_000,
    40.8
  ),
  item(
    "item-197",
    "קינואה אורגנית 500 גר׳",
    "organic",
    "organic-grains",
    76_000,
    38.2
  ),
  item(
    "item-198",
    "כוסמת אורגנית 500 גר׳",
    "organic",
    "organic-grains",
    54_000,
    39.4
  ),
  item(
    "item-199",
    "אבקת כורכום 100 גר׳",
    "organic",
    "organic-superfood",
    67_000,
    44.8
  ),
  item(
    "item-200",
    "זרעי צ׳יה 250 גר׳",
    "organic",
    "organic-superfood",
    56_000,
    43.2
  ),
  item(
    "item-201",
    "חלב שקדים אורגני 1 ליטר",
    "organic",
    "organic-drinks",
    78_000,
    38.4
  ),
  item(
    "item-202",
    "מיץ גזר אורגני 750 מ״ל",
    "organic",
    "organic-drinks",
    45_000,
    41.2
  ),
];

export function getChainItems(): ChainItem[] {
  return items;
}

export function getTopStockoutItem(): ChainItem {
  return items.reduce((max, item) =>
    item.estimatedProfitLoss > max.estimatedProfitLoss ? item : max
  );
}

export function getTopSalesItem(): ChainItem {
  return items.reduce((max, item) =>
    item.monthlySales > max.monthlySales ? item : max
  );
}

export function getTopPromoItem(): ChainItem {
  return items
    .filter((item) => item.promoSales != null)
    .reduce((max, item) =>
      (item.promoSales ?? 0) > (max.promoSales ?? 0) ? item : max
    );
}

/**
 * Items within a given department. Used for Product picker filtering.
 */
export function getItemsByDepartment(categoryId: string): ChainItem[] {
  return items.filter((i) => i.categoryId === categoryId);
}

/**
 * Items within a given segment. Used by the promo simulator Step 1 picker
 * after the user has chosen both a Department and a Segment.
 */
export function getItemsBySegment(segmentId: string): ChainItem[] {
  return items.filter((i) => i.segmentId === segmentId);
}
