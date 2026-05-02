// Slice #2 from the spec — Manager auto-populate.
//
// The Step 1 brief auto-populates `categoryManager` from `GROUP_MANAGERS`
// when the user picks a Group, and clears it when the Group is cleared.
// The legacy `category` field is also mirrored to the Group's Hebrew name
// so downstream PromoSummary / narrative / PDF export keep rendering.
//
// This test exercises the same lookup the Step1Brief useEffect uses,
// without rendering the component, so we lock the data contract.
import { describe, it, expect } from "vitest";
import {
  GROUP_MANAGERS,
  PROMO_GROUPS,
  getManagerForGroup,
} from "@/data/mock-promo-taxonomy";

describe("manager auto-populate (slice #2)", () => {
  it("returns the matching manager for each Group", () => {
    expect(getManagerForGroup("grocery")).toBe("דני אברמוביץ'");
    expect(getManagerForGroup("produce")).toBe("שירה כהן");
    expect(getManagerForGroup("dairy")).toBe("יונתן לוי");
    expect(getManagerForGroup("non-food")).toBe("מאיה בן-דוד");
    expect(getManagerForGroup("meat")).toBe("אלי מזרחי");
  });

  it("returns empty string for unknown / cleared Group (matches Step1Brief clear behavior)", () => {
    expect(getManagerForGroup("")).toBe("");
    expect(getManagerForGroup("does-not-exist")).toBe("");
  });

  it("PROMO_GROUPS and GROUP_MANAGERS keys stay in sync", () => {
    const groupIds = PROMO_GROUPS.map((g) => g.id).sort();
    const managerKeys = Object.keys(GROUP_MANAGERS).sort();
    expect(groupIds).toEqual(managerKeys);
  });

  it("each Group has a non-empty Hebrew display name (used as the legacy `category` mirror)", () => {
    for (const group of PROMO_GROUPS) {
      expect(group.nameHe.length).toBeGreaterThan(0);
    }
  });
});
