# Citeback — Reputation System Architecture
*Decided: 2026-05-06 | Status: Pre-build, approved design*

---

## Core Privacy Principle — Scoped Correctly

The platform's privacy promise applies to **donors and anonymous contributors**.
It does not conflict with a reputation system because reputation is opt-in and role-specific.

| Role | Tracking | Privacy Promise |
|---|---|---|
| Donor | None | Absolute anonymity. XMR/ZANO at protocol level. Always. |
| Anonymous camera submitter | None | Submit freely, no account needed, no reputation earned |
| Contributor (opt-in) | Pseudonymous only — username + XMR stake | No name, no email, no real identity required |
| Operator Tier 1–3 | Pseudonymous account + public campaign history | Track record is public by choice |
| Operator Tier 4 | Credentials verified (bar number, org registration) | Already a public actor by professional standing |

**The platform does not track people. It tracks contributions that people voluntarily attach to a pseudonym.**
This is the same model as Bitcoin — your address is public, your identity isn't.

---

## Identity Model

### Anonymous users (default)
- No account required
- Can browse map, read campaigns, use AI chat
- Can submit camera sightings (no reputation earned)
- Can donate directly to operator wallets (fully anonymous)

### Pseudonymous contributors (opt-in)
- Username + password. No name. No email. No contact info.
- Small XMR stake (~$0.25) required at account creation
  - Stake IS the identity token
  - Stake is burned on confirmed fraud
  - Stake is returned on account closure with clean record
- Camera submissions linked to account → reputation points earned
- Tier progression unlocks operator access

### Operators (required for running campaigns)
- Must have a contributor account (pseudonymous minimum for Tier 1–3)
- Tier 4 requires external credential verification (bar number, org registration)
  - These individuals are already public actors by professional standing
  - Credential verified against public databases (bar association, business registry)
- Operator's campaign history is public by design — accountability requires it

---

## Reputation Tiers

### Tier 0 — Verifier
- Default for all contributor accounts
- Submit and confirm camera sightings
- No money involved
- Points: new cameras (not in OSM or Citeback DB) = 2pts | confirmed existing = 1pt
- Unlocks: nothing yet — builds toward Tier 1

### Tier 1 — Emerging Operator
- **Requirement:** 10 reputation points (e.g. 5 new cameras, or 10 confirmed cameras)
- **Campaign cap:** up to $500
- **Milestone rule:** every campaign requires at least one defined milestone before any disbursement
- **Disbursement:** operator holds their own XMR wallet, publishes view key
- **Verification:** C2PA photo required for physical deliverables | MuckRock URL for FOIAs

### Tier 2 — Established Operator
- **Requirement:** 3 completed Tier 1 campaigns, 90%+ completion rate, 60+ day account age
- **Campaign cap:** $501–$5,000
- **Milestone rule:** required, milestone plan reviewed before campaign opens
- **Same disbursement and verification model as Tier 1**

### Tier 3 — Trusted Operator
- **Requirement:** 3 completed Tier 2 campaigns, maintained completion rate, 2 vouches from existing Tier 3 operators
- **Campaign cap:** $5,001–$25,000
- **Milestone rule:** required, milestones reviewed by admin before campaign opens
- **MuckRock spot-check:** human review of FOIA content for campaigns above $2,500

### Tier 4 — Institutional Operator
- **Requirement:** External credential verified (bar number, org registration) — bypasses Tier 0–3
- **Campaign cap:** $25,001–$100,000
- **Milestone rule:** required, phased fund release
- **Admin review:** required before campaign opens regardless of credentials

---

## Campaign Funding Model

- **Citeback takes zero from campaigns.** Pure pass-through.
- **Operator holds their own XMR wallet.** Citeback never touches campaign funds.
- **View key published** for every campaign wallet — live balance visible to anyone.
- **FUNDED status:** when goal is reached, site marks campaign FUNDED, wallet address de-emphasized.
- **Overfunding:** allowed. No operator penalty for receiving more than goal. Operator discloses excess per campaign terms.
- **Milestone-based disbursement:** funds held by operator, released per milestones defined upfront. Citeback verifies milestones. Next milestone only accessible after previous verified.
- **No campaign can receive any funds until milestone plan is defined and reviewed.**

---

## Deliverable Verification

| Deliverable type | Required proof | How verified |
|---|---|---|
| Physical (billboard, camera) | C2PA signed photo | Server validates signature + GPS automatically |
| FOIA filing | MuckRock public URL | Server pings URL to confirm it resolves and is active |
| Federal court filing | CourtListener case number or public link | Automated lookup |
| State legislation | OpenStates URL | Automated lookup |
| State court filing | Public docket link | Manual spot-check for Tier 3+ |
| Novel deliverable type | Not accepted until verification path defined | — |

**C2PA requirement on camera reputation points:**
Text-only camera submissions earn no reputation points. A C2PA signed photo is required to earn points (new camera = 2pts, confirmed existing = 1pt). This prevents remote OSM-scraping fraud.

---

## Overfunding Policy

Operators are not penalized for being overfunded. Overfunding means the community trusts them.

When goal is reached:
- Site marks campaign FUNDED
- Wallet address removed from prominent display
- Donate button removed from campaign page
- Operator responsible for disclosing any excess received
- Excess must be used per campaign terms set upfront (next milestone, related campaign, or disclosed hold)
- Reputation hit only for: spending excess without disclosure, campaign abandonment, milestone fraud

---

## Platform Sustainability

- **Zero platform fee on campaigns.** No percentage taken. Ever.
- **Self-funded by founding operator** (Scott Hughes) via capital contributions to the Wyoming DAO LLC.
- **Operating costs:** ~$33/mo pre-TEE (Hetzner + domains). Sustainable indefinitely on personal funding.
- **Future:** Grant funding (Open Technology Fund, Knight Foundation) for TEE build when platform has demonstrated track record.
- **Tips:** Not implemented at launch. Can be revisited when post-TEE infrastructure exists.

---

## What This Model Does Not Require

- TEE infrastructure (deferred to Phase 2 — when platform has track record and grant funding)
- Platform custody of any funds
- Identity beyond pseudonymous username + XMR stake for Tier 0–3
- Real names, emails, or contact info from donors or anonymous contributors

---

## What Must Be Built (Phased)

### Phase 1 (Days)
- SQLite migration (replace flat .jsonl files)
- Pseudonymous account creation (username + password + XMR stake)
- Session management (JWT)
- Camera submission attribution
- Basic reputation score calculation

### Phase 2 (Days)
- Tier 0→1 promotion logic
- "My account" page (score, submissions, tier status)
- Sighting approval linked to submitter account

### Phase 3 (1–2 weeks)
- Operator profile page
- XMR wallet address + view key registration
- Campaign creation flow
- Basic view key polling (balance monitoring)
- FUNDED status management
- Milestone definition per campaign

### Phase 4 (1–2 weeks)
- C2PA photo validation
- MuckRock URL validation
- CourtListener / OpenStates lookups
- Deliverable upload and verification flow
- Milestone tranche release logic

### Phase 5 (2–3 weeks)
- Tier 2–3 vouching system
- Community promotion logic
- Tier 3+ admin review workflow

### Phase 6 (2–3 weeks)
- Institutional credential verification (bar number lookups)
- Tier 4 onboarding flow
- Full anti-Sybil measures

---

## Verification System Evolution

The verification system is intentionally designed to start simple and gain sophistication as the community grows. What's available at bootstrap vs. at scale:

| Stage | What's available |
|---|---|
| Bootstrap (0 users) | Scott reviews manually or it waits. Honest reality. |
| Early community (50–200 accounts) | Peer vouching becomes meaningful — a Tier 3 with 10 campaigns vouching for someone actually means something |
| Active community (500+ accounts) | Community spot-checks for physical deliverables. Enough local verifiers to confirm a billboard in hours. |
| Established platform | Pattern-based fraud detection (normal behavior baselines exist). Delegated review by trusted operators. Reputation-weighted governance votes on edge cases. |

The camera verifier tier is the right bootstrapping entry point — low stakes, builds the population of trusted accounts, and those accounts become the substrate for every verification layer above them.

Do not over-engineer verification at launch. Build what the current community size can support. Add layers when the community earns them.

---

*This document supersedes the TEE-based architecture for Phase 1 launch. TEE remains the target for Phase 2 when platform has demonstrated track record and secured grant funding for the build.*
