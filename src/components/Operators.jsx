import { useState } from 'react'
import { CheckCircle, AlertTriangle, Scale, FileText, Building, Shield, ChevronDown, ChevronRight, ExternalLink, Coins } from 'lucide-react'

function Accordion({ title, icon: Icon, color = 'var(--accent)', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 12,
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

function Req({ ok, children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
      {ok
        ? <CheckCircle size={15} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 2 }} />
        : <AlertTriangle size={15} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />}
      <span style={{ fontSize: 14 }}>{children}</span>
    </div>
  )
}

const campaignTypes = [
  { tier: 1, label: 'Tier 1 — Highest Impact', color: '#6ee7b7', types: [
    { name: 'Public Records Litigation', desc: 'Force disclosure via FOIA litigation and injunctions. Produces permanent citable records.' },
    { name: 'Ordinance Campaigns', desc: 'City council campaigns to ban or regulate surveillance locally. 50+ cities have succeeded.' },
    { name: 'Counter-Database Projects', desc: 'Accountability mapping of surveillance infrastructure. Feeds litigation, journalism, legislation.' },
    { name: 'FOIA Campaigns', desc: 'High-volume records requests. Low cost, feeds every other campaign type.' },
    { name: 'Journalist Partnerships', desc: 'Fund investigative reporting on specific surveillance deployments.' },
  ]},
  { tier: 2, label: 'Tier 2 — High Impact', color: '#a78bfa', types: [
    { name: 'Vendor Accountability', desc: 'Target Clearview, Flock Safety, Palantir by name. Anonymous funding uniquely valuable here.' },
    { name: 'Insurance/Liability Pressure', desc: 'Document harms to liability insurers of surveillance contractors. Most underexplored tool.' },
    { name: 'Legal Defense', desc: 'Civil and administrative challenges only. No criminal defense.' },
    { name: 'Legislative Advocacy', desc: 'Testimony, model bills, public comment. Requires legal sign-off.' },
    { name: 'Procurement Intervention', desc: 'Legal challenges to RFPs and sole-source contracts.' },
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
      </div>

      {/* Hard requirements upfront */}
      <div style={{
        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 32,
      }}>
        <p style={{ fontWeight: 700, color: '#f87171', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⚠️ Hard Requirements Before You Apply
        </p>
        <Req ok={false}>You must have a legal entity (LLC, nonprofit, etc.) — you cannot operate anonymously as an operator. The privacy protection is for donors, not operators.</Req>
        <Req ok={false}>Your legal entity must be able to open a business bank account and pay vendors in fiat. Funds disburse as XMR to your entity wallet — you handle fiat conversion.</Req>
        <Req ok={false}>You must pass OFAC/sanctions screening during onboarding. Real-name identity data is required (held by the DAO's legal entity, not published publicly).</Req>
        <Req ok={false}>Campaigns above $25,000 require entity documentation reviewed by DAO legal counsel and $1M liability insurance.</Req>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
          These aren't bureaucratic hurdles — they're what makes the platform legally defensible so it stays online.
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

      <Accordion title="Has a realistic cost breakdown" icon={FileText}>
        <p>Campaign proposals require a cost breakdown. Campaigns above $10,000 enter a mandatory 7-day community review. Campaigns above $25,000 require DAO legal counsel sign-off.</p>
        <p style={{ marginTop: 8 }}>Vague goals ("raise $50k for legal costs") get rejected. Specific proposals ("fund 3 FOIA requests at $800/each + attorney fees for appeal at $12,000 if denied") get funded.</p>
      </Accordion>

      <Accordion title="Operator has genuine campaign capacity" icon={Building}>
        <p>You're accountable to the community for execution. Reputation is how you earn higher campaign caps:</p>
        <div style={{ marginTop: 8, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span>Starting cap</span><span style={{ color: 'var(--accent)' }}>$1,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span>After $2k completed volume</span><span style={{ color: 'var(--accent)' }}>$5,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span>After $10k completed volume</span><span style={{ color: 'var(--accent)' }}>$25,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span>After $50k + entity docs</span><span style={{ color: 'var(--accent)' }}>$100,000</span>
          </div>
        </div>
        <p style={{ marginTop: 8 }}>Start small. Win. Build reputation. Run bigger campaigns.</p>
      </Accordion>

      {/* Campaign types */}
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 16px' }}>Campaign Types</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
        The platform funds any lawful accountability activity. Campaign types below are organized by demonstrated real-world impact.
      </p>

      {campaignTypes.map(tier => (
        <div key={tier.tier} style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: tier.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            {tier.label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tier.types.map(t => (
              <div key={t.name} style={{
                padding: '12px 16px', borderRadius: 8,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderLeft: `3px solid ${tier.color}`,
              }}>
                <strong style={{ color: 'var(--text)', fontSize: 14 }}>{t.name}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Fiat disbursement */}
      <div style={{
        background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.15)',
        borderRadius: 12, padding: '20px 24px', margin: '32px 0',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Coins size={18} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: '#6ee7b7', marginBottom: 8 }}>How Disbursement Works</p>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
              Funds disburse as XMR from the TEE to your entity wallet. You convert to fiat using <strong style={{ color: 'var(--text)' }}>RetoSwap</strong> (P2P, no KYC, Tor-based) or similar P2P exchanges, then pay vendors normally through your business account.
            </p>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
              The platform disburses XMR. What you do with it after is your business — you're operating for your own account, not as an intermediary. This keeps the platform legally clean and keeps you in control.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '28px 24px', textAlign: 'center',
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ready to Propose a Campaign?</h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20, maxWidth: 420, margin: '0 auto 20px' }}>
          Platform wallets are activating soon. Start preparing your campaign proposal now — strong proposals get funded fast once we go live.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            color: 'var(--text)', textDecoration: 'none',
          }}>
            <ExternalLink size={14} /> Read the Governance Doc
          </a>
          <a href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE-SUPPLEMENTS.md" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            color: 'var(--text)', textDecoration: 'none',
          }}>
            <ExternalLink size={14} /> Operator Technical Specs
          </a>
        </div>
      </div>
    </div>
  )
}
