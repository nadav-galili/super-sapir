// Inventory view: average-days-of-inventory bar chart per department,
// with a dashed target line and over/under-target color coding.
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DepartmentSales } from "@/data/hadera-real";

export interface InventoryByDepartmentChartProps {
  departments: DepartmentSales[];
  target: number;
}

export function InventoryByDepartmentChart({
  departments,
  target,
}: InventoryByDepartmentChartProps) {
  const sorted = [...departments].sort(
    (a, b) => b.avgDaysOfInventory - a.avgDaysOfInventory
  );
  const maxDays = Math.max(...sorted.map((d) => d.avgDaysOfInventory));

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-[#2D3748]">
            ימי מלאי ממוצע לפי מחלקה
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            יעד: {target} ימים
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map((dept) => {
            const overTarget = dept.avgDaysOfInventory > target;
            const barPct = (dept.avgDaysOfInventory / maxDays) * 100;
            const targetPct = (target / maxDays) * 100;
            return (
              <div key={dept.id} className="flex items-center gap-2.5">
                <span className="text-xs w-24 text-right shrink-0 text-[#4A5568] truncate">
                  {dept.name}
                </span>
                <div className="flex-1 relative h-5 bg-[#FDF8F6] rounded-[4px] overflow-hidden border border-warm-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-y-0 right-0 rounded-[4px]"
                    style={{
                      background: overTarget ? "#DC4E59" : "#2EC4D5",
                      opacity: 0.7,
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px border-r-2 border-dashed border-[#F6B93B]"
                    style={{ right: `${targetPct}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-bold w-12 text-left tabular-nums font-mono ${overTarget ? "text-[#DC4E59]" : "text-[#2EC4D5]"}`}
                  dir="ltr"
                >
                  {dept.avgDaysOfInventory}d
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-warm-divider text-[11px] text-[#788390]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-[#2EC4D5]" />
            תקין (≤{target} ימים)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-[#DC4E59]" />
            מעל יעד (&gt;{target} ימים)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-px h-3 border-r-2 border-dashed border-[#F6B93B]" />
            קו יעד
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
