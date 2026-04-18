// Overview: alerts & targets — 8 KPIs each rendered as a progress bar
// with a target-line overlay. Each row declares its domain (sales =
// higher-is-better, cost = lower-is-better) so the right resolver from
// `@/lib/kpi/resolvers` is picked — no direction flags at call sites.
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BranchFullReport } from "@/data/hadera-real";
import { getCostColor, getSalesColor } from "@/lib/kpi/resolvers";

export interface AlertsTargetsCardProps {
  report: BranchFullReport;
}

interface KpiRow {
  label: string;
  actual: number;
  target: number;
  domain: "sales" | "cost";
}

export function AlertsTargetsCard({ report }: AlertsTargetsCardProps) {
  const kpis: KpiRow[] = [
    {
      label: "אחוז עלות שכר",
      actual: report.hr.salaryCostPercent,
      target: report.hr.salaryTarget,
      domain: "cost",
    },
    {
      label: "Eyedo משימות",
      actual: report.operations.qualityScore.current,
      target: report.operations.qualityScore.target,
      domain: "sales",
    },
    {
      label: "מלאי גבוה",
      actual: report.compliance.highInventory.actual,
      target: report.compliance.highInventory.target,
      domain: "cost",
    },
    {
      label: "חותמות אדומות",
      actual: report.compliance.redAlerts.redSubscriptions,
      target: report.compliance.redAlerts.target,
      domain: "cost",
    },
    {
      label: "חסרי פעילות",
      actual: report.compliance.missingActivities.actual,
      target: report.compliance.missingActivities.fixedTarget,
      domain: "cost",
    },
    {
      label: "חזרות",
      actual: report.compliance.returns.actual,
      target: report.compliance.returns.target,
      domain: "cost",
    },
    {
      label: "פחת בשר %",
      actual: report.operations.meatWaste,
      target: 5,
      domain: "cost",
    },
    {
      label: "תלונות לקוח",
      actual: report.operations.customerComplaints.current,
      target: report.operations.customerComplaints.target,
      domain: "cost",
    },
  ];

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-[#2D3748]">
            התראות ויעדים
          </CardTitle>
          <div className="flex items-center gap-4 text-[11px] text-[#A0AEC0]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D3748]" />
              ביצוע
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-[#A0AEC0] border-dashed" />
              יעד
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {kpis.map((kpi, i) => {
          const statusColor =
            kpi.domain === "cost"
              ? getCostColor({ actual: kpi.actual, target: kpi.target })
              : getSalesColor({ actual: kpi.actual, target: kpi.target });
          const rawMax = Math.max(kpi.actual, kpi.target);
          const maxVal = rawMax > 0 ? rawMax * 1.15 : 1;
          const actualPct = (kpi.actual / maxVal) * 100;
          const targetPct = (kpi.target / maxVal) * 100;

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#4A5568]">{kpi.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span style={{ color: statusColor }}>
                    {statusColor === "#10B981"
                      ? "עמד"
                      : statusColor === "#FBBF24"
                        ? "קרוב"
                        : "לא עמד"}
                  </span>
                </span>
              </div>
              <div className="relative h-[14px] bg-[#FDF8F6] rounded-[7px] overflow-visible border border-warm-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${actualPct}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }}
                  className="absolute inset-y-0 start-0 rounded-[7px]"
                  style={{ background: statusColor }}
                />
                <div
                  className="absolute top-[-3px] bottom-[-3px] w-[2px] bg-[#4A5568] rounded-full"
                  style={{ insetInlineStart: `${targetPct}%` }}
                >
                  <div
                    className="absolute -top-4 start-1/2 -translate-x-1/2 text-[9px] font-mono text-[#A0AEC0] whitespace-nowrap"
                    dir="ltr"
                  >
                    {kpi.target}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-0.5">
                <span
                  className="text-[10px] font-mono text-[#4A5568]"
                  dir="ltr"
                >
                  {kpi.actual}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
