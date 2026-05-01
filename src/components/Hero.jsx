import { useState, useEffect, useRef } from 'react'

const stats = [
  { value: '7', label: 'Cameras Documented', sub: 'NM · Public records' },
  { value: '6', label: 'Campaigns Queued', sub: 'Pre-launch' },
  { value: '0', label: 'Actions Funded', sub: 'Be the first' },
  { value: 'XMR', label: 'Only Currency', sub: 'Anonymous by design' },
]

function MagneticButton({ children, onClick, primary }) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const btn = ref.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 80
    if (dist < maxDist) {
      const factor = (maxDist - dist) / maxDist
      const tx = dx * factor * 0.3
      const ty = dy * factor * 0.3
      btn.style.transform = `translate(${tx}px, ${ty}px)`
    }
  }

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)'
  }

  return (
    <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ display: 'inline-block' }}>
      <button
        ref={ref}
        onClick={onClick}
        style={{
          background: primary ? '#111' : 'transparent',
          color: primary ? '#fff' : 'var(--fg)',
          border: primary ? 'none' : '1px solid var(--border)',
          padding: '14px 32px',
          fontSize: 14,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          fontFamily: 'var(--font)',
          fontWeight: primary ? 500 : 400,
          borderRadius: 0,
          transition: 'transform 0.15s ease, background 0.15s',
        }}
        onMouseEnter={e => {
          if (!primary) e.currentTarget.style.borderColor = 'var(--fg)'
        }}
        onMouseLeave={e => {
          if (!primary) e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        {children}
      </button>
    </div>
  )
}

export default function Hero({ setTab }) {
  const sectionRef = useRef(null)
  const redactedRefs = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleMouseMove = (e) => {
      redactedRefs.current.forEach(el => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140) {
          el.classList.add('revealed')
        } else {
          el.classList.remove('revealed')
        }
      })
    }

    section.addEventListener('mousemove', handleMouseMove)
    return () => section.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const redactedWords = ['surveillance', 'everyone', 'fighting']

  return (
    <section
      ref={sectionRef}
      style={{
        paddingTop: 140,
        paddingBottom: 0,
        paddingLeft: 24,
        paddingRight: 24,
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Eyebrow */}
        <div style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          color: 'var(--red)',
          textTransform: 'uppercase',
          marginBottom: 32,
          fontWeight: 500,
        }}>
          Pre-Launch — Campaigns Open for Review
        </div>

        {/* Headline with redaction effect */}
        <h1 style={{
          fontSize: 'clamp(42px, 5vw, 72px)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          marginBottom: 32,
          color: 'var(--fg)',
        }}>
          The{' '}
          <span
            ref={el => redactedRefs.current[0] = el}
            className="redacted"
          >
            surveillance
          </span>
          {' '}state watches{' '}
          <span
            ref={el => redactedRefs.current[1] = el}
            className="redacted"
          >
            everyone
          </span>
          .{' '}We fund the people{' '}
          <span
            ref={el => redactedRefs.current[2] = el}
            className="redacted"
          >
            fighting
          </span>
          {' '}back.
        </h1>

        {/* Sub text */}
        <p style={{
          fontSize: 16,
          color: 'var(--gray)',
          maxWidth: 520,
          margin: '0 auto 48px',
          lineHeight: 1.75,
          fontWeight: 400,
        }}>
          Anonymous funding for surveillance accountability. No account. No identity. No way to stop it.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
          <MagneticButton primary onClick={() => setTab('campaigns')}>
            Fund a Campaign
          </MagneticButton>
          <MagneticButton onClick={() => setTab('operators')}>
            Run a Campaign
          </MagneticButton>
        </div>

        {/* Stat bar */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid var(--border)',
          marginLeft: -24,
          marginRight: -24,
        }}>
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '28px 20px',
                borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--fg)',
                marginBottom: 4,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg)', fontWeight: 500, marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray)' }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .redacted {
          position: relative;
          display: inline-block;
          cursor: default;
        }
        .redacted::after {
          content: '';
          position: absolute;
          inset: -1px -3px;
          background: #111;
          opacity: 1;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .redacted.revealed::after {
          opacity: 0;
        }
      `}</style>
    </section>
  )
}
