# GOVERNANCE.md — Citeback Platform

**Version:** 0.8 — Active
**Status:** Pre-launch governance specification
**Last Updated:** 2026-05-04

---

## Changelog: v0.8 → v0.8.1 (2026-05-07)

- **§7.3 fee model changed:** Graduated 3–5% platform fee replaced with zero-fee model. 100% of campaign funds disbursed to operators. Platform funded by founding operator capital contributions + voluntary user tips + long-term grant funding. Extractive relationship between platform and campaigns eliminated.
- **§11 operations wallet:** Updated to reflect tips model; no TEE fee deduction.
- **§15 Immutables:** OFAC SDN match override prohibition added as Immutable #10 — no community vote may override a denial based on an OFAC SDN list match.
- **§6.2 canonical list:** Platform funding mechanism added as Governance-tier item.
- **OPERATOR-ACCOUNTABILITY.md:** Operator accountability protocol drafted (pre-ratification).

## Changelog: v0.7 → v0.8

- **Split operational model adopted:** Platform now reflects a human operator layer (Wyoming DAO LLC) + direct-to-operator wallet model (no platform custody)
- **§9 AI Monitoring Ensemble removed:** Replaced with Human Operator Layer (§9) — AI is not in the monitoring, approval, or advisory path
- **No platform custody model:** Contributions go directly to operator wallets. Platform monitors via view key. No TEE required.
- **Human operator responsibilities defined (§9):** Campaign proposal review (legal judgment), operator onboarding, OFAC pre-screening, site content, community communications
- **Community accountability for platform entity added (§9.2):** Misconduct reports, governance proposals, campaign rejection appeals, and fork right apply to operator conduct
- **§12 Emergency Pause:** Triggers: platform entity, wallet anomaly detection, and community member
- **§6.2:** AI ensemble oversight removed from Governance-tier canonical list
- **Launch Prerequisites:** AI Ensemble requirement removed; Operator Accountability Protocol added
- **Language:** "No one holds the keys" framing adopted throughout; platform is explicitly operated by Wyoming DAO LLC
- **§2.4 Platform Entity added:** Wyoming DAO LLC named as an active participant with defined scope and accountability mechanisms

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
- Multi-node failure recovery path defined
- Stagnation escape state defined
- Monero + AML evidentiary treatment added to Open Questions

## Changelog: v0.5 → v0.6

**Voting Diversity Rule Hardened**
- Fresh-account bypass closed: accounts under 90 days old or with fewer than 5 prior votes cannot satisfy the diversity requirement for high-value disbursements
- Voting history overlap window set to 180 days (prevents rule from breaking down as platform matures)

**Disbursement / HOLD State**
- Auto-release prohibition added: if the original challenge received any affirmative votes, auto-release is prohibited regardless of subsequent quorum failures — a human-review flag is required before release
- HOLD state clarified: frozen contributions apply to new campaign contributions only, not existing contributor governance participation

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
8. **OFAC Integration:** Third-party screening with continuous monitoring protocol. Real-name identity data required.
11. **Operator Accountability Protocol:** Documented process for community challenges to operator decisions (campaign approvals, operator onboarding denials), with SLA and escalation path. Published before launch.
12. **Governance Ratified:** This document (or v1.0) ratified via bootstrapping governance process.
13. **Misconduct Bond & Staking Systems:** Operationally tested.
14. **Operator Insurance Framework:** Certificate collection and verification operational before first $100k+ campaign.
15. **Founder Address Registry:** Published and verifiable on GitHub before launch.
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

**On Operational Structure:** Citeback is operated by the Wyoming DAO LLC. The platform entity manages site content, reviews campaign proposals, onboards operators, and communicates with the community. What the operator cannot do — ever — is access wallet keys. The platform never holds campaign funds (§7.0, §10); contributions go directly to operators. Community governance provides accountability for operator decisions. Community governance provides accountability for both operator decisions and the financial layer.

**On Entity Protection:** Wyoming DAO LLC provides civil liability protection. It does not limit federal enforcement exposure. Federal civil or criminal actions against the platform or its participants remain possible regardless of entity form.

---

## 2. Participants

### 2.1 Contributors
Anyone who sends Monero to a campaign wallet is a contributor. No registration required. No identity collected. Platform records contribution amounts and timing for voting weight only, verified via operator-provided view keys.

### 2.2 Operators
Operators create and manage campaigns. They must:
1. Verify real identity privately (held by DAO legal entity — never published on-chain)
2. Pass OFAC/sanctions screening
3. Campaign must target a government entity, government program, or government-contracted surveillance vendor — not a private individual
4. Submit a specific, itemized cost breakdown

Operators are **not** required to have a legal entity to apply. Entity requirements scale with tier (see §4.2).

**Operators are independent contractors, not agents or employees.** Platform approval of a campaign does not constitute endorsement, partnership, or joint liability. The platform's primary liability insulation is §230 intermediary status where applicable (§3.5); independent contractor status is a secondary layer.

### 2.3 The Community
Active donors who participate in governance votes. No membership list, no token. Governance power flows from economic participation.

### 2.4 Platform Entity (Wyoming DAO LLC)
The Wyoming DAO LLC is the platform operator — an active participant, not a passive relay. The entity reviews campaign proposals before publication, onboards operators, maintains the platform, and communicates with the community. It is accountable to the community through the misconduct system (§8) and the fork right (§16).

The platform entity has **no custody of campaign funds** (direct-to-operator model, §7.0, immutable §15) and **cannot direct disbursements** outside community-approved rules.

### 2.5 Identity: Nostr Preferred
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
| $7,501 – $20,000 | 2% of campaign goal |
| Above $20,000 | 5% of campaign goal |

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

Citeback uses **two separate reputation tracks** that gate different things:

- **Camera reputation** (sighting submissions) — earns points toward platform tiers (Scout → Operator → Verifier → Guardian). Reaching Tier 1 (10 pts) unlocks the ability to run campaigns up to the initial $1,000 cap.
- **Campaign success score** (completed campaigns) — a separate count of successfully completed campaigns with clean challenge records. This is what unlocks higher caps. Dollar volume does not determine advancement — execution track record does.

### 4.1 Initial Caps
- New operator | Maximum campaign: **$1,000**
- Requires: identity verified + camera reputation Tier 1 (10 sighting points)

### 4.2 Cap Escalation

Requires clean challenge record throughout.

| Target Cap | Requirement | Legal Entity Required |
|---|---|---|
| **$7,500** | 10 successfully completed campaigns | No |
| **$30,000** | Legal entity registered + any prior completed volume | Yes |
| **$125,000** | Legal entity + DAO legal counsel review + $1M insurance | Yes |
| **Unlimited** | $125k completed volume + community governance vote | Yes |

**"Successfully completed"** means: campaign funded, milestones met, proof submitted, disbursement released with no upheld challenge. A challenged campaign that resolved in the operator’s favor still counts. A campaign with an upheld challenge does not count and resets the consecutive clean run.

### 4.3 Reputation Decay
-10 points/month after 6 consecutive months inactive. Floor: 0.

**Seasonal pause:** One self-declared pause per 12-month period, maximum 4 months. Must be declared before the 6-month inactivity threshold — no retroactive declarations. Cannot be stacked across years to create indefinite freezes.

### 4.4 OFAC Screening
Real-name identity data. Third-party API. Continuous monitoring, 30-day cycle.

### 4.5 KYC / Entity Requirements by Tier
- **$1k cap:** Identity verified (government ID). No legal entity required.
- **$7,500 cap:** Identity verified + 10 successful campaigns. No legal entity required.
- **$30k cap:** Registered legal entity on file (LLC, nonprofit, or equivalent). Entity name, jurisdiction, and registration number required.
- **$125k cap:** Legal entity + DAO legal counsel review + $1M liability insurance certificate.

Legal entity is **not required** until the $30k tier. Operators who have demonstrated execution track record through 10 successful campaigns may access the $7,500 cap as individuals.

### 4.6 Liability Insurance
Campaigns above $100k cap: minimum $1M per-occurrence, coverage type specified by DAO counsel (must cover civil rights claims, defamation, and intentional acts). DAO legal entity named as additional insured.

---

## 5. Voting Mechanics

### 5.1 Principle
Voting power proportional to economic participation. Logarithmic curve rewards participation while limiting concentration.

### 5.2 Donation Age Requirement
Donations must be **72+ hours old at proposal submission** to qualify for voting weight.

### 5.3 Voting Weight Formula
```
weight = max(1, log₂(contribution_amount / minimum_threshold) + 1)
```
Floor of 1.0 ensures no contribution produces negative or zero weight.
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
Operators excluded from disbursement votes on their own campaigns. Governance-enforced. Their own-campaign donations generate no disbursement voting weight.

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

During HOLD: new campaign contributions frozen; existing contributor governance participation unaffected.

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
- Fund movement logic or disbursement execution rules
- Voting weight calculation or quorum thresholds
- Disbursement approval/block thresholds
- Reputation cap thresholds
- The Immutables list (§15)
- The minimum_threshold floor
- Founder address registry rules
- Platform funding mechanism and fee model (changes to fee-free model, introduction of any platform fee, or changes to the tips framework require Governance-tier vote)

### 6.3 Classification Confirmation
Classification decisions require active confirmation from **3 reputation-weighted community members** within the 24-hour dispute window. If not received, classification defaults to next higher tier.

---

## 7. Disbursement

### 7.0 Direct Wallet Model

**Citeback never holds funds.** Operators post their own Monero (XMR) or Zano (ZANO) wallet address when creating a campaign. Contributions go directly from contributors to the operator’s wallet. The platform has no custody, no spending access, and no ability to move funds.

**View key transparency:** Operators must provide a Monero full view key (read-only, cannot spend) to the platform at campaign creation. The platform uses this to publicly verify inflows and monitor for early withdrawal. The view key is published on the campaign page so any community member can independently verify balances.

**Early withdrawal rule:** If the platform’s view key monitoring detects an outflow from a campaign wallet before the campaign goal is reached, the operator is:
- Immediately and permanently banned from the platform
- All active campaign stakes forfeited
- Permanent public misconduct record published
- No appeal available for early withdrawal violations

This is a governance rule, not a technical lock. Operators can physically withdraw early — but doing so ends their participation permanently and publicly. The reputation and stake system makes this economically irrational for any operator intending to run future campaigns.

**No platform custody = no MSB exposure.** Citeback is a coordination and accountability platform, not a money transmitter. The platform never receives, holds, or transmits funds on behalf of another party.

### 7.1 Rolling Volume (Total Operator)
The $2,000 threshold applies to **total operator rolling volume across all campaigns in the past 90 days**.

### 7.2 Disbursement Thresholds
| Rolling 90-Day Volume | Default | Override |
|---|---|---|
| Below $2,000 | Release | 60% to block |
| $2,000 and above | Hold | 60% to approve |

**Lookback grace:** If disbursement would cause rolling total to cross $2,000 at submission, hold-default applies immediately.

### 7.3 Fee Schedule
**The platform charges no fee on campaign funds.** 100% of donated funds are disbursed directly to campaign operators. No percentage is deducted at disbursement.

**Platform funding model:** Platform infrastructure costs are covered by the founding operator via capital contributions to the Wyoming DAO LLC, supplemented by voluntary tips from users who want to support platform operations. Tips are separate from campaign donations — they are contributions to the LLC and do not affect campaign funds or governance weight. Long-term, the platform will pursue grant funding from aligned foundations (e.g., Open Technology Fund, Knight Foundation).

This model was chosen deliberately: a surveillance resistance platform that skims campaign funds has an extractive relationship with the causes it exists to support. Zero platform fees eliminate that tension entirely.

### 7.4 Challenge Anti-Griefing
- After **3 challenges rejected with <25% community support** against the same pair within 90 days → 90-day cooldown for that challenger-operator pair only
- Challenges receiving 25%+ support are contested (not frivolous) and do not trigger cooldown
- Experienced challengers (>50% lifetime confirmation rate): threshold raised to 5 frivolous challenges
- **Challenge eligibility:** reputation ≥ 5 OR contribution history ≥ 30 days old
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

## 9. Human Operator Layer

### 9.1 Role of the Platform Entity
Citeback is operated by the Wyoming DAO LLC (the "platform entity"). The platform entity is an active operator — not a passive relay. It manages the site, reviews campaign proposals, onboards operators, and communicates with the community.

**What the platform entity does:**
- **Campaign proposal review:** Evaluate proposals against platform guidelines before publishing. Review includes legal judgment — campaign type eligibility, target legitimacy, documentation adequacy. The platform entity may reject proposals that violate published guidelines, but may not suppress lawful campaigns for political or competitive reasons.
- **Operator onboarding:** Collect and verify identity documents, execute operator agreements, conduct OFAC pre-screening before any operator may create campaigns.
- **Site content:** Manage platform text, FAQ, documentation, and public-facing communications.
- **Community communications:** Publish governance announcements, respond to community inquiries, escalate novel legal questions to DAO counsel.
- **Legal compliance:** Maintain entity registrations, file required disclosures, and engage DAO counsel on edge cases.

**What the platform entity cannot do:**
- Hold, access, or direct campaign funds — direct-to-operator model, immutable (§15)
- Override community-voted disbursement rules — governance-enforced
- Override community governance votes
- Suppress lawful campaigns that meet published guidelines
- Use emergency pause (§12) to block governance votes or community challenges

### 9.2 Community Accountability for the Platform Entity
The community holds the platform entity accountable through:

- **Misconduct reports (§8):** Any community member may file a misconduct report against the platform entity for abuse of operator privileges — e.g., selective campaign rejection, manipulated OFAC pre-screening, or governance interference.
- **Governance proposals (§6):** Community may propose and vote on binding rules constraining operator conduct via standard governance tiers.
- **Campaign rejection appeals:** An operator who believes a proposal was improperly rejected may publish the rejection notice and grounds to the community governance interface. A Major-tier community vote (§6.1) may overrule the platform entity's decision. This prevents selective suppression of lawful campaigns.
- **Fork right (§16):** If the community loses confidence in the platform entity, fork is always available. The community's ultimate check on operator conduct is exit.

### 9.3 OFAC Screening — Two Layers
Screening operates at two distinct points:

| Layer | Who | When | Scope |
|---|---|---|---|
| Pre-screening | Platform entity | Operator onboarding | Identity-level, before any campaign is created |
| Disbursement screening | Platform operator | At operator onboarding + periodic | OFAC SDN list screening against operator identity |

The pre-screening by the platform entity is the OFAC compliance layer for operators. Operator wallet addresses are screened against the SDN list at onboarding and periodically thereafter.

> **⚠️ OFAC LIMITATION — ATTORNEY MUST ADDRESS BEFORE LAUNCH:**
>
> OFAC's SDN list does not currently include XMR or ZANO wallet addresses. Monero's privacy protocol makes it **technically impossible** to link an incoming donation to an SDN-list identity — sender address, amount, and transaction history are all concealed at the protocol level. Wallet-level screening applies to operator disbursement destinations (identifiable addresses) only — it **cannot screen anonymous incoming donor transactions**.
>
> This is a structural gap in OFAC compliance on the donor side that cannot be closed without destroying Monero's privacy guarantees. It is documented as an Open Question requiring attorney analysis before any live wallet accepts funds (see §Open Questions #1 and #3).
>
> **Current mitigation posture (not a substitute for attorney guidance):**
> - ToS explicitly prohibits donations from OFAC-sanctioned individuals and entities
> - Human OFAC pre-screening of operators (operator side) before any campaign wallet is created
> - No donor-side screening is possible — this limitation must be disclosed to and assessed by DAO counsel before launch

### 9.4 Campaign Proposal Review Process

**Standard path:**
1. Operator submits proposal
2. Platform entity reviews (target eligibility, documentation, campaign type guidelines) — 72-hour SLA
3. If approved: campaign published; community review period begins per §3.7
4. If rejected: operator receives written reason; may resubmit with corrections or invoke appeal path

**Appeal path:** An operator may publish a rejection notice to the community governance interface. A Major-tier community vote may overrule the platform entity's decision.

**Platform entity may not reject based on:**
- Political valence of the campaign target
- Potential embarrassment to specific governments, corporations, or individuals in power
- Controversy alone, provided the campaign meets published guidelines

### 9.5 Wallet Blacklisting Limitation
Probabilistic deterrent only. Primary Sybil defenses: economic floor, 72-hour contribution age, logarithmic weighting, and challenge eligibility.

---

## 10. Wallet Architecture (Direct Model)

**Platform Role:** Citeback is a coordination platform, not a custodian. The platform never holds, receives, or transmits campaign funds. Operators post their own wallet addresses; contributions go directly from contributors to operator wallets. The platform monitors balances via operator-provided Monero view keys (read-only).

- Operators generate their own XMR/ZANO wallet keypair
- Contributions flow directly from contributors to operator wallet — platform never touches funds
- Operator provides a read-only Monero view key so platform can verify balance/activity
- OFAC screening is operator's responsibility, per ToS and Operator Accountability protocol
- Early drain of campaign funds = permanent platform ban

### 10.1 Direct Wallet Model
No platform custody. Operators hold their own keys. Platform monitors via view key. Governance immutable (§15).

### 10.2 No Platform Key Access
Citeback never holds, receives, or controls wallet private keys. Governance immutable (§15).

### 10.3 Near-Zero Platform Exposure
No custodial liability. Platform role is coordination and transparency: publishing wallet addresses, monitoring view-key balances, and enforcing operator accountability rules.

### 10.5 Platform Monitoring Failure Recovery
If the platform monitoring system fails, all campaign activity pauses automatically. A Major-tier vote must be held within 7 days defining recovery: (a) restore monitoring with operator re-attestation, (b) supervised campaign wind-down, or (c) fork. No new campaigns are accepted during recovery without a community-approved plan.

### 10.4 Threat Model
Published and community-ratified before launch. Must address side-channel risks, provider dependencies, supply-chain trust.

---

## 11. Operations Wallet

- **No platform fee deducted from campaigns** (§7.3)
- Platform operations funded by founding operator capital contributions and voluntary user tips to the Wyoming DAO LLC
- Tip inflows and all operational outflows are publicly documented in the quarterly transparency report
- Cannot flow to any individual as profit (immutable §15)
- Quarterly transparency report

---

## 12. Emergency Pause

### 12.1 Triggers
Emergency pause may be triggered by:
- **(a)** Platform entity identifies active technical exploitation, legal emergency, or critical system failure requiring immediate halt
- **(b)** Wallet anomaly: monitoring detects unexpected outflows or view key irregularities
- **(c)** Community member trigger (§12.2)

The platform entity's pause authority under (a) is limited to 72 hours. Extension requires a Major-tier community vote. The platform entity cannot use emergency pause to suppress governance votes or community challenges.

### 12.2 Human-Observable Trigger
Reputation ≥ 25 member submits Pause Request → 12-hour provisional pause. At hour 12: auto-expires unless confirmed by 25-voter simple majority. Safe default: resumption (not escalation). Per-address cooldown: 72 hours between Pause Requests.

### 12.3 Scope and Duration
Suspends new votes, disbursements, campaign creation. Max 72 hours. Extension requires Major-tier vote.

---

## 13. Code Change Governance

All changes via GitHub. Classification governed by §6.2 canonical list — this section references §6.2 only. Governance-tier fund/wallet changes require independent security audit before vote.

---

## 14. Bootstrapping

### 14.1 Founder Voting Restriction
No votes during bootstrapping. After: permanently capped at **5% of any vote total**. Founders cannot vote on their own ceiling removal (§15).

### 14.2 Founder Address Registry
Encoded in platform rules at launch. Cannot be modified by any vote. Founder taint tracking: 3-hop minimum, 50% decay per hop. Any account with >1% residual founder taint counts fully toward the 5% cap — no further discounting. Wallet transfers from founder addresses flagged for community review.

### 14.3 Bootstrapping End Conditions
All three must be met:
1. Platform has been live for at least **6 months**
2. **3 qualifying governance votes** within a 90-day window (50-voter quorum, median contribution ≥ $20, without founder participation)
3. **30-day transition period** where both governance regimes apply simultaneously

**Stagnation escape:** If platform has been active for **36 months** without meeting conditions 1-2, bootstrapping ends automatically. Post-escape governance is identical to post-bootstrapping — founder retains permanent 5% cap, all standard tiers apply. No constraints are relaxed.

### 14.4 Formal Handoff Checklist
- [ ] Wallet architecture published and independently verified
- [ ] Operator wallet submission + view key publication workflow operational with first real campaign
- [ ] Action Logger publishing to public GitHub
- [ ] Community voting interface live
- [ ] Governance doc ratified
- [ ] Founder address registry encoded and attested
- [ ] Founder publicly removes any special access
- [ ] Operator onboarding framework tested (identity verification, OFAC pre-screening, operator agreement execution)
- [ ] Operator accountability protocol published and community-reviewed

---

## 15. Immutables

Encoded in platform architecture. Cannot be overridden by any vote — requires a fork.

1. No human key access
2. Criminal defense prohibition
3. Illegal activity prohibition
4. Camera tampering prohibition
5. No individual surplus distribution
6. Founder ceiling permanence (founders cannot vote on this rule)
7. No custody permanence — platform may not hold campaign funds (see §11 above)
8. Minimum threshold floor ($1 equivalent)
9. Founder address registry permanence
10. OFAC SDN match override prohibition — no community vote may override a denial or rejection based on an OFAC SDN list match. This is a regulatory compliance requirement; it cannot be loosened by governance vote. A fork is required to change it.
11. No platform custody — the platform may not hold, receive, or transmit campaign funds on behalf of operators or contributors. Direct-to-operator wallet model is permanent. A fork is required to change this.

---

## 16. Amendments

Governance documents: Governance-tier process (75% supermajority, 14-day discussion, 14-day time-lock). Immutables require a fork.

Fork option is always available. Community's ultimate check is exit.

---

## Open Questions (Unresolved Pre-Launch)

1. **Monero + AML legal question** *(Attorney required)* — Monero's privacy features create higher AML risk than other crypto. Attorney must address compatibility with the OFAC/KYC framework before launch.
2. **Platform log evidentiary treatment** — If subpoenaed, platform monitoring logs may be primary evidence. Chain-of-custody, data retention obligations, and compromised-instance posture need attorney analysis before launch.
3. **Fiat disbursement pathway** *(Highest operational priority)* — Lawyers get paid in dollars. Billboard vendors require entity names. How do campaigns deploy funds without exposing participants? Requires legal + operational design: privacy-preserving foundation, licensed intermediary, or equivalent. This is not solved by governance — it requires Phase 2 design work.
4. **Monero accessibility** — XMR on-ramps are restricted on many exchanges. Phase 2 priority: atomic swap front-end or multi-asset routing to XMR. Affects accessible donor pool size significantly.
5. **Wallet monitoring implementation** — view key monitoring infrastructure, anomaly detection design
6. **GitHub repo governance during bootstrap** — Founder controls; community fork right guaranteed from day 1
7. **Legislative advocacy compliance mechanism** — Attorney must resolve before type goes live
8. **XMR price oracle** — 30-day rolling average; specific oracle source to be selected
9. **Voting diversity overlap calculation** — Technical specification for 180-day overlap calculation needed
10. **"Accountability vs. extortion" bright line policy** — Attorney must produce an operational definition of where accountability campaigns cross into Hobbs Act territory; operators need decision criteria

---

## Related Documents

- `ARCHITECTURE.md` — Full technical architecture
- `src/data/campaigns.js` — Campaign data
- `src/components/TrustFAQ.jsx` — Public-facing FAQ
