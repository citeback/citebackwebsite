# Citeback — System Architecture

> Status: Pre-launch design specification  
> Last updated: 2026-05-04

---

## Overview

Citeback is a decentralized surveillance-resistance platform. Its core design goal is **credible neutrality** — the system operates according to publicly verifiable rules, no individual (including the founder) can unilaterally control funds or censor campaigns, and every action is permanently logged for community inspection.

This document describes the full technical architecture, from wallet management through governance and site operations.

---

## Design Principles

1. **No trusted parties** — Trust is placed in open source code and cryptographic proofs, not people.
2. **Irreversibility by design** — Rules are slow to change on purpose. No single actor can rush changes through.
3. **Privacy-preserving** — Donors are anonymous. Operators earn reputation without revealing identity.
4. **Self-sustaining** — The platform funds its own operations from a 1% platform fee. No founder dependency.
5. **Community-governed** — The community owns the rules. Changes require public deliberation and time-locks.

---

## Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    FOURTHRIGHT SYSTEM                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              TEE ENCLAVE (VPS)                   │   │
│  │                                                  │   │
│  │  ┌─────────────────┐  ┌──────────────────────┐  │   │
│  │  │  Wallet Agent   │  │    Site Agent        │  │   │
│  │  │                 │  │                      │  │   │
│  │  │ Monero RPC      │  │ GitHub PR reviewer   │  │   │
│  │  │ Campaign rules  │  │ Netlify deployer     │  │   │
│  │  │ Disbursements   │  │ Code auditor         │  │   │
│  │  │ Fee collection  │  │                      │  │   │
│  │  └────────┬────────┘  └──────────┬───────────┘  │   │
│  │           │                      │              │   │
│  │           └──────────┬───────────┘              │   │
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

## 1. Trusted Execution Environment (TEE)

### What It Is

A TEE is a hardware-level secure enclave where code runs in an isolated, tamper-proof environment. Even the server owner cannot inspect memory, extract keys, or modify the running code without invalidating a cryptographic attestation proof.

**Key property:** Anyone can verify that a specific, publicly auditable version of the code is running — and that nobody has tampered with it.

### Why Fourthright Uses It

Without a TEE, the founder controls the VPS and therefore the wallets. A TEE removes this attack surface entirely. The founder bootstraps the enclave, then has no more access than any other community member.

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

**1% platform fee** applied to every incoming donation:

- 99% → campaign wallet
- 1% → platform operations wallet (also inside TEE)

The operations wallet covers:
- VPS / TEE infrastructure costs
- Monero node operation
- Buffer reserve for unforeseen costs

Operations wallet balance and all outflows are publicly visible via view key. Any surplus beyond 6 months of operating costs is voted on by the community (additional campaigns, reserve, etc.).

**Campaign goal fee buffer:**

When a campaign is proposed, the AI calculates:
- Task cost (operator-provided estimate)
- Estimated Monero transaction fee (~$0.01)
- 2% buffer for fee variance

Campaign goal = task cost + buffer. This is displayed transparently on the campaign card.

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

## 3. Site Agent

### Responsibilities

- Monitors the GitHub repository for approved PRs
- Deploys approved changes to Netlify via CLI
- Enforces merge rules encoded in open source configuration
- Cannot merge PRs that haven't met community vote threshold
- Logs every deployment with commit hash and timestamp

### What the Site Agent Cannot Do

- It cannot merge PRs unilaterally
- It cannot push code without a qualifying vote
- It cannot modify the governance rules without the time-lock expiring
- It cannot access the wallet agent

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
| Fee model change | 14 days | 75% supermajority |

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
- The TEE enclave can be migrated to a new provider with community vote
- No domain lock-in: DNS can be community-transferred
- No single point of failure

If Fourthright disappears, the code lives. Communities can rebuild.

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
