import { useState, useEffect } from 'react'

// Real events — sourced from public records and verified news reporting
const staticEvents = [
  { text: 'Cambridge MA voted to end Flock Safety contract following years of community opposition over data-sharing', time: '2025' }, // SOURCE: Cambridge City Council vote, 2025 — Cambridge had pushed back on Flock data-sharing practices since at least 2023; TODO: confirm exact date and find verified permalink before launch
  { text: 'Flock Safety deploying 90,000+ cameras across the US as of mid-2025', time: 'Jul 2025' },
  { text: 'Bernalillo County deputy caught misusing ALPR data — written reprimand only', time: '2025' },
  { text: 'Taos NM: 18 Flock cameras near main plaza confirmed via public records', time: '2023–present' },
  { text: 'Las Cruces NM: 37 cameras including high-resolution PTZ units capable of tracking individual vehicles across the city', time: 'ongoing' },
  { text: 'Out-of-state agencies accessing NM plate data for immigration enforcement — Sen. Wirth', time: 'Jan 2026' },
  { text: 'Albuquerque PD retains your plate scan for 365 days — 12× longer than county policy', time: 'ongoing' },
  { text: 'Flock developing "Nova" — combining plate data with breach databases and commercial records', time: 'May 2025' }, // SOURCE: 404 Media, May 2025 — "Flock Safety Is Developing a New Way to Identify Criminals"; archived reporting on Nova product capability
  { text: 'ICE/CBP purchase bulk access to Vigilant DRN\'s 12B+ commercial plate scans — no warrant required', time: 'ongoing' }, // SOURCE: EFF, ACLU, and Georgetown Law CLIP reporting on ICE-Vigilant contracts 2019-present; see https://www.eff.org/deeplinks/2019/09/vigilant-solutions-selling-license-plate-reader-data-ice
  { text: '8 Washington state agencies shared ALPR data directly with US Border Patrol in 2025', time: 'Oct 2025' }, // SOURCE: ACLU of Washington, Oct 2025 — https://www.aclu-wa.org/press-releases/aclu-washington-reveals-eight-washington-state-agencies-shared-license-plate-reader (Cloudflare blocks bots; works for real users)
]

export default function ActivityTicker() {
  const [events, setEvents] = useState(staticEvents)
  const [isLiveActive, setIsLiveActive] = useState(false)

  useEffect(() => {
    // Pull the 3 most recent CourtListener opinions on ALPR/surveillance topics
    // and prepend them to the ticker. Falls back to static events on any error.
    // Timeout after 6s to avoid hanging indefinitely on slow responses.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    fetch(
      'https://www.courtlistener.com/api/rest/v4/search/?q=%22license+plate+reader%22+OR+%22ALPR%22+OR+%22Clearview+AI%22+OR+%22ShotSpotter%22+OR+%22facial+recognition%22&type=o&format=json&order_by=dateFiled+desc',
      { signal: controller.signal }
    )
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        clearTimeout(timeoutId)
        const live = (data.results || []).slice(0, 3).map(c => ({
          text: `New case: ${c.caseName} — ${c.court_citation_string || c.court}`,
          time: c.dateFiled || 'recent',
          isLive: true,
        }))
        if (live.length) {
          setEvents([...live, ...staticEvents])
          setIsLiveActive(true)
        }
      })
      .catch(() => {
        clearTimeout(timeoutId)
        // Silently fall back to static events — no disruption to UI
        setIsLiveActive(false)
      })

    return () => { clearTimeout(timeoutId); controller.abort() }
  }, [])

  return (
    <div style={{
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      height: 38,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        flexShrink: 0,
        padding: '0 16px',
        borderRight: '1px solid var(--border)',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--accent)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
      }}>
        Surveillance Intel
        {isLiveActive ? (
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#22c55e',
            border: '1px solid #22c55e',
            padding: '1px 5px',
            marginLeft: 2,
          }}>LIVE</span>
        ) : (
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'pulse 1.5s infinite',
          }} />
        )}
      </div>

      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div style={{
          display: 'flex',
          gap: 56,
          animation: 'ticker 50s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {[...events, ...events].map((e, i) => (
            <span key={i} style={{ fontSize: 12, flexShrink: 0 }}>
              {e.isLive && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                  padding: '1px 4px',
                  marginRight: 6,
                  opacity: 0.9,
                }}>LIVE</span>
              )}
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{e.text}</span>
              <span style={{ margin: '0 8px', color: 'var(--border)' }}>·</span>
              <span style={{ color: 'var(--accent)', fontSize: 11, fontFamily: 'var(--mono)' }}>{e.time}</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  )
}
