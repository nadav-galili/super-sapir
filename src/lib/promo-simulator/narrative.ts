// Promo Simulator — pure narrative templating module.
// Generates consultative AI-style Hebrew commentary from state + step.
// No React, no DOM, no external calls. Client-side templated strings only.
import { calcMetrics, statusLabel } from "./calc";
import type { SimulatorState } from "./state";
import type { Goal } from "./taxonomy";
import { formatCurrency, formatNumber } from "@/lib/format";

const GOAL_NARRATIVE: Record<Goal, string[]> = {
  "משיכת קונים": [
    "כדי למשוך קונים חדשים לחנות, מחיר חד על מוצר עוגן הוא הטריגר החזק ביותר. הקונה חייב להרגיש שיש כאן הזדמנות שאי אפשר לפספס.",
    "חשוב לוודא שהמבצע מוצב בזירה פיזית גלויה — קדמת החנות או במה מיוחדת — כדי למקסם את שיעור הקליטה.",
  ],
  "הגדלת סל": [
    "כדי להגדיל את הסל הממוצע, מנגנונים שמחברים בין כמות לבין תמורה (מארזים, הטבה לסל, מצטברים) הניבו היסטורית את התוצאות הטובות ביותר בקטגוריות מזון.",
    "ההטבה חייבת להרגיש פרופורציונית — אם התנאי דורש מאמץ מהלקוח, ההטבה צריכה להצדיק אותו.",
  ],
  "קניה חוזרת / נאמנות": [
    "מועדון חברים וקופונים מותנים לרכישה הבאה מעלים תדירות ביקור באופן משמעותי.",
    "מדד ההצלחה כאן איננו המכירה הבודדת — אלא שיעור החזרה של הלקוח תוך 30–60 ימים.",
  ],
  "סטוק / מלאי": [
    "מבצעי הוזלה הם הדרך הישירה ביותר לפינוי מלאי. חשוב לעקוב אחר כיסוי המלאי — אסור להבטיח הנחה ואז למצוא מדפים ריקים.",
    "מטרה שנייה: להפוך מלאי קפוא לתזרים פנוי. ככל שהתקופה קצרה יותר, ההנחה יכולה להיות אגרסיבית יותר.",
  ],
  "אחר / חוצה קטגוריות": [
    "מבצעים חוצי קטגוריות עובדים מצוין לאירועי שיא (חגים, עונות). המשותף שלהם הוא נושא ברור שהקונה מזהה מיד.",
    "שילוב שתי קטגוריות משלימות ברשימה אחת מעלה את שיעור הצירוף לסל ואת ערך העסקה.",
  ],
};

const PROMO_BY_GOAL_OVERRIDES: Record<string, string[]> = {
  "מבצעי הוזלה|סטוק / מלאי": [
    "מבצעי הוזלה הם הדרך הישירה ביותר לפינוי מלאי. עם זאת, חשוב לוודא שכיסוי המלאי שלך עומד על מעל 100% כדי למנוע אכזבת לקוחות.",
    "לפעמים הוזלה אגרסיבית של 20–30% בתקופה קצרה מייצרת אפקט הרבה יותר טוב מהוזלה מתונה לאורך זמן.",
  ],
  "מארזים (Multi-Pack)|הגדלת סל": [
    "מארזים הם הדרך הישירה ביותר להעלות סל ממוצע. התמחור צריך לשדר ערך ברור ליחידה — לקוחות משווים מיד.",
    "הקפידו להציב את המארז לצד היחידה הבודדת, כך ההפרש ברור ללקוח באותה שנייה.",
  ],
  "מוצר עוגן (Loss Leader)|משיכת קונים": [
    "מוצר עוגן במחיר אגרסיבי מייצר כניסות — אבל הרווחיות מגיעה מהסל הנלווה. חשוב לתכנן מה הלקוח ייקח בנוסף.",
    "ודאו שהמוצר העוגן ממוקם עמוק בחנות כדי להעביר את הלקוח ליד מוצרים משלימים בדרכו.",
  ],
};

function promoNarrative(state: SimulatorState): string[] {
  if (!state.promoType) {
    return [
      "בחירת סוג המבצע קובעת את כל השאר — מהי ההתניה, מהי ההטבה, איך הצרכן יבין אותו.",
    ];
  }
  const key = `${state.promoType}|${state.goal}`;
  const override = PROMO_BY_GOAL_OVERRIDES[key];
  if (override) return override;
  return [
    `בחרת ב"${state.promoType}" כסוג המבצע. זוהי בחירה טובה להשגת המטרה "${state.goal || "שלך"}".`,
    "בשלב הבא יש להגדיר את ההתניה וההטבה בצורה ברורה שהלקוח מבין באותו רגע של עמידה מול המדף.",
  ];
}

function termsNarrative(state: SimulatorState): string[] {
  const paragraphs: string[] = [];
  if (state.discountPct > 25) {
    paragraphs.push(
      `הנחה של ${state.discountPct}% היא משמעותית מאוד ועלולה לשחוק את שיעור הרווח הגולמי. ודא שהעלייה בנפח המכירה מצדיקה את שחיקת המרווח.`
    );
    paragraphs.push(
      "שקול האם הנחה של 15–20% עם הטבה נלווית (מוצר חינם, קופון חוזר) לא תניב תוצאה דומה בלי פגיעה ברווחיות."
    );
  } else if (state.discountPct < 10) {
    paragraphs.push(
      `הנחה של ${state.discountPct}% היא צנועה. אם המטרה היא "${state.goal || "משיכת קונים"}", כדאי לשקול הטבה חזקה יותר — מבצע קל מדי לא יחצה את רף ההבחנה של הקונה.`
    );
  } else {
    paragraphs.push(
      `הנחה של ${state.discountPct}% היא טווח סביר — נותנת ללקוח תחושת ערך בלי לשחוק מהותית את המרווח.`
    );
  }
  return paragraphs;
}

function forecastNarrative(state: SimulatorState): string[] {
  const m = calcMetrics(state);
  const paragraphs: string[] = [];

  if (m.status === "notWorthIt") {
    if (m.unitMargin <= 0) {
      paragraphs.push(
        "המרווח ליחידה לאחר ההנחה אינו חיובי — כל מכירה תוסיף הפסד. יש להפחית את ההנחה או לבחון מחדש את המחיר והעלות."
      );
    } else {
      paragraphs.push(
        `כיסוי המלאי (${m.stockCoverage}%) נמוך מדי — צפוי חוסר מלאי בעיצומו של המבצע, מה שיפגע במוניטין ובמטרה.`
      );
    }
  } else if (m.status === "needsImprovement") {
    paragraphs.push(
      `הסטטוס הנוכחי הוא "${statusLabel(m.status)}". ROI החזוי עומד על ${m.roi}%. ניתן לשפר על ידי חיזוק המרווח (פחות הנחה) או הגברת הגידול הריאלי.`
    );
  } else {
    paragraphs.push(
      `ROI החזוי ${m.roi}% מצביע על מבצע כדאי. נקודת האיזון תושג לאחר מכירת ${formatNumber(m.breakEvenUnits)} יחידות.`
    );
  }

  if (state.baseUnits > 0 && m.promoUnits > 0) {
    paragraphs.push(
      `פדיון צפוי ${formatCurrency(m.promoRevenue)} מול בסיס ${formatCurrency(m.baseRevenue)} — גידול של ${state.upliftPct}% ביחידות.`
    );
  }

  return paragraphs;
}

/**
 * Returns the narrative paragraphs for the given simulator state and step.
 * Returns an empty array if this step has no narrative.
 */
export function narrativeFor(state: SimulatorState): string[] {
  switch (state.step) {
    case 2:
      return state.goal
        ? GOAL_NARRATIVE[state.goal]
        : [
            "בחירת המטרה העסקית היא הצעד הראשון. כל בחירה תיפתח סוגי מבצעים שונים שמתאימים לה.",
          ];
    case 3:
      return promoNarrative(state);
    case 4:
      return termsNarrative(state);
    case 5:
      return forecastNarrative(state);
    default:
      return [];
  }
}
