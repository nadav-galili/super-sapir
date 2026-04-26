// AI builder registry.
//
// Each builder receives a surface-specific input and produces an
// `AIBuildResult` — the cache key, the JSON payload the server sees,
// and the two prompts to forward verbatim. The engine doesn't need to
// know about domain concepts; all domain knowledge (what goes into the
// payload, which system prompt to attach, how the cache is namespaced)
// lives here.

import type { AIBuildResult } from "./types";
import {
  detectCategoryAnomalies,
  detectChainAnomalies,
  detectDepartmentAnomalies,
} from "./anomalies";
import type { BranchFullReport } from "@/data/hadera-real";
import {
  MONTHS_HE,
  REPORT_MONTH,
  REPORT_YEAR,
  WORKING_DAYS_PER_MONTH,
  DEPARTMENT_NAMES,
} from "@/data/constants";
import {
  getPeriodMultiplier,
  getPeriodTargetShare,
  type TimePeriod,
} from "@/components/dashboard/TimePeriodFilter";
import { formatCurrencyShort } from "@/lib/format";
import { allBranches } from "@/data/mock-branches";
import { getCategorySuppliers } from "@/data/mock-category-suppliers";
import { getCategorySummaries } from "@/data/mock-categories";
import { getTopSuppliers } from "@/data/mock-suppliers";
import { getSupplierPerformance } from "@/data/mock-supplier-performance";
import { getChainPromotions } from "@/data/mock-chain-promotions";

// ─── Shared system prompts ──────────────────────────────────────

const STORE_SYSTEM_PROMPT = `אתה יועץ אנליטיקה לרשת סופר ספיר. אתה מנתח דוחות ניהוליים של סניפים ומספק תובנות ממוקדות פעולה בעברית.

פורמט פלט: שורת JSON אחת לכל פריט (JSONL). כל שורה חייבת להיות אובייקט JSON תקין ושלם.
אין לעטוף באובייקט חיצוני. אין markdown. אין טקסט מלבד שורות ה-JSON.

פלט בדיוק 4 שורות, אחת לכל subject קבוע מהרשימה הבאה בלבד, בסדר זה בדיוק:
1. עמידה ביעדי מכירות
2. ניהול מלאי
3. עלויות כוח אדם
4. איכות ותפעול

פורמט כל שורה:
{"type":"insight","subject":"עמידה ביעדי מכירות","recommendation":"המלצה קונקרטית לפעולה","status":"red"}

ערכי status (רמזור):
- "red" — דחוף, דורש טיפול מיידי
- "yellow" — בינוני, דורש תשומת לב
- "green" — מצב טוב, להמשיך במסלול

כללים:
- פלט רק שורות JSON, ללא טקסט נוסף
- אובייקט JSON אחד בכל שורה
- כל הטקסט בעברית
- subject חייב להיות אחד מארבעת הערכים הקבועים בלבד, ללא שינוי ניסוח, בסדר המוגדר
- התמקד בפריטים קריטיים וממוקדי פעולה עבור מנהל הסניף
- ציין מספרים ספציפיים מהדוח
- המלצה = פעולה ספציפית עם מספרים ופרטים
- ודא שיש מגוון סטטוסים (לא הכל אדום או ירוק)

חובת ספציפיות (כלל קשיח):
- כל recommendation חייב לציין לפחות ישות אחת בשם מתוך הפיילוד: מחלקה (department), קטגוריה, ספק, או חודש ספציפי.
- אסור להשתמש בניסוחים גנריים כגון "נתח את מיקס המוצרים", "בחן את הסניף", "שפר את הביצועים", "הסתכל על הנתונים".
- אם אין ישות מתאימה לציטוט בנושא מסוים, ציטוט המספר/האחוז הספציפי מהפיילוד מספיק (למשל "תחלופת עובדים בשיעור 18%").

מה לצטט בכל subject:
- "עמידה ביעדי מכירות" → מחלקות מעל/מתחת ליעד מתוך deptsByShare ו-anomalies (שם המחלקה + אחוז העמידה ביעד או yoy).
- "ניהול מלאי" → מחלקות שבהן מתרכזים חוסרים (stockout) או פחת — שם המחלקה והאחוז הספציפי.
- "עלויות כוח אדם" → ברמת הסניף (אחוז תחלופה, פער איוש מתוך hr.staffing); אין צורך לציין מחלקה.
- "איכות ותפעול" → פריטי תאימות ספציפיים (redAlerts, customerComplaints, missingActivities, returns) עם המספרים הקונקרטיים.

שפה ונימה:
- השתמש בשפה מקצועית, מכבדת ועניינית
- אין להשתמש במילים פוגעניות, משפילות או שליליות כמו: מפגר, כושל, נכשל, גרוע, איום, עלוב
- במקום "מפגר ביעד" אמור "לא עומד ביעד" או "מתחת ליעד"
- במקום "כושל" אמור "דורש שיפור" או "מציג ביצועים נמוכים"
- שמור על טון בונה ומכוון לפתרון — לא ביקורתי או שיפוטי`;

const CATEGORY_SYSTEM_PROMPT = `אתה יועץ אנליטיקה למנהל קטגוריה ברשת סופר ספיר. אתה מנתח ביצועי ספקים, חריגות, ופוטנציאלים בקטגוריה ספציפית — ומספק תובנות ממוקדות פעולה בעברית.

פורמט פלט: שורת JSON אחת לכל פריט (JSONL). כל שורה חייבת להיות אובייקט JSON תקין ושלם.
אין לעטוף באובייקט חיצוני. אין markdown. אין טקסט מלבד שורות ה-JSON.

פלט בדיוק 3-4 שורות, כל שורה מייצגת נושא שונה לניתוח.

פורמט כל שורה:
{"type":"insight","subject":"נושא הניתוח","recommendation":"המלצה קונקרטית לפעולה","status":"red"}

ערכי status (רמזור):
- "red" — דחוף, דורש טיפול מיידי
- "yellow" — בינוני, דורש תשומת לב
- "green" — מצב טוב, להמשיך במסלול

כללים:
- פלט רק שורות JSON, ללא טקסט נוסף
- אובייקט JSON אחד בכל שורה
- כל הטקסט בעברית
- התמקד בניתוח ספקים: חריגות יעדים, שיעורי חוסרים, רווחיות, ומגמות
- ציין שמות ספקים ומספרים ספציפיים
- הצע פעולות קונקרטיות שמנהל קטגוריה יכול לנקוט
- נושא = תחום הניתוח (לדוגמה: עמידה ביעדים, חוסרים במלאי, רווחיות ספקים, מגמת מכירות)
- המלצה = פעולה ספציפית עם מספרים ופרטים
- ודא שיש מגוון סטטוסים (לא הכל אדום או ירוק)

שפה ונימה:
- השתמש בשפה מקצועית, מכבדת ועניינית
- אין להשתמש במילים פוגעניות, משפילות או שליליות כמו: מפגר, כושל, נכשל, גרוע, איום, עלוב
- במקום "מפגר ביעד" אמור "לא עומד ביעד" או "מתחת ליעד"
- במקום "כושל" אמור "דורש שיפור" או "מציג ביצועים נמוכים"
- במקום "ירידה דרמטית" אמור "ירידה משמעותית"
- שמור על טון בונה ומכוון לפתרון — לא ביקורתי או שיפוטי`;

const CHAIN_SYSTEM_PROMPT = `אתה יועץ אנליטיקה בכיר למנהל הסחר של רשת סופר ספיר. אתה מנתח את ביצועי הרשת כולה ומספק תובנות אסטרטגיות ממוקדות פעולה בעברית.
ההמלצות שלך צריכות להיות מבוססות על  ניתוחי פערים על בסיס מכר כספי , מכר כמותי , רווח גולמי , 
עלויות תפעוליות, כמות קונים וגודל הסלים.
המדרג הצגת הנתונים הוא כל הרשת- מחלקות-קטגוריות-ספקים
המיקוד המרכזי הוא פערים לפי עמידה ביעד, ובהשוואה בין ספקים או קטגוריות אל מול צמיחת הרשת.

פורמט פלט: שורת JSON אחת לכל פריט (JSONL). כל שורה חייבת להיות אובייקט JSON תקין ושלם.
אין לעטוף באובייקט חיצוני. אין markdown. אין טקסט מלבד שורות ה-JSON.

פלט בדיוק 5 שורות, אחת לכל subject קבוע מהרשימה הבאה בלבד:
1. רווח גולמי ספקים
2. מכירות ספקים
3. רווח גולמי קטגוריות
4. מכירות קטגוריות
5. אפקטיביות מבצעים

פורמט כל שורה:
{"type":"insight","subject":"רווח גולמי ספקים","recommendation":"המלצה קונקרטית לפעולה","status":"red","entity":{"type":"supplier","name":"שם ספק או קטגוריה","href":"/category-manager/suppliers/sup-01"}}

entity הוא אופציונלי אבל חובה כאשר ההמלצה מתייחסת לספק, קטגוריה או מבצע ספציפיים:
- לספק השתמש ב-type="supplier" וב-href המדויק שמופיע בפיילוד תחת supplier.href
- לקטגוריה השתמש ב-type="category" וב-href המדויק שמופיע בפיילוד תחת category.href
- למבצע השתמש ב-type="promotion" וב-href="/category-manager/promo-simulator"

ערכי status (רמזור):
- "red" — דחוף, דורש טיפול מיידי
- "yellow" — בינוני, דורש תשומת לב
- "green" — מצב טוב, להמשיך במסלול

כללים:

- פלט רק שורות JSON, ללא טקסט נוסף
- אובייקט JSON אחד בכל שורה
- כל הטקסט בעברית
- subject חייב להיות אחד מחמשת הערכים הקבועים בלבד, ללא שינוי ניסוח
- אל תתייחס לסניפים בודדים — מנהל הסחר מתעניין בקטגוריות, ספקים, מבצעים ומגמות ברמת הרשת
- התמקד ב: ביצועי קטגוריות, יחסי ספקים ותנאי סחר, אפקטיביות מבצעים, רווחיות גולמית, חוסרים וזמינות מדף
- ציין שמות קטגוריות, ספקים ומבצעים ספציפיים עם מספרים
- הצג פער מול יעד, פער מול ממוצע רשת או מחלקה, ופער מול צמיחת הרשת כאשר הנתון זמין
- הצע פעולות קונקרטיות שמנהל סחר צריך לנקוט (לשפר רווח גולמי באחוז שהוא הפער מהיעד, שינוי מיקס מבצעים, הרחבת קטגוריה, וכו׳)
- המלצה = פעולה ספציפית עם מספרים ופרטים
- ודא שיש מגוון סטטוסים (לא הכל אדום או ירוק)

שפה ונימה:

- השתמש בשפה מקצועית, מכבדת ועניינית
- אין צורך לתת המלצה לנהל מו״מ עם ספקים. מנהל הסחר יודע את זה.
- אין להשתמש במילים פוגעניות, משפילות או שליליות כמו: מפגר, כושל, נכשל, גרוע, איום, עלוב
- במקום "מפגר ביעד" אמור "לא עומד ביעד" או "מתחת ליעד"
- במקום "כושל" אמור "דורש שיפור" או "מציג ביצועים נמוכים"
- שמור על טון בונה ומכוון לפתרון — לא ביקורתי או שיפוטי`;

// ─── Store builder ──────────────────────────────────────────────

export interface StoreBuilderInput {
  branchId: string;
  report: BranchFullReport;
}

export function buildStoreInsight(
  input: StoreBuilderInput
): AIBuildResult<ReturnType<typeof buildStorePayload>> {
  const payload = buildStorePayload(input.report);
  const userPrompt = `נתח את הדוח הניהולי הבא של סניף ותן תדריך בוקר עם פריטים ממוקדי פעולה.\n\n${JSON.stringify(payload, null, 2)}`;
  return {
    cacheKey: `branch:${input.branchId}`,
    payload,
    systemPrompt: STORE_SYSTEM_PROMPT,
    userPrompt,
  };
}

function buildStorePayload(report: BranchFullReport) {
  const s = report.sales;
  const ops = report.operations;
  const hr = report.hr;
  const c = report.compliance;
  const WORKING_DAYS = WORKING_DAYS_PER_MONTH;

  const anomalies = detectDepartmentAnomalies(
    report.departments,
    s.total.yoyChange
  );

  const recentMonths = report.monthly
    .filter((m) => m.monthNum <= REPORT_MONTH)
    .slice(-3)
    .map((m) => ({
      month: m.month,
      yoyChange: m.yoyChange,
      sales: formatCurrencyShort(m.currentSales),
    }));

  const deptsByShare = [...report.departments]
    .sort((a, b) => b.sharePercent - a.sharePercent)
    .slice(0, 8)
    .map((d) => ({
      name: d.name,
      sales: formatCurrencyShort(d.currentMonth),
      yoy: d.yoyChangePercent,
      share: d.sharePercent,
    }));

  const sortedExpenses = [...report.expenses]
    .sort((a, b) => b.currentMonth - a.currentMonth)
    .slice(0, 7)
    .map((e) => {
      const yoyChange =
        e.monthlyAvg2024 > 0
          ? Math.round(
              ((e.currentMonth - e.monthlyAvg2024) / e.monthlyAvg2024) * 100
            )
          : 0;
      return {
        name: e.name,
        amount: formatCurrencyShort(e.currentMonth),
        pctRevenue: e.percentOfRevenue,
        yoyChange: `${yoyChange}%`,
      };
    });

  const totalWorkHours = hr.actual * WORKING_DAYS * 8;
  const productivityPerHour =
    totalWorkHours > 0 ? Math.round(s.total.current / totalWorkHours) : 0;

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
      eyedoScore: `${ops.qualityScore.current}/${ops.qualityScore.target} (${ops.qualityScore.current >= ops.qualityScore.target ? "עמד" : "לא עמד"})`,
      inventoryDays: `${ops.avgDaysOfInventory.current}/${ops.avgDaysOfInventory.target}`,
      meatWaste: `${ops.meatWaste}% (יעד: 5%)`,
      complaints: `${ops.customerComplaints.current}/${ops.customerComplaints.target} (${ops.customerComplaints.current <= ops.customerComplaints.target ? "עמד" : "לא עמד"})`,
    },
    hr: {
      salaryCost: `${hr.salaryCostPercent}% (יעד: ${hr.salaryTarget}%, ${hr.salaryCostPercent <= hr.salaryTarget ? "עמד" : "לא עמד"})`,
      staffing: `${hr.actual} בפועל מתוך ${hr.authorized} תקן`,
      turnover: `${hr.turnoverRate}%`,
      productivityPerHour: `₪${productivityPerHour}`,
    },
    compliance: {
      highInventory: `${c.highInventory.actual}/${c.highInventory.target} (${c.highInventory.met ? "עמד" : "לא עמד"})`,
      redAlerts: `${c.redAlerts.redSubscriptions}/${c.redAlerts.target} (${c.redAlerts.met ? "עמד" : "לא עמד"})`,
      missingActivities: `${c.missingActivities.actual}/${c.missingActivities.fixedTarget} (${c.missingActivities.met ? "עמד" : "לא עמד"})`,
      returns: `${c.returns.actual}/${c.returns.target} (${c.returns.met ? "עמד" : "לא עמד"})`,
    },
    anomalies: anomalies.map(
      (a) =>
        `${a.departmentName}: סטייה של ${Math.abs(a.deviation).toFixed(1)} נקודות אחוז ${a.deviation > 0 ? "מעל" : "מתחת"} לממוצע הסניף (${a.severity === "critical" ? "קריטי" : "אזהרה"})`
    ),
    recentTrend: recentMonths,
    departments: deptsByShare,
    expenses: sortedExpenses,
  };
}

// ─── Category builder ───────────────────────────────────────────

export interface CategoryBuilderInput {
  categoryId: string;
}

export function buildCategoryInsight(
  input: CategoryBuilderInput
): AIBuildResult<ReturnType<typeof buildCategoryPayload>> {
  const payload = buildCategoryPayload(input.categoryId);
  const userPrompt = `נתח את ביצועי הקטגוריה "${payload.category}" ברשת. התמקד בספקים — חריגות, פוטנציאל, ופעולות שמנהל הקטגוריה צריך לנקוט.\n\n${JSON.stringify(payload, null, 2)}`;
  return {
    cacheKey: `category:${input.categoryId}`,
    payload,
    systemPrompt: CATEGORY_SYSTEM_PROMPT,
    userPrompt,
  };
}

function buildCategoryPayload(categoryId: string) {
  const categoryName = DEPARTMENT_NAMES[categoryId] ?? categoryId;

  const branchData: {
    name: string;
    sales: number;
    target: number;
    yoy: number;
    stockout: number;
    margin: number;
  }[] = [];

  for (const branch of allBranches) {
    const dept = branch.departments.find((d) => d.id === categoryId);
    if (!dept) continue;
    branchData.push({
      name: branch.name,
      sales: dept.sales,
      target: dept.targetSales,
      yoy: dept.yoyChange,
      stockout: dept.stockoutRate,
      margin: dept.grossMarginPercent,
    });
  }

  const totalSales = branchData.reduce((s, b) => s + b.sales, 0);
  const totalTarget = branchData.reduce((s, b) => s + b.target, 0);
  const avgMargin =
    branchData.length > 0
      ? +(
          branchData.reduce((s, b) => s + b.margin, 0) / branchData.length
        ).toFixed(1)
      : 0;
  const avgStockout =
    branchData.length > 0
      ? +(
          branchData.reduce((s, b) => s + b.stockout, 0) / branchData.length
        ).toFixed(1)
      : 0;

  const suppliers = getCategorySuppliers(categoryId);
  const supplierSummary = suppliers.map((s) => ({
    name: s.name,
    sales: formatCurrencyShort(s.sales),
    targetAchievement:
      s.targetSales > 0
        ? `${((s.sales / s.targetSales) * 100).toFixed(1)}%`
        : "N/A",
    grossProfit: `${s.grossProfitPercent}%`,
    stockoutRate: `${s.stockoutRate}%`,
    productCount: s.productCount,
  }));

  const targetPct = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 100;

  const anomalies = detectCategoryAnomalies({
    totalSales,
    totalTarget,
    suppliers,
    branches: branchData,
  });

  return {
    category: categoryName,
    categoryId,
    summary: {
      totalSales: formatCurrencyShort(totalSales),
      totalTarget: formatCurrencyShort(totalTarget),
      targetAchievement: `${targetPct.toFixed(1)}%`,
      avgGrossMargin: `${avgMargin}%`,
      avgStockout: `${avgStockout}%`,
      branchCount: branchData.length,
      supplierCount: suppliers.length,
    },
    suppliers: supplierSummary,
    branchPerformance: branchData.map((b) => ({
      name: b.name,
      sales: formatCurrencyShort(b.sales),
      yoy: `${b.yoy > 0 ? "+" : ""}${b.yoy}%`,
      stockout: `${b.stockout}%`,
    })),
    anomalies,
  };
}

// ─── Chain builder ──────────────────────────────────────────────

export interface ChainBuilderInput {
  periodKey?: string;
  periodLabel?: string;
  multiplier?: number;
}

function getCurrentMonthToDatePeriod(): TimePeriod {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return {
    type: "range",
    fromDate: `${year}-${month}-01`,
    toDate: `${year}-${month}-${day}`,
  };
}

export function buildChainInsight({
  periodKey = "current-month-to-date-v2",
  periodLabel = "החודש הנוכחי עד היום",
  multiplier,
}: ChainBuilderInput = {}): AIBuildResult<
  ReturnType<typeof buildChainPayload>
> {
  const currentMonthToDatePeriod = getCurrentMonthToDatePeriod();
  const actualMultiplier =
    multiplier ?? getPeriodMultiplier(currentMonthToDatePeriod);
  const targetMultiplier = getPeriodTargetShare(currentMonthToDatePeriod);
  const payload = buildChainPayload({
    periodLabel,
    period: currentMonthToDatePeriod,
    actualMultiplier,
    targetMultiplier,
  });
  const userPrompt = `נתח את ביצועי רשת סופר ספיר כולה מנקודת המבט של מנהל הסחר. התמקד בקטגוריות, ספקים ומבצעים — סיכונים, הזדמנויות, ופעולות אסטרטגיות.\n\n${JSON.stringify(payload, null, 2)}`;
  return {
    cacheKey: `chain:trade-manager:${periodKey}`,
    payload,
    systemPrompt: CHAIN_SYSTEM_PROMPT,
    userPrompt,
  };
}

function buildChainPayload({
  periodLabel,
  period,
  actualMultiplier,
  targetMultiplier,
}: {
  periodLabel: string;
  period: TimePeriod;
  actualMultiplier: number;
  targetMultiplier: number;
}) {
  const branchCount = allBranches.length;
  const totalSales =
    allBranches.reduce((s, b) => s + b.metrics.totalSales, 0) *
    actualMultiplier;
  const totalTarget =
    allBranches.reduce((s, b) => {
      return s + b.departments.reduce((ds, d) => ds + d.targetSales, 0);
    }, 0) * targetMultiplier;
  const targetPct = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 100;
  const avgGrossMargin = +(
    allBranches.reduce((s, b) => {
      const deptSalesTotal = b.departments.reduce((ds, d) => ds + d.sales, 0);
      return (
        s +
        (deptSalesTotal > 0
          ? b.departments.reduce(
              (ds, d) => ds + d.grossMarginPercent * d.sales,
              0
            ) / deptSalesTotal
          : 0)
      );
    }, 0) / branchCount
  ).toFixed(1);
  const avgSupplyRate = +(
    allBranches.reduce((s, b) => s + b.metrics.supplyRate, 0) / branchCount
  ).toFixed(1);
  const avgQuality = +(
    allBranches.reduce((s, b) => s + b.metrics.qualityScore, 0) / branchCount
  ).toFixed(0);

  const categories = getCategorySummaries();
  const categorySummary = categories.slice(0, 10).map((c) => ({
    id: c.id,
    name: c.name,
    href: `/category-manager/${c.id}`,
    sales: formatCurrencyShort(c.sales * actualMultiplier),
    share: `${c.sharePercent}%`,
    yoyChange: `${c.yoyChange > 0 ? "+" : ""}${c.yoyChange}%`,
    grossMargin: `${c.grossMarginPercent}%`,
    stockoutRate: `${c.stockoutRate}%`,
    targetAchievement:
      c.targetSales > 0
        ? `${((c.sales / c.targetSales) * 100).toFixed(1)}%`
        : "N/A",
  }));

  const suppliers = getTopSuppliers();
  const supplierSummary = suppliers.slice(0, 12).map((s) => {
    const performance = getSupplierPerformance(s.id, period);
    return {
      id: s.id,
      name: s.name,
      href: `/category-manager/suppliers/${s.id}`,
      sales: formatCurrencyShort(
        performance?.totalSales ?? s.sales * actualMultiplier
      ),
      targetAchievement: performance
        ? `${performance.targetAchievement.toFixed(1)}%`
        : s.targetSales > 0
          ? `${((s.sales / s.targetSales) * 100).toFixed(1)}%`
          : "N/A",
      grossProfit: `${performance?.grossProfitPercent ?? s.grossProfitPercent}%`,
      grossProfitTarget: performance
        ? `${performance.grossProfitTargetPercent}%`
        : "N/A",
      grossProfitGap: performance ? `${performance.grossProfitGap}%` : "N/A",
      supplierGrowth:
        performance != null ? `${performance.supplierGrowthPercent}%` : "N/A",
      networkGrowth:
        performance != null ? `${performance.networkGrowthPercent}%` : "N/A",
      activeCategories: performance?.categoryMix.map((c) => ({
        id: c.categoryId,
        name: c.categoryName,
        href: `/category-manager/${c.categoryId}`,
        sales: formatCurrencyShort(c.sales),
        targetAchievement: `${c.targetAchievement.toFixed(1)}%`,
        grossProfit: `${c.grossProfitPercent}%`,
        grossProfitTarget: `${c.grossProfitTargetPercent}%`,
        products: c.productExamples,
      })),
    };
  });

  const promotions = getChainPromotions();
  const promoSummary = promotions.map((p) => ({
    name: p.name,
    type: p.promoType,
    sales: formatCurrencyShort(p.sales * actualMultiplier),
    uplift: `${p.upliftPercent}%`,
    roi: p.roi.toFixed(1),
    daysRemaining: p.daysRemaining,
  }));

  const anomalies = detectChainAnomalies({
    totalSales,
    totalTarget,
    categories,
    suppliers,
    promotions,
  });

  return {
    period: periodLabel,
    chainSummary: {
      branchCount,
      totalSales: formatCurrencyShort(totalSales),
      totalTarget: formatCurrencyShort(totalTarget),
      targetAchievement: `${targetPct.toFixed(1)}%`,
      avgGrossMargin: `${avgGrossMargin}%`,
      avgSupplyRate: `${avgSupplyRate}%`,
      avgQualityScore: avgQuality,
    },
    categories: categorySummary,
    suppliers: supplierSummary,
    promotions: promoSummary,
    anomalies,
  };
}
