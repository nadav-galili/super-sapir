import { createFileRoute } from '@tanstack/react-router'
import { Store, Map, ShoppingCart } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { RoleCard } from '@/components/dashboard/RoleCard'
import { RegionDonutChart } from '@/components/charts/RegionDonutChart'
import { getCompanyTotals, getRegionSummaries } from '@/data/mock-regions'
import type { KPICardData } from '@/data/types'

function HomePage() {
  const totals = getCompanyTotals()
  const regions = getRegionSummaries()

  const kpis: KPICardData[] = [
    {
      label: 'סה"כ הכנסות',
      value: totals.totalSales,
      format: 'currencyShort',
      trend: totals.avgGrowth,
      trendLabel: 'שינוי שנתי',
      gradient: 'green',
    },
    {
      label: 'סניפים פעילים',
      value: totals.branchCount,
      format: 'number',
      trend: 0,
      trendLabel: '',
      gradient: 'blue',
    },
    {
      label: 'ציון איכות ממוצע',
      value: totals.avgQuality,
      format: 'number',
      trend: 2.1,
      trendLabel: 'שינוי שנתי',
      gradient: 'orange',
    },
    {
      label: 'סה"כ עובדים',
      value: totals.totalEmployees,
      format: 'number',
      trend: 3.5,
      trendLabel: 'שינוי שנתי',
      gradient: 'purple',
    },
  ]

  return (
    <PageContainer>
      <KPIGrid items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegionDonutChart data={regions} />
        <div className="flex flex-col justify-center space-y-4 p-6">
          <h2 className="text-2xl font-bold">ברוכים הבאים ל-Sapir Analytics</h2>
          <p className="text-muted-foreground leading-relaxed">
            פלטפורמת ניתוח וניהול קמעונאי מתקדמת. בחרו את לוח הבקרה המתאים לתפקידכם
            לצפייה בנתונים בזמן אמת, ניתוח מגמות וקבלת החלטות מבוססות דאטה.
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold">בחירת לוח בקרה</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          title="מנהל סניף"
          description="מעקב אחר ביצועי הסניף, מכירות, איכות, כח אדם ותפעול יומיומי"
          icon={Store}
          to="/store-manager"
          gradient="linear-gradient(135deg, #3b82f6, #1d4ed8)"
          delay={0}
        />
        <RoleCard
          title="מנהל אזור"
          description="סקירת כל הסניפים באזור, דירוג ביצועים, השוואות ומפה אינטראקטיבית"
          icon={Map}
          to="/division-manager"
          gradient="linear-gradient(135deg, #10b981, #047857)"
          delay={100}
        />
        <RoleCard
          title="מנהל קטגוריה"
          description="ניתוח מעמיק לפי מחלקות, נתחי שוק, מגמות צמיחה והשוואות בין סניפים"
          icon={ShoppingCart}
          to="/category-manager"
          gradient="linear-gradient(135deg, #f59e0b, #b45309)"
          delay={200}
        />
      </div>
    </PageContainer>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
})
