// Design system colors — eCommerce Warm palette
export const PALETTE = {
  red: '#DC4E59',
  cyan: '#2EC4D5',
  violet: '#6C5CE7',
  amber: '#F6B93B',
  muted: '#A0AEC0',
  heading: '#2D3748',
  body: '#4A5568',
  bg: '#FDF8F6',
  cardBorder: '#FFE8DE',
  divider: '#FFF0EA',
  separator: '#F5E6DE',
} as const

// KPI status colors — single source of truth (traffic-light system)
export const KPI_STATUS = {
  good: '#10B981',    // emerald green — >=95% of target
  warning: '#FBBF24', // amber yellow — 85-95% of target
  bad: '#F43F5E',     // rose red — <85% of target
} as const

/**
 * Returns the KPI status color based on a performance ratio (value / target).
 * >= 0.95 → good (green)  |  >= 0.85 → warning (yellow)  |  < 0.85 → bad (red)
 */
export function getKpiStatusColor(ratio: number): string {
  if (ratio >= 0.95) return KPI_STATUS.good
  if (ratio >= 0.85) return KPI_STATUS.warning
  return KPI_STATUS.bad
}

export function getPerformanceColor(score: number, max = 100): string {
  const ratio = score / max
  if (ratio >= 0.8) return PALETTE.cyan
  if (ratio >= 0.6) return PALETTE.amber
  return PALETTE.red
}

export function getGrowthColor(growth: number): string {
  if (growth > 0) return PALETTE.cyan
  if (growth === 0) return PALETTE.muted
  return PALETTE.red
}

export function getTrendColor(isPositive: boolean): string {
  return isPositive ? PALETTE.cyan : PALETTE.red
}

export function getTargetColor(achievementPercent: number): string {
  if (achievementPercent < 90) return PALETTE.red
  if (achievementPercent < 100) return PALETTE.amber
  return PALETTE.cyan
}

export function getMarginColor(marginPercent: number): string {
  return marginPercent < 20 ? PALETTE.red : PALETTE.heading
}

// Ordered chart colors for multi-series
export const CHART_COLORS = [
  '#DC4E59', // primary metric
  '#2EC4D5', // secondary metric
  '#6C5CE7', // tertiary metric
  '#F6B93B', // fourth metric
  '#A0AEC0', // muted / baseline
]

export const GRADIENT_PRESETS = {
  green: { from: '#2EC4D5', to: '#5DD8E3' },
  blue: { from: '#2EC4D5', to: '#5DD8E3' },
  orange: { from: '#F6B93B', to: '#F8CB6B' },
  purple: { from: '#6C5CE7', to: '#8B7FED' },
  teal: { from: '#2EC4D5', to: '#5DD8E3' },
  pink: { from: '#DC4E59', to: '#E8777F' },
  red: { from: '#DC4E59', to: '#E8777F' },
} as const

export type GradientPreset = keyof typeof GRADIENT_PRESETS
