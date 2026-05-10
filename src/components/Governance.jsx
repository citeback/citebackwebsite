import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Shield, Lock, Users, Scale, AlertTriangle, ExternalLink, ChevronDown, ChevronRight, CheckCircle, Circle } from 'lucide-react'

const sections = [
  { id: 'philosophy', label: 'Philosophy', icon: Shield },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'campaigns', label: 'Campaign Types', icon: Scale },
  { id: 'voting', label: 'Voting Mechanics', icon: CheckCircle },
  { id: 'disbursement', label: 'Disbursement', icon: Lock },
  { id: 'human-operator', label: 'Human Operator Layer', icon: Users },
  { id: 'wallet-architecture', label: 'Wallet Architecture (Direct)', icon: Lock },
  { id: 'bootstrapping', label: 'Bootstrapping', icon: Users },
  { id: 'immutables', label: 'Immutables', icon: AlertTriangle },
  { id: 'prerequisites', label: 'Launch Prerequisites', icon: CheckCircle },
]

function Section({ id, title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div id={id} className="gov-section">
      <button onClick={() => setOpen(o => !o)} className="gov-section-btn">
        <Icon size={18} className="gov-section-icon" />
        <span className="gov-section-title">{title}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div className="gov-section-body">
          {children}
        </div>
      )}
    </div>
  )
}

function Tag({ children, color = '#6ee7b7' }) {
  return (
    <span
      className="gov-tag"
      style={{
        background: color + '22',
        color: color,
        border: `1px solid ${color}44`
      }}
    >
      {children}
    </span>
  )
}

function Table({ headers, rows }) {
  return (
    <div className="gov-table-wrap">
      <table className="gov-table">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} className="gov-th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="gov-tr">
              {row.map((cell, j) => (
                <td key={j} className="gov-td">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Code({ children }) {
  return <code className="gov-code">{children}</code>
}

export default function Governance({ setTab }) {
  return (
    <>
    <Helmet>
      <title>Governance | Citeback — Community-Controlled Platform Rules</title>
      <meta name="description" content="Read Citeback's governance framework: community voting, campaign rules, disbursement controls, and the immutable core of the surveillance resistance platform." />
      <meta property="og:title" content="Governance | Citeback — Community-Controlled Platform Rules" />
      <meta property="og:description" content="Read Citeback's governance framework: community voting, campaign rules, disbursement controls, and the immutable core of the surveillance resistance platform." />
    </Helmet>
    <div className="gov-page">

      {/* Header */}
      <div className="gov-header">
        <div className="gov-header-row">
          <Shield size={28} className="gov-icon-accent" />
          <h1 className="gov-header-title">Governance Specification</h1>
        </div>
        <div className="gov-header-tags">
          <Tag>Active</Tag>
          <Tag color="#a78bfa">Updated 2026-05-04</Tag>
        </div>
        <p className="gov-header-desc">
          This document defines how Citeback is governed - how decisions are made,
          how funds are disbursed, what can never be changed, and what must be in place before
          a single dollar is accepted.
        </p>
        <a
          href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md"
          target="_blank"
          rel="noopener noreferrer"
          className="gov-gh-link"
        >
          <ExternalLink size={14} /> View full document on GitHub
        </a>
      </div>

      {/* TOC */}
      <div className="gov-toc">
        <p className="gov-toc-label">Contents</p>
        <div className="gov-toc-links">
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} className="gov-toc-link">
              → {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <Section id="philosophy" title="Philosophy" icon={Shield} defaultOpen>
        <p>Citeback exists because surveillance is asymmetric. Institutions document individuals constantly, at scale, with impunity. Individuals have almost no reciprocal capacity to challenge them or fund accountability work.</p>
        <p className="gov-mt-12">The platform ensures that financial access, legal pressure, and platform deplatforming <strong className="gov-fg">cannot silence lawful accountability work.</strong> It operates within applicable law and supports First Amendment-protected activity.</p>
        <p className="gov-mt-12"><strong className="gov-accent">Core differentiator:</strong> Established civil liberties organizations must disclose donors and answer to boards. This platform does not. Anonymous coordination enables funding coordination that established organizations are structurally unable to provide - contributors who need privacy, coalitions that can't share mailing lists, causes that require deniability for participants.</p>
        <div className="gov-highlight gov-highlight--red">
          <p className="gov-callout-p">
            <strong className="gov-red">What this platform is not:</strong> A tool for harassment, defamation, or attacks on private individuals. A platform for criminal defense or illegal activity. Designed to evade lawful oversight.
          </p>
        </div>
      </Section>

      <Section id="participants" title="Participants" icon={Users}>
        <div className="gov-participant-list">
          {[
            { label: 'Contributors', color: 'var(--green)', desc: 'Anyone who sends Monero or Zano to a campaign wallet. No registration. No identity collected. Voting weight derives from cumulative contributions.' },
            { label: 'Operators', color: '#a78bfa', desc: 'Create and manage campaigns. Nostr keys preferred for identity (verifiable without exposing personal data). Must pass OFAC screening with real-name data held by DAO legal entity (never published on-chain), maintain reputation score, and submit verified proof of work. Independent contractors - not agents or employees.' },
            { label: 'The Community', color: '#60a5fa', desc: 'Active contributors who participate in governance votes. No membership list, no token. Governance power flows directly from economic participation.' },
            { label: 'Platform Entity (Wyoming DAO LLC)', color: '#f59e0b', desc: 'The human operator - manages site content, reviews campaign proposals, onboards operators, conducts OFAC pre-screening, and communicates with the community. Cannot access wallet keys (architecture-enforced) or override community governance votes. Accountable to the community via misconduct reports, governance proposals, and the fork right (§9.2).' },
          ].map(p => (
            <div key={p.label} className="gov-participant-card" style={{ borderLeft: `3px solid ${p.color}` }}>
              <strong style={{ color: p.color }}>{p.label}</strong>
              <p className="gov-participant-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="campaigns" title="Campaign Types" icon={Scale}>
        <p className="gov-mb-16">Campaign types are <strong className="gov-fg">not a fixed list</strong> - the platform funds any lawful accountability activity. New types are ratified via community vote. Types are organized by demonstrated effectiveness:</p>
        <p className="gov-tier-label">Tier 1 - Primary (Launch Priority)</p>
        <Table
          headers={['Type', 'Why It Works']}
          rows={[
            ['Public Records Litigation', 'Injunctions can halt programs; discovery is irreplaceable'],
            ['Ordinance Campaigns', 'Proven 50+ city playbook; permanent wins; 6-18 month timelines'],
            ['Counter-Database Projects', 'Force multiplier - feeds litigation, journalism, legislation'],
            ['FOIA Campaigns', 'Low cost, high volume, feeds every other campaign type'],
            ['Journalist Partnerships', 'Creates accountability litigation cannot; Intercept/Markup model'],
          ]}
        />
        <p className="gov-tier-label gov-tier-label--purple">Tier 2 - Supporting</p>
        <Table
          headers={['Type', 'Notes']}
          rows={[
            ['Vendor Accountability', 'Target Clearview, Flock Safety, Palantir by name; anonymous funding uniquely valuable'],
            ['Insurance/Liability Pressure', 'Most underexplored tool; makes surveillance tech uninsurable'],
            ['Legal Defense', 'Civil and administrative only - no criminal defense'],
            ['Legislative Advocacy', 'Requires attorney sign-off (LDA/FARA exposure)'],
            ['Procurement Intervention', 'Legal challenges to RFPs and sole-source contracts'],
          ]}
        />
      </Section>

      <Section id="voting" title="Voting Mechanics" icon={CheckCircle}>
        <p>Voting power is proportional to economic participation. A logarithmic curve rewards participation while limiting concentration.</p>
        <p className="gov-sublabel">Weight Formula:</p>
        <Code>weight = max(1, log2(contribution / $5) + 1){'\n\n'}Floor: 1.0 - no contribution produces negative or zero weight{'\n'}$5 contribution  → weight 1.0{'\n'}$10 contribution → weight 2.0{'\n'}Cap: $1,280   → weight 9.0 (maximum)</Code>
        <p className="gov-mt-12"><strong className="gov-accent">72-hour rule:</strong> Contributions must be at least 72 hours old at proposal submission to qualify. No last-minute flooding.</p>
        <p className="gov-mt-12"><strong className="gov-accent">Quorum requirements:</strong></p>
        <Table
          headers={['Change Tier', 'Quorum', 'Vote to Pass', 'Time-lock']}
          rows={[
            ['Minor', '10 voters', 'Simple majority', 'None'],
            ['Major', '25 voters', '60% supermajority', '7 days'],
            ['Governance', '50 voters', '75% supermajority', '14 days'],
          ]}
        />
        <div className="gov-highlight gov-highlight--purple">
          <p className="gov-highlight-title">Voting Diversity - High-Value Disbursements (§5.8)</p>
          <p className="gov-highlight-body">Disbursements above $10,000 require approving votes from voters with <strong className="gov-fg">less than 60% pairwise voting-history overlap</strong> in the prior 180 days (Jaccard similarity). An account must be at least 90 days old with at least 5 prior votes to satisfy this requirement - fresh accounts cannot trivially meet it with zero overlap.</p>
          <p className="gov-highlight-body"><strong className="gov-accent">Small community fallback:</strong> If fewer than 10 eligible accounts exist, the diversity requirement is replaced with a 14-day extended escrow hold + mandatory Major-tier vote.</p>
        </div>
      </Section>

      <Section id="disbursement" title="Disbursement" icon={Lock}>
        <p>Disbursement thresholds apply to <strong className="gov-fg">operator's 90-day rolling total volume</strong> - not per-campaign, preventing splitting exploits.</p>
        <Table
          headers={['Rolling 90-Day Volume', 'Default', 'Override Required']}
          rows={[
            ['Below $2,000', 'Release', '60% majority to block'],
            ['$2,000 and above', 'Hold', '60% majority to approve'],
          ]}
        />
        <p className="gov-mt-16"><strong className="gov-green">Platform fee: Zero.</strong> Citeback takes no percentage from campaign contributions. All funds go directly to the campaign operator's wallet. Platform operating costs are covered by the founding operator. Ratified 2026-05-06 - see governance rationale below.</p>
      </Section>

      <Section id="human-operator" title="Human Operator Layer (Wyoming DAO LLC - §9)" icon={Users}>
        <p>Citeback is operated by the <strong className="gov-fg">Wyoming DAO LLC</strong> (the "platform entity") - an active operator, not a passive relay. The platform entity handles all human-judgment functions; the wallet layer handles all financial execution.</p>
        <div className="gov-op-cards">
          <div className="gov-op-card gov-op-card--green">
            <strong className="gov-green">What the platform entity does</strong>
            <p className="gov-op-card-desc">Campaign proposal review (legal judgment); operator onboarding and OFAC pre-screening; site content and documentation; community communications; legal compliance and DAO counsel engagement.</p>
          </div>
          <div className="gov-op-card gov-op-card--red">
            <strong className="gov-red">What the platform entity cannot do</strong>
            <p className="gov-op-card-desc">Override community governance votes. Approve or block disbursements outside community-voted rules. Suppress lawful campaigns that meet published guidelines. Use emergency pause to block votes or challenges. Access operator identity data for purposes other than OFAC screening and accountability.</p>
          </div>
          <div className="gov-op-card gov-op-card--purple">
            <strong className="gov-purple">OFAC Screening - Two Layers (§9.3)</strong>
            <p className="gov-op-card-desc"><strong className="gov-fg">Layer 1:</strong> Human OFAC pre-screening of operators at onboarding - identity-level, before any campaign wallet is created.<br /><strong className="gov-fg">Layer 2:</strong> Automated wallet-level re-check at every disbursement against continuously updated SDN list.<br /><strong className="gov-red">Limitation:</strong> Anonymous XMR/ZANO contributor transactions cannot be screened (Monero privacy is protocol-level). This gap requires attorney analysis before launch. See GOVERNANCE.md §9.3.</p>
          </div>
          <div className="gov-op-card gov-op-card--blue">
            <strong className="gov-blue">Community accountability for the platform entity (§9.2)</strong>
            <p className="gov-op-card-desc">Misconduct reports (§8); governance proposals constraining operator conduct; campaign rejection appeals (Major-tier community vote can overrule); fork right - if the community loses confidence in the platform entity, a fork is always available.</p>
          </div>
        </div>
      </Section>

      <Section id="wallet-architecture" title="Wallet Architecture (Direct Wallet Model)" icon={Lock}>
        <p>Citeback uses a <strong className="gov-fg">direct wallet model</strong>: operators hold their own XMR and ZANO wallets. Contributions flow directly from contributors to the operator's wallet — Citeback never holds, pools, or touches campaign funds.</p>
        <div className="gov-highlight">
          <strong className="gov-accent">How accountability works without custody:</strong>
          <p className="gov-highlight-body-14">Operators publish a view key (read-only) so anyone can verify the wallet balance in real time. Citeback monitors via the same view key. Early drain before campaign completion triggers an immediate permanent ban and public misconduct record. Operators are pre-screened (OFAC + identity verification) before any campaign goes live. The architecture specification is published on GitHub for community review before any funds are accepted.</p>
        </div>
      </Section>

      <Section id="bootstrapping" title="Bootstrapping & Founder Restrictions" icon={Users}>
        <div className="gov-highlight--indigo">
          <p className="gov-indigo-title">Bootstrap Ratification - 2026-05-06</p>
          <p className="gov-indigo-p">
            The graduated 3-5% platform fee model was eliminated by founding operator Scott Hughes during the pre-launch formation period. Rationale: mission alignment (no extractive relationship with campaigns), operational simplicity, and legal architecture (pure pass-through strengthens agent-of-the-payee argument). This change was not made to avoid regulatory classification - it was made because it is the right structure for this platform's mission. The timing is documented here so the rationale is on record. Valid under §14 bootstrap governance pending formal community ratification upon LLC formation and launch.
          </p>
        </div>
        <p>During the bootstrapping period, the founder has <strong className="gov-fg">zero voting rights</strong>. After bootstrapping ends, the founder is permanently capped at <strong className="gov-fg">5% of any vote total</strong> - enforced by the wallet-layer founder address registry and immutable (§15).</p>
        <p className="gov-mt-12"><strong className="gov-accent">Bootstrapping ends when all three are met:</strong></p>
        <div className="gov-check-list">
          {[
            'Platform has been live for at least 6 months',
            '3 qualifying governance votes within a 90-day window (50-voter quorum, median contribution ≥ $20, without founder participation)',
            '30-day transition period where both governance regimes apply simultaneously',
          ].map((item, i) => (
            <div key={i} className="gov-check-item">
              <CheckCircle size={14} className="gov-check-icon" />
              <span className="gov-check-text">{item}</span>
            </div>
          ))}
        </div>
        <p className="gov-mt-12"><strong className="gov-accent">Stagnation escape:</strong> If the platform has been active for 36 months without meeting exit criteria, bootstrapping ends automatically. No constraints are relaxed - the founder retains the permanent 5% cap.</p>
        <div className="gov-highlight gov-highlight--red">
          <p className="gov-callout-p">
            <strong className="gov-red">Founder taint tracking:</strong> 3-hop minimum, 50% decay per hop. Any account with &gt;1% residual founder taint counts fully toward the 5% cap - no further discounting. Founders cannot vote on their own ceiling removal.
          </p>
        </div>
      </Section>

      <Section id="immutables" title="Immutables" icon={AlertTriangle}>
        <p className="gov-mb-16">The following are enforced by the wallet execution layer. <strong className="gov-fg">A 100% community vote cannot override them.</strong> Changing them requires forking the platform.</p>
        <div className="gov-check-list">
          {[
            'No platform key access — Citeback never holds, receives, or controls operator wallet private keys',
            'Criminal defense prohibition — no funding of criminal defense campaigns',
            'Illegal activity prohibition — no funding of campaigns involving illegal activity',
            'Camera tampering prohibition — no funding of campaigns to disable or interfere with surveillance equipment',
            'No individual surplus distribution — operations surplus cannot flow to any individual as profit',
            'Founder voting ceiling permanence — 5% founder voting cap is permanent; founders cannot vote on this rule',
            'No platform custody — the platform may not hold, receive, or transmit campaign funds; direct-to-operator model is permanent',
            'Minimum threshold floor — voting threshold cannot be set below $1 equivalent',
            'Founder address registry permanence — founder address registry cannot be modified by any vote',
            'OFAC SDN match override prohibition — no community vote may override a denial based on an OFAC SDN list match',
          ].map((item, i) => (
            <div key={i} className="gov-check-item">
              <AlertTriangle size={14} className="gov-check-icon--amber" />
              <span className="gov-check-text">{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="prerequisites" title="Launch Prerequisites" icon={CheckCircle}>
        <p className="gov-mb-16">The platform does not accept funds until <strong className="gov-fg">all of the following are complete and publicly verifiable:</strong></p>
        <div className="gov-check-list">
          {[
            { done: true,  text: 'Governance framework published — complete ✅' },
            { done: true,  text: 'Surveillance camera database live — complete ✅' },
            { done: true,  text: 'Expert directory launched — complete ✅' },
            { done: true,  text: 'Campaign proposals published publicly (GitHub repo public) — complete ✅' },
            { done: false, text: 'Wyoming DAO LLC incorporated with registered agent' },
            { done: false, text: 'FinCEN MSB compliance opinion obtained from attorney' },
            { done: false, text: 'Operator wallet framework live — operators self-custody campaign funds via their own XMR/ZANO wallets; Citeback never holds funds' },
            { done: false, text: 'View-key balance verification live — read-only wallet monitoring and drain detection active for all campaigns' },
            { done: false, text: 'OFAC attorney guidance obtained; operator pre-screening framework operational before first wallet activates' },
            { done: false, text: 'First campaign wallet activated' },
          ].map((item, i) => (
            <div key={i} className="gov-check-item">
              {item.done
                ? <CheckCircle size={14} className="gov-check-icon--done" />
                : <Circle size={14} className="gov-check-icon--pending" />}
              <span className={item.done ? 'gov-check-text gov-fg' : 'gov-check-text gov-muted'}>{item.text}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer note */}
      <div className="gov-footer-note">
        This is a living document. Community ratification required before mainnet.{' '}
        <a href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" className="gov-accent">
          View full specification on GitHub →
        </a>
      </div>

      {/* CTA */}
      {setTab && (
        <div className="gov-cta">
          <div>
            <p className="gov-cta-title">
              Governed by code. Funded anonymously.
            </p>
            <p className="gov-cta-desc">
              Browse the campaigns this governance structure protects.
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
