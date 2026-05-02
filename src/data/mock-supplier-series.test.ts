// Coverage test — every (supplier, subcategory) pair declared in
// `mock-subcategory-suppliers.ts` MUST yield a non-empty series list,
// either from the bespoke map or the Department-themed auto-generator.
import { describe, it, expect } from "vitest";
import { getSeriesForSupplierAndSubCategory } from "./mock-supplier-series";
import { getSuppliersForSubCategory } from "./mock-subcategory-suppliers";
import { PROMO_GROUPS } from "./mock-promo-taxonomy";

function allSubCategoryIds(): string[] {
  const ids: string[] = [];
  for (const group of PROMO_GROUPS) {
    for (const department of group.departments) {
      for (const category of department.categories) {
        for (const sub of category.subCategories) {
          ids.push(sub.id);
        }
      }
    }
  }
  return ids;
}

describe("supplier series — full coverage", () => {
  it("returns the bespoke series for the user's example (Wissotzky × tea)", () => {
    const out = getSeriesForSupplierAndSubCategory("sup-22", "tea");
    expect(out).toContain("תה ירוק");
    expect(out).toContain("תה שחור קלאסי");
    // Wissotzky × herbal-infusions is a separate bespoke entry.
    const herbal = getSeriesForSupplierAndSubCategory(
      "sup-22",
      "herbal-infusions"
    );
    expect(herbal).toContain("חליטות צמחים");
  });

  it("returns auto-generated Department-themed series for the user's tuna example", () => {
    // שסטוביץ × tuna was the gap that prompted this fix — must now produce
    // a populated dropdown using the Department template for `canned`.
    const out = getSeriesForSupplierAndSubCategory("sup-08", "tuna");
    expect(out.length).toBe(3);
    expect(out[0]).toBe("שסטוביץ טונה קלאסי");
    expect(out[1]).toBe("שסטוביץ טונה במים");
    expect(out[2]).toBe("שסטוביץ טונה בשמן זית");
  });

  it("yields a non-empty series list for EVERY (supplier × subcategory) declared in the supplier mapping", () => {
    const failures: string[] = [];
    for (const subId of allSubCategoryIds()) {
      const supplierIds = getSuppliersForSubCategory(subId);
      for (const supplierId of supplierIds) {
        const series = getSeriesForSupplierAndSubCategory(supplierId, subId);
        if (series.length === 0) {
          failures.push(`${supplierId} × ${subId}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("returns empty for unknown supplier or unknown sub-category (defensive)", () => {
    expect(getSeriesForSupplierAndSubCategory("sup-9999", "tea")).toEqual([]);
    expect(getSeriesForSupplierAndSubCategory("sup-22", "no-such-sub")).toEqual(
      []
    );
  });
});
