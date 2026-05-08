export default function Footer({ setTab }) {
  const navLinks = [
    { label: 'Campaigns', tab: 'campaigns' },
    { label: 'How It Works', tab: 'trust' },
    { label: 'Governance', tab: 'governance' },
    { label: 'Run a Campaign', tab: 'operators' },
    { label: 'Report a Sighting', tab: 'report' },
    { label: 'Privacy Policy', tab: 'privacy' },
    { label: 'Terms of Use', tab: 'terms' },
  ]

  return (
    <footer className="site-footer" style={{
      marginTop: 'auto',
      borderTop: '2px solid var(--fg)',
      padding: '48px 64px',
      background: 'var(--bg)',
    }}>

      {/* Top row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        {/* Wordmark */}
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
          <span style={{ color: 'var(--fg)' }}>CITE</span>
          <span style={{ color: 'var(--red)' }}>BACK</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 13, color: 'var(--gray)' }}>
          Surveillance resistance, funded anonymously.
        </div>
      </div>

      {/* Middle row — nav links */}
      <div style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 0',
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        {navLinks.map(({ label, tab }) => (
          <button
            key={label}
            onClick={() => setTab && setTab(tab)}
            style={{
              fontSize: 13,
              color: 'var(--gray)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 24,
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 13, color: 'var(--gray)' }}>
          Pre-launch — no wallet addresses published until all prerequisites are met.
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray)' }}>
          Governance —{' '}
          <a
            href="https://github.com/citeback/citebackwebsite"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--gray)', textDecoration: 'underline' }}
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: 16,
        marginTop: 16,
        fontSize: 11,
        color: 'var(--gray)',
        opacity: 0.7,
        lineHeight: 1.7,
        marginBottom: 12,
      }}>
        Contributions to Citeback campaigns are <strong>not tax-deductible</strong>. Citeback is a Wyoming DAO LLC (in formation), not a 501(c)(3) charitable organization.
        All contributions are final and non-refundable. Content on this site is for educational purposes only and does not constitute legal advice.{' '}
        Questions, press inquiries, or operator applications: <a href="mailto:citeback@proton.me" style={{ color: 'inherit', textDecoration: 'underline' }}>citeback@proton.me</a>
      </div>

      {/* Tip section */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: 14,
        marginTop: 14,
        fontSize: 11,
        color: 'var(--gray)',
        opacity: 0.65,
        lineHeight: 1.7,
      }}>
        <span style={{ fontWeight: 600, opacity: 0.9 }}>Support the platform.</span>{' '}
        Citeback is funded by voluntary tips — not by taking a cut of campaigns.{' '}
        Tips go directly to the Wyoming DAO LLC to cover infrastructure costs.{' '}
        <span style={{ fontStyle: 'italic' }}>Not accepting tips until Wyoming DAO LLC is formed.</span>
      </div>

      {/* Copyright */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: 14,
        marginTop: 14,
        fontSize: 11,
        color: 'var(--gray)',
        opacity: 0.6,
      }}>
        © 2026 Citeback (Wyoming DAO LLC, in formation). Code: MIT license.{' '}
        <a href="https://github.com/citeback/citebackwebsite" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>GitHub</a>
      </div>

      {/* Data attribution */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: 14,
        marginTop: 14,
        fontSize: 11,
        color: 'var(--gray)',
        opacity: 0.6,
        lineHeight: 1.6,
      }}>
        Data sourced from{' '}
        <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>OpenStreetMap contributors</a>,{' '}
        <a href="https://atlasofsurveillance.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>EFF Atlas of Surveillance</a>,{' '}
        <a href="https://www.courtlistener.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>CourtListener</a>,{' '}
        <a href="https://www.usaspending.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>USASpending.gov</a>,{' '}
        <a href="https://openstates.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>OpenStates</a>,{' '}
        <a href="https://api.congress.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Congress.gov</a>, and{' '}
        <a href="https://lda.senate.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Senate LDA</a>.{' '}
        Campaign sources individually cited.
      </div>

      <style>{`
        @media (max-width: 768px) {
          .site-footer {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </footer>
  )
}
