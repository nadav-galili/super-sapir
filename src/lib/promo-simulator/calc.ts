// Promo Simulator — pure calculation module.
// All functions take the simulator state and return derived metrics.
// No React, no DOM, no hooks.
import type { SimulatorState } from "./state";

export type PromoStatus = "worthIt" | "needsImprovement" | "notWorthIt";

export interface PromoMetrics {
  effectivePrice: number;
  unitMargin: number;
  promoUnits: number;
  baseRevenue: number;
  baseProfit: number;
  promoRevenue: number;
  promoProfit: number;
  investment: number;
  roi: number; // percent
  breakEvenUnits: number;
  stockCoverage: number; // percent
  status: PromoStatus;
}

/**
 * Simple investment estimate: fixed setup cost + per-unit operational overhead.
 * The simulator uses this as a plausible stand-in for marketing / production cost.
 */
function estimateInvestment(baseUnits: number, unitPrice: number): number {
  const fixed = 2500;
  const perUnit = Math.max(unitPrice * 0.05, 0.3);
  return Math.round(fixed + baseUnits * perUnit);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Status thresholds:
 *  - notWorthIt  → unit margin <= 0, OR stock coverage < 80%
 *  - worthIt     → promo profit >= base profit AND stock coverage >= 100%
 *  - needsImprovement → everything in between
 */
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

export function calcMetrics(state: SimulatorState): PromoMetrics {
  const discount = Math.max(0, Math.min(state.discountPct, 100)) / 100;
  const uplift = Math.max(0, state.upliftPct) / 100;
  const effectivePrice = round2(state.unitPrice * (1 - discount));
  const unitMargin = round2(effectivePrice - state.unitCost);
  const promoUnits = Math.round(state.baseUnits * (1 + uplift));
  const baseRevenue = Math.round(state.baseUnits * state.unitPrice);
  const baseProfit = Math.round(
    state.baseUnits * Math.max(state.unitPrice - state.unitCost, 0)
  );
  const promoRevenue = Math.round(promoUnits * effectivePrice);
  const promoProfit = Math.round(promoUnits * Math.max(unitMargin, 0));
  const investment = estimateInvestment(state.baseUnits, state.unitPrice);
  const roi =
    investment > 0
      ? Math.round(((promoProfit - baseProfit - investment) / investment) * 100)
      : 0;
  const breakEvenUnits =
    unitMargin > 0
      ? Math.ceil(investment / unitMargin)
      : Number.POSITIVE_INFINITY;
  const stockCoverage =
    promoUnits > 0 ? Math.round((state.stockUnits / promoUnits) * 100) : 0;
  const status = statusOf(unitMargin, promoProfit, baseProfit, stockCoverage);
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
  };
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
