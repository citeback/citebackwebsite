import { useState, useEffect, useRef } from 'react'

const ALL_EVENTS = [
  {
    category: 'CAMPAIGN',
    text: 'Cambridge MA terminated Flock Safety contract after company installed unauthorized cameras — city called it a material breach of trust — Dec 2025',
  },
  {
    category: 'CAMERA',
    text: '92,848th camera added to the database',
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
    text: 'TEE architecture review completed — 3 independent provider comparison',
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
      addedAt: now - (4 - i) * 30_000, // space them 30s apart in the past
      isNew: false,
    }))
  )

  const [lastUpdate, setLastUpdate] = useState(now)
  const [tick, setTick] = useState(0)
  const idRef = useRef(ALL_EVENTS.length) // unique id counter

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
        // Clear isNew flag after animation (600ms)
        return updated
      })
      setLastUpdate(Date.now())

      // Remove isNew after animation completes
      setTimeout(() => {
        setItems(prev =>
          prev.map(it => (it.id === newItem.id ? { ...it, isNew: false } : it))
        )
      }, 700)
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        background: 'var(--bg)',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Section header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '32px 0 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* LIVE label + pulsing dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="live-dot" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: 'var(--red)',
                textTransform: 'uppercase',
              }}
            >
              Live
            </span>
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 14, background: 'var(--border)' }} />

          {/* Last update time */}
          <span style={{ fontSize: 11, color: 'var(--gray)', letterSpacing: '0.04em' }}>
            Updated {formatAge(Date.now() - lastUpdate)}
          </span>
        </div>

        {/* Feed */}
        <div style={{ paddingBottom: setTab ? 0 : 8 }}>
          {items.map((item) => (
            <div
              key={item.id}
              className={item.isNew ? 'feed-item feed-item--new' : 'feed-item'}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {/* Timestamp */}
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--gray)',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                  minWidth: 64,
                  flexShrink: 0,
                }}
              >
                {formatAge(Date.now() - item.addedAt)}
              </span>

              {/* Category tag */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: CATEGORY_COLORS[item.category] || 'var(--gray)',
                  border: `1px solid ${CATEGORY_COLORS[item.category] || 'var(--border)'}`,
                  padding: '2px 6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  opacity: 0.85,
                }}
              >
                {item.category}
              </span>

              {/* Event text */}
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--fg)',
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA after feed */}
        {setTab && (
          <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--gray)', margin: 0, lineHeight: 1.6 }}>
              Every item above is a target. Fund the people fighting back.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
              <button
                onClick={() => setTab('campaigns')}
                style={{
                  background: 'var(--fg)', color: 'var(--bg)', border: 'none',
                  padding: '10px 22px', fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  whiteSpace: 'nowrap',
                }}
              >
                Fund a Campaign →
              </button>
              <button
                onClick={() => setTab('feed')}
                style={{
                  background: 'transparent', color: 'var(--gray)',
                  border: '1px solid var(--border)', padding: '10px 22px',
                  fontSize: 12, fontWeight: 500, letterSpacing: '0.05em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'var(--font)', whiteSpace: 'nowrap',
                }}
              >
                Full Intelligence Feed →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--red, #c0392b);
          animation: pulse-dot 1.8s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }

        .feed-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
        }

        .feed-item--new {
          animation: slide-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
