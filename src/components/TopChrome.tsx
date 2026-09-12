import { useLanguage } from '../i18n/LanguageContext'

type Props = {
  musicOn: boolean
  onToggle: () => void
  showMusic?: boolean
}

export function TopChrome({ musicOn, onToggle, showMusic = true }: Props) {
  const { lang, toggleLang, t } = useLanguage()

  return (
    <>
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] z-[60] end-[max(1rem,env(safe-area-inset-right))] lg:end-[calc(50%-195px+1rem)]">
        <button
          type="button"
          onClick={toggleLang}
          className="font-ui flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-2 text-sm shadow-md backdrop-blur-sm"
          aria-label={lang === 'en' ? 'Switch to Pashto' : 'Switch to English'}
        >
          <GlobeIcon />
          <span className="text-xs tracking-wide" dir="auto">
            {lang === 'en' ? 'پښتو' : 'EN'}
          </span>
        </button>
      </div>

      {showMusic ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={musicOn ? t.muteMusic : t.playMusic}
          aria-pressed={musicOn}
          className="fixed end-[max(1rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#3a3a3a] text-white shadow-lg lg:end-[calc(50%-195px+1rem)]"
        >
          {musicOn ? <SpeakerIcon /> : <SpeakerOffIcon />}
        </button>
      ) : null}
    </>
  )
}

function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function SpeakerOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" x2="17" y1="9" y2="15" />
      <line x1="17" x2="23" y1="9" y2="15" />
    </svg>
  )
}
