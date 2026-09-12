import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { InviteConfig } from '../data/invite'
import { useCountdown } from '../hooks/useCountdown'
import { useLanguage } from '../i18n/LanguageContext'

type Props = {
  invite: InviteConfig
}

function ScrollHint({ visible }: { visible: boolean }) {
  const { t, isRtl } = useLanguage()
  if (!visible) return null
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 text-center lg:left-[calc(50%)]">
      <p
        className={`font-ui text-[11px] text-ink ${isRtl ? 'tracking-normal' : 'tracking-[0.18em] uppercase'}`}
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
    <section className="px-8 py-12 text-center">
      <h2 className="font-script text-[2.6rem] leading-none text-wine">{t.countdownTitle}</h2>
      <p className={`font-display mt-3 text-sm text-ink/65 ${isRtl ? '' : 'italic'}`}>
        {t.countdownMessage}
      </p>
      {done ? (
        <p className="font-script mt-8 text-2xl text-wine">{t.countdownDone}</p>
      ) : (
        <div className="mx-auto mt-8 max-w-[300px] rounded-2xl bg-white/45 px-3 py-4 backdrop-blur-md">
          <div className="grid grid-cols-4 gap-1">
            {cells.map((c) => (
              <div key={c.label} className="text-center">
                <div className="font-display text-[1.65rem] tabular-nums text-ink">
                  {String(c.value).padStart(2, '0')}
                </div>
                <div
                  className={`mt-1 font-display text-[8px] text-ink/70 ${isRtl ? '' : 'tracking-[0.14em] uppercase'}`}
                >
                  {c.label}
                </div>
              </div>
            ))}
          </div>
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
      <div className="pointer-events-none fixed top-0 left-1/2 z-0 h-[100dvh] w-full max-w-[390px] -translate-x-1/2 overflow-hidden">
        <img
          src={invite.media.themePoster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          src={invite.media.themeVideo}
          poster={invite.media.themePoster}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      <ScrollHint visible={showHint} />

      <div className="relative z-10">
        <section className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden px-10 text-center">
          <img
            src={invite.media.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={invite.media.heroVideo}
            poster={invite.media.heroImage}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ filter: 'brightness(0.94) contrast(1.03)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 42%, rgba(55,40,60,0.12) 0%, rgba(55,40,60,0.04) 32%, transparent 58%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(30,20,40,0.04) 0%, transparent 22%, transparent 72%, rgba(30,20,40,0.08) 100%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.15 }}
            className="relative z-10 flex flex-col items-center"
          >
            <h1
              className="font-headline leading-[1.25]"
              style={{ fontSize: isRtl ? 34 : 37, color: invite.textColor }}
            >
              {t.partnerOne}
            </h1>
            <span
              className="my-1 font-headline"
              style={{
                fontSize: isRtl ? 20 : 22,
                color: invite.textColor,
              }}
            >
              {t.and}
            </span>
            <h1
              className="font-headline leading-[1.25]"
              style={{ fontSize: isRtl ? 34 : 37, color: invite.textColor }}
            >
              {t.partnerTwo}
            </h1>
            <p
              className="font-display mt-5"
              style={{ fontSize: isRtl ? 20 : 22, color: invite.subtitleColor }}
            >
              {t.subtitle}
            </p>
            <div className="my-4 flex items-center gap-2" aria-hidden>
              <span className="h-px w-10 bg-ink/35" />
              <span className="h-1.5 w-1.5 rotate-45 bg-ink/50" />
              <span className="h-px w-10 bg-ink/35" />
            </div>
            <p
              className="font-display tracking-[0.06em]"
              style={{ fontSize: isRtl ? 16 : 17, color: invite.textColor }}
            >
              {t.dateLabel}
            </p>
          </motion.div>
        </section>

        <Countdown dateISO={invite.dateISO} />

        <section className="px-8 py-10 text-center">
          <h2 className="font-script text-[2.6rem] text-wine">{t.venueTitle}</h2>
          <img
            src={invite.venue.imageUrl}
            alt=""
            className="mx-auto mt-5 w-[85%] max-w-[300px] object-contain drop-shadow-md"
          />
          <h3 className="font-script mt-5 text-3xl text-wine">{t.venueName}</h3>
          <p className="font-formal mt-2 text-sm text-ink/75">{t.venueAddress}</p>
          <a
            href={invite.venue.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/40 px-5 py-3 backdrop-blur-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a0dc]/35 text-xs">
              ➤
            </span>
            <span className="text-start">
              <span className="font-formal block text-sm text-ink">{t.getDirections}</span>
              <span className="font-formal block text-[11px] text-ink/55">{t.openInMaps}</span>
            </span>
            <span className="text-ink/40">↗</span>
          </a>
        </section>

        <section className="px-8 py-12">
          <div className="mb-8 text-center">
            <img
              src="/media/icons/icon-timeline.png"
              alt=""
              className="mx-auto mb-3 h-14 w-14 object-contain"
            />
            <p className="font-script text-[1.7rem] leading-snug text-wine">{t.scheduleHeading}</p>
          </div>
          <div className="relative mx-auto max-w-sm">
            <div className="absolute top-4 bottom-4 start-[1.35rem] w-px bg-ink/25" />
            <ol className="space-y-10">
              {schedule.map((item) => (
                <li key={`${item.time}-${item.title}`} className="relative flex gap-4">
                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur">
                    <img src={item.icon} alt="" className="h-8 w-8 object-contain" />
                  </div>
                  <div className="text-start">
                    <p className="font-ui text-base font-semibold text-ink">{item.time}</p>
                    <p className="font-script text-2xl text-wine">{item.title}</p>
                    <p className="font-formal mt-1 text-xs text-ink/60">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 py-12 text-center">
          <h2 className="font-script text-[2.5rem] text-wine">{t.dressCode}</h2>
          <div className="mx-auto mt-5 max-w-[320px] rounded-3xl bg-white/50 p-5 backdrop-blur-md">
            <img
              src={invite.dressCode.imageUrl}
              alt=""
              className="mx-auto w-full object-contain"
            />
            <p className="font-script mt-3 text-2xl text-wine">{t.dressDetail}</p>
            <p className="font-display mt-5 text-sm text-ink/70">{t.suggestedColors}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {invite.dressCode.colors.map((c, i) => (
                <div key={c.hex} className="flex flex-col items-center gap-1">
                  <span
                    className="h-9 w-9 rounded-full border border-black/10 shadow-inner"
                    style={{ background: c.hex }}
                  />
                  <span className="font-formal text-[10px] text-ink/65">
                    {t.colorLabels[i] ?? c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 py-12 text-center">
          <img
            src="/media/icons/icon-giftlist.png"
            alt=""
            className="mx-auto mb-3 h-14 w-14 object-contain"
          />
          <h2 className="font-script text-[2.6rem] text-wine">{t.giftsTitle}</h2>
          <p className="mx-auto mt-4 max-w-sm whitespace-pre-line font-formal text-sm leading-relaxed text-ink/70">
            {t.giftsMessage}
          </p>
          <a
            href={invite.gifts.registryUrl}
            target="_blank"
            rel="noreferrer"
            className="font-formal mt-4 inline-block text-sm capitalize underline-offset-4 hover:underline"
          >
            {t.registryName}
          </a>
          <p className="mt-5 font-formal text-sm text-ink/55">{t.bankLabel}</p>
          <p className="font-script text-xl text-wine">{t.bankName}</p>
        </section>

        <section className="px-8 py-12 text-center">
          <img src="/media/menu-frame.png" alt="" className="mx-auto mb-4 w-36 object-contain" />
          <h2 className="font-script mb-8 text-[2.6rem] text-wine">{t.menuTitle}</h2>
          <div className="space-y-8">
            {t.menu.map((cat) => (
              <div key={cat.title}>
                <p className="mb-2 text-sm tracking-wide text-ink/45">— {cat.title} —</p>
                {cat.items.map((item) => (
                  <div key={item.name}>
                    <p className="font-script text-2xl text-ink">{item.name}</p>
                    <p className="mt-1 font-formal text-sm text-ink/60">{item.description}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="px-8 py-12 text-center">
          <h2 className="font-script text-[2.3rem] text-wine">{t.textBlockTitle}</h2>
          <p className="mx-auto mt-4 max-w-sm font-formal text-sm leading-relaxed text-ink/70">
            {t.textBlockBody}
          </p>
        </section>

        <section className="px-8 py-12 text-center">
          <h2 className="font-script text-[2.5rem] text-wine">{t.galleryTitle}</h2>
          <p className={`mt-2 font-display text-sm text-ink/55 ${isRtl ? '' : 'italic'}`}>
            {t.gallerySubtitle}
          </p>
          <div className="relative mx-auto mt-8 w-[250px]">
            <img
              src="/media/gallery-frame.png"
              alt=""
              className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
            />
            {invite.gallery.images.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="aspect-[3/4] w-full rounded-[46%] object-cover px-7 py-9"
              />
            ))}
          </div>
        </section>

        <section className="px-8 py-12">
          <img
            src="/media/icons/icon-faq.png"
            alt=""
            className="mx-auto mb-3 h-14 w-14 object-contain"
          />
          <h2 className="font-script mb-6 text-center text-[2.6rem] text-wine">{t.faqTitle}</h2>
          <div className="space-y-3">
            {t.faq.map((f) => (
              <details
                key={f.question}
                className="rounded-2xl border border-white/40 bg-white/45 px-4 py-3 backdrop-blur-md open:bg-white/65"
              >
                <summary className="font-display cursor-pointer text-base text-start">
                  {f.question}
                </summary>
                <p className="mt-2 font-formal text-sm text-ink/65 text-start">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-8 py-12 text-center">
          <img
            src="/media/icons/icon-accommodation.png"
            alt=""
            className="mx-auto mb-3 h-14 w-14 object-contain"
          />
          <h2 className="font-script text-[2.6rem] text-wine">{t.accommodationHeading}</h2>
          <p className="mt-2 font-formal text-sm text-ink/55">{t.accommodationSubheading}</p>
          <div className="mt-8 space-y-8">
            {t.hotels.map((h, i) => {
              const meta = invite.accommodation.hotels[i]
              return (
                <div key={h.name} className="text-center">
                  <img
                    src={meta?.imageUrl}
                    alt={h.name}
                    className="mx-auto max-h-48 w-auto max-w-[220px] object-contain"
                  />
                  <h3 className="font-script mt-3 text-3xl text-wine">{h.name}</h3>
                  <p className="mt-1 font-formal text-sm text-ink/65">{h.description}</p>
                  <p className="font-display mt-2 text-ink">
                    {h.priceRange}{' '}
                    <a
                      href={meta?.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-formal text-sm underline-offset-2 hover:underline"
                    >
                      ↗ {t.viewDetails}
                    </a>
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section id="rsvp" className="relative px-5 pb-28 pt-6">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-[#fffcf7]/92 px-5 pb-8 pt-7 shadow-[0_18px_50px_rgba(80,40,80,0.10)] backdrop-blur-md">
            <img
              src="/media/rsvp-floral-corner.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -top-2 -start-2 w-[7.5rem] rotate-180 opacity-90"
            />
            <img
              src="/media/rsvp-floral-corner.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -end-2 -bottom-2 w-[7.5rem] opacity-90"
            />

            <div className="relative z-10 text-center">
              <h2
                className="font-headline text-center leading-none"
                style={{ fontSize: isRtl ? 36 : 42, color: '#722f37', fontWeight: 400 }}
              >
                {t.rsvpHeading}
              </h2>
              <p
                className="mt-2 text-center font-ui"
                style={{ fontSize: isRtl ? 13 : 12, color: '#000000' }}
              >
                {t.rsvpSubheading}
              </p>
              <p
                className="font-script mt-1.5 text-center leading-none"
                style={{ fontSize: 18, color: '#442727' }}
              >
                {t.rsvpReplyBy}
              </p>
            </div>

            {rsvpStatus === 'sent' ? (
              <p
                className="relative z-10 mt-8 text-center font-display"
                style={{ color: '#722f37', fontSize: 16 }}
              >
                {t.rsvpThanks}
              </p>
            ) : (
              <form
                className="relative z-10 mx-auto mt-7 w-full max-w-[300px] space-y-5"
                onSubmit={submitRsvp}
              >
                <label className="font-formal block text-[15px] leading-snug text-ink">
                  <span className="block text-center">{t.fullName}</span>
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    className="font-ui mt-2 w-full rounded-lg border border-[#d9d0c6] bg-white px-3 py-2.5 text-center text-[14px] text-ink outline-none focus:border-[#722f37]/40"
                  />
                </label>
                <label className="font-formal block text-[15px] leading-snug text-ink">
                  <span className="block text-center">{t.phoneNumber}</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    className="font-ui mt-2 w-full rounded-lg border border-[#d9d0c6] bg-white px-3 py-2.5 text-center text-[14px] text-ink outline-none focus:border-[#722f37]/40"
                    dir="ltr"
                  />
                </label>
                <fieldset className="font-formal text-[15px] text-ink">
                  <legend className="mx-auto block w-full text-center">{t.willAttend}</legend>
                  <label className="mt-3 flex items-center justify-center gap-2">
                    <input
                      type="radio"
                      name="attend"
                      value="yes"
                      required
                      defaultChecked
                      className="accent-[#722f37]"
                    />
                    <span>{t.attendYes}</span>
                  </label>
                  <label className="mt-2 flex items-center justify-center gap-2">
                    <input type="radio" name="attend" value="no" className="accent-[#722f37]" />
                    <span>{t.attendNo}</span>
                  </label>
                </fieldset>
                <div className="font-formal space-y-4 text-[15px] text-ink">
                  <p className="text-center">{t.guestsHeading}</p>
                  {(
                    [
                      [t.male, maleGuests, setMaleGuests],
                      [t.female, femaleGuests, setFemaleGuests],
                    ] as const
                  ).map(([label, value, setValue]) => (
                    <div key={label}>
                      <p className="text-center text-[14px]">{label}</p>
                      <div className="mt-2 flex items-center justify-center gap-4">
                        <button
                          type="button"
                          aria-label={label}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d0c6] bg-white text-lg leading-none text-ink"
                          onClick={() => setValue((n) => Math.max(0, n - 1))}
                        >
                          −
                        </button>
                        <span className="font-display w-8 text-center text-xl tabular-nums" dir="ltr">
                          {value}
                        </span>
                        <button
                          type="button"
                          aria-label={label}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d0c6] bg-white text-lg leading-none text-ink"
                          onClick={() => setValue((n) => n + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  <p className="text-center font-ui text-[12px] text-ink/55">
                    {t.total}: <span dir="ltr">{maleGuests + femaleGuests}</span>
                  </p>
                </div>
                {rsvpStatus === 'error' && (
                  <p className="font-ui text-center text-sm" style={{ color: '#722f37' }}>
                    {rsvpError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={rsvpStatus === 'sending'}
                  className="font-display mt-1 w-full rounded-full py-3 text-[15px] tracking-wide disabled:opacity-60"
                  style={{ backgroundColor: '#722f37', color: '#96d35f' }}
                >
                  {rsvpStatus === 'sending' ? t.sending : t.sendRsvp}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
