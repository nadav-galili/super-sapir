import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { CategoryTreemap } from '@/components/charts/CategoryTreemap'
import { CategoryTable } from '@/components/tables/CategoryTable'
import { getCategorySummaries } from '@/data/mock-categories'
import type { KPICardData } from '@/data/types'

function CategoryManagerPage() {
  const categories = getCategorySummaries()

  const privateLabelShare = categories
    .filter(c => c.isPrivateLabel)
    .reduce((s, c) => s + c.sharePercent, 0)

  const bestCategory = categories.reduce((best, c) =>
    c.yoyChange > best.yoyChange ? c : best
  )
  const worstCategory = categories.reduce((worst, c) =>
    c.yoyChange < worst.yoyChange ? c : worst
  )

  const kpis: KPICardData[] = [
    { label: 'סה"כ קטגוריות', value: categories.length, format: 'number', trend: 0, trendLabel: '', gradient: 'blue' },
    { label: 'נתח מותג פרטי', value: privateLabelShare * 10, format: 'percent', trend: 2.3, trendLabel: 'שנתי', gradient: 'purple' },
    { label: `מוביל: ${bestCategory.name}`, value: bestCategory.yoyChange * 10, format: 'percent', trend: bestCategory.yoyChange, trendLabel: 'צמיחה', gradient: 'green' },
    { label: `נחלש: ${worstCategory.name}`, value: Math.abs(worstCategory.yoyChange * 10), format: 'percent', trend: worstCategory.yoyChange, trendLabel: 'ירידה', gradient: 'red' },
  ]

  return (
    <PageContainer>
      <KPIGrid items={kpis} />
      <CategoryTreemap data={categories} />
      <CategoryTable data={categories} />
    </PageContainer>
  )
}

export const Route = createFileRoute('/category-manager/')({
  component: CategoryManagerPage,
})
