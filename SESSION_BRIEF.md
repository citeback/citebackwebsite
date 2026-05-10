# Citeback — Session Brief
*Last updated: 2026-05-10 10:20 MDT*

## ⚠️ URGENT: ICANN domain verification — May 14, 2026
Check citeback@proton.me OR scotthughes070@proton.me for ICANN verification email.
Must verify citeback.com/.net/.org before May 14 or domain risks suspension.

## Current Site State
**Live:** citeback.com (Netlify, auto-deploys from GitHub `citeback/citebackwebsite`)
**Local:** `/Users/scotthughes/.openclaw/workspace/deflect/`
**VPS:** 77.42.124.157 (Hetzner CPX42, AI proxy at ai.citeback.com)
**Status:** Site working, COLD dark theme, full CSS. Audit score ~9.8/10. Visual QA pass still needed from Scott.
**Last keepalive (2026-05-10 11:18 MDT):** /account/logout + logout-all rate limits added; scrollbar colors normalized to #333 site-wide; full audit passed clean — 0 inline styles, 0 SQL injection, all endpoints rate-limited, all a11y labels present, CSP no unsafe-inline.

## What Broke This Morning (2026-05-10) + What Was Fixed

### Root Cause
The overnight session (05-09 21:35–05-10 04:30) migrated ALL 1,585 inline styles to CSS classes in `App.css`. But `App.css` was **never imported** into the build. Result: 9,134 lines of component CSS were silently ignored — site rendered as naked HTML.

### Fixes Shipped (commits in order)
1. `6df7600` — `import './App.css'` added to App.jsx (was never there)
2. `42874d3` — Default theme COLD (dark), localStorage persistence restored (was hardcoded PRESS light with no persistence)
3. `f5e28b9` — `.nav-desktop { display:flex }` restored — primary nav links were invisible
4. `fcc5859` — Red hero tagline banner removed; Fund a Campaign → red; scrollbars → dark
5. `60cac6b` — Log In + Join → identical ghost button style

### Comprehensive CSS Audit Result
Autonomous audit of all 43 components confirmed: nav, hero, campaigns, cards, modals, admin, sighting form — all structurally intact. Only 2 minor gaps found (campaign filter buttons + HumanRegistry role buttons) — both already correct in App.css.

### Still Possibly Off (Scott hasn't done full QA yet)
- Cosmetic details Scott will find on scroll-through
- Fix in batches from screenshots — don't do one-at-a-time

## Priority Queue
1. **Wyoming DAO LLC** — wyomingbusiness.gov ($100). Blocks everything legal.
2. **ICANN domain verification** — May 14 deadline (citeback@proton.me)
3. **Visual QA pass** — Scott will screenshot anything still off
4. **ToS attorney review** — needs entity first
5. **First real operator E2E test**
6. **Discord community** — footer link still missing

## Key Commands
```bash
# Local dev
cd /Users/scotthughes/.openclaw/workspace/deflect && npm run dev -- --port 3002

# Build
cd /Users/scotthughes/.openclaw/workspace/deflect && npm run build

# Deploy (Netlify auto-deploys from GitHub push — just push to main)
git add -A && git commit -m "..." && git push origin main

# VPS
ssh root@77.42.124.157
systemctl status citeback-ai
journalctl -u citeback-ai -n 30 --no-pager
```

## What's Solid (Don't Re-Audit)
- **Security:** Rate limits on all endpoints (incl. logout + logout-all added 2026-05-10 keepalive 7), CSP hardened (unsafe-inline removed), passkeys, bcrypt, JWT, timing-safe login, AES-256-GCM encrypted recovery emails, admin IP-bound sessions, fail2ban on VPS, SSH password auth disabled
- **SSRF:** AI proxy hardcoded to 127.0.0.1:11435; CA Bar lookup locked to apps.calbar.ca.gov only; body size 20KB JSON / 12MB photo
- **ZIP uploads:** AdmZip.readFile() (not extractEntryTo) — path traversal protected
- **AI proxy:** Queue max 5, injection scan across ALL messages (multi-turn bypass prevention), 4000 char message cap
- **CSS Migration:** 0 inline styles remaining — all in App.css (now imported)
- **Accessibility:** All form inputs have labels/aria-labels (CampaignList sort, CameraMap state, AdminPanel inputs — fixed 2026-05-10)
- **Server features:** All campaigns/proposals/registry admin endpoints, single-campaign API, forgot-username, health endpoint, tier-up + milestone emails, reverse geocode on sightings
- **VPS hardening:** Auto security updates, sysctl, daily backups, WAL checkpoint, graceful shutdown
- **Audit score: ~9.7/10** (reports in `docs/internal/`)

## Scott's Preferences (CSS/Design)
- Default theme: **COLD** (dark, stark)
- Fund a Campaign button: **red** (var(--accent))
- Log In / Join: **identical ghost buttons** (same style)
- Scrollbars: **dark** (#333), NOT red
- No red quote banners in hero
- localStorage persists theme choice

## Site Architecture
- React + Vite SPA → Netlify (static)
- Node.js/Express server.js → Hetzner VPS (AI proxy only — NOT deployed to Netlify)
- SQLite DB on VPS
- GitHub: `citeback/citebackwebsite` → auto-deploys to `heroic-yeot-51eaeb` (citeback@proton.me Netlify account)
- AI: Ollama qwen2.5:7b on VPS, proxied through Node at localhost:11435, Caddy → ai.citeback.com
