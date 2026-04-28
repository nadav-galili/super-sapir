import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyShort } from "@/lib/format";
import { allBranches } from "@/data/mock-branches";

export interface BranchComparison {
  id: string;
  name: string;
  currentSales: number;
  lastYearSales: number;
  yoyGrowthPercent: number;
}

export function getTopBranches(count: number): BranchComparison[] {
  return [...allBranches]
    .sort((a, b) => b.metrics.totalSales - a.metrics.totalSales)
    .slice(0, count)
    .map((b) => {
      const growth = b.metrics.yoyGrowth;
      const lastYear = b.metrics.totalSales / (1 + growth / 100);
      return {
        id: b.id,
        name: b.name,
        currentSales: b.metrics.totalSales,
        lastYearSales: Math.round(lastYear),
        yoyGrowthPercent: +growth.toFixed(1),
      };
    });
}

function GrowthLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}) {
  const { x = 0, y = 0, width = 0, value = 0 } = props;
  const isPositive = value >= 0;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fontSize={16}
      fontWeight={600}
      fill={isPositive ? "#2EC4D5" : "#DC4E59"}
    >
      {isPositive ? "+" : ""}
      {value}%
    </text>
  );
}

export function BranchComparisonChart() {
  const navigate = useNavigate();
  const data = useMemo(() => getTopBranches(5), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            5 סניפים מובילים — השוואה שנתית
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 24, right: 20, left: 10, bottom: 5 }}
                barGap={2}
                onClick={(nextState) => {
                  const idx = nextState?.activeTooltipIndex as
                    | number
                    | undefined;
                  if (idx != null && data[idx]) {
                    navigate({
                      to: "/store-manager/$branchId",
                      params: { branchId: data[idx].id },
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#FFF0EA" />
                <XAxis dataKey="name" tick={{ fontSize: 18 }} />
                <YAxis
                  yAxisId="sales"
                  tickFormatter={(v: number) => formatCurrencyShort(v)}
                  tick={{ fontSize: 16 }}
                  width={60}
                />
                <YAxis
                  yAxisId="growth"
                  orientation="right"
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 16 }}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    direction: "rtl",
                    borderRadius: "8px",
                    fontSize: 18,
                  }}
                  formatter={(value, name) => {
                    if (name === "currentSales")
                      return [
                        formatCurrencyShort(value as number),
                        "שנה נוכחית",
                      ];
                    if (name === "lastYearSales")
                      return [
                        formatCurrencyShort(value as number),
                        "שנה קודמת",
                      ];
                    return [`${value}%`, "צמיחה שנתית"];
                  }}
                  cursor={{ fill: "rgba(220, 78, 89, 0.04)" }}
                />
                <Bar
                  yAxisId="sales"
                  dataKey="currentSales"
                  fill="#DC4E59"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  barSize={28}
                  className="cursor-pointer"
                >
                  <LabelList
                    dataKey="yoyGrowthPercent"
                    content={<GrowthLabel />}
                  />
                  {data.map((entry) => (
                    <Cell key={entry.id} />
                  ))}
                </Bar>
                <Bar
                  yAxisId="sales"
                  dataKey="lastYearSales"
                  fill="#788390"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={200}
                  barSize={28}
                  className="cursor-pointer"
                />
                <Line
                  yAxisId="growth"
                  type="monotone"
                  dataKey="yoyGrowthPercent"
                  stroke="#6C5CE7"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#6C5CE7" }}
                  animationDuration={1200}
                  animationBegin={400}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-2 text-base text-[#4A5568]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#DC4E59] inline-block" />
              שנה נוכחית
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#788390] inline-block" />
              שנה קודמת
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#6C5CE7] inline-block" />
              צמיחה %
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
