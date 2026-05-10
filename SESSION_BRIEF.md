# Citeback — Next Session Brief
*Last updated: 2026-05-10 (overnight blitz session)*

## Current State
**Phase: Pre-launch. Security hardened. UX significantly improved.**
- citeback.com live on Netlify (auto-deploys from `citeback/citebackwebsite`)
- API on Hetzner VPS `root@77.42.124.157` — `/opt/citeback-ai/server.js`
- Restart: `systemctl restart citeback-ai`
- SQLite DB: `/opt/citeback-ai/data/citeback.db`
- Health check: `curl -s https://ai.citeback.com/health`

## What Was Done Overnight (2026-05-09 → 05-10)

### Security (all shipped)
- `clientIp` undefined bug in change-password rate limiter — FIXED
- 9 endpoints had no rate limit — ALL ADDED (`/submit`, `/registry`, `/feedback`, `/stats`, `/api/campaigns`, `/account/me`, `/account/sightings`, `/account/email`, `/account/attorney-info`)
- `img-src https:` CSP (too broad) → allowlisted CARTO, OSM, Citeback only
- Admin logout using raw header → `getClientIp()` helper
- Attorney review audit log using raw header → `ip` var
- WAL checkpoint hourly added
- `/health` liveness endpoint added

### New Server Features
- `GET /api/campaigns/:id` — single campaign (deep links no longer load all campaigns)
- `POST /account/forgot-username` — rate-limited 3/hr, fire-and-forget, never leaks email existence
- `GET /admin/campaigns` — admin campaign list with full detail
- `PATCH /admin/campaigns/:id` — admin can update status/deadline/goal with audit log

### Frontend (all shipped & deployed)
- LazyFallback, AI chat button → CSS classes
- 14 embedded `<style>` tags removed, all `@keyframes` centralized
- Footer, Nav, StatsSection, ScrollProgress, Hero → CSS classes
- CampaignCard: JS hover handlers → CSS `:hover`, data-status attributes, share URL fixed (`/#id` → `/campaigns/:id`)
- CampaignList: full CSS rewrite, fetch error state, smart empty state
- CampaignModal: refresh uses `GET /api/campaigns/:id` instead of loading all
- 404 page: proper branded component (was showing home)
- Mobile nav closes on route change
- Hero: plain-English tagline above fold for new visitors
- SightingForm: collapsible "What you'll need" checklist + C2PA explanation
- HumanRegistry: attorney success state shows 4-step "what happens next"
- Operators: 3-step onboarding process visible at top of page
- ToS: draft disclaimer banner, semantic date, wired into AccountModal
- AccountModal: forgot-username flow (tab + form + API call)
- LaunchTracker: 7/13 done (account system, attorney pipeline, security audit marked ✅)
- Campaign deadlines: extended 6 months across all 7 campaigns

### SEO
- react-helmet-async per-route meta tags (all major pages)
- sitemap.xml (12 URLs), robots.txt (disallows admin/auth paths)
- netlify.toml cache headers for sitemap/robots
- Structured data in index.html enriched

### Ops
- VPS healthy: 8% disk, 863MB/15GB RAM, 0 fail2ban bans active
- Daily backup: already running (`/usr/local/bin/citeback-backup.sh`, 2AM cron)
- Log rotation configured

## Next Session To-Do (priority order)
1. **Wyoming DAO LLC** — Scott must file at wyomingbusiness.gov ($100). Blocks everything legal.
2. **ToS attorney review** — needs entity first
3. **`unsafe-inline` style-src** — 1585 inline style props remain; CampaignModal (~100) and AdminPanel (~80) are being migrated by overnight agents
4. **CARTO map tiles** — last third-party IP exposure, documented in privacy policy
5. **First operator onboarding** — test the full claim → wallet → activate flow end-to-end
6. **Campaign status management in AdminPanel** — admin campaign PATCH endpoint is built, UI agent is adding it

## Key File Paths
- Frontend: `/Users/scotthughes/.openclaw/workspace/deflect/`
- Server (local copy): `/Users/scotthughes/.openclaw/workspace/deflect/server.js`
- Deploy: `git push origin main` from deflect/ → auto-deploys in ~60s
- Admin campaign API: `PATCH https://ai.citeback.com/admin/campaigns/:id` with `{status, deadline, goal}`

## Active Overnight Agents (may still be running)
- `citeback-campaignmodal-css` — converting CampaignModal 120 inline styles to CSS
- `citeback-reputationpage-css` — converting ReputationPage 80 inline styles to CSS  
- `citeback-adminpanel` — AdminPanel CSS + campaign status management UI

## Don't Forget
- Server.js on VPS is source of truth — always `scp` before editing
- Keepalive cron fires every 30 min to check agent status and spawn new work
- MEMORY.md has full history — this brief is the fast path for focused work
- ATTACK_PROMPT.md has the master session-start prompt and full audit checklist
