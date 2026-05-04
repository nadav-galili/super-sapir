// Promo Simulator — pure calculation module.
// All functions take the simulator state and return derived metrics.
// No React, no DOM, no hooks.
import type { Scenario, SimulatorState } from "./state";

export type PromoStatus = "worthIt" | "needsImprovement" | "notWorthIt";
export type PromoVerdict = "worthIt" | "borderline" | "notWorthIt";

export interface PromoMetrics {
  // Existing fields
  effectivePrice: number;
  unitMargin: number;
  promoUnits: number;
  baseRevenue: number;
  baseProfit: number;
  promoRevenue: number;
  promoProfit: number;
  investment: number;
  roi: number; // percent — netProfit / investment
  breakEvenUnits: number;
  stockCoverage: number; // percent
  status: PromoStatus;
  // Step 4 + 5 rebuild fields
  effectiveDiscount: number; // 0..1, adjusted by promo type (bogo, loyalty)
  extraUnits: number; // promoUnits - baseUnits
  cannibUnits: number;
  cannibLoss: number; // ₪ lost on cannibalized base sales
  netProfit: number; // incremental profit after marketing + cannibalization
  baseGrossMargin: number; // percent
  promoGrossMargin: number; // percent
  verdict: PromoVerdict;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Adjust the slider discount by promo type. BOGO ≈ 50% off the second unit,
 * loyalty / points-back ≈ 60% of the nominal discount actually realized.
 * Other promo types pass the slider value through unchanged.
 */
export function effectiveDiscountFor(
  promoType: string,
  discountPct: number
): number {
  const d = Math.max(0, Math.min(discountPct, 100)) / 100;
  if (promoType.includes("Multi-Pack") || promoType.includes("מארז"))
    return 0.5;
  if (promoType.includes("מועדון") || promoType.includes("נקודות"))
    return d * 0.6;
  return d;
}

function statusOf(
  unitMargin: number,
  promoProfit: number,
  baseProfit: number,
  stockCoverage: number
): PromoStatus {
  if (unitMargin <= 0) return "notWorthIt";
  if (stockCoverage < 80) return "notWorthIt";
  if (promoProfit >= baseProfit && stockCoverage >= 100) return "worthIt";
  return "needsImprovement";
}

function verdictOf(netProfit: number, promoGrossMargin: number): PromoVerdict {
  if (netProfit < 0 || promoGrossMargin < 0) return "notWorthIt";
  if (netProfit > 5000 && promoGrossMargin > 10) return "worthIt";
  return "borderline";
}

interface ScenarioOverride {
  upliftPct?: number;
  cannibPct?: number;
}

/**
 * Compute promo metrics for a given simulator state, optionally overriding
 * uplift / cannibalization (used by scenario comparison in Step 5).
 */
export function calcMetrics(
  state: SimulatorState,
  override?: ScenarioOverride
): PromoMetrics {
  const upliftPct =
    override?.upliftPct !== undefined ? override.upliftPct : state.upliftPct;
  const cannibPct =
    override?.cannibPct !== undefined ? override.cannibPct : state.cannibPct;

  const effectiveDiscount = effectiveDiscountFor(
    state.promoType,
    state.discountPct
  );
  const uplift = Math.max(0, upliftPct) / 100;
  const cannib = Math.max(0, Math.min(cannibPct, 100)) / 100;

  // Promo-period purchase cost. Defaults to regular unitCost; supplier may
  // grant a buy-in concession that drops it below.
  const promoCost =
    state.promoUnitCost > 0 ? state.promoUnitCost : state.unitCost;

  const effectivePrice = round2(state.unitPrice * (1 - effectiveDiscount));
  const unitMargin = round2(effectivePrice - promoCost);

  const promoUnits = Math.round(state.baseUnits * (1 + uplift));
  const extraUnits = promoUnits - state.baseUnits;
  const cannibUnits = Math.round(state.baseUnits * cannib);

  const baseRevenue = Math.round(state.baseUnits * state.unitPrice);
  const promoRevenue = Math.round(promoUnits * effectivePrice);

  const baseUnitProfit = state.unitPrice - state.unitCost;
  const baseProfit = Math.round(state.baseUnits * baseUnitProfit);
  const promoUnitProfit = unitMargin - state.opsCost;
  const promoProfit = Math.round(promoUnits * promoUnitProfit);
  const cannibLoss = Math.round(Math.max(baseUnitProfit, 0) * cannibUnits);

  const investment = Math.max(state.mktCost, 0);
  const netProfit = Math.round(
    promoProfit - baseProfit - investment - cannibLoss
  );
  const roi = investment > 0 ? Math.round((netProfit / investment) * 100) : 0;

  // True break-even: total promo units required for promo profit to equal
  // (or exceed) the profit we'd have made without the promo. This includes
  // the foregone full-price margin on base sales (baseProfit) plus the
  // marketing investment plus cannibalization loss — not just the marketing
  // investment in isolation. Solving netProfit ≥ 0 for promoUnits:
  //   promoUnits × promoUnitProfit ≥ baseProfit + mktCost + cannibLoss
  const beUnitProfit = effectivePrice - promoCost - state.opsCost;
  const breakEvenUnits =
    beUnitProfit > 0
      ? Math.ceil((baseProfit + investment + cannibLoss) / beUnitProfit)
      : Number.POSITIVE_INFINITY;

  const stockCoverage =
    promoUnits > 0 ? Math.round((state.stockUnits / promoUnits) * 100) : 0;

  const baseGrossMargin =
    state.unitPrice > 0
      ? round2(((state.unitPrice - state.unitCost) / state.unitPrice) * 100)
      : 0;
  const promoGrossMargin =
    effectivePrice > 0
      ? round2(((effectivePrice - promoCost) / effectivePrice) * 100)
      : 0;

  const status = statusOf(unitMargin, promoProfit, baseProfit, stockCoverage);
  const verdict = verdictOf(netProfit, promoGrossMargin);

  return {
    effectivePrice,
    unitMargin,
    promoUnits,
    baseRevenue,
    baseProfit,
    promoRevenue,
    promoProfit,
    investment,
    roi,
    breakEvenUnits,
    stockCoverage,
    status,
    effectiveDiscount,
    extraUnits,
    cannibUnits,
    cannibLoss,
    netProfit,
    baseGrossMargin,
    promoGrossMargin,
    verdict,
  };
}

const SCENARIO_FACTORS: Record<Scenario, { uplift: number; cannib: number }> = {
  pessimistic: { uplift: 0.4, cannib: 1.5 },
  base: { uplift: 1, cannib: 1 },
  optimistic: { uplift: 1.8, cannib: 0.4 },
};

/**
 * Run the full calc pipeline for a named scenario by scaling
 * `upliftPct` and `cannibPct` against the user-provided base.
 */
export function calcForScenario(
  state: SimulatorState,
  scenario: Scenario
): PromoMetrics {
  const f = SCENARIO_FACTORS[scenario];
  return calcMetrics(state, {
    upliftPct: state.upliftPct * f.uplift,
    cannibPct: state.cannibPct * f.cannib,
  });
}

export function statusLabel(status: PromoStatus): string {
  switch (status) {
    case "worthIt":
      return "כדאי";
    case "needsImprovement":
      return "דורש שיפור";
    case "notWorthIt":
      return "לא כדאי כרגע";
  }
}

export function verdictLabel(verdict: PromoVerdict): string {
  switch (verdict) {
    case "worthIt":
      return "מבצע כדאי";
    case "borderline":
      return "כדאיות גבולית";
    case "notWorthIt":
      return "מבצע לא כדאי";
  }
}
