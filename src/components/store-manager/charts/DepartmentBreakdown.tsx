// Department sales breakdown — horizontal paired bars per department
// (current month vs YTD) with optional anomaly icons pulled from
// `detectAnomalies`. Sorted by YTD descending.
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DepartmentSales } from "@/data/hadera-real";
import type { AnomalyResult } from "@/lib/ai";
import { REPORT_YEAR } from "@/data/constants";
import { formatCurrencyShort } from "@/lib/format";
import { CHART_COLORS } from "@/lib/colors";

const DEPT_COLORS: Record<string, string> = {
  grocery: "#1976d2",
  dairy: "#0097a7",
  vegetables: "#2e7d32",
  "home-products": "#6C5CE7",
  drinks: "#0288d1",
  frozen: "#00897b",
  household: "#e65100",
  bread: "#ef6c00",
  baby: "#2e7d32",
  "fresh-meat": "#c62828",
  deli: "#7b1fa2",
  pastries: "#ef6c00",
  "fresh-fish": "#c62828",
  organic: "#388e3c",
};

export interface DepartmentBreakdownProps {
  departments: DepartmentSales[];
  anomalies?: AnomalyResult[];
}

export function DepartmentBreakdown({
  departments,
  anomalies = [],
}: DepartmentBreakdownProps) {
  const sorted = [...departments].sort((a, b) => b.yearToDate - a.yearToDate);
  const maxYtd = Math.max(...sorted.map((d) => d.yearToDate));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Card className="border-warm-border rounded-[16px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#2D3748]">
            מכירות מחלקות — חודשי מול מצטבר {REPORT_YEAR}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sorted.map((dept, i) => {
              const color =
                DEPT_COLORS[dept.id] ?? CHART_COLORS[i % CHART_COLORS.length];
              const currentPct = (dept.currentMonth / maxYtd) * 100;
              const ytdPct = (dept.yearToDate / maxYtd) * 100;
              const isPositive = dept.yoyChangePercent >= 0;
              const anomaly = anomalies.find((a) => a.departmentId === dept.id);
              return (
                <div
                  key={dept.id}
                  className="group relative flex items-center gap-3"
                >
                  <span className="text-xs w-20 text-right shrink-0 text-[#4A5568] font-medium truncate flex items-center gap-1">
                    {anomaly && (
                      <span title={anomaly.tooltipText}>
                        <AlertTriangle
                          className="w-3.5 h-3.5 shrink-0"
                          style={{
                            color:
                              anomaly.severity === "critical"
                                ? "#DC4E59"
                                : "#F6B93B",
                          }}
                        />
                      </span>
                    )}
                    {dept.name}
                  </span>
                  <div className="flex-1 space-y-1 cursor-pointer">
                    <div className="relative h-4 bg-[#e8eaf6] rounded-[3px] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentPct}%` }}
                        transition={{ delay: 0.3 + i * 0.04, duration: 0.8 }}
                        className="absolute inset-y-0 right-0 rounded-[3px]"
                        style={{ background: color }}
                      />
                    </div>
                    <div className="relative h-4 bg-[#e8eaf6] rounded-[3px] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ytdPct}%` }}
                        transition={{ delay: 0.4 + i * 0.04, duration: 0.8 }}
                        className="absolute inset-y-0 right-0 rounded-[3px]"
                        style={{ background: color, opacity: 0.3 }}
                      />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-20 pointer-events-none">
                      <div
                        className="bg-white rounded-[10px] border border-warm-border shadow-lg p-3 text-xs min-w-[180px]"
                        style={{ direction: "rtl" }}
                      >
                        <p className="font-bold text-[#2D3748] mb-1.5">
                          {dept.name}
                        </p>
                        <div className="space-y-1 text-[#4A5568]">
                          <div className="flex justify-between">
                            <span>חודשי:</span>
                            <span className="font-mono font-semibold" dir="ltr">
                              {formatCurrencyShort(dept.currentMonth)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>מצטבר:</span>
                            <span className="font-mono font-semibold" dir="ltr">
                              {formatCurrencyShort(dept.yearToDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>שינוי שנתי:</span>
                            <span
                              className={`font-semibold ${isPositive ? "text-[#2e7d32]" : "text-[#c62828]"}`}
                              dir="ltr"
                            >
                              {isPositive ? "+" : ""}
                              {dept.yoyChangePercent}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>נתח:</span>
                            <span className="font-semibold" dir="ltr">
                              {dept.sharePercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold tabular-nums font-mono w-14 text-left text-[#2D3748]"
                    dir="ltr"
                  >
                    {formatCurrencyShort(dept.yearToDate)}
                  </span>
                  <span
                    className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-[4px] w-16 text-center ${
                      isPositive
                        ? "bg-[#e8f5e9] text-[#2e7d32]"
                        : "bg-[#ffebee] text-[#c62828]"
                    }`}
                    dir="ltr"
                  >
                    {isPositive ? "+" : ""}
                    {dept.yoyChangePercent}%
                  </span>
                  <span
                    className="text-xs tabular-nums text-[#A0AEC0] w-10 text-left"
                    dir="ltr"
                  >
                    {dept.sharePercent}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-5 pt-3 border-t border-warm-divider text-[11px] text-[#A0AEC0]">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded-sm bg-[#1976d2]" />
              חודשי
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded-sm bg-[#1976d2] opacity-30" />
              מצטבר
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
