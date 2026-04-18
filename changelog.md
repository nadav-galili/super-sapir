# Changelog

> **This file is kept up to date by Claude Code.** Every session that modifies code should append entries here before finishing.
>
> Format: reverse-chronological. Group by date. Each entry: short description + files/areas affected.

---

## 2026-04-18

### Promo simulator polish — Magic UI primitives
- Added 4 Magic UI primitives under `src/components/ui/`: `number-ticker`, `border-beam`, `confetti`, `shimmer-button`. All are single-file, palette-aware, and respect `useReducedMotion`.
- `LiveKPIPanel` numeric values (ROI %, profit-vs-base ₪, stock coverage %) replaced with `<NumberTicker>` wrapped in `dir="ltr"` rows; debounced 250ms upstream so slider drags settle to one ticker animation toward the final value.
- Active step main panel wrapped in `<BorderBeam colorFrom=#DC4E59 colorTo=#E8777F size=220 duration=10>` on steps 4–7 only (the decision steps with LiveKPI). Steps 1–3 and 8–9 stay calm.
- Primary continue/finish button is now `<ShimmerButton>` reskinned to the warm primary gradient (`#DC4E59 → #E8777F`) with 35%-white sheen sweep; preserves `onClick`/`disabled` and the `ArrowLeft` (forward in RTL) icon.
- `SuccessScreen` fires `<ConfettiBurst>` exactly once on mount (180 particles, ~1.6s spread, brand colors `#DC4E59 / #2EC4D5 / #6C5CE7 / #F6B93B`); the `PromoSummaryCard` is wrapped in a calmer `BorderBeam duration=14`. No tilt/parallax — would break html2canvas PDF export.
- `AINarrative` swapped state-driven shimmer for key-driven CSS animations (`narrative-shimmer-text`, `narrative-flash`) — each paragraph's gradient sheen runs once for ~600ms when content changes, then settles to plain `#4A5568` text. No setState-in-effect.
- Tailwind config gained `border-beam`, `shimmer-sweep`, and `narrative-shimmer` keyframes plus matching animation utilities. `global.css` gained the `narrative-shimmer-text` and `narrative-flash` one-shot classes (reduced-motion aware).
- All KPI status colors continue to flow through `getKpiStatusColor(ratio)` — no hardcoded thresholds. Font-size floor (15px / 18px) preserved.
- Installed `canvas-confetti@1.9.4` + `@types/canvas-confetti@1.9.0` via Bun.
- **Files:** `src/components/ui/number-ticker.tsx` (new), `border-beam.tsx` (new), `confetti.tsx` (new), `shimmer-button.tsx` (new), `tailwind.config.ts`, `src/global.css`, `src/components/promo-simulator/LiveKPIPanel.tsx`, `AINarrative.tsx`, `SuccessScreen.tsx`, `src/routes/category-manager/promo-simulator.tsx`, `package.json`, `decisions/2026-04-18-magicui-wow-polish.md` (new)

### Promo Simulator — Slice 9: Polish pass (#34)
- Step transitions use `AnimatePresence` mode="wait" for fade+slide in/out
- Completed stepper circles spring-scale their check icons in
- Goal and promo-type cards (Step 2 / Step 3) get staggered entrance + warm hover shadow
- `LiveKPIPanel` values animate via `useAnimatedCounter`; new `useDebouncedValue` (250ms) hook feeds the counter so slider drags settle before animating
- `SuccessScreen` header, description, and action buttons enter in staggered sequence
- Pulse, spring, and entrance motions respect `prefers-reduced-motion` via `useReducedMotion`
- **Files:** `src/hooks/useDebouncedValue.ts` (new), `src/components/promo-simulator/Stepper.tsx`, `Step2Goal.tsx`, `Step3PromoType.tsx`, `SuccessScreen.tsx`, `LiveKPIPanel.tsx`, `src/routes/category-manager/promo-simulator.tsx`

### Promo Simulator — Slice 8: AI Narrative panel (W3) (#33)
- New pure templating module generates 1–3 Hebrew paragraphs of consultative commentary for steps 2–5 based on goal / promo type / discount / calc status
- `AINarrative` component mirrors `ChainAIBriefing` visual language (purple gradient header strip, Sparkles pill, AI badge) and types each paragraph via `TypingText`
- Paragraph string used as React key so type-on only replays when content changes
- Wired into the route below stepContent on steps 2–5
- **Files:** `src/lib/promo-simulator/narrative.ts` (new), `src/components/promo-simulator/AINarrative.tsx` (new), `src/routes/category-manager/promo-simulator.tsx`

### Promo Simulator — Slice 7: Steps 8+9 + Success screen (#32)
- Step 8 (ניתוח והערכה): header status badge using warm-palette tints + 3 delta metric cards (profit vs base, break-even gap, stock coverage) + free-text assessment textarea bound to `analysisNote`
- Step 9 (תיעוד): documentation textarea bound to `documentation` + reusable 8-row `PromoSummaryCard` + single-row summary table with 9 columns
- Step 9 continue button reads "סיום" and sets `completed=1` in the URL
- `SuccessScreen`: emerald check icon with pulse, header, reused summary card, 4 visual-only action buttons (PDF / archive / share / new) with inline toast feedback, and `חזרה לקטגוריות` link
- **Files:** `src/components/promo-simulator/Step8Analysis.tsx` (new), `Step9Documentation.tsx` (new), `PromoSummaryCard.tsx` (new), `SuccessScreen.tsx` (new), `src/routes/category-manager/promo-simulator.tsx`

### Promo Simulator — Slice 6: Steps 6+7 (Implementation & Control) (#31)
- Step 6 (יישום בשטח): 4-checkbox grid (signage / shelf / training / cashierBrief) + 3 operational tip cards (POS, מלאי, תדריך קצר)
- Step 7 (בקרה): 3-checkbox control grid (price / stock / display) + reflective question card in violet + 3 KPI cards (status via `getKpiStatusColor(statusRatio)`, pace-vs-forecast %, operational readiness X/4)
- **Files:** `src/components/promo-simulator/Step6Implementation.tsx` (new), `Step7Control.tsx` (new), `src/routes/category-manager/promo-simulator.tsx`

### Promo Simulator — Slice 5: Step 5 Forecast + UpliftChart (#30)
- 2-col layout — form (baseUnits, unitPrice, unitCost, upliftPct slider 0–80, stockUnits) + 2×3 KPI grid (revenue, profit, promo units, break-even, ROI, coverage) with traffic-light colors
- New `UpliftChart` Recharts ComposedChart wrapped in `<div dir="ltr">` — base vs promo weekly bars + cumulative promo revenue line
- **Files:** `src/components/promo-simulator/Step5Forecast.tsx` (new), `UpliftChart.tsx` (new)

### Promo Simulator — Slice 4: Step 4 Terms + LiveKPIPanel (#29)
- Step 4: 2-col layout — promo-type (read-only) + taxonomy-driven condition/benefit text fields + cyan discount slider (0–50) + business-translation panel (regular price, effective price, unit margin, meaning)
- `LiveKPIPanel`: sticky side panel on steps 4–7 with status pill + 3 KPI rows (ROI / profit delta / stock coverage) via `getKpiStatusColor`
- **Files:** `src/components/promo-simulator/Step4Terms.tsx` (new), `LiveKPIPanel.tsx` (new)

### Promo Simulator — Slice 3: Steps 2+3 Goal & Promo Type (#28)
- Step 2: 5 goal cards in a 3-col grid with emerald-tinted active state; changing goal clears `promoType`
- Step 3: empty state if no goal, else filtered promo-type cards with 1–3 star rating (amber), reason, and score badge; selected-goal chip in violet on the header
- **Files:** `src/components/promo-simulator/Step2Goal.tsx` (new), `Step3PromoType.tsx` (new)

### Promo Simulator — Slice 2: Step 1 Brief form with pre-fill (#27)
- 4-col responsive form (category dropdown from `getCategorySummaries()`, segment, product, arena, retailer, startDate, duration, salesOwner) + 3 info cards (ארכיון / נתונים / מאגר ידע)
- HeroBanner gained an optional `cta` slot; category-manager index renders a primary-gradient `סימולטור מבצע חדש` CTA Link
- **Files:** `src/components/promo-simulator/Step1Brief.tsx` (new), `src/components/dashboard/HeroBanner.tsx`, `src/routes/category-manager/index.tsx`

### Promo Simulator — Slice 1: Wizard tracer + foundation (#26)
- Pure data & state foundation: `taxonomy.ts` (5 goals, promo types per goal, arenas/segments/durations, `STEPS` list), `state.ts` (full `SimulatorState`, URL codec via `validateSearch`/`decodeState`/`encodeState`), `calc.ts` (pure metrics module: effective price, unit margin, promo units, revenues/profits, ROI, break-even, stock coverage, status enum)
- 14 Vitest tests cover all calc branches incl. status boundaries and zero-base-units / zero-stock edges
- `Stepper` (sticky top stepper with progress fill, active pulse, done check) + `StepPlaceholder` + route component `/category-manager/promo-simulator` with LiveKPIPanel visibility on steps 4–7
- **Files:** `src/lib/promo-simulator/{taxonomy,state,calc,calc.test}.ts` (new), `src/components/promo-simulator/{Stepper,StepPlaceholder}.tsx` (new), `src/routes/category-manager/promo-simulator.tsx` (new)

---

## 2026-04-17

### Legacy color helper cleanup (#24)
- Migrated all remaining callers of `getPerformanceColor`, `getGrowthColor`, `getTrendColor`, `getTargetColor` to traffic-light helpers (`getTargetStatusColor`, `getDeltaStatusColor`)
- Deleted all four legacy helpers from `src/lib/colors.ts` (zero remaining references)
- **Files:** `src/lib/colors.ts`, `QualityGauge.tsx`, `BranchMarker.tsx`, `DepartmentBarChart.tsx`, `CategoryBubbleChart.tsx`, `BranchRankingTable.tsx`

### Store-manager overview presentational swap (#22)
- Migrated cyan-as-status to traffic-light on store-manager overview page
- `BranchPerformanceCard` trend arrows → `getDeltaStatusColor`
- `OverviewExpenseTable` row change indicators → `getDeltaStatusColor` with `lowerIsBetter: true`
- `OverviewDepartmentBars` YoY indicators → `getDeltaStatusColor`
- `AlertsTargetsCard` three-color output (emerald/amber/rose) via `getTargetStatusColor` for bar fill and status pill; binary met/unmet logic removed
- `MonthlyComparisonChart` unchanged
- **Files:** `src/routes/store-manager/index.tsx`

### Category-manager presentational swap (#21)
- `CategorySpotlight` status badges → `KPI_STATUS.good / warning / bad`; YoY text → `getDeltaStatusColor`
- `CategoryDonut` center YoY text → `getDeltaStatusColor`; slices unchanged
- `HeroItemCards`: top-sales card accent driven by `getDeltaStatusColor(yoyChange)`, top-promo card unconditionally emerald, stockout card stays red
- `QuickStatCards` cyan icon tints swapped to emerald `#10B981`
- **Files:** `CategorySpotlight.tsx`, `CategoryDonut.tsx`, `HeroItemCards.tsx`, `QuickStatCards.tsx`

### KPICard data-driven coloring (#20)
- `KPICardData` type: dropped `gradient`, added optional `target?` and `lowerIsBetter?`
- `KPICard` big-number color now derived from `getTargetStatusColor` (when target provided) or `getDeltaStatusColor`; trend pill always uses `getDeltaStatusColor`
- Removed `ACCENT_MAP` from `KPICard`
- Updated all callers across store-manager (overview, inventory, HR, departments, alerts), category-manager detail, division-manager, and branch drill-down pages
- **Files:** `src/data/types.ts`, `KPICard.tsx`, `KPIGrid.tsx`, `store-manager/index.tsx`, `store-manager/$branchId.tsx`, `category-manager/$categoryId.tsx`, `division-manager/index.tsx`, `division-manager/$regionId.tsx`

### Color semantics foundation: new helpers + Vitest setup (#19)
- Added `getTargetStatusColor(actual, target, opts?)` — traffic-light color based on actual vs target with higher-is-better/lower-is-better support
- Added `getDeltaStatusColor(delta, opts?)` — traffic-light color based on percentage delta with configurable dead band (default ±2%)
- Repointed `GRADIENT_PRESETS.green` from cyan to emerald gradient
- Set up Vitest: installed as dev dependency, created `vitest.config.ts`, added `bun run test` script
- 25 unit tests covering `getKpiStatusColor`, `getTargetStatusColor`, `getDeltaStatusColor` with boundary conditions and edge cases
- **Files:** `src/lib/colors.ts`, `src/lib/colors.test.ts`, `vitest.config.ts`, `package.json`

---

## 2026-04-16

### Formats tab: big stores vs city stores comparison (#17)
- Added `format: 'big' | 'city'` field to `Branch` type
- Assigned 2 branches as big (Tel Aviv, Rishon LeZion), 10 as city in mock data
- Created `FormatsOverview` component with two side-by-side cards showing 5 KPIs (sales, gross profit, shrinkage, operational score, satisfaction) as progress bars vs target with YoY delta
- Connected to `PeriodMultiplierProvider` context — changing time period updates format KPIs
- KPI status colors use shared `getKpiStatusColor` utility
- **Files:** `src/data/types.ts`, `src/data/hadera-branch.ts`, `src/data/generators.ts`, `src/data/mock-branches.ts`, `src/components/dashboard/FormatsOverview.tsx`, `src/routes/category-manager/index.tsx`

### Gauge label + tabs/filter layout refactor (#16)
- Added Hebrew header `כל המדדים מוצגים ביחס ליעד` above the 5-gauge row
- Moved `TimePeriodFilter` into the same row as tabs (tabs right, filter pinned left via `justify-between`)
- Reordered tabs to: פורמטים | ביצועי קטגוריות | ספקים | מבצעים
- Added פורמטים tab trigger (content built in #17)
- **Files:** `src/routes/category-manager/index.tsx`

### Hero banner redesign: clean gradient, no stock photo (#15)
- Replaced stock supermarket background image with a clean warm gradient (`#2D3748 → #3D3050 → #DC4E59`)
- Added subtle decorative radial shapes for premium SaaS aesthetic
- All functional elements preserved: title, subtitle, live indicator, stat pills, large gauge
- **Files:** `src/components/dashboard/HeroBanner.tsx`

### Consolidate 3 category-manager screens into one (#14)
- Replaced `/category-manager` V1 content with V2 content (AI briefing, period filter, gauges, tabs with categories/suppliers/promotions)
- Deleted `/category-manager-v2` route directory
- Deleted `/category-manager-rog` route directory
- Deleted all 15 ROG-duplicate components: `HeroBannerROG`, `KPIGaugeRowROG`, `QuickStatCardsROG`, `KPICardROG`, `KPIGridROG`, `CategorySpotlightROG`, `CategoryDonutROG`, `HeroItemCardsROG`, `BranchPerformanceBarsROG`, `SupplierSpotlightCardsROG`, `BranchComparisonChartROG`, `PromotionDailyChartROG`, `PromotionsTableROG`, `SuppliersTableROG`, `CategoryPerformanceTableROG`
- Updated Sidebar: single entry `ניהול סחר` with PieChart icon, removed V2 and ROG entries
- Updated `__root.tsx` page title to `ניהול סחר`, removed V2 title entry
- Category drill-down route (`/category-manager/$categoryId`) preserved unchanged
- **Files:** `src/routes/category-manager/index.tsx`, `src/components/layout/Sidebar.tsx`, `src/routes/__root.tsx`, `src/routeTree.gen.ts` (auto-regenerated), 15 deleted ROG component files, 2 deleted route directories

## 2026-04-15

### Global KPI color system — unified traffic-light colors (#13)
- Created `getKpiStatusColor(ratio)` utility and `KPI_STATUS` constants in `src/lib/colors.ts` as the single source of truth for KPI status colors: good (`#10B981`), warning (`#FBBF24`), bad (`#F43F5E`)
- Replaced local `getScoreColor()` functions in `KPIGaugeRow.tsx` and `KPIGaugeRowROG.tsx` with the shared utility; updated legend dot colors
- Replaced inline color ternaries in `HeroBanner.tsx` and `HeroBannerROG.tsx` BigGauge with `getKpiStatusColor()`
- Updated `STATUS_CONFIG` in `ChainAIBriefing.tsx`, `CategoryAIBriefing.tsx`, and `StoreAIBriefing.tsx` to use `KPI_STATUS` constants
- Updated `TargetBars.tsx` bar color logic and legend to use the shared utility
- Updated `CategoryPerformanceTable.tsx` and `CategoryPerformanceTableROG.tsx` status badge and YoY change colors to use `KPI_STATUS` constants with inline styles
- **Files:** `src/lib/colors.ts`, `KPIGaugeRow.tsx`, `KPIGaugeRowROG.tsx`, `HeroBanner.tsx`, `HeroBannerROG.tsx`, `ChainAIBriefing.tsx`, `CategoryAIBriefing.tsx`, `StoreAIBriefing.tsx`, `TargetBars.tsx`, `CategoryPerformanceTable.tsx`, `CategoryPerformanceTableROG.tsx`

## 2026-04-13

### Category AI analysis — table format with traffic-light status
- Replaced the category AI briefing (bullet list + recommendation cards) with a 3-column table: נושא (subject), המלצה (recommendation), סטטוס (traffic light: red/yellow/green)
- Updated system prompt to request 3-4 insight rows with subject/recommendation/status format
- New `CategoryInsightRow` type replaces `BriefingItem` + `Recommendation` in the category AI flow
- Updated `useCategoryAIAnalysis` hook to parse `insight` items instead of `briefing`/`recommendation`
- Added `insight` type handling to the Netlify serverless function SSE parser and fallback JSON parser
- **Files:** `CategoryAIBriefing.tsx`, `useCategoryAIAnalysis.ts`, `category-ai.ts`, `netlify/functions/ai-analyze.ts`

### Store manager AI analysis — table format on overview page
- Converted store manager AI from old briefing/recommendation bullet format to the 3-column traffic-light table (subject, recommendation, status)
- Created `StoreAIBriefing` table component in `src/components/store-manager/StoreAIBriefing.tsx`
- Rewrote `useAIAnalysis` hook to use `insight` item type with custom store-manager system prompt (no longer relies on the default prompt)
- Added AI table to the top of `store-manager?view=overview` page; also used in the dedicated `?view=ai` tab
- Old `AIBriefingCard` and `AIRecommendations` components are no longer imported (can be cleaned up later)
- Handles stale browser cache gracefully (old `briefing`/`recommendations` format detected and cleared)
- **Files:** `StoreAIBriefing.tsx`, `useAIAnalysis.ts`, `store-manager/index.tsx`

### Chain-level AI analysis on category-manager-v2 page
- Added `ChainAIBriefing` component with the same 3-column traffic-light table format (subject, recommendation, status)
- Created `useChainAIAnalysis` hook — calls the same Netlify AI endpoint with a trade-manager-focused system prompt
- Created `buildChainPromptPayload()` in `chain-ai.ts` — aggregates chain KPIs, top 10 categories, top 12 suppliers, all promotions, and anomaly detection
- System prompt focuses on categories, suppliers, promotions and trade strategy — explicitly excludes individual store analysis
- Placed at top of page, right after the hero banner
- **Files:** `ChainAIBriefing.tsx`, `useChainAIAnalysis.ts`, `chain-ai.ts`, `category-manager-v2/index.tsx`

### Category sales trend chart — realistic target crossing & color-coded dots
- Normalized the target line to sit at the same level as actual sales (was ~50% below due to data mismatch), then applied per-month deterministic variation so the target naturally crosses above/below sales bars
- Added `getMonthlyPerformanceFactors()` — seeded hash per categoryId produces ±8% per-month variation, giving each category a unique crossing pattern
- Replaced static yellow dots on the target line with custom `TargetDot` component: green (`#2EC4D5`) when sales >= target, red (`#DC4E59`) when below
- **Files:** `src/routes/category-manager/$categoryId.tsx`

---

## 2026-04-09

### Time period filter across all dashboard data
- Added `TimePeriodFilter` component with 3 modes: שנתי (accumulated year), חודשי (month picker), שבועי (week picker)
- Created `PeriodMultiplierProvider` context (`src/contexts/PeriodContext.tsx`) so all child components read the multiplier without prop drilling
- All monetary values across both pages react to period selection: hero banner, quick stats, KPI gauges, category snapshots, supplier tables/cards, promotion tables/charts, hero item cards
- Percentage KPIs (gross margin, supply rate, quality, promo %) use a small deterministic jitter per period for realistic variation
- Fixed unrealistic "מכירות מבצעים" gauge target: 15% → 60%
- **Files:** `TimePeriodFilter.tsx`, `PeriodContext.tsx`, both route pages, `QuickStatCards`, `HeroItemCards`, `SuppliersTable`, `SupplierSpotlightCards` (+ ROG variants)

### Tabbed navigation for categories, suppliers, and promotions
- Replaced separate sections with Radix Tabs on both `category-manager-rog` and `category-manager-v2` pages
- Three tabs: ביצועי קטגוריות (default) | ספקים | מבצעים
- Added `@radix-ui/react-tabs` dependency and `src/components/ui/tabs.tsx` (shadcn pattern)
- Expanded suppliers data from 10 to 25 with realistic Israeli brands
- Added pagination (10 per page) and column sorting (sales, target %, gross margin) to both supplier tables
- Commented out "השוואת סניפים" section on both pages (preserved for future use)
- **Files:** `category-manager-rog/index.tsx`, `category-manager-v2/index.tsx`, `SuppliersTable.tsx`, `SuppliersTableROG.tsx`, `mock-suppliers.ts`, `ui/tabs.tsx`

### Fix: `/update-docs-and-commit` slash command not appearing
- Added `.md` extension to `.claude/commands/update-docs-and-commit` — Claude Code requires `.md` for custom slash commands
- **Files:** `.claude/commands/update-docs-and-commit.md`

### Text scaling — 1.5x font enlargement across category-manager screens
- Scaled all text sizes ~1.5x on `category-manager-v2` and `category-manager/$categoryId` pages
- Smallest fonts (`text-[10px]`–`text-[13px]`) bumped to `text-[15px]`–`text-[20px]`
- Chart axis/tooltip font sizes: `fontSize: 11→16`, `fontSize: 12→18`
- Added **Font Sizes — Target Scale** table to `CLAUDE.md` as the standard for all new components
- **Files:** 20+ component files across `components/dashboard/`, `components/charts/`, `components/tables/`, `components/layout/`, and `routes/category-manager/`

### Hero banner header rename
- Changed hero banner title from "מנהל קטגוריה רשתי" to "ניהול סחר"
- **Files:** `components/dashboard/HeroBanner.tsx`

### New route: `category-manager-rog` (classic red/orange/green palette)
- Created `/category-manager-rog` — full copy of V2 with classic ROG KPI colors
- ROG color mapping: cyan→green (`#22C55E`), amber→orange (`#F97316`), warm-red→red (`#EF4444`)
- Created ROG variants of all colored components (14 files):
  - `HeroBannerROG`, `QuickStatCardsROG`, `KPIGaugeRowROG`, `KPICardROG`, `KPIGridROG`
  - `CategorySpotlightROG`, `CategoryDonutROG`, `HeroItemCardsROG`
  - `BranchPerformanceBarsROG`, `BranchComparisonChartROG`
  - `PromotionDailyChartROG`, `PromotionsTableROG`, `SuppliersTableROG`
  - `SupplierSpotlightCardsROG`, `CategoryPerformanceTableROG`
- Added sidebar link "ניהול סחר ROG" with PieChart icon
- **Files:** `routes/category-manager-rog/index.tsx`, `components/layout/Sidebar.tsx`, 14 ROG component files

### Documentation
- Created `architecture.md` — file tree (with regeneration command), route map, ROG vs Modern palette reference
- Created `changelog.md` — this file
- Referenced both in `CLAUDE.md`

---

## 2026-04-06

### Tone guidelines
- Added tone guidelines to AI prompts — no offensive language (`f890e74`)

### API key fallback
- Fallback to `process.env` for API key on draft deploys (`8b644b0`)

### AI caching
- Added localStorage caching for AI analysis with 24h TTL (`9ae3a7d`)

### AI supplier analysis
- Added AI supplier analysis to each category detail page (`e7ff9c5`)

---

## 2026-04-05

### Category supplier dashboards
- Added category supplier dashboards, logos, and branch alerts (`235ad4a`)
- Added suppliers section with table, spotlight cards, and badge fix (`defb7e8`)

### Code quality
- Deduplicated colors, memoized computations, cleaned comments (`dabda28`)

---

## 2026-04-04

### Major visual overhaul
- Dark gauges, photo cards, donut chart, stat bars (`726bffd`)
- Dramatic hero banner with big gauge and photorealistic product images (`697a4ed`)
- Category table half-width with vertical hero cards alongside (`0061c7c`)
- Leading promotion item hero card in 3-column layout (`0bdbbf0`)
- KPI row with gauges, Gemini category icons, table alignment (`08bc41f`)

### Category manager V2
- Branch comparison chart with dual bars and YoY growth line (`814cd0b`)
- Hero item cards for stockout loss leader and top sales (`18eee7d`)
- Category performance table with status badges and navigation (`a41a9cb`)
- Promotion analysis section with daily chart and interactive table (`8e83266`)
- New `category-manager-v2` route with KPI bar and sidebar nav (`b0c0527`)

---

## 2026-04-03

### AI streaming
- Refactored AI streaming: real-time JSONL with typing effect (`8af835f`)
- Added promotions analysis view to category manager (`8fbd840`)

### Responsive fixes
- Fixed mobile responsiveness for category-manager and global layout (`c5cd3f2`)

### Store manager refactor
- Refactored store-manager views: UI consistency, AI separation & cleanup (`d96df7a`)

---

## Earlier (2026-03 and before)

### Category manager enhancements
- Enhanced category manager charts, table columns, and detail page (`6880781`)
- Rebranded with icon (`d9a6b6e`)
- Refactored category-manager with profitability, inventory, promotions & alerts (`6ee9a74`)

### AI features
- Streaming AI analysis with shimmer loading effects (`5b13d26`)
- AI analysis features: morning briefing, anomaly detection, recommendations (`568572d`)

### Store manager
- Comprehensive dashboard layout, HR section, inventory section
- Real Hadera #44 data integration (`6f1f45a`)

### Foundation
- Marketing landing page with eCommerce Warm design system (`ac67221`)
- shadcn sidebar component integration (`7743937`)
- Netlify deploy config with SPA redirects
