// Promo Simulator — state type, defaults, URL codec
import type { Goal, SalesArena, Segment, StepId } from "./taxonomy";

export const SCENARIOS = ["pessimistic", "base", "optimistic"] as const;
export type Scenario = (typeof SCENARIOS)[number];

export const SCENARIO_LABEL: Record<Scenario, string> = {
  pessimistic: "שמרני",
  base: "בסיס",
  optimistic: "אופטימי",
};

/**
 * Scoped slice types — each step consumes only the fields it owns,
 * not the entire SimulatorState. Keeps step components unaware of
 * fields they don't read or write.
 */
export interface BriefSlice {
  // New 4-level promo taxonomy (PR 2 — data layer).
  // Wired into the UI in PR 3; co-exists with legacy `category`/`segment`
  // until then. See: decisions/2026-05-02-promo-simulator-taxonomy.md
  group: string;
  department: string;
  subcategory: string;
  supplier: string;
  series: string;

  // Legacy fields — still drive Step 1 UI today; removed in PR 3.
  category: string;
  segment: Segment | "";
  product: string;
  salesArena: SalesArena | "";
  retailer: string;
  startDate: string;
  durationWeeks: number;
  categoryManager: string;
}

export interface TermsSlice {
  promoType: string;
  conditionText: string;
  benefitText: string;
  discountPct: number;
  unitPrice: number;
  unitCost: number;
}

export interface ForecastSlice {
  baseUnits: number;
  unitPrice: number;
  unitCost: number;
  upliftPct: number;
  stockUnits: number;
  discountPct: number;
  durationWeeks: number;
}

export interface ImplementationSlice {
  signage: boolean;
  shelf: boolean;
  training: boolean;
  cashierBrief: boolean;
}

export interface ControlSlice {
  controlPrice: boolean;
  controlStock: boolean;
  controlDisplay: boolean;
}

/**
 * A typed setter scoped to a specific slice. Step components receive this
 * instead of a full-state setter, so they can only write fields that
 * belong to their slice.
 */
export type SliceSetter<T> = (update: Partial<T>) => void;

export interface SimulatorState {
  step: StepId;
  // Step 1 — brief (new promo-simulator taxonomy fields)
  group: string;
  department: string;
  subcategory: string;
  supplier: string;
  series: string;
  // Step 1 — brief (legacy fields, removed in PR 3)
  category: string;
  segment: Segment | "";
  product: string;
  salesArena: SalesArena | "";
  retailer: string;
  startDate: string; // YYYY-MM-DD
  durationWeeks: number;
  categoryManager: string;
  // Step 2 — goal
  goal: Goal | "";
  // Step 3 — promo type
  promoType: string;
  // Step 4 — terms & benefit
  conditionText: string;
  benefitText: string;
  discountPct: number;
  // Step 4/5 — financial parameters (was: split between Step 4 terms + Step 5 forecast)
  baseUnits: number;
  unitPrice: number;
  unitCost: number;
  upliftPct: number;
  stockUnits: number;
  mktCost: number;
  opsCost: number;
  cannibPct: number;
  selectedScenario: Scenario;
  // Step 6 — implementation
  signage: boolean;
  shelf: boolean;
  training: boolean;
  cashierBrief: boolean;
  // Step 7 — control
  controlPrice: boolean;
  controlStock: boolean;
  controlDisplay: boolean;
  // Step 8 — analysis
  analysisNote: string;
  // Step 9 — documentation
  documentation: string;
  completed: boolean;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultStartDate(): string {
  return addDays(todayISO(), 14);
}

export const RETAILER_DEFAULT = "סופר ספיר";

export function createDefaultState(opts?: {
  defaultCategory?: string;
}): SimulatorState {
  return {
    step: 1,
    group: "",
    department: "",
    subcategory: "",
    supplier: "",
    series: "",
    category: opts?.defaultCategory ?? "",
    segment: "",
    product: "",
    salesArena: "",
    retailer: RETAILER_DEFAULT,
    startDate: defaultStartDate(),
    durationWeeks: 2,
    categoryManager: "",
    goal: "",
    promoType: "",
    conditionText: "",
    benefitText: "",
    discountPct: 15,
    baseUnits: 1000,
    unitPrice: 12,
    unitCost: 7.5,
    upliftPct: 20,
    stockUnits: 1500,
    mktCost: 5000,
    opsCost: 1,
    cannibPct: 15,
    selectedScenario: "base",
    signage: false,
    shelf: false,
    training: false,
    cashierBrief: false,
    controlPrice: false,
    controlStock: false,
    controlDisplay: false,
    analysisNote: "",
    documentation: "",
    completed: false,
  };
}

/**
 * URL search param schema. Only non-default values are encoded into the URL.
 * Defaults are re-applied when decoding.
 */
export type SimulatorSearch = Partial<{
  step: number;
  group: string;
  department: string;
  subcategory: string;
  supplier: string;
  series: string;
  category: string;
  segment: string;
  product: string;
  salesArena: string;
  retailer: string;
  startDate: string;
  durationWeeks: number;
  categoryManager: string;
  goal: string;
  promoType: string;
  conditionText: string;
  benefitText: string;
  discountPct: number;
  baseUnits: number;
  unitPrice: number;
  unitCost: number;
  upliftPct: number;
  stockUnits: number;
  mktCost: number;
  opsCost: number;
  cannibPct: number;
  selectedScenario: Scenario;
  signage: 1;
  shelf: 1;
  training: 1;
  cashierBrief: 1;
  controlPrice: 1;
  controlStock: 1;
  controlDisplay: 1;
  analysisNote: string;
  documentation: string;
  completed: 1;
}>;

function toNum(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function toStr(v: unknown, fallback: string): string {
  if (typeof v === "string") return v;
  return fallback;
}

/**
 * Validates raw URL search input into a typed SimulatorSearch object.
 * Used as the `validateSearch` function for the TanStack Router route.
 */
export function validateSimulatorSearch(
  search: Record<string, unknown>
): SimulatorSearch {
  const out: SimulatorSearch = {};
  if (search.step !== undefined) {
    const n = toNum(search.step, 1);
    out.step = Math.min(9, Math.max(1, Math.round(n))) as number;
  }
  if (search.group !== undefined) out.group = toStr(search.group, "");
  if (search.department !== undefined)
    out.department = toStr(search.department, "");
  if (search.subcategory !== undefined)
    out.subcategory = toStr(search.subcategory, "");
  if (search.supplier !== undefined) out.supplier = toStr(search.supplier, "");
  if (search.series !== undefined) out.series = toStr(search.series, "");
  if (search.category !== undefined) out.category = toStr(search.category, "");
  if (search.segment !== undefined) out.segment = toStr(search.segment, "");
  if (search.product !== undefined) out.product = toStr(search.product, "");
  if (search.salesArena !== undefined)
    out.salesArena = toStr(search.salesArena, "");
  if (search.retailer !== undefined) out.retailer = toStr(search.retailer, "");
  if (search.startDate !== undefined)
    out.startDate = toStr(search.startDate, "");
  if (search.durationWeeks !== undefined)
    out.durationWeeks = toNum(search.durationWeeks, 2);
  if (search.categoryManager !== undefined)
    out.categoryManager = toStr(search.categoryManager, "");
  if (search.goal !== undefined) out.goal = toStr(search.goal, "");
  if (search.promoType !== undefined)
    out.promoType = toStr(search.promoType, "");
  if (search.conditionText !== undefined)
    out.conditionText = toStr(search.conditionText, "");
  if (search.benefitText !== undefined)
    out.benefitText = toStr(search.benefitText, "");
  if (search.discountPct !== undefined)
    out.discountPct = toNum(search.discountPct, 15);
  if (search.baseUnits !== undefined)
    out.baseUnits = toNum(search.baseUnits, 1000);
  if (search.unitPrice !== undefined)
    out.unitPrice = toNum(search.unitPrice, 12);
  if (search.unitCost !== undefined) out.unitCost = toNum(search.unitCost, 7.5);
  if (search.upliftPct !== undefined)
    out.upliftPct = toNum(search.upliftPct, 20);
  if (search.stockUnits !== undefined)
    out.stockUnits = toNum(search.stockUnits, 1500);
  if (search.mktCost !== undefined) out.mktCost = toNum(search.mktCost, 5000);
  if (search.opsCost !== undefined) out.opsCost = toNum(search.opsCost, 1);
  if (search.cannibPct !== undefined)
    out.cannibPct = toNum(search.cannibPct, 15);
  if (search.selectedScenario !== undefined) {
    const v = toStr(search.selectedScenario, "base");
    out.selectedScenario = (
      v === "pessimistic" || v === "optimistic" ? v : "base"
    ) as Scenario;
  }
  if (search.signage !== undefined) out.signage = 1;
  if (search.shelf !== undefined) out.shelf = 1;
  if (search.training !== undefined) out.training = 1;
  if (search.cashierBrief !== undefined) out.cashierBrief = 1;
  if (search.controlPrice !== undefined) out.controlPrice = 1;
  if (search.controlStock !== undefined) out.controlStock = 1;
  if (search.controlDisplay !== undefined) out.controlDisplay = 1;
  if (search.analysisNote !== undefined)
    out.analysisNote = toStr(search.analysisNote, "");
  if (search.documentation !== undefined)
    out.documentation = toStr(search.documentation, "");
  if (search.completed !== undefined) out.completed = 1;
  return out;
}

/**
 * Decode URL search params into a full SimulatorState (filling in defaults).
 */
export function decodeState(
  search: SimulatorSearch,
  defaults: SimulatorState
): SimulatorState {
  return {
    step: (search.step ?? defaults.step) as StepId,
    group: search.group ?? defaults.group,
    department: search.department ?? defaults.department,
    subcategory: search.subcategory ?? defaults.subcategory,
    supplier: search.supplier ?? defaults.supplier,
    series: search.series ?? defaults.series,
    category: search.category ?? defaults.category,
    segment: (search.segment ?? defaults.segment) as SimulatorState["segment"],
    product: search.product ?? defaults.product,
    salesArena: (search.salesArena ??
      defaults.salesArena) as SimulatorState["salesArena"],
    retailer: search.retailer ?? defaults.retailer,
    startDate: search.startDate ?? defaults.startDate,
    durationWeeks: search.durationWeeks ?? defaults.durationWeeks,
    categoryManager: search.categoryManager ?? defaults.categoryManager,
    goal: (search.goal ?? defaults.goal) as SimulatorState["goal"],
    promoType: search.promoType ?? defaults.promoType,
    conditionText: search.conditionText ?? defaults.conditionText,
    benefitText: search.benefitText ?? defaults.benefitText,
    discountPct: search.discountPct ?? defaults.discountPct,
    baseUnits: search.baseUnits ?? defaults.baseUnits,
    unitPrice: search.unitPrice ?? defaults.unitPrice,
    unitCost: search.unitCost ?? defaults.unitCost,
    upliftPct: search.upliftPct ?? defaults.upliftPct,
    stockUnits: search.stockUnits ?? defaults.stockUnits,
    mktCost: search.mktCost ?? defaults.mktCost,
    opsCost: search.opsCost ?? defaults.opsCost,
    cannibPct: search.cannibPct ?? defaults.cannibPct,
    selectedScenario:
      (search.selectedScenario as Scenario | undefined) ??
      defaults.selectedScenario,
    signage: search.signage === 1 ? true : defaults.signage,
    shelf: search.shelf === 1 ? true : defaults.shelf,
    training: search.training === 1 ? true : defaults.training,
    cashierBrief: search.cashierBrief === 1 ? true : defaults.cashierBrief,
    controlPrice: search.controlPrice === 1 ? true : defaults.controlPrice,
    controlStock: search.controlStock === 1 ? true : defaults.controlStock,
    controlDisplay:
      search.controlDisplay === 1 ? true : defaults.controlDisplay,
    analysisNote: search.analysisNote ?? defaults.analysisNote,
    documentation: search.documentation ?? defaults.documentation,
    completed: search.completed === 1 ? true : defaults.completed,
  };
}

/**
 * Encode a SimulatorState into search params, omitting values that equal the defaults.
 */
export function encodeState(
  state: SimulatorState,
  defaults: SimulatorState
): SimulatorSearch {
  const out: SimulatorSearch = {};
  if (state.step !== defaults.step) out.step = state.step;
  if (state.group !== defaults.group) out.group = state.group;
  if (state.department !== defaults.department)
    out.department = state.department;
  if (state.subcategory !== defaults.subcategory)
    out.subcategory = state.subcategory;
  if (state.supplier !== defaults.supplier) out.supplier = state.supplier;
  if (state.series !== defaults.series) out.series = state.series;
  if (state.category !== defaults.category) out.category = state.category;
  if (state.segment !== defaults.segment) out.segment = state.segment;
  if (state.product !== defaults.product) out.product = state.product;
  if (state.salesArena !== defaults.salesArena)
    out.salesArena = state.salesArena;
  if (state.retailer !== defaults.retailer) out.retailer = state.retailer;
  if (state.startDate !== defaults.startDate) out.startDate = state.startDate;
  if (state.durationWeeks !== defaults.durationWeeks)
    out.durationWeeks = state.durationWeeks;
  if (state.categoryManager !== defaults.categoryManager)
    out.categoryManager = state.categoryManager;
  if (state.goal !== defaults.goal) out.goal = state.goal;
  if (state.promoType !== defaults.promoType) out.promoType = state.promoType;
  if (state.conditionText !== defaults.conditionText)
    out.conditionText = state.conditionText;
  if (state.benefitText !== defaults.benefitText)
    out.benefitText = state.benefitText;
  if (state.discountPct !== defaults.discountPct)
    out.discountPct = state.discountPct;
  if (state.baseUnits !== defaults.baseUnits) out.baseUnits = state.baseUnits;
  if (state.unitPrice !== defaults.unitPrice) out.unitPrice = state.unitPrice;
  if (state.unitCost !== defaults.unitCost) out.unitCost = state.unitCost;
  if (state.upliftPct !== defaults.upliftPct) out.upliftPct = state.upliftPct;
  if (state.stockUnits !== defaults.stockUnits)
    out.stockUnits = state.stockUnits;
  if (state.mktCost !== defaults.mktCost) out.mktCost = state.mktCost;
  if (state.opsCost !== defaults.opsCost) out.opsCost = state.opsCost;
  if (state.cannibPct !== defaults.cannibPct) out.cannibPct = state.cannibPct;
  if (state.selectedScenario !== defaults.selectedScenario)
    out.selectedScenario = state.selectedScenario;
  if (state.signage) out.signage = 1;
  if (state.shelf) out.shelf = 1;
  if (state.training) out.training = 1;
  if (state.cashierBrief) out.cashierBrief = 1;
  if (state.controlPrice) out.controlPrice = 1;
  if (state.controlStock) out.controlStock = 1;
  if (state.controlDisplay) out.controlDisplay = 1;
  if (state.analysisNote !== defaults.analysisNote)
    out.analysisNote = state.analysisNote;
  if (state.documentation !== defaults.documentation)
    out.documentation = state.documentation;
  if (state.completed) out.completed = 1;
  return out;
}
