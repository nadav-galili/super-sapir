## Decision: Replace generic color helpers with per-domain KPI resolvers

Every KPI status color now comes from a domain-named function (`getSalesColor`, `getCostColor`, `getGrowthColor`, `getMarginColor`, `getSupplyColor`, `getPromotionColor`, `getProgressColor`, `getUpliftColor`, `getStatusColor`, `getBasketColor`, `getCostDeltaColor`, `getQualityColor`) living in `src/lib/kpi/resolvers.ts`. Thresholds and direction ("higher-is-better" vs "lower-is-better") live inside the resolver; call sites pass typed input (`SalesKPI { actual, target }`, `GrowthKPI { changePercent }`, etc.) and no direction flags.

## Context

The codebase previously had four generic helpers: `getKpiStatusColor(ratio)`, `getTargetStatusColor(actual, target, { lowerIsBetter })`, `getDeltaStatusColor(delta, { lowerIsBetter, deadBand })`, `getMarginColor(marginPercent)`. Callers scattered across ~20 files had to remember which helper + which flags to use for each KPI, and the boolean `lowerIsBetter` had to be piped through component props (`KPICardData.lowerIsBetter`, `AlertsTargetsCard` rows, etc.). Adding a new KPI with slightly different thresholds (e.g. promo-simulator ROI >=15 good, >=0 warn) meant inlining ternaries instead of reusing the helper.

## Alternatives considered

1. **Keep the generic helpers, add typed wrappers on top.** Thin `getSalesColor(x)` wrappers that call `getTargetStatusColor(x.actual, x.target)` internally. Would have shrunk the diff but left the leaky thresholds + boolean flags available to new callers.
2. **Collapse everything into one super-generic `getKpiColor(input: KPI)` dispatch.** Single function with a discriminated-union input. Would hide direction at the call site but bloats the resolver logic, forces a giant switch, and makes tree-shaking harder.
3. **Use a configuration map** (`{ sales: { good: 0.95, ... }, cost: { ... } }`) consumed by one function. Pushes thresholds out of code and into data, but the data-to-code tradeoff adds indirection for something that only changes when product semantics change.
4. **Per-domain resolver (chosen).** One function per KPI meaning; inputs are domain-shaped; thresholds live inside the resolver.

## Reasoning

- Call-site readability: `getSalesColor({ actual, target })` documents intent in three seconds; `getTargetStatusColor(actual, target, { lowerIsBetter: true })` hides meaning behind a flag.
- Adding a new KPI (e.g. "PromotionUplift" needs 15/5 thresholds, not 95/85) becomes a resolver + test, not a conditional branch at every call site.
- Removes the `lowerIsBetter` boolean from `KPICardData` and `AlertsTargetsCard` — the domain discriminator carries the semantics as a named concept.
- Keeps `KPI_STATUS` (emerald/amber/rose) as the single palette source of truth — only the classification logic changed, not the colors.

## Trade-offs accepted

- Slightly more modules to know about (12 resolvers vs. 4 helpers). Discovery is helped by the fact that the module is small (~110 lines) and each resolver's name matches its domain noun.
- Very minor behaviour shifts in promo-simulator where the generic helper was being used with ad-hoc ratios (e.g. `getKpiStatusColor(roi >= 0 ? 1 : 0.5)`) — the domain resolver now enforces proper thresholds (ROI ≥15 good, ≥0 warn, <0 bad) which is an intentional improvement, not a regression.
- The `KPICard` component still has to dispatch between two resolvers via its `domain` prop — this is the only place a KPI-direction lookup remains, and it's scoped to the one truly-generic card component.
