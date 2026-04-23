import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, Loader2, Brain } from "lucide-react";
import { TypingText } from "@/components/ui/typing-text";
import { useAIInsight } from "@/hooks/useAIInsight";
import { buildChainInsight } from "@/lib/ai/builders";
import { KPI_STATUS } from "@/lib/colors";
import type { InsightRow } from "@/lib/ai/types";

// ─── Status config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  InsightRow["status"],
  { label: string; color: string; bg: string }
> = {
  red: { label: "דחוף", color: KPI_STATUS.bad, bg: `${KPI_STATUS.bad}1F` },
  yellow: {
    label: "דורש תשומת לב",
    color: KPI_STATUS.warning,
    bg: `${KPI_STATUS.warning}1F`,
  },
  green: { label: "תקין", color: KPI_STATUS.good, bg: `${KPI_STATUS.good}1F` },
};

function LinkedRecommendation({
  row,
  animate,
}: {
  row: InsightRow;
  animate: boolean;
}) {
  if (animate || !row.entity?.href || !row.entity.name) {
    return <TypingText text={row.recommendation} animate={animate} />;
  }

  const entityIndex = row.recommendation.indexOf(row.entity.name);
  if (entityIndex < 0) {
    return (
      <>
        {row.recommendation}{" "}
        <a
          href={row.entity.href}
          className="font-semibold text-[#DC4E59] underline decoration-[#DC4E59]/35 decoration-2 underline-offset-4 transition-colors hover:text-[#c9444f] hover:decoration-[#DC4E59]"
        >
          {row.entity.name}
        </a>
      </>
    );
  }

  const before = row.recommendation.slice(0, entityIndex);
  const after = row.recommendation.slice(entityIndex + row.entity.name.length);

  return (
    <>
      {before}
      <a
        href={row.entity.href}
        className="font-semibold text-[#DC4E59] underline decoration-[#DC4E59]/35 decoration-2 underline-offset-4 transition-colors hover:text-[#c9444f] hover:decoration-[#DC4E59]"
      >
        {row.entity.name}
      </a>
      {after}
    </>
  );
}

// ─── RTL shimmer skeleton row ─────────────────────────────────────
// Moves right → left to match Hebrew reading direction.

function ShimmerRow({ delay }: { delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-4 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      {/* subject col */}
      <div
        className="h-4 rounded ai-shimmer shrink-0"
        style={{ width: "22%", animationDelay: `${delay}s` }}
      />
      {/* recommendation col — wider */}
      <div
        className="flex-1 h-4 rounded ai-shimmer"
        style={{ animationDelay: `${delay + 0.05}s` }}
      />
      {/* status badge */}
      <div
        className="w-24 h-6 rounded-full ai-shimmer shrink-0"
        style={{ animationDelay: `${delay + 0.1}s` }}
      />
    </motion.div>
  );
}

// ─── Signal sidebar ───────────────────────────────────────────────

function SignalSidebar({
  rows,
  isLoading,
  isStreaming,
}: {
  rows: InsightRow[] | null;
  isLoading: boolean;
  isStreaming: boolean;
}) {
  const counts = {
    red: rows?.filter((r) => r.status === "red").length ?? 0,
    yellow: rows?.filter((r) => r.status === "yellow").length ?? 0,
    green: rows?.filter((r) => r.status === "green").length ?? 0,
  };

  return (
    <div
      className="flex flex-col justify-between p-6 md:p-8 border-b md:border-b-0 md:border-s border-[#FFE8DE]"
      style={{ minWidth: 0 }}
    >
      {/* Header block */}
      <div>
        {/* Icon + pulse dot */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #DC4E59, #E8777F)" }}
          >
            {isLoading || isStreaming ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Brain className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Perpetual pulse — single accent color, transform+opacity only */}
          <motion.span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: "#DC4E59" }}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(220,78,89,0.55)",
                "0 0 0 8px rgba(220,78,89,0)",
              ],
              opacity: [0.65, 1, 0.65],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        </div>

        <motion.h2
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 0.12,
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className="text-xl font-bold text-[#2D3748] leading-snug mb-1"
        >
          ניתוח AI
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="text-[16px] text-[#A0AEC0] leading-snug"
        >
          סקירת מנהל סחר
        </motion.p>
      </div>

      {/* Signal counts — divided, staggered spring entry */}
      <motion.div
        className="flex items-stretch divide-x divide-[#FFE8DE] mt-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.09, delayChildren: 0.35 },
          },
          hidden: {},
        }}
      >
        {(
          [
            { key: "red", label: "דחוף" },
            { key: "yellow", label: "שים לב" },
            { key: "green", label: "תקין" },
          ] as const
        ).map(({ key, label }) => {
          const cfg = STATUS_CONFIG[key];
          return (
            <motion.div
              key={key}
              variants={{
                hidden: { opacity: 0, y: 7 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                  },
                },
              }}
              className="flex-1 text-center first:ps-0 last:pe-0 px-3"
            >
              <p
                className="text-2xl font-bold font-mono leading-none"
                style={{ color: cfg.color }}
                dir="ltr"
              >
                {isLoading ? "—" : counts[key]}
              </p>
              <p className="text-[15px] text-[#A0AEC0] mt-1">{label}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────

interface ChainAIBriefingProps {
  periodKey?: string;
  periodLabel?: string;
  multiplier?: number;
}

export function ChainAIBriefing({
  periodKey = "current-month-to-date-v2",
  periodLabel = "החודש הנוכחי עד היום",
  multiplier,
}: ChainAIBriefingProps) {
  const { rows, isLoading, isStreaming, error, retry } = useAIInsight(
    buildChainInsight({ periodKey, periodLabel, multiplier })
  );

  const showShimmer = isLoading && !rows;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, type: "spring", stiffness: 100, damping: 20 }}
      className="rounded-[16px] bg-white border border-[#FFE8DE] overflow-hidden"
    >
      {/* Top accent strip — RTL shimmer when loading, solid primary accent at rest */}
      <div
        className={`h-[3px] w-full ${showShimmer ? "ai-shimmer-border" : ""}`}
        style={
          !showShimmer
            ? {
                background:
                  "linear-gradient(270deg, #DC4E59, #E8777F, #DC4E59)",
              }
            : undefined
        }
      />

      {/*
        Asymmetric 2-col split:
        - Narrow signal sidebar (signal counts + header)
        - Wide insight table
        The sidebar is on the start/right side (RTL) separated by a
        divider, not a box-in-box card.
      */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)]">
        {/* Signal panel */}
        <SignalSidebar
          rows={rows}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />

        {/* Insight content area */}
        <div className="p-6 md:p-8">
          {/* Streaming indicator — spring entry, no linear */}
          <AnimatePresence>
            {isStreaming && (
              <motion.div
                key="streaming-indicator"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="flex items-center gap-2 mb-4"
              >
                <Sparkles className="w-4 h-4 text-[#DC4E59]" />
                <span className="text-[16px] text-[#DC4E59] font-medium">
                  מנתח נתוני רשת...
                </span>
                {/* Staggered bounce dots — single accent */}
                <div className="flex gap-1 ms-1">
                  {[0, 140, 280].map((delay) => (
                    <motion.span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-[#DC4E59]"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: delay / 1000,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RTL shimmer skeleton — 4 rows with staggered delays */}
          {showShimmer && (
            <div className="divide-y divide-[#FFF0EA]">
              {[0, 0.12, 0.24, 0.36].map((delay, i) => (
                <ShimmerRow key={i} delay={delay} />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center justify-between py-2">
              <span className="text-lg text-[#DC4E59]">
                לא ניתן לטעון ניתוח AI
              </span>
              <button
                onClick={retry}
                className="flex items-center gap-1.5 px-3 py-1.5 text-base font-medium rounded-[8px] border border-[#FFE8DE] text-[#4A5568] hover:bg-[#FDF8F6] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                נסה שוב
              </button>
            </div>
          )}

          {/* Insight table — divider-based, no card-on-card */}
          {rows && rows.length > 0 && (
            <div className="overflow-auto -mx-2 px-2">
              <table className="w-full min-w-[440px]">
                <thead>
                  <tr className="border-b-2 border-[#FFF0EA]">
                    <th className="pb-3 text-right font-semibold text-[#2D3748] text-[18px] ps-1">
                      נושא
                    </th>
                    <th className="pb-3 text-right font-semibold text-[#2D3748] text-[18px] px-3">
                      המלצה
                    </th>
                    <th className="pb-3 text-center font-semibold text-[#2D3748] text-[18px] pe-1">
                      סטטוס
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFF0EA]">
                  <AnimatePresence mode="popLayout">
                    {rows.map((row, i) => {
                      const cfg =
                        STATUS_CONFIG[row.status] ?? STATUS_CONFIG.yellow;
                      return (
                        <motion.tr
                          key={`${row.subject}-${i}`}
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{
                            delay: i * 0.06,
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                          }}
                          className="hover:bg-[#FDF8F6] transition-colors"
                        >
                          <td className="py-3 align-top ps-1">
                            <span className="font-bold text-[20px] text-[#2D3748]">
                              <TypingText
                                text={row.subject}
                                animate={isStreaming}
                              />
                            </span>
                          </td>
                          <td className="py-3 px-3 align-top">
                            <span className="text-[18px] text-[#4A5568] leading-relaxed">
                              <LinkedRecommendation
                                row={row}
                                animate={isStreaming}
                              />
                            </span>
                          </td>
                          <td className="py-3 align-top text-center pe-1">
                            <span
                              className="inline-flex items-center gap-1.5 text-[15px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                              style={{
                                backgroundColor: cfg.bg,
                                color: cfg.color,
                              }}
                            >
                              {/* Pulsing dot for urgent rows — perpetual micro-motion */}
                              {row.status === "red" ? (
                                <motion.span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: cfg.color }}
                                  animate={{
                                    opacity: [1, 0.3, 1],
                                    scale: [1, 0.75, 1],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                />
                              ) : (
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: cfg.color }}
                                />
                              )}
                              {cfg.label}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
