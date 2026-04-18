// Promo Simulator — pure data (taxonomy)
// Sourced from promo_simulator_premium.html reference.

export type Goal =
  | 'משיכת קונים'
  | 'הגדלת סל'
  | 'קניה חוזרת / נאמנות'
  | 'סטוק / מלאי'
  | 'אחר / חוצה קטגוריות'

export const GOALS: Goal[] = [
  'משיכת קונים',
  'הגדלת סל',
  'קניה חוזרת / נאמנות',
  'סטוק / מלאי',
  'אחר / חוצה קטגוריות',
]

export const GOAL_DESCRIPTIONS: Record<Goal, string> = {
  'משיכת קונים':
    'מבצעים שמייצרים טריגר כניסה לחנות — מחיר חד, קופון, מוצר עוגן. מתאים להגדלת תנועה וסלים חדשים.',
  'הגדלת סל':
    'מנגנונים שמחברים בין כמות לבין תמורה — מארזים, הטבה על סל, מצטברים. מגדילים ערך לעסקה קיימת.',
  'קניה חוזרת / נאמנות':
    'מועדון חברים, הטבות חוזרות, קופונים מותנים לרכישה הבאה. מגדילים תדירות ביקור ונאמנות.',
  'סטוק / מלאי':
    'פינוי מלאי איטי באמצעות הוזלה ישירה. חשוב לוודא כיסוי מלאי מספק וגידול ריאלי בצריכה.',
  'אחר / חוצה קטגוריות':
    'מבצעי צלב-קטגוריה, חבילות עונתיות, נושאי אירועים. שימושי לאירועי שיא ולשיתופי פעולה.',
}

export interface PromoTypeInfo {
  name: string
  stars: 1 | 2 | 3
  reason: string
  score: number
}

// Goal → ordered list of recommended promo types
export const purposeMap: Record<Goal, PromoTypeInfo[]> = {
  'משיכת קונים': [
    { name: 'מבצעי הוזלה', stars: 3, reason: 'מחיר חד יוצר טריגר כניסה ויוצר הרגשת הזדמנות.', score: 92 },
    { name: 'מוצר עוגן (Loss Leader)', stars: 3, reason: 'מחיר אגרסיבי על מוצר עוגן גורר סל נוסף.', score: 88 },
    { name: 'קופונים דיגיטליים', stars: 2, reason: 'כלי ממוקד לקהלים רלוונטיים עם הנעה ברורה.', score: 78 },
    { name: 'הטבת רישום / מועדון', stars: 2, reason: 'מייצר מאגר לקוחות ונתוני קמפיין עתידי.', score: 74 },
  ],
  'הגדלת סל': [
    { name: 'מארזים (Multi-Pack)', stars: 3, reason: 'מחבר כמות לתמורה — הדרך הישירה להעלות סל.', score: 90 },
    { name: 'הטבה לסל (בקניית X)', stars: 3, reason: 'מעודד הוספת מוצרים משלימים לעסקה.', score: 89 },
    { name: 'מצטברים / Loyalty Bundle', stars: 2, reason: 'מעודד צבירה ומעלה תדירות קניה.', score: 80 },
    { name: 'Cross-Sell ממוקד', stars: 2, reason: 'מעלה ערך עסקה דרך מוצר משלים.', score: 78 },
  ],
  'קניה חוזרת / נאמנות': [
    { name: 'קופון לרכישה הבאה', stars: 3, reason: 'מייצר ודאות לביקור חוזר בטווח הקרוב.', score: 91 },
    { name: 'מועדון / נקודות', stars: 3, reason: 'בונה נאמנות לטווח ארוך ומייצר דאטה.', score: 87 },
    { name: 'מארזי המשכיות', stars: 2, reason: 'מעודד צריכה שוטפת של אותה המותג.', score: 76 },
  ],
  'סטוק / מלאי': [
    { name: 'מבצעי הוזלה', stars: 3, reason: 'הדרך המהירה והישירה ביותר לפינוי מלאי.', score: 93 },
    { name: 'מארזים מהירים', stars: 2, reason: 'מעלה כמות ליחידת זמן ומפנה מלאי.', score: 81 },
    { name: 'Clearance / סוף עונה', stars: 2, reason: 'תחת באנר ברור של פינוי מלאי.', score: 79 },
  ],
  'אחר / חוצה קטגוריות': [
    { name: 'מבצע צלב-קטגוריה', stars: 3, reason: 'משלב שתי קטגוריות — אטרקציה לשתי מחלקות.', score: 85 },
    { name: 'חבילה עונתית', stars: 2, reason: 'נקשר לנושא מוכר — חגים, עונות, אירועים.', score: 78 },
    { name: 'Theme Event', stars: 2, reason: 'מבצע סביב נושא אחיד לאורך שבוע-שבועיים.', score: 73 },
  ],
}

export interface PromoDetails {
  conditionLabel: string
  conditionPlaceholder: string
  benefitLabel: string
  benefitPlaceholder: string
}

export const promoDetails: Record<string, PromoDetails> = {
  'מבצעי הוזלה': {
    conditionLabel: 'תנאי',
    conditionPlaceholder: 'למשל: ביחידה בודדת',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: 25% הנחה',
  },
  'מוצר עוגן (Loss Leader)': {
    conditionLabel: 'תנאי',
    conditionPlaceholder: 'למשל: ביחידה בודדת',
    benefitLabel: 'מחיר במבצע',
    benefitPlaceholder: 'למשל: ₪9.90',
  },
  'קופונים דיגיטליים': {
    conditionLabel: 'תנאי קופון',
    conditionPlaceholder: 'למשל: בקניית מוצר / סדרה',
    benefitLabel: 'ערך קופון',
    benefitPlaceholder: 'למשל: ₪10',
  },
  'הטבת רישום / מועדון': {
    conditionLabel: 'תנאי הצטרפות',
    conditionPlaceholder: 'למשל: בקנייה ראשונה',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: 15% הנחה',
  },
  'מארזים (Multi-Pack)': {
    conditionLabel: 'סוג מארז',
    conditionPlaceholder: 'למשל: רביעייה / שישייה',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: 4 במחיר 3',
  },
  'הטבה לסל (בקניית X)': {
    conditionLabel: 'התניה',
    conditionPlaceholder: 'למשל: בקניית 2 ומעלה',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: 20% הנחה על השני',
  },
  'מצטברים / Loyalty Bundle': {
    conditionLabel: 'התניה',
    conditionPlaceholder: 'למשל: ב-3 קניות רצופות',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: קופון לקנייה הבאה',
  },
  'Cross-Sell ממוקד': {
    conditionLabel: 'התניה',
    conditionPlaceholder: 'למשל: בקניית מוצר עוגן',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: 50% על המוצר המשלים',
  },
  'קופון לרכישה הבאה': {
    conditionLabel: 'התניה',
    conditionPlaceholder: 'למשל: בקנייה מעל ₪150',
    benefitLabel: 'ערך קופון',
    benefitPlaceholder: 'למשל: ₪20 לקנייה הבאה',
  },
  'מועדון / נקודות': {
    conditionLabel: 'התניה',
    conditionPlaceholder: 'למשל: לחברי מועדון',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: נקודות בשווי 10%',
  },
  'מארזי המשכיות': {
    conditionLabel: 'סוג מארז',
    conditionPlaceholder: 'למשל: שלישיית אותו מותג',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: השלישי במתנה',
  },
  'מארזים מהירים': {
    conditionLabel: 'סוג מארז',
    conditionPlaceholder: 'למשל: זוג / שלישייה',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: 2 ב-30₪',
  },
  'Clearance / סוף עונה': {
    conditionLabel: 'תנאי',
    conditionPlaceholder: 'למשל: על מלאי עונה יוצאת',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: 40% הנחה',
  },
  'מבצע צלב-קטגוריה': {
    conditionLabel: 'התניה',
    conditionPlaceholder: 'למשל: בקניית מוצר מקטגוריה X',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: 25% על מוצר מקטגוריה Y',
  },
  'חבילה עונתית': {
    conditionLabel: 'נושא החבילה',
    conditionPlaceholder: 'למשל: חבילת חגים',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: חיסכון של 20%',
  },
  'Theme Event': {
    conditionLabel: 'נושא האירוע',
    conditionPlaceholder: 'למשל: שבוע בריאות',
    benefitLabel: 'הטבה',
    benefitPlaceholder: 'למשל: מבצע רוחב 15%',
  },
}

// Hardcoded dropdown options
export const SALES_ARENAS = ['מאורגן', 'פרטי', 'On The Go'] as const
export type SalesArena = (typeof SALES_ARENAS)[number]

export const SEGMENTS = ['חלב', 'משקאות', 'ניגרת', 'גבינה'] as const
export type Segment = (typeof SEGMENTS)[number]

export const DURATION_WEEKS_OPTIONS = [
  { label: 'שבוע', value: 1 },
  { label: 'שבועיים', value: 2 },
  { label: '3 שבועות', value: 3 },
  { label: 'חודש', value: 4 },
] as const

// The 9 wizard steps (in order)
export const STEPS = [
  { id: 1, title: 'רקע / בריף' },
  { id: 2, title: 'בחירת מטרה' },
  { id: 3, title: 'סוג מבצע' },
  { id: 4, title: 'התניה והטבה' },
  { id: 5, title: 'יעדים / תחזית' },
  { id: 6, title: 'יישום בשטח' },
  { id: 7, title: 'בקרה' },
  { id: 8, title: 'ניתוח והערכה' },
  { id: 9, title: 'תיעוד' },
] as const

export type StepId = (typeof STEPS)[number]['id']
