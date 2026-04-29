// Real events — sourced from public records and verified news reporting
const events = [
  { text: 'Cambridge MA terminated Flock Safety contract after breach of trust', time: 'Dec 2025' },
  { text: 'Flock Safety deploying 90,000+ cameras across the US as of mid-2025', time: 'Jul 2025' },
  { text: 'Bernalillo County deputy caught misusing ALPR data — written reprimand only', time: '2025' },
  { text: 'Taos NM: 18 Flock cameras near main plaza confirmed via public records', time: '2023–present' },
  { text: 'Las Cruces NM: 37 cameras including PTZ units that track faces in real time', time: 'ongoing' },
  { text: 'Out-of-state agencies accessing NM plate data for immigration enforcement — Sen. Wirth', time: 'Jan 2026' },
  { text: 'Albuquerque PD retains your plate scan for 365 days — 12× longer than county policy', time: 'ongoing' },
  { text: 'Flock developing "Nova" — combining plate data with breach databases and commercial records', time: 'May 2025' },
  { text: 'NM Senator Wirth: "You literally can be tracked based on your plate, wherever you\'ve been"', time: 'Jan 2026' },
  { text: '8 Washington state agencies shared ALPR data directly with US Border Patrol in 2025', time: 'Oct 2025' },
]

export default function ActivityTicker() {
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
        Verified
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--accent)',
          animation: 'pulse 1.5s infinite',
        }} />
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
