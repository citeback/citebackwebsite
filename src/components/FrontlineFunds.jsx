const funds = [
  {
    id: 1,
    org: 'Electronic Frontier Foundation + ACLU of Northern California',
    title: 'SIREN & CAIR-CA v. City of San Jose',
    what: 'San Jose PD\'s 500 Flock cameras ran 3,965,519 plate searches in a single year — none required a warrant. EFF and ACLU-NorCal filed suit in November 2025 on behalf of immigrant and Muslim civil rights orgs. Active litigation in Santa Clara County Superior Court.',
    why: 'The tightest Flock Safety lawsuit in the country right now. Direct 4th Amendment challenge to warrantless mass ALPR surveillance.',
    donateUrl: 'https://www.eff.org/cases/siren-v-san-jose',
    donateLabel: 'Support EFF',
    status: 'Active — filed Nov 2025',
    tag: 'Lawsuit',
  },
  {
    id: 2,
    org: 'Institute for Justice + ACLU + EFF',
    title: 'Schmidt v. Norfolk (4th Circuit Court of Appeals)',
    what: 'A Virginia trial court ruled in May 2024 that Norfolk\'s 172-camera Flock network is a "dragnet over the entire city" legally equivalent to GPS tracking — and requires a warrant. The prosecution appealed. ACLU and EFF filed amicus briefs in April 2026. A 4th Circuit win sets binding precedent for five states.',
    why: 'Most consequential Flock case in the country. Federal appellate ruling could force warrant requirements on every Flock deployment in VA, MD, NC, SC, and WV.',
    donateUrl: 'https://ij.org/case/schmidt-v-norfolk/',
    donateLabel: 'Support Institute for Justice',
    status: 'Active — before 4th Circuit, amicus filed Apr 2026',
    tag: 'Appellate Case',
  },
  {
    id: 3,
    org: 'Fight for the Future + 38 coalition partners',
    title: 'Flock Out National Campaign',
    what: '60+ cities have already terminated or paused Flock Safety contracts — including Denver, Austin, and Eugene — after sustained pressure campaigns. The campaign is now targeting Lowe\'s, one of Flock\'s largest corporate clients. Major protest at Flock HQ Atlanta, April 2026.',
    why: 'The most active grassroots fight against ALPR expansion in the US. Each city that terminates a Flock contract severs another node from the federal surveillance network.',
    donateUrl: 'https://www.fightforthefuture.org/actions/flockout/',
    donateLabel: 'Support Fight for the Future',
    status: 'Very active — ongoing, national',
    tag: 'Advocacy Campaign',
  },
]

const tagColors = {
  'Lawsuit': { bg: 'rgba(52,152,219,0.1)', border: 'rgba(52,152,219,0.3)', text: '#5dade2' },
  'Appellate Case': { bg: 'rgba(155,89,182,0.1)', border: 'rgba(155,89,182,0.3)', text: '#bb8fce' },
  'Advocacy Campaign': { bg: 'rgba(46,204,113,0.1)', border: 'rgba(46,204,113,0.3)', text: '#2ecc71' },
}

export default function FrontlineFunds() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 120px' }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: 12 }}>
          Frontline Funds
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.2 }}>
          These fights are happening now.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.7, maxWidth: 560 }}>
          These are established organizations running active legal battles against Flock Safety and mass ALPR surveillance.
          They have their own donation infrastructure — your money goes directly to them, no middleman.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {funds.map(f => {
          const tc = tagColors[f.tag] || tagColors['Lawsuit']
          return (
            <div
              key={f.id}
              style={{
                border: '1px solid var(--border)',
                padding: '28px 28px 24px',
                background: 'var(--card)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
                      padding: '3px 8px',
                      background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
                    }}>
                      {f.tag}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--gray)', letterSpacing: '0.03em' }}>{f.status}</span>
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 4 }}>
                    {f.title}
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--gray)', letterSpacing: '0.02em' }}>{f.org}</p>
                </div>
              </div>

              {/* What */}
              <p style={{ fontSize: 14, color: 'var(--fg)', lineHeight: 1.7, marginBottom: 12 }}>
                {f.what}
              </p>

              {/* Why it matters */}
              <p style={{
                fontSize: 13, color: 'var(--gray)', lineHeight: 1.6,
                borderLeft: '2px solid var(--border)', paddingLeft: 12, marginBottom: 20,
              }}>
                {f.why}
              </p>

              {/* CTA */}
              <a
                href={f.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: 'var(--fg)',
                  color: 'var(--bg)',
                  padding: '10px 22px',
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: 'var(--font)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--fg)' }}
              >
                {f.donateLabel} ↗
              </a>
            </div>
          )
        })}
      </div>

      <p style={{ marginTop: 48, fontSize: 12, color: 'var(--gray)', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        Citeback does not collect or handle funds for these organizations. All donation links go directly to the org's own pages.
        If you want to fund a local ALPR fight — FOIA requests, billboards, legal advocacy — those are on the <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'campaigns' }))}
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--fg)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', fontFamily: 'var(--font)' }}
        >Campaigns</button> page.
      </p>
    </div>
  )
}
