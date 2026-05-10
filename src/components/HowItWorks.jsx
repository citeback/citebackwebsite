import { useState, useEffect, useRef } from 'react'

const contributorSteps = [
  {
    title: 'Browse Campaigns',
    desc: 'Find a fight worth funding — FOIA lawsuits, ordinance campaigns, vendor accountability, or surveillance mapping bounties.',
  },
  {
    title: 'Send Monero or Zano',
    desc: 'No account. No contributor identity collected. Monero (XMR) and Zano are privacy cryptocurrencies — there is no on-chain link between your wallet and the campaign address, even to us.\n\nSend directly to the operator\'s own wallet — Citeback never holds your funds. The platform monitors the balance via a read-only view key. If an operator withdraws before the campaign goal is met, they are permanently banned.',
  },
  {
    title: 'Track It Publicly',
    desc: 'Your contribution stays private — Monero and Zano provide cryptographic privacy with no on-chain link between sender and recipient. What is public: every milestone, every verified disbursement, every outcome. The accountability record is permanent.',
  },
  {
    title: 'Watch It Win',
    desc: 'Operators submit verified proof of outcomes — court filings, ordinance text, database takedowns. Every campaign closes with a public receipt.',
  },
]

const operatorSteps = [
  {
    title: 'Propose a Campaign',
    desc: 'Identify a specific government agency, surveillance vendor, or jurisdiction and submit a concrete cost breakdown. A real FOIA target, a vendor contract to challenge, a city ordinance to pass — not a vague cause. Anyone can propose. Once governance is live, the community votes.',
  },
  {
    title: 'Get Funded',
    desc: 'Contributors fund anonymously using Monero (XMR) or Zano — privacy cryptocurrencies with no traceable on-chain transaction history. No contributor identity collected. Funds go directly to the operator\'s own wallet — Citeback never holds or touches them. The balance is publicly verifiable via a view key the operator publishes.',
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
  const [track, setTrack] = useState('contributor')

  const steps = track === 'contributor' ? contributorSteps : operatorSteps

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
    <section ref={sectionRef} className="hiw-section">
      {/* Track toggle */}
      <div className="hiw-track-toggle">
        <button
          onClick={() => { setTrack('contributor'); setActiveSteps([]) }}
          className={`hiw-track-btn ${track === 'contributor' ? 'hiw-track-btn--active' : 'hiw-track-btn--inactive'}`}
        >
          I want to fund a campaign
        </button>
        <button
          onClick={() => { setTrack('operator'); setActiveSteps([]) }}
          className={`hiw-track-btn ${track === 'operator' ? 'hiw-track-btn--active' : 'hiw-track-btn--inactive'}`}
        >
          I want to run a campaign
        </button>
      </div>

      <div className="hiw-layout">
        {/* Left sticky label */}
        <div className="hiw-sidebar">
          <div className="hiw-sidebar-label">How It Works</div>
          <p className="hiw-sidebar-text">Simple. Private. Accountable.</p>
        </div>

        {/* Right timeline */}
        <div className="hiw-timeline">
          <div ref={lineTrackRef} className="hiw-line-track">
            <div ref={lineRef} className="hiw-line-fill" />
          </div>

          <div className="hiw-steps">
            {steps.map((s, i) => {
              const active = activeSteps.includes(i)
              return (
                <div
                  key={i}
                  ref={el => stepRefs.current[i] = el}
                  className={`hiw-step ${active ? 'hiw-step--active' : 'hiw-step--inactive'}`}
                >
                  <div className={`hiw-dot ${active ? 'hiw-dot--active' : 'hiw-dot--inactive'}`} />
                  <div className={`hiw-step-num ${active ? 'hiw-step-num--active' : 'hiw-step-num--inactive'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="hiw-step-title">{s.title}</h3>
                  <p className="hiw-step-desc">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {setTab && (
        <div className="hiw-cta-row">
          <button onClick={() => setTab('campaigns')} className="hiw-cta-primary">
            {track === 'contributor' ? 'Browse Campaigns →' : 'Apply to Run a Campaign →'}
          </button>
          <button onClick={() => setTab(track === 'contributor' ? 'trust' : 'operators')} className="hiw-cta-secondary">
            {track === 'contributor' ? 'Full Trust FAQ →' : 'Operator Requirements →'}
          </button>
        </div>
      )}
    </section>
  )
}
