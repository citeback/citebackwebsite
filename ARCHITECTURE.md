# Citeback — System Architecture

> Status: Pre-launch design specification  
> Last updated: 2026-05-04  
> Operational model: Split — Wyoming DAO LLC (human operator) + Autonomous TEE (financial operations)

---

## Overview

Citeback is a decentralized surveillance-resistance platform. Its core design goal is **credible neutrality** — the system operates according to publicly verifiable rules, no individual (including the founder) can unilaterally control funds or censor campaigns, and every action is permanently logged for community inspection.

This document describes the full technical architecture, from wallet management through governance and site operations.

---

## Design Principles

1. **No trusted parties for financial operations** — Trust in financial execution is placed in open source code and cryptographic proofs, not people. The wallet layer holds all private keys; no human — including the Wyoming DAO LLC operator — can access or extract wallet keys.
2. **Identified human operator for governance and content** — The Wyoming DAO LLC handles site management, campaign review, operator onboarding, and OFAC pre-screening. Human judgment governs eligibility and editorial decisions; the wallet layer governs only financial execution.
3. **Irreversibility by design** — Rules are slow to change on purpose. No single actor can rush changes through.
4. **Privacy-preserving** — Contributors are anonymous. Operators earn reputation without revealing identity.
5. **Self-sustaining** — No platform fee on campaigns. 100% of contributed funds go directly to operators. Platform infrastructure is funded by founding operator capital contributions to the Wyoming DAO LLC and voluntary user tips. Long-term: grant funding from aligned foundations (Open Technology Fund, Knight Foundation). This eliminates any extractive relationship between the platform and the causes it supports.
6. **Community-governed** — The community owns the rules. Changes require public deliberation and time-locks.

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
│  │    WALLET LAYER  (Phase 2 — architecture published before launch)     │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │  Wallet Agent                           │    │   │
│  │  │                                         │    │   │
│  │  │  XMR/ZANO RPC   · Wallet creation       │    │   │
│  │  │  Fund custody   · Disbursements         │    │   │
│  │  │  Disbursement rules · Attestation           │    │   │
│  │  └───────────────────┬─────────────────────┘    │   │
│  │                      │                          │   │
│  │              ┌───────▼────────┐                 │   │
│  │              │  Action Logger │                 │   │
│  │              │  (append-only) │                 │   │
│  │              └───────┬────────┘                 │   │
│  └──────────────────────┼─────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────▼─────────────────────────┐    │
│  │              PUBLIC LAYER                       │    │
│  │                                                 │    │
│  │  GitHub repo (code + action log)                │    │
│  │  Monero view keys (wallet transparency)         │    │
│  │  Community voting interface (site)              │    │
│  │  Campaign proposals + proofs                    │    │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```
---

## 0. Operational Layer (Wyoming DAO LLC)

### What It Is

The Wyoming DAO LLC is the identified human operator of the Citeback platform. It serves as the legal entity responsible for governance and compliance functions that require human editorial judgment and documented legal process. The LLC does **not** have access to wallet private keys at any point; financial execution is delegated entirely to the TEE.

### Responsibilities

| Function | Owner |
|---|---|
| Site management and content updates | Wyoming DAO LLC |
| Campaign proposal review and approval | Wyoming DAO LLC |
| Operator onboarding and identity verification | Wyoming DAO LLC |
| OFAC SDN pre-screening of operators | Wyoming DAO LLC |
| Legal compliance and regulatory response | Wyoming DAO LLC |
| Campaign taxonomy enforcement (editorial) | Wyoming DAO LLC |
| Wallet creation | TEE (triggered after LLC approval) |
| Fund custody and private key management | TEE only |
| Automated disbursements | TEE only |
| Attestation | TEE only |

### What the Operational Layer Cannot Do

- It cannot access or extract TEE wallet private keys
- It cannot force disbursements outside governance rules
- It cannot modify the TEE's attestation-verified code unilaterally
- It cannot retroactively alter the append-only action log

### Legal Significance

The Wyoming DAO LLC's role creates an identifiable legal entity for regulatory purposes (FinCEN registration, OFAC compliance documentation, §230 platform status, MSB AML program) while keeping financial custody in the TEE where no single human actor can misappropriate funds.

---

## 1. Trusted Execution Environment (TEE)

### What It Is

A TEE is a hardware-level secure enclave where code runs in an isolated, tamper-proof environment. Even the server owner cannot inspect memory, extract keys, or modify the running code without invalidating a cryptographic attestation proof.

**Key property:** Anyone can verify that a specific, publicly auditable version of the code is running — and that nobody has tampered with it.

### Why Citeback Uses It

Without a TEE, whoever controls the VPS controls the wallets. A TEE removes this attack surface entirely. The Wyoming DAO LLC bootstraps the enclave, then has no more access to wallet keys than any other party. This is the security guarantee that separates financial custody from operational governance.

### TEE Providers (target)

- **Phala Network** — Substrate-based, WASM smart contracts in Intel SGX enclaves
- **Marlin Oyster** — TEE-based serverless, supports arbitrary code
- **AWS Nitro Enclaves** — Enterprise-grade, cryptographic attestation, harder to independently verify
- **Self-hosted SGX** — Maximum control, more operational complexity

**Recommended:** Phala or Marlin for launch (open verification, lower ops burden)

### Attestation

The enclave produces a cryptographic attestation: a signed proof that contains:
- Hash of the running code
- TEE platform certificate chain
- Timestamp

This hash matches the published GitHub commit. Community members can independently verify the enclave is running the audited code — not a backdoored version.

---

## 2. Wallet Agent

### Technology

- **Monero wallet RPC daemon** (`monero-wallet-rpc`) running inside the TEE
- One wallet created per campaign at proposal approval
- All wallet private keys exist only inside the enclave — never extracted

### Wallet Creation Flow

```
Campaign proposal approved (community vote threshold met)
         ↓
Wallet Agent creates new Monero wallet via RPC
         ↓
Campaign wallet address posted publicly to site + action log
         ↓
View key published — anyone can verify balance and transaction history
         ↓
Campaign goes live for donations
```

### Disbursement Flow

```
Operator submits completion proof (receipt, photo, court filing, etc.)
         ↓
Wallet Agent verifies: proof document present, campaign ID matches, amount ≤ goal
         ↓
48-hour public challenge window opens (logged publicly)
         ↓
No challenge filed → Wallet Agent sends XMR to operator's provided address
Challenge filed → Community vote triggered (see Governance)
         ↓
Disbursement logged: campaign ID, amount, XMR tx ID, timestamp, proof hash
```

### Fee Model

**No platform fee.** 100% of donated campaign funds are disbursed directly to the campaign operator. Nothing is deducted at disbursement.

At disbursement:
- 100% → operator's provided address

**Platform operations funding:**
Infrastructure costs (VPS, TEE instances, Monero node, domains) are covered by:
1. Founding operator capital contributions to the Wyoming DAO LLC
2. Voluntary tips from users who want to support the platform (separate from campaign donations)
3. Long-term: grant funding from aligned foundations (Open Technology Fund, Knight Foundation, etc.)

All tip inflows and operational outflows are publicly documented in the quarterly transparency report.

**Campaign goal fee buffer:**

When a campaign is proposed, the AI calculates:
- Task cost (operator-provided estimate)
- Estimated Monero transaction fee (~$0.01)
- 2% buffer for fee variance

The published campaign goal (task cost + buffer) is displayed transparently on each campaign card.

### Unfunded Campaign Handling

Each campaign has a **deadline** and **funding goal**.

If deadline is reached with goal unmet:
1. Wallet Agent checks for active extension request (see Campaign Extensions)
2. If no extension pending: funds redirect to highest-priority active campaign in same category
3. Redirect is logged publicly with reason
4. Original donors are notified via the public action log (no personal data — just the campaign)

**No refunds.** Monero's privacy model makes identifying senders technically complex and would require donors to provide a return address at donation time (partial deanonymization). The redirect model is disclosed upfront on every campaign card.

### Campaign Extensions

Operators or community members can request a campaign extension within the **last 25% of the campaign's time window**.

Rules:
- Maximum **2 extensions** per campaign
- Each extension requires a fresh community vote
- 48-hour voting window
- Simple majority to approve
- Extension duration options: 7, 14, or 30 days (requestor specifies, community approves)
- If second extension expires unfunded → redirect, no third chance

Extension requests are logged publicly with reasoning. Community can see the full extension history on the campaign card.

---

## 3. Site Agent (Human-Operated)

Under the split model, site management functions are performed by the Wyoming DAO LLC (human operator) rather than an autonomous TEE agent. The TEE's former Site Agent responsibilities — GitHub PR review, Netlify deployment, code auditing — are now human-executed operations governed by the same change classification rules below.

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
- Cannot access or direct the TEE Wallet Agent

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

Every action taken by the Wallet Agent or Site Agent is written to an **append-only public log**.

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
- Signed by the TEE attestation key (tamper-evident)

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

- The TEE hardware (Intel SGX / ARM TrustZone)
- The open source code (publicly audited)
- The cryptographic attestation (verifiable by anyone)

### What Is Not Trusted

- The founder
- The VPS provider
- Any individual operator or community member

### Known Limitations

- TEE side-channel attacks (Spectre/Meltdown variants) — mitigated by TEE provider patches
- Social engineering of community voters — mitigated by time-locks and supermajority thresholds
- Fake proof submissions — mitigated by challenge window and reputation staking
- TEE provider compromise — mitigated by open source code + community ability to fork and redeploy

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
| Phase 2 | TEE wallet agent, automated disbursements, public action log |
| Phase 3 | TEE site agent, automated deployments, community voting UI |
| Phase 4 | Full DAO-equivalent governance, cross-chain expansion |

---

## Related Documents

- `GOVERNANCE.md` — Full governance specification
- `src/data/campaigns.js` — Campaign data and rules
- `src/components/TrustFAQ.jsx` — Public-facing FAQ
- `src/components/Transparency.jsx` — Disbursement log and principles
