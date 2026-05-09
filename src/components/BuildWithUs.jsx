const tracks = [
  {
    id: 'legal',
    label: 'Legal',
    tag: 'Legal Researchers · Paralegals · Researchers',
    description:
      'Help campaigns move from funded to filed. Review proposed actions for legal viability, draft demand letters, advise on FOIA strategy, or connect operators with counsel. Engagement is fully on your terms.',
    details: [
      'Review campaign proposals before they go live',
      'Provide jurisdiction-specific viability assessments',
      'Draft or review FOIA requests and ordinance language',
      'Refer or directly represent funded campaigns',
    ],
    cta: 'Express Legal Interest',
    accent: 'var(--red)',
  },
  {
    id: 'technical',
    label: 'Technical',
    tag: 'Pseudonymous · XMR / ZANO Identity',
    description:
      'No name, no account — your XMR or ZANO address is your identity. Contribute to platform infrastructure, surveillance mapping, FOIA parsing tools, or privacy tooling. PRs speak for themselves.',
    details: [
      'Open-source contributions welcome (GitHub, self-hosted)',
      'Camera database enrichment and mapping',
      'Crypto payment rail & escrow development',
      'FOIA scraping, OCR, and document pipelines',
    ],
    cta: 'Contribute Pseudonymously',
    accent: 'var(--muted)',
  },
  {
    id: 'operator',
    label: 'Operator',
    tag: 'Organizers · Advocates · Community Leads',
    description:
      'Run a campaign on behalf of your community. Operators propose actions, manage public documentation, and coordinate with funded parties — all without exposing contributor identities.',
    details: [
      'Propose campaigns for community review',
      'Manage public-facing documentation',
      'Coordinate funded actions with legal partners',
      'Keep contributors informed via on-chain transparent updates',
    ],
    cta: 'Become an Operator',
    accent: 'var(--muted)',
  },
]

export default function BuildWithUs({ setTab }) {
  return (
    <section style={{
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      padding: '80px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--red)',
            fontWeight: 600,
            marginBottom: 12,
          }}>
            Get Involved
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            color: 'var(--fg)',
            marginBottom: 16,
          }}>
            Build the infrastructure<br />of accountability.
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--gray)',
            lineHeight: 1.7,
            maxWidth: 560,
          }}>
            Three ways to contribute. All of them matter. None of them require exposing who you are.
          </p>
        </div>

        {/* Track cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
        }} className="bwu-grid">
          {tracks.map((track) => (
            <div key={track.id} className="bwu-card" style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              transition: 'border-color 0.15s',
            }}>
              {/* Track header */}
              <div>
                <div style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: track.accent,
                  fontWeight: 600,
                  marginBottom: 8,
                }}>
                  {track.tag}
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg)',
                }}>
                  {track.label}
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: 13,
                color: 'var(--gray)',
                lineHeight: 1.7,
                margin: 0,
              }}>
                {track.description}
              </p>

              {/* Detail list */}
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexGrow: 1,
              }}>
                {track.details.map((d, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 12,
                    color: 'var(--gray)',
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: track.accent, flexShrink: 0, marginTop: 2 }}>—</span>
                    {d}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {track.id === 'legal' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => setTab && setTab('registry', '?role=researcher')}
                    style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '11px 20px', fontSize: 11, letterSpacing: '0.07em', fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'opacity 0.15s', minHeight: 44 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >Join as Legal Researcher</button>
                  <button
                    onClick={() => setTab && setTab('registry', '?role=attorney')}
                    style={{ background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border)', padding: '11px 20px', fontSize: 11, letterSpacing: '0.07em', fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'border-color 0.15s', minHeight: 44 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >I&apos;m a Licensed Attorney</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!setTab) return
                    if (track.id === 'operator') setTab('operators')
                    else if (track.id === 'technical') setTab('registry')
                  }}
                  style={{
                    marginTop: 8,
                    background: 'transparent',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    padding: '11px 20px',
                    fontSize: 11,
                    letterSpacing: '0.07em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    transition: 'opacity 0.15s, border-color 0.15s',
                    textAlign: 'center',
                    minHeight: 44,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {track.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--gray)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          All participation is voluntary and pseudonymity is always an option. Platform communication routes through encrypted channels only.
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bwu-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .bwu-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        .bwu-card:hover {
          border-color: var(--fg) !important;
        }
      `}</style>
    </section>
  )
}
