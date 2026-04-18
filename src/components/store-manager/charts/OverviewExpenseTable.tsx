// Overview: operational expenses horizontal bar table — top 7 expenses
// by current-month amount, each with its % of revenue and YoY change.
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BranchFullReport } from "@/data/hadera-real";
import { getCostDeltaColor } from "@/lib/kpi/resolvers";
import { BAR_GRADIENTS } from "./bar-gradients";

export interface OverviewExpenseTableProps {
  expenses: BranchFullReport["expenses"];
}

export function OverviewExpenseTable({ expenses }: OverviewExpenseTableProps) {
  const sorted = [...expenses]
    .sort((a, b) => b.currentMonth - a.currentMonth)
    .slice(0, 7);
  const maxPct =
    sorted.length > 0 ? Math.max(...sorted.map((e) => e.percentOfRevenue)) : 1;

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">
          הוצאות תפעוליות (ממוצע חודשי)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((exp, i) => {
          const pctChange =
            exp.monthlyAvg2024 > 0
              ? Math.round(
                  ((exp.currentMonth - exp.monthlyAvg2024) /
                    exp.monthlyAvg2024) *
                    100
                )
              : 0;
          return (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-xs w-20 text-right shrink-0 text-[#4A5568]">
                {exp.name}
              </span>
              <div className="flex-1 h-[18px] bg-[#FDF8F6] rounded-[9px] overflow-hidden border border-warm-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(exp.percentOfRevenue / maxPct) * 100}%`,
                  }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                  className="h-full rounded-[9px]"
                  style={{ background: BAR_GRADIENTS[i] }}
                />
              </div>
              <span
                className="text-xs font-semibold text-[#2D3748] w-12 text-left tabular-nums font-mono"
                dir="ltr"
              >
                {exp.percentOfRevenue}%
              </span>
              <span
                className="text-[11px] w-14 text-left tabular-nums"
                style={{
                  color:
                    pctChange !== 0
                      ? getCostDeltaColor({ changePercent: pctChange })
                      : "#A0AEC0",
                }}
                dir="ltr"
              >
                {pctChange !== 0
                  ? `${pctChange > 0 ? "▲" : "▼"} ${Math.abs(pctChange)}%`
                  : "—"}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
