import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, AlertTriangle, Scale, FileText, Shield, ChevronDown, ChevronRight, ExternalLink, Coins, Loader, BadgeCheck, Lock } from 'lucide-react'
import { API_BASE as AI_URL } from '../config.js'
import AccountModal from './AccountModal'

function Accordion({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="ops-accordion">
      <button onClick={() => setOpen(o => !o)} className="ops-accordion-btn">
        {Icon && <Icon size={18} className="ops-accordion-icon" />}
        <span className="ops-accordion-btn-label">{title}</span>
        {open ? <ChevronDown size={16} className="ops-accordion-chevron" /> : <ChevronRight size={16} className="ops-accordion-chevron" />}
      </button>
      {open && (
        <div className="ops-accordion-body">
          {children}
        </div>
      )}
    </div>
  )
}

const campaignTypes = [
  { label: 'Proven High Impact', cls: 'proven', types: [
    { name: 'FOIA Campaigns', desc: 'Public records requests to expose surveillance contracts, costs, and deployment data. Low cost, feeds every other campaign type.' },
    { name: 'Ordinance Campaigns', desc: 'City council campaigns to ban or regulate surveillance locally. Proven playbook across dozens of cities.' },
    { name: 'Public Records Litigation', desc: 'Force disclosure via FOIA litigation and injunctions when agencies refuse. Produces permanent citable records.' },
    { name: 'Counter-Database Projects', desc: 'Accountability mapping of surveillance infrastructure. Feeds litigation, journalism, and legislation.' },
    { name: 'Billboard Campaigns', desc: 'Place public awareness signs near surveillance infrastructure. Simple, visible, hard to ignore.' },
  ]},
  { label: 'Specialized Actions', cls: 'specialized', types: [
    { name: 'Vendor Accountability', desc: 'Target Clearview, Flock Safety, Palantir by name. Anonymous funding is uniquely valuable here.' },
    { name: 'Legislative Advocacy', desc: 'Testimony, model bills, public comment campaigns. Campaign organizers should consult an attorney before launching.' },
    { name: 'Legal Defense', desc: 'Civil and administrative challenges only. No criminal defense.' },
    { name: 'Journalist Partnerships', desc: 'Fund investigative reporting on specific surveillance deployments.' },
    { name: 'Procurement Intervention', desc: 'Legal challenges to government RFPs and sole-source surveillance contracts.' },
  ]},
]

// ─── Credential verification ─────────────────────────────────────────────────

const CREDENTIAL_TYPES = [
  {
    id: 'attorney',
    label: 'Attorney',
    idLabel: 'State bar number',
    placeholder: 'e.g. NM 12345 — include your state',
    badge: 'Verified Attorney — [State]',
    hint: 'Verified against your state bar\u2019s public attorney lookup.',
    errorHelp: 'We couldn\u2019t find an active bar record matching that number. Check the number and make sure you included your state (e.g. "NM 12345"). Inactive or suspended licenses cannot be verified.',
  },
  {
    id: 'nonprofit',
    label: 'Nonprofit or Organization',
    idLabel: 'EIN (Employer Identification Number)',
    placeholder: 'e.g. 12-3456789',
    badge: 'Verified 501(c)(3)',
    hint: 'Verified against the IRS Exempt Organizations database.',
    errorHelp: 'We couldn\u2019t find that EIN in the IRS Exempt Organizations database. Check the format (XX-XXXXXXX). Newly registered nonprofits can take a few months to appear in the IRS database.',
  },
  {
    id: 'healthcare',
    label: 'Licensed Healthcare Professional',
    idLabel: 'NPI number',
    placeholder: 'e.g. 1234567890 (10 digits)',
    badge: 'Verified Healthcare Professional',
    hint: 'Verified against the CMS National Provider Identifier registry.',
    errorHelp: 'We couldn\u2019t find that NPI in the CMS registry. NPI numbers are exactly 10 digits — you can look yours up at npiregistry.cms.hhs.gov.',
  },
  {
    id: 'institutional',
    label: 'University or Government Employee',
    idLabel: 'Institutional email (.edu or .gov)',
    placeholder: 'e.g. you@university.edu',
    badge: 'Verified Institutional',
    hint: 'A verification link is sent to your institutional address.',
    errorHelp: 'That doesn\u2019t look like a valid .edu or .gov address. Only institutional email domains can be auto-verified — personal addresses won\u2019t work.',
  },
]

function CredentialVerifier() {
  const [credType, setCredType] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | verified | notfound | unavailable
  const [badge, setBadge] = useState(null)
  const [showAccount, setShowAccount] = useState(false)

  const selected = CREDENTIAL_TYPES.find(t => t.id === credType)
  const canVerify = credType && identifier.trim() && fullName.trim() && status !== 'loading'

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!canVerify) return
    setStatus('loading')
    try {
      const res = await fetch(`${AI_URL}/api/verify-credential`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialType: credType,
          identifier: identifier.trim(),
          fullName: fullName.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.verified) {
          setBadge(data.badge || selected?.badge)
          setStatus('verified')
        } else {
          setStatus('notfound')
        }
      } else if (res.status === 404 || res.status === 501 || res.status === 503) {
        setStatus('unavailable')
      } else {
        setStatus('notfound')
      }
    } catch {
      setStatus('unavailable')
    }
  }

  if (status === 'verified') {
    return (
      <div className="ops-how-box">
        <p className="ops-how-p">
          <CheckCircle size={16} className="ops-req-icon ops-req-icon--ok" />{' '}
          <strong>Verified ✅</strong> — your credential checks out.
          {badge && <> Your public badge: <strong>{badge}</strong>.</>}
        </p>
        <p className="ops-how-p--last">
          Finish creating your account to start proposing campaigns. Your legal name stays private on the server — only the badge is ever shown publicly.
        </p>
        <button onClick={() => setShowAccount(true)} className="ops-cta-btn--primary">
          <BadgeCheck size={14} /> Create Your Account
        </button>
        {showAccount && <AccountModal onClose={() => setShowAccount(false)} initialTab="create" singleMode />}
      </div>
    )
  }

  return (
    <form onSubmit={handleVerify} className="ops-requirements">
      <p className="ops-requirements-title">Verify Your Credential</p>

      <div className="sf-field">
        <label htmlFor="ops-cred-type" className="sf-label">I am a...</label>
        <select
          id="ops-cred-type"
          className="sf-input"
          value={credType}
          onChange={e => { setCredType(e.target.value); setStatus('idle'); setIdentifier('') }}
        >
          <option value="">Select your credential type</option>
          {CREDENTIAL_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          <div className="sf-field">
            <label htmlFor="ops-cred-id" className="sf-label">{selected.idLabel}</label>
            <input
              id="ops-cred-id"
              type={selected.id === 'institutional' ? 'email' : 'text'}
              className="sf-input"
              placeholder={selected.placeholder}
              value={identifier}
              onChange={e => { setIdentifier(e.target.value); if (status !== 'idle') setStatus('idle') }}
            />
            <p className="ops-req-note">{selected.hint}</p>
          </div>

          <div className="sf-field">
            <label htmlFor="ops-cred-name" className="sf-label">Full legal name</label>
            <input
              id="ops-cred-name"
              type="text"
              className="sf-input"
              placeholder="As it appears on your credential"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>
        </>
      )}

      {status === 'notfound' && selected && (
        <div className="sf-error-box">
          <div className="sf-error-heading">
            <AlertTriangle size={14} /> Credential not found ❌
          </div>
          <p className="sf-error-text">{selected.errorHelp}</p>
        </div>
      )}

      {status === 'unavailable' && (
        <div className="sf-error-generic">
          <AlertTriangle size={14} /> Verification service is temporarily unavailable — please try again shortly, or email citeback@proton.me and we&apos;ll verify you manually.
        </div>
      )}

      <button type="submit" disabled={!canVerify} className={`sf-submit-btn${canVerify ? ' sf-submit-btn--active' : ''}`}>
        {status === 'loading'
          ? <><Loader size={16} className="spinning" /> Verifying…</>
          : <>Verify &amp; Create Account</>}
      </button>

      <p className="ops-req-note">
        <Lock size={12} /> <strong>Your real name is never shown publicly.</strong> Your verified badge (e.g., &ldquo;Verified Attorney — NM&rdquo;) is the only thing other users see. Identity data is stored privately on the server for accountability and is never published.
      </p>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Operators() {
  return (
    <div className="ops-page">
      <Helmet>
        <title>Run a Campaign | Citeback — Verified Professionals Fight Surveillance</title>
        <meta property="og:title" content="Run a Campaign | Citeback" />
      </Helmet>

      {/* Hero */}
      <div className="ops-header">
        <div className="ops-header-icon-row">
          <Scale size={28} className="ops-header-icon" />
          <h1>Run a Surveillance Accountability Campaign</h1>
        </div>
        <p>
          Surveillance is asymmetric: institutions document everyone, and almost no one can fund the fight back. Citeback changes that. Verified professionals propose campaigns — FOIA litigation, ordinance drives, counter-databases, billboards — and the community funds them anonymously. If you have a specific surveillance accountability target and the credentials to execute, you can start today.
        </p>

        {/* How this works — honest model */}
        <div className="ops-how-box">
          <p className="ops-how-p">
            <strong>How this works:</strong> Campaign organizers hold their own XMR wallet and publish a view key so anyone can verify the balance in real time. Contributors send directly to the organizer&apos;s wallet — Citeback never holds or touches campaign funds. Citeback&apos;s role is verification and accountability: verifying credentials, reviewing campaign proposals, and verifying milestones.
          </p>
          <p className="ops-how-p--last">
            Campaigns are funded milestone by milestone. Organizers define deliverables upfront (FOIA filed, billboard live, legal action taken). Each milestone is verified before the next tranche of funding is promoted.
          </p>
        </div>
      </div>

      {/* Who can run campaigns */}
      <div className="ops-quickstart">
        <p className="ops-quickstart-label">
          Who Can Run Campaigns
        </p>
        <p className="ops-section-intro">
          Campaign access is credential-based. If you hold one of these, verification is automatic — no waiting, no manual review:
        </p>
        <div className="ops-roles-grid">
          {[
            { role: 'Attorneys', req: 'Active state bar license, verified instantly by bar number. Public badge: "Verified Attorney — [State]".' },
            { role: 'Nonprofits & Organizations', req: 'Registered 501(c)(3) or equivalent, verified by EIN against the IRS Exempt Organizations database. Public badge: "Verified 501(c)(3)".' },
            { role: 'Licensed Healthcare Professionals', req: 'Verified by NPI number against the CMS registry. Public badge: "Verified Healthcare Professional".' },
            { role: 'University & Government Employees', req: 'Verified by institutional .edu or .gov email. Public badge: "Verified Institutional".' },
          ].map(p => (
            <div key={p.role} className="ops-role-card ops-role-card--operator">
              <p className="ops-role-label">{p.role}</p>
              <p className="ops-role-desc">{p.req}</p>
            </div>
          ))}
        </div>
        <p className="ops-req-note">
          Don&apos;t hold one of these credentials? You can still contribute anonymously, submit camera sightings, and support campaigns — no account needed. Additional credential paths will be added over time.
        </p>
      </div>

      {/* Credential verification */}
      <CredentialVerifier />

      {/* What makes a good campaign */}
      <h2 className="ops-h2">What Makes a Strong Campaign</h2>

      <Accordion title="Has a specific, verifiable target" icon={Shield} defaultOpen>
        <p>The best campaigns name a specific program, agency, vendor, or jurisdiction. &ldquo;Stop Flock Safety cameras in Taos NM&rdquo; is fundable. &ldquo;Fight surveillance&rdquo; is not.</p>
        <p className="ops-body-p-spaced">You need to define upfront: what does success look like? What&apos;s the proof standard? What changes if this campaign wins?</p>
      </Accordion>

      <Accordion title="Funded by lawful activity only" icon={CheckCircle}>
        <p>Criminal defense funding is prohibited. Campaigns involving illegal activity are prohibited. Camera tampering is prohibited — these rules are permanent and cannot be changed.</p>
        <p className="ops-body-p-spaced">Billboard campaigns require an organizer attestation of factual accuracy — you certify your claims are verifiable. The platform does not verify content, but you are legally responsible for it.</p>
      </Accordion>

      <Accordion title="Has a realistic cost breakdown with milestones" icon={FileText}>
        <p>Campaign proposals require a cost breakdown and defined milestones. Each milestone has a specific deliverable (FOIA filing receipt, MuckRock URL, photo of billboard) and a specific cost. Funding is released milestone by milestone as each deliverable is verified.</p>
        <p className="ops-body-p-spaced">Vague goals (&ldquo;raise $50k for legal costs&rdquo;) won&apos;t be approved. Specific proposals (&ldquo;file FOIA with Bernalillo County Sheriff — $800 attorney fee — verified by MuckRock URL&rdquo;) are what the platform is built for.</p>
      </Accordion>

      {/* Campaign types */}
      <h2 className="ops-h2--spaced">Campaign Types</h2>
      <p className="ops-section-intro">
        The platform funds any lawful accountability activity. Campaign types below are organized by demonstrated real-world impact.
      </p>

      {campaignTypes.map((group, gi) => (
        <div key={gi} className="ops-campaign-group">
          <p className={`ops-campaign-group-label ops-group--${group.cls}`}>
            {group.label}
          </p>
          <div className="ops-campaign-types-grid">
            {group.types.map(t => (
              <div key={t.name} className={`ops-campaign-type ops-type--${group.cls}`}>
                <strong className="ops-campaign-type-name">{t.name}</strong>
                <p className="ops-campaign-type-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Disbursement */}
      <div className="ops-disbursement">
        <div className="ops-disbursement-inner">
          <Coins size={18} className="ops-disbursement-icon" />
          <div>
            <p className="ops-disbursement-title">How Disbursement Works</p>
            <p className="ops-disbursement-text">
              Campaign organizers hold their own XMR wallet. Contributors send directly to that wallet — Citeback never holds funds. Organizers publish a view key so the balance is publicly verifiable in real time. When the campaign goal is reached, the site marks it funded.
            </p>
            <p className="ops-disbursement-text--spaced">
              Funding is promoted milestone by milestone. Each milestone has a defined deliverable verified by Citeback (photo, MuckRock FOIA URL, court filing number) before the next tranche is promoted. Converting XMR to fiat for vendor payments is the organizer&apos;s responsibility.
            </p>
          </div>
        </div>
      </div>

      <Accordion title="What happens after you submit a proposal" icon={FileText}>
        <ol className="ops-accordion-list">
          <li>Your credential is verified automatically at account creation</li>
          <li>Proposal reviewed by the platform operator — decisions are publicly logged</li>
          <li>Milestone plan reviewed and approved before campaign opens</li>
          <li>Campaign published — community begins funding</li>
          <li>Funds arrive directly in your wallet; milestones verified as deliverables are submitted</li>
          <li>Campaign closes with a public outcome record</li>
        </ol>
        <p className="ops-accordion-final">All contributions are final and non-refundable. Campaign wallets are organizer-held — if a campaign isn&apos;t funded within its deadline, any funds received are handled per the campaign&apos;s stated terms set before launch.</p>
      </Accordion>

      {/* CTA */}
      <div className="ops-cta-box">
        <h3 className="ops-cta-title">Already verified? Propose a Campaign</h3>
        <p className="ops-cta-desc">
          Strong campaigns get funded fast. Bring a specific target, a cost breakdown, and verifiable milestones.
        </p>
        <div className="ops-cta-btns">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openPropose', { detail: {} }))}
            className="ops-cta-btn--primary"
          >
            Propose a Campaign
          </button>
          <a href="https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" className="ops-cta-btn--secondary">
            <ExternalLink size={14} /> Read the Platform Rules
          </a>
        </div>
        <div className="ops-cta-footer">
          <p>
            <strong>Not a verified professional?</strong>{' '}
            You can still fund campaigns anonymously and submit camera sightings to the surveillance map — no account or credential required.
          </p>
        </div>
      </div>
    </div>
  )
}
