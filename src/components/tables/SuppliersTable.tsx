import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrencyShort } from "@/lib/format";
import { usePeriodMultiplier } from "@/contexts/PeriodContext";
import { SupplierLogo } from "@/components/dashboard/SupplierLogo";
import { getTopSuppliers, type ChainSupplier } from "@/data/mock-suppliers";
import { getSalesColor, getMarginColor } from "@/lib/kpi/resolvers";

const PAGE_SIZE = 10;

type SortKey = "sales" | "targetPct" | "grossProfitPercent";
type SortDir = "asc" | "desc";

function getTargetPct(s: ChainSupplier) {
  return s.targetSales > 0 ? (s.sales / s.targetSales) * 100 : 100;
}

// ─── Sort header cell ─────────────────────────────────────────────────────────
function SortableHeader({
  children,
  column,
  sortKey,
  onSort,
}: {
  children: React.ReactNode;
  column: SortKey;
  sortKey: SortKey | null;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === column;
  return (
    <th
      className="py-3 px-4 text-end font-medium cursor-pointer select-none transition-colors"
      style={{
        fontSize: 15,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: active ? "#4A5568" : "#A0AEC0",
      }}
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center gap-1.5 justify-end">
        {children}
      </span>
    </th>
  );
}

// ─── Sort direction icon (defined outside to avoid ESLint static-component rule) ─
function ActiveSortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey | null;
  sortDir: SortDir;
}) {
  if (sortKey !== column)
    return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
  return sortDir === "desc" ? (
    <ArrowDown className="w-3.5 h-3.5 text-[#DC4E59]" />
  ) : (
    <ArrowUp className="w-3.5 h-3.5 text-[#DC4E59]" />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SuppliersTable() {
  const m = usePeriodMultiplier();
  const allSuppliers = useMemo(
    () =>
      getTopSuppliers().map((s) => ({
        ...s,
        sales: Math.round(s.sales * m),
        targetSales: Math.round(s.targetSales * m),
      })),
    [m]
  );
  const maxSales = allSuppliers[0]?.sales ?? 1;
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return allSuppliers;
    const list = [...allSuppliers];
    list.sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "sales") {
        av = a.sales;
        bv = b.sales;
      } else if (sortKey === "targetPct") {
        av = getTargetPct(a);
        bv = getTargetPct(b);
      } else {
        av = a.grossProfitPercent;
        bv = b.grossProfitPercent;
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return list;
  }, [allSuppliers, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageSuppliers = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const globalOffset = page * PAGE_SIZE;

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
    >
      {/* No wrapping card — breathes directly on the page */}
      <div className="overflow-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-[#FFF0EA]">
              <th
                className="py-3 ps-2 pe-4 text-end font-medium"
                style={{
                  fontSize: 15,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#A0AEC0",
                }}
              >
                #
              </th>
              <th
                className="py-3 px-4 text-start font-medium"
                style={{
                  fontSize: 15,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#A0AEC0",
                }}
              >
                ספק
              </th>
              <SortableHeader
                column="sales"
                sortKey={sortKey}
                onSort={handleSort}
              >
                מכירות
                <ActiveSortIcon
                  column="sales"
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </SortableHeader>
              <SortableHeader
                column="targetPct"
                sortKey={sortKey}
                onSort={handleSort}
              >
                עמידה ביעד
                <ActiveSortIcon
                  column="targetPct"
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </SortableHeader>
              <SortableHeader
                column="grossProfitPercent"
                sortKey={sortKey}
                onSort={handleSort}
              >
                רווח גולמי
                <ActiveSortIcon
                  column="grossProfitPercent"
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </SortableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFF0EA]">
            {pageSuppliers.map((sup, i) => {
              const rank = globalOffset + i;
              const targetPct = getTargetPct(sup);
              const barPct = (sup.sales / maxSales) * 100;
              const salesColor = getSalesColor({
                actual: sup.sales,
                target: sup.targetSales,
              });
              const marginColor = getMarginColor({
                marginPercent: sup.grossProfitPercent,
              });
              const isTopRank = rank === 0 && !sortKey;

              const rowCells = (
                <>
                  <td className="py-3 ps-2 pe-4 text-end">
                    <span
                      className="font-mono text-[#A0AEC0]"
                      style={{ fontSize: 18 }}
                    >
                      {rank + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* Logo: 40×40, rounded-[12px], border — NOT a circle */}
                      <div
                        className="shrink-0 rounded-[12px] overflow-hidden border border-[#FFE8DE] bg-white"
                        style={{ width: 40, height: 40 }}
                      >
                        <SupplierLogo name={sup.name} size={40} />
                      </div>
                      <span
                        className="font-medium text-[#2D3748] whitespace-nowrap"
                        style={{ fontSize: 20 }}
                      >
                        {sup.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 min-w-[140px]">
                    <span
                      className="font-semibold font-mono text-[#2D3748] block"
                      style={{ fontSize: 20 }}
                      dir="ltr"
                    >
                      {formatCurrencyShort(sup.sales)}
                    </span>
                    {/* Relative-sales progress bar */}
                    <div className="mt-1.5 h-[5px] w-full bg-[#FFF0EA] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: "#DC4E59", opacity: 0.35 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                          delay: 0.15 + i * 0.04,
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="font-semibold font-mono"
                      style={{ fontSize: 20, color: salesColor }}
                      dir="ltr"
                    >
                      {targetPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="font-mono font-medium"
                      style={{ fontSize: 20, color: marginColor }}
                      dir="ltr"
                    >
                      {sup.grossProfitPercent}%
                    </span>
                  </td>
                </>
              );

              if (isTopRank) {
                return (
                  <motion.tr
                    key={sup.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      delay: i * 0.06,
                    }}
                    className="relative"
                  >
                    {/* Perpetual shimmer: opacity oscillates 0.04 → 0.08 → 0.04 */}
                    <td
                      colSpan={5}
                      className="absolute inset-0 pointer-events-none"
                      aria-hidden
                      style={{ padding: 0, border: "none", display: "block" }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        animate={{ opacity: [0.04, 0.08, 0.04] }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          background:
                            "linear-gradient(90deg, transparent 0%, rgba(220,78,89,0.5) 50%, transparent 100%)",
                        }}
                      />
                      {/* 2px RTL-start (inline-end) accent strip */}
                      <div
                        className="absolute top-0 end-0 bottom-0 w-0.5 bg-[#DC4E59]"
                        style={{ borderRadius: 2 }}
                      />
                    </td>
                    {rowCells}
                  </motion.tr>
                );
              }

              return (
                <motion.tr
                  key={sup.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: i * 0.06,
                  }}
                  className="relative group hover:bg-[#FDF8F6] transition-colors"
                >
                  {/* 2px RTL-start accent strip on hover */}
                  <td
                    colSpan={5}
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden
                    style={{ padding: 0, border: "none", display: "block" }}
                  >
                    <div
                      className="absolute top-0 end-0 bottom-0 w-0.5 bg-[#DC4E59]"
                      style={{ borderRadius: 2 }}
                    />
                  </td>
                  {rowCells}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 mt-2 border-t border-[#FFF0EA]">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#FFE8DE] text-[#4A5568] transition-all hover:bg-[#FDF8F6] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-[10px] text-[18px] font-medium transition-all ${
                  page === i
                    ? "bg-[#DC4E59] text-white shadow-sm"
                    : "text-[#4A5568] hover:bg-[#FDF8F6] border border-[#FFE8DE]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages - 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#FFE8DE] text-[#4A5568] transition-all hover:bg-[#FDF8F6] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
