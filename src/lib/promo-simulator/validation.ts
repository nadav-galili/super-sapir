// Promo Simulator — per-step required-field validation.
//
// Validates the fields owned by each step. Returns the ordered list of
// missing fields (Hebrew labels + the state key they map to) so the UI can
// (a) disable the "המשך" button, (b) render a missing-fields helper line,
// and (c) reveal rose borders on the exact fields the user needs to fill.
//
// Steps 6–9 are skippable by product decision — they never return missing
// fields. Steps 1–5 enforce required fields.
import type { SimulatorState } from "./state";
import type { StepId } from "./taxonomy";

export interface MissingField {
  /** The SimulatorState key — used by the UI to target the field visually. */
  key: keyof SimulatorState;
  /** Short Hebrew label shown in the missing-fields helper line. */
  label: string;
}

function isBlank(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  return false;
}

function isNonPositive(v: unknown): boolean {
  return typeof v !== "number" || !Number.isFinite(v) || v <= 0;
}

export function missingFieldsForStep(
  step: StepId,
  state: SimulatorState
): MissingField[] {
  const missing: MissingField[] = [];

  if (step === 1) {
    if (isBlank(state.category))
      missing.push({ key: "category", label: "קטגוריה" });
    if (isBlank(state.segment))
      missing.push({ key: "segment", label: "סגמנט" });
    if (isBlank(state.product)) missing.push({ key: "product", label: "מוצר" });
    if (isBlank(state.salesArena))
      missing.push({ key: "salesArena", label: "זירה" });
    if (isBlank(state.startDate))
      missing.push({ key: "startDate", label: "תאריך התחלה" });
    if (isNonPositive(state.durationWeeks))
      missing.push({ key: "durationWeeks", label: "משך מבצע" });
    if (isBlank(state.salesOwner))
      missing.push({ key: "salesOwner", label: "אחראי מכירות" });
    return missing;
  }

  if (step === 2) {
    if (isBlank(state.goal)) missing.push({ key: "goal", label: "מטרה" });
    return missing;
  }

  if (step === 3) {
    if (isBlank(state.promoType))
      missing.push({ key: "promoType", label: "סוג מבצע" });
    return missing;
  }

  if (step === 4) {
    if (isBlank(state.conditionText))
      missing.push({ key: "conditionText", label: "תנאי" });
    if (isBlank(state.benefitText))
      missing.push({ key: "benefitText", label: "הטבה" });
    if (isNonPositive(state.unitPrice))
      missing.push({ key: "unitPrice", label: "מחיר ליחידה" });
    if (isNonPositive(state.unitCost))
      missing.push({ key: "unitCost", label: "עלות ליחידה" });
    if (isNonPositive(state.discountPct))
      missing.push({ key: "discountPct", label: "אחוז הנחה" });
    return missing;
  }

  if (step === 5) {
    if (isNonPositive(state.baseUnits))
      missing.push({ key: "baseUnits", label: "בסיס יחידות" });
    if (isNonPositive(state.upliftPct))
      missing.push({ key: "upliftPct", label: "אחוז uplift" });
    if (isNonPositive(state.stockUnits))
      missing.push({ key: "stockUnits", label: "מלאי יחידות" });
    return missing;
  }

  // Steps 6–9: skippable by decision.
  return [];
}

export function isStepValid(step: StepId, state: SimulatorState): boolean {
  return missingFieldsForStep(step, state).length === 0;
}

/**
 * Returns the earliest step (1..9) that is still missing required fields,
 * or null if every step is valid. Used by the Stepper to block forward
 * jumps past incomplete steps.
 */
export function earliestIncompleteStep(state: SimulatorState): StepId | null {
  for (const s of [1, 2, 3, 4, 5] as const) {
    if (!isStepValid(s, state)) return s;
  }
  return null;
}
