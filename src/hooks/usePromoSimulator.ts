// Promo Simulator — single hook boundary.
//
// Owns: URL search-param ↔ state codec, defaults (incl. pre-fill from
// top-selling category), derived metrics (memoized), narrative paragraphs
// (memoized), step-jump validation, and reset / restart actions.
//
// Public surface is the return type below. No step component should call
// calcMetrics or narrativeFor directly — everything is threaded from the
// hook through the route.
import { useCallback, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  createDefaultState,
  decodeState,
  encodeState,
  type SimulatorSearch,
  type SimulatorState,
} from '@/lib/promo-simulator/state'
import { calcMetrics, type PromoMetrics } from '@/lib/promo-simulator/calc'
import { narrativeFor } from '@/lib/promo-simulator/narrative'
import type { StepId } from '@/lib/promo-simulator/taxonomy'
import { getCategorySummaries } from '@/data/mock-categories'

export interface UsePromoSimulator {
  state: SimulatorState
  setState: (update: Partial<SimulatorState>) => void
  metrics: PromoMetrics
  narrative: string[]
  jumpToStep: (step: StepId) => void
  goBack: () => void
  goNext: () => void
  restart: () => void
  resetStep: () => void
  finish: () => void
}

/**
 * Pick the default category (highest-selling). Extracted so the hook stays
 * thin and the logic is deterministic and unit-testable via the data layer.
 */
function pickDefaultCategory(): string {
  const cats = getCategorySummaries()
  return cats.sort((a, b) => b.sales - a.sales)[0]?.name ?? ''
}

/**
 * Step-jump validation: forward jumps are allowed; the simulator treats
 * missing upstream data as "soft" — the user can jump ahead, and the
 * downstream UI (live KPI / narrative) will reflect whatever state exists.
 * Backward jumps are unconditionally allowed.
 */
export function canJumpToStep(state: SimulatorState, target: StepId): boolean {
  if (target < 1 || target > 9) return false
  if (target <= state.step) return true
  // forward jumps always permitted (soft warnings handled in the UI)
  return true
}

export function usePromoSimulator(search: SimulatorSearch): UsePromoSimulator {
  const navigate = useNavigate()

  const defaults = useMemo(
    () => createDefaultState({ defaultCategory: pickDefaultCategory() }),
    [],
  )

  const state = useMemo(() => decodeState(search, defaults), [search, defaults])

  const setState = useCallback(
    (update: Partial<SimulatorState>) => {
      const next = { ...state, ...update }
      const params = encodeState(next, defaults)
      navigate({
        to: '/category-manager/promo-simulator',
        search: params,
        replace: true,
      })
    },
    [state, defaults, navigate],
  )

  const metrics = useMemo(() => calcMetrics(state), [state])
  const narrative = useMemo(() => narrativeFor(state), [state])

  const jumpToStep = useCallback(
    (step: StepId) => {
      if (!canJumpToStep(state, step)) return
      setState({ step })
    },
    [state, setState],
  )

  const goBack = useCallback(() => {
    if (state.step > 1) setState({ step: (state.step - 1) as StepId })
  }, [state.step, setState])

  const goNext = useCallback(() => {
    if (state.step < 9) setState({ step: (state.step + 1) as StepId })
  }, [state.step, setState])

  const restart = useCallback(() => {
    navigate({
      to: '/category-manager/promo-simulator',
      search: {},
      replace: true,
    })
  }, [navigate])

  const resetStep = useCallback(() => {
    const fresh = createDefaultState({ defaultCategory: defaults.category })
    setState({ ...fresh, step: state.step })
  }, [state.step, defaults.category, setState])

  const finish = useCallback(() => {
    setState({ completed: true })
  }, [setState])

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
  }
}
