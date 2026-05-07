import { useState, useEffect, useRef } from 'react'

const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window

const stats = [
  { value: '7', label: 'Campaigns queued at launch' },
  { value: '$14,050', label: 'Total campaign funding goals' },
  { value: '$0', label: 'Raised to date — wallets not yet live' },
  { value: '4/16', label: 'Launch prerequisites cleared' },
  { value: 'XMR + ZANO', label: 'No account. No ID. No credit card.' },
]

export default function Hero({ setTab }) {
  const sectionRef = useRef(null)
  const redactedRefs = useRef([])
  const [hintVisible, setHintVisible] = useState(true)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (isTouchDevice) {
      const handlers = []
      redactedRefs.current.forEach((el) => {
        if (!el) return
        const handler = (e) => {
          e.preventDefault()
          el.classList.toggle('revealed')
          setHintVisible(false)
        }
        el.addEventListener('touchstart', handler, { passive: false })
        handlers.push({ el, handler })
      })
      return () => handlers.forEach(({ el, handler }) => el.removeEventListener('touchstart', handler))
    } else {
      const handleMouseMove = (e) => {
        redactedRefs.current.forEach(el => {
          if (!el) return
          const rect = el.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = e.clientX - cx
          const dy = e.clientY - cy
          // Check if cursor overlaps or is near the element bounds
          const rect2 = el.getBoundingClientRect()
          const inBox = e.clientX >= rect2.left - 60 && e.clientX <= rect2.right + 60
            && e.clientY >= rect2.top - 40 && e.clientY <= rect2.bottom + 40
          if (inBox) {
            el.classList.add('revealed')
          } else {
            el.classList.remove('revealed')
          }
        })
      }
      section.addEventListener('mousemove', handleMouseMove)
      return () => section.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="hero-section"
      style={{
        paddingTop: 100,
        paddingBottom: 0,
        background: 'var(--bg)',
        position: 'relative',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      {/* Top rule */}
      <div style={{ borderTop: '3px solid var(--fg)', margin: '0 24px' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Dateline / eyebrow row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          borderBottom: '1px solid var(--border)',
          marginBottom: 40,
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <div style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'var(--red)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Surveillance Resistance Crowdfunding · Pre-Launch
          </div>
          <div style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--gray)',
            textTransform: 'uppercase',
          }}>
            Est. 2026 · New Mexico · United States
          </div>
        </div>

        {/* Main editorial layout: headline left, side column right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: '48px 64px',
          alignItems: 'start',
          minWidth: 0,
        }} className="hero-grid">

          {/* Left: headline + CTA */}
          <div>
            <h1 style={{
              fontSize: 'clamp(32px, 5.5vw, 76px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--fg)',
              marginBottom: 32,
            }}>
              The{' '}
              <span
                ref={el => redactedRefs.current[0] = el}
                className="redacted redacted-1"
                role="mark"
                aria-label="surveillance (redacted — hover or tap to reveal)"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.currentTarget.classList.toggle('revealed'); setHintVisible(false) } }}
              >
                surveillance
              </span>
              {' '}state<br />
              watches{' '}
              <span
                ref={el => redactedRefs.current[1] = el}
                className="redacted redacted-2"
                role="mark"
                aria-label="everyone (redacted — hover or tap to reveal)"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.currentTarget.classList.toggle('revealed'); setHintVisible(false) } }}
              >
                everyone
              </span>
              .<br />
              We fund the people{' '}
              <span
                ref={el => redactedRefs.current[2] = el}
                className="redacted redacted-3"
                role="mark"
                aria-label="fighting (redacted — hover or tap to reveal)"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.currentTarget.classList.toggle('revealed'); setHintVisible(false) } }}
              >
                fighting
              </span>
              {' '}back.
            </h1>

            {hintVisible && (
              <p style={{
                fontSize: 11,
                color: 'var(--gray)',
                letterSpacing: '0.04em',
                opacity: 0.6,
                margin: '-8px 0 16px',
              }}>
                {isTouchDevice ? '↑ Tap the redacted words to reveal.' : '↑ Hover over the redacted words to reveal.'}
              </p>
            )}

            <p style={{
              fontSize: 17,
              color: 'var(--gray)',
              maxWidth: 520,
              lineHeight: 1.7,
              fontWeight: 400,
              marginBottom: 40,
            }}>
              Anonymous crowdfunding for surveillance lawsuits, FOIA requests, and ordinance campaigns — funded with Monero (XMR) or Zano, privacy cryptocurrencies that leave no on-chain link between sender and recipient. No account. No contributor identity collected. Your contribution is private at the protocol level.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setTab('campaigns')}
                style={{
                  background: 'var(--fg)',
                  color: 'var(--bg)',
                  border: 'none',
                  padding: '13px 28px',
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  transition: 'opacity 0.15s',
                  minHeight: 44,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                See Campaigns
              </button>
              <button
                onClick={() => setTab('operators')}
                style={{
                  background: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  padding: '13px 28px',
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  transition: 'border-color 0.15s',
                  minHeight: 44,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                Run a Campaign
              </button>
            </div>

            {/* Trust micro-line */}
            <p style={{
              marginTop: 16,
              fontSize: 12,
              color: 'var(--gray)',
              letterSpacing: '0.03em',
              opacity: 0.7,
            }}>
              Pre-launch — no wallets are active yet. 4 of 16 prerequisites cleared. Wallets activate only when every prerequisite is publicly verified. At launch, wallet architecture is published and independently verifiable — no human can access keys by architectural design.
            </p>
          </div>

          {/* Right: sidebar column */}
          <div style={{
            borderLeft: '1px solid var(--border)',
            paddingLeft: 32,
          }} className="hero-sidebar">
            {/* Amendment callout */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--red)',
                fontWeight: 600,
                marginBottom: 10,
              }}>
                Fourth Amendment
              </div>
              <p style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--gray)',
                fontStyle: 'italic',
              }}>
                "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated…"
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <div style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--gray)',
                fontWeight: 600,
                marginBottom: 16,
              }}>
                Platform Stats
              </div>
              {stats.map((s, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '8px 0',
                  borderBottom: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--gray)' }}>{s.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div style={{ borderBottom: '1px solid var(--border)', marginTop: 56 }} />

      <style>{`
        .redacted {
          position: relative;
          display: inline;
          cursor: default;
        }
        .redacted:focus-visible {
          outline: 2px solid var(--accent, #dc2626);
          outline-offset: 4px;
          border-radius: 2px;
        }
        @keyframes redactedReveal {
          0%   { opacity: 1; }
          15%  { opacity: 0.1; }
          30%  { opacity: 1; }
          50%  { opacity: 0.1; }
          70%  { opacity: 1; }
          85%  { opacity: 0.1; }
          100% { opacity: 0; }
        }
        .redacted::before {
          content: '';
          position: absolute;
          top: -3px;
          bottom: -3px;
          left: -4px;
          right: -4px;
          background: var(--fg, #1a1a1a);
          opacity: 1;
          transition: opacity 0.2s ease;
          pointer-events: none;
          z-index: 2;
          animation: redactedReveal 9s ease-in-out 1 forwards;
        }
        /* Staggered reveal — each word blinks independently at different times */
        .redacted-1::before { animation-delay: 0s; }
        .redacted-2::before { animation-delay: 2.5s; }
        .redacted-3::before { animation-delay: 5s; }
        .redacted.revealed::before {
          animation: none;
          opacity: 0;
        }
        @media (max-width: 768px) {
          .redacted {
            display: inline-block;
          }
          .redacted::before {
            top: 0;
            bottom: 0;
            left: -2px;
            right: -2px;
          }
        }

        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .hero-sidebar {
            border-left: none !important;
            border-top: 1px solid var(--border) !important;
            padding-left: 0 !important;
            padding-top: 24px !important;
          }
          .hero-section {
            overflow-x: hidden !important;
          }
        }
      `}</style>
    </section>
  )
}
