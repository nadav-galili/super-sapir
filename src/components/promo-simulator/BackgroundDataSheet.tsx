import { motion } from "motion/react";
import {
  BarChart3,
  Database,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type {
  CategoryKpi,
  KpiStatus,
  KpiTrend,
} from "@/data/mock-promo-history";
import {
  generateKpisForScope,
  generateSalesSnapshotForScope,
  type SalesSnapshot,
} from "@/data/mock-archive-generator";
import { findSubCategoryById } from "@/data/mock-promo-taxonomy";
import { getSupplierById } from "@/data/mock-suppliers";
import { getGrowthColor } from "@/lib/kpi/resolvers";

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

const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 1,
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

function TrendIcon({
  trend,
  color,
  size = 18,
}: {
  trend: KpiTrend;
  color: string;
  size?: number;
}) {
  const props = { size, color, strokeWidth: 2.25 };
  if (trend === "up") return <TrendingUp {...props} />;
  if (trend === "down") return <TrendingDown {...props} />;
  return <Minus {...props} />;
}

function trendOf(deltaPct: number): KpiTrend {
  if (deltaPct >= 0.5) return "up";
  if (deltaPct <= -0.5) return "down";
  return "flat";
}

function formatDeltaPct(deltaPct: number): string {
  const sign = deltaPct >= 0 ? "+" : "";
  return `${sign}${deltaPct.toFixed(1)}%`;
}

// ── Scope label helpers ───────────────────────────────────────────────

function focusLabelForScope({
  series,
  supplierName,
}: {
  series: string;
  supplierName: string;
}): string {
  if (series) return "הסדרה";
  if (supplierName) return "הספק";
  return "תת-הקטגוריה";
}

function shareLabelForScope({
  series,
}: {
  series: string;
  supplierName: string;
}): string {
  if (series) return "נתח הסדרה מתת-הקטגוריה";
  return "נתח הספק מתת-הקטגוריה";
}

// ── YTD hero card — primary (₪) + comparison line + colored delta ─────

function YtdHeroCard({ snapshot }: { snapshot: SalesSnapshot }) {
  const deltaPct =
    snapshot.scopeYtdPriorYear === 0
      ? 0
      : ((snapshot.scopeYtdCurrent - snapshot.scopeYtdPriorYear) /
          snapshot.scopeYtdPriorYear) *
        100;
  const color = getGrowthColor({ changePercent: deltaPct });
  const trend = trendOf(deltaPct);

  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white p-5 shadow-[0_18px_36px_-24px_rgba(220,78,89,0.18)]"
    >
      <span
        aria-hidden
        className="absolute inset-y-4 right-0 w-[3px] rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-2 text-[15px] uppercase tracking-[0.14em] text-[#788390]">
        <BarChart3 className="h-4 w-4" />
        סה״כ מכר YTD · ינו׳–מאי 2026
      </div>

      <div
        dir="ltr"
        className="mt-3 font-mono text-5xl font-bold leading-none tracking-tight"
        style={{ color }}
      >
        {currencyFormatter.format(snapshot.scopeYtdCurrent)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#F1EBE3] pt-3">
        <div className="text-[16px] text-[#4A5568]">
          <span className="text-[#788390]">ינו׳–מאי 2025: </span>
          <span dir="ltr" className="font-mono font-semibold">
            {currencyFormatter.format(snapshot.scopeYtdPriorYear)}
          </span>
        </div>
        <div
          className="inline-flex items-center gap-1.5 text-[18px] font-semibold"
          style={{ color }}
        >
          <TrendIcon trend={trend} color={color} size={20} />
          {formatDeltaPct(deltaPct)}
        </div>
      </div>
    </motion.div>
  );
}

// ── Last-month YoY card (compact) ─────────────────────────────────────

function LastMonthCard({ snapshot }: { snapshot: SalesSnapshot }) {
  const deltaPct =
    snapshot.scopeMonthPriorYear === 0
      ? 0
      : ((snapshot.scopeMonthCurrent - snapshot.scopeMonthPriorYear) /
          snapshot.scopeMonthPriorYear) *
        100;
  const color = getGrowthColor({ changePercent: deltaPct });
  const trend = trendOf(deltaPct);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white p-4"
    >
      <span
        aria-hidden
        className="absolute inset-y-4 right-0 w-[2px] rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="text-[15px] font-medium text-[#4A5568]">
        מכר אפריל 2026
      </div>
      <div
        dir="ltr"
        className="mt-2 font-mono text-3xl font-bold tracking-tight"
        style={{ color }}
      >
        {currencyFormatter.format(snapshot.scopeMonthCurrent)}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[15px] text-[#4A5568]">
        <TrendIcon trend={trend} color={color} size={16} />
        <span>
          {formatDeltaPct(deltaPct)}{" "}
          <span className="text-[#788390]">vs אפריל 2025</span>
        </span>
      </div>
    </motion.div>
  );
}

// ── Share-of-sub-category card (compact, neutral color) ───────────────

function ShareCard({
  snapshot,
  label,
}: {
  snapshot: SalesSnapshot;
  label: string;
}) {
  const share =
    snapshot.subCategoryYtdCurrent === 0
      ? 0
      : snapshot.scopeYtdCurrent / snapshot.subCategoryYtdCurrent;

  // Share is descriptive (no target) — accent in primary, not status colors.
  const accent = "#DC4E59";

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white p-4"
    >
      <span
        aria-hidden
        className="absolute inset-y-4 right-0 w-[2px] rounded-full"
        style={{ backgroundColor: accent }}
      />
      <div className="text-[15px] font-medium text-[#4A5568]">{label}</div>
      <div
        dir="ltr"
        className="mt-2 font-mono text-3xl font-bold tracking-tight"
        style={{ color: accent }}
      >
        {percentFormatter.format(share)}
      </div>
      <div dir="ltr" className="mt-1.5 text-[15px] text-[#788390]">
        {currencyFormatter.format(snapshot.scopeYtdCurrent)} /{" "}
        {currencyFormatter.format(snapshot.subCategoryYtdCurrent)}
      </div>
    </motion.div>
  );
}

// ── Existing compact KPI tile (unchanged shape) ───────────────────────

function CompactKpi({ kpi }: { kpi: CategoryKpi }) {
  const color = STATUS_COLOR[kpi.status];
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white p-4"
    >
      <span
        aria-hidden
        className="absolute inset-y-4 right-0 w-[2px] rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="text-[15px] font-medium text-[#4A5568]">{kpi.label}</div>
      <div
        dir="ltr"
        className="mt-2 font-mono text-3xl font-bold tracking-tight"
        style={{ color }}
      >
        {kpi.value}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[15px] text-[#4A5568]">
        <TrendIcon trend={kpi.trend} color={color} size={16} />
        <span>{kpi.trendDelta}</span>
      </div>
      {kpi.benchmark ? (
        <div className="mt-0.5 text-[15px] text-[#788390]">{kpi.benchmark}</div>
      ) : null}
    </motion.div>
  );
}

// ── Section heading ────────────────────────────────────────────────────

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <span className="text-[15px] uppercase tracking-[0.14em] text-[#DC4E59]">
        {eyebrow}
      </span>
      <span className="h-px flex-1 bg-[#F1EBE3]" aria-hidden />
      <h3 className="text-xl font-bold tracking-tight text-[#2D3748]">
        {title}
      </h3>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

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

  const snapshot = hasScope
    ? generateSalesSnapshotForScope({ subcategoryId, supplierId, series })
    : null;
  const kpis = hasScope
    ? generateKpisForScope({ subcategoryId, supplierId, series })
    : [];

  const showShareCard = Boolean(supplierId || series);
  const focusLabel = focusLabelForScope({ series, supplierName });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-[760px] h-screen max-h-screen overflow-hidden p-0 bg-[#FAF8F5]"
      >
        {!hasScope || !snapshot ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <Database className="h-10 w-10 text-[#788390]" />
            <div className="text-2xl font-bold tracking-tight text-[#2D3748]">
              בחר תת-קטגוריה תחילה
            </div>
            <div className="text-lg text-[#4A5568]">
              המסך מציג מכר YTD, חודש אחרון ונתח שוק לקטגוריה הנבחרת.
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="flex h-full flex-col px-6 py-5 md:px-8"
          >
            <motion.header variants={item} className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-[20px] border border-[#E7E0D8] bg-white/60 px-3 py-1 text-[15px] font-medium text-[#DC4E59] backdrop-blur">
                <Database className="h-4 w-4" />
                נתונים / רקע
              </div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#2D3748]">
                {headerTitle}
              </h2>
            </motion.header>

            {/* Hero — YTD vs LY */}
            <section className="mt-4">
              <YtdHeroCard snapshot={snapshot} />
            </section>

            {/* Block 1 — Focused (narrow scope) */}
            <section className="mt-4">
              <SectionHeading eyebrow="ממוקד" title={focusLabel} />
              <div className="grid gap-3 md:grid-cols-2">
                <LastMonthCard snapshot={snapshot} />
                {showShareCard ? (
                  <ShareCard
                    snapshot={snapshot}
                    label={shareLabelForScope({ series, supplierName })}
                  />
                ) : null}
              </div>
            </section>

            {/* Block 2 — Sub-category context */}
            {kpis.length > 0 ? (
              <section className="mt-4">
                <SectionHeading
                  eyebrow="הקשר רחב יותר"
                  title="בנצ׳מרקים של תת-הקטגוריה"
                />
                <div className="grid gap-3 md:grid-cols-3">
                  {kpis.map((k) => (
                    <CompactKpi key={k.id} kpi={k} />
                  ))}
                </div>
              </section>
            ) : null}
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
