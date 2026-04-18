// Cache port + two adapters.
//
// Production uses the existing localStorage-backed cache so cache keys
// stay compatible with entries written by the old hooks. Tests can
// swap in the in-memory adapter to exercise cache hits/misses without
// touching `localStorage`.
import { getFromCache, removeFromCache, setInCache } from "@/lib/ai-cache";
import type { AIInsightResult } from "./types";

export interface AICachePort {
  get(key: string): AIInsightResult | null;
  set(key: string, value: AIInsightResult): void;
  remove(key: string): void;
}

/** Default adapter — delegates to the existing localStorage cache. */
export const localStorageCache: AICachePort = {
  get: (key) => getFromCache<AIInsightResult>(key),
  set: (key, value) => setInCache(key, value),
  remove: (key) => removeFromCache(key),
};

/** In-memory adapter for tests. Each call creates a fresh Map. */
export function createInMemoryCache(): AICachePort {
  const store = new Map<string, AIInsightResult>();
  return {
    get: (key) => store.get(key) ?? null,
    set: (key, value) => {
      store.set(key, value);
    },
    remove: (key) => {
      store.delete(key);
    },
  };
}
