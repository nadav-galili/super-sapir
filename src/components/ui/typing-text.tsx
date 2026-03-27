import { useState, useEffect } from 'react'

interface TypingTextProps {
  text: string
  speed?: number
  animate?: boolean
}

export function TypingText({ text, speed = 12, animate = true }: TypingTextProps) {
  const [length, setLength] = useState(animate ? 0 : text.length)

  useEffect(() => {
    if (!animate) {
      setLength(text.length)
      return
    }

    setLength(0)
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i >= text.length) {
        setLength(text.length)
        clearInterval(interval)
      } else {
        setLength(i)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, animate])

  return (
    <>
      {text.slice(0, length)}
      {length < text.length && <span className="ai-cursor" />}
    </>
  )
}
