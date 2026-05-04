import { useState, useEffect } from 'react'

// ── CourtListener public API — no key required ──────────────────────────────
// Searches for recent opinions involving surveillance tech litigation
const CL_QUERIES = [
  '"license plate reader"',
  '"Clearview AI"',
  '"ShotSpotter"',
  '"Flock Safety" surveillance',
]

// ── OpenStates — requires a free API key ────────────────────────────────────
// Get yours at: https://openstates.org/account/profile/
// Set VITE_OPENSTATES_KEY in your .env file
const OPENSTATES_KEY = import.meta.env.VITE_OPENSTATES_KEY || ''

// Mock legislative data shown when no OpenStates key is configured
const MOCK_BILLS = [
  {
    id: 'mock-1',
    title: 'Automated License Plate Reader Data Privacy Act',
    state: 'WA',
    status: 'In Committee',
    lastAction: 'Referred to Judiciary Committee',
    url: 'https://openstates.org/',
    isMock: true,
  },
  {
    id: 'mock-2',
    title: 'Surveillance Warrant Requirement for ALPR Systems',
    state: 'CA',
    status: 'Passed Assembly',
    lastAction: 'Senate Floor Vote Pending',
    url: 'https://openstates.org/',
    isMock: true,
  },
  {
    id: 'mock-3',
    title: 'License Plate Data Retention Limits — 30 Day Maximum',
    state: 'CO',
    status: 'Introduced',
    lastAction: 'Assigned to Senate Finance',
    url: 'https://openstates.org/',
    isMock: true,
  },
  {
    id: 'mock-4',
    title: 'Prohibition on Facial Recognition in Public Housing',
    state: 'IL',
    status: 'Signed into Law',
    lastAction: 'Effective January 1, 2025',
    url: 'https://openstates.org/',
    isMock: true,
  },
  {
    id: 'mock-5',
    title: 'ALPR Data Sharing Transparency and Audit Requirements',
    state: 'NY',
    status: 'In Committee',
    lastAction: 'Public Hearing Scheduled',
    url: 'https://openstates.org/',
    isMock: true,
  },
]

function StatusBadge({ status }) {
  const color =
    /signed|enacted|law/i.test(status) ? 'var(--accent)' :
    /passed/i.test(status) ? '#2980b9' :
    /introduced/i.test(status) ? 'var(--muted)' :
    'var(--muted)'
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color,
      border: `1px solid ${color}`,
      padding: '2px 6px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      opacity: 0.9,
    }}>
      {status}
    </span>
  )
}

export default function SurveillanceFeed() {
  const [cases, setCases] = useState([])
  const [bills, setBills] = useState([])
  const [casesLoading, setCasesLoading] = useState(true)
  const [billsLoading, setBillsLoading] = useState(true)
  const [casesError, setCasesError] = useState(null)
  const [billsError, setBillsError] = useState(null)

  // ── Fetch CourtListener cases ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setCasesLoading(true)
    setCasesError(null)

    // Fetch two queries in parallel and merge, deduplicated by cluster_id
    const fetches = [
      '"license plate reader"',
      '"Clearview AI" OR "ShotSpotter" OR "ALPR" surveillance',
    ].map(q =>
      fetch(
        `https://www.courtlistener.com/api/rest/v4/search/?q=${encodeURIComponent(q)}&type=o&format=json&order_by=dateFiled+desc`
      ).then(r => r.ok ? r.json() : Promise.reject(r.status))
    )

    Promise.allSettled(fetches).then(results => {
      if (cancelled) return
      const seen = new Set()
      const merged = []
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value?.results) {
          for (const item of r.value.results) {
            if (!seen.has(item.cluster_id)) {
              seen.add(item.cluster_id)
              merged.push(item)
            }
          }
        }
      }
      if (merged.length === 0) {
        setCasesError('No results returned')
      } else {
        // Sort by dateFiled desc, take top 5
        merged.sort((a, b) => (b.dateFiled || '').localeCompare(a.dateFiled || ''))
        setCases(merged.slice(0, 5))
      }
      setCasesLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  // ── Fetch OpenStates bills (or show mock) ─────────────────────────────────
  useEffect(() => {
    if (!OPENSTATES_KEY) {
      setBills(MOCK_BILLS)
      setBillsLoading(false)
      return
    }

    let cancelled = false
    setBillsLoading(true)
    setBillsError(null)

    fetch(
      `https://v3.openstates.org/bills?q=license+plate+reader+surveillance&include=abstracts&sort=updated_desc&per_page=5&apikey=${OPENSTATES_KEY}`
    )
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (cancelled) return
        const results = (data.results || []).map(b => ({
          id: b.id,
          title: b.title,
          state: b.jurisdiction?.name || b.jurisdiction_name || '?',
          status: b.status || b.latest_action_description || 'Unknown',
          lastAction: b.latest_action_description || '',
          url: b.openstates_url || 'https://openstates.org/',
        }))
        setBills(results.length ? results : MOCK_BILLS)
        setBillsLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setBills(MOCK_BILLS)
        setBillsError(`API error (${err}) — showing sample data`)
        setBillsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return (
    <section style={{
      minHeight: '60vh',
      padding: '80px 24px 60px',
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 12,
          }}>
            Intelligence Feed
          </div>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
            marginBottom: 12,
            color: 'var(--fg)',
          }}>
            Surveillance Litigation & Legislation
          </h1>
          <p style={{
            color: 'var(--muted)',
            fontSize: 14,
            lineHeight: 1.6,
            maxWidth: 560,
            margin: 0,
          }}>
            Live court cases and legislative activity tracking ALPR, Flock Safety, Clearview AI, and mass surveillance accountability efforts.
          </p>
        </div>

        {/* Two-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 32,
          alignItems: 'start',
        }}>

          {/* ── Active Cases ─────────────────────────────── */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 12,
              borderBottom: '2px solid var(--fg)',
              marginBottom: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'inline-block',
                  animation: 'sfdot 1.8s ease-in-out infinite',
                }} />
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--fg)',
                }}>
                  Active Cases
                </span>
              </div>
              <a
                href="https://www.courtlistener.com/?q=%22license+plate+reader%22+OR+%22ALPR%22+OR+%22Clearview+AI%22+OR+%22ShotSpotter%22&type=o&order_by=dateFiled+desc"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                }}
              >
                View all →
              </a>
            </div>

            {casesLoading ? (
              <CasesSkeleton />
            ) : casesError && cases.length === 0 ? (
              <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
                CourtListener unavailable — check back shortly.
              </div>
            ) : (
              <div>
                {cases.map((c, i) => (
                  <a
                    key={c.cluster_id}
                    href={`https://www.courtlistener.com${c.absolute_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      padding: '16px 0',
                      borderBottom: i < cases.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.marginLeft = '-12px'; e.currentTarget.style.paddingLeft = '12px'; e.currentTarget.style.marginRight = '-12px'; e.currentTarget.style.paddingRight = '12px' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.marginLeft = '0'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.marginRight = '0'; e.currentTarget.style.paddingRight = '0' }}
                  >
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--fg)',
                      marginBottom: 4,
                      lineHeight: 1.4,
                    }}>
                      {c.caseName || 'Unnamed Case'}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        fontFamily: 'var(--mono)',
                      }}>
                        {c.court_citation_string || c.court}
                      </span>
                      {c.dateFiled && (
                        <>
                          <span style={{ color: 'var(--border)', fontSize: 11 }}>·</span>
                          <span style={{
                            fontSize: 11,
                            color: 'var(--muted)',
                            fontFamily: 'var(--mono)',
                          }}>
                            {c.dateFiled}
                          </span>
                        </>
                      )}
                      {c.status && (
                        <>
                          <span style={{ color: 'var(--border)', fontSize: 11 }}>·</span>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                          }}>
                            {c.status}
                          </span>
                        </>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div style={{
              marginTop: 16,
              fontSize: 10,
              color: 'var(--muted)',
              letterSpacing: '0.04em',
            }}>
              Source: CourtListener (Free Law Project) · Real-time
            </div>
          </div>

          {/* ── Legislative Watch ─────────────────────────────── */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 12,
              borderBottom: '2px solid var(--fg)',
              marginBottom: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--fg)',
                }}>
                  Legislative Watch
                </span>
                {!OPENSTATES_KEY && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                    padding: '2px 5px',
                  }}>
                    Sample
                  </span>
                )}
              </div>
              <a
                href="https://openstates.org/find_your_legislator/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                }}
              >
                View all →
              </a>
            </div>

            {billsLoading ? (
              <BillsSkeleton />
            ) : (
              <div>
                {bills.slice(0, 5).map((b, i) => (
                  <a
                    key={b.id}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      padding: '16px 0',
                      borderBottom: i < bills.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.marginLeft = '-12px'; e.currentTarget.style.paddingLeft = '12px'; e.currentTarget.style.marginRight = '-12px'; e.currentTarget.style.paddingRight = '12px' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.marginLeft = '0'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.marginRight = '0'; e.currentTarget.style.paddingRight = '0' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      marginBottom: 6,
                    }}>
                      <span style={{
                        flexShrink: 0,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--fg)',
                        border: '1px solid var(--border)',
                        padding: '3px 6px',
                        marginTop: 1,
                      }}>
                        {b.state}
                      </span>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--fg)',
                        lineHeight: 1.4,
                      }}>
                        {b.title}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                      paddingLeft: 36,
                    }}>
                      <StatusBadge status={b.status} />
                      {b.lastAction && (
                        <span style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          lineHeight: 1.4,
                        }}>
                          {b.lastAction}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {billsError && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                {billsError}
              </div>
            )}

            {!OPENSTATES_KEY && (
              <div style={{
                marginTop: 16,
                padding: '12px 14px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                fontSize: 11,
                color: 'var(--muted)',
                lineHeight: 1.5,
              }}>
                📡 Live legislative data available with a free OpenStates API key.{' '}
                <a
                  href="https://openstates.org/account/profile/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}
                >
                  Get yours →
                </a>
                {' '}then set <code style={{ fontFamily: 'var(--mono)' }}>VITE_OPENSTATES_KEY</code> in your .env file.
              </div>
            )}

            <div style={{
              marginTop: 16,
              fontSize: 10,
              color: 'var(--muted)',
              letterSpacing: '0.04em',
            }}>
              Source: OpenStates (Open States Project) · 50-state coverage
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sfdot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.7); }
        }
      `}</style>
    </section>
  )
}

function CasesSkeleton() {
  return (
    <div style={{ paddingTop: 8 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ padding: '16px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 2, marginBottom: 8, width: `${60 + (i % 3) * 15}%` }} />
          <div style={{ height: 11, background: 'var(--bg2)', borderRadius: 2, width: '35%' }} />
        </div>
      ))}
    </div>
  )
}

function BillsSkeleton() {
  return (
    <div style={{ paddingTop: 8 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ padding: '16px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 2, marginBottom: 8, width: `${55 + (i % 3) * 15}%` }} />
          <div style={{ height: 11, background: 'var(--bg2)', borderRadius: 2, width: '45%' }} />
        </div>
      ))}
    </div>
  )
}
