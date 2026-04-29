# Citeback — Governance Specification

> Version: 0.2 — Draft  
> Status: Design phase  
> Last updated: 2026-04-29

---

## Philosophy

Citeback governance is designed around one principle: **no individual should have the power to destroy the platform.**

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

The AI system has two strictly separated layers:

**Execution Layer — deterministic code only, no AI**
- Releases funds when coded rules are satisfied
- Deploys site changes after votes and time-locks clear
- Enforces time-locks
- Logs every action publicly
- Cannot act outside its encoded rules
- No AI model is in the execution path — money moves on rules, not inference

**Monitoring Ensemble — AI models for detection only**
- 2–3 independent AI models watch for attack patterns, anomalies, and governance gaming
- Models must reach consensus before any protective action is triggered
- Models can flag, propose, and recommend — they do not execute
- Model identities are not published (prevents targeted blind-spot attacks)
- Models are subject to the upgrade rules defined in the AI System section below

The agents are not participants — they are tools the community governs.

### The Founder (Scott)
- Bootstraps the initial codebase and enclave
- Holds no special governance rights post-launch
- Cannot access wallets (TEE enforced)
- **Cannot vote during the bootstrapping period** (first 6 months post-launch, or until voting quorum is reachable by the general community — whichever comes first). This prevents founder dominance during the period when community participation is lowest.
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

All changes to Citeback's code go through GitHub. The Site Agent enforces the process.

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

Confirmed misconduct is permanent and public. There is no appeals process. This is intentional - it creates a strong disincentive to act in bad faith.

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
- **Monero address** - generates a pseudonymous but consistent identity
- **Nostr public key** - adds cross-platform portability

Signing a vote with your private key proves identity without revealing it.

### Weight

Voting weight is based on **cumulative donation history** — not wallet count. Funding and voting are intentionally decoupled: anyone can donate any amount with no cap. The caps below apply only to *voting weight*. A single donor can fund an entire campaign and still has the same governance ceiling as anyone else.

**Thresholds scale with campaign goal** so that attacking a large legal fund costs proportionally more than attacking a small billboard campaign. Thresholds are denominated in USD-equivalent.

**Weight calculation (per campaign):**

| Cumulative donations to this campaign | Voting weight earned |
|---|---|
| Below 0.5% of goal | No weight |
| 0.5%–8% of goal | 1:1 (full weight) |
| 8%–20% of goal | 50% on the excess |
| Above 20% of goal | Capped — no additional weight |

**Example — $750 billboard:** min $3.75 to vote · full weight to $60 · ceiling at $150  
**Example — $8,000 legal fund:** min $40 to vote · full weight to $640 · ceiling at $1,600

**Rules that close known loopholes:**
- Only wallets with donation history **before a proposal was submitted** can vote on it — last-minute flooding is impossible
- Vote weight is calculated at proposal timestamp, not vote time — no retroactive boosting
- Splitting across wallets hurts the attacker (each address starts from zero, each pays the minimum threshold separately)
- Campaign goals are validated during approval (cost breakdown required) — artificially low goals to lower thresholds are rejected at the proposal stage
- XMR price recalibration uses a **30-day rolling average**, not spot price — price manipulation cannot suddenly lower thresholds. Downward threshold adjustments are capped at 20% per recalibration cycle; upward adjustments are uncapped
- Donation velocity is monitored — unusual acceleration from existing wallets is flagged identically to a surge in new wallets

### Anti-Sybil Defense Stack

Defenses are layered so that bypassing one layer still faces the others:

1. **Economic floor** — every fake voter identity costs real XMR (minimum 0.5% of goal, scales with campaign)
2. **Splitting penalty** — Sybil wallets each pay the entry cost independently; consolidating into one wallet is always more efficient
3. **Time-lock** — pre-proposal donation history required; no flooding a live vote
4. **AI ensemble monitoring** — 2–3 independent models watch for coordinated patterns; consensus required before action
5. **Wallet blacklisting** — confirmed attack wallets are permanently excluded (see AI System section)
6. **Emergency pause** — active attack distorting a live vote can be frozen (see AI System section)

### Adaptive Governance Parameters

The AI ensemble can **propose** parameter adjustments when it detects gaming. It cannot act unilaterally.

**Proposable adjustments (minor change tier — community vote required):**
- Weight curve percentages
- Minimum donation age (e.g. require 7-day-old history instead of just pre-proposal)
- Quorum thresholds per vote type
- Blacklist confidence threshold

**Requires governance-tier vote (75% supermajority + 14-day time-lock):**
- Disbursement vote thresholds
- Emergency pause trigger bar
- Benchmark suite definition (see AI System section)
- Permanent constraint list

All AI proposals are logged publicly. The AI flags and proposes; the community votes.

---

## AI System Architecture

This section defines how the AI monitoring ensemble works, how it is defended against manipulation, and how models are upgraded.

### Execution vs. Monitoring Separation

The execution layer (releasing funds, deploying code) runs on **deterministic rules only** — no AI model is involved in any action that moves money or changes the live site. This means the execution layer cannot be fooled, manipulated, or gradually influenced by adversarial inputs. It either satisfies the coded conditions or it doesn't.

The monitoring ensemble operates entirely separately. It can flag, pause, propose, and recommend — but every consequential action it proposes still flows through the community vote process or coded execution rules.

### Monitoring Ensemble

- 2–3 independent AI models run in parallel inside the TEE
- Each model independently analyzes voting patterns, donation velocity, wallet clustering, and governance activity
- **Consensus required for action:** a 1-of-N flag triggers elevated monitoring mode only. A majority flag triggers protective action (blacklist proposal, pause trigger)
- **Model identities are not published.** The community knows N models exist; they do not know which models or architectures. This prevents targeted blind-spot attacks where an adversary studies a known model's weaknesses
- **Probation runs blind.** When a new model is in the 30-day shadow probation period, its flags are not published in real time. Results are compared after probation ends. This prevents an attacker from laying low during probation and striking after the upgrade goes live

### Wallet Blacklisting

When the ensemble reaches consensus that a wallet is part of a coordinated attack:

1. The wallet is flagged with a confidence score and the evidence (pattern match, timing analysis, clustering data) is logged publicly
2. Blacklisting requires **high confidence threshold** — a single anomaly is not enough. Multiple corroborating signals across independent models are required
3. The blacklisted wallet is excluded from all future votes permanently
4. The blacklist entry is public and includes the evidence — not just a ban, but a documented record

**Appeal process (anti-weaponization rule):**
- A blacklisted wallet can appeal by submitting a community vote request
- Appeal requires a **donation stake** equal to 10% of the wallet's cumulative donation history, paid to the ops wallet — this stake is burned if the appeal fails, returned if the appeal succeeds
- This prevents both mass false-positive blacklisting (high cost to wrongly ban a real donor) and trivial appeal spam (costs something to challenge)
- If an appeal succeeds, the blacklist entry is removed and the evidence is flagged as a false positive, feeding back into model improvement

**Anti-weaponization:** The ensemble monitors for attempts to get legitimate wallets blacklisted by mimicking their donation patterns. Artificially induced false positives are themselves a flagged attack pattern.

### Emergency Pause

If an active attack is distorting a live vote:

**Trigger requires all three:**
1. Ensemble majority consensus that an attack is in progress (not just elevated monitoring)
2. Statistical evidence that the active vote outcome is being materially affected
3. The attack pattern is ongoing, not historical

This three-signal requirement prevents the pause from being used as a denial-of-service weapon — an attacker cannot repeatedly trigger pauses by manufacturing one signal.

**Pause behavior:**
- The affected campaign vote is frozen; all other campaigns continue independently (cascading platform-wide pauses require all three signals across 3+ campaigns simultaneously)
- Paused state is announced publicly with the evidence
- Community has 72 hours to review and vote to resume early or extend
- **Maximum pause: 72 hours auto-resume** — if no community action is taken, the vote resumes automatically. This prevents indefinite stalling by freeze
- After resume, blacklisted wallets are excluded and the vote restarts with clean participants

### AI Model Upgrades

**Core rule: models can only be upgraded, never downgraded.** A candidate model must demonstrably outperform the current model on Citeback's benchmark suite. The community cannot vote to install a lower-scoring model — math decides, not politics.

**Benchmark suite:**
- Tests are specific to Citeback's threat model: Sybil detection accuracy, false positive rate, coordinated attack pattern recognition, adversarial input resistance
- General AI capability benchmarks are irrelevant — a model better at writing essays but worse at detecting coordinated wallet clustering does not qualify
- **The benchmark suite definition is governance-tier** (75% supermajority + 14-day time-lock to change) — this prevents an attacker from socially engineering a benchmark redefinition that a weaker model happens to pass
- The initial benchmark suite is published as part of pre-launch documentation and ratified by community vote before the first upgrade is ever considered

**Upgrade pipeline:**
1. Candidate model proposed (anyone can propose; includes benchmark scores from independent evaluation)
2. Community votes to enter 30-day shadow probation (minor change tier)
3. Shadow probation: candidate runs blind alongside current model; results compared after 30 days
4. If candidate outscores current model in live probation → upgrade proceeds, TEE re-attests, community verifies attestation
5. If candidate scores lower → rejected, current model stays, vote result preserved for retry with a different candidate
6. The pipeline is atomic — if the deployment step fails after a passed probation, the current model stays running and the vote result is preserved for retry

**Pre-launch:** Before Phase 2 launch, the ensemble is run against synthetic attack datasets (not just benchmarks) to reduce first-attack naivety. This is part of the Phase 2 launch checklist.

---

## Emergency Procedures

### Pause

See AI System — Emergency Pause section above for the full pause mechanism.

For non-AI emergencies (infrastructure failure, TEE compromise discovery, etc.):
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

This is the nuclear option - but it's always available, which keeps any would-be captors honest.

---

## Mission Constitution (Immutable)

This section defines Citeback's permanent, unchangeable purpose. No vote, no founder action, no AI decision, and no community consensus can alter or override it.

### The Principle

Citeback exists to **document, challenge, limit, or resist the exercise of institutional power over individuals** — including surveillance, tracking, data collection, monitoring, and privacy violations carried out by:
- Government bodies at any level (federal, state, local)
- Government-funded or government-authorized entities
- Private actors operating under government contracts or authority

This framing is intentionally structural rather than legal. It does not require a court ruling, a constitutional determination, or political consensus. The test is simple: **is institutional power being used against individuals?** If yes, it is within scope.

This definition is deliberately broad to accommodate future forms of overreach that cannot be anticipated today.

### Campaign Mission Filter

Every campaign proposal is evaluated by the AI ensemble against the mission principle before it reaches a community vote.

**Ensemble evaluation tiers:**

| Ensemble signal | Outcome |
|---|---|
| 1-of-3 models flags concern | No block — proposal proceeds with a community scrutiny flag |
| 2-of-3 models reject | Soft block — requires 60% community vote to proceed |
| 3-of-3 models reject | Hard block — requires 75% community supermajority to proceed |

The AI evaluates **structural alignment only** — does this challenge institutional power over individuals? Not political orientation. Not whether a court has ruled on it. Not whether it is popular or controversial. The benchmark suite includes specific tests for politically contested topics to detect and correct for ideological filtering. All rejections are logged publicly with the structural reasoning used — the community can see why any proposal was flagged.

**AI self-correction:** The ensemble monitors its own rejection patterns for signs of systematic bias (e.g., consistently flagging one category of rights challenge while approving structurally similar ones). Detected bias patterns are flagged for community review and feed into the model benchmark suite and upgrade evaluation.

### What Cannot Be Voted Away

Even a 100% community vote cannot:
- Change or narrow the mission principle
- Remove the mission filter from the proposal process
- Approve a campaign that all three ensemble models reject without a 75% supermajority
- Redirect the platform to purposes unrelated to institutional power vs. individual rights

These constraints are encoded in the TEE and enforced by the execution layer — they are not policy, they are architecture.

---

## What Governance Cannot Do

Even with community consensus, certain actions are permanently off-limits:

- ❌ Extracting wallet private keys from the TEE
- ❌ Retroactively reversing completed disbursements
- ❌ Clearing a confirmed misconduct record
- ❌ Identifying donors (Monero privacy is immutable)
- ❌ Granting any individual special access above others
- ❌ Downgrading the AI ensemble to a model with a lower benchmark score than the current one
- ❌ Overriding a failed shadow probation to force a model upgrade
- ❌ Changing the benchmark suite without a governance-tier vote (75% supermajority + 14-day time-lock)

The first five are enforced by TEE code. The last three are enforced by the upgrade pipeline logic — they cannot be bypassed by community vote.

---

## Open Questions (To Be Resolved Pre-Launch)

1. **Voting quorum:** Proposed: 10 unique voters for minor, 25 for major, 50 for governance — needs community ratification
2. **TEE provider selection:** Phala vs Marlin vs other — requires technical evaluation
3. **GitHub repo governance:** Who controls the repo until Phase 2? (Proposed: founder, with community fork right guaranteed from day 1)
4. **Operations wallet surplus policy:** When does the ops reserve trigger a community vote for redistribution?
5. **Ensemble size:** 2 or 3 models at launch? (3 preferred for tie-breaking, 2 acceptable for Phase 2 if one TEE slot is constrained)
6. **Initial benchmark suite:** Must be drafted, published, and community-ratified before any upgrade vote is held
7. **Bootstrapping quorum:** What's the threshold for declaring quorum is "reachable" and ending the founder non-voting period?

---

## Related Documents

- `ARCHITECTURE.md` - Full technical architecture
- `src/data/campaigns.js` - Campaign data and rules
- `src/components/TrustFAQ.jsx` - Public-facing FAQ
