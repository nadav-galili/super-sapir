export function getPerformanceColor(score: number, max = 100): string {
  const ratio = score / max
  if (ratio >= 0.8) return '#10b981' // green
  if (ratio >= 0.6) return '#f59e0b' // amber
  if (ratio >= 0.4) return '#f97316' // orange
  return '#ef4444' // red
}

export function getGrowthColor(growth: number): string {
  if (growth > 5) return '#10b981'
  if (growth > 0) return '#6ee7b7'
  if (growth > -5) return '#fbbf24'
  return '#ef4444'
}

export function getTrendColor(isPositive: boolean): string {
  return isPositive ? '#10b981' : '#ef4444'
}

export const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#06b6d4',
  '#84cc16',
  '#a855f7',
  '#e11d48',
  '#0891b2',
  '#65a30d',
  '#7c3aed',
]

export const GRADIENT_PRESETS = {
  green: { from: '#10b981', to: '#059669' },
  blue: { from: '#3b82f6', to: '#2563eb' },
  orange: { from: '#f59e0b', to: '#d97706' },
  purple: { from: '#8b5cf6', to: '#7c3aed' },
  teal: { from: '#14b8a6', to: '#0d9488' },
  pink: { from: '#ec4899', to: '#db2777' },
  red: { from: '#ef4444', to: '#dc2626' },
} as const

export type GradientPreset = keyof typeof GRADIENT_PRESETS
