import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BarChart3,
  ShieldCheck,
  Users,
  MapPin,
  FileText,
  Bell,
  Database,
  Cpu,
  Lightbulb,
} from 'lucide-react'
import { motion } from 'motion/react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PhoneMockup } from '@/components/home/PhoneMockup'

const steps = [
  {
    num: 1,
    icon: Database,
    color: '#DC4E59',
    title: 'חיבור נתונים',
    description: 'חיבור אוטומטי למערכות הקופה, המלאי והתפעול של הרשת',
  },
  {
    num: 2,
    icon: Cpu,
    color: '#2EC4D5',
    title: 'ניתוח אוטומטי',
    description: 'מנוע הניתוח מזהה מגמות, חריגות והזדמנויות בזמן אמת',
  },
  {
    num: 3,
    icon: Lightbulb,
    color: '#6C5CE7',
    title: 'קבלת החלטות',
    description: 'תובנות ממוקדות לכל תפקיד — מנהל סניף, אזור או קטגוריה',
  },
]

const features = [
  {
    icon: BarChart3,
    title: 'ניתוח מכירות',
    description: 'מעקב מכירות בזמן אמת, השוואות בין סניפים וזיהוי מגמות צמיחה',
  },
  {
    icon: ShieldCheck,
    title: 'בקרת איכות',
    description: 'ניטור ציוני איכות, ממצאי ביקורת והתראות על חריגות',
  },
  {
    icon: Users,
    title: 'ניהול כח אדם',
    description: 'תמונת מצב תקינה, תחלופת עובדים ועמידה ביעדי שעות',
  },
  {
    icon: MapPin,
    title: 'מפת סניפים',
    description: 'מפה אינטראקטיבית עם סטטוס סניפים, ביצועים ודירוג אזורי',
  },
  {
    icon: FileText,
    title: 'דוחות מותאמים',
    description: 'דוחות מפורטים לפי תפקיד עם אפשרות סינון, ייצוא והשוואה',
  },
  {
    icon: Bell,
    title: 'התראות בזמן אמת',
    description: 'התראות חכמות על חריגות, יעדים שלא עומדים ואירועים חריגים',
  },
]

function HomePage() {
  return (
    <PageContainer>
      {/* Section 1: Hero + CTA */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-10 lg:py-16">
        {/* Right column (RTL) — text content */}
        <div className="space-y-6">
          <h1
            className="text-3xl lg:text-4xl font-bold leading-tight"
            style={{ color: '#2D3748' }}
          >
            ניהול חכם לרשתות קמעונאיות
          </h1>
          <p
            className="text-lg leading-relaxed max-w-lg"
            style={{ color: '#4A5568' }}
          >
            פלטפורמת ניתוח וניהול שמרכזת את כל הנתונים של הרשת במקום אחד —
            מכירות, איכות, כח אדם ותפעול — ומספקת תובנות ממוקדות לכל דרג ניהולי.
          </p>
          <Link
            to="/store-manager"
            search={{ view: 'overview' }}
            className="inline-block px-8 py-3 text-white font-semibold rounded-[10px] transition-shadow hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #DC4E59, #E8777F)',
            }}
          >
            כניסה לדמו
          </Link>
        </div>

        {/* Left column (RTL) — phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="flex justify-center"
        >
          <PhoneMockup />
        </motion.div>
      </section>

      {/* Section 2: How It Works */}
      <section className="py-16">
        <h2
          className="text-2xl font-bold text-center mb-12"
          style={{ color: '#2D3748' }}
        >
          איך זה עובד?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="bg-white rounded-[16px] border p-6 text-center space-y-4 transition-shadow hover:shadow-[0_4px_24px_rgba(220,78,89,0.08)]"
              style={{ borderColor: '#FFE8DE' }}
            >
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-[20px] text-white text-sm font-bold"
                style={{ backgroundColor: step.color }}
              >
                {step.num}
              </span>
              <div className="flex justify-center">
                <step.icon size={32} style={{ color: step.color }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: '#2D3748' }}
              >
                {step.title}
              </h3>
              <p style={{ color: '#4A5568' }}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 3: Features */}
      <section className="py-16">
        <h2
          className="text-2xl font-bold text-center mb-12"
          style={{ color: '#2D3748' }}
        >
          יכולות המערכת
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="bg-white rounded-[16px] border p-6 space-y-3 transition-shadow hover:shadow-[0_4px_24px_rgba(220,78,89,0.08)]"
              style={{ borderColor: '#FFE8DE' }}
            >
              <feature.icon size={28} style={{ color: '#DC4E59' }} />
              <h3
                className="text-lg font-semibold"
                style={{ color: '#2D3748' }}
              >
                {feature.title}
              </h3>
              <p style={{ color: '#4A5568' }}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4: Footer */}
      <footer
        className="py-8 text-center space-y-2"
        style={{ borderTop: '1px solid #F5E6DE' }}
      >
        <p className="font-semibold" style={{ color: '#2D3748' }}>
          Sapir Analytics
        </p>
        <p className="text-sm" style={{ color: '#A0AEC0' }}>
          © {new Date().getFullYear()} Sapir Analytics. כל הזכויות שמורות.
        </p>
        <p className="text-xs" style={{ color: '#A0AEC0' }}>
          Powered by data-driven retail intelligence
        </p>
      </footer>
    </PageContainer>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
})
