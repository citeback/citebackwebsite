# LAUNCH_TIMELINE.md — Citeback Week-by-Week Plan
> Written: 2026-05-05 (overnight planning session)  
> Baseline: May 5, 2026 — 0 launch gates beyond the 4 already cleared  
> Assumes: Scott moves aggressively on LLC + attorney simultaneously

---

## Critical Path Summary

The critical path is:
1. **Wyoming LLC** (1–3 days) → 
2. **Attorney retained** (1 week) → 
3. **MSB/OFAC opinion received** (6–8 weeks) + **Direct wallet workflow implemented** (1–2 weeks) → 
4. **First operator onboarded + wallet published** (2–4 weeks) →
5. **First wallet live**

Attorney engagement and operator onboarding are the critical path. The direct wallet model eliminates the TEE build entirely — no months-long contractor engagement required.

---

## Two Scenarios

### Scenario A — Aggressive (Fast Path)
> Best case: launch October 2026 (~5 months)
> Assumes: LLC files week 1, attorney retained week 2, direct wallet workflow implemented week 4, first operator onboarded week 6, first wallet live August 2026.

### Scenario B — Responsible (Safe Path)  
> Realistic: launch January–February 2027 (~9 months)
> Assumes: attorney engagement takes full 8 weeks for comprehensive opinions, community advisory board recruitment takes time, all gates cleared properly before wallets go live.

**Recommendation:** Plan for Scenario B. Hope for Scenario A. Every week saved on attorney work is borrowed time. The direct wallet model means TEE build time is no longer on the critical path.

---

## Week-by-Week Plan

### PHASE 0 — Immediate Actions (Week 1)
> May 5–11, 2026

**Critical — do this week:**
- [ ] **File Wyoming DAO LLC** at wyomingbusiness.gov. 30 minutes, $100 + registered agent. There is no reason to delay. *(Scott)*
- [ ] **Verify citeback.com ICANN registration** — scotthughes070@proton.me must verify before May 14 or domain could be suspended. *(Scott)*
- [x] **Fix stale fee + TEE references across all docs** — fee model eliminated (zero-fee + voluntary tips); TEE scrapped in favor of direct wallet model. All docs updated. *(Agent — 2026-05-07)*
- [ ] **Add ToS link to site footer** pointing to /tos (even as "Coming soon" placeholder) to close the credibility gap flagged in red-team audit.

**Begin research this week:**
- [ ] Start reading ATTORNEY-BRIEF.md cover to cover to prepare for attorney search. *(Scott)*
- [ ] Identify 3–5 law firms to contact for engagement (see LAUNCH_PLAN.md HB-2 for firm list).
- [ ] Implement direct wallet workflow: operator wallet submission form, view key publication.

---

### PHASE 0 — Entity and Attorney (Weeks 2–3)
> May 12–25, 2026

**After LLC is filed:**
- [ ] Contact law firms with ATTORNEY-BRIEF.md. Request engagement on priority items (MSB + OFAC first; full 12-question engagement preferred).
- [ ] Set up Wyoming LLC's registered email and banking (separate from personal). citeback@proton.me is fine for platform; LLC needs a business bank account before any operational funds flow.
- [ ] Direct wallet model implementation confirmed with attorney. View key monitoring defined.

**Parallel track — site work:**
- [ ] Fix broken source links (Cambridge ALPR, WA state ALPR) per PRE-LAUNCH.md items 5 and 7.
- [ ] Fix ShotSpotter timeframe language per PRE-LAUNCH.md item 6.
- [ ] Draft and add ToS page placeholder with contact info.

---

### PHASE 1 — Attorney Active (Weeks 4–9)
> May 26 – July 6, 2026

**Attorney engagement running:**
- [ ] Attorney working on MSB/FinCEN opinion (Item 1) — ETA weeks 6–8 of engagement.
- [ ] Attorney working on OFAC analysis (Item 3) — parallel with Item 1.
- [ ] Attorney drafting operator agreement (O-2) — can often be done concurrently.

**Direct wallet model implementation + first operator onboarding (Scenario A starts here; Scenario B starts Week 8):**
- [ ] Direct wallet submission flow built into site.
- [ ] Recruit and vet first operator candidate.
- [ ] First operator onboarded, wallet address + view key collected.

**Parallel track — operational prep:**
- [ ] Draft Operator Accountability Protocol (L-4) — 1 week.
- [ ] Draft Governance v1.0 ratification announcement.
- [ ] Set up campaign advisory board outreach: EFF, ACLU NM, S.T.O.P.
- [ ] Confirm FOIA filing capability for Campaigns 1, 5, 6 (O-6).
- [ ] Confirm billboard procurement for Campaigns 2, 3 (O-7) — contact Lamar or Adams billboard.
- [ ] Set up Nostr presence (C-4) and mailing list (C-1).

---

### PHASE 1 — Legal Opinions Arrive (Weeks 8–10)
> June 30 – July 19, 2026

**Expected: MSB and OFAC opinions delivered**
- [ ] Review attorney opinions. Flag any required platform changes.
- [ ] If MSB registration required: begin FinCEN registration process (add 4–8 weeks to timeline).
- [ ] If state MTL licenses required: assess impact. This could be a significant timeline blocker — worst case, multi-state licensing delays launch 12+ months or requires restructuring.
- [ ] Implement OFAC documentation process per attorney guidance.
- [ ] Attorney reviews TOS_DRAFT.md and approves for publication.
- [ ] Publish ToS page — link from footer.
- [ ] Ratify GOVERNANCE.md v1.0.
- [ ] Publish Operator Accountability Protocol.

**⚠️ DECISION POINT:** If attorney finds material blockers (required MTL licenses in multiple states, mandatory MSB AML program incompatible with anonymous donor model), timeline extends significantly and platform design may need rethinking. Do not assume clear sailing.

---

### PHASE 2 — Direct Wallet Model + Operator Onboarding (Weeks 4–10)
> June 16 – September 28, 2026 (Scenario A) or later (Scenario B)

**Direct wallet model development scope is much simpler than TEE — estimated 2–4 weeks total (no hardware enclave, no contractor required).**

**Week 1–2 (Core workflow):**
- Operator wallet submission form built and tested (operator submits XMR/ZANO address + view key at approval)
- View key publication workflow: view key displayed on campaign page for independent verification
- View key monitoring: anomaly detection for early drain events (outflow before campaign goal triggers permanent ban)
- Action Logger writing to append-only public format

**Week 2–3 (Governance + Accountability):**
- Disbursement challenge flow: proof submission → challenge window → community vote
- OFAC SDN screening workflow for operator onboarding (operator identity vs. SDN list at onboarding)
- Emergency pause mechanism
- Founder address registry encoded

**Week 3–4 (Integration + Test):**
- Community voting interface for disbursement challenges live on site
- Action logger publishing to GitHub
- Threat model document published for community review
- End-to-end test: operator submits wallet → view key published → test contribution verifiable via view key
- Security review of view key monitoring code (see PRE-LAUNCH.md item 17)

---

### PHASE 3 — Pre-Launch Checklist (Weeks 20–24)
> September–October 2026 (Scenario A) or November 2026–January 2027 (Scenario B)

**All gates should be cleared by end of this phase:**
- [ ] Wyoming LLC: ✅ (done in week 1)
- [ ] FinCEN MSB opinion: ✅
- [ ] State MTL analysis: ✅ (or active compliance in progress)
- [ ] OFAC documentation: ✅
- [ ] ToS published and attorney-reviewed: ✅
- [ ] Operator Accountability Protocol: ✅
- [ ] Governance v1.0 ratified: ✅
- [ ] Direct wallet submission workflow live: ✅
- [ ] View key monitoring operational: ✅
- [ ] Threat model ratified: ✅
- [ ] Security audit complete: ✅
- [ ] Community voting interface live: ✅
- [ ] Action logger live: ✅
- [ ] Founder address registry: ✅
- [ ] Campaign Advisory Board (2+ members): ✅
- [ ] First operator onboarded: ✅
- [ ] Misconduct + staking systems tested: ✅

**Final pre-launch tasks:**
- [ ] Full site content audit (one more pass before wallets go live)
- [ ] Broken links all fixed
- [ ] ToS linked from footer
- [ ] Press embargo list prepared
- [ ] Social/Nostr announcement draft ready

---

### PHASE 4 — SOFT LAUNCH (Week 24–26)
> October–November 2026 (Scenario A) or January–February 2027 (Scenario B)

**Soft launch = first wallet activated, limited public announcement**

**Soft launch sequence:**
1. First operator (Scott) submits Campaign #1 (FOIA — Bernalillo County Sheriff Flock Contract)
2. Campaign reviewed and approved by platform entity (Scott)
3. Operator submits XMR wallet address + view key
4. Address published on site
5. Announce to mailing list + Nostr only (no press yet)
6. Monitor: first donations received, action logger working, no anomalies
7. 2-week quiet period before broader announcement

**Why FOIA first, not Billboard:**
- Lower legal risk (FOIA campaign is unambiguously lawful, no §230 concerns)
- Smaller funding goal ($1,200 vs $750–800) — more achievable first campaign
- Attorney sign-off is cleaner
- Creates the first real track record before higher-risk campaign types go live

**Why not Campaign #4 (Legislative Advocacy) first:**
- Requires separate attorney sign-off per GOVERNANCE.md §3.2
- Launch with clean, lower-risk campaign types. Campaign #4 after attorney clears it.

---

### PHASE 5 — FULL LAUNCH (Week 28–30)
> November 2026 – March 2027

**Full launch = press announcement + all qualifying campaign types open + billboard campaigns activated**

- [ ] All 7 campaigns with activated wallets (post Campaign #4 attorney clearance)
- [ ] Press outreach: Intercept, 404 Media, Wired, The Guardian, KOB 4, ProgressNow NM
- [ ] Monero community announcement: r/Monero, Monero Talk, Cake Wallet community
- [ ] Privacy community: r/privacy, r/privacyguides, Surveillance Technology Oversight Project
- [ ] EFF/ACLU partner outreach
- [ ] Blog post: "How Citeback works — and why the direct wallet model matters"
- [ ] Open operator applications publicly
- [ ] Governance community vote (bootstrapping era begins)

---

## Parallel vs. Sequential Summary

| Track | Sequencing |
|---|---|
| Wyoming LLC | Must be first. Everything else follows. |
| Attorney engagement | Sequential after LLC. Priority: MSB + OFAC first. |
| Direct wallet workflow | 2–4 weeks, start immediately after LLC + attorney engaged. No contractor required. |
| Operator Accountability Protocol | Parallel to attorney, can draft while waiting. |
| Governance ratification | After attorney reviews governance doc. |
| Community advisory board recruitment | Parallel — can start outreach any time. |
| Expert directory population | Parallel — ongoing. |
| Site content fixes (broken links) | Immediate parallel — quick wins. |
| ToS draft (TOS_DRAFT.md) | Done. Attorney review after engagement begins. |
| FOIA filing capability confirmation | Parallel, quick. |
| Billboard procurement research | Parallel, quick. |
| Community voting UI | Start Week 2 of direct wallet dev, can be done concurrently. |
| Press prep | Parallel — draft materials, embargo until launch. |

---

## Critical Path — Marked

```
Week 1:   FILE WYOMING LLC ◄ CRITICAL
Week 2:   RETAIN ATTORNEY  ◄ CRITICAL
Week 2:   DIRECT WALLET DEVELOPMENT BEGINS (parallel with attorney) ◄ CRITICAL
Week 4:   DIRECT WALLET WORKFLOW COMPLETE ◄ CRITICAL
Week 8:   MSB/OFAC OPINION RECEIVED ◄ CRITICAL
Week 10:  SECURITY REVIEW COMPLETE ◄ CRITICAL
Week 24:  ALL GATES CLEARED ◄ CRITICAL
Week 25:  FIRST WALLET LIVE ◄ LAUNCHED
```

**Every item on the critical path above is sequential.** Any delay cascades to launch.

**Everything else is parallel** and should be started as early as possible to avoid last-minute scrambles.

---

## Risk Flags

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Attorney finds MSB registration required | Medium | High — adds AML program build, could delay 4–12 weeks | Start attorney engagement immediately; AML program design can begin in parallel |
| Attorney finds state MTL required in multiple states | Medium-Low | Very High — could block launch or require restructuring | Have attorney assess non-custodial direct wallet exemptions; prepare alternative structures |
| Security audit finds critical vulnerability | Medium-Low | Critical — must fix before launch, add 4–8 weeks | Use reputable audit firm; build audit time into timeline from the start |
| Campaign Advisory Board recruitment fails | Low | Medium — can soft-launch without, but GOVERNANCE.md requires it | Start outreach early; Scott's direct EFF/ACLU contacts are the fastest path |
| citeback.com domain suspended (ICANN non-verify) | Medium | High | VERIFY BY MAY 14. Do it today. |

---

## What "Soft Launch" vs "Full Launch" Means

**Soft Launch (recommended first step):**
- Direct wallet infrastructure live (operator wallet submission, view key monitoring operational)
- 1–2 FOIA campaigns with active wallet addresses
- ToS published
- Limited announcement (mailing list + Nostr)
- Operator onboarding open but not publicized broadly
- Community governance interface live
- No press outreach yet

**Full Launch:**
- All 7 campaigns with wallets
- Press outreach begins
- Open operator applications
- Campaign Advisory Board active
- Governance community (bootstrapping era active)
- Billboard campaigns live (post-§230 clearance)
- Legislative advocacy campaign live (post-FARA/LDA clearance)

**Why this distinction matters:** The soft launch lets the platform operate at low volume while ensuring everything works correctly before the governance and operational load of a public launch. If something breaks quietly with 10 donors, it's fixable. If it breaks with press coverage, it's a crisis.

---

*Last updated: 2026-05-05 | Review and adjust at start of each weekly sprint.*
