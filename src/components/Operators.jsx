import { useState } from 'react'
import { CheckCircle, AlertTriangle, Scale, FileText, Building, Shield, ChevronDown, ChevronRight, ExternalLink, Coins, Globe, Clock } from 'lucide-react'

function Accordion({ title, icon: Icon, color = 'var(--accent)', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 0, overflow: 'hidden', marginBottom: 12,
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '18px 20px', background: 'none', border: 'none',
        cursor: 'pointer', color: 'var(--text)', textAlign: 'left',
      }}>
        {Icon && <Icon size={18} style={{ color, flexShrink: 0 }} />}
        <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{title}</span>
        {open ? <ChevronDown size={16} style={{ color: 'var(--muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--muted)' }} />}
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', color: 'var(--muted)', lineHeight: 1.7, fontSize: 14 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Req({ ok, pending, children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
      {pending
        ? <Clock size={15} style={{ color: '#a78bfa', flexShrink: 0, marginTop: 2 }} />
        : ok
          ? <CheckCircle size={15} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 2 }} />
          : <AlertTriangle size={15} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />}
      <span style={{ fontSize: 14 }}>{children}</span>
    </div>
  )
}

const campaignTypes = [
  { label: 'Proven High Impact', color: '#6ee7b7', types: [
    { name: 'FOIA Campaigns', desc: 'Public records requests to expose surveillance contracts, costs, and deployment data. Low cost, feeds every other campaign type.' },
    { name: 'Ordinance Campaigns', desc: 'City council campaigns to ban or regulate surveillance locally. Proven playbook across dozens of cities.' },
    { name: 'Public Records Litigation', desc: 'Force disclosure via FOIA litigation and injunctions when agencies refuse. Produces permanent citable records.' },
    { name: 'Counter-Database Projects', desc: 'Accountability mapping of surveillance infrastructure. Feeds litigation, journalism, and legislation.' },
    { name: 'Billboard Campaigns', desc: 'Place public awareness signs near surveillance infrastructure. Simple, visible, hard to ignore.' },
  ]},
  { label: 'Specialized Actions', color: '#a78bfa', types: [
    { name: 'Vendor Accountability', desc: 'Target Clearview, Flock Safety, Palantir by name. Anonymous funding is uniquely valuable here.' },
    { name: 'Legislative Advocacy', desc: 'Testimony, model bills, public comment campaigns. Operators should consult an attorney before launching.' },
    { name: 'Legal Defense', desc: 'Civil and administrative challenges only. No criminal defense.' },
    { name: 'Journalist Partnerships', desc: 'Fund investigative reporting on specific surveillance deployments.' },
    { name: 'Procurement Intervention', desc: 'Legal challenges to government RFPs and sole-source surveillance contracts.' },
  ]},
]

export default function Operators() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Scale size={28} style={{ color: 'var(--accent)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Run a Campaign</h1>
        </div>
        <p style={{ color: 'var(--muted)', maxWidth: 600, lineHeight: 1.7, fontSize: 15 }}>
          Operators are the people who make campaigns happen — lawyers who file the FOIA, activists who organize the ordinance vote, researchers who build the counter-database. If you have a specific surveillance accountability target and can execute, this is for you.
        </p>

        {/* How this works — honest model */}
        <div style={{ marginTop: 16, color: 'var(--muted)', maxWidth: 600, lineHeight: 1.7, fontSize: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 0, padding: '16px 20px' }}>
          <p style={{ margin: '0 0 10px' }}>
            <strong style={{ color: 'var(--text)' }}>How this works:</strong> Operators hold their own XMR wallet and publish a view key so anyone can verify the balance in real time. Contributors send directly to the operator's wallet — Citeback never holds or touches campaign funds. Citeback's role is verification and accountability: reviewing campaign proposals, verifying milestones, and maintaining operator reputation scores.
          </p>
          <p style={{ margin: 0 }}>
            Campaigns are funded milestone by milestone. Operators define deliverables upfront (FOIA filed, billboard live, legal action taken). Each milestone is verified before the next tranche of funding is promoted. Operators start with small campaign caps and earn access to larger amounts through track record.
          </p>
        </div>
      </div>

      {/* Participant roles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { role: 'Camera Verifier', req: 'No account. No identity. Submit a sighting on the map — that\'s it. Verified sightings build reputation toward operator access.', color: '#6ee7b7', anon: true },
          { role: 'Contributor', req: 'No account. No identity. Send XMR or ZANO directly to an operator\'s campaign wallet. Wallets activate at platform launch.', color: '#6ee7b7', anon: true },
          { role: 'Independent Actor', req: 'No account. No identity. Use our research to buy your own billboard, print signs, file your own FOIA — no platform interaction required.', color: '#6ee7b7', anon: true },
          { role: 'Campaign Operator', req: 'Pseudonymous account + reputation required. You hold your own campaign wallet — accountability is built through track record, not identity alone.', color: '#f59e0b', anon: false },
        ].map(p => (
          <div key={p.role} style={{ background: 'var(--bg2)', border: `1px solid ${p.anon ? 'rgba(110,231,183,0.2)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 0, padding: '16px 18px' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: p.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.role}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{p.req}</p>
          </div>
        ))}
      </div>

      {/* Requirements */}
      <div style={{
        background: 'rgba(255,245,51,0.04)', border: '1px solid rgba(255,245,51,0.2)',
        borderRadius: 0, padding: '20px 24px', marginBottom: 32,
      }}>
        <p style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          What Campaign Operators Need
        </p>
        <Req ok={true}>A pseudonymous account with verified camera sightings. Start at Tier 0 — submit cameras, build reputation, unlock campaign access.</Req>
        <Req ok={true}>Have a specific, verifiable target. A real program, agency, vendor, or jurisdiction — not a vague cause.</Req>
        <Req ok={true}>Submit a cost breakdown with defined milestones. Every campaign needs a line-item budget and measurable deliverables.</Req>
        <Req ok={true}>Your campaign must target a government entity, government program, or government-contracted surveillance vendor — not a private individual.</Req>
        <Req pending={true}>Identity verification and OFAC screening — pending launch. Required before any campaign goes live. Process opens when the operator onboarding system launches.</Req>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
          Start by submitting camera sightings. Each verified sighting builds reputation toward your first campaign slot. The more you contribute to the map, the faster you unlock access.
        </p>
      </div>

      {/* What makes a good campaign */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>What Makes a Strong Campaign</h2>

      <Accordion title="Has a specific, verifiable target" icon={Shield} defaultOpen>
        <p>The best campaigns name a specific program, agency, vendor, or jurisdiction. "Stop Flock Safety cameras in Taos NM" is fundable. "Fight surveillance" is not.</p>
        <p style={{ marginTop: 8 }}>You need to define upfront: what does success look like? What's the proof standard? What changes if this campaign wins?</p>
      </Accordion>

      <Accordion title="Funded by lawful activity only" icon={CheckCircle}>
        <p>Criminal defense funding is prohibited. Campaigns involving illegal activity are prohibited. Camera tampering is prohibited — these are governance immutables and cannot be voted away.</p>
        <p style={{ marginTop: 8 }}>Billboard campaigns require an operator attestation of factual accuracy — you certify your claims are verifiable. The platform does not verify content, but you are legally responsible for it.</p>
      </Accordion>

      <Accordion title="Has a realistic cost breakdown with milestones" icon={FileText}>
        <p>Campaign proposals require a cost breakdown and defined milestones. Each milestone has a specific deliverable (FOIA filing receipt, MuckRock URL, photo of billboard) and a specific cost. Funding is released milestone by milestone as each deliverable is verified.</p>
        <p style={{ marginTop: 8 }}>Vague goals ("raise $50k for legal costs") won't be approved. Specific proposals ("file FOIA with Bernalillo County Sheriff — $800 attorney fee — verified by MuckRock URL") are what the platform is built for.</p>
      </Accordion>

      <Accordion title="Operator reputation and campaign caps" icon={Building}>
        <p>Campaign access scales with your track record on the platform — not with your application. Start small, deliver, build reputation, earn access to larger campaigns.</p>
        <div style={{ marginTop: 8, fontSize: 13 }}>
          {[
            { tier: 'Tier 1', unlock: '10 verified camera sightings', cap: 'Up to $500 per campaign' },
            { tier: 'Tier 2', unlock: '3 completed Tier 1 campaigns, 90%+ completion rate', cap: '$501–$5,000' },
            { tier: 'Tier 3', unlock: '3 Tier 2 campaigns + community vouching', cap: '$5,001–$25,000 (milestone plan required)' },
            { tier: 'Tier 4', unlock: 'Institutional credentials (bar number, org registration)', cap: '$25,001–$100,000 (milestone plan required)' },
          ].map((row, i, arr) => (
            <div key={row.tier} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 8, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'start' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{row.tier}</span>
              <span style={{ color: 'var(--muted)' }}>{row.unlock}</span>
              <span style={{ color: 'var(--text)' }}>{row.cap}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12 }}>Start by submitting and verifying cameras. That's how reputation begins.</p>
      </Accordion>

      {/* Campaign types */}
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 16px' }}>Campaign Types</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
        The platform funds any lawful accountability activity. Campaign types below are organized by demonstrated real-world impact.
      </p>

      {campaignTypes.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: group.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            {group.label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.types.map(t => (
              <div key={t.name} style={{
                padding: '12px 16px', borderRadius: 0,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderLeft: `3px solid ${group.color}`,
              }}>
                <strong style={{ color: 'var(--text)', fontSize: 14 }}>{t.name}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Disbursement */}
      <div style={{
        background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.15)',
        borderRadius: 0, padding: '20px 24px', margin: '32px 0',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Coins size={18} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: '#6ee7b7', marginBottom: 8 }}>How Disbursement Works</p>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
              Operators hold their own XMR wallet. Contributors send directly to that wallet — Citeback never holds funds. Operators publish a view key so the balance is publicly verifiable in real time. When the campaign goal is reached, the site marks it funded.
            </p>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
              For Tier 2+ campaigns, funding is released milestone by milestone. Each milestone has a defined deliverable verified by Citeback (C2PA photo, MuckRock FOIA URL, court filing number) before the next tranche is promoted. Converting XMR to fiat for vendor payments is the operator's responsibility.
            </p>
          </div>
        </div>
      </div>

      <Accordion title="What happens after you submit a proposal" icon={FileText}>
        <ol style={{ paddingLeft: 18, lineHeight: 2 }}>
          <li>Proposal saved to the queue — reviewed when operator onboarding launches</li>
          <li>Reputation and identity verified through the platform's onboarding system</li>
          <li>Tier assigned based on your reputation score and campaign scope</li>
          <li>Milestone plan reviewed and approved before campaign opens</li>
          <li>Campaign published — community begins funding</li>
          <li>Funds disburse milestone-by-milestone as verified deliverables are submitted</li>
          <li>Campaign closes with a public outcome record</li>
        </ol>
        <p style={{ marginTop: 12 }}>All contributions are final and non-refundable. Campaign wallets are operator-held — if a campaign isn't funded within its deadline, any funds received are handled per the campaign's stated terms set before launch.</p>
      </Accordion>

      {/* CTA */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 0, padding: '28px 24px', textAlign: 'center', marginTop: 32,
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ready to Propose a Campaign?</h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20, maxWidth: 420, margin: '0 auto 20px' }}>
          Submit your proposal now to be first in line. Strong campaigns get funded fast once operator onboarding opens.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openPropose', { detail: {} }))}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '12px 24px', borderRadius: 0, fontSize: 14, fontWeight: 700,
              background: 'var(--accent)', border: 'none',
              color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)',
              letterSpacing: '0.04em',
            }}
          >
            Propose a Campaign
          </button>
          <a href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 0, fontSize: 14, fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            color: 'var(--text)', textDecoration: 'none',
          }}>
            <ExternalLink size={14} /> Read the Governance Doc
          </a>
        </div>
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Operator onboarding opens at launch.</strong>{' '}
            In the meantime, start building reputation by submitting and verifying camera sightings — that's how operator access is earned.
          </p>
        </div>
      </div>
    </div>
  )
}
