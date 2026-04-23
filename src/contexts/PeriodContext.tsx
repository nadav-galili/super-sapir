import { createContext, useContext } from "react";
import type { TimePeriod } from "@/components/dashboard/TimePeriodFilter";

const PeriodMultiplierContext = createContext(1);
const SelectedPeriodContext = createContext<TimePeriod>({ type: "yearly" });

export const PeriodMultiplierProvider = PeriodMultiplierContext.Provider;
export const SelectedPeriodProvider = SelectedPeriodContext.Provider;

export function usePeriodMultiplier() {
  return useContext(PeriodMultiplierContext);
}

export function useSelectedPeriod() {
  return useContext(SelectedPeriodContext);
}
