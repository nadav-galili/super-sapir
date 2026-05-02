## Decision: Promo Simulator uses a dedicated 4-level taxonomy, not the chain-wide Department/Segment data

The promo simulator (`/category-manager/promo-simulator`, Step 1 brief) uses a self-contained taxonomy in `src/data/mock-promo-taxonomy.ts` that defines four levels — **Group → Department → Category → Series** — plus a separate **Sub-category → Suppliers** mapping in `src/data/mock-subcategory-suppliers.ts` and a **Supplier × Sub-category → Series** mapping in `src/data/mock-supplier-series.ts`. The simulator does **not** read the chain-wide `SEGMENTS_BY_DEPARTMENT` (`src/data/mock-taxonomy.ts`), `DEPARTMENT_NAMES` (`src/data/constants.ts`), or `CATEGORY_SUPPLIERS` (`src/data/mock-category-suppliers.ts`). Suppliers are extended in-place inside `src/data/mock-suppliers.ts` (no parallel file).

The simulator covers exactly five Groups: **מכולת, ירקות, חלב, נון פוד, בשר**. Six Departments from the chain-wide taxonomy (`frozen`, `bread`, `pastries`, `organic`, `baby`, `deli` leftovers) are intentionally **out of scope** for the simulator until a Group is explicitly added for them.

## Context

The Category Manager asked for the Step 1 brief to add three new fields above the existing Category dropdown: **מחלקה (Group)**, **קטגוריה (Department)**, **תת-קטגוריה (Category / Segment)**, plus a new **סדרה (Series)** field between Supplier and Item.

The conflict: the user's vocabulary disagreed with the project's canonical glossary (`context.md`) on two fronts.

1. **Hierarchy depth.** The glossary defines exactly three levels: Chain → Department → Category → Item, and explicitly flags as code debt that the legacy `SEGMENTS_BY_DEPARTMENT` calls "Categories" what should one day be renamed. The user wanted four levels (their Group/Category/Sub-category/Supplier-Series-Item).

2. **Taxonomy content.** The user's example Groups did not align with the existing 14 `DEPARTMENT_NAMES`. For example, "שתייה" exists today as its own Department (`drinks`) with five Segments, but the user wanted it as a Category under a new "מכולת" Group. "גבינות צהובות" exists today as a Segment (`dairy-cheese-yellow`), but the user wanted it as a Category under a new "חלב" Group. The granularities did not match cleanly across Groups.

Mapping the user's request to the existing data would either break the Store Manager / Region Manager dashboards (which depend on the current `SEGMENTS_BY_DEPARTMENT` shape) or require throwing away the user's example data.

## Alternatives considered

1. **Force the simulator onto the existing global taxonomy.** Add a top-level Group concept that maps over groups of existing Departments, treat the existing Department as "Category", and the existing Segment as "Sub-category". Keeps one data source. Rejected because the user's listed Categories (גבינות לבנות, מוצרי יסוד, סירים, מארזים) don't all exist as Departments today, so the example would not survive intact, and re-cutting `vegetables` into "פירות / ירקות / מארזים" would force changes to dashboards that have nothing to do with promotions.

2. **Add a fourth "Sub-category" level globally and update the glossary to match the user's 4-level model.** Most faithful to the user's words. Rejected because it permanently locks the project into level-naming where "Category" in the simulator means a different scope than "Category" in the Category Manager dashboard, doubling the terminology debt the glossary already flags.

3. **Hybrid: simulator overlays Group as a UI filter on top of the existing taxonomy.** Decision-by-postponement. Rejected as falling between the chairs.

4. **Dedicated simulator taxonomy (chosen).** Self-contained. The simulator becomes the single owner of its own taxonomy; the chain-wide data stays untouched.

## Reasoning

- **Honors the user's example data 1:1.** The simulator can carry "פירות / ירקות / מארזים" as Categories under "ירקות" without forcing the `vegetables` Department in the dashboards to be re-cut.
- **No blast radius outside the simulator.** Store Manager, Region Manager, and the existing Category Manager category-list pages all keep using the current `DEPARTMENT_NAMES` / `SEGMENTS_BY_DEPARTMENT` data unchanged.
- **Treats the simulator as a what-if planning surface.** The Category Manager exploring promotions doesn't need their workspace tied to operational department breakdowns the Store Manager sees.
- **Suppliers stay shared.** Supplier identities live in one place (`mock-suppliers.ts`); only the _mapping_ to the simulator's taxonomy is new (`mock-subcategory-suppliers.ts`). Avoids parallel supplier rosters that could drift apart.
- **Series is genuinely new.** No existing data captures brand-line groupings within a supplier (e.g. ויסוצקי → תה ירוק / חליטות / מג'יק). It only makes sense at the simulator's resolution.

## Trade-offs accepted

- **Same item can appear under different paths in different surfaces.** A bottle of Coca-Cola may show under `מכולת → שתייה → שתייה קרה → קוקה קולה` in the simulator and under `שתיה → משקאות מוגזים` in the Store Manager dashboard. The user accepted this; the simulator is for promo planning, not operational reconciliation.
- **Six chain-wide Departments are unsupported in the simulator.** `frozen`, `bread`, `pastries`, `organic`, `baby`, and the non-cheese `deli` Segments cannot be promo-simulated until someone explicitly adds a Group for them. The user accepted this as a v2 problem ("if a לחם manager wants the simulator, that's a separate initiative").
- **Suppliers list grows ~3×.** Need ~30–40 suppliers to populate every (sub-category) bucket realistically, vs. ~14 today. Adds maintenance surface. The user explicitly approved this ("תוסיף").
- **Parallel data files duplicate domain shape.** `Group → Department → Category` in the simulator overlaps conceptually with `Chain → Department → Segment` in the global taxonomy. Future contributors may be tempted to "unify" them; the README in `mock-promo-taxonomy.ts` should warn against this.
- **`CATEGORY_MANAGERS` keying changes from Department-name to Group-name.** Five new manager names hard-coded for the five Groups. The chain-wide `mock-promo-history.ts` callers that expected Department-keyed managers will break — they need to be migrated or the map duplicated. (See companion ADR `2026-05-02-promo-simulator-manager-label.md`.)
