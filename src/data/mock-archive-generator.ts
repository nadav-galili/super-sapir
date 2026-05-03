// Per-scope archive & KPI generator for the promo simulator.
//
// Why this exists: the legacy `historicalPromotions` / `categoryKpis` data
// in `mock-promo-history.ts` is keyed by old Hebrew
// Department names ("ירקות", "מכולת", "מוצרי חלב", …). The simulator now
// scopes by Group/Department/Category/Sub-category/Supplier/Series — many of
// which have no entry in the legacy data. This generator produces
// deterministic, brand-aware mock content for ANY scope so the Archive and
// Background sheets are never empty.
//
// "Deterministic" = the same scope always produces the same content. We hash
// the scope key so the page doesn't shuffle on every render.
//
// Coverage: every (subcategoryId, supplierId?, series?) triple yields >= 6
// historical promos and >= 5 KPIs.

import type {
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
  // Series scope = narrowest → 6 results; supplier = 7; sub-cat = 8.
  const count = scope.series ? 6 : scope.supplierId ? 7 : 8;
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

// Anchored "now" for the demo so daily date drift doesn't move the numbers.
// Today: 2026-05-03 → "last month" = April 2026, YTD covers Jan-1 → May-3 2026.
export const SNAPSHOT_NOW_ISO = "2026-05-03";

export interface SalesSnapshot {
  /** Narrow-scope YTD revenue (₪) — Jan-1 → 2026-05-03. */
  scopeYtdCurrent: number;
  /** Narrow-scope YTD revenue (₪) — Jan-1 → 2025-05-03. */
  scopeYtdPriorYear: number;
  /** Narrow-scope last-completed-month revenue (₪) — April 2026. */
  scopeMonthCurrent: number;
  /** Narrow-scope same-month-last-year revenue (₪) — April 2025. */
  scopeMonthPriorYear: number;
  /** Sub-category total YTD (₪) — denominator for the share %.
   *  Stable across scope narrowing inside the same sub-category. */
  subCategoryYtdCurrent: number;
}

/** Produce a deterministic sales snapshot for any scope. The narrow-scope
 *  amount equals `subCategoryYtdCurrent` at sub-cat scope, shrinks to a
 *  supplier slice at supplier scope, and to a series slice at series scope.
 *  Same scope → same numbers (hash-seeded). */
export function generateSalesSnapshotForScope(
  scope: ArchiveScope
): SalesSnapshot {
  const subCategoryYtdCurrent = subCategoryYtd(scope.subcategoryId);

  // Sub-cat YoY growth in [-8%, +18%], deterministic per sub-cat.
  // Drives the narrow-scope YoY baseline below.
  const subYoyPct = -8 + (hash(`${scope.subcategoryId}|sub-yoy`) % 261) / 10; // 0.0..26.1 → -8..+18.1

  // Supplier share of sub-cat in [12%, 48%].
  const supplierShare = scope.supplierId
    ? 0.12 +
      (hash(`${scope.subcategoryId}|${scope.supplierId}|sup-share`) % 361) /
        1000
    : 1;

  // Series share of supplier in [22%, 65%].
  const seriesShare = scope.series
    ? 0.22 +
      (hash(
        `${scope.subcategoryId}|${scope.supplierId}|${scope.series}|ser-share`
      ) %
        431) /
        1000
    : 1;

  const scopeYtdCurrent = Math.round(
    subCategoryYtdCurrent * supplierShare * seriesShare
  );

  // Narrow-scope YoY can deviate from sub-cat YoY by ±6 pp (seeded).
  const yoyJitter = -6 + (hash(`${seedKey(scope, "scope-yoy")}`) % 121) / 10; // -6..+6
  const scopeYoyPct = subYoyPct + yoyJitter;
  const scopeYtdPriorYear = Math.max(
    1000,
    Math.round(scopeYtdCurrent / (1 + scopeYoyPct / 100))
  );

  // Last-completed-month = ~ YTD/4.6 (5 months in YTD, last month is partial-ish),
  // with a ±15% seeded shape so months aren't identical sixths.
  const monthShape =
    0.85 + (hash(`${seedKey(scope, "month-shape")}`) % 301) / 1000; // 0.85..1.15
  const scopeMonthCurrent = Math.round((scopeYtdCurrent / 4.6) * monthShape);

  const monthYoyJitter =
    -8 + (hash(`${seedKey(scope, "month-yoy")}`) % 161) / 10; // -8..+8
  const scopeMonthYoyPct = scopeYoyPct + monthYoyJitter;
  const scopeMonthPriorYear = Math.max(
    500,
    Math.round(scopeMonthCurrent / (1 + scopeMonthYoyPct / 100))
  );

  return {
    scopeYtdCurrent,
    scopeYtdPriorYear,
    scopeMonthCurrent,
    scopeMonthPriorYear,
    subCategoryYtdCurrent,
  };
}

// Sub-category total YTD revenue in ₪. Range: 2M–20M (seeded).
function subCategoryYtd(subcategoryId: string): number {
  if (!subcategoryId) return 0;
  const h = hash(`${subcategoryId}|sub-cat-ytd`);
  return 2_000_000 + (h % 18_001) * 1000;
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
    id: "gross-margin",
    label: "רווחיות גולמית",
    fmt: (n) => `${n.toFixed(1)}%`,
    range: [28, 38],
    good: 28,
    warn: 28,
    description: "שיעור רווחיות גולמית בקטגוריה.",
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
