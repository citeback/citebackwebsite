# Citeback Financial Stress Test
> Written: 2026-05-06  
> Analyst: Subagent (financial modeling pass)  
> Purpose: Honest stress test of the proposed zero-fee / voluntary-tip funding model  
> Sources: GOVERNANCE.md, LAUNCH_PLAN.md, LAUNCH_TIMELINE.md, campaigns.js

---

## ⚠️ Pre-Analysis Flag: Model Contradicts Existing Governance

Before the stress test begins: the proposed "zero-fee, tips-only" model directly contradicts **GOVERNANCE.md §7.3**, which specifies a graduated fee schedule of 3–5%. Changing this isn't just a business decision — it requires a **Governance-tier vote** (75% supermajority, 14-day time-lock) under §6.2, because fee schedules are classified as Governance-tier parameters.

This document stress-tests the *proposed* zero-fee model as requested. It also notes where the current 3–5% model differs in outcome.

---

## 1. Baseline Burn Rate

### Current Scale (Pre-TEE / Site Only)

| Cost | Monthly | Annual |
|------|---------|--------|
| Hetzner VPS | $30.59 | $367 |
| Netlify (free tier) | $0 | $0 |
| Domain registrations (citeback.com + fourthright.com est.) | ~$4.17 | ~$50 |
| Misc dev tooling (GitHub, password manager, etc.) | ~$10–20 | ~$120–240 |
| **Subtotal — current** | **~$45–55/mo** | **~$540–660/yr** |

This is the floor. The platform can run as a static site for roughly **$50/month**.

### Post-TEE Launch (Operational Scale)

| Cost | Monthly | Annual |
|------|---------|--------|
| Hetzner VPS | $30.59 | $367 |
| TEE infrastructure — 3 nodes (Phala/Marlin, low estimate) | $600 | $7,200 |
| TEE infrastructure — 3 nodes (high estimate) | $1,500 | $18,000 |
| Domain registrations | $4.17 | $50 |
| OFAC screening API (e.g. Dow Jones Watchlist) | $50–200 | $600–2,400 |
| KYC/identity verification service (e.g. Persona, Stripe Identity) | $0–100 | $0–1,200 |
| Monitoring + alerting (Datadog, PagerDuty, etc.) | $20–50 | $240–600 |
| Backup / object storage | $5–20 | $60–240 |
| Misc dev tooling | $15–25 | $180–300 |
| **Subtotal — post-TEE (low)** | **~$725/mo** | **~$8,700/yr** |
| **Subtotal — post-TEE (high)** | **~$1,930/mo** | **~$23,160/yr** |

### 10x Traffic Scenario

Traffic increases don't significantly affect costs in this architecture. The platform is:
- Static frontend on Netlify (scales free)
- TEE nodes handling wallet ops (scale with campaigns, not page views)
- VPS handling API proxy if T-10 is implemented

**10x traffic cost increase: +$20–80/mo** (VPS upgrade to handle more concurrent API proxy calls). TEE costs unchanged unless campaign volume also scales 10x.

### 100x Traffic Scenario

| New or Increased Cost | Monthly Delta |
|-----------------------|---------------|
| VPS upgrade (load-balanced, 2-3 instances) | +$60–150 |
| CDN for static assets | +$20–50 |
| Database (if any dynamic state added) | +$50–150 |
| TEE costs (if campaign volume 10x'd, not just traffic) | +$500–1,000 |
| **Total 100x traffic delta** | **+$130–350/mo** |

**100x traffic, baseline TEE: ~$855–2,280/mo**

Pure traffic spikes are cheap. Campaign volume growth is the cost driver.

---

## 2. Tip Breakeven Analysis

### Target Monthly Operating Costs

| Scenario | Monthly Burn |
|----------|-------------|
| Pre-TEE (site only) | $50 |
| Post-TEE (low infra) | $725 |
| Post-TEE (high infra + OFAC + misc) | $1,930 |

### Tip Scenarios to Break Even

**Pre-TEE breakeven ($50/mo target):**

| Avg tip amount | Tips needed/mo |
|----------------|----------------|
| $1 | 50 |
| $5 | 10 |
| $20 | 3 |

**Post-TEE (low) breakeven ($725/mo target):**

| Avg tip amount | Tips needed/mo |
|----------------|----------------|
| $1 | 725 |
| $5 | 145 |
| $20 | 37 |
| $50 | 15 |

**Post-TEE (high) breakeven ($1,930/mo target):**

| Avg tip amount | Tips needed/mo |
|----------------|----------------|
| $5 | 386 |
| $20 | 97 |
| $50 | 39 |

### Monthly Active Users Required for Breakeven

Tipping rates on platforms with voluntary tips run roughly **1–5% of active users**. For a privacy-focused platform with anonymous users, expect the **low end** (1–2%), because:
- Users actively avoid leaving a financial trail
- XMR tips require deliberate on-chain action, not a one-click UI
- Privacy advocates are culturally suspicious of platform loyalty mechanics

| Target breakeven | Tip rate assumption | MAUs required |
|------------------|---------------------|---------------|
| $50/mo (pre-TEE) | 1% @ $5/tip | 1,000 MAUs |
| $725/mo (post-TEE low) | 1% @ $5/tip | 14,500 MAUs |
| $1,930/mo (post-TEE high) | 1% @ $5/tip | 38,600 MAUs |
| $725/mo (post-TEE low) | 2% @ $20/tip | 1,813 MAUs |

**Honest read:** Getting to 1,800+ motivated MAUs who tip $20/month each in Monero is a non-trivial community-building problem. It's achievable, but not quickly, and not passively. The pre-TEE situation ($50/mo) is trivially fundable by tips, but that's also the phase where there's nothing for users to tip *about*.

---

## 3. Zero-Fee Sustainability

### The Historical Record

Platforms operating at 0% fees either:

**a) Survived because of massive scale or mission alignment:**
- **GoFundMe (US, since 2017):** 0% platform fee but earns from optional tips (~$100M+ annually) and payment processing. Works because of 50M+ users and billions raised annually. Not comparable.
- **Wikipedia / Wikimedia:** 0% for users, funded by annual fundraising. ~$150M annual revenue from donations. Works because it's a cultural institution with unmatched name recognition.
- **Signal:** 0% for users, funded by grants (Brian Acton donated $50M) and donations. Realistic parallel — but Signal had an $50M anchor donation most platforms don't get.
- **Liberapay:** 0% crowdfunding platform, runs on its own donations. Functional but tiny, volunteer-run, limited features, perpetually near-collapse.

**b) Failed or pivoted:**
- **Flattr:** tip-based model largely failed; never generated sustainable revenue
- **Gratipay:** 0% fee, tip-based — shut down 2017 after never reaching breakeven
- **Snowdrift.coop:** cooperative model, still operating but micro-scale
- **Bountysource:** multiple ownership changes, operational struggles

**The 0% graveyard is well-populated.** The survivors are either massive-scale consumer platforms or mission-driven nonprofits with institutional donor support.

**Citeback's comparable peer:** Signal, Tor Project, EFF. Not GoFundMe. The path for a 0%-fee privacy infrastructure project is **grants + institutional support**, not organic tips from anonymous users.

### Is There a Long-Term Zero-Fee Path?

Yes, but it requires a deliberate structure:
1. **Become a 501(c)(3) or fiscal sponsor relationship** — unlocks tax-deductible donations, which 10x the realistic tip/donation pool
2. **Anchor grant funding** — OTF, Knight, Mozilla, Open Society (see §7 for realistic analysis)
3. **Build the community before asking for tips** — tips only work when there's demonstrated value

**Realistic alternatives if tips don't materialize:** Reactivate the 3–5% fee schedule that's already in GOVERNANCE.md. This is not an ideological failure — it's the sustainable path, and it's already ratified.

---

## 4. Campaign Failure Modes

### Scenario A: Campaign raises $0

**Example:** Campaign #2 (Taos Billboard, $750 goal) gets no donors.

- **Platform financial exposure:** $0. No funds received, no fees collected, no liabilities triggered.
- **Operator exposure:** No stake required below $5k goal (§3.6). Operator loses time, not money.
- **Donor exposure:** $0. Nothing donated.
- **Pass-through model:** Clean. Platform is pure relay, no money ever moved.
- **Reputational cost:** Campaigns sitting at $0 with past deadlines erode platform credibility. LAUNCH_PLAN.md correctly worries about this.
- **The uncomfortable truth:** The current campaigns are realistic but modest. $750–$1,200 goals are achievable, but without a donor community already assembled, $0 raised on day one is the most likely scenario for the first 30 days.

### Scenario B: Campaign raises $5k, attorney quotes $8k

**Example:** Campaign #4 (NM ALPR Privacy Bill) hits its $5k milestone but not $8k.

- **Platform financial exposure:** $0. Platform passed $5k through, earned nothing under zero-fee model.
- **Operator exposure:** Partially funded campaign creates a deliverable gap. The $5k milestone (expert witnesses) can technically proceed, but the $8k package (full advocacy) cannot.
- **TEE behavior:** TEE releases $5k when milestone conditions are met per governance. It cannot unrelease.
- **The refund problem:** This is where anonymous Monero donations create a structural trap. If donors want refunds because the goal wasn't fully met, there's **no mechanism to return funds to anonymous senders**. Monero transactions are one-way and pseudonymous. Donors must come forward to claim refunds, destroying anonymity.
- **Who bears the loss:** The cause. The advocacy campaign proceeds at reduced scope or doesn't proceed. Donors get partial value, no refund path.
- **Platform liability:** Unclear. ToS governs. The pass-through model limits but doesn't eliminate liability exposure if donors sue claiming misrepresentation.

### Scenario C: Campaign raises $50k, TEE wallet compromised

**Example:** Campaign #4 goes viral and raises $50k. A nation-state actor compromises 2 of 3 TEE nodes.

- **Under 2-of-3 failure:** TEE disbursements pause automatically (§10.5). Community has 7 days to vote on recovery path.
- **Under 2-of-3 compromise (attacker gains control):** Funds are drained before the failure threshold triggers. $50k in Monero is gone, irreversibly.
- **Platform financial exposure:** $0 in fees earned (zero-fee model). But:
  - Legal exposure: significant. Platform made security guarantees. Donors will sue.
  - Reputational exposure: catastrophic and permanent.
  - Criminal exposure: if TEE compromise is traced to platform negligence, potentially significant.
- **Pass-through model's cruel irony:** The platform earns $0 on a $50k campaign but bears 100% of the reputational and legal fallout from a security failure.
- **The 0% fee model makes this worse:** At 3–5% fees, platform has $1,500–2,500 in reserves from this campaign. At 0%, it has nothing to fund the legal defense.
- **Insurance note:** GOVERNANCE.md requires $1M liability insurance for $100k+ campaigns. For $50k campaigns, there's no required insurance. This gap needs attention.

### Scenario D: Campaign funded, vendor goes out of business

**Example:** Campaign #3 raises $800 for a Las Cruces billboard. Lamar Advertising exits the NM market before the billboard goes up.

- **Platform financial exposure:** $0. Funds are in TEE, not deployed.
- **Operator exposure:** Must demonstrate fulfillment or trigger refund process. Operator stake ($0 for sub-$5k goals) doesn't cover this situation.
- **Refund mechanism:** Operator can submit a failed-delivery proof. Community governance can vote to redirect funds to "highest-priority-same-category" (per `unfundedRedirect` in platformRules). But this requires *someone* to catch it — there's no automatic failed-delivery detection.
- **The anonymous donor refund trap:** Same as Scenario B. Monero donations cannot be refunded to anonymous senders. If redirect is unacceptable to donors, they have no recourse mechanism. This is a **structural gap in the platform design** that exists regardless of the fee model.
- **Recommendation:** The ToS (currently draft) must explicitly disclaim refund capabilities for anonymous Monero donations. Donors must be warned pre-contribution that anonymous donations are non-refundable.

---

## 5. Scale Scenarios

### 10 Campaigns/Year, Avg $5k Raised — $50k Total Volume

| Item | Zero-Fee Model | 3–5% Fee Model |
|------|---------------|----------------|
| Platform income | $0 | $2,500 |
| TEE infra cost/yr | $7,200–18,000 | $7,200–18,000 |
| Net | **-$7,200 to -$18,000** | **-$4,700 to -$15,500** |
| Sustainable? | No, without personal subsidy | No, at this volume |

**Neither model is sustainable at this scale.** The fee model loses less. At $50k/year volume, the platform is operating at a loss under both scenarios. This is expected for a launch-stage platform.

**What it means:** At 10 campaigns/$50k volume, the platform is a **personal project funded by Scott**, not a business. That's fine as a Phase 1 reality — but it must be named honestly.

### 50 Campaigns/Year, Avg $15k Raised — $750k Total Volume

| Item | Zero-Fee Model | 3–5% Fee Model |
|------|---------------|----------------|
| Platform income | $0 | ~$30,000 (blended ~4%) |
| TEE infra cost/yr | $7,200–18,000 | $7,200–18,000 |
| Attorney/legal/ops | $10,000–25,000 | $10,000–25,000 |
| Net | **-$17,200 to -$43,000** | **-$7,200 to +$12,800** |
| Sustainable? | No | **Possibly, at low end** |

At $750k/year volume, the 3–5% fee model begins approaching sustainability. The zero-fee model requires $17–43k in tips or personal subsidy **at this scale**.

**Tip requirement at this scale:** $17–43k/year in voluntary tips from anonymous Monero users. That's 283–717 tips at $5 each, every month. Plausible with a dedicated user base, but it requires deliberate fundraising effort, not passive collection.

### 1 Viral Campaign Raising $500k

At 3% (above $50k threshold): **$15,000 in platform fees**. This single campaign funds ~20 months of basic ops.

At 0% fees: **$0 platform income.** The platform absorbs all operational burden, legal exposure, and reputational risk of handling a half-million-dollar campaign and receives nothing.

**Is keeping 0% the right call on a $500k campaign?**

**The reputational argument for 0%:**
- Pure pass-through on a viral campaign proves the model. "We handled $500k and kept nothing" is a powerful credibility statement.
- Press coverage of this fact could generate more voluntary donor support than the $15k fee would have.
- The platform's differentiation is trust, not revenue. A 0% outcome on a viral campaign is marketing.

**The sustainability argument against 0%:**
- The platform just took on $500k in legal exposure and paid $0 into reserves to defend against it.
- If the campaign goes sideways (vendor compromise, legal challenge, OFAC issue), the platform has no financial cushion.
- The 3–5% fee was designed to fund the operations wallet for exactly this scenario.

**Honest verdict:** The reputational argument is real but requires the platform to have other revenue (grants, membership) lined up. Without that, 0% on a viral campaign is ideological purity that accelerates the platform's financial demise exactly when its operational demands peak.

---

## 6. Scott's Personal Exposure

### Pre-Launch Costs (Months 1–9, one-time)

| Item | Low | High |
|------|-----|------|
| Wyoming DAO LLC filing + registered agent (yr 1) | $150 | $200 |
| Attorney engagement (MSB + OFAC + full 12 questions) | $20,000 | $40,000 |
| TEE development (contractor) | $30,000 | $80,000 |
| Security audit | $5,000 | $20,000 |
| Community voting UI (if contracted out) | $0 | $15,000 |
| ToS + operator agreement attorney review | $1,500 | $5,000 |
| Campaign Advisory Board (if compensated) | $0 | $5,000 |
| Domains, dev tooling, misc | $500 | $2,000 |
| **Pre-launch total** | **$57,150** | **$167,200** |

### Post-Launch Ongoing (Monthly)

| Item | Low | High |
|------|-----|------|
| TEE infrastructure (3 nodes) | $600 | $1,500 |
| VPS + domains + basic ops | $45 | $75 |
| OFAC screening API | $50 | $200 |
| Monitoring, backup | $25 | $70 |
| Attorney (retainer / edge cases) | $0 | $2,000 |
| **Monthly ongoing** | **~$720** | **~$3,845** |

### 12-Month Scenario (from today)

Months 1–9: Pre-launch costs = $57–167k  
Months 10–12: Ops at post-launch burn = $2,160–11,535  
**Total Year 1: $59,310–$178,735**

Under zero-fee model, no revenue offsets this. Scott is personally underwater the entire first year.

### 24-Month Scenario

Year 1: $59–179k  
Year 2: $8,640–46,140 (full year of ongoing ops, no attorney)  
**Total 24 months: ~$67,950–$224,875**

### When Does This Become Unsustainable?

This is personal-finances dependent, but some honest benchmarks:
- **$57k pre-launch floor** is approximately 1 year of median US personal savings. Many solo founders cannot absorb this.
- **If attorney engagement hits $40k**: the build budget is already exhausted before a line of TEE code is written.
- **Break point**: If Scott is not able to fund both the attorney engagement AND TEE development simultaneously, the critical path stalls. These are not interchangeable — attorney blocks TEE architecture decisions.
- **The 18-month warning**: If the platform has not reached $30k+ annual campaign volume by month 18, the ongoing burn is a permanent drain with no foreseeable breakeven. At that point, a strategic decision is required.

**Conservative estimate of Scott's total personal outlay to reach a self-sustaining platform:** $100,000–$200,000 over 24–36 months. This is a significant personal financial commitment for a mission-driven project with uncertain revenue.

---

## 7. Alternative Revenue Paths

### A. Grants — Most Realistic

| Grantor | Fit | Grant Range | Timeline | Probability |
|---------|-----|-------------|----------|-------------|
| **Open Technology Fund (OTF)** | Excellent — internet freedom tools | $250k–$1M/yr | 6–12 mo application | High (if TEE works) |
| **Knight Foundation** | Strong — democracy tech, journalism | $50k–$500k | 3–6 mo | Medium |
| **Mozilla Foundation** | Good — open internet, privacy | $50k–$150k | 3–6 mo | Medium |
| **Open Society Foundations** | Strong — civil liberties, surveillance resistance | $50k–$2M | 6–12 mo | Medium-High |
| **EFF** | Marginal — primarily funds own work; fiscal sponsorship possible | $0–$10k | Ongoing | Low |
| **ACLU Foundation** | Marginal — occasional project grants | $0–$25k | Variable | Low |
| **Shuttleworth Foundation** | Possible — open source/tech | $50k–$250k | Annual cycle | Low-Medium |
| **Protocol Labs / Filecoin Foundation** | Possible if IPFS integration | $10k–$100k | Quarterly | Low |

**Honest assessment:** OTF is the highest-probability anchor for a privacy infrastructure project. They have funded Tor, Signal, Briar, and similar tools. Citeback's TEE-based anonymous crowdfunding for surveillance resistance is a strong fit. **Apply to OTF before the TEE build begins** — a grant could offset $250k+ of personal expense.

**Important caveat:** OTF and other grants require demonstrated progress, not just a plan. A working static site + governance docs + Wyoming LLC + a letter of support from EFF or ACLU gets you in the door. Pre-launch is not too early to apply.

**Required for grant applications:**
- Wyoming LLC incorporated (critical — grantors need a legal entity)
- Documented governance (already done)
- Clear threat model and technical architecture (in progress)
- 501(c)(3) status or fiscal sponsor relationship increases chances significantly

### B. Membership Model

**Structure:** Monthly supporters pledge $5–$20/month in XMR/ZANO directly to the platform LLC.

| Scale | Members | Monthly Revenue |
|-------|---------|----------------|
| Small | 50 @ $10 | $500 |
| Medium | 200 @ $10 | $2,000 |
| Large | 500 @ $15 | $7,500 |

**Verdict:** Viable as a supplemental stream at medium scale. Getting to 200 paying members requires a committed audience, which requires demonstrated impact (campaigns actually succeeding). This is a Year 2–3 play, not a launch strategy.

**Compatibility with privacy mission:** High, if payments can be made anonymously in XMR. Members don't need to identify themselves.

### C. White-Label / API Licensing

**What it is:** License the TEE wallet agent + governance framework to other civil liberties or journalism platforms.

**Timeline to viability:** 24–36 months minimum. Requires:
- Citeback itself proven and operating
- TEE architecture documented and auditable
- Licensee technical capacity to run TEE nodes

**Revenue potential:** $10,000–100,000/year from 2–5 licensees.

**Verdict:** Real long-term potential, especially if the TEE architecture becomes a reference implementation for the civil liberties tech community. Not a near-term option.

### D. Merchandise

**Revenue potential:** $5,000–$20,000/year with active merchandising effort.

**Compatibility with mission:** Moderate. Surveillance-resistance themed merchandise (physical items) doesn't require buyer identification. But it requires marketing, fulfillment infrastructure, and brand awareness.

**Verdict:** Don't dismiss, but don't build a financial plan around it. This is supplemental at best.

---

## 8. The Fundamental Question

**Is "Scott covers everything until tips cover it" a viable long-term model?**

### The Honest Answer: No.

This is a **bridge with no destination yet built on the other side.** Here's why:

**The tip model has a structural mismatch with the user base:**

The platform is specifically designed to attract anonymous, privacy-conscious users who use Monero precisely to avoid being tracked. These same users are the least likely population to voluntarily and repeatedly make additional XMR transfers to a platform LLC. Tipping requires:
1. Awareness that tipping is possible (requires platform UX, which adds friction)
2. Motivation to support the platform beyond their specific campaign goal
3. Willingness to make an identifiable-ish transaction separate from their campaign donation
4. Trust that the tip is used well

All of these frictions are elevated for the exact demographic Citeback is built to serve.

**The math doesn't work at launch scale:**

The current 7 campaigns have total goals of ~$14,050. If all succeed (optimistic), platform income at 0% = $0. TEE infra costs $7,200–18,000/year. Breakeven on tips requires 1,440–3,600 users voluntarily tipping $5/month. That user base doesn't exist at launch, and it can't be built from $0 campaigns.

**The personal capital exposure is unsustainable without a parallel revenue plan:**

$67–225k in personal cash over 24 months to fund a platform that earns $0 is a noble mission commitment but not a financial plan. The risk is that Scott's personal runway runs out at month 18 just as the platform is gaining traction.

**What this model *is* good for:**

The zero-fee, tips-only model is a legitimate **Phase 1 positioning statement**. "We take nothing from campaigns" is a powerful trust signal. It differentiates Citeback from GoFundMe, Kickstarter, and every other platform that profits from causes. That signal is worth something.

**The real strategy should be:**

| Phase | Revenue | Personal Subsidy |
|-------|---------|-----------------|
| **Pre-launch (now–month 9)** | $0 | Scott funds pre-launch costs |
| **Soft launch (months 10–18)** | Grant applications in flight; small tips | Scott bridges ops costs |
| **Growth (months 18–36)** | Anchor grant received (OTF/Knight) | Grant covers TEE + ops |
| **Sustainability (year 3+)** | Membership model + tips; white-label emerging | Personal subsidy eliminated |

**The exit from personal subsidy is grants, not tips.** Tips are supplemental. Grants are the bridge to sustainability for a mission-driven privacy infrastructure project.

---

## Summary: Fatal Flaws and Survivable Risks

### Fatal Flaws (require active mitigation)

1. **Zero-fee model with no grant strategy = unsustainable.** Apply to OTF and Knight Foundation immediately after LLC is filed. Don't wait for the TEE to be built.

2. **Anonymous Monero donations cannot be refunded.** This is a structural trap in all campaign failure scenarios. ToS must explicitly disclaim refunds for anonymous donations before any wallet goes live.

3. **Scott's personal pre-launch exposure ($57–167k) is a single-point-of-failure.** If Scott's personal finances are exhausted before the TEE is live, the project dies. The mitigation is parallel grant-seeking to offset the build cost.

4. **Zero-fee model contradicts existing GOVERNANCE.md §7.3.** This isn't just a business decision — it's a Governance-tier change requiring community ratification. If the model is revised, governance must be updated simultaneously.

### Survivable Risks (plan for, don't panic about)

5. **Tip revenue at launch is near-zero.** Plan for it. Price-in the assumption that tips = $0 for the first 12 months and build a budget accordingly.

6. **TEE security breach on a large campaign.** Operational reality. The 3-of-3 multi-TEE + 2-of-3 threshold + security audit path is the right mitigation. Don't rush the TEE to save money — a $50k compromise is worse than a $80k careful build.

7. **No campaign reaches goal in Year 1.** Plausible. Small goals ($750–$1,200) are achievable, but only with an existing donor audience. Build the mailing list and Nostr presence now, before wallets go live.

8. **Scott's 24-month personal outlay reaches $200k.** Survivable if matched against a tangible platform with proven campaigns, a grant in hand, and a growing user base. Not survivable as a sunk cost with no progress to show.

---

## Recommended Actions (Financial Priority Order)

1. **File Wyoming LLC now.** Everything downstream requires it. ($150, 30 minutes)
2. **Apply to OTF and Knight Foundation within 60 days of LLC filing.** Use the governance docs + site as the application package. This is the primary mitigation against personal financial ruin.
3. **Keep GOVERNANCE.md §7.3 fee schedule in place for now.** The zero-fee aspiration is valid messaging, but don't formally adopt it until grant funding is secured. The fee schedule is a financial backstop.
4. **Add a prominent ToS disclaimer on anonymous donation non-refundability** before any wallet goes live.
5. **Budget Scott's personal cash commitment explicitly:** Target a 24-month personal budget of $75k maximum. If pre-launch costs alone exceed $75k (possible with attorney + TEE), pursue a pre-launch community funding campaign with full disclosure.
6. **Year 2: Activate membership model.** Even 50 members at $10/month XMR covers basic ops. It's not nothing.

---

*This document reflects the financial picture as of 2026-05-06. Numbers are estimates based on LAUNCH_PLAN.md cost projections and industry benchmarks. Not legal or financial advice.*
