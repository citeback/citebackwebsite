import { Camera, Database, Share2, AlertTriangle, ExternalLink } from 'lucide-react'

const facts = [
  {
    icon: <Camera size={20} />,
    title: 'What is ALPR?',
    body: 'Automatic License Plate Recognition (ALPR) cameras photograph every vehicle passing by — recording your plate number, exact location, and timestamp. Flock Safety is the dominant private vendor, with cameras deployed in thousands of US cities.',
  },
  {
    icon: <Database size={20} />,
    title: 'Where Does the Data Go?',
    body: 'Your plate scan is stored in Flock\'s cloud — often for 30+ days, sometimes indefinitely. It\'s accessible to the contracting police department, often shared with neighboring agencies, and in some cases accessible to federal law enforcement with no warrant required.',
  },
  {
    icon: <Share2 size={20} />,
    title: 'Who Shares It?',
    body: 'Flock operates a nationwide "Hot List" network. A scan in Albuquerque can be queried by a department in Texas or Virginia. Private HOAs and businesses also operate Flock cameras, feeding the same network — with zero government oversight.',
  },
  {
    icon: <AlertTriangle size={20} />,
    title: 'Why It\'s Unconstitutional',
    body: 'The Fourth Amendment protects against unreasonable search and seizure. Mass location tracking of all citizens without suspicion or warrant is the definition of unreasonable. Courts are split — which is exactly why legal challenges matter.',
  },
]

export default function ALPRExplainer({ setTab }) {
  return (
    <section style={{
      padding: '72px 24px',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--red)',
            marginBottom: 12,
          }}>Know What You're Fighting</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
            The Surveillance Network Explained
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Flock Safety has deployed over 90,000 cameras across the US, with more coming online daily. Most people have no idea they're being scanned.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {facts.map((f, i) => (
            <div key={i} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 0, padding: 24,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 0,
                background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--red)', marginBottom: 16,
              }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.75 }}>{f.body}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {setTab && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => setTab('campaigns')}
                style={{
                  background: 'var(--fg)', color: 'var(--bg)', border: 'none',
                  padding: '12px 24px', fontSize: 13, fontWeight: 600,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                Fund a FOIA Campaign →
              </button>
              <button
                onClick={() => setTab('map')}
                style={{
                  background: 'transparent', color: 'var(--fg)',
                  border: '1px solid var(--border)', padding: '12px 24px',
                  fontSize: 13, fontWeight: 500, letterSpacing: '0.05em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'var(--font)',
                }}
              >
                See the Surveillance Map →
              </button>
            </div>
          )}
          <a
            href="https://www.eff.org/pages/automated-license-plate-readers-alpr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--muted)', fontSize: 13, fontWeight: 500,
              border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 0,
            }}
          >
            <ExternalLink size={13} /> Deep dive: EFF's ALPR resource center
          </a>
        </div>
      </div>
    </section>
  )
}
