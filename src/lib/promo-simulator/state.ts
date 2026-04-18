// Promo Simulator — state type, defaults, URL codec
import type { Goal, SalesArena, Segment, StepId } from './taxonomy'

export interface SimulatorState {
  step: StepId
  // Step 1 — brief
  category: string
  segment: Segment | ''
  product: string
  salesArena: SalesArena | ''
  retailer: string
  startDate: string // YYYY-MM-DD
  durationWeeks: number
  salesOwner: string
  // Step 2 — goal
  goal: Goal | ''
  // Step 3 — promo type
  promoType: string
  // Step 4 — terms & benefit
  conditionText: string
  benefitText: string
  discountPct: number
  // Step 5 — forecast
  baseUnits: number
  unitPrice: number
  unitCost: number
  upliftPct: number
  stockUnits: number
  // Step 6 — implementation
  signage: boolean
  shelf: boolean
  training: boolean
  cashierBrief: boolean
  // Step 7 — control
  controlPrice: boolean
  controlStock: boolean
  controlDisplay: boolean
  // Step 8 — analysis
  analysisNote: string
  // Step 9 — documentation
  documentation: string
  completed: boolean
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function defaultStartDate(): string {
  return addDays(todayISO(), 14)
}

export const RETAILER_DEFAULT = 'סופר ספיר'

export function createDefaultState(opts?: { defaultCategory?: string }): SimulatorState {
  return {
    step: 1,
    category: opts?.defaultCategory ?? '',
    segment: '',
    product: '',
    salesArena: '',
    retailer: RETAILER_DEFAULT,
    startDate: defaultStartDate(),
    durationWeeks: 2,
    salesOwner: '',
    goal: '',
    promoType: '',
    conditionText: '',
    benefitText: '',
    discountPct: 15,
    baseUnits: 1000,
    unitPrice: 12,
    unitCost: 7.5,
    upliftPct: 20,
    stockUnits: 1500,
    signage: false,
    shelf: false,
    training: false,
    cashierBrief: false,
    controlPrice: false,
    controlStock: false,
    controlDisplay: false,
    analysisNote: '',
    documentation: '',
    completed: false,
  }
}

/**
 * URL search param schema. Only non-default values are encoded into the URL.
 * Defaults are re-applied when decoding.
 */
export type SimulatorSearch = Partial<{
  step: number
  category: string
  segment: string
  product: string
  salesArena: string
  retailer: string
  startDate: string
  durationWeeks: number
  salesOwner: string
  goal: string
  promoType: string
  conditionText: string
  benefitText: string
  discountPct: number
  baseUnits: number
  unitPrice: number
  unitCost: number
  upliftPct: number
  stockUnits: number
  signage: 1
  shelf: 1
  training: 1
  cashierBrief: 1
  controlPrice: 1
  controlStock: 1
  controlDisplay: 1
  analysisNote: string
  documentation: string
  completed: 1
}>

function toNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function toStr(v: unknown, fallback: string): string {
  if (typeof v === 'string') return v
  return fallback
}

/**
 * Validates raw URL search input into a typed SimulatorSearch object.
 * Used as the `validateSearch` function for the TanStack Router route.
 */
export function validateSimulatorSearch(search: Record<string, unknown>): SimulatorSearch {
  const out: SimulatorSearch = {}
  if (search.step !== undefined) {
    const n = toNum(search.step, 1)
    out.step = Math.min(9, Math.max(1, Math.round(n))) as number
  }
  if (search.category !== undefined) out.category = toStr(search.category, '')
  if (search.segment !== undefined) out.segment = toStr(search.segment, '')
  if (search.product !== undefined) out.product = toStr(search.product, '')
  if (search.salesArena !== undefined) out.salesArena = toStr(search.salesArena, '')
  if (search.retailer !== undefined) out.retailer = toStr(search.retailer, '')
  if (search.startDate !== undefined) out.startDate = toStr(search.startDate, '')
  if (search.durationWeeks !== undefined) out.durationWeeks = toNum(search.durationWeeks, 2)
  if (search.salesOwner !== undefined) out.salesOwner = toStr(search.salesOwner, '')
  if (search.goal !== undefined) out.goal = toStr(search.goal, '')
  if (search.promoType !== undefined) out.promoType = toStr(search.promoType, '')
  if (search.conditionText !== undefined) out.conditionText = toStr(search.conditionText, '')
  if (search.benefitText !== undefined) out.benefitText = toStr(search.benefitText, '')
  if (search.discountPct !== undefined) out.discountPct = toNum(search.discountPct, 15)
  if (search.baseUnits !== undefined) out.baseUnits = toNum(search.baseUnits, 1000)
  if (search.unitPrice !== undefined) out.unitPrice = toNum(search.unitPrice, 12)
  if (search.unitCost !== undefined) out.unitCost = toNum(search.unitCost, 7.5)
  if (search.upliftPct !== undefined) out.upliftPct = toNum(search.upliftPct, 20)
  if (search.stockUnits !== undefined) out.stockUnits = toNum(search.stockUnits, 1500)
  if (search.signage !== undefined) out.signage = 1
  if (search.shelf !== undefined) out.shelf = 1
  if (search.training !== undefined) out.training = 1
  if (search.cashierBrief !== undefined) out.cashierBrief = 1
  if (search.controlPrice !== undefined) out.controlPrice = 1
  if (search.controlStock !== undefined) out.controlStock = 1
  if (search.controlDisplay !== undefined) out.controlDisplay = 1
  if (search.analysisNote !== undefined) out.analysisNote = toStr(search.analysisNote, '')
  if (search.documentation !== undefined) out.documentation = toStr(search.documentation, '')
  if (search.completed !== undefined) out.completed = 1
  return out
}

/**
 * Decode URL search params into a full SimulatorState (filling in defaults).
 */
export function decodeState(
  search: SimulatorSearch,
  defaults: SimulatorState,
): SimulatorState {
  return {
    step: (search.step ?? defaults.step) as StepId,
    category: search.category ?? defaults.category,
    segment: (search.segment ?? defaults.segment) as SimulatorState['segment'],
    product: search.product ?? defaults.product,
    salesArena: (search.salesArena ?? defaults.salesArena) as SimulatorState['salesArena'],
    retailer: search.retailer ?? defaults.retailer,
    startDate: search.startDate ?? defaults.startDate,
    durationWeeks: search.durationWeeks ?? defaults.durationWeeks,
    salesOwner: search.salesOwner ?? defaults.salesOwner,
    goal: (search.goal ?? defaults.goal) as SimulatorState['goal'],
    promoType: search.promoType ?? defaults.promoType,
    conditionText: search.conditionText ?? defaults.conditionText,
    benefitText: search.benefitText ?? defaults.benefitText,
    discountPct: search.discountPct ?? defaults.discountPct,
    baseUnits: search.baseUnits ?? defaults.baseUnits,
    unitPrice: search.unitPrice ?? defaults.unitPrice,
    unitCost: search.unitCost ?? defaults.unitCost,
    upliftPct: search.upliftPct ?? defaults.upliftPct,
    stockUnits: search.stockUnits ?? defaults.stockUnits,
    signage: search.signage === 1 ? true : defaults.signage,
    shelf: search.shelf === 1 ? true : defaults.shelf,
    training: search.training === 1 ? true : defaults.training,
    cashierBrief: search.cashierBrief === 1 ? true : defaults.cashierBrief,
    controlPrice: search.controlPrice === 1 ? true : defaults.controlPrice,
    controlStock: search.controlStock === 1 ? true : defaults.controlStock,
    controlDisplay: search.controlDisplay === 1 ? true : defaults.controlDisplay,
    analysisNote: search.analysisNote ?? defaults.analysisNote,
    documentation: search.documentation ?? defaults.documentation,
    completed: search.completed === 1 ? true : defaults.completed,
  }
}

/**
 * Encode a SimulatorState into search params, omitting values that equal the defaults.
 */
export function encodeState(
  state: SimulatorState,
  defaults: SimulatorState,
): SimulatorSearch {
  const out: SimulatorSearch = {}
  if (state.step !== defaults.step) out.step = state.step
  if (state.category !== defaults.category) out.category = state.category
  if (state.segment !== defaults.segment) out.segment = state.segment
  if (state.product !== defaults.product) out.product = state.product
  if (state.salesArena !== defaults.salesArena) out.salesArena = state.salesArena
  if (state.retailer !== defaults.retailer) out.retailer = state.retailer
  if (state.startDate !== defaults.startDate) out.startDate = state.startDate
  if (state.durationWeeks !== defaults.durationWeeks) out.durationWeeks = state.durationWeeks
  if (state.salesOwner !== defaults.salesOwner) out.salesOwner = state.salesOwner
  if (state.goal !== defaults.goal) out.goal = state.goal
  if (state.promoType !== defaults.promoType) out.promoType = state.promoType
  if (state.conditionText !== defaults.conditionText) out.conditionText = state.conditionText
  if (state.benefitText !== defaults.benefitText) out.benefitText = state.benefitText
  if (state.discountPct !== defaults.discountPct) out.discountPct = state.discountPct
  if (state.baseUnits !== defaults.baseUnits) out.baseUnits = state.baseUnits
  if (state.unitPrice !== defaults.unitPrice) out.unitPrice = state.unitPrice
  if (state.unitCost !== defaults.unitCost) out.unitCost = state.unitCost
  if (state.upliftPct !== defaults.upliftPct) out.upliftPct = state.upliftPct
  if (state.stockUnits !== defaults.stockUnits) out.stockUnits = state.stockUnits
  if (state.signage) out.signage = 1
  if (state.shelf) out.shelf = 1
  if (state.training) out.training = 1
  if (state.cashierBrief) out.cashierBrief = 1
  if (state.controlPrice) out.controlPrice = 1
  if (state.controlStock) out.controlStock = 1
  if (state.controlDisplay) out.controlDisplay = 1
  if (state.analysisNote !== defaults.analysisNote) out.analysisNote = state.analysisNote
  if (state.documentation !== defaults.documentation) out.documentation = state.documentation
  if (state.completed) out.completed = 1
  return out
}
