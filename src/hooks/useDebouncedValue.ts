import { useEffect, useState } from 'react'

/**
 * Debounce a changing value — consumers only see the stable value once the
 * source has stopped changing for `delay` milliseconds. Useful for animated
 * counters driven by slider drags, so the counter animates to the final value
 * instead of chasing every intermediate tick.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
