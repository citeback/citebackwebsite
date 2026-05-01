export default function Footer({ setTab }) {
  const navLinks = [
    { label: 'Campaigns', tab: 'campaigns' },
    { label: 'How It Works', tab: 'home' },
    { label: 'Governance', tab: 'governance' },
    { label: 'Run a Campaign', tab: 'operators' },
  ]

  return (
    <footer style={{
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
        gap: 40,
      }}>
        {navLinks.map(({ label, tab }) => (
          <span
            key={label}
            onClick={() => setTab && setTab(tab)}
            style={{
              fontSize: 13,
              color: 'var(--gray)',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--fg)'}
            onMouseLeave={e => e.target.style.color = 'var(--gray)'}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 24,
        gap: 16,
      }}>
        <div style={{ fontSize: 13, color: 'var(--gray)' }}>
          Pre-launch — no funds accepted until all prerequisites are met.
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray)' }}>
          v0.7 Governance —{' '}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--gray)', textDecoration: 'underline' }}
          >
            Active
          </a>
        </div>
      </div>

    </footer>
  )
}
