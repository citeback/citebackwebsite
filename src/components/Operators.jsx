import { useState } from 'react'
import { CheckCircle, AlertTriangle, Scale, FileText, Building, Shield, ChevronDown, ChevronRight, ExternalLink, Coins, Globe, Clock } from 'lucide-react'

function Accordion({ title, icon: Icon, color = 'var(--accent)', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="ops-accordion">
      <button onClick={() => setOpen(o => !o)} className="ops-accordion-btn">
        {Icon && <Icon size={18} className="ops-accordion-icon" />}
        <span className="ops-accordion-btn-label">{title}</span>
        {open ? <ChevronDown size={16} className="ops-accordion-chevron" /> : <ChevronRight size={16} className="ops-accordion-chevron" />}
      </button>
      {open && (
        <div className="ops-accordion-body">
          {children}
        </div>
      )}
    </div>
  )
}

function Req({ ok, pending, children }) {
  return (
    <div className="ops-req-item">
      {pending
        ? <Clock size={15} className="ops-req-icon ops-req-icon--pending" />
        : ok
          ? <CheckCircle size={15} className="ops-req-icon ops-req-icon--ok" />
          : <AlertTriangle size={15} className="ops-req-icon ops-req-icon--warn" />}
      <span className="ops-req-text">{children}</span>
    </div>
  )
}

const campaignTypes = [
  { label: 'Proven High Impact', color: '#6ee7b7', cls: 'proven', types: [
    { name: 'FOIA Campaigns', desc: 'Public records requests to expose surveillance contracts, costs, and deployment data. Low cost, feeds every other campaign type.' },
    { name: 'Ordinance Campaigns', desc: 'City council campaigns to ban or regulate surveillance locally. Proven playbook across dozens of cities.' },
    { name: 'Public Records Litigation', desc: 'Force disclosure via FOIA litigation and injunctions when agencies refuse. Produces permanent citable records.' },
    { name: 'Counter-Database Projects', desc: 'Accountability mapping of surveillance infrastructure. Feeds litigation, journalism, and legislation.' },
    { name: 'Billboard Campaigns', desc: 'Place public awareness signs near surveillance infrastructure. Simple, visible, hard to ignore.' },
  ]},
  { label: 'Specialized Actions', color: '#a78bfa', cls: 'specialized', types: [
    { name: 'Vendor Accountability', desc: 'Target Clearview, Flock Safety, Palantir by name. Anonymous funding is uniquely valuable here.' },
    { name: 'Legislative Advocacy', desc: 'Testimony, model bills, public comment campaigns. Operators should consult an attorney before launching.' },
    { name: 'Legal Defense', desc: 'Civil and administrative challenges only. No criminal defense.' },
    { name: 'Journalist Partnerships', desc: 'Fund investigative reporting on specific surveillance deployments.' },
    { name: 'Procurement Intervention', desc: 'Legal challenges to government RFPs and sole-source surveillance contracts.' },
  ]},
]

export default function Operators() {
  return (
    <div className="ops-page">

      {/* Header */}
      <div className="ops-header">
        <div className="ops-header-icon-row">
          <Scale size={28} className="ops-header-icon" />
          <h1>Run a Campaign</h1>
        </div>
        <p>
          Operators are the people who make campaigns happen — lawyers who file the FOIA, activists who organize the ordinance vote, researchers who build the counter-database. If you have a specific surveillance accountability target and can execute, this is for you.
        </p>

        {/* How this works — honest model */}
        <div className="ops-how-box">
          <p className="ops-how-p">
            <strong>How this works:</strong> Operators hold their own XMR wallet and publish a view key so anyone can verify the balance in real time. Contributors send directly to the operator's wallet — Citeback never holds or touches campaign funds. Citeback's role is verification and accountability: reviewing campaign proposals, verifying milestones, and maintaining operator reputation scores.
          </p>
          <p className="ops-how-p--last">
            Campaigns are funded milestone by milestone. Operators define deliverables upfront (FOIA filed, billboard live, legal action taken). Each milestone is verified before the next tranche of funding is promoted. Operators start with small campaign caps and earn access to larger amounts through track record.
          </p>
        </div>
      </div>

      {/* Quick Start path */}
      <div className="ops-quickstart">
        <p className="ops-quickstart-label">
          ⚡ How to Become a Campaign Operator — 3 Steps
        </p>
        <div className="ops-steps">
          {[
            { n: '01', title: 'Report surveillance cameras', desc: 'Use Proofmode (free, iOS/Android) to take GPS-tagged photos of publicly visible surveillance cameras and submit them on the Report tab. Each verified C2PA photo earns you 1–2 reputation points.' },
            { n: '02', title: 'Reach 10 points → Tier 1 Operator', desc: 'Ten verified sightings unlock your Operator tier. At Tier 1 you can claim and run campaigns up to $1,000. No identity required — just a pseudonymous account and a track record.' },
            { n: '03', title: 'Claim or propose a campaign', desc: 'Browse unclaimed campaigns and claim one, or propose a new campaign with a specific target, cost breakdown, and milestones. Add your own XMR wallet — contributors send directly to you.' },
          ].map(s => (
            <div key={s.n} className="ops-step">
              <div className="ops-step-num">{s.n}</div>
              <div>
                <div className="ops-step-title">{s.title}</div>
                <div className="ops-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Participant roles */}
      <div className="ops-roles-grid">
        {[
          { role: 'Camera Verifier', req: 'No account. No identity. Submit a sighting on the map — that\'s it. Verified sightings build reputation toward operator access.', color: '#6ee7b7', anon: true },
          { role: 'Contributor', req: 'No account. No identity. Send XMR or ZANO directly to an operator\'s campaign wallet. Wallets activate at platform launch.', color: '#6ee7b7', anon: true },
          { role: 'Independent Actor', req: 'No account. No identity. Use our research to buy your own billboard, print signs, file your own FOIA — no platform interaction required.', color: '#6ee7b7', anon: true },
          { role: 'Campaign Operator', req: 'Pseudonymous account + reputation required. You hold your own campaign wallet — accountability is built through track record, not identity alone.', color: '#f59e0b', anon: false },
        ].map(p => (
          <div key={p.role} className={`ops-role-card ${p.anon ? 'ops-role-card--anon' : 'ops-role-card--operator'}`}>
            <p className="ops-role-label">{p.role}</p>
            <p className="ops-role-desc">{p.req}</p>
          </div>
        ))}
      </div>

      {/* Requirements */}
      <div className="ops-requirements">
        <p className="ops-requirements-title">
          What Campaign Operators Need
        </p>
        <Req ok={true}>A pseudonymous account with verified camera sightings. Start at Tier 0 — submit cameras, build reputation, unlock campaign access.</Req>
        <Req ok={true}>Have a specific, verifiable target. A real program, agency, vendor, or jurisdiction — not a vague cause.</Req>
        <Req ok={true}>Submit a cost breakdown with defined milestones. Every campaign needs a line-item budget and measurable deliverables.</Req>
        <Req ok={true}>Your campaign must target a government entity, government program, or government-contracted surveillance vendor — not a private individual.</Req>
        <Req pending={true}>Identity verification and OFAC screening — pending launch. Required before any campaign goes live. Process opens when the operator onboarding system launches.</Req>
        <p className="ops-req-note">
          Start by submitting camera sightings. Each verified sighting builds reputation toward your first campaign slot. The more you contribute to the map, the faster you unlock access.
        </p>
      </div>

      {/* What makes a good campaign */}
      <h2 className="ops-h2">What Makes a Strong Campaign</h2>

      <Accordion title="Has a specific, verifiable target" icon={Shield} defaultOpen>
        <p>The best campaigns name a specific program, agency, vendor, or jurisdiction. "Stop Flock Safety cameras in Taos NM" is fundable. "Fight surveillance" is not.</p>
        <p className="ops-body-p-spaced">You need to define upfront: what does success look like? What's the proof standard? What changes if this campaign wins?</p>
      </Accordion>

      <Accordion title="Funded by lawful activity only" icon={CheckCircle}>
        <p>Criminal defense funding is prohibited. Campaigns involving illegal activity are prohibited. Camera tampering is prohibited — these are governance immutables and cannot be voted away.</p>
        <p className="ops-body-p-spaced">Billboard campaigns require an operator attestation of factual accuracy — you certify your claims are verifiable. The platform does not verify content, but you are legally responsible for it.</p>
      </Accordion>

      <Accordion title="Has a realistic cost breakdown with milestones" icon={FileText}>
        <p>Campaign proposals require a cost breakdown and defined milestones. Each milestone has a specific deliverable (FOIA filing receipt, MuckRock URL, photo of billboard) and a specific cost. Funding is released milestone by milestone as each deliverable is verified.</p>
        <p className="ops-body-p-spaced">Vague goals ("raise $50k for legal costs") won't be approved. Specific proposals ("file FOIA with Bernalillo County Sheriff — $800 attorney fee — verified by MuckRock URL") are what the platform is built for.</p>
      </Accordion>

      <Accordion title="Operator reputation and campaign caps" icon={Building}>
        <p>Campaign access scales with your track record on the platform — not with your application. Start small, deliver, build reputation, earn access to larger campaigns.</p>
        <div className="ops-tier-wrap">
          {[
            { tier: 'New Operator', unlock: '10 verified camera sightings (Tier 1 reputation)', cap: 'Up to $1,000 per campaign' },
            { tier: '10 Campaigns', unlock: '10 successfully completed campaigns', cap: 'Up to $7,500 — no legal entity required' },
            { tier: 'Legal Entity', unlock: 'Registered LLC, nonprofit, or equivalent on file', cap: 'Up to $30,000' },
            { tier: 'Reviewed', unlock: 'Legal entity + DAO counsel review + $1M liability insurance', cap: 'Up to $125,000' },
          ].map((row, i, arr) => (
            <div key={row.tier} className="ops-tier-row">
              <span className="ops-tier-name">{row.tier}</span>
              <span className="ops-tier-unlock">{row.unlock}</span>
              <span className="ops-tier-cap">{row.cap}</span>
            </div>
          ))}
        </div>
        <p className="ops-tier-note">Start by submitting and verifying cameras. That's how reputation begins.</p>
      </Accordion>

      {/* Campaign types */}
      <h2 className="ops-h2--spaced">Campaign Types</h2>
      <p className="ops-section-intro">
        The platform funds any lawful accountability activity. Campaign types below are organized by demonstrated real-world impact.
      </p>

      {campaignTypes.map((group, gi) => (
        <div key={gi} className="ops-campaign-group">
          <p className={`ops-campaign-group-label ops-group--${group.cls}`}>
            {group.label}
          </p>
          <div className="ops-campaign-types-grid">
            {group.types.map(t => (
              <div key={t.name} className={`ops-campaign-type ops-type--${group.cls}`}>
                <strong className="ops-campaign-type-name">{t.name}</strong>
                <p className="ops-campaign-type-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Disbursement */}
      <div className="ops-disbursement">
        <div className="ops-disbursement-inner">
          <Coins size={18} className="ops-disbursement-icon" />
          <div>
            <p className="ops-disbursement-title">How Disbursement Works</p>
            <p className="ops-disbursement-text">
              Operators hold their own XMR wallet. Contributors send directly to that wallet — Citeback never holds funds. Operators publish a view key so the balance is publicly verifiable in real time. When the campaign goal is reached, the site marks it funded.
            </p>
            <p className="ops-disbursement-text--spaced">
              For Tier 2+ campaigns, funding is released milestone by milestone. Each milestone has a defined deliverable verified by Citeback (C2PA photo, MuckRock FOIA URL, court filing number) before the next tranche is promoted. Converting XMR to fiat for vendor payments is the operator's responsibility.
            </p>
          </div>
        </div>
      </div>

      <Accordion title="What happens after you submit a proposal" icon={FileText}>
        <ol className="ops-accordion-list">
          <li>Proposal saved to the queue — reviewed when operator onboarding launches</li>
          <li>Reputation and identity verified through the platform's onboarding system</li>
          <li>Tier assigned based on your reputation score and campaign scope</li>
          <li>Milestone plan reviewed and approved before campaign opens</li>
          <li>Campaign published — community begins funding</li>
          <li>Funds disburse milestone-by-milestone as verified deliverables are submitted</li>
          <li>Campaign closes with a public outcome record</li>
        </ol>
        <p className="ops-accordion-final">All contributions are final and non-refundable. Campaign wallets are operator-held — if a campaign isn't funded within its deadline, any funds received are handled per the campaign's stated terms set before launch.</p>
      </Accordion>

      {/* CTA */}
      <div className="ops-cta-box">
        <h3 className="ops-cta-title">Ready to Propose a Campaign?</h3>
        <p className="ops-cta-desc">
          Submit your proposal now to be first in line. Strong campaigns get funded fast once operator onboarding opens.
        </p>
        <div className="ops-cta-btns">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openPropose', { detail: {} }))}
            className="ops-cta-btn--primary"
          >
            Propose a Campaign
          </button>
          <a href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" className="ops-cta-btn--secondary">
            <ExternalLink size={14} /> Read the Governance Doc
          </a>
        </div>
        <div className="ops-cta-footer">
          <p>
            <strong>Operator onboarding opens at launch.</strong>{' '}
            In the meantime, start building reputation by submitting and verifying camera sightings — that's how operator access is earned.
          </p>
        </div>
      </div>
    </div>
  )
}
