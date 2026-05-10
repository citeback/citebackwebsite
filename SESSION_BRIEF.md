# Citeback — Next Session Brief
*Last updated: 2026-05-10 04:30 MDT (overnight blitz — session end)*

## Current State
**Phase: Pre-launch. ~50+ commits shipped tonight. Platform is production-ready minus legal entity.**
- citeback.com live on Netlify (auto-deploys from `citeback/citebackwebsite`)
- VPS `root@77.42.124.157` — health: `curl -s https://ai.citeback.com/health`
- 95,045 cameras. 3 users. 7 campaigns (deadlines extended 6 months).

## ⚠️ URGENT: ICANN domain verification — May 14, 2026
Check citeback@proton.me OR scotthughes070@proton.me for verification email.
citeback.com/.net/.org at risk if not verified by May 14.

## Priority Queue
1. **Wyoming DAO LLC** — wyomingbusiness.gov ($100). Blocks everything legal.
2. **ICANN verification** — May 14 deadline (see above)
3. **Transparency.jsx CSS** — rewrite ready but blocked by session end. Apply first.
4. **First real operator E2E test** — claim → wallet → activate

## What Was Done This Session (don't re-audit)

### Security
- `clientIp` undefined bug in change-password — FIXED
- 9 unprotected endpoints rate-limited
- `img-src https:` → allowlisted CSP
- Interest counts: in-memory → SQLite

### New Server Endpoints
- `GET /api/campaigns/:id` — single campaign
- `POST /account/forgot-username` — fire-and-forget
- `GET /admin/campaigns` + `PATCH /admin/campaigns/:id`
- `GET /admin/proposals` + `GET /admin/registry`
- `/health` liveness endpoint
- Operator milestone emails (5/10/25/50/100 interest signals)
- Tier-up emails (Tier 0→1, 1→2, 2→3)
- Reverse geocode GPS coords on sighting submission
- Admin campaign status management (5 campaign statuses)

### Frontend
- Hero plain-English tagline above fold
- SightingForm "What you'll need" checklist
- Operators 3-step path visible at top
- 404 page, mobile nav closes on route change
- PWA manifest + theme-color
- LaunchTracker: 7/13 done
- Campaign deadlines extended 6 months
- Camera count 92,008 → 95,045+ everywhere
- CampaignCard share URL fixed (was `/#id`)
- CampaignModal refresh uses single-campaign endpoint
- AdminPanel: 5 tabs (Sightings | Attorneys | Campaigns | Proposals | Registry)
- Admin wallet display fixed (was always showing —)
- CampaignSelector, ALPRExplainer, Manifesto, BuildWithUs, LiveFeed, FrontlineFunds CSS
- ThemePicker: reverted from floating button (correct — belongs in settings panel)
- Dead code removed: CameraGlobe.jsx, ARCameraOverlay.jsx (both unused)
- ProposeModal uses API_BASE not hardcoded URL
- CameraMap 5 hardcoded API URLs → API_BASE

### CSS Migration (major components done)
CampaignCard, CampaignList, CampaignModal (.cm-*), ReputationPage (.rp-*), AdminPanel (.ap-*),
ConversationalInterface, SightingForm (.sf-*), FollowTheMoney (.ftm-*), Governance (.gov-*),
AccountModal (.am-*), SurveillanceFeed (.sf2-*), Operators (.ops-*), ProposeModal (.pm-*),
ReauthModal (.rm-*), VerificationTiers (.vt-*), CryptoPrimer (.cp-*), Hero, Footer, Nav,
StatsSection, ScrollProgress, BuildWithUs, LiveFeed, FrontlineFunds, CampaignSelector

### Remaining CSS (next session / cron agents)
- Transparency.jsx (~35 static styles) — FIRST PRIORITY
- CameraMap.jsx (~168 — Leaflet dynamic, partially irreducible)
- LaunchTracker.jsx (~15 small statics)

### SEO
- react-helmet-async per-route meta on all major pages
- sitemap.xml, robots.txt, netlify.toml cache headers
- Structured data enriched, PWA manifest

### Ops
- VPS: 8% disk, 863MB/15GB RAM, 0 fail2ban bans active
- Backups: daily at 2AM (`/usr/local/bin/citeback-backup.sh`)
- Log rotation: configured

## Next Session Start
```bash
# Pull latest server.js from VPS (source of truth)
scp root@77.42.124.157:/opt/citeback-ai/server.js /workspace/deflect/server.js

# Check git log
cd /workspace/deflect && git log --oneline -5 && git status

# First task: Transparency.jsx CSS conversion
# See ATTACK_PROMPT.md for full session checklist
```

## VPS Quick Commands
```bash
ssh root@77.42.124.157 'systemctl is-active citeback-ai'
ssh root@77.42.124.157 'journalctl -u citeback-ai -n 10 --no-pager'
scp deflect/server.js root@77.42.124.157:/opt/citeback-ai/server.js && ssh root@77.42.124.157 'systemctl restart citeback-ai'
```
