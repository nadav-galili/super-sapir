import { useMemo } from 'react'
import { Archive, Database, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCategorySummaries } from '@/data/mock-categories'
import { usePromoTaxonomy } from '@/contexts/PromoTaxonomyContext'
import type { BriefSlice, SliceSetter } from '@/lib/promo-simulator/state'

interface Step1BriefProps {
  brief: BriefSlice
  onChange: SliceSetter<BriefSlice>
}

const LABEL =
  'text-[15px] font-medium text-[#4A5568] mb-1.5 block'

const INPUT_CLS =
  'flex h-10 w-full items-center rounded-[10px] border border-[#FFE8DE] bg-white px-3 py-2 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FDF8F6] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40'

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Archive
  title: string
  description: string
}) {
  return (
    <Card className="border-[#FFE8DE] rounded-[16px] bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-[#2D3748]">
          <span
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2EC4D5, #5DD8E3)' }}
          >
            <Icon className="w-4 h-4 text-white" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-[#4A5568] leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

export function Step1Brief({ brief, onChange }: Step1BriefProps) {
  const categories = useMemo(() => getCategorySummaries(), [])
  const { segments, salesArenas, durationWeeksOptions } = usePromoTaxonomy()

  return (
    <div className="space-y-6">
      <Card className="border-[#FFE8DE] rounded-[16px]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#2D3748]">
            רקע / בריף
          </CardTitle>
          <p className="text-lg text-[#4A5568]">
            פרטי המבצע, הקטגוריה, הקמעונאי ולוח הזמנים
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={LABEL} htmlFor="f-category">
                קטגוריה
              </label>
              <Select
                value={brief.category}
                onValueChange={(v) => onChange({ category: v })}
              >
                <SelectTrigger id="f-category" className="text-[16px]">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.name}
                      className="text-[16px]"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={LABEL} htmlFor="f-segment">
                סגמנט
              </label>
              <Select
                value={brief.segment || undefined}
                onValueChange={(v) =>
                  onChange({ segment: v as BriefSlice['segment'] })
                }
              >
                <SelectTrigger id="f-segment" className="text-[16px]">
                  <SelectValue placeholder="בחר סגמנט" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((s) => (
                    <SelectItem key={s} value={s} className="text-[16px]">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={LABEL} htmlFor="f-product">
                מוצר
              </label>
              <input
                id="f-product"
                type="text"
                value={brief.product}
                onChange={(e) => onChange({ product: e.target.value })}
                placeholder="שם המוצר"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="f-arena">
                זירה
              </label>
              <Select
                value={brief.salesArena || undefined}
                onValueChange={(v) =>
                  onChange({ salesArena: v as BriefSlice['salesArena'] })
                }
              >
                <SelectTrigger id="f-arena" className="text-[16px]">
                  <SelectValue placeholder="בחר זירה" />
                </SelectTrigger>
                <SelectContent>
                  {salesArenas.map((s) => (
                    <SelectItem key={s} value={s} className="text-[16px]">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={LABEL} htmlFor="f-retailer">
                קמעונאי
              </label>
              <input
                id="f-retailer"
                type="text"
                value={brief.retailer}
                onChange={(e) => onChange({ retailer: e.target.value })}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="f-start">
                תאריך התחלה
              </label>
              <input
                id="f-start"
                type="date"
                value={brief.startDate}
                onChange={(e) => onChange({ startDate: e.target.value })}
                className={INPUT_CLS}
                dir="ltr"
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="f-duration">
                משך מבצע
              </label>
              <Select
                value={String(brief.durationWeeks)}
                onValueChange={(v) => onChange({ durationWeeks: Number(v) })}
              >
                <SelectTrigger id="f-duration" className="text-[16px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationWeeksOptions.map((o) => (
                    <SelectItem
                      key={o.value}
                      value={String(o.value)}
                      className="text-[16px]"
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={LABEL} htmlFor="f-owner">
                אחראי מכירות
              </label>
              <input
                id="f-owner"
                type="text"
                value={brief.salesOwner}
                onChange={(e) => onChange({ salesOwner: e.target.value })}
                placeholder="שם האחראי"
                className={INPUT_CLS}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          icon={Archive}
          title="ארכיון"
          description="שלוף מבצעים דומים מהעבר כדי ללמוד מה עבד ומה לא — וקבל נקודת פתיחה מהירה."
        />
        <InfoCard
          icon={Database}
          title="נתונים / רקע"
          description="הנתונים המוצגים מתבססים על ביצועי קטגוריה ברשת, לפי סניף, סגמנט ותקופה."
        />
        <InfoCard
          icon={BookOpen}
          title="מאגר ידע"
          description="המערכת מכירה את סוגי המבצעים, ההשפעות הצפויות והטריגרים לצריכה בקטגוריות מזון."
        />
      </div>
    </div>
  )
}
