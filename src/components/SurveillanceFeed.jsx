import { useState, useEffect } from 'react'

// ── CourtListener public API — no key required ──────────────────────────────
// Searches for recent opinions involving surveillance tech litigation
const CL_QUERIES = [
  '"license plate reader"',
  '"Clearview AI"',
  '"ShotSpotter"',
  '"Flock Safety" surveillance',
]

// API keys are injected server-side by the proxy function — no client exposure
// Set OPENSTATES_KEY and CONGRESS_KEY in Netlify > Site Settings > Env Vars

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
    <span
      className="sf2-status-badge"
      style={{ color, borderColor: color }}
    >
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
        `/.netlify/functions/proxy?service=courtlistener&q=${encodeURIComponent(q)}&type=o&format=json&order_by=dateFiled+desc`
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
      `/.netlify/functions/proxy?service=congress&format=json&limit=50&sort=updateDate+desc`
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
    // Key is now injected server-side via the proxy — always attempt the fetch
    let cancelled = false
    setBillsLoading(true)
    setBillsError(null)

    // Show retrying state after first attempt delay
    const billsRetryTimer = setTimeout(() => {
      if (!cancelled) setBillsRetrying(true)
    }, 1300)

    const stateQuery = 'license+plate+reader+surveillance'

    fetchWithRetry(
      `/.netlify/functions/proxy?service=openstates&q=${stateQuery}&include=abstracts&sort=updated_desc&per_page=8`
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
    <section className="sf2-page">
      <div className="sf2-inner">

        {/* Header */}
        <div className="sf2-header">
          <div className="sf2-section-label">Intelligence Feed</div>
          <h2 className="sf2-page-title">Surveillance Litigation & Legislation</h2>
          <p className="sf2-page-desc">
            Live court cases and legislative activity tracking ALPR, Flock Safety, Clearview AI, and mass surveillance accountability efforts.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="sf2-grid">

          {/* ── Active Cases ─────────────────────────────── */}
          <div>
            <div className="sf2-col-header">
              <div className="sf2-col-title-group">
                <span className="sf2-live-dot" />
                <span className="sf2-col-title">Active Cases</span>
              </div>
              <a
                href="https://www.courtlistener.com/?q=%22license+plate+reader%22+OR+%22ALPR%22+OR+%22Clearview+AI%22+OR+%22ShotSpotter%22&type=o&order_by=dateFiled+desc"
                target="_blank"
                rel="noopener noreferrer"
                className="sf2-link"
              >
                View all →
              </a>
            </div>

            {casesLoading ? (
              <CasesSkeleton />
            ) : casesRetrying ? (
              <div className="sf2-loading">
                <span className="sf-loading-dot" />
                Retrying CourtListener…
              </div>
            ) : casesError && cases.length === 0 ? (
              <div className="sf2-empty">
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
                    className="sf2-card"
                    style={{ borderBottom: i < cases.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="sf2-title">{c.caseName || 'Unnamed Case'}</div>
                    <div className="sf2-meta">
                      <span className="sf2-meta-text">
                        {c.court_citation_string || c.court}
                      </span>
                      {c.dateFiled && (
                        <>
                          <span className="sf2-meta-dot">·</span>
                          <span className="sf2-meta-text">{c.dateFiled}</span>
                        </>
                      )}
                      {c.status && (
                        <>
                          <span className="sf2-meta-dot">·</span>
                          <span className="sf2-meta-status">{c.status}</span>
                        </>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div className="sf2-source">
              Source: CourtListener (Free Law Project) · Real-time
            </div>
          </div>

          {/* ── Legislative Watch ─────────────────────────────── */}
          <div>
            <div className="sf2-col-header">
              <div className="sf2-col-title-group">
                <span className="sf2-col-title">Legislative Watch</span>
                {bills.some(b => b.isMock) && (
                  <span className="sf2-badge">Preview</span>
                )}
              </div>
              <a
                href="https://openstates.org/find_your_legislator/"
                target="_blank"
                rel="noopener noreferrer"
                className="sf2-link"
              >
                View all →
              </a>
            </div>

            {billsLoading && billsRetrying ? (
              <div className="sf2-loading">
                <span className="sf-loading-dot" />
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
                    className="sf2-card"
                    style={{ borderBottom: i < bills.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="sf2-card-header">
                      <span className="sf2-state-tag">{b.state}</span>
                      <div className="sf2-bill-title">{b.title}</div>
                    </div>
                    <div className="sf2-bill-meta">
                      <StatusBadge status={b.status} />
                      {b.lastAction && (
                        <span className="sf2-meta-muted">{b.lastAction}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {billsError && (
              <div className="sf2-error-note">{billsError}</div>
            )}

            {bills.some(b => b.isMock) && (
              <div className="sf2-mock-notice">
                📡 Sample data shown. Live 50-state legislative tracking activates at launch.{' '}
                <a
                  href="https://openstates.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStates covers all 50 states →
                </a>
              </div>
            )}

            <div className="sf2-source">
              Source: OpenStates (Open States Project) · 50-state coverage
            </div>
          </div>
        </div>

        {/* ── Federal Bills ─────────────────────────────── */}
        <div className="sf2-federal-section">
          <div className="sf2-col-header">
            <div className="sf2-col-title-group">
              <span className="sf2-col-title">Federal Bills</span>
              <span className="sf2-badge sf2-badge--federal">Federal</span>
              {federalBills.some(b => b.isFallback) && (
                <span className="sf2-badge">Known Bills</span>
              )}
            </div>
            <a
              href="https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22search%22%3A%22surveillance%22%7D"
              target="_blank"
              rel="noopener noreferrer"
              className="sf2-link"
            >
              View all →
            </a>
          </div>

          {federalLoading && federalRetrying ? (
            <div className="sf2-loading">
              <span className="sf-loading-dot" />
              Retrying Congress.gov…
            </div>
          ) : federalLoading ? (
            <FederalBillsSkeleton />
          ) : (
            <div className="sf2-federal-grid">
              {federalBills.slice(0, 4).map((b, i) => (
                <a
                  key={b.id}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sf2-card"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="sf2-card-header">
                    <span className="sf2-federal-tag">{b.congress}th</span>
                    <div className="sf2-bill-title">{b.title}</div>
                  </div>
                  <div className="sf2-federal-meta">
                    <StatusBadge status={b.status} />
                    {b.date && (
                      <span className="sf2-meta-mono">{b.date}</span>
                    )}
                    {b.lastAction && b.lastAction !== b.status && (
                      <span className="sf2-meta-muted">
                        {b.lastAction.length > 80 ? b.lastAction.slice(0, 80) + '…' : b.lastAction}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          {federalError && (
            <div className="sf2-error-note">{federalError}</div>
          )}

          <div className="sf2-source">
            Source: Congress.gov API · 119th Congress
          </div>
        </div>

        {/* CTA */}
        {setTab && (
          <div className="sf2-cta">
            <div>
              <p className="sf2-cta-title">These cases need funding.</p>
              <p className="sf2-cta-desc">
                Every lawsuit above represents a gap only anonymous crowdfunding can fill.
              </p>
            </div>
            <button
              onClick={() => setTab('campaigns')}
              className="sf2-cta-btn"
            >
              Browse Campaigns →
            </button>
          </div>
        )}

      </div>
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
