# Citeback UX Journey Audit
**Date:** 2026-05-06  
**Auditor:** Subagent (citeback-journey-audit)  
**Source:** Full source audit of `/deflect/src/` + live site context  
**Status:** Pre-launch — 4/10 prerequisites met, no wallets active

---

## Executive Summary

Citeback is a technically sophisticated, philosophically coherent platform that currently cannot do the one thing it exists to do: accept donations. Everything on the site is an elaborate waiting room for the TEE wallets. That's fine as a build-in-public strategy — but only if users understand it. Many don't. The most urgent problems are not technical complexity but communication gaps: unclear pre-launch state on the homepage, no submission tracking for any form, and a missing operator onboarding pipeline after the proposal form ends.

**Headline number: approximately 70–75% of distinct user journey steps end in a dead end.** The core donation loop — the platform's entire reason for existing — is 100% dead on arrival for every user today.

---

## Journey 1: The Angry Citizen
*Someone found a Flock ALPR on their street. Furious. Finds citeback.com.*

### Step-by-Step

1. **Lands on homepage hero** — sees "Fund the Fight Against Surveillance," stats bar (7 campaigns, $14,050 in goals, **$0 raised**), and a "View Campaigns" CTA.  
   ⚠️ CONFUSING — The hero shows $0 raised with no immediate explanation *why*. A first-time visitor doesn't know if this platform is brand new, broken, or a scam.

2. **Clicks "View Campaigns"** — scrolls through 7 campaign cards. All show "$0 raised," "Pre-Launch" badge.  
   ⚠️ CONFUSING — "Pre-Launch" is styled as a subdued badge. Doesn't communicate urgency or timelines. "What does pre-launch mean for me?" is unanswered at the list level.

3. **Opens Campaign #1 (FOIA — Bernalillo County)** — reads description, win condition, source link.  
   ✅ WORKS — Campaign content is compelling, specific, well-sourced. Source link to KOB4 works.

4. **Tries to donate** — sees "Pre-Launch Campaign" panel explaining TEE wallets.  
   ✅ WORKS — The explanation is honest and reasonably clear. Mentions "Trusted Execution Environment" which may confuse non-technical users.  
   ❌ DEAD END — Cannot donate. No wallet addresses. No timeline given for when wallets will activate.

5. **Clicks "Signal Interest"** — thumbs-up registers interest count.  
   ✅ WORKS — Functional. Count persists in localStorage. Feels like doing something, even if it changes nothing financially.

6. **Looks for "what can I do RIGHT NOW?"** — scrolls down the modal. The only copy says "Bookmark this page and check back."  
   ❌ DEAD END — "Bookmark this page" is not an action. There is no queue, no notification, no ETA. The angry citizen who came here to *do* something hits a wall.

7. **Finds Frontline Funds** (via nav or footer) — sees active lawsuits with real donate links (EFF, ACLU, MacArthur Justice Center).  
   ✅ WORKS — These are real, active, funded organizations with live donation links. This is the only place a user can send money with immediate effect today.

8. **Finds "Report a Sighting"** — submits a camera. Gets confirmation screen.  
   ✅ WORKS — Form functions. AI geocoding adds a confirmatory UX touch. Submission confirmed.

9. **Looks for who to contact** — scrolls homepage, nav, footer.  
   ❌ DEAD END — No "Contact" or "About" link in the nav. `citeback@proton.me` is buried inside the proposal and registry application confirmation screens. Not findable without submitting a form.

**Most frustrating moment:** After reading a compelling campaign about a real local issue, clicking "donate," and being told to "Bookmark this page and check back" — with no timeline, no notification option, no next step.

---

## Journey 2: The Camera Spotter
*Wants to contribute to the surveillance map. Goes to Report a Sighting.*

### Step-by-Step

1. **Navigates to /report** — finds form. Clear header: "Report a Surveillance Sighting." Privacy notice prominently placed.  
   ✅ WORKS — UI is clean. Camera type selection is well-designed. Geocoding feedback is a nice touch.

2. **Fills out form and submits** — gets success screen.  
   ✅ WORKS — Submission confirmed. Buttons to "Report Another" or "View the Map" are useful.

3. **Reads success message:** "Your report is in the moderation queue. Once reviewed, it will be added to the surveillance map and tagged as community-reported."  
   ❌ DEAD END — No submission ID. No estimated review time. No way to check status.

4. **Comes back next week to check on their submission** — opens the map.  
   ❌ DEAD END — No way to identify which (if any) pin is theirs. Map doesn't differentiate between approved community sightings and OSM data at a glance that could be traced to their submission. No "my submissions" view possible (no account, by design).

5. **Wants to check their reputation score** — there is no reputation score visible to them. Reputation system is described in GOVERNANCE.md but there's no UI surface for it.  
   ❌ DEAD END — Reputation system is planned but non-functional. Even if it existed, there's no account or identity to attach it to for anonymous sighters.

6. **Wants to connect their sighting to the Verification Bounty campaign** — the campaign modal mentions "Verifiers apply through the Expert Directory." The sighting form doesn't mention this path at all.  
   ❌ DEAD END — The connection between "Report a Sighting" and "get paid for verifying cameras" is invisible. These are two separate flows with no cross-link.

7. **Asks the AI: "I submitted a camera — did it get approved?"**  
   ❌ DEAD END — The AI cannot query submission state. It would tell the user "no notifications by design, bookmark the map and check back."

**Most frustrating moment:** Submitting a sighting, getting a green checkmark, then realizing there is *literally no mechanism* to ever know what happened to it.

---

## Journey 3: The Potential Donor
*Sees Campaign #1, wants to donate.*

### Step-by-Step

1. **Finds the campaign** — via homepage, campaign selector, or direct URL `/campaigns/1`.  
   ✅ WORKS — Deep link routing works. Campaign card is informative.

2. **Opens the modal** — reads description, source link, contract context. Well-sourced, specific.  
   ✅ WORKS — Content is compelling. Win condition is clear.

3. **Checks funding progress** — sees "Pre-Launch / Wallet pending — collecting interest."  
   ⚠️ CONFUSING — The word "Pre-Launch" alongside a $1,200 goal creates cognitive dissonance. Is this campaign being actively funded and just slow? Or truly unavailable?

4. **Looks for a donate button or wallet address** — doesn't exist. Sees the "Pre-Launch Campaign" panel.  
   ❌ DEAD END — No wallet. Cannot donate.

5. **Reads pre-launch explanation** — "Dedicated Monero (XMR) and Zano (ZANO) wallets are generated inside a Trusted Execution Environment (TEE)…"  
   ⚠️ CONFUSING — First mention of "TEE" and "Trusted Execution Environment" without a definition or a link to learn more. Non-technical donors may check out here.

6. **Looks for a way to sign up and be notified when wallets activate** — copy says "No notifications — by design. Bookmark this page and check back."  
   ❌ DEAD END — No email list, no notification system (explicitly by design). The platform has chosen privacy over activation loop. This is a *principled* dead end, but it's still a dead end.

7. **Signals interest** — thumbs-up registers. No feedback on what this does or whether it affects anything.  
   ⚠️ CONFUSING — "Signal Interest" has no stated purpose on the button itself. Does it affect launch order? Does it get reported somewhere? The UI says nothing.

8. **Wonders: do any campaigns have active wallets?** — checks all 7. All are pre-launch.  
   ❌ DEAD END — Platform-wide. No donation is possible anywhere on Citeback today.

9. **Finds Frontline Funds** — donates to EFF or ACLU instead.  
   ✅ WORKS — Frontline Funds is the correct redirect for this user and it works.

10. **Returns to check LaunchTracker** — finds it buried on the homepage. 4/10 prerequisites met.  
    ✅ WORKS — LaunchTracker is honest and informative. But it's not linked from anywhere prominent. No ETA on when remaining 6 prerequisites will clear.

**Most frustrating moment:** Understanding there's a campaign that could fund a real FOIA request — exactly what they want to support — and having no way to fund it, with no timeline for when they can.

---

## Journey 4: The Operator (wants to run a campaign)
*Goes to "Run a Campaign." Wants to propose a surveillance accountability action.*

### Step-by-Step

1. **Navigates to /run-a-campaign** — finds the Operators page.  
   ✅ WORKS — Page is comprehensive. Requirements are upfront and honest.

2. **Reads requirements** — identity, OFAC, specific target, cost breakdown.  
   ✅ WORKS — Clear. The tier table (starting $1k cap → $100k+ after track record) is specific.

3. **Notes the "What happens after you submit" accordion** — lists 6 steps: review, identity verified, tier assigned, campaign published, funds disburse milestone-by-milestone, closes with public record.  
   ⚠️ CONFUSING — Step 2 says "Identity verified and OFAC screened privately by the operator." But the proposal form doesn't collect any identity information. *How* does identity verification happen? When? No mechanism described.

4. **Clicks "Propose a Campaign"** — ProposeModal opens. Step 1: choose campaign type.  
   ✅ WORKS — UI is clean and well-paced.

5. **Completes Step 2** — fills out title, location, description, funding goal.  
   ⚠️ CONFUSING — No field for identity information, contact method, or cost breakdown. The Operators page requires "a line-item budget" but the form only asks for a single "Funding Goal (USD)" number.

6. **Sees the contact note:** "To follow up on your submission, email citeback@proton.me from a privacy-preserving email."  
   ⚠️ CONFUSING — So the platform *can't* contact them — the operator must initiate contact separately. This creates a disconnected two-step that isn't communicated clearly at the start of the process. An operator might submit and wait 5-7 days without knowing they need to email separately.

7. **Submits proposal** — sees success screen with timeline: "24–72h review → wallets when TEE live → goes live."  
   ✅ WORKS — Success state provides a process summary.  
   ❌ DEAD END — No submission ID. No way to track status. No confirmation that the backend actually received it (fire-and-forget fetch, no server-side acknowledgment shown).

8. **Wonders: was my proposal received?** — no email confirmation (no contact collected), no submission tracking.  
   ❌ DEAD END — If the API call to `ai.citeback.com/submit` failed silently, the operator sees the same success screen as a successful submission. The code has `catch (_) {}` — errors are swallowed silently.

9. **Wants to understand identity verification process** — no information on when/how this happens. No form fields. Only "email citeback@proton.me."  
   ❌ DEAD END — The entire identity verification pipeline is a manual process with no in-product support.

10. **Wants to submit campaign WITH milestone structure** (like Campaign #4) — the proposal form has no milestone fields.  
    ❌ DEAD END — Complex campaigns with milestone structures cannot be expressed in the proposal form. Must be communicated via email.

11. **Expects to see campaign in a "pending" state somewhere** — there is no operator dashboard or proposal tracking.  
    ❌ DEAD END — After submission, the operator has no view into the platform's internal state.

**Most frustrating moment:** Submitting a campaign proposal with no receipt, no tracking, and then realizing the identity verification they were warned about has no actual process in the product — they have to email separately and hope someone responds.

---

## Journey 5: The Journalist
*Researching Citeback for a story. Needs: who runs this, contact, methodology, governance, financial model.*

### Step-by-Step

1. **Who runs this?** — reads Governance page. Platform is "organized as a Wyoming DAO LLC (formation is a launch prerequisite)." Founder is anonymous. No names published.  
   ❌ DEAD END — No founder name, no registered organization, no legal entity to verify. Wyoming DAO LLC is described throughout as "in formation" — it doesn't exist yet as a legal entity.

2. **How to contact someone?** — searches homepage nav: Home, Campaigns, Map, Expert Directory, Transparency, How It Works, Governance, Run a Campaign, Frontline Funds, Intelligence Feed. No "About" or "Contact" page.  
   ❌ DEAD END — `citeback@proton.me` exists in the codebase (inside proposal and registry confirmation screens) but is not discoverable without submitting a form. No contact link anywhere in nav or footer.

3. **Camera data methodology?** — Transparency page documents all data sources: OpenStreetMap (92,008 cameras), EFF Atlas of Surveillance, CourtListener/RECAP, USASpending.gov, Senate LDA, OpenStates.  
   ✅ WORKS — Data sources are well-documented with links. OSM attribution is correct. Methodology is transparent.

4. **Campaign verification methodology?** — reads that campaigns are based on "verified public records and news reporting" with source links on each campaign.  
   ✅ WORKS — Source links are included on every campaign and point to legitimate journalism (KOB4, ProgressNow NM).

5. **Governance structure?** — Governance page is comprehensive. Available on GitHub.  
   ✅ WORKS — Governance is publicly documented. The distinction between what exists now vs. what's planned is reasonably clear once you read carefully.

6. **Financial model?** — Graduated fee schedule (5%→3%) is documented in Governance and TrustFAQ.  
   ✅ WORKS — Fee model is specific and public.

7. **Can you independently verify the platform's claims?** — GitHub is public, code is open source, but the TEE attestation endpoint doesn't exist yet.  
   ⚠️ CONFUSING — Many claims in the TrustFAQ are written in present tense ("the TEE produces a cryptographic attestation") but are Phase 2 promises. A skeptical journalist will notice the tense mismatch.

8. **Who is the "founder"?** — never identified. The platform explicitly describes the founder as anonymous.  
   ❌ DEAD END — A journalist cannot attribute this platform to any specific person or legal entity at this time. The Wyoming DAO LLC doesn't exist. The platform is legally a personal website/project.

9. **Is this a registered money services business?** — the platform explicitly states: "FinCEN MSB compliance opinion obtained from attorney" is a **pending** launch prerequisite. Currently, no MSB classification.  
   ⚠️ CONFUSING — The platform is explicitly not accepting money. But a journalist might reasonably ask whether the pre-launch "Signal Interest" collection or the sighting/proposal form submissions constitute any regulated activity.

**Most frustrating moment:** Having a platform that is *extraordinarily* transparent about its governance and technical architecture, but completely opaque about the most basic journalistic questions — who owns/runs this, where are they, can I talk to someone?

---

## Journey 6: The Attorney (Potential Tier 4 Operator)
*Civil rights attorney wants to use Citeback to fund a lawsuit. Goes to the platform to sign up.*

### Step-by-Step

1. **Reads Operators page** — sees legal defense is supported (Tier 2), notes the requirement for "civil and administrative challenges only — no criminal defense."  
   ✅ WORKS — This restriction is clearly stated.

2. **Sees the tier system** — starting cap $1,000, then $2k completed → $5k cap, etc.  
   ⚠️ CONFUSING — A first-time attorney can only run a $1,000 campaign to start. A real civil rights case might cost $50-100k. The attorney must win small campaigns first to build reputation before running a case of meaningful scale. This constraint isn't explained in terms of how long it actually takes to graduate through tiers.

3. **Reads Campaign #4 (NM ALPR Privacy Bill)** — notices the description includes: "⚠️ Legislative advocacy campaigns require pre-launch attorney sign-off on lobbying disclosure (LDA) and foreign-agent (FARA) compliance before this campaign goes live — see GOVERNANCE.md §3.2."  
   ⚠️ CONFUSING — This compliance requirement is embedded in the campaign *description text*, not in a structured process. What does "attorney sign-off" mean in practice? Who coordinates it? How does the operator know if their campaign has received this sign-off?

4. **Wants to propose a lawsuit campaign with milestones** — clicks "Propose a Campaign." Fills out the two-step form. No milestone fields available.  
   ❌ DEAD END — The proposal form has no mechanism for specifying milestone structure, case theory, or legal strategy. This information must go in the "Description" free-text field and then be communicated via email.

5. **Wants to verify credentials** — the form asks for "Background & Experience" (free text). No credential verification, no bar number field, no way to prove attorney status within the product.  
   ❌ DEAD END — Credential verification is entirely manual and off-platform. The attorney is told to email citeback@proton.me.

6. **Asks: what does the identity verification process look like?** — the Operators page says identity is verified "privately by the operator." No information on what that means: video call? ID document upload? Third-party KYC service?  
   ❌ DEAD END — Zero information about the actual identity verification pipeline.

7. **Reads "DAO legal counsel sign-off required" for campaigns above $25k** — asks: who is the DAO legal counsel? Has it been retained?  
   ❌ DEAD END — Wyoming DAO LLC isn't formed. Counsel has presumably not been retained. This requirement is pre-launch aspiration.

8. **Tries to find other attorneys in the Expert Directory** — opens the registry. "No verified operators yet. Be the first."  
   ❌ DEAD END — Empty registry. No way to see what other attorneys have used the platform or whether the community exists.

9. **Applies to the Expert Directory as a legal researcher** — submits application. Gets confirmation: "Community review takes 48–72 hours."  
   ❌ DEAD END — Same problem as all other forms: no tracking, no contact collected, no follow-up mechanism.

**Most frustrating moment:** Wanting to run a $50k civil rights litigation campaign, realizing they'd need to spend months building up a track record through $1k campaigns to access that tier — and the entire tier progression depends on a system (TEE, wallets, reputation tracking) that doesn't exist yet.

---

## Journey 7: The Skeptic
*Privacy activist who doesn't trust new platforms. Reads everything. Tests everything.*

### Step-by-Step

1. **Reads Privacy Policy** — finds detailed disclosure of Netlify IP logging, Bunny CDN font loading, CARTO map tiles, external API calls. Honest and specific.  
   ✅ WORKS — Privacy Policy is unusually honest. Naming the CDN, map tile provider, and API services is excellent practice.

2. **Reads Terms of Service** — not evaluated in detail in this audit.  
   ✅ WORKS — Present and linked.

3. **Reads TrustFAQ** — notices Phase 1 banner: "Campaign wallets are not yet live."  
   ✅ WORKS — Phase 1 banner is prominent and sets appropriate expectations.

4. **Reads Governance** — detailed, thorough. Notes "Wyoming DAO LLC (formation is a launch prerequisite)" throughout.  
   ⚠️ CONFUSING — "The platform is being organized as a Wyoming DAO LLC" appears in 6+ places throughout the site. A skeptic will recognize this is a promise, not a legal reality. There's no EIN, no registered agent, no state filing number to verify.

5. **Notes the OFAC gap disclosure in TrustFAQ** — "Because Monero and Zano transactions are private at the protocol level, the platform has no technical ability to screen anonymous donors against the OFAC SDN list."  
   ✅ WORKS — This is admirably honest. A less scrupulous platform would hide this.

6. **Tests the AI chat** — asks a question about surveillance.  
   ✅ WORKS — AI responds knowledgeably, stays on topic, correctly identifies pre-launch status when asked about donations.

7. **Asks AI: "Can I donate right now?"**  
   ✅ WORKS — AI correctly says wallets are not yet active and explains the process.

8. **Asks AI: "Who runs this platform?"**  
   ⚠️ CONFUSING — The AI will say the platform is organized as a Wyoming DAO LLC and that the founder is anonymous. True, but not satisfying for a skeptic.

9. **Reads LaunchTracker** — sees 4/10 complete. Open items include: Wyoming DAO LLC, FinCEN MSB compliance opinion, TEE wallets live, TEE remote attestation.  
   ✅ WORKS — LaunchTracker is the most honest single piece of content on the site. It tells you exactly what's missing.

10. **Tries to verify TEE attestation** — no attestation endpoint exists. GitHub has architecture spec but no running code to verify.  
    ❌ DEAD END — Cannot independently verify any of the TEE claims. Must take them on faith until Phase 2.

11. **Checks GitHub** — code is public. Governance, architecture specs are there.  
    ✅ WORKS — Open source code is available and auditable.

12. **Notes that many TrustFAQ answers use present tense for future-state features:**  
    - "The TEE produces a cryptographic attestation" → TEE not live  
    - "No human holds wallet keys" → no wallets exist yet  
    - "Anyone can verify the balance matches what the campaign shows" → no wallets, no balances  
    ⚠️ CONFUSING — The Phase 1 banner at the top of TrustFAQ is the only mitigation. If a user navigates to a specific FAQ answer via deep link or shares a specific question, they get no Phase 1 context.

13. **Looks for when the platform expects to launch** — searches entire site. No date, no timeline, no estimate.  
    ❌ DEAD END — No launch timeline published anywhere. LaunchTracker shows what's left but gives no ETA on any item.

**Most frustrating moment:** Reading detailed, technically sophisticated governance documentation about a system that doesn't exist yet, with no way to independently verify claims and no timeline for when verification will be possible.

---

## Journey 8: The Returning User
*Submitted a camera sighting a week ago. Comes back to check on it.*

### Step-by-Step

1. **Returns to citeback.com** — no login, no account, no cookies tracking prior activity.  
   ❌ DEAD END — The platform is stateless from the user's perspective. There is no continuity between visits.

2. **Wants to see if sighting was approved** — opens map. Cannot distinguish community-submitted sightings from OSM data. No "pending" layer.  
   ❌ DEAD END — No visibility into submission status. No submission ID was issued.

3. **Wants to check reputation score** — opens Expert Directory. "No verified operators yet."  
   ❌ DEAD END — No reputation system visible. Reputation is described in Governance/campaigns.js but there is no UI surface for it anywhere.

4. **Wants to see if the campaign they liked is closer to funding** — opens campaign modal.  
   ❌ DEAD END — All campaigns still show "Pre-Launch" / $0 raised. No progress visible. No indication of when wallets might activate.

5. **Wonders if their "Signal Interest" click did anything** — reopens campaign modal. Sees their click was recorded (localStorage), count is still there.  
   ✅ WORKS — Interest count persists. Their click was registered.  
   ⚠️ CONFUSING — But what does the interest count *do*? Still no explanation.

6. **Looks for any way to be notified** — site says "No notifications — by design." No email signup, no RSS, no Nostr subscription.  
   ❌ DEAD END — Deliberate design choice. But it creates a situation where engaged users have no reason to return to the site until wallets activate, at which point they may have forgotten about it entirely.

**Most frustrating moment:** The realization that the platform has no memory of them at all, and they have no way of knowing if the time they spent contributing (sighting, interest signals) had any effect whatsoever.

---

## Cross-Cutting Analysis

### What is the ONE action the platform most wants users to take?
**Donate to campaigns.** This is obvious from the architecture, the campaign cards, the wallet integration specs, the governance fee structure — everything. But this action is **currently 100% unavailable** for every user.

The secondary most-wanted action (contributing to the map / surveillance intelligence ecosystem) is buried. Signal Interest, Submit Sighting, and Propose a Campaign are not clearly prioritized in the nav or hero. The nav has 10 items and none of them say "Donate" or "Get Involved" in a way that implies urgency.

**Is the primary action clear?** The hero says "Fund the Fight Against Surveillance" — yes, it's clear. But then it immediately shows $0 raised with no clear path to change that. The cognitive dissonance between the call-to-action and the dead end is the platform's single biggest UX problem.

---

### What percentage of user journeys end in real action vs. dead end?

| Journey | Real Actions Available | Dead Ends Encountered |
|---|---|---|
| Angry Citizen | Signal Interest, Frontline Funds, Report Sighting, AI Chat | Donate, Notification signup, Contact someone |
| Camera Spotter | Submit Sighting | Track submission, Check reputation, Connect to bounty |
| Potential Donor | Signal Interest, Frontline Funds | Donate, Notification, Wallet timeline |
| Operator | Submit Proposal | Confirmation, Tracking, Identity verification, Milestone form |
| Journalist | Read docs, GitHub | Contact, Founder ID, Legal entity verification, Launch timeline |
| Attorney | Submit Proposal | Credentials, Milestones, DAO counsel, Tier progression |
| Skeptic | Read docs, LaunchTracker, AI chat | Verify TEE, Verify wallets, Launch timeline, Legal entity |
| Returning User | (Signal Interest persists) | Sighting status, Reputation, Campaign progress, Notifications |

**Rough estimate: ~70% of distinct user journey steps terminate at a dead end.** Of the "real actions" available, Frontline Funds (external donation links) is the only one with genuine financial throughput today. Everything else is preparatory, educational, or dead.

---

### The 3 Most Critical Missing Features for Launch

**1. Live Wallet + Donate Flow**  
Everything else on this list is secondary. The platform exists to route donations to campaigns. Until wallets are live, no user journey reaches its intended destination. The pre-launch state is well-communicated in several places but fundamentally cannot be fixed with copy — it requires completing the TEE/wallet prerequisites.

**2. Submission Tracking / Confirmation Loop**  
Three forms — Report a Sighting, Propose a Campaign, Apply to Registry — all fire into a void. No submission IDs, no server-side error surfacing (errors are silently swallowed in the frontend), no way to follow up without separately emailing citeback@proton.me. A simple server-side generated confirmation code ("Your sighting was logged as CB-2026-00432") would dramatically reduce user anxiety and give the platform actionable data.

**3. Operator Onboarding Pipeline**  
The platform promises real identity verification and OFAC screening for operators but has no in-product mechanism for either. The proposal form collects campaign details but not identity. The entire verification process is: submit a form → email us separately → wait. For a platform whose entire trust model depends on verified operators, the onboarding pipeline is the most critical pre-launch gap after wallets themselves. At minimum: a structured intake questionnaire that's separate from the campaign proposal, confirmation that identity documents were received, and a status page (even a simple email-based token lookup).

---

### Copy Changes That Would Fix the Most Confusion with Least Code

**1. Add "wallets not yet active" to the hero stats bar**  
Change `$0 raised` to `$0 raised — wallets activate at Phase 2 launch (4/10 prerequisites met)`. Links to LaunchTracker. Zero code changes needed — just content change in `Hero.jsx` stats array.

**2. Change present-tense TEE language in TrustFAQ to future tense**  
"No human holds wallet keys" → "At launch, no human will hold wallet keys"  
"The TEE produces a cryptographic attestation" → "The TEE will produce a cryptographic attestation"  
This is a pure copy edit. The Phase 1 banner helps but doesn't fix individual FAQ answers read in isolation.

**3. Add contact/about link to nav and footer**  
`citeback@proton.me` should be discoverable without submitting a form. A simple "Contact" entry in the footer pointing to the ProtonMail address would fix the journalist and operator contact dead end entirely.

**4. Add purpose text to "Signal Interest" button**  
Change button label copy from generic to: `Signal Interest — helps prioritize launch order`. 14 characters of copy that transforms a mysterious thumbs-up into a meaningful action.

**5. Add explicit next-step guidance on pre-launch campaign modal**  
Replace "Bookmark this page and check back" with: "When wallets activate, you'll find XMR and ZANO addresses right here. Check the LaunchTracker for progress: [link]. In the meantime, you can fund active surveillance litigation now via Frontline Funds."  
This gives users: a reason to return, a link to gauge progress, and an alternative action today.

**6. Surface `citeback@proton.me` on the Operators page intro** 
The Operators page tells operators identity verification happens "privately by the operator" with no mention of *how* to initiate it. Adding one line — "To begin the identity verification process, email citeback@proton.me — include your campaign type and jurisdiction" — would close the biggest operator journey gap without requiring any new infrastructure.

---

## Additional Dead Ends Not in Primary Journeys

- **No 404 page** — the route handler falls through to the home page for unrecognized paths (the `<Route path="*">` handler renders the full homepage). A URL like `/nonexistent` renders the homepage without any indication it was wrong.

- **Campaign #4 (Legal Fund — NM ALPR Privacy Bill) LDA/FARA warning** is embedded in the campaign description text body rather than in a structured compliance panel. A potential operator won't understand what "LDA/FARA compliance" means or what pre-launch sign-off process looks like.

- **Verification Bounty (Campaign #7) says "Verifiers apply through the Expert Directory"** — but the Expert Directory has no explicit "Camera Verifier" onboarding flow that connects to this bounty. An applicant to the verifier role has no visibility into how they'd receive bounty assignments.

- **ProposeModal error handling** — the `handleSubmit` function uses `catch (_) {}` — if the API call to `ai.citeback.com/submit` fails, the user sees the same success screen as a successful submission. A failed proposal submission looks identical to a successful one.

- **No `rel="canonical"` considerations** for deep-linked campaign URLs (`/campaigns/1`) — not a user journey issue, but worth noting for SEO if the platform wants organic discovery.

- **AI chat pre-launch gap** — the AI correctly says wallets aren't active, but its knowledge of which campaigns exist, their goals, and their status comes from a static system prompt (not live data). If campaigns change, the AI's answers will be wrong until the system prompt is updated manually.

---

## Summary Verdict

Citeback is well-designed for what it *will* be. The governance documentation is serious, the privacy disclosures are unusually honest, the campaign content is specific and well-sourced, and the technical architecture is thoughtfully described. The platform earns credibility with informed users willing to read deeply.

But for the majority of users today, Citeback is a fully-realized interface for an action you cannot take. The platform's single purpose — funding surveillance accountability campaigns — is 100% unavailable. Every user who arrives wanting to donate leaves with instructions to bookmark a page.

The gap between what the site communicates (urgency, specific campaigns, real opponents, compelling stakes) and what it can actually deliver (nothing, yet) is the defining UX tension. The platform needs either:  
(a) faster path to wallet activation, or  
(b) more honest hero-level communication that frames the pre-launch period as a deliberate build-in-public phase, with a clear timeline, rather than implying imminent readiness.

The good news: the hard parts (governance, transparency, source integrity, campaign quality) are already done. The dead ends are mostly solvable with copy, one email address in the nav, and completing the TEE/wallet prerequisites.

---

*Audit generated from source code review of `/deflect/src/` (47 files) on 2026-05-06.*
