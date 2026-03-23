import type { BranchFullReport, DepartmentSales } from '@/data/hadera-real'
import { MONTHS_HE, REPORT_MONTH, REPORT_YEAR, WORKING_DAYS_PER_MONTH } from '@/data/constants'
import { formatCurrencyShort } from '@/lib/format'

// ─── Types ──────────────────────────────────────────────────────

export interface BriefingItem {
  priority: number
  icon: 'alert' | 'trend' | 'target' | 'staff' | 'quality'
  text: string
}

export interface Recommendation {
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'sales' | 'operations' | 'hr' | 'compliance'
  estimatedEffect: string
}

export interface AIAnalysisResult {
  briefing: BriefingItem[]
  recommendations: Recommendation[]
}

export interface AnomalyResult {
  departmentId: string
  departmentName: string
  deviation: number
  severity: 'warning' | 'critical'
  tooltipText: string
}

// ─── Anomaly Detection (client-side, no API) ────────────────────

export function detectAnomalies(
  departments: DepartmentSales[],
  storeYoyChange: number,
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = []

  for (const dept of departments) {
    const deviation = dept.yoyChangePercent - storeYoyChange
    const absDeviation = Math.abs(deviation)

    if (absDeviation < 10) continue

    const severity: AnomalyResult['severity'] = absDeviation >= 15 ? 'critical' : 'warning'
    const direction = deviation > 0 ? 'עלייה' : 'ירידה'
    const tooltipText = `${dept.name}: ${direction} חריגה של ${absDeviation.toFixed(1)} נקודות מממוצע הסניף (${storeYoyChange}%)`

    anomalies.push({
      departmentId: dept.id,
      departmentName: dept.name,
      deviation,
      severity,
      tooltipText,
    })
  }

  return anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))
}

// ─── Prompt Payload Builder ─────────────────────────────────────

export function buildPromptPayload(report: BranchFullReport) {
  const s = report.sales
  const ops = report.operations
  const hr = report.hr
  const c = report.compliance

  const WORKING_DAYS = WORKING_DAYS_PER_MONTH

  const anomalies = detectAnomalies(report.departments, s.total.yoyChange)

  const recentMonths = report.monthly
    .filter(m => m.monthNum <= REPORT_MONTH)
    .slice(-3)
    .map(m => ({ month: m.month, yoyChange: m.yoyChange, sales: formatCurrencyShort(m.currentSales) }))

  // Send all departments sorted by share (matches the bar chart display)
  const deptsByShare = [...report.departments]
    .sort((a, b) => b.sharePercent - a.sharePercent)
    .slice(0, 8)
    .map(d => ({ name: d.name, sales: formatCurrencyShort(d.currentMonth), yoy: d.yoyChangePercent, share: d.sharePercent }))

  // Send top 7 expenses sorted by amount (matches the bar chart display)
  const sortedExpenses = [...report.expenses]
    .sort((a, b) => b.currentMonth - a.currentMonth)
    .slice(0, 7)
    .map(e => {
      const yoyChange = e.monthlyAvg2024 > 0 ? Math.round(((e.currentMonth - e.monthlyAvg2024) / e.monthlyAvg2024) * 100) : 0
      return {
        name: e.name,
        amount: formatCurrencyShort(e.currentMonth),
        pctRevenue: e.percentOfRevenue,
        yoyChange: `${yoyChange}%`,
      }
    })

  // Productivity per work hour (matches the branch performance card)
  const totalWorkHours = hr.actual * WORKING_DAYS * 8
  const productivityPerHour = totalWorkHours > 0 ? Math.round(s.total.current / totalWorkHours) : 0

  return {
    branch: {
      name: report.info.name,
      number: report.info.branchNumber,
      grade: report.info.grade,
      area: report.info.sellingArea,
      revenuePerMeter: report.info.revenuePerMeter,
    },
    period: `${MONTHS_HE[REPORT_MONTH - 1]} ${REPORT_YEAR}`,
    sales: {
      total: formatCurrencyShort(s.total.current),
      target: formatCurrencyShort(s.total.target),
      vsTarget: `${s.total.vsTarget}%`,
      yoyChange: `${s.total.yoyChange}%`,
      avgBasket: s.avgBasket.current,
      avgBasketChange: `${s.avgBasket.change}%`,
      customersMonthly: s.customers.current,
      customersPerDay: Math.round(s.customers.current / WORKING_DAYS),
      customersChange: `${s.customers.change}%`,
    },
    operations: {
      eyedoScore: `${ops.qualityScore.current}/${ops.qualityScore.target} (${ops.qualityScore.current >= ops.qualityScore.target ? 'עמד' : 'לא עמד'})`,
      inventoryDays: `${ops.avgDaysOfInventory.current}/${ops.avgDaysOfInventory.target}`,
      meatWaste: `${ops.meatWaste}% (יעד: 5%)`,
      complaints: `${ops.customerComplaints.current}/${ops.customerComplaints.target} (${ops.customerComplaints.current <= ops.customerComplaints.target ? 'עמד' : 'לא עמד'})`,
    },
    hr: {
      salaryCost: `${hr.salaryCostPercent}% (יעד: ${hr.salaryTarget}%, ${hr.salaryCostPercent <= hr.salaryTarget ? 'עמד' : 'לא עמד'})`,
      staffing: `${hr.actual} בפועל מתוך ${hr.authorized} תקן`,
      turnover: `${hr.turnoverRate}%`,
      productivityPerHour: `₪${productivityPerHour}`,
    },
    compliance: {
      highInventory: `${c.highInventory.actual}/${c.highInventory.target} (${c.highInventory.met ? 'עמד' : 'לא עמד'})`,
      redAlerts: `${c.redAlerts.redSubscriptions}/${c.redAlerts.target} (${c.redAlerts.met ? 'עמד' : 'לא עמד'})`,
      missingActivities: `${c.missingActivities.actual}/${c.missingActivities.fixedTarget} (${c.missingActivities.met ? 'עמד' : 'לא עמד'})`,
      returns: `${c.returns.actual}/${c.returns.target} (${c.returns.met ? 'עמד' : 'לא עמד'})`,
    },
    anomalies: anomalies.map(a => `${a.departmentName}: סטייה של ${Math.abs(a.deviation).toFixed(1)} נקודות אחוז ${a.deviation > 0 ? 'מעל' : 'מתחת'} לממוצע הסניף (${a.severity === 'critical' ? 'קריטי' : 'אזהרה'})`),
    recentTrend: recentMonths,
    departments: deptsByShare,
    expenses: sortedExpenses,
  }
}

