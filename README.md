# Citeback

**Community-funded legal resistance to mass surveillance.**

Citeback connects citizens with the campaigns, attorneys, and FOIA tools needed to push back against automated license plate readers, facial recognition systems, and other surveillance infrastructure — funded anonymously via privacy cryptocurrency.

→ **[citeback.com](https://citeback.com)**

---

## What It Is

A platform for running and funding surveillance resistance campaigns:

- **Campaigns** — FOIA requests, legal defense funds, billboard campaigns against ALPR networks
- **Camera map** — 95,000+ community-reported surveillance cameras from OpenStreetMap and verified sightings
- **Expert directory** — attorneys, journalists, and researchers working on surveillance law
- **No platform custody** — operator wallets are posted publicly; contributions go directly from contributor to operator; Citeback never holds funds
- **Anonymous by design** — contributors need no account; funded via [Monero (XMR)](https://getmonero.org) and [Zano (ZANO)](https://zano.org)

## How It Works

1. An operator claims a campaign and posts their XMR/ZANO wallet address
2. Contributors send directly to that wallet — no intermediary, no credit card
3. The operator provides a Monero view key, allowing anyone to verify the balance publicly
4. When the campaign milestone is reached, the operator executes and documents the outcome

See [GOVERNANCE.md](./GOVERNANCE.md) for the full governance model, voting rules, and operator accountability protocol.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + Leaflet |
| API proxy | Netlify Functions |
| Backend | Node.js (no framework) + SQLite (better-sqlite3) |
| Auth | JWT (httpOnly cookies) + WebAuthn passkeys |
| Hosting | Netlify (frontend) + Hetzner VPS (API + AI) |
| AI chatbot | Ollama + qwen2.5:7b (self-hosted, no logging) |
| Privacy coins | Monero (XMR) + Zano (ZANO) |

## Privacy Architecture

- All third-party API calls (OpenStreetMap, CourtListener, Congress.gov, OpenStates, Senate LDA) are **proxied through our servers** — your IP is never sent to external services
- Fonts are **self-hosted** — no CDN requests on page load
- The AI chatbot runs **locally on our VPS** — conversations are never logged or used for training
- Account emails are **AES-256-GCM encrypted at rest**

See [docs/internal/ARCHITECTURE-REPUTATION.md](./docs/internal/ARCHITECTURE-REPUTATION.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) for full specs.

## Security

Responsible disclosure: **citeback@proton.me**

See [SECURITY.md](./SECURITY.md) for our full security policy and scope.

The server-side code running at `ai.citeback.com` publishes a SHA-256 hash of itself at [ai.citeback.com/version](https://ai.citeback.com/version) so anyone can verify the live server matches the public source.

## Running Locally

```bash
npm install
npm run dev        # frontend at http://localhost:5173
```

The backend API runs separately on the Hetzner VPS. For local development, API calls target `https://ai.citeback.com` by default (see `src/config.js`).

## Current Status

**Pre-launch.** Accounts, passkeys, the camera map, and the expert directory are live. Campaign wallets are not yet active — operators are in onboarding. See [PRE-LAUNCH.md](./PRE-LAUNCH.md) for the full checklist.

## Repository Structure

```
src/                  React frontend
  components/         Page components
  context/            Auth, camera count context
  data/               Static campaign and layer data
netlify/functions/    Serverless API proxy (external calls)
public/               Static assets, fonts, sitemap, security.txt
server.js             VPS backend source (deployed to Hetzner)
GOVERNANCE.md         Governance rules, voting, operator accountability
ARCHITECTURE.md       Technical architecture overview
SECURITY.md           Vulnerability disclosure policy
PRE-LAUNCH.md         Launch checklist
TERMS.md              Terms of service (draft, pending attorney review)
docs/internal/        Internal audit reports and research
```

## License

[MIT](./LICENSE)
