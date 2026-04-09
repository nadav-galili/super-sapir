import { createContext, useContext } from 'react'

const PeriodMultiplierContext = createContext(1)

export const PeriodMultiplierProvider = PeriodMultiplierContext.Provider

export function usePeriodMultiplier() {
  return useContext(PeriodMultiplierContext)
}
