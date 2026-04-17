import { describe, it, expect } from 'vitest'
import {
  KPI_STATUS,
  getKpiStatusColor,
  getTargetStatusColor,
  getDeltaStatusColor,
} from './colors'

describe('getKpiStatusColor', () => {
  it('returns good for ratio >= 0.95', () => {
    expect(getKpiStatusColor(0.95)).toBe(KPI_STATUS.good)
    expect(getKpiStatusColor(1.0)).toBe(KPI_STATUS.good)
    expect(getKpiStatusColor(1.5)).toBe(KPI_STATUS.good)
  })

  it('returns warning for ratio >= 0.85 and < 0.95', () => {
    expect(getKpiStatusColor(0.85)).toBe(KPI_STATUS.warning)
    expect(getKpiStatusColor(0.90)).toBe(KPI_STATUS.warning)
    expect(getKpiStatusColor(0.9499)).toBe(KPI_STATUS.warning)
  })

  it('returns bad for ratio < 0.85', () => {
    expect(getKpiStatusColor(0.84)).toBe(KPI_STATUS.bad)
    expect(getKpiStatusColor(0.5)).toBe(KPI_STATUS.bad)
    expect(getKpiStatusColor(0)).toBe(KPI_STATUS.bad)
  })
})

describe('getTargetStatusColor', () => {
  describe('higher-is-better (default)', () => {
    it('returns good when actual >= 95% of target', () => {
      expect(getTargetStatusColor(95, 100)).toBe(KPI_STATUS.good)
      expect(getTargetStatusColor(100, 100)).toBe(KPI_STATUS.good)
      expect(getTargetStatusColor(120, 100)).toBe(KPI_STATUS.good)
    })

    it('returns warning when actual is 85-95% of target', () => {
      expect(getTargetStatusColor(85, 100)).toBe(KPI_STATUS.warning)
      expect(getTargetStatusColor(90, 100)).toBe(KPI_STATUS.warning)
      expect(getTargetStatusColor(94, 100)).toBe(KPI_STATUS.warning)
    })

    it('returns bad when actual < 85% of target', () => {
      expect(getTargetStatusColor(84, 100)).toBe(KPI_STATUS.bad)
      expect(getTargetStatusColor(50, 100)).toBe(KPI_STATUS.bad)
      expect(getTargetStatusColor(0, 100)).toBe(KPI_STATUS.bad)
    })

    it('handles boundary at exactly 0.95', () => {
      expect(getTargetStatusColor(950, 1000)).toBe(KPI_STATUS.good)
    })

    it('handles boundary at exactly 0.85', () => {
      expect(getTargetStatusColor(850, 1000)).toBe(KPI_STATUS.warning)
    })
  })

  describe('lower-is-better', () => {
    const opts = { lowerIsBetter: true }

    it('returns good when actual <= 105% of target', () => {
      expect(getTargetStatusColor(100, 100, opts)).toBe(KPI_STATUS.good)
      expect(getTargetStatusColor(105, 100, opts)).toBe(KPI_STATUS.good)
      expect(getTargetStatusColor(80, 100, opts)).toBe(KPI_STATUS.good)
    })

    it('returns warning when actual is 105-115% of target', () => {
      expect(getTargetStatusColor(106, 100, opts)).toBe(KPI_STATUS.warning)
      expect(getTargetStatusColor(115, 100, opts)).toBe(KPI_STATUS.warning)
    })

    it('returns bad when actual > 115% of target', () => {
      expect(getTargetStatusColor(116, 100, opts)).toBe(KPI_STATUS.bad)
      expect(getTargetStatusColor(200, 100, opts)).toBe(KPI_STATUS.bad)
    })
  })

  describe('edge cases', () => {
    it('returns muted when target is 0', () => {
      expect(getTargetStatusColor(100, 0)).toBe('#A0AEC0')
      expect(getTargetStatusColor(0, 0)).toBe('#A0AEC0')
    })

    it('handles actual=0 with non-zero target', () => {
      expect(getTargetStatusColor(0, 100)).toBe(KPI_STATUS.bad)
    })

    it('handles negative values', () => {
      expect(getTargetStatusColor(-10, 100)).toBe(KPI_STATUS.bad)
    })
  })
})

describe('getDeltaStatusColor', () => {
  describe('higher-is-better (default)', () => {
    it('returns good when delta >= deadBand (default 2)', () => {
      expect(getDeltaStatusColor(2)).toBe(KPI_STATUS.good)
      expect(getDeltaStatusColor(5)).toBe(KPI_STATUS.good)
      expect(getDeltaStatusColor(100)).toBe(KPI_STATUS.good)
    })

    it('returns bad when delta <= -deadBand', () => {
      expect(getDeltaStatusColor(-2)).toBe(KPI_STATUS.bad)
      expect(getDeltaStatusColor(-5)).toBe(KPI_STATUS.bad)
      expect(getDeltaStatusColor(-100)).toBe(KPI_STATUS.bad)
    })

    it('returns warning when delta is within dead band', () => {
      expect(getDeltaStatusColor(0)).toBe(KPI_STATUS.warning)
      expect(getDeltaStatusColor(1)).toBe(KPI_STATUS.warning)
      expect(getDeltaStatusColor(1.99)).toBe(KPI_STATUS.warning)
      expect(getDeltaStatusColor(-1)).toBe(KPI_STATUS.warning)
      expect(getDeltaStatusColor(-1.99)).toBe(KPI_STATUS.warning)
    })
  })

  describe('lower-is-better', () => {
    const opts = { lowerIsBetter: true }

    it('returns good when delta is sufficiently negative', () => {
      expect(getDeltaStatusColor(-2, opts)).toBe(KPI_STATUS.good)
      expect(getDeltaStatusColor(-5, opts)).toBe(KPI_STATUS.good)
    })

    it('returns bad when delta is sufficiently positive', () => {
      expect(getDeltaStatusColor(2, opts)).toBe(KPI_STATUS.bad)
      expect(getDeltaStatusColor(10, opts)).toBe(KPI_STATUS.bad)
    })

    it('returns warning within dead band', () => {
      expect(getDeltaStatusColor(0, opts)).toBe(KPI_STATUS.warning)
      expect(getDeltaStatusColor(1, opts)).toBe(KPI_STATUS.warning)
      expect(getDeltaStatusColor(-1, opts)).toBe(KPI_STATUS.warning)
    })
  })

  describe('custom dead band', () => {
    it('uses custom dead band value', () => {
      expect(getDeltaStatusColor(3, { deadBand: 5 })).toBe(KPI_STATUS.warning)
      expect(getDeltaStatusColor(5, { deadBand: 5 })).toBe(KPI_STATUS.good)
      expect(getDeltaStatusColor(-5, { deadBand: 5 })).toBe(KPI_STATUS.bad)
    })

    it('with deadBand=0, zero delta is good (no decline)', () => {
      expect(getDeltaStatusColor(0, { deadBand: 0 })).toBe(KPI_STATUS.good)
      expect(getDeltaStatusColor(0.1, { deadBand: 0 })).toBe(KPI_STATUS.good)
      expect(getDeltaStatusColor(-0.1, { deadBand: 0 })).toBe(KPI_STATUS.bad)
    })
  })

  describe('edge cases', () => {
    it('handles zero delta', () => {
      expect(getDeltaStatusColor(0)).toBe(KPI_STATUS.warning)
    })

    it('handles large negative delta', () => {
      expect(getDeltaStatusColor(-50)).toBe(KPI_STATUS.bad)
    })

    it('handles large positive delta', () => {
      expect(getDeltaStatusColor(50)).toBe(KPI_STATUS.good)
    })
  })
})
