# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

RetailSkillz Analytics — a B2B SaaS retail management dashboard MVP built for pitching to Super Sapir (Israeli food retailer). Hebrew RTL interface

## Ubiquitous Language

> **All domain terminology lives in [context.md](./context.md).** Read it before writing code, copy, or commits that reference domain concepts.

This is the shared vocabulary between the user and the agent. It defines canonical terms (Chain, Region, Branch, Department, Category, Store/Region/Category Manager, KPI, Promotion, …), the organizational hierarchy, and **aliases to avoid**. When in doubt about what to call something, the glossary wins. When the glossary conflicts with legacy code, use the canonical term in conversation and new code — see the "Flagged ambiguities" section for known debt.

## Architecture

> Full file tree and route map: **[architecture.md](./architecture.md)**
> Regenerate the tree with: `tree -I 'node_modules|dist|.git|.vite|.playwright-mcp|.netlify|.tanstack|promo-video|.ralph-tui|.cline|.agents|.claude' --dirsfirst`

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

**Semantic / KPI Status (traffic-light system — used for all gauges, AI briefing, status badges)**

- Good / success (>=95% of target): `#10B981` (emerald green)
- Warning / caution (85–95% of target): `#FBBF24` (amber yellow)
- Bad / danger (<85% of target): `#F43F5E` (rose red)
- Neutral / inactive: `#A0AEC0`

All KPI status colors must come from a domain-typed resolver in `src/lib/kpi/resolvers.ts` (e.g. `getSalesColor({ actual, target })`, `getCostColor(...)`, `getQualityColor(...)`, `getGrowthColor({ changePercent })`, `getMarginColor({ marginPercent })`, etc.) — never hardcode thresholds or hex values in components, and never pass direction flags at call sites. Add a new KPI type + resolver in `src/lib/kpi/types.ts` + `resolvers.ts` when the semantics don't match an existing one.

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

**Font Sizes — Target Scale**

All dashboard text should use these sizes (approximately 1.5x standard):

| Role                              | Size    | Tailwind                   |
| --------------------------------- | ------- | -------------------------- |
| Tiny labels (badge, tag, caption) | 15px    | `text-[15px]`              |
| Small labels (stat label, legend) | 16px    | `text-[16px]`              |
| Secondary text (descriptions)     | 18px    | `text-[18px]` or `text-lg` |
| Table body / cell values          | 20px    | `text-[20px]`              |
| Body text / card descriptions     | 18–20px | `text-lg` or `text-xl`     |
| Card titles                       | 20–24px | `text-xl` or `text-2xl`    |
| Section headers                   | 24px    | `text-2xl`                 |
| Page titles                       | 36px    | `text-4xl`                 |
| Hero headings                     | 48–60px | `text-5xl` / `text-6xl`    |
| KPI values (large numbers)        | 30–36px | `text-3xl` / `text-4xl`    |

Chart axis/tooltip font sizes: `fontSize: 16` for axes, `fontSize: 18` for tooltips and X-axis labels.

Do NOT use `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[13px]`, `text-xs` (12px), or `text-sm` (14px) — these are too small for the dashboard aesthetic.

### Motion

Light motion only:

- Scroll-triggered reveals via IntersectionObserver
- Smooth transitions on state changes
- Subtle hover effects (slight lift, soft shadow)

### DO

- Use Lucide icons for all iconography
- Maintain generous white space and clear visual hierarchy
- Keep font sizes >= 15px for labels, >= 18px for body text (see Font Sizes table above)
- Make layouts mobile responsive
- Use the warm color palette above consistently across all screens

### DON'T

- No bright saturated gradients or gradient text
- No emoji icons
- No "revolutionary", "game-changing" marketing copy
- No heavy shadows or busy patterns
- No dark mode
- No border-radius > `rounded-2xl`
- No cramped spacing or tiny fonts (< 15px)

## Changelog

All changes are tracked in **[changelog.md](./changelog.md)**.

**You MUST update `changelog.md` before finishing any session that modifies code.** Append entries under today's date in reverse-chronological order. Each entry: short description + files/areas affected. Group related changes under a `###` heading.

## Decisions

When choosing between alternatives that affect more than today's task — a library, an architecture pattern, an API design, or deciding NOT to do something — log it:

File: /decisions/YYYY-MM-DD-{topic}.md

Format:

## Decision: {what you decided}

## Context: {why this came up}

## Alternatives considered: {what else was on the table}

## Reasoning: {why this option won}

## Trade-offs accepted: {what you gave up}

When about to make a similar decision, grep /decisions/ for prior choices. Follow them unless new information invalidates the reasoning.
