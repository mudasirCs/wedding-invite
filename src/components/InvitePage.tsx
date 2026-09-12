import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { InviteConfig } from '../data/invite'
import { useCountdown } from '../hooks/useCountdown'
import { useDeferredFlag } from '../hooks/useDeferredFlag'
import { useLanguage } from '../i18n/LanguageContext'

type Props = {
  invite: InviteConfig
}

function ScrollHint({ visible }: { visible: boolean }) {
  const { t, isRtl } = useLanguage()
  if (!visible) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 mx-auto w-full text-center lg:max-w-[390px]">
      <p
        className={`font-ui text-ink ${
          isRtl
            ? 'mx-auto max-w-[14rem] text-[13px] leading-relaxed'
            : 'text-[11px] tracking-[0.18em] uppercase'
        }`}
      >
        {t.scrollToRsvp}
      </p>
      <svg
        className="mx-auto mt-1 text-ink"
        width="16"
        height="24"
        viewBox="0 0 16 24"
        fill="none"
        aria-hidden
      >
        <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="8" cy="7" r="1.4" fill="currentColor">
          <animate attributeName="cy" values="6;10;6" dur="1.3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

function Countdown({ dateISO }: { dateISO: string }) {
  const { t, isRtl } = useLanguage()
  const { days, hours, minutes, seconds, done } = useCountdown(dateISO)
  const cells = [
    { label: t.days, value: days },
    { label: t.hours, value: hours },
    { label: t.minutes, value: minutes },
    { label: t.seconds, value: seconds },
  ]
  return (
    <section className={`px-4 text-center ${isRtl ? 'invite-section py-16' : 'py-14'}`}>
      <h2
        className={`font-normal text-black ${
          isRtl
            ? 'font-formal invite-title leading-[2.1]'
            : 'font-headline italic text-[30px] leading-9'
        }`}
        style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
      >
        {t.countdownTitle}
      </h2>
      <p
        className={`font-formal font-light text-black/85 ${
          isRtl ? 'invite-body mt-4 mb-12 px-2' : 'mt-3 mb-10 text-sm'
        }`}
        style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
      >
        {t.countdownMessage}
      </p>
      {done ? (
        <p
          className={`text-black ${isRtl ? 'font-formal invite-subtitle' : 'font-headline italic text-2xl'}`}
          style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
        >
          {t.countdownDone}
        </p>
      ) : (
        <div
          className={`mx-auto flex w-full max-w-[min(100%,22rem)] justify-center ${isRtl ? 'gap-2' : 'gap-3'}`}
        >
          {cells.map((c) => (
            <div key={c.label} className="flex min-w-0 flex-1 flex-col items-center">
              <div
                className="flex aspect-square w-full max-w-[4.5rem] items-center justify-center overflow-hidden rounded-lg border"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  WebkitBackdropFilter: 'blur(8px)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  className={`leading-none font-light text-black ${
                    isRtl ? 'font-formal text-[28px]' : 'font-headline text-[30px]'
                  }`}
                  style={{
                    fontFeatureSettings: 'normal',
                    fontVariationSettings: 'normal',
                  }}
                  dir="ltr"
                >
                  {String(c.value).padStart(2, '0')}
                </span>
              </div>
              <span
                className={`font-formal font-light text-black ${
                  isRtl
                    ? 'mt-2 max-w-[5rem] text-center text-[12px] leading-snug'
                    : 'mt-3 text-xs tracking-[0.2em] uppercase'
                }`}
                style={{
                  fontFeatureSettings: 'normal',
                  fontVariationSettings: 'normal',
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function InvitePage({ invite }: Props) {
  const { t, isRtl } = useLanguage()
  const [maleGuests, setMaleGuests] = useState(1)
  const [femaleGuests, setFemaleGuests] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [rsvpError, setRsvpError] = useState('')
  // Show posters first; pull in looping videos after first paint
  const loadLoopVideos = useDeferredFlag(350)

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('rsvp')
      if (!el) return
      const rect = el.getBoundingClientRect()
      setShowHint(rect.top > window.innerHeight * 0.85)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function submitRsvp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    const attending = String(fd.get('attend') || '')
    const endpoint = import.meta.env.VITE_RSVP_SHEET_URL as string | undefined

    if (!endpoint) {
      setRsvpStatus('error')
      setRsvpError(t.rsvpNotConnected)
      return
    }
    if (!phone) {
      setRsvpStatus('error')
      setRsvpError(t.phoneNumber)
      return
    }
    if (attending === 'yes' && maleGuests + femaleGuests < 1) {
      setRsvpStatus('error')
      setRsvpError(`${t.male} / ${t.female}`)
      return
    }

    setRsvpStatus('sending')
    setRsvpError('')

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name,
          phone,
          attending,
          maleGuests,
          femaleGuests,
          lang: isRtl ? 'ps' : 'en',
        }),
      })
      const raw = await res.text()
      let data: { ok?: boolean; error?: string }
      try {
        data = JSON.parse(raw)
      } catch {
        throw new Error(t.rsvpNetworkError)
      }
      if (!data.ok) throw new Error(data.error || t.rsvpFailed)
      setRsvpStatus('sent')
      form.reset()
      setMaleGuests(1)
      setFemaleGuests(0)
    } catch (err) {
      setRsvpStatus('error')
      setRsvpError(err instanceof Error ? err.message : t.somethingWentWrong)
    }
  }

  const schedule = t.schedule.map((item, i) => ({
    ...item,
    icon: invite.schedule.items[i]?.icon ?? '',
  }))

  return (
    <div className="relative min-h-[100dvh] text-ink">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 mx-auto h-[100dvh] w-full overflow-hidden lg:max-w-[390px]">
        <img
          src={invite.media.themePoster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        {loadLoopVideos ? (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-90"
            src={invite.media.themeVideo}
            poster={invite.media.themePoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : null}
      </div>

      <ScrollHint visible={showHint} />

      <div className="relative z-10">
        <section
          className={`relative flex h-[100dvh] min-h-[100svh] flex-col items-center justify-start overflow-hidden px-5 text-center sm:px-8 ${
            isRtl ? 'pt-[18vh] sm:pt-[19vh]' : 'pt-[20vh] sm:pt-[21vh]'
          }`}
          style={{ background: '#d9cfe0' }}
        >
          <img
            src={invite.media.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
            aria-hidden
          />
          {loadLoopVideos ? (
            <video
              className="absolute inset-0 h-full w-full object-cover object-center"
              src={invite.media.heroVideo}
              poster={invite.media.heroImage}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              style={{
                filter: 'brightness(1.14) contrast(1.02) saturate(1.05)',
              }}
            />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 42%, rgba(55,40,60,0.05) 0%, rgba(55,40,60,0.02) 32%, transparent 58%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(30,20,40,0.02) 0%, transparent 22%, transparent 72%, rgba(30,20,40,0.04) 100%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.15 }}
            className={`relative z-10 flex flex-col items-center ${isRtl ? 'gap-0' : ''}`}
          >
            <h1
              className="font-headline"
              style={{
                fontSize: isRtl ? 40 : 46,
                lineHeight: isRtl ? 1.45 : 0.95,
                color: invite.textColor,
                fontWeight: 400,
              }}
            >
              {t.partnerOne}
            </h1>
            <span
              className="font-headline leading-none"
              style={{
                marginTop: isRtl ? 2 : -2,
                marginBottom: isRtl ? 2 : -2,
                fontSize: isRtl ? 26 : 30,
                color: invite.textColor,
              }}
            >
              {t.and}
            </span>
            <h1
              className="font-headline"
              style={{
                fontSize: isRtl ? 40 : 46,
                lineHeight: isRtl ? 1.45 : 0.95,
                color: invite.textColor,
                fontWeight: 400,
                marginBottom: isRtl ? 0 : undefined,
              }}
            >
              {t.partnerTwo}
            </h1>
            <p
              className={`font-display max-w-[16rem] text-center ${
                isRtl ? '' : 'mt-5 tracking-[0.04em]'
              }`}
              style={{
                marginTop: isRtl ? 14 : undefined,
                marginBottom: isRtl ? 0 : undefined,
                fontSize: isRtl ? 17 : 18,
                lineHeight: isRtl ? 1.7 : 1.35,
                color: invite.subtitleColor,
                fontWeight: 500,
              }}
            >
              {t.subtitle}
            </p>
            <div
              className={`flex items-center gap-2.5 ${isRtl ? '' : 'my-3.5'}`}
              style={isRtl ? { marginTop: 20, marginBottom: 16 } : undefined}
              aria-hidden
            >
              <span className="h-[1.5px] w-14 bg-ink/55" />
              <span className="h-2.5 w-2.5 rotate-45 bg-ink/70 shadow-sm" />
              <span className="h-[1.5px] w-14 bg-ink/55" />
            </div>
            <p
              className={`font-script flex flex-col items-center ${isRtl ? '' : 'mt-1 leading-none'}`}
              style={{
                marginTop: isRtl ? 4 : undefined,
                fontSize: isRtl ? 24 : 24,
                lineHeight: isRtl ? 1.55 : 1.12,
                color: invite.textColor,
                fontWeight: 500,
                textShadow: isRtl ? 'none' : '0.2px 0 currentColor',
              }}
            >
              {t.dateLabel.split(/\s+/).map((part) => (
                <span key={part} className={isRtl ? 'py-0.5' : undefined}>
                  {part}
                </span>
              ))}
            </p>
          </motion.div>
        </section>

        <Countdown dateISO={invite.dateISO} />

        <section className={`text-center ${isRtl ? 'invite-section px-0' : 'py-16 px-0'}`}>
          <div className="mb-4 px-4 text-center">
            <h2
              className={`font-headline font-normal leading-tight text-[#831843] ${
                isRtl ? 'invite-title' : 'text-3xl italic sm:text-4xl'
              }`}
              style={
                isRtl
                  ? undefined
                  : { fontSize: 44, fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }
              }
            >
              {t.venueTitle}
            </h2>
          </div>

          <div className="relative z-0 mt-0 -mb-2 w-full">
            <img
              src={invite.venue.imageUrl}
              alt=""
              className="mx-auto block h-auto w-full max-w-none object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="relative z-10 rounded-2xl px-6 pb-4 pt-10 text-center sm:px-8 sm:pt-12">
            {/* Demo map-pin in bordered circle */}
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-[#f8f5f2]"
              style={{ borderColor: '#084c03' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#084c03"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>

            <h3
              className={`mx-auto mb-2 px-2 break-words text-center font-headline text-[#831843] ${
                isRtl ? 'invite-subtitle' : 'text-xl font-medium'
              }`}
            >
              {t.venueName}
            </h3>
            <p
              className={`mx-auto mb-8 max-w-sm px-2 break-words text-center font-formal text-ink ${
                isRtl ? 'invite-caption' : 'text-sm'
              }`}
            >
              {t.venueAddress}
            </p>

            <a
              href={invite.venue.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex min-w-[min(100%,280px)] items-center gap-4 overflow-hidden rounded-full border border-[#7d3641]/30 bg-gradient-to-r from-[#7d3641]/18 to-[#7d3641]/8 px-7 py-4 shadow-[0_8px_24px_rgba(125,54,65,0.12)] transition-all hover:border-[#7d3641]/50 hover:shadow-[0_12px_28px_rgba(125,54,65,0.18)]"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#7d3641]/25 bg-[#7d3641]/15">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/25 via-blue-400/25 to-green-500/25" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative z-10 text-ink"
                  aria-hidden
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </div>
              <span className={`relative z-10 flex-1 ${isRtl ? 'text-end' : 'text-start'}`}>
                <span
                  className={`font-formal block text-ink ${
                    isRtl ? 'invite-body' : 'text-[15px] font-medium leading-snug'
                  }`}
                >
                  {t.getDirections}
                </span>
                <span
                  className={`font-formal block text-ink/60 ${
                    isRtl ? 'text-[13px] leading-relaxed' : 'text-xs'
                  }`}
                >
                  {t.openInMaps}
                </span>
              </span>
              <span className="relative z-10 text-lg text-ink/45" aria-hidden>
                ↗
              </span>
            </a>
          </div>
        </section>

        <section className={`relative z-30 px-4 ${isRtl ? 'invite-section' : 'py-16'}`}>
          <div className="mb-12 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-[#e2dacf]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#8a5c63]/40" />
            <div className="h-px w-16 bg-[#e2dacf]" />
          </div>

          <div className={`text-center ${isRtl ? 'mb-14' : 'mb-12'}`}>
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img
                src="/media/icons/icon-timeline.png"
                alt=""
                className="h-16 w-16 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <h2
              className={`font-formal text-center font-light text-black ${
                isRtl ? 'invite-title mx-auto max-w-[16rem] px-2' : 'text-2xl leading-tight'
              }`}
              style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
            >
              {t.scheduleHeading}
            </h2>
          </div>

          <div className="relative mx-auto w-full max-w-md py-4 sm:max-w-lg">
            <div
              className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
              style={{ backgroundColor: 'rgba(115, 97, 74, 0.5)' }}
            />

            <div className={isRtl ? 'space-y-12' : 'space-y-10'}>
              {schedule.map((item, i) => {
                const onLeft = i % 2 === 0
                const content = (
                  <div
                    className={`flex flex-col ${
                      onLeft
                        ? isRtl
                          ? 'items-end pe-5 text-end'
                          : 'items-end pr-6 text-right'
                        : isRtl
                          ? 'items-start ps-5 text-start'
                          : 'items-start pl-6 text-left'
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className="mb-2 h-16 w-16 object-contain sm:h-20 sm:w-20"
                      loading="lazy"
                      decoding="async"
                    />
                    <p
                      className={`font-formal font-semibold text-black ${
                        isRtl ? 'text-[22px] leading-8' : 'text-[22px] leading-5'
                      }`}
                      style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
                      dir="ltr"
                    >
                      {item.time}
                    </p>
                    <h3
                      className={`${isRtl ? 'font-formal mt-1 text-[17px] leading-8' : 'font-headline text-base leading-6'}`}
                      style={{
                        color: '#831843',
                        fontFeatureSettings: 'normal',
                        fontVariationSettings: 'normal',
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`font-formal mt-1 whitespace-pre-line text-black/80 ${
                        isRtl ? 'invite-caption max-w-[min(100%,11rem)]' : 'text-xs'
                      }`}
                      style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
                    >
                      {item.description}
                    </p>
                  </div>
                )

                return (
                  <div
                    key={`${item.time}-${item.title}`}
                    className={`relative grid grid-cols-2 ${isRtl ? 'items-start' : 'items-center'}`}
                  >
                    <div
                      className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 bg-[#f8f5f2]"
                      style={{
                        borderColor: 'rgba(115, 97, 74, 0.55)',
                        top: isRtl ? '2.75rem' : undefined,
                      }}
                    />
                    {onLeft ? (
                      <>
                        {content}
                        <div />
                      </>
                    ) : (
                      <>
                        <div />
                        {content}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className={`px-4 text-center sm:px-6 ${isRtl ? 'invite-section' : 'py-12'}`}>
          <h2 className="font-script invite-title text-[2.5rem] text-wine">{t.dressCode}</h2>
          <div className="mx-auto mt-5 w-full max-w-sm rounded-3xl bg-white/50 p-5 backdrop-blur-md">
            <img
              src={invite.dressCode.imageUrl}
              alt=""
              className="mx-auto w-full object-contain"
              loading="lazy"
              decoding="async"
            />
            <p className={`font-script mt-3 text-wine ${isRtl ? 'invite-subtitle' : 'text-2xl'}`}>
              {t.dressDetail}
            </p>
            <p
              className={`font-display mt-5 text-ink/70 ${isRtl ? 'invite-caption' : 'text-sm'}`}
            >
              {t.suggestedColors}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {invite.dressCode.colors.map((c, i) => (
                <div key={c.hex} className="flex flex-col items-center gap-1">
                  <span
                    className="h-9 w-9 rounded-full border border-black/10 shadow-inner"
                    style={{ background: c.hex }}
                  />
                  <span
                    className={`font-formal text-ink/65 ${isRtl ? 'text-[11px] leading-snug' : 'text-[10px]'}`}
                  >
                    {t.colorLabels[i] ?? c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`px-4 text-center sm:px-6 md:px-8 ${isRtl ? 'invite-section' : 'py-12'}`}>
          <img
            src="/media/icons/icon-giftlist.png"
            alt=""
            className="mx-auto mb-3 h-14 w-14 object-contain"
          />
          <h2 className="font-script invite-title text-[2.6rem] text-wine">{t.giftsTitle}</h2>
          <p
            className={`mx-auto mt-4 max-w-md whitespace-pre-line font-formal text-ink/70 ${
              isRtl ? 'invite-body' : 'text-sm leading-relaxed'
            }`}
          >
            {t.giftsMessage}
          </p>
          <a
            href={invite.gifts.registryUrl}
            target="_blank"
            rel="noreferrer"
            className={`font-formal mt-4 inline-block underline-offset-4 hover:underline ${
              isRtl ? 'invite-caption' : 'text-sm capitalize'
            }`}
          >
            {t.registryName}
          </a>
          <p
            className={`mt-5 font-formal text-ink/55 ${isRtl ? 'invite-caption px-2' : 'text-sm'}`}
          >
            {t.bankLabel}
          </p>
          <p className={`font-script text-wine ${isRtl ? 'invite-subtitle mt-1' : 'text-xl'}`}>
            {t.bankName}
          </p>
        </section>

        <section className={`relative z-10 px-4 text-center sm:px-6 ${isRtl ? 'invite-section' : 'py-16'}`}>
          <div className={`relative z-10 mx-auto w-full max-w-md ${isRtl ? 'space-y-8' : 'space-y-6'}`}>
            <h2
              className={`font-headline text-center font-normal italic text-[#831843] ${
                isRtl ? 'invite-title' : ''
              }`}
              style={
                isRtl
                  ? { fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }
                  : {
                      fontSize: 40,
                      lineHeight: 1.15,
                      fontFeatureSettings: 'normal',
                      fontVariationSettings: 'normal',
                    }
              }
            >
              {t.menuTitle}
            </h2>

            <div className={isRtl ? 'space-y-8' : 'space-y-6'}>
              {t.menu.map((cat) => (
                <div key={cat.title}>
                  <h3
                    className={`mb-1 text-center font-headline font-semibold text-[#831843] ${
                      isRtl ? 'invite-subtitle' : 'text-base'
                    }`}
                    style={
                      isRtl
                        ? undefined
                        : {
                            fontSize: 28,
                            lineHeight: 1.2,
                            fontFeatureSettings: 'normal',
                            fontVariationSettings: 'normal',
                          }
                    }
                  >
                    — {cat.title} —
                  </h3>
                  <div className="space-y-2">
                    {cat.items.map((item) => (
                      <div key={item.name} className="text-center">
                        <p
                          className={`font-formal font-medium text-ink ${
                            isRtl ? 'invite-body px-1' : 'text-sm'
                          }`}
                        >
                          {item.name}
                        </p>
                        <p
                          className={`font-formal whitespace-pre-line text-ink/70 ${
                            isRtl ? 'invite-caption mx-auto max-w-xs' : 'text-xs'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo: blue table line-art under menu */}
          <div className="relative mx-auto mt-2 w-full max-w-md">
            <img
              src="/media/menu-frame.png"
              alt=""
              className="pointer-events-none relative z-0 mt-2 w-full select-none object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        <section className={`px-4 text-center sm:px-6 md:px-8 ${isRtl ? 'invite-section' : 'py-12'}`}>
          <h2 className="font-script invite-title-sm text-[2.3rem] text-wine">
            {t.textBlockTitle}
          </h2>
          <p
            className={`mx-auto mt-4 max-w-md font-formal text-ink/70 ${
              isRtl ? 'invite-body' : 'text-sm leading-relaxed'
            }`}
          >
            {t.textBlockBody}
          </p>
        </section>

        <section className={`px-4 text-center sm:px-6 md:px-8 ${isRtl ? 'invite-section' : 'py-12'}`}>
          <h2 className="font-script invite-title text-[2.5rem] text-wine">{t.galleryTitle}</h2>
          <p
            className={`mt-2 font-display text-ink/55 ${
              isRtl ? 'invite-caption' : 'text-sm italic'
            }`}
          >
            {t.gallerySubtitle}
          </p>
          <div className="relative mx-auto mt-8 w-full max-w-[250px]">
            <img
              src="/media/gallery-frame.png"
              alt=""
              className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
              loading="lazy"
              decoding="async"
            />
            {invite.gallery.images.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="aspect-[3/4] w-full rounded-[46%] object-cover px-[12%] py-[10%]"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </section>

        <section className={`px-4 sm:px-6 md:px-8 ${isRtl ? 'invite-section' : 'py-12'}`}>
          <img
            src="/media/icons/icon-faq.png"
            alt=""
            className="mx-auto mb-3 h-14 w-14 object-contain"
          />
          <h2 className="font-script invite-title mb-6 text-center text-[2.6rem] text-wine">
            {t.faqTitle}
          </h2>
          <div className="space-y-3">
            {t.faq.map((f) => (
              <details
                key={f.question}
                className="rounded-2xl border border-white/40 bg-white/45 px-4 py-3 backdrop-blur-md open:bg-white/65"
              >
                <summary
                  className={`font-display cursor-pointer text-start ${
                    isRtl ? 'invite-body py-1' : 'text-base'
                  }`}
                >
                  {f.question}
                </summary>
                <p
                  className={`mt-2 font-formal text-start text-ink/65 ${
                    isRtl ? 'invite-caption' : 'text-sm'
                  }`}
                >
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className={`px-4 text-center sm:px-6 md:px-8 ${isRtl ? 'invite-section' : 'py-12'}`}>
          <img
            src="/media/icons/icon-accommodation.png"
            alt=""
            className="mx-auto mb-3 h-14 w-14 object-contain"
          />
          <h2 className="font-script invite-title text-[2.6rem] text-wine">
            {t.accommodationHeading}
          </h2>
          <p
            className={`mt-2 font-formal text-ink/55 ${isRtl ? 'invite-caption px-3' : 'text-sm'}`}
          >
            {t.accommodationSubheading}
          </p>
          <div className="mt-8 space-y-8">
            {t.hotels.map((h, i) => {
              const meta = invite.accommodation.hotels[i]
              return (
                <div key={h.name} className="text-center">
                  <img
                    src={meta?.imageUrl}
                    alt={h.name}
                    className="mx-auto max-h-48 w-auto max-w-[min(100%,220px)] object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  <h3
                    className={`font-script mt-3 text-wine ${isRtl ? 'invite-subtitle' : 'text-3xl'}`}
                  >
                    {h.name}
                  </h3>
                  <p
                    className={`mt-1 font-formal text-ink/65 ${
                      isRtl ? 'invite-caption mx-auto max-w-[16rem]' : 'text-sm'
                    }`}
                  >
                    {h.description}
                  </p>
                  <p className={`font-display mt-2 text-ink ${isRtl ? 'leading-loose' : ''}`}>
                    {h.priceRange}{' '}
                    <a
                      href={meta?.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`font-formal underline-offset-2 hover:underline ${
                        isRtl ? 'invite-caption' : 'text-sm'
                      }`}
                    >
                      ↗ {t.viewDetails}
                    </a>
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section
          id="rsvp"
          className={`relative overflow-visible px-3 sm:px-4 ${isRtl ? 'pb-32 pt-8' : 'py-16'}`}
        >
          {/* Demo card: rounded-xl + border-border + p-6/8 + space-y-6 */}
          <div className="relative mx-auto w-full max-w-md space-y-6 overflow-visible rounded-xl border border-[#e2dacf] bg-[#f8f5f2] p-5 sm:p-8">
            {/* Demo florals: top-right + bottom-left */}
            <img
              src="/media/rsvp-floral-corner.jpg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-6 z-[1] w-40 select-none"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/media/rsvp-floral-corner.jpg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -left-6 z-[1] w-40 select-none"
              style={{ transform: 'scale(-1, -1)' }}
              loading="lazy"
              decoding="async"
            />

            <div className="relative z-20 space-y-6">
              <div className="text-center">
                <h2
                  className={`font-headline mb-3 font-normal italic text-[#831843] ${
                    isRtl ? 'invite-title' : 'text-3xl sm:text-4xl'
                  }`}
                  style={
                    isRtl
                      ? { lineHeight: 1.9 }
                      : {
                          fontFeatureSettings: 'normal',
                          fontVariationSettings: 'normal',
                        }
                  }
                >
                  {t.rsvpHeading}
                </h2>
                <p
                  className={`font-formal font-light text-black ${
                    isRtl ? 'invite-body' : 'text-sm'
                  }`}
                >
                  {t.rsvpSubheading}
                </p>
                <p
                  className={`relative z-30 mt-2 font-formal font-light italic text-black ${
                    isRtl ? 'invite-caption px-2' : 'text-xs'
                  }`}
                >
                  {t.rsvpReplyBy}
                </p>
              </div>

              {rsvpStatus === 'sent' ? (
                <p
                  className={`font-formal text-center text-[#831843] ${
                    isRtl ? 'invite-body px-2' : 'text-base'
                  }`}
                >
                  {t.rsvpThanks}
                </p>
              ) : (
                <form
                  className={`w-full space-y-5 ${isRtl ? 'text-center' : 'text-start'}`}
                  onSubmit={submitRsvp}
                >
                  <label className="font-formal block text-sm font-normal text-[#562931]">
                    <span className={`mb-2 block ${isRtl ? 'invite-caption' : ''}`}>{t.fullName}</span>
                    <input
                      name="name"
                      required
                      autoComplete="name"
                      className={`font-formal mt-1 h-10 w-full rounded-md border border-[#e2dacf] bg-[#f8f5f2] px-3 py-2 text-base text-[#562931] outline-none ring-offset-[#f8f5f2] transition focus-visible:ring-2 focus-visible:ring-[#831843]/25 focus-visible:ring-offset-2 ${
                        isRtl ? 'text-center' : 'text-start'
                      }`}
                    />
                  </label>

                  <label className="font-formal block text-sm font-normal text-[#562931]">
                    <span className={`mb-2 block ${isRtl ? 'invite-caption' : ''}`}>
                      {t.phoneNumber}
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      dir="ltr"
                      className={`font-formal mt-1 h-10 w-full rounded-md border border-[#e2dacf] bg-[#f8f5f2] px-3 py-2 text-base text-[#562931] outline-none ring-offset-[#f8f5f2] transition focus-visible:ring-2 focus-visible:ring-[#831843]/25 focus-visible:ring-offset-2 ${
                        isRtl ? 'text-center' : 'text-start'
                      }`}
                    />
                  </label>

                  <fieldset className="font-formal text-sm font-normal text-[#562931]">
                    <legend
                      className={`mb-3 block w-full ${
                        isRtl ? 'invite-caption text-center' : 'text-start'
                      }`}
                    >
                      {t.willAttend}
                    </legend>
                    <div
                      className={
                        isRtl ? 'mx-auto flex w-max max-w-full flex-col items-start gap-3' : undefined
                      }
                    >
                      <label className="mt-1 flex cursor-pointer items-center gap-2.5 leading-none">
                        <input
                          type="radio"
                          name="attend"
                          value="yes"
                          required
                          defaultChecked
                          className="h-4 w-4 shrink-0 accent-[#562931]"
                        />
                        <span className={isRtl ? 'invite-caption' : ''}>{t.attendYes}</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2.5 leading-none">
                        <input
                          type="radio"
                          name="attend"
                          value="no"
                          className="h-4 w-4 shrink-0 accent-[#562931]"
                        />
                        <span className={isRtl ? 'invite-caption' : ''}>{t.attendNo}</span>
                      </label>
                    </div>
                  </fieldset>

                  <div className="space-y-4 border-t border-[#e2dacf] pt-4">
                    <p
                      className={`font-formal text-sm font-normal text-[#562931] ${
                        isRtl ? 'invite-caption' : ''
                      }`}
                    >
                      {t.guestsHeading}
                    </p>
                    {(
                      [
                        [t.male, maleGuests, setMaleGuests],
                        [t.female, femaleGuests, setFemaleGuests],
                      ] as const
                    ).map(([label, value, setValue]) => (
                      <div key={label} className="space-y-2">
                        <p
                          className={`font-formal text-sm text-[#562931] ${
                            isRtl ? 'invite-caption' : ''
                          }`}
                        >
                          {label}
                        </p>
                        {/* Keep − / count / + in LTR order; center in Pashto */}
                        <div
                          dir="ltr"
                          className={`flex w-fit items-center overflow-hidden rounded-md border border-[#e2dacf] ${
                            isRtl ? 'mx-auto' : ''
                          }`}
                        >
                          <button
                            type="button"
                            aria-label={`${label} −`}
                            className="bg-[#f8f5f2] px-3 py-2 text-lg font-medium text-[#562931] transition-colors hover:bg-[#efeae4] disabled:opacity-30"
                            disabled={value <= 0}
                            onClick={() => setValue((n) => Math.max(0, n - 1))}
                          >
                            −
                          </button>
                          <span className="min-w-[3rem] bg-[#f8f5f2] px-4 py-2 text-center font-formal text-sm font-medium text-[#562931]">
                            {value}
                          </span>
                          <button
                            type="button"
                            aria-label={`${label} +`}
                            className="bg-[#f8f5f2] px-3 py-2 text-lg font-medium text-[#562931] transition-colors hover:bg-[#efeae4]"
                            onClick={() => setValue((n) => n + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <p className="font-formal text-xs text-[#562931]/55">
                      {t.total}: <span dir="ltr">{maleGuests + femaleGuests}</span>
                    </p>
                  </div>

                  {rsvpStatus === 'error' && (
                    <p className="font-formal text-sm text-[#831843]">{rsvpError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={rsvpStatus === 'sending'}
                    className={`font-formal inline-flex h-11 w-full items-center justify-center rounded-md text-sm font-medium disabled:opacity-60 ${
                      isRtl ? 'invite-body' : ''
                    }`}
                    style={{ backgroundColor: '#722f37', color: '#96d35f' }}
                  >
                    {rsvpStatus === 'sending' ? t.sending : t.sendRsvp}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
