import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypingText } from "@/components/ui/typing-text";
import { useAIInsight } from "@/hooks/useAIInsight";
import { buildCategoryInsight } from "@/lib/ai/builders";
import { KPI_STATUS } from "@/lib/colors";
import type { InsightRow } from "@/lib/ai/types";

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

interface CategoryAIBriefingProps {
  categoryId: string;
  categoryName: string;
}

export function CategoryAIBriefing({
  categoryId,
  categoryName,
}: CategoryAIBriefingProps) {
  const { rows, isLoading, isStreaming, error, retry } = useAIInsight(
    buildCategoryInsight({ categoryId })
  );

  const showShimmer = isLoading && !rows;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-warm-border rounded-[16px] overflow-hidden relative">
        {/* Shimmer top border */}
        <div
          className={`h-1 w-full ${showShimmer ? "ai-shimmer-border" : ""}`}
          style={
            !showShimmer
              ? {
                  background:
                    "linear-gradient(90deg, #6C5CE7, #8B7FED, #DC4E59)",
                }
              : undefined
          }
        />

        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2 text-[#2D3748]">
            <div
              className="w-7 h-7 rounded-[10px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6C5CE7, #8B7FED)",
              }}
            >
              {isLoading || isStreaming ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </div>
            ניתוח AI — {categoryName}
            <span
              className="text-[15px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, #6C5CE7, #8B7FED)",
                color: "white",
              }}
            >
              AI
            </span>
            {isStreaming && (
              <span className="text-[15px] text-[#6C5CE7] font-medium animate-pulse me-auto">
                מנתח...
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Shimmer skeleton */}
          {showShimmer && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="flex-1 h-4 ai-shimmer rounded"
                    style={{ width: "25%", animationDelay: `${i * 0.15}s` }}
                  />
                  <div
                    className="flex-[2] h-4 ai-shimmer rounded"
                    style={{
                      width: "50%",
                      animationDelay: `${i * 0.15 + 0.05}s`,
                    }}
                  />
                  <div
                    className="w-20 h-6 ai-shimmer rounded-full"
                    style={{ animationDelay: `${i * 0.15 + 0.1}s` }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center justify-between py-2">
              <span className="text-lg text-[#DC4E59]">
                לא ניתן לטעון ניתוח AI
              </span>
              <button
                onClick={retry}
                className="flex items-center gap-1.5 px-3 py-1.5 text-base font-medium rounded-[8px] border border-warm-border text-[#4A5568] hover:bg-[#FDF8F6]"
              >
                <RefreshCw className="w-3 h-3" />
                נסה שוב
              </button>
            </div>
          )}

          {/* Insights table */}
          {rows && rows.length > 0 && (
            <div className="overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[500px] text-lg">
                <thead>
                  <tr className="border-b-2 border-[#FFF0EA]">
                    <th className="px-3 py-2.5 text-right font-semibold text-[#2D3748] text-[18px]">
                      נושא
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#2D3748] text-[18px]">
                      המלצה
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-[#2D3748] text-[18px]">
                      סטטוס
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {rows.map((row, i) => {
                      const cfg =
                        STATUS_CONFIG[row.status] ?? STATUS_CONFIG.yellow;
                      return (
                        <motion.tr
                          key={`${row.subject}-${i}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.08 }}
                          className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                        >
                          <td className="px-3 py-3 align-top">
                            <span className="font-bold text-[20px] text-[#2D3748]">
                              <TypingText
                                text={row.subject}
                                animate={isStreaming}
                              />
                            </span>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <span className="text-[18px] text-[#4A5568] leading-relaxed">
                              <TypingText
                                text={row.recommendation}
                                animate={isStreaming}
                              />
                            </span>
                          </td>
                          <td className="px-3 py-3 align-top text-center">
                            <span
                              className="inline-flex items-center gap-1.5 text-[15px] font-bold px-3 py-1 rounded-full"
                              style={{
                                backgroundColor: cfg.bg,
                                color: cfg.color,
                              }}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cfg.color }}
                              />
                              {cfg.label}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>

              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-3"
                >
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
