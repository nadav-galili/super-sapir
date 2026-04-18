// Promo Simulator — taxonomy context.
//
// The simulator taxonomy (goals, promo types, segments, sales arenas, duration
// options, step metadata) used to be imported directly by 4+ files. That made
// it unclear which step components depended on which slice of the taxonomy.
//
// This context exposes the taxonomy as a single provided value at the route
// root, so step components consume what they need via `usePromoTaxonomy()`.
// The taxonomy is still static data; the context simply makes the dependency
// relationship explicit and single-sourced.
import { createContext, useContext } from 'react'
import {
  DURATION_WEEKS_OPTIONS,
  GOALS,
  GOAL_DESCRIPTIONS,
  promoDetails,
  purposeMap,
  SALES_ARENAS,
  SEGMENTS,
  STEPS,
  type Goal,
  type PromoDetails,
  type PromoTypeInfo,
  type SalesArena,
  type Segment,
} from '@/lib/promo-simulator/taxonomy'

export interface PromoTaxonomy {
  goals: Goal[]
  goalDescriptions: Record<Goal, string>
  purposeMap: Record<Goal, PromoTypeInfo[]>
  promoDetails: Record<string, PromoDetails>
  salesArenas: readonly SalesArena[]
  segments: readonly Segment[]
  durationWeeksOptions: typeof DURATION_WEEKS_OPTIONS
  steps: typeof STEPS
}

export const DEFAULT_PROMO_TAXONOMY: PromoTaxonomy = {
  goals: GOALS,
  goalDescriptions: GOAL_DESCRIPTIONS,
  purposeMap,
  promoDetails,
  salesArenas: SALES_ARENAS,
  segments: SEGMENTS,
  durationWeeksOptions: DURATION_WEEKS_OPTIONS,
  steps: STEPS,
}

const PromoTaxonomyContext = createContext<PromoTaxonomy>(DEFAULT_PROMO_TAXONOMY)

export const PromoTaxonomyProvider = PromoTaxonomyContext.Provider

export function usePromoTaxonomy(): PromoTaxonomy {
  return useContext(PromoTaxonomyContext)
}
