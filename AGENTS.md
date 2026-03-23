# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Sapir Analytics — a B2B SaaS retail management dashboard MVP built for pitching to Super Sapir (Israeli food retailer). Hebrew RTL interface showing real data from a Hadera branch #44 management report (Dec 2025) combined with simulated multi-branch data.

## Commands

- `bun run dev` — Start dev server (Vite)
- `bun run build` — TypeScript check + production build (`tsc -b && vite build`)
- `bun run lint` — ESLint
- `bun run preview` — Serve production build

## Architecture

**Runtime**: Bun + Vite 8 + React 19 + TypeScript
**Routing**: TanStack Router (file-based, auto-generates `src/routeTree.gen.ts`)
**Styling**: Tailwind CSS 3 + shadcn/ui pattern (components in `src/components/ui/`)
**Charts**: Recharts 3 — all chart components wrap content in `<div dir="ltr">` since chart axes are universal LTR
**Maps**: Leaflet + react-leaflet (division manager page)
**Animations**: Motion (Framer Motion v12+) — imported as `motion/react`
**Path alias**: `@/` maps to `src/`

### RTL Layout

The entire app is RTL Hebrew (`<html dir="rtl" lang="he">`). Key conventions:
- Sidebar is fixed to the **right** (`right-0`), content uses `ms-[280px]` (margin-inline-start = margin-right in RTL)
- Use `ms-`/`me-`/`ps-`/`pe-` (logical properties), not `ml-`/`mr-` for layout margins
- Radix DirectionProvider wraps app with `dir="rtl"` in `__root.tsx`
- Numbers and currency are always rendered `dir="ltr"` even inside Hebrew text

### Data Layer

Two tiers of data for the Hadera branch:
- `src/data/hadera-real.ts` — Comprehensive typed data extracted from the actual PDF management report (sales, targets, departments, operations, HR staffing, compliance, expenses, 12-month trends). Used by the store-manager page.
- `src/data/hadera-branch.ts` — Simplified `Branch` type used by the multi-branch system (home page, division manager, category manager).
- `src/data/mock-branches.ts` — 11 additional branches generated from Hadera baseline via `generators.ts`. The `allBranches` array (12 total) is used across all pages.
- `src/data/mock-regions.ts` / `mock-categories.ts` — Aggregate views computed from `allBranches`.

### Store Manager View System

The store-manager route uses URL search params (`?view=overview|inventory|hr|departments|costs|quality|reports|alerts`) via TanStack Router's `validateSearch`. The Sidebar component (`src/components/layout/Sidebar.tsx`) is route-aware — when on `/store-manager`, it shows category navigation items that set the `view` param. Each view renders different KPI cards and content sections from the same report data.

For non-Hadera branches, `branchToFullReport()` in the store-manager page adapts the simpler `Branch` type into the full report shape using seeded deterministic random values.

### Fonts

- **Rubik** — primary UI font (Hebrew + Latin), good typography hierarchy
- **Fira Code** / **SF Mono** — monospace font for numeric values, hex codes (`font-mono` class)

Both loaded locally via `@fontsource` packages.

## Design System — MUST FOLLOW

### Aesthetic Direction

Light, minimal, clean, modern — shadcn aesthetic. Plenty of white space, good typography hierarchy, mobile responsive.

### Color Palette — eCommerce Warm

**Backgrounds**
- Page background: `#FDF8F6` (warm off-white)
- Card / surface: `#FFFFFF` with border `#FFE8DE`
- Card hover shadow: `rgba(220, 78, 89, 0.08)`

**Accent Colors**
- Primary / CTA: `#DC4E59` (warm red)
- Secondary / Info: `#2EC4D5` (cyan-teal)
- Tertiary / Chart accent: `#6C5CE7` (violet)
- Warning: `#F6B93B` (amber)

**Text**
- Heading / primary text: `#2D3748`
- Body text: `#4A5568`
- Muted / secondary text: `#A0AEC0`
- On-primary (white surfaces): `#FFFFFF`

**Semantic**
- Success / positive change: `#2EC4D5`
- Danger / negative change: `#DC4E59`
- Warning / caution: `#F6B93B`
- Neutral / inactive: `#A0AEC0`

**Gradients**
- Primary button: `linear-gradient(135deg, #DC4E59, #E8777F)`
- Info accent: `linear-gradient(135deg, #2EC4D5, #5DD8E3)`
- Chart bar fill: primary color at 18% opacity (e.g. `rgba(220, 78, 89, 0.18)`)

**Chart Colors (ordered for multi-series)**
1. `#DC4E59` — primary metric
2. `#2EC4D5` — secondary metric
3. `#6C5CE7` — tertiary metric
4. `#F6B93B` — fourth metric
5. `#A0AEC0` — muted / baseline

**Borders & Dividers**
- Card border: `#FFE8DE`
- Table divider: `#FFF0EA`
- Section separator: `#F5E6DE`

**Border Radius**
- Cards: `16px`
- Buttons: `10px`
- Chips / badges: `20px`
- Bar chart columns: `4px`
- Progress bars: `5px`

### Motion

Light motion only:
- Scroll-triggered reveals via IntersectionObserver
- Smooth transitions on state changes
- Subtle hover effects (slight lift, soft shadow)

### DO

- Use Lucide icons for all iconography
- Maintain generous white space and clear visual hierarchy
- Keep font sizes >= 14px for body text
- Make layouts mobile responsive
- Use the warm color palette above consistently across all screens

### DON'T

- No bright saturated gradients or gradient text
- No emoji icons
- No "revolutionary", "game-changing" marketing copy
- No heavy shadows or busy patterns
- No dark mode
- No border-radius > `rounded-2xl`
- No cramped spacing or tiny fonts (< 14px)
