import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { AlertTriangle, ArrowRight, CheckCircle2, Package } from "lucide-react";
import { motion } from "motion/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import {
  TimePeriodFilter,
  type TimePeriod,
} from "@/components/dashboard/TimePeriodFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSupplierCurrentMonthToDatePeriod,
  getSupplierPerformance,
} from "@/data/mock-supplier-performance";
import { formatCurrencyShort } from "@/lib/format";
import type { KPICardData } from "@/data/types";

function TargetDot(props: {
  cx?: number;
  cy?: number;
  payload?: { sales: number; target: number };
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const above = payload.sales >= payload.target;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={above ? "#2EC4D5" : "#DC4E59"}
      stroke="#fff"
      strokeWidth={2}
    />
  );
}

function SupplierDrillDown() {
  const { supplierId } = Route.useParams();
  const [period, setPeriod] = useState<TimePeriod>(
    getSupplierCurrentMonthToDatePeriod()
  );
  const performance = useMemo(
    () => getSupplierPerformance(supplierId, period),
    [supplierId, period]
  );

  if (!performance) {
    return (
      <PageContainer>
        <Breadcrumbs
          items={[{ label: "ניהול סחר", to: "/category-manager" }]}
        />
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-[#2D3748]">הספק לא נמצא</h2>
          <p className="mt-2 text-[#4A5568]">
            הספק &quot;{decodeURIComponent(supplierId)}&quot; לא קיים במערכת
          </p>
        </div>
      </PageContainer>
    );
  }

  const {
    supplier,
    totalSales,
    totalTargetSales,
    targetAchievement,
    grossProfitPercent,
    grossProfitTargetPercent,
    grossProfitGap,
    networkGrowthPercent,
    supplierGrowthPercent,
    activeCategoryCount,
    productCount,
    categoryMix,
    monthlyTrend,
  } = performance;

  const kpis: KPICardData[] = [
    {
      label: "מכירות ספק",
      value: totalSales,
      format: "currencyShort",
      trend: +(targetAchievement - 100).toFixed(1),
      trendLabel: "מול יעד",
      target: totalTargetSales,
    },
    {
      label: "רווח גולמי",
      value: grossProfitPercent,
      format: "percent",
      trend: grossProfitGap,
      trendLabel: "פער מיעד",
      target: grossProfitTargetPercent,
    },
    {
      label: "צמיחה מול רשת",
      value: supplierGrowthPercent,
      format: "percent",
      trend: +(supplierGrowthPercent - networkGrowthPercent).toFixed(1),
      trendLabel: "פער מהרשת",
    },
    {
      label: "קטגוריות פעילות",
      value: activeCategoryCount,
      format: "number",
      trend: productCount,
      trendLabel: "מוצרים מייצגים",
    },
  ];

  const urgentCategories = categoryMix.filter(
    (c) =>
      c.targetAchievement < 95 ||
      c.grossProfitPercent < c.grossProfitTargetPercent
  );

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "ניהול סחר", to: "/category-manager" },
          { label: "ספקים" },
          { label: supplier.name },
        ]}
      />

      <section className="rounded-[20px] border border-[#FFE8DE] bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <Link
              to="/category-manager"
              className="mb-4 inline-flex items-center gap-2 text-[15px] font-semibold text-[#DC4E59] transition-colors hover:text-[#c9444f]"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לניהול סחר
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#DC4E59]/10 text-[#DC4E59]">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[13px] font-semibold tracking-[0.12em] text-[#A0AEC0]">
                  SUPPLIER CONTROL
                </p>
                <h1 className="text-4xl font-bold text-[#2D3748]">
                  {supplier.name}
                </h1>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-[18px] leading-relaxed text-[#4A5568]">
              תמונת ספק לפי מכירות, עמידה ביעד, רווח גולמי ופיזור קטגוריות.
            </p>
          </div>
          <div className="relative z-40 w-full max-w-[360px] justify-self-start lg:justify-self-end">
            <TimePeriodFilter
              value={period}
              onChange={setPeriod}
              panelPlacement="bottom"
            />
          </div>
        </div>
      </section>

      <KPIGrid items={kpis} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
      >
        <Card className="rounded-[16px] border-[#FFE8DE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#2D3748]">
              מגמת מכירות מול יעד — {supplier.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div dir="ltr" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyTrend}
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
                    tickFormatter={(v: number) => formatCurrencyShort(v * 1000)}
                    tick={{ fontSize: 16, fill: "#A0AEC0" }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `₪${Number(value).toLocaleString()}K`,
                      name === "sales" ? "מכירות" : "יעד",
                    ]}
                    contentStyle={{
                      direction: "rtl",
                      borderRadius: "10px",
                      border: "1px solid #FFE8DE",
                      fontSize: 18,
                      color: "#2D3748",
                    }}
                    itemStyle={{ color: "#4A5568" }}
                    labelStyle={{ color: "#2D3748", fontWeight: 600 }}
                  />
                  <Legend
                    formatter={(v: string) => (
                      <span style={{ color: "#4A5568" }}>
                        {v === "sales" ? "מכירות" : "יעד"}
                      </span>
                    )}
                    iconType="plainline"
                    wrapperStyle={{ fontSize: 18, paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="rgba(220, 78, 89, 0.15)"
                    stroke="#DC4E59"
                    strokeWidth={2}
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#F6B93B"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={<TargetDot />}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr,360px]">
        <Card className="rounded-[16px] border-[#FFE8DE]">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-[#2D3748]">
              פיזור קטגוריות ומוצרים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full min-w-[720px] text-lg">
                <thead>
                  <tr className="border-b border-[#FFF0EA]">
                    <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                      קטגוריה
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                      מוצרים
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                      מכירות
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                      עמידה ביעד
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                      רווח גולמי
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryMix.map((category, i) => {
                    const targetOk = category.targetAchievement >= 100;
                    const marginOk =
                      category.grossProfitPercent >=
                      category.grossProfitTargetPercent;
                    return (
                      <motion.tr
                        key={category.categoryId}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-[#FFF0EA] transition-colors hover:bg-[#FDF8F6]"
                      >
                        <td className="px-3 py-3">
                          <Link
                            to="/category-manager/$categoryId"
                            params={{ categoryId: category.categoryId }}
                            className="font-semibold text-[#2D3748] underline decoration-[#DC4E59]/25 underline-offset-4 hover:text-[#DC4E59]"
                          >
                            {category.categoryName}
                          </Link>
                          <p className="mt-1 text-[14px] text-[#A0AEC0]">
                            {category.sharePercent}% מפעילות הספק
                          </p>
                        </td>
                        <td className="px-3 py-3 text-[#4A5568]">
                          {category.productExamples.join(", ")}
                        </td>
                        <td
                          className="px-3 py-3 font-mono font-bold text-[#2D3748]"
                          dir="ltr"
                        >
                          {formatCurrencyShort(category.sales)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className="rounded-full px-2.5 py-1 text-[15px] font-bold"
                            style={{
                              color: targetOk ? "#2EC4D5" : "#DC4E59",
                              backgroundColor: targetOk
                                ? "#2EC4D51A"
                                : "#DC4E591A",
                            }}
                          >
                            {category.targetAchievement.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className="rounded-full px-2.5 py-1 text-[15px] font-bold"
                            style={{
                              color: marginOk ? "#2EC4D5" : "#F6B93B",
                              backgroundColor: marginOk
                                ? "#2EC4D51A"
                                : "#F6B93B1F",
                            }}
                          >
                            {category.grossProfitPercent}% / יעד{" "}
                            {category.grossProfitTargetPercent}%
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[16px] border-[#FFE8DE]">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-[#2D3748]">
              דגשים לפעולה
            </CardTitle>
          </CardHeader>
          <CardContent>
            {urgentCategories.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="mb-3 h-10 w-10 text-[#2EC4D5]" />
                <p className="text-xl font-semibold text-[#2D3748]">
                  הספק עומד במדדי התקופה
                </p>
                <p className="mt-1 text-lg text-[#A0AEC0]">
                  אין פערי יעד או רווחיות חריגים.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentCategories.map((category) => (
                  <div
                    key={category.categoryId}
                    className="rounded-[16px] border border-[#FFE8DE] bg-[#FDF8F6] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-[#DC4E59]" />
                      <p className="font-bold text-[#2D3748]">
                        {category.categoryName}
                      </p>
                    </div>
                    <p className="mt-2 text-[16px] leading-relaxed text-[#4A5568]">
                      עמידה ביעד {category.targetAchievement.toFixed(1)}%, רווח
                      גולמי {category.grossProfitPercent}% מול יעד{" "}
                      {category.grossProfitTargetPercent}%.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

export const Route = createFileRoute("/category-manager/suppliers/$supplierId")(
  {
    component: SupplierDrillDown,
  }
);
