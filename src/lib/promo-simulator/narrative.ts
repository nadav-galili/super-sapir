// Promo Simulator — pure narrative templating module.
// Generates consultative AI-style Hebrew commentary from state + step.
// No React, no DOM, no external calls. Client-side templated strings only.
import { calcMetrics } from "./calc";
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

function paramsNarrative(state: SimulatorState): string[] {
  const m = calcMetrics(state);
  const paragraphs: string[] = [];

  if (m.verdict === "worthIt") {
    paragraphs.push(
      `הפרמטרים מצביעים על מבצע כדאי: רווח תוספתי של ${formatCurrency(m.netProfit)} ושיעור רווח גולמי במבצע ${m.promoGrossMargin.toFixed(1)}%.`
    );
  } else if (m.verdict === "notWorthIt") {
    if (m.promoGrossMargin < 0) {
      paragraphs.push(
        `הנחה של ${state.discountPct}% מורידה את המחיר אל מתחת לעלות — שיעור רווח גולמי שלילי. הפחת את ההנחה או בחן את עלות המוצר.`
      );
    } else {
      paragraphs.push(
        `הרווח התוספתי הנטו שלילי (${formatCurrency(m.netProfit)}). עלות השיווק (${formatCurrency(state.mktCost)}) או הקניבליזציה (${state.cannibPct}%) שוחקות את התרומה.`
      );
    }
  } else {
    paragraphs.push(
      `כדאיות גבולית: רווח של ${formatCurrency(m.netProfit)} ב-uplift של ${state.upliftPct}%. בדוק מה קורה לתרחיש שמרני יותר לפני אישור.`
    );
  }

  if (state.cannibPct > 25) {
    paragraphs.push(
      `קניבליזציה של ${state.cannibPct}% גבוהה — חלק ניכר מהמכירות במבצע באות במקום מכירות שהיו ממילא. שקול להפחית את ההערכה.`
    );
  }

  return paragraphs;
}

function scenariosNarrative(state: SimulatorState): string[] {
  const m = calcMetrics(state);
  const paragraphs: string[] = [];

  paragraphs.push(
    `התרחיש שנבחר הוא ${state.selectedScenario === "pessimistic" ? "שמרני" : state.selectedScenario === "optimistic" ? "אופטימי" : "בסיס"}. ${
      m.netProfit >= 0
        ? `הרווח התוספתי הצפוי בתרחיש זה: ${formatCurrency(m.netProfit)}.`
        : `התרחיש מציג הפסד תוספתי של ${formatCurrency(Math.abs(m.netProfit))} — שקול לבחון פרמטרים שמרניים יותר לפני אישור.`
    }`
  );

  if (Number.isFinite(m.breakEvenUnits)) {
    paragraphs.push(
      `נקודת האיזון תושג לאחר מכירת ${formatNumber(m.breakEvenUnits)} יחידות נוספות במחיר המבצע.`
    );
  } else {
    paragraphs.push(
      "המרווח האפקטיבי ליחידה לאחר עלות תפעול אינו חיובי — לא ניתן להגיע לאיזון בכל uplift. הפחת את ההנחה או הוזל את עלות התפעול."
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
      return paramsNarrative(state);
    case 5:
      return scenariosNarrative(state);
    default:
      return [];
  }
}
