import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { KPI_STATUS } from "@/lib/colors";
import {
  getPromotionColor,
  getSalesColor,
  getSupplyColor,
  getUpliftColor,
} from "@/lib/kpi/resolvers";
import { UpliftChart } from "./UpliftChart";
import type { PromoMetrics } from "@/lib/promo-simulator/calc";
import type { ForecastSlice, SliceSetter } from "@/lib/promo-simulator/state";

interface Step5ForecastProps {
  forecast: ForecastSlice;
  metrics: PromoMetrics;
  onChange: SliceSetter<ForecastSlice>;
}

const LABEL = "text-[15px] font-medium text-[#4A5568] mb-1.5 block";
const INPUT_CLS =
  "flex h-10 w-full items-center rounded-[10px] border border-[#FFE8DE] bg-white px-3 py-2 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FDF8F6] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40 font-mono";

interface KpiCardProps {
  title: string;
  value: string;
  sub: string;
  accent?: string;
}

function KpiCard({
  title,
  value,
  sub,
  accent = KPI_STATUS.good,
}: KpiCardProps) {
  return (
    <Card className="border-[#FFE8DE] rounded-[16px]">
      <CardContent className="p-5 min-w-0">
        <p className="text-[15px] font-medium text-[#A0AEC0] uppercase tracking-wide whitespace-nowrap truncate">
          {title}
        </p>
        <p
          className="text-2xl font-bold font-mono mt-1 whitespace-nowrap truncate"
          style={{ color: accent }}
          dir="ltr"
        >
          {value}
        </p>
        <p
          className="text-[15px] text-[#4A5568] mt-1 whitespace-nowrap truncate"
          dir="ltr"
        >
          {sub}
        </p>
      </CardContent>
    </Card>
  );
}

export function Step5Forecast({
  forecast,
  metrics: m,
  onChange,
}: Step5ForecastProps) {
  const breakEvenStr = Number.isFinite(m.breakEvenUnits)
    ? formatNumber(m.breakEvenUnits)
    : "—";
  const coverageColor = getSupplyColor({ ratePercent: m.stockCoverage });
  const roiColor = getPromotionColor({ roiPercent: m.roi });
  const revenueColor = getSalesColor({
    actual: m.promoRevenue,
    target: m.baseRevenue,
  });
  const profitColor =
    m.baseProfit > 0
      ? getSalesColor({ actual: m.promoProfit, target: m.baseProfit })
      : m.promoProfit > 0
        ? KPI_STATUS.good
        : KPI_STATUS.bad;
  const upliftColor = getUpliftColor({ upliftPercent: forecast.upliftPct });
  const breakEvenColor = Number.isFinite(m.breakEvenUnits)
    ? m.breakEvenUnits > 0 && m.promoUnits > 0
      ? getSalesColor({
          actual: m.promoUnits,
          target: m.breakEvenUnits,
        })
      : KPI_STATUS.bad
    : KPI_STATUS.bad;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#FFE8DE] rounded-[16px]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#2D3748]">
              יעדים / תחזית
            </CardTitle>
            <p className="text-lg text-[#4A5568] text-balance">
              הזן את הנתונים הצפויים — ה-KPI יתעדכנו בזמן&nbsp;אמת
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={LABEL} htmlFor="f-base-units">
                מכר בסיסי צפוי (יחידות)
              </label>
              <input
                id="f-base-units"
                type="number"
                min={0}
                value={forecast.baseUnits}
                onChange={(e) =>
                  onChange({ baseUnits: Number(e.target.value) || 0 })
                }
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="f-unit-price">
                מחיר רגיל ליחידה
              </label>
              <input
                id="f-unit-price"
                type="number"
                min={0}
                step={0.1}
                value={forecast.unitPrice}
                onChange={(e) =>
                  onChange({ unitPrice: Number(e.target.value) || 0 })
                }
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="f-unit-cost">
                עלות ליחידה
              </label>
              <input
                id="f-unit-cost"
                type="number"
                min={0}
                step={0.1}
                value={forecast.unitCost}
                onChange={(e) =>
                  onChange({ unitCost: Number(e.target.value) || 0 })
                }
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={LABEL} htmlFor="f-uplift">
                  גידול צפוי במכר (%)
                </label>
                <span
                  className="text-xl font-mono font-bold"
                  style={{ color: "#DC4E59" }}
                  dir="ltr"
                >
                  {forecast.upliftPct}%
                </span>
              </div>
              <input
                id="f-uplift"
                type="range"
                min={0}
                max={80}
                step={1}
                value={forecast.upliftPct}
                onChange={(e) =>
                  onChange({ upliftPct: Number(e.target.value) })
                }
                className="w-full h-2 rounded-[5px] accent-[#DC4E59]"
                style={{
                  background: `linear-gradient(90deg, #DC4E59 0%, #DC4E59 ${(forecast.upliftPct / 80) * 100}%, #FFE8DE ${(forecast.upliftPct / 80) * 100}%, #FFE8DE 100%)`,
                }}
                dir="ltr"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="f-stock">
                מלאי זמין ליחידות
              </label>
              <input
                id="f-stock"
                type="number"
                min={0}
                value={forecast.stockUnits}
                onChange={(e) =>
                  onChange({ stockUnits: Number(e.target.value) || 0 })
                }
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          <KpiCard
            title="פדיון צפוי"
            value={formatCurrency(m.promoRevenue)}
            sub={`בסיס: ${formatCurrency(m.baseRevenue)}`}
            accent={revenueColor}
          />
          <KpiCard
            title="רווח גולמי צפוי"
            value={formatCurrency(m.promoProfit)}
            sub={`בסיס: ${formatCurrency(m.baseProfit)}`}
            accent={profitColor}
          />
          <KpiCard
            title="יחידות במבצע"
            value={formatNumber(m.promoUnits)}
            sub="כולל uplift"
            accent={upliftColor}
          />
          <KpiCard
            title="Break-even"
            value={breakEvenStr}
            sub="יחידות לאיזון"
            accent={breakEvenColor}
          />
          <KpiCard
            title="ROI"
            value={`${m.roi}%`}
            sub="אומדן מול השקעה"
            accent={roiColor}
          />
          <KpiCard
            title="כיסוי מלאי"
            value={`${m.stockCoverage}%`}
            sub="מלאי מול תחזית"
            accent={coverageColor}
          />
        </div>
      </div>

      <UpliftChart metrics={m} durationWeeks={forecast.durationWeeks} />
    </div>
  );
}
