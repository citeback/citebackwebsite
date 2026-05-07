# PRE-LAUNCH.md — Citeback

Things that must be resolved before citeback.com goes fully live.
Last updated: 2026-05-05 (overnight planning session — expanded with new blockers)

---

## 🔴 Must Fix Before Launch (Hard Blockers)

### 1. Wyoming DAO LLC — Incorporate
- Formation is the #1 hard prerequisite
- Until then, founder is the sole operator
- LaunchTracker reflects this as unchecked

### 2. Direct Wallet Infrastructure — Ready
- Direct wallet model: operators post their own XMR/ZANO wallet addresses at campaign approval — no platform-held wallets required
- TEE approach was evaluated and scrapped in favor of the direct wallet model (see ARCHITECTURE.md §1)
- Pre-launch requirements: operator wallet submission form built, view key publication workflow tested, view key monitoring operational (anomaly detection for early drain events)
- Zero funds accepted until operator onboarding is tested end-to-end (see GOVERNANCE.md §14 handoff checklist)

### 3. Attorney Review
- ATTORNEY-BRIEF.md has 12 open questions
- Key gaps: FARA/LDA exposure (Campaign #4 legislative advocacy), §230 posture, operator tax obligations, insurance spec
- Do not accept operator signups until counsel signs off

### 4. ToS Page
- Draft now exists at `TOS_DRAFT.md` — needs attorney review before publication
- Needs to be linked from Footer before launch
- Red-team flagged its absence as a credibility gap
- Contains OFAC donor-side limitation disclosure (required)

### 5. ICANN Domain Verification — URGENT
- citeback@proton.me must verify citeback.com domain via ICANN verification email
- Verification required before **May 14, 2026** or domain risks suspension
- Check scotthughes070@proton.me for the ICANN verification email

### 6. All Docs — Fee Model + TEE References — ✅ FIXED 2026-05-07
- All fee references updated to reflect current model: **no platform fee**
- 100% of campaign funds go to operators; platform funded by founding operator capital contributions + voluntary tips
- All TEE references updated to reflect direct wallet model (TEE scrapped)
- Files updated: `ARCHITECTURE.md`, `GOVERNANCE.md` §7.3 & §11, `TOS_DRAFT.md` §7, `ATTORNEY-BRIEF.md`, `LAUNCH_PLAN.md`, `LAUNCH_TIMELINE.md`

---

## 🟠 Verify Before Launch (Soft Blockers)

### 5. Cambridge MA ALPR Timeline — ✅ FIXED 2026-05-07
- Updated ActivityTicker, LiveFeed, SurveillanceExplainer to reflect accurate story:
  - Real cause: Flock Safety installed 2 unauthorized cameras ("material breach of trust"), Dec 10 2025
  - Source: https://www.cambridgema.gov/news/2025/12/statementontheflocksafetyalprcontracttermination

### 6. ShotSpotter "40,000 times in a single year" — ✅ FIXED 2026-05-07
- SurveillanceExplainer updated: "21 months" (July 2019–April 2021) is accurate per MacArthur Justice Center
- Attribution corrected to "MacArthur Justice Center study" (not AP)

### 7. Washington State ALPR/Border Patrol Sharing — ✅ FIXED 2026-05-07
- Source updated to ACLU-WA article (Jan 2026):
  https://www.aclu-wa.org/news/its-time-to-regulate-flock-cameras-and-alprs-with-the-driver-privacy-act/
- Date corrected to "Jan 2026" (original reporting was Oct 2025 but definitive ACLU piece is Jan 2026)

---

## 🟡 Decisions Needed

### 8. "Campaign proposals open for community review" — LaunchTracker
- Currently labeled "published publicly (GitHub repo is public)"
- If a community voting interface is built before launch, update label
- If not, current label is honest as-is

### 9. Server-side API Proxying
- CourtListener, Congress.gov, Senate LDA, Overpass, Nominatim all receive visitor IPs from client-side calls
- Consider proxying through a Netlify serverless function to prevent IP leakage
- Low priority pre-launch, important for credibility post-launch

### 11. Campaign #4 — Separate Attorney Sign-Off Required
- Campaign #4 (NM ALPR Privacy Bill) is tagged in `campaigns.js` with an explicit ⚠️ requiring pre-launch attorney sign-off on LDA/FARA compliance
- GOVERNANCE.md §3.2 also requires legal review before legislative advocacy type goes live
- Launch FOIA campaigns (1, 5, 6) and billboard campaigns (2, 3) first
- Hold Campaign #4 and Campaign #7 (verify bounty — novel legal questions) until attorney clearance

### 12. Operator Accountability Protocol — 🟡 DRAFT READY (needs ratification)
- Draft complete: `OPERATOR-ACCOUNTABILITY.md` — 2026-05-07
- Covers: campaign rejection appeals, onboarding denial appeals, misconduct reports vs. platform entity
- SLAs defined: 72hr reason, 48hr response, Major-tier vote override path
- Anti-retaliation clause included
- **Scott must ratify as bootstrap governance act before first operator onboarding**
- Link from governance docs and citeback.com/operator-accountability before launch

### 13. Governance v1.0 Ratification — Not Yet Done
- GOVERNANCE.md §14 requires governance ratification as a launch prerequisite
- During bootstrapping: Scott's formal public sign-off + announcement that this is the launch-version spec
- Do this after attorney reviews governance doc and before wallets go live

### 14. Campaign Quality Advisory Board — Not Recruited
- GOVERNANCE.md Launch Prerequisites item 16 requires minimum 2 domain experts
- Need: civil liberties attorney + surveillance accountability practitioner
- Good outreach targets: EFF, ACLU NM, Surveillance Technology Oversight Project (S.T.O.P.)
- Start outreach early — recruitment takes time

### 10. OG Image
- Current: auto-generated editorial card ✅
- Optional: a more branded/visual version with the Citeback logo
- Current version is good enough for launch

### 16. Fiat Disbursement Pathway — Phase 2 Design
- GOVERNANCE.md §3.4 identifies this as the highest-priority operational gap
- Lawyers, billboard vendors, and filing fees are paid in fiat
- Anonymous crypto → fiat conversion without exposing campaign participants is unsolved
- Requires legal + operational design. Document as Phase 2 priority, not launch blocker.

### 17. Security Audit — Pre-Launch
- View key monitoring code and operator onboarding system should be independently reviewed before wallets go live
- Audit firm must be separate from any development contractor used
- Budget: $1,000–5,000 depending on scope (simpler than TEE audit; direct wallet model has much smaller attack surface)
- Schedule early — good firms have backlogs

---

## ✅ Already Done / No Action Needed

- Google Fonts → Bunny Fonts (no IP logging) ✅
- Security headers (CSP, X-Frame-Options, Referrer-Policy) ✅
- Source maps disabled in production ✅
- .env never committed to git ✅
- "No trail." removed — replaced with precise privacy language ✅
- Contact fields removed from Propose + Expert Directory forms ✅
- All surveillance claims fact-checked and sourced ✅
- Vendor contract amounts verified ✅
- Wyoming DAO LLC framing: future tense everywhere ✅
- Fee schedule boundary fixed ($10k ambiguity resolved) ✅
- WCAG AA contrast compliance ✅
- Focus traps on all modals ✅
- Mobile responsive on iPhone (390px) ✅
- No outdated branding references ✅
- robots.txt published ✅
- sitemap.xml published ✅
- FrontlineFunds component exists ✅
- TOS_DRAFT.md created (awaiting attorney review) ✅
- LAUNCH_PLAN.md created ✅
- LAUNCH_TIMELINE.md created ✅
- Photo upload for sightings — fully built (C2PA gate, EXIF GPS, Proofmode ZIP support, +1/+2 pts reputation) ✅
- Photo serving endpoint (`GET /photos/:filename`) added to server-hetzner.js ✅
- Reputation system live (tiers 0–3, points, events log) ✅
