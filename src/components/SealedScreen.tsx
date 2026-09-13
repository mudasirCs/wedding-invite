import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

type Props = {
  videoSrc: string
  poster: string
  playing: boolean
  onTap: () => void
  onPlayEnd: () => void
}

/** Sealed wisteria gate with bow — matches recorded demo exactly */
export function SealedScreen({ videoSrc, poster, playing, onTap, onPlayEnd }: Props) {
  const { t, isRtl } = useLanguage()
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
        aria-label={t.tapToOpen}
        disabled={playing}
        onClick={onTap}
      />

      {!playing ? (
        <div className="pointer-events-none absolute inset-0 z-30">
          {/* Three-line dedication, centered in the sky above the ribbon */}
          <div
            className="absolute inset-x-0 flex flex-col items-center justify-center text-center"
            style={{
              top: isRtl ? '32%' : '33%',
              transform: 'translateY(-50%)',
              paddingInline: '1.75rem',
            }}
          >
            {t.envelopeLines.map((line, i) => {
              const isName = i === 1 || i === 3
              return (
                <p
                  key={`${line}-${i}`}
                  className={`${isName ? 'font-headline' : 'font-script'} m-0 w-full max-w-[18rem] text-center`}
                  style={{
                    fontSize: isRtl
                      ? isName
                        ? 30
                        : 22
                      : isName
                        ? 36
                        : 26,
                    lineHeight: isRtl ? 1.7 : 1.1,
                    color: '#6b1f2a',
                    textShadow:
                      '0 1px 0 rgba(255,255,255,0.45), 0.3px 0 currentColor, -0.3px 0 currentColor',
                    marginTop: i === 0 ? 0 : isRtl ? 2 : 3,
                    fontWeight: isName ? 550 : 450,
                    fontFeatureSettings: 'normal',
                    fontVariationSettings: 'normal',
                    textTransform: 'none',
                    WebkitTextStroke: isName ? '0.3px #6b1f2a' : '0.18px #6b1f2a',
                  }}
                >
                  {line}
                </p>
              )
            })}
          </div>
          <p
            className="absolute inset-x-0 text-center font-script"
            style={{
              bottom: '4.5%',
              fontSize: isRtl ? 16 : 16,
              color: '#6b1f2a',
              lineHeight: isRtl ? 1.85 : 1.25,
            }}
          >
            {t.tapToOpen}
          </p>
        </div>
      ) : null}
    </motion.div>
  )
}
