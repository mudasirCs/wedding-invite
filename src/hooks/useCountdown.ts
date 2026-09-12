import { useEffect, useState } from 'react'

export type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function useCountdown(dateISO: string): CountdownParts {
  const calc = (): CountdownParts => {
    const diff = new Date(dateISO).getTime() - Date.now()
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
    }
    const days = Math.floor(diff / 86_400_000)
    const hours = Math.floor((diff % 86_400_000) / 3_600_000)
    const minutes = Math.floor((diff % 3_600_000) / 60_000)
    const seconds = Math.floor((diff % 60_000) / 1000)
    return { days, hours, minutes, seconds, done: false }
  }

  const [parts, setParts] = useState(calc)

  useEffect(() => {
    const id = window.setInterval(() => setParts(calc()), 1000)
    return () => window.clearInterval(id)
  }, [dateISO])

  return parts
}
