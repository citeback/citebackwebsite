# Citeback — Next Session Brief
*Last updated: 2026-05-10 04:28 MDT (keepalive cron blitz)*

## Current State
**Phase: Pre-launch. ~55+ commits shipped tonight. Major CSS migration underway.**
- citeback.com live on Netlify (auto-deploys from `citeback/citebackwebsite`)
- API on Hetzner VPS `root@77.42.124.157` — `/opt/citeback-ai/server.js`
- Health: `curl -s https://ai.citeback.com/health` → `{"ok":true,...}`
- 95,045 cameras. 3 users. 7 campaigns.

## Tonight's Session Commits (selected highlights since last brief)

### Security Fixes
- **EXIF stripping**: GPS, camera model, timestamps stripped from uploaded JPEG photos before serving (privacy protection)
- **Magic bytes validation**: File uploads now validated against actual magic bytes, not just Content-Type header
- **claim-account 400**: Returns 400 on missing/invalid request body (was 500)
- **Reverse geocode**: Sighting GPS coords → human-readable address (Nominatim, non-blocking)
- **Tier-up emails**: Email notification when users reach Operator/Verifier/Guardian tier

### CSS Migration Progress (MAIN TRACK)
**Inline styles reduced: 1317 → ~480 (640 removed tonight)**
- Governance.jsx: 95→3 (dynamic color props only)
- AccountModal.jsx: 68→2 (strength bar dynamic)
- SurveillanceFeed.jsx: 74→8 (mostly dynamic)
- Operators.jsx: 70→5 (dynamic remaining)
- CampaignModal.jsx: 94→8 (dynamic remaining)
- HumanRegistry.jsx: 80→5 (dynamic remaining)
- TrustFAQ.jsx: 35→0
- TermsPage.jsx: 10→0
- PrivacyPolicy.jsx: 7→0
- Transparency.jsx: 35→0
- ProposeModal/ReauthModal/VerificationTiers/CryptoPrimer: converted
- SightingForm/FollowTheMoney: mostly converted
- Many small components: ALPRExplainer, BuildWithUs, Manifesto, LiveFeed, etc.

### Bug Fixes
- AdminPanel wallet display uses walletXMR/walletZANO (was wallet_address — always empty)
- CameraMap hardcoded API URLs → API_BASE
- ProposeModal uses API_BASE instead of hardcoded ai.citeback.com URL
- ATTACK_PROMPT.md: corrected endpoint paths (table is `users` not `accounts`)
- Hero: 4/10 prerequisites → 7/13 (accurate count)
- ReputationPage: added `<label>` elements for accessibility

### Dead Code Removed
- ARCameraOverlay component (WebXR/AR, 16 inline styles, never used)
- CameraGlobe component (41 inline styles, Three.js WebGL, never used)

## Priority Queue
1. **Wyoming DAO LLC** — wyomingbusiness.gov ($100). BLOCKS everything legal.
2. **ToS attorney review** — needs entity first
3. **Remove `unsafe-inline` from style-src CSP** — ~480 inline styles remain (was 1317). Need to finish CSS migration.

## Remaining Inline Style Work (as of this brief)
**CameraMap (168)** — Leaflet noise, skip permanently (document this in ATTACK_PROMPT.md)

Remaining that need CSS conversion:
- SurveillanceExplainer: 42 → agent running (svex-css-apply), CSS classes exist in App.css
- ReputationPage: 38 (dynamic — strength bar, status icons)
- SightingForm: 46 (mix of static + dynamic)
- FollowTheMoney: 25 (mix — vendor colors are dynamic)
- HowItWorks: 20 (needs CSS classes created)
- LaunchTracker: 15 (mix)
- GuaranteeSection: 13
- AdminPanel: 13
- ClaimAccountPage: 10
- ThemePicker: 9 (dead code? unused in App.jsx — may remove)
- SurveillanceFeed: 8 (dynamic remaining)
- ResetPasswordPage: 8
- CampaignModal: 8 (dynamic remaining)
- CryptoPrimer: 6
- CampaignList: 6

## In-Flight Agents
- `citeback-campaignmodal-humanregistry-css` — may still be running, check before spawning new work on those files
- `citeback-svex-css-apply` — applying .svex-* classes to SurveillanceExplainer.jsx

## VPS Quick Commands
```bash
# Status
ssh root@77.42.124.157 'systemctl is-active citeback-ai'
# Logs
ssh root@77.42.124.157 'journalctl -u citeback-ai -n 20 --no-pager'
# Deploy
scp deflect/server.js root@77.42.124.157:/opt/citeback-ai/server.js && ssh root@77.42.124.157 'systemctl restart citeback-ai'
# DB
ssh root@77.42.124.157 'sqlite3 /opt/citeback-ai/data/citeback.db "PRAGMA integrity_check; SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM campaigns;"'
```

## Don't Forget
- Read ATTACK_PROMPT.md for the master session-start prompt + full audit checklist
- Server.js on VPS is source of truth — always `scp` before editing
- CameraMap.jsx Leaflet styles (168): PERMANENTLY SKIP — Leaflet injects these inline, can't be CSS classes
- ICANN domain verification deadline: May 14, 2026 (check docs/23d70d3 commit)
