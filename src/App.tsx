import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { InvitePage } from './components/InvitePage'
import { SealedScreen } from './components/SealedScreen'
import { TopChrome } from './components/TopChrome'
import { invite } from './data/invite'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'

type Phase = 'sealed' | 'playing' | 'open'

export default function App() {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<Phase>('sealed')
  const [musicOn, setMusicOn] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (reduced) setPhase('open')
  }, [reduced])

  useEffect(() => {
    document.body.classList.toggle('lock-scroll', phase !== 'open' && !reduced)
    return () => document.body.classList.remove('lock-scroll')
  }, [phase, reduced])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (musicOn && phase === 'open') {
      // Attach src only when needed — avoids downloading the track on first paint
      if (!audio.src) {
        audio.src = invite.media.music
      }
      audio.volume = 0.5
      audio.play().catch(() => setMusicOn(false))
    } else {
      audio.pause()
    }
  }, [musicOn, phase])

  const onPlayEnd = useCallback(() => {
    setPhase('open')
    setMusicOn(true)
  }, [])

  // Warm hero/theme posters while guest reads the sealed screen
  useEffect(() => {
    if (phase !== 'sealed') return
    ;[invite.media.heroImage, invite.media.themePoster].forEach((href) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = href
    })
  }, [phase])

  return (
    <div className="notranslate flex min-h-[100dvh] justify-center overflow-x-hidden bg-[#f5f0e6]">
      <div
        data-invitation-phone-frame="true"
        className="phone-frame relative w-full overflow-x-clip md:shadow-2xl lg:max-w-[390px]"
      >
        <TopChrome
          musicOn={musicOn}
          onToggle={() => setMusicOn((v) => !v)}
          showMusic={phase === 'open' || reduced}
        />

        {/* preload=none: do not fetch the track until music turns on */}
        <audio ref={audioRef} loop preload="none" />

        <AnimatePresence>
          {(phase === 'sealed' || phase === 'playing') && !reduced ? (
            <SealedScreen
              key="sealed"
              videoSrc={invite.media.openingVideo}
              poster={invite.media.sealedPoster}
              playing={phase === 'playing'}
              onTap={() => setPhase('playing')}
              onPlayEnd={onPlayEnd}
            />
          ) : null}
        </AnimatePresence>

        {(phase === 'open' || reduced) && <InvitePage invite={invite} />}
      </div>
    </div>
  )
}
