# Category Manager Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the category-manager landing page and drill-down page into a full-featured analytics dashboard with profitability, inventory, promotions, alerts, and comparison toggles — making it pitch-ready for Super Sapir.

**Architecture:** Extend `DepartmentMetrics` with margin, inventory, promotion, and trend data. Remove `isPrivateLabel`. Rebuild both route pages: landing gets comparison toggle + KPIs + alerts bar + bubble chart + enhanced table; drill-down gets KPIs + 12-month trend chart + branch table + promotions card. All new chart components use Recharts with the existing warm color palette.

**Tech Stack:** React 19, TypeScript, TanStack Router, TanStack Table, Recharts 3, Motion (Framer Motion v12+), Tailwind CSS 3, shadcn/ui, Lucide icons.

---

## File Structure

### Files to Modify
- `src/data/types.ts` — Extend `DepartmentMetrics` with new fields, add `Promotion` type, add `CategoryAlert` type
- `src/data/hadera-branch.ts` — Add new fields to real Hadera department data, remove `isPrivateLabel`
- `src/data/generators.ts` — Generate new fields for mock branches
- `src/data/mock-categories.ts` — Extend `CategorySummary` and aggregation logic for new fields
- `src/routes/category-manager/index.tsx` — Complete rewrite of landing page
- `src/routes/category-manager/$categoryId.tsx` — Complete rewrite of drill-down page
- `src/components/tables/CategoryTable.tsx` — Rewrite with new columns (margin, target achievement, inventory days, YoY)

### Files to Create
- `src/components/charts/CategoryBubbleChart.tsx` — Recharts ScatterChart: X=sales, Y=margin%, Z(size)=growth, color=growth direction
- `src/components/dashboard/AlertsBar.tsx` — Top 5 category alerts with severity, clickable to drill-down
- `src/components/dashboard/ComparisonToggle.tsx` — Segmented control: vs target / vs last year / vs last month
- `src/components/charts/TrendLineChart.tsx` — 12-month line chart for drill-down
- `src/components/dashboard/PromotionCard.tsx` — Promotion effectiveness table with uplift/ROI

### Files to Delete
- `src/components/charts/CategoryTreemap.tsx` — Replaced by bubble chart

---

## Task 1: Extend Data Types

**Files:**
- Modify: `src/data/types.ts`

- [ ] **Step 1: Add `Promotion` interface and extend `DepartmentMetrics`**

In `src/data/types.ts`, add the `Promotion` interface before `DepartmentMetrics`, then extend `DepartmentMetrics` with new fields and remove `isPrivateLabel`:

```ts
export interface Promotion {
  name: string
  period: string
  baselineSales: number
  actualSales: number
  upliftPercent: number
  roi: number
  hasCannibalization: boolean
}

export interface DepartmentMetrics {
  id: string
  name: string
  sales: number
  sharePercent: number
  targetShare: number
  yoyChange: number
  grossMarginPercent: number
  inventoryTurnover: number
  stockoutRate: number
  inventoryDays: number
  targetSales: number
  lastYearSales: number
  monthlyTrend: number[]
  promotions: Promotion[]
}
```

- [ ] **Step 2: Add `CategoryAlert` interface**

Add after `Promotion` interface:

```ts
export type AlertSeverity = 'high' | 'medium' | 'low'
export type AlertType = 'target-miss' | 'margin-erosion' | 'stockout-risk' | 'declining-sales' | 'low-turnover'

export interface CategoryAlert {
  categoryId: string
  categoryName: string
  type: AlertType
  severity: AlertSeverity
  label: string
  value: string
}
```

- [ ] **Step 3: Add `ComparisonMode` type**

```ts
export type ComparisonMode = 'vs-target' | 'vs-last-year' | 'vs-last-month'
```

- [ ] **Step 4: Verify no TypeScript errors from type changes**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && npx tsc --noEmit 2>&1 | head -30`

Expected: Errors in files that reference `isPrivateLabel` or expect old shape — this is expected and will be fixed in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add src/data/types.ts
git commit -m "feat: extend DepartmentMetrics with margin, inventory, promotion, and trend fields

Remove isPrivateLabel (Super Sapir has no private label).
Add Promotion, CategoryAlert, ComparisonMode types."
```

---

## Task 2: Update Hadera Branch Real Data

**Files:**
- Modify: `src/data/hadera-branch.ts`

- [ ] **Step 1: Add new fields to each department entry**

Update every department in the `departments` array with plausible values. Use these baselines by category type:

- **Produce/fresh** (vegetables, fresh-meat, fresh-fish, deli, pastries, bread): margin 25-35%, turnover 20-30, stockout 2-5%, inventory 3-7 days
- **Packaged** (grocery, dairy, drinks, frozen): margin 22-30%, turnover 12-18, stockout 1-3%, inventory 14-25 days
- **Non-food** (home-products, household): margin 30-40%, turnover 6-10, stockout 1-2%, inventory 30-45 days
- **Specialty** (baby, organic): margin 28-35%, turnover 8-12, stockout 2-4%, inventory 20-30 days

For each department, compute:
- `targetSales`: `sales * (targetShare / sharePercent)` — proportional to target share
- `lastYearSales`: `sales / (1 + yoyChange / 100)` — back-calculate from YoY
- `monthlyTrend`: 12 numbers derived from branch-level `monthlyTrends` scaled by department share
- `promotions`: 2-3 realistic Hebrew promotion entries per department

Example for vegetables:
```ts
{
  id: 'vegetables', name: 'ירקות',
  sales: 1_445_717, sharePercent: 15.4, targetShare: 16.0, yoyChange: 4.2,
  grossMarginPercent: 32.1,
  inventoryTurnover: 24.5,
  stockoutRate: 3.2,
  inventoryDays: 5,
  targetSales: 1_501_429, // sales * (16.0/15.4)
  lastYearSales: 1_387_445, // sales / 1.042
  monthlyTrend: [/* 12 values scaled from branch monthly trends */],
  promotions: [
    { name: 'מבצע ירקות עונתיים', period: '1-14 נובמבר 2025', baselineSales: 620_000, actualSales: 780_000, upliftPercent: 25.8, roi: 185, hasCannibalization: false },
    { name: 'סלסלת ירקות שבועית', period: '15-28 אוקטובר 2025', baselineSales: 580_000, actualSales: 695_000, upliftPercent: 19.8, roi: 142, hasCannibalization: true },
  ],
}
```

Apply this pattern to all 14 departments. Remove `isPrivateLabel` from every entry.

- [ ] **Step 2: Verify TypeScript compiles for this file**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && npx tsc --noEmit 2>&1 | grep hadera`

Expected: No errors from `hadera-branch.ts`. Other files may still error.

- [ ] **Step 3: Commit**

```bash
git add src/data/hadera-branch.ts
git commit -m "feat: add margin, inventory, promotion, and trend data to Hadera branch departments

Plausible values based on Israeli supermarket category benchmarks.
Remove isPrivateLabel from all departments."
```

---

## Task 3: Update Branch Generators

**Files:**
- Modify: `src/data/generators.ts`

- [ ] **Step 1: Update `generateDepartments` to produce new fields**

The function currently only varies `sales` and `yoyChange` from the Hadera base. Extend it to also generate:

```ts
function generateDepartments(totalSales: number): DepartmentMetrics[] {
  return haderaBranch.departments.map(dept => {
    const sales = Math.round(totalSales * (dept.sharePercent / 100) * (0.85 + Math.random() * 0.3))
    const yoyChange = +(dept.yoyChange + (Math.random() * 6 - 3)).toFixed(1)
    const lastYearSales = Math.round(sales / (1 + yoyChange / 100))
    const targetSales = Math.round(sales * (dept.targetShare / dept.sharePercent))

    return {
      ...dept,
      sales,
      yoyChange,
      grossMarginPercent: +(dept.grossMarginPercent + (Math.random() * 6 - 3)).toFixed(1),
      inventoryTurnover: +(dept.inventoryTurnover * (0.8 + Math.random() * 0.4)).toFixed(1),
      stockoutRate: +(dept.stockoutRate + (Math.random() * 2 - 1)).toFixed(1),
      inventoryDays: Math.round(dept.inventoryDays * (0.8 + Math.random() * 0.4)),
      targetSales,
      lastYearSales,
      monthlyTrend: generateDeptMonthlyTrend(sales),
      promotions: generatePromotions(dept.name),
    }
  })
}
```

- [ ] **Step 2: Add `generateDeptMonthlyTrend` helper**

```ts
function generateDeptMonthlyTrend(annualSales: number): number[] {
  const baseMonthly = annualSales / 12
  const seasonality = [0.85, 0.82, 0.95, 1.02, 1.05, 1.08, 1.0, 0.98, 1.15, 1.02, 0.95, 1.13]
  return seasonality.map(s => Math.round(baseMonthly * s * (0.92 + Math.random() * 0.16)))
}
```

- [ ] **Step 3: Add `generatePromotions` helper**

```ts
const PROMO_TEMPLATES: { prefix: string; names: string[] }[] = [
  { prefix: 'מבצע', names: ['1+1', 'שני ב-50%', 'הנחה 30%', 'חבילה משפחתית', 'סוף עונה'] },
]

function generatePromotions(categoryName: string): Promotion[] {
  const count = 2 + Math.floor(Math.random() * 2) // 2-3
  return Array.from({ length: count }, (_, i) => {
    const baselineSales = Math.round(50_000 + Math.random() * 200_000)
    const uplift = +(10 + Math.random() * 40).toFixed(1)
    const actualSales = Math.round(baselineSales * (1 + uplift / 100))
    const tradeSpend = Math.round(baselineSales * (0.03 + Math.random() * 0.07))
    const profit = (actualSales - baselineSales) * 0.25 - tradeSpend
    const roi = Math.round((profit / tradeSpend) * 100)
    const monthIdx = 10 - i * 2 // Nov, Sep, Jul...
    const startDay = 1 + Math.floor(Math.random() * 14)
    const endDay = startDay + 10 + Math.floor(Math.random() * 7)
    const promoName = `${PROMO_TEMPLATES[0].prefix} ${PROMO_TEMPLATES[0].names[Math.floor(Math.random() * PROMO_TEMPLATES[0].names.length)]} ${categoryName}`
    const period = `${startDay}-${endDay} ${MONTHS_HE[monthIdx]} 2025`
    return {
      name: promoName,
      period,
      baselineSales,
      actualSales,
      upliftPercent: uplift,
      roi,
      hasCannibalization: Math.random() > 0.6,
    }
  })
}
```

- [ ] **Step 4: Import `Promotion` type and `MONTHS_HE` if not already imported**

Ensure the import line reads:
```ts
import type { Branch, BranchMetrics, DepartmentMetrics, MonthlyTrend, Promotion } from './types'
```

(`MONTHS_HE` is already imported)

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && npx tsc --noEmit 2>&1 | grep generators`

Expected: No errors from `generators.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/data/generators.ts
git commit -m "feat: generate margin, inventory, promotions, and trend data for mock branches

Seasonal monthly trends, Hebrew promo names with plausible ROI/uplift."
```

---

## Task 4: Update Category Summaries Aggregation

**Files:**
- Modify: `src/data/mock-categories.ts`

- [ ] **Step 1: Extend `CategorySummary` and aggregation**

The `CategorySummary` interface extends `DepartmentMetrics`, so it already inherits new fields. But the `getCategorySummaries()` function needs to aggregate the new fields across branches:

```ts
import { allBranches } from './mock-branches'
import type { DepartmentMetrics, Promotion } from './types'

export interface CategorySummary extends Omit<DepartmentMetrics, 'monthlyTrend' | 'promotions'> {
  branchCount: number
  bestBranch: string
  worstBranch: string
  avgMonthlyTrend: number[]
  allPromotions: Promotion[]
  branches: { name: string; sales: number; grossMarginPercent: number; inventoryTurnover: number; stockoutRate: number; inventoryDays: number; yoyChange: number; targetSales: number; lastYearSales: number }[]
}

export function getCategorySummaries(): CategorySummary[] {
  const deptMap = new Map<string, {
    sales: number
    targetSales: number
    lastYearSales: number
    yoyChanges: number[]
    margins: number[]
    turnovers: number[]
    stockouts: number[]
    inventoryDaysList: number[]
    monthlyTrends: number[][]
    promotions: Promotion[]
    branches: { name: string; sales: number; grossMarginPercent: number; inventoryTurnover: number; stockoutRate: number; inventoryDays: number; yoyChange: number; targetSales: number; lastYearSales: number }[]
  }>()

  for (const branch of allBranches) {
    for (const dept of branch.departments) {
      const existing = deptMap.get(dept.id) ?? {
        sales: 0, targetSales: 0, lastYearSales: 0,
        yoyChanges: [], margins: [], turnovers: [],
        stockouts: [], inventoryDaysList: [], monthlyTrends: [],
        promotions: [], branches: [],
      }
      existing.sales += dept.sales
      existing.targetSales += dept.targetSales
      existing.lastYearSales += dept.lastYearSales
      existing.yoyChanges.push(dept.yoyChange)
      existing.margins.push(dept.grossMarginPercent)
      existing.turnovers.push(dept.inventoryTurnover)
      existing.stockouts.push(dept.stockoutRate)
      existing.inventoryDaysList.push(dept.inventoryDays)
      existing.monthlyTrends.push(dept.monthlyTrend)
      existing.promotions.push(...dept.promotions)
      existing.branches.push({
        name: branch.name,
        sales: dept.sales,
        grossMarginPercent: dept.grossMarginPercent,
        inventoryTurnover: dept.inventoryTurnover,
        stockoutRate: dept.stockoutRate,
        inventoryDays: dept.inventoryDays,
        yoyChange: dept.yoyChange,
        targetSales: dept.targetSales,
        lastYearSales: dept.lastYearSales,
      })
      deptMap.set(dept.id, existing)
    }
  }

  const totalAllSales = Array.from(deptMap.values()).reduce((s, d) => s + d.sales, 0)

  return Array.from(deptMap.entries()).map(([id, data]) => {
    const sorted = [...data.branches].sort((a, b) => b.sales - a.sales)
    const avg = (arr: number[]) => +(arr.reduce((s, c) => s + c, 0) / arr.length).toFixed(1)

    // Aggregate monthly trends: sum across branches per month
    const avgMonthlyTrend = Array.from({ length: 12 }, (_, i) =>
      data.monthlyTrends.reduce((sum, trend) => sum + (trend[i] ?? 0), 0)
    )

    const base = allBranches[0].departments.find(d => d.id === id)!

    return {
      id,
      name: base.name,
      sales: data.sales,
      sharePercent: +((data.sales / totalAllSales) * 100).toFixed(1),
      targetShare: base.targetShare,
      yoyChange: avg(data.yoyChanges),
      grossMarginPercent: avg(data.margins),
      inventoryTurnover: avg(data.turnovers),
      stockoutRate: avg(data.stockouts),
      inventoryDays: Math.round(data.inventoryDaysList.reduce((s, c) => s + c, 0) / data.inventoryDaysList.length),
      targetSales: data.targetSales,
      lastYearSales: data.lastYearSales,
      branchCount: data.branches.length,
      bestBranch: sorted[0].name,
      worstBranch: sorted[sorted.length - 1].name,
      avgMonthlyTrend,
      allPromotions: data.promotions.slice(0, 5), // Top 5 most recent
      branches: sorted,
    }
  }).sort((a, b) => b.sales - a.sales)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && npx tsc --noEmit 2>&1 | head -20`

Expected: Remaining errors only in route files and CategoryTreemap (which will be replaced).

- [ ] **Step 3: Commit**

```bash
git add src/data/mock-categories.ts
git commit -m "feat: aggregate margin, inventory, trend, and promotion data in category summaries

Branch-level detail preserved for drill-down views."
```

---

## Task 5: Create ComparisonToggle Component

**Files:**
- Create: `src/components/dashboard/ComparisonToggle.tsx`

- [ ] **Step 1: Create the component**

A segmented control with 3 options. Uses the design system palette.

```tsx
import type { ComparisonMode } from '@/data/types'

interface ComparisonToggleProps {
  value: ComparisonMode
  onChange: (mode: ComparisonMode) => void
}

const OPTIONS: { value: ComparisonMode; label: string }[] = [
  { value: 'vs-target', label: 'מול יעד' },
  { value: 'vs-last-year', label: 'מול שנה קודמת' },
  { value: 'vs-last-month', label: 'מול חודש קודם' },
]

export function ComparisonToggle({ value, onChange }: ComparisonToggleProps) {
  return (
    <div className="inline-flex rounded-[10px] border border-[#FFE8DE] bg-white p-1 gap-1">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-all ${
            value === opt.value
              ? 'bg-[#DC4E59] text-white shadow-sm'
              : 'text-[#4A5568] hover:bg-[#FDF8F6]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/ComparisonToggle.tsx
git commit -m "feat: add ComparisonToggle segmented control component

Supports vs-target, vs-last-year, vs-last-month modes."
```

---

## Task 6: Create AlertsBar Component

**Files:**
- Create: `src/components/dashboard/AlertsBar.tsx`

- [ ] **Step 1: Create the component**

Shows top 5 category alerts sorted by severity. Each alert is clickable to navigate to drill-down.

```tsx
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, TrendingDown, Package, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryAlert } from '@/data/types'
import type { CategorySummary } from '@/data/mock-categories'

const ALERT_ICONS = {
  'target-miss': TrendingDown,
  'margin-erosion': AlertTriangle,
  'stockout-risk': Package,
  'declining-sales': TrendingDown,
  'low-turnover': Clock,
} as const

const SEVERITY_COLORS = {
  high: { bg: 'bg-[#DC4E59]/10', text: 'text-[#DC4E59]', border: 'border-[#DC4E59]/20' },
  medium: { bg: 'bg-[#F6B93B]/10', text: 'text-[#F6B93B]', border: 'border-[#F6B93B]/20' },
  low: { bg: 'bg-[#A0AEC0]/10', text: 'text-[#A0AEC0]', border: 'border-[#A0AEC0]/20' },
} as const

export function generateAlerts(categories: CategorySummary[]): CategoryAlert[] {
  const alerts: CategoryAlert[] = []

  for (const cat of categories) {
    const targetAchievement = cat.targetSales > 0 ? (cat.sales / cat.targetSales) * 100 : 100

    if (targetAchievement < 90) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'target-miss',
        severity: 'high',
        label: 'החטאת יעד',
        value: `${targetAchievement.toFixed(0)}% מהיעד`,
      })
    }
    if (cat.grossMarginPercent < 20) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'margin-erosion',
        severity: 'high',
        label: 'שחיקת רווחיות',
        value: `${cat.grossMarginPercent.toFixed(1)}% רווח גולמי`,
      })
    }
    if (cat.stockoutRate > 4) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'stockout-risk',
        severity: 'medium',
        label: 'סיכון חוסרים',
        value: `${cat.stockoutRate.toFixed(1)}% חוסרים`,
      })
    }
    if (cat.yoyChange < -5) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'declining-sales',
        severity: 'medium',
        label: 'ירידה במכירות',
        value: `${cat.yoyChange.toFixed(1)}% שנתי`,
      })
    }
    if (cat.inventoryTurnover < 8) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'low-turnover',
        severity: 'low',
        label: 'מחזור מלאי נמוך',
        value: `${cat.inventoryTurnover.toFixed(1)}x`,
      })
    }
  }

  // Sort by severity: high → medium → low
  const order = { high: 0, medium: 1, low: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 5)
}

interface AlertsBarProps {
  alerts: CategoryAlert[]
}

export function AlertsBar({ alerts }: AlertsBarProps) {
  if (alerts.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#DC4E59]" />
            התראות — דורש טיפול
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {alerts.map((alert, i) => {
                const Icon = ALERT_ICONS[alert.type]
                const colors = SEVERITY_COLORS[alert.severity]
                return (
                  <motion.div
                    key={`${alert.categoryId}-${alert.type}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to="/category-manager/$categoryId"
                      params={{ categoryId: alert.categoryId }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-[10px] border ${colors.bg} ${colors.border} hover:shadow-sm transition-shadow`}
                    >
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                      <div className="text-sm">
                        <span className="font-medium text-[#2D3748]">{alert.categoryName}</span>
                        <span className="mx-1 text-[#A0AEC0]">·</span>
                        <span className={colors.text}>{alert.label}</span>
                        <span className="mx-1 text-[#A0AEC0]">·</span>
                        <span className="text-[#4A5568] font-mono text-xs" dir="ltr">{alert.value}</span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/AlertsBar.tsx
git commit -m "feat: add AlertsBar component with severity-based category alerts

Target miss, margin erosion, stockout risk, declining sales, low turnover."
```

---

## Task 7: Create CategoryBubbleChart Component

**Files:**
- Create: `src/components/charts/CategoryBubbleChart.tsx`

- [ ] **Step 1: Create the component**

Recharts ScatterChart: X=sales, Y=margin%, bubble size=|yoyChange|, color=growth direction. Click navigates to drill-down.

```tsx
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import { getGrowthColor } from '@/lib/colors'
import type { CategorySummary } from '@/data/mock-categories'

interface CategoryBubbleChartProps {
  data: CategorySummary[]
}

interface BubbleTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CategorySummary & { z: number } }>
}

function CustomTooltip({ active, payload }: BubbleTooltipProps) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-white rounded-[10px] border border-[#FFE8DE] p-3 shadow-sm" dir="rtl">
      <p className="font-semibold text-[#2D3748] mb-1">{d.name}</p>
      <p className="text-sm text-[#4A5568]">מכירות: <span className="font-mono" dir="ltr">{formatCurrencyShort(d.sales)}</span></p>
      <p className="text-sm text-[#4A5568]">רווח גולמי: <span className="font-mono" dir="ltr">{d.grossMarginPercent}%</span></p>
      <p className="text-sm" style={{ color: getGrowthColor(d.yoyChange) }}>
        צמיחה: <span className="font-mono" dir="ltr">{d.yoyChange > 0 ? '+' : ''}{d.yoyChange}%</span>
      </p>
    </div>
  )
}

export function CategoryBubbleChart({ data }: CategoryBubbleChartProps) {
  const navigate = useNavigate()

  const chartData = data.map(d => ({
    ...d,
    x: d.sales,
    y: d.grossMarginPercent,
    z: Math.max(Math.abs(d.yoyChange) * 80, 200), // Min size for visibility
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            מפת קטגוריות — גודל = צמיחה, צבע = מגמה, X = מכירות, Y = רווחיות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="מכירות"
                  tickFormatter={(v: number) => formatCurrencyShort(v)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="רווח גולמי %"
                  unit="%"
                  tick={{ fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="z" range={[200, 2000]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  data={chartData}
                  animationDuration={1000}
                  onClick={(entry) => {
                    if (entry?.id) {
                      navigate({ to: '/category-manager/$categoryId', params: { categoryId: entry.id } })
                    }
                  }}
                  cursor="pointer"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={getGrowthColor(entry.yoyChange)}
                      fillOpacity={0.7}
                      stroke={getGrowthColor(entry.yoyChange)}
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/CategoryBubbleChart.tsx
git commit -m "feat: add CategoryBubbleChart with sales x margin x growth dimensions

Click-to-drill-down, growth-colored bubbles, custom Hebrew tooltip."
```

---

## Task 8: Create TrendLineChart Component

**Files:**
- Create: `src/components/charts/TrendLineChart.tsx`

- [ ] **Step 1: Create the component**

12-month line chart showing category sales trend over time.

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import { MONTHS_HE } from '@/data/constants'
import { PALETTE } from '@/lib/colors'

interface TrendLineChartProps {
  data: number[]
  title: string
}

export function TrendLineChart({ data, title }: TrendLineChartProps) {
  const chartData = data.map((value, i) => ({
    month: MONTHS_HE[i],
    value,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [formatCurrencyShort(value as number), 'מכירות']}
                  contentStyle={{ direction: 'rtl', borderRadius: '8px', border: '1px solid #FFE8DE' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={PALETTE.red}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: PALETTE.red, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: PALETTE.red }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/TrendLineChart.tsx
git commit -m "feat: add TrendLineChart component for 12-month category sales trends"
```

---

## Task 9: Create PromotionCard Component

**Files:**
- Create: `src/components/dashboard/PromotionCard.tsx`

- [ ] **Step 1: Create the component**

Compact table showing last 3 promotions with baseline vs actual bar, uplift, ROI, cannibalization badge.

```tsx
import { motion } from 'motion/react'
import { Megaphone, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import type { Promotion } from '@/data/types'

interface PromotionCardProps {
  promotions: Promotion[]
  categoryName: string
}

export function PromotionCard({ promotions, categoryName }: PromotionCardProps) {
  if (promotions.length === 0) return null

  const topPromos = promotions.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#6C5CE7]" />
            אפקטיביות מבצעים — {categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FFF0EA]">
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">מבצע</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">תקופה</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">בסיס</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">בפועל</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">עלייה</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">ROI</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">קניבליזציה</th>
                </tr>
              </thead>
              <tbody>
                {topPromos.map((promo, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-[#2D3748]">{promo.name}</td>
                    <td className="px-3 py-2.5 text-[#4A5568]" dir="ltr">{promo.period}</td>
                    <td className="px-3 py-2.5 font-mono text-[#4A5568]" dir="ltr">{formatCurrencyShort(promo.baselineSales)}</td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-[#2D3748]" dir="ltr">{formatCurrencyShort(promo.actualSales)}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[20px] bg-[#2EC4D5]/10 text-[#2EC4D5] text-xs font-semibold font-mono" dir="ltr">
                        +{promo.upliftPercent}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[20px] text-xs font-semibold font-mono ${
                        promo.roi > 0
                          ? 'bg-[#2EC4D5]/10 text-[#2EC4D5]'
                          : 'bg-[#DC4E59]/10 text-[#DC4E59]'
                      }`} dir="ltr">
                        {promo.roi}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {promo.hasCannibalization ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[20px] bg-[#F6B93B]/10 text-[#F6B93B] text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          כן
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[20px] bg-[#A0AEC0]/10 text-[#A0AEC0] text-xs font-medium">
                          לא
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visual baseline vs actual bars */}
          <div className="mt-4 space-y-3">
            {topPromos.map((promo, i) => {
              const maxSales = Math.max(promo.baselineSales, promo.actualSales)
              return (
                <div key={i} className="space-y-1">
                  <p className="text-xs text-[#A0AEC0]">{promo.name}</p>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 h-4 bg-[#FDF8F6] rounded-[5px] overflow-hidden relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#A0AEC0]/30 rounded-[5px]"
                        style={{ width: `${(promo.baselineSales / maxSales) * 100}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-[#2EC4D5]/60 rounded-[5px]"
                        style={{ width: `${(promo.actualSales / maxSales) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="flex gap-4 text-xs text-[#A0AEC0]">
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-[#A0AEC0]/30" /> בסיס</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-[#2EC4D5]/60" /> בפועל</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/PromotionCard.tsx
git commit -m "feat: add PromotionCard with uplift, ROI, cannibalization, and visual bars"
```

---

## Task 10: Rewrite CategoryTable with New Columns

**Files:**
- Modify: `src/components/tables/CategoryTable.tsx`

- [ ] **Step 1: Rewrite the table**

New columns: name, sales, margin%, target achievement%, inventory days, YoY growth, actions. All sortable.

Replace the entire contents of `CategoryTable.tsx`:

```tsx
import { useMemo, useState } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type SortingState, type ColumnDef,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ArrowUpDown, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort, formatPercent } from '@/lib/format'
import { getGrowthColor } from '@/lib/colors'
import type { CategorySummary } from '@/data/mock-categories'

interface CategoryTableProps {
  data: CategorySummary[]
}

function SortHeader({ column, label }: { column: any; label: string }) {
  return (
    <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
      {label} <ArrowUpDown className="w-3 h-3" />
    </button>
  )
}

export function CategoryTable({ data }: CategoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'sales', desc: true }])

  const columns = useMemo<ColumnDef<CategorySummary>[]>(() => [
    {
      accessorKey: 'name',
      header: 'קטגוריה',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'sales',
      header: ({ column }) => <SortHeader column={column} label="מכירות" />,
      cell: ({ getValue }) => (
        <span className="font-semibold font-mono" dir="ltr">{formatCurrencyShort(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: 'grossMarginPercent',
      header: ({ column }) => <SortHeader column={column} label="רווח גולמי %" />,
      cell: ({ getValue }) => {
        const val = getValue() as number
        return <span className="font-mono" dir="ltr" style={{ color: val < 20 ? '#DC4E59' : '#2D3748' }}>{val.toFixed(1)}%</span>
      },
    },
    {
      id: 'targetAchievement',
      header: ({ column }) => <SortHeader column={column} label="עמידה ביעד" />,
      accessorFn: (row) => row.targetSales > 0 ? (row.sales / row.targetSales) * 100 : 100,
      cell: ({ getValue }) => {
        const val = getValue() as number
        return (
          <span className="font-mono" dir="ltr" style={{ color: val < 90 ? '#DC4E59' : val < 100 ? '#F6B93B' : '#2EC4D5' }}>
            {val.toFixed(0)}%
          </span>
        )
      },
    },
    {
      accessorKey: 'inventoryDays',
      header: ({ column }) => <SortHeader column={column} label="ימי מלאי" />,
      cell: ({ getValue }) => <span className="font-mono" dir="ltr">{getValue() as number}</span>,
    },
    {
      accessorKey: 'yoyChange',
      header: ({ column }) => <SortHeader column={column} label="שינוי שנתי" />,
      cell: ({ getValue }) => {
        const change = getValue() as number
        return (
          <span style={{ color: getGrowthColor(change) }} className="font-semibold font-mono" dir="ltr">
            {change > 0 ? '+' : ''}{formatPercent(change)}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link
          to="/category-manager/$categoryId"
          params={{ categoryId: row.original.id }}
          className="text-[#DC4E59] hover:text-[#E8777F] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      ),
      size: 40,
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">טבלת קטגוריות מפורטת</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id} className="border-b border-[#FFF0EA]">
                    {hg.headers.map(header => (
                      <th key={header.id} className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tables/CategoryTable.tsx
git commit -m "feat: rewrite CategoryTable with margin, target achievement, inventory days columns"
```

---

## Task 11: Rewrite Landing Page

**Files:**
- Modify: `src/routes/category-manager/index.tsx`

- [ ] **Step 1: Complete rewrite of the landing page**

```tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { ComparisonToggle } from '@/components/dashboard/ComparisonToggle'
import { AlertsBar, generateAlerts } from '@/components/dashboard/AlertsBar'
import { CategoryBubbleChart } from '@/components/charts/CategoryBubbleChart'
import { CategoryTable } from '@/components/tables/CategoryTable'
import { getCategorySummaries } from '@/data/mock-categories'
import type { KPICardData, ComparisonMode } from '@/data/types'
import { formatCurrencyShort } from '@/lib/format'

function CategoryManagerPage() {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs-target')
  const categories = getCategorySummaries()
  const alerts = generateAlerts(categories)

  const totalSales = categories.reduce((s, c) => s + c.sales, 0)
  const totalTarget = categories.reduce((s, c) => s + c.targetSales, 0)
  const totalLastYear = categories.reduce((s, c) => s + c.lastYearSales, 0)
  const avgMargin = +(categories.reduce((s, c) => s + c.grossMarginPercent, 0) / categories.length).toFixed(1)
  const avgTurnover = +(categories.reduce((s, c) => s + c.inventoryTurnover, 0) / categories.length).toFixed(1)

  // Comparison value based on toggle
  function getComparisonTrend(): { trend: number; label: string } {
    switch (comparisonMode) {
      case 'vs-target': {
        const pct = totalTarget > 0 ? ((totalSales - totalTarget) / totalTarget) * 100 : 0
        return { trend: +pct.toFixed(1), label: 'מול יעד' }
      }
      case 'vs-last-year': {
        const pct = totalLastYear > 0 ? ((totalSales - totalLastYear) / totalLastYear) * 100 : 0
        return { trend: +pct.toFixed(1), label: 'מול שנה קודמת' }
      }
      case 'vs-last-month':
        // Approximate: use -1.5% as simulated month diff
        return { trend: -1.5, label: 'מול חודש קודם' }
    }
  }

  const comparison = getComparisonTrend()

  const kpis: KPICardData[] = [
    {
      label: 'סה"כ מכירות',
      value: totalSales,
      format: 'currencyShort',
      trend: comparison.trend,
      trendLabel: comparison.label,
      gradient: comparison.trend >= 0 ? 'green' : 'red',
    },
    {
      label: 'רווח גולמי ממוצע',
      value: avgMargin * 10, // formatPercent divides by 100
      format: 'percent',
      trend: 1.2,
      trendLabel: 'שנתי',
      gradient: 'purple',
    },
    {
      label: 'מחזור מלאי ממוצע',
      value: avgTurnover,
      format: 'number',
      trend: 0.8,
      trendLabel: 'שנתי',
      gradient: 'blue',
    },
    {
      label: 'התראות פעילות',
      value: alerts.length,
      format: 'number',
      trend: alerts.length > 3 ? -alerts.length : 0,
      trendLabel: alerts.length > 0 ? 'דורשות טיפול' : '',
      gradient: alerts.length > 3 ? 'red' : alerts.length > 0 ? 'orange' : 'green',
    },
  ]

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#2D3748]">מנהל קטגוריה</h1>
        <ComparisonToggle value={comparisonMode} onChange={setComparisonMode} />
      </div>
      <KPIGrid items={kpis} />
      <AlertsBar alerts={alerts} />
      <CategoryBubbleChart data={categories} />
      <CategoryTable data={categories} />
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager/')({
  component: CategoryManagerPage,
})
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/category-manager/index.tsx
git commit -m "feat: rewrite category-manager landing page

Comparison toggle, KPIs (sales/margin/turnover/alerts), alerts bar,
bubble chart, enhanced table. Remove private label KPI."
```

---

## Task 12: Rewrite Drill-Down Page

**Files:**
- Modify: `src/routes/category-manager/$categoryId.tsx`

- [ ] **Step 1: Complete rewrite of the drill-down page**

```tsx
import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { PromotionCard } from '@/components/dashboard/PromotionCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type SortingState, type ColumnDef,
} from '@tanstack/react-table'
import { motion } from 'motion/react'
import { ArrowUpDown } from 'lucide-react'
import { allBranches } from '@/data/mock-branches'
import { DEPARTMENT_NAMES } from '@/data/constants'
import { formatCurrencyShort, formatPercent } from '@/lib/format'
import { getGrowthColor } from '@/lib/colors'
import type { KPICardData } from '@/data/types'

interface BranchCategoryRow {
  branchName: string
  sales: number
  targetSales: number
  targetAchievement: number
  grossMarginPercent: number
  inventoryDays: number
  yoyChange: number
}

function SortHeader({ column, label }: { column: any; label: string }) {
  return (
    <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
      {label} <ArrowUpDown className="w-3 h-3" />
    </button>
  )
}

function CategoryDrillDown() {
  const { categoryId } = Route.useParams()
  const categoryName = DEPARTMENT_NAMES[categoryId] ?? categoryId

  const branchData: BranchCategoryRow[] = allBranches.map(branch => {
    const dept = branch.departments.find(d => d.id === categoryId)
    if (!dept) return null
    return {
      branchName: branch.name,
      sales: dept.sales,
      targetSales: dept.targetSales,
      targetAchievement: dept.targetSales > 0 ? (dept.sales / dept.targetSales) * 100 : 100,
      grossMarginPercent: dept.grossMarginPercent,
      inventoryDays: dept.inventoryDays,
      yoyChange: dept.yoyChange,
    }
  }).filter(Boolean) as BranchCategoryRow[]

  branchData.sort((a, b) => b.sales - a.sales)

  const totalSales = branchData.reduce((s, b) => s + b.sales, 0)
  const totalTarget = branchData.reduce((s, b) => s + b.targetSales, 0)
  const avgMargin = +(branchData.reduce((s, b) => s + b.grossMarginPercent, 0) / branchData.length).toFixed(1)
  const avgTurnover = +(allBranches.reduce((s, b) => {
    const dept = b.departments.find(d => d.id === categoryId)
    return s + (dept?.inventoryTurnover ?? 0)
  }, 0) / allBranches.length).toFixed(1)
  const avgStockout = +(allBranches.reduce((s, b) => {
    const dept = b.departments.find(d => d.id === categoryId)
    return s + (dept?.stockoutRate ?? 0)
  }, 0) / allBranches.length).toFixed(1)

  const targetAchievement = totalTarget > 0 ? ((totalSales - totalTarget) / totalTarget) * 100 : 0

  // Aggregate monthly trend across branches
  const monthlyTrend: number[] = Array.from({ length: 12 }, (_, i) =>
    allBranches.reduce((sum, b) => {
      const dept = b.departments.find(d => d.id === categoryId)
      return sum + (dept?.monthlyTrend[i] ?? 0)
    }, 0)
  )

  // Collect promotions
  const promotions = allBranches.flatMap(b => {
    const dept = b.departments.find(d => d.id === categoryId)
    return dept?.promotions ?? []
  }).slice(0, 3)

  const kpis: KPICardData[] = [
    {
      label: 'מכירות כוללות',
      value: totalSales,
      format: 'currencyShort',
      trend: +targetAchievement.toFixed(1),
      trendLabel: 'מול יעד',
      gradient: targetAchievement >= 0 ? 'green' : 'red',
    },
    {
      label: 'רווח גולמי',
      value: avgMargin * 10,
      format: 'percent',
      trend: 0.8,
      trendLabel: 'שנתי',
      gradient: avgMargin >= 20 ? 'purple' : 'red',
    },
    {
      label: 'מחזור מלאי',
      value: avgTurnover,
      format: 'number',
      trend: 1.2,
      trendLabel: 'שנתי',
      gradient: 'blue',
    },
    {
      label: 'שיעור חוסרים',
      value: avgStockout * 10,
      format: 'percent',
      trend: avgStockout > 3 ? -avgStockout : avgStockout,
      trendLabel: '',
      gradient: avgStockout > 4 ? 'red' : avgStockout > 2 ? 'orange' : 'green',
    },
  ]

  // Branch comparison table
  const [sorting, setSorting] = useState<SortingState>([{ id: 'sales', desc: true }])

  const columns = useMemo<ColumnDef<BranchCategoryRow>[]>(() => [
    {
      accessorKey: 'branchName',
      header: 'סניף',
      cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: 'sales',
      header: ({ column }) => <SortHeader column={column} label="מכירות" />,
      cell: ({ getValue }) => <span className="font-semibold font-mono" dir="ltr">{formatCurrencyShort(getValue() as number)}</span>,
    },
    {
      accessorKey: 'targetAchievement',
      header: ({ column }) => <SortHeader column={column} label="עמידה ביעד" />,
      cell: ({ getValue }) => {
        const val = getValue() as number
        return (
          <span className="font-mono" dir="ltr" style={{ color: val < 90 ? '#DC4E59' : val < 100 ? '#F6B93B' : '#2EC4D5' }}>
            {val.toFixed(0)}%
          </span>
        )
      },
    },
    {
      accessorKey: 'grossMarginPercent',
      header: ({ column }) => <SortHeader column={column} label="רווח גולמי %" />,
      cell: ({ getValue }) => {
        const val = getValue() as number
        return <span className="font-mono" dir="ltr" style={{ color: val < 20 ? '#DC4E59' : '#2D3748' }}>{val.toFixed(1)}%</span>
      },
    },
    {
      accessorKey: 'inventoryDays',
      header: ({ column }) => <SortHeader column={column} label="ימי מלאי" />,
      cell: ({ getValue }) => <span className="font-mono" dir="ltr">{getValue() as number}</span>,
    },
    {
      accessorKey: 'yoyChange',
      header: ({ column }) => <SortHeader column={column} label="שינוי שנתי" />,
      cell: ({ getValue }) => {
        const change = getValue() as number
        return (
          <span style={{ color: getGrowthColor(change) }} className="font-semibold font-mono" dir="ltr">
            {change > 0 ? '+' : ''}{formatPercent(change)}
          </span>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data: branchData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'מנהל קטגוריה', to: '/category-manager' },
          { label: categoryName },
        ]}
      />

      <h2 className="text-2xl font-bold text-[#2D3748]">{categoryName}</h2>

      <KPIGrid items={kpis} />

      <TrendLineChart data={monthlyTrend} title={`מגמת מכירות — ${categoryName} (12 חודשים)`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">השוואת סניפים — {categoryName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id} className="border-b border-[#FFF0EA]">
                      {hg.headers.map(header => (
                        <th key={header.id} className="px-3 py-2 text-right font-medium text-[#A0AEC0]">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-3 py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <PromotionCard promotions={promotions} categoryName={categoryName} />
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager/$categoryId')({
  component: CategoryDrillDown,
})
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/category-manager/\$categoryId.tsx
git commit -m "feat: rewrite category drill-down with trend chart, branch table, promotions

KPIs: sales vs target, margin, turnover, stockout rate.
12-month trend line, sortable branch comparison, promotion effectiveness."
```

---

## Task 13: Delete CategoryTreemap and Clean Up Imports

**Files:**
- Delete: `src/components/charts/CategoryTreemap.tsx`

- [ ] **Step 1: Delete the treemap file**

```bash
rm src/components/charts/CategoryTreemap.tsx
```

- [ ] **Step 2: Search for any remaining references to CategoryTreemap or isPrivateLabel**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && grep -r "CategoryTreemap\|isPrivateLabel" src/ --include="*.ts" --include="*.tsx"`

Expected: No matches. If any remain, fix them.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove CategoryTreemap and isPrivateLabel references"
```

---

## Task 14: Build Verification and Fix

- [ ] **Step 1: Run TypeScript check**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && npx tsc --noEmit 2>&1`

Expected: Clean (no errors). If there are errors, fix them.

- [ ] **Step 2: Run ESLint**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && bun run lint 2>&1`

Expected: Clean or only pre-existing warnings.

- [ ] **Step 3: Run dev server and verify pages load**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && bun run dev`

Manually verify:
- `/category-manager/` — Shows comparison toggle, 4 KPI cards, alerts bar, bubble chart, enhanced table
- `/category-manager/vegetables` — Shows breadcrumbs, 4 KPIs, trend line, branch table, promotions card
- Toggle comparison modes and verify KPI card updates
- Click bubble chart dots to navigate to drill-down
- Click alert items to navigate to drill-down
- Sort table columns in both pages

- [ ] **Step 4: Run production build**

Run: `cd /Users/nadavgalili/personal_projects/superSapir && bun run build 2>&1`

Expected: Build succeeds.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve build errors from category-manager refactor"
```

---

## Task Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Extend data types | types.ts |
| 2 | Update Hadera real data | hadera-branch.ts |
| 3 | Update generators | generators.ts |
| 4 | Update category aggregation | mock-categories.ts |
| 5 | ComparisonToggle component | NEW: ComparisonToggle.tsx |
| 6 | AlertsBar component | NEW: AlertsBar.tsx |
| 7 | CategoryBubbleChart component | NEW: CategoryBubbleChart.tsx |
| 8 | TrendLineChart component | NEW: TrendLineChart.tsx |
| 9 | PromotionCard component | NEW: PromotionCard.tsx |
| 10 | Rewrite CategoryTable | CategoryTable.tsx |
| 11 | Rewrite landing page | index.tsx |
| 12 | Rewrite drill-down page | $categoryId.tsx |
| 13 | Delete treemap + cleanup | CategoryTreemap.tsx |
| 14 | Build verification | - |
