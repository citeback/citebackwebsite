# Citeback Frontend Fee Model Audit
**Date:** 2026-05-06  
**Scope:** Full read-only audit of fee references across React frontend  
**Status:** 5 files contain fee references requiring changes if zero-fee model is adopted

---

## Part 1: Fee Reference Audit

All files with rendered fee references, exact text, and what needs to change.

---

### 🔴 `src/components/TrustFAQ.jsx`

**Instance 1 — "Where does the platform fee go?" Q&A**
- **Section:** Wallets & Funds
- **Approx. line:** ~105–117
- **Current question:** `Where does the platform fee go?`
- **Current answer (full):**
  > A graduated platform fee on every donation goes to the operations wallet — also inside the TEE, also publicly verifiable via view key. Fees scale with 90-day rolling operator volume: 5% (up to $10k), 4.5% ($10,001–$25k), 4% ($25,001–$50k), 3% (above $50k). See GOVERNANCE.md §7.3 for the full schedule.
  >
  > This covers: VPS and TEE infrastructure costs, Monero and Zano node operation, and a reserve buffer.
  >
  > The operations wallet balance is public. Any surplus beyond 6 months of operating costs is put to a community vote for redistribution (additional campaigns, reserve increase, etc.). The founder cannot touch it.

- **What should change:** Remove this Q&A entirely OR replace with a new entry:
  - Q: `How does Citeback sustain itself?`
  - A: Explain zero-fee model + voluntary tipping. The operations wallet description and TEE-secured public view key info is still accurate and worth keeping in a revised answer.

---

**Instance 2 — "fee model" reference in open source answer**
- **Section:** Code & Verification → "Is Citeback open source?"
- **Approx. line:** ~350
- **Current text (in answer bullet list):**
  > `• The wallet agent (disbursement logic, fee model, extension rules)`
- **What should change:** Replace `fee model` with `tip handling` or `voluntary contribution logic` to reflect the new model. The bullet is otherwise still accurate.

---

### 🔴 `src/components/Transparency.jsx`

**Instance 1 — "Graduated Platform Fee" principle card**
- **Approx. line:** ~17–18 (in the `principles` array)
- **Current title:** `Graduated Platform Fee`
- **Current body:**
  > A platform fee funds operations — infrastructure, Monero and Zano nodes. Fees are graduated by operator volume: 5% (up to $10k), 4.5% ($10,001–$25k), 4% ($25,001–$50k), 3% (above $50k). See GOVERNANCE.md §7.3 for the full schedule. Ops wallets are TEE-secured with public view keys. Any surplus goes to a community vote.

- **What should change:** Completely replace this principle card.
  - New title: `Zero Platform Fee` (or `Voluntary Support`)
  - New body: Explain that the platform takes nothing from campaign donations. 100% of donated funds go directly to campaign vendors. Platform infrastructure is sustained by voluntary tips, publicly visible via view key in the operations wallet.
  - The TEE-secured + view key + surplus-to-community-vote details are still worth keeping.

---

### 🔴 `src/components/TermsPage.jsx`

**Instance 1 — Section 4 "Donation Terms" fee bullet**
- **Approx. line:** ~85
- **Current text (bullet within body string):**
  > `• A platform fee (graduated 3–5% of donation amount, per GOVERNANCE.md §7.3) is deducted from each donation and directed to the operations wallet, which is also publicly auditable via view key.`

- **What should change:** Remove this bullet. Replace with either:
  - A statement that no platform fee is deducted — 100% of donations go to campaign execution, or
  - A description of the voluntary tip mechanism (if tips will be a separate opt-in at donation time, that warrants a Terms disclosure too).
  - Keep the cross-reference to GOVERNANCE.md wherever the new sustainability model is documented.

---

### 🔴 `src/data/campaigns.js`

**Instance 1 — `platformFeePercent` value and comment block**
- **Approx. lines:** 4–13 (the `platformRules` export object)
- **Current text:**
  ```javascript
  export const platformRules = {
    // IMPORTANT: platformFeePercent below is a pre-launch placeholder.
    // The published graduated fee schedule (Governance §7.3 / Transparency page) governs:
    //   5% on rolling volume $0–$10k | 4.5% $10k–$25k | 4% $25k–$50k | 3% above $50k
    // Update this value to 5 (and switch to graduated logic) before wallets go live.
    platformFeePercent: 5,          // 5% base rate — see graduated schedule in GOVERNANCE.md §7.3
    ...
  }
  ```
- **What should change:**
  - Set `platformFeePercent: 0`
  - Replace comment block to reflect zero-fee model and note that a voluntary tip mechanism replaces it
  - Add a new `voluntaryTipEnabled: true` (or similar) constant so the TEE wallet agent can handle tip logic separately
  - Example replacement comment:
    ```javascript
    // ZERO platform fee model — the platform takes nothing from campaign donations.
    // Funds are pure pass-through: 100% goes to campaign vendors.
    // Platform infrastructure is sustained by optional voluntary tips (separate from campaign donations).
    platformFeePercent: 0,
    ```

---

### 🔴 `src/components/Governance.jsx`

**Instance 1 — Disbursement section fee schedule table**
- **Section:** Disbursement (accordion id="disbursement")
- **Approx. lines:** Inside the `<Section id="disbursement" ...>` block
- **Current text (rendered):**
  > **Platform fee (graduated):**
  > 
  > | Volume | Fee |
  > |---|---|
  > | $0 – $10k | 5.0% |
  > | $10,001 – $25k | 4.5% |
  > | $25,001 – $50k | 4.0% |
  > | Above $50k | 3.0% |

- **What should change:** Remove the fee table entirely. Replace with a brief statement explaining the voluntary tip model — something like:
  > **Platform sustainability:** No fee is deducted from campaign donations. The platform accepts voluntary tips through a separate mechanism. The operations wallet is TEE-secured with a public view key.

---

## Part 2: New UI Needed for Voluntary Tip Model

If the platform moves to voluntary tips, the following UI additions/changes are recommended:

### Tip Jar UI — Where and How

**Location:** CampaignModal.jsx — in the active donation flow (the section where wallet address/QR is displayed)

**Placement:** After the wallet address copy section, above the "New to Monero?" helper box.

**What it should look like:** For a privacy platform, keep it minimal and non-gamified. Avoid anything that looks like a dark pattern or social pressure.

Suggested approach:
- A collapsible/optional secondary section: "Support the platform (optional)"
- Shows a *separate* operations wallet address (not the campaign wallet)
- Clear labeling: "This is separate from your campaign donation. 100% of campaign funds go to the campaign."
- Simple toggle, defaulting to collapsed — tip must be opt-in, never opt-out

**Tone:** Plain, matter-of-fact. Not "Keep the lights on 💡" — more like: "Citeback operates at zero platform fee. If you want to support the infrastructure, here's the ops wallet."

---

### Zero-Fee Model Explanation — Trust Communication

The zero-fee model is actually harder to explain than a fee — it sounds suspicious to a privacy activist ("if you're not charging, what's your business model?"). The UI needs to proactively answer this.

**Recommended locations:**
1. **TrustFAQ.jsx** — New Q&A (see Part 1, Instance 1 replacement)
2. **Transparency.jsx** — Replace the "Graduated Platform Fee" card with a clear explanation
3. **Hero.jsx** — Optional: one line in the stats sidebar (e.g., add a stat: `0%` / `Platform fee on campaigns`)

---

### LaunchTracker.jsx — New Checklist Item?

**Assessment:** The current 10 launch prerequisites don't include fee-model documentation. With a zero-fee model, there's less legal/financial risk than a fee model, so no new prerequisite is strictly needed.

However, if tips are implemented, you may want to add:
> `Voluntary tip mechanism documented and TEE-encoded`

This would appear as milestone #11 and push the tracker to `4/11 complete`. Judgment call — only add it if the tip implementation is a true launch prerequisite.

---

### TrustFAQ.jsx — New Q&A

**Recommended addition** in the "Wallets & Funds" section, replacing the old fee Q&A:

> **Q: How does Citeback sustain itself?**
>
> A: The platform takes nothing from campaign donations. Zero. Every dollar donated to a campaign goes to the campaign vendor — no platform cut.
>
> Infrastructure (servers, TEE nodes, Monero and Zano node operation) is funded by voluntary tips: a separate operations wallet accepts optional contributions from anyone who wants to support the platform. The operations wallet is TEE-secured and publicly auditable via view key — the same transparency standard as campaign wallets. Any surplus beyond 6 months of operating costs goes to a community vote.
>
> You're not the product. You're not paying a vig. If this platform is worth keeping alive, people who believe in it will tip it. If not, it shouldn't survive.

---

## Part 3: Components That Are Clean

The following components contain **no platform fee references** and require **no changes** under the new model:

| Component | Status | Notes |
|---|---|---|
| `CampaignCard.jsx` | ✅ Clean | Displays raised/goal amounts only, no fee math |
| `CampaignList.jsx` | ✅ Clean | Filter/sort UI only, no fee references |
| `CampaignModal.jsx` | ✅ Clean | Wallet addresses, progress, win conditions — no fee deduction shown |
| `Footer.jsx` | ✅ Clean | Nav links, legal disclaimer (non-deductibility only), data attribution |
| `HowItWorks.jsx` | ✅ Clean | Step-by-step flow for donors/operators — no fee mentioned |
| `Hero.jsx` | ✅ Clean | Stats, headline, CTAs — no fee references |
| `LaunchTracker.jsx` | ✅ Clean | Prerequisites checklist — no fee model items |
| `Operators.jsx` | ✅ Clean | Discusses disbursement flow but no platform fee % |

---

## Part 4: Priority Order

### Must Change Before Next Deploy (if zero-fee decision is made)

These are user-facing, rendered claims that directly contradict the new model:

1. **Transparency.jsx** — "Graduated Platform Fee" principle card  
   *Highest visibility: this is a prominent principle card seen by every user on the Transparency tab*

2. **TermsPage.jsx** — Section 4 fee bullet  
   *Legal document — outdated fee terms create misleading contractual claims*

3. **TrustFAQ.jsx** — "Where does the platform fee go?" Q&A  
   *High-trust location — FAQ users are specifically researching fee behavior*

4. **campaigns.js** — `platformFeePercent: 5` and comment block  
   *TEE wallet agent reads this. Even in pre-launch, this is the source of truth for the disbursement rules engine. Set to 0 immediately.*

### Can Wait Until Phase 2 Prep (low urgency, no live wallet impact)

5. **TrustFAQ.jsx** — "fee model" mention in open source code answer  
   *Minor: buried in a detailed technical answer, not a primary user concern*

6. **Governance.jsx** — Fee schedule table in Disbursement section  
   *Governance spec tab is detailed/technical; lower traffic than main FAQ/Transparency*

7. **TrustFAQ.jsx / Hero.jsx** — New UI additions (tip jar explanation, zero-fee stat)  
   *Additive, not corrections — can be staged with new model rollout*

---

## Part 5: One-Sentence User-Facing Explanation

**"How does Citeback sustain itself?"**

> Every dollar you donate goes to the campaign — the platform takes nothing, runs on optional tips, and publishes every cent of its operating wallet for anyone to verify.

---

*Audit complete. All findings are read-only observations. No files were modified.*
