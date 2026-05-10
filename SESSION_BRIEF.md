# Citeback — Next Session Brief
*Last updated: 2026-05-10 04:50 MDT (overnight blitz — 60+ commits)*

## ⚠️ URGENT: ICANN domain verification — May 14, 2026
Check citeback@proton.me OR scotthughes070@proton.me for ICANN verification email.

## Current State
**Phase: Pre-launch. Platform hardened, CSS migration 80% complete, functionally solid.**
- Live: citeback.com (Netlify) + ai.citeback.com (Hetzner VPS)
- Health: `curl -s https://ai.citeback.com/health` → `{"ok":true,...}`
- 95,045 cameras. 3 users. 7 campaigns (deadlines Dec 2026–Jan 2027).

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
4. **First real operator E2E test** — claim → wallet → activate

## What's Done (don't re-audit)

### Security (all shipped)
- Rate limit bypass fixed (clientIp → ip in change-password)
- 9 unprotected endpoints rate-limited
- CSP img-src tightened, interest counts → SQLite
- Magic bytes validation on file uploads
- EXIF stripping from served photos

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

### Frontend
- CSS migration: 1585 → 317 inline styles (80% reduction)
- 15/41 components now have 0 inline styles
- React ErrorBoundary on CameraMap + AI chat
- AI chat campaign goals fixed (were wrong)
- LiveFeed camera count fixed (92,848 → 95,045)
- Transparency live camera count from API
- Dead code removed: CameraGlobe.jsx, ARCameraOverlay.jsx
- PWA manifest, theme-color, mobile-web-app-capable
- SEO: react-helmet-async per-route, sitemap.xml, robots.txt
- AdminPanel: 5 tabs (Sightings | Attorneys | Campaigns | Proposals | Registry)
- All hardcoded API URLs → API_BASE config
- LaunchTracker: 7/13 done

### UX/Content
- Hero plain-English tagline above fold
- SightingForm checklist ("What you'll need")
- Operators 3-step path at top
- HumanRegistry "What happens next" after attorney apply
- 404 page, mobile nav closes on route change
- Campaign deadlines extended 6 months

## VPS Commands
```bash
ssh root@77.42.124.157 'systemctl is-active citeback-ai'
ssh root@77.42.124.157 'journalctl -u citeback-ai -n 20 --no-pager'
scp deflect/server.js root@77.42.124.157:/opt/citeback-ai/server.js
ssh root@77.42.124.157 'systemctl restart citeback-ai'
```

## See Also
- ATTACK_PROMPT.md — master session checklist and grep patterns
