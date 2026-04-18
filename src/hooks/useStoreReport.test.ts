// Boundary test for useStoreReport — since the hook is pure-compose
// over `getBranchReport` + `detectDepartmentAnomalies` we don't need a
// React renderer; we just exercise the same wiring the hook uses.
import { describe, it, expect } from "vitest";
import { getBranchReportOrFallback } from "@/data/getBranchReport";
import { detectDepartmentAnomalies } from "@/lib/ai/anomalies";
import { allBranches } from "@/data/mock-branches";
import { HADERA_BRANCH_ID } from "@/data/getBranchReport";

// Re-implement the hook's memo chain in pure JS so we can test the
// same wiring without mounting a component. This is exactly what
// `useStoreReport(branchId)` returns after its two useMemo calls.
function resolveStoreReport(branchId: string) {
  const report = getBranchReportOrFallback(branchId);
  const anomalies = detectDepartmentAnomalies(
    report.departments,
    report.sales.total.yoyChange
  );
  return { report, anomalies };
}

describe("useStoreReport (pure wiring)", () => {
  it("returns a report and anomalies array for the Hadera branch", () => {
    const { report, anomalies } = resolveStoreReport(HADERA_BRANCH_ID);
    expect(report).toBeDefined();
    expect(report.info.branchNumber).toBe(44);
    expect(Array.isArray(anomalies)).toBe(true);
  });

  it("anomalies reference only known department ids", () => {
    const { report, anomalies } = resolveStoreReport(HADERA_BRANCH_ID);
    const deptIds = new Set(report.departments.map((d) => d.id));
    for (const a of anomalies) {
      expect(deptIds.has(a.departmentId)).toBe(true);
    }
  });

  it("falls back to a non-null report for synthetic branches", () => {
    const synthetic = allBranches.find((b) => b.id !== HADERA_BRANCH_ID)!;
    const { report, anomalies } = resolveStoreReport(synthetic.id);
    expect(report.info.name).toBe(synthetic.name);
    expect(Array.isArray(anomalies)).toBe(true);
  });

  it("falls back to Hadera-equivalent for an unknown branch id", () => {
    const { report } = resolveStoreReport("nonexistent-id");
    // Fallback returns the first branch's inflated report — just
    // assert that *something* valid came back.
    expect(report).toBeDefined();
    expect(typeof report.info.name).toBe("string");
  });
});
