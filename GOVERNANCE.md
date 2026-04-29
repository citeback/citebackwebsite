# Fourthright — Governance Specification

> Version: 0.1 — Draft  
> Status: Design phase  
> Last updated: 2026-04-29

---

## Philosophy

Fourthright governance is designed around one principle: **no individual should have the power to destroy the platform.**

This means:
- No founder veto
- No key holders who can be compromised
- No fast-track changes
- No secret deliberations

Rules are public. Changes are slow by design. The machine executes what the community decides.

---

## Participants

### Anyone (Anonymous)
- Donate to campaigns (Monero, no registration)
- Submit camera locations to the map
- Propose new campaigns
- File challenges against disbursements
- File misconduct reports
- Vote on proposals (identified by Monero address or Nostr key)

No account required for any of this. Participation is permissionless.

### Operators
- Run campaigns (rent billboards, file FOIAs, fund legal work)
- Submit completion proofs for disbursement
- Request campaign extensions
- Build reputation score through track record
- Gated by reputation score (starts at $500 campaign cap)

Operators are accountable to the community, not to the founder.

### The AI Agents (Non-human)
- Execute disbursements when rules are met
- Deploy site changes when votes are confirmed
- Log every action publicly
- Enforce time-locks
- Cannot act outside their encoded rules

The agents are not participants — they are tools the community governs.

### The Founder (Scott)
- Bootstraps the initial codebase and enclave
- Holds no special governance rights post-launch
- Cannot access wallets (TEE enforced)
- Participates as a regular community member after handoff
- Formally steps back after Phase 2 launch

---

## Governance Actions

### 1. Campaign Proposals

**Who can propose:** Anyone  
**How:** Submit via the Propose Campaign form on the site  
**Required fields:**
- Campaign type (billboard / legal / FOIA / verification)
- Location
- Goal amount with cost breakdown
- Deadline
- Evidence/source links
- Operator identity (Monero address or Nostr key)

**Approval flow:**
```
Proposal submitted
      ↓
24-hour community review period (publicly visible)
      ↓
Simple majority vote (any identity-verified participant)
      ↓
Approved → Wallet Agent creates campaign wallet
Rejected → Proposal archived with vote record
```

### 2. Disbursement Challenges

**Who can challenge:** Anyone  
**Window:** 48 hours after proof submission  
**How:** Submit challenge via site with reasoning and evidence

**Challenge resolution:**
```
Challenge filed
      ↓
Disbursement paused (Wallet Agent holds funds)
      ↓
72-hour community review + discussion
      ↓
Community vote: uphold disbursement or block it
      ↓
60% majority required to block (default is release)
      ↓
Result logged permanently
```

If a challenge is upheld:
- Operator reputation: -25 points
- Funds remain in campaign wallet
- Operator can resubmit with corrected proof (once)
- Second upheld challenge → funds redirect, operator flagged

If a challenge is rejected (disbursement proceeds):
- Challenger reputation: no change (challenging in good faith is encouraged)
- Operator reputation: +5 points (survived a challenge)

### 3. Campaign Extensions

**Who can request:** Operator or any community member  
**Timing:** Only within the last 25% of the campaign's time window  
**Maximum:** 2 extensions per campaign

**Request flow:**
```
Extension request submitted with reasoning
      ↓
48-hour community vote
      ↓
Simple majority to approve
      ↓
Approved → deadline extended (7, 14, or 30 days as requested)
Rejected → original deadline stands
      ↓
If second extension expires unfunded → funds redirect
```

### 4. Code Changes (Site + Rules)

All changes to Fourthright's code go through GitHub. The Site Agent enforces the process.

**Minor changes** (copy, UI, content):
- Open PR on GitHub
- 24-hour discussion period
- Simple majority community vote
- Site Agent merges + deploys

**Major changes** (campaign rules, fee model):
- Open PR with detailed rationale
- 7-day discussion period
- 60% supermajority vote
- 7-day time-lock after vote before deployment

**Governance changes** (voting thresholds, extension rules, disbursement logic):
- Open PR with detailed rationale
- 14-day discussion period
- 75% supermajority vote
- 14-day time-lock after vote before deployment

The time-lock exists so the community has time to react to approved changes before they take effect. If a bad change slips through a vote, the 14-day window allows a counter-proposal.

### 5. Misconduct Reports

**Who can file:** Anyone  
**Required:** Evidence (links, screenshots, transaction records)

**Resolution flow:**
```
Report filed publicly with evidence
      ↓
7-day community review
      ↓
Community vote: confirm or dismiss
      ↓
60% majority to confirm misconduct
      ↓
Confirmed: reputation zeroed, permanent public flag
Dismissed: report archived, filer reputation unchanged
```

Confirmed misconduct is permanent and public. There is no appeals process. This is intentional — it creates a strong disincentive to act in bad faith.

### 6. Founder Formal Handoff

The founder formally steps back after Phase 2 launch (TEE wallet agent operational).

Handoff checklist:
- [ ] TEE enclave live with verified attestation
- [ ] Wallet Agent running with first real campaign wallet
- [ ] Action Logger publishing to public GitHub repo
- [ ] Community voting interface live on site
- [ ] Governance doc ratified by community vote
- [ ] Founder publicly removes any special access

After handoff, the founder's account has identical permissions to any other community participant.

---

## Voting Mechanics

### Identity

Voters identify via:
- **Monero address** — generates a pseudonymous but consistent identity
- **Nostr public key** — adds cross-platform portability

Signing a vote with your private key proves identity without revealing it.

### Weight

Initial model: **one identity = one vote** (flat weighting)

Future consideration: reputation-weighted voting for high-stakes decisions (operators with track record have marginally more weight). This requires a governance change to implement.

### Anti-Sybil

Flat voting is susceptible to Sybil attacks (one person, many wallets). Mitigations:
- Time-locks make coordinated attacks expensive
- Reputation weighting (future) ties influence to demonstrated track record
- Community can flag suspicious voting patterns and trigger a review

---

## Emergency Procedures

### Pause

If the system is behaving unexpectedly:
- Any community member can file an emergency pause request
- Requires 3 independent cosigners from established operators (reputation > 50)
- Wallet Agent freezes all pending disbursements
- Site Agent halts deployments
- Community convenes for emergency review (72-hour window)
- Resume requires same threshold

The emergency pause cannot be triggered by the founder alone.

### Fork

If governance is captured or the platform is irrevocably compromised:
- Anyone can fork the open source code
- Redeploy on new infrastructure
- The community decides which fork to use
- Original funds remain in the TEE (inaccessible to the fork) but new fork starts fresh

This is the nuclear option — but it's always available, which keeps any would-be captors honest.

---

## What Governance Cannot Do

Even with community consensus, certain actions are permanently off-limits:

- ❌ Extracting wallet private keys from the TEE
- ❌ Retroactively reversing completed disbursements
- ❌ Clearing a confirmed misconduct record
- ❌ Identifying donors (Monero privacy is immutable)
- ❌ Granting any individual special access above others

These constraints are enforced by the TEE code, not by policy. They cannot be voted away.

---

## Open Questions (To Be Resolved Pre-Launch)

1. **Voting quorum:** What minimum participation is required for a valid vote? (Proposed: 10 unique voters for minor, 25 for major, 50 for governance)
2. **Reputation weighting timeline:** When does the community vote to enable it?
3. **TEE provider selection:** Phala vs Marlin vs other — requires technical evaluation
4. **GitHub repo governance:** Who controls the repo until Phase 2? (Proposed: founder, with community fork right guaranteed from day 1)
5. **Operations wallet surplus policy:** When does the ops reserve trigger a community vote for redistribution?

---

## Related Documents

- `ARCHITECTURE.md` — Full technical architecture
- `src/data/campaigns.js` — Campaign data and rules
- `src/components/TrustFAQ.jsx` — Public-facing FAQ
