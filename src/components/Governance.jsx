import { Helmet } from 'react-helmet-async'
import { Shield, Lock, Users, Scale, GitBranch, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react'

function Section({ id, title, icon: Icon, children }) {
  return (
    <div id={id} className="gov-section">
      <div className="gov-section-btn" style={{ cursor: 'default' }}>
        <Icon size={18} className="gov-section-icon" />
        <span className="gov-section-title">{title}</span>
      </div>
      <div className="gov-section-body">
        {children}
      </div>
    </div>
  )
}

export default function Governance({ setTab }) {
  return (
    <>
    <Helmet>
      <title>Platform Rules | Citeback — How This Platform Operates</title>
      <meta name="description" content="How Citeback operates: who runs it, what the operator can and cannot do, how rules change, and the fork right. Plain English, no fine print." />
      <meta property="og:title" content="Platform Rules | Citeback — How This Platform Operates" />
      <meta property="og:description" content="How Citeback operates: who runs it, what the operator can and cannot do, how rules change, and the fork right. Plain English, no fine print." />
    </Helmet>
    <div className="gov-page">

      {/* Header */}
      <div className="gov-header">
        <div className="gov-header-row">
          <Shield size={28} className="gov-icon-accent" />
          <h1 className="gov-header-title">Platform Rules</h1>
        </div>
        <p className="gov-header-desc">
          How this platform operates — transparently. This page takes about a minute to read.
        </p>
      </div>

      <Section id="who-runs-this" title="Who Runs This" icon={Users}>
        <p>
          Scott Hughes operates the Citeback platform. Campaign proposals are reviewed, credentials are verified, and milestone claims are assessed by the platform operator. Every platform decision is publicly logged.
        </p>
      </Section>

      <Section id="operator-powers" title="What the Operator Can and Cannot Do" icon={Scale}>
        <div className="gov-op-cards">
          <div className="gov-op-card gov-op-card--green">
            <strong className="gov-green"><CheckCircle size={13} /> The operator CAN</strong>
            <p className="gov-op-card-desc">Review and approve or reject campaign proposals. Verify professional credentials. Enforce the published rules. Ban bad actors.</p>
          </div>
          <div className="gov-op-card gov-op-card--red">
            <strong className="gov-red"><AlertTriangle size={13} /> The operator CANNOT</strong>
            <p className="gov-op-card-desc">Access campaign wallet private keys — this is enforced by the architecture, not by policy. Move or touch campaign funds — contributions go directly from contributors to the campaign organizer&apos;s own wallet (the direct wallet model). Citeback is never in the chain.</p>
          </div>
        </div>
      </Section>

      <Section id="the-rules" title="The Rules" icon={Lock}>
        <p>
          The rules are published on GitHub and versioned. Any change is announced publicly at least <strong className="gov-fg">7 days</strong> before taking effect.
        </p>
        <p className="gov-mt-12">
          <a
            href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="gov-gh-link"
          >
            <ExternalLink size={14} /> View the rules on GitHub
          </a>
        </p>
      </Section>

      <Section id="fork-right" title="The Fork Right" icon={GitBranch}>
        <p>
          The entire platform — code, rules, and data structures — is open source. If this platform disappears or changes in ways the community rejects, anyone can fork it and run their own instance. No permission needed.
        </p>
        <p className="gov-mt-12">
          <a
            href="https://github.com/citeback/citebackwebsite"
            target="_blank"
            rel="noopener noreferrer"
            className="gov-gh-link"
          >
            <ExternalLink size={14} /> Fork on GitHub
          </a>
        </p>
      </Section>

      <Section id="phase-2" title="Phase 2 — Community Governance" icon={Users}>
        <p>
          As the platform grows, campaign runners will gain input into rule changes through a transparent process. That system will be announced publicly before it activates.
        </p>
      </Section>

      {/* CTA */}
      {setTab && (
        <div className="gov-cta">
          <div>
            <p className="gov-cta-title">
              Simple rules. Funded anonymously.
            </p>
            <p className="gov-cta-desc">
              Browse the campaigns these rules protect.
            </p>
          </div>
          <div className="gov-cta-btns">
            <button onClick={() => setTab('campaigns')} className="gov-cta-primary">
              Browse Campaigns →
            </button>
            <button onClick={() => setTab('operators')} className="gov-cta-secondary">
              Run a Campaign →
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
