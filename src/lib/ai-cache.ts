const STORAGE_PREFIX = 'ai-analysis:'
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CachedEntry<T> {
  data: T
  timestamp: number
}

export function getFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const entry: CachedEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > TTL_MS) {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setInCache<T>(key: string, data: T): void {
  try {
    const entry: CachedEntry<T> = { data, timestamp: Date.now() }
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

export function removeFromCache(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch {
    // ignore
  }
}
