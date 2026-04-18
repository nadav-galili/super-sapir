// Overview: HR & turnover card — 4 stat tiles + 3-year turnover bar
// chart with a monthly-average line overlay. Takes only the `hr` slice
// of the report so it can be tested in isolation.
import {
  Bar,
  BarChart as ReBarChart,
  Cell,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BranchFullReport } from "@/data/hadera-real";
import { REPORT_YEAR } from "@/data/constants";

export interface OverviewStaffingCardProps {
  hr: BranchFullReport["hr"];
}

export function OverviewStaffingCard({ hr }: OverviewStaffingCardProps) {
  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">
          כוח אדם ותחלופה
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2.5 mb-5">
          {[
            { label: "תקן", value: hr.authorized },
            { label: "מצבה רישומית", value: hr.actual },
            { label: "משרות בפועל", value: hr.actual },
            {
              label: "שעות נוספות",
              value: Math.round(hr.actual * 23).toLocaleString(),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-3 rounded-xl bg-[#FDF8F6]"
            >
              <p className="text-[11px] text-[#A0AEC0] mb-1.5">{item.label}</p>
              <p
                className="text-xl font-bold text-[#2D3748] tabular-nums"
                dir="ltr"
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D3748] mb-3">
            תחלופת עובדים (שנתי)
          </p>
          <div dir="ltr" className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart
                data={[
                  { year: String(REPORT_YEAR - 2), rate: 81.6, monthly: 7.8 },
                  { year: String(REPORT_YEAR - 1), rate: 81.6, monthly: 6.7 },
                  {
                    year: String(REPORT_YEAR),
                    rate: hr.turnoverRate,
                    monthly: 6.7,
                  },
                ]}
                barGap={4}
              >
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}%`,
                    name === "rate"
                      ? "שיעור תחלופה שנתי"
                      : "עזיבה חודשית ממוצעת",
                  ]}
                  contentStyle={{
                    direction: "rtl",
                    borderRadius: "10px",
                    border: "1px solid #FFE8DE",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={28}>
                  <Cell
                    fill="rgba(108, 92, 231, 0.2)"
                    stroke="#6C5CE7"
                    strokeWidth={2}
                  />
                  <Cell
                    fill="rgba(108, 92, 231, 0.3)"
                    stroke="#6C5CE7"
                    strokeWidth={2}
                  />
                  <Cell
                    fill="rgba(220, 78, 89, 0.4)"
                    stroke="#DC4E59"
                    strokeWidth={2}
                  />
                </Bar>
                <Line
                  type="monotone"
                  dataKey="monthly"
                  stroke="#42a5f5"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#42a5f5" }}
                />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
