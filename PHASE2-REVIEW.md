# Citeback — Phase 2 Pre-Build Review
> Adversarial analysis of governance and architecture  
> Written: 2026-04-29 | Status: Pre-engineering review

This document attacks the design. Every issue below is a real failure mode that needs to be addressed before real funds are accepted. Issues are rated **Critical / High / Medium / Low**.

---

## 1. Gridlock Scenarios — Ways Funds Get Stuck

### 1.1 TEE crash mid-disbursement ⚠️ HIGH
The Wallet Agent could crash after sending an XMR transaction but before logging it. On restart, the agent doesn't know whether to retry (double-spend) or skip (funds lost to the void).

**Fix:** Write-ahead logging. Log the intent to disburse before sending. On restart, check pending intents and resolve them deterministically. Monero transactions are atomic — a failed TX is safe to retry; a completed TX has an on-chain ID that prevents double-spend.

---

### 1.2 Redirect chain with no valid target ⚠️ HIGH
Redirect logic sends unfunded campaign funds to "highest-priority active campaign in same category." What if ALL campaigns in the category have also expired or been funded? The funds have no defined destination.

**Fix:** Redirect chain: same category → any active campaign → ops wallet (final fallback). The ops wallet is always active. Funds cannot be stranded.

---

### 1.3 Redirect chain loop 🔴 CRITICAL
Campaign A redirects to Campaign B. Campaign B redirects to Campaign A. Funds loop forever.

**Fix:** Redirect target must have a later deadline than the source. If no valid target exists, escalate up the chain. No circular redirects possible if targets must be strictly forward in time.

---

### 1.4 Extension vote in progress when deadline hits ⚠️ HIGH
A campaign deadline passes while an extension vote is still counting. Does the redirect trigger or does the pending vote pause it? Currently undefined — race condition.

**Fix:** Pending extension votes freeze the redirect. Campaign cannot redirect while an active extension vote is open. The vote resolves first; redirect only triggers if the vote fails.

---

### 1.5 Voting quorum never reached for urgent fix ⚠️ HIGH
A critical bug is discovered. The governance vote to patch it never reaches quorum because the platform is small. The bug stays live indefinitely.

**Fix:** Define absolute minimum voter counts (not just % thresholds): 10 voters for minor, 25 for major, 50 for governance. For critical security issues: define an emergency patch pathway (see Bootstrap section).

---

### 1.6 XMR price crash kills ops wallet 📋 MEDIUM
The 1% fee is in XMR. If XMR crashes 90%, the ops wallet may not cover VPS/TEE costs. Platform goes offline with live campaigns collecting donations.

**Fix:** Ops wallet maintains a USD-equivalent reserve target (minimum 3 months of infrastructure costs). Auto-alert to community if reserve drops below 1 month. Operating costs must be estimated and published in ARCHITECTURE.md.

---

### 1.7 TEE attestation expiry 📋 MEDIUM
Intel SGX attestation quotes have expiration windows (typically 30 days). If renewal fails, the enclave loses verifiable status. Community has no way to confirm what's running.

**Fix:** Automated attestation renewal process. Alert system for approaching expiry. Failure to renew triggers a community notification and emergency review.

---

### 1.8 Monero node offline ℹ️ LOW
If the Monero full node the Wallet Agent connects to goes offline, no transactions can be sent or received. All campaigns paused.

**Fix:** Connect to 2 independent Monero nodes. Automatic failover. Optionally connect to trusted public fallback nodes if both fail.

---

## 2. Logic Gaps — Rules With Undefined or Contradictory Behavior

### 2.1 Campaign state machine undefined 🔴 CRITICAL
The governance doc describes who votes and how disbursements work, but there is no defined state machine for how campaigns transition between states. What triggers the move from `prelaunch` to `active`? What exactly sets `status: 'funded'`? Who/what flips these states and when?

**Fix:** Define explicit states and transitions:
```
prelaunch → proposal_submitted → voting → approved → wallet_created → active → [funded | expired] → [disbursed | redirected]
```
Each transition has exactly one trigger. No state can be skipped. No undefined transitions.

---

### 2.2 Proof validation is trivially bypassed 🔴 CRITICAL
GOVERNANCE.md says "Wallet Agent verifies: proof document present, campaign ID matches, amount ≤ goal." Checking that a document is *present* is meaningless — anyone can submit a blank PDF. The architecture has no spec for what constitutes valid proof per campaign type.

**Fix:** Define proof requirements per campaign type:
- **FOIA:** Agency response letter with letterhead, date, and case number. AI verifies agency name matches the campaign target.
- **Billboard:** GPS-tagged photo with billboard visible and verifiable location coordinates. Timestamp within campaign window.
- **Legal:** Court filing number verifiable against public dockets. Case number + jurisdiction must match campaign.
- **Verification bounty:** C2PA-authenticated photo OR 3-of-3 Human Registry consensus.

The AI doesn't just check presence — it validates structure.

---

### 2.3 Challenge timing race condition ⚠️ HIGH
A challenge filed at hour 47:59 of a 48-hour window could create a race: the challenge window closes while the vote is still counting.

**Fix:** Filing a challenge instantly freezes the disbursement timer. The 48-hour window pauses. Disbursement cannot proceed until the challenge vote resolves, regardless of how late in the window it was filed.

---

### 2.4 "Default is release" dangerous at low participation ⚠️ HIGH
GOVERNANCE.md states disbursement challenges require "60% majority to block (default is release)." At platform launch with near-zero participation, zero votes means funds are automatically released. A scammer files a fake proof, nobody challenges it in time, funds released.

**Fix:** Default behavior must be conservative: zero votes = disbursement held (not released). Release requires a minimum positive signal (at least N votes in favor of release, or challenge window passes with zero challenges AND minimum community review participation). Better to hold funds temporarily than release them to a fraudster.

---

### 2.5 "Established operator" undefined at launch ⚠️ HIGH
Emergency pause requires "3 independent cosigners from established operators (reputation > 50)." At launch, nobody has reputation > 50. This mechanism is unusable for months.

**Fix:** Emergency pause threshold scales with platform maturity:
- Phase 2 launch (0–10 operators): founder + 2 community members with any reputation
- 6 months post-launch: standard threshold applies
- Transitions automatically at defined milestones

---

### 2.6 Ops wallet surplus formula undefined 📋 MEDIUM
"Any surplus beyond 6 months of operating costs" — but operating costs are not defined anywhere in the documents. The formula is unmeasurable.

**Fix:** Operating costs must be defined at deployment (VPS + TEE + Monero node in USD), updated only by governance vote, and stored in the public action log. The 6-month target recalculates automatically when costs change.

---

### 2.7 Misconduct system only covers operators 📋 MEDIUM
Misconduct reports are described only for operators. A community member gaming votes with coordinated wallets but never running a campaign has no defined accountability path.

**Fix:** Misconduct can be filed against any participant identity (XMR address or Nostr key), not just operators. The same voting and consequence model applies.

---

## 3. Attack Vectors

### 3.1 AI-generated fake proofs ⚠️ HIGH
An operator uses AI to generate convincing fake FOIA response letters, fake court filing numbers, or AI-composited billboard photos. The 48-hour challenge window may not be enough for community members to detect sophisticated fakes.

**Fix:** For campaigns above $1,000: require a minimum verification count (e.g., 3 community members independently confirm proof validity) before disbursement releases, in addition to the challenge window. Verification earns a small reputation bonus — creates economic incentive to check.

---

### 3.2 Reputation grinding → large fraud ⚠️ HIGH
Operator runs 10 legitimate small campaigns ($500 each), builds reputation to 100+, then runs a $50,000 fraudulent campaign. The reputation system rewards past behavior but doesn't prevent a single large exit.

**Fix:** Reputation tier escalation requires N *completed* campaigns at each tier, not just a score:
- $500 cap: default
- $2,000 cap: requires 3 completed campaigns
- $10,000 cap: requires 5 completed campaigns at previous tier
- Unlimited: requires 10 completed campaigns at $10k tier + no upheld challenges

Score alone isn't enough — demonstrated track record at each scale required.

---

### 3.3 Holiday weekend governance attack ⚠️ HIGH
Attacker with enough voting weight submits a governance change proposal on Christmas Eve, counting on minimal community engagement during the vote window to slip it through.

**Fix:** Governance votes require a minimum absolute voter participation count (not just % majority). If turnout is below the quorum floor, the vote fails regardless of the result. Community cannot be ambushed with a low-turnout vote.

---

### 3.4 Proof document substitution 📋 MEDIUM
Operator submits a valid proof document. It gets verified as present. They then delete or replace the document at the URL after the challenge window closes but before disbursement logs the hash.

**Fix:** Proof document is hashed at submission time. Hash stored on-chain (in the TEE and action log). Disbursement verifies the hash still matches before sending funds. Post-submission tampering is immediately detectable.

---

### 3.5 Benchmark suite swap before model downgrade ⚠️ HIGH
An attacker wants to install a weaker AI model. They first propose a governance change to "update" the benchmark suite to one the weaker model passes. Benchmark change clears governance vote. Then the weaker model passes the new benchmark.

**Fix:** Benchmark suite changes and AI model upgrade proposals cannot be in the same voting cycle. Mandatory 90-day separation between any benchmark change and any subsequent model upgrade vote.

---

### 3.6 Netlify/DNS account hijack 📋 MEDIUM
Access to citeback@proton.me gives access to Namecheap and Netlify. A compromised email = compromised site = fake donation page.

**Fix:** Hardware 2FA (YubiKey or equivalent) on ProtonMail, Namecheap, and Netlify. citeback@proton.me is a high-value target — treat it accordingly.

---

### 3.7 TEE provider hostile takeover 📋 MEDIUM
Phala or Marlin is acquired, compromised, or served a national security letter. TEE attestation could be forged. Funds at risk.

**Fix:** For Phase 3: multi-TEE attestation (2-of-3 providers must attest). For Phase 2: document this risk explicitly, monitor provider health, maintain emergency migration plan with a pre-tested alternative TEE provider. Regularly audit attestation independently.

---

## 4. Infrastructure Failure Modes

### 4.1 Single VPS = single point of failure ⚠️ HIGH
One VPS, one TEE instance. Provider outage = platform offline. Campaign deadlines could pass during an outage, triggering redirects on stale state.

**Fix:** Platform clock pauses when TEE is offline. Campaign deadlines do not advance during confirmed downtime. Multi-region redundancy is Phase 3. Phase 2 must document the expected downtime risk so donors understand.

---

### 4.2 TEE provider shuts down ⚠️ HIGH
If Phala or Marlin shuts down, the enclave goes offline permanently. Funds are inside a dead TEE.

**Fix:** TEE migration path defined in governance before launch. Community can vote to migrate to a new provider. During migration: freeze on new disbursements, existing funds safe until migration completes. Pre-test migration process before going live.

---

### 4.3 GitHub bans the account 📋 MEDIUM
If GitHub suspends or bans the citeback org (e.g., coordinated abuse reports from a surveillance company), governance and deployments halt.

**Fix:** Mirror repo on Codeberg or Gitea as hot backup. Document that governance actions can be manually executed from the mirror if GitHub is unavailable.

---

### 4.4 Netlify account suspended 📋 MEDIUM
Flock Safety or a similar adversary files repeated abuse reports, gets the Netlify account suspended.

**Fix:** Self-hosted fallback deployment ready on the VPS (same repo). DNS can be pointed away from Netlify within minutes. Test this failover before launch.

---

## 5. Funding & Sustainability Gaps

### 5.1 Ops wallet starts at zero 🔴 CRITICAL
The platform launches with no donations, so no 1% fees, so no ops wallet balance. Someone must pay for VPS and TEE costs from day one with no defined mechanism.

**Fix:** Founder funds initial infrastructure costs transparently. Define the amount (estimated 6-month runway, see 5.2). Post as a public "bootstrap fund" entry in the action log. Ops wallet repays founder once fees accumulate. This is documented, not secret.

---

### 5.2 Operating costs never estimated ⚠️ HIGH
No cost estimate exists anywhere in the docs. "6 months of operating costs" is an unmeasurable target.

**Fix (estimated costs to publish in ARCHITECTURE.md):**
- TEE (Phala/Marlin): ~$50–200/month
- VPS (backup + monitoring): ~$20–50/month
- Monero full node: ~$20–40/month
- **Total estimated: $90–290/month**
- **6-month bootstrap fund: ~$550–1,750**

Publish these estimates. Update with actuals at launch.

---

### 5.3 Fee model breakeven is ambitious 📋 MEDIUM
At $750 average campaign and 1% fee → $7.50 per funded campaign. To cover $200/month requires ~27 funded campaigns per month. A new platform will not achieve this for months or years.

**Fix:** Accept the loss. Founder fronts 12 months of costs. If fee income doesn't cover costs after 12 months, community votes on fee adjustment (increase to 2–3%) or external funding model. Plan for this — don't be surprised by it.

---

## 6. Bootstrap Failures

### 6.1 First operator is a scammer ⚠️ HIGH
With no track record and a $500 cap, a scammer runs a fake FOIA campaign, submits a convincing fake proof, and walks away with $500. The challenge window requires community engagement that doesn't exist yet.

**Fix:** First 5 campaigns require founder manual proof review (documented bootstrap concession, publicly logged). After 5 successful campaigns, normal process takes over. This is a transparent, time-limited trust bridge — not a permanent founder privilege.

---

### 6.2 No one verifies challenges at launch 🔴 CRITICAL
Challenge window defaults to "release" if no vote. At launch with zero community engagement, every disbursement automatically releases — including fraudulent ones.

**Fix (combined with 2.4):** Change default behavior. Zero votes = hold. Require minimum positive participation for release. During bootstrap, founder counts as a valid cosigner for release votes until community reaches critical mass.

---

## 7. AI Ensemble Failure Modes

### 7.1 All models share training blind spots ⚠️ HIGH
If all ensemble models are commercial closed-source (Claude, GPT, etc.), they share correlated training data and may have identical blind spots. A sophisticated attack targeting shared weaknesses fools all models simultaneously.

**Fix:** Require at least one open-source model (Llama 3, Mistral, etc.) in the ensemble. Different training pipelines = different blind spots. Diversity requirement encoded in governance.

---

### 7.2 Consensus calibration failure 📋 MEDIUM
If models are too architecturally different, they may reach consensus on nothing. The monitoring layer produces no actionable signals.

**Fix:** 30-day post-launch calibration period. Monitor consensus rates. If consensus below 20% over 30 days, mandatory architecture review triggered.

---

### 7.3 New model vs old model during probation attack 📋 MEDIUM
An attack occurs during a 30-day shadow probation. New model detects it; old model doesn't (or vice versa). Which signals take precedence?

**Fix:** During probation, old model signals govern all actions. New model signals are logged as advisory only. The old model remains authoritative until probation passes.

---

## 8. Donor Experience Gaps

### 8.1 No way to verify donation was received 📋 MEDIUM
Donors send XMR but can't verify their specific transaction arrived without a transaction key. If something goes wrong, they have no receipts.

**Fix:** Site generates a payment ID for each donation attempt. Include instructions for verifying with Monero transaction key. Add to campaign donation modal.

---

### 8.2 Redirect happens silently 📋 MEDIUM
When a campaign deadline passes and funds redirect, donors won't know unless they actively check the action log.

**Fix:** Campaign page displays redirect status prominently when triggered. "This campaign expired — your donation was redirected to [Campaign Name] on [Date]." Visible without digging through logs.

---

## Summary: What Must Be Fixed Before Phase 2 Launch

**Critical (must fix before accepting real funds):**
- [ ] Define the campaign state machine explicitly
- [ ] Define proof validation requirements per campaign type
- [ ] Change "default is release" to "default is hold"
- [ ] Define redirect chain fallback (ops wallet as final destination)
- [ ] Prevent redirect chain loops
- [ ] Fund the ops wallet bootstrap transparently

**High (fix before going live):**
- [ ] Write-ahead logging for disbursements
- [ ] Founder manual review for first 5 campaigns
- [ ] Extension vote pauses redirect
- [ ] Emergency pause usable at launch (scaled threshold)
- [ ] Proof document hashing at submission
- [ ] Ops wallet cost estimate published
- [ ] Absolute quorum counts defined
- [ ] Benchmark suite / model upgrade separation rule
- [ ] Hardware 2FA on all accounts
- [ ] TEE migration plan documented + tested

**Medium (address in Phase 3 or with governance vote):**
- [ ] Multi-TEE attestation
- [ ] GitHub/Netlify fallbacks
- [ ] Consensus calibration monitoring
- [ ] Donation verification UX
- [ ] Redirect visibility on campaign pages

---

## Also: Rename ARCHITECTURE.md Header
The file still says "Fourthright — System Architecture" at the top. Should be "Citeback."

---

*This document represents the adversarial pass on the design as of 2026-04-29. Issues should be addressed before any real funds touch the platform.*
