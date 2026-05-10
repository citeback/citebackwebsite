# Citeback — Next Session Brief
*Last updated: 2026-05-10 04:25 MDT (overnight keepalive — ConversationalInterface CSS migration + a11y)*

## ⚠️ URGENT: ICANN domain verification — May 14, 2026
Check citeback@proton.me OR scotthughes070@proton.me for ICANN verification email.

## Current State
**Phase: Pre-launch. Platform security hardened. Rate limits on ALL endpoints. CSS migration 100% COMPLETE. CSP unsafe-inline REMOVED. Zero style={} in entire codebase. Passkey endpoints fully hardened.**
- Live: citeback.com (Netlify) + ai.citeback.com (Hetzner VPS)
- Health: `curl -s https://ai.citeback.com/health` → `{"ok":true,...}`
- 95,045 cameras. 3 users. 7 campaigns (deadlines Dec 2026–Jan 2027).
- **Inline styles: 0 remaining** (from 1,585 original — 100% reduction)
- **CSP: `unsafe-inline` REMOVED from style-src** — fully hardened CSP

## Quick Start
```bash
# Pull latest server.js (VPS is source of truth)
scp root@77.42.124.157:/opt/citeback-ai/server.js /workspace/deflect/server.js
cd /workspace/deflect && git pull && git log --oneline -5
```

## What Changed This Session (1:48–2:00 AM MDT)
- passkey DELETE: URIError crash fixed (decodeURIComponent without try/catch)
- Rate limits added to: passkey/list, passkey/delete, passkey/register-verify, GET /photos/
- Caddy serves /photos/* directly (performance optimization) — documented as defense-in-depth
- Full audit checklist run: 0 inline styles, 0 SQL injection, 0 stack traces, 0 old brand names

## What Changed (3:00–3:10 AM MDT — keepalive)
- 43 server responses missing `Content-Type: application/json` → all fixed (grep audit caught bare `writeHead(NNN);` calls)
- 2 missing `aria-label` attributes → CampaignList search + CameraMap sighting notes inputs
- Full audit checklist rerun: all ✅
- Attorney pipeline E2E test confirmed: /attorney/apply → 401, /admin/attorney-applications → 401, /claim-account → 400 ✅
- VPS health: active, 3 users, 7 campaigns, 95045 cameras, disk 8% used

## What Changed (4:10–4:25 AM MDT — keepalive)
- **ConversationalInterface.jsx**: discovered 24 inline styles via `const styles={}` object (bypassed `style={{` grep). Migrated to new ConversationalInterface.css (3.35kB CSS chunk). **Zero `style={}` anywhere in entire codebase now.**
- **ReputationPage.jsx**: `New password` + `Confirm new password` inputs were missing `<label htmlFor>` + `id`. Fixed (current password already had a label).
- **ATTACK_PROMPT.md**: added `style={[a-zA-Z]` grep pattern to catch `style={varName}` pattern alongside existing `style={{` check
- Full audit rerun: 0 inline styles, 0 style={varName}, 0 SQL injection, 0 old brand, 0 stack traces in responses
- VPS healthy, build clean, pushed to git → Netlify auto-deploying

## Priority Queue
1. **Wyoming DAO LLC** — wyomingbusiness.gov ($100). Blocks everything legal.
2. **ICANN domain verification** — May 14 deadline
3. **ToS attorney review** — needs entity first
4. ~~**Remove `unsafe-inline` from CSP**~~ ✅ DONE — all 20 inline styles converted, CSP fully hardened
5. **First real operator E2E test** — claim → wallet → activate
6. **Attorney pipeline E2E test** — apply → admin approve → claim token → badge
7. **Discord community** — footer checklist: ToS ✅ Privacy ✅ GitHub ✅ Discord ❌ (needs Discord)

## Inline Styles: COMPLETE ✅
All 1,585 original inline styles migrated. **0 remaining.**
- 6× CSS custom property setters → `useRef+useEffect` / callback refs
- 5× progress bars → `ref.style.setProperty('--width', pct%)` + CSS `var(--width, 0%)`
- 8× CameraMap layer/tier → CSS `--lc` custom prop + `color-mix()` class-based states
- 1× MapContainer → `.cmap-leaflet-container { height:100%; width:100% }`

## What's Done (don't re-audit)

### Security (all shipped)
- Rate limit bypass fixed (clientIp → ip in change-password)
- 9 unprotected endpoints rate-limited
- CSP img-src tightened, interest counts → SQLite
- Magic bytes validation on file uploads
- EXIF stripping from served photos
- Admin sessions IP-bound, brute force lockout
- JWT: expiry enforced, alg:none blocked
- Passkey sign counts checked (replay protection)
- Timing-safe login (DUMMY_HASH for unknown usernames)
- AES-256-GCM encrypted recovery emails at rest
- DEFLECT → OFF_TOPIC variable rename in server.js (old brand cleanup)
- Content-Type added to all 429 responses
- Caddy `via` header removed (info disclosure)
- Admin audit log (all admin actions recorded to SQLite)

### Server Features
- GET/PATCH /admin/campaigns — status/deadline/goal management
- GET /admin/proposals + /admin/registry — full admin inbox
- GET /api/campaigns/:id — single campaign endpoint
- POST /account/forgot-username — fire-and-forget
- /health endpoint, WAL checkpoint hourly
- Operator milestone emails (5/10/25/50/100 interest signals)
- Tier-up emails (Tier 0→1, 1→2, 2→3)
- Reverse geocode on sighting GPS submissions
- OSM camera update cron (weekly Sunday 3AM)

### Frontend CSS Migration (tonight's main work)
Original: 1,585 inline styles → Final: 20 (99% reduction)

**Techniques used:**
1. Static CSS classes for fixed color sets (typeColors, tagColors, tier badges, status colors)
2. CSS custom properties (`--svex-color`, `--vc`, `--tc`, etc.) for dynamic colors
3. `color-mix()` for hex-alpha variants (browser support: Chrome 111+, Firefox 113+, Safari 16.2+)
4. Per-type CSS class selectors (`.hre-card--attorney`, `.rp-tc-0`, etc.)
5. Descendant selectors for inherited colors (`.bwu-card--legal .bwu-track-tag`)

**Components fully migrated (0 inline styles):**
AccountModal, AdminPanel, BuildWithUs, ClaimAccountPage, CampaignCard¹, CampaignModal¹, CryptoPrimer², FrontlineFunds, FollowTheMoney², Governance², HumanRegistry, LaunchTracker¹, Operators, ProposeModal¹, ResetPasswordPage, ScrollProgress¹, SightingForm, SurveillanceFeed, SurveillanceExplainer², TrustFAQ², VerificationTiers

¹ 1 progress bar width remaining (dynamic pct%)
² 1 CSS custom property remaining (intentional pattern)

**CameraMap.css created** — 609 lines, migrated 128/137 inline styles

### UX/Accessibility
- htmlFor/id linked on ClaimAccountPage, ResetPasswordPage inputs
- Strength meter (AccountModal, ClaimAccountPage, ResetPasswordPage) → CSS classes
- Governance participants → CSS classes (no more hardcoded colors)
- Attorney bar badge 3-state (found/not-found/pending) → CSS classes
- sitemap.xml: added missing /transparency route

## VPS Commands
```bash
ssh root@77.42.124.157 'systemctl is-active citeback-ai'
ssh root@77.42.124.157 'journalctl -u citeback-ai -n 20 --no-pager'
scp deflect/server.js root@77.42.124.157:/opt/citeback-ai/server.js
ssh root@77.42.124.157 'systemctl restart citeback-ai'
```

## See Also
- ATTACK_PROMPT.md — master session checklist and grep patterns
