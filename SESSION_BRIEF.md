# Citeback — Next Session Brief
*Last updated: 2026-05-10 (overnight hardening session)*

## Current State
**Phase: Pre-launch. Platform is live, no active campaigns yet.**
- citeback.com live on Netlify (auto-deploys from `citeback/citebackwebsite`)
- API on Hetzner VPS `root@77.42.124.157` — `/opt/citeback-ai/server.js`
- Restart: `systemctl restart citeback-ai`
- SQLite DB: `/opt/citeback-ai/data/citeback.db`

## What's Done (don't re-audit these)
- Passkeys: full WebAuthn, SQLite challenges, userVerification=required ✓
- Auth: SameSite=Strict, timing-safe login, logout-all, change-password ✓
- Privacy: all 5 external APIs proxied, fonts self-hosted, CSP tight ✓
- Security: pre-auth rate limits, AI topic filter NFKC+history scan, disk quota ✓
- VPS: fail2ban active, SSH password auth off, auto-updates, daily backups ✓
- Repo: README, LICENSE, CONTRIBUTING, issue templates, audit docs in docs/internal/ ✓

## Next Session To-Do (priority order)
1. **Wyoming DAO LLC** — Scott must file at wyomingbusiness.gov ($100). Remind him. Blocks everything.
2. **ToS page** — Live at /terms with draft disclaimer, proper last-updated date, ToS link in AccountModal. Attorney review still needed before removing DRAFT banners.
3. **`unsafe-inline` style-src** — Phase 1 done (2026-05-09):
   - ✅ All 14 embedded `<style>` tags stripped → all CSS in App.css
   - ✅ All @keyframes centralized, `.spinning` class added (16 fixes)
   - ✅ Key components converted: App shell, Footer, Nav, Hero, Stats, ScrollProgress
   - ❌ 1585 `style={{}}` props remain in large components (dynamic values)
   - ❌ `unsafe-inline` stays until all inline props removed
   - Next: CampaignModal, ReputationPage, CameraMap (biggest offenders)
4. **CARTO map tiles** — last third-party IP exposure, hard to proxy, noted in privacy policy
5. **Forgot username flow** — no recovery path if user has no email and forgets username
6. **Attorney pipeline** — FIXED: email column bug resolved, credentials:include fixed. Pipeline confirmed working.
7. **404 page** — proper NotFound component now in place (was rendering homepage on *)
8. **Nav mobile close** — fixed: closes on route change via useLocation effect

## Key File Paths
- Frontend: `/Users/scotthughes/.openclaw/workspace/deflect/`
- Server (local copy): `/Users/scotthughes/.openclaw/workspace/deflect/server.js`
- Deploy: `git push origin main` from deflect/ → auto-deploys in ~60s
- Netlify site ID: `43504ab6-a435-4f85-a691-8139e5f870d7` (heroic-yeot-51eaeb)
- Netlify account ID: `69f263b00f005defc9b6e04c`

## Don't Forget
- Server.js on VPS is the source of truth — always `scp` before editing
- `checkPkRegRateLimit`, `checkAuthRateLimit`, `checkPkAuthRateLimit` are separate functions
- MEMORY.md has full history — this brief is the fast path for focused work
