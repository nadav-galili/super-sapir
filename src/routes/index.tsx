import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  ShieldCheck,
  Users,
  MapPin,
  Bell,
  Cpu,
  Sparkles,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { PhoneMockup } from "@/components/home/PhoneMockup";
import { APP_NAME } from "@/lib/branding";
import { BrandLogo } from "@/components/branding/BrandLogo";

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
  { value: "380+", label: "מדדים בזמן אמת" },
  { value: "AI", label: "ניתוח חכם" },
  { value: "24/7", label: "ניטור רציף" },
];

const features = [
  {
    icon: BarChart3,
    title: "ניתוח מכירות",
    description: "מעקב מכירות בזמן אמת עם השוואות בין סניפים ומגמות צמיחה",
    color: "#DC4E59",
    span: "lg:col-span-2",
  },
  {
    icon: Sparkles,
    title: "AI תובנות",
    description: "ניתוח אוטומטי עם בינה מלאכותית — תדריך בוקר והמלצות פעולה",
    color: "#6C5CE7",
    span: "",
  },
  {
    icon: Users,
    title: "ניהול כח אדם",
    description: "תמונת מצב תקינה, תחלופה ועמידה ביעדי שעות",
    color: "#2EC4D5",
    span: "",
  },
  {
    icon: ShieldCheck,
    title: "בקרת איכות ומלאי",
    description: "ניטור ציוני איכות, ימי מלאי וזיהוי חריגות אוטומטי",
    color: "#F6B93B",
    span: "lg:col-span-2",
  },
  {
    icon: MapPin,
    title: "מפת סניפים",
    description: "מפה אינטראקטיבית עם סטטוס ביצועים ודירוג אזורי",
    color: "#DC4E59",
    span: "",
  },
  {
    icon: Bell,
    title: "התראות חכמות",
    description: "התראות על חריגות, יעדים ואירועים חריגים בזמן אמת",
    color: "#2EC4D5",
    span: "",
  },
  {
    icon: Cpu,
    title: "דוחות מותאמים",
    description: "דוחות מפורטים לפי תפקיד עם סינון, ייצוא והשוואה",
    color: "#6C5CE7",
    span: "lg:col-span-2",
  },
];

// ─── Components ─────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section
      ref={ref}
      className="relative min-h-[85vh] flex items-center overflow-hidden"
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

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center px-4 sm:px-6 py-10">
        {/* Text content with parallax */}
        <motion.div
          style={{ y: textY }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants}>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
                style={{
                  background: "#6C5CE7" + "12",
                  color: "#6C5CE7",
                  borderColor: "#6C5CE7" + "30",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                מונע בינה מלאכותית
              </span>
              <BrandLogo size={72} />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
            style={{ color: "#2D3748" }}
          >
            ניהול חכם
            <br />
            <span style={{ color: "#DC4E59" }}>לרשתות קמעונאיות</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg lg:text-xl leading-relaxed max-w-lg"
            style={{ color: "#4A5568" }}
          >
            פלטפורמת ניתוח וניהול שמרכזת את כל הנתונים של הרשת במקום אחד ומספקת
            תובנות ממוקדות לכל דרג ניהולי.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link
              to="/store-manager"
              search={{ view: "overview" }}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-[12px] text-base transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #DC4E59, #E8777F)",
              }}
            >
              כניסה לדמו
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-8 pt-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-2xl font-bold font-mono"
                  style={{ color: "#DC4E59" }}
                  dir="ltr"
                >
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Phone mockup with parallax + floating cards */}
        <motion.div
          style={{ y: phoneY }}
          initial={{ opacity: 0, scale: 0.88, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="relative flex justify-center max-w-[280px] mx-auto"
        >
          <PhoneMockup />

          {/* Floating metric cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute top-16 -left-24 bg-white/90 backdrop-blur-md rounded-[14px] border border-warm-border px-4 py-3 shadow-lg hidden sm:block"
          >
            <p className="text-[10px] text-[#A0AEC0]">מכירות היום</p>
            <p className="text-lg font-bold font-mono text-[#2D3748]" dir="ltr">
              ₪847K
            </p>
            <span
              className="text-[10px] font-semibold text-[#2EC4D5]"
              dir="ltr"
            >
              ▲ 12.3%
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-32 -right-24 bg-white/90 backdrop-blur-md rounded-[14px] border border-warm-border px-4 py-3 shadow-lg hidden sm:block"
          >
            <p className="text-[10px] text-[#A0AEC0]">ציון איכות</p>
            <p className="text-lg font-bold font-mono text-[#6C5CE7]" dir="ltr">
              92
            </p>
            <span
              className="text-[10px] font-semibold text-[#2EC4D5]"
              dir="ltr"
            >
              ▲ 8pts
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-[14px] border border-warm-border px-4 py-2 shadow-lg flex items-center gap-2"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#6C5CE7" + "20" }}
            >
              <Sparkles className="w-3 h-3 text-[#6C5CE7]" />
            </div>
            <p className="text-[10px] text-[#4A5568] font-medium">
              AI זיהה 3 חריגות
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#A0AEC0]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2
          className="text-3xl lg:text-4xl font-bold mb-4"
          style={{ color: "#2D3748" }}
        >
          הכל במקום אחד
        </h2>
        <p className="text-lg max-w-md mx-auto" style={{ color: "#A0AEC0" }}>
          כל הכלים שמנהל רשת צריך — בממשק אחד פשוט
        </p>
      </motion.div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group relative bg-white rounded-[20px] border border-warm-border p-7 cursor-default overflow-hidden ${feature.span}`}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${feature.color}08 0%, transparent 60%)`,
              }}
            />

            <div className="relative space-y-3">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: feature.color + "12" }}
              >
                <feature.icon
                  className="w-5 h-5"
                  style={{ color: feature.color }}
                />
              </div>
              <h3 className="text-base font-bold" style={{ color: "#2D3748" }}>
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4A5568" }}
              >
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto rounded-[24px] overflow-hidden p-10 sm:p-14 text-center"
        style={{
          background: "linear-gradient(135deg, #2D3748 0%, #1a202c 100%)",
        }}
      >
        {/* Decorative gradient orbs */}
        <div
          className="absolute top-0 right-0 w-60 h-60 rounded-full opacity-20 blur-3xl"
          style={{ background: "#DC4E59" }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 blur-3xl"
          style={{ background: "#6C5CE7" }}
        />

        <div className="relative space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            מוכנים לשדרג את ניהול הרשת?
          </h2>
          <p className="text-base text-white/60 max-w-md mx-auto">
            התחילו עם הדמו האינטראקטיבי וראו איך {APP_NAME} יכול לחסוך לכם זמן
            ולהגדיל רווחים.
          </p>
          <Link
            to="/store-manager"
            search={{ view: "overview" }}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-[12px] text-base transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #DC4E59, #E8777F)" }}
          >
            נסו עכשיו בחינם
            <ArrowLeft className="w-4 h-4" />
          </Link>
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

      {/* Marquee strip */}
      <div className="py-5 border-y border-warm-border overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-12 items-center">
              {[
                "ניתוח מכירות",
                "בקרת איכות",
                "כח אדם",
                "ניהול מלאי",
                "AI תובנות",
                "מפת סניפים",
                "דוחות",
                "התראות",
              ].map((text) => (
                <span
                  key={`${setIdx}-${text}`}
                  className="text-sm font-medium"
                  style={{ color: "#A0AEC0" }}
                >
                  {text} <span className="mx-4 text-[#FFE8DE]">●</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      <FeaturesSection />
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
          className="flex items-center justify-center gap-4 text-sm"
          style={{ color: "#4A5568" }}
        >
          <span>Nadav Galili</span>
          <span style={{ color: "#A0AEC0" }}>|</span>
          <a
            href="mailto:nadavg@retalio.online"
            className="hover:underline"
            style={{ color: "#DC4E59" }}
          >
            nadavg@retalio.online
          </a>
          <span style={{ color: "#A0AEC0" }}>|</span>
          <a
            href="tel:052-4417944"
            dir="ltr"
            className="hover:underline"
            style={{ color: "#DC4E59" }}
          >
            052-4417944
          </a>
        </div>
        <p className="text-xs" style={{ color: "#A0AEC0" }}>
          © {new Date().getFullYear()} Nadav Galili. כל הזכויות שמורות.
        </p>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
