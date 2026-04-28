import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { formatCurrencyShort } from "@/lib/format";
import { getUpliftColor } from "@/lib/kpi/resolvers";
import type { ChainPromotion } from "@/data/mock-chain-promotions";

interface PromotionsTableProps {
  promotions: ChainPromotion[];
  selectedId: string;
  onSelect: (promotion: ChainPromotion) => void;
}

// Map promo type to a soft pill color pair
function PromoTypePill({ type }: { type: ChainPromotion["promoType"] }) {
  const map: Record<ChainPromotion["promoType"], { bg: string; text: string }> =
    {
      "1+1": { bg: "bg-violet-50", text: "text-violet-700" },
      הנחה: { bg: "bg-sky-50", text: "text-sky-700" },
      חבילה: { bg: "bg-amber-50", text: "text-amber-700" },
      "מחיר מיוחד": { bg: "bg-emerald-50", text: "text-emerald-700" },
      "קנה X קבל Y": { bg: "bg-rose-50", text: "text-rose-700" },
    };
  const style = map[type] ?? { bg: "bg-[#FDF8F6]", text: "text-[#4A5568]" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[15px] font-medium rounded-[20px] border border-transparent ${style.bg} ${style.text}`}
    >
      {type}
    </span>
  );
}

// Low-ROI cannibalization warning (heuristic: uplift >50% but ROI <2.5)
function isCannibalizationRisk(promo: ChainPromotion): boolean {
  return promo.upliftPercent > 50 && promo.roi < 2.5;
}

export function PromotionsTable({
  promotions,
  selectedId,
  onSelect,
}: PromotionsTableProps) {
  const top10 = promotions.slice(0, 10);

  return (
    // No wrapping card — table breathes on the page surface
    <div className="overflow-x-auto">
      <table className="w-full" role="grid">
        <thead>
          <tr>
            <th
              scope="col"
              className="pb-3 ps-2 pe-3 text-start text-[15px] uppercase tracking-[0.08em] text-[#788390] font-medium whitespace-nowrap"
            >
              מבצע
            </th>
            <th
              scope="col"
              className="pb-3 px-3 text-start text-[15px] uppercase tracking-[0.08em] text-[#788390] font-medium whitespace-nowrap hidden sm:table-cell"
            >
              מוצר
            </th>
            <th
              scope="col"
              className="pb-3 px-3 text-start text-[15px] uppercase tracking-[0.08em] text-[#788390] font-medium whitespace-nowrap"
            >
              סוג
            </th>
            <th
              scope="col"
              className="pb-3 px-3 text-end text-[15px] uppercase tracking-[0.08em] text-[#788390] font-medium whitespace-nowrap"
              dir="ltr"
            >
              ₪ מכירות
            </th>
            <th
              scope="col"
              className="pb-3 px-3 text-end text-[15px] uppercase tracking-[0.08em] text-[#788390] font-medium whitespace-nowrap"
            >
              עלייה %
            </th>
            <th
              scope="col"
              className="pb-3 px-3 text-end text-[15px] uppercase tracking-[0.08em] text-[#788390] font-medium whitespace-nowrap"
            >
              ROI
            </th>
            <th
              scope="col"
              className="pb-3 px-3 text-end text-[15px] uppercase tracking-[0.08em] text-[#788390] font-medium whitespace-nowrap"
            >
              ימים
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#FFF0EA]">
          {top10.map((promo, i) => {
            const isSelected = promo.id === selectedId;
            const upliftColor = getUpliftColor({
              upliftPercent: promo.upliftPercent,
            });
            const isPositiveROI = promo.roi >= 1;
            const hasCannibRisk = isCannibalizationRisk(promo);

            return (
              <motion.tr
                key={promo.id}
                role="row"
                tabIndex={0}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.04,
                  type: "spring",
                  stiffness: 130,
                  damping: 20,
                }}
                onClick={() => onSelect(promo)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && onSelect(promo)
                }
                className={[
                  "cursor-pointer outline-none transition-colors group",
                  isSelected ? "bg-[#FDF8F6]" : "hover:bg-[#FDF8F6]/60",
                ].join(" ")}
              >
                {/* Leading selection strip — 2px solid accent on RTL start edge */}
                <td
                  className={[
                    "py-3 ps-2 pe-3 whitespace-nowrap transition-colors",
                    isSelected
                      ? "border-s-2 border-s-[#DC4E59]"
                      : "border-s-2 border-s-transparent",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[18px] font-semibold text-[#2D3748] leading-tight">
                      {promo.name}
                    </p>
                    {hasCannibRisk && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[20px] bg-rose-50 text-rose-700 text-[14px] font-medium border border-rose-100 shrink-0"
                        title="חשד לקניבליזציה — גבוהה עלייה, ROI נמוך"
                      >
                        <AlertTriangle size={13} strokeWidth={2} />
                        קניבליזציה
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-3 text-[18px] text-[#4A5568] whitespace-nowrap hidden sm:table-cell">
                  {promo.productName}
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <PromoTypePill type={promo.promoType} />
                </td>

                <td className="py-3 px-3 text-end whitespace-nowrap" dir="ltr">
                  <span className="font-mono text-[18px] text-[#2D3748]">
                    {formatCurrencyShort(promo.sales)}
                  </span>
                </td>

                <td className="py-3 px-3 text-end whitespace-nowrap" dir="ltr">
                  <span
                    className="font-mono text-[18px] font-semibold"
                    style={{ color: upliftColor }}
                  >
                    +{promo.upliftPercent}%
                  </span>
                </td>

                <td className="py-3 px-3 text-end whitespace-nowrap" dir="ltr">
                  <span
                    className={[
                      "font-mono text-[18px]",
                      isPositiveROI
                        ? "font-bold text-[#2D3748]"
                        : "font-normal text-[#788390]",
                    ].join(" ")}
                  >
                    {promo.roi.toFixed(1)}x
                  </span>
                </td>

                <td className="py-3 px-3 text-end text-[18px] text-[#4A5568] whitespace-nowrap">
                  {promo.daysRemaining}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
