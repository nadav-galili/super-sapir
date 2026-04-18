// HR & staffing card — 3 summary tiles (authorized, actual, turnover
// rate) plus a scrollable staffing table with per-role gap indicators.
import { motion } from "motion/react";
import { TrendingDown, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BranchFullReport } from "@/data/hadera-real";

export interface StaffingSectionProps {
  hr: BranchFullReport["hr"];
}

export function StaffingSection({ hr }: StaffingSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <Card className="border-warm-border rounded-[16px] h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-[10px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6C5CE7, #8B7FED)",
              }}
            >
              <Users className="w-4 h-4 text-white" />
            </div>
            כח אדם ומשרות
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary badges */}
          <div className="grid grid-cols-3 gap-2 mb-4 sm:grid-cols-3">
            {[
              {
                label: "תקן",
                value: hr.authorized,
                bg: "bg-[#2EC4D5]/8",
                text: "text-[#6C5CE7]",
              },
              {
                label: "בפועל",
                value: hr.actual,
                bg: "bg-[#2EC4D5]/8",
                text: "text-[#2EC4D5]",
              },
              {
                label: "תחלופה",
                value: `${hr.turnoverRate}%`,
                bg: "bg-[#F6B93B]/10",
                text: "text-[#F6B93B]",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-[16px] ${item.bg} p-4 text-center border border-warm-border`}
              >
                <p className="text-base font-semibold text-[#2D3748] mb-1">
                  {item.label}
                </p>
                <p
                  className={`text-2xl font-bold font-mono tabular-nums ${item.text}`}
                  dir="ltr"
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Staffing table */}
          <div className="overflow-auto max-h-[320px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b">
                  <th className="py-1.5 text-right font-medium text-muted-foreground">
                    תפקיד
                  </th>
                  <th className="py-1.5 text-center font-medium text-muted-foreground w-12">
                    תקן
                  </th>
                  <th className="py-1.5 text-center font-medium text-muted-foreground w-12">
                    בפועל
                  </th>
                  <th className="py-1.5 text-center font-medium text-muted-foreground w-12">
                    פער
                  </th>
                </tr>
              </thead>
              <tbody>
                {hr.staffing.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-warm-divider hover:bg-[#FDF8F6]"
                  >
                    <td className="py-1.5 font-medium">{row.role}</td>
                    <td className="py-1.5 text-center tabular-nums" dir="ltr">
                      {row.authorized}
                    </td>
                    <td className="py-1.5 text-center tabular-nums" dir="ltr">
                      {row.actual}
                    </td>
                    <td className="py-1.5 text-center" dir="ltr">
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          row.gap > 0
                            ? "bg-[#2EC4D5]/15 text-[#2EC4D5]"
                            : row.gap < 0
                              ? "bg-[#DC4E59]/15 text-[#DC4E59]"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {row.gap > 0 ? (
                          <TrendingUp className="w-2.5 h-2.5" />
                        ) : row.gap < 0 ? (
                          <TrendingDown className="w-2.5 h-2.5" />
                        ) : null}
                        {row.gap > 0 ? "+" : ""}
                        {row.gap}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
