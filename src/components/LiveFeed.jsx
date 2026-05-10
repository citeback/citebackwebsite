import { useState, useEffect, useRef } from 'react'

const ALL_EVENTS = [
  {
    category: 'CAMPAIGN',
    text: 'Cambridge MA terminated Flock Safety contract after company installed unauthorized cameras — city called it a material breach of trust — Dec 2025',
  },
  {
    category: 'CAMERA',
    text: '95,045 ALPR cameras now documented in the surveillance map',
  },
  {
    category: 'SURVEILLANCE',
    text: 'Flock Safety deployed 90,000+ cameras across the US as of mid-2025',
  },
  {
    category: 'SURVEILLANCE',
    text: 'Bernalillo County deputy caught misusing ALPR data — written reprimand only',
  },
  {
    category: 'GOVERNANCE',
    text: 'Governance specification published — community ratification required before mainnet',
  },
  {
    category: 'SURVEILLANCE',
    text: 'Out-of-state agencies accessing NM plate data for immigration enforcement',
  },
  {
    category: 'SURVEILLANCE',
    text: 'Albuquerque PD retains plate scans for 365 days — 12× longer than county policy',
  },
  {
    category: 'CAMPAIGN',
    text: 'New campaign proposed: Las Cruces FOIA for Flock Safety contract details',
  },
  {
    category: 'SURVEILLANCE',
    text: "Flock Safety developing 'Nova' — combining plate data with breach databases",
  },
  {
    category: 'SURVEILLANCE',
    text: '8 Washington state agencies shared ALPR data directly with US Border Patrol',
  },
  {
    category: 'GOVERNANCE',
    text: 'Wallet architecture spec published — direct operator custody model, view key monitoring, no platform key holding',
  },
  {
    category: 'SURVEILLANCE',
    text: "NM Senator Wirth: 'You literally can be tracked based on your plate, wherever you've been'",
  },
]

const CATEGORY_COLORS = {
  SURVEILLANCE: '#c0392b',
  GOVERNANCE:   '#2980b9',
  CAMERA:       '#8e44ad',
  CAMPAIGN:     '#27ae60',
  MILESTONE:    '#d35400',
}

function formatAge(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

let eventCursor = 4 // start after the 4 pre-loaded items

export default function LiveFeed({ setTab }) {
  const now = Date.now()

  const [items, setItems] = useState(() =>
    ALL_EVENTS.slice(0, 4).map((ev, i) => ({
      ...ev,
      id: i,
      addedAt: now - (4 - i) * 30_000,
      isNew: false,
    }))
  )

  const [lastUpdate, setLastUpdate] = useState(now)
  const [tick, setTick] = useState(0)
  const idRef = useRef(ALL_EVENTS.length)

  // Tick every second to refresh relative timestamps
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // Add a new event every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const ev = ALL_EVENTS[eventCursor % ALL_EVENTS.length]
      eventCursor++
      const newItem = {
        ...ev,
        id: idRef.current++,
        addedAt: Date.now(),
        isNew: true,
      }
      setItems(prev => {
        const updated = [newItem, ...prev].slice(0, 6)
        return updated
      })
      setLastUpdate(Date.now())

      setTimeout(() => {
        setItems(prev =>
          prev.map(it => (it.id === newItem.id ? { ...it, isNew: false } : it))
        )
      }, 700)
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="lf-section">
      <div className="lf-inner">

        {/* Section header */}
        <div className="lf-header">
          {/* LIVE label + pulsing dot */}
          <div className="lf-live-indicator">
            <span className="live-dot" />
            <span className="lf-live-label">Live</span>
          </div>

          {/* Separator */}
          <div className="lf-sep" />

          {/* Last update time */}
          <span className="lf-last-update">
            Updated {formatAge(Date.now() - lastUpdate)}
          </span>
        </div>

        {/* Feed */}
        <div style={{ paddingBottom: setTab ? 0 : 8 }}>
          {items.map((item) => (
            <div
              key={item.id}
              className={item.isNew ? 'feed-item feed-item--new' : 'feed-item'}
            >
              {/* Timestamp */}
              <span className="lf-timestamp">
                {formatAge(Date.now() - item.addedAt)}
              </span>

              {/* Category tag — color is dynamic */}
              <span
                className="lf-category-tag"
                style={{
                  color: CATEGORY_COLORS[item.category] || 'var(--gray)',
                  border: `1px solid ${CATEGORY_COLORS[item.category] || 'var(--border)'}`,
                }}
              >
                {item.category}
              </span>

              {/* Event text */}
              <span className="lf-text">{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA after feed */}
        {setTab && (
          <div className="lf-cta-row">
            <p className="lf-cta-text">
              Every item above is a target. Fund the people fighting back.
            </p>
            <div className="lf-cta-btns">
              <button onClick={() => setTab('campaigns')} className="lf-btn-primary">
                Fund a Campaign →
              </button>
              <button onClick={() => setTab('feed')} className="lf-btn-secondary">
                Full Intelligence Feed →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
