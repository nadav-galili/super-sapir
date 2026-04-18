// Single data hook for the store-manager route. Wraps the data-layer
// boundary (`getBranchReport`) and runs anomaly detection once so each
// chart component can consume a pre-computed `anomalies` array without
// re-deriving it. Pure compose — no network, no side effects.
import { useMemo } from "react";
import { getBranchReportOrFallback } from "@/data/getBranchReport";
import { detectAnomalies, type AnomalyResult } from "@/lib/ai";
import type { BranchFullReport } from "@/data/hadera-real";

export interface StoreReport {
  report: BranchFullReport;
  anomalies: AnomalyResult[];
}

export function useStoreReport(branchId: string): StoreReport {
  const report = useMemo(() => getBranchReportOrFallback(branchId), [branchId]);
  const anomalies = useMemo(
    () => detectAnomalies(report.departments, report.sales.total.yoyChange),
    [report]
  );
  return { report, anomalies };
}
