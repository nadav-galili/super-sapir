// Parametric template test for generateBranch — asserts determinism,
// snapshot-stability across the 11 existing mock branches, and that
// identity fields flow through from the template.
import { describe, it, expect } from "vitest";
import { generateBranch, type GenerateBranchTemplate } from "./generators";
import { HADERA_BRANCH_SEED } from "./hadera-seed";
import { MOCK_BRANCH_DEFS } from "./mock-branches";

describe("generateBranch (parametric template)", () => {
  it("is deterministic — same template produces identical output", () => {
    const template: GenerateBranchTemplate = {
      id: "test-01",
      name: "בדיקה",
      branchNumber: 99,
      regionId: "north",
      lat: 32.0,
      lng: 34.0,
      seed: 99_001,
    };
    const a = generateBranch(template);
    const b = generateBranch(template);
    expect(a).toEqual(b);
  });

  it("identity fields flow through unchanged from the template", () => {
    const branch = generateBranch({
      id: "test-02",
      name: "בדיקת שם",
      branchNumber: 77,
      regionId: "center",
      lat: 31.5,
      lng: 34.8,
      seed: 77_001,
      scale: 1.2,
      format: "big",
    });
    expect(branch.id).toBe("test-02");
    expect(branch.name).toBe("בדיקת שם");
    expect(branch.branchNumber).toBe(77);
    expect(branch.regionId).toBe("center");
    expect(branch.lat).toBe(31.5);
    expect(branch.lng).toBe(34.8);
    expect(branch.format).toBe("big");
  });

  it("defaults baseSeed to HADERA_BRANCH_SEED", () => {
    const branch = generateBranch({
      id: "test-03",
      name: "בדיקה",
      branchNumber: 55,
      regionId: "south",
      lat: 31.0,
      lng: 34.8,
      seed: 55_001,
    });
    // Departments should mirror HADERA_BRANCH_SEED.departments order.
    expect(branch.departments.length).toBe(
      HADERA_BRANCH_SEED.departments.length
    );
    expect(branch.departments.map((d) => d.id)).toEqual(
      HADERA_BRANCH_SEED.departments.map((d) => d.id)
    );
    expect(branch.monthlyTrends.length).toBe(12);
  });

  it("different seeds produce different metrics (seeded RNG does vary output)", () => {
    const base = {
      id: "x",
      name: "x",
      branchNumber: 1,
      regionId: "north",
      lat: 32,
      lng: 34,
    };
    const a = generateBranch({ ...base, seed: 1_001 });
    const b = generateBranch({ ...base, seed: 9_999 });
    // Pick a numeric field that depends on the seed; it should differ.
    expect(a.metrics.totalSales).not.toBe(b.metrics.totalSales);
  });

  it("produces snapshot-stable output for the 11 existing mock branches", () => {
    // Stability here means: calling generateBranch twice on each def yields
    // the same Branch. This guards against any Math.random() regression.
    for (const def of MOCK_BRANCH_DEFS) {
      const a = generateBranch(def);
      const b = generateBranch(def);
      expect(a).toEqual(b);
    }
  });

  it("honors scale — higher scale yields higher total sales (roughly)", () => {
    const base = {
      id: "scale",
      name: "scale",
      branchNumber: 50,
      regionId: "north",
      lat: 32,
      lng: 34,
      seed: 50_001,
    };
    const small = generateBranch({ ...base, scale: 0.5 });
    const big = generateBranch({ ...base, scale: 2.0 });
    expect(big.metrics.totalSales).toBeGreaterThan(small.metrics.totalSales);
  });
});
