// Alerts view: 3 compliance/alert KPIs + the shared ComplianceCards.
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import type { BranchFullReport } from "@/data/hadera-real";
import type { KPICardData } from "@/data/types";
import { ComplianceCards } from "@/components/store-manager/ComplianceCards";

export interface AlertsViewProps {
  report: BranchFullReport;
}

export function AlertsView({ report }: AlertsViewProps) {
  const kpis: KPICardData[] = [
    {
      label: "התראות אדומות",
      value: report.compliance.redAlerts.actual,
      format: "number",
      trend: -10,
      trendLabel: `יעד: ${report.compliance.redAlerts.target}`,
      target: report.compliance.redAlerts.target,
      lowerIsBetter: true,
    },
    {
      label: "חותמות אדומות",
      value: report.compliance.redAlerts.redSubscriptions,
      format: "number",
      trend: -report.compliance.redAlerts.rate,
      trendLabel: "",
      target: report.compliance.redAlerts.target,
      lowerIsBetter: true,
    },
    {
      label: "דיווחי מוקד",
      value: report.operations.focusReports.current,
      format: "number",
      trend: -50,
      trendLabel: `יעד: ${report.operations.focusReports.target}`,
      target: report.operations.focusReports.target,
    },
  ];
  return (
    <>
      <KPIGrid items={kpis} columns={3} />
      <ComplianceCards compliance={report.compliance} />
    </>
  );
}
