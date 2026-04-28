import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { APP_NAME, BRAND_LOGO_SRC } from "@/lib/branding";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { BranchNetworkMap } from "@/components/home/BranchNetworkMap";
import { BentoLiveDashboard } from "@/components/home/BentoLiveDashboard";
import { useLightMotion } from "@/hooks/useLightMotion";
// Imports kept for the commented-out demo CTAs — uncomment together with the
// JSX blocks in HeroSection and CTASection when meeting the client.
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MagneticButton } from "@/components/home/MagneticButton";
/* eslint-enable @typescript-eslint/no-unused-vars */

// ─── Stagger animation variants ─────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ─── Data ───────────────────────────────────────────────────────
const stats = [
  { value: "12", label: "סניפים בניטור" },
  { value: "380+", label: "מדדים בזמן אמת" },
  { value: "24/7", label: "ניטור רציף" },
];

const TICKER_EVENTS = [
  "סניף תל אביב · מכירות +12.3%",
  "אשדוד · התראת מלאי קוטג'",
  "AI · 47 תובנות חדשות היום",
  "חדרה · יעד שבועי הושג",
  "ראשון לציון · תור בקופה > 6 דק׳",
  "טבריה · ציון איכות 94/100",
  "באר שבע · משלוח התקבל",
  "כל הצפון · מכירות גבינות בעלייה",
];

// ─── Hero ───────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const light = useLightMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const mapY = useTransform(scrollYProgress, [0, 1], [0, light ? 0 : 60]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, light ? 0 : -20]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #DC4E59 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 -right-20 w-72 h-72 rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #6C5CE7 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-48 h-48 rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #2EC4D5 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center px-4 sm:px-6 py-10 lg:py-16">
        {/* Text content */}
        <motion.div
          style={{ y: textY }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-7 lg:space-y-8"
        >
          <motion.div variants={itemVariants}>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold border"
                style={{
                  background: "#6C5CE7" + "12",
                  color: "#6C5CE7",
                  borderColor: "#6C5CE7" + "30",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                מונע בינה מלאכותית
              </span>
              <div
                dir="ltr"
                className="inline-flex shrink-0 items-center self-start h-32 sm:h-40 lg:h-56"
                aria-label={APP_NAME}
              >
                <img
                  src={BRAND_LOGO_SRC}
                  alt={APP_NAME}
                  className="block h-full w-auto max-w-full object-contain"
                />
              </div>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold leading-[1.05] tracking-tight"
            style={{ color: "#2D3748" }}
          >
            כל הסניפים שלכם.
            <br />
            <span style={{ color: "#DC4E59" }}>במסך אחד.</span>
            <br />
            בזמן אמת.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-[17px] lg:text-[20px] leading-relaxed max-w-xl"
            style={{ color: "#4A5568" }}
          >
            רטליו מאחדת את כל הנתונים של הרשת — מכירות, מלאי, איכות, כח אדם —
            לכדי לוח בקרה חי שמדבר עם כל מנהל בשפה שלו.
          </motion.p>

          {/* Demo CTA — hidden for the public landing page. Uncomment for the client meeting. */}
          {/*
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4 items-center"
          >
            <MagneticButton strength={0.35}>
              <Link
                to="/store-manager"
                search={{ view: "overview" }}
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-[14px] text-[17px] transition-shadow active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #DC4E59, #E8777F)",
                  boxShadow:
                    "0 14px 30px -10px rgba(220, 78, 89, 0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              >
                כניסה לדמו חי
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </MagneticButton>
          </motion.div>
          */}

          {/* Stats strip */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-x-10 gap-y-4 pt-6 border-t border-warm-border"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-[28px] font-bold font-mono leading-none"
                  style={{ color: "#DC4E59" }}
                  dir="ltr"
                >
                  {stat.value}
                </p>
                <p className="text-[13px] mt-1.5" style={{ color: "#788390" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Branch network map (replaces phone mockup) */}
        <motion.div
          style={{ y: mapY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          <BranchNetworkMap />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <motion.div
          animate={light ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#788390]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Live ticker strip (replaces feature-name marquee) ────────────

function LiveTickerStrip() {
  const light = useLightMotion();
  const items = [...TICKER_EVENTS, ...TICKER_EVENTS];
  return (
    <div
      className="py-4 border-y overflow-hidden"
      style={{
        borderColor: "#FFE8DE",
        background:
          "linear-gradient(90deg, #FDF8F6 0%, #FFFFFF 50%, #FDF8F6 100%)",
      }}
    >
      <div className="flex items-center gap-3 px-4">
        <span className="flex items-center gap-2 shrink-0">
          <span className="relative flex w-2 h-2">
            {!light && (
              <motion.span
                className="absolute inset-0 rounded-full bg-[#DC4E59]"
                animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            <span className="relative w-2 h-2 rounded-full bg-[#DC4E59]" />
          </span>
          <span className="text-[12px] font-bold tracking-[0.18em] text-[#DC4E59] uppercase">
            live
          </span>
        </span>
        <span className="w-px h-4 bg-[#FFE8DE] shrink-0" />
        <div className="overflow-hidden flex-1">
          <motion.div
            animate={light ? {} : { x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-10 whitespace-nowrap"
          >
            {items.map((text, i) => (
              <span
                key={i}
                className="text-[14px] font-medium flex items-center gap-3"
                style={{ color: "#4A5568" }}
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "#788390" }}
                />
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── CTA ────────────────────────────────────────────────────────

const CLOSING_LEDGER = [
  { id: "01", label: "סניפים בניטור", value: "120" },
  { id: "02", label: "מדדים בזמן אמת", value: "380+" },
  { id: "03", label: "תובנות יומיות", value: "AI" },
];

function CTASection() {
  return (
    <section className="py-20 lg:py-32 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-[1100px] mx-auto"
      >
        {/* Eyebrow rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-px origin-right mb-10"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #DC4E59 50%, transparent 100%)",
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-end">
          {/* Editorial split-typography manifesto */}
          <div className="space-y-6">
            <div className="flex items-center gap-3" dir="ltr">
              <span className="w-8 h-px" style={{ background: "#DC4E59" }} />
              <p
                className="text-[13px] font-medium tracking-[0.32em]"
                style={{ color: "#DC4E59" }}
              >
                RETALIO
              </p>
            </div>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold leading-[1.05] tracking-tight"
              style={{ color: "#2D3748" }}
            >
              לא עוד דוחות.
              <br />
              <span style={{ color: "#DC4E59" }}>בקרה חיה.</span>
            </h2>
            <p
              className="text-[18px] lg:text-[20px] leading-relaxed max-w-xl"
              style={{ color: "#4A5568" }}
            >
              כל מנהל בשפה שלו. כל סניף במקום אחד. כל החלטה מבוססת נתון אחד —
              עדכני, חי, מדויק.
            </p>
          </div>

          {/* Numbered ledger — newspaper-column feel */}
          <ol className="relative space-y-1 lg:border-s lg:ps-10 lg:border-warm-border">
            {CLOSING_LEDGER.map((row, i) => (
              <motion.li
                key={row.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.08,
                  type: "spring",
                  stiffness: 90,
                  damping: 18,
                }}
                className="flex items-baseline gap-4 py-4 border-b border-warm-border last:border-b-0"
              >
                <span
                  className="text-[13px] font-mono font-semibold tabular-nums w-7 shrink-0"
                  style={{ color: "#DC4E59" }}
                  dir="ltr"
                >
                  {row.id}
                </span>
                <span
                  className="flex-1 text-[15px]"
                  style={{ color: "#4A5568" }}
                >
                  {row.label}
                </span>
                <span
                  className="text-[24px] lg:text-[28px] font-bold font-mono tabular-nums leading-none"
                  style={{ color: "#2D3748" }}
                  dir="ltr"
                >
                  {row.value}
                </span>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Footer rule + email CTA */}
        <div className="mt-12 lg:mt-16 flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-warm-border">
          <span
            className="text-[13px] font-mono uppercase tracking-[0.2em]"
            style={{ color: "#788390" }}
            dir="ltr"
          >
            built for retail, in tel aviv
          </span>
          <a
            href="mailto:nadav@retalio.net?subject=%D7%91%D7%A7%D7%A9%D7%AA%20%D7%94%D7%A6%D7%A2%D7%94%20-%20Retalio&body=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A7%D7%91%D7%9C%20%D7%94%D7%A6%D7%A2%D7%94%20%D7%9C%D7%A4%D7%9C%D7%98%D7%A4%D7%95%D7%A8%D7%9E%D7%AA%20Retalio."
            className="group inline-flex items-center gap-3 text-[15px] font-semibold transition-colors"
            style={{ color: "#2D3748" }}
          >
            <span className="relative flex w-2 h-2">
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: "#DC4E59" }}
                animate={{ scale: [1, 2.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span
                className="relative w-2 h-2 rounded-full"
                style={{ background: "#DC4E59" }}
              />
            </span>
            <span>
              לקבלת הצעה —{" "}
              <span
                className="underline decoration-[#DC4E59]/40 underline-offset-4 group-hover:decoration-[#DC4E59] transition-colors"
                style={{ color: "#DC4E59" }}
                dir="ltr"
              >
                nadav@retalio.net
              </span>
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────

function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <LiveTickerStrip />
      <BentoLiveDashboard />
      <CTASection />

      {/* Footer */}
      <footer
        className="py-10 px-4 text-center space-y-3"
        style={{ borderTop: "1px solid #F5E6DE" }}
      >
        <div className="flex justify-center">
          <BrandLogo size={64} />
        </div>
        <div
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[14px]"
          style={{ color: "#4A5568" }}
        >
          <span>Nadav Galili</span>
          <span style={{ color: "#788390" }}>·</span>
          <a
            href="mailto:nadav@retalio.net"
            className="hover:underline"
            style={{ color: "#DC4E59" }}
          >
            nadav@retalio.net
          </a>
          <span style={{ color: "#788390" }}>·</span>
          <a
            href="tel:052-4417944"
            dir="ltr"
            className="hover:underline"
            style={{ color: "#DC4E59" }}
          >
            052-4417944
          </a>
        </div>
        <p className="text-[12px]" style={{ color: "#788390" }}>
          © {new Date().getFullYear()} Retalio. כל הזכויות שמורות.
        </p>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
