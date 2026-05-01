import { useState, useEffect, useRef } from 'react'

const steps = [
  {
    title: 'Propose a Campaign',
    desc: 'Submit a FOIA lawsuit, surveillance ordinance challenge, vendor accountability campaign, or counter-database project. Anyone can propose. The community votes on what gets funded.',
  },
  {
    title: 'Fund Anonymously',
    desc: 'Send Monero to a campaign wallet. No account. No identity. No trail. The wallet is TEE-secured — no human holds the keys, including us.',
  },
  {
    title: 'Track It Publicly',
    desc: 'Every transaction is on-chain. Every expenditure verified before release. Every outcome documented. The record is permanent and public.',
  },
  {
    title: 'Win on Record',
    desc: 'Operators submit verified proof of outcomes — court filings, ordinance text, database takedowns. The campaign closes with receipts.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)
  const lineTrackRef = useRef(null)
  const lineRef = useRef(null)
  const stepRefs = useRef([])
  const [activeSteps, setActiveSteps] = useState([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // IntersectionObserver for step activation
    const observers = stepRefs.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSteps(prev => prev.includes(i) ? prev : [...prev, i])
          }
        },
        { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' }
      )
      obs.observe(el)
      return obs
    })

    // Scroll listener for timeline line fill
    const updateLineFill = () => {
      const track = lineTrackRef.current
      const line = lineRef.current
      if (!track || !line) return
      const rect = track.getBoundingClientRect()
      const viewH = window.innerHeight
      const start = rect.top
      const end = rect.bottom
      // progress 0 when top of track hits bottom of viewport, 1 when bottom hits top
      const progress = Math.min(1, Math.max(0, (viewH - start) / (viewH - start + end - viewH + rect.height)))
      line.style.transform = `scaleY(${Math.min(1, Math.max(0, (viewH - start) / rect.height))})`
    }

    window.addEventListener('scroll', updateLineFill, { passive: true })
    updateLineFill()

    return () => {
      observers.forEach(obs => obs && obs.disconnect())
      window.removeEventListener('scroll', updateLineFill)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '100px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
      }}
    >
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: '0 80px',
        alignItems: 'start',
      }}>

        {/* Left sticky label */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div style={{
            fontSize: 11,
            letterSpacing: '0.16em',
            color: 'var(--red)',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: 12,
          }}>
            How It Works
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.7 }}>
            Four steps from idea to funded action.
          </p>
        </div>

        {/* Right timeline */}
        <div style={{ position: 'relative' }}>

          {/* Vertical line track */}
          <div
            ref={lineTrackRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 12,
              bottom: 12,
              width: 1,
              background: 'var(--border)',
              overflow: 'hidden',
            }}
          >
            {/* Red fill line */}
            <div
              ref={lineRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'var(--red)',
                transform: 'scaleY(0)',
                transformOrigin: 'top',
                transition: 'transform 0.1s linear',
              }}
            />
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            {steps.map((s, i) => {
              const active = activeSteps.includes(i)
              return (
                <div
                  key={i}
                  ref={el => stepRefs.current[i] = el}
                  style={{
                    paddingLeft: 40,
                    position: 'relative',
                    transition: 'opacity 0.4s ease',
                    opacity: active ? 1 : 0.4,
                  }}
                >
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: -4,
                    top: 12,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: active ? 'var(--red)' : 'var(--border)',
                    border: `2px solid ${active ? 'var(--red)' : 'var(--gray)'}`,
                    transition: 'background 0.3s, border-color 0.3s',
                    zIndex: 1,
                  }} />

                  {/* Step number */}
                  <div style={{
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: active ? 'var(--red)' : 'var(--gray)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: 8,
                    transition: 'color 0.3s',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    marginBottom: 12,
                    color: 'var(--fg)',
                  }}>
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 15,
                    color: 'var(--gray)',
                    lineHeight: 1.75,
                    maxWidth: 520,
                  }}>
                    {s.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          section > div {
            grid-template-columns: 1fr !important;
          }
          section > div > div:first-child {
            position: static !important;
            margin-bottom: 40px;
          }
        }
      `}</style>
    </section>
  )
}
