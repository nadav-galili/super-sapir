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
import type {
  BuyAndGetPromo,
  HistoricalPromotion,
} from "@/data/mock-promo-history";
import {
  generateBuyAndGetForScope,
  generateHistoricalPromosForScope,
} from "@/data/mock-archive-generator";
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

/**
 * Resolve the most-specific scope label the user selected, and a Hebrew
 * label of the broader group used to look up historical promos.
 */
interface ArchiveScope {
  /** Hebrew name to render as the page title (the most-specific selection). */
  title: string;
  /** Hebrew name of the broader Group/Department used to query historical promos. */
  lookupKey: string;
  /** Human-readable scope chain (e.g. "ויסוצקי · תה ירוק"). Empty if just sub-category. */
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

  // Most specific level becomes the page title.
  const title = series || supplierName || found.subCategory.nameHe;

  // Broader chain shown as breadcrumb under the title.
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

// Outcome color — a vertical accent bar on the start edge, not a full tint.
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

function HistoricalPromoRow({
  promo,
  featured,
}: {
  promo: HistoricalPromotion;
  featured?: boolean;
}) {
  const endDate = computeEndDate(promo.startDate, promo.durationWeeks);
  const upliftColor = getUpliftColor({ upliftPercent: promo.upliftPct });
  const accent = outcomeAccent(promo.outcome);
  const pill = outcomePillStyle(promo.outcome);

  return (
    <motion.article
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="group relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white shadow-[0_20px_40px_-24px_rgba(220,78,89,0.18)]"
    >
      {/* Accent bar on RTL-start (right) edge */}
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 w-[3px]"
        style={{ backgroundColor: accent }}
      />

      <div className={featured ? "px-8 py-7" : "px-7 py-6"}>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h4
              className={`${featured ? "text-3xl" : "text-2xl"} font-bold tracking-tight text-[#2D3748]`}
            >
              {promo.name}
            </h4>
            {promo.product ? (
              <div className="mt-1 text-[16px] text-[#4A5568]">
                {promo.product}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="rounded-[20px] border border-[#E7E0D8] bg-[#FAF8F5] px-3 py-1 text-[15px] font-medium text-[#4A5568]">
              {promo.promoType}
            </span>
            <span
              className="rounded-[20px] px-3 py-1 text-[15px] font-semibold"
              style={{ backgroundColor: pill.bg, color: pill.fg }}
            >
              {promo.outcome}
            </span>
          </div>
        </header>

        {/* Metadata line — inline, no box */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[16px] text-[#4A5568]">
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

        {/* Asymmetric stats: big uplift left, divided stats right */}
        <div
          className={`mt-5 grid items-end gap-6 ${featured ? "md:grid-cols-[minmax(0,220px)_1fr]" : "md:grid-cols-[minmax(0,180px)_1fr]"}`}
        >
          <div>
            <div className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
              אפליפט
            </div>
            <div
              dir="ltr"
              className={`mt-1 flex items-baseline gap-1 font-mono font-bold tracking-tight ${featured ? "text-6xl" : "text-5xl"}`}
              style={{ color: upliftColor }}
            >
              <TrendingUp
                className={featured ? "h-7 w-7" : "h-5 w-5"}
                aria-hidden
              />
              <span>
                {promo.upliftPct >= 0 ? "+" : ""}
                {promo.upliftPct.toFixed(1)}
                <span
                  className={`${featured ? "text-2xl" : "text-xl"} font-semibold`}
                >
                  %
                </span>
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-[#E7E0D8] rtl:divide-x-reverse">
            <div className="px-4 first:ps-0">
              <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
                יחידות
              </dt>
              <dd
                dir="ltr"
                className="mt-1 flex items-center gap-1.5 font-mono text-xl font-semibold text-[#2D3748]"
              >
                <span className="text-[#788390]">
                  {numberFmt.format(promo.baseUnits)}
                </span>
                <ArrowLeft className="h-4 w-4 text-[#788390]" />
                <span>{numberFmt.format(promo.actualUnits)}</span>
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
                {currencyFmt.format(promo.revenue)}
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
        </div>

        {/* Learnings as a quoted block, not a grey box */}
        <figure className="mt-6 flex gap-3 border-s-2 border-[#DC4E59]/30 ps-4">
          <Quote className="mt-1 h-4 w-4 shrink-0 rotate-180 text-[#DC4E59]/50" />
          <blockquote className="text-lg italic leading-relaxed text-[#4A5568]">
            {promo.learnings}
          </blockquote>
        </figure>
      </div>
    </motion.article>
  );
}

function BuyAndGetTile({ promo }: { promo: BuyAndGetPromo }) {
  const upliftColor = getUpliftColor({ upliftPercent: promo.upliftPct });
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="relative overflow-hidden rounded-[16px] border border-[#E7E0D8] bg-white"
    >
      {/* 2px accent stripe on top */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-[#DC4E59] to-[#E8777F]"
      />

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-xl font-bold tracking-tight text-[#2D3748]">
              {promo.name}
            </h4>
            <div className="mt-1 text-[16px] text-[#4A5568]">
              {promo.productName}
            </div>
          </div>
          <div
            dir="ltr"
            className="shrink-0 font-mono text-2xl font-bold"
            style={{ color: upliftColor }}
          >
            +{promo.upliftPct.toFixed(1)}%
          </div>
        </div>

        {/* Condition → benefit */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[16px]">
          <span className="rounded-[20px] bg-[#FAF8F5] px-3 py-1 font-medium text-[#4A5568]">
            {promo.condition}
          </span>
          <ArrowLeft className="h-4 w-4 text-[#788390]" />
          <span className="rounded-[20px] bg-[rgba(46,196,213,0.10)] px-3 py-1 font-semibold text-[#0891B2]">
            {promo.benefit}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-[#788390]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span dir="ltr" className="font-mono">
              {formatDate(promo.startDate)} — {formatDate(promo.endDate)}
            </span>
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 divide-x divide-[#E7E0D8] rtl:divide-x-reverse">
          <div className="px-4 first:ps-0">
            <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
              פדיון
            </dt>
            <dd
              dir="ltr"
              className="mt-1 font-mono text-xl font-semibold text-[#2D3748]"
            >
              {currencyFmt.format(promo.totalRevenue)}
            </dd>
          </div>
          <div className="px-4">
            <dt className="text-[15px] uppercase tracking-[0.12em] text-[#788390]">
              יחידות
            </dt>
            <dd
              dir="ltr"
              className="mt-1 font-mono text-xl font-semibold text-[#2D3748]"
            >
              {numberFmt.format(promo.unitsSold)}
            </dd>
          </div>
        </dl>
      </div>
    </motion.article>
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
          className="w-full sm:max-w-[960px] h-screen max-h-screen overflow-y-auto p-0 bg-[#FAF8F5]"
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
  const buyAndGet: BuyAndGetPromo[] = generateBuyAndGetForScope({
    subcategoryId,
    supplierId,
    series,
  });

  const [featured, ...rest] = promotions;

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
        className="w-full sm:max-w-[960px] h-screen max-h-screen overflow-y-auto p-0 bg-[#FAF8F5]"
      >
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
                {promotions.length + buyAndGet.length}
              </span>
              <span>רשומות בארכיון</span>
            </div>
          </motion.header>

          {/* Inline summary rail */}
          <motion.div variants={item} className="mt-8">
            <SummaryRail
              total={promotions.length}
              avgUplift={avgUplift}
              successRate={successRate}
            />
          </motion.div>

          {/* Historical promotions */}
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
              <div className="flex flex-col gap-5">
                {featured ? (
                  <HistoricalPromoRow promo={featured} featured />
                ) : null}
                {rest.map((p) => (
                  <HistoricalPromoRow key={p.id} promo={p} />
                ))}
              </div>
            )}
          </section>

          {/* Buy and get */}
          <section className="mt-12">
            <div className="mb-5 flex items-baseline justify-between">
              <div>
                <h3 className="text-3xl font-bold tracking-tight text-[#2D3748]">
                  מבצעי "קנה וקבל" ברשת
                </h3>
                <p className="mt-1 text-[16px] text-[#788390]">
                  מעורבים מוצרים מ-
                  <span className="text-[#4A5568]">{scope.lookupKey}</span>
                </p>
              </div>
              <span className="rounded-[20px] border border-[#E7E0D8] bg-white px-3 py-1 text-[15px] font-medium text-[#4A5568]">
                <span dir="ltr" className="font-mono">
                  {buyAndGet.length}
                </span>{" "}
                מבצעים
              </span>
            </div>

            {buyAndGet.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#E7E0D8] bg-white/60 px-6 py-14 text-center text-lg text-[#788390]">
                לא נמצאו מבצעי "קנה וקבל" לקטגוריה זו.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {buyAndGet.map((p) => (
                  <BuyAndGetTile key={p.id} promo={p} />
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
