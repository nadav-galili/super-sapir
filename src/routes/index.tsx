import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { APP_NAME, BRAND_LOGO_SRC } from "@/lib/branding";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { BranchNetworkMap } from "@/components/home/BranchNetworkMap";
import { BentoLiveDashboard } from "@/components/home/BentoLiveDashboard";
import { MagneticButton } from "@/components/home/MagneticButton";
import { useLightMotion } from "@/hooks/useLightMotion";

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
            <span className="text-[14px]" style={{ color: "#A0AEC0" }}>
              ללא הרשמה · 30 שניות
            </span>
          </motion.div>

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
                <p className="text-[13px] mt-1.5" style={{ color: "#A0AEC0" }}>
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
          <ChevronDown className="w-5 h-5 text-[#A0AEC0]" />
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
                  style={{ background: "#A0AEC0" }}
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

function CTASection() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-4xl mx-auto rounded-[28px] overflow-hidden p-10 sm:p-14 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-10 items-center"
        style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #FFF5F0 100%)",
          border: "1px solid #FFE8DE",
          boxShadow: "0 24px 60px -28px rgba(220, 78, 89, 0.18)",
        }}
      >
        {/* Subtle decorative orb — warm tint */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-[0.18] blur-3xl pointer-events-none"
          style={{ background: "#DC4E59" }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full opacity-[0.12] blur-3xl pointer-events-none"
          style={{ background: "#6C5CE7" }}
        />

        <div className="relative text-right space-y-4">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold border"
            style={{
              background: "rgba(220, 78, 89, 0.08)",
              color: "#DC4E59",
              borderColor: "rgba(220, 78, 89, 0.20)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            דמו חי
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.1] tracking-tight"
            style={{ color: "#2D3748" }}
          >
            הרשת שלכם. <span style={{ color: "#DC4E59" }}>במסך אחד.</span>
          </h2>
          <p
            className="text-[16px] sm:text-[17px] leading-relaxed max-w-md"
            style={{ color: "#4A5568" }}
          >
            דמו אינטראקטיבי מלא, נטען ב-30 שניות. ללא הרשמה.
          </p>
          <ul
            className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-[13px]"
            style={{ color: "#4A5568" }}
          >
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              12 סניפים
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4D5]" />
              380+ מדדים
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
              AI תובנות
            </li>
          </ul>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <MagneticButton strength={0.3}>
            <Link
              to="/store-manager"
              search={{ view: "overview" }}
              className="inline-flex items-center gap-2 px-9 py-4 text-white font-semibold rounded-[14px] text-[17px] transition-shadow active:scale-[0.97] whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #DC4E59, #E8777F)",
                boxShadow:
                  "0 18px 36px -12px rgba(220, 78, 89, 0.5), inset 0 1px 0 rgba(255,255,255,0.22)",
              }}
            >
              נסו עכשיו
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </MagneticButton>
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
          <span style={{ color: "#A0AEC0" }}>·</span>
          <a
            href="mailto:nadav@retalio.net"
            className="hover:underline"
            style={{ color: "#DC4E59" }}
          >
            nadav@retalio.net
          </a>
          <span style={{ color: "#A0AEC0" }}>·</span>
          <a
            href="tel:052-4417944"
            dir="ltr"
            className="hover:underline"
            style={{ color: "#DC4E59" }}
          >
            052-4417944
          </a>
        </div>
        <p className="text-[12px]" style={{ color: "#A0AEC0" }}>
          © {new Date().getFullYear()} Retalio. כל הזכויות שמורות.
        </p>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
