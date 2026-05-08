# Citeback Technical Audit — 2026-05-06

**Auditor:** Citeback Subagent (OpenClaw)  
**Scope:** `/deflect/src/`, `/deflect/public/`, and backend server.js (endpoints audited per spec)  
**Focus:** Dead ends, broken flows, missing features, claimed-vs-actual gaps, pre-reputation-system blockers

---

## Severity Key

- **P0** — Broken right now; users hit a wall or receive false information today
- **P1** — Must fix before reputation/wallet launch; architecturally blocking
- **P2** — Should fix before launch; degrades trust or correctness
- **P3** — Nice to have; quality/scale improvements

---

## Section 1: UI Dead Ends and Broken Flows

### 1.1 Campaign "Signal Interest" — In-Memory Counter with No Persistence
**P1 | `CampaignModal.jsx:30-46` + backend `/interest`**

The "Signal Interest" button in `CampaignModal.jsx` posts to `/interest` and reads back a count. The backend `/interest` endpoint stores interest counts entirely in-memory. A server restart — or any deployment — wipes all counts to zero. The UI displays these counts with no disclosure that they reset.

**Impact:** A user who signals interest sees a count. Another user later sees zero. This misrepresents community momentum — arguably a material misrepresentation to campaign proposers who use interest counts to gauge whether to proceed.

**What's stored client-side:** `localStorage.setItem('cb_int_${campaign.id}', '1')` prevents re-voting from the same browser, but the server-side count can be zero while dozens of local storage tokens exist across browsers.

**Disclosure gap:** Neither the UI nor the Privacy Policy discloses that interest counts reset on restart.

---

### 1.2 Proposal Submission — No Confirmation Channel, No Follow-up Path
**P1 | `ProposeModal.jsx:52-58`**

`handleSubmit` in `ProposeModal.jsx` posts to `https://ai.citeback.com/submit` and then shows a success screen. The success screen says:
> "Team reviews for legality... 24–72h"

But there is **no operator-side read interface** for `proposals.jsonl`. Proposals accumulate in a flat file with no read endpoint, no admin UI, no notification, and no way for the submitter to check status (by design — anonymous). 

The only path to see submissions is SSH + `cat proposals.jsonl` on the Hetzner server.

Additionally: `ProposeModal.jsx` does **not check `res.ok`** — if the server is unreachable, the submit fires, fails silently (the `catch` is empty: `catch (_) {}`), and then `setSubmitted(true)` is called unconditionally. The user sees "Proposal Submitted" even if the network request failed. **This is a P0 bug.**

```javascript
// ProposeModal.jsx:52-58
try {
  await fetch('https://ai.citeback.com/submit', { ... })
} catch (_) {}  // <-- silent failure
setSending(false)
setSubmitted(true)  // <-- fires even if fetch threw
```

---

### 1.3 Registry Application — Same Silent Failure Bug
**P1 | `HumanRegistry.jsx:74-80` (ApplyModal.handleSubmit)**

Identical issue to ProposeModal: the `catch` is `catch (_) {}` and `setSubmitted(true)` fires unconditionally. A user who applies to the Expert Directory during a server outage gets a "Application Received" confirmation screen for a submission that never arrived.

---

### 1.4 Verification Bounty (Campaign #7) — Entire Mechanic Is Vaporware
**P0 | `CampaignModal.jsx` (verify branch) + `campaigns.js:170-191`**

The verification bounty campaign displays a complete, detailed UI: stake amounts, commit-reveal schemes, IPFS storage, perceptual hash dedup, 3-of-3 consensus. None of this infrastructure exists.

Specific claimed features with zero backend implementation:
- Commit-reveal scheme
- Economic staking (stake required: 0.25 XMR)
- 3-of-3 Expert Directory consensus
- Perceptual hash dedup
- IPFS permanent storage
- GPS metadata required
- 72-hour time-lock on photos
- Geographic diversity bonus
- Reputation multiplier

The campaign text says "Wallets pending activation. Fund this campaign to open the bounty pool." But the bounty *payout mechanism itself* doesn't exist — funding the campaign would put XMR into a wallet with no automatic distribution logic.

**No verifier apply flow exists.** The UI says "Verifiers apply through the Expert Directory" but the Expert Directory application form does not connect to any verification queue or bounty tracking.

---

### 1.5 Wallet Address Copy Copies `null`
**P0 | `CampaignModal.jsx:130`**

All campaigns in `campaigns.js` have `walletXMR: null` and `walletZANO: null`. The modal's "active wallet" is:

```javascript
const activeWallet = currency === 'XMR' ? campaign.walletXMR : campaign.walletZANO
```

If somehow the wallet state render guard fails (or a future bug allows the funded branch to render prematurely), `copyWallet()` calls `navigator.clipboard.writeText(null)` — which copies the string `"null"` to clipboard. Users could donate to an invalid address.

**Current state:** All campaigns are gated behind `!hasWallet` check, so the donate UI does not render. But the risk exists the moment any campaign is promoted to active status.

---

### 1.6 Share URL in CampaignCard Uses Hash Fragment, Not Route
**P2 | `CampaignCard.jsx:20-24`**

```javascript
navigator.clipboard.writeText(`${window.location.origin}/#campaign-${campaign.id}`)
```

The app uses React Router with real paths (e.g., `/campaigns/1`). The hash fragment `#campaign-1` will not deep-link to the campaign. The correct URL is `${window.location.origin}/campaigns/${campaign.id}`, as used in `CampaignModal.jsx:handleShare`. This is inconsistent — CampaignCard's share link is broken as a deep link.

---

### 1.7 Funded Campaign State — "Proof of Execution" Is Static Placeholder
**P2 | `CampaignModal.jsx` (funded branch)**

The funded state shows:
> "Receipt, vendor invoice, and photo documentation will be posted here upon completion."

There is no mechanism to actually post this documentation. No admin endpoint to update campaigns, no CMS, no receipt upload path. The data is hardcoded in `campaigns.js`. To post proof-of-execution, someone would need to manually edit `campaigns.js` and redeploy.

---

### 1.8 Governance Page Links to GitHub Docs That May Not Exist
**P2 | `Governance.jsx:60`, `Operators.jsx`**

Multiple components link to:
- `https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md`
- `https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE-SUPPLEMENTS.md`

If these files don't exist in the repo, visitors get 404s. Not verified in this audit, but worth confirming.

---

## Section 2: Backend Gaps

### 2.1 `/interest` — In-Memory, Resets on Restart, Undisclosed
**P1 | Backend `/interest`**

Covered in §1.1. The core issue: any server restart, deployment, OOM kill, or Hetzner reboot wipes interest counts permanently. This is not disclosed anywhere on the site.

**Minimum fix:** Write interest counts to a persistent store (even a simple JSON file on disk, synced on write) or append to an `interest.jsonl` file keyed by campaignId.

---

### 2.2 Sightings Moderation — No Admin UI, Admin Relies on curl
**P1 | Backend `/admin/sightings/moderate` + `/admin/sightings?secret=xxx`**

Sightings submitted to `/sighting` enter a `pending` state. The only way to approve or reject them is:

```bash
# Read all pending sightings
curl "https://ai.citeback.com/admin/sightings?secret=YOUR_SECRET"

# Approve one
curl -X POST https://ai.citeback.com/admin/sightings/moderate \
  -H "Content-Type: application/json" \
  -d '{"id": "...", "action": "approve", "secret": "YOUR_SECRET"}'

# Bulk approve all with lat/lng
curl -X POST https://ai.citeback.com/admin/sightings/approve-all \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_SECRET"}'
```

**This is the entire admin workflow.** No UI, no email notification, no queue management. Sightings currently accumulate in `sightings.jsonl` with no operator prompt to review them. The camera map only shows `approved` sightings, so community reports never appear on the public map until someone manually runs curl commands.

---

### 2.3 Geocoding Failures Leave Sightings Orphaned
**P1 | Backend `/sighting` + `SightingForm.jsx:client-side geocoding`**

The SightingForm does client-side geocoding via Nominatim before submission, sending `lat`/`lng` (or `null` if geocoding failed). The backend `/sighting` endpoint does its own server-side geocoding via Nominatim with a 5-8 second timeout for sightings without coordinates.

**Gap:** When server-side geocoding fails (network issue, Nominatim rate limit, ambiguous address), the sighting is stored as `pending` with `lat: null, lng: null`. The `/admin/sightings/approve-all` endpoint only bulk-approves sightings that already have `lat/lng`. Sightings with null coordinates cannot be bulk-approved — they require individual moderation. But there is no admin interface to handle them individually efficiently. They sit in `sightings.jsonl` permanently unless someone reads the raw file and manually patches records.

**Nominatim rate limit concern:** Nominatim enforces a 1 request/second limit for free usage. High-volume submission periods (e.g., if the site gets press coverage) can queue geocoding requests, causing timeouts for legitimate sightings.

**Public map impact:** `GET /sightings/public` returns only `status='approved'` sightings with `lat/lng`. A sighting that fails geocoding will never appear on the map, with no user feedback post-submission.

---

### 2.4 `proposals.jsonl` and `registry.jsonl` — Write-Only Black Holes
**P1 | Backend `/submit` + `/registry`**

Both `/submit` (campaign proposals) and `/registry` (expert directory applications) write to `.jsonl` files. There is **no read endpoint** for either. The operator must SSH to the server and read the files directly to see submissions.

**Current workflow:**
```bash
# See all proposals
ssh user@hetzner-server cat /path/to/proposals.jsonl

# See all registry applications
ssh user@hetzner-server cat /path/to/registry.jsonl
```

This is operationally fragile. There's no notification when new proposals arrive, no way to manage submissions without server access, and no ability for the platform to display "X proposals under review" to build community trust.

---

### 2.5 `/api/chat` — Proxies to Ollama with No Rate Limiting
**P1 | Backend `/api/chat`**

The AI chat endpoint proxies to a local Ollama/Qwen2.5 instance. Issues:
- No per-IP or per-session rate limiting — anyone can flood the endpoint and saturate the Ollama instance
- The topic filtering exists but its effectiveness depends on the model's compliance; the AI can potentially be prompted to discuss off-topic subjects despite the system prompt
- No request size limit documented — large context injection via user messages could be expensive
- Feedback endpoint (`/feedback`) is unauthenticated and fires vote data to the server with no rate limiting

---

### 2.6 Admin Secret in Query String — Logged by Infrastructure
**P2 | Backend `/admin/sightings?secret=xxx`**

The admin secret is passed as a URL query parameter. This means it appears in:
- Hetzner server access logs
- Any reverse proxy logs (nginx/Caddy)
- Browser history if accessed from a browser
- Server-side request logs if express logging is enabled

This is a known bad practice. Admin authentication should use a POST body or `Authorization` header, not a GET query string.

---

### 2.7 No Authentication on Public Write Endpoints — Abuse Surface
**P2 | All public endpoints**

Every write endpoint is fully open:
- `POST /sighting` — no rate limiting, no CAPTCHA beyond a honeypot field
- `POST /submit` — no rate limiting
- `POST /registry` — no rate limiting
- `POST /interest` — no rate limiting

The honeypot field in `SightingForm.jsx` catches naive bots but not programmatic submissions. A motivated adversary (surveillance vendor, law enforcement PR shop) can flood `sightings.jsonl` with fake sightings — thousands of them — overwhelming the moderation queue. The Governance page acknowledges this as a threat model but no server-side countermeasure exists.

**Minimum mitigation:** Server-side rate limiting by IP (e.g., `express-rate-limit`), even without authentication.

---

## Section 3: Claimed vs. Actual

### 3.1 Privacy Policy: "IP Address Logging Is Disabled" — Architecturally True at App Level Only
**P1 | `PrivacyPolicy.jsx:4-section, backend server.js`**

The Privacy Policy (Section 4) states:
> "sent directly to our own server where IP address logging is disabled at the infrastructure level"

**What "disabled at infrastructure level" means architecturally:** If the server.js code explicitly does not call `console.log(req.ip)` or equivalent, and express's default logger is not enabled, the *application* does not log IPs. However:

1. **Hetzner itself logs traffic** — The VPS provider's network logs will capture connection-level IP metadata. This is beyond the platform's control and is not disclosed.
2. **Node.js/Express does not log IPs by default** — True. If no logging middleware is configured, the app doesn't log IPs.
3. **nginx/Caddy reverse proxy (if present)** — If a reverse proxy sits in front of the server.js, its access logs will contain IP addresses. Whether this is configured is not verifiable from the code alone.

**Assessment:** The claim is architecturally true at the *application layer* assuming no logging middleware. The Privacy Policy's "infrastructure level" language is slightly misleading — it covers the app but not the VPS network layer or any proxy. This should be reworded to match what can actually be guaranteed.

---

### 3.2 SightingForm: "Nothing Is Collected About You" — Partially False
**P0 | `SightingForm.jsx:header text` + backend `/sighting`**

The SightingForm displays:
> **"Nothing is collected about you."**  
> "No IP address is logged. No cookies. No account."

What IS stored per sighting:
- `cameraType` (submitted by user)
- `address`, `city`, `state` (submitted by user)
- `notes` (submitted by user)
- `lat`, `lng` (geocoded from the address)
- Timestamp (presumably set by server on receipt)
- Status (`pending`)

**The form does collect information about the submission itself**, and that submission is associated with a specific location the user reported. The user's location is not stored, but if the submitted address is close to their home or workplace, the submitted data could be correlatable.

More critically: the form collects user-provided text data (address, notes, camera type) and stores it indefinitely in `sightings.jsonl` with no deletion mechanism. The statement "Nothing is collected about you" is technically true (no identity data is requested), but "No IP address is logged" — while likely true at the app layer — is not verifiable from the client side and relies on the server operator's configuration not having changed.

The *framing* "Nothing is collected about you" next to a form that clearly stores the submitted address creates a misleading impression. Should be reworded to: "We don't collect any information that identifies you."

---

### 3.3 Campaign Interest Counter — Governance References Vs. Reality
**P1 | `CampaignModal.jsx`, `Governance.jsx`, backend**

The Governance page implies community participation metrics are meaningful (quorum requirements, voter counts, etc.). Campaign interest counts are fetched and displayed in the modal, implying these numbers reflect real, persistent community interest.

The interest counter resets on server restart. If governance tooling later consumes this data to measure community demand for a campaign, it will be working with ephemeral, unreliable data.

**Disclosure gap:** No UI indicator that the count is in-memory and non-persistent. Users see "4 interested" and assume this is a durable record.

---

### 3.4 "Conversations Are Never Logged" — Relies on Ollama's Behavior
**P2 | `ConversationalInterface.jsx:privacyNote`**

The AI chat UI says:
> "Your conversations are never logged, never stored, and never used to train AI models — we verified this. Runs on our own server."

The first part ("never logged") depends on whether Ollama is configured with conversation logging disabled, and whether the server.js `/api/chat` endpoint logs request bodies. The claim "we verified this" is the platform asserting its own configuration — which users have no way to verify independently.

This is fine as a trust statement, but it relies entirely on correct ongoing server configuration. Any future change (enabling Morgan middleware, enabling Ollama's history feature) would make this claim false without any visible change to the frontend.

---

### 3.5 TEE Architecture — Described as Designed, Not Built
**P2 | Multiple components**

The Transparency, Governance, and Operators pages describe a multi-TEE architecture (Intel TDX / ARM TrustZone, 3 nodes, 2-of-3 threshold signatures) in considerable detail. The LaunchTracker clearly shows "TEE wallets live" as **not done** (circle icon, not checkmark).

This is appropriately disclosed in the LaunchTracker. However, the Governance page's Architecture section describes the TEE as if it is the current operational state ("Wallet keys are split across minimum 3 TEE instances..."), not a target architecture. This could mislead readers into thinking the TEE is live.

---

## Section 4: What Must Be Built for the Reputation System

### 4.1 New Backend Endpoints Required

The entire reputation/tier system requires a new account layer. Currently the platform is fully anonymous end-to-end. The following endpoints don't exist and must be built from scratch:

#### Account/Identity Layer
- `POST /account/register` — create pseudonymous account (keyed by XMR/ZANO address or Nostr pubkey)
- `GET /account/:id` — fetch account reputation, tier, history
- `POST /account/verify-identity` — operator identity verification intake (for campaign operators, not donors)

#### Reputation Storage & Calculation
- `GET /reputation/:accountId` — current score, tier, recent events
- `POST /reputation/event` — record a reputation event (campaign completed, challenge upheld, etc.)
- Background job to recalculate tier thresholds per `campaigns.js:reputationCaps`

#### Camera Submission Attribution
- `POST /sighting` must accept optional `accountId` — currently no attribution
- `GET /account/:id/sightings` — sightings submitted by an account
- Attribution must be optional to preserve anonymous submissions

#### Tier Tracking
- `GET /account/:id/tier` — current tier (0-4)
- `POST /account/:id/tier/promote` — admin-triggered tier promotion
- Logic: auto-promote at Tier 0→1 (first verified sighting), Tier 1→2 (5 verified sightings)
- Community vouching for Tier 3 promotion: `POST /account/:id/vouch`
- Tier 4: admin review only

#### Operator Campaign Management
- `POST /campaign` — create campaign (requires Tier 2+ account + OFAC cleared)
- `GET /campaign/:id/status` — live status with funding progress
- `PATCH /campaign/:id` — update campaign (operator only)
- `POST /campaign/:id/milestone` — submit milestone proof

#### XMR View Key Registration and Monitoring
- `POST /campaign/:id/viewkey` — register XMR view key for monitoring
- `GET /campaign/:id/balance` — current XMR balance read via view key
- Background poller: `GET /campaign/:id/transactions` — transaction history from view key

#### Milestone Tracking and Tranche Release
- `POST /campaign/:id/milestone/:milestoneId/complete` — operator submits completion proof
- `POST /campaign/:id/milestone/:milestoneId/challenge` — community challenge window
- `GET /campaign/:id/milestones` — milestone status for all milestones
- TEE disbursement trigger endpoint (TEE-gated, not HTTP)

#### Vouching Records
- `POST /vouch` — record a community vouch (`voucherAccountId`, `voucheeAccountId`, Tier context)
- `GET /account/:id/vouches` — all vouches for an account
- `GET /account/:id/vouches/given` — vouches given by an account

**Total new endpoints: ~20-25 before TEE integration**

---

## Section 5: The Admin Workflow Right Now

### 5.1 Current State

The entire admin workflow for sightings is:

```bash
# 1. Check for pending sightings
curl "https://ai.citeback.com/admin/sightings?secret=SECRET"

# 2. Read the JSON, find sighting IDs you want to approve
# (done manually, in a terminal)

# 3. Approve individually
curl -X POST https://ai.citeback.com/admin/sightings/moderate \
  -d '{"id":"abc123","action":"approve","secret":"SECRET"}'

# OR bulk-approve all pending with coordinates
curl -X POST https://ai.citeback.com/admin/sightings/approve-all \
  -d '{"secret":"SECRET"}'
```

There is no notification when sightings arrive. There is no queue count visible anywhere. Sightings sit in `sightings.jsonl` indefinitely until someone SSHes in and reviews them.

### 5.2 Minimum Viable Admin Interface

The minimum needed before launch:

1. **Simple authenticated admin page** (`/admin` route, behind the admin secret)
   - List pending sightings with address, type, notes, geocoded location
   - Approve / Reject buttons per sighting
   - Map preview of geocoded location
   - Bulk approve all (existing backend endpoint)

2. **New submissions notification** — at minimum, a counter in the admin view of "N pending sightings" so the operator knows to check

3. **Proposals view** — read from `proposals.jsonl`, display with approve/reject status tracking

4. **Registry view** — read from `registry.jsonl`, display with status

This is a weekend of work with a simple HTML+fetch page, no React required. The admin never needs to be fancy — it just needs to exist.

---

## Section 6: Data Persistence Risks

### 6.1 `sightings.jsonl` Mid-Write Corruption
**P1**

Node.js's `appendFileSync` is synchronous but **not atomic** on most filesystems. Under concurrent requests:
- Two requests arrive within microseconds
- Both read the file, both call `appendFileSync`
- If the OS context-switches between the two calls, the output could be interleaved at the byte level, corrupting both JSONL records

**Impact:** A corrupted line in `sightings.jsonl` will cause the next full-file parse to fail, potentially taking down the sightings map.

**Recommended fix:** Use a write queue (async mutex) to serialize all file writes, or switch to a proper database (SQLite is sufficient for this scale).

### 6.2 No Backup Strategy
**P1**

All platform data (`sightings.jsonl`, `proposals.jsonl`, `registry.jsonl`) lives on a single Hetzner VPS. No backup strategy is visible in the codebase. Hetzner provides optional backup snapshots but these are not automatic by default.

A single disk failure or accidental `rm` would destroy all submitted sightings, proposals, and registry applications.

**Minimum fix:** Daily cron to copy `.jsonl` files to a remote location (S3, Backblaze B2, etc.) or enable Hetzner automated backups.

### 6.3 `sightings.jsonl` Performance Degradation
**P2**

The backend reads the entire `sightings.jsonl` file on every request to `GET /sightings/public` and `GET /admin/sightings`. JSONL files have O(n) read performance.

**Scale estimates:**
- At 100 bytes/sighting average: 10,000 sightings = ~1 MB → negligible
- At 1,000 sightings/day: 6 months → 180,000 sightings → ~18 MB → starts to matter
- At scale with press coverage: 50,000+ sightings → 5+ MB per read, every request

**Practical threshold:** Performance degrades noticeably (>100ms reads) around 50,000-100,000 records. For a niche platform this is months or years away, but a SQLite migration should be planned before that.

### 6.4 Interest Counter Server Restart Behavior
**P0 (user-visible)**

As documented in §1.1 and §2.1: in-memory interest counts reset to zero on any server event. This is the most visible data persistence failure from a user perspective.

---

## Section 7: C2PA Verification — Implementation Requirements

### 7.1 What Needs to Be Built Server-Side

To validate C2PA signatures on submitted photos, the server needs to:

1. **Accept photo uploads** — currently `/sighting` accepts only text (address, type, notes). A new multipart endpoint or file upload path is needed.

2. **Validate C2PA manifest** — extract and verify the C2PA manifest embedded in the photo's JFIF/XMP metadata.

3. **Verify certificate chain** — C2PA certificates are signed by a trusted credential issuer (Adobe, Truepic, etc.). The chain must be verified against the C2PA Trust List.

4. **Extract and validate claims** — GPS coordinates in the C2PA claim must be cross-referenced against the submitted address. Timestamp must be within acceptable bounds.

### 7.2 Available npm Packages

The C2PA ecosystem is still maturing. As of 2026, primary options:

- **`@contentauth/sdk`** (official Adobe C2PA JavaScript SDK) — the reference implementation. Supports verification in Node.js. Can validate manifests, check certificate chains, and extract assertions (GPS, timestamp, device). This is the correct package.

- **`c2pa`** (npm) — an older, partial implementation. Less maintained than the official SDK.

### 7.3 Implementation Complexity

**Medium-high.** Key challenges:
- File upload handling (multipart/form-data)
- C2PA manifest extraction from JPEG/PNG/HEIC
- Certificate trust anchor management (the C2PA Trust List must be kept current)
- GPS coordinate validation (the C2PA GPS claim vs. submitted address should be within ~100 meters)
- Storage: C2PA-verified photos should be stored (IPFS or object storage) with the manifest preserved

**Estimated effort:** 2-4 weeks for a solo developer familiar with Node.js, assuming the `@contentauth/sdk` works as documented. The SDK is the hard dependency — its Node.js support quality determines feasibility.

**Minimum viable implementation:**
```javascript
import { createC2pa } from '@contentauth/sdk'

const c2pa = createC2pa()

async function validateC2PAPhoto(buffer) {
  const result = await c2pa.read({ buffer, mimeType: 'image/jpeg' })
  if (!result.active_manifest) return { valid: false, reason: 'no_manifest' }
  
  const gpsAssertion = result.active_manifest.assertions
    .find(a => a.label === 'stds.exif')
  
  return {
    valid: true,
    lat: gpsAssertion?.data?.['EXIF:GPSLatitude'],
    lng: gpsAssertion?.data?.['EXIF:GPSLongitude'],
    timestamp: result.active_manifest.claim_generator_info?.timestamp,
    deviceModel: result.active_manifest.claim_generator_info?.name,
  }
}
```

**Gap:** The current sighting submission flow sends JSON only — no file upload. The entire submission pipeline would need to be reworked to handle binary payloads.

---

## Section 8: XMR View Key Monitoring

### 8.1 What's Required

A server-side XMR view key monitor needs to:

1. **Store view keys** — one per campaign wallet, registered when the TEE generates the wallet
2. **Poll wallet balance and transactions** — using the view key to scan the blockchain
3. **Update campaign funding progress** — write balance back to campaign data
4. **Handle transaction confirmation depth** — XMR typically requires 10 confirmations (~20 minutes)

### 8.2 Available Libraries

**Primary approach: Monero RPC via wallet-rpc**

The standard approach is running a `monero-wallet-rpc` process alongside the Node.js server:

```bash
monero-wallet-rpc --view-wallet \
  --wallet-file /wallets/campaign-1.view \
  --password "" \
  --rpc-bind-port 18082 \
  --daemon-address node.moneroworld.com:18089
```

Then querying it via JSON-RPC from Node.js:

```javascript
const balance = await fetch('http://127.0.0.1:18082/json_rpc', {
  method: 'POST',
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: '0',
    method: 'get_balance',
    params: { account_index: 0 },
  }),
})
```

**Alternative: monero-javascript**  
The `monero-ts` (formerly `monero-javascript`) library provides a pure-JS implementation:
```bash
npm install monero-ts
```
This can create view-only wallets in Node.js without running a separate wallet-rpc process, but requires a full Monero node connection or trusted remote daemon.

### 8.3 Infrastructure Required

- **Monero daemon** (monerod) — either self-hosted (~150 GB disk, syncs in ~24h) or a trusted remote daemon (e.g., `node.moneroworld.com`). Self-hosted is strongly preferred for a privacy platform.
- **One monero-wallet-rpc process per campaign wallet**, OR use monero-ts with a single daemon connection managing multiple view-only wallets.
- **Polling interval** — every 60-120 seconds is reasonable. Monero blocks every ~2 minutes; more frequent polling adds no value.

### 8.4 Latency Profile

- Monero block time: ~2 minutes average
- Confirmation threshold: 10 blocks (~20 minutes)
- Polling interval: 60-120 seconds
- **End-to-end latency: 20-22 minutes** from donation broadcast to site showing updated balance (assuming a standard 10-confirmation threshold)

For pre-launch signaling (showing interest), this latency is acceptable. For milestone-based releases, the TEE itself would need to monitor the wallet, not just the Node.js server.

### 8.5 Complexity Assessment

**High.** Running a Monero full node on the Hetzner server adds significant infrastructure overhead:
- ~150 GB disk for the blockchain
- ~4 GB RAM for monerod
- Ongoing sync maintenance
- Per-campaign wallet file management

A simpler alternative for Phase 1: use a trusted remote node (e.g., `https://node.xmr.to:443`) with view-only wallets in monero-ts. This sacrifices self-sovereignty but reduces infrastructure from "medium startup" to "add one npm package."

---

## Section 9: Summary of Critical Findings

| Priority | Finding | File(s) | Fix |
|----------|---------|---------|-----|
| P0 | `ProposeModal` fires success on network failure | `ProposeModal.jsx:52-58` | Check `res.ok` before `setSubmitted(true)` |
| P0 | `HumanRegistry` ApplyModal same silent failure | `HumanRegistry.jsx:74-80` | Same fix |
| P0 | SightingForm "Nothing is collected" — inaccurate framing | `SightingForm.jsx:header` | Reword to "no identity data collected" |
| P0 | Interest counter resets on restart, user-visible | Backend `/interest` | Persist to disk |
| P0 | Verification bounty UI describes features that don't exist | `CampaignModal.jsx` (verify branch) | Add "Coming Soon" gates or remove unbuilt features from display |
| P1 | No admin UI — sightings pile up unreviewed | Backend + no frontend | Build minimal HTML admin page |
| P1 | Geocoding failures leave sightings stuck forever | Backend `/sighting` | Flag no-coords sightings separately in admin |
| P1 | `proposals.jsonl` and `registry.jsonl` have no read path | Backend | Add admin read endpoints |
| P1 | No rate limiting on any write endpoint | Backend, all POST routes | Add `express-rate-limit` |
| P1 | No backup strategy for .jsonl data files | Backend | Automate daily backups |
| P1 | Concurrent `appendFileSync` can corrupt JSONL | Backend | Serialize writes with async mutex |
| P1 | `CampaignCard.jsx` share URL uses hash fragment instead of route | `CampaignCard.jsx:22` | Use `/campaigns/${campaign.id}` |
| P2 | Admin secret in GET query string — logged everywhere | Backend `/admin/sightings` | Move to Authorization header |
| P2 | "IP logging disabled" claim not verifiable by users | `PrivacyPolicy.jsx` | Clarify scope of guarantee |
| P2 | TEE architecture described in present tense but not built | `Governance.jsx`, `Transparency.jsx` | Add "target architecture" framing |
| P2 | Funded campaign proof-of-execution section is hardcoded | `CampaignModal.jsx` | Plan data-driven receipts path |
| P2 | AI chat `/api/chat` has no rate limiting | Backend | `express-rate-limit` on this endpoint especially |
| P3 | JSONL read performance degrades at 50k+ sightings | Backend | Plan SQLite migration |
| P3 | Overpass API fallback count in `CameraCount.jsx` is hardcoded | `CameraCount.jsx:fallback` | Fine as-is, but update if the static number gets stale |

---

## Section 10: Gaps Between Claimed and Planned Model

The following planned features are either partially or entirely absent from both the frontend and backend:

| Planned Feature | Frontend Status | Backend Status | Gap |
|----------------|-----------------|----------------|-----|
| Reputation/tier system (Tier 0-4) | UI definitions in `VerificationTiers.jsx` | None | Full build required |
| XMR view key publishing | UI references "public view key" | None | Full build + Monero infrastructure |
| XMR balance monitoring | Not in any component | None | Full build |
| C2PA photo validation | UI claims it as anti-fraud layer | None | Upload pipeline + SDK integration |
| MuckRock FOIA verification | Not implemented | None | API integration needed |
| CourtListener lookup | Used only in ActivityTicker (read-only) | None | Full integration for verification |
| OpenStates legislative lookup | Not in any component | None | Not started |
| Milestone-based fund release | UI describes the concept | None | Full TEE integration |
| View key monitoring | Not implemented | None | Monero infrastructure |
| Community vouching | UI mentions it | None | Full build |
| Tier promotion logic | `campaigns.js:reputationEvents` defined | None | Full build |
| Campaign status management | Hardcoded in `campaigns.js` | None | Dynamic status API needed |
| Account/identity system | Fully absent | None | Full build — prerequisite for everything above |
| Staking for verification bounties | UI describes it in detail | None | Full build + XMR transaction logic |
| IPFS photo storage | UI claims "IPFS permanent storage" | None | IPFS integration |
| Governance voting mechanism | Defined in spec, not in code | None | Full build |

**The platform currently delivers:** A static informational site with a map, three write-only form endpoints (sighting, proposal, registry), an in-memory interest counter, and a proxied Ollama chat interface.

**Everything else described in the governance spec, transparency page, and campaign modals is aspirational.** This is appropriate for a pre-launch platform, but the gap between "described as designed" and "exists in code" is very large and should be systematically disclosed.

---

*Audit completed 2026-05-06. All file references are to `/deflect/src/`. Line numbers are approximate based on function boundaries.*
