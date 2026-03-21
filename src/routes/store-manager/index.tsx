import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, LineChart,
  BarChart as ReBarChart,
} from 'recharts'
import {
  ShieldCheck, TrendingUp, TrendingDown, Beef, Eye,
  ShoppingCart as CartIcon, Users, UserCheck, Percent,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { QualityGauge } from '@/components/charts/QualityGauge'
import { StatBadge } from '@/components/dashboard/StatBadge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BranchInfoBar } from '@/components/store-manager/BranchInfoBar'
import { ComplianceCards } from '@/components/store-manager/ComplianceCards'
import { haderaFullReport, type DepartmentSales, type MonthlyDetail } from '@/data/hadera-real'
import { currentMonthYear, REPORT_MONTH, REPORT_YEAR, WORKING_DAYS_PER_MONTH } from '@/data/constants'
import { allBranches } from '@/data/mock-branches'
import { formatCurrencyShort } from '@/lib/format'
import { CHART_COLORS } from '@/lib/colors'
import type { KPICardData } from '@/data/types'

// ─── Monthly Sales Comparison Chart ──────────────────────────────
function MonthlyComparisonChart({ data }: { data: MonthlyDetail[] }) {
  const chartData = data
    .filter(d => d.monthNum <= REPORT_MONTH)
    .map(d => ({
      month: d.month,
      current: Math.round(d.currentSales / 1000),
      lastYear: Math.round(d.lastYearSales / 1000),
    }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <Card className="border-warm-border rounded-[16px]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-[#2D3748]">מגמת מכירות</CardTitle>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-warm-border rounded-[8px] text-xs text-[#4A5568] bg-white hover:bg-[#FDF8F6]">◀</button>
              <span className="text-sm font-semibold text-[#2D3748] px-2">{REPORT_YEAR}</span>
              <button className="px-3 py-1.5 border border-warm-border rounded-[8px] text-xs text-[#4A5568] bg-white hover:bg-[#FDF8F6]">▶</button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A5568' }} />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}M`}
                  tick={{ fontSize: 11, fill: '#A0AEC0' }}
                  domain={[7000, 'auto']}
                  width={50}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `₪${value.toLocaleString()}K`,
                    name === 'current' ? String(REPORT_YEAR) : String(REPORT_YEAR - 1),
                  ]}
                  contentStyle={{ direction: 'rtl', borderRadius: '10px', border: '1px solid #FFE8DE', fontSize: 12 }}
                />
                <Legend
                  formatter={(v: string) => v === 'current' ? String(REPORT_YEAR) : String(REPORT_YEAR - 1)}
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  dataKey="current"
                  fill="rgba(220, 78, 89, 0.15)"
                  stroke="#DC4E59"
                  strokeWidth={2}
                  radius={[6, 6, 0, 0]}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="lastYear"
                  stroke="#42a5f5"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#42a5f5' }}
                  animationDuration={1500}
                  animationBegin={300}
                />
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
  { key: 'fresh' as const, name: 'טרי', color: '#DC4E59', bgClass: 'bg-[#DC4E59]/8 border-[#DC4E59]/20 text-[#DC4E59]' },
  { key: 'food' as const, name: 'מזון', color: '#2EC4D5', bgClass: 'bg-[#2EC4D5]/8 border-[#2EC4D5]/20 text-[#2EC4D5]' },
  { key: 'nonfood' as const, name: 'נון-פוד', color: '#6C5CE7', bgClass: 'bg-[#6C5CE7]/8 border-[#6C5CE7]/20 text-[#6C5CE7]' },
]

function DepartmentBreakdown({ departments }: { departments: DepartmentSales[] }) {
  const maxSales = Math.max(...departments.map(d => d.currentMonth))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Card className="border-warm-border rounded-[16px] h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DC4E59, #E8777F)' }}>
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
                        <span className="text-xs w-16 sm:w-24 text-right shrink-0 text-muted-foreground truncate">{dept.name}</span>
                        <div className="flex-1 relative h-5 bg-[#FDF8F6] rounded-[4px] overflow-hidden border border-warm-border">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barPct}%` }}
                            transition={{ delay: 0.8 + i * 0.04, duration: 0.8 }}
                            className="absolute inset-y-0 right-0 rounded"
                            style={{ background: cat.color, opacity: 0.75 }}
                          />
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#4A5568] tabular-nums" dir="ltr">
                            {formatCurrencyShort(dept.currentMonth)}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground w-8 text-center tabular-nums" dir="ltr">
                          {dept.sharePercent}%
                        </span>
                        <span
                          className={`text-[10px] font-bold w-10 text-left tabular-nums ${dept.yoyChangePercent >= 0 ? 'text-[#2EC4D5]' : 'text-[#DC4E59]'}`}
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
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2EC4D5, #5DD8E3)' }}>
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
      <Card className="border-warm-border rounded-[16px] h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B7FED)' }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            כח אדם ומשרות
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary badges */}
          <div className="grid grid-cols-3 gap-2 mb-4 sm:grid-cols-3">
            <div className="rounded-[16px] bg-[#2EC4D5]/8 p-3 text-center">
              <UserCheck className="w-4 h-4 mx-auto text-[#6C5CE7] mb-1" />
              <p className="text-lg font-bold text-[#6C5CE7]" dir="ltr">{hr.authorized}</p>
              <p className="text-[10px] text-[#6C5CE7]">תקן</p>
            </div>
            <div className="rounded-[16px] bg-[#2EC4D5]/8 p-3 text-center">
              <Users className="w-4 h-4 mx-auto text-[#2EC4D5] mb-1" />
              <p className="text-lg font-bold text-[#2EC4D5]" dir="ltr">{hr.actual}</p>
              <p className="text-[10px] text-[#2EC4D5]">בפועל</p>
            </div>
            <div className="rounded-[16px] bg-[#F6B93B]/10 p-3 text-center">
              <Percent className="w-4 h-4 mx-auto text-[#F6B93B] mb-1" />
              <p className="text-lg font-bold text-[#F6B93B]" dir="ltr">{hr.turnoverRate}%</p>
              <p className="text-[10px] text-[#F6B93B]">תחלופה</p>
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
                  <tr key={i} className="border-b border-warm-divider hover:bg-[#FDF8F6]">
                    <td className="py-1.5 font-medium">{row.role}</td>
                    <td className="py-1.5 text-center tabular-nums" dir="ltr">{row.authorized}</td>
                    <td className="py-1.5 text-center tabular-nums" dir="ltr">{row.actual}</td>
                    <td className="py-1.5 text-center" dir="ltr">
                      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        row.gap > 0
                          ? 'bg-[#2EC4D5]/15 text-[#2EC4D5]'
                          : row.gap < 0
                            ? 'bg-[#DC4E59]/15 text-[#DC4E59]'
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
            <StatBadge label="אחוז שכר מהכנסות" value={`${hr.salaryCostPercent.toFixed(2)}%`} delta={-1.1} />
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
    <div className="p-3 rounded-xl bg-[#FDF8F6] border border-warm-border">
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
      <Card className="border-warm-border rounded-[16px] h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2EC4D5, #5DD8E3)' }}>
              <Eye className="w-4 h-4 text-white" />
            </div>
            מגמות תפעוליות — 12 חודשים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      <Card className="border-warm-border rounded-[16px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DC4E59, #E8777F)' }}>
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
              <span className="text-xs w-16 sm:w-28 text-right shrink-0 text-muted-foreground truncate">{exp.name}</span>
              <div className="flex-1 relative h-4 bg-[#FDF8F6] rounded-[4px] overflow-hidden border border-warm-border">
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
function seededValue(seed: number, offset: number) {
  const raw = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453
  return raw - Math.floor(raw)
}

function seededInt(seed: number, offset: number, min: number, max: number) {
  return Math.round(min + seededValue(seed, offset) * (max - min))
}

function seededFloat(seed: number, offset: number, min: number, max: number, digits = 1) {
  return +(min + seededValue(seed, offset) * (max - min)).toFixed(digits)
}

function seededBool(seed: number, offset: number, threshold = 0.5) {
  return seededValue(seed, offset) > threshold
}

// ─── Mock Hebrew names for generated branches ────────────────────
const MOCK_FIRST_NAMES = ['דני', 'רונן', 'שירה', 'נועה', 'עמית', 'אורן', 'מיכל', 'תמר', 'אלון', 'יעל', 'גלעד', 'ליאור']
const MOCK_LAST_NAMES = ['פרץ', 'מזרחי', 'אברהם', 'דוד', 'ביטון', 'שלום', 'חדד', 'עמר', 'נחום', 'אוחיון', 'ברק', 'סויסה']
const MOCK_DIV_FIRST = ['רונית', 'אייל', 'חנה', 'משה', 'דנה', 'עידו', 'סיגל', 'בועז', 'קרן', 'אסף', 'הדר', 'נדב']
const MOCK_DIV_LAST = ['גולן', 'שפירא', 'יוסף', 'רוזן', 'קפלן', 'אלוני', 'הררי', 'טל', 'ניסים', 'בן דוד', 'זמיר', 'עוז']

function mockManagerName(seed: number): string {
  const fi = Math.abs(Math.round(Math.sin(seed * 5.731) * 1000)) % MOCK_FIRST_NAMES.length
  const li = Math.abs(Math.round(Math.sin(seed * 3.917) * 1000)) % MOCK_LAST_NAMES.length
  return `${MOCK_FIRST_NAMES[fi]} ${MOCK_LAST_NAMES[li]}`
}

function mockDivisionManagerName(seed: number): string {
  const fi = Math.abs(Math.round(Math.sin(seed * 7.213) * 1000)) % MOCK_DIV_FIRST.length
  const li = Math.abs(Math.round(Math.sin(seed * 2.549) * 1000)) % MOCK_DIV_LAST.length
  return `${MOCK_DIV_FIRST[fi]} ${MOCK_DIV_LAST[li]}`
}

// ─── Adapt a generic Branch into the full report shape ────────────
function branchToFullReport(branch: typeof allBranches[0]): typeof haderaFullReport {
  const m = branch.metrics
  const seed = branch.branchNumber * 1000 + branch.id.length * 37

  return {
    info: {
      branchNumber: branch.branchNumber,
      name: branch.name,
      manager: mockManagerName(seed),
      divisionManager: mockDivisionManagerName(seed),
      grade: m.qualityScore >= 80 ? 'A' : m.qualityScore >= 60 ? 'B' : 'C',
      sellingArea: seededInt(seed, 1, 2500, 4000),
      revenuePerMeter: Math.round(m.totalSales / 3000),
    },
    sales: {
      network: { current: m.networkSales, lastYear: Math.round(m.networkSales * 0.95), target: Math.round(m.networkSales * 1.05), monthlyAvg2025: m.networkSales, ranking: seededInt(seed, 2, 20, 50), yoyChange: m.yoyGrowth, vsTarget: +(m.yoyGrowth - 5).toFixed(1) },
      total: { current: m.totalSales, lastYear: Math.round(m.totalSales * 0.97), target: Math.round(m.totalSales * 1.05), monthlyAvg2025: m.totalSales, yoyChange: m.yoyGrowth, vsTarget: +(m.yoyGrowth - 5).toFixed(1) },
      avgBasket: { current: Math.round(m.totalSales / (m.customersPerDay * WORKING_DAYS_PER_MONTH)), change: seededFloat(seed, 6, -2, 8), ranking: seededInt(seed, 7, 8, 24) },
      customers: { current: m.customersPerDay * WORKING_DAYS_PER_MONTH, target: m.customersPerDay * 25, change: seededFloat(seed, 8, -3, 5), ranking: seededInt(seed, 9, 18, 34) },
      revenuePerMeter: { ranking: seededInt(seed, 10, 18, 42), change: seededFloat(seed, 11, -8, 4) },
    },
    targets: { revenueToStore: 3000, salaryCostTarget: 7.5, qualityTarget: 85 },
    operations: {
      qualityScore: { current: m.qualityScore, target: 85, ranking: seededInt(seed, 12, 30, 50) },
      freshQualityScore: { current: seededInt(seed, 13, 85, 100) },
      supplyRate: { current: m.supplyRate, shopperPercent: 88, ranking: 10 },
      avgDaysOfInventory: { current: seededInt(seed, 50, 10, 22), target: 14 },
      meatWaste: m.meatWastePercent,
      fishWaste: 0,
      customerComplaints: { current: m.complaints, target: 5 },
      focusReports: { current: 4, target: 10 },
      shopperUsage: { ramiLevy: 33, shufersal: 18 },
      annualWaste: { amount: Math.round(m.totalSales * 0.004), percent: 0.4, prev2024: Math.round(m.totalSales * 0.003), prev2023: Math.round(m.totalSales * 0.005) },
    },
    compliance: {
      highInventory: { target: 60, actual: seededInt(seed, 14, 55, 75), met: seededBool(seed, 15), ranking: seededInt(seed, 16, 20, 50) },
      missingActivities: { fixedTarget: 120, timeTarget: 131, actual: seededInt(seed, 17, 110, 140), deviation: seededInt(seed, 18, 8, 18), met: seededBool(seed, 19), ranking: seededInt(seed, 20, 15, 45) },
      returns: { target: 100, advancePercent: 90, timeTarget: 90, actual: seededInt(seed, 21, 95, 105), met: seededBool(seed, 22, 0.4), ranking: seededInt(seed, 23, 1, 41) },
      redAlerts: { target: 40, actual: seededInt(seed, 24, 30, 50), redSubscriptions: seededInt(seed, 25, 15, 30), rate: seededInt(seed, 26, 10, 15), met: seededBool(seed, 27), ranking: seededInt(seed, 28, 20, 55) },
    },
    hr: {
      authorized: m.totalEmployees - seededInt(seed, 29, 0, 8),
      actual: m.totalEmployees,
      salaryCostPercent: m.salaryCostPercent,
      salaryTarget: 7.5,
      productivityRanking: seededInt(seed, 30, 30, 55),
      turnoverRate: seededInt(seed, 31, 60, 90),
      turnoverRanking: seededInt(seed, 32, 20, 45),
      recruitmentTotal: seededInt(seed, 33, 50, 90),
      placementCompanyPercent: seededInt(seed, 34, 15, 25),
      salaryExpense: { current: Math.round(m.totalSales * m.salaryCostPercent / 100), monthlyAvg2025: Math.round(m.totalSales * 0.08), monthlyAvg2024: Math.round(m.totalSales * 0.075) },
      salaryPercentOfRevenue: { current: m.salaryCostPercent, target: 7.5, threeYearAvg: [m.salaryCostPercent, 7.8, 7.5] },
      staffing: [
        { role: 'צוות ניהולי', authorized: 5, actual: 4.5, gap: -0.5 },
        { role: 'ירקות', authorized: 8, actual: 9, gap: 1 },
        { role: 'מחסן', authorized: 7, actual: 8, gap: 1 },
        { role: 'סדרנות', authorized: 20, actual: 22, gap: 2 },
        { role: 'קופה/ית', authorized: 10, actual: 9, gap: -1 },
      ],
    },
    departments: branch.departments.map((d, i) => {
      const cat = (['vegetables', 'fresh-meat', 'fresh-fish', 'deli', 'pastries'].includes(d.id) ? 'fresh' : ['grocery', 'bread', 'drinks', 'frozen', 'dairy', 'organic'].includes(d.id) ? 'food' : 'nonfood') as 'fresh' | 'food' | 'nonfood'
      const daysBase = cat === 'fresh' ? 3 : cat === 'food' ? 14 : 25
      return {
        id: d.id,
        name: d.name,
        category: cat,
        currentMonth: d.sales,
        yearToDate: Math.round(d.sales * 1.05),
        yoyChangePercent: d.yoyChange,
        sharePercent: d.sharePercent,
        targetSharePercent: d.targetShare,
        shareChangePercent: +(d.sharePercent - d.targetShare).toFixed(1),
        avgDaysOfInventory: seededInt(seed, 60 + i, Math.max(1, daysBase - 4), daysBase + 8),
      }
    }),
    monthly: branch.monthlyTrends.map(t => ({
      month: t.month,
      monthNum: t.monthNum,
      currentSales: t.totalSales,
      lastYearSales: Math.round(t.totalSales * 0.97),
      yoyChange: seededFloat(seed + t.monthNum, 35, -4, 8),
      businessDaysImpact: seededFloat(seed + t.monthNum, 36, -3, 3),
      salaryCostPercent: seededFloat(seed + t.monthNum, 37, 7, 9.5),
      supplyRate: seededInt(seed + t.monthNum, 38, 88, 96),
      shopperUsage: seededInt(seed + t.monthNum, 39, 25, 35),
      qualityScore: seededInt(seed + t.monthNum, 40, 60, 90),
      freshQualityScore: seededInt(seed + t.monthNum, 41, 70, 100),
      focusReports: seededInt(seed + t.monthNum, 42, 0, 15),
      customerComplaints: seededInt(seed + t.monthNum, 43, 0, 6),
      meatWastePercent: seededFloat(seed + t.monthNum, 44, 0, 8),
    })),
    expenses: [
      { name: 'שכר', currentMonth: Math.round(m.totalSales * m.salaryCostPercent / 100), monthlyAvg2025: Math.round(m.totalSales * 0.08), monthlyAvg2024: Math.round(m.totalSales * 0.075), percentOfRevenue: m.salaryCostPercent },
      { name: 'שכר דירה, אריזה', currentMonth: Math.round(m.totalSales * 0.035), monthlyAvg2025: Math.round(m.totalSales * 0.035), monthlyAvg2024: Math.round(m.totalSales * 0.033), percentOfRevenue: 3.5 },
      { name: 'חשמל', currentMonth: Math.round(m.totalSales * 0.006), monthlyAvg2025: Math.round(m.totalSales * 0.006), monthlyAvg2024: Math.round(m.totalSales * 0.006), percentOfRevenue: 0.6 },
      { name: 'שמירה', currentMonth: Math.round(m.totalSales * 0.003), monthlyAvg2025: Math.round(m.totalSales * 0.003), monthlyAvg2024: Math.round(m.totalSales * 0.003), percentOfRevenue: 0.3 },
    ],
  }
}

const branchOptions = allBranches.map(b => ({
  value: b.id,
  label: `${b.name} #${b.branchNumber}`,
}))

// ─── View-specific content renderers ─────────────────────────────
type Report = typeof haderaFullReport

// ─── Overview: Branch Performance Card ──────────────────────────
function BranchPerformanceCard({ report }: { report: Report }) {
  const items = [
    { label: 'ציון בקרת איכות', value: String(report.operations.qualityScore.current), change: -17.6, sub: 'מתוך 100' },
    { label: 'הכנסות למ"ר', value: `₪${report.info.revenuePerMeter.toLocaleString()}`, change: null, sub: `שטח: ${report.info.sellingArea.toLocaleString()} מ"ר` },
    { label: 'אחוז עלות שכר', value: `${report.hr.salaryCostPercent}%`, change: -0.7, sub: `יעד: ${report.hr.salaryTarget}%` },
  ]
  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">ביצועי סניף</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <div key={item.label} className="rounded-xl bg-[#FDF8F6] p-4 text-center">
              <p className="text-xs text-[#A0AEC0] mb-1.5">{item.label}</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-bold text-[#2D3748] font-mono" dir="ltr">{item.value}</span>
                {item.change !== null && (
                  <span className={`text-xs font-semibold ${item.change >= 0 ? 'text-[#2EC4D5]' : 'text-[#DC4E59]'}`} dir="ltr">
                    {item.change > 0 ? '▲' : '▼'}{Math.abs(item.change)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A0AEC0] mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Overview: Expense Table ────────────────────────────────────
function OverviewExpenseTable({ expenses, totalRevenue }: { expenses: typeof haderaFullReport.expenses; totalRevenue: number }) {
  const sorted = [...expenses].sort((a, b) => b.currentMonth - a.currentMonth).slice(0, 7)
  const totalExpenses = expenses.reduce((s, e) => s + e.currentMonth, 0)

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">הוצאות תפעוליות (ממוצע חודשי)</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full border-collapse" style={{ direction: 'rtl' }}>
          <thead>
            <tr className="border-b border-warm-divider">
              <th style={{ width: '30%' }} className="text-right text-xs font-medium text-[#A0AEC0] py-2.5 px-2">סעיף</th>
              <th style={{ width: '20%' }} className="text-right text-xs font-medium text-[#A0AEC0] py-2.5 px-2">סכום (₪)</th>
              <th style={{ width: '35%' }} className="text-right text-xs font-medium text-[#A0AEC0] py-2.5 px-2">% מהכנסות</th>
              <th style={{ width: '15%' }} className="text-center text-xs font-medium text-[#A0AEC0] py-2.5 px-2">שינוי</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((exp, i) => {
              const pctChange = exp.monthlyAvg2024 > 0 ? Math.round(((exp.currentMonth - exp.monthlyAvg2024) / exp.monthlyAvg2024) * 100) : 0
              return (
                <tr key={i} className="border-b border-warm-divider hover:bg-[#FDF8F6]">
                  <td className="text-right text-xs text-[#4A5568] py-3 px-2">{exp.name}</td>
                  <td className="text-right text-xs font-semibold tabular-nums font-mono text-[#2D3748] py-3 px-2">{exp.currentMonth.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2" style={{ direction: 'ltr' }}>
                      <span className="tabular-nums font-mono text-xs shrink-0 w-10 text-right">{exp.percentOfRevenue}%</span>
                      <div className="h-1.5 bg-[#FDF8F6] rounded-full flex-1 overflow-hidden border border-warm-border">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(exp.percentOfRevenue * 10, 100)}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    {pctChange !== 0 ? (
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-[12px] ${
                        pctChange > 0 ? 'bg-[#DC4E59]/10 text-[#DC4E59]' : 'bg-[#2EC4D5]/10 text-[#2EC4D5]'
                      }`} dir="ltr">
                        {pctChange > 0 ? '+' : ''}{pctChange}%
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-[12px] bg-[#2EC4D5]/10 text-[#2EC4D5]">קבוע</span>
                    )}
                  </td>
                </tr>
              )
            })}
            <tr className="font-bold" style={{ borderTop: '2px solid #F5E6DE' }}>
              <td className="text-right text-xs text-[#2D3748] py-3 px-2">סה״כ</td>
              <td className="text-right text-xs tabular-nums font-mono text-[#2D3748] py-3 px-2">{totalExpenses.toLocaleString()}</td>
              <td className="text-right text-xs tabular-nums font-mono text-[#2D3748] py-3 px-2">{((totalExpenses / totalRevenue) * 100).toFixed(0)}%</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

// ─── Overview: Department Bars ──────────────────────────────────
const DEPT_BAR_COLORS = [
  'linear-gradient(90deg, #DC4E59, #E8777F)',
  'linear-gradient(90deg, #6C5CE7, #8B7FED)',
  'linear-gradient(90deg, #2EC4D5, #5DD8E3)',
  'linear-gradient(90deg, #42a5f5, #90caf9)',
  'linear-gradient(90deg, #F6B93B, #F8CB6B)',
  'linear-gradient(90deg, #2EC4D5, #80cbc4)',
  'linear-gradient(90deg, #A0AEC0, #b0bec5)',
  'linear-gradient(90deg, #DC4E59, #ef9a9a)',
]

function OverviewDepartmentBars({ departments }: { departments: DepartmentSales[] }) {
  const sorted = [...departments].sort((a, b) => b.sharePercent - a.sharePercent).slice(0, 8)
  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">נתח מכירות לפי מחלקה</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((dept, i) => (
          <div key={dept.id} className="flex items-center gap-2.5">
            <span className="text-xs w-16 text-right shrink-0 text-[#4A5568]">{dept.name}</span>
            <div className="flex-1 h-[18px] bg-[#FDF8F6] rounded-[9px] overflow-hidden border border-warm-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dept.sharePercent * 3.5}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                className="h-full rounded-[9px]"
                style={{ background: DEPT_BAR_COLORS[i] }}
              />
            </div>
            <span className="text-xs font-semibold text-[#2D3748] w-12 text-left tabular-nums font-mono" dir="ltr">{dept.sharePercent}%</span>
            <span className={`text-[11px] w-14 text-left tabular-nums ${dept.yoyChangePercent >= 0 ? 'text-[#2EC4D5]' : 'text-[#DC4E59]'}`} dir="ltr">
              {dept.yoyChangePercent > 0 ? '▲' : '▼'} {Math.abs(dept.yoyChangePercent)}%
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Overview: Alerts & Targets ─────────────────────────────────
function AlertsTargetsCard({ report }: { report: Report }) {
  const alerts = [
    { label: `מלאי גבוה (${report.compliance.highInventory.actual} פריטים, יעד ${report.compliance.highInventory.target})`, met: report.compliance.highInventory.met },
    { label: `חותמות אדומות (${report.compliance.redAlerts.redSubscriptions}, יעד ${report.compliance.redAlerts.target})`, met: report.compliance.redAlerts.met },
    { label: `חסרי פעילות (${report.compliance.missingActivities.actual} פריטים, יעד ${report.compliance.missingActivities.fixedTarget})`, met: report.compliance.missingActivities.met },
    { label: `חזרות (${report.compliance.returns.actual}, יעד ${report.compliance.returns.target})`, met: report.compliance.returns.met },
    { label: `ציון בקרת איכות (${report.operations.qualityScore.current}, יעד ${report.operations.qualityScore.target})`, met: report.operations.qualityScore.current >= report.operations.qualityScore.target },
    { label: `אחוז עלות שכר (${report.hr.salaryCostPercent}%, יעד ${report.hr.salaryTarget}%)`, met: report.hr.salaryCostPercent <= report.hr.salaryTarget },
    { label: `פחת בשר (${report.operations.meatWaste}%)`, met: report.operations.meatWaste <= 5 },
    { label: `תלונות לקוח (${report.operations.customerComplaints.current} החודש)`, met: report.operations.customerComplaints.current <= report.operations.customerComplaints.target },
  ]

  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">התראות ויעדים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-warm-divider last:border-b-0">
            <span className="text-xs text-[#4A5568]">{alert.label}</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${alert.met ? 'bg-[#2EC4D5]' : 'bg-[#DC4E59]'}`} />
              {alert.met ? 'עמד' : 'לא עמד'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Overview: HR & Staffing Card ───────────────────────────────
function OverviewStaffingCard({ hr }: { hr: Report['hr'] }) {
  return (
    <Card className="border-warm-border rounded-[16px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#2D3748]">כוח אדם ותחלופה</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2.5 mb-5">
          {[
            { label: 'תקן', value: hr.authorized },
            { label: 'מצבה רישומית', value: hr.actual },
            { label: 'משרות בפועל', value: hr.actual },
            { label: 'שעות נוספות', value: Math.round(hr.actual * 23).toLocaleString() },
          ].map(item => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-[#FDF8F6]">
              <p className="text-[11px] text-[#A0AEC0] mb-1.5">{item.label}</p>
              <p className="text-xl font-bold text-[#2D3748] tabular-nums" dir="ltr">{item.value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D3748] mb-3">תחלופת עובדים (שנתי)</p>
          <div dir="ltr" className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart
                data={[
                  { year: String(REPORT_YEAR - 2), rate: 81.6, monthly: 7.8 },
                  { year: String(REPORT_YEAR - 1), rate: 81.6, monthly: 6.7 },
                  { year: String(REPORT_YEAR), rate: hr.turnoverRate, monthly: 6.7 },
                ]}
                barGap={4}
              >
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name === 'rate' ? 'שיעור תחלופה שנתי' : 'עזיבה חודשית ממוצעת']}
                  contentStyle={{ direction: 'rtl', borderRadius: '10px', border: '1px solid #FFE8DE', fontSize: 12 }}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={28}>
                  <Cell fill="rgba(108, 92, 231, 0.2)" stroke="#6C5CE7" strokeWidth={2} />
                  <Cell fill="rgba(108, 92, 231, 0.3)" stroke="#6C5CE7" strokeWidth={2} />
                  <Cell fill="rgba(220, 78, 89, 0.4)" stroke="#DC4E59" strokeWidth={2} />
                </Bar>
                <Line type="monotone" dataKey="monthly" stroke="#42a5f5" strokeWidth={2} dot={{ r: 4, fill: '#42a5f5' }} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewView({ report }: { report: Report }) {
  const s = report.sales
  const kpis: KPICardData[] = [
    { label: 'מכירות סניף', value: s.total.current, format: 'currencyShort', trend: s.total.vsTarget, trendLabel: `יעד: ${formatCurrencyShort(s.total.target)}`, gradient: s.total.vsTarget >= 0 ? 'blue' : 'red' },
    { label: 'לקוחות', value: s.customers.current, format: 'number', trend: s.customers.change, trendLabel: `סל ממוצע: ₪${s.avgBasket.current.toLocaleString()}`, gradient: 'pink' },
    { label: 'לקוחות ליום', value: Math.round(s.customers.current / WORKING_DAYS_PER_MONTH), format: 'number', trend: s.customers.change, trendLabel: `דירוג #${s.customers.ranking}`, gradient: 'orange' },
    { label: 'סל ממוצע', value: s.avgBasket.current, format: 'currency', trend: s.avgBasket.change, trendLabel: 'שנתי', gradient: 'teal' },
  ]
  return (
    <div className="space-y-5">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <MonthlyComparisonChart data={report.monthly} />
        <BranchPerformanceCard report={report} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <OverviewExpenseTable expenses={report.expenses} totalRevenue={s.total.current} />
        <OverviewDepartmentBars departments={report.departments} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <AlertsTargetsCard report={report} />
        <OverviewStaffingCard hr={report.hr} />
      </div>
    </div>
  )
}

function InventoryView({ report }: { report: Report }) {
  const ops = report.operations
  const kpis: KPICardData[] = [
    { label: 'ימי מלאי ממוצע', value: ops.avgDaysOfInventory.current, format: 'number', trend: ops.avgDaysOfInventory.current <= ops.avgDaysOfInventory.target ? 0 : -Math.round(((ops.avgDaysOfInventory.current - ops.avgDaysOfInventory.target) / ops.avgDaysOfInventory.target) * 100), trendLabel: `יעד: ${ops.avgDaysOfInventory.target} ימים`, gradient: ops.avgDaysOfInventory.current <= ops.avgDaysOfInventory.target ? 'green' : 'red' },
    { label: 'פריטי מלאי גבוה', value: report.compliance.highInventory.actual, format: 'number', trend: report.compliance.highInventory.met ? 0 : -11.7, trendLabel: `יעד: ${report.compliance.highInventory.target}`, gradient: 'orange' },
    { label: 'חסרי פעילות', value: report.compliance.missingActivities.actual, format: 'number', trend: -report.compliance.missingActivities.deviation, trendLabel: `יעד: ${report.compliance.missingActivities.timeTarget}`, gradient: 'red' },
  ]
  const target = ops.avgDaysOfInventory.target
  const sorted = [...report.departments].sort((a, b) => b.avgDaysOfInventory - a.avgDaysOfInventory)
  const maxDays = Math.max(...sorted.map(d => d.avgDaysOfInventory))

  return (
    <>
      <KPIGrid items={kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-warm-border rounded-[16px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#2D3748]">ימי מלאי ממוצע לפי מחלקה</CardTitle>
              <Badge variant="secondary" className="text-xs">יעד: {target} ימים</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sorted.map(dept => {
                const overTarget = dept.avgDaysOfInventory > target
                const barPct = (dept.avgDaysOfInventory / maxDays) * 100
                const targetPct = (target / maxDays) * 100
                return (
                  <div key={dept.id} className="flex items-center gap-2.5">
                    <span className="text-xs w-24 text-right shrink-0 text-[#4A5568] truncate">{dept.name}</span>
                    <div className="flex-1 relative h-5 bg-[#FDF8F6] rounded-[4px] overflow-hidden border border-warm-border">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-y-0 right-0 rounded-[4px]"
                        style={{ background: overTarget ? '#DC4E59' : '#2EC4D5', opacity: 0.7 }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-px border-r-2 border-dashed border-[#F6B93B]"
                        style={{ right: `${targetPct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-12 text-left tabular-nums font-mono ${overTarget ? 'text-[#DC4E59]' : 'text-[#2EC4D5]'}`} dir="ltr">
                      {dept.avgDaysOfInventory}d
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-warm-divider text-[11px] text-[#A0AEC0]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-[#2EC4D5]" />
                תקין (≤{target} ימים)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-[#DC4E59]" />
                מעל יעד (&gt;{target} ימים)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-px h-3 border-r-2 border-dashed border-[#F6B93B]" />
                קו יעד
              </span>
            </div>
          </CardContent>
        </Card>
        <ComplianceCards compliance={report.compliance} />
      </div>
    </>
  )
}

function HRView({ report }: { report: Report }) {
  const hr = report.hr
  const kpis: KPICardData[] = [
    { label: 'תקן עובדים', value: hr.authorized, format: 'number', trend: 0, trendLabel: '', gradient: 'blue' },
    { label: 'עובדים בפועל', value: hr.actual, format: 'number', trend: +((( hr.actual - hr.authorized) / hr.authorized) * 100).toFixed(2), trendLabel: 'מעל תקן', gradient: 'green' },
    { label: 'עלות שכר', value: +hr.salaryCostPercent.toFixed(2), format: 'percent', trend: 0.9, trendLabel: `יעד: ${hr.salaryTarget}%`, gradient: 'pink' },
    { label: 'תחלופה שנתית', value: Math.round(hr.turnoverRate), format: 'number', trend: -2.3, trendLabel: `דירוג #${hr.turnoverRanking}`, gradient: 'orange' },
  ]
  return (
    <>
      <KPIGrid items={kpis} />
      <StaffingSection hr={hr} />
    </>
  )
}

function DepartmentsView({ report }: { report: Report }) {
  const bestDept = report.departments.reduce((a, b) => a.yoyChangePercent > b.yoyChangePercent ? a : b)
  const worstDept = report.departments.reduce((a, b) => a.yoyChangePercent < b.yoyChangePercent ? a : b)
  const kpis: KPICardData[] = [
    { label: 'מחלקות פעילות', value: report.departments.length, format: 'number', trend: 0, trendLabel: '', gradient: 'blue' },
    { label: `מוביל: ${bestDept.name}`, value: Math.round(bestDept.yoyChangePercent), format: 'number', trend: bestDept.yoyChangePercent, trendLabel: 'צמיחה', gradient: 'green' },
    { label: `נחלש: ${worstDept.name}`, value: Math.abs(Math.round(worstDept.yoyChangePercent)), format: 'number', trend: worstDept.yoyChangePercent, trendLabel: 'ירידה', gradient: 'red' },
  ]
  return (
    <>
      <KPIGrid items={kpis} columns={3} />
      <DepartmentBreakdown departments={report.departments} />
    </>
  )
}

function CostsView({ report }: { report: Report }) {
  const totalExpenses = report.expenses.reduce((s, e) => s + e.currentMonth, 0)
  const kpis: KPICardData[] = [
    { label: 'הכנסות', value: report.sales.total.current, format: 'currencyShort', trend: report.sales.total.yoyChange, trendLabel: 'שנתי', gradient: 'green' },
    { label: 'סה"כ הוצאות', value: totalExpenses, format: 'currencyShort', trend: 3.1, trendLabel: 'שנתי', gradient: 'red' },
    { label: 'יחס הוצאות', value: 11, format: 'number', trend: -0.5, trendLabel: '% מהכנסות', gradient: 'orange' },
    { label: 'הוצאת שכר', value: report.hr.salaryExpense.current, format: 'currencyShort', trend: 0.9, trendLabel: `${report.hr.salaryCostPercent}%`, gradient: 'pink' },
  ]
  return (
    <>
      <KPIGrid items={kpis} />
      <ExpenseSummary expenses={report.expenses} />
    </>
  )
}

function QualityView({ report }: { report: Report }) {
  const ops = report.operations
  const kpis: KPICardData[] = [
    { label: 'ציון איכות', value: ops.qualityScore.current, format: 'number', trend: -17.6, trendLabel: `יעד: ${ops.qualityScore.target}`, gradient: 'orange' },
    { label: 'איכות טרי', value: ops.freshQualityScore.current, format: 'number', trend: 3.4, trendLabel: '', gradient: 'green' },
    { label: 'פחת בשר %', value: Math.round(ops.meatWaste * 10), format: 'number', trend: -2.1, trendLabel: '', gradient: 'red' },
    { label: 'תלונות לקוחות', value: ops.customerComplaints.current, format: 'number', trend: 0, trendLabel: `יעד: ${ops.customerComplaints.target}`, gradient: 'teal' },
  ]
  return (
    <>
      <KPIGrid items={kpis} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QualityGauge
          score={ops.qualityScore.current}
          maxScore={100}
          title={`ציון איכות (דירוג #${ops.qualityScore.ranking})`}
        />
        <OperationsStatsCard operations={ops} />
      </div>
    </>
  )
}

function ReportsView({ report }: { report: Report }) {
  return (
    <>
      <MonthlyComparisonChart data={report.monthly} />
      <MonthlyOpsGrid data={report.monthly} />
    </>
  )
}

function AlertsView({ report }: { report: Report }) {
  const kpis: KPICardData[] = [
    { label: 'התראות אדומות', value: report.compliance.redAlerts.actual, format: 'number', trend: -10, trendLabel: `יעד: ${report.compliance.redAlerts.target}`, gradient: 'red' },
    { label: 'חותמות אדומות', value: report.compliance.redAlerts.redSubscriptions, format: 'number', trend: -report.compliance.redAlerts.rate, trendLabel: '', gradient: 'orange' },
    { label: 'דיווחי מוקד', value: report.operations.focusReports.current, format: 'number', trend: -50, trendLabel: `יעד: ${report.operations.focusReports.target}`, gradient: 'purple' },
  ]
  return (
    <>
      <KPIGrid items={kpis} columns={3} />
      <ComplianceCards compliance={report.compliance} />
    </>
  )
}

const VIEW_TITLES: Record<string, string> = {
  overview: 'סקירה כללית',
  inventory: 'מלאי',
  hr: 'כח אדם',
  departments: 'מחלקות',
  costs: 'הוצאות ועלויות',
  quality: 'בקרת איכות',
  reports: 'דוחות',
  alerts: 'התראות',
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
function StoreManagerPage() {
  const { view } = Route.useSearch()
  const [selectedBranchId, setSelectedBranchId] = useState('hadera-44')

  const isHadera = selectedBranchId === 'hadera-44'
  const branch = allBranches.find(b => b.id === selectedBranchId) ?? allBranches[0]
  const report = useMemo(
    () => isHadera ? haderaFullReport : branchToFullReport(branch),
    [selectedBranchId],
  )

  const renderView = () => {
    switch (view) {
      case 'inventory': return <InventoryView report={report} />
      case 'hr': return <HRView report={report} />
      case 'departments': return <DepartmentsView report={report} />
      case 'costs': return <CostsView report={report} />
      case 'quality': return <QualityView report={report} />
      case 'reports': return <ReportsView report={report} />
      case 'alerts': return <AlertsView report={report} />
      default: return <OverviewView report={report} />
    }
  }

  return (
    <PageContainer key={`${selectedBranchId}-${view}`}>
      {/* Branch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId} dir="rtl">
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="בחר סניף" />
            </SelectTrigger>
            <SelectContent>
              {branchOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs w-fit">{currentMonthYear()}</Badge>
        </div>
      </div>
      {view !== 'overview' && (
        <h2 className="text-lg font-bold text-[#2D3748] text-center">{VIEW_TITLES[view] ?? ''}</h2>
      )}

      {/* Branch Info Header */}
      <BranchInfoBar info={report.info} />

      {/* View Content */}
      {renderView()}
    </PageContainer>
  )
}

export const Route = createFileRoute('/store-manager/')({
  component: StoreManagerPage,
  validateSearch: (search: Record<string, unknown>) => ({
    view: (search.view as string) || 'overview',
  }),
})
