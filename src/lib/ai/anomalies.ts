// Shared anomaly detection. The only place in the codebase where AI
// surfaces (store / category / chain) compute their "here's what looks
// wrong" lists. Each detector returns the shape the relevant builder
// embeds into its prompt payload.
//
// - Store surface: `AnomalyResult[]` (typed — also consumed by the UI
//   to render dots on department bars).
// - Category + chain surfaces: `string[]` in Hebrew (only the prompt
//   consumes them, so they stay as pre-formatted strings).

import type { DepartmentSales } from "@/data/hadera-real";
import { formatCurrencyShort } from "@/lib/format";

/** Shape consumed by the store UI (e.g. DepartmentBreakdown dots). */
export interface AnomalyResult {
  departmentId: string;
  departmentName: string;
  deviation: number;
  severity: "warning" | "critical";
  tooltipText: string;
}

// ─── Store — department YoY deviation vs. store average ─────────

export function detectDepartmentAnomalies(
  departments: DepartmentSales[],
  storeYoyChange: number
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];

  for (const dept of departments) {
    const deviation = dept.yoyChangePercent - storeYoyChange;
    const absDeviation = Math.abs(deviation);

    if (absDeviation < 10) continue;

    const severity: AnomalyResult["severity"] =
      absDeviation >= 15 ? "critical" : "warning";
    const direction = deviation > 0 ? "עלייה" : "ירידה";
    const tooltipText = `${dept.name}: ${direction} חריגה של ${absDeviation.toFixed(1)} נקודות מממוצע הסניף (${storeYoyChange}%)`;

    anomalies.push({
      departmentId: dept.id,
      departmentName: dept.name,
      deviation,
      severity,
      tooltipText,
    });
  }

  return anomalies.sort(
    (a, b) => Math.abs(b.deviation) - Math.abs(a.deviation)
  );
}

// ─── Category surface — supplier + branch-level anomalies ───────

export interface CategoryAnomalyInput {
  totalSales: number;
  totalTarget: number;
  suppliers: Array<{
    name: string;
    sales: number;
    targetSales: number;
    stockoutRate: number;
    grossProfitPercent: number;
  }>;
  branches: Array<{
    name: string;
    yoy: number;
    stockout: number;
  }>;
}

export function detectCategoryAnomalies(input: CategoryAnomalyInput): string[] {
  const anomalies: string[] = [];
  const targetPct =
    input.totalTarget > 0 ? (input.totalSales / input.totalTarget) * 100 : 100;
  if (targetPct < 95) {
    anomalies.push(
      `הקטגוריה עומדת על ${targetPct.toFixed(1)}% מהיעד — פער של ${formatCurrencyShort(input.totalTarget - input.totalSales)}`
    );
  }
  for (const s of input.suppliers) {
    const sPct = s.targetSales > 0 ? (s.sales / s.targetSales) * 100 : 100;
    if (sPct < 90)
      anomalies.push(`ספק ${s.name} מפספס יעד (${sPct.toFixed(0)}% בלבד)`);
    if (s.stockoutRate > 4)
      anomalies.push(`ספק ${s.name} — שיעור חוסרים גבוה (${s.stockoutRate}%)`);
    if (s.grossProfitPercent < 18)
      anomalies.push(
        `ספק ${s.name} — רווח גולמי נמוך (${s.grossProfitPercent}%)`
      );
  }
  for (const b of input.branches) {
    if (b.yoy < -8)
      anomalies.push(
        `סניף ${b.name} — ירידה חדה של ${Math.abs(b.yoy).toFixed(1)}% שנתי`
      );
    if (b.stockout > 5)
      anomalies.push(`סניף ${b.name} — חוסרים קריטיים (${b.stockout}%)`);
  }
  return anomalies;
}

// ─── Chain surface — chain + category + supplier + promo anomalies ─

export interface ChainAnomalyInput {
  totalSales: number;
  totalTarget: number;
  categories: Array<{
    name: string;
    sales: number;
    targetSales: number;
    stockoutRate: number;
    grossMarginPercent: number;
  }>;
  suppliers: Array<{
    name: string;
    sales: number;
    targetSales: number;
    grossProfitPercent: number;
  }>;
  promotions: Array<{ name: string; roi: number }>;
}

export function detectChainAnomalies(input: ChainAnomalyInput): string[] {
  const anomalies: string[] = [];
  const targetPct =
    input.totalTarget > 0 ? (input.totalSales / input.totalTarget) * 100 : 100;
  if (targetPct < 98) {
    anomalies.push(
      `הרשת עומדת על ${targetPct.toFixed(1)}% מהיעד — פער של ${formatCurrencyShort(input.totalTarget - input.totalSales)}`
    );
  }
  for (const c of input.categories) {
    const cPct = c.targetSales > 0 ? (c.sales / c.targetSales) * 100 : 100;
    if (cPct < 90)
      anomalies.push(`קטגוריית ${c.name} מתחת ליעד (${cPct.toFixed(0)}% בלבד)`);
    if (c.stockoutRate > 4)
      anomalies.push(`קטגוריית ${c.name} — חוסרים גבוהים (${c.stockoutRate}%)`);
    if (c.grossMarginPercent < 18)
      anomalies.push(
        `קטגוריית ${c.name} — רווח גולמי נמוך (${c.grossMarginPercent}%)`
      );
  }
  for (const s of input.suppliers) {
    const sPct = s.targetSales > 0 ? (s.sales / s.targetSales) * 100 : 100;
    if (sPct < 88)
      anomalies.push(`ספק ${s.name} מתחת ליעד (${sPct.toFixed(0)}%)`);
    if (s.grossProfitPercent < 20)
      anomalies.push(
        `ספק ${s.name} — רווח גולמי נמוך (${s.grossProfitPercent}%)`
      );
  }
  for (const p of input.promotions) {
    if (p.roi < 1.5)
      anomalies.push(`מבצע "${p.name}" — ROI נמוך (${p.roi.toFixed(1)})`);
  }
  return anomalies;
}
