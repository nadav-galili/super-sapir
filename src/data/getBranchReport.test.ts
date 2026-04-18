// Boundary test for getBranchReport — asserts the curated Hadera report
// is returned verbatim, synthetic ids inflate to a structurally-valid
// BranchFullReport, and that calling twice with the same id produces the
// same numeric values (determinism).
import { describe, it, expect } from "vitest";
import {
  getBranchReport,
  inflateBranchReport,
  HADERA_BRANCH_ID,
} from "./getBranchReport";
import { haderaFullReport } from "./hadera-real";
import { allBranches } from "./mock-branches";

describe("getBranchReport", () => {
  it("returns the curated Hadera report verbatim", () => {
    const report = getBranchReport(HADERA_BRANCH_ID);
    expect(report).toBe(haderaFullReport);
  });

  it("returns null for an unknown branch id", () => {
    expect(getBranchReport("nonexistent-branch-id")).toBeNull();
  });

  it("returns a structurally-valid BranchFullReport for synthetic branches", () => {
    const synthetic = allBranches.find((b) => b.id !== HADERA_BRANCH_ID)!;
    const report = getBranchReport(synthetic.id)!;

    expect(report).not.toBeNull();
    // Check every top-level key of BranchFullReport is present.
    expect(report.info).toBeDefined();
    expect(report.sales).toBeDefined();
    expect(report.targets).toBeDefined();
    expect(report.operations).toBeDefined();
    expect(report.compliance).toBeDefined();
    expect(report.hr).toBeDefined();
    expect(Array.isArray(report.departments)).toBe(true);
    expect(Array.isArray(report.monthly)).toBe(true);
    expect(Array.isArray(report.expenses)).toBe(true);

    // Sanity on nested shapes.
    expect(report.info.name).toBe(synthetic.name);
    expect(report.info.branchNumber).toBe(synthetic.branchNumber);
    expect(typeof report.info.manager).toBe("string");
    expect(report.info.manager.length).toBeGreaterThan(0);
    expect(["A", "B", "C"]).toContain(report.info.grade);
    expect(report.departments.length).toBe(synthetic.departments.length);
    expect(report.monthly.length).toBe(synthetic.monthlyTrends.length);
  });

  it("is deterministic — same id produces the same report twice", () => {
    const synthetic = allBranches.find((b) => b.id !== HADERA_BRANCH_ID)!;
    const a = getBranchReport(synthetic.id)!;
    const b = getBranchReport(synthetic.id)!;
    // Structural equality. This catches any Math.random() leak.
    expect(a).toEqual(b);
    // Spot-check a few specific numeric values.
    expect(a.sales.network.ranking).toBe(b.sales.network.ranking);
    expect(a.compliance.highInventory.actual).toBe(
      b.compliance.highInventory.actual
    );
    expect(a.info.sellingArea).toBe(b.info.sellingArea);
  });

  it("inflateBranchReport is pure — same Branch produces identical output", () => {
    const branch = allBranches[1]; // first synthetic branch
    const a = inflateBranchReport(branch);
    const b = inflateBranchReport(branch);
    expect(a).toEqual(b);
  });

  it("different branch ids produce different reports", () => {
    const [, first, second] = allBranches;
    const a = getBranchReport(first.id)!;
    const b = getBranchReport(second.id)!;
    // Core identity fields should differ.
    expect(a.info.branchNumber).not.toBe(b.info.branchNumber);
    // Numeric fields driven by seeded RNG should almost-certainly differ.
    expect(
      a.info.sellingArea !== b.info.sellingArea ||
        a.sales.network.ranking !== b.sales.network.ranking
    ).toBe(true);
  });
});
