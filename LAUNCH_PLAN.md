# LAUNCH_PLAN.md — Citeback Full Launch Plan
> Written: 2026-05-05 (overnight planning session)  
> Status: Active planning document — review before each sprint  
> Scope: Everything between "site is live, no wallets" and "first campaign wallet active"

---

## Quick Summary

**Where we are:** Static site live. Governance documented. 4/10 launch gates cleared. No wallets, no entity, no attorney, no ToS.

**What launch actually means:** The first XMR/ZANO wallet address is published for a real campaign. Donors can send real crypto. The TEE is doing its job.

**Minimum viable path to soft launch:** Wyoming LLC → Attorney (Items 1 & 3 minimum) → TEE deployed → One wallet live. That's it. Everything else can phase in.

**Realistic fastest timeline:** ~4–5 months (September 2026) if Scott is aggressive on LLC + attorney + TEE simultaneously. Safe/responsible timeline: 6–7 months (November 2026).

---

## 🔴 HARD BLOCKERS — Nothing launches until these are done

These are binary gates. The platform does not accept any funds until every one is cleared.

---

### HB-1. Wyoming DAO LLC — Incorporate

**What it is:** File a Wyoming DAO LLC with wyomingbusiness.gov. Check the DAO designation checkbox. Appoint a registered agent.

**Why it's needed:** Without a legal entity, Scott is personally liable for everything. The entity is the legal counterparty for operator agreements, OFAC compliance, attorney representation, FinCEN registration (if required), and banking. Multiple other blockers (HB-2, HB-3, HB-5) are impossible without this entity existing first.

**Cost:** $100 filing fee + $25–50/yr registered agent (e.g. Wyoming Registered Agent LLC, Registered Agents Inc.). Total first year: ~$150.

**Time:** 1–3 business days online filing, same-day if expedited.

**Who does it:** Scott, online at wyomingbusiness.gov.

**Dependencies:** None. This is the starting gun.

**Reference:** GOVERNANCE.md §2.4, §9, ATTORNEY-BRIEF.md

**Action:** File NOW. There is no reason to wait. This is a $150, 30-minute task.

---

### HB-2. FinCEN / MSB Attorney Opinion

**What it is:** Written legal opinion from a FinCEN/BSA-experienced attorney on whether the platform must register as a Money Services Business under 31 CFR §1010.100(ff)(5) and 18 U.S.C. §1960.

**Why it's needed:** Operating an unregistered MSB is a federal criminal offense carrying up to 5 years imprisonment. No live wallets until this is resolved in writing. If MSB registration is required, the attorney will define the AML program structure around the operator-side KYC the LLC already performs.

**Cost:** $5,000–$15,000 for a written opinion from a crypto-specialized firm. Multi-question engagement (all 12 questions in ATTORNEY-BRIEF.md) may run $20,000–$40,000+ depending on firm and jurisdictions.

**Time:** Engagement kick-off 1 week after retention. Written opinion 3–6 weeks. Allow 8 weeks total.

**Who does it:** Scott retains counsel; attorney does the work.

**Dependencies:** HB-1 (Wyoming LLC must exist — the opinion is directed to the LLC by name, per ATTORNEY-BRIEF.md recommendation).

**Recommended firms to contact:**
- Debevoise & Plimpton (FinCEN/BSA, crypto, OFAC)
- Hogan Lovells (FinCEN, OFAC, crypto)
- Drinker Biddle (MSB, state MTL, crypto)
- Perkins Coie (crypto, internet law, Section 230)
- Anderson Kill (crypto, FinCEN)

**Questions attorney must address (see ATTORNEY-BRIEF.md for full detail):**
- MSB/FinCEN classification (Issue 1) — CRITICAL
- OFAC compliance with anonymous donors (Issue 3) — CRITICAL
- State Money Transmission Licenses (Issue 2)
- Section 230 scope and limits (Issue 6)
- Defamation / named vendors (Issue 4)
- Money laundering disbursement chain (Issue 5)
- FARA/LDA for legislative advocacy campaigns (Issue 7)
- Operator identity compelled disclosure / NSL exposure (Issue 8)
- Securities law — proof-of-donation governance (Issue 10)
- Charitable solicitation registration (Issue 11)
- Tax treatment / constructive receipt (Issue 12)
- Insurance coverage specification (Issue 9)

**Urgency note:** Items 1 (MSB) and 3 (OFAC) are the minimum to clear before any wallet goes live. Other issues can be resolved on a phased basis.

---

### HB-3. TEE Infrastructure — Deploy Minimum 3 Nodes

**What it is:** Deploy the TEE-based wallet infrastructure. Minimum 3 instances across different hardware providers, live with 2-of-3 threshold signatures. Each instance runs Monero wallet RPC daemon inside an Intel SGX or ARM TrustZone enclave. Cryptographic attestation is published and verifiable.

**Why it's needed:** This is the core technical innovation. Without it, someone (Scott) controls the wallet keys, which defeats the platform's entire trust model and creates direct custodial MSB liability. Every campaign goal, every claim in the governance docs, every trust guarantee on the site depends on this being real.

**Cost:** This is the biggest unknown. Options:
- **Phala Network (recommended):** $200–500/mo per node hosting. ~3 nodes = ~$600–1,500/mo infrastructure. Plus development cost: custom Rust/WASM contract for XMR wallet RPC integration. Estimated development: $15,000–50,000 (contractor) or 3–6 months (solo dev familiar with Substrate + XMR RPC).
- **Marlin Oyster:** Similar pricing. Docker container deployment is simpler than Phala's Substrate-based approach.
- **AWS Nitro Enclaves:** More expensive ($500–2,000/mo per node), less community-verifiable, enterprise grade. Not ideal for this mission.
- **Self-hosted SGX:** Most control. Requires SGX-capable servers ($1,500–3,000 hardware per node). Higher ops complexity but lowest ongoing cost and maximum community verifiability.

**Total estimated cost:** $30,000–80,000 for initial build (contractor) + $600–1,500/mo ongoing infra.

**Time:** This is the longest item on the critical path. Realistically:
- Provider selection and research: 2–4 weeks
- Contractor sourcing: 2–4 weeks  
- Development: 8–16 weeks
- Testing, audit, attestation publication: 4–8 weeks
- **Total: 4–7 months from decision to go-live**

**Who does it:** Either a specialized contractor (Rust + Intel SGX + Monero RPC experience required), or Scott if he has deep systems programming background (not recommended for solo first build given the security stakes). The platform's security model depends on this being correct.

**Dependencies:** HB-1 (entity), HB-2 (attorney — need to know if MSB registration affects TEE architecture design). Can begin provider research and contractor sourcing in parallel with attorney work.

**CRITICAL INTERIM QUESTION:** Can the platform soft-launch with human-held interim escrow while TEE is built? See HB-3-INTERIM below.

---

### HB-3-INTERIM. Human Escrow Interim Option (Decision Point for Scott)

**What it is:** Rather than waiting for the full TEE build (4–7 months), consider a "Phase 1 Soft Launch" where campaign funds are held in a multisig arrangement by identified humans (Scott + 1–2 trustees) under a formal escrow agreement, with full disclosure to donors that this is interim non-TEE custody.

**Why consider it:** Gets the platform generating real campaign activity and donor trust faster. First campaigns ($800–$1,500 each) are small enough that the custody risk is manageable. Real campaigns help attract operators and refine the product before the TEE is live.

**Why it's risky:**
- Destroys the "no human key access" trust guarantee for early campaigns
- Creates direct custodial liability for Scott
- May affect MSB analysis (human custodian = clearer money transmitter)
- Could damage credibility with early donors who believe the TEE story

**Decision:** Scott must decide this with his attorney. It should not be done without explicit legal sign-off. If done, it requires full, prominent disclosure on every campaign card ("Interim custody: funds held by Wyoming DAO LLC in [structure] pending TEE deployment. TEE deployment expected [date].").

**Recommendation:** Probably not worth the legal and credibility risk. The TEE is the product. Ship the real thing.

---

### HB-4. Terms of Service — Published and Linked

**What it is:** A live ToS page at citeback.com/tos (or equivalent) linked from the site footer. Draft exists at TOS_DRAFT.md in this repository but requires attorney review before publication.

**Why it's needed:** 
- Referenced in governance docs but missing from the site (credibility gap, flagged in red-team audit)
- OFAC gap disclosure must appear in ToS
- No refund policy, campaign failure policy, operator responsibilities must be documented
- Site cannot credibly claim legal compliance framing without a ToS
- Attorney will likely want to review before any wallet goes live anyway

**Cost:** $500–2,000 attorney review of the draft. Less if bundled with the main engagement.

**Time:** Draft is done (TOS_DRAFT.md). Attorney review: 1–2 weeks. Implementation: 1 day.

**Who does it:** Scott implements the page; attorney reviews the draft.

**Dependencies:** HB-2 (attorney). Can use TOS_DRAFT.md as a starting point.

---

### HB-5. First Campaign Wallet — Activated

**What it is:** The TEE generates and publishes the first real XMR wallet address for a live campaign. This is the final launch gate — the moment Citeback is operational.

**Why it's needed:** This is what "launched" means.

**Cost:** $0 marginal (TEE is already running at this point)

**Time:** Minutes, once TEE is live and first campaign approved.

**Dependencies:** ALL other hard blockers (HB-1 through HB-4). Plus: first operator has been onboarded, their campaign proposal reviewed and approved, wallet agent running.

---

## ⚖️ LEGAL — Required Before Full Launch

These are not all binary gates, but each is needed before the platform operates at scale.

---

### L-1. OFAC Compliance Documentation

**What it is:** Formalize the operator-side OFAC pre-screening process into a written policy with documented procedures, screening logs, and operator agreement language.

**Why it's needed:** OFAC enforcement is strict liability. The human pre-screening of operators is the primary compliance mechanism. It must be documented to have evidentiary value.

**Cost:** Included in attorney engagement (Issue 3 in ATTORNEY-BRIEF.md)

**Time:** Concurrent with attorney work; implementation 1–2 weeks after opinion received.

**Who does it:** Attorney drafts policy; Scott implements.

**Note:** The anonymous XMR donor gap cannot be closed architecturally. The attorney must assess the risk and the ToS disclosure as mitigation. Do not launch until this assessment is in writing.

---

### L-2. State Money Transmission License Analysis

**What it is:** Attorney analysis of MTL obligations in NY, CA, TX, FL, IL and a summary of remaining state landscape. Determination of whether any licenses are required before launch.

**Why it's needed:** Unlicensed money transmission is criminal in most states. The platform has anonymous donors from all 50 states.

**Cost:** Included in attorney engagement (Issue 2 in ATTORNEY-BRIEF.md). If separate specialist needed, $5,000–15,000 additional.

**Time:** Attorney work, 4–8 weeks.

**Who does it:** Attorney.

**Note:** The TEE non-custodial architecture and Monero-only model may exempt the platform in some states. This is not a certainty — do not assume exemption without written analysis.

---

### L-3. Campaign #4 — Legislative Advocacy Attorney Sign-Off

**What it is:** Explicit attorney sign-off that Campaign #4 (NM ALPR Privacy Bill) can operate under LDA and FARA without the platform or operator triggering registration obligations, or a determination of what disclosure/compliance structure is needed.

**Why it's needed:** Campaign #4 is labeled with an ⚠️ in campaigns.js itself — it has a pre-launch attorney sign-off requirement baked into the campaign description. GOVERNANCE.md §3.2 also requires legal review before legislative advocacy campaigns go live.

**Cost:** Included in attorney engagement (Issue 7)

**Time:** Part of main attorney engagement.

**Who does it:** Attorney.

**Note:** This campaign can go live AFTER attorney clearance. The FOIA and billboard campaigns (1, 2, 3, 5, 6) likely have a cleaner path and could launch first.

---

### L-4. Operator Accountability Protocol — Published

**What it is:** A documented process for how community members can challenge operator decisions (campaign approvals, operator onboarding denials), including SLA, escalation path, and appeal procedure.

**Why it's needed:** Listed as a Launch Prerequisite in GOVERNANCE.md. Required before operator onboarding begins.

**Cost:** Internal work product, 1–2 days. Legal review: bundled with attorney engagement.

**Time:** 1 week to draft; attorney review concurrent.

**Who does it:** Scott drafts; attorney reviews.

---

### L-5. Governance Document — Community Ratification

**What it is:** GOVERNANCE.md (currently v0.8) ratified via the bootstrapping governance process defined in §14.

**Why it's needed:** GOVERNANCE.md §14 requires governance ratification as a launch prerequisite. During bootstrapping, this requires Scott's formal sign-off and a public announcement that this is the launch-version governance spec.

**Cost:** $0

**Time:** 1 day once all content is finalized.

**Who does it:** Scott announces ratification publicly (GitHub, citeback@proton.me channel).

**Note:** Governance will evolve, but a v1.0 ratification is required before wallets go live.

---

### L-6. Billboard Campaign Liability Review

**What it is:** Attorney review of billboard campaign specific liability: Hobbs Act "accountability vs. extortion" bright line, §230 posture for billboard content, operator attestation language, and which specific federal statutes could pierce §230 for this campaign type.

**Why it's needed:** Billboard campaigns are the most legally exposed campaign type. Clearview AI and Flock Safety have legal resources and incentive to litigate.

**Cost:** Included in attorney engagement (Issue 4, Issue 6)

**Time:** Part of main attorney engagement.

**Who does it:** Attorney.

---

### L-7. Campaign Quality Advisory Board — Minimum 2 Members

**What it is:** At least one civil liberties attorney and one surveillance accountability practitioner available to review early campaigns before community votes.

**Why it's needed:** GOVERNANCE.md lists this as a Launch Prerequisite. Domain expertise the community cannot provide early on.

**Cost:** Pro bono possible given the mission. If compensated: $1,000–5,000/yr per expert advisor.

**Time:** 2–4 weeks to recruit.

**Who does it:** Scott outreach. EFF, ACLU, Surveillance Technology Oversight Project (S.T.O.P.) are good starting points.

---

## ⚙️ TECHNICAL — Build or Configure Before Launch

---

### T-1. TEE Provider Selection

**What it is:** Evaluate Phala Network, Marlin Oyster, and self-hosted SGX. Make a binding decision before development begins.

**Evaluation criteria:**
- Open-source attestation verifiability (community can independently verify)
- Monero RPC daemon support inside enclave
- Multi-instance 2-of-3 threshold signature support
- Operational cost
- Recovery path if provider shuts down (self-sovereignty)
- Track record / production deployments

**Recommendation:** Phala or Marlin for first deployment. Phala has more documentation and community; Marlin has simpler arbitrary code deployment. Self-hosted SGX is the long-term ideal but adds operational burden.

**Time:** 2–4 weeks research and decision.

**Who does it:** Scott + technical contractor (who will do T-2).

**Cost:** $0 for evaluation, but decision drives T-2 cost.

---

### T-2. TEE Wallet Agent — Development

**What it is:** Build the software that runs inside the TEE enclave:
- Monero wallet RPC daemon integration
- Wallet creation per campaign
- Fund custody
- Automated disbursement logic per governance rules
- OFAC screening at disbursement
- Cryptographic attestation
- Action logger output

**Technology stack:**
- Rust (for Phala/Marlin WASM targets)
- `monero-rpc` or `monero-rs` crate integration
- 2-of-3 threshold signature implementation (FROST or similar)
- Attestation report generation

**This is the hardest technical problem on the board.** The combination of TEE isolation + Monero RPC + threshold signatures + governance logic integration is non-trivial engineering. Finding a contractor with all four skills simultaneously is a challenge.

**Cost:** $25,000–75,000 depending on contractor rate and complexity. Could be $100,000+ with a premium Rust/TEE specialist firm.

**Time:** 8–16 weeks development, 4–8 weeks testing and audit.

**Who does it:** Specialized contractor. Ideal profile: Rust developer with TEE (SGX/TrustZone) experience + familiarity with privacy coins. 

**Recruiting options:**
- Upwork (filter: Rust + Intel SGX — 50–100 results)
- jobs.rust-lang.org
- Web3 job boards: Cryptocurrency Jobs, CryptoJobsList
- Direct outreach to Phala or Marlin ecosystem developers
- Referrals from EFF, Privacy Guides community

---

### T-3. TEE Threat Model — Publish and Ratify

**What it is:** A written, published, community-ratified threat model document covering: side-channel risks (Spectre/Meltdown variants), provider dependency analysis, supply-chain trust assumptions, hardware vs. software trust boundaries, and the platform's mitigations.

**Why it's needed:** Required launch prerequisite in GOVERNANCE.md §10.4. Community cannot ratify the security model they don't understand.

**Cost:** $2,000–8,000 (security consultant review) or self-authored with community review.

**Time:** 2 weeks to draft; community ratification 1–2 weeks.

**Who does it:** Scott drafts; security-minded community members review. Professional security audit highly recommended before mainnet.

---

### T-4. TEE Remote Attestation — Published and Verifiable

**What it is:** Live cryptographic attestation published publicly so anyone can independently verify the TEE is running the audited code (matches GitHub commit hash).

**Why it's needed:** LaunchTracker gate. The core trust guarantee.

**Cost:** $0 marginal (produced by TEE deployment)

**Time:** Concurrent with T-2 deployment.

**Who does it:** TEE contractor delivers this as part of deployment.

---

### T-5. Monero View Keys — Published

**What it is:** Campaign wallet view keys published so anyone can verify balances and transaction history without spending access.

**Why it's needed:** Transparency requirement; part of the platform's trust model.

**Cost:** $0 (generated by Monero wallet daemon)

**Time:** Concurrent with first wallet activation.

**Who does it:** TEE contractor sets up publication pipeline.

---

### T-6. Action Logger — Live, Publishing to GitHub

**What it is:** The append-only public log of all TEE actions (wallet creation, disbursements, challenges) publishing to GitHub automatically.

**Why it's needed:** GOVERNANCE.md §14 Formal Handoff Checklist item. Transparency foundation.

**Cost:** $0 marginal (part of TEE build)

**Time:** Concurrent with T-2.

**Who does it:** TEE contractor.

---

### T-7. Community Voting Interface — Live

**What it is:** A functional UI where community members (proof-of-donation holders) can see and vote on disbursement challenges and campaign governance questions.

**Why it's needed:** Without this, governance exists only on paper. Community cannot exercise challenge rights without a functional interface.

**Cost:** 2–4 weeks development. Can be built by Scott if comfortable with React (site is already Vite + React). Or $5,000–15,000 contractor.

**Time:** 2–4 weeks.

**Who does it:** Scott or frontend contractor.

**Note:** This can be simple MVP — a list of open votes with wallet-signature-based voting. Does not need to be polished at launch.

---

### T-8. Founder Address Registry — TEE-Encoded, Attested

**What it is:** Scott's wallet addresses encoded into the TEE at launch, so the system can enforce the 5% founder voting cap and taint tracking defined in GOVERNANCE.md §14.2.

**Why it's needed:** GOVERNANCE.md §14 Formal Handoff Checklist item. Prevents founder from having outsized governance influence post-launch.

**Cost:** $0 marginal (part of TEE setup)

**Time:** Concurrent with TEE deployment.

**Who does it:** TEE contractor + Scott provides addresses.

---

### T-9. Broken Link Fixes (Pre-Launch Verify Items)

**What they are (from PRE-LAUNCH.md):**
- Cambridge MA ALPR: ActivityTicker says "Dec 2025" — source URL 404. Verify if this is a separate event from 2023 termination or fix/remove.
- Washington State ALPR: ActivityTicker source returns 403 — find working permalink.
- ShotSpotter "40,000 times in a single year": May cover 21 months. Fix phrasing if confirmed.

**Cost:** $0 (research time)

**Time:** 2–4 hours per item.

**Who does it:** Scott, with web research.

**Note:** These are soft blockers but important for credibility. Fix before launch.

---

### T-10. Server-Side API Proxy (Optional Pre-Launch)

**What it is:** Proxy CourtListener, Congress.gov, Overpass, and other API calls through a Netlify serverless function to prevent visitor IP leakage to third parties.

**Why it's needed:** Every direct client-side API call sends the visitor's IP to a third party. Inconsistent with the platform's surveillance resistance mission.

**Cost:** 1–2 days development. $0 infrastructure (Netlify Functions included in plan).

**Time:** 1–2 days.

**Who does it:** Scott.

**Priority:** PRE-LAUNCH.md rates this as "low priority pre-launch, important for credibility post-launch." Recommend doing it before wallets go live given the mission.

---

### T-11. ARCHITECTURE.md Stale Fee Reference — Fix

**What it is:** ARCHITECTURE.md currently references "1% platform fee" in two places (Design Principles section and Wallet Agent section). The correct fee is the graduated 3–5% schedule per GOVERNANCE.md §7.3. This should be fixed to avoid internal documentation contradictions.

**Cost:** 30 minutes.

**Time:** Immediate.

**Who does it:** Scott or agent.

---

## 🏗️ OPERATIONAL — Systems and Processes Needed

---

### O-1. Operator Identity Verification System

**What it is:** A documented process and system for collecting, verifying, and storing operator identity documents privately. Must comply with attorney-defined OFAC pre-screening requirements.

**Why it's needed:** Required by GOVERNANCE.md §2.2. Platform cannot onboard operators without this.

**Cost:** $0–$500/mo (KYC API service) + attorney design input

**Time:** 2–4 weeks setup after attorney guidance received.

**Who does it:** Scott sets up; attorney defines requirements.

---

### O-2. Operator Agreement — Drafted and Executed

**What it is:** A formal operator agreement that every operator signs before creating campaigns. Covers: identity verification consent, OFAC screening consent, liability attestation (billboard claims), campaign taxonomy compliance, platform fee acknowledgment, non-disclosure of other operators.

**Cost:** $1,000–3,000 attorney draft. May be included in main engagement.

**Time:** 1–2 weeks attorney draft; immediate implementation after.

**Who does it:** Attorney drafts; Scott executes with each operator.

---

### O-3. First Operator — Recruit and Onboard

**What it is:** Recruit, identity-verify, and onboard the first real campaign operator. Probably Scott running the first FOIA campaign himself, or a known civil liberties contact.

**Why it's needed:** Can't have a first campaign wallet without an approved operator.

**Cost:** $0 (internal)

**Time:** 1–2 weeks.

**Who does it:** Scott.

**Note:** Scott can onboard himself as the first operator for initial FOIA campaigns. Simplest path to first campaign activation.

---

### O-4. Operations Wallet — Established

**What it is:** The platform operations wallet (also TEE-secured) that receives the graduated fee. Needs a view key published, transparency reporting plan, and community notification threshold ($10k+ balance triggers community notification).

**Cost:** $0 marginal (part of TEE build)

**Time:** Concurrent with TEE deployment.

**Who does it:** TEE contractor.

---

### O-5. Misconduct Bond and Staking Systems — Tested

**What it is:** The operational test of the misconduct bond (§8.1: 0.5% of accused operator's largest campaign, min $10, max $250) and operator staking (§3.6: 2–5% of campaign goal). These need to actually work before launch.

**Cost:** $0 (internal test using small amounts)

**Time:** 1–2 weeks testing.

**Who does it:** Scott with TEE contractor.

---

### O-6. FOIA Filing Capability — Confirmed

**What it is:** Confirm the platform can actually fulfill FOIA campaigns. Either: Scott has direct FOIA filing experience, or a partner attorney/specialist is identified who can execute the filings when funds are available.

**Why it's needed:** Campaign #1, #5, #6 are FOIA campaigns. Platform credibility depends on actually doing the work when funded.

**Cost:** $0 to confirm; FOIA attorney $200–500 per filing if outsourced.

**Time:** 1 week to confirm.

**Who does it:** Scott.

---

### O-7. Billboard Procurement Pathway — Tested

**What it is:** Identify a billboard vendor (Lamar, Adams, local) who will actually place the billboard content for Campaigns #2 (Taos) and #3 (Las Cruces). Confirm pricing, lead time, permit requirements.

**Why it's needed:** Campaigns 2 and 3 are billboard campaigns. Before accepting money for them, the platform should know it can actually execute.

**Cost:** $0 to identify vendor; billboard cost is part of campaign goal.

**Time:** 1 week of phone calls.

**Who does it:** Scott.

---

## 🌱 COMMUNITY — Building the Network

---

### C-1. Public Beta Announcement — Mailing List

**What it is:** A simple sign-up for "notify me when wallets go live." Not a whitelist, not a KYC, just an email list. Even a simple Mailchimp/Listmonk setup.

**Why it's needed:** No donors to the first campaign if no one knows it exists. Building a small advance audience during pre-launch costs nothing.

**Cost:** $0 (Mailchimp free tier up to 500 contacts)

**Time:** 2 hours to set up.

**Who does it:** Scott.

---

### C-2. Governance Ratification Announcement

**What it is:** Public announcement that GOVERNANCE.md v1.0 is ratified. Published on GitHub, linked from site, announced to any mailing list.

**Cost:** $0

**Time:** 1 hour.

**Who does it:** Scott.

---

### C-3. Expert Directory — Populated

**What it is:** At least 2–3 real entries in the Expert Directory (attorneys, FOIA specialists, or technical contributors who have agreed to be listed).

**Why it's needed:** An empty directory is worse than no directory — it signals the platform hasn't gained any real traction.

**Cost:** $0

**Time:** 2–4 weeks outreach.

**Who does it:** Scott.

---

### C-4. Nostr Presence — Established

**What it is:** A Citeback Nostr public key for cross-platform community announcements. Nostr is recommended as the preferred identity system per GOVERNANCE.md §2.5.

**Cost:** $0

**Time:** 1 hour.

**Who does it:** Scott.

---

## 📣 MARKETING — Pre-Launch Awareness

---

### M-1. Target Audience Identification

**Primary targets:**
- EFF (Electronic Frontier Foundation) — core alignment, may amplify or partner
- ACLU chapters (NM, WA, VA, CA) — campaign-location specific
- Surveillance Technology Oversight Project (S.T.O.P.)
- Fight for the Future
- Big Brother Watch (UK — international angle)
- r/privacy, r/privacyguides, r/antiasurveillance
- Monero community (XMR Reddit, Monero Talk, Cake Wallet community)

**Time:** Outreach begins after attorney opinion in hand (don't attract regulatory attention before legal house is in order).

---

### M-2. Press Strategy — Embargo Until Launch

**Do not pitch press until:**
1. Wyoming LLC is filed
2. Attorney opinion in hand
3. TEE is live and attested
4. At least one wallet address is published

**Target press for launch:**
- The Intercept (surveillance accountability beat)
- 404 Media (tech accountability)
- Wired (privacy and crypto)
- The Guardian (surveillance, civil liberties)
- KOB 4 (already sourced in campaigns.js — local NM tie-in)
- ProgressNow NM (already sourced — NM policy angle)
- Monero-specific: Monero Observer, Localmonero community

**Press angle:** "The first anonymous surveillance-resistance crowdfunding platform built to be lawsuit-resistant" — lead with TEE attestation as the differentiator.

---

### M-3. Domain Hygiene

**Outstanding items:**
- Verify citeback.com ICANN registration: scotthughes070@proton.me must verify before **May 14, 2026** (see MEMORY.md — this is urgent)
- fourthright.com parked on GoDaddy, expires 2026-11-19 — decide whether to acquire (currently ~$offer-pending on Namecheap). If Fourthright is the platform's "real name," own that domain.

**Time:** 30 minutes for ICANN verification (urgent). Domain purchase decision: 1 week.

---

## DECISION POINTS — Scott Must Decide These

These cannot be decided by planning documents. They require Scott's judgment (or attorney guidance):

| # | Decision | Options | When Needed |
|---|---|---|---|
| D-1 | TEE provider | Phala vs. Marlin vs. self-hosted SGX | Before T-2 begins |
| D-2 | Soft launch with interim escrow? | Yes (with full disclosure) vs. No (wait for TEE) | Before any wallet discussion |
| D-3 | Attorney firm | Which firm for main engagement | Immediately after LLC files |
| D-4 | Which campaigns launch first? | FOIA-only to start, then billboard after §230 clearance? | After attorney opinion |
| D-5 | Will Scott be the first operator? | Self-operate first campaigns vs. recruit external operator | Before operator onboarding |
| D-6 | fourthright.com domain acquisition | Buy vs. let expire | Before 2026-11-19 |
| D-7 | OG image upgrade | Current auto-generated vs. branded version | Before press outreach |

---

## DEPENDENCY MAP

```
HB-1 (Wyoming LLC)
    └─► HB-2 (Attorney opinion) ──────┬─► L-1 (OFAC documentation)
    │                                  ├─► L-2 (MTL analysis)
    │                                  ├─► L-3 (Campaign #4 sign-off)
    │                                  ├─► L-6 (Billboard review)
    │                                  ├─► HB-4 (ToS published)
    │                                  └─► O-2 (Operator agreement)
    │
    └─► T-1 (TEE provider selection)
          └─► T-2 (TEE development) ───┬─► T-3 (Threat model)
                                        ├─► T-4 (Attestation published)
                                        ├─► T-5 (View keys published)
                                        ├─► T-6 (Action logger live)
                                        ├─► T-8 (Founder address registry)
                                        └─► O-4 (Operations wallet)

HB-2 + T-2 + HB-4 + O-2 ──────────────► O-3 (First operator onboarded)
                                               └─► HB-5 (First campaign wallet LIVE)

T-7 (Voting UI) ──── Parallel with above, needed before first disbursement vote

L-4 (Operator Accountability Protocol) ── Before operator onboarding
L-5 (Governance ratification) ─────────── Before operator onboarding
L-7 (Campaign Advisory Board) ─────────── Before first campaign approved
O-5 (Misconduct + staking tested) ──────── Before first campaign wallet
O-6 (FOIA capability confirmed) ────────── Before FOIA campaigns go live
O-7 (Billboard procurement) ─────────────── Before billboard campaigns go live
```

---

## ESTIMATED TOTAL PRE-LAUNCH COST

| Category | Low Estimate | High Estimate |
|---|---|---|
| Wyoming LLC (one-time) | $150 | $200 |
| Attorney engagement (all 12 questions) | $20,000 | $40,000 |
| TEE development (contractor) | $30,000 | $80,000 |
| TEE infrastructure ongoing | $600/mo | $1,500/mo |
| Security audit | $5,000 | $20,000 |
| Community voting UI | $0 (Scott) | $15,000 |
| ToS attorney review | $500 | $2,000 |
| Operator agreement | $1,000 | $3,000 |
| Campaign Advisory Board | $0 (pro bono) | $5,000/yr |
| Miscellaneous (domains, tools) | $500 | $2,000 |
| **TOTAL ONE-TIME** | **~$57,000** | **~$162,000** |
| **TOTAL ONGOING/YR** | **~$8,000** | **~$20,000** |

**Funding the build:**
- The platform earns 3–5% fees. On $100k annual campaign volume, that's $3,000–5,000. Not enough to fund the build.
- Grant options: EFF grants, Mozilla Foundation, Open Technology Fund, FOIA Machine community, Protocol Labs (if Filecoin/IPFS integration considered).
- Scott's own capital is the most likely path to initial build.
- Consider: a "pre-launch donor campaign" where early supporters fund the TEE build (with full disclosure that no operational funds are accepted until TEE is live). This aligns incentives and builds community. Requires attorney review of whether this constitutes securities or charitable solicitation.

---

*Last updated: 2026-05-05 | This document should be reviewed and updated at the start of each sprint.*
