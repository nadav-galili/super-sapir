import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { formatCurrencyShort } from "@/lib/format";
import { KPI_STATUS } from "@/lib/colors";
import { getSalesColor } from "@/lib/kpi/resolvers";
import type { CategorySnapshot } from "@/lib/category-manager";

interface CategoryPerformanceTableProps {
  snapshots: CategorySnapshot[];
}

const STATUS_CONFIG = {
  opportunity: {
    label: "ביצוע טוב",
    statusColor: KPI_STATUS.good,
    barColor: KPI_STATUS.good,
  },
  danger: {
    label: "חריג",
    statusColor: KPI_STATUS.bad,
    barColor: KPI_STATUS.bad,
  },
  monitor: {
    label: "במעקב",
    statusColor: KPI_STATUS.warning,
    barColor: KPI_STATUS.warning,
  },
};

// Shimmer animation for the top-ranked row
const SHIMMER_STYLE = `
@keyframes row-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
`;

/** Sort header button with animated chevron */
function SortableHeader({
  label,
  isSorted,
  onToggle,
}: {
  label: string;
  isSorted: false | "asc" | "desc";
  onToggle: () => void;
}) {
  return (
    <button
      className="flex items-center gap-1 group select-none"
      onClick={onToggle}
    >
      <span className={isSorted ? "text-[#2D3748]" : ""}>{label}</span>
      <motion.span
        animate={{
          rotate: isSorted === "asc" ? 180 : 0,
          opacity: isSorted ? 1 : 0.4,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="inline-flex"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </motion.span>
    </button>
  );
}

export function CategoryPerformanceTable({
  snapshots,
}: CategoryPerformanceTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sales", desc: true },
  ]);

  const maxSales = useMemo(
    () => Math.max(...snapshots.map((s) => s.category.sales)),
    [snapshots]
  );

  const columns = useMemo<ColumnDef<CategorySnapshot>[]>(
    () => [
      {
        accessorKey: "category.name",
        header: "קטגוריה",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              className="w-9 h-9 rounded-[10px] overflow-hidden border border-[#FFE8DE] bg-[#FDF8F6] shrink-0"
            >
              <img
                src={`/categories/${row.original.category.id}.png`}
                alt={row.original.category.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <span className="text-[18px] font-medium text-[#2D3748]">
              {row.original.category.name}
            </span>
          </div>
        ),
      },
      {
        id: "sales",
        accessorFn: (row) => row.category.sales,
        header: ({ column }) => (
          <SortableHeader
            label="מכירות ₪"
            isSorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting()}
          />
        ),
        cell: ({ row, getValue }) => {
          const sales = getValue() as number;
          const pct = maxSales > 0 ? (sales / maxSales) * 100 : 0;
          const barColor = STATUS_CONFIG[row.original.status].barColor;
          return (
            <div className="min-w-[120px]">
              <span
                className="font-semibold font-mono text-[20px] text-[#2D3748]"
                dir="ltr"
              >
                {formatCurrencyShort(sales)}
              </span>
              <div className="mt-1 h-1.5 w-full bg-[#FFF0EA] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: 0.3,
                  }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "yoyChange",
        accessorFn: (row) => row.category.yoyChange,
        header: ({ column }) => (
          <SortableHeader
            label="שינוי שנתי %"
            isSorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting()}
          />
        ),
        cell: ({ getValue }) => {
          const val = getValue() as number;
          return (
            <span
              className="text-[18px] font-semibold font-mono"
              style={{ color: val >= 0 ? KPI_STATUS.good : KPI_STATUS.bad }}
              dir="ltr"
            >
              {val >= 0 ? "+" : ""}
              {val}%
            </span>
          );
        },
      },
      {
        id: "grossMargin",
        accessorFn: (row) => row.normalizedGrossMarginPercent,
        header: ({ column }) => (
          <SortableHeader
            label="רווח גולמי %"
            isSorted={column.getIsSorted()}
            onToggle={() => column.toggleSorting()}
          />
        ),
        cell: ({ getValue }) => {
          const val = getValue() as number;
          const color = getSalesColor({
            actual: val,
            target: 25, // 25% is the "good" margin threshold
          });
          return (
            <span className="text-[18px] font-mono" style={{ color }} dir="ltr">
              {val.toFixed(1)}%
            </span>
          );
        },
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "סטטוס",
        cell: ({ row }) => {
          const cfg = STATUS_CONFIG[row.original.status];
          return (
            <span
              className="inline-block px-2.5 py-0.5 text-[15px] font-semibold rounded-[20px] border"
              style={{
                backgroundColor: `${cfg.statusColor}18`,
                color: cfg.statusColor,
                borderColor: `${cfg.statusColor}33`,
              }}
            >
              {cfg.label}
            </span>
          );
        },
        sortingFn: (a, b) => {
          const order = { danger: 0, monitor: 1, opportunity: 2 };
          return order[a.original.status] - order[b.original.status];
        },
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate({
                to: "/category-manager/$categoryId",
                params: { categoryId: row.original.category.id },
              });
            }}
            className="text-[#A0AEC0] hover:text-[#DC4E59] transition-colors"
            aria-label="פתח קטגוריה"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        ),
        size: 40,
        enableSorting: false,
      },
    ],
    [navigate, maxSales]
  );

  const table = useReactTable({
    data: snapshots,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <>
      <style>{SHIMMER_STYLE}</style>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.25,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        // No card border — table breathes on page surface
        className="bg-white border border-[#FFE8DE] rounded-[16px] overflow-hidden"
      >
        {/* Section header */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-[3px] h-5 rounded-full bg-[#DC4E59] shrink-0" />
          <h3 className="text-[20px] font-semibold text-[#2D3748]">
            ביצועי קטגוריות
          </h3>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-[#FFF0EA]">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2.5 text-right text-[15px] uppercase tracking-[0.08em] text-[#A0AEC0] font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isTop = i === 0;
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      delay: 0.08 + i * 0.04,
                    }}
                    whileHover={{
                      boxShadow: "inset -2px 0 0 #DC4E59",
                      transition: { duration: 0.15 },
                    }}
                    onClick={() =>
                      navigate({
                        to: "/category-manager/$categoryId",
                        params: { categoryId: row.original.category.id },
                      })
                    }
                    className="cursor-pointer border-b border-[#FFF0EA] last:border-b-0 group relative transition-colors"
                    style={
                      isTop
                        ? {
                            // Perpetual faint shimmer on the top row
                            background:
                              "linear-gradient(90deg, transparent 0%, rgba(220,78,89,0.04) 40%, rgba(220,78,89,0.07) 50%, rgba(220,78,89,0.04) 60%, transparent 100%)",
                            backgroundSize: "400% 100%",
                            animation: "row-shimmer 6s linear infinite",
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 group-hover:bg-[#FDF8F6] transition-colors"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
