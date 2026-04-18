import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { formatCurrencyShort } from "@/lib/format";
import { getSalesColor } from "@/lib/kpi/resolvers";
import { Activity } from "lucide-react";

interface HeroBannerProps {
  totalSales: number;
  targetSales: number;
  branchCount: number;
  categoryCount: number;
  cta?: ReactNode;
  backgroundImage?: string;
}

const GAUGE_SIZE = 200;
const GAUGE_STROKE = 14;
const GAUGE_R = (GAUGE_SIZE - GAUGE_STROKE) / 2;

const TICK_MARKS = Array.from({ length: 40 }, (_, i) => {
  const angle = (i / 40) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  return {
    x1: GAUGE_SIZE / 2 + (GAUGE_R + 4) * Math.cos(rad),
    y1: GAUGE_SIZE / 2 + (GAUGE_R + 4) * Math.sin(rad),
    x2: GAUGE_SIZE / 2 + (GAUGE_R + 8) * Math.cos(rad),
    y2: GAUGE_SIZE / 2 + (GAUGE_R + 8) * Math.sin(rad),
  };
});

function BigGauge({ actual, target }: { actual: number; target: number }) {
  const ratio = target > 0 ? actual / target : 1;
  const circumference = 2 * Math.PI * GAUGE_R;
  const offset = circumference - Math.min(ratio, 1) * circumference;
  const pct = Math.round(ratio * 100);
  const animatedPct = useAnimatedCounter(pct, 1800, 300);
  const color = getSalesColor({ actual, target });

  return (
    <div className="relative" style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
      {/* Ambient halo — perpetual pulse, isolated transform-only */}
      <motion.div
        className="absolute -inset-4 rounded-full opacity-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}33 0%, transparent 65%)`,
        }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        className="w-full h-full -rotate-90 relative z-10"
        viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
      >
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={GAUGE_R}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={GAUGE_STROKE}
        />
        {TICK_MARKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        ))}
        <motion.circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={GAUGE_R}
          fill="none"
          stroke={color}
          strokeWidth={GAUGE_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 18,
            delay: 0.3,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <span
          className="text-[72px] leading-none font-semibold font-mono text-white tracking-tight"
          dir="ltr"
        >
          {animatedPct}
          <span className="text-3xl text-white/60 ms-0.5">%</span>
        </span>
        <span className="text-[15px] text-white/70 mt-2 tracking-wide font-medium">
          עמידה ביעד
        </span>
      </div>
    </div>
  );
}

interface InlineStatProps {
  label: string;
  value: string | number;
  delay: number;
  mono?: boolean;
}

function InlineStat({ label, value, delay, mono }: InlineStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100, damping: 20 }}
      className="px-5 first:ps-0 last:pe-0"
    >
      <p className="text-[15px] text-white/55 uppercase tracking-[0.08em] font-medium">
        {label}
      </p>
      <p
        className={`text-[26px] font-semibold text-white mt-1 leading-none ${mono ? "font-mono tracking-tight" : ""}`}
        dir="ltr"
      >
        {value}
      </p>
    </motion.div>
  );
}

export function HeroBanner({
  totalSales,
  targetSales,
  branchCount,
  categoryCount,
  cta,
  backgroundImage,
}: HeroBannerProps) {
  const animatedSales = useAnimatedCounter(totalSales, 1600, 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-[20px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(15,23,42,0.25)]"
    >
      {/* Asymmetric split: content panel (RTL-start / right) + image zone (RTL-end / left) */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_clamp(420px,42%,540px)]">
        {/* Content panel — solid dark surface, all text lives here → guaranteed contrast */}
        <div
          className="relative order-2 md:order-1 p-8 sm:p-10 md:p-12 flex flex-col justify-center min-h-[340px]"
          style={{
            background:
              "linear-gradient(180deg, #0F172A 0%, #111B2E 60%, #0F172A 100%)",
          }}
        >
          {/* Live indicator — liquid glass (inner border + inset highlight) */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex self-start items-center gap-2 bg-white/[0.04] backdrop-blur-xl rounded-full px-3 py-1.5 mb-6 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#2EC4D5] relative"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(46,196,213,0.6)",
                  "0 0 0 8px rgba(46,196,213,0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="text-[15px] text-white/80 font-medium inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" strokeWidth={2} />
              נתונים בזמן אמת
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.18,
              type: "spring",
              stiffness: 90,
              damping: 18,
            }}
            className="text-5xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-3"
          >
            ניהול סחר
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/70 leading-relaxed max-w-[40ch] mb-7"
          >
            סקירת ביצועים כלל-רשתית לכל הקטגוריות והסניפים
          </motion.p>

          {/* Inline stats — divided, no card boxes (anti-card-overuse) */}
          <div className="flex items-stretch divide-x divide-white/10 -mx-1 mb-7">
            <InlineStat
              label="מכירות רשת"
              value={formatCurrencyShort(animatedSales)}
              delay={0.4}
              mono
            />
            <InlineStat label="סניפים" value={branchCount} delay={0.5} mono />
            <InlineStat
              label="קטגוריות"
              value={categoryCount}
              delay={0.6}
              mono
            />
          </div>

          {cta && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="self-start [&>*:active]:scale-[0.98] [&>*]:transition-transform"
            >
              {cta}
            </motion.div>
          )}
        </div>

        {/* Image zone — gauge as glassmorphic overlay, image fades into panel seam */}
        <div className="relative order-1 md:order-2 min-h-[260px] md:min-h-[420px] overflow-hidden">
          {backgroundImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
              aria-hidden
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
              }}
              aria-hidden
            />
          )}
          {/* Fade the image into the panel seam (right side in RTL/ms direction on desktop, bottom on mobile) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(15,23,42,0) 55%, rgba(15,23,42,0.9) 100%)",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 pointer-events-none md:hidden"
            style={{
              background:
                "linear-gradient(to bottom, rgba(15,23,42,0) 50%, rgba(15,23,42,0.95) 100%)",
            }}
            aria-hidden
          />

          {/* Gauge — liquid glass treatment */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.25,
              type: "spring",
              stiffness: 140,
              damping: 18,
            }}
            className="absolute inset-0 flex items-center justify-center p-6"
          >
            <div
              className="relative rounded-full p-6 backdrop-blur-2xl border border-white/15"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12) 0%, rgba(15,23,42,0.35) 60%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.15), 0 20px 50px -20px rgba(0,0,0,0.4)",
              }}
            >
              <BigGauge actual={totalSales} target={targetSales} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
