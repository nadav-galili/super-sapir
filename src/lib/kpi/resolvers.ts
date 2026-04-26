// One resolver per KPI domain. Each returns a color from the shared
// `KPI_STATUS` palette (or `PALETTE.muted` for undefined input like a
// zero target). Thresholds and direction live here — call sites just
// pick the resolver whose name matches what the KPI means.

import { KPI_STATUS, PALETTE } from "@/lib/colors";
import type {
  BasketKPI,
  CostDeltaKPI,
  CostKPI,
  GrowthKPI,
  MarginKPI,
  ProgressKPI,
  PromotionKPI,
  QualityKPI,
  SalesKPI,
  StatusKPI,
  SupplyKPI,
  UpliftKPI,
} from "./types";

// ─── Target-ratio resolvers ─────────────────────────────────────

/** Sales / revenue / profit vs. target. ≥95% good, ≥85% warning, else bad. */
export function getSalesColor({ actual, target }: SalesKPI): string {
  if (target === 0) return PALETTE.muted;
  const ratio = actual / target;
  if (ratio >= 0.95) return KPI_STATUS.good;
  if (ratio >= 0.85) return KPI_STATUS.warning;
  return KPI_STATUS.bad;
}

/** Cost / expense vs. target. ≤105% good, ≤115% warning, else bad. */
export function getCostColor({ actual, target }: CostKPI): string {
  if (target === 0) return PALETTE.muted;
  const ratio = actual / target;
  if (ratio <= 1.05) return KPI_STATUS.good;
  if (ratio <= 1.15) return KPI_STATUS.warning;
  return KPI_STATUS.bad;
}

/** Quality score / maxScore (default 100). Same thresholds as sales. */
export function getQualityColor({ score, maxScore = 100 }: QualityKPI): string {
  return getSalesColor({ actual: score, target: maxScore });
}

// ─── Fixed-threshold resolvers ──────────────────────────────────

/** Gross-margin %. ≥25 good, ≥20 warning, <20 bad. */
export function getMarginColor({ marginPercent }: MarginKPI): string {
  if (marginPercent >= 25) return KPI_STATUS.good;
  if (marginPercent >= 20) return KPI_STATUS.warning;
  return KPI_STATUS.bad;
}

/** Supply / stock-coverage rate. ≥95% good, ≥85% warning, <85 bad. */
export function getSupplyColor({ ratePercent }: SupplyKPI): string {
  if (ratePercent >= 95) return KPI_STATUS.good;
  if (ratePercent >= 85) return KPI_STATUS.warning;
  return KPI_STATUS.bad;
}

/** Promotion ROI %. ≥15 good, ≥0 warning, <0 bad. */
export function getPromotionColor({ roiPercent }: PromotionKPI): string {
  if (roiPercent >= 15) return KPI_STATUS.good;
  if (roiPercent >= 0) return KPI_STATUS.warning;
  return KPI_STATUS.bad;
}

/** Promotion uplift %. ≥15 good, ≥5 warning, <5 bad. */
export function getUpliftColor({ upliftPercent }: UpliftKPI): string {
  if (upliftPercent >= 15) return KPI_STATUS.good;
  if (upliftPercent >= 5) return KPI_STATUS.warning;
  return KPI_STATUS.bad;
}

/** Progress 0..100. ≥95 good, ≥85 warning, <85 bad. */
export function getProgressColor({ percent }: ProgressKPI): string {
  if (percent >= 95) return KPI_STATUS.good;
  if (percent >= 85) return KPI_STATUS.warning;
  return KPI_STATUS.bad;
}

// ─── Delta resolvers (dead-band around zero) ────────────────────

const GROWTH_DEAD_BAND = 2;

/** YoY / period growth delta (higher-is-better). ±2pp dead band. */
export function getGrowthColor({ changePercent }: GrowthKPI): string {
  if (changePercent >= GROWTH_DEAD_BAND) return KPI_STATUS.good;
  if (changePercent <= -GROWTH_DEAD_BAND) return KPI_STATUS.bad;
  return KPI_STATUS.warning;
}

/** Basket-size delta (higher-is-better). ±2pp dead band. */
export function getBasketColor({ changePercent }: BasketKPI): string {
  return getGrowthColor({ changePercent });
}

/** Cost / expense delta (lower-is-better). ±2pp dead band around zero. */
export function getCostDeltaColor({ changePercent }: CostDeltaKPI): string {
  if (changePercent <= -GROWTH_DEAD_BAND) return KPI_STATUS.good;
  if (changePercent >= GROWTH_DEAD_BAND) return KPI_STATUS.bad;
  return KPI_STATUS.warning;
}

// ─── Monthly-sales-vs-target traffic light ──────────────────────

/**
 * Per-month sales vs derived monthly target. Tighter band than the
 * generic {@link getSalesColor} because each month is a small slice of
 * the annual goal — being 5% off in a single month is far more
 * informative than the loose ±5% band tolerance for full-year metrics.
 *
 * `<99%` → bad, `99–101%` → warning, `>101%` → good.
 */
export function getMonthlySalesColor({ actual, target }: SalesKPI): string {
  if (target === 0) return PALETTE.muted;
  const ratio = (actual / target) * 100;
  if (ratio < 99) return KPI_STATUS.bad;
  if (ratio > 101) return KPI_STATUS.good;
  return KPI_STATUS.warning;
}

// ─── Hero-gauge ratio (uniform target-attainment band) ─────────

/**
 * Hero-gauge ratio resolver — used when the *visible percentage on the
 * gauge itself* (value/target × 100) is the signal, regardless of the
 * underlying KPI's domain. Bands are tuned to "did we hit our target?":
 *
 * `<95%` → bad (missed by more than 5 points),
 * `95–<100%` → warning (close but didn't quite hit),
 * `≥100%` → good (met or exceeded).
 *
 * Use this for hero-summary gauges where every meter is read the same
 * way. For domain-specific KPIs (margin %, supply %, growth delta) keep
 * using their dedicated resolvers above.
 */
export function getGaugeRatioColor({ actual, target }: SalesKPI): string {
  if (target === 0) return PALETTE.muted;
  const ratio = (actual / target) * 100;
  if (ratio < 95) return KPI_STATUS.bad;
  if (ratio < 100) return KPI_STATUS.warning;
  return KPI_STATUS.good;
}

// ─── Status pass-through ────────────────────────────────────────

/** Pre-classified tri-state status → KPI palette. */
export function getStatusColor({ status }: StatusKPI): string {
  if (status === "green") return KPI_STATUS.good;
  if (status === "yellow") return KPI_STATUS.warning;
  return KPI_STATUS.bad;
}
