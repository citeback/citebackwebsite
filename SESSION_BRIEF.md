# Citeback — Next Session Brief
*Last updated: 2026-05-10 04:36 MDT (keepalive cron — final update)*

## Current State
**Phase: Pre-launch. ~65+ commits shipped tonight. CSS migration 70% complete.**
- citeback.com live on Netlify (auto-deploys from `citeback/citebackwebsite`)
- API on Hetzner VPS `root@77.42.124.157` — `/opt/citeback-ai/server.js`
- Health: `curl -s https://ai.citeback.com/health` → `{"ok":true,...}`
- 95,045 cameras. 3 users. 7 campaigns. 7/13 launch prerequisites met.

## Tonight's Commit Highlights

### Security (server.js)
- **EXIF stripping**: `stripJpegExif()` — strips GPS, camera model, timestamps from uploaded JPEGs (preserves APP11/C2PA). Privacy fix.
- **Magic bytes validation**: `validateMagicBytes()` — validates uploads against actual file magic bytes, not just Content-Type header
- **claim-account 400**: Returns 400 on bad/missing request body (was 500)
- **Reverse geocode**: Sighting GPS → human-readable address (Nominatim, non-blocking)
- **Tier-up emails**: Email when users reach Operator/Verifier/Guardian tier
- **AdminPanel wallet fix**: walletXMR/walletZANO fields (was wallet_address — always empty)
- **API URL fixes**: CameraMap + ProposeModal hardcoded URLs → API_BASE

### CSS Migration Progress
**Inline styles: 1317 → 398 total (919 removed!) — 230 remain excl. CameraMap Leaflet noise**

Components fully converted (0 inline styles):
- Governance.jsx (95→3 dynamic), AccountModal.jsx (68→2 dynamic)
- TrustFAQ.jsx, TermsPage.jsx, PrivacyPolicy.jsx, Transparency.jsx
- HowItWorks.jsx, GuaranteeSection.jsx
- LaunchTracker.jsx (4 remain), ClaimAccountPage.jsx (6 remain)
- SurveillanceFeed.jsx (8 dynamic), Operators.jsx (5 dynamic)
- CampaignModal.jsx (8 dynamic), HumanRegistry.jsx (5 dynamic)
- Many others: ProposeModal, ReauthModal, VerificationTiers, CryptoPrimer, etc.

Dead code removed: ARCameraOverlay (16 styles), CameraGlobe (41 styles)

### UX Fixes  
- Hero: 4/10 → 7/13 prerequisites (accurate count now)
- ReputationPage: accessible `<label>` elements added for inputs
- ATTACK_PROMPT.md: corrected endpoint paths, updated known issues log

## Inline Styles Remaining (as of 04:36 MDT)
```
CameraMap.jsx:    168  ← PERMANENTLY SKIP (Leaflet, cannot be CSS)
SightingForm.jsx:  46  ← mostly dynamic (colors, status)
ReputationPage:    38  ← mostly dynamic (strength bar, status icons)
FollowTheMoney:    25  ← mix (vendor colors dynamic)
AdminPanel:        13  ← needs CSS conversion
ThemePicker:        9  ← unused component? check if dead code
SurveillanceFeed:   8  ← dynamic remaining
SurveillanceExplainer: 8 ← dynamic remaining
ResetPasswordPage:  8  ← dynamic strength bar
CampaignModal:      8  ← dynamic remaining
CryptoPrimer:       6
ClaimAccountPage:   6
CampaignList:       6
...and many 2-5 style components
TOTAL (non-Leaflet): 230
```

## Priority Queue
1. **Wyoming DAO LLC** — wyomingbusiness.gov ($100). BLOCKS everything legal.
2. **ToS attorney review** — needs entity first
3. **Remove `unsafe-inline` from CSP** — finish CSS migration (230 non-Leaflet styles remain)
4. **ICANN domain verification** — deadline May 14, 2026 (check PRE-LAUNCH.md commit 23d70d3)
5. **Attorney pipeline E2E test** — apply → admin approve → claim token → badge
6. **CARTO map tile privacy** — document or proxy

## Agents In-Flight
- `citeback-svex-css-apply` — may still be running, check before working on SurveillanceExplainer

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

## Notes For Next Session
- Read ATTACK_PROMPT.md for master audit checklist
- Server.js on VPS is source of truth — always `scp` before editing
- CameraMap.jsx Leaflet 168 styles: **permanently skip** — not fixable without replacing Leaflet
- Tonight's parallel agents were very active — always `git pull` before editing to get latest
- ThemePicker.jsx: assess if dead code (not mounted in App.jsx after revert commit a286d57)
