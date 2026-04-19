// Mock Department → Segment taxonomy.
//
// Per the glossary (context.md), the legacy `categoryId` on items and
// `CategorySummary` entries are actually Departments (חלב, מכולת, ...).
// This file adds the true Category level — called "Segment" in the promo
// simulator UI — grouped under each Department. Items (SKUs) point to one
// segment via `segmentId` in mock-items.ts.
//
// Used by the promo simulator Step 1 cascading dropdowns:
//   Category (Department) → Segment → Product (Item).

export interface Segment {
  id: string;
  nameHe: string;
}

// Keyed by the existing departmentId used across branches and items.
export const SEGMENTS_BY_DEPARTMENT: Record<string, Segment[]> = {
  dairy: [
    { id: "dairy-milk", nameHe: "חלב נוזלי" },
    { id: "dairy-cheese-yellow", nameHe: "גבינות צהובות" },
    { id: "dairy-cheese-white", nameHe: "גבינות לבנות" },
    { id: "dairy-yogurt", nameHe: "יוגורטים ומעדנים" },
    { id: "dairy-butter-cream", nameHe: "חמאה ושמנת" },
    { id: "dairy-plant", nameHe: "תחליפי חלב" },
  ],
  grocery: [
    { id: "grocery-pasta-rice", nameHe: "פסטה ואורז" },
    { id: "grocery-oil-vinegar", nameHe: "שמנים וחומץ" },
    { id: "grocery-canned", nameHe: "שימורים" },
    { id: "grocery-snacks", nameHe: "חטיפים ומתיקה" },
    { id: "grocery-coffee-tea", nameHe: "קפה ותה" },
    { id: "grocery-breakfast", nameHe: "דגני בוקר וממרחים" },
    { id: "grocery-baking", nameHe: "אפייה ובישול" },
    { id: "grocery-eggs", nameHe: "ביצים" },
  ],
  frozen: [
    { id: "frozen-meat", nameHe: "בשר ועוף קפוא" },
    { id: "frozen-fish", nameHe: "דגים קפואים" },
    { id: "frozen-pastry", nameHe: "בצקים ומאפים קפואים" },
    { id: "frozen-ready", nameHe: "ארוחות מוכנות" },
    { id: "frozen-vegetables", nameHe: "ירקות קפואים" },
    { id: "frozen-dessert", nameHe: "גלידות ומוצרי קינוח" },
  ],
  drinks: [
    { id: "drinks-carbonated", nameHe: "משקאות מוגזים" },
    { id: "drinks-juice", nameHe: "מיצים טבעיים" },
    { id: "drinks-water", nameHe: "מים ומינרלים" },
    { id: "drinks-energy", nameHe: "משקאות אנרגיה וספורט" },
    { id: "drinks-alcohol", nameHe: "יין ואלכוהול" },
  ],
  "fresh-meat": [
    { id: "fresh-meat-beef", nameHe: "בקר טרי" },
    { id: "fresh-meat-chicken", nameHe: "עוף טרי" },
    { id: "fresh-meat-turkey", nameHe: "הודו טרי" },
    { id: "fresh-meat-lamb", nameHe: "כבש טרי" },
    { id: "fresh-meat-deli", nameHe: "נקניקים ופסטרמה" },
  ],
  "fresh-fish": [
    { id: "fresh-fish-salmon", nameHe: "סלמון טרי" },
    { id: "fresh-fish-whitefish", nameHe: "דגים לבנים" },
    { id: "fresh-fish-seafood", nameHe: "פירות ים" },
    { id: "fresh-fish-smoked", nameHe: "דגים מעושנים" },
  ],
  bread: [
    { id: "bread-sliced", nameHe: "לחמים פרוסים" },
    { id: "bread-artisan", nameHe: "לחמי בוטיק" },
    { id: "bread-pita", nameHe: "פיתות ולחמניות" },
    { id: "bread-crackers", nameHe: "מצות וקרקרים" },
  ],
  vegetables: [
    { id: "veg-leafy", nameHe: "ירקות עליים" },
    { id: "veg-root", nameHe: "ירקות שורש" },
    { id: "veg-fruit", nameHe: "פירות עונה" },
    { id: "veg-citrus", nameHe: "הדרים" },
    { id: "veg-herbs", nameHe: "תבלינים ועשבים" },
    { id: "veg-organic", nameHe: "ירקות אורגניים" },
  ],
  pastries: [
    { id: "pastries-sabbath", nameHe: "מאפי שבת" },
    { id: "pastries-sweet", nameHe: "מאפים מתוקים" },
    { id: "pastries-savory", nameHe: "מאפים מלוחים" },
    { id: "pastries-cake", nameHe: "עוגות ועוגיות" },
  ],
  household: [
    { id: "household-laundry", nameHe: "כביסה" },
    { id: "household-dish", nameHe: "כלים וניקוי מטבח" },
    { id: "household-surface", nameHe: "ניקוי כללי" },
    { id: "household-bath", nameHe: "מקלחת ואמבטיה" },
  ],
  "home-products": [
    { id: "home-paper", nameHe: "מוצרי נייר" },
    { id: "home-disposable", nameHe: "כלים חד-פעמיים" },
    { id: "home-storage", nameHe: "אחסון ומטבח" },
    { id: "home-bags", nameHe: "שקיות ואריזה" },
  ],
  baby: [
    { id: "baby-diapers", nameHe: "חיתולים ומגבונים" },
    { id: "baby-food", nameHe: "מזון ותחליפי חלב" },
    { id: "baby-care", nameHe: "טיפוח תינוקות" },
    { id: "baby-accessories", nameHe: "אביזרים ואביזרי האכלה" },
  ],
  deli: [
    { id: "deli-cheese", nameHe: "גבינות מעדניה" },
    { id: "deli-salads", nameHe: "סלטים ומטבלים" },
    { id: "deli-antipasti", nameHe: "אנטיפסטי וזיתים" },
    { id: "deli-smoked", nameHe: "בשרים ודגים מעושנים" },
  ],
  organic: [
    { id: "organic-snacks", nameHe: "חטיפים בריאים" },
    { id: "organic-grains", nameHe: "דגנים מלאים" },
    { id: "organic-superfood", nameHe: "סופרפוד ותוספי מזון" },
    { id: "organic-drinks", nameHe: "משקאות טבעיים" },
  ],
};

// Build-time sanity check: every departmentId in DEPARTMENT_NAMES should
// have at least one segment. We don't import DEPARTMENT_NAMES here to
// keep this file self-contained; constants.ts consumers can assert.

/**
 * Returns segments for a department id, or an empty array if unknown.
 */
export function getSegmentsByDepartmentId(departmentId: string): Segment[] {
  return SEGMENTS_BY_DEPARTMENT[departmentId] ?? [];
}

/**
 * Returns segments by looking up the department via its Hebrew name
 * (since the simulator stores category by name, not id, today).
 */
export function getSegmentsByDepartmentName(
  departmentName: string,
  departmentNames: Record<string, string>
): Segment[] {
  const entry = Object.entries(departmentNames).find(
    ([, he]) => he === departmentName
  );
  if (!entry) return [];
  return getSegmentsByDepartmentId(entry[0]);
}

/**
 * Returns the Segment object for a given segment id, across all departments.
 */
export function findSegmentById(segmentId: string): Segment | undefined {
  for (const segs of Object.values(SEGMENTS_BY_DEPARTMENT)) {
    const found = segs.find((s) => s.id === segmentId);
    if (found) return found;
  }
  return undefined;
}
