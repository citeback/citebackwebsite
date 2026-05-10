export default function Manifesto({ setTab }) {
  const pairs = [
    { they: 'Built the cage.', we: 'Document every bar.' },
    { they: 'Scan without consent.', we: 'Expose without apology.' },
    { they: 'Sell your data to anyone who pays.', we: 'Fund the litigation to stop it.' },
    { they: 'Pressure contributors to back down.', we: 'Built so contributions are verified by view key — public, transparent, no platform custody.' },
  ]

  return (
    <section className="manifesto-section">
      <div className="manifesto-outer">

        {/* Left column — 40% */}
        <div className="manifesto-left">
          <div className="mf-eyebrow">WHY WE EXIST</div>

          <blockquote className="mf-blockquote">
            "Institutions document individuals constantly, at scale, with impunity. We exist to reverse that."
          </blockquote>

          <div className="mf-citation">
            — Citeback Mission Statement
          </div>
        </div>

        {/* Right column — 60% */}
        <div className="manifesto-right">
          <div className="manifesto-grid">
            {pairs.map((pair, i) => (
              <div key={i} className="mf-pair">
                <div className="mf-pair-label">They:</div>
                <div className="mf-pair-they">{pair.they}</div>
                <div className="mf-pair-label">We:</div>
                <div className="mf-pair-we">{pair.we}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {setTab && (
        <div className="mf-cta-row">
          <button onClick={() => setTab('campaigns')} className="mf-btn-primary">
            Fund a Campaign →
          </button>
          <button onClick={() => setTab('operators')} className="mf-btn-secondary">
            Run a Campaign →
          </button>
        </div>
      )}
    </section>
  )
}
