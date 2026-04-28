import { useReducedMotion } from "motion/react";
import { useIsMobile } from "./use-mobile";

/**
 * True when the user prefers reduced motion OR is on a small viewport.
 * Components use this to swap perpetual loops, magnetic effects, and
 * scroll-driven choreography for static states on mobile.
 */
export function useLightMotion(): boolean {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  return Boolean(reduced) || isMobile;
}
