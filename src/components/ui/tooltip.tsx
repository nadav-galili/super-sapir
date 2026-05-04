import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  width?: "auto" | "sm" | "md" | "lg";
}

const WIDTH_CLASS: Record<NonNullable<TooltipProps["width"]>, string> = {
  auto: "whitespace-nowrap",
  sm: "max-w-[220px] whitespace-normal",
  md: "max-w-[300px] whitespace-normal",
  lg: "max-w-[380px] whitespace-normal",
};

export function Tooltip({
  content,
  children,
  className,
  width = "auto",
}: TooltipProps) {
  return (
    <div className={cn("group relative inline-block", className)}>
      {children}
      <div
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-md bg-[#2D3748] text-white text-[15px] leading-snug shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 text-right",
          WIDTH_CLASS[width]
        )}
        dir="rtl"
      >
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#2D3748]" />
      </div>
    </div>
  );
}
