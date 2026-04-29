import { Eye, Coins, Hammer, Megaphone } from 'lucide-react'

const steps = [
  { icon: <Eye size={24} />, title: 'Map It', desc: 'Community members submit surveillance camera locations. No account required. Just coordinates and a photo.' },
  { icon: <Megaphone size={24} />, title: 'Propose & Vote', desc: 'Anyone can propose a campaign — billboard, lawsuit, FOIA request. The community votes to approve. No gatekeepers.' },
  { icon: <Coins size={24} />, title: 'Fund Anonymously', desc: 'Each campaign gets a dedicated Monero wallet created inside a TEE secure enclave. No human holds the keys — not even the founder. Donate privately.' },
  { icon: <Hammer size={24} />, title: 'Execute with Proof', desc: 'Operators execute the action and submit verified proof. A 48-hour challenge window opens. Proof cleared → funds release automatically from the TEE.' },
]

export default function HowItWorks() {
  return (
    <section style={{
      padding: '80px 24px',
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>How It Works</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 480, margin: '0 auto', fontSize: 15 }}>
            Decentralized. Anonymous. Fully legal. The Fourth Amendment enforced by the people.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 14, padding: 28,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', marginBottom: 16,
              }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Step {i + 1}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
