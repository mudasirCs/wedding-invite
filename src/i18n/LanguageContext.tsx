import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { en } from './content/en'
import { ps } from './content/ps'
import type { InviteCopy, Lang } from './types'

const STORAGE_KEY = 'wedding-invite-lang'
const PS_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap'

const catalogs: Record<Lang, InviteCopy> = { en, ps }

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: InviteCopy
  dir: 'ltr' | 'rtl'
  isRtl: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'ps' || v === 'en') return v
  } catch {
    /* ignore */
  }
  return 'en'
}

function ensurePashtoFonts() {
  if (document.getElementById('ps-fonts')) return
  const link = document.createElement('link')
  link.id = 'ps-fonts'
  link.rel = 'stylesheet'
  link.href = PS_FONTS_HREF
  document.head.appendChild(link)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    typeof window === 'undefined' ? 'en' : readStoredLang(),
  )

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ps' : 'en')
  }, [lang, setLang])

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang === 'ps' ? 'ps' : 'en'
    root.dir = lang === 'ps' ? 'rtl' : 'ltr'
    document.body.dataset.lang = lang
    if (lang === 'ps') ensurePashtoFonts()
  }, [lang])

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: catalogs[lang],
      dir: lang === 'ps' ? 'rtl' : 'ltr',
      isRtl: lang === 'ps',
    }),
    [lang, setLang, toggleLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
