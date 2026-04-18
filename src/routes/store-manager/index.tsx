import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  BarChart as ReBarChart,
} from "recharts";
import { TrendingUp, TrendingDown, Users, AlertTriangle } from "lucide-react";
import { detectAnomalies, type AnomalyResult } from "@/lib/ai";
import { PageContainer } from "@/components/layout/PageContainer";
import { KPIGrid } from "@/components/dashboard/KPIGrid";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BranchInfoBar } from "@/components/store-manager/BranchInfoBar";
import { StoreAIBriefing } from "@/components/store-manager/StoreAIBriefing";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { ComplianceCards } from "@/components/store-manager/ComplianceCards";
import {
  type BranchFullReport,
  type DepartmentSales,
  type MonthlyDetail,
} from "@/data/hadera-real";
import {
  currentMonthYear,
  REPORT_MONTH,
  REPORT_YEAR,
  WORKING_DAYS_PER_MONTH,
  MONTHS_HE,
} from "@/data/constants";
import { allBranches } from "@/data/mock-branches";
import {
  getBranchReportOrFallback,
  HADERA_BRANCH_ID,
} from "@/data/getBranchReport";
import { formatCurrencyShort } from "@/lib/format";
import {
  CHART_COLORS,
  getDeltaStatusColor,
  getTargetStatusColor,
} from "@/lib/colors";
import type { KPICardData } from "@/data/types";

// ─── Monthly Sales Comparison Chart ──────────────────────────────
function MonthlyComparisonChart({ data }: { data: MonthlyDetail[] }) {
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

// ─── Department Breakdown ────────────────────────────────────────
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

function DepartmentBreakdown({
  departments,
  anomalies = [],
}: {
  departments: DepartmentSales[];
  anomalies?: AnomalyResult[];
}) {
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

// ─── HR & Staffing Section ───────────────────────────────────────
function StaffingSection({ hr }: { hr: BranchFullReport["hr"] }) {
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

const branchOptions = allBranches.map((b) => ({
  value: b.id,
  label: `${b.name} #${b.branchNumber}`,
}));

// ─── View-specific content renderers ─────────────────────────────
type Report = BranchFullReport;

// ─── Overview: Branch Performance Card ──────────────────────────
function BranchPerformanceCard({ report }: { report: Report }) {
  // Productivity per work hour: derive from branch sales and staffing
  const totalWorkHours = report.hr.actual * WORKING_DAYS_PER_MONTH * 8;
  const productivityPerHour =
    totalWorkHours > 0
      ? Math.round(report.sales.total.current / totalWorkHours)
      : 0;
  const PRODUCTIVITY_BASELINE = 420;
  const productivityChange = +(
    ((productivityPerHour - PRODUCTIVITY_BASELINE) / PRODUCTIVITY_BASELINE) *
    100
  ).toFixed(1);

  const items = [
    {
      label: "% יישום משימות בEyedo",
      value: String(report.operations.qualityScore.current),
      change:
        report.operations.qualityScore.current >=
        report.operations.qualityScore.target
          ? 0
          : -Math.round(
              ((report.operations.qualityScore.target -
                report.operations.qualityScore.current) /
                report.operations.qualityScore.target) *
                100
            ),
      sub: "מתוך 100",
    },
    {
      label: 'הכנסות למ"ר',
      value: `₪${report.info.revenuePerMeter.toLocaleString()}`,
      change: null,
      sub: `שטח: ${report.info.sellingArea.toLocaleString()} מ"ר`,
    },
    {
      label: "אחוז עלות שכר",
      value: `${report.hr.salaryCostPercent}%`,
      change: +(report.hr.salaryTarget - report.hr.salaryCostPercent).toFixed(
        1
      ),
      sub: `יעד: ${report.hr.salaryTarget}%`,
    },
    {
      label: "פריון לשעת עבודה",
      value: `₪${productivityPerHour.toLocaleString()}`,
      change: productivityChange,
      sub: `${report.hr.actual} משרות`,
    },
  ];
  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">ביצועי סניף</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-[#FDF8F6] p-4 text-center"
            >
              <p className="text-xs text-[#A0AEC0] mb-1.5">{item.label}</p>
              <div className="flex items-center justify-center gap-1.5">
                <span
                  className="text-2xl font-bold text-[#2D3748] font-mono"
                  dir="ltr"
                >
                  {item.value}
                </span>
                {item.change !== null && (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: getDeltaStatusColor(item.change) }}
                    dir="ltr"
                  >
                    {item.change > 0 ? "▲" : "▼"}
                    {Math.abs(item.change)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A0AEC0] mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Overview: Shared Bar Gradients ─────────────────────────────
const BAR_GRADIENTS = [
  "linear-gradient(90deg, #DC4E59, #E8777F)",
  "linear-gradient(90deg, #6C5CE7, #8B7FED)",
  "linear-gradient(90deg, #2EC4D5, #5DD8E3)",
  "linear-gradient(90deg, #42a5f5, #90caf9)",
  "linear-gradient(90deg, #F6B93B, #F8CB6B)",
  "linear-gradient(90deg, #2EC4D5, #80cbc4)",
  "linear-gradient(90deg, #A0AEC0, #b0bec5)",
  "linear-gradient(90deg, #DC4E59, #ef9a9a)",
];

function OverviewExpenseTable({
  expenses,
}: {
  expenses: BranchFullReport["expenses"];
}) {
  const sorted = [...expenses]
    .sort((a, b) => b.currentMonth - a.currentMonth)
    .slice(0, 7);
  const maxPct =
    sorted.length > 0 ? Math.max(...sorted.map((e) => e.percentOfRevenue)) : 1;

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">
          הוצאות תפעוליות (ממוצע חודשי)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((exp, i) => {
          const pctChange =
            exp.monthlyAvg2024 > 0
              ? Math.round(
                  ((exp.currentMonth - exp.monthlyAvg2024) /
                    exp.monthlyAvg2024) *
                    100
                )
              : 0;
          return (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-xs w-20 text-right shrink-0 text-[#4A5568]">
                {exp.name}
              </span>
              <div className="flex-1 h-[18px] bg-[#FDF8F6] rounded-[9px] overflow-hidden border border-warm-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(exp.percentOfRevenue / maxPct) * 100}%`,
                  }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                  className="h-full rounded-[9px]"
                  style={{ background: BAR_GRADIENTS[i] }}
                />
              </div>
              <span
                className="text-xs font-semibold text-[#2D3748] w-12 text-left tabular-nums font-mono"
                dir="ltr"
              >
                {exp.percentOfRevenue}%
              </span>
              <span
                className="text-[11px] w-14 text-left tabular-nums"
                style={{
                  color:
                    pctChange !== 0
                      ? getDeltaStatusColor(pctChange, { lowerIsBetter: true })
                      : "#A0AEC0",
                }}
                dir="ltr"
              >
                {pctChange !== 0
                  ? `${pctChange > 0 ? "▲" : "▼"} ${Math.abs(pctChange)}%`
                  : "—"}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Overview: Department Bars ──────────────────────────────────

function OverviewDepartmentBars({
  departments,
}: {
  departments: DepartmentSales[];
}) {
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
              style={{ color: getDeltaStatusColor(dept.yoyChangePercent) }}
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

// ─── Overview: Alerts & Targets ─────────────────────────────────
function AlertsTargetsCard({ report }: { report: Report }) {
  const kpis: {
    label: string;
    actual: number;
    target: number;
    lowerIsBetter?: boolean;
  }[] = [
    {
      label: "אחוז עלות שכר",
      actual: report.hr.salaryCostPercent,
      target: report.hr.salaryTarget,
      lowerIsBetter: true,
    },
    {
      label: "Eyedo משימות",
      actual: report.operations.qualityScore.current,
      target: report.operations.qualityScore.target,
    },
    {
      label: "מלאי גבוה",
      actual: report.compliance.highInventory.actual,
      target: report.compliance.highInventory.target,
      lowerIsBetter: true,
    },
    {
      label: "חותמות אדומות",
      actual: report.compliance.redAlerts.redSubscriptions,
      target: report.compliance.redAlerts.target,
      lowerIsBetter: true,
    },
    {
      label: "חסרי פעילות",
      actual: report.compliance.missingActivities.actual,
      target: report.compliance.missingActivities.fixedTarget,
      lowerIsBetter: true,
    },
    {
      label: "חזרות",
      actual: report.compliance.returns.actual,
      target: report.compliance.returns.target,
      lowerIsBetter: true,
    },
    {
      label: "פחת בשר %",
      actual: report.operations.meatWaste,
      target: 5,
      lowerIsBetter: true,
    },
    {
      label: "תלונות לקוח",
      actual: report.operations.customerComplaints.current,
      target: report.operations.customerComplaints.target,
      lowerIsBetter: true,
    },
  ];

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-[#2D3748]">
            התראות ויעדים
          </CardTitle>
          <div className="flex items-center gap-4 text-[11px] text-[#A0AEC0]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D3748]" />
              ביצוע
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-[#A0AEC0] border-dashed" />
              יעד
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {kpis.map((kpi, i) => {
          const statusColor = getTargetStatusColor(kpi.actual, kpi.target, {
            lowerIsBetter: kpi.lowerIsBetter,
          });
          const rawMax = Math.max(kpi.actual, kpi.target);
          const maxVal = rawMax > 0 ? rawMax * 1.15 : 1;
          const actualPct = (kpi.actual / maxVal) * 100;
          const targetPct = (kpi.target / maxVal) * 100;

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#4A5568]">{kpi.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span style={{ color: statusColor }}>
                    {statusColor === "#10B981"
                      ? "עמד"
                      : statusColor === "#FBBF24"
                        ? "קרוב"
                        : "לא עמד"}
                  </span>
                </span>
              </div>
              <div className="relative h-[14px] bg-[#FDF8F6] rounded-[7px] overflow-visible border border-warm-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${actualPct}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }}
                  className="absolute inset-y-0 start-0 rounded-[7px]"
                  style={{ background: statusColor }}
                />
                <div
                  className="absolute top-[-3px] bottom-[-3px] w-[2px] bg-[#4A5568] rounded-full"
                  style={{ insetInlineStart: `${targetPct}%` }}
                >
                  <div
                    className="absolute -top-4 start-1/2 -translate-x-1/2 text-[9px] font-mono text-[#A0AEC0] whitespace-nowrap"
                    dir="ltr"
                  >
                    {kpi.target}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-0.5">
                <span
                  className="text-[10px] font-mono text-[#4A5568]"
                  dir="ltr"
                >
                  {kpi.actual}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Overview: HR & Staffing Card ───────────────────────────────
function OverviewStaffingCard({ hr }: { hr: Report["hr"] }) {
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

function AIView({ report, branchId }: { report: Report; branchId: string }) {
  const { rows, isLoading, isStreaming, error, retry } = useAIAnalysis(
    branchId,
    report
  );
  return (
    <StoreAIBriefing
      rows={rows}
      isLoading={isLoading}
      isStreaming={isStreaming}
      error={error}
      onRetry={retry}
    />
  );
}

function OverviewView({
  report,
  branchId,
}: {
  report: Report;
  branchId: string;
}) {
  const { rows, isLoading, isStreaming, error, retry } = useAIAnalysis(
    branchId,
    report
  );
  const s = report.sales;
  const kpis: KPICardData[] = [
    {
      label: "מכירות סניף",
      value: s.total.current,
      format: "currencyShort",
      trend: s.total.vsTarget,
      trendLabel: `יעד: ${formatCurrencyShort(s.total.target)}`,
      target: s.total.target,
    },
    {
      label: "לקוחות",
      value: s.customers.current,
      format: "number",
      trend: s.customers.change,
      trendLabel: `סל ממוצע: ₪${s.avgBasket.current.toLocaleString()}`,
      target: s.customers.target,
    },
    {
      label: "לקוחות ליום",
      value: Math.round(s.customers.current / WORKING_DAYS_PER_MONTH),
      format: "number",
      trend: s.customers.change,
      trendLabel: `דירוג #${s.customers.ranking}`,
    },
    {
      label: "סל ממוצע",
      value: s.avgBasket.current,
      format: "currency",
      trend: s.avgBasket.change,
      trendLabel: "שנתי",
    },
  ];
  return (
    <div className="space-y-5">
      <StoreAIBriefing
        rows={rows}
        isLoading={isLoading}
        isStreaming={isStreaming}
        error={error}
        onRetry={retry}
      />

      <KPIGrid items={kpis} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <MonthlyComparisonChart data={report.monthly} />
        <BranchPerformanceCard report={report} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <OverviewExpenseTable expenses={report.expenses} />
        <OverviewDepartmentBars departments={report.departments} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <AlertsTargetsCard report={report} />
        <OverviewStaffingCard hr={report.hr} />
      </div>
    </div>
  );
}

function InventoryView({ report }: { report: Report }) {
  const ops = report.operations;
  const kpis: KPICardData[] = [
    {
      label: "ימי מלאי ממוצע",
      value: ops.avgDaysOfInventory.current,
      format: "number",
      trend:
        ops.avgDaysOfInventory.current <= ops.avgDaysOfInventory.target
          ? 0
          : -Math.round(
              ((ops.avgDaysOfInventory.current -
                ops.avgDaysOfInventory.target) /
                ops.avgDaysOfInventory.target) *
                100
            ),
      trendLabel: `יעד: ${ops.avgDaysOfInventory.target} ימים`,
      target: ops.avgDaysOfInventory.target,
      lowerIsBetter: true,
    },
    {
      label: "פריטי מלאי גבוה",
      value: report.compliance.highInventory.actual,
      format: "number",
      trend: report.compliance.highInventory.met ? 0 : -11.7,
      trendLabel: `יעד: ${report.compliance.highInventory.target}`,
      target: report.compliance.highInventory.target,
      lowerIsBetter: true,
    },
    {
      label: "חסרי פעילות",
      value: report.compliance.missingActivities.actual,
      format: "number",
      trend: -report.compliance.missingActivities.deviation,
      trendLabel: `יעד: ${report.compliance.missingActivities.timeTarget}`,
      target: report.compliance.missingActivities.fixedTarget,
      lowerIsBetter: true,
    },
  ];
  const target = ops.avgDaysOfInventory.target;
  const sorted = [...report.departments].sort(
    (a, b) => b.avgDaysOfInventory - a.avgDaysOfInventory
  );
  const maxDays = Math.max(...sorted.map((d) => d.avgDaysOfInventory));

  return (
    <>
      <KPIGrid items={kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-warm-divider text-[11px] text-[#A0AEC0]">
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
        <ComplianceCards compliance={report.compliance} />
      </div>
    </>
  );
}

function HRView({ report }: { report: Report }) {
  const hr = report.hr;
  const kpis: KPICardData[] = [
    {
      label: "תקן עובדים",
      value: hr.authorized,
      format: "number",
      trend: 0,
      trendLabel: "",
    },
    {
      label: "עובדים בפועל",
      value: hr.actual,
      format: "number",
      trend:
        hr.authorized > 0
          ? +(((hr.actual - hr.authorized) / hr.authorized) * 100).toFixed(2)
          : 0,
      trendLabel: "מעל תקן",
      target: hr.authorized,
    },
    {
      label: "עלות שכר",
      value: +hr.salaryCostPercent.toFixed(2),
      format: "percent",
      trend: 0.9,
      trendLabel: `יעד: ${hr.salaryTarget}%`,
      target: hr.salaryTarget,
      lowerIsBetter: true,
    },
    {
      label: "עלות שכר בש״ח",
      value: hr.salaryExpense.current,
      format: "currencyShort",
      trend:
        hr.salaryExpense.monthlyAvg2024 > 0
          ? +(
              ((hr.salaryExpense.current - hr.salaryExpense.monthlyAvg2024) /
                hr.salaryExpense.monthlyAvg2024) *
              100
            ).toFixed(1)
          : 0,
      trendLabel: "",
      lowerIsBetter: true,
    },
    {
      label: "תחלופה שנתית",
      value: Math.round(hr.turnoverRate),
      format: "number",
      trend: -2.3,
      trendLabel: `דירוג #${hr.turnoverRanking}`,
      lowerIsBetter: true,
    },
  ];
  return (
    <>
      <KPIGrid items={kpis} columns={5} />
      <StaffingSection hr={hr} />
    </>
  );
}

function DepartmentsView({ report }: { report: Report }) {
  const bestDept = report.departments.reduce((a, b) =>
    a.yoyChangePercent > b.yoyChangePercent ? a : b
  );
  const worstDept = report.departments.reduce((a, b) =>
    a.yoyChangePercent < b.yoyChangePercent ? a : b
  );
  const kpis: KPICardData[] = [
    {
      label: "מחלקות פעילות",
      value: report.departments.length,
      format: "number",
      trend: 0,
      trendLabel: "",
    },
    {
      label: `מוביל: ${bestDept.name}`,
      value: Math.round(bestDept.yoyChangePercent),
      format: "number",
      trend: bestDept.yoyChangePercent,
      trendLabel: "צמיחה",
    },
    {
      label: `נחלש: ${worstDept.name}`,
      value: Math.abs(Math.round(worstDept.yoyChangePercent)),
      format: "number",
      trend: worstDept.yoyChangePercent,
      trendLabel: "ירידה",
    },
  ];
  const growers = [...report.departments]
    .filter((d) => d.yoyChangePercent > 0)
    .sort((a, b) => b.yoyChangePercent - a.yoyChangePercent)
    .slice(0, 4);
  const decliners = [...report.departments]
    .filter((d) => d.yoyChangePercent < 0)
    .sort((a, b) => a.yoyChangePercent - b.yoyChangePercent)
    .slice(0, 4);
  const maxRows = Math.max(growers.length, decliners.length);

  return (
    <>
      <KPIGrid items={kpis} columns={3} />

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
              <p className="text-xs font-semibold text-[#c62828] mb-2">
                ▼ ירידה
              </p>
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
              <p className="text-xs font-semibold text-[#2e7d32] mb-2">
                ▲ צמיחה
              </p>
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

      <DepartmentBreakdown
        departments={report.departments}
        anomalies={detectAnomalies(
          report.departments,
          report.sales.total.yoyChange
        )}
      />
    </>
  );
}

function AlertsView({ report }: { report: Report }) {
  const kpis: KPICardData[] = [
    {
      label: "התראות אדומות",
      value: report.compliance.redAlerts.actual,
      format: "number",
      trend: -10,
      trendLabel: `יעד: ${report.compliance.redAlerts.target}`,
      target: report.compliance.redAlerts.target,
      lowerIsBetter: true,
    },
    {
      label: "חותמות אדומות",
      value: report.compliance.redAlerts.redSubscriptions,
      format: "number",
      trend: -report.compliance.redAlerts.rate,
      trendLabel: "",
      target: report.compliance.redAlerts.target,
      lowerIsBetter: true,
    },
    {
      label: "דיווחי מוקד",
      value: report.operations.focusReports.current,
      format: "number",
      trend: -50,
      trendLabel: `יעד: ${report.operations.focusReports.target}`,
      target: report.operations.focusReports.target,
    },
  ];
  return (
    <>
      <KPIGrid items={kpis} columns={3} />
      <ComplianceCards compliance={report.compliance} />
    </>
  );
}

const VIEW_TITLES: Record<string, string> = {
  inventory: "מלאי",
  hr: "כח אדם",
  departments: "מחלקות",

  alerts: "התראות",
  ai: "ניתוח AI",
};

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
function StoreManagerPage() {
  const { view } = Route.useSearch();
  const [selectedBranchId, setSelectedBranchId] = useState(HADERA_BRANCH_ID);

  const report = useMemo(
    () => getBranchReportOrFallback(selectedBranchId),
    [selectedBranchId]
  );

  const renderView = () => {
    switch (view) {
      case "inventory":
        return <InventoryView report={report} />;
      case "hr":
        return <HRView report={report} />;
      case "departments":
        return <DepartmentsView report={report} />;

      case "alerts":
        return <AlertsView report={report} />;
      case "ai":
        return <AIView report={report} branchId={selectedBranchId} />;
      default:
        return <OverviewView report={report} branchId={selectedBranchId} />;
    }
  };

  return (
    <PageContainer key={`${selectedBranchId}-${view}`}>
      {/* Branch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Select
            value={selectedBranchId}
            onValueChange={setSelectedBranchId}
            dir="rtl"
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="בחר סניף" />
            </SelectTrigger>
            <SelectContent>
              {branchOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs w-fit">
            {currentMonthYear()}
          </Badge>
        </div>
      </div>
      {view !== "overview" && (
        <h2 className="text-lg font-bold text-[#2D3748] text-center">
          {VIEW_TITLES[view] ?? ""}
        </h2>
      )}

      {/* Branch Info Header */}
      <BranchInfoBar info={report.info} />

      {/* View Content */}
      {renderView()}
    </PageContainer>
  );
}

export const Route = createFileRoute("/store-manager/")({
  component: StoreManagerPage,
  validateSearch: (search: Record<string, unknown>) => ({
    view: (search.view as string) || "overview",
  }),
});
