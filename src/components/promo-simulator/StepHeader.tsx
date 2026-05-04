import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StepHeaderProps {
  /** 1-based step number for the eyebrow ("שלב N"). */
  step: number;
  /** Main title — short, noun phrase. */
  title: string;
  /** One-line descriptor under the title. */
  description: string;
  /** Optional Lucide icon shown in a colored circle on the start side. */
  icon?: LucideIcon;
  /**
   * Right-side status / context pill. Falls back to an unselected slot when
   * omitted, keeping vertical rhythm consistent across the wizard.
   */
  pill?: {
    label: string;
    bg: string;
    border: string;
    text: string;
  };
  /** Eyebrow + icon accent color. Defaults to brand red. */
  accent?: string;
  /** Optional extra content rendered below the descriptor (e.g. a chip). */
  children?: ReactNode;
}

/**
 * Shared step-card header used across all wizard phases (Steps 1–8).
 *
 * Layout: [icon circle] [eyebrow / title / description] ──── [pill]
 *
 * Establishes a consistent visual rhythm — every step opens with the same
 * "שלב N" tracked eyebrow above a 2xl bold title above a 16px muted
 * descriptor. The optional pill on the start side (in RTL: appears on the
 * left edge) is reserved for high-signal status: verdict, readiness, etc.
 */
export function StepHeader({
  step,
  title,
  description,
  icon: Icon,
  pill,
  accent = "#DC4E59",
  children,
}: StepHeaderProps) {
  return (
    <div className="flex flex-row items-start justify-between gap-4 border-b border-[#F1EBE3] pb-4 mb-5">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
            style={{ background: accent }}
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className="text-[15px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: accent }}
          >
            שלב {step}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2D3748] mt-1">
            {title}
          </h2>
          <p className="text-lg text-[#4A5568] mt-1">{description}</p>
          {children}
        </div>
      </div>
      {pill && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[16px] font-semibold border shrink-0"
          style={{
            background: pill.bg,
            borderColor: pill.border,
            color: pill.text,
          }}
        >
          {pill.label}
        </span>
      )}
    </div>
  );
}
