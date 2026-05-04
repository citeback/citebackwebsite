import { useState } from 'react'
import { Shield, Lock, Users, Scale, Cpu, AlertTriangle, ExternalLink, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react'

const sections = [
  { id: 'philosophy', label: 'Philosophy', icon: Shield },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'campaigns', label: 'Campaign Types', icon: Scale },
  { id: 'voting', label: 'Voting Mechanics', icon: CheckCircle },
  { id: 'disbursement', label: 'Disbursement', icon: Lock },
  { id: 'ai', label: 'AI Ensemble', icon: Cpu },
  { id: 'tee', label: 'TEE Architecture', icon: Lock },
  { id: 'bootstrapping', label: 'Bootstrapping', icon: Users },
  { id: 'immutables', label: 'Immutables', icon: AlertTriangle },
  { id: 'prerequisites', label: 'Launch Prerequisites', icon: CheckCircle },
]

function Section({ id, title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div id={id} style={{
      background: 'var(--card-bg, rgba(255,255,255,0.04))',
      border: '1px solid var(--border, rgba(255,255,255,0.08))',
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 24px', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-primary, #fff)', textAlign: 'left'
        }}
      >
        <Icon size={18} style={{ color: 'var(--accent, #6ee7b7)', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 16, flex: 1 }}>{title}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div style={{ padding: '0 24px 24px', color: 'var(--text-secondary, rgba(255,255,255,0.7))', lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Tag({ children, color = '#6ee7b7' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, marginRight: 6, marginBottom: 4,
      background: color + '22', color: color, border: `1px solid ${color}44`
    }}>
      {children}
    </span>
  )
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '8px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--accent, #6ee7b7)', fontWeight: 600, whiteSpace: 'nowrap'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '8px 12px', verticalAlign: 'top' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Code({ children }) {
  return (
    <code style={{
      display: 'block', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace', fontSize: 13,
      color: '#6ee7b7', marginTop: 8, marginBottom: 8, whiteSpace: 'pre-wrap'
    }}>
      {children}
    </code>
  )
}

export default function Governance({ setTab }) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Shield size={28} style={{ color: 'var(--accent, #6ee7b7)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Governance Specification</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <Tag>Active</Tag>
          <Tag color="#a78bfa">Updated 2026-05-04</Tag>
        </div>
        <p style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))', maxWidth: 600, lineHeight: 1.7 }}>
          This document defines how Citeback is governed — how decisions are made, 
          how funds are disbursed, what can never be changed, and what must be in place before 
          a single dollar is accepted.
        </p>
        <a
          href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', textDecoration: 'none'
          }}
        >
          <ExternalLink size={14} /> View full document on GitHub
        </a>
      </div>

      {/* TOC */}
      <div style={{
        background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.15)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 32
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent, #6ee7b7)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>Contents</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              → {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <Section id="philosophy" title="Philosophy" icon={Shield} defaultOpen>
        <p>Citeback exists because surveillance is asymmetric. Institutions document individuals constantly, at scale, with impunity. Individuals have almost no reciprocal capacity to challenge them or fund accountability work.</p>
        <p style={{ marginTop: 12 }}>The platform ensures that financial access, legal pressure, and platform deplatforming <strong style={{ color: '#fff' }}>cannot silence lawful accountability work.</strong> It operates within applicable law and supports First Amendment-protected activity.</p>
        <p style={{ marginTop: 12 }}><strong style={{ color: 'var(--accent, #6ee7b7)' }}>Core differentiator:</strong> Established civil liberties organizations must disclose donors and answer to boards. This platform does not. Anonymous coordination enables funding campaigns those organizations cannot touch.</p>
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 8,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)'
        }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <strong style={{ color: '#f87171' }}>What this platform is not:</strong> A tool for harassment, defamation, or attacks on private individuals. A platform for criminal defense or illegal activity. Designed to evade lawful oversight.
          </p>
        </div>
      </Section>

      <Section id="participants" title="Participants" icon={Users}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Donors', color: '#6ee7b7', desc: 'Anyone who sends Monero to a campaign wallet. No registration. No identity collected. Voting weight derives from cumulative donations.' },
            { label: 'Operators', color: '#a78bfa', desc: 'Create and manage campaigns. Nostr keys preferred for identity (verifiable without exposing personal data). Must pass OFAC screening with real-name data held by DAO legal entity (never published on-chain), maintain reputation score, and submit verified proof of work. Independent contractors — not agents or employees.' },
            { label: 'The Community', color: '#60a5fa', desc: 'Active donors who participate in governance votes. No membership list, no token. Governance power flows directly from economic participation.' },
            { label: 'AI Ensemble', color: '#f59e0b', desc: 'Monitoring only — never moves money, never advises governance decisions. Can flag anomalies for human operator review. Minimum 3 independent models.' },
          ].map(p => (
            <div key={p.label} style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${p.color}` }}>
              <strong style={{ color: p.color }}>{p.label}</strong>
              <p style={{ margin: '6px 0 0', fontSize: 14 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="campaigns" title="Campaign Types" icon={Scale}>
        <p style={{ marginBottom: 16 }}>Campaign types are <strong style={{ color: '#fff' }}>not a fixed list</strong> — the platform funds any lawful accountability activity. New types are ratified via community vote. Types are organized by demonstrated effectiveness:</p>
        <p style={{ marginBottom: 8, fontWeight: 600, color: 'var(--accent, #6ee7b7)' }}>Tier 1 — Primary (Launch Priority)</p>
        <Table
          headers={['Type', 'Why It Works']}
          rows={[
            ['Public Records Litigation', 'Injunctions can halt programs; discovery is irreplaceable'],
            ['Ordinance Campaigns', 'Proven 50+ city playbook; permanent wins; 6-18 month timelines'],
            ['Counter-Database Projects', 'Force multiplier — feeds litigation, journalism, legislation'],
            ['FOIA Campaigns', 'Low cost, high volume, feeds every other campaign type'],
            ['Journalist Partnerships', 'Creates accountability litigation cannot; Intercept/Markup model'],
          ]}
        />
        <p style={{ marginTop: 16, marginBottom: 8, fontWeight: 600, color: '#a78bfa' }}>Tier 2 — Supporting</p>
        <Table
          headers={['Type', 'Notes']}
          rows={[
            ['Vendor Accountability', 'Target Clearview, Flock Safety, Palantir by name; anonymous funding uniquely valuable'],
            ['Insurance/Liability Pressure', 'Most underexplored tool; makes surveillance tech uninsurable'],
            ['Legal Defense', 'Civil and administrative only — no criminal defense'],
            ['Legislative Advocacy', 'Requires attorney sign-off (LDA/FARA exposure)'],
            ['Procurement Intervention', 'Legal challenges to RFPs and sole-source contracts'],
          ]}
        />
      </Section>

      <Section id="voting" title="Voting Mechanics" icon={CheckCircle}>
        <p>Voting power is proportional to economic participation. A logarithmic curve rewards participation while limiting concentration.</p>
        <p style={{ marginTop: 12, fontWeight: 600, color: '#fff' }}>Weight Formula:</p>
        <Code>weight = max(1, log₂(donation / $5) + 1){'\n\n'}Floor: 1.0 — no donation produces negative or zero weight{'\n'}$5 donation  → weight 1.0{'\n'}$10 donation → weight 2.0{'\n'}Cap: $1,280   → weight 9.0 (maximum)</Code>
        <p style={{ marginTop: 12 }}><strong style={{ color: 'var(--accent, #6ee7b7)' }}>72-hour rule:</strong> Donations must be at least 72 hours old at proposal submission to qualify. No last-minute flooding.</p>
        <p style={{ marginTop: 12 }}><strong style={{ color: 'var(--accent, #6ee7b7)' }}>Quorum requirements:</strong></p>
        <Table
          headers={['Change Tier', 'Quorum', 'Vote to Pass', 'Time-lock']}
          rows={[
            ['Minor', '10 voters', 'Simple majority', 'None'],
            ['Major', '25 voters', '60% supermajority', '7 days'],
            ['Governance', '50 voters', '75% supermajority', '14 days'],
          ]}
        />
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#a78bfa', fontSize: 14 }}>Voting Diversity — High-Value Disbursements (§5.8)</p>
          <p style={{ margin: '8px 0 0', fontSize: 13 }}>Disbursements above $10,000 require approving votes from voters with <strong style={{ color: '#fff' }}>less than 60% pairwise voting-history overlap</strong> in the prior 180 days (Jaccard similarity). An account must be at least 90 days old with at least 5 prior votes to satisfy this requirement — fresh accounts cannot trivially meet it with zero overlap.</p>
          <p style={{ margin: '8px 0 0', fontSize: 13 }}><strong style={{ color: 'var(--accent, #6ee7b7)' }}>Small community fallback:</strong> If fewer than 10 eligible accounts exist, the diversity requirement is replaced with a 14-day extended escrow hold + mandatory Major-tier vote.</p>
        </div>
      </Section>

      <Section id="disbursement" title="Disbursement" icon={Lock}>
        <p>Disbursement thresholds apply to <strong style={{ color: '#fff' }}>operator's 90-day rolling total volume</strong> — not per-campaign, preventing splitting exploits.</p>
        <Table
          headers={['Rolling 90-Day Volume', 'Default', 'Override Required']}
          rows={[
            ['Below $2,000', 'Release', '60% majority to block'],
            ['$2,000 and above', 'Hold', '60% majority to approve'],
          ]}
        />
        <p style={{ marginTop: 16 }}><strong style={{ color: 'var(--accent, #6ee7b7)' }}>Platform fee (graduated):</strong></p>
        <Table
          headers={['Volume', 'Fee']}
          rows={[
            ['$0 – $10k', '5.0%'],
            ['$10k – $25k', '4.5%'],
            ['$25k – $50k', '4.0%'],
            ['Above $50k', '3.0%'],
          ]}
        />
      </Section>

      <Section id="ai" title="AI Ensemble" icon={Cpu}>
        <p>The AI system has two <strong style={{ color: '#fff' }}>strictly separated layers:</strong></p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #6ee7b7' }}>
            <strong style={{ color: '#6ee7b7' }}>Execution Layer — deterministic only</strong>
            <p style={{ margin: '6px 0 0', fontSize: 14 }}>No AI model is in the path of any action that moves money or changes the live site. It either satisfies coded conditions or it doesn't.</p>
          </div>
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #a78bfa' }}>
            <strong style={{ color: '#a78bfa' }}>Monitoring Ensemble — detection only</strong>
            <p style={{ margin: '6px 0 0', fontSize: 14 }}>Minimum 3 independent models. Can flag anomalies for human operator review — never execute, never advise governance decisions. AI is not in the monitoring, approval, or advisory governance path. Confirmed anomalies surface to the human operator, who decides any response.</p>
          </div>
        </div>
      </Section>

      <Section id="tee" title="TEE Architecture (Multi-TEE, 2-of-3 Threshold)" icon={Lock}>
        <p>Wallet keys are split across <strong style={{ color: '#fff' }}>minimum 3 TEE instances on different hardware providers.</strong> 2-of-3 threshold signatures are required — a single TEE compromise cannot release funds.</p>
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 8,
          background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.2)'
        }}>
          <strong style={{ color: 'var(--accent, #6ee7b7)' }}>The core guarantee:</strong>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>No human — including the founder — has access to wallet private keys. Ever. There is no one to arrest, subpoena, or pressure into producing keys. This is enforced by architecture, not policy. If 2+ TEE instances fail simultaneously, all disbursements pause automatically and a Major-tier community vote must be held within 7 days to define recovery — no disbursements occur without a community-approved plan.</p>
        </div>
      </Section>

      <Section id="bootstrapping" title="Bootstrapping & Founder Restrictions" icon={Users}>
        <p>During the bootstrapping period, the founder has <strong style={{ color: '#fff' }}>zero voting rights</strong>. After bootstrapping ends, the founder is permanently capped at <strong style={{ color: '#fff' }}>5% of any vote total</strong> — enforced by the TEE-encoded founder address registry and immutable (§15).</p>
        <p style={{ marginTop: 12 }}><strong style={{ color: 'var(--accent, #6ee7b7)' }}>Bootstrapping ends when all three are met:</strong></p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {[
            'Platform has been live for at least 6 months',
            '3 qualifying governance votes within a 90-day window (50-voter quorum, median donation ≥ $20, without founder participation)',
            '30-day transition period where both governance regimes apply simultaneously',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <CheckCircle size={14} style={{ color: 'var(--accent, #6ee7b7)', flexShrink: 0, marginTop: 3 }} />
              <span style={{ fontSize: 14 }}>{item}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12 }}><strong style={{ color: 'var(--accent, #6ee7b7)' }}>Stagnation escape:</strong> If the platform has been active for 36 months without meeting exit criteria, bootstrapping ends automatically. No constraints are relaxed — the founder retains the permanent 5% cap.</p>
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <strong style={{ color: '#f87171' }}>Founder taint tracking:</strong> 3-hop minimum, 50% decay per hop. Any account with &gt;1% residual founder taint counts fully toward the 5% cap — no further discounting. Founders cannot vote on their own ceiling removal.
          </p>
        </div>
      </Section>

      <Section id="immutables" title="Immutables" icon={AlertTriangle}>
        <p style={{ marginBottom: 16 }}>The following are encoded in the TEE and enforced by the execution layer. <strong style={{ color: '#fff' }}>A 100% community vote cannot override them.</strong> Changing them requires forking the platform.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'No human key access — wallet keys cannot be extracted by any human',
            'Criminal defense prohibition — no funding of criminal defense campaigns',
            'Illegal activity prohibition — no funding of campaigns involving illegal activity',
            'Camera tampering prohibition — no funding of campaigns to disable or interfere with surveillance equipment',
            'No individual surplus distribution — operations surplus cannot flow to any individual',
            'Founder ceiling permanence — 5% founder voting ceiling cannot be removed',
            'Multi-TEE permanence — minimum 3 TEE instances is a permanent architectural requirement',
            'Minimum threshold floor — voting threshold cannot be set below $1 equivalent',
            'Founder address registry permanence — TEE-encoded founder registry cannot be modified by any vote',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 3 }} />
              <span style={{ fontSize: 14 }}>{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="prerequisites" title="Launch Prerequisites" icon={CheckCircle}>
        <p style={{ marginBottom: 16 }}>The platform does not accept funds until <strong style={{ color: '#fff' }}>all of the following are complete and publicly verifiable:</strong></p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Wyoming DAO LLC incorporated with registered agent',
            'MSB/FinCEN written attorney opinion — "not an MSB because X" or registration path',
            'Foreign qualification analysis in founder\'s home state',
            'FARA analysis at platform level',
            'Legislative advocacy compliance mechanism defined by attorney',
            'Billboard liability review — specific federal statutes enumerated',
            'Insurance coverage type specification (not just amount)',
            'Minimum 3 TEE instances across different hardware providers, live with 2-of-3 threshold signatures',
            'TEE threat model written, published, and community-ratified',
            'OFAC integration with continuous monitoring',
            'Governance document ratified via bootstrapping governance process',
            'Misconduct bond and staking systems operationally tested',
            'Operator insurance framework operational',
            'Founder address registry TEE-encoded and attested',
            'Campaign quality advisory board — minimum 2 domain experts',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <CheckCircle size={14} style={{ color: 'var(--accent, #6ee7b7)', flexShrink: 0, marginTop: 3 }} />
              <span style={{ fontSize: 14 }}>{item}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer note */}
      <div style={{
        marginTop: 32, padding: '16px 20px', borderRadius: 10,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center'
      }}>
        This is a living document. Community ratification required before mainnet.{' '}
        <a href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #6ee7b7)' }}>
          View full specification on GitHub →
        </a>
      </div>

      {/* CTA */}
      {setTab && (
        <div style={{
          marginTop: 32, padding: '24px', borderRadius: 12,
          background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--accent, #6ee7b7)', margin: '0 0 4px', fontSize: 14 }}>
              Governed by code. Funded anonymously.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
              Browse the campaigns this governance structure protects.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setTab('campaigns')}
              style={{
                background: 'var(--accent, #6ee7b7)', color: '#000', border: 'none',
                padding: '10px 22px', fontSize: 13, fontWeight: 700,
                letterSpacing: '0.03em', cursor: 'pointer',
                fontFamily: 'var(--font)', borderRadius: 6, flexShrink: 0,
              }}
            >
              Browse Campaigns →
            </button>
            <button
              onClick={() => setTab('operators')}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.2)', padding: '10px 22px',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font)', borderRadius: 6, flexShrink: 0,
              }}
            >
              Run a Campaign →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
