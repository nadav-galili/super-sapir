// Inventory view: inventory-day KPIs, per-department inventory chart,
// and compliance cards. Takes `report` so it stays a thin composition
// of chart components.
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import type { BranchFullReport } from "@/data/hadera-real";
import type { KPICardData } from "@/data/types";
import { ComplianceCards } from "@/components/store-manager/ComplianceCards";
import { InventoryByDepartmentChart } from "@/components/store-manager/charts/InventoryByDepartmentChart";

export interface InventoryViewProps {
  report: BranchFullReport;
}

export function InventoryView({ report }: InventoryViewProps) {
  const ops = report.operations;
  const kpis: KPICardData[] = [
    {
      label: "ימי מלאי ממוצע",
      value: ops.avgDaysOfInventory.current,
      format: "number",
      trend:
        ops.avgDaysOfInventory.current <= ops.avgDaysOfInventory.target
          ? 0
          : -Math.round(
              ((ops.avgDaysOfInventory.current -
                ops.avgDaysOfInventory.target) /
                ops.avgDaysOfInventory.target) *
                100
            ),
      trendLabel: `יעד: ${ops.avgDaysOfInventory.target} ימים`,
      target: ops.avgDaysOfInventory.target,
      lowerIsBetter: true,
    },
    {
      label: "פריטי מלאי גבוה",
      value: report.compliance.highInventory.actual,
      format: "number",
      trend: report.compliance.highInventory.met ? 0 : -11.7,
      trendLabel: `יעד: ${report.compliance.highInventory.target}`,
      target: report.compliance.highInventory.target,
      lowerIsBetter: true,
    },
    {
      label: "חסרי פעילות",
      value: report.compliance.missingActivities.actual,
      format: "number",
      trend: -report.compliance.missingActivities.deviation,
      trendLabel: `יעד: ${report.compliance.missingActivities.timeTarget}`,
      target: report.compliance.missingActivities.fixedTarget,
      lowerIsBetter: true,
    },
  ];

  return (
    <>
      <KPIGrid items={kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <InventoryByDepartmentChart
          departments={report.departments}
          target={ops.avgDaysOfInventory.target}
        />
        <ComplianceCards compliance={report.compliance} />
      </div>
    </>
  );
}
