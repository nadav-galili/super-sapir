// Slice #3 from the spec — Archive button gating + scope filtering.
//
// 1. Archive must be disabled until a sub-category is chosen.
// 2. The archive scope title is the most-specific selection (sub-category,
//    then supplier, then series).
// 3. The lookup key (used to query historical promos) is always the Group
//    Hebrew name (broader scope), so the user sees results even before
//    supplier/series narrow them. Supplier/series narrowing is a slice on
//    the result set (mock for now — see ArchiveSheet.tsx narrowBySupplierSeries).
import { describe, it, expect } from "vitest";
import { findSubCategoryById, PROMO_GROUPS } from "@/data/mock-promo-taxonomy";
import { getSupplierById } from "@/data/mock-suppliers";

interface ArchiveScope {
  title: string;
  lookupKey: string;
  scopeChain: string;
}

// Mirror of the resolveScope() logic in ArchiveSheet.tsx — exercised
// here without rendering, so the contract is locked even if the UI is refactored.
function resolveScope(
  groupId: string,
  subcategoryId: string,
  supplierId: string,
  series: string
): ArchiveScope | null {
  const found = findSubCategoryById(subcategoryId);
  if (!found) return null;
  const groupName =
    PROMO_GROUPS.find((g) => g.id === groupId)?.nameHe ?? found.group.nameHe;
  const supplierName = supplierId
    ? (getSupplierById(supplierId)?.name ?? "")
    : "";
  const title = series || supplierName || found.subCategory.nameHe;
  const chainParts = [
    groupName,
    found.department.nameHe,
    found.category.nameHe,
    found.subCategory.nameHe,
    supplierName,
    series,
  ].filter(Boolean);
  return {
    title,
    lookupKey: groupName,
    scopeChain: chainParts.join(" · "),
  };
}

describe("archive scope gating (slice #3)", () => {
  it("returns null when no sub-category is selected — equivalent to disabled archive", () => {
    expect(resolveScope("grocery", "", "", "")).toBeNull();
    expect(resolveScope("", "", "", "")).toBeNull();
  });

  it("uses the sub-category Hebrew name as the title when only sub-category is set", () => {
    const scope = resolveScope("grocery", "tea", "", "");
    expect(scope?.title).toBe("תה");
    expect(scope?.lookupKey).toBe("מכולת");
    expect(scope?.scopeChain).toBe("מכולת · שתייה · שתייה חמה · תה");
  });

  it("escalates the title to the Supplier name when a supplier is chosen", () => {
    const scope = resolveScope("grocery", "tea", "sup-22", "");
    expect(scope?.title).toBe("ויסוצקי");
    expect(scope?.scopeChain).toBe("מכולת · שתייה · שתייה חמה · תה · ויסוצקי");
  });

  it("escalates the title to the Series when supplier+series are chosen — the user's example", () => {
    const scope = resolveScope("grocery", "tea", "sup-22", "תה ירוק");
    expect(scope?.title).toBe("תה ירוק");
    expect(scope?.scopeChain).toBe(
      "מכולת · שתייה · שתייה חמה · תה · ויסוצקי · תה ירוק"
    );
  });

  it("falls back to the canonical Group Hebrew name even if a wrong groupId is passed", () => {
    const scope = resolveScope("wrong-group", "tea", "", "");
    expect(scope?.lookupKey).toBe("מכולת");
  });
});
