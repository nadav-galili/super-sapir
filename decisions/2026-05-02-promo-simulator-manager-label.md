## Decision: Use the UI label "מנהל מחלקה" inside the promo simulator while keeping "Category Manager" as the canonical role name everywhere else

In the promo simulator's Step 1 brief, the read-only field that auto-populates with the responsible person's name is labelled **"מנהל מחלקה"** (Group/Department Manager) and is keyed by the simulator's new top-level **Group** entity (one of: מכולת, ירקות, חלב, נון פוד, בשר). Everywhere else in the application — the `/category-manager` route, all English code identifiers, type names, glossary entries — the role keeps its canonical name **"Category Manager" / "מנהל קטגוריה"**.

Concretely: a new map `GROUP_MANAGERS: Record<Group, string>` lives in `src/data/mock-promo-taxonomy.ts` with five entries (one per Group). The legacy `CATEGORY_MANAGERS` map in `src/data/mock-promo-history.ts` is left untouched for callers outside the simulator.

## Context

The user, when asked who owns the auto-populated manager field after introducing the new "מחלקה" (Group) level, said:

> "השם של מנהל קטג מתעדכן לפי כל בחירה במחלקה.. מנהל קטג הוא בעצם מנהל מחלקה"

— meaning the user equates the existing "Category Manager" role with what they call "מנהל מחלקה" (a manager scoped to one of the five new Groups). This created a labelling mismatch with the rest of the app, where the role is "Category Manager" both in code and UI copy, and where `context.md` defines it as the canonical role responsible for Categories chain-wide within one or more Departments.

Two pressures pulled in opposite directions: faithful UI copy in the simulator vs. terminology consistency across the app and the glossary.

## Alternatives considered

1. **Rename the role globally to "Department Manager / מנהל מחלקה".** Update `context.md`, rename the route `/category-manager` → `/department-manager`, rename type identifiers, retitle every page where "מנהל קטגוריה" appears as a label. Maximum consistency. Rejected as out of proportion to a single field-label change in one wizard step — the role's domain semantics in the rest of the app (owning Categories within Departments) genuinely match "Category Manager" the way the glossary defines it; nothing else broke.

2. **Reject the user's wording and keep the simulator label as "מנהל קטגוריה".** Zero drift. Rejected because the user's wording reflects how the business actually thinks about the role at the Group resolution: one person responsible for all promo activity inside a top-level merchandise grouping.

3. **Localized override (chosen).** The role's canonical English name and code identifiers stay "Category Manager"; only the simulator's UI label is "מנהל מחלקה". A flagged ambiguity entry in `context.md` documents the drift so future contributors don't try to "fix" the inconsistency by renaming.

## Reasoning

- **Blast radius matches the change.** The user's request was about one field on one screen. Changing the role's name globally would touch dozens of files, route URLs, the sidebar, and other dashboards that have nothing to do with the simulator.
- **The role itself didn't change, only the resolution did.** A Category Manager still owns Categories chain-wide within one or more Departments. The simulator just happens to project that ownership at the Group level (because in the simulator's taxonomy, a Group corresponds to exactly the Departments one Category Manager owns). The Hebrew label difference reflects scope, not role identity.
- **`context.md` already tolerates similar drift.** "Region Manager" is the canonical role name even though the existing route URL is `/division-manager` (preserved for URL stability). The same pattern applies here.
- **Easier to reverse than a global rename.** If we later decide "Department Manager" is the right canonical name across the app, this ADR becomes the starting point rather than a reason to fight a half-done rename.

## Trade-offs accepted

- **Two Hebrew labels for the same role in the same app.** Users navigating between the Category Manager dashboard ("מנהל קטגוריה") and the promo simulator ("מנהל מחלקה") will see different names for the same person/role. Documented in `context.md` under "Flagged ambiguities".
- **Two manager-name maps in the data layer.** `CATEGORY_MANAGERS` (keyed by Department-name in Hebrew, used by `mock-promo-history.ts`) and `GROUP_MANAGERS` (keyed by Group, used by the simulator). They will need to stay consistent if the same person owns categories that span both keying schemes — a small but real maintenance burden.
- **Future contributors may be confused.** Mitigated by the flagged-ambiguity entry and by this ADR. The simulator's `mock-promo-taxonomy.ts` should also include a header comment pointing here.
