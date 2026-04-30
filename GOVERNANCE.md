# GOVERNANCE.md — Citeback / Fourthright Platform

**Version:** 0.7 — Active
**Status:** Pre-launch governance specification
**Last Updated:** 2026-04-30

---

## Changelog: v0.6 → v0.7

- Vote weight formula floor: `max(1, formula)` — no negative weights
- Statistical evidence: AND logic (p<0.05 AND Cohen's h≥0.5 AND n≥20)
- Diversity fallback: if <10 qualifying voters, 14-day escrow + Major-tier vote
- Human review threshold: 5% affirmative weight minimum (not "any vote")
- Human reviewer: DAO legal counsel, 48hr SLA, cannot be founder
- Challenge rate limit: max 2 per 90-day window per challenger
- Fee tiers: explicitly apply to 90-day rolling volume
- Reputation floor: 0 after any penalty
- Appeal anchor: on-chain publication date
- AI emergency rollback: 60% supermajority (was 75%)
- Multi-TEE failure recovery path defined
- Stagnation escape state defined
- Monero + AML and TEE evidentiary treatment added to Open Questions

## Changelog: v0.5 → v0.6

**Voting Diversity Rule Hardened**
- Fresh-account bypass closed: accounts under 90 days old or with fewer than 5 prior votes cannot satisfy the diversity requirement for high-value disbursements
- Voting history overlap window set to 180 days (prevents rule from breaking down as platform matures)

**Disbursement / HOLD State**
- Auto-release prohibition added: if the original challenge received any affirmative votes, auto-release is prohibited regardless of subsequent quorum failures — a human-review flag is required before release
- HOLD state clarified: frozen donations apply to new campaign donations only, not existing donor governance participation

**Staking Freeze Clarified**
- §8 complaint-triggered freeze applies to disbursement of staked funds only — not operational capacity. Operators under investigation can continue running campaigns

**Founder Taint Tracking**
- Decay formula specified: any hop-account with >1% residual founder taint (after 50% decay per hop) counts fully toward the 5% founder cap with no further discounting

**Provisional Pause Escalation**
- Hour-12 outcome defined: provisional pause auto-expires unless confirmed by a 25-voter simple majority vote. If unconfirmed, pause lifts; operations resume. Safe default is resumption (not escalation)

**Challenge Cooldown Refined**
- Cooldown applies only to challenges rejected with <25% community support — not all rejected challenges. Contested challenges (25-74% support) do not trigger cooldown

**Bootstrapping Hardened**
- Minimum time-since-launch: bootstrapping cannot end until the platform has been live for at least 6 months
- 30-day transition window added: both governance regimes apply simultaneously during transition
- Stagnation escape: if platform has been active for 36 months without meeting bootstrapping exit criteria, bootstrapping ends automatically; founder retains permanent 5% cap

**Seasonal Pause Constrained**
- Maximum 4 months per rolling 12-month period
- Must be declared before the 6-month inactivity threshold, not retroactively
- Cannot be stacked across years

**Statistical Evidence Revised**
- OR logic adopted: p<0.05 OR (Cohen's h ≥ 0.5 AND n ≥ 20). Either strong significance at any sample size, or large effect size at meaningful sample size
- Minimum sample of 5 removed (too small for Cohen's h to be meaningful)

**Fee Cliff Smoothed**
- Hard tier breakpoints replaced with a graduated schedule to reduce cliff-gaming

**Strategic Additions**
- Monero accessibility note added: atomic swap front-end or multi-asset routing is a recommended Phase 2 priority
- Fiat disbursement pathway added to Open Questions as the highest operational priority
- Campaign quality advisory board added to Launch Prerequisites

---

## Changelog: v0.4 → v0.5 / v0.3 → v0.4 / v0.2 → v0.3
*(See prior versions for details — 59+ cumulative fixes across four audit rounds)*

---

## Launch Prerequisites

**Hard prerequisites — platform does not accept funds until all are complete.**

1. **Legal Entity:** Wyoming DAO LLC (or equivalent) fully incorporated with registered agent.
2. **MSB/FinCEN Memo:** Written attorney opinion with clear "not an MSB because X" conclusion, or a registration path. Do not launch without this in hand.
3. **Foreign Qualification:** Attorney assessment of Wyoming LLC qualification requirements in founder's home state and operational nexus states. Separate from FARA analysis.
4. **FARA Analysis:** Attorney must confirm whether the platform itself could be construed as acting at the direction of a foreign principal — distinct from the foreign business qualification analysis.
5. **Legislative Advocacy Compliance Mechanism:** Attorney must define a compliant disclosure structure or issue a prohibition before this campaign type goes live.
6. **Billboard Liability Review:** Attorney must enumerate specific federal statutes that could pierce §230 for this use case (Hobbs Act, 18 U.S.C. §875, etc.) and confirm liability waiver is enforceable in key jurisdictions.
7. **Insurance Coverage Specification:** Attorney or insurance specialist must define minimum coverage *type* (not just amount) for the $1M operator insurance requirement — must cover civil rights claims, defamation, and intentional acts.
8. **TEE Deployment:** Minimum 3 TEE instances across different hardware providers, live with 2-of-3 threshold signatures.
9. **TEE Threat Model:** Written, published, and community-ratified.
10. **OFAC Integration:** Third-party screening with continuous monitoring protocol. Real-name identity data required.
11. **AI Ensemble:** Minimum 3 models deployed, adversarial benchmark suite ratified.
12. **Governance Ratified:** This document (or v1.0) ratified via bootstrapping governance process.
13. **Misconduct Bond & Staking Systems:** Operationally tested.
14. **Operator Insurance Framework:** Certificate collection and verification operational before first $25k+ campaign.
15. **Founder Address Registry:** TEE-encoded, deployed, attestation published.
16. **Campaign Quality Advisory Board:** Minimum 2 domain experts (civil liberties attorney + surveillance accountability practitioner) available to review early campaigns before community votes. Addresses the domain expertise gap governance cannot solve.

---

## 1. Philosophy

Citeback exists because surveillance is asymmetric. Institutions — governments, corporations, landlords, employers — document individuals constantly, at scale, with impunity. Individuals have almost no reciprocal capacity to document institutions, challenge their claims, or fund the messy, expensive work of accountability.

This platform exists to correct that asymmetry. It enables anonymous, coordination-free funding of accountability work — the infrastructure that makes institutional power answerable to the people it affects.

**The platform is designed to ensure that financial access, legal pressure, and platform deplatforming cannot silence lawful accountability work.** It operates within applicable law and supports First Amendment-protected activity.

**Core differentiator:** The platform's unique value is anonymous coordination that established civil liberties organizations cannot provide. They must disclose donors, answer to boards, and balance donor relationships. This platform does not. That enables funding campaigns those organizations cannot touch — targeting specific vendors, supporting local coalitions, funding internationally — without exposing participants to retaliation.

**What this platform is not:**
- It is not a tool for harassment, defamation, or coordinated attacks on private individuals.
- It is not a platform for funding criminal defense or illegal activity.
- It is not designed to evade lawful oversight — it is designed to withstand improper pressure on lawful activity.

**On Legal Defensibility:** The platform operates within law, maintains required legal registrations, and funds only lawful activities. The goal is accountability, not impunity.

**On Entity Protection:** Wyoming DAO LLC provides civil liability protection. It does not limit federal enforcement exposure. Federal civil or criminal actions against the platform or its participants remain possible regardless of entity form.

---

## 2. Participants

### 2.1 Donors
Anyone who sends Monero to a campaign wallet is a donor. No registration required. No identity collected. TEE records contribution amounts and timing for voting weight only.

### 2.2 Operators
Operators create and manage campaigns. They must:
- Register with Nostr public key (preferred) or Monero address
- Pass OFAC/sanctions screening with real-name identity data (held by DAO legal entity, not published on-chain)
- Maintain reputation score governing campaign size limits
- Submit verified proof of work to trigger disbursement

**Operators are independent contractors, not agents or employees.** Platform approval of a campaign does not constitute endorsement, partnership, or joint liability. The platform's primary liability insulation is §230 intermediary status where applicable (§3.5); independent contractor status is a secondary layer.

### 2.3 The Community
Active donors who participate in governance votes. No membership list, no token. Governance power flows from economic participation.

### 2.4 Identity: Nostr Preferred
Nostr public keys preferred — verifiable without exposing personal data, cross-platform portable.

---

## 3. Campaign Types

### 3.1 Open Campaign Model
Campaign types are not a fixed list. The platform funds any lawful accountability activity aligned with the §1 mission. New types ratified via Major-tier vote.

**Legal Review Gate:** Campaign types involving lobbying, electoral activity, foreign relationships, or financial services require written DAO legal counsel review before the ratification vote proceeds.

### 3.2 Campaign Type Tiers (By Demonstrated Effectiveness)

**Tier 1 — Primary (Launch Priority)**

| Type | Why It Works |
|---|---|
| Public Records Litigation | Injunctions can halt programs; discovery is irreplaceable; produces permanent citable records |
| Ordinance Campaigns | Proven 50+ city playbook; permanent wins without courts; 6-18 month timelines |
| Counter-Database Projects | Force multiplier — feeds litigation, journalism, legislation; EFF Atlas proved the model |
| FOIA Campaigns | Low cost, high volume, feeds every other campaign type |
| Journalist Partnerships | Creates public accountability litigation cannot; Intercept/Markup/ProPublica model |

**Tier 2 — Supporting (High Impact)**

| Type | Notes |
|---|---|
| Vendor Accountability | Target Clearview, Flock Safety, Palantir, ShotSpotter, Axon by name; contract cancellations achievable; anonymous funding uniquely valuable |
| Insurance/Liability Pressure | Most underexplored tool in surveillance resistance; makes surveillance tech uninsurable; no one owns this space |
| Legal Defense | Civil and administrative only; critical safety net; lower ceiling as primary strategy |
| Legislative Advocacy | Requires attorney sign-off pre-ratification (LDA/FARA); state-level wins achievable |
| Procurement Intervention | Faster than ordinances; legal challenges to RFPs and sole-source contracts |

**Tier 3 — Tactical (Supporting Role)**

| Type | Notes |
|---|---|
| Billboard | Tactical amplifier for Tier 1 wins; low ROI as standalone |
| Documentation | Input to better tools; value depends on downstream use |
| International Mechanisms | GDPR complaints, UN submissions; long timeline but real EU AI Act leverage |
| Research Grants | 3-7 year policy lag; use only where evidence base is genuinely missing |

### 3.3 Section 230 Framework
Platform intermediary protections under 47 U.S.C. §230(c)(1) apply where the platform hosts or facilitates activity without creating or selecting content. The attestation model (§3.5) is designed to preserve this status. Attorney review of §230 applicability is required for journalist partnerships before that type goes live. §230 does not protect against federal criminal statutes or ECPA.

### 3.4 The Fiat Disbursement Problem *(Operational Priority)*
The platform's anonymous donation architecture is strong. The deployment side — paying lawyers, filing fees, billboard vendors — inevitably touches the traditional financial system. This is the highest-priority operational gap. Phase 2 must define a legally-structured disbursement pathway (privacy-preserving foundation, licensed intermediary, or equivalent) that operators can use to deploy funds without exposing campaign participants. This is not a governance problem — it requires legal and operational design. See Open Questions.

### 3.5 Operator Attestation (Billboard Campaigns)
Platform verifies only that the operator submitted a factual attestation — source URLs or documents for each claim. Platform does not verify accuracy. Responsibility rests entirely with the operator. Liability waiver signed at registration and reaffirmed at each billboard campaign creation.

### 3.6 Operator Staking
| Campaign Goal | Required Stake |
|---|---|
| $5,001 – $15,000 | 2% of campaign goal |
| Above $15,000 | 5% of campaign goal |

Stake returned within 7 days of final disbursement if no misconduct finding. **Stake is frozen (disbursement only, not operational capacity) from the moment a §8 complaint is formally filed** until resolution. Operators under active §8 investigation may continue running campaigns but cannot withdraw staked funds.

### 3.7 Mandatory Community Review (Above $10,000)
Outcome paths:
- No objections → campaign proceeds
- Objection by 3+ voters → Major-tier vote required before launch
- Objection by voter with reputation ≥ 25 → 24-hour hold for investigation
- Objection sustained → campaign blocked; operator may resubmit

### 3.8 Camera Documentation Policy
Public vantage points only. Campaigns to disable, damage, or interfere with surveillance equipment are prohibited. Governance immutable (§15).

---

## 4. Operator Reputation

### 4.1 Initial Caps
- Reputation: 0 | Maximum campaign: $1,000

### 4.2 Cap Escalation
Requires clean challenge record AND cumulative volume:

| Target Cap | Volume Required | Additional |
|---|---|---|
| $5,000 | $2,000 completed | — |
| $25,000 | $10,000 completed | — |
| $100,000 | $50,000 completed | KYC + DAO legal counsel |
| Unlimited | $100,000 completed | Community vote |

### 4.3 Reputation Decay
-10 points/month after 6 consecutive months inactive. Floor: 0.

**Seasonal pause:** One self-declared pause per 12-month period, maximum 4 months. Must be declared before the 6-month inactivity threshold — no retroactive declarations. Cannot be stacked across years to create indefinite freezes.

### 4.4 OFAC Screening
Real-name identity data. Third-party API. Continuous monitoring, 30-day cycle.

### 4.5 KYC Above $25k Cap
Entity name, jurisdiction, registration number. DAO legal counsel review required.

### 4.6 Liability Insurance
Campaigns above $25k: minimum $1M per-occurrence, coverage type specified by DAO counsel (must cover civil rights claims, defamation, and intentional acts). DAO legal entity named as additional insured.

---

## 5. Voting Mechanics

### 5.1 Principle
Voting power proportional to economic participation. Logarithmic curve rewards participation while limiting concentration.

### 5.2 Donation Age Requirement
Donations must be **72+ hours old at proposal submission** to qualify for voting weight.

### 5.3 Voting Weight Formula
```
weight = max(1, log₂(donation_amount / minimum_threshold) + 1)
```
Floor of 1.0 ensures no donation produces negative or zero weight.
`minimum_threshold` = $5 initial (Governance-tier parameter, §5.7).

| Donation | Weight |
|---|---|
| $5 | 1.0 |
| $10 | 2.0 |
| $40 | 4.0 |
| $160 | 6.0 |
| $640 | 8.0 |
| $1,280 (cap) | 9.0 |

Hard cap: 9.0. No additional weight beyond $1,280.

### 5.4 Parameter Snapshot Rule
Voting parameters are snapshotted at vote-open time. Changes take effect only on votes opened after the change clears its time-lock. No retroactive shifts on open votes.

### 5.5 Operator Conflict of Interest
Operators excluded from disbursement votes on their own campaigns. TEE-enforced. Their own-campaign donations generate no disbursement voting weight.

### 5.6 Quorum Requirements
| Tier | Quorum |
|---|---|
| Minor | 10 unique voters |
| Major | 25 unique voters |
| Governance | 50 unique voters |

Quorum failure: extend 48h (max ×2), then expires with no pass/fail.

**Disbursement challenge quorum failure:**
1. Quorum failure → funds HOLD, challenge reopens for 48 hours
2. Second quorum failure → escalates to Major-tier vote
3. Major-tier quorum failure → **if original challenge had <5% affirmative vote weight**, auto-release. **If 5%+**, human-review required before release.

**Human review:** DAO legal counsel, 48-hour SLA. If unavailable within SLA, escalates to Major-tier community vote automatically. Cannot be the founder.

During HOLD: new campaign donations frozen; existing donor governance participation unaffected.

### 5.7 Minimum Threshold Governance
Governance-tier parameter (75% supermajority, 14-day time-lock). Hard floor: **$1**. Governance immutable (§15).

### 5.8 Voting Diversity for High-Value Disbursements
Disbursements above $10,000 require approving votes from voters with **less than 60% pairwise voting history overlap in the prior 180 days**.

**Account eligibility for diversity satisfaction:** An account must be at least **90 days old** and have cast **at least 5 prior votes** to count toward satisfying the diversity requirement. Fresh accounts with no voting history cannot trivially satisfy the threshold by having zero overlap.

**Small community fallback:** If fewer than 10 accounts meet eligibility criteria at vote time, the diversity requirement is suspended and replaced with: 14-day extended escrow hold + mandatory Major-tier vote.

---

## 6. Governance Actions & Classification

### 6.1 Change Tiers
| Tier | Discussion | Vote | Time-lock |
|---|---|---|---|
| Minor | 24 hours | Simple majority | None |
| Major | 7 days | 60% supermajority | 7 days |
| Governance | 14 days | 75% supermajority | 14 days |

### 6.2 Automatic Governance-Tier Classification (Canonical List)
- Fund movement logic or TEE execution rules
- Voting weight calculation or quorum thresholds
- Disbursement approval/block thresholds
- AI ensemble oversight or upgrade process
- Reputation cap thresholds
- The Immutables list (§15)
- The minimum_threshold floor
- Founder address registry rules

### 6.3 Classification Confirmation
Classification decisions require active confirmation from **3 reputation-weighted community members** within the 24-hour dispute window. If not received, classification defaults to next higher tier.

---

## 7. Disbursement

### 7.1 Rolling Volume (Total Operator)
The $2,000 threshold applies to **total operator rolling volume across all campaigns in the past 90 days**.

### 7.2 Disbursement Thresholds
| Rolling 90-Day Volume | Default | Override |
|---|---|---|
| Below $2,000 | Release | 60% to block |
| $2,000 and above | Hold | 60% to approve |

**Lookback grace:** If disbursement would cause rolling total to cross $2,000 at submission, hold-default applies immediately.

### 7.3 Fee Schedule (Graduated)
| Rolling 90-Day Volume | Platform Fee |
|---|---|
| $0 – $10,000 | 5.0% |
| $10,001 – $25,000 | 4.5% |
| $25,001 – $50,000 | 4.0% |
| Above $50,000 | 3.0% |

Graduated schedule eliminates cliff-gaming. Tiers apply to the same 90-day rolling operator volume as disbursement thresholds — not per-disbursement.

### 7.4 Challenge Anti-Griefing
- After **3 challenges rejected with <25% community support** against the same pair within 90 days → 90-day cooldown for that challenger-operator pair only
- Challenges receiving 25%+ support are contested (not frivolous) and do not trigger cooldown
- Experienced challengers (>50% lifetime confirmation rate): threshold raised to 5 frivolous challenges
- **Challenge eligibility:** reputation ≥ 5 OR donation history ≥ 30 days old
- **Rate limit:** Max 2 challenges per challenger per 90-day window regardless of outcome

---

## 8. Misconduct Reports

### 8.1 Filing
Bond: 0.5% of accused operator's largest campaign in prior 12 months, min $10, max $250.

### 8.2 Resolution
```
Report filed + bond posted
      ↓
7-day community review
      ↓
60% majority to confirm
```

### 8.3 Consequences
**First confirmed:** 90-day disbursement suspension, -50 reputation (floor: 0 — cannot go below zero), public record.
**Second confirmed:** Permanent disbursement bar, permanent public record, active campaign stake forfeited.
**Appeals:** One appeal within 30 days of on-chain publication of the decision (publication date is the unambiguous anchor event). 75% supermajority to overturn. After that: permanent.

---

## 9. AI Monitoring Ensemble

### 9.1 Architecture
Execution Layer: deterministic only, no AI in money-movement path.
Monitoring Ensemble: minimum 3 independent models (2-model prohibited), consensus required for protective action, advisory only.

### 9.2 Ensemble Actions
| Signal | Outcome |
|---|---|
| 1-of-3 | Elevated monitoring |
| 2-of-3 | Advisory flag + community notification |
| 3-of-3 | Protective action proposed to community |

### 9.3 Model Upgrades
Benchmark outperformance (including adversarial tests) AND 60% community vote after 7-day review. 30-day shadow probation.

**Emergency rollback:** 60% supermajority (precautionary principle — removing a confirmed-harmful model should be easier than installing one). Non-emergency model removal retains 75% threshold.

### 9.4 Wallet Blacklisting Limitation
Probabilistic deterrent only. Primary Sybil defenses: economic floor, 72-hour donation age, logarithmic weighting, challenge eligibility, ensemble monitoring.

---

## 10. TEE Architecture

### 10.1 Multi-TEE (3 Instances, 2-of-3)
Minimum 3 TEE instances on different hardware providers. **2-of-3 threshold signatures.** Single compromise cannot release funds. Governance immutable (§15).

### 10.2 No Human Key Access
Never. Governance immutable (§15).

### 10.3 Near-Zero Custody
Balances exceeding 120% of active campaign obligations trigger community notification within 24 hours.

### 10.5 Multi-TEE Failure Recovery
If 2+ TEE instances fail simultaneously (making 2-of-3 threshold impossible), all disbursements pause automatically. A Major-tier vote must be held within 7 days defining recovery: (a) emergency key rotation to new TEE instances, (b) supervised campaign wind-down, or (c) fork. No disbursements occur during recovery without a community-approved plan.

### 10.4 Threat Model
Published and community-ratified before launch. Must address side-channel risks, provider dependencies, supply-chain trust.

---

## 11. Operations Wallet

- Graduated platform fee per §7.3
- Surplus above 6 months projected operating costs → community vote on redistribution
- Cannot flow to any individual (immutable §15)
- Quarterly transparency report

---

## 12. Emergency Pause

### 12.1 Triggers
Any **2-of-3:**
- **(a)** Ensemble majority flags active attack
- **(b)** Statistical evidence: p<0.05 AND Cohen's h ≥ 0.5 AND n ≥ 20 (all three required)
- **(c)** Attack pattern confirmed ongoing

### 12.2 Human-Observable Trigger
Reputation ≥ 25 member submits Pause Request → 12-hour provisional pause. At hour 12: auto-expires unless confirmed by 25-voter simple majority. Safe default: resumption (not escalation). Per-address cooldown: 72 hours between Pause Requests.

### 12.3 Scope and Duration
Suspends new votes, disbursements, campaign creation. Max 72 hours. Extension requires Major-tier vote.

---

## 13. Code Change Governance

All changes via GitHub. Classification governed by §6.2 canonical list — this section references §6.2 only. Governance-tier TEE/fund changes require independent security audit before vote.

---

## 14. Bootstrapping

### 14.1 Founder Voting Restriction
No votes during bootstrapping. After: permanently capped at **5% of any vote total**. Founders cannot vote on their own ceiling removal (§15).

### 14.2 TEE-Enforced Founder Address Registry
Encoded in TEE at launch. Cannot be modified by any vote. Founder taint tracking: 3-hop minimum, 50% decay per hop. Any account with >1% residual founder taint counts fully toward the 5% cap — no further discounting. Wallet transfers from founder addresses flagged for community review.

### 14.3 Bootstrapping End Conditions
All three must be met:
1. Platform has been live for at least **6 months**
2. **3 qualifying governance votes** within a 90-day window (50-voter quorum, median donation ≥ $20, without founder participation)
3. **30-day transition period** where both governance regimes apply simultaneously

**Stagnation escape:** If platform has been active for **36 months** without meeting conditions 1-2, bootstrapping ends automatically. Post-escape governance is identical to post-bootstrapping — founder retains permanent 5% cap, all standard tiers apply. No constraints are relaxed.

### 14.4 Formal Handoff Checklist
- [ ] TEE enclave live with verified attestation
- [ ] Wallet Agent running with first real campaign
- [ ] Action Logger publishing to public GitHub
- [ ] Community voting interface live
- [ ] Governance doc ratified
- [ ] Founder address registry encoded and attested
- [ ] Founder publicly removes any special access

---

## 15. Immutables

Encoded in TEE. Cannot be overridden by any vote — requires a fork.

1. No human key access
2. Criminal defense prohibition
3. Illegal activity prohibition
4. Camera tampering prohibition
5. No individual surplus distribution
6. Founder ceiling permanence (founders cannot vote on this rule)
7. Multi-TEE permanence (minimum 3 instances)
8. Minimum threshold floor ($1 equivalent)
9. Founder address registry permanence

---

## 16. Amendments

Governance documents: Governance-tier process (75% supermajority, 14-day discussion, 14-day time-lock). Immutables require a fork.

Fork option is always available. Community's ultimate check is exit.

---

## Open Questions (Unresolved Pre-Launch)

1. **Monero + AML legal question** *(Attorney required)* — Monero's privacy features create higher AML risk than other crypto. Attorney must address compatibility with the OFAC/KYC framework before launch.
2. **TEE attestation evidentiary treatment** — If subpoenaed, TEE logs may be primary evidence. Chain-of-custody, data retention obligations, and compromised-instance posture need attorney analysis before launch.
3. **Fiat disbursement pathway** *(Highest operational priority)* — Lawyers get paid in dollars. Billboard vendors require entity names. How do campaigns deploy funds without exposing participants? Requires legal + operational design: privacy-preserving foundation, licensed intermediary, or equivalent. This is not solved by governance — it requires Phase 2 design work.
2. **Monero accessibility** — XMR on-ramps are restricted on many exchanges. Phase 2 priority: atomic swap front-end or multi-asset routing to XMR. Affects accessible donor pool size significantly.
3. **TEE provider selection** — Phala vs Marlin vs other; requires technical evaluation
4. **GitHub repo governance during bootstrap** — Founder controls; community fork right guaranteed from day 1
5. **Legislative advocacy compliance mechanism** — Attorney must resolve before type goes live
6. **Initial benchmark suite** — Must be drafted and ratified before any model upgrade vote
7. **XMR price oracle** — 30-day rolling average; specific oracle source to be selected
8. **Voting diversity overlap calculation** — Technical specification for 180-day overlap calculation needed
9. **"Accountability vs. extortion" bright line policy** — Attorney must produce an operational definition of where accountability campaigns cross into Hobbs Act territory; operators need decision criteria

---

## Related Documents

- `ARCHITECTURE.md` — Full technical architecture
- `src/data/campaigns.js` — Campaign data
- `src/components/TrustFAQ.jsx` — Public-facing FAQ
