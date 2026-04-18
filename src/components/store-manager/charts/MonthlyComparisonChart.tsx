// Monthly sales comparison — current year (bars) vs last year (dashed
// line). Filters to only months up to REPORT_MONTH and converts values
// to thousands for the Y axis.
import { motion } from "motion/react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MonthlyDetail } from "@/data/hadera-real";
import { REPORT_MONTH, REPORT_YEAR } from "@/data/constants";

export interface MonthlyComparisonChartProps {
  data: MonthlyDetail[];
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  const chartData = data
    .filter((d) => d.monthNum <= REPORT_MONTH)
    .map((d) => ({
      month: d.month,
      current: Math.round(d.currentSales / 1000),
      lastYear: Math.round(d.lastYearSales / 1000),
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <Card className="border-warm-border rounded-[16px]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-[#2D3748]">
              מגמת מכירות
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {REPORT_YEAR}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.04)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#4A5568" }}
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}M`}
                  tick={{ fontSize: 11, fill: "#A0AEC0" }}
                  domain={[7000, "auto"]}
                  width={50}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `₪${Number(value).toLocaleString()}K`,
                    name === "current"
                      ? String(REPORT_YEAR)
                      : String(REPORT_YEAR - 1),
                  ]}
                  contentStyle={{
                    direction: "rtl",
                    borderRadius: "10px",
                    border: "1px solid #FFE8DE",
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(v: string) =>
                    v === "current"
                      ? String(REPORT_YEAR)
                      : String(REPORT_YEAR - 1)
                  }
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  dataKey="current"
                  fill="rgba(220, 78, 89, 0.15)"
                  stroke="#DC4E59"
                  strokeWidth={2}
                  radius={[6, 6, 0, 0]}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="lastYear"
                  stroke="#42a5f5"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#42a5f5" }}
                  animationDuration={1500}
                  animationBegin={300}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
