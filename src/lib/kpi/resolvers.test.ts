// Per-domain threshold tests. Boundaries (≥ vs >) are the main thing
// we want to lock down — the logic is simple, but the cutoff points
// are the product decision worth pinning.

import { describe, expect, it } from "vitest";
import { KPI_STATUS, PALETTE } from "@/lib/colors";
import {
  getBasketColor,
  getCostColor,
  getCostDeltaColor,
  getGrowthColor,
  getMarginColor,
  getMonthlySalesColor,
  getProgressColor,
  getPromotionColor,
  getQualityColor,
  getSalesColor,
  getStatusColor,
  getSupplyColor,
  getUpliftColor,
} from "./resolvers";

describe("getSalesColor", () => {
  it("returns good at ratio ≥ 0.95", () => {
    expect(getSalesColor({ actual: 95, target: 100 })).toBe(KPI_STATUS.good);
    expect(getSalesColor({ actual: 100, target: 100 })).toBe(KPI_STATUS.good);
    expect(getSalesColor({ actual: 120, target: 100 })).toBe(KPI_STATUS.good);
  });

  it("returns warning at 0.85 ≤ ratio < 0.95", () => {
    expect(getSalesColor({ actual: 85, target: 100 })).toBe(KPI_STATUS.warning);
    expect(getSalesColor({ actual: 94, target: 100 })).toBe(KPI_STATUS.warning);
  });

  it("returns bad below 0.85", () => {
    expect(getSalesColor({ actual: 84, target: 100 })).toBe(KPI_STATUS.bad);
    expect(getSalesColor({ actual: 0, target: 100 })).toBe(KPI_STATUS.bad);
  });

  it("returns muted when target is zero", () => {
    expect(getSalesColor({ actual: 100, target: 0 })).toBe(PALETTE.muted);
    expect(getSalesColor({ actual: 0, target: 0 })).toBe(PALETTE.muted);
  });
});

describe("getCostColor", () => {
  it("returns good at ratio ≤ 1.05", () => {
    expect(getCostColor({ actual: 80, target: 100 })).toBe(KPI_STATUS.good);
    expect(getCostColor({ actual: 100, target: 100 })).toBe(KPI_STATUS.good);
    expect(getCostColor({ actual: 105, target: 100 })).toBe(KPI_STATUS.good);
  });

  it("returns warning when 1.05 < ratio ≤ 1.15", () => {
    expect(getCostColor({ actual: 106, target: 100 })).toBe(KPI_STATUS.warning);
    expect(getCostColor({ actual: 115, target: 100 })).toBe(KPI_STATUS.warning);
  });

  it("returns bad above 1.15", () => {
    expect(getCostColor({ actual: 116, target: 100 })).toBe(KPI_STATUS.bad);
    expect(getCostColor({ actual: 200, target: 100 })).toBe(KPI_STATUS.bad);
  });

  it("returns muted when target is zero", () => {
    expect(getCostColor({ actual: 50, target: 0 })).toBe(PALETTE.muted);
  });
});

describe("getQualityColor", () => {
  it("defaults maxScore to 100", () => {
    expect(getQualityColor({ score: 95 })).toBe(KPI_STATUS.good);
    expect(getQualityColor({ score: 85 })).toBe(KPI_STATUS.warning);
    expect(getQualityColor({ score: 50 })).toBe(KPI_STATUS.bad);
  });

  it("honours custom maxScore", () => {
    expect(getQualityColor({ score: 9.5, maxScore: 10 })).toBe(KPI_STATUS.good);
    expect(getQualityColor({ score: 8.5, maxScore: 10 })).toBe(
      KPI_STATUS.warning
    );
  });
});

describe("getMarginColor", () => {
  it("returns good at ≥25%", () => {
    expect(getMarginColor({ marginPercent: 25 })).toBe(KPI_STATUS.good);
    expect(getMarginColor({ marginPercent: 40 })).toBe(KPI_STATUS.good);
  });

  it("returns warning at 20–24.99%", () => {
    expect(getMarginColor({ marginPercent: 20 })).toBe(KPI_STATUS.warning);
    expect(getMarginColor({ marginPercent: 24.99 })).toBe(KPI_STATUS.warning);
  });

  it("returns bad below 20%", () => {
    expect(getMarginColor({ marginPercent: 19.99 })).toBe(KPI_STATUS.bad);
    expect(getMarginColor({ marginPercent: 0 })).toBe(KPI_STATUS.bad);
  });
});

describe("getSupplyColor", () => {
  it("returns good at ≥95", () => {
    expect(getSupplyColor({ ratePercent: 95 })).toBe(KPI_STATUS.good);
    expect(getSupplyColor({ ratePercent: 100 })).toBe(KPI_STATUS.good);
  });

  it("returns warning at 85–94.99", () => {
    expect(getSupplyColor({ ratePercent: 85 })).toBe(KPI_STATUS.warning);
    expect(getSupplyColor({ ratePercent: 94 })).toBe(KPI_STATUS.warning);
  });

  it("returns bad below 85", () => {
    expect(getSupplyColor({ ratePercent: 50 })).toBe(KPI_STATUS.bad);
  });
});

describe("getPromotionColor", () => {
  it("returns good at roi ≥ 15", () => {
    expect(getPromotionColor({ roiPercent: 15 })).toBe(KPI_STATUS.good);
    expect(getPromotionColor({ roiPercent: 100 })).toBe(KPI_STATUS.good);
  });

  it("returns warning at 0 ≤ roi < 15", () => {
    expect(getPromotionColor({ roiPercent: 0 })).toBe(KPI_STATUS.warning);
    expect(getPromotionColor({ roiPercent: 14.99 })).toBe(KPI_STATUS.warning);
  });

  it("returns bad when roi < 0", () => {
    expect(getPromotionColor({ roiPercent: -1 })).toBe(KPI_STATUS.bad);
  });
});

describe("getUpliftColor", () => {
  it("returns good at ≥15", () => {
    expect(getUpliftColor({ upliftPercent: 15 })).toBe(KPI_STATUS.good);
  });

  it("returns warning at 5–14.99", () => {
    expect(getUpliftColor({ upliftPercent: 5 })).toBe(KPI_STATUS.warning);
    expect(getUpliftColor({ upliftPercent: 14 })).toBe(KPI_STATUS.warning);
  });

  it("returns bad below 5", () => {
    expect(getUpliftColor({ upliftPercent: 4.99 })).toBe(KPI_STATUS.bad);
    expect(getUpliftColor({ upliftPercent: -1 })).toBe(KPI_STATUS.bad);
  });
});

describe("getProgressColor", () => {
  it("returns good at ≥95", () => {
    expect(getProgressColor({ percent: 95 })).toBe(KPI_STATUS.good);
    expect(getProgressColor({ percent: 100 })).toBe(KPI_STATUS.good);
  });

  it("returns warning at 85–94", () => {
    expect(getProgressColor({ percent: 85 })).toBe(KPI_STATUS.warning);
  });

  it("returns bad below 85", () => {
    expect(getProgressColor({ percent: 0 })).toBe(KPI_STATUS.bad);
  });
});

describe("getGrowthColor", () => {
  it("returns good at delta ≥ +2", () => {
    expect(getGrowthColor({ changePercent: 2 })).toBe(KPI_STATUS.good);
    expect(getGrowthColor({ changePercent: 50 })).toBe(KPI_STATUS.good);
  });

  it("returns bad at delta ≤ -2", () => {
    expect(getGrowthColor({ changePercent: -2 })).toBe(KPI_STATUS.bad);
    expect(getGrowthColor({ changePercent: -50 })).toBe(KPI_STATUS.bad);
  });

  it("returns warning inside the ±2 dead band", () => {
    expect(getGrowthColor({ changePercent: 0 })).toBe(KPI_STATUS.warning);
    expect(getGrowthColor({ changePercent: 1.99 })).toBe(KPI_STATUS.warning);
    expect(getGrowthColor({ changePercent: -1.99 })).toBe(KPI_STATUS.warning);
  });
});

describe("getBasketColor", () => {
  it("mirrors growth thresholds", () => {
    expect(getBasketColor({ changePercent: 2 })).toBe(KPI_STATUS.good);
    expect(getBasketColor({ changePercent: 0 })).toBe(KPI_STATUS.warning);
    expect(getBasketColor({ changePercent: -2 })).toBe(KPI_STATUS.bad);
  });
});

describe("getCostDeltaColor", () => {
  it("returns good at delta ≤ -2 (cost went down)", () => {
    expect(getCostDeltaColor({ changePercent: -2 })).toBe(KPI_STATUS.good);
    expect(getCostDeltaColor({ changePercent: -10 })).toBe(KPI_STATUS.good);
  });

  it("returns bad at delta ≥ +2 (cost went up)", () => {
    expect(getCostDeltaColor({ changePercent: 2 })).toBe(KPI_STATUS.bad);
    expect(getCostDeltaColor({ changePercent: 10 })).toBe(KPI_STATUS.bad);
  });

  it("returns warning inside the ±2 dead band", () => {
    expect(getCostDeltaColor({ changePercent: 0 })).toBe(KPI_STATUS.warning);
    expect(getCostDeltaColor({ changePercent: 1 })).toBe(KPI_STATUS.warning);
    expect(getCostDeltaColor({ changePercent: -1 })).toBe(KPI_STATUS.warning);
  });
});

describe("getMonthlySalesColor", () => {
  it("returns bad below 99% of target", () => {
    expect(getMonthlySalesColor({ actual: 98.99, target: 100 })).toBe(
      KPI_STATUS.bad
    );
    expect(getMonthlySalesColor({ actual: 50, target: 100 })).toBe(
      KPI_STATUS.bad
    );
  });

  it("returns warning between 99% and 101% inclusive", () => {
    expect(getMonthlySalesColor({ actual: 99, target: 100 })).toBe(
      KPI_STATUS.warning
    );
    expect(getMonthlySalesColor({ actual: 100, target: 100 })).toBe(
      KPI_STATUS.warning
    );
    expect(getMonthlySalesColor({ actual: 101, target: 100 })).toBe(
      KPI_STATUS.warning
    );
  });

  it("returns good above 101% of target", () => {
    expect(getMonthlySalesColor({ actual: 101.01, target: 100 })).toBe(
      KPI_STATUS.good
    );
    expect(getMonthlySalesColor({ actual: 200, target: 100 })).toBe(
      KPI_STATUS.good
    );
  });

  it("returns muted when target is zero", () => {
    expect(getMonthlySalesColor({ actual: 100, target: 0 })).toBe(
      PALETTE.muted
    );
  });
});

describe("getStatusColor", () => {
  it("maps green to good", () => {
    expect(getStatusColor({ status: "green" })).toBe(KPI_STATUS.good);
  });
  it("maps yellow to warning", () => {
    expect(getStatusColor({ status: "yellow" })).toBe(KPI_STATUS.warning);
  });
  it("maps red to bad", () => {
    expect(getStatusColor({ status: "red" })).toBe(KPI_STATUS.bad);
  });
});
