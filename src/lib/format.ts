const currencyFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('he-IL')

const percentFormatter = new Intl.NumberFormat('he-IL', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const compactFormatter = new Intl.NumberFormat('he-IL', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100)
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value)
}

export function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ₪`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K ₪`
  }
  return `${value} ₪`
}
