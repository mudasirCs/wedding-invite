import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

type Props = {
  videoSrc: string
  poster: string
  handGroom: string
  handBride: string
  playing: boolean
  onTap: () => void
  onPlayEnd: () => void
}

/** Shared slow tap timing — both hands move in unison */
const TAP = {
  duration: 3.2,
  times: [0, 0.38, 0.52, 0.88, 1] as number[],
  ease: 'easeInOut' as const,
  delay: 0.45,
}

/** Sealed wisteria gate with bow — matches recorded demo exactly */
export function SealedScreen({
  videoSrc,
  poster,
  handGroom,
  handBride,
  playing,
  onTap,
  onPlayEnd,
}: Props) {
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

  const ribbonTop = isRtl ? '54%' : '54.5%'

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
        className="absolute inset-0 z-20 cursor-pointer border-0 bg-transparent p-0"
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
                        ? 34
                        : 24
                      : isName
                        ? 36
                        : 26,
                    lineHeight: isRtl ? 1.55 : 1.1,
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

          {/* Elegant label centered on the satin ribbon bow */}
          <div
            className="absolute inset-x-0 flex items-center justify-center"
            style={{
              top: ribbonTop,
              transform: 'translateY(-50%)',
              paddingInline: '2.25rem',
            }}
          >
            <p
              className={`${isRtl ? 'font-formal' : 'font-script'} m-0 max-w-[15rem] text-center`}
              style={{
                fontSize: isRtl ? 22 : 28,
                lineHeight: isRtl ? 1.55 : 1.05,
                letterSpacing: isRtl ? 0 : '0.04em',
                color: '#5c1822',
                fontWeight: isRtl ? 500 : 450,
                textShadow:
                  '0 1px 0 rgba(255,255,255,0.55), 0 0 12px rgba(255,245,250,0.35)',
                WebkitTextStroke: isRtl ? '0.15px #5c1822' : '0.2px #5c1822',
                fontFeatureSettings: 'normal',
                fontVariationSettings: 'normal',
              }}
            >
              {t.ribbonLabel}
            </p>
          </div>

          {/* Soft touch ripple at ribbon center */}
          <motion.span
            className="absolute left-1/2 z-40 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              top: ribbonTop,
              border: '1px solid rgba(201, 137, 154, 0.5)',
              background: 'rgba(255, 248, 252, 0.28)',
            }}
            animate={{
              scale: [0.3, 1.45, 1.9],
              opacity: [0, 0.55, 0],
            }}
            transition={{
              duration: TAP.duration,
              repeat: Infinity,
              ease: 'easeOut',
              times: [0, 0.42, 0.7],
              delay: TAP.delay + TAP.duration * 0.35,
            }}
            aria-hidden
          />

          {/* Groom left + bride right — slowly touch ribbon middle in unison */}
          <div
            className="absolute inset-x-0 z-40"
            style={{ top: ribbonTop, height: 0 }}
            aria-hidden
          >
            {/* Groom — approaches from lower-left */}
            <motion.img
              src={handGroom}
              alt=""
              decoding="async"
              className="absolute h-auto w-[9.5rem] max-w-[44vw] object-contain object-right-top sm:w-[10.25rem]"
              style={{
                right: '50%',
                marginRight: '-0.35rem',
                top: '-0.35rem',
                transformOrigin: '92% 6%',
                filter: 'drop-shadow(0 10px 18px rgba(60, 30, 45, 0.28))',
              }}
              initial={{ opacity: 0, x: -30, y: 40, rotate: -7 }}
              animate={{
                opacity: 1,
                x: [-24, 0, 0, -18, -24],
                y: [34, 0, 0, 26, 34],
                rotate: [-5, 0, 0, -3, -5],
              }}
              transition={{
                opacity: { duration: 0.7, delay: 0.35 },
                x: { ...TAP, repeat: Infinity },
                y: { ...TAP, repeat: Infinity },
                rotate: { ...TAP, repeat: Infinity },
              }}
            />

            {/* Bride — approaches from lower-right */}
            <motion.img
              src={handBride}
              alt=""
              decoding="async"
              className="absolute h-auto w-[9rem] max-w-[42vw] object-contain object-left-top sm:w-[9.75rem]"
              style={{
                left: '50%',
                marginLeft: '-0.35rem',
                top: '-0.35rem',
                transformOrigin: '8% 6%',
                filter: 'drop-shadow(0 10px 18px rgba(60, 30, 45, 0.28))',
              }}
              initial={{ opacity: 0, x: 30, y: 40, rotate: 7 }}
              animate={{
                opacity: 1,
                x: [24, 0, 0, 18, 24],
                y: [34, 0, 0, 26, 34],
                rotate: [5, 0, 0, 3, 5],
              }}
              transition={{
                opacity: { duration: 0.7, delay: 0.35 },
                x: { ...TAP, repeat: Infinity },
                y: { ...TAP, repeat: Infinity },
                rotate: { ...TAP, repeat: Infinity },
              }}
            />
          </div>

          {/* Soft label cue at bottom */}
          <div
            className="absolute inset-x-0 flex justify-center"
            style={{ bottom: 'max(1.85rem, env(safe-area-inset-bottom))' }}
          >
            <motion.div
              className="rounded-full px-5 py-2"
              style={{
                background: 'rgba(255, 248, 252, 0.42)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow:
                  '0 10px 28px rgba(80, 40, 60, 0.12), inset 0 1px 0 rgba(255,255,255,0.55)',
                backdropFilter: 'blur(12px)',
              }}
              animate={{ opacity: [0.7, 1, 0.7], y: [0, -4, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p
                className={`m-0 text-center ${isRtl ? 'font-formal' : 'font-script'}`}
                style={{
                  fontSize: isRtl ? 19 : 20,
                  lineHeight: isRtl ? 1.45 : 1.15,
                  letterSpacing: isRtl ? 0 : '0.04em',
                  color: '#6b1f2a',
                  fontWeight: isRtl ? 600 : 450,
                  textShadow:
                    '0 1px 0 rgba(255,255,255,0.55), 0 0 12px rgba(255,245,250,0.35)',
                }}
              >
                {t.tapToOpen}
              </p>
            </motion.div>
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}
