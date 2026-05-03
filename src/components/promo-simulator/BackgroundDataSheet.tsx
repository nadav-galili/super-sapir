import { motion } from "motion/react";
import {
  BarChart3,
  Database,
  Minus,
  Quote,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type {
  CategoryKpi,
  HistoricalPromotion,
  KpiStatus,
  KpiTrend,
} from "@/data/mock-promo-history";
import {
  generateHistoricalPromosForScope,
  generateKpisForScope,
} from "@/data/mock-archive-generator";
import { findSubCategoryById } from "@/data/mock-promo-taxonomy";
import { getSupplierById } from "@/data/mock-suppliers";

interface BackgroundDataSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sub-category id — minimum scope to populate the sheet. */
  subcategoryId: string;
  /** Optional supplier id — refines the KPI snapshot to that supplier. */
  supplierId: string;
  /** Optional series — refines further. */
  series: string;
}

const STATUS_COLOR: Record<KpiStatus, string> = {
  good: "#10B981",
  warning: "#FBBF24",
  bad: "#F43F5E",
};

const OUTCOME_STATUS: Record<HistoricalPromotion["outcome"], KpiStatus> = {
  הצלחה: "good",
  ממוצע: "warning",
  "תת-ביצוע": "bad",
};

const numberFormatter = new Intl.NumberFormat("he-IL");
const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 22 },
  },
};

function TrendIcon({ trend, color }: { trend: KpiTrend; color: string }) {
  const props = { size: 18, color, strokeWidth: 2.25 };
  if (trend === "up") return <TrendingUp {...props} />;
  if (trend === "down") return <TrendingDown {...props} />;
  return <Minus {...props} />;
}

function getUpliftStatus(upliftPct: number): KpiStatus {
  if (upliftPct >= 30) return "good";
  if (upliftPct >= 15) return "warning";
  return "bad";
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Featured KPI — asymmetric hero treatment, no card boundary.
function FeaturedKpi({ kpi }: { kpi: CategoryKpi }) {
  const color = STATUS_COLOR[kpi.status];
  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white p-8 shadow-[0_24px_48px_-28px_rgba(220,78,89,0.22)]"
    >
      {/* Accent rule on start edge */}
      <span
        aria-hidden
        className="absolute inset-y-6 right-0 w-[3px] rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-2 text-[15px] uppercase tracking-[0.14em] text-[#788390]">
        <BarChart3 className="h-4 w-4" />
        מדד מוביל
      </div>
      <div className="mt-3 text-xl font-semibold text-[#4A5568]">
        {kpi.label}
      </div>
      <div
        dir="ltr"
        className="mt-4 font-mono text-6xl font-bold leading-none tracking-tight"
        style={{ color }}
      >
        {kpi.value}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[16px] text-[#4A5568]">
        <span className="inline-flex items-center gap-1.5">
          <TrendIcon trend={kpi.trend} color={color} />
          {kpi.trendDelta}
        </span>
        {kpi.benchmark ? (
          <>
            <span className="h-1 w-1 rounded-full bg-[#788390]" aria-hidden />
            <span className="text-[#788390]">{kpi.benchmark}</span>
          </>
        ) : null}
      </div>
      <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-[#4A5568]">
        {kpi.description}
      </p>
    </motion.div>
  );
}

// Compact KPI — thinner treatment, still clearly grouped.
function CompactKpi({ kpi }: { kpi: CategoryKpi }) {
  const color = STATUS_COLOR[kpi.status];
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white p-6"
    >
      <span
        aria-hidden
        className="absolute inset-y-5 right-0 w-[2px] rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="text-[15px] font-medium text-[#4A5568]">{kpi.label}</div>
      <div
        dir="ltr"
        className="mt-2 font-mono text-4xl font-bold tracking-tight"
        style={{ color }}
      >
        {kpi.value}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[15px] text-[#4A5568]">
        <TrendIcon trend={kpi.trend} color={color} />
        <span>{kpi.trendDelta}</span>
      </div>
      {kpi.benchmark ? (
        <div className="mt-1 text-[15px] text-[#788390]">{kpi.benchmark}</div>
      ) : null}
      <p className="mt-3 text-[16px] leading-snug text-[#4A5568]">
        {kpi.description}
      </p>
    </motion.div>
  );
}

function PromoRow({ promo }: { promo: HistoricalPromotion }) {
  const endDate = addDays(promo.startDate, promo.durationWeeks * 7);
  const upliftStatus = getUpliftStatus(promo.upliftPct);
  const upliftColor = STATUS_COLOR[upliftStatus];
  const outcomeColor = STATUS_COLOR[OUTCOME_STATUS[promo.outcome]];

  return (
    <motion.article
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white p-7"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 w-[3px]"
        style={{ backgroundColor: outcomeColor }}
      />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-2xl font-bold tracking-tight text-[#2D3748]">
            {promo.name}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[15px]">
            <span className="rounded-[20px] bg-[#F1EBE3] px-3 py-1 font-medium text-[#DC4E59]">
              {promo.promoType}
            </span>
            <span dir="ltr" className="font-mono text-[#4A5568]">
              {promo.startDate} — {endDate}
            </span>
            <span className="text-[#788390]">·</span>
            <span dir="ltr" className="font-mono text-[#4A5568]">
              −{promo.discountPct}%
            </span>
          </div>
        </div>
        <span
          className="rounded-[20px] px-3 py-1 text-[15px] font-semibold"
          style={{
            backgroundColor: `${outcomeColor}1A`,
            color: outcomeColor,
          }}
        >
          {promo.outcome}
        </span>
      </header>

      <dl className="mt-6 grid grid-cols-2 divide-x divide-[#E7E0D8] rtl:divide-x-reverse md:grid-cols-4">
        <div className="px-4 first:ps-0">
          <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
            יחידות
          </dt>
          <dd
            dir="ltr"
            className="mt-1 flex items-center gap-1.5 font-mono text-xl font-semibold text-[#2D3748]"
          >
            <span className="text-[#788390]">
              {numberFormatter.format(promo.baseUnits)}
            </span>
            <span className="text-[#788390]">→</span>
            <span>{numberFormatter.format(promo.actualUnits)}</span>
          </dd>
        </div>
        <div className="px-4">
          <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
            אפליפט
          </dt>
          <dd
            dir="ltr"
            className="mt-1 font-mono text-xl font-bold"
            style={{ color: upliftColor }}
          >
            +{promo.upliftPct.toFixed(1)}%
          </dd>
        </div>
        <div className="px-4">
          <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
            פדיון
          </dt>
          <dd
            dir="ltr"
            className="mt-1 font-mono text-xl font-semibold text-[#2D3748]"
          >
            {currencyFormatter.format(promo.revenue)}
          </dd>
        </div>
        <div className="px-4">
          <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
            ROI
          </dt>
          <dd
            dir="ltr"
            className="mt-1 font-mono text-xl font-semibold text-[#2D3748]"
          >
            {promo.roi.toFixed(1)}x
          </dd>
        </div>
      </dl>

      <figure className="mt-5 flex gap-3 border-s-2 border-[#DC4E59]/30 ps-4">
        <Quote className="mt-1 h-4 w-4 shrink-0 rotate-180 text-[#DC4E59]/50" />
        <blockquote className="text-lg italic leading-relaxed text-[#4A5568]">
          {promo.learnings}
        </blockquote>
      </figure>
    </motion.article>
  );
}

export function BackgroundDataSheet({
  open,
  onOpenChange,
  subcategoryId,
  supplierId,
  series,
}: BackgroundDataSheetProps) {
  const found = findSubCategoryById(subcategoryId);
  const hasScope = Boolean(found);
  const subName = found?.subCategory.nameHe ?? "";
  const supplierName = supplierId
    ? (getSupplierById(supplierId)?.name ?? "")
    : "";
  const headerTitle = series || supplierName || subName;

  const kpis = hasScope
    ? generateKpisForScope({ subcategoryId, supplierId, series })
    : [];
  const promos = hasScope
    ? generateHistoricalPromosForScope({
        subcategoryId,
        supplierId,
        series,
      }).slice(0, 2)
    : [];

  const [heroKpi, ...restKpis] = kpis;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-[860px] h-screen max-h-screen overflow-y-auto p-0 bg-[#FAF8F5]"
      >
        {!hasScope ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <Database className="h-10 w-10 text-[#788390]" />
            <div className="text-2xl font-bold tracking-tight text-[#2D3748]">
              בחר תת-קטגוריה תחילה
            </div>
            <div className="text-lg text-[#4A5568]">
              המסך מציג את ה-KPI-ים המובילים ומבצעים היסטוריים לדוגמה.
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="px-8 pb-20 pt-10 md:px-12"
          >
            {/* Asymmetric header */}
            <motion.header
              variants={item}
              className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-[20px] border border-[#E7E0D8] bg-white/60 px-3 py-1 text-[15px] font-medium text-[#DC4E59] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur">
                  <Database className="h-4 w-4" />
                  נתונים / רקע
                </div>
                <h2 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-[#2D3748]">
                  {headerTitle}
                </h2>
                <p className="mt-3 max-w-[64ch] text-lg leading-relaxed text-[#4A5568]">
                  המדדים המובילים שמנהלי המחלקה עוקבים אחריהם
                  {supplierName ? ` עבור ${supplierName}` : ""}
                  {series ? ` בסדרת ${series}` : ""}, עם מבצעים היסטוריים כהפניה
                  מהירה.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-[20px] border border-[#E7E0D8] bg-white px-4 py-2 text-[15px] text-[#4A5568]">
                <span dir="ltr" className="font-mono font-semibold">
                  {kpis.length}
                </span>
                <span>KPI-ים ·</span>
                <span dir="ltr" className="font-mono font-semibold">
                  {promos.length}
                </span>
                <span>מבצעים</span>
              </div>
            </motion.header>

            {/* KPIs — asymmetric bento: hero + compact grid */}
            <section className="mt-10">
              <div className="mb-5">
                <h3 className="text-3xl font-bold tracking-tight text-[#2D3748]">
                  מדדים מובילים
                </h3>
                <p className="mt-1 text-[16px] text-[#788390]">
                  ממוין לפי רלוונטיות — המדד המשפיע ביותר על ביצועי הקטגוריה
                </p>
              </div>

              {kpis.length === 0 ? (
                <div className="rounded-[16px] border border-dashed border-[#E7E0D8] bg-white/60 px-6 py-14 text-center text-lg text-[#788390]">
                  אין מדדים זמינים.
                </div>
              ) : (
                <div className="space-y-5">
                  {heroKpi ? <FeaturedKpi kpi={heroKpi} /> : null}
                  {restKpis.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {restKpis.map((k) => (
                        <CompactKpi key={k.id} kpi={k} />
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </section>

            {/* Historical promos */}
            <section className="mt-12">
              <div className="mb-5">
                <h3 className="text-3xl font-bold tracking-tight text-[#2D3748]">
                  מבצעים היסטוריים לדוגמה
                </h3>
                <p className="mt-1 text-[16px] text-[#788390]">
                  התאמות קרובות לקטגוריה —{" "}
                  <span dir="ltr" className="font-mono">
                    {promos.length}
                  </span>{" "}
                  מבצעים
                </p>
              </div>

              {promos.length === 0 ? (
                <div className="rounded-[16px] border border-dashed border-[#E7E0D8] bg-white/60 px-6 py-14 text-center text-lg text-[#788390]">
                  אין מבצעים היסטוריים זמינים בקטגוריה זו.
                </div>
              ) : (
                <div className="space-y-5">
                  {promos.map((promo) => (
                    <PromoRow key={promo.id} promo={promo} />
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
