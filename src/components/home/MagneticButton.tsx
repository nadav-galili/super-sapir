import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useLightMotion } from "@/hooks/useLightMotion";

interface MagneticButtonProps {
  children: ReactNode;
  /** Strength of the cursor pull. 0.25 = quarter of the actual cursor delta. */
  strength?: number;
  className?: string;
}

/**
 * Wraps a child in a Motion div that physically pulls toward the cursor
 * within its bounds. On mobile or with prefers-reduced-motion, the wrapper
 * is inert — children render exactly where they would normally.
 */
export function MagneticButton({
  children,
  strength = 0.3,
  className = "",
}: MagneticButtonProps) {
  const light = useLightMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.6 });

  if (light) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * strength);
        y.set((e.clientY - cy) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
