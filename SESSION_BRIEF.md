# Citeback — Next Session Brief
*Last updated: 2026-05-10 06:00 MDT (overnight blitz round 2 — COMPLETE)*

## ⚠️ URGENT: ICANN domain verification — May 14, 2026
Check citeback@proton.me OR scotthughes070@proton.me for ICANN verification email.

## Current State
**Phase: Pre-launch. Platform hardened, CSS migration 99% complete, functionally solid.**
- Live: citeback.com (Netlify) + ai.citeback.com (Hetzner VPS)
- Health: `curl -s https://ai.citeback.com/health` → `{"ok":true,...}`
- 95,045 cameras. 3 users. 7 campaigns (deadlines Dec 2026–Jan 2027).
- **Inline styles: 20 remaining** (from 1,585 original — 99% reduced)

## Quick Start
```bash
# Pull latest server.js (VPS is source of truth)
scp root@77.42.124.157:/opt/citeback-ai/server.js /workspace/deflect/server.js
cd /workspace/deflect && git pull && git log --oneline -5
```

## Priority Queue
1. **Wyoming DAO LLC** — wyomingbusiness.gov ($100). Blocks everything legal.
2. **ICANN domain verification** — May 14 deadline
3. **ToS attorney review** — needs entity first
4. **Remove `unsafe-inline` from CSP** — path: use `useEffect + element.style.setProperty()` instead of `style={{ '--prop': val }}` JSX (see ATTACK_PROMPT Known Issues)
5. **First real operator E2E test** — claim → wallet → activate

## Remaining 20 Inline Styles (by category)
- **6× CSS custom property setters** — `--svex-color`, `--vc`, `--faq-color`, `--cc`, `--tag-color`, `--tc/--tc2/--w` — can be converted to `useEffect + style.setProperty()` to remove unsafe-inline
- **5× Dynamic progress bar widths** — `pct%` in CampaignCard, LaunchTracker, ProposeModal, ScrollProgress, CampaignModal — genuinely dynamic, use CSS animation or accept limitation
- **9× CameraMap** — 8 layer.color/tier.color dynamic data + 1 MapContainer (Leaflet-required, permanent)

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
