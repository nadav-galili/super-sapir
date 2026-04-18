import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { formatCurrencyShort } from "@/lib/format";
import { KPI_STATUS } from "@/lib/colors";
import { getGrowthColor } from "@/lib/kpi/resolvers";
import type { CategorySnapshot } from "@/lib/category-manager";

interface CategorySpotlightProps {
  snapshots: CategorySnapshot[];
}

const STATUS_BADGE = {
  opportunity: { label: "ביצוע טוב", color: KPI_STATUS.good },
  danger: { label: "חריג", color: KPI_STATUS.bad },
  monitor: { label: "במעקב", color: KPI_STATUS.warning },
} as const;

// Shimmer keyframes injected once via a style tag
const SHIMMER_KEYFRAMES = `
@keyframes sales-shimmer {
  0%   { opacity: 1; }
  45%  { opacity: 0.55; }
  55%  { opacity: 0.55; }
  100% { opacity: 1; }
}
`;

/** Hero card — large, full-bleed image, top-ranked category */
function HeroCard({ snap }: { snap: CategorySnapshot }) {
  const navigate = useNavigate();
  const badge = STATUS_BADGE[snap.status];
  const yoyPositive = snap.category.yoyChange >= 0;
  const yoyColor = getGrowthColor({ changePercent: snap.category.yoyChange });

  return (
    <>
      <style>{SHIMMER_KEYFRAMES}</style>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: 0.05,
        }}
        onClick={() =>
          navigate({
            to: "/category-manager/$categoryId",
            params: { categoryId: snap.category.id },
          })
        }
        style={{
          perspective: 1000,
        }}
        className="relative rounded-[16px] overflow-hidden cursor-pointer group h-full min-h-[260px] md:min-h-[340px]"
        whileHover={{
          scale: 1.012,
          rotateX: -1,
          rotateY: 1.5,
          transition: { type: "spring", stiffness: 280, damping: 22 },
        }}
      >
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <img
            src={`/categories/${snap.category.id}.png`}
            alt={snap.category.name}
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/05" />
        </div>

        {/* Status badge */}
        <div className="absolute top-3 start-3 z-10">
          <span
            className="text-white text-[15px] font-semibold px-2.5 py-1 rounded-[20px]"
            style={{ backgroundColor: badge.color }}
          >
            {badge.label}
          </span>
        </div>

        {/* Rank 1 pill */}
        <div className="absolute top-3 end-3 z-10">
          <span className="text-[15px] font-semibold text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-[20px] border border-white/15">
            #1
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 inset-x-0 p-5 z-10">
          <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
            {snap.category.name}
          </h3>
          <div className="flex items-end gap-5">
            <div>
              <p className="text-[15px] text-white/55 uppercase tracking-[0.06em]">
                מכירות
              </p>
              {/* Perpetual shimmer on the top-ranked sales value */}
              <p
                className="text-2xl font-bold font-mono text-white leading-tight"
                dir="ltr"
                style={{ animation: "sales-shimmer 4s ease-in-out infinite" }}
              >
                {formatCurrencyShort(snap.category.sales)}
              </p>
            </div>
            <div>
              <p className="text-[15px] text-white/55 uppercase tracking-[0.06em]">
                שינוי שנתי
              </p>
              <p
                className="text-2xl font-bold font-mono leading-tight"
                style={{ color: yoyColor }}
                dir="ltr"
              >
                {yoyPositive ? "+" : ""}
                {snap.category.yoyChange}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/** Compact supporting card — image thumbnail + text, stacked in a column with divide-y */
function SupportCard({
  snap,
  rank,
  index,
}: {
  snap: CategorySnapshot;
  rank: number;
  index: number;
}) {
  const navigate = useNavigate();
  const badge = STATUS_BADGE[snap.status];
  const yoyPositive = snap.category.yoyChange >= 0;
  const yoyColor = getGrowthColor({ changePercent: snap.category.yoyChange });

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.1 + index * 0.05,
      }}
      onClick={() =>
        navigate({
          to: "/category-manager/$categoryId",
          params: { categoryId: snap.category.id },
        })
      }
      whileHover={{
        x: -2,
        transition: { type: "spring", stiffness: 300, damping: 22 },
      }}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer group hover:bg-[#FDF8F6] transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-[12px] overflow-hidden border border-[#FFE8DE] shrink-0 bg-[#FDF8F6]">
        <img
          src={`/categories/${snap.category.id}.png`}
          alt={snap.category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-0.5 inset-x-0 text-center text-white text-[15px] font-bold leading-none pb-0.5">
          #{rank}
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[18px] font-semibold text-[#2D3748] truncate">
            {snap.category.name}
          </span>
          <span
            className="shrink-0 text-[15px] font-medium px-2 py-0.5 rounded-[20px]"
            style={{
              backgroundColor: `${badge.color}18`,
              color: badge.color,
            }}
          >
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-mono text-[#4A5568]" dir="ltr">
            {formatCurrencyShort(snap.category.sales)}
          </span>
          <span
            className="text-[15px] font-mono font-semibold"
            style={{ color: yoyColor }}
            dir="ltr"
          >
            {yoyPositive ? "+" : ""}
            {snap.category.yoyChange}%
          </span>
        </div>
      </div>

      {/* Trailing chevron — RTL so points left (toward content) */}
      <svg
        className="w-4 h-4 text-[#A0AEC0] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -scale-x-100"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.div>
  );
}

export function CategorySpotlight({ snapshots }: CategorySpotlightProps) {
  const top = useMemo(
    () =>
      [...snapshots]
        .sort((a, b) => b.category.sales - a.category.sales)
        .slice(0, 4),
    [snapshots]
  );

  const [hero, ...supporting] = top;

  if (!hero) return null;

  return (
    // Asymmetric bento: hero spans rows on lg (2/3 width), supporting cards in a divided column (1/3)
    <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-4">
      {/* Hero card — full height on md+ */}
      <HeroCard snap={hero} />

      {/* Supporting cards — divided list, no per-card boxes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="bg-white border border-[#FFE8DE] rounded-[16px] overflow-hidden divide-y divide-[#FFF0EA]"
      >
        {supporting.map((snap, i) => (
          <SupportCard
            key={snap.category.id}
            snap={snap}
            rank={i + 2}
            index={i}
          />
        ))}
      </motion.div>
    </div>
  );
}
