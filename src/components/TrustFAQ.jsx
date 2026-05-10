import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, ChevronUp, Shield, Lock, Code, Coins, Users, AlertTriangle } from 'lucide-react'

const sections = [
  {
    icon: <Lock size={20} />,
    label: 'Wallets & Funds',
    color: '#e63946',
    questions: [
      {
        q: 'Who controls the campaign wallets?',
        a: `Operators hold the keys to their own campaign wallets — that is the direct wallet model.\n\nCiteback is a coordination and accountability layer, not a custodian. Contributions go straight to the operator's own XMR or ZANO wallet. Citeback never holds, pools, or touches campaign funds.\n\nAccountability comes from three things: (1) Operators provide a view key — a read-only key that lets anyone, including Citeback, verify the wallet balance and transaction history in real time. (2) Early drain = permanent ban. If an operator extracts funds before campaign completion, they are immediately and permanently blacklisted with a public misconduct record. (3) Operators pass OFAC and identity verification with the Citeback legal entity before any campaign goes live — there is a real accountability trail even though contributors remain anonymous.\n\nThe full wallet architecture is published on GitHub. No funds go live until the architecture is independently reviewable.`,
      },
      {
        q: 'How does the wallet architecture work?',
        a: `The direct wallet model: operators hold their own XMR and ZANO wallets. Contributions flow directly from contributors to the operator's wallet — Citeback is never in the chain.\n\nWhat Citeback does:\n• Verifies the operator's identity and OFAC status pre-launch\n• Monitors the wallet balance in real time via a read-only view key the operator publishes\n• Activates permanent bans and public misconduct flags if an operator drains early\n• Requires verified proof of campaign completion before marking a campaign closed\n\nWhat Citeback does NOT do:\n• Hold wallet private keys\n• Pool or commingle campaign funds\n• Take any percentage of contributions\n\nThe full architecture spec is on GitHub. The view key approach means anyone — not just Citeback — can independently verify a campaign wallet's balance at any time.`,
      },
      {
        q: 'How do I verify the wallets are legitimate?',
        a: `Every active campaign publishes a view key — a read-only cryptographic key that lets anyone verify the wallet's full transaction history without spending access. Both Monero (XMR) and Zano (ZANO) wallets support view keys.\n\nWith the view key you can:\n• Verify the current balance matches what the campaign shows\n• Verify every incoming contribution\n• Verify every outgoing disbursement and its destination\n• Cross-reference disbursements against the public action log on GitHub\n\nView keys are published at campaign activation — before any contribution is made.`,
      },
      {
        q: 'What happens if a campaign doesn\'t reach its goal?',
        a: `If a campaign deadline arrives with the goal unmet, funds automatically redirect to the highest-priority active campaign in the same category (billboard funds go to another billboard campaign, FOIA funds to another FOIA, etc.).\n\nOperators or community members can request an extension (see Campaign Extensions). Maximum 2 extensions per campaign. After that, redirect is automatic.\n\nAll contributions are final and non-refundable. This is disclosed on every campaign card. Monero's privacy model makes identifying senders technically infeasible without asking contributors to partially deanonymize themselves — we won't do that.`,
      },
      {
        q: 'How does Citeback sustain itself?',
        a: `Citeback takes zero from campaigns. No platform fee. No percentage deducted. Every dollar contributed goes directly to the campaign operator's wallet — Citeback never holds or touches campaign funds.\n\nOperating costs (server infrastructure, domains, tooling) are covered by the founding operator personally via capital contributions to the Wyoming DAO LLC. At current scale this is roughly $33/month — sustainable indefinitely without platform revenue.\n\nLonger term, the platform will pursue grant funding from aligned foundations (Open Technology Fund, Knight Foundation) specifically for technical infrastructure builds. Grants fund the build; the platform stays independent.\n\nThis model was chosen deliberately: a surveillance resistance platform that skims a percentage of campaigns has an extractive relationship with the causes it exists to support. Zero fees eliminate that tension entirely.`,
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
        a: `Citeback is being organized as a Wyoming DAO LLC (formation is a launch prerequisite). Pre-launch, the founder acts as interim platform operator.\n\nThe operator reviews campaign proposals, manages operator onboarding, handles OFAC screening, and monitors campaign wallet balances via view keys. Under the direct wallet model, campaign wallet keys are held by campaign operators themselves — not by Citeback.\n\nAfter launch and LLC formation, the founder's account has identical permissions to any other community participant. No veto, no special wallet access, no back door.`,
      },
      {
        q: 'How does community voting work?',
        a: `Anyone can vote by signing their vote with a Monero private key, Zano private key, or Nostr key — proves identity without revealing it.\n\nVoting weight is proportional to economic participation. A logarithmic formula rewards participation while limiting concentration. Funding and voting are decoupled: contribute any amount you want. Only governance weight is capped.\n\nFormula: weight = max(1, log₂(contribution / $5) + 1)\n• $5 contribution → weight 1.0 (floor)\n• $10 contribution → weight 2.0\n• $1,280+ contribution → weight 9.0 (maximum cap)\n\nContributions must be at least 72 hours old at the time a proposal is submitted to qualify — no last-minute flooding. See GOVERNANCE.md §5 for the full specification.\n\nDifferent decisions require different thresholds:\n• Campaign proposals: simple majority, 10-voter quorum\n• Disbursement challenges: 60% to block (default is release)\n• Rule changes: 60–75% supermajority + 7–14 day time-lock`,
      },
      {
        q: 'What are time-locks and why do they exist?',
        a: `Note: this describes the post-launch governance model — it is not currently enforced. Pre-launch, the founder operates as interim operator under the responsibilities in GOVERNANCE.md.\n\nAfter launch, once the Wyoming DAO LLC is formed and community voting is active, major changes don't take effect immediately after a vote passes. They wait:\n\n• Minor changes: 24 hours\n• Rule changes: 7 days\n• Governance changes: 14 days\n\nThis window gives the community time to react. If a bad change slips through a vote, the time-lock allows a counter-proposal before it takes effect.\n\nTime-locks make coordinated attacks expensive. You can't rush a hostile takeover through a 14-day window without the community noticing.`,
      },
      {
        q: 'Can the founder change the rules or take back control?',
        a: `Governance constraints after launch:\n• Site changes require community votes that no individual can unilaterally pass\n• Governance rules have 75% supermajority + 14-day time-lock requirements\n• Campaign wallet balances are publicly verifiable via view keys — any anomalous drain triggers an immediate permanent ban\n• The founder's account has identical governance weight to any other participant\n\nThe founder bootstrapped the system and acts as interim operator pre-launch. Post-launch: no special authority, no back door, no veto. Community governance holds everyone accountable.`,
      },
      {
        q: 'What happens if Citeback itself disappears?',
        a: `The platform is designed to survive its own operators. Here's what that means concretely:\n\n• The GitHub repo (github.com/citeback/citebackwebsite) is public and forkable — anyone can deploy a full copy of the platform without permission or coordination with us.\n• The governance spec, campaign taxonomy, and campaign data are all in the repo. A fork doesn't start from zero — it starts with the full operational context intact.\n• The domain isn't the platform. citeback.com can be re-pointed, replaced, or abandoned. Whoever runs the fork picks their own domain. The platform isn't tied to any URL.\n• Active wallet balances are governed by the published disbursement rules, not the operator. A platform shutdown doesn't affect funds held in live campaign wallets — the wallet system continues to enforce disbursement rules until campaigns close or the community votes on wind-down via the fork/recovery path (GOVERNANCE.md §13).\n\nIf Citeback disappears, the tools don't. This is by design. Surveillance doesn't stop. Neither should the ability to fund accountability work.`,
      },
    ],
  },
  {
    icon: <Shield size={20} />,
    label: 'Operators & Accountability',
    color: '#f39c12',
    questions: [
      {
        q: 'Who executes the campaigns?',
        a: `Operators are community members who run campaigns — renting billboards, filing FOIAs, funding legal work. Operators must verify their real identity privately with the platform's legal entity — names are never published. Publicly, operators are represented by a Monero address or Nostr key.\n\nOperators build a reputation score through completed campaigns. Campaign caps scale with track record, not identity:\n\n| Track Record | Max Campaign Goal |\n|---|---|\n| New operator (10+ sightings) | $1,000 |\n| 10 successfully completed campaigns | $7,500 (no legal entity required) |\n| Registered legal entity on file | $30,000 |\n| Entity + DAO counsel review + $1M insurance | $125,000 |\n| $125k+ completed volume + community vote | Unlimited |`,
      },
      {
        q: 'How do I know an operator actually completed the task?',
        a: `Operators must submit verified proof before any disbursement is released:\n\n• Billboard campaigns: photo of the live billboard with GPS tag\n• FOIA campaigns: copy of the submitted request + confirmation receipt\n• Legal campaigns: court filing number or signed retainer\n\nAfter proof is submitted, a 48-hour public challenge window opens. Any community member can challenge a disbursement with counter-evidence. 60% majority required to block it.\n\nOperators who submit fraudulent proofs lose 25+ reputation points, face a permanent public misconduct flag, and cannot resubmit.`,
      },
      {
        q: 'What stops someone from grinding reputation then stealing a large campaign fund?',
        a: `Several layers:\n\n1. Direct wallet model: contributions go straight to the operator's own wallet — no platform custody. The operator provides a Monero view key (read-only) so the platform monitors inflows and outflows without spending access.\n\n2. Early withdrawal = permanent ban. Any attempt to extract funds before campaign completion (false proof, social engineering, or exploit) results in immediate permanent blacklisting, stake forfeiture, and public misconduct record.\n\n3. The 48-hour community challenge window catches fraudulent proof submissions before any disbursement is triggered.\n\n4. Reputation caps mean you need a real execution track record to access large campaigns — you can't create a throwaway account and immediately run a $7,500 campaign.\n\n5. Confirmed misconduct is permanent and public — there's no clean escape or second chance after an upheld challenge.\n\n6. Any community member with sufficient reputation (score ≥ 25) can trigger a provisional pause if something looks wrong.`,
      },
      {
        q: 'Can campaigns be extended if they\'re close to their goal?',
        a: `Yes. Within the last 25% of a campaign's time window, the operator or any community member can request an extension.\n\nThe request is put to a community vote (48-hour window, simple majority). If approved, the deadline extends by 7, 14, or 30 days.\n\nMaximum 2 extensions per campaign. If the second extension expires unfunded, the redirect logic kicks in — no third chances. This prevents indefinitely stalled campaigns from sitting on campaign funds.`,
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
        a: `Yes. Every line of code running on Citeback is public on GitHub.\n\nThis includes:\n• The site (all frontend components, routing, UI)\n• The server (account system, sightings, campaign API, OFAC screening)\n• The governance rules (vote thresholds, time-locks)\n• The campaign rules (caps, redirect logic)\n\nYou don't have to trust us. You can read the code, audit it, propose changes, or fork it entirely.`,
      },
      {
        q: 'How do I independently verify the code running on Citeback\'s servers?',
        a: `The server publishes its own SHA-256 hash at https://ai.citeback.com/version. To verify:\n\n1. Go to https://ai.citeback.com/version and copy the sha256 value\n2. Download server.js from https://github.com/citeback/citebackwebsite\n3. Run: sha256sum server.js\n4. If the hashes match, the live server is running the exact published code\n\nFrontend: every Netlify deploy lists the exact GitHub commit it was built from — verifiable at https://app.netlify.com/sites/heroic-yeot-51eaeb/deploys\n\nNote: this approach relies on the server being honest about its own hash. Full signed-build attestation (tamper-evident, server can\'t forge) is on the Phase 2 roadmap.\n\n---\n\nFor wallet verification: every active campaign publishes a view key — a read-only cryptographic key that lets anyone verify the wallet\'s full transaction history. View keys are published at campaign activation — before any contribution is made. Wallet guide published before first campaign launches.`,
      },
      {
        q: 'How do site changes get made?',
        a: `Post-launch, all site changes go through GitHub pull requests. The process:\n\n1. Anyone opens a PR with the proposed change\n2. Community discusses it publicly in the PR comments\n3. Community votes (threshold depends on change type)\n4. Vote passes → time-lock expires → deploy goes out via Netlify auto-deploy from GitHub\n5. Every deployment is logged with commit hash, vote count, and timestamp\n\nPre-launch, the founder operates the platform under the defined responsibilities in the governance spec. After Phase 2 launch and LLC formation, the founder has identical permissions to every other participant — no unilateral changes.`,
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
        a: `No. Citeback is organized as a Wyoming DAO LLC — a for-profit legal entity. It is not a 501(c)(3) tax-exempt charitable organization.\n\nContributions to Citeback campaigns are not tax-deductible for US federal income tax purposes. If tax deductibility is important to you, consider the organizations listed in our Frontline Funds section — several are established nonprofits.`,
      },
      {
        q: 'Can anyone contribute?',
        a: `Contributions from individuals or entities on OFAC sanctions lists are strictly prohibited by our Terms of Use. By sending funds to any campaign wallet, you represent that you are not a Specially Designated National or otherwise sanctioned party.

**OFAC gap disclosure (required reading):** Because Monero and Zano transactions are private at the protocol level, the platform has no technical ability to screen anonymous contributors against the OFAC SDN list. This is a structural limitation — not a policy choice — and is documented in GOVERNANCE.md §9.3. The ToS prohibition is a binding legal condition, but on-chain enforcement is not possible on the contributor side.

Campaign operators (who receive disbursements) are separately screened against the OFAC SDN list by the platform entity before onboarding and again by the wallet system at every disbursement. The contributor-side limitation and the attorney-required legal analysis of this gap are both documented as pre-launch open questions in GOVERNANCE.md. No funds go live until written attorney guidance is received.`,
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
        a: `We'll be straight with you:\n\n**Operator early drain** — Operators hold their own campaign wallets under the direct wallet model. An operator could theoretically withdraw funds before a campaign closes. Defenses: view key monitoring (Citeback and the public can verify balance in real time), permanent ban on early drain, OFAC/identity pre-screening, and reputation staking. This is the most important risk to understand — it's mitigated, not eliminated.\n\n**Fake proof submissions** — The platform operator reviews proof documents, but cannot fully authenticate every photo or receipt. The 48-hour community challenge window and reputation staking are the primary defenses.\n\n**Sybil attacks on voting** — Addressed through logarithmic proof-of-contribution weighting (cap at $1,280 → weight 9.0, per GOVERNANCE.md §5). Spinning up fake wallets costs real money — a $5 floor applies, and the 72-hour age requirement blocks last-minute attacks. The human operator monitors for suspicious coordination patterns and can trigger provisional pauses; any pause must be confirmed by community vote within 12 hours. Not zero-risk, but economically irrational at scale.\n\n**Coordinated whale rings** — Multiple actors each contributing to the cap and voting together off-platform. Quorum requirements and time-locks limit exposure; fully solving this without breaking contributor privacy isn't possible.\n\n**Regulatory risk** — Citeback is designed to fund only lawful activities and undergoes pre-launch attorney review of identified regulatory questions — including FinCEN/MSB classification, OFAC compliance, and state money transmission licensing. These questions are documented as open issues in governance; no funds go live until written legal guidance is in hand. Regulatory environments also change. The open source + forkable design ensures the platform can adapt.`,
      },
      {
        q: 'What can governance NOT do?',
        a: `Even with 100% community consensus, some things are off-limits:\n\n• Retroactively reverse completed disbursements (crypto transactions are final)\n• Clear a confirmed misconduct record\n• Identify contributors (Monero and Zano privacy is immutable at the protocol level)\n• Grant any individual special access above others\n• Recover funds from an operator who has already drained a campaign wallet\n\nAdditionally, by governance rule (supermajority vote required to change):\n• Off-mission campaigns require a 75% community supermajority\n\nGovernance-level rules require a supermajority and time-lock to change, per the published governance spec.`,
      },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '0',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          cursor: 'pointer', padding: '18px 0', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
          color: 'var(--text)',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, flex: 1 }}>{q}</span>
        <span style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 2 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <div style={{
          fontSize: 13, color: 'var(--muted)', lineHeight: 1.8,
          paddingBottom: 20, whiteSpace: 'pre-line',
        }}>
          {a}
        </div>
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
    <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Phase Status Banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderLeft: '3px solid var(--gray)', borderRadius: 0, padding: '14px 18px', marginBottom: 36,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🟡</span>
        <div>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#f39c12' }}>Phase 1 — Design &amp; Community Review</span>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Campaign wallets are not yet live. The architecture and governance specs are published and open for community review.
            Phase 2 brings live wallets and cryptographic verification. Everything described here reflects the
            design that will be implemented — not promises, but auditable specs.
          </p>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12,
        }}>Trust &amp; Architecture</div>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em' }}>How It Works &amp; Why You Can Trust It</h2>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14, maxWidth: 620, lineHeight: 1.7 }}>
          Citeback is designed so you don't have to trust us. Every claim here is backed by open source code and cryptographic proofs — not promises.
        </p>
      </div>

      {/* Trust Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 48 }}>
        {[
          { icon: '🔐', title: 'No Custody — Direct to Operator', desc: 'Contributions go straight to the operator wallet. Platform never holds funds. Balance verified via operator-provided view key.', link: 'https://github.com/citeback/citebackwebsite/blob/main/ARCHITECTURE.md', linkLabel: 'Architecture spec' },
          { icon: '📖', title: 'Open Source Code', desc: 'Every rule is public and auditable.', link: 'https://github.com/citeback/citebackwebsite', linkLabel: 'View on GitHub' },
          { icon: '🔍', title: 'Independently Verifiable', desc: 'The SHA-256 of the running server code is published live — compare it against the public GitHub repo yourself.', link: 'https://ai.citeback.com/version', linkLabel: 'View /version endpoint' },
          { icon: '⏱️', title: 'Time-Locked Changes', desc: 'Rules change slowly, with full community visibility. Documented in GOVERNANCE.md — voting and time-lock enforcement activate post-launch.', link: 'https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md', linkLabel: 'Governance doc', prelaunch: 'Voting + enforcement activate post-launch' },
          { icon: '👁️', title: 'View Keys Published', desc: 'Anyone can verify every wallet transaction.', link: 'https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md', linkLabel: 'How view keys work', prelaunch: 'View keys published when wallets activate' },
          { icon: '🌿', title: 'Forkable Forever', desc: 'The code outlives any individual or organization.', link: 'https://github.com/citeback/citebackwebsite', linkLabel: 'Fork on GitHub' },
        ].map((p, i) => (
          <a
            key={i}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 0, padding: '16px 18px',
              display: 'block', textDecoration: 'none', color: 'inherit',
              transition: 'border-color 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{p.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: p.prelaunch || p.linkLabel ? 8 : 0 }}>{p.desc}</div>
            {p.prelaunch && <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 4 }}>⏳ {p.prelaunch}</div>}
            {p.linkLabel && <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.03em' }}>{p.linkLabel} →</div>}
          </a>
        ))}
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {sections.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 0, border: '1px solid',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeSection === i ? 'rgba(230,57,70,0.1)' : 'var(--bg2)',
              borderColor: activeSection === i ? s.color : 'var(--border)',
              color: activeSection === i ? s.color : 'var(--muted)',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ color: s.color }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* FAQ items */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 0, padding: '0 24px',
      }}>
        {sections[activeSection].questions.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} />
        ))}
      </div>

      {/* Verification CTA */}
      <div style={{
        marginTop: 32, background: 'var(--bg2)', border: '1px solid var(--border)',
        borderLeft: '3px solid var(--red)', borderRadius: 0, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: 22, flexShrink: 0 }}>🔬</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Don't take our word for it.</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            The SHA-256 hash of the running server code is published live at{' '}
            <a href="https://ai.citeback.com/version" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>ai.citeback.com/version</a>.
            Download server.js from the public GitHub repo, run <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>sha256sum server.js</code>, and compare — if the hashes match, the code running here is exactly what’s published.
            Frontend deploys are verifiable via Netlify’s public deploy log. Full signed-build attestation is on the Phase 2 roadmap.
          </div>
        </div>
      </div>

      {/* CTA row */}
      {setTab && (
        <div style={{
          marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 24,
          borderTop: '1px solid var(--border)',
        }}>
          <button
            onClick={() => setTab('campaigns')}
            style={{
              background: 'var(--fg)', color: 'var(--bg)', border: 'none',
              padding: '13px 28px', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Browse Campaigns →
          </button>
          <button
            onClick={() => setTab('operators')}
            style={{
              background: 'transparent', color: 'var(--fg)',
              border: '1px solid var(--border)', padding: '13px 28px',
              fontSize: 13, fontWeight: 500, letterSpacing: '0.05em',
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Run a Campaign →
          </button>
          <button
            onClick={() => setTab('governance')}
            style={{
              background: 'transparent', color: 'var(--fg)',
              border: '1px solid var(--border)', padding: '13px 28px',
              fontSize: 13, fontWeight: 500, letterSpacing: '0.05em',
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Governance Spec →
          </button>
        </div>
      )}
    </section>
    </>
  )
}
