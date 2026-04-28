import { useMemo } from "react";
import { motion } from "motion/react";
import { AlertTriangle, TrendingUp, Megaphone } from "lucide-react";
import { formatCurrencyShort } from "@/lib/format";
import { KPI_STATUS } from "@/lib/colors";
import { getGrowthColor } from "@/lib/kpi/resolvers";
import { usePeriodMultiplier } from "@/contexts/PeriodContext";
import { getCategorySummaries } from "@/data/mock-categories";
import {
  getTopStockoutItem,
  getTopSalesItem,
  getTopPromoItem,
} from "@/data/mock-items";

interface HeroItemCardsProps {
  vertical?: boolean;
}

interface SpotlightCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  imageUrl: string;
  productName: string;
  categoryName: string;
  stats: { label: string; value: string; color: string }[];
  delay: number;
  accentColor: string;
  /** When true: render as a horizontal divided row (no card box). When false: render as an elevated card. */
  isRailItem?: boolean;
}

/** Rail row — used when `vertical={true}` (Categories tab sidebar) */
function RailRow({
  title,
  icon,
  iconBg,
  imageUrl,
  productName,
  categoryName,
  stats,
  delay,
  accentColor,
}: SpotlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100, damping: 20 }}
      className="flex items-center gap-3 px-4 py-3 group hover:bg-[#FDF8F6] transition-colors relative"
    >
      {/* 2px leading accent strip (RTL: border-s = inline-start = right side) */}
      <div
        className="absolute inset-y-0 end-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      {/* Product image */}
      <div
        className="w-12 h-12 rounded-[14px] overflow-hidden border border-[#FFE8DE] shrink-0 bg-[#FDF8F6]"
        style={{ boxShadow: "none" }}
      >
        <motion.img
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {/* Title row with icon */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${iconBg}`}
          >
            {icon}
          </span>
          <span className="text-[15px] text-[#788390] uppercase tracking-[0.06em] font-medium truncate">
            {title}
          </span>
        </div>

        <p className="text-[18px] font-semibold text-[#2D3748] truncate leading-tight">
          {productName}
        </p>
        <p className="text-[15px] text-[#788390] leading-tight">
          {categoryName}
        </p>
      </div>

      {/* Stats — stacked on the end */}
      <div className="shrink-0 text-end">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[15px] text-[#788390] leading-none">{s.label}</p>
            <p
              className="text-[17px] font-bold font-mono leading-tight"
              style={{ color: s.color }}
              dir="ltr"
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** Card — used when `vertical={false}` (grid mode, other routes) */
function SpotlightCard({
  title,
  icon,
  iconBg,
  imageUrl,
  productName,
  categoryName,
  stats,
  delay,
  accentColor,
}: SpotlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      whileHover={{
        y: -2,
        boxShadow: `0 8px 24px -6px ${accentColor}22`,
        transition: { type: "spring", stiffness: 300, damping: 22 },
      }}
      className="relative overflow-hidden rounded-[16px] bg-white border border-[#FFE8DE] group cursor-default"
    >
      {/* 2px accent top bar */}
      <div
        className="h-[2px] w-full"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${iconBg}`}
          >
            {icon}
          </span>
          <h3 className="text-[18px] font-semibold text-[#2D3748]">{title}</h3>
        </div>

        {/* Product row */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-[12px] overflow-hidden border border-[#FFE8DE] shrink-0 bg-[#FDF8F6]"
          >
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-[#2D3748] truncate">
              {productName}
            </p>
            <p className="text-[18px] text-[#788390] mt-0.5">{categoryName}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[16px] text-[#788390]">{s.label}</p>
                  <p
                    className="text-[18px] font-bold font-mono"
                    style={{ color: s.color }}
                    dir="ltr"
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroItemCards({ vertical }: HeroItemCardsProps) {
  const m = usePeriodMultiplier();
  const stockoutItem = useMemo(() => getTopStockoutItem(), []);
  const topSalesItem = useMemo(() => getTopSalesItem(), []);
  const topPromoItem = useMemo(() => getTopPromoItem(), []);
  const categories = useMemo(() => getCategorySummaries(), []);

  const stockoutCatName =
    categories.find((c) => c.id === stockoutItem.categoryId)?.name ??
    stockoutItem.categoryId;
  const topSalesCatName =
    categories.find((c) => c.id === topSalesItem.categoryId)?.name ??
    topSalesItem.categoryId;
  const promoCatName =
    categories.find((c) => c.id === topPromoItem.categoryId)?.name ??
    topPromoItem.categoryId;

  const yoyChange =
    topSalesItem.lastYearMonthlySales > 0
      ? ((topSalesItem.monthlySales * m - topSalesItem.lastYearMonthlySales) /
          topSalesItem.lastYearMonthlySales) *
        100
      : 0;

  const stockoutAccent = "#DC4E59";
  const salesAccent = getGrowthColor({ changePercent: yoyChange });
  const promoAccent = KPI_STATUS.good;

  const items = [
    {
      title: "פריט חסר — הפסד מוביל",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#DC4E59]" />,
      iconBg: "bg-[#DC4E59]/10",
      imageUrl: "/hero/stockout-meat.jpg",
      productName: stockoutItem.nameHe,
      categoryName: stockoutCatName,
      accentColor: stockoutAccent,
      delay: 0.1,
      stats: [
        {
          label: "ימי חוסר",
          value: `${Math.round(stockoutItem.stockoutDays * m)} ימים`,
          color: stockoutAccent,
        },
        {
          label: "הפסד רווח",
          value: formatCurrencyShort(stockoutItem.estimatedProfitLoss * m),
          color: stockoutAccent,
        },
      ],
    },
    {
      title: "פריט מוביל מכירות",
      icon: (
        <TrendingUp className="w-3.5 h-3.5" style={{ color: salesAccent }} />
      ),
      iconBg: "bg-[#10B981]/10",
      imageUrl: "/hero/top-sales-cola.jpg",
      productName: topSalesItem.nameHe,
      categoryName: topSalesCatName,
      accentColor: salesAccent,
      delay: 0.2,
      stats: [
        {
          label: "מכירות חודשי",
          value: formatCurrencyShort(topSalesItem.monthlySales * m),
          color: salesAccent,
        },
        {
          label: "מול שנה שעברה",
          value: `${yoyChange >= 0 ? "+" : ""}${yoyChange.toFixed(1)}%`,
          color: salesAccent,
        },
      ],
    },
    {
      title: "פריט מוביל מבצעים",
      icon: (
        <Megaphone className="w-3.5 h-3.5" style={{ color: promoAccent }} />
      ),
      iconBg: "bg-[#10B981]/10",
      imageUrl: "/hero/promo-tissue.jpg",
      productName: topPromoItem.nameHe,
      categoryName: promoCatName,
      accentColor: promoAccent,
      delay: 0.3,
      stats: [
        {
          label: "מכירות מבצע",
          value: formatCurrencyShort((topPromoItem.promoSales ?? 0) * m),
          color: promoAccent,
        },
        {
          label: "עלייה במבצע",
          value: `+${topPromoItem.promoUpliftPercent ?? 0}%`,
          color: promoAccent,
        },
      ],
    },
  ];

  if (vertical) {
    // Rail mode: divided list inside a single container, no per-item card box
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-[#FFE8DE] rounded-[16px] overflow-hidden"
      >
        {/* Rail header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <div className="w-[3px] h-4 rounded-full bg-[#DC4E59] shrink-0" />
          <h3 className="text-[18px] font-semibold text-[#2D3748]">
            פריטים בפוקוס
          </h3>
        </div>
        <div className="divide-y divide-[#FFF0EA]">
          {items.map((item) => (
            <RailRow key={item.title} {...item} />
          ))}
        </div>
      </motion.div>
    );
  }

  // Grid mode — cards with slight size variation (anti-equal-cards)
  // First card is slightly taller/more prominent via extra padding
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <SpotlightCard key={item.title} {...item} isRailItem={false} />
      ))}
    </div>
  );
}
