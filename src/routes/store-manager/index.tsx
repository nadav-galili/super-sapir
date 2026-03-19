import { createFileRoute } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import { motion } from 'motion/react'
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart as ReBarChart,
} from 'recharts'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  Beef,
  CircleAlert,
  Crown,
  LayoutGrid,
  MapPin,
  PackageCheck,
  Salad,
  ScanSearch,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { COMPETITORS } from '@/data/constants'
import {
  haderaFullReport,
  privateLabelData,
  threeYearRevenue,
  type BranchFullReport,
} from '@/data/hadera-real'
import { allBranches, getBranch } from '@/data/mock-branches'
import { formatCurrency, formatCurrencyShort, formatNumber } from '@/lib/format'
import type { Branch } from '@/data/types'

const SURFACE_CLASS = 'border-white/70 bg-white/82 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] backdrop-blur-xl'

const CATEGORY_META = {
  fresh: { label: 'טרי', color: '#2f8f6b', glow: 'from-emerald-100 to-emerald-50' },
  food: { label: 'מזון', color: '#d97706', glow: 'from-amber-100 to-orange-50' },
  nonfood: { label: 'נון-פוד', color: '#3565d8', glow: 'from-blue-100 to-sky-50' },
} as const

type Tone = 'good' | 'warn' | 'bad'

interface DashboardSnapshot {
  report: BranchFullReport
  privateLabel: typeof privateLabelData
  threeYear: typeof threeYearRevenue
}

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: string
  delta: string
  detail: string
  tone: Tone
  accent: string
}

function signedPercent(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

function toneStyles(tone: Tone) {
  if (tone === 'good') {
    return {
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'bg-emerald-100 text-emerald-700',
      soft: 'bg-emerald-50/70',
    }
  }

  if (tone === 'warn') {
    return {
      pill: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'bg-amber-100 text-amber-700',
      soft: 'bg-amber-50/70',
    }
  }

  return {
    pill: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: 'bg-rose-100 text-rose-700',
    soft: 'bg-rose-50/70',
  }
}

function sectionMotion(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: 'easeOut' },
  }
}

function MetricCard({ icon, label, value, delta, detail, tone, accent }: MetricCardProps) {
  const styles = toneStyles(tone)
  const isPositive = !delta.startsWith('-')

  return (
    <Card className={`border ${SURFACE_CLASS} rounded-[28px]`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-500">{label}</div>
            <div className="text-3xl font-semibold tracking-tight text-slate-950" dir="ltr">
              {value}
            </div>
            <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles.pill}`} dir="ltr">
              {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {delta}
            </div>
          </div>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${styles.icon}`}
            style={{ backgroundImage: accent }}
          >
            {icon}
          </div>
        </div>
        <div className={`mt-4 rounded-2xl px-3 py-2 text-xs text-slate-600 ${styles.soft}`}>
          {detail}
        </div>
      </CardContent>
    </Card>
  )
}

function InsightChip({ icon, title, value, note, tone }: { icon: ReactNode; title: string; value: string; note: string; tone: Tone }) {
  const styles = toneStyles(tone)

  return (
    <div className={`rounded-[24px] border px-4 py-3 ${styles.pill}`}>
      <div className="flex items-center gap-2 text-xs font-semibold">
        {icon}
        {title}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-950" dir="ltr">
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-600">{note}</div>
    </div>
  )
}

function PerformanceRail({
  label,
  actual,
  target,
  detail,
  color,
}: {
  label: string
  actual: number
  target: number
  detail: string
  color: string
}) {
  const percentage = Math.max(0, Math.min(100, (actual / target) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <div className="text-xs text-slate-500">{detail}</div>
        </div>
        <div className="text-left text-sm font-semibold text-slate-900" dir="ltr">
          {formatCurrencyShort(actual)}
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: color }} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500" dir="ltr">
        <span>{percentage.toFixed(1)}%</span>
        <span>Target {formatCurrencyShort(target)}</span>
      </div>
    </div>
  )
}

function buildBranchSnapshot(branch: Branch): DashboardSnapshot {
  const seed = branch.branchNumber
  const metrics = branch.metrics
  const totalDepartmentSales = branch.departments.reduce((sum, department) => sum + department.sales, 0)
  const privateLabelSales = branch.departments
    .filter(department => department.isPrivateLabel)
    .reduce((sum, department) => sum + department.sales, 0)
  const sellingArea = 2300 + seed * 18
  const networkTarget = Math.round(metrics.networkSales * 1.04)
  const internetTarget = Math.round(metrics.internetSales * 1.08)
  const totalTarget = Math.round(metrics.totalSales * 1.05)
  const qualityTarget = 85
  const salaryTarget = 7.5
  const monthlyAvgTotal = Math.round(branch.monthlyTrends.reduce((sum, month) => sum + month.totalSales, 0) / branch.monthlyTrends.length)
  const monthlyAvgNetwork = Math.round(branch.monthlyTrends.reduce((sum, month) => sum + month.networkSales, 0) / branch.monthlyTrends.length)
  const monthlyAvgInternet = Math.round(branch.monthlyTrends.reduce((sum, month) => sum + month.internetSales, 0) / branch.monthlyTrends.length)

  return {
    report: {
      info: {
        branchNumber: branch.branchNumber,
        name: branch.name,
        manager: 'מנהל סניף',
        divisionManager: 'מנהל אזור',
        hasInternet: metrics.internetSales > 0,
        grade: metrics.qualityScore >= 82 ? 'A' : metrics.qualityScore >= 68 ? 'B' : 'C',
        sellingArea,
        revenuePerMeter: Math.round(metrics.totalSales / sellingArea),
      },
      sales: {
        network: {
          current: metrics.networkSales,
          lastYear: Math.round(metrics.networkSales / 1.03),
          target: networkTarget,
          monthlyAvg2025: monthlyAvgNetwork,
          ranking: 12 + (seed % 20),
          yoyChange: metrics.yoyGrowth + 1.4,
          vsTarget: Number((((metrics.networkSales - networkTarget) / networkTarget) * 100).toFixed(1)),
        },
        internet: {
          current: metrics.internetSales,
          lastYear: Math.round(metrics.internetSales / 1.05),
          target: internetTarget,
          monthlyAvg2025: monthlyAvgInternet,
          ranking: 2 + (seed % 8),
          yoyChange: Number((metrics.yoyGrowth - 4.2).toFixed(1)),
          vsTarget: Number((((metrics.internetSales - internetTarget) / internetTarget) * 100).toFixed(1)),
        },
        total: {
          current: metrics.totalSales,
          lastYear: Math.round(metrics.totalSales / 1.02),
          target: totalTarget,
          monthlyAvg2025: monthlyAvgTotal,
          yoyChange: metrics.yoyGrowth,
          vsTarget: Number((((metrics.totalSales - totalTarget) / totalTarget) * 100).toFixed(1)),
        },
        avgBasket: {
          current: metrics.avgBasket,
          change: Number((metrics.yoyGrowth * 0.6 + 3.1).toFixed(1)),
          ranking: 10 + (seed % 22),
        },
        customers: {
          current: Math.round(metrics.customersPerDay * 26),
          target: Math.round(metrics.customersPerDay * 27),
          change: Number((metrics.yoyGrowth - 1.8).toFixed(1)),
          ranking: 18 + (seed % 24),
        },
        revenuePerMeter: {
          ranking: 15 + (seed % 30),
          change: Number((metrics.yoyGrowth - 2.1).toFixed(1)),
        },
      },
      targets: {
        revenueToStore: Math.round(metrics.totalSales / sellingArea),
        salaryCostTarget: salaryTarget,
        qualityTarget,
      },
      operations: {
        qualityScore: {
          current: metrics.qualityScore,
          target: qualityTarget,
          ranking: 18 + (seed % 28),
        },
        freshQualityScore: {
          current: Math.min(100, metrics.qualityScore + 8 + (seed % 4)),
        },
        supplyRate: {
          current: metrics.supplyRate,
          shopperPercent: 30 + (seed % 12),
          ranking: 8 + (seed % 12),
        },
        internetSupplyProducts: {
          ordered: Math.round(metrics.internetSales / 160),
          actualPercent: Number((34 + (seed % 7) * 1.6).toFixed(1)),
        },
        meatWaste: metrics.meatWastePercent,
        fishWaste: Number((Math.max(0, metrics.meatWastePercent - 3.2)).toFixed(1)),
        customerComplaints: {
          current: metrics.complaints,
          target: 3,
        },
        focusReports: {
          current: 4 + (seed % 6),
          target: 10,
        },
        shopperUsage: {
          ramiLevy: Number((27 + (seed % 8) * 1.5).toFixed(1)),
          shufersal: Number((18 + (seed % 5) * 1.2).toFixed(1)),
        },
        annualWaste: {
          amount: Math.round(metrics.totalSales * 0.0046),
          percent: 0.46,
          prev2024: Math.round(metrics.totalSales * 0.0042),
          prev2023: Math.round(metrics.totalSales * 0.0049),
        },
      },
      compliance: {
        highInventory: {
          target: 60,
          actual: 55 + (seed % 12),
          met: seed % 5 < 3,
          ranking: 10 + (seed % 25),
        },
        missingActivities: {
          fixedTarget: 120,
          timeTarget: 131,
          actual: 118 + (seed % 14),
          deviation: Number((6 + (seed % 8) * 1.1).toFixed(1)),
          met: seed % 4 !== 0,
          ranking: 12 + (seed % 22),
        },
        returns: {
          target: 100,
          advancePercent: 90,
          timeTarget: 90,
          actual: 94 + (seed % 8),
          met: seed % 3 !== 0,
          ranking: 1 + (seed % 9),
        },
        redAlerts: {
          target: 40,
          actual: 33 + (seed % 11),
          redSubscriptions: 14 + (seed % 12),
          rate: Number((8 + (seed % 7) * 1.2).toFixed(1)),
          met: seed % 4 < 2,
          ranking: 17 + (seed % 30),
        },
      },
      hr: {
        authorized: metrics.totalEmployees - 2,
        actual: metrics.totalEmployees,
        salaryCostPercent: metrics.salaryCostPercent,
        salaryTarget,
        productivityRanking: 14 + (seed % 28),
        turnoverRate: metrics.turnoverRate,
        turnoverRanking: 8 + (seed % 18),
        recruitmentTotal: 40 + seed,
        placementCompanyPercent: 14 + (seed % 7),
        salaryExpense: {
          current: Math.round(metrics.totalSales * metrics.salaryCostPercent / 100),
          monthlyAvg2025: Math.round(metrics.totalSales * (metrics.salaryCostPercent - 0.2) / 100),
          monthlyAvg2024: Math.round(metrics.totalSales * (metrics.salaryCostPercent - 0.6) / 100),
        },
        salaryPercentOfRevenue: {
          current: metrics.salaryCostPercent,
          target: salaryTarget,
          threeYearAvg: [
            metrics.salaryCostPercent,
            Number((metrics.salaryCostPercent - 0.4).toFixed(1)),
            Number((metrics.salaryCostPercent - 0.8).toFixed(1)),
          ],
        },
        staffing: [
          { role: 'צוות ניהולי', authorized: 5, actual: 5 + Number(((seed % 3) * 0.2).toFixed(1)), gap: Number((((seed % 3) * 0.2)).toFixed(1)) },
          { role: 'ירקות', authorized: 8, actual: 7.5 + (seed % 4), gap: Number(((seed % 4) - 0.5).toFixed(1)) },
          { role: 'קופה/ית', authorized: 10, actual: 9 + (seed % 3), gap: Number(((seed % 3) - 1).toFixed(1)) },
          { role: 'מחסן', authorized: 7, actual: 7 + Number(((seed % 5) * 0.3).toFixed(1)), gap: Number(((seed % 5) * 0.3).toFixed(1)) },
          { role: 'סדרנות', authorized: 18, actual: 18 + (seed % 4), gap: seed % 4 },
          { role: 'מעדניה', authorized: 4, actual: 3 + Number(((seed % 4) * 0.4).toFixed(1)), gap: Number((((seed % 4) * 0.4) - 1).toFixed(1)) },
        ],
      },
      departments: branch.departments.map(department => ({
        id: department.id,
        name: department.name,
        category: (
          ['vegetables', 'fresh-chef', 'fresh-meat', 'fresh-fish', 'deli', 'pastries'].includes(department.id)
            ? 'fresh'
            : ['bread', 'grocery', 'drinks', 'frozen', 'dairy', 'organic'].includes(department.id)
              ? 'food'
              : 'nonfood'
        ),
        currentMonth: department.sales,
        yearToDate: Math.round(department.sales * 11.5),
        yoyChangePercent: department.yoyChange,
        sharePercent: department.sharePercent,
        targetSharePercent: department.targetShare,
        shareChangePercent: Number((department.sharePercent - department.targetShare).toFixed(1)),
      })),
      monthly: branch.monthlyTrends.map((month, index) => ({
        month: month.month,
        monthNum: month.monthNum,
        currentSales: month.totalSales,
        lastYearSales: Math.round(month.totalSales / (index % 3 === 0 ? 0.99 : 1.03)),
        yoyChange: Number((((month.totalSales - Math.round(month.totalSales / 1.02)) / Math.round(month.totalSales / 1.02)) * 100).toFixed(1)),
        businessDaysImpact: Number((((index % 5) - 2) * 1.4).toFixed(1)),
        salaryCostPercent: Number((metrics.salaryCostPercent + ((index % 4) - 1.5) * 0.2).toFixed(1)),
        supplyRate: Math.min(99, metrics.supplyRate + (index % 4) - 1),
        shopperUsage: Number((25 + (seed % 5) * 1.4).toFixed(1)),
        qualityScore: Math.max(55, Math.min(94, metrics.qualityScore + ((index % 5) - 2) * 3)),
        freshQualityScore: Math.max(64, Math.min(100, metrics.qualityScore + 9 + ((index % 4) - 1) * 2)),
        focusReports: 4 + (index % 6),
        customerComplaints: Math.max(0, metrics.complaints + ((index % 4) - 2)),
        meatWastePercent: Number(Math.max(0, metrics.meatWastePercent + ((index % 5) - 2) * 0.6).toFixed(1)),
      })),
      expenses: [
        { name: 'שכר', currentMonth: Math.round(metrics.totalSales * metrics.salaryCostPercent / 100), monthlyAvg2025: Math.round(metrics.totalSales * 0.08), monthlyAvg2024: Math.round(metrics.totalSales * 0.076), percentOfRevenue: Number(metrics.salaryCostPercent.toFixed(1)) },
        { name: 'שכירות ואריזה', currentMonth: Math.round(metrics.totalSales * 0.034), monthlyAvg2025: Math.round(metrics.totalSales * 0.033), monthlyAvg2024: Math.round(metrics.totalSales * 0.032), percentOfRevenue: 3.4 },
        { name: 'חשמל', currentMonth: Math.round(metrics.totalSales * 0.006), monthlyAvg2025: Math.round(metrics.totalSales * 0.0062), monthlyAvg2024: Math.round(metrics.totalSales * 0.0061), percentOfRevenue: 0.6 },
        { name: 'שמירה', currentMonth: Math.round(metrics.totalSales * 0.0028), monthlyAvg2025: Math.round(metrics.totalSales * 0.003), monthlyAvg2024: Math.round(metrics.totalSales * 0.0031), percentOfRevenue: 0.3 },
        { name: 'אחזקה', currentMonth: Math.round(metrics.totalSales * 0.0022), monthlyAvg2025: Math.round(metrics.totalSales * 0.0021), monthlyAvg2024: Math.round(metrics.totalSales * 0.0023), percentOfRevenue: 0.2 },
      ],
    },
    privateLabel: {
      targetPercent: 27.9,
      actualPercent: Number(((privateLabelSales / totalDepartmentSales) * 100).toFixed(1)),
      totalSales: Math.round(privateLabelSales * 11.2),
      currentMonthSales: privateLabelSales,
      yoyChangePercent: Number((metrics.yoyGrowth + 3.8).toFixed(1)),
    },
    threeYear: {
      network: {
        y2025: monthlyAvgNetwork,
        y2024: Math.round(monthlyAvgNetwork * 0.96),
        y2023: Math.round(monthlyAvgNetwork * 0.93),
      },
      internet: {
        y2025: monthlyAvgInternet,
        y2024: Math.round(monthlyAvgInternet * 0.91),
        y2023: Math.round(monthlyAvgInternet * 0.88),
      },
      total: {
        y2025: monthlyAvgTotal,
        y2024: Math.round(monthlyAvgTotal * 0.95),
        y2023: Math.round(monthlyAvgTotal * 0.92),
      },
    },
  }
}

function StoreManagerPage() {
  const [selectedBranchId, setSelectedBranchId] = useState('hadera-44')
  const selectedBranch = getBranch(selectedBranchId) ?? allBranches[0]
  const snapshot = selectedBranchId === 'hadera-44'
    ? { report: haderaFullReport, privateLabel: privateLabelData, threeYear: threeYearRevenue }
    : buildBranchSnapshot(selectedBranch)
  const report = snapshot.report
  const topMonth = [...report.monthly].sort((a, b) => b.currentSales - a.currentSales)[0]
  const lowMonth = [...report.monthly].sort((a, b) => a.currentSales - b.currentSales)[0]
  const categoryData = Object.entries(CATEGORY_META).map(([key, meta]) => {
    const total = report.departments
      .filter(department => department.category === key)
      .reduce((sum, department) => sum + department.currentMonth, 0)

    return {
      key,
      ...meta,
      total,
      share: Number(((total / report.sales.network.current) * 100).toFixed(1)),
    }
  })
  const topDepartments = [...report.departments].sort((a, b) => b.currentMonth - a.currentMonth).slice(0, 8)
  const staffingGaps = [...report.hr.staffing]
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, 6)
  const expenseData = [...report.expenses].sort((a, b) => b.currentMonth - a.currentMonth).slice(0, 5)
  const expenseTotal = report.expenses.reduce((sum, expense) => sum + expense.currentMonth, 0)
  const branchOptions = allBranches.map(branch => ({
    value: branch.id,
    label: `${branch.name} #${branch.branchNumber}`,
  }))

  const alerts = [
    {
      title: 'איכות סניפית',
      value: `${report.operations.qualityScore.current}/100`,
      note: `פער של ${report.operations.qualityScore.target - report.operations.qualityScore.current} נק' מול היעד`,
      tone: report.operations.qualityScore.current >= report.operations.qualityScore.target ? 'good' : 'warn',
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
    {
      title: 'מכירות אינטרנט',
      value: signedPercent(report.sales.internet.vsTarget),
      note: 'המרחק הגדול ביותר מהיעד החודשי',
      tone: report.sales.internet.vsTarget >= -4 ? 'warn' : 'bad',
      icon: <Store className="h-3.5 w-3.5" />,
    },
    {
      title: 'אספקה ושופר',
      value: `${report.operations.supplyRate.current}%`,
      note: `שימוש שופר ${report.operations.shopperUsage.ramiLevy}%`,
      tone: report.operations.supplyRate.current >= 95 ? 'good' : 'warn',
      icon: <PackageCheck className="h-3.5 w-3.5" />,
    },
    {
      title: 'מותג פרטי',
      value: `${snapshot.privateLabel.actualPercent}%`,
      note: `יעד ${snapshot.privateLabel.targetPercent}%`,
      tone: snapshot.privateLabel.actualPercent >= snapshot.privateLabel.targetPercent ? 'good' : 'warn',
      icon: <ShoppingBasket className="h-3.5 w-3.5" />,
    },
  ] as const

  return (
    <PageContainer>
      <div className="relative overflow-hidden rounded-[36px] border border-slate-200/60 bg-[radial-gradient(circle_at_top_right,_rgba(254,243,199,0.95),_rgba(255,255,255,0.7)_35%,_rgba(241,245,249,0.92)_72%)] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.15),_transparent_65%)]" />
        <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-16 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />

        <motion.section {...sectionMotion(0)}>
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-64 max-w-full">
                  <Select
                    options={branchOptions}
                    value={selectedBranchId}
                    onChange={event => setSelectedBranchId(event.target.value)}
                    className="h-11 rounded-2xl border-white/70 bg-white/90 shadow-sm"
                  />
                </div>
                <Badge className="rounded-full border-0 bg-slate-950 px-3 py-1 text-xs font-medium text-white hover:bg-slate-950">
                  דוח חודשי 12/2025
                </Badge>
                <Badge variant="outline" className="rounded-full border-slate-300 bg-white/70 px-3 py-1 text-xs text-slate-600">
                  מבוסס על נתוני PDF אמיתיים
                </Badge>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 text-xs text-slate-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                עיצוב חדש למנהל הסניף עם היררכיית KPI קמעונאית
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/75 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                  <LayoutGrid className="h-3.5 w-3.5 text-emerald-600" />
                  חדר בקרה קמעונאי
                </div>

                <div>
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    ביצועי סניף {report.info.name} בזמן אמת, כמו מרכז שליטה לרשת מזון.
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                    הפוקוס כאן הוא על מה שמעניין מנהל סניף באמת: קצב מכירות, mix מחלקות, תפעול, איכות, כח אדם,
                    ובנצ'מרק מול יעד ומול המתחרים. השפה הוויזואלית שואבת השראה מדשבורדים קמעונאיים עדכניים, אבל נשארת
                    קריאה, צפופה ומוכוונת פעולה.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-sm">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    סניף #{report.info.branchNumber}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-sm">
                    <Users className="h-4 w-4 text-emerald-600" />
                    מנהל: {report.info.manager}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-sm">
                    <Crown className="h-4 w-4 text-amber-500" />
                    דירוג סניף {report.info.grade}
                  </div>
                  {report.info.hasInternet && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-sm">
                      <Wifi className="h-4 w-4 text-blue-500" />
                      פעילות אינטרנט פעילה
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {alerts.map(alert => (
                    <InsightChip
                      key={alert.title}
                      icon={alert.icon}
                      title={alert.title}
                      value={alert.value}
                      note={alert.note}
                      tone={alert.tone}
                    />
                  ))}
                </div>
              </div>

              <Card className={`relative overflow-hidden rounded-[32px] border ${SURFACE_CLASS}`}>
                <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_58%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_52%)]" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>סיכום חודש דצמבר</span>
                    <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                      יעד מול ביצוע
                    </Badge>
                  </div>

                  <div className="mt-5 text-sm text-slate-500">סה"כ מכירות</div>
                  <div className="mt-2 text-5xl font-semibold tracking-tight text-slate-950" dir="ltr">
                    {formatCurrencyShort(report.sales.total.current)}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[24px] bg-slate-950 p-4 text-white">
                      <div className="text-xs text-slate-300">שינוי שנתי</div>
                      <div className="mt-2 flex items-center gap-2 text-2xl font-semibold" dir="ltr">
                        {report.sales.total.yoyChange >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-300" /> : <TrendingDown className="h-5 w-5 text-rose-300" />}
                        {signedPercent(report.sales.total.yoyChange)}
                      </div>
                      <div className="mt-2 text-xs text-slate-400">מול {formatCurrencyShort(report.sales.total.lastYear)} בשנה שעברה</div>
                    </div>
                    <div className="rounded-[24px] bg-white/75 p-4 ring-1 ring-slate-200">
                      <div className="text-xs text-slate-500">פער ליעד</div>
                      <div
                        className={`mt-2 flex items-center gap-2 text-2xl font-semibold ${report.sales.total.vsTarget >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                        dir="ltr"
                      >
                        {report.sales.total.vsTarget >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        {signedPercent(report.sales.total.vsTarget)}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">יעד חודשי {formatCurrencyShort(report.sales.total.target)}</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-slate-200/80 bg-white/80 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>יחס הכנסות למ"ר</span>
                      <span dir="ltr">{report.info.sellingArea.toLocaleString()} מ"ר</span>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <div className="text-3xl font-semibold text-slate-950" dir="ltr">
                        {formatNumber(report.info.revenuePerMeter)}
                      </div>
                      <div className="text-left text-xs text-slate-500">
                        <div>דירוג #{report.sales.revenuePerMeter.ranking}</div>
                        <div dir="ltr">{signedPercent(report.sales.revenuePerMeter.change)} מול אשתקד</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>
      </div>

      <motion.section {...sectionMotion(0.08)}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            icon={<BadgeDollarSign className="h-5 w-5" />}
            label="מכירות רשת"
            value={formatCurrencyShort(report.sales.network.current)}
            delta={signedPercent(report.sales.network.yoyChange)}
            detail={`דירוג #${report.sales.network.ranking} | פער ${signedPercent(report.sales.network.vsTarget)} מול היעד`}
            tone={report.sales.network.vsTarget >= 0 ? 'good' : report.sales.network.vsTarget >= -3 ? 'warn' : 'bad'}
            accent="linear-gradient(135deg,#14532d,#16a34a)"
          />
          <MetricCard
            icon={<Store className="h-5 w-5" />}
            label="מכירות אינטרנט"
            value={formatCurrencyShort(report.sales.internet.current)}
            delta={signedPercent(report.sales.internet.yoyChange)}
            detail={`דירוג #${report.sales.internet.ranking} | יעד ${formatCurrencyShort(report.sales.internet.target)}`}
            tone={report.sales.internet.vsTarget >= -5 ? 'warn' : 'bad'}
            accent="linear-gradient(135deg,#7c2d12,#f97316)"
          />
          <MetricCard
            icon={<ShoppingBasket className="h-5 w-5" />}
            label="סל ממוצע"
            value={formatCurrency(report.sales.avgBasket.current)}
            delta={signedPercent(report.sales.avgBasket.change)}
            detail={`מקום #${report.sales.avgBasket.ranking} ברשת`}
            tone={report.sales.avgBasket.change >= 5 ? 'good' : 'warn'}
            accent="linear-gradient(135deg,#9a3412,#f59e0b)"
          />
          <MetricCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="ציון איכות"
            value={String(report.operations.qualityScore.current)}
            delta={signedPercent(report.operations.qualityScore.current - report.operations.qualityScore.target)}
            detail={`יעד ${report.operations.qualityScore.target} | דירוג #${report.operations.qualityScore.ranking}`}
            tone={report.operations.qualityScore.current >= report.operations.qualityScore.target ? 'good' : report.operations.qualityScore.current >= 75 ? 'warn' : 'bad'}
            accent="linear-gradient(135deg,#0f766e,#0ea5e9)"
          />
          <MetricCard
            icon={<Users className="h-5 w-5" />}
            label="עלות שכר"
            value={`${report.hr.salaryCostPercent}%`}
            delta={signedPercent(report.hr.salaryCostPercent - report.hr.salaryTarget)}
            detail={`יעד ${report.hr.salaryTarget}% | דירוג פריון #${report.hr.productivityRanking}`}
            tone={report.hr.salaryCostPercent <= report.hr.salaryTarget ? 'good' : report.hr.salaryCostPercent <= report.hr.salaryTarget + 0.7 ? 'warn' : 'bad'}
            accent="linear-gradient(135deg,#4c1d95,#9333ea)"
          />
        </div>
      </motion.section>

      <motion.section {...sectionMotion(0.16)}>
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className={`rounded-[32px] border ${SURFACE_CLASS}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-950">מגמת מכירות וחוזק מסחרי</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">2025 מול 2024 עם תרומת שינוי שנתי בכל חודש</p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-500">
                  חודש שיא: {topMonth.month} · {formatCurrencyShort(topMonth.currentSales)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="h-[340px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={report.monthly} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.24} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value: number) => formatCurrencyShort(value)} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={68} />
                    <YAxis yAxisId="pct" orientation="right" domain={[-15, 10]} tickFormatter={(value: number) => `${value}%`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      formatter={(value: number | string, name: string) => {
                        if (name === 'currentSales') return [formatCurrencyShort(Number(value)), '2025']
                        if (name === 'lastYearSales') return [formatCurrencyShort(Number(value)), '2024']
                        return [`${value}%`, 'YoY']
                      }}
                      contentStyle={{
                        direction: 'rtl',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 18px 48px -24px rgba(15,23,42,0.3)',
                      }}
                    />
                    <Area type="monotone" dataKey="currentSales" fill="url(#salesArea)" stroke="#f97316" strokeWidth={3} />
                    <Area type="monotone" dataKey="lastYearSales" fill="transparent" stroke="#94a3b8" strokeDasharray="6 5" strokeWidth={2} />
                    <Bar yAxisId="pct" dataKey="yoyChange" barSize={16} radius={[8, 8, 0, 0]}>
                      {report.monthly.map(month => (
                        <Cell key={month.month} fill={month.yoyChange >= 0 ? '#16a34a' : '#dc2626'} opacity={0.82} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="text-xs text-slate-500">ממוצע 2025</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950" dir="ltr">
                    {formatCurrencyShort(report.sales.total.monthlyAvg2025)}
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="text-xs text-slate-500">חודש חלש</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {lowMonth.month}
                  </div>
                  <div className="mt-1 text-xs text-slate-500" dir="ltr">
                    {formatCurrencyShort(lowMonth.currentSales)}
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="text-xs text-slate-500">עסקים מול ימים</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950" dir="ltr">
                    {signedPercent(report.monthly[report.monthly.length - 1].businessDaysImpact)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">השפעת ימי עסקים בדצמבר</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className={`rounded-[32px] border ${SURFACE_CLASS}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-slate-950">קצב מול יעד</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <PerformanceRail
                  label='סה"כ מכירות'
                  actual={report.sales.total.current}
                  target={report.sales.total.target}
                  detail={`פער ${signedPercent(report.sales.total.vsTarget)} מול היעד`}
                  color="linear-gradient(90deg,#111827,#f97316)"
                />
                <PerformanceRail
                  label="מכירות רשת"
                  actual={report.sales.network.current}
                  target={report.sales.network.target}
                  detail={`מקום #${report.sales.network.ranking} ברשת`}
                  color="linear-gradient(90deg,#065f46,#22c55e)"
                />
                <PerformanceRail
                  label="מכירות אינטרנט"
                  actual={report.sales.internet.current}
                  target={report.sales.internet.target}
                  detail={`מקום #${report.sales.internet.ranking} בקטגוריית אונליין`}
                  color="linear-gradient(90deg,#9a3412,#fb7185)"
                />
              </CardContent>
            </Card>

            <Card className={`rounded-[32px] border ${SURFACE_CLASS}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-slate-950">תמהיל 3 שנים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Total', value: snapshot.threeYear.total },
                  { label: 'Network', value: snapshot.threeYear.network },
                  { label: 'Internet', value: snapshot.threeYear.internet },
                ].map(item => {
                  const max = Math.max(item.value.y2025, item.value.y2024, item.value.y2023)

                  return (
                    <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                      <div className="mb-3 flex items-center justify-between text-sm font-medium text-slate-700">
                        <span>{item.label}</span>
                        <span dir="ltr">{formatCurrencyShort(item.value.y2025)}</span>
                      </div>
                      <div className="space-y-2" dir="ltr">
                        {[
                          { year: '2025', value: item.value.y2025, color: 'bg-slate-950' },
                          { year: '2024', value: item.value.y2024, color: 'bg-orange-400' },
                          { year: '2023', value: item.value.y2023, color: 'bg-slate-300' },
                        ].map(year => (
                          <div key={year.year} className="flex items-center gap-3">
                            <span className="w-10 text-xs text-slate-500">{year.year}</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                              <div className={`h-full rounded-full ${year.color}`} style={{ width: `${(year.value / max) * 100}%` }} />
                            </div>
                            <span className="w-16 text-left text-xs font-medium text-slate-600">
                              {formatCurrencyShort(year.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(0.24)}>
        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <Card className={`rounded-[32px] border ${SURFACE_CLASS}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-950">תמהיל מחלקות</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">החלוקה בין טרי, מזון ונון-פוד מתוך מכירות הרשת</p>
                </div>
                <Badge variant="outline" className="rounded-full border-slate-300 bg-white/80 text-slate-600">
                  {formatCurrencyShort(report.sales.network.current)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
              <div className="h-[250px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="label"
                      innerRadius={62}
                      outerRadius={100}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {categoryData.map(category => (
                        <Cell key={category.key} fill={category.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrencyShort(value)}
                      contentStyle={{
                        direction: 'rtl',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 18px 48px -24px rgba(15,23,42,0.3)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {categoryData.map(category => (
                  <div key={category.key} className={`rounded-[24px] border border-slate-200 bg-gradient-to-r p-4 ${CATEGORY_META[category.key as keyof typeof CATEGORY_META].glow}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{category.label}</div>
                        <div className="mt-1 text-xs text-slate-500">חלק יחסי מתוך מכירות הרשת</div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold text-slate-950" dir="ltr">{category.share}%</div>
                        <div className="text-xs text-slate-500" dir="ltr">{formatCurrencyShort(category.total)}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="text-xs font-medium text-slate-500">מותג פרטי</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-2xl font-semibold text-slate-950" dir="ltr">
                      {snapshot.privateLabel.actualPercent}%
                    </div>
                    <div
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        snapshot.privateLabel.actualPercent >= snapshot.privateLabel.targetPercent
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      יעד {snapshot.privateLabel.targetPercent}%
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500" dir="ltr">
                    {formatCurrencyShort(snapshot.privateLabel.currentMonthSales)} החודש · {signedPercent(snapshot.privateLabel.yoyChangePercent)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-[32px] border ${SURFACE_CLASS}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-950">מחלקות מובילות וחלשות</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">מכירות, נתח ושינוי שנתי לפי מחלקה</p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-500">
                  Top 8 departments
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topDepartments.map(department => {
                const meta = CATEGORY_META[department.category]
                const width = (department.currentMonth / topDepartments[0].currentMonth) * 100
                const tone: Tone = department.yoyChangePercent > 4 ? 'good' : department.yoyChangePercent > 0 ? 'warn' : 'bad'
                const styles = toneStyles(tone)

                return (
                  <div key={department.id} className="rounded-[24px] border border-slate-200 bg-white/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                          <span className="font-semibold text-slate-900">{department.name}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                            {meta.label}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          נתח {department.sharePercent}% · יעד נתח {department.targetSharePercent}%
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold text-slate-950" dir="ltr">
                          {formatCurrencyShort(department.currentMonth)}
                        </div>
                        <div className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles.pill}`} dir="ltr">
                          {signedPercent(department.yoyChangePercent)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: meta.color }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(0.32)}>
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className={`rounded-[32px] border ${SURFACE_CLASS}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-950">בקרת תפעול ואיכות</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">מדדי ביצוע שדורשים פעולה במהלך החודש</p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-500">
                  דירוג איכות #{report.operations.qualityScore.ranking}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'אספקה',
                    value: `${report.operations.supplyRate.current}%`,
                    note: `שופר ${report.operations.supplyRate.shopperPercent}%`,
                    tone: report.operations.supplyRate.current >= 95 ? 'good' : 'warn',
                    icon: <PackageCheck className="h-4 w-4" />,
                  },
                  {
                    label: 'פחת בשר',
                    value: `${report.operations.meatWaste}%`,
                    note: `שנתי ${report.operations.annualWaste.percent}%`,
                    tone: report.operations.meatWaste <= 3 ? 'good' : report.operations.meatWaste <= 5 ? 'warn' : 'bad',
                    icon: <Beef className="h-4 w-4" />,
                  },
                  {
                    label: 'תלונות לקוח',
                    value: String(report.operations.customerComplaints.current),
                    note: `יעד ${report.operations.customerComplaints.target}`,
                    tone: report.operations.customerComplaints.current <= report.operations.customerComplaints.target ? 'good' : 'warn',
                    icon: <CircleAlert className="h-4 w-4" />,
                  },
                  {
                    label: 'ציון טרי',
                    value: String(report.operations.freshQualityScore.current),
                    note: 'מחלקות רגישות למרווח',
                    tone: report.operations.freshQualityScore.current >= 90 ? 'good' : 'warn',
                    icon: <Salad className="h-4 w-4" />,
                  },
                ].map(item => {
                  const styles = toneStyles(item.tone)
                  return (
                    <div key={item.label} className={`rounded-[24px] border p-4 ${styles.pill}`}>
                      <div className="flex items-center justify-between">
                        <div className={`rounded-2xl p-2 ${styles.icon}`}>{item.icon}</div>
                        <div className="text-xl font-semibold text-slate-950" dir="ltr">{item.value}</div>
                      </div>
                      <div className="mt-4 text-sm font-medium text-slate-900">{item.label}</div>
                      <div className="mt-1 text-xs text-slate-600">{item.note}</div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">הוצאות תפעוליות</div>
                      <div className="text-xs text-slate-500">החודש מול מבנה ההכנסות</div>
                    </div>
                    <div className="text-left text-sm font-semibold text-slate-950" dir="ltr">
                      {formatCurrencyShort(expenseTotal)}
                    </div>
                  </div>
                  <div className="h-[240px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={expenseData} layout="vertical" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={88} />
                        <Tooltip
                          formatter={(value: number) => formatCurrencyShort(value)}
                          contentStyle={{
                            direction: 'rtl',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 18px 48px -24px rgba(15,23,42,0.3)',
                          }}
                        />
                        <Bar dataKey="currentMonth" radius={[10, 10, 10, 10]} fill="#111827" barSize={16}>
                          {expenseData.map((expense, index) => (
                            <Cell
                              key={expense.name}
                              fill={['#111827', '#f97316', '#22c55e', '#38bdf8', '#facc15'][index]}
                            />
                          ))}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: 'חזרות',
                      value: `${report.compliance.returns.actual}/${report.compliance.returns.target}`,
                      note: `דירוג #${report.compliance.returns.ranking}`,
                      tone: report.compliance.returns.met ? 'good' : 'warn',
                    },
                    {
                      label: 'מלאי גבוה',
                      value: `${report.compliance.highInventory.actual}/${report.compliance.highInventory.target}`,
                      note: `דירוג #${report.compliance.highInventory.ranking}`,
                      tone: report.compliance.highInventory.met ? 'good' : 'bad',
                    },
                    {
                      label: 'חסרי פעילות',
                      value: `${report.compliance.missingActivities.actual}/${report.compliance.missingActivities.timeTarget}`,
                      note: `סטייה ${report.compliance.missingActivities.deviation}%`,
                      tone: report.compliance.missingActivities.met ? 'good' : 'warn',
                    },
                    {
                      label: 'התראות אדומות',
                      value: `${report.compliance.redAlerts.actual}/${report.compliance.redAlerts.target}`,
                      note: `${report.compliance.redAlerts.redSubscriptions} מנויים אדומים`,
                      tone: report.compliance.redAlerts.met ? 'good' : 'bad',
                    },
                  ].map(item => {
                    const styles = toneStyles(item.tone)
                    return (
                      <div key={item.label} className={`rounded-[24px] border p-4 ${styles.pill}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                            <div className="mt-1 text-xs text-slate-600">{item.note}</div>
                          </div>
                          <div className="text-left text-lg font-semibold text-slate-950" dir="ltr">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className={`rounded-[32px] border ${SURFACE_CLASS}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-slate-950">כח אדם ושכר</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] bg-slate-950 p-4 text-white">
                    <div className="text-xs text-slate-300">מצבה בפועל</div>
                    <div className="mt-2 text-3xl font-semibold" dir="ltr">{report.hr.actual}</div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4">
                    <div className="text-xs text-slate-500">תקן</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-950" dir="ltr">{report.hr.authorized}</div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4">
                    <div className="text-xs text-slate-500">תחלופה</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-950" dir="ltr">{report.hr.turnoverRate}%</div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">מוקדי פער בכח אדם</div>
                      <div className="text-xs text-slate-500">תפקידים עם הסטייה הגדולה ביותר מהתקן</div>
                    </div>
                    <div className="text-left text-sm text-slate-500" dir="ltr">
                      שכר {formatCurrencyShort(report.hr.salaryExpense.current)}
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-right font-medium">תפקיד</th>
                          <th className="px-4 py-3 text-center font-medium">תקן</th>
                          <th className="px-4 py-3 text-center font-medium">בפועל</th>
                          <th className="px-4 py-3 text-left font-medium">פער</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffingGaps.map(row => (
                          <tr key={row.role} className="border-t border-slate-100">
                            <td className="px-4 py-3 font-medium text-slate-900">{row.role}</td>
                            <td className="px-4 py-3 text-center text-slate-600" dir="ltr">{row.authorized}</td>
                            <td className="px-4 py-3 text-center text-slate-600" dir="ltr">{row.actual}</td>
                            <td className="px-4 py-3 text-left" dir="ltr">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.gap >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {row.gap > 0 ? '+' : ''}{row.gap}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4">
                    <div className="text-xs text-slate-500">אחוז שכר מהכנסות</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950" dir="ltr">{report.hr.salaryCostPercent}%</div>
                    <div className="mt-1 text-xs text-slate-500">יעד {report.hr.salaryTarget}%</div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4">
                    <div className="text-xs text-slate-500">השמה דרך חברות</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950" dir="ltr">{report.hr.placementCompanyPercent}%</div>
                    <div className="mt-1 text-xs text-slate-500">סה"כ גיוסים {report.hr.recruitmentTotal}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-[32px] border ${SURFACE_CLASS}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-slate-950">בנצ'מרק תחרותי</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">מול מתחרים באזור</div>
                    <div className="text-xs text-slate-500">איכות, מחיר ונתח שוק</div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1.4fr_repeat(4,_0.8fr)] gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-[11px] font-medium text-slate-500">
                      <span>שחקן</span>
                      <span className="text-left">סל</span>
                      <span className="text-left">איכות</span>
                      <span className="text-left">מחיר</span>
                      <span className="text-left">נתח</span>
                    </div>
                    <div className="grid grid-cols-[1.4fr_repeat(4,_0.8fr)] gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-slate-900">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        רמי לוי
                      </span>
                      <span className="text-left" dir="ltr">₪{report.sales.avgBasket.current}</span>
                      <span className="text-left" dir="ltr">{report.operations.qualityScore.current}</span>
                      <span className="text-left" dir="ltr">96</span>
                      <span className="text-left" dir="ltr">18%</span>
                    </div>
                    {COMPETITORS.map(competitor => (
                      <div key={competitor.id} className="grid grid-cols-[1.4fr_repeat(4,_0.8fr)] gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                        <span>{competitor.name}</span>
                        <span className="text-left" dir="ltr">₪{competitor.avgBasket}</span>
                        <span className="text-left" dir="ltr">{competitor.qualityScore}</span>
                        <span className="text-left" dir="ltr">{competitor.priceIndex}</span>
                        <span className="text-left" dir="ltr">{competitor.marketShare}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <ScanSearch className="h-3.5 w-3.5 text-blue-500" />
                      נראות ותחרות
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-slate-950" dir="ltr">
                      {report.operations.shopperUsage.ramiLevy}%
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      שימוש שופר רמי לוי מול {report.operations.shopperUsage.shufersal}% שופרסל
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                      מוקד סיכון מרכזי
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-slate-950">
                      אונליין
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      פיגור של {signedPercent(report.sales.internet.vsTarget)} מול היעד מחייב טיפול ב-mix ובזמינות.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>
    </PageContainer>
  )
}

export const Route = createFileRoute('/store-manager/')({
  component: StoreManagerPage,
})
