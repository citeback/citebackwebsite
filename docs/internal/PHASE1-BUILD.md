# Phase 1 Build — Citeback Reputation System
*Handoff note — 2026-05-06*

## What We're Building
The minimum viable reputation system that lets camera spotters earn operator access.

## Current State
- citeback.com is live, deployed, committed to GitHub
- Hetzner server running at 77.42.124.157 (Node.js, port 11435, Caddy reverse proxy)
- Data stored as flat .jsonl files in /opt/citeback-ai/data/
- No account system exists. No reputation tracking. No user identity of any kind.
- Sighting submissions work (submit → moderation queue → approved → appears on map)
- Admin approval via curl only (no UI)

## Phase 1 Goal
A user can:
1. Create a pseudonymous account (username + password, no email, no real identity)
2. Submit camera sightings linked to their account
3. See their submission history (pending/approved/rejected)
4. See their reputation score and current tier
5. Know how many points until Tier 1 (operator access)

That's it. No wallets. No campaigns. No payments. Just accounts + reputation.

## The Stack Decision
Current: flat .jsonl files (fine for anonymous submissions, not for accounts)
Needed: SQLite database on Hetzner
Migration path: move sightings.jsonl, proposals.jsonl, registry.jsonl → SQLite tables
Why SQLite: simple, zero config, already used in HexOps (/workspace/hexops), no extra infra

## Reputation Rules (from ARCHITECTURE-REPUTATION.md)
- New camera (not in OSM or Citeback DB) = 2 reputation points
- Confirmed existing camera = 1 reputation point
- C2PA signed photo required to earn points (text-only = 0 points)
- Tier 1 unlocks at 10 points (e.g. 5 new cameras OR 10 confirmed cameras)
- Tier 1 = campaign access up to $500

## New Backend Endpoints Needed (Phase 1 only)
1. POST /account/create — username + password (bcrypt), no email
2. POST /account/login — returns JWT
3. GET /account/me — reputation score, tier, submission history
4. POST /sighting — update to accept auth token, link to account if present
5. GET /account/sightings — user's own submissions with status

## Frontend Changes Needed (Phase 1 only)
1. Simple account creation modal (username + password, no email)
2. Login modal
3. "My Account" page/tab showing: score, tier, submissions, points to next tier
4. SightingForm: if logged in, show "This sighting will count toward your reputation"
5. Nav: show username/avatar if logged in, "Create Account" if not

## Key Design Constraints
- No email required ever
- No real name required ever
- Password hashed with bcrypt, never stored plain
- JWT tokens for session auth (7 day expiry)
- Anonymous submissions still work (no account required to submit)
- Only submissions WITH an account earn reputation points

## What NOT to Build in Phase 1
- XMR stake system (Phase 2)
- Operator wallet registration
- Campaign creation flow
- Vouching system
- Tier 2+ promotion
- C2PA validation (stub it — accept C2PA flag, validate later)
- Admin UI (separate task)

## Files to Read
- /workspace/deflect/ARCHITECTURE-REPUTATION.md — full system design
- /workspace/deflect/TECH-AUDIT-2026-05-06.md — technical gaps and P0/P1 issues
- /workspace/deflect/src/components/SightingForm.jsx — current form (needs account integration)
- /workspace/hexops/server/index.js — example SQLite setup on similar stack

## Server Access
ssh -i ~/.ssh/id_ed25519 root@77.42.124.157
Server code: /opt/citeback-ai/server.js
Data: /opt/citeback-ai/data/
Admin secret: 45f54c8f4718a97c9afe65c4c935bc64d20a0df5b88a0659

## Admin Secret Note
The admin secret above is for the current moderation endpoints only.
Phase 1 adds JWT-based auth — admin secret remains for moderation, JWT for user sessions.
