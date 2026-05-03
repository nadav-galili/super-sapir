import { motion } from "motion/react";
import { Archive, Calendar, Sparkles, TrendingUp } from "lucide-react";
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
    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-y border-[#E7E0D8] py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
          סה״כ מבצעים
        </span>
        <span
          dir="ltr"
          className="font-mono text-2xl font-semibold tracking-tight text-[#2D3748]"
        >
          {total}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
          אפליפט ממוצע
        </span>
        <span
          dir="ltr"
          className="font-mono text-2xl font-semibold tracking-tight"
          style={{ color: getUpliftColor({ upliftPercent: avgUplift }) }}
        >
          {avgUplift >= 0 ? "+" : ""}
          {avgUplift.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
          שיעור הצלחה
        </span>
        <span
          dir="ltr"
          className="font-mono text-2xl font-semibold tracking-tight text-[#2D3748]"
        >
          {successRate.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function HistoricalPromoRow({ promo }: { promo: HistoricalPromotion }) {
  const upliftColor = getUpliftColor({ upliftPercent: promo.upliftPct });
  const accent = outcomeAccent(promo.outcome);
  const pill = outcomePillStyle(promo.outcome);

  return (
    <motion.div variants={item}>
      <Card className="relative overflow-hidden rounded-[12px] border-[#E7E0D8] bg-white">
        <span
          aria-hidden
          className="absolute inset-y-0 right-0 w-[3px]"
          style={{ backgroundColor: accent }}
        />
        <CardContent className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-x-4 px-4 py-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-[17px] font-bold tracking-tight text-[#2D3748]">
                {promo.name}
              </h4>
              <Badge
                className="shrink-0 rounded-[20px] border-transparent px-2 py-0.5 text-[15px] font-semibold"
                style={{ backgroundColor: pill.bg, color: pill.fg }}
              >
                {promo.outcome}
              </Badge>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[15px] text-[#788390]">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span dir="ltr" className="font-mono">
                  {formatDate(promo.startDate)}
                </span>
              </span>
              <span className="h-1 w-1 rounded-full bg-[#788390]" aria-hidden />
              <span>
                <span dir="ltr" className="font-mono">
                  {promo.durationWeeks}
                </span>{" "}
                שבועות
              </span>
              <span className="h-1 w-1 rounded-full bg-[#788390]" aria-hidden />
              <Badge
                variant="outline"
                className="rounded-[20px] border-[#E7E0D8] bg-[#FAF8F5] px-2 py-0 text-[15px] font-medium text-[#4A5568]"
              >
                {promo.promoType}
              </Badge>
            </div>
          </div>

          <div className="text-end">
            <div className="text-[15px] uppercase tracking-[0.1em] text-[#788390]">
              הנחה
            </div>
            <div
              dir="ltr"
              className="font-mono text-lg font-semibold text-[#2D3748]"
            >
              {promo.discountPct}%
            </div>
          </div>

          <div className="text-end">
            <div className="text-[15px] uppercase tracking-[0.1em] text-[#788390]">
              פדיון
            </div>
            <div
              dir="ltr"
              className="font-mono text-lg font-semibold text-[#2D3748]"
            >
              {currencyFmt.format(promo.revenue)}
            </div>
          </div>

          <div className="text-end">
            <div className="text-[15px] uppercase tracking-[0.1em] text-[#788390]">
              ROI
            </div>
            <div
              dir="ltr"
              className="font-mono text-lg font-semibold text-[#2D3748]"
            >
              {promo.roi.toFixed(1)}x
            </div>
          </div>

          <div className="text-end">
            <div className="text-[15px] uppercase tracking-[0.1em] text-[#788390]">
              אפליפט
            </div>
            <div
              dir="ltr"
              className="inline-flex items-center gap-1 font-mono text-2xl font-bold tracking-tight"
              style={{ color: upliftColor }}
            >
              <TrendingUp className="h-4 w-4" aria-hidden />
              {promo.upliftPct >= 0 ? "+" : ""}
              {promo.upliftPct.toFixed(1)}%
            </div>
          </div>
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
        className="w-full sm:max-w-[920px] h-screen max-h-screen overflow-hidden p-0 bg-[#FAF8F5]"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="flex h-full flex-col px-6 py-5 md:px-8"
        >
          <motion.header
            variants={item}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-[20px] border border-[#E7E0D8] bg-white/60 px-3 py-1 text-[15px] font-medium text-[#DC4E59] backdrop-blur">
                <Archive className="h-4 w-4" />
                ארכיון מבצעים
              </div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#2D3748]">
                {scope.title}
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 rounded-[20px] border border-[#E7E0D8] bg-white px-3 py-1 text-[15px] text-[#4A5568]">
              <Sparkles className="h-4 w-4 text-[#DC4E59]" />
              <span dir="ltr" className="font-mono font-semibold">
                {promotions.length}
              </span>
              <span>רשומות</span>
            </div>
          </motion.header>

          <motion.div variants={item} className="mt-3">
            <SummaryRail
              total={promotions.length}
              avgUplift={avgUplift}
              successRate={successRate}
            />
          </motion.div>

          <section className="mt-3 min-h-0 flex-1">
            <div className="mb-2 flex items-baseline gap-3">
              <span className="text-[15px] uppercase tracking-[0.14em] text-[#DC4E59]">
                ארכיון
              </span>
              <span className="h-px flex-1 bg-[#F1EBE3]" aria-hidden />
              <h3 className="text-xl font-bold tracking-tight text-[#2D3748]">
                מבצעים קודמים
              </h3>
            </div>

            {promotions.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#E7E0D8] bg-white/60 px-6 py-10 text-center">
                <Archive className="mx-auto h-8 w-8 text-[#788390]" />
                <div className="mt-3 text-lg text-[#4A5568]">
                  אין מבצעים היסטוריים זמינים לקטגוריה זו.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {promotions.map((p) => (
                  <HistoricalPromoRow key={p.id} promo={p} />
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
