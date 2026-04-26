import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "motion/react";
import { Award, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyShort } from "@/lib/format";
import { CHART_COLORS } from "@/lib/colors";
import { SupplierLogo } from "@/components/dashboard/SupplierLogo";
import { getCategorySuppliers } from "@/data/mock-category-suppliers";

interface CategorySuppliersDashboardProps {
  categoryId: string;
  categoryName: string;
}

function SupplierKpiCard({
  title,
  icon,
  iconBg,
  accentColor,
  name,
  stats,
  delay,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
  name: string;
  stats: { label: string; value: string; color: string }[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.4,
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      whileHover={{ y: -3, boxShadow: `${accentColor}18 0px 8px 24px` }}
      className="rounded-[16px] bg-white border border-warm-border overflow-hidden cursor-default"
    >
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
        }}
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-lg ${iconBg}`}
          >
            {icon}
          </span>
          <h4 className="text-[20px] font-bold text-[#2D3748]">{title}</h4>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <SupplierLogo name={name} size={32} />
          <p className="text-xl font-bold text-[#2D3748]">{name}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-[15px] text-[#A0AEC0]">{s.label}</p>
              <p
                className="text-lg font-bold font-mono"
                style={{ color: s.color }}
                dir="ltr"
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function CategorySuppliersDashboard({
  categoryId,
  categoryName,
}: CategorySuppliersDashboardProps) {
  const suppliers = useMemo(
    () => getCategorySuppliers(categoryId),
    [categoryId]
  );

  const { bestMargin, worstTarget, highStockout } = useMemo(() => {
    if (suppliers.length === 0)
      return { bestMargin: null, worstTarget: null, highStockout: null };
    const bm = suppliers.reduce((best, s) =>
      s.grossProfitPercent > best.grossProfitPercent ? s : best
    );
    const wt = suppliers.reduce((worst, s) => {
      const wPct = worst.targetSales > 0 ? worst.sales / worst.targetSales : 1;
      const sPct = s.targetSales > 0 ? s.sales / s.targetSales : 1;
      return sPct < wPct ? s : worst;
    });
    const hs = suppliers.reduce((worst, s) =>
      s.stockoutRate > worst.stockoutRate ? s : worst
    );
    return { bestMargin: bm, worstTarget: wt, highStockout: hs };
  }, [suppliers]);

  const { chartData, maxSales } = useMemo(() => {
    const cd = suppliers.map((s) => ({
      name: s.name,
      sales: s.sales,
      target: s.targetSales,
    }));
    let max = 0;
    for (const s of suppliers) max = Math.max(max, s.sales, s.targetSales);
    return { chartData: cd, maxSales: max };
  }, [suppliers]);

  if (suppliers.length === 0) return null;

  return (
    <>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[#F6B93B]/10">
          <Award className="w-5 h-5 text-[#F6B93B]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#2D3748]">
            ספקים — {categoryName}
          </h2>
          <p className="text-[20px] text-[#A0AEC0] mt-0.5">
            {suppliers.length} ספקים פעילים בקטגוריה
          </p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#FFE8DE] to-transparent ms-3" />
      </motion.div>

      {/* KPI spotlight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {bestMargin && (
          <SupplierKpiCard
            title="רווחי ביותר"
            icon={<Award className="w-3.5 h-3.5 text-[#6C5CE7]" />}
            iconBg="bg-[#6C5CE7]/10"
            accentColor="#6C5CE7"
            name={bestMargin.name}
            delay={0.1}
            stats={[
              {
                label: "רווח גולמי",
                value: `${bestMargin.grossProfitPercent}%`,
                color: "#6C5CE7",
              },
              {
                label: "מכירות",
                value: formatCurrencyShort(bestMargin.sales),
                color: "#2D3748",
              },
            ]}
          />
        )}
        {worstTarget && (
          <SupplierKpiCard
            title="מפספס יעד"
            icon={<TrendingDown className="w-3.5 h-3.5 text-[#DC4E59]" />}
            iconBg="bg-[#DC4E59]/10"
            accentColor="#DC4E59"
            name={worstTarget.name}
            delay={0.15}
            stats={[
              {
                label: "עמידה ביעד",
                value: `${(worstTarget.targetSales > 0 ? (worstTarget.sales / worstTarget.targetSales) * 100 : 100).toFixed(1)}%`,
                color: "#DC4E59",
              },
              {
                label: "פער",
                value: formatCurrencyShort(
                  worstTarget.targetSales - worstTarget.sales
                ),
                color: "#DC4E59",
              },
            ]}
          />
        )}
        {highStockout && (
          <SupplierKpiCard
            title="חוסרים גבוהים"
            icon={<AlertTriangle className="w-3.5 h-3.5 text-[#F6B93B]" />}
            iconBg="bg-[#F6B93B]/10"
            accentColor="#F6B93B"
            name={highStockout.name}
            delay={0.2}
            stats={[
              {
                label: "שיעור חוסרים",
                value: `${highStockout.stockoutRate}%`,
                color: "#F6B93B",
              },
              {
                label: "פריטים",
                value: String(highStockout.productCount),
                color: "#2D3748",
              },
            ]}
          />
        )}
      </div>

      {/* Chart + Table side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart — sales vs target */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2D3748]">
                מכירות מול יעד — לפי ספק
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div dir="ltr" className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    barGap={2}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFF0EA" />
                    <XAxis dataKey="name" tick={{ fontSize: 16 }} />
                    <YAxis
                      tickFormatter={(v: number) => formatCurrencyShort(v)}
                      tick={{ fontSize: 16 }}
                      width={55}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        formatCurrencyShort(value as number),
                        name === "sales" ? "מכירות" : "יעד",
                      ]}
                      contentStyle={{
                        direction: "rtl",
                        borderRadius: "8px",
                        fontSize: 18,
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                      barSize={18}
                    >
                      {chartData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="target"
                      fill="#A0AEC0"
                      opacity={0.3}
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                      animationBegin={200}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Supplier table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2D3748]">
                פירוט ספקים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-lg">
                  <thead>
                    <tr className="border-b border-[#FFF0EA]">
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                        ספק
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                        מכירות
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                        יעד
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                        רווח %
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                        חוסרים
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                        פריטים
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((sup, i) => {
                      const targetPct =
                        sup.targetSales > 0
                          ? (sup.sales / sup.targetSales) * 100
                          : 100;
                      const hit = targetPct >= 100;
                      const barPct =
                        maxSales > 0 ? (sup.sales / maxSales) * 100 : 0;

                      return (
                        <motion.tr
                          key={sup.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.03 }}
                          className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <SupplierLogo name={sup.name} size={24} />
                              <span className="font-medium text-[#2D3748] text-[20px]">
                                {sup.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 min-w-[100px]">
                            <span
                              className="font-semibold font-mono text-[20px]"
                              dir="ltr"
                            >
                              {formatCurrencyShort(sup.sales)}
                            </span>
                            <div className="mt-1 h-1 w-full bg-[#FFF0EA] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${barPct}%` }}
                                transition={{
                                  duration: 0.6,
                                  delay: 0.2 + i * 0.05,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`font-semibold font-mono text-[20px] ${hit ? "text-[#2EC4D5]" : "text-[#DC4E59]"}`}
                              dir="ltr"
                            >
                              {targetPct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-mono text-[20px]" dir="ltr">
                              {sup.grossProfitPercent}%
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`font-mono text-[20px] ${sup.stockoutRate > 3 ? "text-[#DC4E59] font-semibold" : ""}`}
                              dir="ltr"
                            >
                              {sup.stockoutRate}%
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-[20px] text-[#4A5568]">
                            {sup.productCount}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
