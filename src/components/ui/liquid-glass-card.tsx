import * as React from "react";

import { cn } from "@/lib/utils";

// Minimal LiquidCard primitive extracted from the designali-in liquid-glass kit.
// Only the card + matching GlassFilter SVG ship here — the kit's English
// FinancialScoreCards / LiquidButton / Badge are deliberately omitted, since
// the simulator already has its own shadcn Card / Badge / Button primitives.
//
// Use this exclusively for surfaces that need premium emphasis (e.g. the
// headline metric strip in Step 4). The glass shadow stack is heavier than
// the rest of the design system on purpose — limit its blast radius.

function GlassFilter() {
  return (
    <svg className="hidden" aria-hidden>
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.02"
            numOctaves={1}
            seed={1}
            result="turbulence"
          />
          <feGaussianBlur
            in="turbulence"
            stdDeviation="2"
            result="blurredNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="120"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export function LiquidCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <>
      <div
        data-slot="card"
        style={{ backdropFilter: 'url("#container-glass")' }}
        className={cn(
          "relative flex flex-col gap-6 rounded-xl border bg-transparent text-card-foreground py-6",
          "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]",
          "transition-all",
          className
        )}
        {...props}
      >
        {children}
      </div>
      <GlassFilter />
    </>
  );
}
