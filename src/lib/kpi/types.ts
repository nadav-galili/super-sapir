// Domain-specific KPI input types. Each surface in the dashboard
// passes its values through the resolver that matches the KPI's
// meaning — the thresholds and direction ("higher is better" vs
// "lower is better") live inside the resolver rather than as flags
// at call sites. Adding a new KPI means adding a new type + resolver
// here, not piping another boolean through the generic helpers.

/** Sales / revenue / profit vs. target (higher-is-better). */
export interface SalesKPI {
  actual: number;
  target: number;
}

/** Expense / cost vs. target (lower-is-better). */
export interface CostKPI {
  actual: number;
  target: number;
}

/** Quality / inspection / audit score (higher-is-better).
 *  `maxScore` defaults to 100. */
export interface QualityKPI {
  score: number;
  maxScore?: number;
}

/** Gross-margin percentage (higher-is-better, fixed thresholds). */
export interface MarginKPI {
  marginPercent: number;
}

/** Supply / stock-coverage rate 0..100+ (higher-is-better). */
export interface SupplyKPI {
  ratePercent: number;
}

/** Average-basket period-over-period delta (higher-is-better, ±2pp dead band). */
export interface BasketKPI {
  changePercent: number;
}

/** Promotion ROI expressed as a percentage (higher-is-better). */
export interface PromotionKPI {
  roiPercent: number;
}

/** Generic YoY / period growth delta (higher-is-better, ±2pp dead band). */
export interface GrowthKPI {
  changePercent: number;
}

/** Expense / cost delta (lower-is-better, ±2pp dead band). */
export interface CostDeltaKPI {
  changePercent: number;
}

/** Progress toward completion as a percentage 0..100 (higher-is-better). */
export interface ProgressKPI {
  percent: number;
}

/** Promotion uplift percentage (custom thresholds: ≥15 good, ≥5 warning). */
export interface UpliftKPI {
  upliftPercent: number;
}

/** Pre-classified status (e.g. from a domain calculator that already
 *  returns a tri-state label). Pass-through to the KPI palette. */
export interface StatusKPI {
  status: "green" | "yellow" | "red";
}
