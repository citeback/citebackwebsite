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
        a: `No human does — including the founder.\n\nEvery campaign wallet lives inside a Trusted Execution Environment (TEE): a hardware-level secure enclave where code runs in complete isolation. Even the server owner cannot extract keys, inspect memory, or alter what's running without invalidating a cryptographic proof.\n\nThe AI agent inside the enclave creates wallets, receives donations, and disburses funds according to the open source rules. Nobody bypasses this.`,
      },
      {
        q: 'What is a Trusted Execution Environment (TEE)?',
        a: `A TEE is a tamper-proof secure enclave built into modern CPUs (Intel SGX, ARM TrustZone). Code running inside a TEE produces a cryptographic attestation — a signed proof of exactly which code is running.\n\nAnyone can compare that proof against the public GitHub commit hash. If they match, the code hasn't been tampered with. If they don't, the enclave is compromised and the community would know immediately.\n\nThis is how Citeback proves "the founder can't touch the wallets" — not through promises, but through math.`,
      },
      {
        q: 'How do I verify the wallets are legitimate?',
        a: `Every campaign wallet publishes a Monero view key — a read-only key that lets anyone verify the wallet's full transaction history without having spending access.\n\nYou can:\n• Verify the balance matches what the campaign shows\n• Verify every incoming donation\n• Verify every outgoing disbursement and its destination\n• Cross-reference the disbursement against the public action log\n\nEvery action the AI takes is also signed by the TEE attestation key and logged permanently to GitHub.`,
      },
      {
        q: 'What happens if a campaign doesn\'t reach its goal?',
        a: `If a campaign deadline arrives with the goal unmet, funds automatically redirect to the highest-priority active campaign in the same category (billboard funds go to another billboard campaign, FOIA funds to another FOIA, etc.).\n\nOperators or community members can request an extension (see Campaign Extensions). Maximum 2 extensions per campaign. After that, redirect is automatic.\n\nAll donations are final and non-refundable. This is disclosed on every campaign card. Monero's privacy model makes identifying senders technically infeasible without asking donors to partially deanonymize themselves — we won't do that.`,
      },
      {
        q: 'Where does the 1% platform fee go?',
        a: `1% of every donation goes to the platform operations wallet — also inside the TEE, also publicly verifiable via view key.\n\nThis covers: VPS and TEE infrastructure costs, Monero node operation, and a reserve buffer.\n\nThe operations wallet balance is public. Any surplus beyond 6 months of operating costs is put to a community vote for redistribution (additional campaigns, reserve increase, etc.). The founder cannot touch it.`,
      },
      {
        q: 'Why Monero and not Bitcoin or USDC?',
        a: `Monero (XMR) is the only major cryptocurrency with privacy built in by default:\n\n• Ring signatures hide the sender in every transaction\n• Stealth addresses make every transaction unlinkable on-chain\n• RingCT hides transaction amounts\n\nFor a surveillance-resistance platform, using a transparent blockchain would be self-defeating. Donors shouldn't have to worry that their support creates a public record connecting them to Fourth Amendment activism.\n\nMonero is also fast, cheap (fractions of a cent per transaction), and has a working RPC API that allows full programmatic wallet management inside the TEE.`,
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
        a: `The community runs Citeback. The founder built it and will formally step back after Phase 2 launch (when the TEE wallet agent goes live).\n\nAfter handoff, the founder's account has identical permissions to any other community participant. No veto, no special access, no back door.\n\nThe platform is run by its open source code, enforced by the TEE, governed by community vote.`,
      },
      {
        q: 'How does community voting work?',
        a: `Anyone can vote by signing their vote with a Monero private key or Nostr key — proves identity without revealing it.\n\nVoting weight is earned through donation history, not wallet count. Funding and voting are decoupled: donate any amount you want. Only governance weight is capped.\n\n• Below 0.5% of campaign goal → no voting weight (Sybil floor)\n• 0.5%–8% of goal → full 1:1 weight\n• 8%–20% of goal → diminishing returns\n• Above 20% of goal → capped\n\nThresholds scale with campaign size so attacking a $8,000 legal fund costs proportionally more than attacking a $750 billboard. Only wallets with donation history before a proposal was submitted can vote — last-minute flooding is impossible by design.\n\nAn ensemble of independent AI models monitors for coordinated attack patterns. Models must reach consensus before any protective action triggers. Confirmed attack wallets are permanently blacklisted. If an active attack is distorting a live vote, it can be paused and restarted with bad wallets excluded.\n\nAI models can only be upgraded to demonstrably better ones — never downgraded. Upgrades go through a 30-day blind probation period and must outscore the current model on Citeback's threat-specific benchmarks.\n\nDifferent decisions require different thresholds:\n• Campaign proposals: simple majority, 24hr review\n• Disbursement challenges: 60% to block (default is release)\n• Rule changes: 60–75% supermajority + 7–14 day time-lock`,
      },
      {
        q: 'What are time-locks and why do they exist?',
        a: `After a vote passes, major changes don't take effect immediately. They wait:\n\n• Minor changes: 24 hours\n• Rule changes: 7 days\n• Governance changes: 14 days\n\nThis window gives the community time to react. If a bad change slips through a vote, the time-lock allows a counter-proposal before the change takes effect.\n\nTime-locks make coordinated attacks expensive. You can't rush a hostile takeover through a 14-day window without the community noticing.`,
      },
      {
        q: 'Can the founder change the rules or take back control?',
        a: `No.\n\nAfter Phase 2 launch:\n• Wallet keys exist only inside the TEE — inaccessible to everyone including the founder\n• Site changes require community votes that the founder cannot unilaterally pass\n• Governance rules have 75% supermajority + 14-day time-lock requirements\n• The TEE attestation is publicly verifiable — any tampering is immediately detectable\n\nThe founder bootstrapped the system. The system no longer needs the founder.`,
      },
      {
        q: 'What happens if Citeback itself disappears?',
        a: `The code is open source (GitHub). Any community member can fork it and redeploy on new infrastructure.\n\nThere's no domain lock-in, no proprietary backend, no secret sauce. If Citeback the organization disappears, Citeback the platform lives on in whoever wants to run it.\n\nThis is by design. Surveillance doesn't stop. The tools to resist it shouldn't either.`,
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
        a: `Operators are community members who run campaigns — renting billboards, filing FOIAs, funding legal work. They're identified by a Monero address or Nostr key (no real name required).\n\nOperators build a reputation score through completed campaigns. New operators start with a $500 campaign cap. Trust is earned through track record, not claims.\n\n| Score | Max Campaign Goal |\n| 0–20 | $500 |\n| 21–50 | $2,000 |\n| 51–100 | $10,000 |\n| 100+ | Unlimited |`,
      },
      {
        q: 'How do I know an operator actually completed the task?',
        a: `Operators must submit verified proof before any disbursement is released:\n\n• Billboard campaigns: photo of the live billboard with GPS tag\n• FOIA campaigns: copy of the submitted request + confirmation receipt\n• Legal campaigns: court filing number or signed retainer\n\nAfter proof is submitted, a 48-hour public challenge window opens. Any community member can challenge a disbursement with counter-evidence. 60% majority required to block it.\n\nOperators who submit fraudulent proofs lose 25+ reputation points, face a permanent public misconduct flag, and cannot resubmit.`,
      },
      {
        q: 'What stops someone from grinding reputation then stealing a large campaign fund?',
        a: `Several layers:\n\n1. No human holds wallet keys — funds live in the TEE. Operators submit proof and receive payment, they don't hold the campaign wallet.\n\n2. The 48-hour challenge window catches fraudulent proofs before disbursement.\n\n3. Reputation caps mean you need a real track record (not just grinded small jobs) to access large campaigns.\n\n4. Confirmed misconduct is permanent and public — there's no clean escape.\n\n5. The community can pause the system if something looks wrong (requires 3 established operators to cosign).\n\nCould someone game this? Theoretically. But the cost-benefit is heavily weighted against it.`,
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
    icon: <AlertTriangle size={20} />,
    label: 'Risks & Limits',
    color: '#e67e22',
    questions: [
      {
        q: 'What are the honest risks?',
        a: `We'll be straight with you:\n\n**TEE side-channel attacks** — Spectre/Meltdown-class vulnerabilities can potentially leak data from enclaves. TEE providers patch these, but it's a known research area. We monitor and update.\n\n**Fake proof submissions** — The AI verifies proof documents are present, but can't fully authenticate every photo or receipt. The 48-hour challenge window and reputation staking are the primary defenses.\n\n**Sybil attacks on voting** — Addressed through proof-of-donation weighting scaled to campaign size. Spinning up fake wallets costs real money proportional to what's at stake — a minimum donation threshold applies, and the cap is set as a percentage of the campaign goal. An AI governance monitor watches for coordinated patterns and proposes countermeasures. Not zero-risk, but economically irrational at scale.\n\n**Coordinated whale rings** — Multiple actors each donating to the cap and voting together off-platform. Quorum requirements and time-locks limit exposure; fully solving this without breaking donor privacy isn't possible.\n\n**TEE provider compromise** — If the TEE hardware vendor is compromised at a nation-state level, attestation could theoretically be forged. This is the hardest attack to defend against.\n\n**Regulatory risk** — Citeback operates entirely within the law (free speech, legal fundraising). But regulatory environments change. The open source + forkable design ensures the platform can adapt.`,
      },
      {
        q: 'What can governance NOT do?',
        a: `Even with 100% community consensus, some things are permanently off-limits — enforced by the TEE code, not policy:\n\n• Extract wallet private keys from the enclave\n• Retroactively reverse completed disbursements\n• Clear a confirmed misconduct record\n• Identify donors (Monero privacy is immutable)\n• Grant any individual special access above others\n\nThese constraints can't be voted away. They're in the code.`,
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

export default function TrustFAQ() {
  const [activeSection, setActiveSection] = useState(0)

  return (
    <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Phase Status Banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.25)',
        borderRadius: 10, padding: '14px 18px', marginBottom: 36,
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
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>How It Works & Why You Can Trust It</h2>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14, maxWidth: 620, lineHeight: 1.7 }}>
          Citeback is designed so you don't have to trust us. Every claim here is backed by open source code and cryptographic proofs — not promises.
        </p>
      </div>

      {/* Trust Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 48 }}>
        {[
          { icon: '🔐', title: 'TEE-Secured Wallets', desc: 'No human holds keys. Not even the founder.' },
          { icon: '📖', title: 'Open Source Code', desc: 'Every rule is public and auditable.' },
          { icon: '🔍', title: 'Verifiable Proofs', desc: 'Cryptographic attestation proves what\'s running.' },
          { icon: '⏱️', title: 'Time-Locked Changes', desc: 'Rules change slowly, with full community visibility.' },
          { icon: '👁️', title: 'View Keys Published', desc: 'Anyone can verify every wallet transaction.' },
          { icon: '🌿', title: 'Forkable Forever', desc: 'The code outlives any individual or organization.' },
        ].map((p, i) => (
          <div key={i} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 18px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{p.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{p.desc}</div>
          </div>
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
              padding: '8px 14px', borderRadius: 8, border: '1px solid',
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
        borderRadius: 14, padding: '0 24px',
      }}>
        {sections[activeSection].questions.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} />
        ))}
      </div>

      {/* Verification CTA */}
      <div style={{
        marginTop: 32, background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.2)',
        borderRadius: 12, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start',
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
    </section>
  )
}
