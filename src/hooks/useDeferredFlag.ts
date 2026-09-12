import { useEffect, useState } from 'react'

/** Flip to true after paint / idle — use to defer heavy media. */
export function useDeferredFlag(delayMs = 0) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timeoutId = 0
    let idleId = 0
    let raf = 0

    const go = () => {
      if (!cancelled) setReady(true)
    }

    const schedule = () => {
      if (delayMs > 0) {
        timeoutId = window.setTimeout(go, delayMs)
        return
      }
      const ric = window.requestIdleCallback
      if (typeof ric === 'function') {
        idleId = ric.call(window, go, { timeout: 1200 })
      } else {
        timeoutId = window.setTimeout(go, 200)
      }
    }

    // Wait one frame so poster/UI paints first
    raf = window.requestAnimationFrame(schedule)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(raf)
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [delayMs])

  return ready
}
