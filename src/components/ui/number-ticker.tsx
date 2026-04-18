import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  value: number
  duration?: number
  delay?: number
  decimalPlaces?: number
  format?: (n: number) => string
  className?: string
  prefix?: string
  suffix?: string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function defaultFormat(n: number, decimalPlaces: number): string {
  return n.toLocaleString('he-IL', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })
}

export function NumberTicker({
  value,
  duration = 800,
  delay = 0,
  decimalPlaces = 0,
  format,
  className,
  prefix,
  suffix,
}: NumberTickerProps) {
  const reduceMotion = useReducedMotion()
  const [animated, setAnimated] = useState<number>(0)
  const animatedRef = useRef<number>(0)
  const rafId = useRef<number>(0)

  useEffect(() => {
    animatedRef.current = animated
  }, [animated])

  useEffect(() => {
    if (reduceMotion) return

    const from = animatedRef.current
    const to = value
    if (from === to) return

    let startTime: number | null = null
    const timeout = window.setTimeout(() => {
      const animate = (time: number) => {
        if (startTime === null) startTime = time
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)
        const next = from + (to - from) * eased
        setAnimated(decimalPlaces > 0 ? +next.toFixed(decimalPlaces) : Math.round(next))
        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate)
        }
      }
      rafId.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      cancelAnimationFrame(rafId.current)
    }
  }, [value, duration, delay, decimalPlaces, reduceMotion])

  const display = reduceMotion ? value : animated
  const formatted = format ? format(display) : defaultFormat(display, decimalPlaces)

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
