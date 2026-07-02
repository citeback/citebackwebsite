const tracks = [
  {
    id: 'legal',
    label: 'Legal',
    tag: 'Legal Researchers · Paralegals · Researchers',
    description:
      'Support the people running campaigns — you review and advise, they execute. Assess proposed actions for legal viability, draft demand letters, advise on FOIA strategy, or connect campaign organizers with counsel. Engagement is fully on your terms.',
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
      'No name, no account — your XMR or ZANO address is your identity. Funded campaigns hire technical contributors to build the tools that make actions possible. Your work product speaks for itself.',
    details: [
      'Build FOIA scraping, OCR, and document automation tools for campaigns',
      'Camera database enrichment and surveillance mapping',
      'Technical infrastructure for funded campaign organizers',
      'Privacy tooling — paid in XMR or ZANO directly to your wallet',
    ],
    cta: 'Contribute Pseudonymously',
    accent: 'var(--muted)',
  },
  {
    id: 'operator',
    label: 'Run a Campaign',
    tag: 'Verified Attorneys · Nonprofits · Licensed Professionals',
    description:
      'Run a campaign on behalf of your community. Attorneys, nonprofits, licensed professionals, and university or government employees verify a credential and can propose campaigns immediately — your real name stays private; only your verified badge is public.',
    details: [
      'Verify instantly with a bar number, EIN, NPI, or .edu/.gov email',
      'Propose campaigns with a specific target and milestones',
      'Receive funds directly to your own wallet — Citeback never holds them',
      'Keep contributors informed via transparent public updates',
    ],
    cta: 'Get Verified → Run a Campaign',
    accent: 'var(--muted)',
  },
]

export default function BuildWithUs({ setTab }) {
  return (
    <section className="bwu-section">
      <div className="bwu-inner">

        {/* Header */}
        <div className="bwu-header">
          <div className="bwu-eyebrow">Get Involved</div>
          <h2 className="bwu-headline">
            Build the infrastructure<br />of accountability.
          </h2>
          <p className="bwu-subtext">
            Three ways to contribute. All of them matter. None of them require exposing who you are.
          </p>
        </div>

        {/* Track cards */}
        <div className="bwu-grid">
          {tracks.map((track) => (
            <div key={track.id} className={`bwu-card bwu-card--${track.id}`}>
              {/* Track header */}
              <div>
                <div className="bwu-track-tag">
                  {track.tag}
                </div>
                <div className="bwu-track-label">{track.label}</div>
              </div>

              {/* Description */}
              <p className="bwu-desc">{track.description}</p>

              {/* Detail list */}
              <ul className="bwu-detail-list">
                {track.details.map((d, i) => (
                  <li key={i} className="bwu-detail-item">
                    <span className="bwu-detail-dash">—</span>
                    {d}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {track.id === 'legal' ? (
                <div className="bwu-cta-wrapper">
                  <button
                    onClick={() => setTab && setTab('registry', '?role=researcher')}
                    className="bwu-btn-primary"
                  >Join as Legal Researcher</button>
                  <button
                    onClick={() => setTab && setTab('registry', '?role=attorney')}
                    className="bwu-btn-secondary"
                  >I&apos;m a Licensed Attorney</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!setTab) return
                    if (track.id === 'operator') setTab('operators')
                    else if (track.id === 'technical') setTab('registry')
                  }}
                  className="bwu-btn-secondary bwu-btn-secondary-mt"
                >
                  {track.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="bwu-footer-note">
          All participation is voluntary and pseudonymity is always an option. Platform communication routes through encrypted channels only.
        </div>
      </div>
    </section>
  )
}
