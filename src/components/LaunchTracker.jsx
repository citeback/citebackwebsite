import { CheckCircle, Circle, Clock } from 'lucide-react'

const milestones = [
  { done: true,    label: 'Governance specification published (v0.7 Active)' },
  { done: true,    label: 'Surveillance camera database operational (92,000+ cameras)' },
  { done: true,    label: 'Expert directory seeded with attorneys and operators' },
  { done: true,    label: 'Campaign proposals open for community review' },
  { done: false,   label: 'Wyoming DAO LLC incorporated' },
  { done: false,   label: 'FinCEN/MSB attorney written opinion obtained' },
  { done: false,   label: 'TEE deployment live (3 instances, 2-of-3 threshold signatures)' },
  { done: false,   label: 'TEE attestation published and verifiable' },
  { done: false,   label: 'OFAC screening API integrated' },
  { done: false,   label: 'First campaign wallet activated' },
]

const done = milestones.filter(m => m.done).length
const total = milestones.length
const pct = Math.round((done / total) * 100)

export default function LaunchTracker() {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '28px 32px',
      maxWidth: 640,
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Launch Progress</p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>We go live when all prerequisites are met — not before.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{pct}%</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{done}/{total} complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, background: 'rgba(255,255,255,0.08)',
        borderRadius: 3, marginBottom: 24, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--accent), #6ee7b7)',
          borderRadius: 3, transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Milestone list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {milestones.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {m.done
              ? <CheckCircle size={16} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 1 }} />
              : <Circle size={16} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 1 }} />}
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
        No funds accepted until all 10 prerequisites are met and publicly verifiable.
      </div>
    </div>
  )
}
