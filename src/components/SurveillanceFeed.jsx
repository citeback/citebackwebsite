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

// ── Congress.gov — DEMO_KEY works for dev (30 req/hr) ────────────────────────
// Set VITE_CONGRESS_KEY in your .env for a full key
const CONGRESS_KEY = import.meta.env.VITE_CONGRESS_KEY || 'DEMO_KEY'

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

// Static fallback bills shown when Congress.gov returns no surveillance matches
const FEDERAL_BILLS_FALLBACK = [
  {
    id: 'S.1265-119',
    title: 'Fourth Amendment Is Not For Sale Act',
    congress: 119,
    status: 'Introduced',
    lastAction: 'Read twice and referred to the Committee on the Judiciary',
    date: '2025-03-27',
    url: 'https://www.congress.gov/bill/119th-congress/senate-bill/1265',
    isFallback: true,
  },
  {
    id: 'HR.776-119',
    title: 'American Data Privacy and Protection Act',
    congress: 119,
    status: 'Introduced',
    lastAction: 'Referred to the House Committee on Energy and Commerce',
    date: '2025-01-28',
    url: 'https://www.congress.gov/bill/119th-congress/house-bill/776',
    isFallback: true,
  },
  {
    id: 'S.509-119',
    title: 'Facial Recognition and Biometric Technology Moratorium Act',
    congress: 119,
    status: 'Introduced',
    lastAction: 'Read twice and referred to the Committee on Commerce, Science, and Transportation',
    date: '2025-02-11',
    url: 'https://www.congress.gov/bill/119th-congress/senate-bill/509',
    isFallback: true,
  },
  {
    id: 'S.744-119',
    title: 'Location Privacy Protection Act',
    congress: 119,
    status: 'Introduced',
    lastAction: 'Read twice and referred to the Committee on Commerce, Science, and Transportation',
    date: '2025-02-27',
    url: 'https://www.congress.gov/bill/119th-congress/senate-bill/744',
    isFallback: true,
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

// Helper: fetch with one automatic retry on failure
async function fetchWithRetry(url, attempts = 2, delayMs = 1200) {
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url)
      if (r.ok) return r
      throw new Error(`HTTP ${r.status}`)
    } catch (err) {
      if (i < attempts - 1) {
        await new Promise(res => setTimeout(res, delayMs))
      } else {
        throw err
      }
    }
  }
}

export default function SurveillanceFeed({ setTab }) {
  const [cases, setCases] = useState([])
  const [bills, setBills] = useState([])
  const [federalBills, setFederalBills] = useState([])
  const [casesLoading, setCasesLoading] = useState(true)
  const [billsLoading, setBillsLoading] = useState(true)
  const [federalLoading, setFederalLoading] = useState(true)
  const [casesError, setCasesError] = useState(null)
  const [billsError, setBillsError] = useState(null)
  const [federalError, setFederalError] = useState(null)
  const [casesRetrying, setCasesRetrying] = useState(false)
  const [federalRetrying, setFederalRetrying] = useState(false)
  const [billsRetrying, setBillsRetrying] = useState(false)

  // ── Fetch CourtListener cases ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setCasesLoading(true)
    setCasesError(null)

    // Fetch three queries in parallel and merge, deduplicated by cluster_id
    const queries = [
      '"license plate reader" OR "ALPR" surveillance',
      '"Clearview AI" OR "facial recognition" fourth amendment',
      '"ShotSpotter" OR "Flock Safety" OR "biometric" surveillance',
    ]
    const fetches = queries.map(q =>
      fetchWithRetry(
        `https://www.courtlistener.com/api/rest/v4/search/?q=${encodeURIComponent(q)}&type=o&format=json&order_by=dateFiled+desc`
      )
        .then(r => r.json())
        .catch(() => null)
    )

    // Show retrying state after first attempt delay
    const retryTimer = setTimeout(() => {
      if (!cancelled) setCasesRetrying(true)
    }, 1300)

    Promise.all(fetches).then(results => {
      clearTimeout(retryTimer)
      if (!cancelled) setCasesRetrying(false)
      if (cancelled) return
      const seen = new Set()
      const merged = []
      for (const r of results) {
        if (r?.results) {
          for (const item of r.results) {
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
    }).catch(() => {
      if (!cancelled) {
        setCasesRetrying(false)
        setCasesError('CourtListener unreachable after retry')
        setCasesLoading(false)
      }
    })

    return () => { cancelled = true; clearTimeout(retryTimer) }
  }, [])

  // ── Fetch Congress.gov federal bills ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setFederalLoading(true)
    setFederalError(null)

    const SURVEILLANCE_TERMS = /surveillance|license plate|privacy|tracking|biometric|facial recognition|ALPR|fourth amendment/i

    // Show retrying state after first attempt delay
    const federalRetryTimer = setTimeout(() => {
      if (!cancelled) setFederalRetrying(true)
    }, 1300)

    // Fetch a larger batch to improve odds of matching surveillance-relevant bills
    fetchWithRetry(
      `https://api.congress.gov/v3/bill/119?format=json&limit=50&api_key=${CONGRESS_KEY}&sort=updateDate+desc`
    )
      .then(r => r.json())
      .then(data => {
        clearTimeout(federalRetryTimer)
        if (cancelled) return
        setFederalRetrying(false)
        const matched = (data.bills || []).filter(b => SURVEILLANCE_TERMS.test(b.title || ''))
        if (matched.length === 0) {
          setFederalBills(FEDERAL_BILLS_FALLBACK)
        } else {
          setFederalBills(matched.slice(0, 5).map(b => {
            const typeSlug = b.type === 'HR' ? 'house-bill' : b.type === 'S' ? 'senate-bill' : (b.type || '').toLowerCase()
            return {
              id: `${b.type}${b.number}-${b.congress}`,
              title: b.title,
              congress: b.congress,
              status: b.latestAction?.text || 'Unknown',
              lastAction: b.latestAction?.text || '',
              date: b.latestAction?.actionDate || '',
              url: `https://www.congress.gov/bill/${b.congress}th-congress/${typeSlug}/${b.number}`,
            }
          }))
        }
        setFederalLoading(false)
      })
      .catch(err => {
        clearTimeout(federalRetryTimer)
        if (cancelled) return
        setFederalRetrying(false)
        setFederalBills(FEDERAL_BILLS_FALLBACK)
        setFederalError(`API unavailable (${err}) — showing known legislation`)
        setFederalLoading(false)
      })

    return () => { cancelled = true; clearTimeout(federalRetryTimer) }
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

    // Show retrying state after first attempt delay
    const billsRetryTimer = setTimeout(() => {
      if (!cancelled) setBillsRetrying(true)
    }, 1300)

    const stateQuery = 'license+plate+reader+surveillance'

    fetchWithRetry(
      `https://v3.openstates.org/bills?q=${stateQuery}&include=abstracts&sort=updated_desc&per_page=8&apikey=${OPENSTATES_KEY}`
    )
      .then(r => r.json())
      .then(data => {
        clearTimeout(billsRetryTimer)
        if (cancelled) return
        setBillsRetrying(false)
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
        clearTimeout(billsRetryTimer)
        if (cancelled) return
        setBillsRetrying(false)
        setBills(MOCK_BILLS)
        setBillsError(`API error (${err}) — showing sample data`)
        setBillsLoading(false)
      })

    return () => { cancelled = true; clearTimeout(billsRetryTimer) }
  }, [])

  return (
    <section style={{
      minHeight: '60vh',
      padding: 'clamp(48px, 8vw, 80px) 24px 60px',
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--red)',
            marginBottom: 12,
          }}>
            Intelligence Feed
          </div>
          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 42px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: 0,
            marginBottom: 12,
            color: 'var(--fg)',
          }}>
            Surveillance Litigation & Legislation
          </h2>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
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
            ) : casesRetrying ? (
              <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'sfdot 1s ease-in-out infinite' }} />
                Retrying CourtListener…
              </div>
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
                    Preview
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

            {billsLoading && billsRetrying ? (
              <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'sfdot 1s ease-in-out infinite' }} />
                Retrying OpenStates…
              </div>
            ) : billsLoading ? (
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
                📡 Sample data shown. Live 50-state legislative tracking activates at launch.{' '}
                <a
                  href="https://openstates.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}
                >
                  OpenStates covers all 50 states →
                </a>
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

        {/* ── Federal Bills ─────────────────────────────── */}
        <div style={{ marginTop: 40 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
            borderBottom: '2px solid var(--fg)',
            marginBottom: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg)',
              }}>
                Federal Bills
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                padding: '2px 6px',
                opacity: 0.85,
              }}>
                Federal
              </span>
              {federalBills.some(b => b.isFallback) && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                  padding: '2px 5px',
                }}>
                  Known Bills
                </span>
              )}
            </div>
            <a
              href="https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22search%22%3A%22surveillance%22%7D"
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

          {federalLoading && federalRetrying ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'sfdot 1s ease-in-out infinite' }} />
              Retrying Congress.gov…
            </div>
          ) : federalLoading ? (
            <FederalBillsSkeleton />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
              gap: 0,
            }}>
              {federalBills.slice(0, 4).map((b, i) => (
                <a
                  key={b.id}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    padding: '16px 0',
                    borderBottom: '1px solid var(--border)',
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
                      color: 'var(--accent)',
                      border: '1px solid var(--accent)',
                      padding: '3px 6px',
                      marginTop: 1,
                      opacity: 0.8,
                    }}>
                      {b.congress}th
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
                    paddingLeft: 40,
                  }}>
                    <StatusBadge status={b.status} />
                    {b.date && (
                      <span style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        fontFamily: 'var(--mono)',
                      }}>
                        {b.date}
                      </span>
                    )}
                    {b.lastAction && b.lastAction !== b.status && (
                      <span style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        lineHeight: 1.4,
                      }}>
                        {b.lastAction.length > 80 ? b.lastAction.slice(0, 80) + '…' : b.lastAction}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          {federalError && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
              {federalError}
            </div>
          )}

          <div style={{
            marginTop: 16,
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: '0.04em',
          }}>
            Source: Congress.gov API · 119th Congress
          </div>
        </div>

        {/* CTA */}
        {setTab && (
          <div style={{
            marginTop: 48, paddingTop: 32, borderTop: '2px solid var(--fg)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 20,
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: 'var(--fg)' }}>
                These cases need funding.
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                Every lawsuit above represents a gap only anonymous crowdfunding can fill.
              </p>
            </div>
            <button
              onClick={() => setTab('campaigns')}
              style={{
                background: 'var(--fg)', color: 'var(--bg)', border: 'none',
                padding: '13px 28px', fontSize: 13, fontWeight: 600,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'var(--font)', flexShrink: 0,
              }}
            >
              Browse Campaigns →
            </button>
          </div>
        )}

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

function FederalBillsSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
      paddingTop: 8,
    }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 2, marginBottom: 8, width: `${50 + (i % 3) * 18}%` }} />
          <div style={{ height: 11, background: 'var(--bg2)', borderRadius: 2, width: '55%' }} />
        </div>
      ))}
    </div>
  )
}
