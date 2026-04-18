// HR view: 5 HR KPIs + the staffing-table card.
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import type { BranchFullReport } from "@/data/hadera-real";
import type { KPICardData } from "@/data/types";
import { StaffingSection } from "@/components/store-manager/charts/StaffingSection";

export interface HRViewProps {
  report: BranchFullReport;
}

export function HRView({ report }: HRViewProps) {
  const hr = report.hr;
  const kpis: KPICardData[] = [
    {
      label: "תקן עובדים",
      value: hr.authorized,
      format: "number",
      trend: 0,
      trendLabel: "",
    },
    {
      label: "עובדים בפועל",
      value: hr.actual,
      format: "number",
      trend:
        hr.authorized > 0
          ? +(((hr.actual - hr.authorized) / hr.authorized) * 100).toFixed(2)
          : 0,
      trendLabel: "מעל תקן",
      target: hr.authorized,
    },
    {
      label: "עלות שכר",
      value: +hr.salaryCostPercent.toFixed(2),
      format: "percent",
      trend: 0.9,
      trendLabel: `יעד: ${hr.salaryTarget}%`,
      target: hr.salaryTarget,
      domain: "cost",
    },
    {
      label: "עלות שכר בש״ח",
      value: hr.salaryExpense.current,
      format: "currencyShort",
      trend:
        hr.salaryExpense.monthlyAvg2024 > 0
          ? +(
              ((hr.salaryExpense.current - hr.salaryExpense.monthlyAvg2024) /
                hr.salaryExpense.monthlyAvg2024) *
              100
            ).toFixed(1)
          : 0,
      trendLabel: "",
      domain: "cost",
    },
    {
      label: "תחלופה שנתית",
      value: Math.round(hr.turnoverRate),
      format: "number",
      trend: -2.3,
      trendLabel: `דירוג #${hr.turnoverRanking}`,
      domain: "cost",
    },
  ];
  return (
    <>
      <KPIGrid items={kpis} columns={5} />
      <StaffingSection hr={hr} />
    </>
  );
}
