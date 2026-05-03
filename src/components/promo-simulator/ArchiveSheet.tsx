import { motion } from "motion/react";
import {
  Archive,
  ArrowLeft,
  Calendar,
  Quote,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HistoricalPromotion } from "@/data/mock-promo-history";
import { generateHistoricalPromosForScope } from "@/data/mock-archive-generator";
import { findSubCategoryById, PROMO_GROUPS } from "@/data/mock-promo-taxonomy";
import { getSupplierById } from "@/data/mock-suppliers";
import { getUpliftColor } from "@/lib/kpi/resolvers";

interface ArchiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Promo-simulator Group id (e.g. "grocery"). Used as the broad lookup key. */
  groupId: string;
  /** Sub-category id selected in Step 1. The minimum scope to enable archive. */
  subcategoryId: string;
  /** Optional Supplier id — narrows results to that supplier × sub-category. */
  supplierId: string;
  /** Optional Series name — narrows further to that supplier × series. */
  series: string;
}

interface ArchiveScope {
  title: string;
  lookupKey: string;
  scopeChain: string;
}

function resolveScope(
  groupId: string,
  subcategoryId: string,
  supplierId: string,
  series: string
): ArchiveScope | null {
  const found = findSubCategoryById(subcategoryId);
  if (!found) return null;
  const groupName =
    PROMO_GROUPS.find((g) => g.id === groupId)?.nameHe ?? found.group.nameHe;
  const supplierName = supplierId
    ? (getSupplierById(supplierId)?.name ?? "")
    : "";

  const title = series || supplierName || found.subCategory.nameHe;

  const chainParts = [
    groupName,
    found.department.nameHe,
    found.category.nameHe,
    found.subCategory.nameHe,
    supplierName,
    series,
  ].filter(Boolean);

  return {
    title,
    lookupKey: groupName,
    scopeChain: chainParts.join(" · "),
  };
}

const numberFmt = new Intl.NumberFormat("he-IL");
const currencyFmt = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeEndDate(startIso: string, durationWeeks: number): string {
  const start = new Date(startIso);
  const end = new Date(
    start.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000
  );
  return formatDate(end.toISOString());
}

function outcomeAccent(outcome: HistoricalPromotion["outcome"]): string {
  if (outcome === "הצלחה") return "#10B981";
  if (outcome === "ממוצע") return "#FBBF24";
  return "#F43F5E";
}

function outcomePillStyle(outcome: HistoricalPromotion["outcome"]): {
  bg: string;
  fg: string;
} {
  if (outcome === "הצלחה")
    return { bg: "rgba(16, 185, 129, 0.10)", fg: "#047857" };
  if (outcome === "ממוצע")
    return { bg: "rgba(251, 191, 36, 0.14)", fg: "#B45309" };
  return { bg: "rgba(244, 63, 94, 0.10)", fg: "#BE123C" };
}

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

function SummaryRail({
  total,
  avgUplift,
  successRate,
}: {
  total: number;
  avgUplift: number;
  successRate: number;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4 border-y border-[#E7E0D8] py-5">
      <div>
        <div className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
          סה״כ מבצעים
        </div>
        <div
          dir="ltr"
          className="mt-1 font-mono text-4xl tracking-tight text-[#2D3748]"
        >
          {total}
        </div>
      </div>
      <div>
        <div className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
          אפליפט ממוצע
        </div>
        <div
          dir="ltr"
          className="mt-1 font-mono text-4xl tracking-tight"
          style={{ color: getUpliftColor({ upliftPercent: avgUplift }) }}
        >
          {avgUplift >= 0 ? "+" : ""}
          {avgUplift.toFixed(1)}%
        </div>
      </div>
      <div>
        <div className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
          שיעור הצלחה
        </div>
        <div
          dir="ltr"
          className="mt-1 font-mono text-4xl tracking-tight text-[#2D3748]"
        >
          {successRate.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

function HistoricalPromoCard({ promo }: { promo: HistoricalPromotion }) {
  const endDate = computeEndDate(promo.startDate, promo.durationWeeks);
  const upliftColor = getUpliftColor({ upliftPercent: promo.upliftPct });
  const accent = outcomeAccent(promo.outcome);
  const pill = outcomePillStyle(promo.outcome);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
    >
      <Card className="relative h-full overflow-hidden rounded-[16px] border-[#E7E0D8] bg-white shadow-[0_20px_40px_-24px_rgba(220,78,89,0.18)]">
        {/* Accent bar on RTL-start (right) edge */}
        <span
          aria-hidden
          className="absolute inset-y-0 right-0 w-[3px]"
          style={{ backgroundColor: accent }}
        />

        <CardContent className="px-6 py-5">
          <header className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-2xl font-bold tracking-tight text-[#2D3748]">
                {promo.name}
              </h4>
              {promo.product ? (
                <div className="mt-1 text-[16px] text-[#4A5568]">
                  {promo.product}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-[20px] border-[#E7E0D8] bg-[#FAF8F5] px-3 py-1 text-[15px] font-medium text-[#4A5568]"
              >
                {promo.promoType}
              </Badge>
              <Badge
                className="rounded-[20px] border-transparent px-3 py-1 text-[15px] font-semibold"
                style={{ backgroundColor: pill.bg, color: pill.fg }}
              >
                {promo.outcome}
              </Badge>
            </div>
          </header>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#4A5568]">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#788390]" />
              <span dir="ltr" className="font-mono">
                {formatDate(promo.startDate)} — {endDate}
              </span>
            </span>
            <span className="h-1 w-1 rounded-full bg-[#788390]" aria-hidden />
            <span>
              משך{" "}
              <span dir="ltr" className="font-mono">
                {promo.durationWeeks}
              </span>{" "}
              שבועות
            </span>
            <span className="h-1 w-1 rounded-full bg-[#788390]" aria-hidden />
            <span>
              הנחה{" "}
              <span dir="ltr" className="font-mono">
                {promo.discountPct}%
              </span>
            </span>
          </div>

          <div className="mt-4 grid items-end gap-4 md:grid-cols-[minmax(0,150px)_1fr]">
            <div>
              <div className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
                אפליפט
              </div>
              <div
                dir="ltr"
                className="mt-1 flex items-baseline gap-1 font-mono text-4xl font-bold tracking-tight"
                style={{ color: upliftColor }}
              >
                <TrendingUp className="h-5 w-5" aria-hidden />
                <span>
                  {promo.upliftPct >= 0 ? "+" : ""}
                  {promo.upliftPct.toFixed(1)}
                  <span className="text-xl font-semibold">%</span>
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-3 divide-x divide-[#E7E0D8] rtl:divide-x-reverse">
              <div className="px-3 first:ps-0">
                <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
                  יחידות
                </dt>
                <dd
                  dir="ltr"
                  className="mt-1 flex items-center gap-1 font-mono text-lg font-semibold text-[#2D3748]"
                >
                  <span className="text-[#788390]">
                    {numberFmt.format(promo.baseUnits)}
                  </span>
                  <ArrowLeft className="h-3 w-3 text-[#788390]" />
                  <span>{numberFmt.format(promo.actualUnits)}</span>
                </dd>
              </div>
              <div className="px-3">
                <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
                  פדיון
                </dt>
                <dd
                  dir="ltr"
                  className="mt-1 font-mono text-lg font-semibold text-[#2D3748]"
                >
                  {currencyFmt.format(promo.revenue)}
                </dd>
              </div>
              <div className="px-3">
                <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
                  ROI
                </dt>
                <dd
                  dir="ltr"
                  className="mt-1 font-mono text-lg font-semibold text-[#2D3748]"
                >
                  {promo.roi.toFixed(1)}x
                </dd>
              </div>
            </dl>
          </div>

          <figure className="mt-5 flex gap-3 border-s-2 border-[#DC4E59]/30 ps-4">
            <Quote className="mt-1 h-4 w-4 shrink-0 rotate-180 text-[#DC4E59]/50" />
            <blockquote className="text-[16px] italic leading-relaxed text-[#4A5568]">
              {promo.learnings}
            </blockquote>
          </figure>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ArchiveSheet({
  open,
  onOpenChange,
  groupId,
  subcategoryId,
  supplierId,
  series,
}: ArchiveSheetProps) {
  const scope = resolveScope(groupId, subcategoryId, supplierId, series);

  if (!scope) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-full sm:max-w-[1080px] h-screen max-h-screen overflow-y-auto p-0 bg-[#FAF8F5]"
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <Archive className="h-10 w-10 text-[#788390]" />
            <div className="text-2xl font-bold tracking-tight text-[#2D3748]">
              בחר תת-קטגוריה תחילה
            </div>
            <div className="text-lg text-[#4A5568]">
              הארכיון מציג מבצעים קודמים ברזולוציה הנמוכה ביותר שנבחרה.
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const promotions: HistoricalPromotion[] = generateHistoricalPromosForScope({
    subcategoryId,
    supplierId,
    series,
  });

  const avgUplift =
    promotions.length > 0
      ? promotions.reduce((s, p) => s + p.upliftPct, 0) / promotions.length
      : 0;
  const successCount = promotions.filter((p) => p.outcome === "הצלחה").length;
  const successRate =
    promotions.length > 0 ? (successCount / promotions.length) * 100 : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-[1080px] h-screen max-h-screen overflow-y-auto p-0 bg-[#FAF8F5]"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="px-8 pb-20 pt-10 md:px-12"
        >
          <motion.header
            variants={item}
            className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-[20px] border border-[#E7E0D8] bg-white/60 px-3 py-1 text-[15px] font-medium text-[#DC4E59] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur">
                <Archive className="h-4 w-4" />
                ארכיון מבצעים
              </div>
              <h2 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-[#2D3748]">
                {scope.title}
              </h2>
              <p className="mt-3 max-w-[64ch] text-lg leading-relaxed text-[#4A5568]">
                מבצעים קודמים בסקופ:{" "}
                <span className="font-semibold text-[#2D3748]">
                  {scope.scopeChain}
                </span>
                . מה עבד, מה לא, ומה ניתן ללמוד.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-[20px] border border-[#E7E0D8] bg-white px-4 py-2 text-[15px] text-[#4A5568] shadow-[0_1px_0_rgba(220,78,89,0.04)]">
              <Sparkles className="h-4 w-4 text-[#DC4E59]" />
              <span dir="ltr" className="font-mono font-semibold">
                {promotions.length}
              </span>
              <span>רשומות בארכיון</span>
            </div>
          </motion.header>

          <motion.div variants={item} className="mt-8">
            <SummaryRail
              total={promotions.length}
              avgUplift={avgUplift}
              successRate={successRate}
            />
          </motion.div>

          <section className="mt-10">
            <div className="mb-5 flex items-baseline justify-between">
              <div>
                <h3 className="text-3xl font-bold tracking-tight text-[#2D3748]">
                  מבצעים קודמים
                </h3>
                <p className="mt-1 text-[16px] text-[#788390]">
                  ממוין לפי רלוונטיות — התאמות מוצר מופיעות ראשונות
                </p>
              </div>
            </div>

            {promotions.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#E7E0D8] bg-white/60 px-6 py-14 text-center">
                <Archive className="mx-auto h-8 w-8 text-[#788390]" />
                <div className="mt-3 text-lg text-[#4A5568]">
                  אין מבצעים היסטוריים זמינים לקטגוריה זו.
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {promotions.map((p) => (
                  <HistoricalPromoCard key={p.id} promo={p} />
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
