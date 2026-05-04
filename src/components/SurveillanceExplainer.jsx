import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const TYPES = [
  {
    id: 'alpr',
    icon: '📷',
    name: 'License Plate Readers (ALPR)',
    tagline: 'Every plate. Every road. No warrant.',
    color: '#e63946',
    sections: {
      what: 'Cameras that automatically photograph every vehicle that passes, logging the license plate number, the exact location, and a timestamp — every time, without any suspicion required. The dominant vendor is Flock Safety, with cameras in thousands of cities.',
      affects: 'Every time you drive past one, your plate, time, and location are logged. APD holds your data for 365 days — 12× longer than most county policies. Out-of-state agencies and even federal immigration enforcement can query that data without a warrant.',
      problems: [
        'A Bernalillo County sheriff\'s deputy misused ALPR data to stalk someone — punishment: a written reprimand.',
        'Flock Safety sells data access to private entities like HOAs, with zero government oversight of what those entities do with it.',
        '"Hot list" errors have led to guns-drawn traffic stops of innocent drivers.',
      ],
      resistance: [
        'Cambridge, MA terminated its Flock contract in 2023 after community pressure exposed the scope of data sharing.',
        'NM Sen. Wirth introduced legislation requiring a warrant before ALPR data can be shared with federal agencies.',
      ],
      cta: 'FOIA your local agency\'s Flock contract. Find out how long they retain data and who they share it with.',
    },
    links: [
      { label: 'EFF ALPR resource center', url: 'https://www.eff.org/pages/automated-license-plate-readers-alpr' },
    ],
  },
  {
    id: 'facial',
    icon: '👁️',
    name: 'Facial Recognition',
    tagline: 'Your face in a database you never consented to.',
    color: '#a855f7',
    sections: {
      what: 'AI software that compares your face against a law enforcement database — often without your knowledge, often without a warrant. Many systems scrape billions of social media photos to build their databases.',
      affects: 'You don\'t have to be a suspect. Clearview AI scraped billions of photos from social media — including yours — and sold access to 3,100+ law enforcement agencies. Walking through a store, a protest, or an airport can put you in a match queue.',
      problems: [
        'Robert Williams, a Black man in Detroit, was wrongfully arrested in 2020 because facial recognition misidentified him — he spent 30 hours in jail for a crime he didn\'t commit.',
        'NIST testing found dramatically higher error rates for Black faces, Asian faces, and women — the people most likely to be falsely matched.',
        'A Georgetown Law study found 117 agencies were using facial recognition with zero public oversight or disclosed policies.',
      ],
      resistance: [
        'San Francisco, Boston, and Detroit have all passed bans on government use of facial recognition.',
        'Multiple lawsuits against Clearview AI are ongoing — Illinois\'s BIPA law has been the most effective legal lever.',
      ],
      cta: 'FOIA your local police department\'s facial recognition contracts and use policies.',
    },
    links: [
      { label: 'Georgetown "Perpetual Line-Up" study', url: 'https://www.law.georgetown.edu/privacy-technology-center/publications/the-perpetual-line-up/' },
    ],
  },
  {
    id: 'stingray',
    icon: '📡',
    name: 'Cell-Site Simulators (Stingrays)',
    tagline: 'Fake cell towers that capture every phone in range.',
    color: '#f97316',
    sections: {
      what: 'Devices that impersonate cell towers and force every nearby phone to connect through them, revealing the identity and location of every person in the area. You don\'t have to be a target — your phone gets captured just for being nearby.',
      affects: 'Every single phone in range is captured, not just the suspect\'s. Sarasota PD used one over 200 times without warrants — and signed a secret NDA with the manufacturer to hide it from courts and the public.',
      problems: [
        'Baltimore PD used Stingrays more than 4,300 times in secret — prosecutors were caught withholding this from defense attorneys.',
        'Chicago PD hid Stingray usage from courts under NDA agreements with Harris Corporation, the manufacturer.',
        'Because they force mass connection, they can disrupt calls and potentially interfere with 911 service.',
      ],
      resistance: [
        'The DOJ now requires federal agencies to obtain a warrant before using cell-site simulators.',
        'California, Washington, and several other states have passed laws requiring warrants for Stingray use.',
      ],
      cta: 'FOIA whether your local or county law enforcement owns a cell-site simulator. Many departments deny it.',
    },
    links: [
      { label: 'EFF Street Level Surveillance: Cell-Site Simulators', url: 'https://sls.eff.org/technologies/cell-site-simulators-imsi-catchers' },
    ],
  },
  {
    id: 'shotspotter',
    icon: '🔊',
    name: 'ShotSpotter (Acoustic Gunshot Detection)',
    tagline: 'Microphones on every block — with a 70% false alarm rate.',
    color: '#eab308',
    sections: {
      what: 'A network of microphones mounted on poles and buildings that claim to detect gunshots and alert police in real time. The company recently rebranded as "SoundThinking" — but the product is the same.',
      affects: 'An AP investigation found ShotSpotter alerts sent Chicago police to innocent people at least 40,000 times in a single year. Cities pay $3–5 million per year for the system. Your neighborhood can be under microphone surveillance without any public vote or notice.',
      problems: [
        'Approximately 70% of ShotSpotter alerts find no evidence of gunfire or a firearm, according to a MacArthur Justice Center analysis of Chicago data.',
        'In one case, ShotSpotter retrospectively altered its audio analysis after police requested it — the modified "evidence" was used in a murder prosecution.',
        'Chicago paid a total of $33 million before ending its contract — money that could have funded 170+ police officers or mental health services.',
      ],
      resistance: [
        'Oakland, CA ended its ShotSpotter contract in 2020 after community pressure and a budget review showed negligible crime-reduction impact.',
        'Minneapolis voted to end its ShotSpotter contract in 2023, citing the AP investigation\'s findings on false alerts.',
      ],
      cta: 'Ask your city council whether they have a ShotSpotter (or SoundThinking) contract. If they do, ask for the false-alert rate data.',
    },
    links: [
      { label: 'End Police Surveillance: ShotSpotter data', url: 'https://endpolicesurveillance.com' },
    ],
  },
  {
    id: 'drones',
    icon: '🚁',
    name: 'Police Drones',
    tagline: 'Eyes in the sky — before you even know police are coming.',
    color: '#06b6d4',
    sections: {
      what: 'Unmanned aircraft used for aerial surveillance — tracking individuals, monitoring protests, and patrolling neighborhoods. Modern police drones can carry cameras, thermal imaging, and even cell-site simulator payloads.',
      affects: 'Chula Vista, CA uses drones as first responders — they fly over your home before officers even arrive, capturing footage of your property and movements without any warrant. Baltimore secretly surveilled the entire city for months with a small airplane before residents found out.',
      problems: [
        'Drone programs are frequently launched without public notice, council votes, or disclosed policies on data retention and sharing.',
        'The Baltimore aerial surveillance program was hidden from residents — they only learned about it through an investigative news report.',
        'Drones can carry Stingray devices, enabling warrantless mass phone surveillance from the air.',
      ],
      resistance: [
        'Multiple cities have passed drone use policies requiring public disclosure, data retention limits, and council approval for surveillance missions.',
        'The ACLU published model drone legislation that has been adopted or adapted in dozens of cities.',
      ],
      cta: 'FOIA whether your city or county has drones, what payloads they carry, and what the deployment policy is.',
    },
    links: [
      { label: 'Bard College: Drones in Public Safety tracker', url: 'https://dronecenter.bard.edu/projects/public-safety-drones-project/' },
    ],
  },
  {
    id: 'predictive',
    icon: '🧠',
    name: 'Predictive Policing',
    tagline: 'Algorithms that mark you as a future criminal.',
    color: '#ec4899',
    sections: {
      what: 'Software that claims to "predict" where crimes will occur or who will commit them, used to allocate police resources or flag individuals. These systems turn historical arrest data — which reflects existing bias — into scores that direct more police at the same communities.',
      affects: 'You can end up on a "risk score" list without ever being charged with anything. Chicago\'s secret "Strategic Subject List" scored hundreds of thousands of residents as crime risks — people had no way to know they were on it or to contest it.',
      problems: [
        'LAPD\'s PredPol (now Geolitica) ran for 9 years before an independent racial bias audit found it was targeting low-income communities of color at disproportionate rates — the program was then cancelled.',
        'New Orleans ran a secret 6-year predictive policing program with Palantir — the city council didn\'t know it existed until investigative journalists revealed it.',
        'Memphis\'s Blue CRUSH program was used to surveil Black Lives Matter activists and other First Amendment-protected activity.',
      ],
      resistance: [
        'Santa Cruz, CA became the first US city to ban predictive policing entirely in 2020.',
        'Several cities terminated PredPol contracts in 2021 after The Markup\'s investigation revealed racial disparities in the targeting data.',
      ],
      cta: 'FOIA your city\'s predictive policing contracts with Palantir, ShotSpotter, Axon, or any risk-scoring vendor.',
    },
    links: [
      { label: 'The Markup: Predictive Policing Software Terrible At Predicting Crimes', url: 'https://themarkup.org/prediction-bias/2023/10/02/predictive-policing-software-terrible-at-predicting-crimes' },
      { label: 'Brennan Center: predictive policing explainer', url: 'https://www.brennancenter.org/our-work/research-reports/predictive-policing-explained' },
    ],
  },
]

function AccordionCard({ item, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      background: 'var(--bg2)',
      border: `1px solid ${open ? item.color + '40' : 'var(--border)'}`,
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '18px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 24,
          width: 44,
          height: 44,
          borderRadius: 10,
          background: item.color + '18',
          border: `1px solid ${item.color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>{item.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--fg)', lineHeight: 1.3 }}>{item.name}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3, fontStyle: 'italic' }}>{item.tagline}</div>
        </div>
        <span style={{ color: item.color, flexShrink: 0 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${item.color}20` }}>

          {/* What is it */}
          <div style={{ marginTop: 18 }}>
            <div style={{
              display: 'inline-block',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: item.color,
              background: item.color + '15',
              padding: '3px 10px', borderRadius: 100, marginBottom: 8,
            }}>What is it?</div>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>
              {item.sections.what}
            </p>
          </div>

          {/* How it affects you */}
          <div style={{ marginTop: 16, padding: '14px 16px', background: item.color + '0c', borderRadius: 10, borderLeft: `3px solid ${item.color}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: item.color, marginBottom: 6 }}>
              How it affects you
            </div>
            <p style={{ fontSize: 14, color: 'var(--fg)', lineHeight: 1.7, margin: 0 }}>
              {item.sections.affects}
            </p>
          </div>

          {/* The problem */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--muted)',
              marginBottom: 10,
            }}>The problem</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.sections.problems.map((p, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontSize: 13, color: 'var(--muted)', lineHeight: 1.65,
                }}>
                  <span style={{
                    flexShrink: 0, marginTop: 3,
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--accent)', display: 'inline-block',
                  }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* What resistance looks like */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#10b981',
              marginBottom: 10,
            }}>What resistance looks like</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.sections.resistance.map((r, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontSize: 13, color: 'var(--muted)', lineHeight: 1.65,
                }}>
                  <span style={{
                    flexShrink: 0, marginTop: 4,
                    fontSize: 12,
                  }}>✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Fund the fight CTA */}
          <div style={{
            marginTop: 18,
            padding: '14px 16px',
            background: 'rgba(230,57,70,0.06)',
            border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: 10,
            display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>Take action</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{item.sections.cta}</p>
            </div>
          </div>

          {/* External links */}
          {item.links && item.links.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {item.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, color: 'var(--muted)', fontWeight: 500,
                    border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 7,
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={11} /> {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SurveillanceExplainer() {
  return (
    <section style={{
      padding: '72px 24px',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)',
            color: 'var(--accent)', padding: '4px 14px', borderRadius: 100,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 16,
          }}>Know What You're Fighting</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
            6 Surveillance Technologies. Plain Language.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            What each technology does, why it matters, and what cities have already done to stop it.
          </p>
        </div>

        {/* Accordion cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TYPES.map((item, i) => (
            <AccordionCard key={item.id} item={item} defaultOpen={i === 0} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{
          marginTop: 40, textAlign: 'center',
          padding: '28px 24px',
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
            Don't see a FOIA request for your city?
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.7 }}>
            Every unchallenged contract is a green light for more surveillance.
            Fund the litigation, the ordinance fight, or the FOIA request — anonymously, in XMR or ZANO.
          </p>
          <a
            href="https://citeback.com"
            style={{
              display: 'inline-block',
              background: 'var(--accent)', color: '#fff',
              padding: '11px 24px', borderRadius: 9,
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}
          >
            Browse open campaigns →
          </a>
        </div>

      </div>
    </section>
  )
}
