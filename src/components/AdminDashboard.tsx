import { useCallback, useEffect, useMemo, useState } from 'react'

export type RsvpRow = {
  id: number
  timestamp: string
  name: string
  phone: string
  attending: string
  lang?: string
}

type AttendFilter = 'all' | 'yes' | 'no'
type SortKey = 'timestamp' | 'name' | 'phone' | 'attending' | 'lang'

function formatWhen(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function downloadCsv(rows: RsvpRow[]) {
  const header = ['Timestamp', 'Name', 'Phone', 'Attending', 'Language']
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [r.timestamp, r.name, r.phone, r.attending, r.lang || '']
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminDashboard() {
  const endpoint = import.meta.env.VITE_RSVP_SHEET_URL as string | undefined
  const [rows, setRows] = useState<RsvpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [attend, setAttend] = useState<AttendFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const load = useCallback(async () => {
    if (!endpoint) {
      setError('Missing VITE_RSVP_SHEET_URL')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const url = `${endpoint}?action=list&_=${Date.now()}`
      const res = await fetch(url)
      const raw = await res.text()
      const data = JSON.parse(raw) as { ok?: boolean; rows?: RsvpRow[]; error?: string }
      if (!data.ok) throw new Error(data.error || 'Failed to load RSVPs')
      setRows(
        (data.rows || []).map((r) => ({
          ...r,
          phone: r.phone || '',
          lang: r.lang || '',
        })),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load RSVPs. Redeploy the Apps Script with the updated list action.',
      )
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [query, attend, sortKey, sortDir])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter((r) => {
      if (attend !== 'all' && r.attending !== attend) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.attending.toLowerCase().includes(q) ||
        (r.lang || '').toLowerCase().includes(q)
      )
    })

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (
        sortKey === 'name' ||
        sortKey === 'attending' ||
        sortKey === 'phone' ||
        sortKey === 'lang'
      ) {
        cmp = String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''))
      } else {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [rows, query, attend, sortKey, sortDir])

  const stats = useMemo(() => {
    const yes = rows.filter((r) => r.attending === 'yes')
    const no = rows.filter((r) => r.attending === 'no')
    return {
      responses: rows.length,
      yes: yes.length,
      no: no.length,
    }
  }, [rows])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#f3eee4] text-ink">
      <header className="border-b border-black/8 bg-[#faf7f1]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="font-ui text-[11px] tracking-[0.2em] text-muted uppercase">
              Abdul Rafi & Abeda Afzely
            </p>
            <h1 className="font-display text-2xl text-wine sm:text-3xl">RSVP dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className="font-ui rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-ink/80 hover:bg-cream"
            >
              Open invite
            </a>
            <button
              type="button"
              onClick={() => void load()}
              className="font-ui rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-cream"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(filtered)}
              disabled={!filtered.length}
              className="font-ui rounded-full bg-wine px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: 'Responses', value: stats.responses },
            { label: 'Attending', value: stats.yes },
            { label: 'Declined', value: stats.no },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/70 bg-white/75 px-4 py-4 shadow-[0_10px_30px_rgba(80,40,40,0.06)]"
            >
              <p className="font-ui text-[11px] tracking-[0.14em] text-muted uppercase">{s.label}</p>
              <p className="font-display mt-1 text-3xl tabular-nums text-ink">{s.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_10px_30px_rgba(80,40,40,0.06)] sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or phone…"
              className="font-ui w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-wine/30 focus:ring-2"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'All'],
                ['yes', 'Attending'],
                ['no', 'Declined'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAttend(value)}
                className={`font-ui rounded-full px-3.5 py-2 text-sm ${
                  attend === value
                    ? 'bg-wine text-white'
                    : 'border border-black/10 bg-white text-ink/75 hover:bg-cream'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(80,40,40,0.06)]">
          {loading ? (
            <p className="font-ui p-8 text-center text-sm text-muted">Loading RSVPs…</p>
          ) : error ? (
            <div className="space-y-3 p-8 text-center">
              <p className="font-ui text-sm text-wine">{error}</p>
              <p className="font-ui mx-auto max-w-md text-xs text-muted">
                Update the Apps Script from <code>scripts/rsvp-google-apps-script.gs</code>, then
                Deploy → Manage deployments → pencil → New version.
              </p>
              <button
                type="button"
                onClick={() => void load()}
                className="font-ui rounded-full bg-wine px-4 py-2 text-sm text-white"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="font-ui p-8 text-center text-sm text-muted">
              {rows.length ? 'No matches for this search/filter.' : 'No RSVPs yet.'}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead className="border-b border-black/8 bg-[#f7f1e8]">
                    <tr className="font-ui text-[11px] tracking-[0.12em] text-muted uppercase">
                      {(
                        [
                          ['timestamp', 'When'],
                          ['name', 'Name'],
                          ['phone', 'Phone'],
                          ['attending', 'Status'],
                          ['lang', 'Lang'],
                        ] as const
                      ).map(([key, label]) => (
                        <th key={key} className="px-4 py-3 font-medium">
                          <button
                            type="button"
                            onClick={() => toggleSort(key)}
                            className="inline-flex items-center gap-1 hover:text-ink"
                          >
                            {label}
                            {sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-black/5 last:border-0 hover:bg-[#faf6ef]"
                      >
                        <td className="font-ui px-4 py-3 text-sm whitespace-nowrap text-ink/70">
                          {formatWhen(r.timestamp)}
                        </td>
                        <td className="font-display px-4 py-3 text-base">{r.name}</td>
                        <td className="font-ui px-4 py-3 text-sm text-ink/70">
                          {r.phone ? (
                            <a
                              className="underline-offset-2 hover:underline"
                              href={`tel:${r.phone}`}
                            >
                              {r.phone}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-ui inline-flex rounded-full px-2.5 py-1 text-xs ${
                              r.attending === 'yes'
                                ? 'bg-emerald-50 text-emerald-800'
                                : r.attending === 'no'
                                  ? 'bg-rose-50 text-rose-800'
                                  : 'bg-black/5 text-ink/60'
                            }`}
                          >
                            {r.attending === 'yes'
                              ? 'Attending'
                              : r.attending === 'no'
                                ? 'Declined'
                                : r.attending || '—'}
                          </span>
                        </td>
                        <td className="font-ui px-4 py-3 text-sm uppercase text-ink/70">
                          {r.lang || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="font-ui flex flex-wrap items-center justify-between gap-3 border-t border-black/8 px-4 py-3 text-sm text-ink/65">
                <p>
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{' '}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="tabular-nums">
                    {page} / {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
