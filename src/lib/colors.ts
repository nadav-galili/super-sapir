// Design system colors — eCommerce Warm palette
export const PALETTE = {
  red: "#DC4E59",
  cyan: "#2EC4D5",
  violet: "#6C5CE7",
  amber: "#F6B93B",
  muted: "#788390",
  heading: "#2D3748",
  body: "#4A5568",
  bg: "#FDF8F6",
  cardBorder: "#FFE8DE",
  divider: "#FFF0EA",
  separator: "#F5E6DE",
} as const;

// KPI status colors — single source of truth (traffic-light system).
// Consume these from domain-specific resolvers in `@/lib/kpi/resolvers`,
// not by computing a ratio at the call site.
export const KPI_STATUS = {
  good: "#10B981", // emerald green — passing
  warning: "#FBBF24", // amber yellow — borderline
  bad: "#F43F5E", // rose red — failing
} as const;

// Ordered chart colors for multi-series
export const CHART_COLORS = [
  "#DC4E59", // primary metric
  "#2EC4D5", // secondary metric
  "#6C5CE7", // tertiary metric
  "#F6B93B", // fourth metric
  "#788390", // muted / baseline
];

export const GRADIENT_PRESETS = {
  green: { from: "#10B981", to: "#34D399" },
  blue: { from: "#2EC4D5", to: "#5DD8E3" },
  orange: { from: "#F6B93B", to: "#F8CB6B" },
  purple: { from: "#6C5CE7", to: "#8B7FED" },
  teal: { from: "#2EC4D5", to: "#5DD8E3" },
  pink: { from: "#DC4E59", to: "#E8777F" },
  red: { from: "#DC4E59", to: "#E8777F" },
} as const;

export type GradientPreset = keyof typeof GRADIENT_PRESETS;
