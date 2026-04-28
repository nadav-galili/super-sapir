// Per-month sales-target derivation. The PDF report only publishes an
// annual sales target — but the store-overview monthly bar chart needs
// to show whether each individual month hit its slice of the goal.
//
// Approach: scale last year's per-month sales by the annual growth
// multiplier (`annualTarget / annualLastYear`). This preserves the
// natural seasonal shape (December larger than February) and the
// per-month targets sum to the annual target by construction.
//
// Pure module — no React, no chart library imports. Reusable wherever
// per-month vs-target needs to be derived.
import type { MonthlyDetail } from "@/data/hadera-real";

export type MonthlyTargetStatus = "red" | "yellow" | "green";

export interface MonthlyTargetRow extends MonthlyDetail {
  /** Derived per-month sales target (₪). 0 when inputs are degenerate. */
  target: number;
  /** Actual / target × 100. 0 when target is 0. */
  vsTargetPercent: number;
  /** Three-band traffic light: <99 red, 99–101 yellow, >101 green. */
  status: MonthlyTargetStatus;
}

/**
 * Annotate each month with its derived target, vs-target ratio, and
 * traffic-light status.
 *
 * @param months           the per-month detail rows from the report
 * @param annualTarget     annual sales target across all months
 * @param annualLastYear   sum of last year's monthly sales (the seasonal base)
 */
export function deriveMonthlyTargets(
  months: MonthlyDetail[],
  annualTarget: number,
  annualLastYear: number
): MonthlyTargetRow[] {
  // Degenerate inputs: no growth multiplier we can trust → emit neutral
  // rows so the chart can render without colored signal.
  if (annualLastYear <= 0 || annualTarget <= 0) {
    return months.map((m) => ({
      ...m,
      target: 0,
      vsTargetPercent: 0,
      status: "yellow" as const,
    }));
  }

  const growthMultiplier = annualTarget / annualLastYear;

  return months.map((m) => {
    const target = m.lastYearSales * growthMultiplier;
    const vsTargetPercent = target > 0 ? (m.currentSales / target) * 100 : 0;
    return {
      ...m,
      target,
      vsTargetPercent,
      status: classify(vsTargetPercent),
    };
  });
}

function classify(vsTargetPercent: number): MonthlyTargetStatus {
  if (vsTargetPercent < 99) return "red";
  if (vsTargetPercent > 101) return "green";
  return "yellow";
}
