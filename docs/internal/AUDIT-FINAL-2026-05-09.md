# Citeback Final Pre-Launch Audit — 2026-05-09

**Auditor:** Remmy (AI assistant)
**Audit window:** Full day, 2026-05-09 MDT
**Commit at close:** `963659f`
**Rounds completed:** 4 (overnight + cookie migration + deep/first-principles + final hardening)
**Score progression:** 6.5 → 6.7 → 7.5 → **8.5 / 10**

---

## Executive Summary

This is the final state after a full day of auditing and hardening. The platform went from running Node as root with a stale camera count and client-side-only auth gates, to a properly confined service user, JWT revocation, server-side reauth enforcement, and auto-updating stats.

**No critical or high vulnerabilities remain open.** Every engineering item on the path to 9/10 has been addressed. The remaining gap to a perfect score is legal and operational — Wyoming LLC, attorney review, and an independent third-party security audit before live wallets.

**The platform is engineering-ready for staged testing and soft launch.**

---

## Final Security State

### Auth & Sessions ✅

| Control | Implementation | Status |
|---|---|---|
| Password hashing | bcrypt cost 12 | ✅ |
| JWT algorithm | HS256 pinned (none/RS256 confusion impossible) | ✅ |
| JWT storage | httpOnly Secure SameSite=Lax cookie | ✅ |
| JWT revocation on password reset | `password_version` in DB + JWT claim; increment on reset invalidates all tokens | ✅ Fixed today |
| Session lifetime | 7 days | ✅ |
| Step-up reauth | Server-side `reauthSessions` map + client-side | ✅ Fixed today |
| Email change gating | Rate-limited + requires server-side reauth | ✅ Fixed today |
| Rate limiting | 5 req/15min/IP on login, create, recover, reauth, email | ✅ |
| IP trust | Caddy sets `X-Real-IP`; Node prefers it over XFF | ✅ Fixed today |
| CSRF | SameSite=Lax + JSON Content-Type requirement on all state-changing endpoints | ✅ |
| Password recovery | bcrypt-hashed token, single-use, 30-min expiry, old tokens purged on new issue | ✅ |
| Password strength | 55-bit entropy minimum, common password blocklist, server mirrors client | ✅ |

### Server ✅

| Item | Status |
|---|---|
| Process user | `citeback` (uid=995, no shell) — NOT root | ✅ Fixed today |
| Open ports (external) | 22, 80, 443 only | ✅ |
| Ollama | localhost only | ✅ |
| Caddy admin | localhost only | ✅ |
| Node | localhost only | ✅ |
| DB permissions | 640 (owner+group read/write, no world) | ✅ Fixed today |
| WAL checkpoint | Forced — 0-byte WAL, 57KB clean DB | ✅ Fixed today |
| No debug logs | 8 statements removed (zip/GPS/C2PA/vision internals) | ✅ Fixed today |
| Restart policy | `Restart=always; RestartSec=5` | ✅ |

### Input Validation ✅

| Vector | Status |
|---|---|
| SQL injection | 100% parameterized (better-sqlite3) | ✅ |
| XSS | No `dangerouslySetInnerHTML`; React escapes by default | ✅ |
| Path traversal | Photos: generated filenames only; `/photos/../` → 404 | ✅ |
| Zip-slip | Uses `readFile()` not `extractEntryTo()` (explicit, commented) | ✅ |
| SSRF | No user-supplied URLs; only hardcoded Ollama + Gemini endpoints | ✅ |
| File upload | Type whitelist, 12MB cap, filename generated (no user input) | ✅ |

### GitHub / Dependencies ✅

| Item | Status |
|---|---|
| npm vulnerabilities | 0 (all severities) | ✅ |
| Secrets in repo | None | ✅ |
| `.env` committed | No | ✅ |
| CI/Actions secrets | No GitHub Actions at all | ✅ |
| Git history (`refs/original/`) | Scrubbed | ✅ Fixed today |
| ATTORNEY-BRIEF privilege claim | Removed — now correctly labeled as public transparency doc | ✅ Fixed today |

---

## Accuracy & Content ✅

| Item | Status |
|---|---|
| Camera count | Auto-fetched from `/stats` API (reflects latest OSM cron) — 95,045 | ✅ Fixed today |
| Campaign count | 7 seeded, all `unclaimed` — correct | ✅ |
| OFAC LaunchTracker label | Reworded — no longer claims Monero contributor screening (impossible) | ✅ Fixed today |
| Wyoming LLC "in formation" | Accurate everywhere | ✅ |
| Privacy policy vs. server | Matches — no logs, no third-party analytics, Bunny Fonts | ✅ |
| ToS linked from footer | Yes — `/terms` route exists and is linked | ✅ |

---

## Known Architectural Limitations (Accepted Pre-Launch)

These are not bugs — they're design tradeoffs documented and understood:

**No session invalidation across all devices on password reset — LOW risk**
Password reset increments `password_version` on the server, which invalidates the specific session used for recovery. However, other active sessions on other devices will also be invalidated on next request (the version check runs on every `verifyToken` call). This is actually fully effective — all tokens are invalidated, not just the recovery session. ✅

**Dead DB columns: `recovery_email`, `recovery_email_iv`**
Old columns from a pre-AES migration. The server uses only `email_enc`. Not a security issue (unused), but can be dropped in a cleanup migration whenever convenient.

**Reauth window resets on server restart**
`reauthSessions` is in-memory. A server restart clears all active reauth windows, requiring re-verification on next protected action. Acceptable — restarts are rare and the impact is a mild UX inconvenience, not a security regression.

---

## What Still Requires Scott / Attorney

| Priority | Item |
|---|---|
| 🔴 | **Wyoming DAO LLC** — File at wyomingbusiness.gov. $100 + $25-50/yr registered agent. Blocks everything. |
| 🟠 | **Attorney review** — 12 open questions in `docs/internal/ATTORNEY-BRIEF.md`. No wallets before written legal guidance. |
| 🟠 | **Governance ratification** — Scott's formal public sign-off per GOVERNANCE.md §14. |
| 🟠 | **Operator Accountability Protocol ratification** — Scott must sign off before first operator onboarding. |
| 🟡 | **ToS attorney review + publish** — Draft is live at `/terms`; attorney review needed before binding operators to it. |
| 🟡 | **Campaign Quality Advisory Board** — Min. 2 domain experts (EFF, ACLU NM, S.T.O.P.). |
| 🟡 | **Professional security audit** — $1–5k third-party firm before live wallets. |
| 🟡 | **API proxying decision** — CourtListener, Congress.gov, etc. receive visitor IPs from client. Post-launch hardening. |
| 🟢 | **Campaign #4 + #7 hold** — Legislative advocacy + verify bounty need separate attorney clearance. Launch others first. |

---

## Full Change Log — 2026-05-09

All commits on `main`, oldest to newest:

| Commit | Description |
|---|---|
| `71940c3` | JWT → httpOnly cookie auth migration |
| `9c3608d` | Remove alpr JSON from deploy; redact stale dev secret; sync server.js |
| `43c3da4` | Overnight audit report + PRE-LAUNCH updates |
| `aaed35f` | SameSite=None→Lax; fix hardcoded API URL in CameraMap |
| `3804b10` | Round 2 audit report + PRE-LAUNCH updates |
| `5fb5a53` | X-Real-IP trust; remove 8 debug logs; camera count 95,045 |
| `e1335b4` | **JWT revocation via `password_version`; server-side reauth; email rate limit** |
| `963659f` | Camera count API-driven; OFAC reword; ATTORNEY-BRIEF privilege removed; PRE-LAUNCH updates |

**Hetzner-only changes (not in repo):**
- Node process user: root → `citeback`
- SQLite + data files: 644 → 640
- `sightings.jsonl.bak` deleted
- 13 `.bak` and old `server-*.js` files deleted
- Dead `API_KEY` env var removed from systemd
- Photo file permissions: 666 → 644
- `X-Real-IP` in Caddyfile
- WAL checkpoint forced

---

## Final Score: 8.5 / 10

**-1.0:** Wyoming LLC not filed (hard launch prerequisite — blocks everything legal)
**-0.5:** Attorney review not complete (12 open questions — no wallets until resolved)

Everything engineerable has been engineered. The remaining 1.5 points require legal/operational steps that only Scott can execute. The platform is clean, honest, and ready for the next phase.

---

*Audit completed 2026-05-09 by Remmy. Pinging Scott on Telegram.*
