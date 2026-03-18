import { useEffect, useRef, useState } from 'react'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function useAnimatedCounter(
  target: number,
  duration = 1500,
  delay = 0
): number {
  const [current, setCurrent] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTime.current = null
      const animate = (time: number) => {
        if (startTime.current === null) startTime.current = time
        const elapsed = time - startTime.current
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)
        setCurrent(Math.round(eased * target))

        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate)
        }
      }
      rafId.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(rafId.current)
    }
  }, [target, duration, delay])

  return current
}
