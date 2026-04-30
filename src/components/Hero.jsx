import { ArrowRight, Eye, Scale, Landmark, AlertTriangle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function CountUp({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const duration = 1800
    const steps = 50
    const step = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])

  return <>{val.toLocaleString()}{suffix}</>
}

export default function Hero({ setTab }) {
  return (
    <section style={{
      padding: '80px 24px 72px',
      textAlign: 'center',
      background: 'var(--hero-bg)',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>

        {/* Beta banner */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.3)',
          borderRadius: 100, padding: '5px 14px', marginBottom: 28,
          fontSize: 12, fontWeight: 600, color: '#f39c12',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          <AlertTriangle size={12} /> Pre-Launch — Campaigns open for review. Wallets activating soon.
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 78px)',
          fontWeight: 900,
          lineHeight: 1.04,
          letterSpacing: '-2.5px',
          marginBottom: 24,
        }}>
          They Watch You.<br />
          <span style={{
            color: 'var(--accent)',
            backgroundImage: 'linear-gradient(135deg, #e63946, #ff6b6b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>We Watch Back.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 19px)',
          color: 'var(--muted)',
          maxWidth: 540,
          margin: '0 auto 12px',
          lineHeight: 1.75,
        }}>
          Decentralized funding for legal resistance to mass surveillance.
          Billboards. Lawsuits. FOIA campaigns.
        </p>

        <p style={{
          fontSize: 13, color: 'var(--muted)', opacity: 0.65,
          maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.6,
        }}>
          Powered by Monero. No accounts. No logs. No tracking. Ever.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('campaigns')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', border: 'none', color: '#fff',
            padding: '14px 30px', borderRadius: 10, fontWeight: 700, fontSize: 16,
            boxShadow: '0 0 24px rgba(230,57,70,0.3)',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 36px rgba(230,57,70,0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(230,57,70,0.3)'}
          >
            Fund a Campaign <ArrowRight size={18} />
          </button>
          <button onClick={() => setTab('map')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)',
            padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 16,
            backdropFilter: 'blur(8px)',
          }}>
            View Camera Map
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 0, justifyContent: 'center', marginTop: 64,
          flexWrap: 'wrap',
          paddingTop: 48, borderTop: '1px solid var(--border)',
        }}>
          {[
            { icon: <Eye size={18} />, target: 7, suffix: '', label: 'Cameras Documented', sub: 'NM · Public records verified' },
            { icon: <Landmark size={18} />, target: 6, suffix: '', label: 'Campaigns Queued', sub: 'Pre-launch · Wallets pending' },
            { icon: <Scale size={18} />, target: 0, suffix: '', label: 'Actions Funded', sub: 'Be the first' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, minWidth: 160, textAlign: 'center', padding: '0 24px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ color: 'var(--accent)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>
                <CountUp target={s.target} suffix={s.suffix} />
              </div>
              <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, marginTop: 6, marginBottom: 2 }}>{s.label}</div>
              <div style={{ color: 'var(--muted)', fontSize: 11 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
