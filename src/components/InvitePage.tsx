import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { InviteConfig } from '../data/invite'
import { useCountdown } from '../hooks/useCountdown'
import { useDeferredFlag } from '../hooks/useDeferredFlag'
import { useLanguage } from '../i18n/LanguageContext'
import { FloatingNav } from './FloatingNav'
import { Reveal, RevealImg, RevealSection } from './Reveal'

type Props = {
  invite: InviteConfig
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
    <RevealSection className={`px-4 text-center ${isRtl ? 'invite-section py-16' : 'py-14'}`}>
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
          {cells.map((c, i) => (
            <Reveal
              key={c.label}
              className="flex min-w-0 flex-1 flex-col items-center"
              delay={i * 0.07}
              from="scale"
            >
              <div className="invite-glass flex aspect-square w-full max-w-[4.5rem] items-center justify-center rounded-lg">
                <span
                  className="countdown-num font-headline text-[30px] leading-none font-light text-black"
                  style={{
                    fontFeatureSettings: 'normal',
                    fontVariationSettings: 'normal',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                  lang="en"
                  dir="ltr"
                >
                  {String(c.value).padStart(2, '0')}
                </span>
              </div>
              <span
                className={`font-formal font-light text-black ${
                  isRtl
                    ? 'mt-2 max-w-[5.5rem] text-center text-[14px] leading-snug'
                    : 'mt-3 text-xs tracking-[0.2em] uppercase'
                }`}
                style={{
                  fontFeatureSettings: 'normal',
                  fontVariationSettings: 'normal',
                }}
              >
                {c.label}
              </span>
            </Reveal>
          ))}
        </div>
      )}
    </RevealSection>
  )
}

/** Soft halo so script names stay readable on the bright hero water/sky */
const heroReadableShadow =
  '0 0 10px rgba(255,255,255,0.95), 0 0 2px rgba(255,255,255,0.9), 0 1px 2px rgba(255,255,255,0.85), 0.4px 0 currentColor, -0.4px 0 currentColor'

export function InvitePage({ invite }: Props) {
  const { t, isRtl } = useLanguage()
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [rsvpError, setRsvpError] = useState('')
  const loadLoopVideos = useDeferredFlag(350)

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

      <FloatingNav />

      <div className="relative z-10 pb-24">
        <section
          id="hero"
          className={`relative flex h-[100dvh] min-h-[100svh] flex-col items-center justify-start overflow-hidden px-5 text-center sm:px-8 ${
            isRtl ? 'pt-[7vh] sm:pt-[8vh]' : 'pt-[8vh] sm:pt-[9vh]'
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
            className={`relative z-10 mt-0 flex w-full flex-col items-center sm:mt-1 ${
              isRtl ? 'hero-ps max-w-[21rem]' : 'max-w-[22rem]'
            }`}
          >
            <img
              src={invite.media.bismillah}
              alt=""
              className={`mx-auto h-auto object-contain ${
                isRtl
                  ? 'mb-2 w-[min(100%,18rem)]'
                  : 'mb-1 w-[min(100%,20rem)] sm:w-[min(100%,21rem)]'
              }`}
              decoding="async"
              fetchPriority="high"
            />

            <p
              className={`m-0 text-center ${isRtl ? 'hero-ps-label' : 'font-formal'}`}
              style={{
                marginBottom: isRtl ? 10 : 10,
                maxWidth: isRtl ? '19rem' : '20rem',
                fontSize: isRtl ? 15 : 15,
                lineHeight: isRtl ? 1.45 : 1.4,
                color: '#6b1f2a',
                fontWeight: isRtl ? 500 : 400,
                fontStyle: isRtl ? 'normal' : 'italic',
                textShadow: heroReadableShadow,
              }}
            >
              {t.inviteIntro}
            </p>

            <div className="flex w-full flex-col items-center">
              <h1
                className={`m-0 ${isRtl ? 'hero-ps-name' : 'font-headline'}`}
                style={{
                  fontSize: isRtl ? 34 : 40,
                  lineHeight: isRtl ? 1.25 : 1.05,
                  color: invite.textColor,
                  fontWeight: isRtl ? 700 : 400,
                  textShadow: heroReadableShadow,
                }}
              >
                {t.partnerOne}
              </h1>
              <p
                className={`m-0 ${isRtl ? 'hero-ps-label' : 'font-formal'}`}
                style={{
                  marginTop: isRtl ? 6 : 6,
                  fontSize: isRtl ? 15 : 14,
                  lineHeight: isRtl ? 1.35 : 1.3,
                  color: '#6b1f2a',
                  fontWeight: isRtl ? 500 : 400,
                  fontStyle: isRtl ? 'normal' : 'italic',
                  textShadow: heroReadableShadow,
                }}
              >
                {t.sonOf}
              </p>
              <p
                className={`m-0 ${isRtl ? 'hero-ps-name' : 'font-headline'}`}
                style={{
                  marginTop: isRtl ? 4 : 4,
                  fontSize: isRtl ? 26 : 34,
                  lineHeight: isRtl ? 1.25 : 1.05,
                  color: invite.textColor,
                  fontWeight: isRtl ? 700 : 400,
                  textShadow: heroReadableShadow,
                  WebkitTextStroke: isRtl ? undefined : '0.35px #0a0909',
                }}
              >
                {t.fatherOne}
              </p>
            </div>

            <span
              className={`leading-none ${isRtl ? 'hero-ps-name' : 'font-headline'}`}
              style={{
                marginTop: isRtl ? 12 : 12,
                marginBottom: isRtl ? 8 : 8,
                fontSize: isRtl ? 20 : 26,
                color: '#6b1f2a',
                textShadow: heroReadableShadow,
              }}
            >
              {t.and}
            </span>

            <div className="flex w-full flex-col items-center">
              <h1
                className={`m-0 ${isRtl ? 'hero-ps-name' : 'font-headline'}`}
                style={{
                  fontSize: isRtl ? 34 : 40,
                  lineHeight: isRtl ? 1.25 : 1.05,
                  color: invite.textColor,
                  fontWeight: isRtl ? 700 : 400,
                  textShadow: heroReadableShadow,
                }}
              >
                {t.partnerTwo}
              </h1>
              <p
                className={`m-0 ${isRtl ? 'hero-ps-label' : 'font-formal'}`}
                style={{
                  marginTop: isRtl ? 6 : 6,
                  fontSize: isRtl ? 15 : 14,
                  lineHeight: isRtl ? 1.35 : 1.3,
                  color: '#6b1f2a',
                  fontWeight: isRtl ? 500 : 400,
                  fontStyle: isRtl ? 'normal' : 'italic',
                  textShadow: heroReadableShadow,
                }}
              >
                {t.daughterOf}
              </p>
              <p
                className={`m-0 ${isRtl ? 'hero-ps-name' : 'font-headline'}`}
                style={{
                  marginTop: isRtl ? 4 : 4,
                  fontSize: isRtl ? 26 : 34,
                  lineHeight: isRtl ? 1.25 : 1.05,
                  color: invite.textColor,
                  fontWeight: isRtl ? 700 : 400,
                  textShadow: heroReadableShadow,
                  WebkitTextStroke: isRtl ? undefined : '0.35px #0a0909',
                }}
              >
                {t.fatherTwo}
              </p>
            </div>

            <div className={`flex w-full flex-col items-center ${isRtl ? 'mt-3 gap-3' : 'gap-3'}`}>
              <div
                className={`flex items-center gap-2.5 ${isRtl ? 'my-1' : 'my-0'}`}
                aria-hidden
              >
                <span className="h-[1.5px] w-10 bg-ink/55" />
                <span className="h-2 w-2 rotate-45 bg-ink/70 shadow-sm" />
                <span className="h-[1.5px] w-10 bg-ink/55" />
              </div>

              <p
                className={`m-0 text-center ${
                  isRtl ? 'hero-ps-date' : 'font-formal whitespace-nowrap'
                }`}
                style={{
                  fontSize: isRtl ? 22 : 24,
                  lineHeight: isRtl ? 1.35 : 1.25,
                  letterSpacing: isRtl ? 0 : '0.04em',
                  color: invite.textColor,
                  fontWeight: isRtl ? 700 : 500,
                  textShadow: heroReadableShadow,
                  WebkitTextStroke: isRtl ? undefined : '0.25px #0a0909',
                }}
              >
                {t.dateLabel}
              </p>
            </div>
          </motion.div>
        </section>

        <Countdown dateISO={invite.dateISO} />

        <RevealSection id="venue" className={`text-center ${isRtl ? 'invite-section px-0' : 'py-16 px-0'}`}>
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

          <div className="relative z-0 mt-0 w-full">
            <RevealImg
              src={invite.venue.imageUrl}
              alt=""
              className="mx-auto block h-auto w-[min(100%,22rem)] object-contain px-4 sm:w-[min(100%,26rem)]"
              loading="lazy"
              decoding="async"
              from="scale"
            />
          </div>

          <div className="invite-glass relative z-10 mx-4 mt-2 rounded-2xl px-5 pb-5 pt-8 text-center sm:mx-6 sm:px-8 sm:pt-10">
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white/80"
              style={{ borderColor: '#084c03' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
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
              className={`mx-auto mb-1 px-2 break-words text-center font-headline text-[#831843] ${
                isRtl ? 'invite-subtitle' : 'text-2xl font-medium'
              }`}
              style={
                isRtl
                  ? undefined
                  : { fontSize: 30, fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }
              }
            >
              {t.venueName}
            </h3>
            <p
              className={`mx-auto mb-3 px-2 break-words text-center font-formal font-medium text-[#831843] ${
                isRtl ? 'invite-caption' : 'text-lg italic'
              }`}
            >
              {t.venueBallroom}
            </p>
            <p
              className={`mx-auto mb-8 max-w-sm px-2 break-words text-center font-formal text-ink ${
                isRtl ? 'invite-body' : 'text-base font-medium leading-relaxed'
              }`}
            >
              {t.venueAddress}
            </p>

            <a
              href={invite.venue.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="group invite-glass relative inline-flex min-w-[min(100%,280px)] items-center gap-4 overflow-hidden rounded-full px-7 py-4 transition-all hover:shadow-[0_12px_28px_rgba(125,54,65,0.18)]"
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
                    isRtl ? 'text-[15px] leading-relaxed' : 'text-xs'
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
        </RevealSection>

        <RevealSection id="schedule" className={`relative z-30 px-4 ${isRtl ? 'invite-section' : 'py-16'}`}>
          <div className="mb-12 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-[#e2dacf]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#8a5c63]/40" />
            <div className="h-px w-16 bg-[#e2dacf]" />
          </div>

          <div className={`text-center ${isRtl ? 'mb-14' : 'mb-12'}`}>
            <div className="mx-auto mb-4 flex items-center justify-center">
              <RevealImg
                src="/media/icons/icon-timeline.png"
                alt=""
                className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                loading="lazy"
                decoding="async"
                from="scale"
              />
            </div>
            <h2
              className={`schedule-heading text-center text-black ${
                isRtl
                  ? 'invite-title mx-auto max-w-[16rem] px-2'
                  : 'font-display text-[1.7rem] font-medium leading-snug tracking-wide'
              }`}
              style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
            >
              {t.scheduleHeading}
            </h2>
          </div>

          <div className="relative mx-auto w-full max-w-sm py-4 sm:max-w-md">
            <div
              className="absolute top-3 bottom-3 left-1/2 w-px -translate-x-1/2"
              style={{ backgroundColor: 'rgba(115, 97, 74, 0.45)' }}
            />

            <div className="relative space-y-12 sm:space-y-14">
              {schedule.map((item, i) => (
                <Reveal
                  key={`${item.time}-${item.title}`}
                  from="up"
                  delay={i * 0.05}
                  className="relative flex flex-col items-center px-3 text-center"
                >
                  <div
                    className="absolute top-0 left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 bg-[#f8f5f2]"
                    style={{ borderColor: 'rgba(115, 97, 74, 0.6)' }}
                  />

                  <RevealImg
                    src={item.icon}
                    alt=""
                    className="relative z-20 mt-5 mb-4 h-auto w-[min(100%,15.5rem)] object-contain sm:w-[min(100%,17rem)]"
                    loading="lazy"
                    decoding="async"
                    from="scale"
                  />

                  <p
                    className={`schedule-time text-black ${
                      isRtl
                        ? 'text-[24px] leading-8'
                        : 'font-display text-[1.25rem] font-semibold leading-6 tracking-wide'
                    }`}
                    style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
                    dir="ltr"
                  >
                    {item.time}
                  </p>
                  <h3
                    className={`schedule-title mt-1.5 ${
                      isRtl
                        ? 'text-[19px] leading-8'
                        : 'font-display text-[1.05rem] font-medium leading-6 tracking-[0.04em]'
                    }`}
                    style={{
                      color: '#831843',
                      fontFeatureSettings: 'normal',
                      fontVariationSettings: 'normal',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`schedule-desc mx-auto mt-1.5 max-w-[16rem] whitespace-pre-line text-black/80 ${
                      isRtl ? 'invite-caption' : 'font-formal text-sm leading-snug'
                    }`}
                    style={{ fontFeatureSettings: 'normal', fontVariationSettings: 'normal' }}
                  >
                    {item.description}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal from="scale" delay={0.08} className="mx-auto mt-10 w-full max-w-md px-2 sm:mt-12">
            <RevealImg
              src="/media/thank-you.webp?v=1"
              alt=""
              className="mx-auto h-auto w-[min(100%,18rem)] object-contain sm:w-[min(100%,20rem)]"
              loading="lazy"
              decoding="async"
              from="fade"
            />
          </Reveal>
        </RevealSection>

        <RevealSection className={`px-4 text-center sm:px-6 ${isRtl ? 'invite-section' : 'py-14'}`}>
          <div className="invite-glass mx-auto w-full max-w-md rounded-xl px-5 py-8 sm:px-7">
            <h2
              className={`font-formal font-semibold text-[#831843] ${
                isRtl ? 'invite-title px-1' : 'text-lg tracking-[0.08em] uppercase sm:text-xl'
              }`}
            >
              {t.prohibitedTitle}
            </h2>

            <div className="mt-7 space-y-8">
              <div>
                <RevealImg
                  src="/media/icons/no-pictures.webp"
                  alt=""
                  className="mx-auto mb-4 h-auto w-[min(100%,16rem)] object-contain"
                  loading="lazy"
                  decoding="async"
                  from="scale"
                />
                <h3
                  className={`font-formal font-semibold text-ink ${
                    isRtl ? 'invite-subtitle' : 'text-base tracking-wide uppercase'
                  }`}
                >
                  {t.prohibitedNoPhotosTitle}
                </h3>
                <p
                  className={`mt-2 font-formal text-ink/85 ${
                    isRtl ? 'invite-body px-1' : 'text-sm leading-relaxed'
                  }`}
                >
                  {t.prohibitedNoPhotosBody}
                </p>
                <p
                  className={`mt-2 font-formal text-ink/70 ${
                    isRtl ? 'invite-caption px-1' : 'text-sm leading-relaxed'
                  }`}
                >
                  {t.prohibitedPrivacy}
                </p>
              </div>

              <div className="mx-auto h-px w-16 bg-[#831843]/30" />

              <div>
                <RevealImg
                  src="/media/icons/no-children.webp"
                  alt=""
                  className="mx-auto mb-4 h-auto w-[min(100%,15rem)] object-contain"
                  loading="lazy"
                  decoding="async"
                  from="scale"
                />
                <p
                  className={`font-formal font-semibold text-[#831843] ${
                    isRtl ? 'invite-subtitle' : 'text-base tracking-wide uppercase'
                  }`}
                >
                  {t.prohibitedNoChildren}
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection id="contacts" className={`px-4 text-center sm:px-6 ${isRtl ? 'invite-section' : 'py-14'}`}>
          <div className="invite-glass mx-auto w-full max-w-md rounded-xl px-5 py-8 sm:px-7">
            <h2
              className={`font-headline font-normal text-[#831843] ${
                isRtl ? 'invite-title' : 'text-4xl italic sm:text-[2.75rem]'
              }`}
              style={
                isRtl
                  ? undefined
                  : {
                      fontFeatureSettings: 'normal',
                      fontVariationSettings: 'normal',
                    }
              }
            >
              {t.contactsHeading}
            </h2>
            <p
              className={`mx-auto mt-3 max-w-sm font-formal text-ink/80 ${
                isRtl ? 'invite-body px-2' : 'text-base'
              }`}
            >
              {t.contactsSubheading}
            </p>
            <div className={`mx-auto mt-8 w-full max-w-sm space-y-7 ${isRtl ? 'space-y-9' : ''}`}>
              {t.contacts.map((c, i) => (
                <Reveal key={c.tel} delay={i * 0.08} from="up" className="text-center">
                  <p
                    className={`font-formal font-medium text-ink ${
                      isRtl ? 'invite-subtitle' : 'text-xl'
                    }`}
                  >
                    {c.name}
                  </p>
                  <a
                    href={`tel:${c.tel}`}
                    dir="ltr"
                    className={`mt-2 inline-block font-formal font-medium text-[#831843] underline-offset-4 hover:underline ${
                      isRtl ? 'invite-body' : 'text-base tracking-wide'
                    }`}
                  >
                    {c.phone}
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection
          id="rsvp"
          className={`relative overflow-visible px-3 sm:px-4 ${isRtl ? 'pb-36 pt-8' : 'pb-32 pt-16'}`}
        >
          <div className="relative mx-auto w-full max-w-md overflow-visible">
            <RevealImg
              src="/media/rsvp-floral-corner.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-6 z-30 w-40 select-none"
              loading="lazy"
              decoding="async"
              from="fade"
              delay={0.15}
            />
            <Reveal
              from="fade"
              delay={0.25}
              className="pointer-events-none absolute -bottom-10 -left-6 z-30 w-40"
            >
              <img
                src="/media/rsvp-floral-corner.webp"
                alt=""
                aria-hidden
                className="w-full select-none"
                style={{ transform: 'scale(-1, -1)' }}
                loading="lazy"
                decoding="async"
              />
            </Reveal>

            <div className="invite-glass relative space-y-6 rounded-xl p-5 sm:p-8">
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
                      placeholder={t.fullNamePlaceholder}
                      className={`font-formal mt-1 h-10 w-full rounded-md border border-[#e2dacf] bg-[#f8f5f2] px-3 py-2 text-base text-[#562931] outline-none ring-offset-[#f8f5f2] transition placeholder:text-[#562931]/40 focus-visible:ring-2 focus-visible:ring-[#831843]/25 focus-visible:ring-offset-2 ${
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
                      placeholder={t.phonePlaceholder}
                      className={`font-formal mt-1 h-10 w-full rounded-md border border-[#e2dacf] bg-[#f8f5f2] px-3 py-2 text-base text-[#562931] outline-none ring-offset-[#f8f5f2] transition placeholder:text-[#562931]/40 focus-visible:ring-2 focus-visible:ring-[#831843]/25 focus-visible:ring-offset-2 ${
                        isRtl ? 'text-center' : 'text-start'
                      }`}
                    />
                  </label>

                  <fieldset className="font-formal text-sm font-normal text-[#562931]">
                    <legend
                      className={`mb-4 block w-full ${
                        isRtl ? 'invite-caption text-center' : 'text-start'
                      }`}
                    >
                      {t.willAttend}
                    </legend>
                    <div
                      className={`flex flex-col gap-4 ${
                        isRtl ? 'mx-auto w-max max-w-full items-start' : 'items-start'
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-3 leading-snug">
                        <input
                          type="radio"
                          name="attend"
                          value="yes"
                          required
                          defaultChecked
                          className="h-[1.05rem] w-[1.05rem] shrink-0 accent-[#562931]"
                        />
                        <span className={isRtl ? 'invite-caption' : ''}>{t.attendYes}</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 leading-snug">
                        <input
                          type="radio"
                          name="attend"
                          value="no"
                          className="h-[1.05rem] w-[1.05rem] shrink-0 accent-[#562931]"
                        />
                        <span className={isRtl ? 'invite-caption' : ''}>{t.attendNo}</span>
                      </label>
                    </div>
                  </fieldset>

                  {rsvpStatus === 'error' && (
                    <p className="font-formal text-sm text-[#831843]">{rsvpError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={rsvpStatus === 'sending'}
                    className={`font-formal inline-flex h-11 w-full items-center justify-center rounded-md text-sm font-medium disabled:opacity-60 ${
                      isRtl ? 'invite-body' : ''
                    }`}
                    style={{ backgroundColor: '#722f37', color: '#f8f1e8' }}
                  >
                    {rsvpStatus === 'sending' ? t.sending : t.sendRsvp}
                  </button>
                </form>
              )}
            </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  )
}
