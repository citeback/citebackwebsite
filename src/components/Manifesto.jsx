export default function Manifesto({ setTab }) {
  const pairs = [
    { they: 'Built the cage.', we: 'Document every bar.' },
    { they: 'Scan without consent.', we: 'Expose without apology.' },
    { they: 'Sell your data to anyone who pays.', we: 'Fund the litigation to stop it.' },
    { they: 'Pressure contributors to back down.', we: 'Built so contributions are verified by view key — public, transparent, no platform custody.' },
  ]

  return (
    <section className="manifesto-section" style={{
      borderTop: '1px solid var(--border)',
      padding: '80px 64px',
      maxWidth: 1440,
      margin: '0 auto',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      <div className="manifesto-outer" style={{ display: 'flex', gap: 64, alignItems: 'flex-start' }}>

        {/* Left column — 40% */}
        <div className="manifesto-left" style={{ flex: '0 0 40%' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--red)',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            marginBottom: 48,
          }}>
            WHY WE EXIST
          </div>

          <blockquote style={{
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            lineHeight: 1.5,
            color: 'var(--fg)',
            margin: '0 0 16px 0',
          }}>
            "Institutions document individuals constantly, at scale, with impunity. We exist to reverse that."
          </blockquote>

          <div style={{ fontSize: 13, color: 'var(--gray)' }}>
            — Citeback Mission Statement
          </div>
        </div>

        {/* Right column — 60% */}
        <div className="manifesto-right" style={{ flex: '0 0 60%' }}>
          <div className="manifesto-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
          }}>
            {pairs.map((pair, i) => (
              <div key={i} style={{
                borderTop: '1px solid var(--border)',
                padding: '28px 24px 28px 0',
                paddingRight: i % 2 === 0 ? 24 : 0,
                paddingLeft: i % 2 === 0 ? 0 : 24,
              }}>
                <div style={{ fontSize: 12, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  They:
                </div>
                <div style={{ fontSize: 16, color: 'var(--fg)', fontWeight: 300, marginBottom: 16, lineHeight: 1.5 }}>
                  {pair.they}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  We:
                </div>
                <div style={{ fontSize: 16, color: 'var(--fg)', fontWeight: 500, lineHeight: 1.5 }}>
                  {pair.we}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {setTab && (
        <div style={{
          marginTop: 56,
          paddingTop: 32,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setTab('campaigns')}
            style={{
              background: 'var(--fg)', color: 'var(--bg)', border: 'none',
              padding: '13px 28px', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'var(--font)',
              transition: 'opacity 0.15s', minHeight: 44,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Fund a Campaign →
          </button>
          <button
            onClick={() => setTab('operators')}
            style={{
              background: 'transparent', color: 'var(--fg)',
              border: '1px solid var(--border)', padding: '13px 28px',
              fontSize: 13, fontWeight: 500, letterSpacing: '0.05em',
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'var(--font)', transition: 'border-color 0.15s',
              minHeight: 44,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            Run a Campaign →
          </button>
        </div>
      )}
    </section>
  )
}
