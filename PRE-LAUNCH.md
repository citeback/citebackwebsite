# PRE-LAUNCH.md — Citeback

Things that must be resolved before citeback.com goes fully live.
Last updated: 2026-05-04

---

## 🔴 Must Fix Before Launch

### 1. Wyoming DAO LLC — Incorporate
- Formation is the #1 hard prerequisite
- Until then, founder is the sole operator
- LaunchTracker reflects this as unchecked

### 2. TEE Wallets — Deploy
- No wallet addresses published until TEE is live (Phala or Marlin)
- Programmatic XMR + ZANO wallets via RPC
- Zero funds accepted until this is done

### 3. Attorney Review
- ATTORNEY-BRIEF.md has 12 open questions
- Key gaps: FARA/LDA exposure (Campaign #4 legislative advocacy), §230 posture, operator tax obligations, insurance spec
- Do not accept operator signups until counsel signs off

### 4. ToS Page
- Referenced in governance docs but doesn't exist on the site
- Needs to be linked from Footer before launch
- Red-team flagged its absence as a credibility gap

---

## 🟠 Verify Before Launch

### 5. Cambridge MA ALPR Timeline
- ALPRExplainer says "terminated in 2023"
- ActivityTicker says "Dec 2025" — source URL returns 404
- Are these two separate events? Verify and fix the dead link
- File: `src/components/ActivityTicker.jsx`

### 6. ShotSpotter "40,000 times in a single year"
- Source data may cover 21 months, not one year
- Change to "over 21 months" or "over nearly two years" if confirmed
- File: `src/components/ALPRExplainer.jsx` or `SurveillanceExplainer.jsx`

### 7. Washington State ALPR/Border Patrol Sharing
- ActivityTicker source link returns 403 — needs working permalink
- Underlying ACLU-WA reporting is plausible but link must be live before launch
- File: `src/components/ActivityTicker.jsx`

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

### 10. OG Image
- Current: auto-generated editorial card ✅
- Optional: a more branded/visual version with the Citeback logo
- Current version is good enough for launch

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
- TEE claims: "at launch" framing everywhere ✅
- Fee schedule boundary fixed ($10k ambiguity resolved) ✅
- WCAG AA contrast compliance ✅
- Focus traps on all modals ✅
- Mobile responsive on iPhone (390px) ✅
- No Fourthright references anywhere ✅
