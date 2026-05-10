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
    <footer className="site-footer">
      {/* Top row */}
      <div className="footer-top-row">
        <div className="footer-wordmark">
          <span className="wordmark-cite">CITE</span>
          <span className="wordmark-back">BACK</span>
        </div>
        <div className="footer-tagline">
          Surveillance resistance, funded anonymously.
        </div>
      </div>

      {/* Middle row — nav links */}
      <nav className="footer-nav-row" aria-label="Footer navigation">
        {navLinks.map(({ label, tab }) => (
          <button
            key={label}
            onClick={() => setTab && setTab(tab)}
            className="footer-nav-btn"
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom row */}
      <div className="footer-bottom-row">
        <div className="footer-bottom-text">
          Pre-launch — no wallet addresses published until all prerequisites are met.
        </div>
        <div className="footer-bottom-text">
          Governance —{' '}
          <a
            href="https://github.com/citeback/citebackwebsite"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="footer-legal">
        Contributions to Citeback campaigns are <strong>not tax-deductible</strong>. Citeback is a Wyoming DAO LLC (in formation), not a 501(c)(3) charitable organization.
        All contributions are final and non-refundable. Content on this site is for educational purposes only and does not constitute legal advice.{' '}
        Questions, press inquiries, or operator applications: <a href="mailto:citeback@proton.me" className="footer-link">citeback@proton.me</a>
      </div>

      {/* Tip section */}
      <div className="footer-tip">
        <span className="footer-tip-bold">Support the platform.</span>{' '}
        Citeback is funded by voluntary tips — not by taking a cut of campaigns.{' '}
        Tips go directly to the Wyoming DAO LLC to cover infrastructure costs.{' '}
        <span className="footer-tip-italic">Not accepting tips until Wyoming DAO LLC is formed.</span>
      </div>

      {/* Copyright */}
      <div className="footer-copyright">
        &copy; 2026 Citeback (Wyoming DAO LLC, in formation). Code: MIT license.{' '}
        <a href="https://github.com/citeback/citebackwebsite" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
      </div>

      {/* Data attribution */}
      <div className="footer-data">
        Data sourced from{' '}
        <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="footer-link">OpenStreetMap contributors</a>,{' '}
        <a href="https://atlasofsurveillance.org" target="_blank" rel="noopener noreferrer" className="footer-link">EFF Atlas of Surveillance</a>,{' '}
        <a href="https://www.courtlistener.com" target="_blank" rel="noopener noreferrer" className="footer-link">CourtListener</a>,{' '}
        <a href="https://www.usaspending.gov" target="_blank" rel="noopener noreferrer" className="footer-link">USASpending.gov</a>,{' '}
        <a href="https://openstates.org" target="_blank" rel="noopener noreferrer" className="footer-link">OpenStates</a>,{' '}
        <a href="https://api.congress.gov" target="_blank" rel="noopener noreferrer" className="footer-link">Congress.gov</a>, and{' '}
        <a href="https://lda.senate.gov" target="_blank" rel="noopener noreferrer" className="footer-link">Senate LDA</a>.{' '}
        Campaign sources individually cited.
      </div>
    </footer>
  )
}
