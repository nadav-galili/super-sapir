import { describe, it, expect } from 'vitest'
import { calcMetrics } from './calc'
import { createDefaultState } from './state'

describe('calcMetrics', () => {
  it('computes effective price from unit price and discount', () => {
    const s = createDefaultState()
    s.unitPrice = 20
    s.discountPct = 25
    const m = calcMetrics(s)
    expect(m.effectivePrice).toBeCloseTo(15, 2)
  })

  it('computes unit margin as effective price - unit cost', () => {
    const s = createDefaultState()
    s.unitPrice = 10
    s.unitCost = 6
    s.discountPct = 20
    const m = calcMetrics(s)
    // effectivePrice = 8, margin = 2
    expect(m.unitMargin).toBeCloseTo(2, 2)
  })

  it('computes promo units with uplift', () => {
    const s = createDefaultState()
    s.baseUnits = 1000
    s.upliftPct = 25
    const m = calcMetrics(s)
    expect(m.promoUnits).toBe(1250)
  })

  it('computes break-even units from investment and unit margin', () => {
    const s = createDefaultState()
    s.unitPrice = 10
    s.unitCost = 6
    s.discountPct = 20
    s.baseUnits = 1000
    const m = calcMetrics(s)
    expect(m.breakEvenUnits).toBe(Math.ceil(m.investment / m.unitMargin))
  })

  it('computes stock coverage as stock / promo units in percent', () => {
    const s = createDefaultState()
    s.baseUnits = 1000
    s.upliftPct = 0
    s.stockUnits = 1500
    const m = calcMetrics(s)
    expect(m.stockCoverage).toBe(150)
  })

  it('computes ROI from profit delta vs investment', () => {
    const s = createDefaultState()
    const m = calcMetrics(s)
    // sanity: ROI is a finite integer
    expect(Number.isFinite(m.roi)).toBe(true)
  })

  describe('status enum', () => {
    it('returns notWorthIt when unit margin <= 0', () => {
      const s = createDefaultState()
      s.unitPrice = 10
      s.unitCost = 10
      s.discountPct = 20
      const m = calcMetrics(s)
      expect(m.status).toBe('notWorthIt')
    })

    it('returns notWorthIt when stock coverage < 80%', () => {
      const s = createDefaultState()
      s.baseUnits = 1000
      s.upliftPct = 50 // promo units = 1500
      s.stockUnits = 1100 // ~73%
      const m = calcMetrics(s)
      expect(m.stockCoverage).toBeLessThan(80)
      expect(m.status).toBe('notWorthIt')
    })

    it('returns worthIt when promo profit >= base profit and coverage >= 100', () => {
      const s = createDefaultState()
      s.unitPrice = 20
      s.unitCost = 5
      s.discountPct = 5 // modest discount → keeps margin high
      s.baseUnits = 500
      s.upliftPct = 30
      s.stockUnits = 1000 // plenty of stock
      const m = calcMetrics(s)
      expect(m.stockCoverage).toBeGreaterThanOrEqual(100)
      expect(m.promoProfit).toBeGreaterThanOrEqual(m.baseProfit)
      expect(m.status).toBe('worthIt')
    })

    it('returns needsImprovement when profit is positive but below base profit', () => {
      const s = createDefaultState()
      s.unitPrice = 10
      s.unitCost = 6
      s.discountPct = 30 // aggressive discount
      s.baseUnits = 1000
      s.upliftPct = 5 // small uplift → profit drops below baseline
      s.stockUnits = 2000 // plenty of stock
      const m = calcMetrics(s)
      expect(m.unitMargin).toBeGreaterThan(0)
      expect(m.stockCoverage).toBeGreaterThanOrEqual(100)
      expect(m.promoProfit).toBeLessThan(m.baseProfit)
      expect(m.status).toBe('needsImprovement')
    })
  })

  describe('edge cases', () => {
    it('handles zero baseline units', () => {
      const s = createDefaultState()
      s.baseUnits = 0
      const m = calcMetrics(s)
      expect(m.promoUnits).toBe(0)
      expect(m.stockCoverage).toBe(0)
    })

    it('handles zero stock with positive promo units', () => {
      const s = createDefaultState()
      s.stockUnits = 0
      const m = calcMetrics(s)
      expect(m.stockCoverage).toBe(0)
      expect(m.status).toBe('notWorthIt')
    })
  })
})
