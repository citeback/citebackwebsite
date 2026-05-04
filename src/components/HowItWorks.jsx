import { useState, useEffect, useRef } from 'react'

const donorSteps = [
  {
    title: 'Browse Campaigns',
    desc: 'Find a fight worth funding — FOIA lawsuits, ordinance campaigns, vendor accountability, or surveillance mapping bounties.',
  },
  {
    title: 'Send XMR or ZANO',
    desc: 'No account. No identity. No trail. Send directly to the campaign wallet. The operator manages the campaign — the TEE holds the funds. No human has the keys, including the operator.',
  },
  {
    title: 'Track It Publicly',
    desc: 'Your donation stays private — XMR and ZANO leave no trace. What is public: every milestone, every verified disbursement, every outcome. The accountability record is permanent.',
  },
  {
    title: 'Watch It Win',
    desc: 'Operators submit verified proof of outcomes — court filings, ordinance text, database takedowns. Every campaign closes with a public receipt.',
  },
]

const operatorSteps = [
  {
    title: 'Propose a Campaign',
    desc: 'Name a specific target. Submit a cost breakdown. A real agency, vendor, or jurisdiction — not a vague cause. Anyone can propose. Once governance is live, the community votes. During pre-launch, proposals are reviewed by the operator team.',
  },
  {
    title: 'Get Funded',
    desc: 'Donors fund anonymously in XMR or ZANO. No donor identity. No paper trail. The TEE holds funds in escrow until milestones are verified — you can manage the campaign, not the money.',
  },
  {
    title: 'Execute and Document',
    desc: 'Submit milestone proof as work happens — court filing numbers, signed retainers, GPS-tagged photos. Funds release after a 48-hour community review window.',
  },
  {
    title: 'Close with Receipts',
    desc: 'Court filings, ordinance text, database takedowns. Every campaign closes with a permanent, public outcome record.',
  },
]

export default function HowItWorks({ setTab }) {
  const sectionRef = useRef(null)
  const lineTrackRef = useRef(null)
  const lineRef = useRef(null)
  const stepRefs = useRef([])
  const [activeSteps, setActiveSteps] = useState([])
  const [track, setTrack] = useState('donor')

  const steps = track === 'donor' ? donorSteps : operatorSteps

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
      {/* Track toggle */}
      <div style={{ maxWidth: 1100, margin: '0 auto 48px', display: 'flex', gap: 8 }}>
        <button
          onClick={() => { setTrack('donor'); setActiveSteps([]) }}
          style={{
            padding: '9px 20px',
            borderRadius: 999,
            border: '1px solid',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font)',
            background: track === 'donor' ? 'var(--fg)' : 'transparent',
            color: track === 'donor' ? 'var(--bg)' : 'var(--gray)',
            borderColor: track === 'donor' ? 'var(--fg)' : 'var(--border)',
            transition: 'all 0.15s',
          }}
        >
          I want to fund a campaign
        </button>
        <button
          onClick={() => { setTrack('operator'); setActiveSteps([]) }}
          style={{
            padding: '9px 20px',
            borderRadius: 999,
            border: '1px solid',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font)',
            background: track === 'operator' ? 'var(--fg)' : 'transparent',
            color: track === 'operator' ? 'var(--bg)' : 'var(--gray)',
            borderColor: track === 'operator' ? 'var(--fg)' : 'var(--border)',
            transition: 'all 0.15s',
          }}
        >
          I want to run a campaign
        </button>
      </div>

      <div className="hiw-grid" style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: '0 80px',
        alignItems: 'start',
      }}>

        {/* Left sticky label */}
        <div className="hiw-sidebar" style={{ position: 'sticky', top: 100 }}>
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
            Simple. Private. Accountable.
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

      {setTab && (
        <div style={{ maxWidth: 1100, margin: '48px auto 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setTab('campaigns')}
            style={{
              background: 'var(--fg)', color: 'var(--bg)', border: 'none',
              padding: '12px 28px', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            {track === 'donor' ? 'Browse Campaigns →' : 'Apply to Run a Campaign →'}
          </button>
          <button
            onClick={() => setTab(track === 'donor' ? 'trust' : 'operators')}
            style={{
              background: 'transparent', color: 'var(--fg)',
              border: '1px solid var(--border)', padding: '12px 28px',
              fontSize: 13, fontWeight: 500, letterSpacing: '0.05em',
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            {track === 'donor' ? 'Full Trust FAQ →' : 'Operator Requirements →'}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .hiw-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .hiw-sidebar {
            position: static !important;
            margin-bottom: 32px;
          }
        }
      `}</style>
    </section>
  )
}
