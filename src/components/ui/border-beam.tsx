import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

interface BorderBeamProps {
  size?: number
  duration?: number
  delay?: number
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
  className?: string
}

export function BorderBeam({
  size = 220,
  duration = 10,
  delay = 0,
  borderWidth = 1.5,
  colorFrom = '#DC4E59',
  colorTo = '#E8777F',
  className,
}: BorderBeamProps) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return null

  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit]',
        '[border:calc(var(--border-width)*1px)_solid_transparent]',
        '![mask-clip:padding-box,border-box] ![mask-composite:intersect]',
        '[mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        'after:absolute after:aspect-square after:w-[calc(var(--size)*1px)]',
        'after:animate-[border-beam_calc(var(--duration)*1s)_infinite_linear]',
        'after:[animation-delay:calc(var(--delay)*1s)]',
        'after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)]',
        'after:[offset-anchor:90%_50%]',
        'after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]',
        className,
      )}
      style={
        {
          '--size': size,
          '--duration': duration,
          '--delay': delay,
          '--border-width': borderWidth,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
    />
  )
}
