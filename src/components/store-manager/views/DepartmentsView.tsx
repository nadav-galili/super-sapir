// Departments view: best/worst KPIs, movers card, and the full
// breakdown chart (with pre-computed anomalies from `useStoreReport`).
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import type { BranchFullReport } from "@/data/hadera-real";
import type { AnomalyResult } from "@/lib/ai";
import type { KPICardData } from "@/data/types";
import { DepartmentBreakdown } from "@/components/store-manager/charts/DepartmentBreakdown";
import { DepartmentMoversCard } from "@/components/store-manager/charts/DepartmentMoversCard";

export interface DepartmentsViewProps {
  report: BranchFullReport;
  anomalies: AnomalyResult[];
}

export function DepartmentsView({ report, anomalies }: DepartmentsViewProps) {
  const bestDept = report.departments.reduce((a, b) =>
    a.yoyChangePercent > b.yoyChangePercent ? a : b
  );
  const worstDept = report.departments.reduce((a, b) =>
    a.yoyChangePercent < b.yoyChangePercent ? a : b
  );
  const kpis: KPICardData[] = [
    {
      label: "מחלקות פעילות",
      value: report.departments.length,
      format: "number",
      trend: 0,
      trendLabel: "",
    },
    {
      label: `מוביל: ${bestDept.name}`,
      value: Math.round(bestDept.yoyChangePercent),
      format: "number",
      trend: bestDept.yoyChangePercent,
      trendLabel: "צמיחה",
    },
    {
      label: `נחלש: ${worstDept.name}`,
      value: Math.abs(Math.round(worstDept.yoyChangePercent)),
      format: "number",
      trend: worstDept.yoyChangePercent,
      trendLabel: "ירידה",
    },
  ];

  return (
    <>
      <KPIGrid items={kpis} columns={3} />
      <DepartmentMoversCard departments={report.departments} />
      <DepartmentBreakdown
        departments={report.departments}
        anomalies={anomalies}
      />
    </>
  );
}
