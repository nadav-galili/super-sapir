// Monthly sales comparison — current year (bars) vs last year (dashed
// line). Bars are colored by traffic-light status (`<99%` red, `99–101%`
// yellow, `>101%` green) of each month's derived target. Per-month
// target is `lastYearSales × growthMultiplier` so seasonality is
// preserved and the per-month targets sum to the annual target.
import { motion } from "motion/react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MonthlyDetail } from "@/data/hadera-real";
import { REPORT_MONTH, REPORT_YEAR } from "@/data/constants";
import { deriveMonthlyTargets } from "@/lib/monthly-targets";
import { getMonthlySalesColor } from "@/lib/kpi/resolvers";

export interface MonthlyComparisonChartProps {
  data: MonthlyDetail[];
  /** Annual sales target — used to derive per-month targets. */
  annualTarget: number;
  /** Sum of last year's monthly sales — the seasonal base. */
  annualLastYear: number;
}

// Tiny horizontal tick rendered at each month's target Y-value via a
// Recharts <Scatter>. Width matches the bar so the marker aligns with
// the column it annotates.
function TargetMarker(props: { cx?: number; cy?: number }) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  const halfWidth = 14;
  return (
    <line
      x1={cx - halfWidth}
      x2={cx + halfWidth}
      y1={cy}
      y2={cy}
      stroke="#2D3748"
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}

export function MonthlyComparisonChart({
  data,
  annualTarget,
  annualLastYear,
}: MonthlyComparisonChartProps) {
  const annotated = deriveMonthlyTargets(data, annualTarget, annualLastYear);
  const chartData = annotated
    .filter((d) => d.monthNum <= REPORT_MONTH)
    .map((d) => ({
      month: d.month,
      current: Math.round(d.currentSales / 1000),
      lastYear: Math.round(d.lastYearSales / 1000),
      target: Math.round(d.target / 1000),
      status: d.status,
      fill: getMonthlySalesColor({
        actual: d.currentSales,
        target: d.target,
      }),
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
                  tick={{ fontSize: 16, fill: "#4A5568" }}
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}M`}
                  tick={{ fontSize: 16, fill: "#A0AEC0" }}
                  domain={[7000, "auto"]}
                  width={50}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const label =
                      name === "current"
                        ? String(REPORT_YEAR)
                        : name === "target"
                          ? "יעד"
                          : String(REPORT_YEAR - 1);
                    return [`₪${Number(value).toLocaleString()}K`, label];
                  }}
                  contentStyle={{
                    direction: "rtl",
                    borderRadius: "10px",
                    border: "1px solid #FFE8DE",
                    fontSize: 18,
                  }}
                />
                <Legend
                  formatter={(v: string) =>
                    v === "current"
                      ? String(REPORT_YEAR)
                      : v === "target"
                        ? "יעד"
                        : String(REPORT_YEAR - 1)
                  }
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 16, paddingTop: 8 }}
                />
                <Bar
                  dataKey="current"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                >
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={`${entry.fill}33`}
                      stroke={entry.fill}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
                <Scatter
                  dataKey="target"
                  shape={<TargetMarker />}
                  legendType="none"
                  isAnimationActive={false}
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
