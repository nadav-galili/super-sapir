// Promo Simulator — dedicated 4-level taxonomy (Group → Department → Category → Series).
//
// This taxonomy is INTENTIONALLY separate from the chain-wide
// `SEGMENTS_BY_DEPARTMENT` (`src/data/mock-taxonomy.ts`) and `DEPARTMENT_NAMES`
// (`src/data/constants.ts`). The simulator carries its own organization
// because the Category Manager's promotion-planning workflow reorganizes
// merchandise differently than the operational dashboards.
//
// See: decisions/2026-05-02-promo-simulator-taxonomy.md
//      decisions/2026-05-02-promo-simulator-manager-label.md

export interface PromoSubCategory {
  id: string;
  nameHe: string;
}

export interface PromoCategory {
  id: string;
  nameHe: string;
  subCategories: PromoSubCategory[];
}

export interface PromoDepartment {
  id: string;
  nameHe: string;
  categories: PromoCategory[];
}

export interface PromoGroup {
  id: string;
  nameHe: string;
  departments: PromoDepartment[];
}

// 5 Groups × Departments × Categories × Sub-categories.
// Sub-category IDs are stable kebab-case; nameHe drives display.
export const PROMO_GROUPS: PromoGroup[] = [
  {
    id: "grocery",
    nameHe: "מכולת",
    departments: [
      {
        id: "drinks",
        nameHe: "שתייה",
        categories: [
          {
            id: "hot-drinks",
            nameHe: "שתייה חמה",
            subCategories: [
              { id: "tea", nameHe: "תה" },
              { id: "coffee", nameHe: "קפה" },
              { id: "hot-chocolate", nameHe: "שוקו וקקאו" },
              { id: "herbal-infusions", nameHe: "חליטות צמחים" },
            ],
          },
          {
            id: "cold-drinks",
            nameHe: "שתייה קרה",
            subCategories: [
              { id: "carbonated", nameHe: "מוגזים" },
              { id: "juices", nameHe: "מיצים טבעיים" },
              { id: "iced-tea", nameHe: "תה קר ולימונדה" },
              { id: "soft-drinks", nameHe: "משקאות קלים" },
            ],
          },
          {
            id: "energy-sport",
            nameHe: "משקאות אנרגיה וספורט",
            subCategories: [
              { id: "energy", nameHe: "משקאות אנרגיה" },
              { id: "sport", nameHe: "משקאות ספורט" },
              { id: "isotonic", nameHe: "איזוטוניים" },
            ],
          },
          {
            id: "water",
            nameHe: "מים ומינרלים",
            subCategories: [
              { id: "still-water", nameHe: "מים מינרליים" },
              { id: "sparkling-water", nameHe: "מים בטעמים ומוגזים" },
              { id: "spring-bottles", nameHe: "מים בבקבוקים גדולים" },
            ],
          },
          {
            id: "alcohol",
            nameHe: "יין ואלכוהול",
            subCategories: [
              { id: "wine-red", nameHe: "יין אדום" },
              { id: "wine-white", nameHe: "יין לבן" },
              { id: "beer", nameHe: "בירה" },
              { id: "spirits", nameHe: "אלכוהול חריף" },
            ],
          },
        ],
      },
      {
        id: "cleaning",
        nameHe: "ניקיון",
        categories: [
          {
            id: "laundry",
            nameHe: "כביסה",
            subCategories: [
              { id: "detergent", nameHe: "אבקות וג'לים" },
              { id: "softener", nameHe: "מרככים" },
              { id: "stain-removers", nameHe: "מסירי כתמים" },
            ],
          },
          {
            id: "dishes",
            nameHe: "ניקוי כלים",
            subCategories: [
              { id: "dish-soap", nameHe: "סבון לכלים" },
              { id: "dishwasher", nameHe: "מדיח כלים" },
              { id: "scouring", nameHe: "ספוגים ויונים" },
            ],
          },
          {
            id: "general-cleaning",
            nameHe: "ניקוי כללי",
            subCategories: [
              { id: "floor", nameHe: "ניקוי רצפה" },
              { id: "surface", nameHe: "ניקוי משטחים" },
              { id: "glass", nameHe: "ניקוי זכוכית" },
              { id: "bleach", nameHe: "אקונומיקה וכלור" },
            ],
          },
          {
            id: "bath",
            nameHe: "מקלחת ואמבטיה",
            subCategories: [
              { id: "shower-cleaner", nameHe: "ניקוי מקלחת" },
              { id: "toilet-cleaner", nameHe: "ניקוי שירותים" },
              { id: "drain", nameHe: "פותחי סתימות" },
            ],
          },
          {
            id: "air-freshener",
            nameHe: "מטהרי אוויר וחיטוי",
            subCategories: [
              { id: "spray-freshener", nameHe: "ספריי מטהר אוויר" },
              { id: "plug-freshener", nameHe: "מטהרי תקע" },
              { id: "alcogel", nameHe: "אלכוג'ל וחיטוי ידיים" },
            ],
          },
        ],
      },
      {
        id: "canned",
        nameHe: "שימורים",
        categories: [
          {
            id: "canned-vegetables",
            nameHe: "שימורי ירקות",
            subCategories: [
              { id: "corn", nameHe: "תירס" },
              { id: "peas", nameHe: "אפונה" },
              { id: "pickled", nameHe: "מלפפונים חמוצים" },
              { id: "tomatoes-canned", nameHe: "עגבניות מרוסקות" },
            ],
          },
          {
            id: "canned-fish",
            nameHe: "שימורי דגים",
            subCategories: [
              { id: "tuna", nameHe: "טונה" },
              { id: "sardines", nameHe: "סרדינים" },
              { id: "anchovies", nameHe: "אנשובי וקיפר" },
            ],
          },
          {
            id: "canned-legumes",
            nameHe: "שימורי קטניות",
            subCategories: [
              { id: "chickpeas", nameHe: "חומוס" },
              { id: "beans", nameHe: "שעועית" },
              { id: "lentils-canned", nameHe: "עדשים בשימור" },
            ],
          },
          {
            id: "sauces-bases",
            nameHe: "רטבים ובסיסי מרק",
            subCategories: [
              { id: "tomato-sauce", nameHe: "רטבי עגבניות" },
              { id: "soy", nameHe: "סויה ואסיאתי" },
              { id: "soup-base", nameHe: "אבקות מרק" },
              { id: "ketchup-mayo", nameHe: "קטשופ ומיונז" },
            ],
          },
          {
            id: "olives-pickles",
            nameHe: "זיתים וכבושים",
            subCategories: [
              { id: "olives", nameHe: "זיתים" },
              { id: "pickled-veg", nameHe: "ירקות כבושים" },
              { id: "capers", nameHe: "קייפרס וצלפים" },
            ],
          },
        ],
      },
      {
        id: "staples",
        nameHe: "מוצרי יסוד",
        categories: [
          {
            id: "pasta-rice",
            nameHe: "פסטה ואורז",
            subCategories: [
              { id: "pasta", nameHe: "פסטה" },
              { id: "rice", nameHe: "אורז" },
              { id: "noodles", nameHe: "אטריות ופתיתים" },
              { id: "cous-cous", nameHe: "קוסקוס ובורגול" },
            ],
          },
          {
            id: "oils-vinegar",
            nameHe: "שמנים וחומץ",
            subCategories: [
              { id: "olive-oil", nameHe: "שמן זית" },
              { id: "canola", nameHe: "שמן קנולה וחמניות" },
              { id: "vinegar", nameHe: "חומץ" },
            ],
          },
          {
            id: "baking",
            nameHe: "קמחים וסוכר",
            subCategories: [
              { id: "flour", nameHe: "קמחים" },
              { id: "sugar", nameHe: "סוכר ותחליפים" },
              { id: "yeast-baking-aids", nameHe: "שמרים ועוזרי אפייה" },
              { id: "baking-chocolate", nameHe: "שוקולד ופירורים לאפייה" },
            ],
          },
          {
            id: "breakfast-spreads",
            nameHe: "דגני בוקר וממרחים",
            subCategories: [
              { id: "cereal", nameHe: "דגני בוקר" },
              { id: "chocolate-spread", nameHe: "ממרחי שוקולד" },
              { id: "honey-jam", nameHe: "דבש וריבות" },
              { id: "tahini-peanut", nameHe: "טחינה וחמאת בוטנים" },
            ],
          },
          {
            id: "eggs",
            nameHe: "ביצים",
            subCategories: [
              { id: "eggs-large", nameHe: "ביצים גדולות" },
              { id: "eggs-organic", nameHe: "ביצי חופש ואורגניות" },
              { id: "egg-substitutes", nameHe: "תחליפי ביצים" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "produce",
    nameHe: "ירקות",
    departments: [
      {
        id: "fruits",
        nameHe: "פירות",
        categories: [
          {
            id: "citrus",
            nameHe: "הדרים",
            subCategories: [
              { id: "oranges", nameHe: "תפוזים" },
              { id: "grapefruits", nameHe: "אשכוליות" },
              { id: "lemons", nameHe: "לימונים" },
              { id: "clementines", nameHe: "קלמנטינות ומנדרינות" },
            ],
          },
          {
            id: "seasonal-fruits",
            nameHe: "פירות עונה",
            subCategories: [
              { id: "grapes", nameHe: "ענבים" },
              { id: "stone-fruit", nameHe: "אפרסקים, נקטרינות, שזיפים" },
              { id: "avocado", nameHe: "אבוקדו" },
              { id: "mango", nameHe: "מנגו ופפאיה" },
            ],
          },
          {
            id: "apples-pears",
            nameHe: "תפוחים ואגסים",
            subCategories: [
              { id: "apples-red", nameHe: "תפוחים אדומים" },
              { id: "apples-green", nameHe: "תפוחים ירוקים" },
              { id: "pears", nameHe: "אגסים" },
            ],
          },
          {
            id: "dried-fruits",
            nameHe: "פירות יבשים",
            subCategories: [
              { id: "dates", nameHe: "תמרים" },
              { id: "raisins", nameHe: "צימוקים" },
              { id: "mixed-dried", nameHe: "תערובות פירות יבשים" },
              { id: "nuts", nameHe: "אגוזים ושקדים" },
            ],
          },
        ],
      },
      {
        id: "vegetables",
        nameHe: "ירקות",
        categories: [
          {
            id: "leafy",
            nameHe: "עליים",
            subCategories: [
              { id: "lettuce", nameHe: "חסה ועלי בייבי" },
              { id: "spinach", nameHe: "תרד וקייל" },
              { id: "parsley-cilantro", nameHe: "פטרוזיליה וכוסברה" },
              { id: "rucola", nameHe: "רוקט" },
            ],
          },
          {
            id: "root",
            nameHe: "שורש",
            subCategories: [
              { id: "potatoes", nameHe: "תפוחי אדמה" },
              { id: "carrots-onions", nameHe: "גזר ובצל" },
              { id: "beets-radish", nameHe: "סלק וצנון" },
              { id: "garlic-ginger", nameHe: "שום וג'ינג'ר" },
            ],
          },
          {
            id: "fruit-vegetables",
            nameHe: "פירות-ירקות",
            subCategories: [
              { id: "tomatoes-fresh", nameHe: "עגבניות" },
              { id: "cucumbers", nameHe: "מלפפונים" },
              { id: "peppers-eggplants", nameHe: "פלפלים וחצילים" },
              { id: "mushrooms-zucchini", nameHe: "פטריות וקישואים" },
            ],
          },
          {
            id: "organic-produce",
            nameHe: "ירקות אורגניים",
            subCategories: [
              { id: "organic-leafy", nameHe: "עליים אורגניים" },
              { id: "organic-root", nameHe: "שורש אורגני" },
              { id: "organic-mixed", nameHe: "מארזי ירקות אורגניים" },
            ],
          },
        ],
      },
      {
        id: "produce-packs",
        nameHe: "מארזים",
        categories: [
          {
            id: "fruit-packs",
            nameHe: "מארזי פירות",
            subCategories: [
              { id: "apples-pack", nameHe: "תפוחים בשקית" },
              { id: "grapes-tray", nameHe: "ענבים במגש" },
              { id: "berries-pack", nameHe: "פירות יער ארוזים" },
            ],
          },
          {
            id: "veg-packs",
            nameHe: "מארזי ירקות",
            subCategories: [
              { id: "cherry-tomatoes", nameHe: "עגבניות שרי" },
              { id: "salad-veg-pack", nameHe: "מארזי ירקות לסלט" },
              { id: "snack-veg", nameHe: "ירקות לנשנוש" },
            ],
          },
          {
            id: "leafy-packs",
            nameHe: "סלטים ועלים ארוזים",
            subCategories: [
              { id: "ready-salad", nameHe: "סלטי עלים ארוזים" },
              { id: "kale-pack", nameHe: "קייל ארוז" },
              { id: "herb-pack", nameHe: "עשבי תיבול ארוזים" },
            ],
          },
          {
            id: "cooking-packs",
            nameHe: "מארזי בישול",
            subCategories: [
              { id: "wok-mix", nameHe: "תערובת ירקות לוופ" },
              { id: "soup-mix", nameHe: "ירקות שורש למרק" },
              { id: "stir-fry", nameHe: "ירקות חתוכים לבישול מהיר" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "dairy",
    nameHe: "חלב",
    departments: [
      {
        id: "white-cheese",
        nameHe: "גבינות לבנות",
        categories: [
          {
            id: "cottage",
            nameHe: "קוטג'",
            subCategories: [
              { id: "cottage-classic", nameHe: "קוטג' רגיל" },
              { id: "cottage-light", nameHe: "קוטג' לייט" },
              { id: "cottage-flavored", nameHe: "קוטג' בטעמים" },
            ],
          },
          {
            id: "soft-spread-cheese",
            nameHe: "גבינות 5%-9%",
            subCategories: [
              { id: "spread-5", nameHe: "גבינה לבנה 5%" },
              { id: "spread-9", nameHe: "גבינה לבנה 9%" },
              { id: "ricotta", nameHe: "ריקוטה ומסקרפונה" },
            ],
          },
          {
            id: "feta-bulgarian",
            nameHe: "בולגריות ופטה",
            subCategories: [
              { id: "bulgarian", nameHe: "גבינה בולגרית" },
              { id: "feta", nameHe: "פטה" },
              { id: "labane", nameHe: "לבנה" },
            ],
          },
          {
            id: "halloumi-tsfat",
            nameHe: "חלומי וצפתית",
            subCategories: [
              { id: "halloumi", nameHe: "חלומי" },
              { id: "tsfat", nameHe: "צפתית" },
              { id: "akkawi", nameHe: "עכאווי" },
            ],
          },
        ],
      },
      {
        id: "yellow-cheese",
        nameHe: "גבינות צהובות",
        categories: [
          {
            id: "gouda-emmental",
            nameHe: "גאודה ואמנטל",
            subCategories: [
              { id: "gouda", nameHe: "גאודה" },
              { id: "emmental", nameHe: "אמנטל" },
              { id: "edam", nameHe: "אדם וצ'דר" },
            ],
          },
          {
            id: "mozzarella",
            nameHe: "מוצרלה",
            subCategories: [
              { id: "mozzarella-block", nameHe: "מוצרלה בלוק" },
              { id: "mozzarella-shredded", nameHe: "מוצרלה מגורדת" },
              { id: "mozzarella-fresh", nameHe: "מוצרלה טרייה (בורטה)" },
            ],
          },
          {
            id: "premium-cheese",
            nameHe: "פרמיום",
            subCategories: [
              { id: "brie-camembert", nameHe: "ברי וקממבר" },
              { id: "blue-cheese", nameHe: "רוקפור וגבינות כחולות" },
              { id: "parmesan", nameHe: "פרמזן" },
            ],
          },
          {
            id: "processed-cheese",
            nameHe: "מעובדות ופרוסות",
            subCategories: [
              { id: "sliced-cheese", nameHe: "גבינה צהובה פרוסה" },
              { id: "processed-spread", nameHe: "גבינה מעובדת למריחה" },
              { id: "cheese-snacks", nameHe: "מקלוני גבינה לילדים" },
            ],
          },
        ],
      },
      {
        id: "milk",
        nameHe: "חלב",
        categories: [
          {
            id: "fresh-milk",
            nameHe: "חלב טרי",
            subCategories: [
              { id: "milk-1", nameHe: "חלב 1%" },
              { id: "milk-3", nameHe: "חלב 3%" },
              { id: "milk-lactose-free", nameHe: "חלב ללא לקטוז" },
            ],
          },
          {
            id: "uht-milk",
            nameHe: "חלב עמיד",
            subCategories: [
              { id: "uht-3", nameHe: "חלב עמיד 3%" },
              { id: "uht-1", nameHe: "חלב עמיד 1%" },
              { id: "uht-skim", nameHe: "חלב עמיד דל שומן" },
            ],
          },
          {
            id: "flavored-fortified",
            nameHe: "חלב בטעמים ומועשר",
            subCategories: [
              { id: "chocolate-milk", nameHe: "שוקו" },
              { id: "vanilla-milk", nameHe: "חלב וניל" },
              { id: "fortified-milk", nameHe: "חלב מועשר" },
            ],
          },
          {
            id: "plant-milk",
            nameHe: "תחליפי חלב",
            subCategories: [
              { id: "soy-milk", nameHe: "סויה" },
              { id: "almond-milk", nameHe: "שקדים" },
              { id: "oat-milk", nameHe: "שיבולת שועל" },
              { id: "coconut-milk", nameHe: "קוקוס" },
            ],
          },
        ],
      },
      {
        id: "butter-cream",
        nameHe: "חמאה",
        categories: [
          {
            id: "butter",
            nameHe: "חמאה",
            subCategories: [
              { id: "butter-salted", nameHe: "חמאה מלוחה" },
              { id: "butter-unsalted", nameHe: "חמאה לא מלוחה" },
              { id: "butter-spread", nameHe: "חמאה למריחה" },
            ],
          },
          {
            id: "margarine",
            nameHe: "מרגרינה",
            subCategories: [
              { id: "margarine-block", nameHe: "מרגרינה בלוק" },
              { id: "margarine-spread", nameHe: "מרגרינה למריחה" },
              { id: "vegan-spread", nameHe: "ממרחים צמחיים" },
            ],
          },
          {
            id: "cooking-cream",
            nameHe: "שמנת לבישול",
            subCategories: [
              { id: "sweet-cream", nameHe: "שמנת מתוקה לקצפת" },
              { id: "sour-cream", nameHe: "שמנת חמוצה" },
              { id: "cooking-cream-32", nameHe: "שמנת לבישול 32%" },
            ],
          },
        ],
      },
      {
        id: "desserts",
        nameHe: "מעדנים",
        categories: [
          {
            id: "yogurt",
            nameHe: "יוגורטים",
            subCategories: [
              { id: "natural-yogurt", nameHe: "יוגורט טבעי" },
              { id: "fruit-yogurt", nameHe: "יוגורט בטעמים" },
              { id: "greek-yogurt", nameHe: "יוגורט יווני" },
              { id: "drinkable-yogurt", nameHe: "יוגורט שתייה" },
            ],
          },
          {
            id: "sweet-desserts",
            nameHe: "מעדנים מתוקים",
            subCategories: [
              { id: "milky", nameHe: "מילקי וקרמל" },
              { id: "pudding", nameHe: "פודינג" },
              { id: "danone-style", nameHe: "מעדני שוקולד" },
            ],
          },
          {
            id: "health-protein",
            nameHe: "בריאות וחלבון",
            subCategories: [
              { id: "protein-yogurt", nameHe: "יוגורט חלבון" },
              { id: "low-fat-desserts", nameHe: "מעדני לייט" },
              { id: "kefir", nameHe: "קפיר ופרוביוטיקה" },
            ],
          },
          {
            id: "kids-desserts",
            nameHe: "מעדנים לילדים",
            subCategories: [
              { id: "dani-style", nameHe: "דני ומעדני ילדים" },
              { id: "petit", nameHe: "פטיט" },
              { id: "yogurt-tubes", nameHe: "יוגורט בשפופרת" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "non-food",
    nameHe: "נון פוד",
    departments: [
      {
        id: "cookware",
        nameHe: "סירים",
        categories: [
          {
            id: "pots-pans",
            nameHe: "סירים ומחבתות",
            subCategories: [
              { id: "non-stick-pans", nameHe: "מחבתות נון-סטיק" },
              { id: "pots-stainless", nameHe: "סירים נירוסטה" },
              { id: "wok", nameHe: "וופ" },
              { id: "pressure-cooker", nameHe: "סיר לחץ" },
            ],
          },
          {
            id: "serving-ware",
            nameHe: "כלי הגשה",
            subCategories: [
              { id: "plates-bowls", nameHe: "צלחות וקעריות" },
              { id: "glasses-mugs", nameHe: "כוסות וספלים" },
              { id: "serving-trays", nameHe: "מגשי הגשה" },
            ],
          },
          {
            id: "bakeware",
            nameHe: "כלי בישול ואפייה",
            subCategories: [
              { id: "baking-trays", nameHe: "תבניות אפייה" },
              { id: "rolling-pins", nameHe: "מערוכים ומחצלות" },
              { id: "silicone-molds", nameHe: "תבניות סיליקון" },
            ],
          },
          {
            id: "kitchen-storage",
            nameHe: "אחסון מטבח",
            subCategories: [
              { id: "plastic-containers", nameHe: "קופסאות פלסטיק" },
              { id: "glass-jars", nameHe: "צנצנות זכוכית" },
              { id: "vacuum-bags", nameHe: "שקיות ואקום" },
            ],
          },
        ],
      },
      {
        id: "disposable",
        nameHe: "חד״פ",
        categories: [
          {
            id: "disposable-tableware",
            nameHe: "צלחות וכוסות",
            subCategories: [
              { id: "plastic-plates", nameHe: "צלחות פלסטיק" },
              { id: "plastic-cups", nameHe: "כוסות פלסטיק" },
              { id: "premium-disposable", nameHe: "כלים חד-פעמיים פרמיום" },
            ],
          },
          {
            id: "disposable-cutlery",
            nameHe: "סכו״ם",
            subCategories: [
              { id: "plastic-cutlery", nameHe: "סכו״ם פלסטיק" },
              { id: "wooden-cutlery", nameHe: "סכו״ם עץ ידידותי" },
              { id: "straws", nameHe: "קשיות" },
            ],
          },
          {
            id: "paper-products",
            nameHe: "מוצרי נייר",
            subCategories: [
              { id: "napkins", nameHe: "מפיות" },
              { id: "paper-towels", nameHe: "מגבות נייר" },
              { id: "toilet-paper", nameHe: "נייר טואלט" },
              { id: "tissues", nameHe: "ממחטות" },
            ],
          },
          {
            id: "bags-wrap",
            nameHe: "שקיות אשפה ואריזה",
            subCategories: [
              { id: "trash-bags", nameHe: "שקיות אשפה" },
              { id: "freezer-bags", nameHe: "שקיות הקפאה" },
              { id: "cling-foil", nameHe: "ניילון נצמד וכסף" },
            ],
          },
        ],
      },
      {
        id: "decor",
        nameHe: "נוי",
        categories: [
          {
            id: "candles-lighting",
            nameHe: "נרות ותאורה",
            subCategories: [
              { id: "scented-candles", nameHe: "נרות ריחניים" },
              { id: "shabbat-candles", nameHe: "נרות שבת ונשמה" },
              { id: "decorative-lights", nameHe: "תאורה דקורטיבית" },
            ],
          },
          {
            id: "flowers-plants",
            nameHe: "פרחים ועציצים",
            subCategories: [
              { id: "fresh-flowers", nameHe: "פרחים טריים" },
              { id: "potted-plants", nameHe: "עציצים" },
              { id: "artificial-flowers", nameHe: "פרחים מלאכותיים" },
            ],
          },
          {
            id: "table-accessories",
            nameHe: "אביזרי שולחן",
            subCategories: [
              { id: "tablecloths", nameHe: "מפות שולחן" },
              { id: "runners", nameHe: "ראנרים ומפיות בד" },
              { id: "centerpieces", nameHe: "מרכזי שולחן" },
            ],
          },
          {
            id: "seasonal-decor",
            nameHe: "עיטורים עונתיים",
            subCategories: [
              { id: "holiday-decor", nameHe: "עיצוב חגים" },
              { id: "balloons", nameHe: "בלונים ועיטורי ימי הולדת" },
              { id: "gift-wrap", nameHe: "ניירות עטיפה ואריזה" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "meat",
    nameHe: "בשר",
    departments: [
      {
        id: "poultry",
        nameHe: "עוף",
        categories: [
          {
            id: "whole-chicken-parts",
            nameHe: "עוף שלם וחלקי עוף",
            subCategories: [
              { id: "whole-chicken", nameHe: "עוף שלם" },
              { id: "chicken-breast", nameHe: "חזה עוף" },
              { id: "chicken-thighs", nameHe: "שוקיים וכרעיים" },
              { id: "chicken-wings", nameHe: "כנפיים ופרגיות" },
            ],
          },
          {
            id: "ground-chicken",
            nameHe: "עוף טחון",
            subCategories: [
              { id: "ground-breast", nameHe: "עוף טחון מחזה" },
              { id: "ground-thigh", nameHe: "עוף טחון משוק" },
              { id: "kebab-mix", nameHe: "תערובת לקבב" },
            ],
          },
          {
            id: "turkey",
            nameHe: "הודו",
            subCategories: [
              { id: "turkey-breast", nameHe: "חזה הודו" },
              { id: "turkey-ground", nameHe: "הודו טחון" },
              { id: "turkey-osso", nameHe: "אוסובוקו הודו" },
            ],
          },
          {
            id: "marinated-chicken",
            nameHe: "מתובל ומוכן",
            subCategories: [
              { id: "marinated-breast", nameHe: "חזה עוף מתובל" },
              { id: "schnitzel-ready", nameHe: "שניצל מוכן" },
              { id: "chicken-skewers", nameHe: "שיפודי עוף" },
            ],
          },
        ],
      },
      {
        id: "red-meat",
        nameHe: "בשר",
        categories: [
          {
            id: "beef",
            nameHe: "בקר",
            subCategories: [
              { id: "steaks", nameHe: "סטייקים (אנטרקוט, סינטה, פילה)" },
              { id: "roast-beef", nameHe: "צלי בקר וכתף" },
              { id: "ground-beef", nameHe: "בקר טחון" },
              { id: "short-ribs", nameHe: "אסאדו וצלעות" },
            ],
          },
          {
            id: "lamb",
            nameHe: "כבש",
            subCategories: [
              { id: "lamb-shoulder", nameHe: "כתף כבש" },
              { id: "lamb-ribs", nameHe: "צלעות כבש" },
              { id: "ground-lamb", nameHe: "כבש טחון" },
            ],
          },
          {
            id: "processed-meat",
            nameHe: "נקניקים ובשרים מעובדים",
            subCategories: [
              { id: "salami-pastrami", nameHe: "סלמי ופסטרמה" },
              { id: "hot-dogs", nameHe: "נקניקיות" },
              { id: "deli-cuts", nameHe: "פרוסות מעדנייה" },
            ],
          },
          {
            id: "marinated-beef",
            nameHe: "מתובל ומוכן",
            subCategories: [
              { id: "marinated-steak", nameHe: "סטייק מתובל" },
              { id: "kebab-skewers", nameHe: "שיפודי קבב" },
              { id: "burgers-ready", nameHe: "המבורגרים מוכנים" },
            ],
          },
        ],
      },
      {
        id: "fish",
        nameHe: "דגים",
        categories: [
          {
            id: "whole-fresh-fish",
            nameHe: "דגים טריים שלמים",
            subCategories: [
              { id: "denis", nameHe: "דניס" },
              { id: "musar", nameHe: "מוסר" },
              { id: "carp-amnon", nameHe: "קרפיון ואמנון" },
            ],
          },
          {
            id: "salmon-fillets",
            nameHe: "סלמון ופילטים",
            subCategories: [
              { id: "fresh-salmon", nameHe: "סלמון טרי" },
              { id: "white-fish-fillet", nameHe: "פילה דגים לבנים" },
              { id: "tuna-fresh", nameHe: "טונה טרייה" },
            ],
          },
          {
            id: "seafood",
            nameHe: "פירות ים",
            subCategories: [
              { id: "shrimp", nameHe: "שרימפס" },
              { id: "calamari", nameHe: "קלמארי" },
              { id: "mussels", nameHe: "מולים וצדפות" },
            ],
          },
          {
            id: "smoked-pickled-fish",
            nameHe: "דגים מעושנים וכבושים",
            subCategories: [
              { id: "smoked-salmon", nameHe: "סלמון מעושן" },
              { id: "herring", nameHe: "הרינג ומלוח" },
              { id: "smoked-trout", nameHe: "פורל מעושן" },
            ],
          },
        ],
      },
    ],
  },
];

// One Category Manager per Group (the "מנהל מחלקה" UI label).
// See: decisions/2026-05-02-promo-simulator-manager-label.md
export const GROUP_MANAGERS: Record<string, string> = {
  grocery: "דני אברמוביץ'",
  produce: "שירה כהן",
  dairy: "יונתן לוי",
  "non-food": "מאיה בן-דוד",
  meat: "אלי מזרחי",
};

// ── Lookup helpers ──────────────────────────────────────────────────────

export function getGroups(): PromoGroup[] {
  return PROMO_GROUPS;
}

export function getDepartmentsByGroup(groupId: string): PromoDepartment[] {
  return PROMO_GROUPS.find((g) => g.id === groupId)?.departments ?? [];
}

export function getCategoriesByDepartment(
  groupId: string,
  departmentId: string
): PromoCategory[] {
  return (
    getDepartmentsByGroup(groupId).find((d) => d.id === departmentId)
      ?.categories ?? []
  );
}

export function getSubCategoriesByCategory(
  groupId: string,
  departmentId: string,
  categoryId: string
): PromoSubCategory[] {
  return (
    getCategoriesByDepartment(groupId, departmentId).find(
      (c) => c.id === categoryId
    )?.subCategories ?? []
  );
}

export function findGroupById(groupId: string): PromoGroup | undefined {
  return PROMO_GROUPS.find((g) => g.id === groupId);
}

export function findSubCategoryById(
  subcategoryId: string
):
  | {
      group: PromoGroup;
      department: PromoDepartment;
      category: PromoCategory;
      subCategory: PromoSubCategory;
    }
  | undefined {
  for (const group of PROMO_GROUPS) {
    for (const department of group.departments) {
      for (const category of department.categories) {
        const subCategory = category.subCategories.find(
          (s) => s.id === subcategoryId
        );
        if (subCategory) return { group, department, category, subCategory };
      }
    }
  }
  return undefined;
}

export function getManagerForGroup(groupId: string): string {
  return GROUP_MANAGERS[groupId] ?? "";
}
