import { useEffect, useMemo, useState } from "react";
import { Archive, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROMO_GROUPS,
  GROUP_MANAGERS,
  getDepartmentsByGroup,
  getCategoriesByDepartment,
  getSubCategoriesByCategory,
  findSubCategoryById,
} from "@/data/mock-promo-taxonomy";
import { getSuppliersForSubCategory } from "@/data/mock-subcategory-suppliers";
import { getSeriesForSupplierAndSubCategory } from "@/data/mock-supplier-series";
import { getSuppliersByIds } from "@/data/mock-suppliers";
import { usePromoTaxonomy } from "@/contexts/PromoTaxonomyContext";
import { ArchiveSheet } from "./ArchiveSheet";
import { BackgroundDataSheet } from "./BackgroundDataSheet";
import type { BriefSlice, SliceSetter } from "@/lib/promo-simulator/state";

interface Step1BriefProps {
  brief: BriefSlice;
  onChange: SliceSetter<BriefSlice>;
  errorKeys?: ReadonlySet<keyof BriefSlice>;
}

const ERROR_RING =
  "border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]/25";

// Sentinel value for the "no series selected" option in the optional Series
// dropdown. Radix Select does not support empty-string values, so we map
// this sentinel to an empty `series` field on selection.
const SERIES_NONE = "__none__";

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
  const { salesArenas } = usePromoTaxonomy();

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);

  // Cascading lists driven by current selection.
  const departments = useMemo(
    () => getDepartmentsByGroup(brief.group),
    [brief.group]
  );
  const categories = useMemo(
    () => getCategoriesByDepartment(brief.group, brief.department),
    [brief.group, brief.department]
  );
  // The sub-category dropdown lists items grouped by Category (rendered
  // inline inside <SelectContent>). This memo backs the empty-state copy
  // shown when the chosen Department has no sub-categories defined.
  const subCategoriesFlat = useMemo(() => {
    if (!brief.department) return [];
    return categories.flatMap((c) => c.subCategories);
  }, [brief.department, categories]);
  // Reference the helper so future fine-grained scoping has it on hand.
  void getSubCategoriesByCategory;

  const suppliers = useMemo(() => {
    if (!brief.subcategory) return [];
    const ids = getSuppliersForSubCategory(brief.subcategory);
    return getSuppliersByIds(ids);
  }, [brief.subcategory]);

  const series = useMemo(() => {
    if (!brief.supplier || !brief.subcategory) return [];
    return getSeriesForSupplierAndSubCategory(
      brief.supplier,
      brief.subcategory
    );
  }, [brief.supplier, brief.subcategory]);

  // ── Cascading clears: changing a parent must invalidate children ──
  useEffect(() => {
    if (
      brief.department &&
      !departments.some((d) => d.id === brief.department)
    ) {
      onChange({ department: "", subcategory: "", supplier: "", series: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.group]);

  useEffect(() => {
    if (brief.subcategory) {
      const found = findSubCategoryById(brief.subcategory);
      if (
        !found ||
        found.group.id !== brief.group ||
        found.department.id !== brief.department
      ) {
        onChange({ subcategory: "", supplier: "", series: "" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.department]);

  useEffect(() => {
    if (brief.supplier) {
      const ids = getSuppliersForSubCategory(brief.subcategory);
      if (!ids.includes(brief.supplier)) {
        onChange({ supplier: "", series: "" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.subcategory]);

  useEffect(() => {
    if (brief.series && brief.supplier && brief.subcategory) {
      const validSeries = getSeriesForSupplierAndSubCategory(
        brief.supplier,
        brief.subcategory
      );
      if (!validSeries.includes(brief.series)) {
        onChange({ series: "" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.supplier]);

  // ── Manager + legacy mirror (per group) ──
  // Updates `categoryManager` from GROUP_MANAGERS, and mirrors group nameHe
  // into the legacy `category` field so downstream consumers (PromoSummary,
  // narrative, PDF export) continue to render meaningful values.
  // See: decisions/2026-05-02-promo-simulator-manager-label.md
  useEffect(() => {
    if (brief.group) {
      const manager = GROUP_MANAGERS[brief.group] ?? "";
      const groupName =
        PROMO_GROUPS.find((g) => g.id === brief.group)?.nameHe ?? "";
      const updates: Partial<BriefSlice> = {};
      if (manager !== brief.categoryManager) updates.categoryManager = manager;
      if (groupName !== brief.category) updates.category = groupName;
      if (Object.keys(updates).length) onChange(updates);
    } else if (brief.categoryManager || brief.category) {
      onChange({ categoryManager: "", category: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.group]);

  const endDate = computeEndDate(brief.startDate, brief.durationWeeks);

  const hasError = (k: keyof BriefSlice) => errorKeys?.has(k) ?? false;
  const triggerCls = (k: keyof BriefSlice) =>
    `text-[16px] ${hasError(k) ? ERROR_RING : ""}`;
  const inputErrCls = (k: keyof BriefSlice) => (hasError(k) ? ERROR_RING : "");

  const departmentDisabled = !brief.group;
  const subcategoryDisabled = !brief.department;
  const supplierDisabled = !brief.subcategory;
  const seriesDisabled = !brief.supplier || series.length === 0;

  // Archive opens once a sub-category is chosen — supplier optional for archive,
  // even though it is required to advance past Step 1.
  const archiveDisabled = !brief.subcategory;
  const backgroundDisabled = !brief.subcategory;

  const subCategoryName =
    findSubCategoryById(brief.subcategory)?.subCategory.nameHe ?? "";

  return (
    <div className="space-y-6">
      <Card className="border-[#E7E0D8] rounded-[16px]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#2D3748]">רקע / בריף</CardTitle>
          <p className="text-lg text-[#4A5568]">
            פרטי המבצע, הטקסונומיה, הספק וסדרת המוצרים
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="f-group" required>
                מחלקה
              </Label>
              <Select
                value={brief.group || undefined}
                onValueChange={(v) => onChange({ group: v })}
              >
                <SelectTrigger id="f-group" className={triggerCls("group")}>
                  <SelectValue placeholder="בחר מחלקה" />
                </SelectTrigger>
                <SelectContent>
                  {PROMO_GROUPS.map((g) => (
                    <SelectItem key={g.id} value={g.id} className="text-[16px]">
                      {g.nameHe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="f-department" required>
                קטגוריה
              </Label>
              <Select
                value={brief.department || undefined}
                onValueChange={(v) => onChange({ department: v })}
                disabled={departmentDisabled}
              >
                <SelectTrigger
                  id="f-department"
                  className={triggerCls("department")}
                >
                  <SelectValue
                    placeholder={
                      departmentDisabled ? "בחר מחלקה קודם" : "בחר קטגוריה"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-[16px]">
                      {d.nameHe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="f-subcategory" required>
                תת-קטגוריה
              </Label>
              <Select
                value={brief.subcategory || undefined}
                onValueChange={(v) => onChange({ subcategory: v })}
                disabled={subcategoryDisabled}
              >
                <SelectTrigger
                  id="f-subcategory"
                  className={triggerCls("subcategory")}
                >
                  <SelectValue
                    placeholder={
                      subcategoryDisabled
                        ? "בחר קטגוריה קודם"
                        : "בחר תת-קטגוריה"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <div className="px-2 py-1.5 text-[14px] font-semibold text-[#788390] uppercase tracking-wider">
                        {cat.nameHe}
                      </div>
                      {cat.subCategories.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={s.id}
                          className="text-[16px] ps-6"
                        >
                          {s.nameHe}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                  {subCategoriesFlat.length === 0 && brief.department ? (
                    <div className="px-2 py-1.5 text-[15px] text-[#788390]">
                      אין תת-קטגוריות מוגדרות
                    </div>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="f-supplier" required>
                ספק
              </Label>
              <Select
                value={brief.supplier || undefined}
                onValueChange={(v) => onChange({ supplier: v })}
                disabled={supplierDisabled}
              >
                <SelectTrigger
                  id="f-supplier"
                  className={triggerCls("supplier")}
                >
                  <SelectValue
                    placeholder={
                      supplierDisabled
                        ? "בחר תת-קטגוריה קודם"
                        : suppliers.length === 0
                          ? "אין ספקים מוגדרים"
                          : "בחר ספק"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-[16px]">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="f-series">
                סדרה{" "}
                <span className="text-[15px] text-[#788390] font-normal">
                  (אופציונלי)
                </span>
              </Label>
              <Select
                value={brief.series || SERIES_NONE}
                onValueChange={(v) =>
                  onChange({ series: v === SERIES_NONE ? "" : v })
                }
                disabled={seriesDisabled}
              >
                <SelectTrigger id="f-series" className={triggerCls("series")}>
                  <SelectValue
                    placeholder={
                      !brief.supplier
                        ? "בחר ספק קודם"
                        : series.length === 0
                          ? "אין סדרות מוגדרות"
                          : "בחר סדרה"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={SERIES_NONE}
                    className="text-[16px] text-[#788390]"
                  >
                    ללא סדרה
                  </SelectItem>
                  {series.map((s) => (
                    <SelectItem key={s} value={s} className="text-[16px]">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="f-arena" required>
                פורמט
              </Label>
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
              <Label htmlFor="f-start" required>
                תאריך התחלה
              </Label>
              <Input
                id="f-start"
                type="date"
                value={brief.startDate}
                onChange={(e) => onChange({ startDate: e.target.value })}
                className={inputErrCls("startDate")}
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="f-end" required>
                תאריך סיום
              </Label>
              <Input
                id="f-end"
                type="date"
                value={endDate}
                min={brief.startDate || undefined}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  if (!newEnd || !brief.startDate) return;
                  const start = new Date(brief.startDate);
                  const end = new Date(newEnd);
                  if (
                    Number.isNaN(start.getTime()) ||
                    Number.isNaN(end.getTime())
                  )
                    return;
                  const diffDays = Math.max(
                    0,
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  onChange({ durationWeeks: diffDays / 7 });
                }}
                className={inputErrCls("durationWeeks")}
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="f-manager">מנהל מחלקה</Label>
              <div
                id="f-manager"
                className="flex h-10 items-center"
                aria-label="מנהל המחלקה מוגדר אוטומטית לפי המחלקה הנבחרת"
              >
                {brief.categoryManager ? (
                  <Badge
                    variant="secondary"
                    className="text-[16px] font-semibold px-3 py-1.5 rounded-full"
                  >
                    {brief.categoryManager}
                  </Badge>
                ) : (
                  <span className="text-[16px] text-[#788390]">
                    ייבחר אוטומטית לפי המחלקה
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
            archiveDisabled
              ? "בחר תת-קטגוריה כדי לראות מבצעים דומים מהעבר"
              : `שלוף מבצעים דומים מהעבר${subCategoryName ? ` ב-${subCategoryName}` : ""}, סקור ביצועים, וקבל נקודת פתיחה מהירה.`
          }
          onClick={() => setArchiveOpen(true)}
          disabled={archiveDisabled}
        />
        <ClickableInfoCard
          icon={Database}
          title="נתונים / רקע"
          description={
            backgroundDisabled
              ? "בחר תת-קטגוריה כדי לראות KPI-ים ומבצעים לדוגמה"
              : "KPI-ים מובילים שמנהלי מחלקה עוקבים אחריהם, עם מבצעים היסטוריים לדוגמה."
          }
          onClick={() => setDataOpen(true)}
          disabled={backgroundDisabled}
        />
      </div>

      <ArchiveSheet
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        groupId={brief.group}
        subcategoryId={brief.subcategory}
        supplierId={brief.supplier}
        series={brief.series}
      />
      <BackgroundDataSheet
        open={dataOpen}
        onOpenChange={setDataOpen}
        subcategoryId={brief.subcategory}
        supplierId={brief.supplier}
        series={brief.series}
      />
    </div>
  );
}
