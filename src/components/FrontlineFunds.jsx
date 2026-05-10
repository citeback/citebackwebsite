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
    what: 'Norfolk PD deployed 172 Flock Safety cameras across the city, tracking drivers\' movements without a warrant. A federal district court ruled the network did not violate Fourth Amendment warrant requirements. Plaintiffs appealed to the 4th Circuit. In April 2026, the ACLU, ACLU of Virginia, and EFF filed amicus briefs arguing the network indiscriminately collects sensitive location data and violates Fourth Amendment privacy expectations — the district court ruling should be reversed.',
    why: 'Most consequential Flock case in the country. Federal appellate ruling could force warrant requirements on every Flock deployment in VA, MD, NC, SC, and WV.',
    donateUrl: 'https://www.aclu.org/cases/schmidt-v-norfolk',
    donateLabel: 'Support ACLU',
    status: 'Active — before 4th Circuit, amicus filed Apr 2026',
    tag: 'Appellate Case',
  },
  {
    id: 3,
    org: 'MacArthur Justice Center + Loevy & Loevy',
    title: 'Williams v. City of Chicago — ShotSpotter Class Action',
    what: 'Chicago PD used ShotSpotter/SoundThinking acoustic gunfire detection to justify stops, searches, and prosecutions without adequate evidence. Michael Williams, Daniel Ortiz, and class members are suing. SoundThinking tried to quash a subpoena for its own algorithm in 2023. Still in active discovery.',
    why: 'The most significant ShotSpotter legal challenge in the country. If it succeeds, it forces disclosure of the algorithm and establishes that acoustic surveillance alone can\'t justify a stop or prosecution.',
    donateUrl: 'https://secure.everyaction.com/WIw5_qbl9USz1BZMdtqujQ2',
    donateLabel: 'Support MacArthur Justice Center',
    status: 'Active — class action, ongoing discovery',
    tag: 'Class Action',
  },
  {
    id: 4,
    org: 'ACLU of Michigan',
    title: 'Woodruff v. City of Detroit — Facial Recognition Wrongful Arrest',
    what: 'Detroit\'s Real Time Crime Center used Clearview AI facial recognition to identify and arrest Porcha Woodruff — a Black woman 8 months pregnant — for a carjacking she didn\'t commit. She was held 11 hours. ACLU Michigan entered as co-counsel in 2025. Cross-motions for summary judgment filed, case active.',
    why: 'The most high-profile facial recognition wrongful arrest case in active litigation. A win establishes civil liability for FR-based arrests and forces policy changes at police departments using Clearview.',
    donateUrl: 'https://www.aclumich.org/donate/',
    donateLabel: 'Support ACLU Michigan',
    status: 'Active — summary judgment motions pending',
    tag: 'Lawsuit',
  },
  {
    id: 5,
    org: 'Surveillance Technology Oversight Project (S.T.O.P.)',
    title: 'S.T.O.P. — NYC Surveillance Resistance Litigation',
    what: 'NYC-based legal org focused entirely on surveillance technology — ALPR, facial recognition, NYPD domain awareness systems, and mass surveillance hardware. Runs active impact litigation through a virtual law firm model partnering with major NYC firms. Singular focus: surveillance, nothing else.',
    why: 'The closest org in the country to citeback\'s exact mission. If you want to fund ongoing surveillance resistance work in the most surveilled city in the US, this is the direct line.',
    donateUrl: 'https://secure.qgiv.com/for/stops',
    donateLabel: 'Support S.T.O.P.',
    status: 'Active — ongoing litigation and advocacy',
    tag: 'Advocacy Campaign',
  },
  {
    id: 6,
    org: 'Just Futures Law',
    title: 'Clearview AI Settlement Challenge — #ClearviewCopOut',
    what: 'Clearview AI scraped billions of faces from social media and sold access to ICE and law enforcement without consent. The proposed class action settlement would let Clearview continue key practices. Just Futures Law ran the #ClearviewCopOut campaign to challenge the weak settlement and continues monitoring and advocacy on behalf of immigrant communities.',
    why: 'Clearview\'s database is one of the primary tools used for facial recognition wrongful arrests. Challenging the settlement keeps pressure on the company and preserves the ability to pursue stronger remedies.',
    donateUrl: 'https://www.justfutureslaw.org/donate',
    donateLabel: 'Support Just Futures Law',
    status: 'Active — settlement monitoring and advocacy',
    tag: 'Advocacy Campaign',
  },
  {
    id: 7,
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
  'Class Action': { bg: 'rgba(230,126,34,0.1)', border: 'rgba(230,126,34,0.3)', text: '#e67e22' },
  'Lawsuit': { bg: 'rgba(52,152,219,0.1)', border: 'rgba(52,152,219,0.3)', text: '#5dade2' },
  'Appellate Case': { bg: 'rgba(155,89,182,0.1)', border: 'rgba(155,89,182,0.3)', text: '#bb8fce' },
  'Advocacy Campaign': { bg: 'rgba(46,204,113,0.1)', border: 'rgba(46,204,113,0.3)', text: '#2ecc71' },
}

export default function FrontlineFunds() {
  return (
    <div className="ff-page">
      <div className="ff-header">
        <p className="ff-eyebrow">Frontline Funds</p>
        <h1 className="ff-title">These fights are happening now.</h1>
        <p className="ff-subtitle">
          These are established organizations running active legal battles against Flock Safety and mass ALPR surveillance.
          They have their own contribution/donation infrastructure — your money goes directly to them, no middleman.
        </p>
      </div>

      <div className="ff-list">
        {funds.map(f => {
          const tc = tagColors[f.tag] || tagColors['Lawsuit']
          return (
            <div key={f.id} className="ff-card">
              {/* Header */}
              <div className="ff-card-header">
                <div className="ff-card-header-left">
                  <div className="ff-tag-row">
                    <span
                      className="ff-tag"
                      style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text }}
                    >
                      {f.tag}
                    </span>
                    <span className="ff-status">{f.status}</span>
                  </div>
                  <h2 className="ff-card-title">{f.title}</h2>
                  <p className="ff-card-org">{f.org}</p>
                </div>
              </div>

              {/* What */}
              <p className="ff-card-what">{f.what}</p>

              {/* Why it matters */}
              <p className="ff-card-why">{f.why}</p>

              {/* CTA */}
              <a
                href={f.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ff-donate-link"
              >
                {f.donateLabel} ↗
              </a>
            </div>
          )
        })}
      </div>

      <p className="ff-footer-note">
        Citeback does not collect or handle funds for these organizations. All contribution/support links go directly to the org's own pages.
        If you want to fund a local ALPR fight — FOIA requests, billboards, legal advocacy — those are on the{' '}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'campaigns' }))}
          className="ff-nav-btn"
        >Campaigns</button>{' '}page.
      </p>
    </div>
  )
}
