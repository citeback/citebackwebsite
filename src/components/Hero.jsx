import { useState, useEffect, useRef } from 'react'

const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window

const stats = [
  { value: '7', label: 'Campaigns queued at launch' },
  { value: '$23,500', label: 'Total campaign funding goals' },
  { value: '$0', label: 'Raised to date — wallets not yet live' },
  { value: '4/10', label: 'Launch prerequisites cleared' },
  { value: 'XMR + ZANO', label: 'No account or ID required to contribute.' },
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
    <section ref={sectionRef} className="hero-section">
      <div className="hero-top-rule" />
      <div className="hero-inner">

        {/* Dateline / eyebrow row */}
        <div className="hero-eyebrow">
          <div className="hero-eyebrow-label">Surveillance Resistance Crowdfunding · Pre-Launch</div>
          <div className="hero-eyebrow-date">Est. 2026 · United States</div>
        </div>

        <div className="hero-grid">

          {/* Left: headline + CTA */}
          <div>
            <h1 className="hero-headline">
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
              <p className="hero-hint">
                {isTouchDevice ? '↑ Tap the redacted words to reveal.' : '↑ Hover over the redacted words to reveal.'}
              </p>
            )}

            <p className="hero-desc">
              Anonymous crowdfunding for surveillance lawsuits, FOIA requests, and ordinance campaigns — funded with Monero (XMR) or Zano, privacy cryptocurrencies that leave no on-chain link between sender and recipient. Contributors need no account and no ID — your contribution is private at the protocol level. Operators who run campaigns create a free account to ensure accountability.
            </p>

            <div className="hero-cta-row">
              <button onClick={() => setTab('campaigns')} className="hero-btn-primary">
                See Campaigns
              </button>
              <button onClick={() => setTab('operators')} className="hero-btn-secondary">
                Run a Campaign
              </button>
            </div>

            <p className="hero-trust-line">
              Pre-launch — no wallets are active yet. 4 of 10 prerequisites cleared. Wallets activate only when every prerequisite is publicly verified. At launch, the wallet architecture is published and independently verifiable. All campaign wallets are operator-held — balance publicly verifiable via view keys.
            </p>
          </div>

          <div className="hero-sidebar">
            <div className="hero-amendment-callout">
              <div className="hero-amendment-label">Fourth Amendment</div>
              <p className="hero-amendment-text">
                &ldquo;The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated&hellip;&rdquo;
              </p>
            </div>
            <div className="hero-stats-block">
              <div className="hero-stats-label">Platform Stats</div>
              {stats.map((s, i) => (
                <div key={i} className="hero-stat-row">
                  <span className="hero-stat-label">{s.label}</span>
                  <span className="hero-stat-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hero-bottom-rule" />

      {/* redacted, hero-grid, hero-sidebar CSS is in App.css */}
    </section>
  )
}
