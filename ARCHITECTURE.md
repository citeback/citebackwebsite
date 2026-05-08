# Citeback — System Architecture

> Status: Pre-launch design specification  
> Last updated: 2026-05-04  
> Operational model: Split — Wyoming DAO LLC (human operator) + Direct Operator Wallets (no platform custody)

---

## Overview

Citeback is a decentralized surveillance-resistance platform. Its core design goal is **credible neutrality** — the system operates according to publicly verifiable rules, no individual (including the founder) can unilaterally control funds or censor campaigns, and every action is permanently logged for community inspection.

This document describes the full technical architecture, from wallet management through governance and site operations.

---

## Design Principles

1. **Citeback never holds funds** — Operators post their own XMR/ZANO wallet addresses. Contributions go directly to operator-controlled wallets. Citeback has no private keys, no custody, no automated disbursements. The platform is a coordination and accountability layer, not a financial intermediary.
2. **Identified human operator for governance and content** — The Wyoming DAO LLC handles site management, campaign review, operator onboarding, and OFAC pre-screening. Human judgment governs eligibility and editorial decisions.
3. **Verification without control** — Operators provide view keys (read-only) to their campaign wallets. Citeback uses view keys to verify wallet balances and contribution activity — not to access or move funds.
4. **Irreversibility by design** — Rules are slow to change on purpose. No single actor can rush changes through.
5. **Privacy-preserving** — Contributors are anonymous. Operators earn reputation without revealing identity.
6. **Self-sustaining** — The platform charges no fee on campaign funds. Platform infrastructure is funded by founding operator capital contributions to the Wyoming DAO LLC, supplemented by voluntary user tips to the LLC. Long-term: grant funding from aligned foundations (Open Technology Fund, Knight Foundation).
7. **Community-governed** — The community owns the rules. Changes require public deliberation and time-locks.

---

## Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    CITEBACK PLATFORM                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │    OPERATIONAL LAYER  (Wyoming DAO LLC)           │   │
│  │                                                  │   │
│  │  Site management · Campaign proposal review      │   │
│  │  Operator onboarding + OFAC pre-screening        │   │
│  │  Legal compliance · Content editorial judgment   │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │ (approved campaigns)           │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │    DIRECT WALLET LAYER  (Operator-Controlled)   │   │
│  │                                                  │   │
│  │  Operator posts own XMR/ZANO wallet address      │   │
│  │  Contributions go directly to operator wallet    │   │
│  │  Citeback NEVER holds funds or private keys      │   │
│  │  View key provided → platform verifies balance   │   │
│  │  Early drain = permanent operator ban            │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────▼─────────────────────────┐    │
│  │              PUBLIC LAYER                       │    │
│  │                                                 │    │
│  │  GitHub repo (code + action log)                │    │
│  │  View keys (campaign wallet transparency)       │    │
│  │  Community governance interface (site)          │    │
│  │  Campaign proposals + proofs                    │    │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```
---

## 0. Operational Layer (Wyoming DAO LLC)

### What It Is

The Wyoming DAO LLC is the identified human operator of the Citeback platform. It serves as the legal entity responsible for governance and compliance functions that require human editorial judgment and documented legal process. The LLC does **not** have access to campaign wallet private keys at any point; operators hold their own keys under the direct wallet model.

### Responsibilities

| Function | Owner |
|---|---|
| Site management and content updates | Wyoming DAO LLC |
| Campaign proposal review and approval | Wyoming DAO LLC |
| Operator onboarding and identity verification | Wyoming DAO LLC |
| OFAC SDN pre-screening of operators | Wyoming DAO LLC |
| Legal compliance and regulatory response | Wyoming DAO LLC |
| Campaign taxonomy enforcement (editorial) | Wyoming DAO LLC |
| View key monitoring (balance verification) | Wyoming DAO LLC |
| Operator ban enforcement (early drain rule) | Wyoming DAO LLC |
| Wallet creation and custody | Operator (their own wallet) |
| Fund receipt and management | Operator (direct to their wallet) |
| Disbursements | Operator (controls their own funds) |

### What the Operational Layer Cannot Do

- It cannot access operator wallet private keys (operators never share them)
- It cannot move or freeze funds in operator wallets
- It cannot retroactively alter the append-only action log

### Legal Significance

The Wyoming DAO LLC's role creates an identifiable legal entity for regulatory purposes (FinCEN registration, OFAC compliance documentation, §230 platform status, MSB AML program). Critically, because Citeback never holds funds — operators maintain full custody of their own wallets — the platform's custodial exposure is minimal. View keys allow balance verification without spending access.

---

## 1. Direct Operator Wallet Model

### What It Is

Citeback uses a direct wallet model: operators post their own XMR or ZANO wallet addresses when a campaign is approved. Contributors send funds directly to those operator-controlled addresses. **Citeback never touches the funds.**

**Key properties:**
- Citeback has zero private key access — no custody, no escrow, no automated disbursements
- Operators control their own wallets and are responsible for fulfilling campaign obligations
- Citeback uses view keys (read-only) to verify wallet balances and contribution activity
- Operators who drain funds before campaign completion face permanent platform ban

### Why This Model

The direct wallet model was chosen over a TEE (Trusted Execution Environment) approach because:

1. **Lower complexity** — TEE infrastructure (Phala/Marlin/SGX) introduces complex hardware trust dependencies. Direct wallets have no such layer.
2. **Faster deployment** — No months-long TEE build required. Operators can go live as soon as their wallet address is verified.
3. **No platform custody** — Without holding funds, Citeback has a fundamentally cleaner regulatory posture. FinCEN's money transmitter analysis focuses on entities that *receive, transmit, or control* funds. Citeback does none of these.
4. **Operator accountability via transparency** — View keys make wallet balances publicly verifiable. The community can monitor campaign funding status in real time. Early drain is detectable and triggers a permanent ban.

### View Key Verification

For each approved campaign:
1. Operator provides a Monero view key (read-only, cannot spend) or equivalent ZANO audit capability
2. Citeback publishes the view key alongside the wallet address
3. Anyone can independently verify the current campaign balance and contribution history
4. Platform monitors for anomalous drain events (large outflows before campaign milestone completion)

### Operator Accountability: The Early Drain Rule

Operators who withdraw campaign funds before milestone completion without community approval face:
- Immediate permanent ban from the platform
- Public notation on their operator profile
- Reporting to the community via the public action log

---

## 2. Wallet Model

### How It Works

- Operator creates and controls their own XMR or ZANO wallet
- One wallet address per campaign (operator may use a dedicated campaign wallet)
- Operator provides their wallet address at campaign proposal time
- Operator provides a view key so Citeback and the public can verify balance activity

### Wallet Publication Flow

```
Campaign proposal approved (community vote threshold met)
         ↓
Operator provides XMR/ZANO wallet address + view key
         ↓
Campaign wallet address posted publicly to site + action log
         ↓
View key published — anyone can verify balance and contribution history
         ↓
Campaign goes live for contributions
         ↓
Contributors send XMR/ZANO directly to published wallet address
```

### Completion and Withdrawal Flow

```
Operator submits completion proof (receipt, photo, court filing, etc.)
         ↓
48-hour public challenge window opens (logged publicly)
         ↓
No challenge filed → Operator withdraws funds from their own wallet
Challenge filed → Community vote triggered (see Governance)
         ↓
Operator completion logged: campaign ID, proof hash, timestamp
```

*Note: Citeback does not send or control the disbursement — the operator withdraws from their own wallet. The platform records the milestone completion event in the public action log.*

### Fee Model

**The platform charges no fee on campaign funds.** 100% of contributed funds are disbursed directly to campaign operators. No percentage is deducted at disbursement.

**Platform operations funding:**
Infrastructure costs (VPS, Monero node, domains) are covered by:
1. Founding operator capital contributions to the Wyoming DAO LLC
2. Voluntary user tips to the Wyoming DAO LLC (optional contributions from users who want to support platform operations — separate from campaign contributions, no effect on campaign funds or governance weight)
3. Long-term: grant funding from aligned foundations (Open Technology Fund, Knight Foundation, etc.)

All tip inflows and operational outflows are publicly documented in the quarterly transparency report.

### Unfunded Campaign Handling

Each campaign has a **deadline** and **funding goal**.

If deadline is reached with goal unmet:
1. Platform checks for active extension request (see Campaign Extensions)
2. If no extension pending: operator returns any accumulated funds to the highest-priority active campaign in same category (or refunds via agreed process)
3. Outcome logged publicly with reason

### Campaign Extensions

Operators or community members can request a campaign extension within the **last 25% of the campaign's time window**.

Rules:
- Maximum **2 extensions** per campaign
- Each extension requires a fresh community vote
- 48-hour voting window
- Simple majority to approve
- Extension duration options: 7, 14, or 30 days (requestor specifies, community approves)
- If second extension expires unfunded → operator closes campaign per agreed terms

Extension requests are logged publicly with reasoning. Community can see the full extension history on the campaign card.

---

## 3. Site Operations (Human-Operated)

Site management functions are performed by the Wyoming DAO LLC (human operator). Operations are governed by the same change classification rules below.

### Responsibilities

- Monitors the GitHub repository for approved PRs
- Deploys approved changes to Netlify
- Enforces merge rules encoded in open source configuration (human applies)
- Cannot merge PRs that haven't met community vote threshold
- Logs every deployment with commit hash and timestamp

### What the Site Operator Cannot Do

- Cannot merge PRs unilaterally without meeting vote thresholds
- Cannot push code without a qualifying community vote
- Cannot modify governance rules without the time-lock expiring
- Cannot access operator wallet private keys (direct wallet model — operators hold their own keys)

### Deployment Flow

```
Community PR opened on GitHub
         ↓
Discussion period (48hr minimum for minor, 7 days for major)
         ↓
Community vote threshold met (see Governance)
         ↓
Site Agent verifies vote threshold from public log
         ↓
Site Agent merges PR + triggers Netlify deploy
         ↓
Deployment logged: commit hash, PR number, voter count, timestamp
```

### Change Classification

| Change Type | Discussion Period | Vote Threshold |
|---|---|---|
| Content/copy fix | 24 hours | Simple majority |
| UI/UX change | 48 hours | Simple majority |
| Campaign rules change | 7 days | 60% supermajority |
| Governance rule change | 14 days | 75% supermajority |
| Funding model change | 14 days | 75% supermajority |

---

## 4. Action Logger

Every action taken by the Site Agent is written to an **append-only public log**.

Format:
```json
{
  "timestamp": "2026-06-01T14:22:00Z",
  "agent": "wallet",
  "action": "disbursement",
  "campaignId": 2,
  "amount_xmr": 0.82,
  "tx_id": "abc123...",
  "proof_hash": "sha256:def456...",
  "challenge_window_closed": "2026-06-03T14:22:00Z",
  "challenges": 0
}
```

The log is:
- Published to GitHub (permanent, immutable)
- Displayed in the site's Transparency section
- Cryptographically timestamped and append-only (tamper-evident)

---

## 5. Reputation System

Operators build reputation through completed campaigns. Reputation is public and permanent.

### Scoring

| Action | Points |
|---|---|
| Campaign completed with verified proof | +10 |
| Disbursement challenged, challenge rejected | +5 |
| Disbursement challenged, upheld | -25 |
| Misconduct flag confirmed by community | -50 |
| Extension requested, campaign completed | +3 |

### Campaign Caps by Reputation

| Score | Max Campaign Goal |
|---|---|
| 0–20 | $500 |
| 21–50 | $2,000 |
| 51–100 | $10,000 |
| 100+ | Unlimited |

New operators start with a $500 cap. Trust is earned through track record, not claims.

### Misconduct

Anyone can file a misconduct report with evidence. Community votes within 7 days. Confirmed misconduct:
- Reputation score zeroed
- Permanent public flag on operator profile
- Cannot be cleared — record is immutable

---

## 6. Community Identity

Operators and voters identify themselves via:
- **Monero address** (private, anonymous — used for reputation binding)
- **Nostr public key** (optional — adds cross-platform verifiability)

No email, no KYC, no registration. Identity is a cryptographic key. Reputation follows the key.

---

## 7. Security Model

### What Is Trusted

- The open source code (publicly audited)
- View key transparency (anyone can verify campaign wallet balances)
- The community challenge and governance process
- Operator reputation staking (skin in the game)

### What Is Not Trusted

- The founder
- The VPS provider
- Any individual operator or community member
- Platform claims without view key verification

### Known Limitations

- Social engineering of community voters — mitigated by time-locks and supermajority thresholds
- Fake proof submissions — mitigated by challenge window and reputation staking
- Operator early drain — mitigated by view key monitoring, permanent ban enforcement, and reputation system
- Platform downtime — funds in operator wallets are unaffected; only the coordination layer (site, governance) is unavailable

---

## 8. Self-Sovereignty

The entire platform is designed to outlive its founder.

- Code is open source on GitHub (MIT or GPL — TBD)
- Any community member can fork and redeploy
- The wallet infrastructure can be migrated to a new provider with community vote
- No domain lock-in: DNS can be community-transferred
- No single point of failure

If Citeback disappears, the code lives. Communities can rebuild.

---

## Roadmap

| Phase | Description |
|---|---|
| Phase 1 (now) | Static site, manual wallet ops, reputation scaffolding |
| Phase 2 | Direct wallet model live: operators post own wallets, view keys published, community voting UI, public action log |
| Phase 3 | Automated view key monitoring, operator staking system, governance tooling |
| Phase 4 | Full DAO-equivalent governance, cross-chain expansion |

---

## Related Documents

- `GOVERNANCE.md` — Full governance specification
- `src/data/campaigns.js` — Campaign data and rules
- `src/components/TrustFAQ.jsx` — Public-facing FAQ
- `src/components/Transparency.jsx` — Disbursement log and principles
