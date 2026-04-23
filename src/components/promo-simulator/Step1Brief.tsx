import { useEffect, useMemo, useState } from "react";
import { Archive, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategorySummaries } from "@/data/mock-categories";
import { getSegmentsByDepartmentName } from "@/data/mock-taxonomy";
import { getItemsBySegment } from "@/data/mock-items";
import { DEPARTMENT_NAMES } from "@/data/constants";
import { CATEGORY_MANAGERS } from "@/data/mock-promo-history";
import { usePromoTaxonomy } from "@/contexts/PromoTaxonomyContext";
import { ArchiveSheet } from "./ArchiveSheet";
import { BackgroundDataSheet } from "./BackgroundDataSheet";
import type { BriefSlice, SliceSetter } from "@/lib/promo-simulator/state";

interface Step1BriefProps {
  brief: BriefSlice;
  onChange: SliceSetter<BriefSlice>;
  errorKeys?: ReadonlySet<keyof BriefSlice>;
}

const LABEL = "text-[15px] font-medium text-[#4A5568] mb-1.5 block";

const INPUT_CLS =
  "flex h-10 w-full items-center rounded-[10px] border border-[#E7E0D8] bg-white px-3 py-2 text-[16px] text-[#2D3748] shadow-sm transition-colors hover:bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 focus:border-[#DC4E59]/40";

const ERROR_RING =
  "border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]/25";

const READONLY_CLS =
  "flex h-10 w-full items-center rounded-[10px] border border-[#E7E0D8] bg-[#FAF8F5] px-3 py-2 text-[16px] text-[#2D3748] shadow-sm";

// Compute end date = startDate + durationWeeks * 7 (YYYY-MM-DD).
function computeEndDate(startDate: string, durationWeeks: number): string {
  if (!startDate || !Number.isFinite(durationWeeks) || durationWeeks <= 0)
    return "";
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.round(durationWeeks * 7));
  return d.toISOString().slice(0, 10);
}

interface ClickableInfoCardProps {
  icon: typeof Archive;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

function ClickableInfoCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled,
}: ClickableInfoCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-right w-full disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#DC4E59]/20 rounded-[16px]"
    >
      <Card className="border-[#E7E0D8] rounded-[16px] bg-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(220,78,89,0.08)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2 text-[#2D3748]">
            <span
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #2EC4D5, #5DD8E3)",
              }}
            >
              <Icon className="w-4 h-4 text-white" />
            </span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-[#4A5568] leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </button>
  );
}

export function Step1Brief({ brief, onChange, errorKeys }: Step1BriefProps) {
  const categories = useMemo(() => getCategorySummaries(), []);
  const { salesArenas, durationWeeksOptions } = usePromoTaxonomy();

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);

  // Segments depend on the chosen Category (Department).
  const segments = useMemo(
    () => getSegmentsByDepartmentName(brief.category, DEPARTMENT_NAMES),
    [brief.category]
  );

  // Products depend on the chosen Segment.
  const products = useMemo(
    () => (brief.segment ? getItemsBySegment(brief.segment) : []),
    [brief.segment]
  );

  // Auto-populate category manager based on chosen category.
  useEffect(() => {
    const mapped = brief.category
      ? (CATEGORY_MANAGERS[brief.category] ?? "")
      : "";
    if (mapped && mapped !== brief.categoryManager) {
      onChange({ categoryManager: mapped });
    }
    if (!brief.category && brief.categoryManager) {
      onChange({ categoryManager: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.category]);

  const endDate = computeEndDate(brief.startDate, brief.durationWeeks);

  const hasError = (k: keyof BriefSlice) => errorKeys?.has(k) ?? false;
  const triggerCls = (k: keyof BriefSlice) =>
    `text-[16px] ${hasError(k) ? ERROR_RING : ""}`;
  const inputCls = (k: keyof BriefSlice) =>
    `${INPUT_CLS} ${hasError(k) ? ERROR_RING : ""}`;

  const segmentDisabled = !brief.category;
  const productDisabled = !brief.segment;
  const infoCardsDisabled = !brief.category;

  return (
    <div className="space-y-6">
      <Card className="border-[#E7E0D8] rounded-[16px]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#2D3748]">רקע / בריף</CardTitle>
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
                <SelectTrigger
                  id="f-category"
                  className={triggerCls("category")}
                >
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
                onValueChange={(v) => onChange({ segment: v })}
                disabled={segmentDisabled}
              >
                <SelectTrigger id="f-segment" className={triggerCls("segment")}>
                  <SelectValue
                    placeholder={
                      segmentDisabled ? "בחר קטגוריה קודם" : "בחר סגמנט"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-[16px]">
                      {s.nameHe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={LABEL} htmlFor="f-product">
                מוצר{" "}
                <span className="text-[13px] text-[#A0AEC0] font-normal">
                  (אופציונלי)
                </span>
              </label>
              <Select
                value={brief.product || undefined}
                onValueChange={(v) => onChange({ product: v })}
                disabled={productDisabled}
              >
                <SelectTrigger id="f-product" className={triggerCls("product")}>
                  <SelectValue
                    placeholder={
                      productDisabled
                        ? "בחר סגמנט קודם"
                        : "בחר מוצר — או השאר ריק לכל הסגמנט"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.nameHe}
                      className="text-[16px]"
                    >
                      {p.nameHe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={LABEL} htmlFor="f-arena">
                פורמט
              </label>
              <Select
                value={brief.salesArena || undefined}
                onValueChange={(v) =>
                  onChange({ salesArena: v as BriefSlice["salesArena"] })
                }
              >
                <SelectTrigger
                  id="f-arena"
                  className={triggerCls("salesArena")}
                >
                  <SelectValue placeholder="בחר פורמט" />
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
                className={inputCls("startDate")}
                dir="ltr"
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="f-end">
                תאריך סיום
              </label>
              <div
                id="f-end"
                className={READONLY_CLS}
                dir="ltr"
                aria-readonly="true"
                aria-label="תאריך סיום מחושב לפי משך המבצע"
              >
                {endDate || "—"}
              </div>
            </div>

            <div>
              <label className={LABEL} htmlFor="f-duration">
                משך מבצע
              </label>
              <Select
                value={String(brief.durationWeeks)}
                onValueChange={(v) => onChange({ durationWeeks: Number(v) })}
              >
                <SelectTrigger
                  id="f-duration"
                  className={triggerCls("durationWeeks")}
                >
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
              <label className={LABEL} htmlFor="f-manager">
                מנהל קטגוריה
              </label>
              <div
                id="f-manager"
                className={READONLY_CLS}
                aria-readonly="true"
                aria-label="מנהל הקטגוריה מוגדר אוטומטית לפי הקטגוריה הנבחרת"
              >
                {brief.categoryManager || (
                  <span className="text-[#A0AEC0]">
                    ייבחר אוטומטית לפי הקטגוריה
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClickableInfoCard
          icon={Archive}
          title="ארכיון"
          description={
            infoCardsDisabled
              ? "בחר קטגוריה כדי לראות מבצעים דומים מהעבר"
              : "שלוף מבצעים דומים מהעבר, סקור ביצועים ו-YTD מול הרשת, וקבל נקודת פתיחה מהירה."
          }
          onClick={() => setArchiveOpen(true)}
          disabled={infoCardsDisabled}
        />
        <ClickableInfoCard
          icon={Database}
          title="נתונים / רקע"
          description={
            infoCardsDisabled
              ? "בחר קטגוריה כדי לראות KPI-ים ומבצעים לדוגמה"
              : "KPI-ים מובילים שמנהלי קטגוריה עוקבים אחריהם, עם מבצעים היסטוריים לדוגמה."
          }
          onClick={() => setDataOpen(true)}
          disabled={infoCardsDisabled}
        />
      </div>

      <ArchiveSheet
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        category={brief.category}
        product={brief.product}
      />
      <BackgroundDataSheet
        open={dataOpen}
        onOpenChange={setDataOpen}
        category={brief.category}
      />
    </div>
  );
}
