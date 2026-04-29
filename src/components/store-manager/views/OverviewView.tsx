// Overview view composes the top-line KPIs + six overview charts and
// the AI briefing card. Pure layout — receives `report` and the AI
// analysis state so the route stays a thin shell.
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import type { BranchFullReport } from "@/data/hadera-real";
import { WORKING_DAYS_PER_MONTH } from "@/data/constants";
import { formatCurrencyShort } from "@/lib/format";
import type { KPICardData } from "@/data/types";
import { StoreAIBriefing } from "@/components/store-manager/StoreAIBriefing";
import { useAIInsight } from "@/hooks/useAIInsight";
import { buildStoreInsight } from "@/lib/ai/builders";
import { MonthlyComparisonChart } from "@/components/store-manager/charts/MonthlyComparisonChart";
import { BranchPerformanceCard } from "@/components/store-manager/charts/BranchPerformanceCard";
import { OverviewExpenseTable } from "@/components/store-manager/charts/OverviewExpenseTable";
import { OverviewDepartmentBars } from "@/components/store-manager/charts/OverviewDepartmentBars";
import { AlertsTargetsCard } from "@/components/store-manager/charts/AlertsTargetsCard";
import { OverviewStaffingCard } from "@/components/store-manager/charts/OverviewStaffingCard";

export interface OverviewViewProps {
  report: BranchFullReport;
  branchId: string;
}

export function OverviewView({ report, branchId }: OverviewViewProps) {
  const { rows, isLoading, isStreaming, error, retry } = useAIInsight(
    buildStoreInsight({ branchId, report })
  );
  const s = report.sales;
  const kpis: KPICardData[] = [
    {
      label: "מכירות סניף",
      value: s.total.current,
      format: "currencyShort",
      trend: s.total.vsTarget,
      trendLabel: `יעד: ${formatCurrencyShort(s.total.target)}`,
      target: s.total.target,
    },
    {
      label: "לקוחות",
      value: s.customers.current,
      format: "number",
      trend: s.customers.change,
      trendLabel: `דירוג #${s.customers.ranking}`,
      target: s.customers.target,
    },
    {
      label: "לקוחות ליום",
      value: Math.round(s.customers.current / WORKING_DAYS_PER_MONTH),
      format: "number",
      trend: s.customers.change,
      trendLabel: `דירוג #${s.customers.ranking}`,
    },
    {
      label: "סל ממוצע",
      value: s.avgBasket.current,
      format: "currency",
      trend: s.avgBasket.change,
      trendLabel: "שנתי",
    },
  ];

  return (
    <div className="space-y-5">
      <StoreAIBriefing
        rows={rows}
        isLoading={isLoading}
        isStreaming={isStreaming}
        error={error}
        onRetry={retry}
      />

      <KPIGrid items={kpis} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <MonthlyComparisonChart
          data={report.monthly}
          annualTarget={s.total.target}
          annualLastYear={s.total.lastYear}
        />
        <BranchPerformanceCard report={report} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <OverviewExpenseTable expenses={report.expenses} />
        <OverviewDepartmentBars departments={report.departments} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <AlertsTargetsCard report={report} />
        <OverviewStaffingCard hr={report.hr} />
      </div>
    </div>
  );
}
