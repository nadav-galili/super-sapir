import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  accentColor = "#DC4E59",
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="flex items-center gap-3"
    >
      {/* Accent vertical rule — RTL-aware, visually right-of-text in Hebrew layout */}
      <div
        className="w-[3px] self-stretch rounded-full shrink-0"
        style={{ backgroundColor: accentColor }}
      />

      {/* Icon square — accent-tinted at 14% opacity */}
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accentColor}24` }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: accentColor }} />
      </div>

      {/* Text block */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#2D3748]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[17px] text-[#4A5568] mt-0.5 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
