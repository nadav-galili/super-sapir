# 10x Analysis: Super Sapir Board Demo

Session 1 | Date: 2026-04-18

## Current Value

RetailSkillz Analytics is a Hebrew RTL B2B SaaS dashboard wrapping Super Sapir's chain data across three personas:

- **Store manager** — single-branch operational view (Hadera #44 with real Dec 2025 report data, 11 simulated branches)
- **Division manager** — regional map + branch ranking
- **Category / Trade manager** — chain-wide category, supplier, promotion performance with AI-streamed briefings and a promo simulator

It already has: AI briefings (streaming via Netlify function), promo simulator with PDF export, category drill-downs, supplier scorecards, KPI gauges, traffic-light status, RTL polish.

**What the board sees today**: A very pretty mirror of data they already have. Slicker than Excel. But slicing is not selling.

## The Question

**How do we make the board lean forward — stop treating this as a reporting tool and start treating it as the operating system of the chain?**

A dashboard shows what happened. The next version **decides, predicts, or negotiates**. That is the 10x leap, and that is what moves board-level ₪.

I'm picking 3 features that are (a) visually stunning in a 15-minute demo, (b) map directly to ₪ the board already argues about in meetings, and (c) are credible to ship as MVPs on top of the existing data layer and AI plumbing.

---

## Massive Opportunities

### 1. 🧠 "שאל את הרשת" — Chain Copilot (conversational CEO layer)

**What**: A Hebrew chat box that lives on top of every page. The CEO or category head types a messy, human question — _"למה המרג'ין של מוצרי החלב ירד בפברואר?"_ / _"איזה סניפים ידממו אם נוריד את מחיר הקוטג' ב-5%?"_ — and the app streams back an answer grounded in the chain's own data: which SKUs, which branches, which suppliers, which promotions, with clickable drill-downs and a chart rendered inline. Every answer ends with "פעולה מוצעת" (suggested action) that can be dispatched to a category manager.

**Why 10x**: Today the app _shows_ KPIs. Tomorrow it _answers strategic questions_. This is the "holy shit" moment of the demo — board members asking questions live, on their own phones, in Hebrew, and getting correct, cited answers. It transforms the product from "BI tool" to "an analyst that never sleeps." One unforgettable moment sells the whole contract.

**Unlocks**: kills the need for 80% of ad-hoc BI tickets; every employee becomes data-literate; becomes the default interface (chat > dashboards) and drags every future feature in behind it; creates a usage moat (the more the chain asks, the smarter it gets on their jargon/SKUs).

**Why it's credible now**: `useAIAnalysis`, `useCategoryAIAnalysis`, `ChainAIBriefing`, and `netlify/functions/ai-analyze.ts` already exist. Streaming, prompt-building, and caching are in. The leap is from _summarize this view_ → _answer an arbitrary question against the full data layer_ (tool-use over `allBranches`, `getCategorySummaries`, `getChainPromotions`, real Hadera report).

**Demo moment**: Board member asks aloud, you type it, answer streams in Hebrew with a chart and three branch names. Mic drop.

**Effort**: High (tool-calling + evaluation harness + Hebrew prompt tuning)
**Risk**: Hallucinated numbers in front of a board = career-ending. Must be answer-with-evidence only; block any claim that isn't backed by a cited row.
**Score**: 🔥 **Must do** — this is the headline feature of the pitch.

---

### 2. 🎯 "רדאר מחירים" — Competitor Price Radar + Auto-Repricing

**What**: A live grid of Super Sapir's top 500 SKUs against Rami Levy, Shufersal, Victory, Yohananof shelf prices (scraped daily). Each row is colour-coded: cheaper / matched / more expensive, with ₪ gap and elasticity-adjusted demand forecast. An AI sidebar recommends daily price moves — _"Tnuva cottage 250g: Rami Levy dropped to ₪5.90, we are at ₪6.40. Match for 72h → projected margin impact -₪18K, basket-size impact +4.1%, defensive value vs churn +₪92K. Approve?"_ One click pushes to the POS queue.

**Why 10x**: Israeli grocery is a price war. Every board meeting has a slide about "competitor aggression." This turns that slide into a live radar and an action button. It's the single feature that most obviously returns its price 10× in margin and defensive basket share within a quarter.

**Unlocks**: Turns the app from _observation_ into _action_. Every price move creates a learning signal → the recommendation engine compounds over time. Sales pitch becomes _"our tool is the reason you beat Rami Levy last Tuesday"_ instead of _"our tool shows you lost to Rami Levy last Tuesday."_

**Effort**: High (scraper infra + elasticity model + approval workflow + POS integration)
**Risk**: Price scraping legality (mitigate via public-shelf data + partners); cannibalization if model is wrong. Ship with human-in-the-loop approval.
**Score**: 🔥 **Must do** — strongest ₪-per-quarter story for a CFO on the board.

---

### 3. 🥬 "אוטופיילוט טריות" — Fresh-Waste Predictive Engine

**What**: A dedicated screen that predicts, 72 hours ahead, which fresh SKUs at which branches will spoil. Three automated actions per item: (a) dynamic markdown (e.g. -30% at 48h, -60% at 24h), (b) inter-branch transfer to a higher-velocity store ("3 pallets lettuce → Hadera → Kfar Saba, van 14:00"), (c) donation routing to Leket Israel with auto-generated tax receipt. A live ticker shows "₪ saved today / this week / this quarter."

**Why 10x**: Fresh waste is 15–30% of fresh-category cost — tens of millions of ₪ per year for a chain of Super Sapir's size. It's the single biggest controllable cost line nobody controls well. Plus the ESG angle (food-waste legislation is tightening in Israel) is a board/PR win on its own, and the Leket partnership doubles as free press.

**Unlocks**: Direct P&L impact (measurable "₪ saved" counter in the executive view); CSR / ESG narrative for annual report; data feedback loop (every markdown/transfer teaches the forecaster); logical stepping-stone to full demand forecasting across the chain.

**Effort**: Medium-High (forecast model + transfer logistics modeling; the dashboard itself is straightforward given existing component patterns)
**Risk**: Bad forecast → unnecessary markdowns → margin hit. Ship with a "shadow mode" first showing what _would_ have been saved.
**Score**: 🔥 **Must do** — concrete ₪, ESG bonus, visually powerful (a live saved-₪ counter during the demo is emotional).

---

## Honorable Mentions (cut from top 3, but keep in pocket)

- **Holiday Command Center** — Passover/Rosh Hashanah/Ramadan autopilot (demand forecast per SKU per branch + staffing + truck allocation + promo mix, one-click approval). High relevance to Israeli retail calendar; strong follow-up to #3.
- **Store-Walk Mode (AR shelf audit)** — Phone camera detects OOS / mispriced / misplaced SKUs. Gamifies district-manager store visits. Great demo visual if you have 2 extra minutes.
- **Supplier Negotiation Room** — AI-generated quarterly supplier scorecards with leverage analysis and counter-offer drafts. ("Tnuva on-time 87% vs contract 95% → ₪340K/yr at risk, draft email ready.") Huge procurement-team value.
- **"What-if" Board Slider** — live scenario toggle on the chain dashboard ("raise dairy prices 2%") showing instant revenue/margin/churn projection. Small effort, huge boardroom theatre.

---

## Recommended Priority for the Pitch

### Demo-day headline (build this first, even if shallow)

1. **Chain Copilot** — even as a scripted "wizard-of-oz" with 5 pre-tuned questions, this is the feature the board will talk about in the car home. Everything else can still be aspirational roadmap.

### Show as "live today, deepening next quarter"

2. **Competitor Price Radar** — ship a read-only version with last-week's competitor prices on 50 hero SKUs. The radar visual alone is stunning.
3. **Fresh-Waste Autopilot** — ship the predictor + the "₪ saved this week" counter. Defer the transfer/donation workflow to phase 2.

### Show as roadmap slide (not built)

- Holiday Command Center, Supplier Negotiation Room, Store-Walk AR, What-if slider

---

## Why these three together, not separately

Each of the three hits a different board member's anxiety:

- **CEO** — "am I losing the price war?" → Price Radar
- **CFO** — "where's the margin leak?" → Fresh-Waste Autopilot
- **Every board member** — "can we actually understand our own data?" → Chain Copilot

They also share infrastructure — the AI streaming layer, the data contracts in `src/data/`, the card/chart components. Each one makes the next one cheaper to build. That's the compounding story to close on.

---

## Questions

### Blockers (need user input before next step)

- **Q**: How long is the demo slot (5 / 15 / 30 minutes)? Dictates whether Copilot is scripted vs live.
- **Q**: Do we have any real competitor price data source, or is this pitched as "we'll plug into X"?
- **Q**: Is there a real Super Sapir waste number you can quote in the demo, or should we use a Nielsen/industry benchmark?
- **Q**: Who's in the room — CEO/CFO/operations/owners? Tailors which of the three leads the narrative.

## Next Steps

- [ ] Confirm demo length + audience composition with user
- [ ] Pick ONE of the three to build as a live prototype for the board (recommend Copilot)
- [ ] Write a 3-slide roadmap deck framing the other two as "quarter 2 / quarter 3"
- [ ] Prepare fallback: pre-recorded 90-second screen capture of each feature in case live fails
