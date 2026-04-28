import { motion } from "motion/react";
import { useLightMotion } from "@/hooks/useLightMotion";

// Real lat/lng for the 12 branches in mock-branches.ts + hadera-seed.ts.
// Hadera is the HQ — marked separately so the network lines fan out from it.
const HADERA = {
  name: "חדרה",
  lat: 32.434,
  lng: 34.9196,
  status: "good" as const,
};

const BRANCHES = [
  { name: "חיפה", lat: 32.794, lng: 34.9896, status: "good" as const },
  { name: "עפולה", lat: 32.607, lng: 35.2882, status: "warn" as const },
  { name: "טבריה", lat: 32.7922, lng: 35.5312, status: "good" as const },
  { name: "נתניה", lat: 32.3215, lng: 34.8532, status: "good" as const },
  { name: "כפר סבא", lat: 32.178, lng: 34.907, status: "good" as const },
  { name: "תל אביב", lat: 32.0853, lng: 34.7818, status: "good" as const },
  { name: "ראשון לציון", lat: 31.973, lng: 34.7925, status: "warn" as const },
  { name: "מודיעין", lat: 31.8969, lng: 35.0104, status: "good" as const },
  { name: "אשדוד", lat: 31.8014, lng: 34.6435, status: "danger" as const },
  { name: "באר שבע", lat: 31.2518, lng: 34.7913, status: "good" as const },
  { name: "אילת", lat: 29.5569, lng: 34.9498, status: "warn" as const },
];

const STATUS_COLOR = {
  good: "#10B981",
  warn: "#FBBF24",
  danger: "#F43F5E",
};

// Projection: lat 29.4–33.4 → y 20–560, lng 34.25–35.95 → x 20–220.
const X_MIN = 34.25,
  X_SCALE = 117.6;
const Y_MAX = 33.4,
  Y_SCALE = 135;
const project = (lat: number, lng: number) => ({
  x: 20 + (lng - X_MIN) * X_SCALE,
  y: 20 + (Y_MAX - lat) * Y_SCALE,
});

// Stylized Israel outline traced from approximate boundary points,
// projected through the same lat/lng scaling so branches sit inside it.
const ISRAEL_PATH =
  "M 208,34 L 173,67 L 120,74 L 114,81 L 91,135 L 79,202 " +
  "L 49,270 L 26,317 L 49,371 L 91,439 L 91,506 L 99,547 " +
  "L 108,540 L 126,439 L 138,371 L 161,304 L 167,229 L 173,142 Z";

// Floating KPI badges — desktop only. Anchored to specific branches.
const FLOATING = [
  {
    branch: "חדרה",
    label: "מטה",
    kpi: "₪847K",
    delta: "+12.3%",
    side: "right",
  },
  {
    branch: "אילת",
    label: "סניף הדרום",
    kpi: "94%",
    delta: "יעד",
    side: "right",
  },
  {
    branch: "אשדוד",
    label: "התראת מלאי",
    kpi: "3 פריטים",
    delta: "דחוף",
    side: "left",
  },
];

export function BranchNetworkMap() {
  const light = useLightMotion();
  const hq = project(HADERA.lat, HADERA.lng);
  const dots = BRANCHES.map((b) => ({ ...b, ...project(b.lat, b.lng) }));

  return (
    <div
      dir="ltr"
      className="relative w-full max-w-[260px] mx-auto"
      style={{ aspectRatio: "240 / 600" }}
    >
      <svg
        viewBox="0 0 240 600"
        className="absolute inset-0 w-full h-full"
        fill="none"
        aria-label="מפת סניפים בישראל"
      >
        <defs>
          <radialGradient id="map-bg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFE8DE" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FDF8F6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="country-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC4E59" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0.05" />
          </linearGradient>
          <filter id="dot-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Soft backdrop glow */}
        <rect width="240" height="600" fill="url(#map-bg)" />

        {/* Country outline — draws itself on mount */}
        <motion.path
          d={ISRAEL_PATH}
          fill="url(#country-fill)"
          stroke="#DC4E59"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeDasharray="3 4"
          initial={light ? false : { pathLength: 0, opacity: 0 }}
          animate={
            light
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration: light ? 0 : 1.6, ease: "easeOut" }}
        />

        {/* Network lines from HQ → branches */}
        {dots.map((b, i) => (
          <motion.line
            key={`line-${b.name}`}
            x1={hq.x}
            y1={hq.y}
            x2={b.x}
            y2={b.y}
            stroke={STATUS_COLOR[b.status]}
            strokeWidth="0.7"
            strokeOpacity="0.45"
            strokeDasharray="2 3"
            initial={light ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: light ? 0 : 1.6 + i * 0.06,
              duration: light ? 0 : 0.5,
              ease: "easeOut",
            }}
          />
        ))}

        {/* HQ marker — Hadera, ringed and labelled */}
        <g>
          {!light && (
            <motion.circle
              cx={hq.x}
              cy={hq.y}
              r="10"
              fill={STATUS_COLOR.good}
              opacity="0.25"
              animate={{ r: [10, 22, 10], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <circle
            cx={hq.x}
            cy={hq.y}
            r="7"
            fill="#FFFFFF"
            stroke={STATUS_COLOR.good}
            strokeWidth="2.5"
          />
          <circle cx={hq.x} cy={hq.y} r="3" fill={STATUS_COLOR.good} />
        </g>

        {/* Branch dots */}
        {dots.map((b, i) => (
          <g key={b.name}>
            {!light && b.status !== "good" && (
              <motion.circle
                cx={b.x}
                cy={b.y}
                r="6"
                fill={STATUS_COLOR[b.status]}
                opacity="0.3"
                animate={{ r: [6, 14, 6], opacity: [0.4, 0, 0.4] }}
                transition={{
                  duration: b.status === "danger" ? 1.6 : 2.2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.15,
                }}
              />
            )}
            <motion.circle
              cx={b.x}
              cy={b.y}
              r="4.5"
              fill="#FFFFFF"
              stroke={STATUS_COLOR[b.status]}
              strokeWidth="2"
              initial={light ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: light ? 0 : 2.0 + i * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 14,
              }}
              style={{ transformOrigin: `${b.x}px ${b.y}px` }}
            />
          </g>
        ))}
      </svg>

      {/* Floating KPI badges — desktop only */}
      {!light &&
        FLOATING.map((f, i) => {
          const target =
            f.branch === "חדרה" ? hq : dots.find((d) => d.name === f.branch);
          if (!target) return null;
          const xPct = (target.x / 240) * 100;
          const yPct = (target.y / 600) * 100;
          return (
            <motion.div
              key={f.branch}
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 2.6 + i * 0.25,
                type: "spring",
                stiffness: 180,
                damping: 16,
              }}
              className="absolute pointer-events-none"
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform:
                  f.side === "right"
                    ? "translate(12px, -50%)"
                    : "translate(calc(-100% - 12px), -50%)",
              }}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-[14px] border border-warm-border shadow-[0_8px_24px_-8px_rgba(220,78,89,0.18)] px-3 py-2 min-w-[100px]">
                <p className="text-[11px] text-[#A0AEC0] leading-none mb-1">
                  {f.label} · {f.branch}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-[15px] font-bold font-mono text-[#2D3748]"
                    dir="ltr"
                  >
                    {f.kpi}
                  </span>
                  <span className="text-[10px] font-semibold text-[#10B981]">
                    {f.delta}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

      {/* Subtle perpetual scan line — desktop only, signals "live" */}
      {!light && (
        <motion.div
          className="absolute inset-x-0 h-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #DC4E59 50%, transparent 100%)",
            opacity: 0.35,
          }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
