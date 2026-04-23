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
  middleContent?: ReactNode;
  periodControl?: ReactNode;
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
          עמידה ביעד מכירות
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
  middleContent,
  periodControl,
}: HeroBannerProps) {
  const animatedSales = useAnimatedCounter(totalSales, 1600, 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-[20px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(15,23,42,0.25)]"
    >
      <div
        className="relative overflow-hidden p-6 sm:p-8 lg:p-10"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(46,196,213,0.16) 0%, transparent 28%), radial-gradient(circle at 82% 12%, rgba(220,78,89,0.18) 0%, transparent 24%), linear-gradient(145deg, #0F172A 0%, #111B2E 48%, #0B1220 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
          aria-hidden
        />
        <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[minmax(300px,0.82fr)_minmax(620px,1.18fr)] xl:items-center">
          <div className="flex min-h-[360px] flex-col justify-center">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {/* Live indicator — liquid glass (inner border + inset highlight) */}
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#2EC4D5] relative"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(46,196,213,0.6)",
                      "0 0 0 8px rgba(46,196,213,0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <span className="text-[15px] text-white/80 font-medium inline-flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" strokeWidth={2} />
                  נתונים בזמן אמת
                </span>
              </motion.div>

              {periodControl}
            </div>

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
              מבט מהיר על מצב הרשת עכשיו: מכירות, יעד, רווחיות, זמינות ואיכות.
            </motion.p>

            {/* Inline stats — divided, no card boxes (anti-card-overuse) */}
            <div className="flex flex-wrap items-stretch divide-x divide-white/10 -mx-1 mb-7">
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

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.24,
              type: "spring",
              stiffness: 90,
              damping: 18,
            }}
            className="rounded-[22px] border border-white/10 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]"
          >
            <div
              className="rounded-[18px] border border-white/[0.08] p-4 sm:p-5"
              style={{
                background:
                  "linear-gradient(150deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 100%)",
              }}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.12em] text-white/45">
                    KPI COMMAND CENTER
                  </p>
                  <h2 className="mt-1 text-2xl font-bold leading-tight text-white">
                    מצב הרשת במבט אחד
                  </h2>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 sm:block">
                  יעד חודשי
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-center">
                <div className="flex justify-center rounded-[18px] border border-white/10 bg-[#0F172A]/55 p-5">
                  <BigGauge actual={totalSales} target={targetSales} />
                </div>
                {middleContent}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
