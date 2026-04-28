import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, TrendingDown, Package, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryAlert } from "@/data/types";

const ALERT_ICONS = {
  "target-miss": TrendingDown,
  "margin-erosion": AlertTriangle,
  "stockout-risk": Package,
  "declining-sales": TrendingDown,
  "low-turnover": Clock,
} as const;

const SEVERITY_COLORS = {
  high: {
    bg: "bg-[#DC4E59]/10",
    text: "text-[#DC4E59]",
    border: "border-[#DC4E59]/20",
  },
  medium: {
    bg: "bg-[#F6B93B]/10",
    text: "text-[#F6B93B]",
    border: "border-[#F6B93B]/20",
  },
  low: {
    bg: "bg-[#788390]/10",
    text: "text-[#788390]",
    border: "border-[#788390]/20",
  },
} as const;

interface AlertsBarProps {
  alerts: CategoryAlert[];
}

export function AlertsBar({ alerts }: AlertsBarProps) {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#DC4E59]" />
            התראות — דורש טיפול
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {alerts.map((alert, i) => {
              const Icon = ALERT_ICONS[alert.type];
              const colors = SEVERITY_COLORS[alert.severity];
              return (
                <motion.div
                  key={`${alert.categoryId}-${alert.type}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to="/category-manager/$categoryId"
                    params={{ categoryId: alert.categoryId }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-[10px] border ${colors.bg} ${colors.border} hover:shadow-sm transition-shadow`}
                  >
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                    <div className="text-sm">
                      <span className="font-medium text-[#2D3748]">
                        {alert.categoryName}
                      </span>
                      <span className="mx-1 text-[#788390]">·</span>
                      <span className={colors.text}>{alert.label}</span>
                      <span className="mx-1 text-[#788390]">·</span>
                      <span
                        className="text-[#4A5568] font-mono text-xs"
                        dir="ltr"
                      >
                        {alert.value}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
