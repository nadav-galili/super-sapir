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

interface ChartRow {
  month: string;
  current: number;
  lastYear: number;
  target: number;
  vsTargetPercent: number;
  status: "red" | "yellow" | "green";
  fill: string;
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

// Small status-colored dot rendered at each bar's top via a hidden
// <Scatter> with `dataKey="current"` — Recharts plots Scatter at the
// data Y-value, which lands exactly on the bar tip.
function StatusDot(props: { cx?: number; cy?: number; payload?: ChartRow }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={payload.fill}
      stroke="white"
      strokeWidth={2}
    />
  );
}

// Custom tooltip — owns the rendering so we don't have to fight
// Recharts' auto-naming of Scatter X/Y series. Reads the underlying
// row from the first payload entry and pulls every value off it.
function MonthlyTooltip(props: {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
}) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  if (!row) return null;

  const gap = row.vsTargetPercent - 100;
  const verdict =
    row.status === "green"
      ? `מעל היעד +${gap.toFixed(1)}%`
      : row.status === "yellow"
        ? `על היעד ${gap >= 0 ? "+" : ""}${gap.toFixed(1)}%`
        : `מתחת ליעד ${gap.toFixed(1)}%`;

  return (
    <div
      dir="rtl"
      style={{
        borderRadius: "12px",
        border: "1px solid #FFE8DE",
        backgroundColor: "white",
        padding: "12px 14px",
        fontSize: 16,
        boxShadow: "0 6px 20px rgba(45, 55, 72, 0.08)",
        minWidth: 220,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#2D3748",
          marginBottom: 10,
          fontSize: 18,
        }}
      >
        {row.month} {REPORT_YEAR}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "6px 16px",
          color: "#4A5568",
          alignItems: "center",
        }}
      >
        <span>מכירות {REPORT_YEAR}</span>
        <span
          dir="ltr"
          style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
        >
          ₪{row.current.toLocaleString()}K
        </span>
        <span style={{ color: "#42a5f5" }}>מכירות {REPORT_YEAR - 1}</span>
        <span
          dir="ltr"
          style={{ fontVariantNumeric: "tabular-nums", color: "#42a5f5" }}
        >
          ₪{row.lastYear.toLocaleString()}K
        </span>
        <span>יעד</span>
        <span
          dir="ltr"
          style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
        >
          ₪{row.target.toLocaleString()}K
        </span>
      </div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid #FFE8DE",
          color: row.fill,
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {verdict}
      </div>
    </div>
  );
}

export function MonthlyComparisonChart({
  data,
  annualTarget,
  annualLastYear,
}: MonthlyComparisonChartProps) {
  const annotated = deriveMonthlyTargets(data, annualTarget, annualLastYear);
  const chartData: ChartRow[] = annotated
    .filter((d) => d.monthNum <= REPORT_MONTH)
    .map((d) => ({
      month: d.month,
      current: Math.round(d.currentSales / 1000),
      lastYear: Math.round(d.lastYearSales / 1000),
      target: Math.round(d.target / 1000),
      vsTargetPercent: d.vsTargetPercent,
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
                margin={{ top: 18, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.04)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#4A5568" }}
                  tickFormatter={(v: string) => v.slice(0, 3)}
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}M`}
                  tick={{ fontSize: 16, fill: "#788390" }}
                  domain={[7000, "auto"]}
                  width={50}
                />
                <Tooltip content={<MonthlyTooltip />} cursor={false} />
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
                      fill={`${entry.fill}80`}
                      stroke={entry.fill}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
                <Scatter
                  dataKey="current"
                  shape={<StatusDot />}
                  legendType="none"
                  isAnimationActive={false}
                />
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
