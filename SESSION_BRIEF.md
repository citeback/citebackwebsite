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
2. **ToS page** — draft at TERMS.md, attorney review needed before publishing
3. **`unsafe-inline` style-src** — requires refactoring React inline styles to CSS (big lift, defer)
4. **CARTO map tiles** — last third-party IP exposure, hard to proxy, noted in privacy policy
5. **Change-password UI** — shipped, but no "forgot username" flow if user has no email
6. **Attorney pipeline** — first attorney approval flow needs testing end-to-end

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
