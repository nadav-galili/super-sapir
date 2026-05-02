import { describe, it, expect } from "vitest";
import {
  getGroups,
  getDepartmentsByGroup,
  getCategoriesByDepartment,
  getSubCategoriesByCategory,
  findSubCategoryById,
  getManagerForGroup,
  GROUP_MANAGERS,
} from "./mock-promo-taxonomy";

describe("promo-taxonomy cascading lookups", () => {
  it("exposes exactly the five Groups from the spec", () => {
    const ids = getGroups().map((g) => g.id);
    expect(ids).toEqual(["grocery", "produce", "dairy", "non-food", "meat"]);
  });

  it("returns departments scoped to the chosen Group", () => {
    expect(getDepartmentsByGroup("grocery").map((d) => d.id)).toEqual([
      "drinks",
      "cleaning",
      "canned",
      "staples",
    ]);
    expect(getDepartmentsByGroup("dairy").map((d) => d.id)).toEqual([
      "white-cheese",
      "yellow-cheese",
      "milk",
      "butter-cream",
      "desserts",
    ]);
    expect(getDepartmentsByGroup("missing-group")).toEqual([]);
  });

  it("returns categories scoped to the chosen Department", () => {
    expect(
      getCategoriesByDepartment("grocery", "drinks").map((c) => c.id)
    ).toEqual([
      "hot-drinks",
      "cold-drinks",
      "energy-sport",
      "water",
      "alcohol",
    ]);
    expect(getCategoriesByDepartment("grocery", "missing-dept")).toEqual([]);
    expect(getCategoriesByDepartment("missing-group", "drinks")).toEqual([]);
  });

  it("returns sub-categories scoped to the chosen Category (the user's hot-drinks example)", () => {
    const subs = getSubCategoriesByCategory("grocery", "drinks", "hot-drinks");
    expect(subs.map((s) => s.nameHe)).toContain("תה");
    expect(subs.map((s) => s.nameHe)).toContain("קפה");
    expect(subs.map((s) => s.nameHe)).toContain("שוקו וקקאו");
  });

  it("findSubCategoryById walks all four levels back up to the Group", () => {
    const found = findSubCategoryById("tea");
    expect(found?.group.id).toBe("grocery");
    expect(found?.department.id).toBe("drinks");
    expect(found?.category.id).toBe("hot-drinks");
    expect(found?.subCategory.nameHe).toBe("תה");
    expect(findSubCategoryById("does-not-exist")).toBeUndefined();
  });

  it("has a Group Manager for every Group", () => {
    for (const group of getGroups()) {
      expect(getManagerForGroup(group.id)).not.toBe("");
    }
    expect(Object.keys(GROUP_MANAGERS)).toHaveLength(5);
    expect(getManagerForGroup("missing-group")).toBe("");
  });
});
