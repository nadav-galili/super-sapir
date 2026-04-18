import { describe, it, expect } from 'vitest'
import { narrativeFor } from './narrative'
import { createDefaultState } from './state'
import type { SimulatorState } from './state'

function stateWith(overrides: Partial<SimulatorState>): SimulatorState {
  return { ...createDefaultState(), ...overrides }
}

describe('narrativeFor', () => {
  it('returns an empty array for steps that have no narrative (1, 6, 7, 8, 9)', () => {
    for (const step of [1, 6, 7, 8, 9] as const) {
      expect(narrativeFor(stateWith({ step }))).toEqual([])
    }
  })

  describe('step 2 — goal', () => {
    it('prompts the user to pick a goal when empty', () => {
      const s = stateWith({ step: 2, goal: '' })
      const paragraphs = narrativeFor(s)
      expect(paragraphs.length).toBe(1)
      expect(paragraphs[0]).toContain('בחירת המטרה')
    })

    it.each([
      ['משיכת קונים'],
      ['הגדלת סל'],
      ['קניה חוזרת / נאמנות'],
      ['סטוק / מלאי'],
      ['אחר / חוצה קטגוריות'],
    ] as const)('returns goal-specific narrative for "%s"', (goal) => {
      const s = stateWith({ step: 2, goal })
      const paragraphs = narrativeFor(s)
      expect(paragraphs.length).toBeGreaterThanOrEqual(2)
      expect(paragraphs[0]).toBeTruthy()
    })
  })

  describe('step 3 — promo type', () => {
    it('prompts when no promo type is chosen', () => {
      const s = stateWith({ step: 3, goal: 'משיכת קונים', promoType: '' })
      expect(narrativeFor(s)[0]).toContain('בחירת סוג המבצע')
    })

    it('returns override narrative for known goal+promoType combos', () => {
      const s = stateWith({
        step: 3,
        goal: 'סטוק / מלאי',
        promoType: 'מבצעי הוזלה',
      })
      const paragraphs = narrativeFor(s)
      expect(paragraphs[0]).toContain('פינוי מלאי')
    })

    it('falls back to generic commentary for unmatched combos', () => {
      const s = stateWith({
        step: 3,
        goal: 'משיכת קונים',
        promoType: 'קופונים דיגיטליים',
      })
      const paragraphs = narrativeFor(s)
      // Generic template mentions the chosen promo name in quotes
      expect(paragraphs[0]).toContain('קופונים דיגיטליים')
    })
  })

  describe('step 4 — terms: discount thresholds', () => {
    it('warns on aggressive discount (>25%)', () => {
      const s = stateWith({ step: 4, discountPct: 30 })
      const text = narrativeFor(s).join(' ')
      expect(text).toContain('משמעותית')
    })

    it('suggests stronger benefit on low discount (<10%)', () => {
      const s = stateWith({ step: 4, discountPct: 5 })
      const text = narrativeFor(s).join(' ')
      expect(text).toContain('צנועה')
    })

    it('treats mid-range discount (10-25%) as reasonable', () => {
      const s = stateWith({ step: 4, discountPct: 15 })
      const text = narrativeFor(s).join(' ')
      expect(text).toContain('סביר')
    })
  })

  describe('step 5 — forecast: status interpretation', () => {
    it('flags notWorthIt when unit margin is negative', () => {
      // Aggressive discount -> negative margin after discount
      const s = stateWith({
        step: 5,
        discountPct: 99,
        unitPrice: 10,
        unitCost: 8,
        baseUnits: 1000,
        stockUnits: 2000,
      })
      const text = narrativeFor(s).join(' ')
      expect(text).toContain('המרווח')
    })

    it('flags notWorthIt when stock coverage is too low', () => {
      const s = stateWith({
        step: 5,
        discountPct: 5,
        unitPrice: 10,
        unitCost: 5,
        baseUnits: 1000,
        upliftPct: 50,
        stockUnits: 10, // way too low
      })
      const text = narrativeFor(s).join(' ')
      expect(text).toContain('כיסוי המלאי')
    })

    it('reports ROI on worthIt forecasts', () => {
      const s = stateWith({
        step: 5,
        discountPct: 10,
        unitPrice: 20,
        unitCost: 10,
        baseUnits: 1000,
        upliftPct: 25,
        stockUnits: 5000,
      })
      const text = narrativeFor(s).join(' ')
      expect(text).toMatch(/ROI/)
    })
  })
})
