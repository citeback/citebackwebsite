# CITEBACK ATTACK PROMPT
*The definitive session-start prompt for maximally fast, accurate, efficient Citeback work.*
*Last updated: 2026-05-10 (12:29 MDT keepalive 8)*

---

## HOW TO USE THIS PROMPT

Paste this entire prompt (or a section) at the start of any session focused on Citeback.
It front-loads all the context needed to immediately start executing, with zero warm-up.

---

## QUICK START (copy-paste to begin a session)

```
Pick up on Citeback. Read deflect/SESSION_BRIEF.md first, then:
1. Pull latest server.js from VPS: scp root@77.42.124.157:/opt/citeback-ai/server.js /workspace/deflect/server.js
2. Check git status: cd /workspace/deflect && git log --oneline -5 && git status
3. Run the priority queue from SESSION_BRIEF.md top-to-bottom
4. Spawn subagents for parallel tracks when tasks are independent
5. When done: update SESSION_BRIEF.md with new state + commit all changes
```

---

## FULL CONTEXT

### Infrastructure
| Thing | Value |
|---|---|
| Frontend | Netlify, auto-deploys from `citeback/citebackwebsite` GitHub push |
| Server | Hetzner VPS `root@77.42.124.157` |
| Server file | `/opt/citeback-ai/server.js` |
| SSH key | `~/.ssh/id_ed25519` |
| DB | `/opt/citeback-ai/data/citeback.db` (SQLite) |
| Restart | `ssh root@77.42.124.157 'systemctl restart citeback-ai'` |
| Logs | `ssh root@77.42.124.157 'journalctl -u citeback-ai -n 50'` |
| AI endpoint | `https://ai.citeback.com` |
| Live site | `https://citeback.com` |
| Netlify site ID | `heroic-yeot-51eaeb` / `43504ab6-a435-4f85-a691-8139e5f870d7` |
| Local frontend | `/Users/scotthughes/.openclaw/workspace/deflect/` |

### Deploy Workflow
```bash
# Frontend: just push to git
cd /workspace/deflect && git add -A && git commit -m "fix: ..." && git push origin main
# Wait ~60s for Netlify auto-deploy

# Server: scp + restart
scp /workspace/deflect/server.js root@77.42.124.157:/opt/citeback-ai/server.js
ssh root@77.42.124.157 'systemctl restart citeback-ai && sleep 2 && systemctl status citeback-ai --no-pager'

# ALWAYS pull server.js from VPS before editing — VPS is source of truth
scp root@77.42.124.157:/opt/citeback-ai/server.js /workspace/deflect/server.js
```

### Build
```bash
cd /workspace/deflect && npm run build
# Must exit 0 before any deploy
```

---

## PARALLEL AGENT STRATEGY

When there's a lot to do, spawn agents by track:

**Track A — Frontend (safe to run anytime):**
- React/JSX component changes
- CSS, styling, accessibility
- Does NOT need VPS access
- Ends with: `npm run build && git push origin main`

**Track B — Server (serialize VPS writes):**
- server.js changes
- Ends with: `scp server.js root@... && systemctl restart citeback-ai`
- Only ONE agent should touch VPS at a time

**Track C — UX/Legal/Content:**
- ToS, copy, branding
- Attorney pipeline testing
- Read-only VPS queries OK

**Coordination rule:** If multiple agents change server.js, have them output their diffs and merge manually before deploying. Never have two agents scp to VPS simultaneously.

---

## THE FULL AUDIT CHECKLIST

Use this every session to find new bugs. Work top-to-bottom. Mark items ✅ when verified clean.

### 🔴 CRITICAL — Security
- [ ] No `unsafe-inline` in CSP `style-src` (requires all inline styles → CSS)
- [ ] All SQL uses parameterized queries (grep for string template SQL)
- [ ] Rate limits on ALL public endpoints
- [ ] Pre-body rate limiting (rate check before parsing body)
- [ ] No internal IPs reachable via SSRF in any proxy endpoint
- [ ] File uploads: magic bytes checked (not just Content-Type)
- [ ] No stack traces or file paths in error responses
- [ ] Admin panel: IP-bound sessions, brute force lockout
- [ ] JWT: expiry enforced, no alg:none accepted
- [ ] Passkey sign counts checked (replay protection)

### 🟠 HIGH — Auth & Privacy
- [ ] Timing-safe login (dummy bcrypt for unknown usernames)
- [ ] SameSite=Strict on all cookies
- [ ] Logout-all invalidates all sessions server-side
- [ ] Recovery emails encrypted AES-256-GCM at rest
- [ ] Photo filenames randomized (randomUUID)
- [ ] EXIF stripped from uploaded photos before serving
- [ ] User IPs never in any response body
- [ ] No "Deflect" brand name anywhere in the UI (replaced by Citeback)

### 🟡 MEDIUM — UX & Consistency
- [ ] All forms: labels, not just placeholders
- [ ] Submit buttons disabled during loading state
- [ ] Consistent error message styling site-wide
- [ ] "Forgot username" flow (requires recovery email)
- [ ] Mobile nav closes on route change
- [ ] Active tab highlighted for all routes
- [ ] Footer has links to: ToS, Privacy, GitHub, Discord
- [ ] AccountModal create-account links to ToS
- [ ] LazyFallback uses CSS class, not inline styles
- [ ] 404 route is friendly and routes to homepage
- [ ] All async fetch errors show user-friendly messages

### 🟢 LOW — Polish
- [ ] Page titles unique per route (already done)
- [ ] Skip-link (#main-content) works
- [ ] All images have alt attributes
- [ ] Copyright year in Footer is current
- [ ] No placeholder "TODO" or "coming soon" text in live UI
- [ ] Dark/light mode consistent on all new components
- [ ] Scrollbar styling (red) consistent on all new elements

---

## COMMON BUG PATTERNS TO GREP FOR

```bash
# Inline styles — direct object literal (move to CSS)
grep -r "style={{" src/ --include="*.jsx" -l

# Inline styles — JS object variable (e.g. style={styles.foo} — also move to CSS)
grep -rn "style={[a-zA-Z]" src/ --include="*.jsx" | grep -v "//" | head -20

# Raw apostrophes in JSX (should be &apos; or curly quotes)
grep -rn "'" src/ --include="*.jsx" | grep -v "//"

# console.log leaking info
grep -rn "console.log" server.js | grep -v "//\|SHA\|version"

# String concatenation in SQL (injection risk)
grep -n "WHERE.*\${" server.js | head -20

# Missing rate limits — endpoints without rate limit call
grep -n "route\|app\." server.js | grep -v "rateLimit\|//\|static\|cors" | head -30

# Old brand name
grep -ri "deflect" src/ --include="*.jsx" | grep -v "import\|//\|workspace"

# Hardcoded IPs or ports
grep -n "localhost\|127\.0\.0\|192\.168\." server.js | grep -v "//\|SSRF"
```

---

## ATTORNEY PIPELINE (test after any server change)

```bash
# Schema check
ssh root@77.42.124.157 'sqlite3 /opt/citeback-ai/data/citeback.db ".schema attorney_applications"'
ssh root@77.42.124.157 'sqlite3 /opt/citeback-ai/data/citeback.db "PRAGMA table_info(users)"'

# Note: table is 'users' not 'accounts'
ssh root@77.42.124.157 'sqlite3 /opt/citeback-ai/data/citeback.db "SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as campaigns FROM campaigns;"'

# Smoke test apply endpoint (expect 401 — auth required)
curl -s -o /dev/null -w "%{http_code}" -X POST https://ai.citeback.com/attorney/apply

# Check admin attorney queue endpoint exists (expect 401)
curl -s -o /dev/null -w "%{http_code}" https://ai.citeback.com/admin/attorney-applications

# Check claim-account endpoint (expect 400 — missing fields)
curl -s -o /dev/null -w "%{http_code}" -X POST https://ai.citeback.com/claim-account
```

---

## VPS HEALTH CHECKS

```bash
# Service status
ssh root@77.42.124.157 'systemctl status citeback-ai --no-pager'

# Recent logs
ssh root@77.42.124.157 'journalctl -u citeback-ai -n 30 --no-pager'

# Disk usage
ssh root@77.42.124.157 'df -h / && du -sh /opt/citeback-ai/data/'

# DB size + integrity (table is 'users' not 'accounts'; sightings stored in .jsonl file)
ssh root@77.42.124.157 'sqlite3 /opt/citeback-ai/data/citeback.db "PRAGMA integrity_check; SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM campaigns;"'

# fail2ban status
ssh root@77.42.124.157 'fail2ban-client status sshd'

# Check auto-updates
ssh root@77.42.124.157 'cat /var/log/unattended-upgrades/unattended-upgrades.log | tail -5'

# AI service stats
ssh root@77.42.124.157 'curl -s http://localhost:11435/stats'
```

---

## PRIORITY QUEUE (update this section each session)

### 🔴 BLOCKERS (must happen before launch)
1. **Wyoming DAO LLC** — Scott files at wyomingbusiness.gov ($100). Blocks ToS legitimacy.
2. **Attorney review of ToS** — needs entity first, then attorney signs off
3. ~~**Remove `unsafe-inline` from style-src CSP**~~ ✅ DONE — 0 inline styles, CSP fully hardened

### 🟠 HIGH PRIORITY
4. ~~**Remove inline CSS custom properties**~~ ✅ DONE
5. Attorney pipeline E2E test (apply → admin approve → claim token → badge)
6. CARTO map tile privacy (document in privacy policy or proxy)
7. First real campaign onboarding (operators need a known-good flow)

### 🟡 MEDIUM PRIORITY
8. Change-password "forgot username if no email" edge case
9. BLM land overlay in HexOps (separate project)
10. Mobile performance audit (bundle size, lazy loading audit)

### 🟢 LOW PRIORITY / POLISH
11. Operator onboarding wizard (guided campaign creation)
12. Campaign analytics dashboard (views, clicks, donations)
13. Email notification system (campaign updates to supporters)
14. WebAuthn: add "manage passkeys" UI to ReputationPage (delete passkeys)

---

## SESSION END CHECKLIST

Before closing any Citeback session:
```bash
# 1. Verify build is clean
cd /workspace/deflect && npm run build 2>&1 | tail -5

# 2. Verify VPS is healthy
ssh root@77.42.124.157 'systemctl is-active citeback-ai'

# 3. Git status clean
git status && git log --oneline -3

# 4. Update SESSION_BRIEF.md with new state
# 5. Update MEMORY.md if anything significant changed
# 6. Remind Scott about Wyoming DAO LLC if not yet filed
```

---

## KNOWN ISSUES LOG

Track bugs found but not yet fixed here:

| Date | Issue | Status |
|------|-------|--------|
| 2026-05-09 | `unsafe-inline` in style-src CSP | In progress — CameraMap 137 styles is the blocker (needs dedicated session) |
| 2026-05-09 | "forgot username" flow | ✅ DONE (server endpoint + UI in AccountModal) |
| 2026-05-09 | CARTO tiles expose user IP to third party | Documented in privacy policy only |
| 2026-05-09 | Attorney pipeline needs E2E test | In progress |
| 2026-05-09 | Wyoming DAO LLC not filed | Blocked on Scott |
| 2026-05-10 | EXIF not stripped from uploaded photos | ✅ FIXED (stripJpegExif() added, strips GPS/camera info, preserves APP11/C2PA) |
| 2026-05-10 | Magic bytes not validated on upload | ✅ FIXED (validateMagicBytes() added) |
| 2026-05-10 | /claim-account returned 500 on empty body | ✅ FIXED (returns 400) |
| 2026-05-10 | CameraMap.jsx 137 non-Leaflet inline styles | ⚠️ NEEDS DEDICATED SESSION — photo panel, layer control, legend all have convertible styles |
| 2026-05-10 | ReputationPage inputs missing labels | ✅ FIXED (added aria-accessible labels) |
| 2026-05-10 | DEFLECT old brand name in server.js variable | ✅ FIXED (renamed to OFF_TOPIC) |
| 2026-05-10 | 429 responses missing Content-Type header | ✅ FIXED (4 endpoints updated) |
| 2026-05-10 | Caddy `via` header reveals proxy software | ✅ FIXED (-Via in Caddyfile) |
| 2026-05-10 | typeColors/tagColors as inline styles | ✅ FIXED (CSS classes .tc-*, .ff-tag--*) |
| 2026-05-10 | Strength meter inline styles (3 components) | ✅ FIXED (CSS classes .strength-level-*, .strength-label-*) |
| 2026-05-10 | AdminPanel attorney status inline colors | ✅ FIXED (CSS classes .ap-status-*) |
| 2026-05-10 | Governance participant inline borderLeft/color | ✅ FIXED (CSS classes .gov-p-*, .gov-p-label-*) |
| 2026-05-10 | ClaimAccountPage labels not linked to inputs | ✅ FIXED (htmlFor/id added) |
| 2026-05-10 | ResetPasswordPage labels not linked to inputs | ✅ FIXED (htmlFor/id added) |
| 2026-05-10 | Attorney application email stored plaintext | ⚠️ LOW RISK — attorney emails are professional contact info (already public for barred attorneys) |
| 2026-05-10 | CSS custom properties via style attr (6×) | ✅ FIXED — useRef+useEffect / callback refs; unsafe-inline removed from CSP |
| 2026-05-10 | Dynamic width progress bars (5×) | ✅ FIXED — ref.style.setProperty('--width', pct%) + CSS var(--width, 0%) |
| 2026-05-10 | CameraMap 9 remaining (8 layer/tier + 1 MapContainer) | ✅ FIXED — --lc CSS custom prop + color-mix() class states; MapContainer → .cmap-leaflet-container CSS class |
| 2026-05-10 | unsafe-inline in style-src CSP | ✅ FIXED — removed from netlify.toml; 0 inline styles remain |
| 2026-05-10 | /attorney/apply missing rate limit | ✅ FIXED (checkAuthRateLimit — 5 req/15min; prevents CA bar API abuse) |
| 2026-05-10 | /api/campaigns/:id/claim missing rate limit | ✅ FIXED (checkRateLimit standard) |
| 2026-05-10 | PATCH /api/campaigns/:id missing rate limit | ✅ FIXED (checkRateLimit standard) |
| 2026-05-10 | passkey DELETE: decodeURIComponent without try/catch — URIError on malformed URL hangs request | ✅ FIXED (try/catch, returns 400) |
| 2026-05-10 | passkey/list missing rate limit (pre-auth hammering vector) | ✅ FIXED (checkRateLimit pre-auth) |
| 2026-05-10 | passkey/delete missing rate limit (timing oracle on auth check) | ✅ FIXED (checkAuthRateLimit pre-auth) |
| 2026-05-10 | passkey/register-verify missing rate limit (registration abuse vector) | ✅ FIXED (checkPkRegRateLimit pre-auth) |
| 2026-05-10 | GET /photos/ missing rate limit (photo hotlinking/download DoS) | ✅ FIXED (checkRateLimit added; note: Caddy also intercepts /photos/* directly for performance — Node.js handler is defense-in-depth) |
| 2026-05-10 | Caddy /photos/* serves files directly (bypasses Node rate limit) | ⚠️ DOCUMENTED — Caddy prevents path traversal; no personal data in photos (EXIF stripped on upload); LOW risk |
| 2026-05-10 | 43 JSON responses missing Content-Type: application/json header | ✅ FIXED (Python regex replace — all writeHead(NNN); res.end(JSON.stringify) patterns updated) |
| 2026-05-10 | CampaignList search input missing aria-label | ✅ FIXED (aria-label="Search campaigns" added) |
| 2026-05-10 | CameraMap sighting notes input missing aria-label | ✅ FIXED (aria-label="Sighting notes" added) |
| 2026-05-10 | ConversationalInterface.jsx — 24 inline styles via const styles={} object (bypassed style={{ grep) | ✅ FIXED — migrated to ConversationalInterface.css; zero style={} in entire codebase |
| 2026-05-10 | /version endpoint missing rate limit | ✅ FIXED (checkRateLimit added) |
| 2026-05-10 | /interest counts action: no rate limit + body parsed before rate check | ✅ FIXED — checkRateLimit moved to top of handler (pre-body), covers both counts + increment actions |
| 2026-05-10 | ReputationPage — 'New password' and 'Confirm new password' inputs missing labels | ✅ FIXED (htmlFor/id/aria-label added to both) |
| 2026-05-10 | CampaignList sort select missing aria-label | ✅ FIXED (aria-label="Sort campaigns" added) |
| 2026-05-10 | CameraMap state filter select missing aria-label | ✅ FIXED (aria-label="Jump to state" added) |
| 2026-05-10 | AdminPanel review note input missing aria-label | ✅ FIXED (aria-label="Review note" added) |
| 2026-05-10 | AdminPanel password input missing aria-label | ✅ FIXED (aria-label="Admin secret" added) |
| 2026-05-10 | AdminPanel campaign status select missing aria-label | ✅ FIXED (aria-label=`Status for {name}` added) |
| 2026-05-10 | /account/logout missing rate limit (DoS via cookie spam) | ✅ FIXED (checkRateLimit added pre-response) |
| 2026-05-10 | /account/logout-all missing rate limit (valid token can loop-increment password_version) | ✅ FIXED (checkAuthRateLimit pre-body; prevents token-holder DoS) |
| 2026-05-10 | index.css global scrollbar #1a1a2e navy vs App.css #333 dark | ✅ FIXED (index.css ::-webkit-scrollbar-thumb + .layers-scroll normalized to #333) |
| 2026-05-10 | Agent (keepalive 7.5) locked ThemeContext to PRESS/light, removed setTheme + localStorage | ✅ FIXED — COLD default restored, localStorage persistence restored, setTheme re-exposed |
| 2026-05-10 | /admin/attorney-applications missing rate limit | ✅ FIXED (checkRateLimit added; isAdmin auth still primary gatekeeper) |
| 2026-05-10 | /admin/sightings missing rate limit | ✅ FIXED (checkRateLimit added; isAdmin auth still primary gatekeeper) |

---

*This document is the single source of truth for Citeback session strategy.*
*Update it whenever you discover new patterns, fix issues, or change infrastructure.*
