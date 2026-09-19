import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

type NavItem = {
  id: string
  label: string
  icon: 'home' | 'venue' | 'schedule' | 'contacts' | 'rsvp'
}

export function FloatingNav() {
  const { t, isRtl } = useLanguage()
  const [active, setActive] = useState('hero')

  const items: NavItem[] = [
    { id: 'hero', label: t.navHome, icon: 'home' },
    { id: 'venue', label: t.navVenue, icon: 'venue' },
    { id: 'schedule', label: t.navSchedule, icon: 'schedule' },
    { id: 'contacts', label: t.navContacts, icon: 'contacts' },
    { id: 'rsvp', label: t.navRsvp, icon: 'rsvp' },
  ]

  useEffect(() => {
    const ids = items.map((i) => i.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id)
        }
      },
      {
        root: null,
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.08, 0.2, 0.4, 0.6],
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // labels change with language; ids are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRtl])

  function goTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-3 lg:mx-auto lg:max-w-[390px]"
      aria-label={t.navAria}
    >
      <div
        className="invite-glass pointer-events-auto flex max-w-[min(100%,20.5rem)] items-center gap-0.5 rounded-full border border-white/50 px-1.5 py-1.5 shadow-[0_10px_32px_rgba(80,40,60,0.16)]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {items.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'true' : undefined}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-[#831843]/14 text-[#831843] shadow-inner'
                  : 'text-[#562931]/70 hover:bg-white/35 hover:text-[#831843]'
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function NavIcon({
  name,
  active,
}: {
  name: NavItem['icon']
  active: boolean
}) {
  const stroke = active ? 2.15 : 1.85
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
        </svg>
      )
    case 'venue':
      return (
        <svg {...common}>
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'schedule':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5.5l3.5 2" />
        </svg>
      )
    case 'contacts':
      return (
        <svg {...common}>
          <path d="M22 16.92v2.2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.3 2 2 0 0 1 4.11 2h2.2a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    case 'rsvp':
      return (
        <svg {...common}>
          <path d="M20.8 5.6a4.6 4.6 0 0 0-6.5 0L12 7.9l-2.3-2.3a4.6 4.6 0 1 0-6.5 6.5l2.3 2.3L12 21l6.5-6.6 2.3-2.3a4.6 4.6 0 0 0 0-6.5z" />
        </svg>
      )
  }
}
