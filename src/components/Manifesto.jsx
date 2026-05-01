export default function Manifesto() {
  const pairs = [
    { they: 'Built the cage.', we: 'Document every bar.' },
    { they: 'Scan without consent.', we: 'Expose without apology.' },
    { they: 'Share your data freely.', we: 'Fund the litigation to stop it.' },
    { they: 'Pressure donors to back down.', we: 'Hold no keys. There\'s no one to pressure.' },
  ]

  return (
    <section style={{
      borderTop: '1px solid var(--border)',
      padding: '80px 64px',
      maxWidth: 1440,
      margin: '0 auto',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start' }}>

        {/* Left column — 40% */}
        <div style={{ flex: '0 0 40%' }}>
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
            "Institutions document individuals constantly, at scale, with impunity. We exist to correct that asymmetry."
          </blockquote>

          <div style={{ fontSize: 13, color: 'var(--gray)' }}>
            — Fourthright Mission Statement
          </div>
        </div>

        {/* Right column — 60% */}
        <div style={{ flex: '0 0 60%' }}>
          <div style={{
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
    </section>
  )
}
