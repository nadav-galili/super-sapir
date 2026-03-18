import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, LineChart,
  BarChart as ReBarChart,
} from 'recharts'
import {
  ShieldCheck, TrendingUp, TrendingDown, Beef, Eye, MessageSquare,
  ShoppingCart as CartIcon, Users, UserCheck, UserMinus, Percent,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { QualityGauge } from '@/components/charts/QualityGauge'
import { StatBadge } from '@/components/dashboard/StatBadge'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BranchInfoBar } from '@/components/store-manager/BranchInfoBar'
import { TargetBars } from '@/components/store-manager/TargetBars'
import { ComplianceCards } from '@/components/store-manager/ComplianceCards'
import { haderaFullReport, type DepartmentSales, type MonthlyDetail } from '@/data/hadera-real'
import { allBranches } from '@/data/mock-branches'
import { COMPETITORS } from '@/data/constants'
import { formatCurrencyShort, formatNumber } from '@/lib/format'
import { getGrowthColor, CHART_COLORS } from '@/lib/colors'
import type { KPICardData } from '@/data/types'

// ─── Monthly Sales Comparison Chart ──────────────────────────────
function MonthlyComparisonChart({ data }: { data: MonthlyDetail[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            מגמת מכירות חודשית — 2025 מול 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 10 }} width={60} />
                <YAxis yAxisId="pct" orientation="right" tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10 }} width={40} domain={[-15, 10]} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'currentSales') return [formatCurrencyShort(value as number), '2025']
                    if (name === 'lastYearSales') return [formatCurrencyShort(value as number), '2024']
                    return [`${value}%`, 'שינוי שנתי']
                  }}
                  contentStyle={{ direction: 'rtl', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend formatter={(v: string) => v === 'currentSales' ? '2025' : v === 'lastYearSales' ? '2024' : 'שינוי %'} />
                <Area type="monotone" dataKey="currentSales" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradCurrent)" animationDuration={1500} />
                <Line type="monotone" dataKey="lastYearSales" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 3" dot={false} animationDuration={1500} animationBegin={300} />
                <Bar yAxisId="pct" dataKey="yoyChange" barSize={16} radius={[3, 3, 0, 0]} animationDuration={1200} animationBegin={600}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.yoyChange >= 0 ? '#10b981' : '#ef4444'} opacity={0.7} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Department Breakdown ────────────────────────────────────────
const CATEGORIES = [
  { key: 'fresh' as const, name: 'טרי', color: '#10b981', bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { key: 'food' as const, name: 'מזון', color: '#f59e0b', bgClass: 'bg-amber-50 border-amber-200 text-amber-700' },
  { key: 'nonfood' as const, name: 'נון-פוד', color: '#3b82f6', bgClass: 'bg-blue-50 border-blue-200 text-blue-700' },
]

function DepartmentBreakdown({ departments }: { departments: DepartmentSales[] }) {
  const maxSales = Math.max(...departments.map(d => d.currentMonth))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Card className="border-0 shadow-md h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <CartIcon className="w-4 h-4 text-white" />
            </div>
            פילוח מכירות לפי מחלקה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CATEGORIES.map(cat => {
            const depts = departments.filter(d => d.category === cat.key)
            return (
              <div key={cat.key}>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold mb-2 ${cat.bgClass}`}>
                  <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  {cat.name}
                </div>
                <div className="space-y-1.5">
                  {depts.map((dept, i) => {
                    const barPct = (dept.currentMonth / maxSales) * 100
                    return (
                      <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.04 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs w-24 text-right shrink-0 text-muted-foreground">{dept.name}</span>
                        <div className="flex-1 relative h-5 bg-gray-50 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barPct}%` }}
                            transition={{ delay: 0.8 + i * 0.04, duration: 0.8 }}
                            className="absolute inset-y-0 right-0 rounded"
                            style={{ background: cat.color, opacity: 0.75 }}
                          />
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-600 tabular-nums" dir="ltr">
                            {formatCurrencyShort(dept.currentMonth)}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground w-8 text-center tabular-nums" dir="ltr">
                          {dept.sharePercent}%
                        </span>
                        <span
                          className={`text-[10px] font-bold w-10 text-left tabular-nums ${dept.yoyChangePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
                          dir="ltr"
                        >
                          {dept.yoyChangePercent > 0 ? '+' : ''}{dept.yoyChangePercent}%
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Operations Stats Card ───────────────────────────────────────
function OperationsStatsCard({ operations }: { operations: typeof haderaFullReport.operations }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          תפעול ואיכות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <StatBadge label="אחוז אספקה מוצרים" value={`${operations.supplyRate.current}%`} delta={1.0} />
        <Separator />
        <StatBadge label="שימוש בשופר" value={`${operations.shopperUsage.ramiLevy}%`} />
        <Separator />
        <StatBadge label="שופרסל (מתחרה)" value={`${operations.shopperUsage.shufersal}%`} />
        <Separator />
        <StatBadge label="פחת בשר" value={`${operations.meatWaste}%`} delta={-2.1} />
        <Separator />
        <StatBadge label="תלונות לקוחות" value={`${operations.customerComplaints.current}`} />
        <Separator />
        <StatBadge label="דיווחי מוקד רואה" value={`${operations.focusReports.current} / ${operations.focusReports.target}`} delta={-50} />
        <Separator />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">פחת שנתי</span>
          <div className="text-right">
            <span className="font-semibold text-sm" dir="ltr">{formatCurrencyShort(operations.annualWaste.amount)}</span>
            <span className="text-xs text-muted-foreground mr-1">({operations.annualWaste.percent}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── HR & Staffing Section ───────────────────────────────────────
function StaffingSection({ hr }: { hr: typeof haderaFullReport.hr }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <Card className="border-0 shadow-md h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            כח אדם ומשרות
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary badges */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <UserCheck className="w-4 h-4 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold text-blue-700" dir="ltr">{hr.authorized}</p>
              <p className="text-[10px] text-blue-500">תקן</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <Users className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold text-emerald-700" dir="ltr">{hr.actual}</p>
              <p className="text-[10px] text-emerald-500">בפועל</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <Percent className="w-4 h-4 mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-bold text-amber-700" dir="ltr">{hr.turnoverRate}%</p>
              <p className="text-[10px] text-amber-500">תחלופה</p>
            </div>
          </div>

          {/* Staffing table */}
          <div className="overflow-auto max-h-[320px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b">
                  <th className="py-1.5 text-right font-medium text-muted-foreground">תפקיד</th>
                  <th className="py-1.5 text-center font-medium text-muted-foreground w-12">תקן</th>
                  <th className="py-1.5 text-center font-medium text-muted-foreground w-12">בפועל</th>
                  <th className="py-1.5 text-center font-medium text-muted-foreground w-12">פער</th>
                </tr>
              </thead>
              <tbody>
                {hr.staffing.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-1.5 font-medium">{row.role}</td>
                    <td className="py-1.5 text-center tabular-nums" dir="ltr">{row.authorized}</td>
                    <td className="py-1.5 text-center tabular-nums" dir="ltr">{row.actual}</td>
                    <td className="py-1.5 text-center" dir="ltr">
                      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        row.gap > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : row.gap < 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {row.gap > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : row.gap < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : null}
                        {row.gap > 0 ? '+' : ''}{row.gap}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Salary info */}
          <div className="mt-3 pt-3 border-t space-y-1">
            <StatBadge label="עלות שכר חודשית" value={formatCurrencyShort(hr.salaryExpense.current)} />
            <StatBadge label="אחוז שכר מהכנסות" value={`${hr.salaryCostPercent}%`} delta={-1.1} />
            <StatBadge label="יעד אחוז שכר" value={`${hr.salaryTarget}%`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Monthly Operations Mini Charts ──────────────────────────────
function MiniSparkline({ data, dataKey, color, label, currentValue, suffix = '' }: {
  data: MonthlyDetail[]
  dataKey: keyof MonthlyDetail
  color: string
  label: string
  currentValue: string
  suffix?: string
}) {
  return (
    <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }} dir="ltr">{currentValue}{suffix}</span>
      </div>
      <div dir="ltr" className="h-[50px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function MonthlyOpsGrid({ data }: { data: MonthlyDetail[] }) {
  const last = data[data.length - 1]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <Card className="border-0 shadow-md h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            מגמות תפעוליות — 12 חודשים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <MiniSparkline data={data} dataKey="qualityScore" color="#0891b2" label="ציון איכות" currentValue={String(last.qualityScore)} />
            <MiniSparkline data={data} dataKey="salaryCostPercent" color="#be185d" label="עלות שכר %" currentValue={String(last.salaryCostPercent)} suffix="%" />
            <MiniSparkline data={data} dataKey="supplyRate" color="#059669" label="אחוז אספקה" currentValue={String(last.supplyRate)} suffix="%" />
            <MiniSparkline data={data} dataKey="meatWastePercent" color="#dc2626" label="פחת בשר %" currentValue={String(last.meatWastePercent)} suffix="%" />
          </div>

          {/* Complaints & Focus Reports mini bars */}
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">תלונות לקוחות ודיווחי מוקד — חודשי</p>
            <div dir="ltr" className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data} barGap={1}>
                  <XAxis dataKey="monthNum" tick={{ fontSize: 9 }} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'customerComplaints' ? 'תלונות' : 'דיווחים']}
                    contentStyle={{ direction: 'rtl', borderRadius: '8px', fontSize: 11, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="customerComplaints" fill="#f59e0b" radius={[2, 2, 0, 0]} barSize={8} />
                  <Bar dataKey="focusReports" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={8} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Expense Summary ─────────────────────────────────────────────
function ExpenseSummary({ expenses }: { expenses: typeof haderaFullReport.expenses }) {
  const totalExpenses = expenses.reduce((s, e) => s + e.currentMonth, 0)
  const sorted = [...expenses].sort((a, b) => b.currentMonth - a.currentMonth).slice(0, 6)
  const maxExpense = sorted[0]?.currentMonth ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <Beef className="w-4 h-4 text-white" />
              </div>
              סיכום הוצאות תפעוליות
            </CardTitle>
            <Badge variant="secondary" className="text-xs" dir="ltr">
              {formatCurrencyShort(totalExpenses)} (11% מהכנסות)
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sorted.map((exp, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs w-28 text-right shrink-0 text-muted-foreground">{exp.name}</span>
              <div className="flex-1 relative h-4 bg-gray-50 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(exp.currentMonth / maxExpense) * 100}%` }}
                  transition={{ delay: 0.9 + i * 0.05, duration: 0.6 }}
                  className="absolute inset-y-0 right-0 rounded"
                  style={{ background: CHART_COLORS[i], opacity: 0.6 }}
                />
              </div>
              <span className="text-[10px] font-semibold w-14 text-left tabular-nums" dir="ltr">
                {formatCurrencyShort(exp.currentMonth)}
              </span>
              <span className="text-[10px] text-muted-foreground w-8 text-left tabular-nums" dir="ltr">
                {exp.percentOfRevenue}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
function StoreManagerPage() {
  const [selectedBranchId, setSelectedBranchId] = useState('hadera-44')
  const report = haderaFullReport
  const s = report.sales

  const branchOptions = allBranches.map(b => ({
    value: b.id,
    label: `${b.name} #${b.branchNumber}`,
  }))

  const kpis: KPICardData[] = [
    { label: 'סה"כ מכירות', value: s.total.current, format: 'currencyShort', trend: s.total.yoyChange, trendLabel: 'שנתי', gradient: 'green' },
    { label: 'מכירות רשת', value: s.network.current, format: 'currencyShort', trend: s.network.yoyChange, trendLabel: 'שנתי', gradient: 'blue' },
    { label: 'מכירות אינטרנט', value: s.internet.current, format: 'currencyShort', trend: s.internet.yoyChange, trendLabel: 'שנתי', gradient: 'purple' },
    { label: 'סל ממוצע (ללא מע"מ)', value: s.avgBasket.current, format: 'currency', trend: s.avgBasket.change, trendLabel: 'שנתי', gradient: 'teal' },
    { label: 'ציון איכות', value: report.operations.qualityScore.current, format: 'number', trend: -17.6, trendLabel: 'יעד: 85', gradient: 'orange' },
    { label: 'עלות שכר %', value: 8, format: 'number', trend: 0.9, trendLabel: 'יעד: 7.5%', gradient: 'pink' },
  ]

  return (
    <PageContainer>
      {/* Branch Selector */}
      <div className="flex items-center gap-3">
        <Select
          options={branchOptions}
          value={selectedBranchId}
          onChange={e => setSelectedBranchId(e.target.value)}
          className="w-64"
        />
        <Badge variant="outline" className="text-xs">דצמבר 2025</Badge>
      </div>

      {/* Branch Info Header */}
      <BranchInfoBar info={report.info} />

      {/* KPI Cards */}
      <KPIGrid items={kpis} columns={6} />

      {/* Target Achievement */}
      <TargetBars sales={report.sales} />

      {/* Monthly Sales Comparison */}
      <MonthlyComparisonChart data={report.monthly} />

      {/* Department Breakdown + Operations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DepartmentBreakdown departments={report.departments} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <QualityGauge
            score={report.operations.qualityScore.current}
            maxScore={100}
            title={`ציון איכות (יעד: ${report.operations.qualityScore.target}, דירוג #${report.operations.qualityScore.ranking})`}
          />
          <OperationsStatsCard operations={report.operations} />
        </div>
      </div>

      {/* HR + Monthly Operations + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaffingSection hr={report.hr} />
        <div className="space-y-6">
          <ComplianceCards compliance={report.compliance} />
          <MonthlyOpsGrid data={report.monthly} />
        </div>
      </div>

      {/* Expense Summary */}
      <ExpenseSummary expenses={report.expenses} />

      {/* Competitor Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              השוואת מתחרים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">מתחרה</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">סל ממוצע</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">ציון איכות</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">מדד מחירים</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">נתח שוק</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-blue-50/50 font-medium">
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        רמי לוי (אנחנו)
                      </span>
                    </td>
                    <td className="px-4 py-2.5" dir="ltr">₪{report.sales.avgBasket.current}</td>
                    <td className="px-4 py-2.5" dir="ltr">{report.operations.qualityScore.current}</td>
                    <td className="px-4 py-2.5" dir="ltr">96</td>
                    <td className="px-4 py-2.5" dir="ltr">18%</td>
                  </tr>
                  {COMPETITORS.map(c => (
                    <tr key={c.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-2.5">{c.name}</td>
                      <td className="px-4 py-2.5" dir="ltr">₪{c.avgBasket}</td>
                      <td className="px-4 py-2.5" dir="ltr">{c.qualityScore}</td>
                      <td className="px-4 py-2.5" dir="ltr">{c.priceIndex}</td>
                      <td className="px-4 py-2.5" dir="ltr">{c.marketShare}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  )
}

export const Route = createFileRoute('/store-manager/')({
  component: StoreManagerPage,
})
