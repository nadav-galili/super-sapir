// Promo Simulator — per-step required-field validation.
//
// Validates the fields owned by each step. Returns the ordered list of
// missing fields (Hebrew labels + the state key they map to) so the UI can
// (a) disable the "המשך" button, (b) render a missing-fields helper line,
// and (c) reveal rose borders on the exact fields the user needs to fill.
//
// Steps 5–8 are skippable by product decision — they never return missing
// fields. Steps 1–4 enforce required fields.
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
    if (isBlank(state.group)) missing.push({ key: "group", label: "מחלקה" });
    if (isBlank(state.department))
      missing.push({ key: "department", label: "קטגוריה" });
    if (isBlank(state.subcategory))
      missing.push({ key: "subcategory", label: "תת-קטגוריה" });
    if (isBlank(state.supplier))
      missing.push({ key: "supplier", label: "ספק" });
    if (isBlank(state.salesArena))
      missing.push({ key: "salesArena", label: "פורמט" });
    if (isBlank(state.startDate))
      missing.push({ key: "startDate", label: "תאריך התחלה" });
    if (isNonPositive(state.durationWeeks))
      missing.push({ key: "durationWeeks", label: "משך מבצע" });
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
    if (isNonPositive(state.unitPrice))
      missing.push({ key: "unitPrice", label: "מחיר ליחידה" });
    if (isNonPositive(state.unitCost))
      missing.push({ key: "unitCost", label: "עלות ליחידה" });
    if (isNonPositive(state.discountPct))
      missing.push({ key: "discountPct", label: "אחוז הנחה" });
    if (isNonPositive(state.baseUnits))
      missing.push({ key: "baseUnits", label: "מכירות בסיס" });
    if (isNonPositive(state.upliftPct))
      missing.push({ key: "upliftPct", label: "uplift" });
    return missing;
  }

  // Steps 5–8: skippable by decision.
  return [];
}

export function isStepValid(step: StepId, state: SimulatorState): boolean {
  return missingFieldsForStep(step, state).length === 0;
}

/**
 * Returns the earliest step (1..8) that is still missing required fields,
 * or null if every step is valid. Used by the Stepper to block forward
 * jumps past incomplete steps.
 */
export function earliestIncompleteStep(state: SimulatorState): StepId | null {
  for (const s of [1, 2, 3, 4] as const) {
    if (!isStepValid(s, state)) return s;
  }
  return null;
}
