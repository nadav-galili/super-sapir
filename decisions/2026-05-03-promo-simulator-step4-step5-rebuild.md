# Decision: Rebuild Steps 4 + 5 of the promo simulator as a financial sensitivity workbench

## Context

The original Steps 4 and 5 of the promo simulator were thin: Step 4 captured `discountPct` plus two free-text fields (`conditionText`, `benefitText`) and a tiny "business translation" card; Step 5 captured `baseUnits` / `unitPrice` / `unitCost` / `upliftPct` / `stockUnits` and showed six KPI cards plus an uplift chart.

A reference HTML simulator (4 internal tabs: Params, Results, Compare scenarios, Break-even) showed a much richer financial-sensitivity workflow that the Category Manager actually needs before approving a promotion: cannibalization, marketing cost, ops cost per unit, three sensitivity scenarios, and a break-even map across discount levels.

We needed to decide: bolt the new behavior on top of the old, replace one step, or replace both.

## Alternatives considered

1. **Merge into a single mega-step (Step 4 absorbs Step 5; simulator goes 9 → 8 steps).** Cleanest information density, but compresses two distinct decisions ("what are my numbers" + "how robust is the plan") into one screen and forces a rename of every downstream step.
2. **Split the new content across Steps 4 and 5 (chosen).** Step 4 = Tab 1 + Tab 2 from the reference (parameters + results / verdict). Step 5 = Tab 3 + Tab 4 (scenario comparison + break-even map). Keeps the 9-step skeleton, keeps URLs stable, separates "set up the bet" from "stress-test the bet".
3. **Replace only Step 4, keep Step 5 as-is.** Causes input duplication: Step 4 would ask for baseSales/uplift/duration, then Step 5 would ask again. User would never reach Step 5 with anything to add.

## Reasoning

Option 2 wins on three axes:

- **Cognitive separation.** Setting parameters and seeing the headline verdict (Step 4) is a different cognitive task than running scenarios and reading the break-even map (Step 5). One mega-step buries the second task; users will scroll past it.
- **URL + step skeleton stability.** The existing routes, deep-links, validation pipeline, and stepper all assume 9 steps. Renumbering touches more files than the actual feature change.
- **AI narrative + KPI panel boundaries.** The existing narrative engine fires per-step on Steps 2–5; splitting the new content into 4 + 5 keeps the narrative cadence working unchanged. The LiveKPIPanel side-rail is removed from Steps 4–5 because the new layout has its own metric strip — keeping it would double-render the same numbers.

`promoType` (Step 3) and `durationWeeks` (Step 1) are deliberately **read-only** in the new Step 4. They are owned by earlier steps; Step 4 displays them but does not let the user re-edit. This avoids drift between the rich `promoType` taxonomy in `taxonomy.ts` (which drives `conditionLabel` / `benefitLabel`) and the 6-button shortlist in the reference HTML. To change them, the user goes back.

The reference HTML's Chart.js charts are reimplemented with Recharts (the codebase standard). The HTML's blue accent (`#185FA5`) is mapped to Retalio's info cyan (`#2EC4D5`); positive/negative deltas use the existing semantic palette (`#10B981` / `#F43F5E`).

New domain terms — Marketing Cost, Operations Cost per Unit, Cannibalization Rate, Scenario, Verdict — are added to `context.md` so Hebrew labels stay canonical across UI, narrative, and PDF report.

## Trade-offs accepted

- **State shape grew.** `SimulatorState` gains `mktCost`, `opsCost`, `cannibPct`, `selectedScenario`. URL search-param codec must encode all four. This is real surface area.
- **Internal tabs are a new pattern.** No other step in the simulator uses internal tabs. Justified because Step 4 has two genuinely separate views (inputs vs. results) and Step 5 has two (compare vs. break-even); collapsing them into vertical scroll would bury the secondary view below the fold.
- **The two free-text fields stayed.** `conditionText` / `benefitText` are not in the reference HTML but they feed `narrative.ts` and the PDF report. Removing them would force narrative + report rewrites; we kept them as small optional inputs above the parameter sliders.
- **Step 5 narrative semantic shifts.** The Step 5 narrative used to discuss forecast confidence and stock coverage; it now discusses scenario sensitivity and break-even. This is a content rewrite, not just a relabel.
- **`stockUnits` becomes vestigial.** The old Step 5 took stock coverage as a first-class concern; the new break-even view does not. We keep `stockUnits` in state for the existing test fixtures and PromoFullReport, but no Step 4/5 UI asks for it. If the next iteration confirms it's never read, remove it.
