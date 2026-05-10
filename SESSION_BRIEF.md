# Citeback — Next Session Brief
*Last updated: 2026-05-10 04:15 MDT (overnight blitz)*

## Current State
**Phase: Pre-launch. ~35 commits shipped tonight. Platform is feature-complete for beta.**
- citeback.com live on Netlify (auto-deploys from `citeback/citebackwebsite`)
- API on Hetzner VPS `root@77.42.124.157` — `/opt/citeback-ai/server.js`
- Health: `curl -s https://ai.citeback.com/health` → `{"ok":true,...}`
- 95,045 cameras. 3 users. 7 campaigns (deadlines extended 6 months).

## Tonight's Commits (35 total — read before re-auditing)

### Security
- `clientIp` undefined bug in change-password rate limiter — FIXED
- 9 endpoints with no rate limit — ALL ADDED
- `img-src https:` (too broad) → allowlisted CSP
- Interest counts: in-memory → SQLite (no longer wiped on restart)

### New Server Features
- `GET /api/campaigns/:id` — single campaign endpoint (deep links)
- `POST /account/forgot-username` — rate-limited, fire-and-forget
- `GET /admin/campaigns` + `PATCH /admin/campaigns/:id` — admin status/deadline/goal management
- `GET /admin/proposals` + `GET /admin/registry` — admin can now see all incoming submissions
- `/health` liveness endpoint
- Operator milestone email notifications (5/10/25/50/100 interest signals)

### Frontend
- 14 embedded `<style>` tags removed, `@keyframes` centralized
- CSS migration complete: CampaignCard, CampaignList, CampaignModal, ReputationPage, AdminPanel, ConversationalInterface
- CampaignCard: share URL fixed (was `/#id`, now `/campaigns/:id`), hover → CSS `:hover`
- CampaignModal: refresh uses `GET /api/campaigns/:id` (not all-campaigns)
- Hero: plain-English tagline above fold for new visitors
- SightingForm: collapsible "What you'll need" checklist + C2PA explanation
- Operators: 3-step operator onboarding visible at page top
- 404 page: proper branded component
- Mobile nav: closes on route change
- PWA manifest, theme-color, mobile-web-app-capable
- LaunchTracker: 7/13 complete
- Campaign deadlines: extended 6 months
- Camera count: 92,008 → 95,045 across AI prompt, fallback, CameraMap description, Transparency page

### Admin Panel (now has 5 tabs)
Sightings | Attorney Queue | Campaigns (with status dropdown) | Proposals | Registry

### SEO
- react-helmet-async per-route meta tags (all major pages)
- sitemap.xml, robots.txt, netlify.toml cache headers
- Structured data enriched

### Ops
- Daily backups already running (was already configured)
- Log rotation configured
- fail2ban active (47 SSH attack attempts handled)

## Priority Queue
1. **Wyoming DAO LLC** — wyomingbusiness.gov ($100). BLOCKS everything legal.
2. **ToS attorney review** — needs entity first
3. **`unsafe-inline` style-src** — ~1373 inline style props remain. CameraMap (168) is Leaflet noise. Governance+AccountModal CSS agents are running overnight.
4. **First operator onboarding** — test full claim→wallet→activate flow end-to-end
5. **CARTO map tiles** — last third-party IP exposure (documented in privacy policy)

## In-Flight Overnight Agents
- `citeback-governance-accountmodal-css` — converting Governance (95) + AccountModal (68) styles
- `citeback-sightingform-ftm-css` — converting SightingForm (74) + FollowTheMoney (53) styles
- Keepalive cron every 30min — will check + spawn new work

## VPS Quick Commands
```bash
# Status
ssh root@77.42.124.157 'systemctl is-active citeback-ai'
# Logs
ssh root@77.42.124.157 'journalctl -u citeback-ai -n 20 --no-pager'
# Deploy
scp deflect/server.js root@77.42.124.157:/opt/citeback-ai/server.js && ssh root@77.42.124.157 'systemctl restart citeback-ai'
```

## Don't Forget
- Read ATTACK_PROMPT.md for the master session-start prompt + full audit checklist
- Server.js on VPS is source of truth — always `scp` before editing
