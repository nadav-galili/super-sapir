// Departments view: two-column "biggest movers" card showing top
// decliners (left) and top growers (right) for the report month.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DepartmentSales } from "@/data/hadera-real";
import { MONTHS_HE, REPORT_MONTH, REPORT_YEAR } from "@/data/constants";

export interface DepartmentMoversCardProps {
  departments: DepartmentSales[];
  limit?: number;
}

export function DepartmentMoversCard({
  departments,
  limit = 4,
}: DepartmentMoversCardProps) {
  const growers = [...departments]
    .filter((d) => d.yoyChangePercent > 0)
    .sort((a, b) => b.yoyChangePercent - a.yoyChangePercent)
    .slice(0, limit);
  const decliners = [...departments]
    .filter((d) => d.yoyChangePercent < 0)
    .sort((a, b) => a.yoyChangePercent - b.yoyChangePercent)
    .slice(0, limit);
  const maxRows = Math.max(growers.length, decliners.length);

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#2e7d32]" />
          <CardTitle className="text-base text-[#2D3748]">
            {MONTHS_HE[REPORT_MONTH - 1]} {REPORT_YEAR} — מחלקות בולטות
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-[#c62828] mb-2">▼ ירידה</p>
            <div className="space-y-2">
              {decliners.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between bg-[#ffebee] rounded-[8px] px-3 py-2.5"
                >
                  <span className="text-xs text-[#c62828] font-medium">
                    {dept.name}
                  </span>
                  <span
                    className="text-xs font-bold text-[#c62828] tabular-nums font-mono"
                    dir="ltr"
                  >
                    {dept.yoyChangePercent}%
                  </span>
                </div>
              ))}
              {Array.from({ length: maxRows - decliners.length }).map(
                (_, i) => (
                  <div key={`empty-d-${i}`} className="h-[38px]" />
                )
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2e7d32] mb-2">▲ צמיחה</p>
            <div className="space-y-2">
              {growers.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between bg-[#e8f5e9] rounded-[8px] px-3 py-2.5"
                >
                  <span className="text-xs text-[#2e7d32] font-medium">
                    {dept.name}
                  </span>
                  <span
                    className="text-xs font-bold text-[#2e7d32] tabular-nums font-mono"
                    dir="ltr"
                  >
                    +{dept.yoyChangePercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
