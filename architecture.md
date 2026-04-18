# Architecture

## File Tree

> **Auto-generate with:** `tree -I 'node_modules|dist|.git|.vite|.playwright-mcp|.netlify|.tanstack|promo-video|.ralph-tui|.cline|.agents|.claude' --dirsfirst`

```
.
├── docs
│   └── superpowers/plans/
├── netlify
│   └── functions/
│       └── ai-analyze.ts              # Netlify serverless function — proxies AI calls
├── public
│   ├── categories/                     # Category thumbnail PNGs (dairy.png, meat.png, …)
│   ├── geojson/                        # GeoJSON data for map views
│   ├── hero/                           # Hero banner & spotlight product images
│   ├── suppliers/                      # Supplier logo images
│   └── favicon.svg, icon.webp, …
├── scripts/                            # One-off generation scripts (Python)
├── src
│   ├── components
│   │   ├── branding/BrandLogo.tsx
│   │   ├── charts/                     # Recharts wrappers (all wrap content in <div dir="ltr">)
│   │   │   ├── BranchComparisonChart.tsx
│   │   │   ├── PromotionDailyChart.tsx
│   │   │   ├── CategoryBubbleChart.tsx
│   │   │   ├── CategoryPriorityMatrix.tsx
│   │   │   ├── ComparisonChart.tsx
│   │   │   ├── DepartmentBarChart.tsx
│   │   │   ├── MonthlyTrendChart.tsx
│   │   │   ├── QualityGauge.tsx
│   │   │   ├── RegionDonutChart.tsx
│   │   │   └── TrendLineChart.tsx
│   │   ├── dashboard/                  # Dashboard section components
│   │   │   ├── HeroBanner.tsx           # Full-width hero with gauge
│   │   │   ├── QuickStatCards.tsx       # 4-stat row (customers, basket, supply, complaints)
│   │   │   ├── KPIGaugeRow.tsx          # Dark gauge strip with 5 KPIs
│   │   │   ├── KPICard.tsx              # Single KPI card with trend badge
│   │   │   ├── KPIGrid.tsx              # Grid wrapper for KPICard
│   │   │   ├── CategorySpotlight.tsx    # Top-4 category image cards
│   │   │   ├── CategoryDonut.tsx        # Sales split donut chart
│   │   │   ├── HeroItemCards.tsx        # Product spotlight cards (stockout, top sales, promo)
│   │   │   ├── BranchPerformanceBars.tsx # Horizontal bar ranking
│   │   │   ├── SupplierSpotlightCards.tsx # 3 supplier highlight cards
│   │   │   ├── SectionHeader.tsx       # Reusable section header with icon + divider
│   │   │   ├── CategorySuppliersDashboard.tsx # Supplier drill-down (category detail page)
│   │   │   ├── CategoryAIBriefing.tsx  # AI analysis card with streaming
│   │   │   ├── PromotionCard.tsx       # Promotion effectiveness table + bars
│   │   │   ├── SupplierLogo.tsx        # Auto-resolves supplier logo from /public/suppliers/
│   │   │   └── AlertsBar, ComparisonToggle, RoleCard, StatBadge
│   │   ├── home/PhoneMockup.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             # RTL sidebar — route-aware, shows store-manager sub-nav
│   │   │   ├── Header.tsx              # Top header with mobile menu trigger
│   │   │   ├── PageContainer.tsx       # Content wrapper with consistent spacing
│   │   │   └── Breadcrumbs.tsx
│   │   ├── map/                        # Leaflet map components (division manager)
│   │   ├── store-manager/              # Store-manager-specific components
│   │   ├── tables/                     # Data tables (TanStack Table + custom)
│   │   │   ├── CategoryPerformanceTable.tsx
│   │   │   ├── PromotionsTable.tsx
│   │   │   ├── SuppliersTable.tsx
│   │   │   ├── BranchRankingTable.tsx
│   │   │   ├── CategoryTable.tsx
│   │   │   └── SortHeader.tsx
│   │   └── ui/                         # shadcn/ui primitives (card, button, badge, sidebar, tabs, …)
│   │                                   #   + Magic UI primitives (number-ticker, border-beam, confetti, shimmer-button)
│   ├── data/
│   │   ├── hadera-real.ts              # Real Hadera branch #44 report data (Dec 2025)
│   │   ├── hadera-branch.ts            # Simplified Branch type for multi-branch system
│   │   ├── mock-branches.ts            # allBranches[12] — Hadera + 11 generated
│   │   ├── mock-categories.ts          # Aggregate category summaries
│   │   ├── mock-category-suppliers.ts  # Per-category supplier breakdowns
│   │   ├── mock-chain-promotions.ts    # Chain-wide promotion data with daily series
│   │   ├── mock-items.ts               # Individual product data (stockout, top sales, promo)
│   │   ├── mock-regions.ts             # Region aggregates (North, Center, South)
│   │   ├── mock-suppliers.ts           # Top suppliers with target/sales/margin
│   │   ├── supplier-logos.ts           # Supplier → logo path mapping
│   │   ├── generators.ts              # Seeded random branch generator
│   │   ├── constants.ts               # Department names, months, shared constants
│   │   └── types.ts                    # Shared TypeScript types (KPICardData, Promotion, …)
│   ├── contexts/
│   │   └── PeriodContext.tsx            # Time-period multiplier context (consumed by all dashboard components)
│   ├── hooks/
│   │   ├── useAnimatedCounter.ts       # Smooth number animation hook
│   │   ├── useAIAnalysis.ts            # Store-manager AI streaming hook
│   │   ├── useCategoryAIAnalysis.ts    # Category AI streaming hook
│   │   └── use-mobile.tsx              # Responsive breakpoint hook
│   ├── lib/
│   │   ├── colors.ts                   # PALETTE, CHART_COLORS, color helper functions
│   │   ├── format.ts                   # Currency, number, percent formatters
│   │   ├── category-manager.ts         # deriveCategorySnapshots(), comparison logic
│   │   ├── ai.ts / ai-cache.ts / category-ai.ts  # AI prompt builders + localStorage cache
│   │   ├── alerts.ts                   # Alert derivation logic
│   │   ├── branding.ts                # Brand name/color config
│   │   └── utils.ts                    # cn() Tailwind merge helper
│   ├── routes/                         # TanStack Router file-based routes
│   │   ├── __root.tsx                  # Root layout — RTL DirectionProvider + SidebarProvider
│   │   ├── index.tsx                   # Home page — role cards
│   │   ├── category-manager/index.tsx  # Trade management (consolidated from V2)
│   │   ├── category-manager/$categoryId.tsx  # Category drill-down (AI briefing, alerts, charts)
│   │   ├── division-manager/index.tsx + $regionId.tsx  # Map + region drill-down
│   │   └── store-manager/index.tsx + $branchId.tsx     # Store manager with view system
│   ├── global.css                      # Tailwind base + custom warm theme variables
│   ├── main.tsx                        # App entry point
│   └── routeTree.gen.ts               # Auto-generated by TanStack Router
├── CLAUDE.md                           # AI coding instructions & design system
├── AGENTS.md
├── changelog.md                        # Reverse-chronological session log (kept current by Claude)
├── decisions/                          # YYYY-MM-DD-{topic}.md — non-trivial architectural choices
├── index.html
├── package.json / bun.lock
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── eslint.config.js
├── postcss.config.js
└── netlify.toml                        # Netlify deploy config (SPA redirects + functions)
```

## Route Map

| Route | Page | Key Components |
|-------|------|----------------|
| `/` | Home | RoleCard |
| `/store-manager` | Store manager (Hadera default) | BranchInfoBar, KPIGrid, view system via `?view=` |
| `/store-manager/$branchId` | Store manager (any branch) | Same as above, branchToFullReport() adapter |
| `/division-manager` | Division manager | IsraelMap, BranchRankingTable, RegionDonutChart |
| `/division-manager/$regionId` | Region drill-down | Region-filtered branch list |
| `/category-manager` | Trade management (ניהול סחר) | HeroBanner, ChainAIBriefing, QuickStatCards, KPIGaugeRow, tabs (categories/suppliers/promotions) |
| `/category-manager/$categoryId` | Category drill-down | KPIGrid, CategoryAIBriefing, CategorySuppliersDashboard, PromotionCard, alerts table |

