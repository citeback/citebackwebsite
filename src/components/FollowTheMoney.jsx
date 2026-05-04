import { useState } from 'react'
import { ExternalLink, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

// Static data pulled from USASpending.gov API (2025-10-01 to present, via keyword search)
// Source: https://api.usaspending.gov — no auth required, public federal spending records
// Last refreshed: 2026-05-04
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
  },
]

function formatCurrency(str) {
  return str
}

export default function FollowTheMoney() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ marginTop: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <DollarSign size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>Follow the Money</h3>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65, maxWidth: 600 }}>
          Federal taxpayer dollars flowing to surveillance vendors — pulled from{' '}
          <a
            href="https://www.usaspending.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            USASpending.gov
          </a>
          . These are <em>federal</em> contracts only — state and local spending multiplies these numbers substantially.
        </p>
      </div>

      {/* Vendor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
        {VENDOR_DATA.map((v) => {
          const isOpen = expanded === v.name
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
              {/* Vendor name + color dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</span>
              </div>

              {/* Total */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: v.color, lineHeight: 1.1 }}>
                  {v.totalContracts}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {v.contractCount}
                </div>
              </div>

              {/* Top award */}
              <div style={{
                background: 'var(--bg3, #111)',
                borderRadius: 8,
                padding: '8px 10px',
                marginTop: 10,
                fontSize: 12,
                lineHeight: 1.5,
              }}>
                <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Largest single award</div>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{v.topAward}</div>
                <div style={{ color: 'var(--muted)', fontSize: 11 }}>{v.topAwardDesc}</div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.65, color: 'var(--muted)' }}>
                  <div style={{ marginBottom: 8, color: 'var(--text)', fontSize: 12 }}>
                    <strong style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>Agency</strong>
                    <br />
                    {v.topAwardAgency}
                  </div>
                  <p style={{ marginBottom: 10 }}>{v.note}</p>
                  <a
                    href={`https://www.usaspending.gov/search/?object_class=&recipient_search_text=${encodeURIComponent(v.recipients[0])}&award_type_codes=A,B,C,D`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: v.color, textDecoration: 'none', fontSize: 11, fontWeight: 600 }}
                  >
                    View contracts on USASpending.gov <ExternalLink size={10} />
                  </a>
                </div>
              )}

              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 10, opacity: 0.5 }}>
                {isOpen ? 'Click to collapse' : 'Click to expand'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Attribution + caveat */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.12)',
        borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--muted)',
      }}>
        <AlertCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>Federal contracts only. </span>
          State and local surveillance spending is not tracked centrally — the real dollar totals are far higher.
          Data sourced from{' '}
          <a
            href="https://www.usaspending.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            USASpending.gov
          </a>
          {' '}— the official federal spending database, public and free to query.
          {' '}
          <a
            href="https://api.usaspending.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--muted)', textDecoration: 'none' }}
          >
            API docs →
          </a>
        </div>
      </div>
    </div>
  )
}
