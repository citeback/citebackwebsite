import { useState, useEffect } from 'react'
import { ExternalLink, DollarSign, AlertCircle, Briefcase, Loader } from 'lucide-react'

// Static data pulled from USASpending.gov API (2025-10-01 to present, via keyword search)
// Source: https://api.usaspending.gov — no auth required, public federal spending records
// Last refreshed: 2026-05-04
const DATA_FRESHNESS = 'May 2026'
const VENDOR_DATA = [
  {
    name: 'Palantir',
    recipients: ['PALANTIR TECHNOLOGIES INC.', 'PALANTIR USG INC'],
    totalContracts: '$3.8B+ (partial)',
    contractCount: '100+ awards on record',
    topAward: '$292,680,689',
    topAwardDesc: 'Defense / Intelligence analytics platform',
    topAwardAgency: 'Dept. of Defense',
    searchUrl: 'https://www.usaspending.gov/search/?hash=d8e2ede8db13c474b88e9e51f87d2a44',
    color: '#ff6b35',
    note: 'Largest surveillance-tech federal contractor in USASpending records. Provides data fusion for ICE, DHS, DoD, and various law-enforcement agencies.',
    ldaQuery: 'palantir',
    ldaSearchUrl: 'https://lda.senate.gov/filings/list/filing/?client_name=palantir',
  },
  {
    name: 'Axon',
    recipients: ['AXON ENTERPRISE, INC.'],
    totalContracts: '$353M+ (partial)',
    contractCount: '100+ awards on record',
    topAward: '$20,555,205',
    topAwardDesc: 'Tasers, body cameras, digital evidence platform',
    topAwardAgency: 'Dept. of Justice / Federal Law Enforcement',
    searchUrl: 'https://www.usaspending.gov/search/?hash=axon_enterprise',
    color: '#ffd166',
    note: 'Dominates federal body-camera contracts. Evidence.com cloud platform stores footage from thousands of agencies — centralizing law-enforcement video under a single corporate SaaS.',
    ldaQuery: 'axon enterprise',
    ldaSearchUrl: 'https://lda.senate.gov/filings/list/filing/?client_name=axon',
  },
  {
    name: 'Clearview AI',
    recipients: ['CLEARVIEW AI, INC.'],
    totalContracts: '$8,929,688',
    contractCount: '27 federal awards',
    topAward: '$3,750,000',
    topAwardDesc: 'Facial recognition search — 3B+ scraped photos',
    topAwardAgency: 'Dept. of Homeland Security / ICE / CBP',
    searchUrl: 'https://www.usaspending.gov/search/?hash=clearview_ai',
    color: '#e63946',
    note: 'Scraped billions of photos without consent. ICE, CBP, and Army use it for identification. Multiple GDPR bans in EU; legal challenges ongoing in the US.',
    ldaQuery: 'clearview',
    ldaSearchUrl: 'https://lda.senate.gov/filings/list/filing/?client_name=clearview',
  },
  {
    name: 'ShotSpotter / SoundThinking',
    recipients: ['SOUNDTHINKING, INC.'],
    totalContracts: '$1,248,294',
    contractCount: '9 federal awards',
    topAward: '$500,000',
    topAwardDesc: 'Acoustic gunshot detection sensors',
    topAwardAgency: 'Various federal agencies',
    searchUrl: 'https://www.usaspending.gov/search/?hash=shotspotter',
    color: '#a855f7',
    note: 'Gunshot detection with documented false-positive problems. Internal data showed ~90% of alerts led to no evidence of a crime. Rebranded to SoundThinking in 2023.',
    ldaQuery: 'soundthinking',
    ldaSearchUrl: 'https://lda.senate.gov/filings/list/filing/?client_name=soundthinking',
  },
  {
    name: 'Flock Safety',
    recipients: ['FLOCK GROUP INC'],
    totalContracts: '$252,600',
    contractCount: '2 federal awards',
    topAward: '$231,600',
    topAwardDesc: 'ALPR cameras — US Park Police, Washington DC metro area',
    topAwardAgency: 'Dept. of Interior / US Park Police',
    searchUrl: 'https://www.usaspending.gov/search/?hash=flock_safety',
    color: '#06b6d4',
    note: 'Federal footprint is small — Flock\'s real scale is thousands of local police contracts. A Park Police ALPR deployment in the DC metro area is on record. Local contracts dwarf federal spending.',
    ldaQuery: null, // Flock lobbies at state level, not federal
    ldaSearchUrl: null,
  },
]

// Fetch lobbying data from Senate LDA API (no auth required)
// Returns { count, totalExpenses, totalIncome, error }
async function fetchLdaData(clientQuery) {
  try {
    const url = `https://lda.senate.gov/api/v1/filings/?client_name=${encodeURIComponent(clientQuery)}&format=json&limit=100`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    const count = data.count || 0
    let totalExpenses = 0
    let totalIncome = 0
    let expenseCount = 0

    for (const filing of (data.results || [])) {
      if (filing.expenses != null) {
        totalExpenses += parseFloat(filing.expenses)
        expenseCount++
      }
      if (filing.income != null) {
        totalIncome += parseFloat(filing.income)
      }
    }

    return { count, totalExpenses, totalIncome, expenseCount, error: null }
  } catch (err) {
    return { count: null, totalExpenses: 0, totalIncome: 0, expenseCount: 0, error: err.message }
  }
}

function formatDollars(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default function FollowTheMoney() {
  const [expanded, setExpanded] = useState(null)
  const [ldaData, setLdaData] = useState({}) // keyed by vendor name
  const [ldaLoading, setLdaLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      const results = {}
      await Promise.all(
        VENDOR_DATA.map(async (v) => {
          if (!v.ldaQuery) {
            results[v.name] = { skipped: true }
            return
          }
          results[v.name] = await fetchLdaData(v.ldaQuery)
        })
      )
      if (!cancelled) {
        setLdaData(results)
        setLdaLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ marginTop: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <DollarSign size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>Follow the Money</h3>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--muted)', border: '1px solid var(--border)', padding: '2px 7px',
            marginLeft: 4,
          }}>
            USASpending.gov · Last verified {DATA_FRESHNESS}
          </span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65, maxWidth: 600 }}>
          Federal taxpayer dollars flowing to surveillance vendors — contracts from{' '}
          <a
            href="https://www.usaspending.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            USASpending.gov
          </a>
          {' '}and lobbying disclosures from the{' '}
          <a
            href="https://lda.senate.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            Senate LDA
          </a>
          . These are <em>federal</em> figures only — state and local spending multiplies these numbers substantially.
        </p>
      </div>

      {/* Vendor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 24 }}>
        {VENDOR_DATA.map((v) => {
          const isOpen = expanded === v.name
          const lda = ldaData[v.name]

          return (
            <div
              key={v.name}
              onClick={() => setExpanded(isOpen ? null : v.name)}
              style={{
                background: 'var(--bg2)',
                border: `1px solid ${isOpen ? v.color + '55' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Vendor name + color dot + source link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</span>
                </div>
                <a
                  href={`https://www.usaspending.gov/search/?object_class=&recipient_search_text=${encodeURIComponent(v.recipients[0])}&award_type_codes=A,B,C,D`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 10, color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, opacity: 0.7 }}
                >
                  Source <ExternalLink size={9} />
                </a>
              </div>

              {/* Two-column stats: Federal Contracts + Lobbying */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {/* Federal Contracts */}
                <div style={{
                  background: 'var(--bg3, #111)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Federal Contracts
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: v.color, lineHeight: 1.1 }}>
                    {v.totalContracts}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                    {v.contractCount}
                  </div>
                </div>

                {/* Lobbying Disclosures */}
                <div style={{
                  background: 'var(--bg3, #111)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Briefcase size={9} />
                    Lobbying Disclosures
                  </div>

                  {/* Flock Safety — state-level special case */}
                  {!v.ldaQuery ? (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                        State-level lobbying
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.6, marginTop: 2 }}>
                        Federal disclosure not required
                      </div>
                    </div>
                  ) : ldaLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)' }}>
                      <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 11 }}>Loading…</span>
                    </div>
                  ) : lda?.error ? (
                    <div style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.6 }}>
                      LDA unavailable
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg, #e2e8f0)', lineHeight: 1.1 }}>
                        {lda?.count != null ? `${lda.count.toLocaleString()} filings` : '—'}
                      </div>
                      {(lda?.totalExpenses > 0 || lda?.totalIncome > 0) && (
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                          {lda.totalExpenses > 0
                            ? `${formatDollars(lda.totalExpenses)} expenses reported`
                            : `${formatDollars(lda.totalIncome)} income reported`}
                          <span style={{ opacity: 0.6 }}> (sample)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Top award */}
              <div style={{
                background: 'var(--bg3, #111)',
                borderRadius: 8,
                padding: '8px 10px',
                marginTop: 4,
                fontSize: 12,
                lineHeight: 1.5,
              }}>
                <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Largest single federal award</div>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{v.topAward}</div>
                <div style={{ color: 'var(--muted)', fontSize: 11 }}>{v.topAwardDesc}</div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ marginTop: 14, fontSize: 12, lineHeight: 1.65, color: 'var(--muted)' }}>
                  <div style={{ marginBottom: 10, color: 'var(--text)', fontSize: 12 }}>
                    <strong style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>Agency</strong>
                    <br />
                    {v.topAwardAgency}
                  </div>
                  <p style={{ marginBottom: 12 }}>{v.note}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <a
                      href={`https://www.usaspending.gov/search/?object_class=&recipient_search_text=${encodeURIComponent(v.recipients[0])}&award_type_codes=A,B,C,D`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: v.color, textDecoration: 'none', fontSize: 11, fontWeight: 600 }}
                    >
                      Federal contracts on USASpending.gov <ExternalLink size={10} />
                    </a>

                    {/* Flock Safety state-level note */}
                    {!v.ldaQuery && (
                      <div style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)',
                        borderRadius: 8, padding: '8px 10px', marginTop: 4,
                      }}>
                        <Briefcase size={12} style={{ color: v.color, flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={{ color: v.color, fontWeight: 700, fontSize: 11, marginBottom: 2 }}>
                            State-level lobbying — federal disclosure not required
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                            Flock Safety primarily lobbies state legislatures to secure local police contracts.
                            Federal LDA filings are not required for state-level activity. The real lobbying
                            footprint lives in state disclosure databases — not tracked centrally.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LDA link for vendors with federal lobbying */}
                    {v.ldaSearchUrl && lda && !lda.error && (
                      <a
                        href={v.ldaSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--muted)', textDecoration: 'none', fontSize: 11, fontWeight: 600 }}
                      >
                        Lobbying filings on Senate LDA <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 12, opacity: 0.5 }}>
                {isOpen ? 'Click to collapse' : 'Click to expand'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Attribution + caveats */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.12)',
        borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--muted)',
      }}>
        <AlertCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>Federal figures only. </span>
          State and local surveillance spending is not tracked centrally — the real dollar totals are far higher.
          {' '}Contract data from{' '}
          <a
            href="https://www.usaspending.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            USASpending.gov
          </a>
          {' '}— the official federal spending database.
          {' '}Lobbying data from the{' '}
          <a
            href="https://lda.senate.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            Senate Office of Public Records
          </a>
          {' '}— Lobbying Disclosure Act filings, live from the LDA API.
          {' '}Expense figures are sampled from the most recent 100 filings per vendor; totals across all filings may be higher.
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
