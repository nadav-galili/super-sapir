// Overview: department share bar chart — top 8 departments by share
// percent, each bar color-cycled through the shared gradient palette.
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DepartmentSales } from "@/data/hadera-real";
import { getGrowthColor } from "@/lib/kpi/resolvers";
import { BAR_GRADIENTS } from "./bar-gradients";

export interface OverviewDepartmentBarsProps {
  departments: DepartmentSales[];
}

export function OverviewDepartmentBars({
  departments,
}: OverviewDepartmentBarsProps) {
  const sorted = [...departments]
    .sort((a, b) => b.sharePercent - a.sharePercent)
    .slice(0, 8);
  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">
          נתח מכירות לפי מחלקה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((dept, i) => (
          <div key={dept.id} className="flex items-center gap-2.5">
            <span className="text-xs w-16 text-right shrink-0 text-[#4A5568]">
              {dept.name}
            </span>
            <div className="flex-1 h-[18px] bg-[#FDF8F6] rounded-[9px] overflow-hidden border border-warm-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dept.sharePercent * 3.5}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                className="h-full rounded-[9px]"
                style={{ background: BAR_GRADIENTS[i] }}
              />
            </div>
            <span
              className="text-xs font-semibold text-[#2D3748] w-12 text-left tabular-nums font-mono"
              dir="ltr"
            >
              {dept.sharePercent}%
            </span>
            <span
              className="text-[11px] w-14 text-left tabular-nums"
              style={{
                color: getGrowthColor({ changePercent: dept.yoyChangePercent }),
              }}
              dir="ltr"
            >
              {dept.yoyChangePercent > 0
                ? "▲"
                : dept.yoyChangePercent < 0
                  ? "▼"
                  : "—"}{" "}
              {Math.abs(dept.yoyChangePercent)}%
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
