# Changelog

> **This file is kept up to date by Claude Code.** Every session that modifies code should append entries here before finishing.
>
> Format: reverse-chronological. Group by date. Each entry: short description + files/areas affected.

---

## 2026-04-09

### Text scaling — 1.5x font enlargement across category-manager screens
- Scaled all text sizes ~1.5x on `category-manager-v2` and `category-manager/$categoryId` pages
- Smallest fonts (`text-[10px]`–`text-[13px]`) bumped to `text-[15px]`–`text-[20px]`
- Chart axis/tooltip font sizes: `fontSize: 11→16`, `fontSize: 12→18`
- Added **Font Sizes — Target Scale** table to `CLAUDE.md` as the standard for all new components
- **Files:** 20+ component files across `components/dashboard/`, `components/charts/`, `components/tables/`, `components/layout/`, and `routes/category-manager/`

### Hero banner header rename
- Changed hero banner title from "מנהל קטגוריה רשתי" to "ניהול סחר"
- **Files:** `components/dashboard/HeroBanner.tsx`

### New route: `category-manager-rog` (classic red/orange/green palette)
- Created `/category-manager-rog` — full copy of V2 with classic ROG KPI colors
- ROG color mapping: cyan→green (`#22C55E`), amber→orange (`#F97316`), warm-red→red (`#EF4444`)
- Created ROG variants of all colored components (14 files):
  - `HeroBannerROG`, `QuickStatCardsROG`, `KPIGaugeRowROG`, `KPICardROG`, `KPIGridROG`
  - `CategorySpotlightROG`, `CategoryDonutROG`, `HeroItemCardsROG`
  - `BranchPerformanceBarsROG`, `BranchComparisonChartROG`
  - `PromotionDailyChartROG`, `PromotionsTableROG`, `SuppliersTableROG`
  - `SupplierSpotlightCardsROG`, `CategoryPerformanceTableROG`
- Added sidebar link "ניהול סחר ROG" with PieChart icon
- **Files:** `routes/category-manager-rog/index.tsx`, `components/layout/Sidebar.tsx`, 14 ROG component files

### Documentation
- Created `architecture.md` — file tree (with regeneration command), route map, ROG vs Modern palette reference
- Created `changelog.md` — this file
- Referenced both in `CLAUDE.md`

---

## 2026-04-06

### Tone guidelines
- Added tone guidelines to AI prompts — no offensive language (`f890e74`)

### API key fallback
- Fallback to `process.env` for API key on draft deploys (`8b644b0`)

### AI caching
- Added localStorage caching for AI analysis with 24h TTL (`9ae3a7d`)

### AI supplier analysis
- Added AI supplier analysis to each category detail page (`e7ff9c5`)

---

## 2026-04-05

### Category supplier dashboards
- Added category supplier dashboards, logos, and branch alerts (`235ad4a`)
- Added suppliers section with table, spotlight cards, and badge fix (`defb7e8`)

### Code quality
- Deduplicated colors, memoized computations, cleaned comments (`dabda28`)

---

## 2026-04-04

### Major visual overhaul
- Dark gauges, photo cards, donut chart, stat bars (`726bffd`)
- Dramatic hero banner with big gauge and photorealistic product images (`697a4ed`)
- Category table half-width with vertical hero cards alongside (`0061c7c`)
- Leading promotion item hero card in 3-column layout (`0bdbbf0`)
- KPI row with gauges, Gemini category icons, table alignment (`08bc41f`)

### Category manager V2
- Branch comparison chart with dual bars and YoY growth line (`814cd0b`)
- Hero item cards for stockout loss leader and top sales (`18eee7d`)
- Category performance table with status badges and navigation (`a41a9cb`)
- Promotion analysis section with daily chart and interactive table (`8e83266`)
- New `category-manager-v2` route with KPI bar and sidebar nav (`b0c0527`)

---

## 2026-04-03

### AI streaming
- Refactored AI streaming: real-time JSONL with typing effect (`8af835f`)
- Added promotions analysis view to category manager (`8fbd840`)

### Responsive fixes
- Fixed mobile responsiveness for category-manager and global layout (`c5cd3f2`)

### Store manager refactor
- Refactored store-manager views: UI consistency, AI separation & cleanup (`d96df7a`)

---

## Earlier (2026-03 and before)

### Category manager enhancements
- Enhanced category manager charts, table columns, and detail page (`6880781`)
- Rebranded with icon (`d9a6b6e`)
- Refactored category-manager with profitability, inventory, promotions & alerts (`6ee9a74`)

### AI features
- Streaming AI analysis with shimmer loading effects (`5b13d26`)
- AI analysis features: morning briefing, anomaly detection, recommendations (`568572d`)

### Store manager
- Comprehensive dashboard layout, HR section, inventory section
- Real Hadera #44 data integration (`6f1f45a`)

### Foundation
- Marketing landing page with eCommerce Warm design system (`ac67221`)
- shadcn sidebar component integration (`7743937`)
- Netlify deploy config with SPA redirects
