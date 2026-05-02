// Per-scope archive & KPI generator for the promo simulator.
//
// Why this exists: the legacy `historicalPromotions` / `buyAndGetPromos` /
// `categoryKpis` data in `mock-promo-history.ts` is keyed by old Hebrew
// Department names ("ירקות", "מכולת", "מוצרי חלב", …). The simulator now
// scopes by Group/Department/Category/Sub-category/Supplier/Series — many of
// which have no entry in the legacy data. This generator produces
// deterministic, brand-aware mock content for ANY scope so the Archive and
// Background sheets are never empty.
//
// "Deterministic" = the same scope always produces the same content. We hash
// the scope key so the page doesn't shuffle on every render.
//
// Coverage: every (subcategoryId, supplierId?, series?) triple yields >= 3
// historical promos, >= 2 buy-and-get tiles, and >= 5 KPIs.

import type {
  BuyAndGetPromo,
  CategoryKpi,
  HistoricalPromotion,
  KpiStatus,
  KpiTrend,
} from "./mock-promo-history";
import { findSubCategoryById } from "./mock-promo-taxonomy";
import { getSupplierById } from "./mock-suppliers";

export interface ArchiveScope {
  subcategoryId: string;
  supplierId: string;
  series: string;
}

// Tiny deterministic hash → integer in [0, 2^31).
function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h;
}

// Returns `count` integers in [min, max], deterministically derived from `seed`.
function pickN(
  seed: string,
  count: number,
  min: number,
  max: number
): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const h = hash(`${seed}|${i}`);
    out.push(min + (h % (max - min + 1)));
  }
  return out;
}

const PROMO_TYPES: HistoricalPromotion["promoType"][] = [
  "הנחה",
  "1+1",
  "חבילה",
  "מחיר מיוחד",
  "קנה X קבל Y",
];

const HISTORY_DATES = [
  "2025-02-10",
  "2025-04-21",
  "2025-06-03",
  "2025-08-14",
  "2025-10-05",
  "2025-11-18",
  "2026-01-09",
  "2026-03-02",
];

const LEARNING_TEMPLATES = [
  "ההנחה תפסה תאוצה בשבוע השני — להאריך פעם הבאה.",
  "ההיענות הייתה גבוהה רק בסניפים עירוניים.",
  "מחיר הסף עבד טוב בגלל קמפיין דיגיטלי מקביל.",
  "הסטוק נגמר לפני הסוף — להגדיל הזמנה ב-30%.",
  "תיק הקנייה הממוצע גדל בסל הצמוד למבצע.",
  "אפליפט שמרני — הקטגוריה רוויה ממילא.",
  "תוצאה מתחת ליעד — נסה משך 10 ימים בלבד.",
];

function makeName(
  promoType: HistoricalPromotion["promoType"],
  scopeName: string,
  variant: number
): string {
  const verb =
    promoType === "1+1"
      ? "1+1"
      : promoType === "מחיר מיוחד"
        ? "מחיר מיוחד"
        : promoType === "חבילה"
          ? "חבילת"
          : promoType === "קנה X קבל Y"
            ? "קנה וקבל"
            : "מבצע";
  return variant === 0
    ? `${verb} ${scopeName}`
    : `${verb} ${scopeName} #${variant + 1}`;
}

function buildScopeName(scope: ArchiveScope): string {
  const found = findSubCategoryById(scope.subcategoryId);
  const sub = found?.subCategory.nameHe ?? "";
  const supplier = scope.supplierId
    ? (getSupplierById(scope.supplierId)?.name ?? "")
    : "";
  if (scope.series) return `${supplier} — ${scope.series}`;
  if (supplier) return `${supplier} — ${sub}`;
  return sub;
}

function seedKey(scope: ArchiveScope, kind: string): string {
  return [
    scope.subcategoryId,
    scope.supplierId || "",
    scope.series || "",
    kind,
  ].join("|");
}

export function generateHistoricalPromosForScope(
  scope: ArchiveScope
): HistoricalPromotion[] {
  if (!scope.subcategoryId) return [];
  const scopeName = buildScopeName(scope);
  // Series scope = narrowest → 3 results; supplier = 4; sub-cat = 5.
  const count = scope.series ? 3 : scope.supplierId ? 4 : 5;
  const seed = seedKey(scope, "history");

  const discountIdxs = pickN(seed + "|disc", count, 10, 35);
  const baseUnitsIdxs = pickN(seed + "|base", count, 800, 4500);
  const upliftIdxs = pickN(seed + "|upl", count, -5, 75);
  const dateIdxs = pickN(seed + "|date", count, 0, HISTORY_DATES.length - 1);
  const durationIdxs = pickN(seed + "|dur", count, 1, 4);
  const promoTypeIdxs = pickN(seed + "|type", count, 0, PROMO_TYPES.length - 1);
  const learningIdxs = pickN(
    seed + "|lrn",
    count,
    0,
    LEARNING_TEMPLATES.length - 1
  );
  const productIdxs = pickN(seed + "|prod", count, 0, 100);

  return Array.from({ length: count }, (_, i) => {
    const promoType = PROMO_TYPES[promoTypeIdxs[i] ?? 0]!;
    const upliftPct = upliftIdxs[i] ?? 20;
    const baseUnits = baseUnitsIdxs[i] ?? 1000;
    const actualUnits = Math.round(baseUnits * (1 + upliftPct / 100));
    const discountPct = discountIdxs[i] ?? 15;
    const startDate = HISTORY_DATES[dateIdxs[i] ?? 0]!;
    const durationWeeks = durationIdxs[i] ?? 2;
    const unitPrice = 8 + ((productIdxs[i] ?? 0) % 25);
    const revenue = Math.round(
      actualUnits * unitPrice * (1 - discountPct / 100)
    );
    const roi = upliftPct > 0 ? Math.max(0.5, upliftPct / 18) : 0.4;
    const outcome: HistoricalPromotion["outcome"] =
      upliftPct >= 30 ? "הצלחה" : upliftPct >= 12 ? "ממוצע" : "תת-ביצוע";

    return {
      id: `gen-hist-${seed}-${i}`,
      category: scopeName,
      product:
        scope.series ||
        (scope.supplierId
          ? buildScopeName({ ...scope, series: "" })
          : undefined),
      name: makeName(promoType, scopeName, i),
      promoType,
      startDate,
      durationWeeks,
      discountPct,
      baseUnits,
      actualUnits,
      upliftPct: Number(upliftPct.toFixed(1)),
      revenue,
      roi: Number(roi.toFixed(1)),
      outcome,
      learnings: LEARNING_TEMPLATES[learningIdxs[i] ?? 0]!,
    };
  });
}

const BUY_AND_GET_CONDITIONS = ["קנה 2", "קנה 3", "קנה מוצר X", "סל מעל ₪150"];
const BUY_AND_GET_BENEFITS = [
  "קבל 1 חינם",
  "השני ב-50%",
  "20% הנחה על הסל",
  "מתנה לחבר מועדון",
];

export function generateBuyAndGetForScope(
  scope: ArchiveScope
): BuyAndGetPromo[] {
  if (!scope.subcategoryId) return [];
  const scopeName = buildScopeName(scope);
  const count = scope.supplierId ? 2 : 3;
  const seed = seedKey(scope, "bg");

  const dateIdxs = pickN(seed + "|date", count, 0, HISTORY_DATES.length - 1);
  const upliftIdxs = pickN(seed + "|upl", count, 22, 70);
  const revenueIdxs = pickN(seed + "|rev", count, 60_000, 240_000);
  const unitsIdxs = pickN(seed + "|u", count, 2_500, 11_000);
  const condIdxs = pickN(
    seed + "|cond",
    count,
    0,
    BUY_AND_GET_CONDITIONS.length - 1
  );
  const benefitIdxs = pickN(
    seed + "|ben",
    count,
    0,
    BUY_AND_GET_BENEFITS.length - 1
  );

  return Array.from({ length: count }, (_, i) => {
    const startDate = HISTORY_DATES[dateIdxs[i] ?? 0]!;
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
    const endDate = end.toISOString().slice(0, 10);
    const condition = BUY_AND_GET_CONDITIONS[condIdxs[i] ?? 0]!;
    const benefit = BUY_AND_GET_BENEFITS[benefitIdxs[i] ?? 0]!;

    return {
      id: `gen-bg-${seed}-${i}`,
      category: scopeName,
      name: `${condition} → ${benefit}`,
      productName: scopeName,
      startDate,
      endDate,
      condition,
      benefit,
      totalRevenue: revenueIdxs[i] ?? 100_000,
      unitsSold: unitsIdxs[i] ?? 5_000,
      upliftPct: Number((upliftIdxs[i] ?? 35).toFixed(1)),
    };
  });
}

const KPI_DEFS: Array<{
  id: string;
  label: string;
  fmt: (n: number) => string;
  range: [number, number];
  good: number; // value >= good → good (or <= for inverse)
  warn: number;
  inverse?: boolean; // lower-is-better
  description: string;
  benchmark?: string;
}> = [
  {
    id: "ytd-growth",
    label: "צמיחת YTD",
    fmt: (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`,
    range: [-3, 18],
    good: 7,
    warn: 2,
    description: "צמיחת מכירות מצטברת מתחילת השנה מול אשתקד.",
    benchmark: "יעד: +7%",
  },
  {
    id: "avg-uplift",
    label: "אפליפט ממוצע במבצעים",
    fmt: (n) => `${n.toFixed(1)}%`,
    range: [10, 55],
    good: 30,
    warn: 18,
    description: "ממוצע ה-uplift על פני המבצעים האחרונים.",
    benchmark: "יעד מינימלי: 25%",
  },
  {
    id: "stockout",
    label: "Stockout Rate",
    fmt: (n) => `${n.toFixed(1)}%`,
    range: [1, 9],
    good: 3,
    warn: 5,
    inverse: true,
    description: "אחוז ה-SKU שיצאו ממלאי בתקופת המבצע.",
    benchmark: "יעד: ≤3%",
  },
  {
    id: "gross-margin",
    label: "Gross Margin",
    fmt: (n) => `${n.toFixed(1)}%`,
    range: [14, 38],
    good: 27,
    warn: 21,
    description: "שיעור רווח גולמי בקטגוריה.",
    benchmark: "יעד: 28%",
  },
  {
    id: "promo-share",
    label: "אחוז מכירות במבצע",
    fmt: (n) => `${n.toFixed(1)}%`,
    range: [18, 62],
    good: 35,
    warn: 25,
    description: "חלקם של מבצעים מתוך המחזור הכולל בקטגוריה.",
  },
  {
    id: "basket-attach",
    label: "צמיחת סל מצורף",
    fmt: (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`,
    range: [-2, 14],
    good: 6,
    warn: 2,
    description: "השפעת מבצעים על גודל הסל הממוצע של הקונה.",
  },
];

function statusFor(value: number, def: (typeof KPI_DEFS)[number]): KpiStatus {
  if (def.inverse) {
    if (value <= def.good) return "good";
    if (value <= def.warn) return "warning";
    return "bad";
  }
  if (value >= def.good) return "good";
  if (value >= def.warn) return "warning";
  return "bad";
}

function trendFor(seed: string): { trend: KpiTrend; delta: string } {
  const choice = hash(seed) % 3;
  if (choice === 0) {
    const v = 1 + (hash(seed + "|d") % 4);
    return {
      trend: "up",
      delta: `+${v}.${hash(seed + "|f") % 10}% מחודש שעבר`,
    };
  }
  if (choice === 1) {
    const v = 1 + (hash(seed + "|d") % 3);
    return {
      trend: "down",
      delta: `-${v}.${hash(seed + "|f") % 10}% מחודש שעבר`,
    };
  }
  return { trend: "flat", delta: "ללא שינוי מחודש שעבר" };
}

export function generateKpisForScope(scope: ArchiveScope): CategoryKpi[] {
  if (!scope.subcategoryId) return [];
  const seed = seedKey(scope, "kpi");

  return KPI_DEFS.map((def, i) => {
    const span = def.range[1] - def.range[0];
    const raw =
      def.range[0] + (hash(`${seed}|${def.id}`) % (span * 10 + 1)) / 10;
    const value = def.fmt(raw);
    const status = statusFor(raw, def);
    const tr = trendFor(`${seed}|${def.id}|trend`);
    return {
      id: `${def.id}-${i}`,
      label: def.label,
      value,
      rawValue: Number(raw.toFixed(1)),
      trend: tr.trend,
      trendDelta: tr.delta,
      benchmark: def.benchmark,
      status,
      description: def.description,
    };
  });
}
