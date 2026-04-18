## Decision: Add Magic UI primitives (number-ticker, border-beam, confetti, shimmer-button) to the promo simulator

## Context

The promo simulator at `/category-manager/promo-simulator` was functionally complete after slices #26–#34 but read as "competent SaaS" rather than "wow." The simulator is the centerpiece of the Super Sapir B2B pitch and needed an extra layer of motion polish on the high-stakes screens (decision steps 4–7 + the completion screen) without breaking the warm light aesthetic mandated by `CLAUDE.md`.

## Alternatives considered

1. **Magic UI** — Curated motion-heavy primitives with a light-aesthetic default. Single-file React+Tailwind components, MIT-licensed, copy-paste install. Composes cleanly with `motion/react` (already in the bundle).
2. **Aceternity UI** — Heavier visual style (lots of dark gradients, glassmorphism, rainbow beams). Components ship larger and lean toward the kind of "AI demo" look the design system explicitly bans (no dark mode, no heavy gradients, no border-radius > rounded-2xl). Reskinning would mean rewriting most styles.
3. **Build the four effects ourselves from scratch** — Maximum control but ~3–4 hours of work for components that already exist as canonical implementations. The "wow" delta is too small to justify the spend.
4. **Leave the simulator as-is** — The slice 9 polish pass already covered counter-ups, hover lifts, and step transitions. But the primary CTA, completion moment, and decision panels still felt flat next to industry SaaS demos.

## Reasoning

**Magic UI won** because:

- Its default aesthetic (light surfaces, soft brand-tinted accents) is the closest of any premium-component library to the warm palette the design system mandates. Reskinning to `#DC4E59 / #E8777F / #6C5CE7 / #F6B93B` was a one-line override per component, not a refactor.
- All four target primitives are single-file (~30–80 lines each). Copying source directly avoided shadcn-CLI/Bun-registry friction and let us drop them straight into `src/components/ui/` next to the existing shadcn primitives.
- The components compose with `motion/react`'s `useReducedMotion` hook the codebase already uses elsewhere (`HeroBanner`, `SuccessScreen`, slice 9 polish). Accessibility parity was free.
- `canvas-confetti` is a 22kB dep with a self-contained API and an explicit `disableForReducedMotion` flag — appropriate for a one-shot completion celebration.

**Specific scoping decisions:**

- `BorderBeam` only on steps 4–7 (the decision steps with the live KPI panel) plus the success summary card. Putting it on every step or on the sticky stepper would make the screen feel busy and would dilute the "this is where decisions get made" cue.
- `NumberTicker` only on the `LiveKPIPanel` for now — replacing every numeric value across the simulator (Step 5 KPI cards, Step 7 readiness counters) would balloon scope and create competition with the slice 9 `useAnimatedCounter` work that's already in place. The LiveKPI is the panel users stare at while dragging, so the ticker delivers the most perceptible value there.
- `ShimmerButton` only on the primary continue/finish CTA, not on the secondary "back / restart / reset" buttons. Shimmer everywhere = shimmer nowhere.
- `ConfettiBurst` fires once via a `useRef` guard, not on every re-render. The success screen already had a check-icon spring + staggered button entrance from slice 9; confetti tops the moment without overstaying.

## Trade-offs accepted

- **One extra runtime dep (`canvas-confetti`, ~22kB minified).** Acceptable for a single-screen pitch feature. Could be lazy-loaded later if it ever appears on a critical-path bundle audit.
- **Tailwind config + global.css now own the new keyframes (`border-beam`, `shimmer-sweep`, `narrative-shimmer`, `narrative-text-shimmer`, `narrative-flash`).** Slight surface-area increase, but they're scoped to clearly-named utilities and won't collide with anything.
- **`AINarrative` switched from a setState-driven `isGenerating` flag to key-based CSS animations.** Slightly more declarative and avoids React 19's `react-hooks/no-setState-in-effect` warning, but means the shimmer can't be triggered by anything other than a `joined` content change. That's the only trigger we have today, so it's fine.

## Rejected explicitly

- **Tilt / parallax on the success summary card.** The `PromoSummaryCard` is already used as the source DOM for the html2canvas-based PDF export (`src/lib/promo-simulator/export-pdf.ts`). 3D transforms produce blank or skewed canvases under html2canvas, which would silently break the "Download PDF" button. The success screen gets a calm `BorderBeam duration=14` instead.
- **Permanent text shimmer on the AI narrative.** Distracting on long reads. The shimmer only fires for ~600ms after the underlying content changes.
- **`BorderBeam` on the sticky stepper or the live KPI panel itself.** The stepper renders on every screen and the KPI panel is the single most-glanced element — adding a moving border to either would create perceptual noise on every step.
- **Rainbow / multi-color shimmer.** Single-color foreground sweep only, per the design system's "no bright saturated gradients."
