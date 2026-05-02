// Promo Simulator — Series (brand-line product families) per Supplier × Sub-category.
//
// "Series" is a new concept introduced for the simulator (see context.md and
// decisions/2026-05-02-promo-simulator-taxonomy.md). It groups SKUs from one
// supplier into recognizable brand-line families inside a single sub-category,
// e.g. Wissotzky × hot-tea → "תה ירוק", "חליטות פרי", "מג'יק".
//
// Coverage rule: EVERY (supplier × sub-category) pair listed in
// `mock-subcategory-suppliers.ts` must yield a non-empty series list.
// Implementation:
//   1. The bespoke `SUPPLIER_SERIES` map below covers well-known brand
//      combinations with hand-written, brand-authentic series names
//      (e.g. ויסוצקי × tea → תה ירוק / חליטות פרי / מג'יק).
//   2. For any pair NOT in the bespoke map, `generateDefaultSeries` builds
//      three plausible series using a Department-themed variant set
//      (e.g. שסטוביץ × tuna → שסטוביץ טונה קלאסי / במים / בשמן זית).
//
// Result: the "סדרה" dropdown is always populated when supplier+subcategory
// are chosen.

import { findSubCategoryById } from "./mock-promo-taxonomy";
import { getSupplierById } from "./mock-suppliers";

const SUPPLIER_SERIES: Record<string, string[]> = {
  // ── Wissotzky (sup-22) — tea & infusions ────────────────
  "sup-22__tea": ["תה שחור קלאסי", "תה ירוק", "תה ארל גריי", "מג'יק פרימיום"],
  "sup-22__herbal-infusions": [
    "חליטות פרי",
    "חליטות צמחים",
    "חליטות שינה",
    "חליטות עיכול",
  ],
  "sup-22__iced-tea": ["תה קר אפרסק", "תה קר לימון", "תה קר ירוק"],

  // ── Elite (sup-07) — coffee, chocolate ──────────────────
  "sup-07__coffee": ["טורקי קלאסי", "טורקי הל", "אספרסו", "נמס פרימיום"],
  "sup-07__hot-chocolate": ["שוקו עלית", "פרה אדומה"],
  "sup-07__baking-chocolate": ["טבלת אפייה מריר", "שבבי שוקולד"],
  "sup-07__chocolate-spread": ["ממרח עלית קלאסי", "ממרח עלית לבן"],
  "sup-07__nuts": ["אגוזי מלך", "שקדים קלויים", "פיסטוקים"],

  // ── Nestle Israel (sup-12) — coffee, juices, cereal ─────
  "sup-12__coffee": ["נסקפה קלאסי", "נסקפה גולד", "דולצ'ה גוסטו"],
  "sup-12__hot-chocolate": ["נסקיק", "קוקואו"],
  "sup-12__cereal": ["נסקוויק", "צ'יריוס", "פיטנס"],
  "sup-12__juices": ["נביעות מיצים"],

  // ── Strauss (sup-02) — dairy, snacks, sauces ────────────
  "sup-02__natural-yogurt": ["יוגורט יבנה", "יוגורט אקטיביה"],
  "sup-02__fruit-yogurt": ["יוגורט יופלה", "אקטיביה פרי", "מולר"],
  "sup-02__greek-yogurt": ["יוון פרימיום"],
  "sup-02__milky": ["מילקי קלאסי", "מילקי קצפת"],
  "sup-02__danone-style": ["דנונה", "דנט"],
  "sup-02__pudding": ["דנט פודינג", "מוס שוקולד"],
  "sup-02__chocolate-milk": ["יוטבתה שוקו", "טעמן"],
  "sup-02__sliced-cheese": ["צ'דר פרוס", "אמנטל פרוס"],
  "sup-02__chocolate-spread": ["דובדבן", "הראלד"],
  "sup-02__margarine-spread": ["שמנת מרגרינה לבישול"],

  // ── Tnuva (sup-01) — dairy core ────────────────────────
  "sup-01__milk-1": ["תנובה 1% טרי", "תנובה אורגני 1%"],
  "sup-01__milk-3": ["תנובה 3% טרי", "תנובה תיל 3%"],
  "sup-01__cottage-classic": ["קוטג' תנובה 5%", "קוטג' תנובה 9%"],
  "sup-01__cottage-light": ["קוטג' לייט 3%"],
  "sup-01__bulgarian": ["בולגרית תנובה 5%", "בולגרית תנובה 16%"],
  "sup-01__feta": ["פטה תנובה", "פטה יוון"],
  "sup-01__halloumi": ["חלומי תנובה"],
  "sup-01__mozzarella-block": ["מוצרלה תנובה"],
  "sup-01__mozzarella-shredded": ["מוצרלה מגורדת תנובה"],
  "sup-01__natural-yogurt": ["תנובה לבן 3%", "תנובה לבן 0%"],
  "sup-01__butter-salted": ["חמאת תנובה מלוחה"],
  "sup-01__butter-unsalted": ["חמאת תנובה לא מלוחה"],
  "sup-01__sweet-cream": ["שמנת מתוקה תנובה 38%"],
  "sup-01__sour-cream": ["שמנת חמוצה תנובה 27%"],
  "sup-01__eggs-large": ["ביצי תנובה L", "ביצי תנובה XL"],
  "sup-01__eggs-organic": ["ביצי חופש תנובה", "ביצים אורגניות תנובה"],

  // ── Tara (sup-13) — dairy ──────────────────────────────
  "sup-13__milk-1": ["טרה 1%", "טרה אורגני"],
  "sup-13__milk-3": ["טרה 3% טרי"],
  "sup-13__cottage-classic": ["קוטג' טרה 5%"],
  "sup-13__natural-yogurt": ["יוגורט טרה"],

  // ── Yotvata (sup-34) — milk fortified ───────────────────
  "sup-34__chocolate-milk": ["שוקו יטבתה", "שוקו יטבתה לייט"],
  "sup-34__milk-1": ["יטבתה 1%"],
  "sup-34__milk-3": ["יטבתה 3%"],
  "sup-34__fortified-milk": ["יטבתה מועשר ויטמין D"],

  // ── Coca-Cola (sup-26) — drinks ─────────────────────────
  "sup-26__carbonated": [
    "קוקה קולה קלאסי",
    "קוקה קולה זירו",
    "ספרייט",
    "פאנטה",
  ],
  "sup-26__soft-drinks": ["דיאט קולה", "קולה ללא קפאין"],
  "sup-26__energy": ["מונסטר אנרג'י"],

  // ── Tempo (sup-27) — drinks & beer ─────────────────────
  "sup-27__carbonated": ["שוופס", "RC קולה"],
  "sup-27__beer": ["גולדסטאר", "מכבי", "היינקן"],
  "sup-27__soft-drinks": ["XL טעמים"],

  // ── Red Bull (sup-28) ──────────────────────────────────
  "sup-28__energy": ["רד בול קלאסי", "רד בול שוגר פרי", "רד בול טרופי"],

  // ── Prigat (sup-21) — juices ───────────────────────────
  "sup-21__juices": ["פריגת תפוזים", "פריגת ענבים", "פריגת מנגו"],
  "sup-21__iced-tea": ["פריגת תה קר אפרסק"],

  // ── Yafora-Tabori (sup-25) — water ─────────────────────
  "sup-25__still-water": ["נביעות מים"],
  "sup-25__sparkling-water": ["מי עדן מוגזים"],
  "sup-25__spring-bottles": ["מי עדן 6 ליטר", "נביעות 1.5 ליטר"],

  // ── Wineries ───────────────────────────────────────────
  "sup-31__wine-red": ["יראון", "אלמה", "ריזרב"],
  "sup-31__wine-white": ["סוביניון בלאן", "שרדונה גליל"],
  "sup-32__wine-red": ["ברקן רזרב", "ברקן קלאסי", "סופריור"],
  "sup-32__wine-white": ["ברקן שרדונה"],
  "sup-32__spirits": ["וודקה כרמל"],
  "sup-33__wine-red": ["יתיר", "מד-יתיר", "כרמל סלקטד"],
  "sup-33__wine-white": ["סוביניון בלאן כרמל"],

  // ── Sano (sup-06) — cleaning ────────────────────────────
  "sup-06__detergent": ["סנו מאט", "סנו ביו", "סנו ספיריט"],
  "sup-06__softener": ["סנו מקסימה", "סנו פבריק"],
  "sup-06__floor": ["סנו פוליווקס", "סנו ג'יל"],
  "sup-06__bleach": ["סנו אקונומיקה", "סנו פוקס"],
  "sup-06__dish-soap": ["סנו ג'אווה", "סנו לימון"],
  "sup-06__alcogel": ["סנו אלכוג'ל"],
  "sup-06__trash-bags": ["סנו פרסטו", "סנו אקסטרא"],

  // ── Henkel (sup-15) — cleaning ──────────────────────────
  "sup-15__detergent": ["פרסיל קולור", "פרסיל גולד", "פרסיל סנסטיב"],
  "sup-15__softener": ["סופט פרסיל"],
  "sup-15__dishwasher": ["סומאט אול אין 1", "סומאט קלאסיק"],

  // ── P&G (sup-09) ────────────────────────────────────────
  "sup-09__detergent": ["אריאל גולד", "אריאל מאטיק"],
  "sup-09__paper-towels": ["באונטי"],
  "sup-09__toilet-paper": ["צ'רמין"],
  "sup-09__tissues": ["טמפו לבן"],

  // ── Kimberly-Clark (sup-10) — paper ────────────────────
  "sup-10__paper-towels": ["סקוט פרימיום", "ולוטה"],
  "sup-10__toilet-paper": ["סקוט קלאסי", "קלינקס פרסטיג'"],
  "sup-10__tissues": ["קלינקס לבן", "קלינקס בלסם"],
  "sup-10__napkins": ["קלינקס מפיות"],

  // ── Tefal (sup-47) — cookware ───────────────────────────
  "sup-47__non-stick-pans": [
    "Tefal Ingenio",
    "Tefal Titanium",
    "Tefal Comfort",
  ],
  "sup-47__pots-stainless": ["Tefal Cook & Serve"],
  "sup-47__wok": ["Tefal Wok Titanium"],
  "sup-47__pressure-cooker": ["Tefal Clipso"],
  "sup-47__baking-trays": ["Tefal Easy Grip"],

  // ── Pyrex (sup-46) ─────────────────────────────────────
  "sup-46__baking-trays": ["Pyrex קלאסי", "Pyrex Smart Cooking"],
  "sup-46__plates-bowls": ["Pyrex זכוכית טמפר"],
  "sup-46__plastic-containers": ["Pyrex Cook & Store"],

  // ── Barilla (sup-37) — pasta ───────────────────────────
  "sup-37__pasta": ["ספגטי ברילה", "פנה ברילה", "פוסילי ברילה", "לינגוויני"],

  // ── Sugat (sup-36) — sugar/rice ────────────────────────
  "sup-36__sugar": ["סוגת לבן", "סוגת חום", "סוגתל ממתיקים"],
  "sup-36__rice": ["סוגת בסמטי", "סוגת ארוך פרי", "סוגת עגול"],

  // ── Osem-Nestle (sup-03) ───────────────────────────────
  "sup-03__pasta": ["אסם פסטה קלאסית", "אסם בריאות מלאה"],
  "sup-03__soup-base": ["אבקת מרק עוף אסם", "אבקת מרק בקר אסם"],
  "sup-03__cereal": ["אסם קוקו פופס", "אסם בייבי קוקוס"],
  "sup-03__chocolate-spread": ["שחר ממרח שוקולד"],

  // ── Achva (sup-23) — dried fruit, halva ────────────────
  "sup-23__dates": ["תמרי מדג'ול אחוה"],
  "sup-23__nuts": ["אגוזים מעורבים אחוה"],
  "sup-23__tahini-peanut": ["טחינה אחוה גולמית", "חלבה אחוה"],

  // ── Poultry suppliers ──────────────────────────────────
  "sup-43__whole-chicken": ["עוף העמק טרי", "עוף העמק חופש"],
  "sup-43__chicken-breast": ["חזה עוף טרי העמק"],
  "sup-43__marinated-breast": ["חזה מתובל לחומר", "חזה מתובל לטריאקי"],
  "sup-44__whole-chicken": ["עוף טוב טרי"],
  "sup-44__chicken-breast": ["חזה עוף טוב"],
  "sup-45__whole-chicken": ["מאמא עוף טרי"],

  // ── Salmon Norway Ltd (sup-50) ────────────────────────
  "sup-50__fresh-salmon": ["סלמון אטלנטי טרי", "סלמון פרוס"],
  "sup-50__smoked-salmon": ["סלמון מעושן קלאסי", "סלמון מעושן מלפפון"],
  "sup-50__white-fish-fillet": ["דניס פילה", "מוסר פילה"],
  "sup-50__shrimp": ["שרימפס מבושל", "שרימפס נא"],

  // ── Zoglobek (sup-20) — processed meat ─────────────────
  "sup-20__hot-dogs": ["נקניקיות זוגלובק קלאסי", "נקניקיות זוגלובק עוף"],
  "sup-20__salami-pastrami": ["סלמי זוגלובק", "פסטרמת הודו זוגלובק"],
  "sup-20__schnitzel-ready": ["שניצל זוגלובק קפוא"],
  "sup-20__burgers-ready": ["המבורגר זוגלובק"],

  // ── Meir Ezra (sup-18) — beef ──────────────────────────
  "sup-18__steaks": ["סטייק אנטרקוט מאיר עזרא", "סטייק סינטה מאיר עזרא"],
  "sup-18__deli-cuts": ["פסטרמה מאיר עזרא"],

  // ── Katzet (sup-17) ────────────────────────────────────
  "sup-17__steaks": ["כצט אנטרקוט פרימיום"],
  "sup-17__ground-beef": ["כצט בקר טחון 12%", "כצט בקר טחון 25%"],
};

// Department-themed variant sets used by the auto-generator below.
// Each entry contributes the trailing word of the generated series name.
// Example: שסטוביץ × tuna → "שסטוביץ טונה קלאסי" / "...במים" / "...בשמן זית".
const DEFAULT_VARIANTS_BY_DEPARTMENT: Record<string, string[]> = {
  drinks: ["קלאסי", "לייט", "פרימיום"],
  cleaning: ["מרוכז", "רגיל", "אקטיב"],
  canned: ["קלאסי", "במים", "בשמן זית"],
  staples: ["קלאסי", "חיטה מלאה", "פרימיום"],
  fruits: ["מובחר", "מארז משפחה", "אורגני"],
  vegetables: ["טרי", "מארז", "אורגני"],
  "produce-packs": ["מארז משפחתי", "מארז יחיד", "פרימיום"],
  "white-cheese": ["5%", "לייט 3%", "פרימיום"],
  "yellow-cheese": ["קלאסי", "פרוס", "מגורד"],
  milk: ["1%", "3%", "עמיד"],
  "butter-cream": ["קלאסי", "מלוח", "ללא לקטוז"],
  desserts: ["קלאסי", "לייט", "פרימיום"],
  cookware: ["קלאסי", "פרימיום", "פרו"],
  disposable: ["רגיל", "פרימיום", "אקו"],
  decor: ["קלאסי", "פרימיום", "עונתי"],
  poultry: ["טרי", "מתובל", "אורגני"],
  "red-meat": ["טרי", "מבושל", "פרימיום"],
  fish: ["טרי", "מעושן", "פילה"],
};

const DEFAULT_FALLBACK_VARIANTS = ["קלאסי", "פרימיום", "מארז משפחתי"];

function generateDefaultSeries(
  supplierId: string,
  subcategoryId: string
): string[] {
  const supplier = getSupplierById(supplierId);
  const found = findSubCategoryById(subcategoryId);
  if (!supplier || !found) return [];
  const supplierName = supplier.name;
  const subName = found.subCategory.nameHe;
  const variants =
    DEFAULT_VARIANTS_BY_DEPARTMENT[found.department.id] ??
    DEFAULT_FALLBACK_VARIANTS;
  return variants.map((v) => `${supplierName} ${subName} ${v}`);
}

export function getSeriesForSupplierAndSubCategory(
  supplierId: string,
  subcategoryId: string
): string[] {
  const bespoke = SUPPLIER_SERIES[`${supplierId}__${subcategoryId}`];
  if (bespoke && bespoke.length > 0) return bespoke;
  return generateDefaultSeries(supplierId, subcategoryId);
}
