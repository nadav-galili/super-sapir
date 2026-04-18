# 10x Analysis: Category Manager Daily Tools

Session 2 | Date: 2026-04-18

## Current Value

The `/category-manager` route ("ניהול סחר") already gives the category manager: chain-wide AI briefing, quick stats (customers, basket, supply, complaints), KPI gauges, category spotlight, format overview, categories/suppliers/promotions tabs, and a per-category drill-down (`/category-manager/$categoryId`) with AI briefing, supplier dashboard, promotion card, alerts, and a promo simulator with PDF export.

Put differently: today it's a beautifully arranged mirror of what the category manager already knew this morning.

## The Question

**What would make the category manager open this app at 8:00 AM before email — and keep it open all day?**

The board pitch (session 1) was about impressive moments. This one is different. The category manager lives inside this tool 8 hours a day. Every feature has to survive the _boring Tuesday_ test — still useful when no one is pitching, no board in the room, just a category head who needs to hit next month's number.

Category manager pains from their job, not from our app:

- Managing thousands of SKUs in their categories
- Quarterly / annual supplier business reviews (QBRs) — career-defining, under-prepared
- Promo planning gut feel with no prediction
- Assortment pressure: suppliers push new SKUs, tail SKUs rot on the shelf
- "Why did we miss target?" root-causing, manually, in Excel
- Cannibalization invisible to them
- Trade spend ROI invisible to them

Picking 3 that (a) get used daily/weekly (not just demo-day), (b) replace hours of manual Excel, (c) can be built on the existing `allBranches`, `getCategorySummaries`, `mock-category-suppliers`, `getChainPromotions` layer without new data plumbing.

---

## Massive Opportunities

### 1. 🧩 "אוצר הסל" — SKU Rationalization & Assortment Copilot

**What**: A dedicated screen that, for a chosen category, shows every SKU plotted on a 2x2 (velocity × margin), with a third dimension for strategic role (traffic-driver / margin / loyalty / long-tail). The AI proposes three lists with evidence:

- **Delist** — 47 SKUs dragging margin, freeing 3.2 linear meters of shelf, projected margin impact +₪1.2M/yr, cannibalization risk per SKU
- **Promote / expand facings** — 12 winners starved of shelf
- **Add** — 8 gaps vs Rami Levy/Shufersal assortments, ranked by expected velocity

Each recommendation is one click to accept/reject; accepted items drop into a "שינויי פלנוגרם" queue ready to send to operations. An "impact to date" counter shows ₪ unlocked since the feature went live.

**Why 10x**: Assortment review is the category manager's single highest-leverage quarterly task and the one that's most gut-feel / Excel-driven today. It takes weeks of manual work, is politically charged (suppliers scream when you delist), and moves millions of ₪. Collapsing it into a screen with evidence-backed recommendations turns a quarterly nightmare into a weekly habit. Once they trust the tool on one category, they'll run it across all categories — compounding adoption.

**Unlocks**: continuous (not quarterly) assortment hygiene; objective ammunition against supplier pressure; direct link to the Planogram module as a phase-2 feature; clean baseline for private-label opportunity analysis.

**Evidence it's credible on current data**: we already compute per-category sales/margin, have per-supplier breakdowns in `mock-category-suppliers.ts`, and have branch-level velocity. The 2x2 is a `CategoryBubbleChart`-style component we've already built. This is recombining data we already have, not new plumbing.

**Effort**: Medium-High
**Risk**: A wrong delist recommendation = angry supplier + lost halo sales. Ship with a "shadow mode" showing _what would have happened_ before enabling push-to-ops.
**Score**: 🔥 **Must do** — highest daily-to-weekly usage ceiling of any CM feature.

---

### 2. 💼 "חדר משא ומתן" — Supplier Negotiation Room (QBR in a box)

**What**: A per-supplier page the CM opens the week before a Quarterly Business Review. One click produces a complete QBR package:

- **Leverage dashboard** — their share of our category, our share of their national volume, on-time delivery vs contract, price-increase history vs CPI, service-level gaps with ₪ cost
- **Trade-spend ROI** — every shekel of their trade marketing mapped to actual uplift (not their pitch deck uplift)
- **Their asks vs our asks** — auto-drafted, ranked by ₪ impact
- **Counter-offer draft** — a pre-written Hebrew email with target price, MOQ, trade spend mix, and fallback positions
- **Red team** — what the supplier will say back, and our response, rehearsed
- **Benchmark** — the same supplier's performance for us vs (anonymized) industry peers

**Why 10x**: QBRs are where category-level P&L is actually decided, and most category managers walk in under-prepared because preparation is a full week of manual work. A CM who walks into a Tnuva QBR with this package instead of a two-tab Excel gets better terms — and knows it. Every meeting becomes 2–5% better terms, which compounds to material margin across the category. _That's_ the "can't live without it" loop.

**Unlocks**: standardizes negotiation rigor across all CMs (junior CMs suddenly negotiate like 20-year veterans); creates a longitudinal supplier performance dataset that compounds over time; natural upsell to a "Supplier Scorecard" shared with suppliers themselves.

**Evidence it's credible on current data**: `mock-suppliers.ts`, `mock-category-suppliers.ts`, `SuppliersTable`, `SupplierLogo`, and `CategorySuppliersDashboard` are already there. The new thing is narrative generation (re-use AI streaming) + a structured QBR template. Counter-offer drafting is a natural use of the same AI plumbing that powers `ChainAIBriefing`.

**Effort**: Medium
**Risk**: Wrong counter-offer numbers in front of a supplier = lost credibility. Every number must be cited and editable before the CM sends anything out.
**Score**: 🔥 **Must do** — directly converts category-manager time into margin ₪, used every quarter per supplier = weekly across portfolio.

---

### 3. 🔮 "אורקל מבצעים" — Promo Oracle with Cannibalization & Halo Detection

**What**: An upgrade to the existing promo simulator. Before a promo is approved, the CM picks SKUs + depth + duration; the Oracle returns:

- **Forecast uplift** (not gut, model-driven, on top of seasonality + weather + holiday + competitor state)
- **Cannibalization map** — which of _our own_ adjacent SKUs will lose volume, in ₪ and % ("your cottage -20% promo will cannibalize ₪430K from yogurts and ₪110K from leben")
- **Halo map** — adjacent categories that will _benefit_ (pita sales during hummus promo)
- **Competitive response** — what Rami Levy/Shufersal likely do in week 2, and a pre-planned counter
- **Calendar collision detector** — overlapping promos inside the chain that will cannibalize each other ("your dairy CM and your bakery CM both ran -25% on the same Friday; you each cost each other ₪")
- **Retrospective mode** — after the promo ends, the Oracle writes the honest post-mortem in Hebrew and drops it in the promo's history row

**Why 10x**: Promo planning is the category manager's second-highest-leverage activity and the one with the worst feedback loop — they run it, they see the uplift, they never see what they cannibalized or what the halo actually was. This closes the loop. Over a year, a CM who sees cannibalization learns to stagger promos and captures 3–8% of promo spend that was previously self-cannibalized. For a chain of Super Sapir's size that is tens of millions of ₪.

**Unlocks**: the chain's first real promo ROI dataset; the ability to benchmark CMs against each other ("who has the cleanest promo plan?"); a defensible story to finance when asking for more trade-marketing budget.

**Evidence it's credible on current data**: the promo simulator, `PromotionDailyChart`, `PromotionsTable`, `PromotionCard`, `getChainPromotions`, and `mock-chain-promotions.ts` with daily series are already live. Cannibalization needs a cross-SKU correlation step; halo needs a cross-category step — both are computable from the existing daily-series data.

**Effort**: Medium (extending existing simulator, not a new product)
**Risk**: Forecast confidence theater — if uplift predictions are wrong the CM stops trusting it fast. Ship with confidence intervals, not point estimates, and a public accuracy scoreboard.
**Score**: 🔥 **Must do** — leverages the feature we just polished and turns it from a demo into a daily tool.

---

## Honorable Mentions (pocket for session 3 or roadmap slide)

- **NPD Triage Scorecard** — a supplier pitches a new product, CM drops it in, AI scores velocity / cannibalization risk / margin vs peers / shelf-space ROI in 30 seconds. Replaces a 3-week internal review. Good complement to #1.
- **Private-Label Opportunity Finder** — identifies branded SKUs where PL could steal 40%+ of volume, computes margin uplift. Strategic, quarterly cadence.
- **"Why did I miss target?" Deep-Dive** — auto-generates the Monday-morning root-cause narrative (promo miss / supply miss / competitor / weather / seasonality) with evidence. Small effort, huge weekly relief.
- **Morning Briefing Push** — a 2-paragraph Hebrew summary dropped into the CM's inbox at 7:30 AM: what moved overnight, what to act on today. Low effort, habit-forming.

---

## Recommended Priority

### Do Now (highest daily-use, existing data)

1. **Promo Oracle with Cannibalization** — extends the simulator we already have; fastest path to _"wait, I didn't know I was eating my own lunch"_ moment.
2. **Supplier Negotiation Room** — highest ₪-per-hour-of-CM-time; re-uses supplier data and AI layer.

### Do Next

3. **SKU Rationalization Copilot** — largest strategic impact but requires the most new UI; worth a dedicated cycle.

### Explore

- Private-Label Opportunity Finder
- NPD Triage Scorecard
- Morning Briefing Push (tiny but habit-forming)

---

## Why these three together

They cover the three pillars of a category manager's job:

- **Assortment** → SKU Rationalization Copilot
- **Supplier** → Negotiation Room
- **Promotion** → Promo Oracle

They also have a nice cadence mix — Promo Oracle is _weekly_, Negotiation Room is _per QBR_, Rationalization is _monthly_ — so the CM has a reason to open the app at different time-horizons without any feature feeling abandoned.

Shared infra: all three lean on the existing AI streaming (`useAIAnalysis` / `useCategoryAIAnalysis` / `ai-analyze.ts`), the data layer in `src/data/`, and existing chart/table components. Each one makes the next cheaper.

---

## Contrast with the Board Session

The board session (session 1) was about _impressive moments in a 15-minute room_. This session is about _tools that win the category manager's morning_. Different audience, different bar:

- Board buys vision. CM buys "I can finally get home at 6 PM."
- Board wants the big ₪ number on the slide. CM wants the cannibalization number they didn't know about.
- Board demo is theatrical. CM demo is "let me try my own category, right now, with my own SKUs."

The best live demo for a CM audience is to let them pick a category and watch the Promo Oracle write the retrospective of a promo _they actually ran last quarter_. If the retrospective tells them something they didn't already know, you've sold them.

---

## Questions

### Blockers

- **Q**: Is this a single CM in the room, or a team with a head-of-trade? Dictates whether the Negotiation Room or the Rationalization Copilot leads.
- **Q**: Do we have access to any real historical promo outcome data from Super Sapir? The Oracle's credibility collapses without a retrospective demo on their own numbers.
- **Q**: What's the CM's top pain _right now_ — target miss, supplier renegotiation, or assortment pressure? The pitch should lead with that one.

## Next Steps

- [ ] Pick which of the three to prototype live — recommend **Promo Oracle retrospective** (lowest build cost, strongest "wait what" reaction)
- [ ] Ask user for one real category + one real historical promo to drive the demo
- [ ] Draft a 1-page "day in the life of a CM, with this tool" narrative to anchor the presentation
