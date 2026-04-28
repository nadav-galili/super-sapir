import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, memo, type ReactNode } from "react";
import {
  TrendingUp,
  Sparkles,
  Activity,
  AlertTriangle,
  Package,
  Bell,
  Target,
  Megaphone,
  ChartLine,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useLightMotion } from "@/hooks/useLightMotion";

// ─── Shared card chrome ─────────────────────────────────────────────

interface CardProps {
  className?: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  accent: string;
}

function Card({ className = "", eyebrow, title, children, accent }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
      className={`group relative bg-white rounded-[20px] border border-warm-border p-6 lg:p-7 overflow-hidden ${className}`}
      style={{
        boxShadow: "0 12px 32px -16px rgba(220, 78, 89, 0.10)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: accent }}
        />
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: accent }}
        >
          {eyebrow}
        </p>
      </div>
      <h3 className="text-[19px] font-bold mb-4" style={{ color: "#2D3748" }}>
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

// ─── Card 1: Promo simulator wizard preview ─────────────────────────

const PROMO_STEPS = [
  { id: 1, label: "בריף" },
  { id: 2, label: "מטרה" },
  { id: 3, label: "סוג מבצע" },
  { id: 4, label: "התניה" },
  { id: 5, label: "יעדים" },
  { id: 6, label: "תחזית" },
  { id: 7, label: "יישום" },
  { id: 8, label: "בקרה" },
  { id: 9, label: "תיעוד" },
];

type Phase = "brief" | "plan" | "forecast" | "deploy";

const phaseFor = (step: number): Phase => {
  if (step <= 2) return "brief";
  if (step <= 4) return "plan";
  if (step <= 6) return "forecast";
  return "deploy";
};

function PhaseBrief() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <Target className="w-4 h-4 text-[#DC4E59]" />
        <span className="text-[13px] font-semibold text-[#2D3748]">
          קטגוריה: מוצרי חלב
        </span>
      </div>
      <div className="rounded-[10px] bg-[#FDF8F6]/70 border border-warm-border px-3 py-2.5">
        <p className="text-[12px] text-[#788390] mb-1">בריף ראשוני</p>
        <p className="text-[13px] leading-snug text-[#4A5568]">
          הקפצת מכירות יוגורט פרימיום בסניפי המרכז לקראת הקיץ.
        </p>
      </div>
    </div>
  );
}

function PhasePlan() {
  const options = [
    { label: "1+1", active: false },
    { label: "30% הנחה", active: true },
    { label: "כפול בקופה", active: false },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <Megaphone className="w-4 h-4 text-[#DC4E59]" />
        <span className="text-[13px] font-semibold text-[#2D3748]">
          סוג מבצע נבחר
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <motion.span
            key={o.label}
            layout
            className="px-3 py-1.5 rounded-full text-[12px] font-semibold border"
            style={{
              background: o.active ? "#DC4E59" : "#FFFFFF",
              color: o.active ? "#FFFFFF" : "#788390",
              borderColor: o.active ? "#DC4E59" : "#FFE8DE",
            }}
          >
            {o.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function PhaseForecast() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 mb-1">
        <ChartLine className="w-4 h-4 text-[#DC4E59]" />
        <span className="text-[13px] font-semibold text-[#2D3748]">
          תחזית uplift
        </span>
      </div>
      <div className="relative h-[72px]" dir="ltr">
        <svg
          viewBox="0 0 320 72"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <linearGradient id="forecast-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC4E59" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#DC4E59" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Baseline (dotted) */}
          <line
            x1="0"
            y1="48"
            x2="320"
            y2="48"
            stroke="#788390"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          {/* Confidence band */}
          <motion.path
            d="M 0 48 L 60 44 L 120 38 L 180 28 L 240 18 L 320 10 L 320 24 L 240 32 L 180 42 L 120 52 L 60 56 L 0 60 Z"
            fill="#DC4E59"
            fillOpacity="0.12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Forecast line */}
          <motion.path
            d="M 0 54 L 60 48 L 120 38 L 180 28 L 240 16 L 320 6"
            fill="none"
            stroke="#DC4E59"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
      </div>
    </div>
  );
}

function PhaseDeploy() {
  const branches = ["חיפה", "ת״א", "חדרה", "ראשל״צ", "אשדוד"];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
        <span className="text-[13px] font-semibold text-[#2D3748]">
          ייושם ב-{branches.length} סניפים
        </span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {branches.map((b, i) => (
          <motion.span
            key={b}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: i * 0.06,
              type: "spring",
              stiffness: 240,
              damping: 18,
            }}
            className="px-2.5 py-1 rounded-[8px] text-[12px] font-medium border border-warm-border bg-[#FDF8F6]/70 text-[#4A5568]"
          >
            {b}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

const PromoSimulatorCard = memo(function PromoSimulatorCard() {
  const light = useLightMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (light) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1100);
    return () => clearInterval(interval);
  }, [light]);

  const step = light ? 9 : (tick % 9) + 1;
  const phase = phaseFor(step);
  const completePct = ((step - 1) / 8) * 100;

  return (
    <Card
      eyebrow="סימולטור מבצע · AI"
      title="תכנון מבצע ב-9 צעדים"
      accent="#DC4E59"
      className="lg:col-span-7"
    >
      {/* Step pills with progress track underneath */}
      <div className="relative mb-5" dir="ltr">
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#FFE8DE]" />
        <motion.div
          className="absolute right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{
            background: "linear-gradient(90deg, #DC4E59, #E8777F)",
          }}
          initial={false}
          animate={{ width: `${completePct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
        <ol className="relative flex justify-between" dir="rtl">
          {PROMO_STEPS.map((s) => {
            const state =
              s.id < step ? "done" : s.id === step ? "active" : "todo";
            return (
              <li key={s.id} className="flex flex-col items-center gap-1.5">
                <motion.span
                  layout
                  className="relative flex items-center justify-center w-7 h-7 rounded-full border-2 text-[11px] font-mono font-bold"
                  style={{
                    background:
                      state === "active"
                        ? "linear-gradient(135deg, #DC4E59, #E8777F)"
                        : state === "done"
                          ? "#10B981"
                          : "#FFFFFF",
                    color: state === "todo" ? "#788390" : "#FFFFFF",
                    borderColor:
                      state === "active"
                        ? "#DC4E59"
                        : state === "done"
                          ? "#10B981"
                          : "#FFE8DE",
                  }}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    s.id
                  )}
                  {state === "active" && !light && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{
                        boxShadow: "0 0 0 4px rgba(220, 78, 89, 0.25)",
                      }}
                      animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                    />
                  )}
                </motion.span>
                <span
                  className="text-[10px] font-medium text-center leading-tight max-w-[52px]"
                  style={{
                    color: state === "todo" ? "#788390" : "#4A5568",
                  }}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Phase content panel */}
      <div className="rounded-[14px] border border-warm-border bg-white p-4 min-h-[120px] mb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={light ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {phase === "brief" && <PhaseBrief />}
            {phase === "plan" && <PhasePlan />}
            {phase === "forecast" && <PhaseForecast />}
            {phase === "deploy" && <PhaseDeploy />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Forecast summary strip */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-warm-border">
        <div className="flex items-center gap-3 lg:gap-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#788390] mb-0.5">
              uplift חזוי
            </p>
            <p
              className="text-[18px] font-bold font-mono text-[#10B981] leading-none"
              dir="ltr"
            >
              +18.7%
            </p>
          </div>
          <div className="w-px h-8 bg-[#FFE8DE]" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#788390] mb-0.5">
              ROI
            </p>
            <p
              className="text-[18px] font-bold font-mono text-[#2D3748] leading-none"
              dir="ltr"
            >
              3.2x
            </p>
          </div>
          <div className="w-px h-8 bg-[#FFE8DE]" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#788390] mb-0.5">
              ביטחון
            </p>
            <p
              className="text-[18px] font-bold font-mono text-[#6C5CE7] leading-none"
              dir="ltr"
            >
              87%
            </p>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-[12px] font-semibold text-[#DC4E59]">
          פתח סימולטור
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
      </div>
    </Card>
  );
});

// ─── Card 2: AI typewriter ──────────────────────────────────────────

const AI_INSIGHTS = [
  "זוהתה ירידה של 18% במכירות יוגורט בסניף נתניה — בדוק תאריכי תפוגה.",
  "סניף תל אביב עוקף יעד שבועי ב-12.3% — שקול לחזק מלאי בקטגוריות חמות.",
  "אשדוד: 3 מוצרים מתחת לסף מינימלי. הזמנה מומלצת תוך 24 שעות.",
  "מגמה צולבת: מכירות גבינות בעלייה ב-3 סניפי הצפון. הזדמנות לקידום.",
];

const AITypewriterCard = memo(function AITypewriterCard() {
  const light = useLightMotion();
  const [insightIdx, setInsightIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");

  useEffect(() => {
    if (light) return;
    const target = AI_INSIGHTS[insightIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < target.length) {
        timer = setTimeout(() => setText(target.slice(0, text.length + 1)), 28);
      } else {
        timer = setTimeout(() => setPhase("pause"), 2400);
      }
    } else if (phase === "pause") {
      timer = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), 14);
      } else {
        timer = setTimeout(() => {
          setInsightIdx((i) => (i + 1) % AI_INSIGHTS.length);
          setPhase("typing");
        }, 0);
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, insightIdx, light]);

  const displayText = light ? AI_INSIGHTS[0] : text;

  return (
    <Card
      eyebrow="AI · סוכן ניתוח"
      title="תובנות בזמן אמת"
      accent="#6C5CE7"
      className="lg:col-span-5"
    >
      <div
        className="rounded-[14px] p-4 min-h-[180px] flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, rgba(108,92,231,0.06) 0%, rgba(108,92,231,0.02) 100%)",
          border: "1px solid rgba(108,92,231,0.14)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{ background: "rgba(108,92,231,0.14)" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
          </div>
          <span className="text-[12px] font-semibold text-[#6C5CE7] tracking-wide">
            Retalio AI
          </span>
          {!light && (
            <motion.span
              className="ms-auto text-[10px] font-mono text-[#6C5CE7]/70"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              ANALYZING
            </motion.span>
          )}
        </div>

        <p
          className="text-[15px] leading-relaxed flex-1"
          style={{ color: "#2D3748" }}
        >
          {displayText}
          {!light && (
            <motion.span
              className="inline-block w-[2px] h-[1em] ms-0.5 align-middle bg-[#6C5CE7]"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-4 text-[12px] text-[#788390]">
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5" />
          {AI_INSIGHTS.length} תובנות חדשות היום
        </span>
      </div>
    </Card>
  );
});

// ─── Card 3: Branch heat grid ───────────────────────────────────────

const HEAT_BRANCHES = [
  { name: "חיפה", s: "good" as const },
  { name: "טבריה", s: "good" as const },
  { name: "עפולה", s: "warn" as const },
  { name: "חדרה", s: "good" as const },
  { name: "נתניה", s: "good" as const },
  { name: "כפר סבא", s: "good" as const },
  { name: "ת״א", s: "good" as const },
  { name: "ראשל״צ", s: "warn" as const },
  { name: "מודיעין", s: "good" as const },
  { name: "אשדוד", s: "danger" as const },
  { name: "ב״ש", s: "good" as const },
  { name: "אילת", s: "warn" as const },
];

const STATUS_FILL: Record<"good" | "warn" | "danger", string> = {
  good: "#10B981",
  warn: "#FBBF24",
  danger: "#F43F5E",
};

const BranchHeatGridCard = memo(function BranchHeatGridCard() {
  const light = useLightMotion();
  return (
    <Card
      eyebrow="סניפים · 12"
      title="מצב רשת"
      accent="#10B981"
      className="lg:col-span-4"
    >
      <div className="grid grid-cols-3 gap-2.5">
        {HEAT_BRANCHES.map((b, i) => (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: light ? 0 : i * 0.04,
              type: "spring",
              stiffness: 200,
              damping: 18,
            }}
            className="relative rounded-[10px] border border-warm-border bg-[#FDF8F6]/60 px-2 py-2.5 flex items-center gap-1.5"
          >
            <div className="relative flex w-2 h-2 shrink-0">
              {!light && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ background: STATUS_FILL[b.s] }}
                  animate={{
                    scale: [1, 2.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: b.s === "danger" ? 1.4 : 2.4,
                    repeat: Infinity,
                    delay: i * 0.12,
                  }}
                />
              )}
              <span
                className="relative w-2 h-2 rounded-full"
                style={{ background: STATUS_FILL[b.s] }}
              />
            </div>
            <span
              className="text-[12px] font-medium truncate"
              style={{ color: "#4A5568" }}
            >
              {b.name}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-border text-[12px]">
        <span
          className="flex items-center gap-1.5"
          style={{ color: "#10B981" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> 8 תקין
        </span>
        <span
          className="flex items-center gap-1.5"
          style={{ color: "#FBBF24" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" /> 3 התראות
        </span>
        <span
          className="flex items-center gap-1.5"
          style={{ color: "#F43F5E" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" /> 1 דחוף
        </span>
      </div>
    </Card>
  );
});

// ─── Card 4: Alerts feed (overshoot spring popups) ──────────────────

const ALERT_POOL = [
  {
    icon: AlertTriangle,
    branch: "אשדוד",
    msg: "מלאי קוטג' מתחת לסף",
    tone: "danger" as const,
  },
  {
    icon: TrendingUp,
    branch: "תל אביב",
    msg: "חריגה חיובית +18% הבוקר",
    tone: "good" as const,
  },
  {
    icon: Package,
    branch: "חדרה",
    msg: "משלוח התקבל · 47 פריטים",
    tone: "good" as const,
  },
  {
    icon: Bell,
    branch: "ראשון",
    msg: "תור בקופה > 6 דקות",
    tone: "warn" as const,
  },
  {
    icon: AlertTriangle,
    branch: "באר שבע",
    msg: "טמפ׳ קירור 9°C — בדוק",
    tone: "warn" as const,
  },
];

const TONE_COLOR: Record<"good" | "warn" | "danger", string> = {
  good: "#10B981",
  warn: "#FBBF24",
  danger: "#F43F5E",
};

const AlertsFeedCard = memo(function AlertsFeedCard() {
  const light = useLightMotion();
  // Render a stable rolling window of 3 alerts.
  const [head, setHead] = useState(0);

  useEffect(() => {
    if (light) return;
    const t = setInterval(
      () => setHead((h) => (h + 1) % ALERT_POOL.length),
      3200
    );
    return () => clearInterval(t);
  }, [light]);

  const visible = [0, 1, 2].map(
    (offset) => ALERT_POOL[(head + offset) % ALERT_POOL.length]
  );

  return (
    <Card
      eyebrow="התראות · חי"
      title="פעילות חריגה"
      accent="#F6B93B"
      className="lg:col-span-4"
    >
      <div className="space-y-2 min-h-[180px]">
        <AnimatePresence mode="popLayout">
          {visible.map((alert, idx) => {
            const Icon = alert.icon;
            return (
              <motion.div
                key={`${head}-${alert.branch}-${idx}`}
                layout
                initial={
                  idx === 0 && !light
                    ? { opacity: 0, scale: 0.85, y: -10 }
                    : { opacity: 1 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="flex items-start gap-3 rounded-[12px] border border-warm-border bg-[#FDF8F6]/50 px-3 py-2.5"
              >
                <div
                  className="w-8 h-8 rounded-[10px] shrink-0 flex items-center justify-center"
                  style={{ background: TONE_COLOR[alert.tone] + "1A" }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: TONE_COLOR[alert.tone] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: "#2D3748" }}
                  >
                    {alert.branch}
                  </p>
                  <p
                    className="text-[12px] leading-snug mt-0.5"
                    style={{ color: "#4A5568" }}
                  >
                    {alert.msg}
                  </p>
                </div>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: "#788390" }}
                  dir="ltr"
                >
                  {idx === 0 ? "now" : `${idx * 3}m`}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
});

// ─── Card 5: Category leaderboard (auto-reordering race) ────────────

interface LeaderEntry {
  name: string;
  share: number;
  delta: number;
  color: string;
}

// Two snapshots — the visualization swaps between them so positions reorder
// using Framer's `layout` prop. This mimics how categories shuffle in the
// live category-manager view.
const LEADERBOARD_FRAMES: LeaderEntry[][] = [
  [
    { name: "מוצרי חלב", share: 24.2, delta: 1.8, color: "#DC4E59" },
    { name: "מאפים טריים", share: 19.7, delta: 0.6, color: "#2EC4D5" },
    { name: "ירקות ופירות", share: 17.3, delta: -0.4, color: "#6C5CE7" },
    { name: "יין ואלכוהול", share: 12.1, delta: 2.4, color: "#F6B93B" },
    { name: "ניקיון לבית", share: 9.4, delta: -1.1, color: "#10B981" },
  ],
  [
    { name: "יין ואלכוהול", share: 22.8, delta: 4.2, color: "#F6B93B" },
    { name: "מוצרי חלב", share: 21.5, delta: -0.9, color: "#DC4E59" },
    { name: "מאפים טריים", share: 18.6, delta: -0.3, color: "#2EC4D5" },
    { name: "ירקות ופירות", share: 16.9, delta: 0.7, color: "#6C5CE7" },
    { name: "ניקיון לבית", share: 8.8, delta: -0.5, color: "#10B981" },
  ],
];

const MAX_SHARE = 25;

const CategoryLeaderCard = memo(function CategoryLeaderCard() {
  const light = useLightMotion();
  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    if (light) return;
    const interval = setInterval(() => {
      setFrameIdx((i) => (i + 1) % LEADERBOARD_FRAMES.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [light]);

  const rows = LEADERBOARD_FRAMES[frameIdx];

  return (
    <Card
      eyebrow="קטגוריות · השבוע"
      title="מי בראש?"
      accent="#DC4E59"
      className="lg:col-span-4"
    >
      <ol className="space-y-2.5">
        {rows.map((row, idx) => {
          const widthPct = (row.share / MAX_SHARE) * 100;
          const positive = row.delta >= 0;
          return (
            <motion.li
              key={row.name}
              layout
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="flex items-center gap-2.5"
              dir="rtl"
            >
              <span
                className="w-5 text-[13px] font-mono font-bold text-center shrink-0"
                style={{
                  color: idx === 0 ? "#DC4E59" : "#788390",
                }}
                dir="ltr"
              >
                {idx + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span
                    className="text-[13px] font-semibold truncate"
                    style={{ color: "#2D3748" }}
                  >
                    {row.name}
                  </span>
                  <span
                    className="text-[12px] font-mono font-bold shrink-0"
                    style={{ color: "#2D3748" }}
                    dir="ltr"
                  >
                    {row.share.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="relative h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#FFE8DE" }}
                  dir="ltr"
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${row.color}, ${row.color}CC)`,
                    }}
                    initial={false}
                    animate={{ width: `${widthPct}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 90,
                      damping: 22,
                      delay: light ? 0 : idx * 0.05,
                    }}
                  />
                </div>
              </div>

              <span
                className="text-[11px] font-mono font-semibold shrink-0 w-10 text-left"
                style={{
                  color: positive ? "#10B981" : "#F43F5E",
                }}
                dir="ltr"
              >
                {positive ? "▲" : "▼"} {Math.abs(row.delta).toFixed(1)}
              </span>
            </motion.li>
          );
        })}
      </ol>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-warm-border text-[12px]">
        <span style={{ color: "#788390" }}>נע מהשבוע הקודם</span>
        {!light && (
          <motion.span
            className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#DC4E59]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC4E59]" />
            sync
          </motion.span>
        )}
      </div>
    </Card>
  );
});

// ─── Section ────────────────────────────────────────────────────────

export function BentoLiveDashboard() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-12 lg:mb-16"
      >
        <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#DC4E59] mb-3">
          הפלטפורמה
        </span>
        <h2
          className="text-3xl lg:text-5xl font-bold tracking-tight leading-[1.1]"
          style={{ color: "#2D3748" }}
        >
          לוח בקרה <span style={{ color: "#DC4E59" }}>שחי בזמן אמת</span>
        </h2>
        <p
          className="text-[17px] lg:text-[19px] leading-relaxed mt-4 max-w-xl"
          style={{ color: "#4A5568" }}
        >
          לא עוד דוחות סטטיים. כל מטריקה, כל סניף, כל התראה — מתעדכנים תוך שניות
          וזמינים בכל מסך ניהולי.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <PromoSimulatorCard />
        <AITypewriterCard />
        <BranchHeatGridCard />
        <AlertsFeedCard />
        <CategoryLeaderCard />
      </div>
    </section>
  );
}
