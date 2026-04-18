// Small stat tile used across store-manager charts. The route used to
// inline the same (label + large value + optional subtitle/accessory)
// structure in several places; this is the single source of truth so
// new KPI tiles don't get copy-pasted.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MiniStatTileProps {
  label: string;
  value: ReactNode;
  /** Optional secondary line under the value. */
  subtitle?: ReactNode;
  /** Optional trailing indicator rendered beside the value (e.g. trend %). */
  accessory?: ReactNode;
  /** Root container class overrides (bg, padding, border, etc). */
  className?: string;
  /** Label text class overrides. */
  labelClassName?: string;
  /** Value text class overrides. */
  valueClassName?: string;
  /** Subtitle text class overrides. */
  subtitleClassName?: string;
}

/**
 * A compact stat tile with a label, a big value, and optional subtitle
 * or trailing accessory. Uses the 16px rounded-corner convention from
 * CLAUDE.md. All text-size classes are overridable so existing sites
 * can preserve pixel-perfect parity while still deduping the markup.
 */
export function MiniStatTile({
  label,
  value,
  subtitle,
  accessory,
  className,
  labelClassName = "text-xs text-[#A0AEC0]",
  valueClassName = "text-2xl font-bold text-[#2D3748] font-mono tabular-nums",
  subtitleClassName = "text-[11px] text-[#A0AEC0]",
}: MiniStatTileProps) {
  return (
    <div className={cn("rounded-xl bg-[#FDF8F6] p-4 text-center", className)}>
      <p className={cn("mb-1.5", labelClassName)}>{label}</p>
      <div className="flex items-center justify-center gap-1.5">
        <span className={valueClassName} dir="ltr">
          {value}
        </span>
        {accessory}
      </div>
      {subtitle && <p className={cn("mt-1", subtitleClassName)}>{subtitle}</p>}
    </div>
  );
}
