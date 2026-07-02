import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { safeUrl } from '../utils/safeUrl'
import { ChevronDown, ChevronUp, Shield, Lock, Code, Coins, Users, AlertTriangle } from 'lucide-react'

const sections = [
  {
    icon: <Lock size={20} />,
    label: 'Wallets & Funds',
    color: '#e63946',
    questions: [
      {
        q: 'Who controls the campaign wallets?',
        a: `Campaign organizers hold the keys to their own campaign wallets — that is the direct wallet model.\n\nCiteback is a coordination and accountability layer, not a custodian. Contributions go straight to the organizer's own XMR or ZANO wallet. Citeback never holds, pools, or touches campaign funds.\n\nAccountability comes from three things: (1) Campaign organizers provide a view key — a read-only key that lets anyone, including Citeback, verify the wallet balance and transaction history in real time. (2) Early drain = permanent ban. If an organizer extracts funds before campaign completion, they are immediately and permanently blacklisted with a public misconduct record. (3) Campaign organizers pass OFAC and identity verification with the Citeback legal entity before any campaign goes live — there is a real accountability trail even though contributors remain anonymous.\n\nThe full wallet architecture is published on GitHub. No funds go live until the architecture is independently reviewable.`,
      },
      {
        q: 'How does the wallet architecture work?',
        a: `The direct wallet model: campaign organizers hold their own XMR and ZANO wallets. Contributions flow directly from contributors to the organizer's wallet — Citeback is never in the chain.\n\nWhat Citeback does:\n• Verifies the organizer's identity and OFAC status pre-launch\n• Monitors the wallet balance in real time via a read-only view key the organizer publishes\n• Activates permanent bans and public misconduct flags if an organizer drains early\n• Requires verified proof of campaign completion before marking a campaign closed\n\nWhat Citeback does NOT do:\n• Hold wallet private keys\n• Pool or commingle campaign funds\n• Take any percentage of contributions\n\nThe full architecture spec is on GitHub. The view key approach means anyone — not just Citeback — can independently verify a campaign wallet's balance at any time.`,
      },
      {
        q: 'How do I verify the wallets are legitimate?',
        a: `Every active campaign publishes a view key — a read-only cryptographic key that lets anyone verify the wallet's full transaction history without spending access. Both Monero (XMR) and Zano (ZANO) wallets support view keys.\n\nWith the view key you can:\n• Verify the current balance matches what the campaign shows\n• Verify every incoming contribution\n• Verify every outgoing disbursement and its destination\n• Cross-reference disbursements against the public action log on GitHub\n\nView keys are published at campaign activation — before any contribution is made.`,
      },
      {
        q: 'What happens if a campaign doesn\'t reach its goal?',
        a: `If a campaign deadline arrives with the goal unmet, funds automatically redirect to the highest-priority active campaign in the same category (billboard funds go to another billboard campaign, FOIA funds to another FOIA, etc.).\n\nCampaign organizers can request an extension (see Campaign Extensions). Maximum 2 extensions per campaign. After that, redirect is automatic.\n\nAll contributions are final and non-refundable. This is disclosed on every campaign card. Monero's privacy model makes identifying senders technically infeasible without asking contributors to partially deanonymize themselves — we won't do that.`,
      },
      {
        q: 'How does Citeback sustain itself?',
        a: `Citeback takes zero from campaigns. No platform fee. No percentage deducted. Every dollar contributed goes directly to the campaign organizer's wallet — Citeback never holds or touches campaign funds.\n\nOperating costs (server infrastructure, domains, tooling) are covered personally by the founding operator. At current scale this is roughly $33/month — sustainable indefinitely without platform revenue.\n\nLonger term, the platform will pursue grant funding from aligned foundations (Open Technology Fund, Knight Foundation) specifically for technical infrastructure builds. Grants fund the build; the platform stays independent.\n\nThis model was chosen deliberately: a surveillance resistance platform that skims a percentage of campaigns has an extractive relationship with the causes it exists to support. Zero fees eliminate that tension entirely.`,
      },
      {
        q: 'Why Monero and Zano — and not Bitcoin or USDC?',
        a: `Monero (XMR) and Zano (ZANO) are the two major privacy coins with privacy enforced at the protocol level — not optional, not an add-on.\n\n**Why not Bitcoin or USDC?**\nBitcoin and USDC are fully transparent blockchains — every transaction, amount, and address is publicly visible forever. For a surveillance-resistance platform, using a transparent blockchain would be self-defeating. Contributors shouldn't have to worry that their support creates a public record connecting them to Fourth Amendment activism.\n\n**Why Monero (XMR)?**\nMonero is the established gold standard for private transactions:\n• Ring signatures obscure the real sender by mixing it with decoy inputs — every spend is ambiguous by design\n• Stealth addresses generate a one-time address per transaction — no on-chain link between payments to the same recipient\n• RingCT hides transaction amounts via Pedersen commitments and range proofs\n• Fast, low-fee (typically well under $0.05), programmatic control via monero-wallet-rpc\n• Wallet ecosystem: Cake Wallet (iOS/Android), Monerujo (Android), Feather Wallet (desktop — built-in Tor), Monero GUI (official desktop)\n\n**Why Zano (ZANO)?**\nZano is the second pillar — privacy-by-default like Monero, with additional properties:\n• Confidential Assets: amounts, addresses, AND asset types are all hidden at protocol level\n• Hybrid PoW+PoS consensus — attacking Zano requires both hashpower AND stake\n• Ionic Swaps enable atomic peer-to-peer exchange without a centralized intermediary\n• A complementary privacy layer: contributors who prefer Zano get the same guarantees\n\nRunning both creates a more resilient, inclusive privacy stack — XMR-maximalists and Zano users both have a home here.`,
      },
    ],
  },
  {
    icon: <Users size={20} />,
    label: 'Governance',
    color: '#5dade2',
    questions: [
      {
        q: 'Who runs Citeback?',
        a: `Scott Hughes operates the Citeback platform. Campaign proposals are reviewed, credentials are verified, and milestone claims are assessed by the platform operator — and every platform decision is publicly logged.\n\nWhat the operator can do: review and approve or reject campaigns, verify professional credentials, enforce the published rules, and ban bad actors.\n\nWhat the operator cannot do: access campaign wallet private keys (enforced by the architecture, not by policy) or move campaign funds. Under the direct wallet model, contributions go straight from contributors to the campaign organizer's own wallet — Citeback is never in the chain.`,
      },
      {
        q: 'How do the platform rules change?',
        a: `The rules are published on GitHub and versioned. Any change is announced publicly at least 7 days before taking effect — no surprise rule changes, ever.\n\nDecisions are made by the platform operator and publicly logged. There is no community voting system at this stage — that's a deliberate choice to keep the platform simple and honest about how it actually works today.\n\nSee the Platform Rules page for the full picture — it takes about a minute to read.`,
      },
      {
        q: 'Will the community ever get a say?',
        a: `Yes — that's Phase 2. As the platform grows, campaign runners will gain input into rule changes through a transparent process. That system will be announced publicly before it activates.\n\nUntil then, the strongest community check is the fork right: the entire platform — code, rules, and data structures — is open source. If the platform changes in ways the community rejects, anyone can fork it and run their own instance.`,
      },
      {
        q: 'Can the founder change the rules or take back control?',
        a: `The founder runs the platform — that's stated openly, not hidden behind governance theater. What keeps that power in check:\n\n• Every rule change gets 7 days of public notice before taking effect\n• Every platform decision is publicly logged\n• The operator cannot access campaign wallets — the direct wallet model means funds never pass through Citeback\n• Campaign wallet balances are publicly verifiable via view keys — any anomalous drain triggers an immediate permanent ban\n• The entire platform is open source and forkable — if the operator goes bad, the community can leave with the code and the data`,
      },
      {
        q: 'What happens if Citeback itself disappears?',
        a: `The platform is designed to survive its own operators. Here's what that means concretely:\n\n• The GitHub repo (github.com/citeback/citebackwebsite) is public and forkable — anyone can deploy a full copy of the platform without permission or coordination with us.\n• The governance spec, campaign taxonomy, and campaign data are all in the repo. A fork doesn't start from zero — it starts with the full operational context intact.\n• The domain isn't the platform. citeback.com can be re-pointed, replaced, or abandoned. Whoever runs the fork picks their own domain. The platform isn't tied to any URL.\n• Campaign funds live in organizer-held wallets, not on Citeback. A platform shutdown doesn't affect funds in live campaign wallets — organizers hold their own keys, and view keys keep balances publicly verifiable.\n\nIf Citeback disappears, the tools don't. This is by design. Surveillance doesn't stop. Neither should the ability to fund accountability work.`,
      },
    ],
  },
  {
    icon: <Shield size={20} />,
    label: 'Campaign Organizers & Accountability',
    color: '#f39c12',
    questions: [
      {
        q: 'Who executes the campaigns?',
        a: `Campaigns are run by verified professionals — attorneys, nonprofits, licensed healthcare professionals, and university or government employees. Verification is automatic against public registries:\n\n• Attorneys — state bar number lookup\n• Nonprofits & organizations — EIN check against the IRS Exempt Organizations database\n• Licensed healthcare professionals — NPI check against the CMS registry\n• University & government employees — .edu or .gov email verification\n\nReal identities are stored privately on the server and never published. Publicly, campaign organizers show only a verified badge — e.g., "Verified Attorney — NM" or "Verified 501(c)(3)". That gives every campaign a real accountability trail without exposing anyone's name.`,
      },
      {
        q: 'How do I know an organizer actually completed the task?',
        a: `Campaign organizers must submit verified proof before a milestone is marked complete:\n\n• Billboard campaigns: photo of the live billboard with GPS tag\n• FOIA campaigns: copy of the submitted request + confirmation receipt\n• Legal campaigns: court filing number or signed retainer\n\nProof is assessed by the platform operator and published publicly alongside the campaign — anyone can inspect it and report problems.\n\nOrganizers who submit fraudulent proofs face a permanent public misconduct flag and a permanent ban.`,
      },
      {
        q: 'What stops an organizer from taking the money and running?',
        a: `Several layers:\n\n1. Direct wallet model: contributions go straight to the organizer's own wallet — no platform custody. The organizer provides a Monero view key (read-only) so the platform and the public can monitor inflows and outflows in real time.\n\n2. Early withdrawal = permanent ban. Any attempt to extract funds before campaign completion results in immediate permanent blacklisting and a public misconduct record.\n\n3. Verified credentials = real accountability. Every organizer verified a professional credential (bar number, EIN, NPI, or institutional email) tied to their real identity, held privately by the platform. Burning that credential over a campaign fund is a very expensive trade.\n\n4. Confirmed misconduct is permanent and public — there's no clean escape or second chance.`,
      },
      {
        q: 'Can campaigns be extended if they\'re close to their goal?',
        a: `Yes. Within the last 25% of a campaign's time window, the organizer can request an extension.\n\nExtension requests are reviewed by the platform operator and the decision is publicly logged. If approved, the deadline extends by 7, 14, or 30 days.\n\nMaximum 2 extensions per campaign. If the second extension expires unfunded, the redirect logic kicks in — no third chances. This prevents indefinitely stalled campaigns from sitting on campaign funds.`,
      },
    ],
  },
  {
    icon: <Code size={20} />,
    label: 'Code & Verification',
    color: '#bb8fce',
    questions: [
      {
        q: 'Is Citeback open source?',
        a: `Yes. Every line of code running on Citeback is public on GitHub.\n\nThis includes:\n• The site (all frontend components, routing, UI)\n• The server (account system, sightings, campaign API, OFAC screening)\n• The platform rules (published, versioned, 7-day change notice)\n• The campaign rules (milestones, redirect logic)\n\nYou don't have to trust us. You can read the code, audit it, propose changes, or fork it entirely.`,
      },
      {
        q: 'How do I independently verify the code running on Citeback\'s servers?',
        a: `The server publishes its own SHA-256 hash at https://ai.citeback.com/version. To verify:\n\n1. Go to https://ai.citeback.com/version and copy the sha256 value\n2. Download server.js from https://github.com/citeback/citebackwebsite\n3. Run: sha256sum server.js\n4. If the hashes match, the live server is running the exact published code\n\nFrontend: every Netlify deploy lists the exact GitHub commit it was built from — verifiable at https://app.netlify.com/sites/heroic-yeot-51eaeb/deploys\n\nNote: this approach relies on the server being honest about its own hash. Full signed-build attestation (tamper-evident, server can\'t forge) is on the Phase 2 roadmap.\n\n---\n\nFor wallet verification: every active campaign publishes a view key — a read-only cryptographic key that lets anyone verify the wallet\'s full transaction history. View keys are published at campaign activation — before any contribution is made. Wallet guide published before first campaign launches.`,
      },
      {
        q: 'How do site changes get made?',
        a: `All site changes go through GitHub — the entire codebase is public. The process:\n\n1. Changes land as public commits and pull requests — anyone can read the diff\n2. Rule changes get at least 7 days of public notice before taking effect\n3. Deploys go out via Netlify auto-deploy from GitHub — every deployment is logged with its exact commit hash\n\nThe platform operator makes the final call on changes, and every decision is publicly logged. If the community rejects the direction, the fork right applies: anyone can fork the repo and run their own instance.`,
      },
    ],
  },
  {
    icon: <Shield size={20} />,
    label: 'Contributor Rules',
    color: '#5dade2',
    questions: [
      {
        q: 'Are contributions tax-deductible?',
        a: `No. Citeback is organized as a Wyoming LLC (in formation) — a for-profit legal entity. It is not a 501(c)(3) tax-exempt charitable organization.\n\nContributions to Citeback campaigns are not tax-deductible for US federal income tax purposes. If tax deductibility is important to you, consider the organizations listed in our Frontline Funds section — several are established nonprofits.`,
      },
      {
        q: 'Can anyone contribute?',
        a: `Contributions from individuals or entities on OFAC sanctions lists are strictly prohibited by our Terms of Use. By sending funds to any campaign wallet, you represent that you are not a Specially Designated National or otherwise sanctioned party.

**OFAC gap disclosure (required reading):** Because Monero and Zano transactions are private at the protocol level, the platform has no technical ability to screen anonymous contributors against the OFAC SDN list. This is a structural limitation — not a policy choice — and is documented in GOVERNANCE.md §9.3. The ToS prohibition is a binding legal condition, but on-chain enforcement is not possible on the contributor side.

Campaign organizers (who receive disbursements) are separately screened against the OFAC SDN list by the platform entity before onboarding and again by the wallet system at every disbursement. The contributor-side limitation and the attorney-required legal analysis of this gap are both documented as pre-launch open questions in GOVERNANCE.md. No funds go live until written attorney guidance is received.`,
      },
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    label: 'Risks & Limits',
    color: '#e67e22',
    questions: [
      {
        q: 'What data does browsing this site expose?',
        a: `Your contribution uses XMR or ZANO protocol-level privacy — no on-chain link between you and the campaign. However, browsing this site creates standard server-side and third-party logs that are separate from your contribution privacy:

• **Hosting:** This site runs on Netlify, which logs visitor IP addresses per standard hosting practice. Netlify's data retention follows their published privacy policy.
• **Fonts:** All typefaces (Inter, Space Grotesk, JetBrains Mono) are self-hosted on Citeback's servers. No external font CDN is used — no font-related IP exposure.
• **Map tiles:** The surveillance camera map loads tiles from CARTO (*.basemaps.cartocdn.com). CARTO receives tile requests including your IP address.
• **External data APIs:** Requests to CourtListener, USASpending.gov, the Senate LDA API, OpenStates, and api.congress.gov are proxied through Citeback's own servers. Your IP address is not exposed to these third-party services.
• **Form submissions:** Campaign proposals, camera sightings, and expert directory applications are sent directly to Citeback's own server infrastructure. No contact information is collected or required. IP address logging is disabled at the server level. Submission data goes into a moderation queue — no personal data is stored.

For maximum privacy when browsing this site, use Tor Browser, a trusted VPN, or a privacy-preserving proxy. Your XMR or ZANO contribution remains private regardless of browsing method — coin-level privacy is at the protocol layer, not the application layer. These infrastructure disclosures do not affect contribution privacy.`,
    },
    {
      q: 'What are the honest risks?',
        a: `We'll be straight with you:\n\n**Campaign organizer early drain** — Campaign organizers hold their own campaign wallets under the direct wallet model. A campaign organizer could theoretically withdraw funds before a campaign closes. Defenses: view key monitoring (Citeback and the public can verify balance in real time), permanent ban on early drain, OFAC/identity pre-screening, and reputation staking. This is the most important risk to understand — it's mitigated, not eliminated.\n\n**Fake proof submissions** — The platform operator reviews proof documents, but cannot fully authenticate every photo or receipt. Public proof records, verified organizer credentials, and permanent misconduct flags are the primary defenses.\n\n**Operator trust** — The platform operator reviews campaigns and verifies milestones — a single point of human judgment. Checks: every decision is publicly logged, rule changes get 7 days of public notice, the operator can never touch campaign funds (direct wallet model), and the whole platform is forkable if the community loses confidence.\n\n**Regulatory risk** — Citeback is designed to fund only lawful activities and undergoes pre-launch attorney review of identified regulatory questions — including FinCEN/MSB classification, OFAC compliance, and state money transmission licensing. These questions are documented as open issues in governance; no funds go live until written legal guidance is in hand. Regulatory environments also change. The open source + forkable design ensures the platform can adapt.`,
      },
      {
        q: 'What can the platform operator NOT do?',
        a: `Some things are off-limits no matter what:\n\n• Access campaign wallet private keys — enforced by the architecture, not by policy\n• Move or touch campaign funds — contributions go directly to organizer wallets\n• Reverse completed transactions (crypto transactions are final)\n• Identify contributors (Monero and Zano privacy is immutable at the protocol level)\n• Recover funds from a campaign organizer who has already drained a campaign wallet\n• Change rules without 7 days of public notice\n\nThese constraints are published in the platform rules on GitHub, and the code enforcing them is open source.`,
      },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button onClick={() => setOpen(o => !o)} className="faq-item-btn">
        <span className="faq-item-q">{q}</span>
        <span className="faq-item-chevron">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <div className="faq-item-answer">{a}</div>
      )}
    </div>
  )
}

export default function TrustFAQ({ setTab }) {
  const [activeSection, setActiveSection] = useState(0)

  return (
    <>
    <Helmet>
      <title>How It Works | Citeback — Anonymous Crowdfunding for Surveillance Resistance</title>
      <meta name="description" content="Learn how Citeback funds surveillance lawsuits anonymously using Monero and Zano. Transparent wallet architecture, community-verified campaigns, zero tracking." />
      <meta property="og:title" content="How It Works | Citeback — Anonymous Crowdfunding for Surveillance Resistance" />
      <meta property="og:description" content="Learn how Citeback funds surveillance lawsuits anonymously using Monero and Zano. Transparent wallet architecture, community-verified campaigns, zero tracking." />
    </Helmet>
    <section className="faq-page">
      {/* Phase Status Banner */}
      <div className="faq-phase-banner">
        <span className="faq-phase-icon">🟡</span>
        <div>
          <span className="faq-phase-label">Phase 1 — Design &amp; Community Review</span>
          <p className="faq-phase-text">
            Campaign wallets are not yet live. The architecture and platform rules are published and open for community review.
            Phase 2 brings live wallets and cryptographic verification. Everything described here reflects the
            design that will be implemented — not promises, but auditable specs.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="faq-header">
        <div className="faq-eyebrow">Trust &amp; Architecture</div>
        <h2 className="faq-heading">How It Works &amp; Why You Can Trust It</h2>
        <p className="faq-heading-desc">
          Citeback is designed so you don't have to trust us. Every claim here is backed by open source code and cryptographic proofs — not promises.
        </p>
      </div>

      {/* Trust Pillars */}
      <div className="faq-pillars-grid">
        {[
          { icon: '🔐', title: 'No Custody — Direct to Organizer', desc: 'Contributions go straight to the organizer wallet. Platform never holds funds. Balance verified via organizer-provided view key.', link: 'https://github.com/citeback/citebackwebsite/blob/main/ARCHITECTURE.md', linkLabel: 'Architecture spec' },
          { icon: '📖', title: 'Open Source Code', desc: 'Every rule is public and auditable.', link: 'https://github.com/citeback/citebackwebsite', linkLabel: 'View on GitHub' },
          { icon: '🔍', title: 'Independently Verifiable', desc: 'The SHA-256 of the running server code is published live — compare it against the public GitHub repo yourself.', link: 'https://ai.citeback.com/version', linkLabel: 'View /version endpoint' },
          { icon: '⏱️', title: '7-Day Notice on Rule Changes', desc: 'Every rule change is announced publicly at least 7 days before taking effect. All platform decisions are publicly logged.', link: 'https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md', linkLabel: 'Platform rules' },
          { icon: '👁️', title: 'View Keys Published', desc: 'Anyone can verify every wallet transaction.', link: 'https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md', linkLabel: 'How view keys work', prelaunch: 'View keys published when wallets activate' },
          { icon: '🌿', title: 'Forkable Forever', desc: 'The code outlives any individual or organization.', link: 'https://github.com/citeback/citebackwebsite', linkLabel: 'Fork on GitHub' },
        ].map((p, i) => (
          <a
            key={i}
            href={safeUrl(p.link)}
            target="_blank"
            rel="noopener noreferrer"
            className="faq-pillar-card"
          >
            <div className="faq-pillar-icon">{p.icon}</div>
            <div className="faq-pillar-title">{p.title}</div>
            <div className={`faq-pillar-desc${p.prelaunch || p.linkLabel ? ' faq-pillar-desc--spaced' : ''}`}>{p.desc}</div>
            {p.prelaunch && <div className="faq-pillar-prelaunch">⏳ {p.prelaunch}</div>}
            {p.linkLabel && <div className="faq-pillar-link">{p.linkLabel} →</div>}
          </a>
        ))}
      </div>

      {/* Section tabs */}
      <div className="faq-tabs">
        {sections.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            className={`faq-tab-btn${activeSection === i ? ' faq-tab-btn--active' : ''}`}
            ref={el => { if (el) el.style.setProperty('--faq-color', s.color) }}
          >
            <span className="faq-tab-icon">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* FAQ items */}
      <div className="faq-container">
        {sections[activeSection].questions.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} />
        ))}
      </div>

      {/* Verification CTA */}
      <div className="faq-verify-cta">
        <div className="faq-verify-icon">🔬</div>
        <div>
          <div className="faq-verify-title">Don't take our word for it.</div>
          <div className="faq-verify-text">
            The SHA-256 hash of the running server code is published live at{' '}
            <a href="https://ai.citeback.com/version" target="_blank" rel="noopener noreferrer" className="faq-accent-link">ai.citeback.com/version</a>.
            Download server.js from the public GitHub repo, run <code className="faq-verify-code">sha256sum server.js</code>, and compare — if the hashes match, the code running here is exactly what's published.
            Frontend deploys are verifiable via Netlify's public deploy log. Full signed-build attestation is on the Phase 2 roadmap.
          </div>
        </div>
      </div>

      {/* CTA row */}
      {setTab && (
        <div className="faq-cta-row">
          <button onClick={() => setTab('campaigns')} className="faq-cta-btn-primary">
            Browse Campaigns →
          </button>
          <button onClick={() => setTab('operators')} className="faq-cta-btn-secondary">
            Run a Campaign →
          </button>
          <button onClick={() => setTab('governance')} className="faq-cta-btn-secondary">
            Platform Rules →
          </button>
        </div>
      )}
    </section>
    </>
  )
}
