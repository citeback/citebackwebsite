import { CheckCircle, Circle, Clock } from 'lucide-react'

const milestones = [
  { done: true,    label: 'Governance framework published' },
  { done: true,    label: 'Surveillance camera database live (92,000+ cameras)' },
  { done: true,    label: 'Expert directory launched — applications open for attorneys, FOIA specialists, and technical contributors' },
  { done: true,    label: 'Campaign proposals published publicly (GitHub repo is public)' },
  { done: false,   label: 'Wyoming DAO LLC incorporated' },
  { done: false,   label: 'FinCEN MSB compliance opinion obtained from attorney' },
  { done: false,   label: 'TEE wallets live — 3 nodes, 2-of-3 threshold signatures' },
  { done: false,   label: 'TEE remote attestation published and verifiable' },
  { done: false,   label: 'TEE automated wallet-level OFAC screening at disbursement (operator onboarding uses separate manual pre-screening with identity verification)' },
  { done: false,   label: 'First campaign wallet activated' },
]

const done = milestones.filter(m => m.done).length
const total = milestones.length
const pct = Math.round((done / total) * 100)

export default function LaunchTracker() {
  return (
    <div className="launch-tracker" style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 0,
      padding: '28px 32px',
      maxWidth: 640,
      margin: '0 auto',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Launch Progress</p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>We go live when every prerequisite is met — not before.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{pct}%</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{done}/{total} complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4, background: 'var(--border)',
        borderRadius: 0, marginBottom: 24, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'var(--red)',
          borderRadius: 0, transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Milestone list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {milestones.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {m.done
              ? <CheckCircle size={16} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 1 }} />
              : <Circle size={16} style={{ color: 'var(--border)', flexShrink: 0, marginTop: 1 }} />}
            <span style={{
              fontSize: 13, lineHeight: 1.5,
              color: m.done ? 'var(--text)' : 'var(--muted)',
              textDecoration: m.done ? 'none' : 'none',
            }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)',
        fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Clock size={12} />
        No wallet addresses will be published until all 10 prerequisites are met and publicly verifiable. No address means nowhere to send.
      </div>
    </div>
  )
}
