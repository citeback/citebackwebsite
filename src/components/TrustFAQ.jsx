import { useState } from 'react'
import { ChevronDown, ChevronUp, Shield, Lock, Code, Coins, Users, AlertTriangle } from 'lucide-react'

const sections = [
  {
    icon: <Lock size={20} />,
    label: 'Wallets & Funds',
    color: '#e63946',
    questions: [
      {
        q: 'Who controls the campaign wallets?',
        a: `The TEE will — once deployed, no human can override it, including the founder or the platform operator.\n\nEvery campaign wallet will live inside a Trusted Execution Environment (TEE): a hardware-level secure enclave where code runs in complete isolation. Once live, even the server owner cannot extract keys, inspect memory, or alter what's running without invalidating a cryptographic proof.\n\nThe platform is being organized as a Wyoming DAO LLC (formation is a Phase 2 launch prerequisite) — the operator manages campaigns, reviews proposals, and handles onboarding. What the operator cannot do is access wallet keys. Those will exist only inside the TEE. Nobody bypasses this — by architectural design.`,
      },
      {
        q: 'What is a Trusted Execution Environment (TEE)?',
        a: `A TEE is a tamper-proof secure enclave built into modern CPUs (Intel TDX — Trust Domain Extensions, ARM TrustZone). Code running inside a TEE produces a cryptographic attestation — a signed proof of exactly which code is running.\n\nAnyone can compare that proof against the public GitHub commit hash. If they match, the code hasn't been tampered with. If they don't, the enclave is compromised and the community would know immediately.\n\nCiteback will run three TEE instances across geographically separate providers (different legal jurisdictions, different hardware operators). Funds will require 2-of-3 threshold signatures to move — no single instance can act alone. Simultaneous compromise of all three nodes requires nation-state-level coordination across independent infrastructure.\n\nThis is how Citeback proves "the founder can't touch the wallets" — not through promises, but through math.`,
      },
      {
        q: 'How do I verify the wallets are legitimate?',
        a: `Every campaign wallet publishes a view key — a read-only key that lets anyone verify the wallet's full transaction history without having spending access. Both Monero (XMR) and Zano (ZANO) wallets support view keys: Monero's view key reveals all incoming transactions to that wallet; Zano's view key provides equivalent read-only transaction visibility.\n\nYou can:\n• Verify the balance matches what the campaign shows\n• Verify every incoming donation\n• Verify every outgoing disbursement and its destination\n• Cross-reference the disbursement against the public action log\n\nEvery TEE execution will be signed by the TEE attestation key and logged permanently to GitHub.`,
      },
      {
        q: 'What happens if a campaign doesn\'t reach its goal?',
        a: `If a campaign deadline arrives with the goal unmet, funds automatically redirect to the highest-priority active campaign in the same category (billboard funds go to another billboard campaign, FOIA funds to another FOIA, etc.).\n\nOperators or community members can request an extension (see Campaign Extensions). Maximum 2 extensions per campaign. After that, redirect is automatic.\n\nAll donations are final and non-refundable. This is disclosed on every campaign card. Monero's privacy model makes identifying senders technically infeasible without asking donors to partially deanonymize themselves — we won't do that.`,
      },
      {
        q: 'Where does the platform fee go?',
        a: `A graduated platform fee on every donation goes to the operations wallet — also inside the TEE, also publicly verifiable via view key. Fees scale with 90-day rolling operator volume: 5% (up to $10k), 4.5% ($10,001–$25k), 4% ($25,001–$50k), 3% (above $50k). See GOVERNANCE.md §7.3 for the full schedule.\n\nThis covers: VPS and TEE infrastructure costs, Monero and Zano node operation, and a reserve buffer.\n\nThe operations wallet balance is public. Any surplus beyond 6 months of operating costs is put to a community vote for redistribution (additional campaigns, reserve increase, etc.). The founder cannot touch it.`,
      },
      {
        q: 'Why Monero and Zano — and not Bitcoin or USDC?',
        a: `Monero (XMR) and Zano (ZANO) are the two major privacy coins with privacy enforced at the protocol level — not optional, not an add-on.\n\n**Why not Bitcoin or USDC?**\nBitcoin and USDC are fully transparent blockchains — every transaction, amount, and address is publicly visible forever. For a surveillance-resistance platform, using a transparent blockchain would be self-defeating. Donors shouldn't have to worry that their support creates a public record connecting them to Fourth Amendment activism.\n\n**Why Monero (XMR)?**\nMonero is the established gold standard for private transactions:\n• Ring signatures obscure the real sender by mixing it with decoy inputs — every spend is ambiguous by design\n• Stealth addresses generate a one-time address per transaction — no on-chain link between payments to the same recipient\n• RingCT hides transaction amounts via Pedersen commitments and range proofs\n• Fast, low-fee (typically well under $0.05), programmatic control via monero-wallet-rpc\n• Wallet ecosystem: Cake Wallet (iOS/Android), Monerujo (Android), Feather Wallet (desktop — built-in Tor), Monero GUI (official desktop)\n\n**Why Zano (ZANO)?**\nZano is the second pillar — privacy-by-default like Monero, with additional properties:\n• Confidential Assets: amounts, addresses, AND asset types are all hidden at protocol level\n• Hybrid PoW+PoS consensus — attacking Zano requires both hashpower AND stake\n• Ionic Swaps enable atomic peer-to-peer exchange without a centralized intermediary\n• A complementary privacy layer: donors who prefer Zano get the same guarantees\n\nRunning both creates a more resilient, inclusive privacy stack — XMR-maximalists and Zano users both have a home here.`,
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
        a: `Citeback is being organized as a Wyoming DAO LLC (formation is a Phase 2 launch prerequisite). Pre-launch, the founder acts as interim platform operator.\n\nWhat the operator CANNOT do is touch wallet keys — those are held exclusively in the TEE. The operator has no ability to redirect funds, access campaign wallets, or override disbursement rules. Community governance holds the operator accountable.\n\nPre-launch, the founder acts as the platform operator — reviewing campaign proposals, managing onboarding, and handling OFAC screening — but still cannot access wallet keys (those are in the TEE). After Phase 2 launch and LLC formation, the founder's account has identical permissions to any other community participant. No veto, no special wallet access, no back door.`,
      },
      {
        q: 'How does community voting work?',
        a: `Anyone can vote by signing their vote with a Monero private key, Zano private key, or Nostr key — proves identity without revealing it.\n\nVoting weight is proportional to economic participation. A logarithmic formula rewards participation while limiting concentration. Funding and voting are decoupled: donate any amount you want. Only governance weight is capped.\n\nFormula: weight = max(1, log₂(donation / $5) + 1)\n• $5 donation → weight 1.0 (floor)\n• $10 donation → weight 2.0\n• $1,280+ donation → weight 9.0 (maximum cap)\n\nDonations must be at least 72 hours old at the time a proposal is submitted to qualify — no last-minute flooding. See GOVERNANCE.md §5 for the full specification.\n\nDifferent decisions require different thresholds:\n• Campaign proposals: simple majority, 10-voter quorum\n• Disbursement challenges: 60% to block (default is release)\n• Rule changes: 60–75% supermajority + 7–14 day time-lock`,
      },
      {
        q: 'What are time-locks and why do they exist?',
        a: `After a vote passes, major changes don't take effect immediately. They wait:\n\n• Minor changes: 24 hours\n• Rule changes: 7 days\n• Governance changes: 14 days\n\nThis window gives the community time to react. If a bad change slips through a vote, the time-lock allows a counter-proposal before the change takes effect.\n\nTime-locks make coordinated attacks expensive. You can't rush a hostile takeover through a 14-day window without the community noticing.`,
      },
      {
        q: 'Can the founder change the rules or take back control?',
        a: `No — by architectural design.\n\nA human operator (Wyoming DAO LLC, currently in formation) will run the platform — but the operator cannot access funds. After Phase 2 launch:\n• Wallet keys will exist only inside the TEE — inaccessible to everyone, including the operator and the founder\n• Site changes require community votes that no individual can unilaterally pass\n• Governance rules have 75% supermajority + 14-day time-lock requirements\n• The TEE attestation is publicly verifiable — any tampering is immediately detectable\n\nThe founder bootstrapped the system. The operator keeps it running. The TEE holds the keys. Nobody can redirect the money.`,
      },
      {
        q: 'What happens if Citeback itself disappears?',
        a: `The platform is designed to survive its own operators. Here's what that means concretely:\n\n• The GitHub repo (github.com/citeback/citebackwebsite) is public and forkable — anyone can deploy a full copy of the platform without permission or coordination with us.\n• The governance spec, campaign taxonomy, and campaign data are all in the repo. A fork doesn't start from zero — it starts with the full operational context intact.\n• The domain isn't the platform. citeback.com can be re-pointed, replaced, or abandoned. Whoever runs the fork picks their own domain. The platform isn't tied to any URL.\n• Active wallet balances are governed by the TEE rules, not the operator. A platform shutdown doesn't affect funds held in live campaign wallets — the TEE enclaves continue to enforce disbursement rules until campaigns close or the community votes on wind-down via the fork/recovery path (GOVERNANCE.md §13).\n\nIf Citeback disappears, the tools don't. This is by design. Surveillance doesn't stop. Neither should the ability to fund accountability work.`,
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
        a: `Operators are community members who run campaigns — renting billboards, filing FOIAs, funding legal work. Operators must verify their real identity privately with the platform's legal entity — names are never published. Publicly, operators are represented by a Monero address or Nostr key.\n\nOperators build a reputation score through completed campaigns. Campaign caps scale with completed volume, not identity:\n\n| Completed Volume | Max Campaign Goal |\n|---|---|\n| Starting | $1,000 |\n| $2,000 completed | $5,000 |\n| $10,000 completed | $25,000 |\n| $50,000 completed | $100,000 |\n| $100,000 completed | Unlimited (community vote) |`,
      },
      {
        q: 'How do I know an operator actually completed the task?',
        a: `Operators must submit verified proof before any disbursement is released:\n\n• Billboard campaigns: photo of the live billboard with GPS tag\n• FOIA campaigns: copy of the submitted request + confirmation receipt\n• Legal campaigns: court filing number or signed retainer\n\nAfter proof is submitted, a 48-hour public challenge window opens. Any community member can challenge a disbursement with counter-evidence. 60% majority required to block it.\n\nOperators who submit fraudulent proofs lose 25+ reputation points, face a permanent public misconduct flag, and cannot resubmit.`,
      },
      {
        q: 'What stops someone from grinding reputation then stealing a large campaign fund?',
        a: `Several layers:\n\n1. At launch, no human holds wallet keys — funds live in the TEE. Operators submit proof and receive payment, they don't hold the campaign wallet.\n\n2. The 48-hour challenge window catches fraudulent proofs before disbursement.\n\n3. Reputation caps mean you need a real track record (not just grinded small jobs) to access large campaigns.\n\n4. Confirmed misconduct is permanent and public — there's no clean escape.\n\n5. Any community member with sufficient reputation (score ≥ 25) can trigger a 12-hour provisional pause if something looks wrong. The pause is then put to a community vote to confirm or expire.\n\nCould someone game this? Theoretically. But the cost-benefit is heavily weighted against it.`,
      },
      {
        q: 'Can campaigns be extended if they\'re close to their goal?',
        a: `Yes. Within the last 25% of a campaign's time window, the operator or any community member can request an extension.\n\nThe request is put to a community vote (48-hour window, simple majority). If approved, the deadline extends by 7, 14, or 30 days.\n\nMaximum 2 extensions per campaign. If the second extension expires unfunded, the redirect logic kicks in — no third chances. This prevents indefinitely stalled campaigns from sitting on donated funds.`,
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
        a: `Yes. Every line of code running on Citeback is public on GitHub.\n\nThis includes:\n• The wallet agent (disbursement logic, fee model, extension rules)\n• The site agent (merge rules, deployment logic)\n• The governance rules (vote thresholds, time-locks)\n• The campaign rules (caps, redirect logic)\n\nYou don't have to trust us. You can read the code, audit it, propose changes, or fork it entirely.`,
      },
      {
        q: 'How do I verify the TEE is running the published code?',
        a: `The TEE produces a cryptographic attestation: a signed proof containing the hash of the running code.\n\nSteps to verify:\n1. Pull the current GitHub commit hash from the public repo\n2. Fetch the TEE attestation from the platform's verification endpoint\n3. Compare the code hash in the attestation against the GitHub commit\n\nIf they match: the enclave is running exactly the published, audited code.\nIf they don't: something is wrong, and the community should be alerted immediately.\n\nWe'll publish a verification guide and a one-click checker tool when Phase 2 launches.`,
      },
      {
        q: 'How do site changes get made?',
        a: `All site changes go through GitHub pull requests. The process:\n\n1. Anyone opens a PR with the proposed change\n2. Community discusses it publicly in the PR comments\n3. Community votes (threshold depends on change type)\n4. Vote passes → Site Agent waits for the time-lock to expire → deploys automatically\n5. Every deployment is logged with commit hash, vote count, and timestamp\n\nThe founder cannot push changes outside this process. Neither can anyone else.`,
      },
    ],
  },
  {
    icon: <Shield size={20} />,
    label: 'Donor Rules',
    color: '#5dade2',
    questions: [
      {
        q: 'Can anyone donate?',
        a: `Donations from individuals or entities on OFAC sanctions lists are strictly prohibited by our Terms of Use. By sending funds to any campaign wallet, you represent that you are not a Specially Designated National or otherwise sanctioned party.

**OFAC gap disclosure (required reading):** Because Monero and Zano transactions are private at the protocol level, the platform has no technical ability to screen anonymous donors against the OFAC SDN list. This is a structural limitation — not a policy choice — and is documented in GOVERNANCE.md §9.3. The ToS prohibition is a binding legal condition, but on-chain enforcement is not possible on the donor side.

Campaign operators (who receive disbursements) are separately screened against the OFAC SDN list by the platform entity before onboarding and again by the TEE at every disbursement. The donor-side limitation and the attorney-required legal analysis of this gap are both documented as pre-launch open questions in GOVERNANCE.md. No funds go live until written attorney guidance is received.`,
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
        a: `Your donation uses XMR or ZANO protocol-level privacy — no on-chain link between you and the campaign. However, browsing this site creates standard server-side and third-party logs that are separate from your donation privacy:

• **Hosting:** This site runs on Netlify, which logs visitor IP addresses per standard hosting practice. Netlify's data retention follows their published privacy policy.
• **Fonts:** This site loads fonts from Bunny CDN (fonts.bunny.net). Bunny CDN logs standard CDN access requests including IP addresses.
• **Map tiles:** The surveillance camera map loads tiles from CARTO (*.basemaps.cartocdn.com). CARTO receives tile requests including your IP address.
• **External data APIs:** Features powered by CourtListener, USASpending.gov, the Senate LDA API, and api.congress.gov make client-side requests that expose your IP to those services.
• **Form submissions:** Campaign proposals and registry applications submitted via this site are processed and stored by Netlify Forms, including any contact information you provide and your IP address at submission time.

For maximum privacy when browsing this site, use Tor Browser, a trusted VPN, or a privacy-preserving proxy. Your XMR or ZANO donation remains private regardless of browsing method — coin-level privacy is at the protocol layer, not the application layer. These infrastructure disclosures do not affect donation privacy.`,
    },
    {
      q: 'What are the honest risks?',
        a: `We'll be straight with you:\n\n**TEE side-channel attacks** — Known attack classes include Spectre/Meltdown-class CPU vulnerabilities and physical DRAM bus interposer attacks (WireTap Sept 2025, TEE.Fail Oct 2025 demonstrated ~$1,000 hardware attacks against TDX/SGX/SEV-SNP on fully patched systems — requiring physical server access). TEE providers patch software-exploitable vulnerabilities; the 2-of-3 geographic distribution across separate providers is the primary defense against physical attacks.\n\n**Fake proof submissions** — The platform operator reviews proof documents, but cannot fully authenticate every photo or receipt. The 48-hour community challenge window and reputation staking are the primary defenses.\n\n**Sybil attacks on voting** — Addressed through logarithmic proof-of-donation weighting (cap at $1,280 → weight 9.0, per GOVERNANCE.md §5). Spinning up fake wallets costs real money — a $5 floor applies, and the 72-hour age requirement blocks last-minute attacks. The human operator monitors for suspicious coordination patterns and can trigger provisional pauses; any pause must be confirmed by community vote within 12 hours. Not zero-risk, but economically irrational at scale.\n\n**Coordinated whale rings** — Multiple actors each donating to the cap and voting together off-platform. Quorum requirements and time-locks limit exposure; fully solving this without breaking donor privacy isn't possible.\n\n**TEE provider compromise** — If the TEE hardware vendor is compromised at a nation-state level, attestation could theoretically be forged. This is the hardest attack to defend against.\n\n**Regulatory risk** — Citeback is designed to fund only lawful activities and undergoes pre-launch attorney review of identified regulatory questions — including FinCEN/MSB classification, OFAC compliance, and state money transmission licensing. These questions are documented as open issues in governance; no funds go live until written legal guidance is in hand. Regulatory environments also change. The open source + forkable design ensures the platform can adapt.`,
      },
      {
        q: 'What can governance NOT do?',
        a: `Even with 100% community consensus, some things are permanently off-limits — enforced by the TEE code, not policy:\n\n• Extract wallet private keys from the enclave\n• Retroactively reverse completed disbursements\n• Clear a confirmed misconduct record\n• Identify donors (Monero privacy is immutable)\n• Grant any individual special access above others\n\nAdditionally, by governance rule (supermajority vote required to change — not TEE-enforced architecture):\n• Off-mission campaigns require a 75% community supermajority\n\nThe TEE constraints listed above cannot be voted away — they are in the architecture. Governance-level rules require a supermajority and time-lock to change, per the published governance spec.`,
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
            Phase 2 brings the TEE enclave, live wallets, and cryptographic verification. Everything described here reflects the
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
          { icon: '🔐', title: 'TEE-Secured Wallets', desc: 'At launch: no human holds keys. Not even the founder.', link: 'https://github.com/citeback/citebackwebsite/blob/main/ARCHITECTURE.md', linkLabel: 'Architecture spec' },
          { icon: '📖', title: 'Open Source Code', desc: 'Every rule is public and auditable.', link: 'https://github.com/citeback/citebackwebsite', linkLabel: 'View on GitHub' },
          { icon: '🔍', title: 'Verifiable Proofs', desc: 'Cryptographic attestation proves what\'s running.', link: 'https://github.com/citeback/citebackwebsite/blob/main/ARCHITECTURE.md', linkLabel: 'Attestation spec', prelaunch: 'Live attestation published at mainnet' },
          { icon: '⏱️', title: 'Time-Locked Changes', desc: 'Rules change slowly, with full community visibility.', link: 'https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md', linkLabel: 'Governance doc' },
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
            When Phase 2 launches, we'll publish the TEE attestation endpoint and a step-by-step verification guide.
            You'll be able to cryptographically confirm that the code running on our infrastructure matches the
            public GitHub repo — down to the exact commit hash. Until then, the architecture and governance specs
            are available in our GitHub repository for community review.
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
  )
}
