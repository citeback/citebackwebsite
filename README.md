# Citeback

> Decentralized legal resistance to mass surveillance.

Citeback is an open-source platform that funds community-driven legal action against ALPR (Automated License Plate Reader) surveillance networks. Billboards. FOIA requests. Legal defense funds. All anonymously funded via Monero.

## What It Does

- **Maps** ALPR cameras submitted by the community (92,000+ cameras loaded from OpenStreetMap)
- **Funds campaigns** — billboards, FOIA requests, legal funds — via dedicated Monero (XMR) and Zano (ZANO) wallets
- **Operates transparently** — every disbursement logged publicly, every rule open source
- **Requires no accounts** — donate, vote, and participate with just a Monero address

## Architecture

Citeback is designed so no individual — including its founder — can unilaterally control funds or censor campaigns.

- **TEE-secured wallets** (Phase 2) — Trusted Execution Environment; wallet keys never leave the enclave
- **Community governance** — votes trigger AI execution; no human key holders
- **Open source rules** — all disbursement logic, fee models, and governance thresholds are in this repo
- **Append-only action log** — every wallet action is signed and logged permanently

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [GOVERNANCE.md](./GOVERNANCE.md) for full specs.

## Stack

- Vite + React
- Monero (XMR) + Zano (ZANO) — privacy-by-default donations
- Leaflet — camera map
- Ollama — local AI chatbot (optional)

## Running Locally

```bash
npm install
npm run dev -- --port 3002
```

## Current Status

**Phase 1 — Design & Community Review**

Campaign wallets are not yet live. Architecture and governance specs are open for community review. Phase 2 brings the TEE enclave and live wallets.

## Contributing

PRs welcome. All site changes go through public review. See GOVERNANCE.md for how rule changes work.

## License

MIT
