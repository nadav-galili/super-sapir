// Promo Simulator — single hook boundary.
//
// Owns: URL search-param ↔ state codec, defaults (incl. pre-fill from
// top-selling category), derived metrics (memoized), narrative paragraphs
// (memoized), step-jump validation, and reset / restart actions.
//
// Public surface is the return type below. No step component should call
// calcMetrics or narrativeFor directly — everything is threaded from the
// hook through the route.
import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  createDefaultState,
  decodeState,
  encodeState,
  type SimulatorSearch,
  type SimulatorState,
} from "@/lib/promo-simulator/state";
import { calcMetrics, type PromoMetrics } from "@/lib/promo-simulator/calc";
import { narrativeFor } from "@/lib/promo-simulator/narrative";
import type { StepId } from "@/lib/promo-simulator/taxonomy";
import { getCategorySummaries } from "@/data/mock-categories";
import {
  earliestIncompleteStep,
  isStepValid,
  missingFieldsForStep,
  type MissingField,
} from "@/lib/promo-simulator/validation";

export interface UsePromoSimulator {
  state: SimulatorState;
  setState: (update: Partial<SimulatorState>) => void;
  metrics: PromoMetrics;
  narrative: string[];
  jumpToStep: (step: StepId) => void;
  goBack: () => void;
  goNext: () => void;
  restart: () => void;
  resetStep: () => void;
  finish: () => void;
  /** Fields missing in the current step (empty array if step is valid). */
  missingFields: MissingField[];
  /** True when the current step has all required fields. */
  currentStepValid: boolean;
}

/**
 * Pick the default category (highest-selling). Extracted so the hook stays
 * thin and the logic is deterministic and unit-testable via the data layer.
 */
function pickDefaultCategory(): string {
  const cats = getCategorySummaries();
  return cats.sort((a, b) => b.sales - a.sales)[0]?.name ?? "";
}

/**
 * Step-jump validation.
 *
 * - Backward jumps are always allowed (users can revisit earlier steps).
 * - Forward jumps past the earliest incomplete step are blocked — this
 *   enforces the product rule "don't advance until the current screen's
 *   required properties are filled" at the Stepper level too, not just on
 *   the 'המשך' button.
 * - Jumps to the current step (or any completed step) are allowed.
 */
export function canJumpToStep(state: SimulatorState, target: StepId): boolean {
  if (target < 1 || target > 9) return false;
  if (target <= state.step) return true;
  const earliestGap = earliestIncompleteStep(state);
  if (earliestGap == null) return true;
  return target <= earliestGap;
}

export function usePromoSimulator(search: SimulatorSearch): UsePromoSimulator {
  const routePath = "/category-manager/promo-simulator" as const;
  const navigate = useNavigate();

  const defaults = useMemo(
    () => createDefaultState({ defaultCategory: pickDefaultCategory() }),
    []
  );

  const state = useMemo(
    () => decodeState(search, defaults),
    [search, defaults]
  );

  const setState = useCallback(
    (update: Partial<SimulatorState>) => {
      // Cascading reset: changing a parent selection clears its descendants
      // so the simulator never carries an orphaned segment/product that no
      // longer belongs under the new parent.
      const cascaded: Partial<SimulatorState> = { ...update };
      if ("category" in update && update.category !== state.category) {
        cascaded.segment = "";
        cascaded.product = "";
      }
      if ("segment" in update && update.segment !== state.segment) {
        cascaded.product = "";
      }
      const next = { ...state, ...cascaded };
      const params = encodeState(next, defaults);
      navigate({
        to: routePath,
        search: params,
        replace: true,
      });
    },
    [state, defaults, navigate, routePath]
  );

  const metrics = useMemo(() => calcMetrics(state), [state]);
  const narrative = useMemo(() => narrativeFor(state), [state]);

  const missingFields = useMemo(
    () => missingFieldsForStep(state.step, state),
    [state]
  );
  const currentStepValid = missingFields.length === 0;

  const jumpToStep = useCallback(
    (step: StepId) => {
      if (!canJumpToStep(state, step)) return;
      setState({ step });
    },
    [state, setState]
  );

  const goBack = useCallback(() => {
    if (state.step > 1) setState({ step: (state.step - 1) as StepId });
  }, [state.step, setState]);

  const goNext = useCallback(() => {
    if (state.step >= 9) return;
    if (!isStepValid(state.step, state)) return;
    setState({ step: (state.step + 1) as StepId });
  }, [state, setState]);

  const restart = useCallback(() => {
    navigate({
      to: routePath,
      search: {},
      replace: true,
    });
  }, [navigate, routePath]);

  const resetStep = useCallback(() => {
    const fresh = createDefaultState({ defaultCategory: defaults.category });
    setState({ ...fresh, step: state.step });
  }, [state.step, defaults.category, setState]);

  const finish = useCallback(() => {
    setState({ completed: true });
  }, [setState]);

  return {
    state,
    setState,
    metrics,
    narrative,
    jumpToStep,
    goBack,
    goNext,
    restart,
    resetStep,
    finish,
    missingFields,
    currentStepValid,
  };
}
