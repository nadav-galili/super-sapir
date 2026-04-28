import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatBadgeProps {
  label: string;
  value: string;
  delta?: number;
  className?: string;
}

export function StatBadge({ label, value, delta, className }: StatBadgeProps) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <span className="text-sm text-[#788390]">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className="font-semibold text-sm text-[#2D3748] font-mono"
          dir="ltr"
        >
          {value}
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-mono",
              delta > 0 && "text-[#2EC4D5]",
              delta < 0 && "text-[#DC4E59]",
              delta === 0 && "text-[#788390]"
            )}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : delta < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span dir="ltr">
              {delta > 0 ? "+" : ""}
              {delta}%
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
