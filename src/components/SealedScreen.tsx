import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

type Props = {
  videoSrc: string
  poster: string
  message: string
  playing: boolean
  onTap: () => void
  onPlayEnd: () => void
}

/** Sealed wisteria gate with bow — matches recorded demo exactly */
export function SealedScreen({
  videoSrc,
  poster,
  message,
  playing,
  onTap,
  onPlayEnd,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const ended = useRef(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!playing) {
      v.pause()
      try {
        v.currentTime = 0
      } catch {
        /* ignore */
      }
      return
    }
    ended.current = false
    const finish = () => {
      if (ended.current) return
      ended.current = true
      onPlayEnd()
    }
    const onTime = () => {
      // Cut before the bright god-ray / white flash
      if (v.currentTime >= 2.85) finish()
    }
    v.addEventListener('ended', finish)
    v.addEventListener('timeupdate', onTime)
    v.play().catch(() => setTimeout(finish, 400))
    const safety = setTimeout(finish, 3200)
    return () => {
      v.removeEventListener('ended', finish)
      v.removeEventListener('timeupdate', onTime)
      clearTimeout(safety)
    }
  }, [playing, onPlayEnd])

  return (
    <motion.div
      className="absolute inset-0 z-50 overflow-hidden bg-[#e8dff0]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full"
        src={videoSrc}
        poster={poster}
        playsInline
        muted
        preload="auto"
        style={{ objectFit: 'cover', objectPosition: 'center center' }}
      />

      <button
        type="button"
        className="absolute inset-0 z-20 border-0 bg-transparent p-0"
        aria-label="Tap to open"
        disabled={playing}
        onClick={onTap}
      />

      {!playing ? (
        <div className="pointer-events-none absolute inset-0 z-30">
          {/* Message sits just below the bow, above the railing */}
          <p
            className="absolute inset-x-6 text-center"
            style={{
              top: '54%',
              fontFamily: '"Great Vibes", cursive',
              fontSize: 28,
              color: '#6b1f2a',
              textShadow: '0 1px 0 rgba(255,255,255,0.35)',
            }}
          >
            {message}
          </p>
          <p
            className="absolute inset-x-0 text-center"
            style={{
              bottom: '4.5%',
              fontFamily: '"Great Vibes", cursive',
              fontSize: 16,
              color: '#6b1f2a',
            }}
          >
            Tap to open
          </p>
        </div>
      ) : null}
    </motion.div>
  )
}
