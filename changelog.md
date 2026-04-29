# Changelog

> **This file is kept up to date by Claude Code.** Every session that modifies code should append entries here before finishing.
>
> Format: reverse-chronological. Group by date. Each entry: short description + files/areas affected.

---

## 2026-04-29

### Store-manager overview — drop CSS `zoom` entirely (root cause of iOS shrink-to-fit)

Earlier today gated `zoom: 1.25` behind `lg:` thinking that fixed mobile, but the real issue is that CSS `zoom` is non-standard and triggers iOS Safari's legacy "shrink-to-fit" whenever the scaled content overflows the viewport — exactly the symptom the user reported ("renders responsive for a second, then zooms out and looks non-responsive"). At any viewport that crosses 1024px (iPad portrait, iPhone Pro Max landscape, narrow desktops, browser zoom), the 1.25× scaled content overflowed and Safari rescaled the whole page to fit, making it look "zoomed out." Removed `zoom: 1.25` outright in `OverviewView`, `BranchInfoBar`, and `BranchPerformanceCard`. The existing design-system typography scale (15–36px in CLAUDE.md) keeps desktop readable without `zoom`. Verified at 375px (mobile), 768px (tablet), 1440px (desktop) — no horizontal overflow at any size.

Files modified: `src/components/store-manager/views/OverviewView.tsx`, `src/components/store-manager/BranchInfoBar.tsx`, `src/components/store-manager/charts/BranchPerformanceCard.tsx`.

### Home page — hero headline rewrite

Replaced the three-line "כל הסניפים שלכם / במסך אחד / בזמן אמת" hero h1 with a product-positioning statement: "Retalio היא פלטפורמת / **AI לביצועי קמעונאות** / שחושפת פערים ומניעה החלטות חכמות יותר ברחבי הרשת". Brand name "Retalio" wrapped in `<span dir="ltr">` so it always renders LTR even inside the RTL Hebrew flow; middle line keeps the brand-blue highlight. Also normalized the supporting paragraph below ("רטליו" → "Retalio") for consistent brand spelling.

Files modified: `src/routes/index.tsx`.

### Store-manager overview — fix mobile layout (zoom + KPI label overflow)

Yesterday's font/layout pass added `style={{ zoom: 1.25 }}` to three components on the overview path; on mobile this compounded (OverviewView 1.25× → BranchPerformanceCard 1.25× = 1.5625× scale on its tiles) and forced overflow plus value/label overlap. Gated all three behind `lg:` so the desktop view is byte-identical and only mobile/tablet drop the zoom: `<div className="space-y-5 lg:[zoom:1.25]">` in `OverviewView`, the same on the `motion.div` wrapper in `BranchInfoBar`, and on the `<Card>` in `BranchPerformanceCard`. Tailwind v3 arbitrary-property syntax keeps it a one-line responsive change.

Also fixed KPI cards where the trend label (e.g. "יעד: 9.3M ₪") was being `truncate`d on mobile because the trend pill + label couldn't fit on one line in the 2-col mobile grid. Changed the trend row from `flex items-center` + `truncate` to `flex flex-wrap … sm:flex-nowrap … sm:truncate` — on mobile the label wraps to a second line and shows in full, on desktop the original single-line truncate behavior is preserved.

Verified at 375px (no horizontal overflow, branch info bar fits, KPI labels fully visible, BranchPerformanceCard tiles no longer overlap their values) and 1440px (4-col KPI grid, zoom 1.25 still applied, trend labels truncate as before).

Files modified: `src/components/store-manager/views/OverviewView.tsx`, `src/components/store-manager/BranchInfoBar.tsx`, `src/components/store-manager/charts/BranchPerformanceCard.tsx`, `src/components/dashboard/KPICard.tsx`.

---

## 2026-04-28

### Home page — landing-only mode: dashboard CTAs hidden, editorial closing section

Two demo CTAs in `index.tsx` (hero "כניסה לדמו חי" and bottom "נסו עכשיו", both linking to `/store-manager?view=overview`) are commented out so the public landing doesn't expose the dashboards. Both blocks include a comment explaining that they should be uncommented for the client meeting; their `MagneticButton`/`Link`/`ArrowLeft` references inside JSX block comments keep the imports satisfying TS without removing them.

The dark slate `CTASection` was replaced with an **editorial closing manifesto** (no centered card, no big purple/red button). Layout: animated horizontal eyebrow rule → small `RETALIO` label with thin red rule → split-typography headline ("לא עוד דוחות. / בקרה חיה." — same `text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold leading-[1.05] tracking-tight` typography as the hero h1 so they feel paired) → manifesto paragraph → newspaper-column ledger (`01/02/03` with `120 / 380+ / AI`) → footer rule with `BUILT FOR RETAIL, IN TEL AVIV` and a real mailto CTA `לקבלת הצעה — nadav@retalio.net` (prefilled Hebrew subject "בקשת הצעה - Retalio" and body). Pulsing red dot beside the email keeps the live-product personality without shouting. Removed the decorative red+violet orbs and the warm-white centered card.

Files modified: `src/routes/index.tsx`.

### Home page — bento card swap: SalesPulseCard → PromoSimulatorCard

The "live sales pulse" card claimed real-time stats the app doesn't actually have (Retalio shows historical data, not streaming sales). Replaced it with a card that previews the actual flagship feature — the 9-step promo planning wizard. The new card auto-advances through all 9 steps (~1.1s per step), each step pill morphing from a numbered todo → red active with pulsing glow → green done with check, while the progress bar fills underneath. The center panel cross-fades between four representative phase mocks (`bריף` brief with category & description, `plan` with selectable promo-type chips and 30%-הנחה pre-selected, `forecast` with a self-drawing uplift line + confidence band, `deploy` with branch chips springing in). A persistent forecast strip at the bottom shows the canonical wizard outputs: +18.7% uplift / 3.2x ROI / 87% confidence — plus a "פתח סימולטור" CTA hint. On mobile/reduced-motion the card renders in its terminal state (all 9 done, deploy phase visible) without auto-advance.

Files modified: `src/components/home/BentoLiveDashboard.tsx`.

### Home page — pitch-grade redesign: branch map, live bento dashboard, magnetic CTAs

Replaced the marketing landing page with retail-pitch-tuned visuals so the page sells the product on first scroll. Three structural moves: (1) the hero's right-column phone mockup is gone, replaced with `BranchNetworkMap` — a stylized SVG of Israel with the country outline self-drawing on mount, 11 branch dots projected from real lat/lng coords (sourced from `mock-branches.ts` + `hadera-seed.ts`), Hadera marked as HQ with a perpetual ring pulse, dotted network lines fanning from HQ to each branch, and three floating KPI badges (sales / quality / stock-alert) springing in over specific branches. (2) The 7-icon `FeaturesSection` is replaced with `BentoLiveDashboard` — a 12-col asymmetric bento with five live-demo cards: a self-drawing area chart with a counter ticking to ₪2.47M and a perpetual "live" pulse, an AI typewriter cycling through four realistic Hebrew insights with a blinking cursor, a 3×4 branch heat grid with breathing status dots, an alerts feed that rotates new entries every 3.2s with overshoot-spring popups, and a circular quality gauge with spring-driven dial. (3) The static feature-name marquee is replaced with `LiveTickerStrip` — a scrolling KPI event feed with a "LIVE" badge.

CTAs (hero + bottom) wrapped in `MagneticButton` — Framer `useMotionValue`/`useSpring` cursor-follow that no-ops when light mode is active. New `useLightMotion()` hook combines `useReducedMotion` from motion/react with the existing `useIsMobile` (1024px breakpoint) to disable perpetual loops, magnetic effects, scroll parallax, and typewriter cycling on small viewports / accessibility settings — mobile renders static "snapshot" states of every card. Hero copy rewritten for retail framing ("כל הסניפים שלכם. במסך אחד. בזמן אמת."), stats rebalanced, hero `min-h-[85vh]` swapped for `min-h-[100dvh]` to prevent iOS Safari layout jumps, hero now constrained by `max-w-[1280px] mx-auto`, footer `flex` got `flex-wrap` to stop overflow on narrow phones. Performance: each bento card is a `React.memo`'d isolated client component so perpetual loops don't trigger parent rerenders. Verified at 375px (mobile-light: static cards, no perpetual loops) and 1280–1440px (full motion: hero map renders left, text/CTA right; magnetic button responds to cursor). Typecheck clean.

Files added: `src/hooks/useLightMotion.ts`, `src/components/home/MagneticButton.tsx`, `src/components/home/BranchNetworkMap.tsx`, `src/components/home/BentoLiveDashboard.tsx`.
Files modified: `src/routes/index.tsx`.

### Home page — fix hero logo overflow on mobile

The hero rendered `<BrandLogo size={288} />` next to the AI badge. Logo image is 1536×1024 (1.5:1), so at 288px height it computes to 432px wide, overflowing the 375px viewport. Because the row is in an RTL flex container, items anchor to the right (start) — so the overflow spilled to the **left**, making the logo appear pushed off-screen on phones. Replaced the fixed `BrandLogo` with an inline `<img>` wrapped in a `dir="ltr"` container using responsive Tailwind heights (`h-32 sm:h-48 lg:h-72`) — 128px on mobile, 192px on tablet, 288px on desktop. Verified at 375px (logo 192×128, fits) and 1280px (logo 432×288, full prominence). `BrandLogo` component itself is unchanged (still used in the footer).

Files modified: `src/routes/index.tsx`.

### Tooling — saved Vite dev server config to `.claude/launch.json`

Added a launch.json describing the project's only dev server (`bun run dev` on port 5173) so Claude Code can start the preview consistently.

Files added: `.claude/launch.json`.

### Rebrand — "RetailSkillz Analytics" → "Retalio"

New brand name and logo across the app. `src/lib/branding.ts` now exports `APP_NAME = "Retalio"`, plus `APP_TAGLINE` and `BRAND_LOGO_SRC` so all surfaces share the same source of truth. `BrandLogo.tsx` swapped its hand-drawn SVG (cap + shield) for an `<img>` referencing the new `/retalio_logo.webp` asset; component is wrapped in `dir="ltr"` so the wordmark stays correctly oriented inside the RTL app, and the tagline font bumped to 15px to clear the design-system minimum. Updated browser tab title + favicon in `index.html`, the auto-generated promo report footer in `PromoFullReport.tsx`, the marketing email link on the landing page (`nadavg@retailskillz.online` → `nadavg@retalio.online`), the file header comment in `mock-promo-history.ts`, and the project description in `CLAUDE.md` + `context.md`. Typecheck clean.

Files modified: `src/lib/branding.ts`, `src/components/branding/BrandLogo.tsx`, `index.html`, `src/components/promo-simulator/PromoFullReport.tsx`, `src/routes/index.tsx`, `src/data/mock-promo-history.ts`, `CLAUDE.md`, `context.md`.

### Promo simulator — removed Editorial + Terminal alternate UI variants

User decided to keep just the canonical wizard. Deleted the two sibling routes (`promo-simulator-editorial.tsx`, `promo-simulator-terminal.tsx`) and their dedicated steppers (`StepperEditorial.tsx`, `StepperTerminal.tsx`). Removed the `AltDesignsStrip` from the canonical route so the "עיצובים נוספים" link bar no longer renders. Simplified `usePromoSimulator` to drop the `routePath` union argument — the hook now navigates only to `/category-manager/promo-simulator`. Tanstack regenerated `routeTree.gen.ts` with the alternates removed; typecheck clean.

Files removed: `src/routes/category-manager/promo-simulator-editorial.tsx`, `src/routes/category-manager/promo-simulator-terminal.tsx`, `src/components/promo-simulator/StepperEditorial.tsx`, `src/components/promo-simulator/StepperTerminal.tsx`.
Files modified: `src/routes/category-manager/promo-simulator.tsx`, `src/hooks/usePromoSimulator.ts`, `src/routeTree.gen.ts`.

---

## 2026-04-26

### Promo simulator — two alternate UI/UX variants (Editorial + Terminal)

Following the "design it twice" principle: spawned two radically different visual treatments of the same wizard at sibling routes, sharing all state/validation/step internals via the new `StepContent` extraction. Each treatment changes only the chrome — page background, fonts, stepper geometry, action-bar style — so a category manager can switch designs mid-flow and the URL search-param state persists.

- **Extracted `StepContent.tsx`** — pulls the 9-way step switch (with `BorderBeam` wrapping for steps 4–7, toggleable via `withBeam`) out of the route file. Original route now passes `state/setState/metrics/briefErrorKeys` and renders the same JSX as before. Net: original route shrank ~110 lines.
- **Variant A — `/category-manager/promo-simulator-editorial`** (`promo-simulator-editorial.tsx` + `StepperEditorial.tsx`). "Museum brochure / Economist longread" aesthetic. Parchment cream `#F4ECD8` background, deep-gold `#B68B2F` + ink `#1F1A14` accents, system Hebrew serif stack (`'David Libre', 'Frank Ruhl Libre', Georgia, ...`) on headings and the action bar, masthead with `Vol. I · גליון מבצעים` rubric. Stepper rendered as a horizontal Table-of-Contents with oversized 44px serif numerals, hairline ink rules, and a gold underline that sweeps in on the active step (no circles, no progress fill). Buttons are rounded-full pill outlines; the primary advance button is ink-on-cream uppercase tracked.
- **Variant B — `/category-manager/promo-simulator-terminal`** (`promo-simulator-terminal.tsx` + `StepperTerminal.tsx`). "Bloomberg console / brutalist developer tool" aesthetic. Bone `#EFEFE9` canvas with a 16px dotted grid via `radial-gradient`, monospace everywhere (`'Fira Code', SFMono-Regular, ...`), uppercase tracked labels, hot-lime `#B5F23F` active accent. Stepper is a vertical left rail using `[NN] ▸ STEP NAME` bracket notation with a blinking lime cursor on the active row, `$ promo --plan` prompt header. Buttons are `rounded-none` with 2px solid black borders and brutalist `4px 4px 0 #000` shadows; the primary advance button is lime-filled on commit.
- **Cross-linking**: original route gets a small `עיצובים נוספים:` strip above the wizard with two link buttons (one styled in editorial gold-on-cream, one in brutal black-shadow mono). Each variant has its own header strip linking back to default + sideways to the other variant. All three pass current `search` so wizard state persists across design switches.
- **Bugfix — variant routes were navigating back to default on every state change.** `usePromoSimulator`'s `setState` and `restart` previously hardcoded `to: "/category-manager/promo-simulator"`, so any URL write (clicking a step, advancing, or even editing a field on a variant) bounced the user back to the default route. Hook now takes an optional `routePath` argument typed as a union of the three simulator paths; each variant route passes its own. Default route omits the arg, falls back to the canonical path. Stepper jumps, prev/next, and restart now stay within the active variant.
- TanStack routeTree picked up both new routes automatically. Tests: 21 files / 146 tests still green; typecheck clean.

Files:

- new: `src/components/promo-simulator/StepContent.tsx`, `src/components/promo-simulator/StepperEditorial.tsx`, `src/components/promo-simulator/StepperTerminal.tsx`
- new: `src/routes/category-manager/promo-simulator-editorial.tsx`, `src/routes/category-manager/promo-simulator-terminal.tsx`
- modified: `src/routes/category-manager/promo-simulator.tsx` (uses `StepContent`, adds alt-designs link strip)

### Promo simulator — recolored Step 5 uplift chart (orange + blue)

`UpliftChart.tsx` (rendered inside `Step5Forecast`): swapped the two bar fills to the new palette per request — `COLOR_BASE` from teal `#0F766E` → blue `#159fe6` (בסיס bars), `COLOR_PROMO` from brand red `#DC4E59` → warm orange `#f18d62` (מבצע bars). Updated the matching `LegendChip` Tailwind dot classes (`bg-[#159fe6]`, `bg-[#f18d62]`) and softened the Recharts tooltip cursor fill from `rgba(220,78,89,0.04)` to `rgba(241,141,98,0.06)` so the hover tint matches the new promo color. The vertical accent rule on the card's start edge (driven by `COLOR_PROMO`) now reads orange to stay consistent with the bar; the cumulative line stays slate-ink dashed; the card's outer drop-shadow keeps its red tint.

### Promo simulator — editable end-date + vertical stepper

Step 1 (בריף) and the wizard chrome on `/category-manager/promo-simulator` got two ergonomic fixes.

- **End date is now a date picker, not a derived readonly field.** `Step1Brief.tsx` swapped the `READONLY_CLS` div for a `<input type="date">` bound to the existing computed end date (`startDate + durationWeeks*7`). On change, we re-compute `durationWeeks = (endDate − startDate) / 7` (fractional weeks allowed) and write that back through the slice setter, so downstream consumers (`Step5Forecast`, `UpliftChart`, `PromoFullReport`, URL codec) keep working unchanged. Input gets `min={startDate}` to block earlier picks. The `משך מבצע` Select is left in source as a JSX comment per the user's request — easy to re-enable later. Removed the now-unused `durationWeeksOptions` destructure.
- **Stepper is now a vertical sticky column on the right-of-content.** `Stepper.tsx` rewritten from horizontal sticky-top to a vertical `<ol>` inside a bordered card: vertical track line + animated gradient fill, 48px circles with the same active/done/todo color states, label sits next to each circle (RTL: circle right, label left). Route layout `routes/category-manager/promo-simulator.tsx` wraps the stepper + content in a `lg:grid-cols-[260px,1fr]` grid; the stepper aside is `lg:sticky lg:top-4` so it tracks scroll. The Live KPI panel (steps 4–7) was bumped from `lg:` to `xl:` breakpoint so it doesn't crush against the stepper at mid widths.
- Tests: 21 files / 146 tests still green; typecheck clean.

Files: `src/components/promo-simulator/Step1Brief.tsx`, `src/components/promo-simulator/Stepper.tsx`, `src/routes/category-manager/promo-simulator.tsx`.

### Promo video — added simulator showcase scene

Extended `promo-video/` Remotion composition `CategoryManagerPromo` to include a new 8s scene showcasing `/category-manager/promo-simulator?categoryManager=אבי+לוי`. Captured 4 fresh full-page screenshots via Playwright (against `netlify dev` on :8888), driving simulator state via URL params: brief intake (step 1), live KPI + forecast chart + AI advisor (step 5), analysis verdict (step 6), and the "תיק מבצע מוכן" success screen. New scene cross-fades through the four steps inside a browser-chrome mock with a Ken-Burns zoom, animated step-dots progress indicator, and a numbered Hebrew caption per step ("בריף — מי, מה, מתי", "תחזית חיה — KPIs ויועץ AI", "תחזית והערכה — כדאיות במבט", "תיק מבצע מוכן — שיתוף וארכיון"). Wired between `FeaturesScene` and `MobileShowcaseScene` with fade-in / slide-from-left transitions; bumped composition `durationInFrames` 900 → 1170 (39s @ 30fps). Re-rendered to `out/promo.mp4` (11.8 MB).

- New: `promo-video/src/scenes/SimulatorShowcaseScene.tsx`
- Updated: `promo-video/src/CategoryManagerPromo.tsx`, `promo-video/src/Root.tsx`
- New assets: `promo-video/public/screenshots/sim-step1-brief.png`, `sim-step5-forecast.png`, `sim-step6-analysis.png`, `sim-success.png`

### Monthly chart polish + division-manager consistency + map hover

Follow-up tweaks after issues #42–#46 landed: finished the monthly chart visuals that issue #43 left rough, fixed a domain inconsistency in the division-manager data, and added branch-name hover labels to the map.

- **`MonthlyComparisonChart` — custom tooltip, status dots, brighter bars.** The Recharts default tooltip was leaking Scatter X/Y entries into the popup (showing `NaNK₪` and a series mislabeled `2024`). Replaced it with a `MonthlyTooltip` component that reads everything from `payload[0].payload`, so the tooltip now shows month + year, current sales, last-year sales, target, and a verdict line in the status color (`מעל היעד +X%`, `על היעד ±X%`, or `מתחת ליעד -X%`). Bumped bar fill opacity from `33` (20%) to `80` (50%) so traffic-light differentiation reads at a glance, and added a 6px status dot on top of each bar via a hidden `<Scatter dataKey="current">` for an unmistakable verdict cue. Cursor hover-rectangle disabled.
- **`hadera-real.ts` — softened December target so the chart shows variation.** With the original `total.target = 9_920_000` the chart's growth multiplier was 1.060 (6%) — every Hadera month fell below 99% of that derived target, so all 11 visible bars rendered red. Lowered `total.target` to `9_300_000` (a defensive ~0.6% decline target) and updated `total.vsTarget` from `-0.2` to `+6.5` so the "מכירות סניף" KPI card stays consistent. Mirrored both fields on `network`. The chart now shows a realistic mix: 🟢 March, October · 🟡 June, July, September, November · 🔴 January, February, April, May, August.
- **`generators.ts` — `yoyGrowth` derived from `qualityScore`.** Before: `yoyGrowth` was an independent random draw, so a generated branch could land at quality 42 + growth +8% (domain-nonsense — bad service shouldn't grow). Now: `qualityBase = ((qualityScore - 40) / 55) × 14 - 6` mapped linearly into [-6%, +8%], plus ±3% noise from the existing seed. Low-quality branches genuinely decline, high-quality ones genuinely grow, and two same-quality branches still differ. The other independent draws (`complaints`, `customersPerDay`) are flagged as future correlation candidates but unchanged for now.
- **`BranchMarker.tsx` — branch name on map hover.** Added a `<Tooltip>` from `react-leaflet` (separate from the existing click-Popup) that shows the branch name in a small label above the dot on mouseover. Click still opens the full popup with sales / quality / growth — both behaviors coexist.
- **Removed `public/mockup-screen.png`** — unused asset.

### Fix #46: Ratify retail vocabulary in glossary + sweep UI labels + prompt vocab rules

Established canonical Hebrew retail vocabulary across glossary, store-manager UI, and the AI prompt so the dashboard speaks one language end-to-end (`פחת`, `חריגות`, `הוצאות שכר`).

- **Glossary** — added a `## Hebrew vocabulary — canonical retail terms` section to `context.md` with five entries, each pairing the canonical term with the alias it replaces and a short definition: `פחת` (replaces `בזבוז`), `חריגות` (replaces `סטיות`), `למול` (replaces `לעומת`), `הוצאות שכר` (replaces `עלות שכר`), `שיעור הוצאות שכר מהמחזור` (replaces `אחוז עלות שכר`).
- **UI sweep — store-manager scope only**:
  - `src/components/store-manager/charts/BranchPerformanceCard.tsx` — `אחוז עלות שכר` → `שיעור הוצאות שכר`
  - `src/components/store-manager/charts/AlertsTargetsCard.tsx` — `אחוז עלות שכר` → `שיעור הוצאות שכר`
  - `src/components/store-manager/views/HRView.tsx` — `עלות שכר` → `הוצאות שכר`, `עלות שכר בש״ח` → `הוצאות שכר בש״ח`
  - `src/routes/store-manager/$branchId.tsx` — `בזבוז בשר` → `פחת בשר`
- **Test update** — `AlertsTargetsCard.test.tsx` assertion updated from `אחוז עלות שכר` to `שיעור הוצאות שכר`.
- **AI prompt** — added an `אוצר מילים קנוני` block to `STORE_SYSTEM_PROMPT` instructing the model to prefer `פחת` over `בזבוז`, `חריגות` over `סטיות`, `למול` over `לעומת`, and to frame salary as `הוצאות שכר בשיעור של X% מהמחזור` rather than raw `עלות שכר`.
- **Out of scope** — vocabulary sweep is intentionally limited to `store-manager/`. Other surfaces (`category-manager/`, `promo-simulator/`) are unchanged and will be swept when they're touched.

### Fix #45: Add `subActions` field end-to-end (schema → prompt → renderer)

AI recommendations with multiple discrete sub-steps now render as scannable bulleted lists; recommendations without sub-steps render unchanged.

- **Schema** — added optional `subActions?: string[]` to `InsightRow` in `src/lib/ai/types.ts`. The Netlify function's `formatSSEItem` already spreads unknown fields, so the type addition makes it explicit without changing the transport.
- **Prompt** — added a `תתי-פעולות (subActions)` section to `STORE_SYSTEM_PROMPT`: when a recommendation has multiple discrete sub-steps populate the array (2–4 items recommended); when it's a single action, omit the field entirely (no empty arrays). Includes a worked example shaped like `{"recommendation":"להעמיק פעילות תחרותית במחלקת חלב","subActions":["פרסום בסביבת החנות","העמקת הנחות במוצרי משיכה","מבצעי סל"]}`.
- **Renderer** — `StoreAIBriefing.tsx` renders `subActions` as a `<ul>` with `list-disc` bullets under the recommendation text. Typography matches the design system: 16px, body color `#4A5568`, muted bullet markers, `ps-5` indent (RTL logical), `mt-2 space-y-1` spacing. When `subActions` is absent or empty, no extra markup is emitted — zero layout shift for existing recommendations. Sub-actions also stream via the existing `TypingText` so they animate in like the parent text.

### Fix #44: Generic `MiniStatTile` `breakdown` prop wired for פריון לשעת עבודה

The productivity tile in `BranchPerformanceCard` now exposes its full calculation always-visible — no hover, no click. Built as a generic mechanism so any future computed KPI can opt in.

- **`MiniStatTile`** gained an optional `breakdown?: { formula: string; steps?: string[] }` prop. When present, `steps` render as small mono-font lines beneath the value (15px, muted `#A0AEC0`) and `formula` as the final mono-font line (15px, body `#4A5568`). When absent, the tile renders identically — no extra markup, no layout shift. Exported `MiniStatTileBreakdown` type for consumers.
- **`BranchPerformanceCard`** wires `breakdown` only for the productivity tile, with `steps: ["{N} משרות × 22 ימים × 8 שעות = {totalHours} שעות"]` and `formula: "{totalSales} ÷ {totalHours} = ₪{productivity}/שעה"`. Other tiles (`% יישום משימות בEyedo`, `הכנסות למ"ר`, `אחוז עלות שכר`) are unchanged. Numbers formatted via `formatCurrencyShort` and `toLocaleString`.

### Fix #43: Monthly chart traffic-light bars + per-month target markers

The store-overview monthly sales chart now visually communicates target performance per month.

- **New pure module** `src/lib/monthly-targets.ts` — `deriveMonthlyTargets(months, annualTarget, annualLastYear)` annotates each `MonthlyDetail` row with a derived `target`, `vsTargetPercent`, and tri-state `status`. Per-month target = `lastYearSales × (annualTarget / annualLastYear)`, which preserves seasonality and sums to the annual target by construction. Degenerate inputs (zero target or zero lastYear) yield neutral rows.
- **New resolver** `getMonthlySalesColor({ actual, target })` in `src/lib/kpi/resolvers.ts` — three-band traffic light (`<99%` red, `99–101%` yellow, `>101%` green). Tighter than the generic `getSalesColor` because each month is a small slice of the annual goal.
- **`MonthlyComparisonChart`** now takes `annualTarget` and `annualLastYear` props, uses the derivation module to compute per-month targets/statuses, and colors each `<Bar>` via `<Cell>` based on the resolver. A small horizontal `<Scatter>` marker renders the target Y-value on each column. Existing last-year dashed line is unchanged. Axis/tooltip/legend font sizes bumped to the dashboard scale (16/18px) per CLAUDE.md.
- **`OverviewView`** wires `s.total.target` and `s.total.lastYear` through to the chart.
- **Tests** — TDD vertical slices: 7 tests for the derivation module (multiplier math, vs-target ratio, threshold boundaries 98.99/99/100/101/101.01, zero-target / zero-lastYear fallbacks, sum invariant within rounding tolerance) + 4 tests for the new resolver. Existing chart smoke test updated to pass the new required props. 142 tests passing.

### Fix #42: Lock four canonical subjects + force specificity in store AI prompt

Rewrote `STORE_SYSTEM_PROMPT` in `src/lib/ai/builders.ts` to mirror the strict-subjects pattern from `CHAIN_SYSTEM_PROMPT`. Every refresh of the store-overview AI insight now returns exactly four insights with locked verbatim subject names in fixed display order:
`עמידה ביעדי מכירות` → `ניהול מלאי` → `עלויות כוח אדם` → `איכות ותפעול`.

- Added a hard specificity rule forbidding generic phrasing (`נתח את מיקס המוצרים`, `בחן את הסניף`, `שפר את הביצועים`, `הסתכל על הנתונים`) — every recommendation must cite a named entity (department, category, supplier, month) drawn from the payload, or at minimum a concrete number.
- Added per-subject "what to cite" guidance: `עמידה ביעדי מכירות` → departments above/below target from `deptsByShare`/`anomalies`; `ניהול מלאי` → departments where stockout/פחת is concentrated; `עלויות כוח אדם` → store-level (turnover %, staffing gap), no department citation expected; `איכות ותפעול` → specific compliance items (`redAlerts`, `customerComplaints`, `missingActivities`, `returns`).
- No code paths or schemas changed; pure prompt-text edit. Tests + typecheck + build green.

### TDD policy added to CLAUDE.md

Added a `## Testing — TDD Required` section to CLAUDE.md spelling out red-green-refactor with vertical/tracer-bullet slices, the good-vs-bad-test distinction, the horizontal-slicing anti-pattern, and which behaviors to prioritize testing in this repo (KPI resolvers, period math, simulator state). Removed the experimental PreToolUse hook in `.claude/settings.json` that previously injected a "TDD GATE" reminder on edits to test files — CLAUDE.md is the source of truth here and is the only thing that crosses into the sandcastle Docker container, where Claude Code runs as a fresh install with no user-scoped skills or plugins. One place to read the rule, works everywhere.

### Husky hook hardening + ESLint cleanup

Mirrored the husky hook setup from `poker-league-hero` and tightened the lint gates. Pre-commit now runs `bunx lint-staged` (eslint --fix + prettier on staged files); pre-push runs `bun run typecheck && bun run test`.

- **`.husky/pre-commit`** simplified from `lint-staged + typecheck + test` to just `bunx lint-staged` (heavy checks moved to pre-push for faster commits).
- **`.husky/pre-push`** added with `bun run typecheck && bun run test`.
- **`.lintstagedrc`** now lints TS/TSX with `eslint --fix` in addition to prettier formatting.
- **`eslint.config.js`** — ignored `promo-video/**` (separate sub-project) and `src/routeTree.gen.ts`; configured `@typescript-eslint/no-unused-vars` to respect `_`-prefix convention; enabled `allowConstantExport` for `react-refresh/only-export-components` (cva variants); disabled the rule entirely for `src/routes/**` (TanStack Router file-based pattern).
- **`src/hooks/use-mobile.tsx`** — refactored from `useEffect`/`setState` to `useSyncExternalStore` (correct subscription model for `matchMedia`).
- **`src/components/dashboard/TimePeriodFilter.tsx`** — replaced effect-syncs-prop pattern with React's "store previous value during render" pattern. No more cascading renders.
- **`src/routes/category-manager/promo-simulator.tsx`** — same store-during-render refactor for the per-step `attempted` reset; dropped `useEffect`/`useRef` imports.
- Removed dead imports: `CategorySupplier` (CategorySuppliersDashboard), `AlertTriangle` (`$categoryId`), `getPeriodLabel` (category-manager index).
- Final lint state: 0 errors, 13 benign warnings (TanStack Table react-compiler hints + cva variant exports in shadcn ui files).

---

## 2026-04-23

### Promo Simulator — step reorder (Analysis → step 6) + "תחזית והערכה"

- **Reordered the 9-step wizard** so the Analysis step runs immediately after Forecast (step 5) instead of after Control. New order: 1 בריף → 2 מטרה → 3 סוג מבצע → 4 התניה והטבה → 5 יעדים/תחזית → **6 תחזית והערכה** → 7 יישום בשטח → 8 בקרה → 9 תיעוד. The quantitative arc (forecast → assess) now sits together before the operational checklist.
- **Step renamed** from "ניתוח והערכה" to "תחזית והערכה" — in the `STEPS` taxonomy array and in the inline section header inside the component.
- **Files renamed via `git mv`** (history preserved): `Step8Analysis.tsx → Step6Analysis.tsx`, `Step6Implementation.tsx → Step7Implementation.tsx`, `Step7Control.tsx → Step8Control.tsx`. Inner `function`/`interface`/`Props` identifiers renamed to match. Route imports + the `state.step === N` render switch rewired.
- `showLiveKpi` / `showNarrative` / `showStepBeam` ranges (4–7, 2–5, 4–7) unchanged — they still select the quantitative phases; with the reorder, Analysis (6) is now covered by the live-KPI panel and border beam (the most data-relevant context for it), while Control (8) is a pure readiness checklist without beam/KPI.

### Promo Simulator — page palette preview (less-pink warm neutral)

Targeted preview applied **only to the promo-simulator scope** (20 files in `src/components/promo-simulator/` + the route file). The rest of the app still uses the original warm palette so they can be A/B compared.

- Page bg `#FDF8F6` → `#FAF8F5` (warm off-white, no peach undertone)
- Borders `#FFE8DE` → `#E7E0D8` (warm beige, no salmon)
- Light fills `#FFF0EA` → `#F1EBE3` (warm cream)
- Section separators `#F5E6DE` → `#E7E0D8` (unified with borders)
- Card shadows `rgba(220, 78, 89, …)` → `rgba(30, 41, 59, …)` so the drop no longer bleeds the accent red into the surface
- Brand accent `#DC4E59` kept — still the single signal color. No CLAUDE.md palette change yet; that's a separate decision if the preview lands.

### Promo Simulator — UpliftChart color refactor (design-taste-frontend)

Rebuilt the Phase 5 forecast chart per the design skill (LILA ban, desaturated accents, no pale bars).

- **Dropped violet `#6C5CE7`** from cumulative line + dots (design-taste skill's explicit LILA ban).
- **Base bars** now `#0F766E` (deep desaturated teal) — complementary to the brand red, crisp and visible. No pale greys, no pink.
- **Promo bars** kept `#DC4E59` (brand accent).
- **Cumulative line** `#1E293B` (slate ink) with `strokeDasharray="6 4"`, dots `r=3.5` matching. Activates to `r=5` on hover.
- **Grid** softened to `rgba(30, 41, 59, 0.07)`, axes `#64748B`.
- Tooltip tightened: monospace font stack, slate drop-shadow, rounded-[12px], Hebrew direction, he-IL currency format.
- Default Recharts legend suppressed in favour of three **custom chip-style legend entries** in the card header (matches the simulator's chip vocabulary).
- Structural reshape: card uses a 3px accent rule on the RTL-start edge, bold `tracking-tight` title with uppercase caps-label above, diffusion shadow tinted to slate.

### Promo Simulator — terminology & copy fixes

- Renamed the "מבצע צלב-קטגוריה" promo type to "מבצע חוצה קטגוריות" — the "צלב" root literally means "cross" (as in the Christian cross) and was culturally awkward. Affected: `taxonomy.ts` (promo list + copy key), and the same terminology in `narrative.ts`. "שיעור ההצלבה" in the narrative body was replaced with the cleaner "שיעור הצירוף לסל".
- Shortened the `AINarrative` section title from "ניתוח AI — פרשנות יועץ" to "יועץ אישי" (a more direct label that reflects how the block reads across steps 2–5).

### Promo Simulator — remove "מותג פרטי" KPI (chain has no private label)

- Dropped the 5 `private-label` ("מותג פרטי") entries from `getCategoryKpis` in `src/data/mock-promo-history.ts` — affected categories: מכולת, נון-פוד, לחם ומאפים, תינוקות, אורגני ובריאות. Those categories now surface 5 KPIs each; the rest still carry 6. `BackgroundDataSheet`'s hero + compact-grid layout adapts automatically to the new count.

### Promo Simulator Step 1 — premium sheet refactor + read-only category manager

Applied the `design-taste-frontend` skill (DESIGN_VARIANCE=8, MOTION_INTENSITY=6, VISUAL_DENSITY=4) to both Step 1 side sheets, and converted the category-manager field from an editable input to a read-only display.

- **ArchiveSheet — full visual rebuild.** Replaced uniform-card layout with asymmetric bento: accent pill tag + big display title (`text-5xl tracking-tight leading-[1.05]`) on one side, meta chip on the other. Added an inline summary rail (`border-y`, no boxes) showing total / avg uplift / success rate in monospace tracking-tight. Historical promo rows now have a 3px vertical outcome-accent bar on the RTL-start edge (no full card tint), split into asymmetric stats: a huge monospace uplift number on one side, a `divide-x rtl:divide-x-reverse` 3-up stats row on the other (יחידות / פדיון / ROI — all `font-mono`). Metadata line is inline dots-separated (no stat boxes). Learnings moved from a grey box to a `border-s-2 border-[#DC4E59]/30` quoted blockquote with a `Quote` icon. Featured (first) promo gets a larger treatment (bigger display + bigger uplift). Buy-and-get tiles use a 2px top gradient stripe + inline condition→benefit pills. All cards have diffusion shadows (`shadow-[0_20px_40px_-24px_rgba(220,78,89,0.18)]`), spring hover lift (`whileHover={{ y: -2 }}`, stiffness 200 damping 22), and Framer Motion staggered entrance (stiffness 120 damping 22, 60ms stagger).
- **BackgroundDataSheet — asymmetric bento KPIs.** Same header treatment (accent pill + display title). Replaced the flat 3-column KPI grid with a bento: one Featured KPI with a hero treatment (`text-6xl font-mono`, "מדד מוביל" label, wider layout) + the remaining 5 KPIs in a responsive 2/3-col compact grid. All KPIs have a short vertical accent rule on the start edge in traffic-light color. Historical promos use the same `divide-x` 4-up stats row pattern as ArchiveSheet for consistency. Same staggered Motion orchestration.
- **Typography consistency**: monospace on every number, `tracking-tight` on displays, `uppercase tracking-[0.12em]` on stat labels (label/caps style), `leading-relaxed` on body, `max-w-[54ch]` on paragraphs.
- **Anti-AI-tells applied**: no 3-equal-card feature row (replaced with bento), no centered hero, no gradient text on headers, no neon glow (diffusion shadows only, tinted to accent).
- **Scroll + overflow**: both sheets use `h-screen max-h-screen overflow-y-auto p-0` with inner `px-8 pb-20 pt-10 md:px-12` so content breathes and the bottom never clips.
- **Category manager field is now read-only.** Removed the text input in favor of a readonly display (`READONLY_CLS`) — the manager is determined by the chosen category via `CATEGORY_MANAGERS` and should not be hand-edited. Shows a muted placeholder "ייבחר אוטומטית לפי הקטגוריה" until a category is picked.
- **Files:** `src/components/promo-simulator/ArchiveSheet.tsx`, `src/components/promo-simulator/BackgroundDataSheet.tsx`, `src/components/promo-simulator/Step1Brief.tsx`.

### Promo Simulator Step 1 — archive narrowed to promotions, data sheet scroll fix

Follow-up fixes to the Phase 1 rollout.

- **ArchiveSheet is now promotion-only.** Removed the 4-card YTD strip (YTD sales, YTD growth, chain growth, vs-chain) and the 12-month grouped bar chart (sales/target/last year) — those belonged to the category dashboard, not to an archive of past promotions. Dropped the now-unused Recharts imports and the `getCategoryYtdStats` call. The sheet now shows only: header + "מבצעים קודמים" list + "מבצעי קנה וקבל ברשת בקטגוריה" grid. Header title changed to "ארכיון מבצעים — {category}" and subtitle focuses on learnings from prior promos.
- **BackgroundDataSheet overflow fix.** The sheet was cut off at the bottom with no scroll reachable. Added `h-screen max-h-screen` to explicitly bind the sheet height to the viewport so `overflow-y-auto` has a concrete constraint to scroll against, plus `pb-16` so the last card isn't flush against the bottom edge. Same classes applied to ArchiveSheet for consistency.
- **Files:** `src/components/promo-simulator/ArchiveSheet.tsx`, `src/components/promo-simulator/BackgroundDataSheet.tsx`.

### Promo Simulator Step 1 — category manager, end date, archive/data sheets, format field

Phase 1 overhaul driven by a team of parallel agents (mock data + two sheet components). All 131 tests pass; typecheck clean.

- **Field rename: `salesOwner` → `categoryManager`.** Renamed across `BriefSlice`, `SimulatorState`, `SimulatorSearch`, URL codec (`decodeState`/`encodeState`/`validateSimulatorSearch`), validation, route, `PromoFullReport`, and test fixture. Label changed from "אחראי מכירות" to "מנהל קטגוריה". The field auto-populates based on the chosen category via `CATEGORY_MANAGERS` (hardcoded Hebrew names for all 14 categories). Still editable — the user can override.
- **End date field.** Added a read-only "תאריך סיום" display next to "תאריך התחלה". Dynamically computed as `startDate + durationWeeks * 7` via a local `computeEndDate` helper. Renders `dir="ltr"` in the warm readonly style.
- **Product no longer required.** Removed `product` from `missingFieldsForStep(1)`. Product select placeholder now reads "בחר מוצר — או השאר ריק לכל הסגמנט" and the label is suffixed with "(אופציונלי)". A manager can run a promo for a whole segment.
- **Format (פורמט) replaces Arena (זירה).** `SALES_ARENAS` updated from `["מאורגן", "פרטי", "On The Go"]` to `["שכונתי", "גדול", "כלל הרשת"]`. Label "זירה" → "פורמט" in Step1Brief, validation missing-fields, `Step9Documentation` table header, and `PromoFullReport` row. Test fixture updated.
- **Removed "מאגר ידע" card.** Info cards grid is now 2 columns. `BookOpen` import removed.
- **Archive & Data cards are clickable.** Both `ClickableInfoCard`s open full-width side sheets. Disabled (with explanatory copy) until a category is selected.
- **New `ArchiveSheet` component** (`src/components/promo-simulator/ArchiveSheet.tsx`). For the chosen category/product: 4 YTD KPI strip (YTD sales, YTD growth, chain YTD growth, vs-chain diff) colored via `getGrowthColor`; 12-month grouped Recharts bar chart (sales / target / last year) wrapped in `dir="ltr"`; historical promo cards (product-match first, then category) with type chip, date range, uplift colored via `getUpliftColor`, revenue/ROI/outcome badge, learnings text; buy-and-get section listing chain "קנה X קבל Y" promos involving the category.
- **New `BackgroundDataSheet` component** (`src/components/promo-simulator/BackgroundDataSheet.tsx`). For the chosen category: 6 KPIs in a responsive 1/2/3-col grid, each with label / value (status-colored) / trend arrow / delta / optional benchmark / description. Plus the first 2 historical promos with full stats strip (base→actual, uplift, revenue, ROI) and outcome badge + learnings.
- **New mock data module** (`src/data/mock-promo-history.ts`). 46 historical promotions across all 14 categories (mix of product-level and category-wide, varied outcomes), `CATEGORY_MANAGERS` map, `ytdStatsList` with realistic 12-month seasonality benchmarked against a 6.4% chain YTD growth, 32 buy-and-get promos, and `getCategoryKpis` returning 6 curated KPIs per category (fresh categories lean on waste/turnover; grocery on promo share/price index; etc.). Pure data file, no side effects.
- **Files:** `src/data/mock-promo-history.ts` (new), `src/components/promo-simulator/ArchiveSheet.tsx` (new), `src/components/promo-simulator/BackgroundDataSheet.tsx` (new), `src/components/promo-simulator/Step1Brief.tsx`, `src/lib/promo-simulator/state.ts`, `src/lib/promo-simulator/taxonomy.ts`, `src/lib/promo-simulator/validation.ts`, `src/components/promo-simulator/PromoFullReport.tsx`, `src/components/promo-simulator/Step9Documentation.tsx`, `src/routes/category-manager/promo-simulator.tsx`, `src/hooks/usePromoSimulator.test.ts`.

---

## 2026-04-19

### Promo Simulator — cascading Category/Segment/Product + per-step validation

Replaced the promo simulator's hardcoded segment list and free-text product input with a cascading Category → Segment → Product picker, and gated step advancement on per-step required-field validation. Aligned the simulator with the glossary's Department → Category → Item hierarchy (UI labels stay: קטגוריה / סגמנט / מוצר).

- **New mock taxonomy.** Seeded `src/data/mock-taxonomy.ts` with 3–8 Hebrew segments for every Department in `DEPARTMENT_NAMES` (14 departments, 68 segments). Exposes `getSegmentsByDepartmentId`, `getSegmentsByDepartmentName`, `findSegmentById`. Segment ids like `dairy-milk`, `grocery-coffee-tea` are used as the stored state value; Hebrew label is resolved on read.
- **Item catalogue expansion.** Retrofitted `src/data/mock-items.ts`: added `segmentId` to all existing 25 items and authored ~175 additional SKUs so every segment has 3–6 items. Added `getItemsByDepartment` and `getItemsBySegment`. All existing consumers (`HeroItemCards`) continue to work — the addition is purely additive.
- **Step 1 cascading dropdowns.** `Step1Brief` now: (a) filters Segment options by the chosen Department via `getSegmentsByDepartmentName`, (b) converts Product from a free-text `<input>` into a Select filtered by the chosen Segment, (c) disables Segment until Category is picked and Product until Segment is picked, with helpful placeholder copy. Downstream fields reset to empty on parent change (hard reset, handled in `setState`).
- **Per-step validation library.** New `src/lib/promo-simulator/validation.ts`: `missingFieldsForStep`, `isStepValid`, `earliestIncompleteStep`. Required per matrix — step 1: category, segment, product, salesArena, startDate, durationWeeks, salesOwner · step 2: goal · step 3: promoType · step 4: conditionText, benefitText, unitPrice>0, unitCost>0, discountPct>0 · step 5: baseUnits>0, upliftPct>0, stockUnits>0. Steps 6–9 are skippable by product decision.
- **Gated navigation.** `usePromoSimulator.goNext()` refuses to advance when the current step has missing fields. `canJumpToStep` blocks forward Stepper jumps past the earliest incomplete step (backward jumps stay free). Hook now also exposes `missingFields` and `currentStepValid`.
- **Invalid-state UI.** המשך button renders visually disabled with greyed styling when the current step is invalid, and a rose-red helper line appears under it listing the missing fields in Hebrew (`חסר למילוי: …`). Clicking the disabled-looking button (or attempting a forward stepper jump) reveals per-field rose-red borders on Step 1's empty required fields via an `errorKeys` prop; errors auto-clear on step change.
- **Terminology alignment.** `PromoFullReport` and `Step9Documentation` now resolve stored `segmentId` → Hebrew label via `findSegmentById` when rendering the summary rows.
- **Tests.** Updated `usePromoSimulator.test.ts` to assert the new forward-jump blocking contract (blocks past earliest-incomplete; allows jumps once every prior required step is valid). All 131 tests pass.
- **Files:** `src/data/mock-taxonomy.ts` (new), `src/data/mock-items.ts`, `src/lib/promo-simulator/validation.ts` (new), `src/lib/promo-simulator/taxonomy.ts`, `src/lib/promo-simulator/state.ts` (unchanged — Segment type broadened via `taxonomy.ts`), `src/contexts/PromoTaxonomyContext.tsx`, `src/hooks/usePromoSimulator.ts`, `src/hooks/usePromoSimulator.test.ts`, `src/components/promo-simulator/Step1Brief.tsx`, `src/components/promo-simulator/PromoFullReport.tsx`, `src/components/promo-simulator/Step9Documentation.tsx`, `src/routes/category-manager/promo-simulator.tsx`.

---

## 2026-04-18

### Category-manager page — full premium design pass (design-taste-frontend)

Applied the `design-taste-frontend` skill (DESIGN_VARIANCE=8, MOTION_INTENSITY=6, VISUAL_DENSITY=4) across the entire `/category-manager` page. Coordination done in-session; four parallel `frontend-developer` subagents executed the per-tab bundles (see separate entries below). This umbrella entry covers the in-session coordination work.

- **HeroBanner — full structural rewrite.** Replaced the prior centered layout + scattered text-shadow contrast hacks with an **asymmetric split-screen grid** (`grid-cols-[minmax(0,1fr)_clamp(420px,42%,540px)]`): solid dark content panel (`#0F172A`) on the RTL-start side + image zone with glassmorphic gauge overlay on the RTL-end side. Contrast is now structural — text always sits on opaque surface, no text-shadow hacks, no opacity conditionals. Stat pills became inline divided stats (`divide-x divide-white/10`, `font-mono` values) — anti-card-overuse. Live pill got liquid-glass treatment (inner border + inset highlight + pulsing ring via `box-shadow` animation). Mobile collapses to single column (image top / content below). Gauge wrapped in a radial-gradient glass container with `shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]`. Spring physics throughout (`stiffness: 90–140, damping: 18–20`). Neutral dark palette (no purple/red tint); single accent `#DC4E59` preserved only on the CTA per CLAUDE.md.
- **Tabs strip — single-accent underline segmented control.** Killed the four pastel active colors (`#2EC4D5` / `#6C5CE7` / `#F6B93B` / `#DC4E59` — classic AI-tell rainbow palette) in favor of a single `#DC4E59` animated underline. Each `TabsTrigger` is now transparent-bg with a `::after` pseudo-element `h-[2px] bg-[#DC4E59]` that scales from 0 → 1 on active via `cubic-bezier(0.16,1,0.3,1)`. Text: active `#2D3748`, inactive `#A0AEC0`. Lucide icons at `strokeWidth={2}` consistently. Tabs sit on a `border-b border-[#FFE8DE]` instead of a `bg-[#FDF8F6]` pill container.
- **Orphan paragraph removed.** The standalone "כל המדדים מוצגים ביחס ליעד" line above `KPIGaugeRow` was moved into `KPIGaugeRow` as an internal section header (with a `Target` icon + traffic-light legend — handled by the above-the-fold-strip agent).
- **PromotionDailyChart — Recharts API fixes** (post-agent). The Promotions-tab agent used two incorrect Recharts 3 APIs: (a) `TooltipProps<number, string>` with direct `payload`/`label` destructuring — replaced with a local `ChartTooltipProps` interface matching the actual shape Recharts passes to content renderers; (b) `<Area baseLine={number[]}>` to shade between actual and baseline — Recharts' `baseLine` expects `NullableCoordinate[]`, not `number[]`, and doesn't render the intended effect. Replaced with Recharts' native stacking: two `<Area>` components sharing `stackId="uplift-stack"` — invisible `baseline` area as base + visible `uplift` area on top with `fill="rgba(220,78,89,0.16)"`. Uplift region now renders correctly between baseline and actual curves. Build + typecheck green.
- **Files:** `src/components/dashboard/HeroBanner.tsx`, `src/routes/category-manager/index.tsx`, `src/components/charts/PromotionDailyChart.tsx`

### Categories tab bundle — premium design refactor (DESIGN_VARIANCE=8)

Redesigned all five components in the Categories tab with asymmetric layouts, spring physics, anti-card patterns, and perpetual micro-motion. Zero TypeScript errors, public prop APIs unchanged.

- **SectionHeader** — accent rule thickened to 3px, icon bg opacity bumped to 14%, subtitle line-height tightened, spring entry preserved. `title/subtitle/icon/accentColor` props intact.
- **CategorySpotlight** — replaced equal 4-card grid with asymmetric bento: 1 hero card (parallax-tilt on hover, perpetual shimmer on sales figure via CSS `sales-shimmer` keyframe) + 3 supporting cards as a `divide-y` divided list inside a single container. Hero is `md:col-span-1` wide (2/3), supporting column is 320px fixed. Staggered entry with `stiffness:100 damping:20` springs.
- **CategoryDonut** — removed `Card` wrapper (breathes on page surface). Replaced rainbow CHART_COLORS palette with single-accent scheme (`#DC4E59` primary + desaturated grey scale). Added center total sales (`font-mono`) + YoY delta. Custom `divide-y` legend with staggered fade-in. Added `<div dir="ltr">` wrapper around SVG per Recharts convention.
- **HeroItemCards** — `vertical={true}` (Categories sidebar): divided rail list inside single container with header strip, no per-item card boxes. `vertical={false}` (grid mode, other routes): cards with 2px accent top bar replacing 1px bar. Both modes use hover accent strip (`inset boxShadow` on rail rows, `y:-2` on cards). Image paths `/hero/stockout-meat.jpg` / `/hero/top-sales-cola.jpg` / `/hero/promo-tissue.jpg` preserved. `vertical` prop behavior fully preserved.
- **CategoryPerformanceTable** — removed `Card` wrapper, table breathes on page surface with own `rounded-[16px] border border-[#FFE8DE]` container. Headers: `text-[15px] uppercase tracking-[0.08em] text-[#A0AEC0]`. Sort chevrons: spring rotate animation via `motion.span`. Row #1: perpetual faint `row-shimmer` gradient (6s infinite). Row hover: `inset -2px 0 0 #DC4E59` box-shadow accent strip (RTL start) + `bg-[#FDF8F6]` cells. Gross margin column colored via `getSalesColor`. Staggered row entry springs.

**Files:** `src/components/dashboard/SectionHeader.tsx`, `src/components/dashboard/CategorySpotlight.tsx`, `src/components/dashboard/CategoryDonut.tsx`, `src/components/dashboard/HeroItemCards.tsx`, `src/components/tables/CategoryPerformanceTable.tsx`

### Suppliers tab bundle refactor — SuppliersTable, SupplierSpotlightCards

- `SuppliersTable` — dropped Card/CardContent wrapper entirely; table breathes directly on the page. Header: `text-[15px] uppercase tracking-[0.08em] text-[#A0AEC0]`, no background. `divide-y divide-[#FFF0EA]`, no vertical cell dividers. Logo cells: 40×40 `rounded-[12px]` with `border border-[#FFE8DE]` (rectangle, not circle). Top supplier row (#1 by sales, unsorted state): perpetual `motion.animate` shimmer (`opacity: [0.04, 0.08, 0.04]`, 5s infinite) + permanent 2px `#DC4E59` inline-end accent strip. All other rows: 2px accent strip + `bg-[#FDF8F6]` on hover via Tailwind group. `vs-target` column colored via `getSalesColor({ actual, target })`, margin column via `getMarginColor({ marginPercent })`. Sales bar: spring physics (`stiffness: 100, damping: 20`), staggered 0.04s. `ActiveSortIcon` promoted to module scope to satisfy `react-hooks/static-components`. Pagination page indicator switched from amber to `#DC4E59` (single accent). Spring row entry with 0.06s stagger.
- `SupplierSpotlightCards` — replaced 3-equal-card layout with asymmetric hero + 2 capsule rows. Hero card (most profitable supplier): 56×56 logo with perpetual slow glow (`opacity: [0, 0.15, 0]`, 4s), name + headline metric stack, `MiniSparkline` at bottom, soft shadow `shadow-[0_10px_30px_-15px_rgba(220,78,89,0.15)]`, 3px accent top-bar, rounded-[16px]. Supporting entries: pure `divide-y divide-[#FFF0EA]` rows with no individual boxes — 32×32 logo, title + supplier name, accent icon + single headline metric. All colors from KPI resolvers (`getSalesColor`, `getMarginColor`). Spring stagger: hero 0.1s, capsules 0.22s / 0.28s. `m` prop removed from `CapsuleRow` since capsules show % not formatted currency.
- **Files:** `src/components/tables/SuppliersTable.tsx`, `src/components/dashboard/SupplierSpotlightCards.tsx`

### Promotions tab bundle refactor — PromotionDailyChart, PromotionsTable

- `PromotionDailyChart` — dropped Card wrapper; slim `rounded-[16px]` bordered frame. Chart header replaced with compact 3-line block (promo type + days label in muted uppercase, bold promo name, muted product name) — no screaming H1. Custom `ChartTooltip` component: warm-white card with `border-[#FFE8DE]`, thin `#DC4E59` top-accent bar, `font-mono` values at `text-[18px]`, uplift delta row. Uplift area fill added between actual and baseline using `<Area>` with `rgba(220,78,89,0.16)`. Horizontal-only gridlines (`vertical={false}`), axes with `tickLine: false`, `axisLine: { stroke: '#FFE8DE' }`, `fontSize: 16`. `<ReferenceDot>` at peak-uplift day renders a custom `PeakDot` with Motion-animated pulse ring. Custom inline legend with SVG dashed-line swatch and `font-mono` series total. `animationDuration={900}` on both lines. Spring-physics entry on container. Height `h-[280px] md:h-[340px]`.
- `PromotionsTable` — dropped Card/CardHeader/CardContent entirely; bare `<table>` on page surface. Header: `text-[15px] uppercase tracking-[0.08em] text-[#A0AEC0] font-medium`, no background. `divide-y divide-[#FFF0EA]`, no vertical dividers. Selected row: 2px `border-s-[#DC4E59]` leading strip + `bg-[#FDF8F6]` tint; non-selected hover same but transparent strip. Staggered spring row entry (`stiffness: 130, damping: 20`, 0.04s delay between rows). `PromoTypePill` component: soft pill with per-type color pair (violet/sky/amber/emerald/rose), `rounded-[20px]`. Uplift colored via `getUpliftColor` resolver. ROI `font-mono font-bold` when positive. Heuristic cannibalization warning chip (`upliftPercent > 50 && roi < 2.5`) with `AlertTriangle` Lucide icon, `rounded-[20px]`, `bg-rose-50 text-rose-700`. All numeric values `font-mono`, body `text-[18px]`.
- **Files:** `src/components/charts/PromotionDailyChart.tsx`, `src/components/tables/PromotionsTable.tsx`

### Above-the-fold strip redesign — ChainAIBriefing, QuickStatCards, KPIGaugeRow

- `QuickStatCards` — replaced 4-equal-card grid with a bento layout: hero stat block (לקוחות יומי, larger with gradient icon tile) on the start side + 3 supporting stats (divided `sm:divide-x` rail) on the end. Single surface, no per-stat card box. Spring entry with staggered delays. All numeric values `font-mono`, font sizes ≥15px.
- `KPIGaugeRow` — absorbed the "כל המדדים מוצגים ביחס ליעד" paragraph (removed from the route) as an internal section header with a Target icon and traffic-light legend. First gauge rendered at `primary` size (108px, stroke 9) for visual rhythm; remaining four at `supporting` size (80px, stroke 7). Gauge arcs now use spring physics (`stiffness: 60, damping: 18`) instead of linear duration. Each KPI routes to its correct semantic resolver: `getMarginColor` for gross margin, `getSupplyColor` for shelf availability, `getQualityColor` for quality score, `getSalesColor` for basket and promo sales. Perpetual ambient glow uses `animate({ opacity })` — transform+opacity only, no neon box-shadow.
- `ChainAIBriefing` — RTL-direction top accent strip (gradient `270deg`, flows right→left). Shimmer skeleton extracted to `ShimmerRow` component with staggered `divide-y` dividers instead of `space-y`. Streaming dots converted from CSS `animate-bounce` to `motion.span` spring loops with staggered delays. Row exit animation added (`AnimatePresence exit`). All spring transitions use `stiffness: 100, damping: 20`. Perpetual pulse dot uses `opacity` + `boxShadow` animation (no `scale` layout thrash). Status badge pulsing dot uses tighter `scale: [1, 0.75, 1]`. No API changes on any component.
- **Files:** `src/components/dashboard/ChainAIBriefing.tsx`, `src/components/dashboard/QuickStatCards.tsx`, `src/components/dashboard/KPIGaugeRow.tsx`

### Category-manager hero — background image

- `HeroBanner` gained an optional `backgroundImage?: string` prop. When provided, the image is rendered as a `bg-cover bg-center` layer under the gradient, and the gradient switches to a neutral dark-slate overlay (`rgba(17,24,39,0.70) → rgba(45,55,72,0.55)`) so white text and the gauge stay readable without red tinting. When omitted, the original dark→red gradient behaviour is unchanged — no regression for other consumers.
- `/category-manager` passes `backgroundImage="/hero/category-manager.png"` (asset in `public/hero/`).
- **Files:** `src/components/dashboard/HeroBanner.tsx`, `src/routes/category-manager/index.tsx`, `public/hero/category-manager.png` (new)

### Ubiquitous Language — shared domain glossary

- New `context.md` at repo root: a DDD-style glossary of the retail analytics domain. Defines canonical terms, organizational hierarchy (**Chain → Region → Branch → Department → Category → Item**), roles (**Store Manager**, **Region Manager**, **Category Manager**), metrics, alerts, HR, and aliases to avoid. Includes a dev ↔ domain-expert example dialogue and a "Flagged ambiguities" section calling out known code debt (current `DepartmentMetrics` / `CategorySummary` types actually describe Departments; Category as a sub-level under Department is not yet modelled; "Region" is canonical, "Division" is banned in new code).
- `CLAUDE.md` already references `context.md` (added in an earlier commit this day).
- **Files:** `context.md` (new)

### Sandcastle prompt — use /update-docs-and-commit

- `.sandcastle/prompt.md` step 4d now instructs the Sandcastle agent to commit by invoking the `/update-docs-and-commit` slash command (which updates `changelog.md` + stages + commits in one step), instead of hand-rolling `git commit` and separately editing `changelog.md`. The rule that commit messages reference the issue number (e.g. `Fix #13: ...`) is preserved. Step 5 (the separate changelog instruction) was removed as redundant.
- **Files:** `.sandcastle/prompt.md`

### Domain-typed KPI color resolvers (#40)

- Replaced the four generic color helpers (`getKpiStatusColor`, `getTargetStatusColor`, `getDeltaStatusColor`, `getMarginColor`) with one resolver per KPI domain. Thresholds and direction now live inside the resolver whose name matches the KPI's meaning; call sites no longer pass `lowerIsBetter` or `deadBand` flags.
- New `src/lib/kpi/` module:
  - `types.ts` — input shapes: `SalesKPI`, `CostKPI`, `QualityKPI`, `MarginKPI`, `SupplyKPI`, `BasketKPI`, `PromotionKPI`, `GrowthKPI`, `CostDeltaKPI`, `ProgressKPI`, `UpliftKPI`, `StatusKPI`.
  - `resolvers.ts` — `getSalesColor`, `getCostColor`, `getQualityColor`, `getMarginColor`, `getSupplyColor`, `getPromotionColor`, `getUpliftColor`, `getProgressColor`, `getGrowthColor`, `getBasketColor`, `getCostDeltaColor`, `getStatusColor`. Each returns a color from the shared `KPI_STATUS` palette (or `PALETTE.muted` for a zero target).
  - `resolvers.test.ts` — 35 tests covering every threshold boundary per domain.
- `src/lib/colors.ts` trimmed to just the design-system constants (`KPI_STATUS`, `PALETTE`, `CHART_COLORS`, `GRADIENT_PRESETS`). The old `colors.test.ts` is gone — its coverage moved to `resolvers.test.ts`.
- `KPICardData` swapped its `lowerIsBetter?: boolean` field for a `domain?: 'sales' | 'cost'` discriminator; `KPICard` routes internally to `getSalesColor` + `getGrowthColor` (default) or `getCostColor` + `getCostDeltaColor`. All KPI-card callers updated.
- `AlertsTargetsCard` rows swapped `lowerIsBetter` flags for a `domain: 'sales' | 'cost'` field on each row.
- `BigGauge` in `HeroBanner` and `DarkGauge` in `KPIGaugeRow` now accept `{ actual, target }` instead of a pre-computed ratio, so the gauge color stays in sync with a single domain resolver.
- Promo-simulator: `LiveKPIPanel`, `Step5Forecast`, `Step7Control` migrated. `statusRatio(PromoStatus)` helper in `calc.ts` removed — status now maps directly to `getStatusColor({ status: 'green' | 'yellow' | 'red' })`.
- `CLAUDE.md` Design System section updated — "KPI status colors must come from a domain-typed resolver in `src/lib/kpi/resolvers.ts`" (replaces the old pointer to `getKpiStatusColor`).
- All 130 vitest tests pass; `tsc --noEmit` clean; `bun run build` clean; lint count unchanged at 39 errors + 3 warnings (same baseline as post-#39).
- **Files:** `src/lib/kpi/types.ts`, `src/lib/kpi/resolvers.ts`, `src/lib/kpi/resolvers.test.ts` (new); `src/lib/colors.ts` (trimmed), `src/lib/colors.test.ts` (deleted); `src/data/types.ts` (KPICardData); `src/components/dashboard/{HeroBanner,KPIGaugeRow,FormatsOverview,KPICard,CategoryDonut,CategorySpotlight,HeroItemCards}.tsx`; `src/components/charts/{CategoryBubbleChart,DepartmentBarChart,QualityGauge}.tsx`; `src/components/tables/BranchRankingTable.tsx`; `src/components/map/BranchMarker.tsx`; `src/components/store-manager/TargetBars.tsx`; `src/components/store-manager/charts/{AlertsTargetsCard,OverviewDepartmentBars,OverviewExpenseTable,BranchPerformanceCard}.tsx`; `src/components/promo-simulator/{LiveKPIPanel,Step5Forecast,Step7Control}.tsx`; `src/lib/promo-simulator/calc.ts`; `src/routes/category-manager/$categoryId.tsx`; `src/components/store-manager/views/{HRView,AlertsView,InventoryView}.tsx`; `CLAUDE.md`.

### AI engine deepening — Ports & Adapters + useAIInsight (#39)

- Three per-surface hooks (`useAIAnalysis`, `useCategoryAIAnalysis`, `useChainAIAnalysis`) collapsed into one generic `useAIInsight(build, options?)`. Each surface now calls a small builder (`buildStoreInsight`, `buildCategoryInsight`, `buildChainInsight`) to produce an `AIBuildResult<TPayload>` — cache key + payload + system prompt + user prompt — and hands that to the hook. Zero duplicated SSE-parsing, cache-management or AbortController lifecycle left.
- New `src/lib/ai/` module boundary:
  - `types.ts` — `InsightRow`, `AIInsightResult`, `AIPhase`, `AIBuildResult<TPayload>`, `AIBuilderId`.
  - `transport.ts` — `AITransport` port + `httpSseTransport` (production fetch/SSE adapter) + `createInMemoryTransport({ chunks, error?, delayMs? })` (test adapter that yields pre-canned SSE chunks deterministically).
  - `cache.ts` — `AICachePort` + `localStorageCache` (delegates to the existing `ai-cache.ts` module so keys stay compatible) + `createInMemoryCache()`.
  - `anomalies.ts` — single source of truth for anomaly detection. Exposes `detectDepartmentAnomalies(departments, storeYoy)` (typed `AnomalyResult[]` for UI), `detectCategoryAnomalies(input)` and `detectChainAnomalies(input)` (string arrays for the prompts). The three builders consume these helpers; inline anomaly logic in `ai.ts` / `category-ai.ts` / `chain-ai.ts` is gone.
  - `builders.ts` — registry of the three `AIBuildResult` producers. System prompts live here with their builder.
  - `engine.ts` — `runAIInsight({ build, transport, cache, signal, useCache?, onPhase?, onRows?, onError? })`. The only place that knows how to parse SSE, accumulate rows, and decide what goes in the cache.
- Briefing UI components (`StoreAIBriefing`, `CategoryAIBriefing`, `ChainAIBriefing`) updated to consume `InsightRow` from `@/lib/ai/types` and call `useAIInsight(buildXxxInsight(...))`. Store views now live at `views/OverviewView.tsx` + `views/AIView.tsx`.
- Tests: `engine.test.ts` covers the full lifecycle via `createInMemoryTransport` (success, cache hit short-circuit, retry bypassing cache, transport error, inline SSE error, empty stream, mid-stream abort). `anomalies.test.ts` covers all three detectors as pure functions. `builders.test.ts` asserts the boundary contract (cache key shape, JSON-serializable payload, prompts non-empty). All 120 vitest tests pass.
- Files deleted: `src/hooks/useAIAnalysis.ts`, `src/hooks/useCategoryAIAnalysis.ts`, `src/hooks/useChainAIAnalysis.ts`, `src/lib/ai.ts`, `src/lib/category-ai.ts`, `src/lib/chain-ai.ts`, `src/components/store-manager/AIBriefingCard.tsx`, `src/components/store-manager/AIRecommendations.tsx` (dead code from the pre-JSONL era).
- Netlify function at `netlify/functions/ai-analyze.ts` unchanged — the production transport still hits the same endpoint with the same body shape.
- Zero new lint errors (still at 39, same as post-#38 baseline); `bun run build` clean.
- **Files:** `src/lib/ai/types.ts`, `src/lib/ai/cache.ts`, `src/lib/ai/transport.ts`, `src/lib/ai/anomalies.ts`, `src/lib/ai/builders.ts`, `src/lib/ai/engine.ts`, `src/lib/ai/anomalies.test.ts`, `src/lib/ai/builders.test.ts`, `src/lib/ai/engine.test.ts` (all new), `src/hooks/useAIInsight.ts` (new), `src/hooks/useStoreReport.ts` + `src/hooks/useStoreReport.test.ts` + `src/components/store-manager/charts/DepartmentBreakdown.tsx` + `src/components/store-manager/charts/__tests__/mocks.ts` + `src/components/store-manager/views/DepartmentsView.tsx` + `src/components/store-manager/StoreAIBriefing.tsx` + `src/components/store-manager/views/OverviewView.tsx` + `src/components/store-manager/views/AIView.tsx` + `src/components/dashboard/CategoryAIBriefing.tsx` + `src/components/dashboard/ChainAIBriefing.tsx` (migrated imports), 8 files deleted.

### Ubiquitous Language — shared domain glossary

- New `context.md` at repo root — a DDD-style ubiquitous language glossary for the retail analytics domain. Defines canonical terms, organizational hierarchy (**Chain → Region → Branch → Department → Category → Item**), roles (**Store Manager**, **Region Manager**, **Category Manager**), metrics, alerts, and aliases to avoid. Includes a dev ↔ domain-expert example dialogue and a "Flagged ambiguities" section calling out known code debt.
- Key clarifications baked in: Departments exist at both chain scope (taxonomy) and branch scope (physical floor area); Categories (e.g. _Cheese_, _Milk_) are sub-units inside a Department (e.g. _Dairy_) and are not yet modelled in code — today's `DepartmentMetrics` / `CategorySummary` actually describe Departments. **Region** is canonical; "Division" is banned in new code (the `/division-manager` URL is kept only for URL stability).
- `CLAUDE.md` now has a **Ubiquitous Language** section near the top linking to `context.md`, so the agent reads the glossary before writing domain code or copy.
- **Files:** `context.md` (new), `CLAUDE.md`

### Store-manager extraction — chart components + useStoreReport (#38)

- The 1453-line store-manager route monolith is now a 112-line layout shell. All inline chart and view logic moved out to `src/components/store-manager/{charts,views}/`.
- 10 chart components extracted under `src/components/store-manager/charts/`: `MonthlyComparisonChart`, `DepartmentBreakdown`, `StaffingSection`, `BranchPerformanceCard`, `OverviewExpenseTable`, `OverviewDepartmentBars`, `AlertsTargetsCard`, `OverviewStaffingCard`, `InventoryByDepartmentChart`, `DepartmentMoversCard` (the last two were previously inline inside the Inventory/Departments views). Shared `BAR_GRADIENTS` palette moved to `charts/bar-gradients.ts`.
- 6 view components extracted under `src/components/store-manager/views/`: `OverviewView`, `InventoryView`, `HRView`, `DepartmentsView`, `AlertsView`, `AIView`. Each accepts a typed slice of the report as props — never the raw `BranchFullReport` where a narrower type suffices.
- New `useStoreReport(branchId)` hook in `src/hooks/` owns data fetch (`getBranchReportOrFallback`) + anomaly detection (`detectAnomalies`) in two memoized steps. Views consume `{ report, anomalies }` directly — the route no longer runs anomaly detection inline.
- New shared `MiniStatTile` under `src/components/store-manager/` — one source of truth for the label + value + optional subtitle/accessory pattern that used to be copy-pasted across `BranchPerformanceCard` and other KPI tile groupings.
- Per-chart tests live under `src/components/store-manager/charts/__tests__/` — each chart is rendered via `renderToString` (react-dom/server, no new test-library dependency needed) with mock data, and asserts key data points appear in the output. `useStoreReport.test.ts` covers the hook's pure-compose wiring against known + unknown branch ids.
- `vitest.config.ts` now also picks up `.test.tsx` files (previously only `.test.ts`).
- Visual + functional parity preserved: every `?view=overview|inventory|hr|departments|alerts|ai` renders identically; branch switching still works; no color/font/spacing changes.
- Lint went from 53 errors → 39 errors (zero new errors; the refactor eliminated 14 `react-refresh/only-export-components` errors from the old monolithic route).
- **Files:** `src/hooks/useStoreReport.ts` (new), `src/hooks/useStoreReport.test.ts` (new), `src/components/store-manager/MiniStatTile.tsx` (new), `src/components/store-manager/charts/` (10 new chart files + `bar-gradients.ts` + 10 `__tests__/*.test.tsx` + `__tests__/mocks.ts`), `src/components/store-manager/views/` (6 new view files), `src/routes/store-manager/index.tsx` (rewritten, 1453 → 112 lines), `vitest.config.ts`

### Branch report adapter — getBranchReport(branchId) (#37)

- New `getBranchReport(branchId)` boundary in `src/data/` is the single entry point for fetching a `BranchFullReport`. Hadera returns the curated real report verbatim; synthetic branches are inflated from the flat `Branch` shape using deterministic seeded helpers. `getBranchReportOrFallback(id)` is the non-nullable variant used by the route.
- Deleted `branchToFullReport` (and its ~90 lines of inline seed helpers + mock Hebrew name tables) from `src/routes/store-manager/index.tsx`. The route now calls `getBranchReportOrFallback(selectedBranchId)` and doesn't know how the inflation works.
- `generateBranch()` is now parametric — takes a `GenerateBranchTemplate` object (`{ id, name, branchNumber, regionId, lat, lng, seed, scale?, format?, baseSeed? }`) instead of 8 positional args with an implicit Hadera dependency. `baseSeed` defaults to `HADERA_BRANCH_SEED`; callers can swap in any `Branch`. All randomness flows through a seeded PRNG (`src/data/rng.ts`), so generation is now fully deterministic — `Math.random()` is gone from the data layer.
- Renamed `src/data/hadera-branch.ts` → `src/data/hadera-seed.ts` and renamed the export `haderaBranch` → `HADERA_BRANCH_SEED` to make the dual role (real-data Branch + seed template) explicit. The file is not deleted because `mock-branches.ts` still needs the Hadera Branch as an `allBranches` entry, not just as a seed.
- `mock-branches.ts` now declares each synthetic branch with an explicit per-branch `seed` (derived from the branch number) and calls `generateBranch(def)` — output is snapshot-stable across reloads.
- Added `src/data/rng.ts` with `seededValue`, `seededInt`, `seededFloat`, `seededBool`, `seededPick` — pure, stateless, no `Math.random()`.
- Tests: `src/data/getBranchReport.test.ts` covers Hadera-verbatim, unknown-id → null, synthetic structural validity, determinism, and inflateBranchReport purity. `src/data/generateBranch.test.ts` covers parametric template determinism, identity passthrough, default `baseSeed`, seed sensitivity, 11-branch snapshot stability, and scale monotonicity.
- **Files:** `src/data/getBranchReport.ts` (new), `src/data/getBranchReport.test.ts` (new), `src/data/generateBranch.test.ts` (new), `src/data/rng.ts` (new), `src/data/hadera-seed.ts` (renamed from `hadera-branch.ts`, export renamed), `src/data/generators.ts`, `src/data/mock-branches.ts`, `src/routes/store-manager/index.tsx`, `architecture.md`

### Promo Simulator — usePromoSimulator hook + taxonomy context (#36)

- New `usePromoSimulator(search)` hook owns the full state boundary: URL search-param codec, defaults (incl. top-selling category pre-fill), memoized `metrics` (via `calcMetrics`) and `narrative` (via `narrativeFor`), and actions (`jumpToStep`, `goBack`, `goNext`, `restart`, `resetStep`, `finish`). Step components no longer call `calcMetrics` / `narrativeFor` directly.
- New `PromoTaxonomyContext` exposes goals, promo types, segments, sales arenas, duration options, and step metadata as a single provided value at the route root, so step components consume what they need via `usePromoTaxonomy()`.
- `src/lib/promo-simulator/state.ts` gained scoped slice types (`BriefSlice`, `TermsSlice`, `ForecastSlice`, `ImplementationSlice`, `ControlSlice`) and `SliceSetter<T>` — each step now receives only the slice it needs plus a typed setter, instead of the full `SimulatorState`.
- `LiveKPIPanel` / `AINarrative` / `UpliftChart` / `PromoSummaryCard` / `PromoFullReport` / `SuccessScreen` rewired to receive `metrics` / `paragraphs` as props rather than recomputing from state.
- `src/routes/category-manager/promo-simulator.tsx` trimmed to a thin orchestrator that wires the hook + context provider, threads scoped slices into each step, and owns navigation chrome.
- Added `src/hooks/usePromoSimulator.test.ts` (boundary contract via pure codec / metrics / narrative / step-jump) and `src/lib/promo-simulator/narrative.test.ts` (goal templates, discount thresholds, status interpretation).
- **Files:** `src/hooks/usePromoSimulator.ts` (new), `src/hooks/usePromoSimulator.test.ts` (new), `src/contexts/PromoTaxonomyContext.tsx` (new), `src/lib/promo-simulator/narrative.test.ts` (new), `src/lib/promo-simulator/state.ts`, `src/routes/category-manager/promo-simulator.tsx`, all nine `Step*.tsx` under `src/components/promo-simulator/`, plus `LiveKPIPanel.tsx`, `AINarrative.tsx`, `UpliftChart.tsx`, `PromoSummaryCard.tsx`, `PromoFullReport.tsx`, `SuccessScreen.tsx`

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
