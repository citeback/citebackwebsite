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
    <section className="ae-section">
      <div className="ae-inner">
        <div className="ae-header">
          <div className="ae-eyebrow">Know What You're Fighting</div>
          <h2 className="ae-heading">
            The Surveillance Network Explained
          </h2>
          <p className="ae-subtitle">
            Flock Safety has deployed over 90,000 cameras across the US, with more coming online daily. Most people have no idea they're being scanned.
          </p>
        </div>

        <div className="ae-grid">
          {facts.map((f, i) => (
            <div key={i} className="ae-fact-card">
              <div className="ae-fact-icon">{f.icon}</div>
              <h3 className="ae-fact-title">{f.title}</h3>
              <p className="ae-fact-body">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="ae-footer">
          {setTab && (
            <div className="ae-btn-row">
              <button onClick={() => setTab('campaigns')} className="ae-btn-primary">
                Fund a FOIA Campaign →
              </button>
              <button onClick={() => setTab('map')} className="ae-btn-secondary">
                See the Surveillance Map →
              </button>
            </div>
          )}
          <a
            href="https://sls.eff.org/technologies/automated-license-plate-readers-alprs"
            target="_blank"
            rel="noopener noreferrer"
            className="ae-eff-link"
          >
            <ExternalLink size={13} /> Deep dive: EFF's ALPR resource center
          </a>
        </div>
      </div>
    </section>
  )
}
