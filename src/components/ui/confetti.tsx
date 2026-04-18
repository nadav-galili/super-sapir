import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'

interface ConfettiBurstProps {
  /** Burst once after mount; never refires unless `key` changes. */
  fire?: boolean
  particleCount?: number
  spread?: number
  startVelocity?: number
  ticks?: number
  origin?: { x: number; y: number }
  colors?: string[]
}

export function ConfettiBurst({
  fire = true,
  particleCount = 180,
  spread = 90,
  startVelocity = 45,
  ticks = 160,
  origin = { x: 0.5, y: 0.18 },
  colors = ['#DC4E59', '#2EC4D5', '#6C5CE7', '#F6B93B'],
}: ConfettiBurstProps) {
  const reduceMotion = useReducedMotion()
  const hasFired = useRef(false)

  useEffect(() => {
    if (!fire || reduceMotion || hasFired.current) return
    hasFired.current = true
    confetti({
      particleCount,
      spread,
      startVelocity,
      ticks,
      origin,
      colors,
      disableForReducedMotion: true,
      scalar: 0.95,
    })
  }, [fire, reduceMotion, particleCount, spread, startVelocity, ticks, origin, colors])

  return null
}
