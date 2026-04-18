// Deterministic seeded pseudo-random helpers used by the data layer
// (branch generation + synthetic full-report inflation).
//
// These are intentionally pure and stateless — each call takes an explicit
// seed + offset pair so the same (seed, offset) always yields the same
// value. No hidden module state, no Math.random().
//
// The underlying function is a simple sin-hash (not cryptographically
// strong, not a real PRNG) — good enough for visually-varied-but-stable
// mock data in a demo dashboard.

export function seededValue(seed: number, offset: number): number {
  const raw = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

export function seededInt(
  seed: number,
  offset: number,
  min: number,
  max: number
): number {
  return Math.round(min + seededValue(seed, offset) * (max - min));
}

export function seededFloat(
  seed: number,
  offset: number,
  min: number,
  max: number,
  digits = 1
): number {
  return +(min + seededValue(seed, offset) * (max - min)).toFixed(digits);
}

export function seededBool(
  seed: number,
  offset: number,
  threshold = 0.5
): boolean {
  return seededValue(seed, offset) > threshold;
}

/**
 * Pick an element from an array deterministically using a seed offset.
 * Stable for the same (seed, offset, array.length).
 */
export function seededPick<T>(
  arr: readonly T[],
  seed: number,
  offset: number
): T {
  if (arr.length === 0) throw new Error("seededPick: empty array");
  const idx =
    Math.abs(Math.round(Math.sin(seed * (offset + 1) * 1.933) * 1000)) %
    arr.length;
  return arr[idx];
}
