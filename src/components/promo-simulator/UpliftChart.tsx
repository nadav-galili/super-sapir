import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { PromoMetrics } from "@/lib/promo-simulator/calc";

interface UpliftChartProps {
  metrics: PromoMetrics;
  durationWeeks: number;
}

// Palette — warm orange (promo) + bright blue (base) + slate ink line.
const COLOR_PROMO = "#f18d62";
const COLOR_BASE = "#159fe6";
const COLOR_CUMULATIVE = "#1E293B";
const COLOR_GRID = "rgba(30, 41, 59, 0.07)";
const COLOR_AXIS = "#64748B";

const currencyFmt = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

export function UpliftChart({ metrics: m, durationWeeks }: UpliftChartProps) {
  const weeks = Math.max(1, durationWeeks || 2);
  const baseRevenuePerWeek = Math.round(m.baseRevenue / weeks);
  const promoRevenuePerWeek = Math.round(m.promoRevenue / weeks);

  const data = Array.from({ length: weeks }, (_, i) => {
    const cum = promoRevenuePerWeek * (i + 1);
    return {
      week: `שבוע ${i + 1}`,
      base: baseRevenuePerWeek,
      promo: promoRevenuePerWeek,
      cumulative: cum,
    };
  });

  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white p-6 shadow-[0_20px_40px_-28px_rgba(220,78,89,0.16)]">
      {/* Accent rule on start edge */}
      <span
        aria-hidden
        className="absolute inset-y-6 right-0 w-[3px] rounded-full"
        style={{ backgroundColor: COLOR_PROMO }}
      />

      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[15px] uppercase tracking-[0.14em] text-[#A0AEC0]">
            <TrendingUp className="h-4 w-4" />
            תחזית פדיון
          </div>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#2D3748]">
            פדיון שבועי לאורך הקמפיין
          </h3>
          <p className="mt-1 text-[16px] text-[#4A5568]">
            השוואת בסיס למבצע, ומצטבר לאורך{" "}
            <span dir="ltr" className="font-mono">
              {weeks}
            </span>{" "}
            שבועות
          </p>
        </div>

        {/* Compact legend chips — replaces Recharts default Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#4A5568]">
          <LegendChip dotClass="bg-[#159fe6]" label="בסיס" />
          <LegendChip dotClass="bg-[#f18d62]" label="מבצע" />
          <LegendChip
            dotClass=""
            label="מצטבר"
            customDot={
              <span
                aria-hidden
                className="inline-block h-[2px] w-4 rounded-full"
                style={{ backgroundColor: COLOR_CUMULATIVE }}
              />
            }
          />
        </div>
      </header>

      <div dir="ltr" className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 15, fill: "#4A5568" }}
              axisLine={{ stroke: COLOR_GRID }}
              tickLine={{ stroke: COLOR_GRID }}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`
              }
              tick={{ fontSize: 15, fill: COLOR_AXIS }}
              axisLine={{ stroke: COLOR_GRID }}
              tickLine={{ stroke: COLOR_GRID }}
              width={60}
            />
            <Tooltip
              cursor={{ fill: "rgba(241, 141, 98, 0.06)" }}
              formatter={(value, name) => {
                const label =
                  name === "base"
                    ? "בסיס"
                    : name === "promo"
                      ? "מבצע"
                      : "מצטבר";
                return [currencyFmt.format(Number(value)), String(label)];
              }}
              contentStyle={{
                direction: "rtl",
                borderRadius: "12px",
                border: "1px solid #E7E0D8",
                fontSize: 16,
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                boxShadow: "0 10px 24px -12px rgba(45, 55, 72, 0.16)",
              }}
              labelStyle={{
                color: "#2D3748",
                fontWeight: 600,
                fontFamily: "inherit",
                marginBottom: 4,
              }}
            />
            {/* Hide default Recharts legend — we render our own chips above */}
            <Legend content={() => null} />
            <Bar
              dataKey="base"
              fill={COLOR_BASE}
              radius={[4, 4, 0, 0]}
              animationDuration={600}
            />
            <Bar
              dataKey="promo"
              fill={COLOR_PROMO}
              radius={[4, 4, 0, 0]}
              animationDuration={700}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke={COLOR_CUMULATIVE}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3.5, fill: COLOR_CUMULATIVE, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: COLOR_CUMULATIVE, strokeWidth: 0 }}
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function LegendChip({
  dotClass,
  label,
  customDot,
}: {
  dotClass: string;
  label: string;
  customDot?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[20px] border border-[#E7E0D8] bg-[#FAF8F5] px-3 py-1">
      {customDot ?? (
        <span aria-hidden className={`h-2 w-2 rounded-full ${dotClass}`} />
      )}
      <span>{label}</span>
    </span>
  );
}
