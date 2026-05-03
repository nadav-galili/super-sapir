# Ubiquitous Language

Domain glossary for **Retalio** (previously "RetailSkillz Analytics") — the B2B SaaS dashboard for Super Sapir, an Israeli food retail chain. Every term below should be used consistently in code, UI copy, commits, and conversation. Aliases listed are **not** to be used.

---

## Organizational hierarchy

| Term           | Definition                                                                                                                                                                                                                               | Aliases to avoid          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **Chain**      | The entire retailer (Super Sapir) — the top-level aggregate of all branches.                                                                                                                                                             | Network, company, group   |
| **Region**     | A geographic grouping of branches (North / Center / South). **The canonical term — never use "Division".**                                                                                                                               | Division, area, zone      |
| **Branch**     | A single physical retail location identified by a branch number (e.g. Hadera #44).                                                                                                                                                       | Store, shop, outlet, site |
| **Group**      | **Promo-simulator only.** A merchandise super-grouping above Department, used as the top filter in Step 1 of the promo simulator. Five values: מכולת, ירקות, חלב, נון פוד, בשר. Each Group has one accountable Category Manager.         | Super-department, family  |
| **Department** | A top-level merchandise grouping (Dairy, Meat, Grocery, …). Exists at **both** chain scope (owns Categories) and branch scope (a physical area inside a branch, same name). In the promo simulator, Departments live underneath a Group. | Aisle, section            |
| **Category**   | A sub-classification **inside a Department** (e.g. Dairy → _Cheese_, _Milk_, _Yogurt_). Owned chain-wide by the Category Manager.                                                                                                        | Sub-department, class     |
| **Series**     | **Promo-simulator only.** A brand-line product family within a Supplier, scoped to a Sub-category. Example: Wissotzky × hot drinks → _תה ירוק_, _חליטות_, _מג'יק_. Optional field in the simulator brief.                                | Brand line, range, family |
| **Format**     | Branch size classification — `big` (full-size) or `city` (urban compact).                                                                                                                                                                | Size, type, tier          |

### Department vs Category — the critical distinction

> The hierarchy is **Chain → Department → Category → Item**.
> A **Department** is the broad grouping (e.g. "Dairy"). A **Category** is a specific line inside that department (e.g. "Cheese").
> "Department" is deliberately reused at two scopes: the chain defines the Dairy Department as a taxonomy, and each Branch has a physical Dairy Department floor area — they're the same concept expressed at different scopes, not two different things.
> A **Store Manager** monitors the branch's Departments (physical). A **Category Manager** owns Categories chain-wide across every branch.

---

## People & roles

| Term                 | Definition                                                                                                                                                                                 | Aliases to avoid                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| **Store Manager**    | Person accountable for a single **Branch**. Uses the store-manager dashboard.                                                                                                              | Branch manager, site manager                  |
| **Region Manager**   | Person accountable for a **Region** (several branches). Uses the map-based region dashboard. The legacy route `/division-manager` keeps its URL, but the role and page are Region Manager. | Division manager, regional manager, area lead |
| **Category Manager** | Person accountable for **Categories** chain-wide (pricing, promotions, supplier mix) within one or more **Departments**. Also owns _Trade Management_ (ניהול סחר).                         | Buyer, merchandiser, trader                   |
| **Supplier**         | An external vendor providing merchandise to one or more categories (e.g. Tnuva, Strauss).                                                                                                  | Vendor, provider, partner                     |
| **Customer**         | A shopper who walks into a branch and creates a basket.                                                                                                                                    | Shopper (see below), buyer                    |
| **Shopper**          | **Reserved term** — refers to the Shopper **app/system** used for in-store picking (supply rate is measured as `shopperUsage`). Do **not** use as a synonym for Customer.                  | —                                             |

> **Flagged:** "Shopper" is overloaded in retail English. In this domain it refers only to the picking system, not to customers.

---

## Sales & performance metrics

| Term                  | Definition                                                                                                                                                                                            | Aliases to avoid                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Total Sales**       | Gross sales (revenue) of a branch or department for the current period, in ILS.                                                                                                                       | Gross, top-line                     |
| **Network Sales**     | Sales measured by the chain's internal "network" channel — a subset of Total Sales tracked against target.                                                                                            | Chain sales                         |
| **Average Basket**    | Average revenue per customer visit (`totalSales / customers`).                                                                                                                                        | Ticket, cart value                  |
| **Customers per Day** | Average daily unique customer count for the period.                                                                                                                                                   | Footfall, traffic                   |
| **Revenue per Meter** | Sales divided by **Selling Area** (sqm, warehouse excluded). Benchmarked across the chain.                                                                                                            | Sales density, sqm productivity     |
| **YoY Change**        | Year-over-year percent change vs the same period last year.                                                                                                                                           | LY delta, annual growth             |
| **vs Target**         | Percent variance against the planned target for the period.                                                                                                                                           | Plan variance, budget delta         |
| **Comparison Mode**   | The user-selected benchmark axis: `vs-target`, `vs-last-year`, or `vs-last-month`.                                                                                                                    | Baseline, compare against           |
| **רווחיות גולמית**    | Gross Margin — the gross-profit percentage of a Category, Sub-category, Supplier, or Series. Canonical Hebrew term used in promo-simulator KPI tiles and AI copy. English equivalent: `Gross Margin`. | שיעור רווח גולמי, רווח גולמי, מרווח |

---

## Targets, KPIs & status

| Term                     | Definition                                                                                     | Aliases to avoid       |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------- |
| **Target**               | A planned numeric goal for a KPI in a given period (set by the chain).                         | Plan, budget, goal     |
| **KPI**                  | A tracked metric with a target and a status color (good/warning/bad).                          | Metric, indicator      |
| **KPI Status**           | Traffic-light classification derived from `ratio = actual / target` via `getKpiStatusColor()`. | Health, RAG            |
| **Good / Warning / Bad** | The three status tiers (≥95% / 85–95% / <85% of target). Colors: emerald / amber / rose.       | Green/Yellow/Red, RAG  |
| **Ranking**              | The branch's ordinal position in a chain-wide league table for a given KPI (1 = best).         | Rank, position, league |

---

## Operations & quality

| Term                        | Definition                                                                                    | Aliases to avoid         |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| **Quality Score**           | Composite operational quality grade (0–100) for a branch.                                     | Ops score, health score  |
| **Fresh Quality Score**     | Quality subgrade specifically for fresh-food departments (produce, meat, fish, deli, bread).  | Perishable score         |
| **Supply Rate**             | Percent of SKUs in stock when a picker / replenishment pass checks them.                      | Fill rate, in-stock rate |
| **Stockout Rate**           | Percent of SKUs out of stock at a given moment (inverse view of supply rate, at SKU level).   | OOS rate                 |
| **Days of Inventory**       | Average inventory coverage expressed in selling days.                                         | Stock cover, DOI         |
| **Inventory Turnover**      | How many times inventory cycles within the period.                                            | Turns, velocity          |
| **Meat Waste / Fish Waste** | Percent of fresh-protein inventory discarded vs sold.                                         | Shrink, dump             |
| **Customer Complaints**     | Count of recorded complaints for the period, tracked against a target.                        | Tickets, issues          |
| **Focus Reports**           | Scheduled operational inspection reports required per period.                                 | Audits, checks           |
| **Shopper Usage**           | Percent of orders picked via the Shopper system (compared between Super Sapir and Shufersal). | Picker rate              |

---

## Hebrew vocabulary — canonical retail terms

These are the canonical Hebrew terms used across UI labels, AI prompts, and copy. The aliases below are **not** to be used.

| Canonical (HE)               | Replaces (HE alias) | Definition                                                                                                                                                                                                        |
| ---------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **פחת**                      | בזבוז               | Retail loss / shrinkage — the canonical term for inventory written off (waste, theft, spoilage). Use in all retail-loss contexts (e.g. `פחת בשר`, `פחת %`).                                                       |
| **חריגות**                   | סטיות               | Deviation from a KPI target or expected value. Use when describing departments / categories / suppliers that fall outside the expected band.                                                                      |
| **למול**                     | לעומת               | Canonical preposition for comparisons (`חריגות למול היעד`, `שיעור הוצאות שכר למול המחזור`). Hebraic / formal register; preferred over the more colloquial `לעומת`.                                                |
| **הוצאות שכר**               | עלות שכר            | Canonical noun for salary expenditure. Use as the static label on cards and tables (`הוצאות שכר`, `הוצאות שכר בש״ח`).                                                                                             |
| **שיעור הוצאות שכר מהמחזור** | אחוז עלות שכר       | The ratio metric — salary as a percent of branch revenue. Use when the percent value is rendered with context (e.g. AI copy: `הוצאות שכר בשיעור של 8.4% מהמחזור`). The card-tile shorthand is `שיעור הוצאות שכר`. |

---

## Compliance (chain-enforced rules)

| Term                   | Definition                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **High Inventory**     | A compliance check flagging SKUs carried in excess of allowed days of inventory.                 |
| **Missing Activities** | Count of scheduled in-branch activities (tastings, resets, etc.) that were not executed on time. |
| **Returns Compliance** | Percent of returns processed within the required advance window.                                 |
| **Red Alerts**         | Critical compliance breaches; tracked against a ceiling target per period.                       |

---

## Trade: promotions, alerts, HR

### Promotions

| Term                         | Definition                                                                                                                                                                                                                    | Aliases to avoid                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Promotion**                | A time-boxed price action on an item or bundle, run by the Category Manager.                                                                                                                                                  | Campaign, deal, discount        |
| **Baseline Sales**           | Expected sales for the promo window if no promotion had run.                                                                                                                                                                  | Non-promo baseline              |
| **Actual Sales**             | Realized sales during the promo window.                                                                                                                                                                                       | —                               |
| **Uplift**                   | `(actual - baseline) / baseline` expressed as a percent.                                                                                                                                                                      | Lift, gain                      |
| **ROI**                      | Return on promotional investment (margin gained ÷ promo cost).                                                                                                                                                                | Payback                         |
| **Cannibalization**          | A promotion that shifts demand from other items/categories rather than creating new demand.                                                                                                                                   | Substitution                    |
| **Cannibalization Rate**     | The percent of promo demand that is shifted from base (non-promo) sales rather than incremental. Field name: `cannibPct`. Hebrew: **שיעור קניבליזציה**.                                                                       | —                               |
| **Marketing Cost**           | One-time marketing / setup spend for a single promotion (signage, digital push, in-store collateral). Field name: `mktCost`. Hebrew: **עלות שיווק**. Drives the ROI denominator in the simulator.                             | Ad spend, campaign cost         |
| **Operations Cost per Unit** | Incremental per-unit operational overhead during the promo window (extra picking, stocking, packaging) on top of `unitCost`. Field name: `opsCost`. Hebrew: **עלות תפעול ליחידה**. Reduces effective per-unit margin.         | Handling cost, fulfillment cost |
| **Scenario**                 | A sensitivity preset in the promo simulator that scales `upliftPct` and `cannibPct` together. Three values: `pessimistic` / `base` / `optimistic` (Hebrew: **שמרני / בסיס / אופטימי**). Used in Step 5 to stress-test a plan. | What-if, case                   |
| **Verdict**                  | Promo simulator's three-tier worthiness call: **כדאי / כדאיות גבולית / לא כדאי**. Derived from `netProfit` + `promoGrossMargin`. Maps to traffic-light colors (good/warning/bad).                                             | Recommendation, judgement       |

### Alerts (derived, Category-scoped)

| Alert Type        | Meaning                                                 |
| ----------------- | ------------------------------------------------------- |
| `target-miss`     | Category sales tracking materially below target.        |
| `margin-erosion`  | Gross margin percent is declining period-over-period.   |
| `stockout-risk`   | Stockout rate above acceptable threshold.               |
| `declining-sales` | Negative YoY trend that has persisted multiple periods. |
| `low-turnover`    | Inventory turnover has fallen below benchmark.          |

Each alert carries a **Severity**: `high` / `medium` / `low`.

### HR & staffing

| Term                    | Definition                                                           | Aliases to avoid     |
| ----------------------- | -------------------------------------------------------------------- | -------------------- |
| **Authorized (roles)**  | The approved headcount budget for a role in a branch.                | Approved, sanctioned |
| **Actual (roles)**      | The currently filled headcount for that role.                        | Filled, on-roster    |
| **Staffing Gap**        | `authorized - actual` — positive means understaffed.                 | Vacancy, shortfall   |
| **Salary Cost %**       | Total salary spend as a percent of branch revenue, against a target. | Labor %              |
| **Turnover Rate**       | Percent of employees leaving within the period.                      | Attrition            |
| **Overtime Hours**      | Total paid overtime hours logged by branch staff.                    | OT                   |
| **Placement Company %** | Share of recruitment done via external staffing agencies.            | Agency share         |

---

## Analytics artifacts

| Term                   | Definition                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| **Branch Full Report** | The canonical monthly management report for a branch — the root object returned by `getBranchReport()`. |
| **Monthly Trend**      | A 12-month series of key metrics for a branch (sales, customers, basket, network).                      |
| **AI Briefing**        | A natural-language summary of the current KPIs for a branch or category, streamed from the AI endpoint. |
| **View**               | A store-manager dashboard perspective selected via `?view=` (overview, inventory, hr, departments, …).  |

---

## Relationships

- A **Chain** owns many **Regions**; a **Region** owns many **Branches**.
- The **Chain** defines a taxonomy of **Departments**; each **Department** contains many **Categories**.
- Each **Branch** has a physical instance of every **Department** in the chain taxonomy.
- A **Store Manager** owns one **Branch**; a **Region Manager** owns one **Region**.
- A **Category Manager** owns many **Categories** chain-wide and runs **Promotions** on them.
- A **Supplier** supplies one or more **Categories** (and therefore contributes to one or more **Departments**).
- Every **KPI** has a **Target** and produces a **KPI Status** for a given period.
- A **Promotion** belongs to one **Category** and has a **Baseline**, **Actual**, **Uplift**, and **ROI**.
- A **Category Alert** is derived from **Category** KPIs and carries an **Alert Type** + **Severity**.

---

## Example dialogue

> **Dev:** "On the category-manager page, should the **uplift** be computed against **last year** or against the **baseline**?"
>
> **Domain expert:** "Against the **baseline** — that's non-promo expected sales during the window. **YoY Change** is a separate metric we show next to it for context."
>
> **Dev:** "And the **alerts** on that page — are they per **Branch** or per **Category**?"
>
> **Domain expert:** "Per **Category**, chain-wide. A **Store Manager** sees Department-level issues inside their Branch. A **Category Manager** sees issues for their Categories rolled up across every Branch."
>
> **Dev:** "So if I'm looking at the Dairy **Department** on the store-manager view, the cheese and milk breakdown would be **Categories** inside it?"
>
> **Domain expert:** "Right. Department is the top-level floor area; Categories are the lines inside it. The chain-wide view of those same Categories is what the Category Manager works with."
>
> **Dev:** "What about **Shopper Usage** on the store-manager view — does that mean customers?"
>
> **Domain expert:** "No — **Shopper** is our picking system. **Customers per Day** is footfall. Keep those separate, they're unrelated metrics."
>
> **Dev:** "Got it. And if a **Category**'s **Stockout Rate** crosses the threshold, that fires a `stockout-risk` **Alert** with a **Severity**, right?"
>
> **Domain expert:** "Exactly. The **KPI Status** on the KPI card turns rose; the derived **Alert** is what surfaces in the alerts table with its severity."

---

## Flagged ambiguities

- **Department vs Category — code debt.** Today's code uses `DepartmentMetrics` / `DEPARTMENT_NAMES` / `CategorySummary` where the entries (`dairy`, `meat`, `grocery`, …) are actually **Departments** per this glossary. True **Categories** (e.g. _Cheese_, _Milk_ inside the Dairy Department) are not yet modelled. When that sub-level is introduced, rename the current `Category*` types to `Department*` and reserve `Category` for the new sub-level. Until then: in conversation and new code, use the canonical terms from this file; when touching legacy types, leave their names but add a comment.
- **Department at two scopes.** The same word legitimately names both (a) the chain-wide taxonomy entry ("the Dairy Department") and (b) the physical floor area inside a single branch. They are the same concept at different scopes, not a collision. Disambiguate in prose with "the branch's X Department" vs "the chain's X Department".
- **Region is canonical — "Division" is banned.** The entity, the role (**Region Manager**), and UI copy all say _Region_. The only exception is the existing route URL `/division-manager`, kept for URL stability; do not introduce `division` anywhere else.
- **Network Sales vs Chain Sales vs Total Sales.** Three closely related numbers. **Network Sales** = the chain's tracked channel subset; **Total Sales** = gross revenue; **Chain** is the organization, never a metric suffix. Never write "chain sales".
- **Store vs Branch.** The role is **Store Manager**, but the entity is always a **Branch**. Do not rename `Branch` to `Store` in data models or URLs (`/store-manager/$branchId` is correct).
- **Shopper vs Customer.** Shopper is the picking system; Customer is a person walking into a branch.
- **Trade Management.** The Hebrew UI label ניהול סחר maps to the **Category Manager** route. Use "Category Manager" in code and English copy; "Trade Management" only appears as a page title translation.
- **"מנהל מחלקה" vs "מנהל קטגוריה" — labelling drift inside the simulator.** The role is canonically **Category Manager** in code, English copy, the glossary, and the `/category-manager` route. The promo-simulator Step 1 brief deliberately uses the Hebrew UI label **"מנהל מחלקה"** because the simulator projects ownership at the **Group** level (one of: מכולת, ירקות, חלב, נון פוד, בשר). Same person, same role; the labels reflect different resolution. See `decisions/2026-05-02-promo-simulator-manager-label.md`. Do not "fix" this by renaming the role globally without an explicit decision.
- **Promo-simulator taxonomy is dedicated, not shared.** The promo simulator owns its own four-level taxonomy (Group → Department → Category → Series) in `src/data/mock-promo-taxonomy.ts` and intentionally does **not** use `SEGMENTS_BY_DEPARTMENT` or `DEPARTMENT_NAMES`. Same item may show under different paths in the simulator vs. the operational dashboards. See `decisions/2026-05-02-promo-simulator-taxonomy.md`.
- **Step 4 + 5 are sensitivity-analysis steps, not data-entry duplicates.** `promoType` (Step 3) and `durationWeeks` (Step 1) are **read-only** in Step 4 — to change them you go back. Step 4 owns the financial parameter sliders (price/cost/discount/baseSales/uplift/mktCost/opsCost/cannibPct) and the bottom-line verdict; Step 5 owns scenario comparison and break-even map. See `decisions/2026-05-03-promo-simulator-step4-step5-rebuild.md`.
