// Overview: branch performance card — 4 tiles with derived productivity
// per work-hour metric. Uses the shared `MiniStatTile` for each cell so
// the KPI-card boilerplate lives in exactly one place.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BranchFullReport } from "@/data/hadera-real";
import { WORKING_DAYS_PER_MONTH } from "@/data/constants";
import { getGrowthColor } from "@/lib/kpi/resolvers";
import { MiniStatTile } from "../MiniStatTile";

const PRODUCTIVITY_BASELINE = 420;

export interface BranchPerformanceCardProps {
  report: BranchFullReport;
}

export function BranchPerformanceCard({ report }: BranchPerformanceCardProps) {
  const totalWorkHours = report.hr.actual * WORKING_DAYS_PER_MONTH * 8;
  const productivityPerHour =
    totalWorkHours > 0
      ? Math.round(report.sales.total.current / totalWorkHours)
      : 0;
  const productivityChange = +(
    ((productivityPerHour - PRODUCTIVITY_BASELINE) / PRODUCTIVITY_BASELINE) *
    100
  ).toFixed(1);

  const items: {
    label: string;
    value: string;
    change: number | null;
    sub: string;
  }[] = [
    {
      label: "% יישום משימות בEyedo",
      value: String(report.operations.qualityScore.current),
      change:
        report.operations.qualityScore.current >=
        report.operations.qualityScore.target
          ? 0
          : -Math.round(
              ((report.operations.qualityScore.target -
                report.operations.qualityScore.current) /
                report.operations.qualityScore.target) *
                100
            ),
      sub: "מתוך 100",
    },
    {
      label: 'הכנסות למ"ר',
      value: `₪${report.info.revenuePerMeter.toLocaleString()}`,
      change: null,
      sub: `שטח: ${report.info.sellingArea.toLocaleString()} מ"ר`,
    },
    {
      label: "אחוז עלות שכר",
      value: `${report.hr.salaryCostPercent}%`,
      change: +(report.hr.salaryTarget - report.hr.salaryCostPercent).toFixed(
        1
      ),
      sub: `יעד: ${report.hr.salaryTarget}%`,
    },
    {
      label: "פריון לשעת עבודה",
      value: `₪${productivityPerHour.toLocaleString()}`,
      change: productivityChange,
      sub: `${report.hr.actual} משרות`,
    },
  ];

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">ביצועי סניף</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <MiniStatTile
              key={item.label}
              label={item.label}
              value={item.value}
              subtitle={item.sub}
              accessory={
                item.change !== null ? (
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: getGrowthColor({ changePercent: item.change }),
                    }}
                    dir="ltr"
                  >
                    {item.change > 0 ? "▲" : "▼"}
                    {Math.abs(item.change)}%
                  </span>
                ) : null
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
