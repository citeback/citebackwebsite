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
        'Cambridge, MA terminated its Flock Safety contract in December 2025 after Flock Safety installed two unauthorized ALPR cameras without the city\'s knowledge — the city called it a material breach of trust. (Source: City of Cambridge official statement, Dec 10 2025)',
        'NM Sen. Wirth introduced legislation requiring a warrant before ALPR data can be shared with federal agencies.',
      ],
      cta: 'FOIA your local agency\'s Flock contract. Find out how long they retain data and who they share it with.',
    },
    links: [
      { label: 'EFF ALPR resource center', url: 'https://www.eff.org/pages/automated-license-plate-readers-alpr' },
      { label: 'EFF Atlas of Surveillance', url: 'https://atlasofsurveillance.org/' },
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
        'A Georgetown Law study found face recognition networks affect over 117 million American adults — and the vast majority of police agencies using it operate with zero public oversight or disclosed policies.',
      ],
      resistance: [
        'San Francisco, Boston, and Minneapolis have all passed bans on government use of facial recognition. Detroit — despite being the site of the Robert Williams wrongful arrest — has only restricted, not banned, its use.',
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
    tagline: 'Microphones on every block — with an 89%+ false alarm rate.',
    color: '#eab308',
    sections: {
      what: 'A network of microphones mounted on poles and buildings that claim to detect gunshots and alert police in real time. The company recently rebranded as "SoundThinking" — but the product is the same.',
      affects: 'A MacArthur Justice Center study found 40,000+ ShotSpotter alerts in Chicago over 21 months (July 2019–April 2021) resulted in no evidence of a gun crime. Cities pay $3–5 million per year for the system. Your neighborhood can be under microphone surveillance without any public vote or notice.',
      problems: [
        'Approximately 89% of ShotSpotter alerts find no evidence of gunfire or a firearm, according to a MacArthur Justice Center analysis of Chicago data. Multiple independent analyses put the figure above 90%.',
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
  {
    id: 'ring',
    icon: '🔔',
    name: 'Ring / Smart Doorbell Networks',
    tagline: '2,500+ law enforcement partnerships. Your neighbor\'s doorbell is a police camera.',
    color: '#f97316',
    sections: {
      what: 'Amazon\'s Ring sells doorbell cameras to homeowners, then operates a platform called "Neighbors" that lets police departments request footage from any camera in any area — without a warrant, without the homeowner\'s active consent, and without the subject\'s knowledge.',
      affects: 'Your movements on public streets, sidewalks, and in front of private homes are recorded by a private camera network that feeds directly to police. Ring has shared footage with law enforcement in response to emergency requests that bypassed homeowner consent entirely. You have no way to know how many Ring cameras cover your route to work.',
      problems: [
        'Amazon provided footage to police 11 times in 2022 without homeowner consent or a warrant, using an "emergency" exception.',
        'Over 2,500 US law enforcement agencies have formal partnerships with Ring as of 2024 — giving them expedited access to camera location data and footage requests.',
        'Police can request footage from Ring\'s Neighbors app without a warrant, subpoena, or court order. Homeowners receive a request but are not legally required to comply — however, Amazon can comply without the homeowner if it chooses.',
        'Ring cameras are disproportionately deployed in gentrifying neighborhoods, extending surveillance networks into communities of color without any public vote or police body camera accountability equivalent.',
      ],
      resistance: [
        'Jackson, MS passed an ordinance in 2021 prohibiting city use of Ring data without a warrant.',
        'EFF and ACLU have published model ordinances prohibiting law enforcement Ring partnerships.',
      ],
      cta: 'Ask your city council whether your police department has a Ring Neighbors partnership. File a FOIA for the partnership agreement.',
    },
    links: [
      { label: 'EFF: Ring and Neighbors app surveillance concerns', url: 'https://www.eff.org/deeplinks/2021/10/amazons-ring-cops-and-us-all' },
      { label: 'Model ordinance: prohibiting law enforcement camera partnerships', url: 'https://www.eff.org/document/model-ordinance-prohibiting-real-time-face-recognition-surveillance-technology' },
    ],
  },
  {
    id: 'geofence',
    icon: '📍',
    name: 'Geofence & Keyword Search Warrants',
    tagline: 'Police can demand every phone near a crime scene. Or everyone who searched a word.',
    color: '#8b5cf6',
    sections: {
      what: 'A geofence warrant compels Google (and other tech companies) to identify every device present in a geographic area during a specific time window — with no prior suspect, no probable cause for any individual, and often with a secrecy order preventing the affected person from ever knowing. Keyword warrants do the same for search terms.',
      affects: 'If you were near a protest, a crime scene, a medical clinic, or any place that attracted police attention, your device could be handed over to law enforcement. Google received 20,000+ geofence warrants in 2020 alone. People have been wrongfully investigated because their running route took them past a crime scene.',
      problems: [
        'A man in Arizona was wrongfully investigated for a murder because his cycling route passed the victim\'s house repeatedly. He was identified solely through geofence data.',
        'Geofence warrants covering Black Lives Matter protests were issued in multiple cities in 2020 — effectively giving police the identity of everyone who attended a constitutionally protected protest.',
        'Keyword warrants have been issued for searches like "abortion pill" and "how to find an abortion." Google has complied.',
        'The secrecy orders attached to many geofence warrants mean you may never know your data was searched.',
      ],
      resistance: [
        'In 2023, a federal court in Virginia ruled that geofence warrants are categorically unconstitutional under the Fourth Amendment — the first federal court to do so.',
        'Google announced in 2023 that it would store location data locally on devices rather than in the cloud, limiting its ability to comply with future geofence warrants.',
      ],
      cta: 'Contact your US Representative and Senator and ask them to support the Fourth Amendment Is Not For Sale Act, which limits geofence warrants.',
    },
    links: [
      { label: 'EFF: geofence warrants explainer', url: 'https://www.eff.org/deeplinks/2020/08/deep-dive-geofence-warrants' },
      { label: 'ACLU: Google geofence warrant compliance', url: 'https://www.aclu.org/news/privacy-technology/google-is-giving-data-to-police-based-on-what-people-search' },
    ],
  },
  {
    id: 'fusion',
    icon: '🕸️',
    name: 'Fusion Centers',
    tagline: 'The hidden backbone connecting every surveillance system you\'ve read about.',
    color: '#64748b',
    sections: {
      what: 'Fusion centers are federally-funded state and regional intelligence hubs that aggregate data from dozens of surveillance systems — ALPR, facial recognition, social media monitoring, Stingray intercepts, ShotSpotter, and more — and share it across local, state, and federal agencies including ICE, FBI, and DHS. There are 79 of them in the United States.',
      affects: 'Fusion centers are why ALPR data ends up with ICE. They are the connective tissue that explains how a traffic camera scan in Albuquerque becomes an immigration enforcement action. They also monitor First Amendment-protected activity: a 2012 Senate investigation found that fusion centers produced reports on Occupy Wall Street, anti-war protesters, and Muslim community groups with no terrorism nexus.',
      problems: [
        'A 2012 Senate Permanent Subcommittee on Investigations report found that fusion centers produced "threat" reports on innocent Americans engaged in constitutionally protected activity.',
        'Fusion centers operate with minimal public oversight, inconsistent privacy policies, and no uniform standards for what data can be collected or how long it can be kept.',
        'DHS has poured over $1.4 billion into fusion centers since 2003. Independent audits have found their intelligence value to be negligible — while their civil liberties harm is documented and ongoing.',
        'In New Mexico, the NM Fusion Center (NMFUSION) sits inside the Department of Homeland Security and shares data with all 33 county sheriffs, municipal police, and federal agencies including CBP and ICE.',
      ],
      resistance: [
        'The ACLU has published model state legislation requiring fusion centers to obtain a warrant before sharing data with federal immigration authorities.',
        'Several state legislatures have introduced bills requiring fusion center transparency reports and privacy audits.',
      ],
      cta: 'Your state has a fusion center. FOIA it for its privacy policy, data retention policy, and any reports it produced mentioning First Amendment-protected activity.',
    },
    links: [
      { label: 'ACLU: fusion center surveillance report', url: 'https://www.aclu.org/report/what-are-fusion-centers' },
      { label: '2012 Senate investigation: fusion center failures', url: 'https://www.hsgac.senate.gov/media/minority-media/senate-investigation-finds-little-value-in-dhs-fusion-centers' },
    ],
  },
]

function AccordionCard({ item, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="svex-card"
      style={{
        border: `1px solid ${open ? item.color + '40' : 'var(--border)'}`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="svex-card-header"
      >
        <span
          className="svex-card-icon"
          style={{ background: item.color + '18', border: `1px solid ${item.color}30` }}
        >{item.icon}</span>
        <div className="svex-card-title-wrap">
          <div className="svex-card-title">{item.name}</div>
          <div className="svex-card-tagline">{item.tagline}</div>
        </div>
        <span style={{ color: item.color, flexShrink: 0 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="svex-card-body" style={{ borderTop: `1px solid ${item.color}20` }}>

          {/* What is it */}
          <div className="svex-what-section">
            <div
              className="svex-what-label"
              style={{ color: item.color, background: item.color + '15' }}
            >What is it?</div>
            <p className="svex-what-text">
              {item.sections.what}
            </p>
          </div>

          {/* How it affects you */}
          <div
            className="svex-affects-box"
            style={{ background: item.color + '0c', borderLeft: `3px solid ${item.color}` }}
          >
            <div className="svex-affects-title" style={{ color: item.color }}>
              How it affects you
            </div>
            <p className="svex-affects-text">
              {item.sections.affects}
            </p>
          </div>

          {/* The problem */}
          <div className="svex-problem-label">The problem</div>
          <ul className="svex-problem-list">
            {item.sections.problems.map((p, i) => (
              <li key={i} className="svex-problem-item">
                <span className="svex-problem-bullet" />
                {p}
              </li>
            ))}
          </ul>

          {/* What resistance looks like */}
          <div className="svex-resistance-label">What resistance looks like</div>
          <ul className="svex-resistance-list">
            {item.sections.resistance.map((r, i) => (
              <li key={i} className="svex-resistance-item">
                <span className="svex-resistance-check">✓</span>
                {r}
              </li>
            ))}
          </ul>

          {/* Fund the fight CTA */}
          <div className="svex-cta-box">
            <div className="svex-cta-inner">
              <div className="svex-cta-title">Take action</div>
              <p className="svex-cta-text">{item.sections.cta}</p>
            </div>
          </div>

          {/* External links */}
          {item.links && item.links.length > 0 && (
            <div className="svex-links">
              {item.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="svex-link"
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

export default function SurveillanceExplainer({ setTab }) {
  return (
    <section className="svex-section">
      <div className="svex-inner">

        {/* Section header */}
        <div className="svex-header">
          <div className="svex-know-badge">Know What You're Fighting</div>
          <h2 className="svex-heading">
            6 Surveillance Technologies. Plain Language.
          </h2>
          <p className="svex-intro">
            What each technology does, why it matters, and what cities have already done to stop it.
          </p>
        </div>

        {/* Accordion cards */}
        <div className="svex-cards-list">
          {TYPES.map((item, i) => (
            <AccordionCard key={item.id} item={item} defaultOpen={i === 0} />
          ))}
        </div>

        {/* Legal disclaimer */}
        <div className="svex-disclaimer">
          <strong>Not legal advice.</strong> This section is provided for educational purposes only. Citeback is not a law firm and does not provide legal counsel. FOIA requests, litigation, and ordinance campaigns may have jurisdiction-specific requirements. Consult a qualified attorney for legal advice specific to your situation.
        </div>

        {/* Bottom CTA */}
        <div className="svex-bottom-cta">
          <div className="svex-bottom-heading">
            Don't see a FOIA request for your city?
          </div>
          <p className="svex-bottom-text">
            Every unchallenged contract is a green light for more surveillance.
            Fund the litigation, the ordinance fight, or the FOIA request — anonymously, in XMR or ZANO.
          </p>
          <button
            onClick={() => setTab && setTab('campaigns')}
            className="svex-bottom-btn"
          >
            Browse Open Campaigns →
          </button>
        </div>

      </div>
    </section>
  )
}
