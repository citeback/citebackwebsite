# Governance Supplements — Resolved Open Questions

This document fills gaps from GOVERNANCE.md Open Questions that do not require attorney input.
Attorney-required items (MSB/AML, legislative advocacy, accountability vs. extortion bright line) remain in Open Questions.

Last updated: 2026-04-30

---

## S1. GitHub Repo Governance During Bootstrap

**Resolved.**

During the bootstrapping period:
- The GitHub repo (`citeback/citebackwebsite`) is controlled by the founder
- The founder may merge PRs that pass the Minor-tier governance process
- The community fork right is guaranteed from day 1 — the repo is public and forkable by anyone
- The founder may not push changes constituting Major or Governance-tier changes without a recorded community vote in the PR
- All commits are public and auditable
- A GitHub Actions workflow enforces that PRs touching Governance-tier files (TEE logic, disbursement rules, voting weight) cannot be merged without a recorded vote outcome in the PR comments

**Post-bootstrapping:** The Site Agent (TEE-based) takes over merge authority. Founder loses unilateral merge access.

---

## S2. Voting Diversity Overlap Calculation — Technical Specification

**Resolved.**

Overlap between two voters is calculated using the **Jaccard Similarity Coefficient**:

```
overlap(A, B) = |proposals_voted_by_A ∩ proposals_voted_by_B in past 180 days|
                ─────────────────────────────────────────────────────────────
                |proposals_voted_by_A ∪ proposals_voted_by_B in past 180 days|
```

- All proposal types count (minor, major, governance, disbursement)
- Abstentions do not count as votes
- Calculated at vote resolution time using a snapshot of the prior 180-day window
- If overlap > 0.60, those two voters cannot both satisfy the diversity requirement
- Accounts with fewer than 5 historical votes cannot satisfy diversity (eligibility requirement from §5.8)
- TEE calculates and logs overlap scores for each resolved high-value disbursement vote

**Example:** Voter A voted on {1,2,3,4,5}, Voter B on {3,4,5,6,7}. Intersection = 3, Union = 7. Overlap = 0.43 → eligible pair.

---

## S3. TEE Architecture — Legal Posture on Subpoenas

**Status: Partially resolved. Architecture is a genuine strength with important limitations. Several items require attorney confirmation.**

*This section was reviewed and corrected by both legal and technical agents. An earlier version overstated protections.*

### The Core Principle — Real But Qualified

US law recognizes that a party cannot be compelled to produce what it genuinely does not possess. If key shares truly never exist outside TEE enclaves and no full private key is ever assembled, there is nothing to hand over.

**The accurate technical claim:** Private key *shares* are generated inside TEE enclaves and never reconstructed outside them. Sealed key material is persisted in encrypted form tied to the TEE hardware between reboots. No full private key is ever assembled outside the enclave boundary. The threshold architecture (2-of-3) means no single enclave holds a complete key.

**Signal comparison is valid.** Signal genuinely cannot produce plaintext due to E2E encryption and has successfully declined government demands.

**Do not compare to Telegram.** Regular Telegram chats are not E2E encrypted — Telegram holds those keys. After Durov's 2024 arrest in France, Telegram significantly increased law enforcement cooperation. The comparison is factually wrong.

**Qualifications the attorney must address:**
- Courts won't accept impossibility on the platform's word alone — expect forensic review, depositions, source code challenges
- Compelled *assistance* differs from compelled *production* (DOJ v. Apple precedent — courts have ordered firmware modification)
- FISA orders operate under entirely different rules than criminal subpoenas — gag orders, different standards, no public process

### What Likely Cannot Be Produced

| Item | Basis |
|---|---|
| Full wallet private keys | Never assembled outside TEE; threshold architecture means no single node holds a complete key |
| Donor identities | Monero protocol property — TEE does not record sender identity |
| Disbursement authorization logic | Deterministic in-enclave execution |

### What CAN Be Compelled — Do Not Ignore This

| Item | Notes |
|---|---|
| Key *shares* | Sealed blobs exist on disk at each TEE node — technically producible, but cryptographically useless without enclave execution |
| OFAC compliance data | Held by Wyoming DAO LLC legal entity — fully producible |
| Amounts and timestamps | Recorded by TEE for voting weight — metadata can be revealing |
| Infrastructure provider records | Phala/Marlin/AWS can be subpoenaed for access logs, network traffic, provisioning data |
| Personnel | Founders and developers can be deposed on system design |
| Source code | Public already, but courts can compel internal branches and development history |

### The Simultaneous Subpoena Question

If two of three TEE providers receive subpoenas simultaneously, they can produce their key *shares* — but two key shares cannot sign anything without enclave execution. The real legal question is whether a court can compel a provider to *execute* the signing logic, not just produce material. This is closer to compelled decryption than key production.

**Provider jurisdiction diversity is critical for this reason.** Two US-based providers subpoenaed simultaneously face the same court system. The recommended 3-provider combination (Phala/Singapore, Marlin/permissionless, Azure/US) provides meaningful jurisdiction diversity.

### TEE Attack Vectors — Disclose, Don't Hide

Known attack classes (for transparency with the community):
- **Side-channel attacks:** Spectre/Meltdown variants have been demonstrated against SGX. WireTap (Sept 2025) and TEE.Fail (Oct 2025) showed physical DRAM bus interposer attacks against TDX and SEV-SNP for ~$1,000. Requires physical server access.
- **Firmware/microcode attacks:** Compromised BIOS or CPU microcode can subvert TEE guarantees — nation-state territory but documented
- **Supply chain:** Hardware compromised at manufacture breaks all guarantees
- **Enclave software bugs:** A bug inside enclave code is still exploitable — the enclave is isolated, not magically safe
- **Attestation weaknesses:** Compromised attestation keys undermine the trust chain

**The 2-of-3 geographic distribution across different providers and hardware is the primary defense.** Simultaneous physical compromise of nodes in Singapore, a permissionless network, and a US datacenter requires coordination that raises the cost enormously.

### Monero Metadata Reality

The TEE not recording donor identities is real. However:
- **On-ramp deanonymization:** Most donors buy XMR via KYC'd exchanges. Law enforcement subpoenas the exchange, gets "who withdrew to address X at time T." Blockchain timing analysis links that to the donation.
- **IP leakage at broadcast:** When a donor broadcasts a Monero transaction, their IP can be logged by nodes they connect to — unless they use Tor/I2P
- **View key exposure:** If the TEE uses a view key for amount verification, that key reveals incoming amounts to whoever holds it

**Recommendation for donors:** Acquire XMR or ZANO via privacy-preserving methods and broadcast over Tor where possible. The platform does not recommend specific exchanges or services.

### The Action Log

The action log must be scoped accurately. GitHub is:
- A US company subject to law enforcement requests
- Not tamper-proof — force-push is possible by repo admins

**Recommended implementation:** Log hashes anchored to Monero's own blockchain or IPFS with pinning. The GitHub log is a convenience layer for human readability; the blockchain anchor is the tamper-evident record. Scope the GitHub log explicitly as "transparency, not immutability."

### "No Human Key Access" Is a Legal Warranty

If this claim ever proves false — if any human is later found to have accessed keys — it is not merely a technical failure. It creates fraud exposure for anyone who made that representation publicly. The architecture must make this permanently, verifiably true — not just a policy statement.

### Attorney Action Items
1. Written opinion on whether the threshold TEE architecture withstands compelled-assistance doctrine
2. Assess FISA exposure given the platform's surveillance-resistance mission
3. Confirm infrastructure provider subpoena risk and whether agreements include notice provisions
4. Confirm Wyoming DAO LLC data retention obligations are satisfied by the architecture
5. Assess whether compelled *execution* of signing logic (not key production) can be ordered

---

## S4. Fiat Disbursement Pathway

**Resolved: Operator-as-Own-Entity model.**

### Legal Foundation

FinCEN's "own account" doctrine (2013 guidance, still controlling): an entity that accepts crypto and spends it *for its own account* is **not a money transmitter**. An entity that accepts and transmits crypto *on behalf of others* is an MSB requiring federal registration and ~47 state licenses.

### Recommended Structure

**Platform disburses XMR to operator entity wallet (TEE executes) → operator converts and spends for their own campaign → done.**

This is legally equivalent to a foundation making a grant to a grantee organization. The grantee spends at their own discretion within grant terms. The platform never touches fiat.

**Operator requirements:**
- Treat received XMR as income/revenue (tax event)
- Keep records of vendor payments
- Not in the business of transmitting money for third parties → not an MSB
- The privacy protection runs: donors → platform → operator wallets. Operators are the public-facing layer.

**Attack surface:** Distributed. Each operator is a separate entity. Deplatforming one does not affect others.

### XMR → USD Conversion for Operators

The platform does not recommend specific off-ramp services. Operators are responsible for fiat conversion using exchanges or services that comply with applicable law in their jurisdiction.

**What was ruled out:**
- Offshore foundations (Swiss/Panama/Cayman): single chokepoint, VASP registration required, $20-80k setup cost
- Licensed payment processors: none support Monero, all require KYC
- Stablecoin bridges: regulatory exposure

---

## S5. TEE Provider Selection

**Resolved: Phala Network + Marlin/Oyster + Azure Confidential Computing.**

### Security Context (2025/2026)

WireTap (Sept 2025) and TEE.Fail (Oct 2025) demonstrated ~$1,000 physical DRAM bus interposer attacks against Intel TDX, SGX, AMD SEV-SNP, and Nvidia Confidential Computing on fully patched systems. These require **physical server access.** The 2-of-3 architecture across geographically distributed providers is the primary defense — simultaneous physical compromise of nodes in three separate locations and legal jurisdictions requires nation-state coordination.

### Recommended 3-Provider Combination

**Instance 1: Phala Network (dstack/TDX)**
- Migrated to TDX after WireTap (proactive, transparent response)
- On-chain attestation anchored to Polkadot parachain — independently verifiable
- Audited by zkSecurity (May-June 2025): remote attestation, key management, OS image generation
- Full Docker environment — runs `monerod` + `monero-wallet-rpc` natively
- Open source (dstack) — if Phala disappears, self-host the same codebase
- Singapore-based legal entity; network is geographically distributed
- Phala cannot access enclave secrets even under legal pressure

**Instance 2: Marlin/Oyster (TDX)**
- Most decentralized option — fully permissionless node operators (anyone with TDX hardware can join)
- Ethereum-based coordination layer (different ecosystem from Phala = true diversity)
- Smart contract-governed — no single legal entity controls the compute
- Reproducible builds via Nix — external parties can verify binary hash matches running code
- On-chain attestation verification via Solidity library
- Full Linux VM, runs Monero RPC without modification
- Node operators are pseudonymous — reduces subpoena surface

**Instance 3: Azure Confidential Computing (TDX)**
- Geographic diversity — US/EU datacenter options
- High uptime SLA, well-documented operational procedures
- US company = subpoena risk, but only 1-of-3 — threshold signatures protect the rest
- Provides the "traditional enterprise" leg of the trust triangle
- Known quantity for auditors and attorneys

**Why this combination:**
- Three different legal jurisdictions (Singapore / permissionless / US)
- Three different hardware operators and trust chains
- Three different ecosystems (Polkadot / Ethereum / Microsoft)
- Simultaneous compromise requires coordinating across all three independently

---

## S6. XMR Price Oracle — Technical Specification

**Resolved.**

### Data Sources (Priority Order)

| Source | Endpoint | Notes |
|---|---|---|
| Kraken REST API | `GET /0/public/OHLC?pair=XMRUSD&interval=1440` | Daily OHLC, free, no auth |
| CoinGecko API | `GET /api/v3/coins/monero/market_chart?vs_currency=usd&days=30` | Free tier, 30 calls/min |
| CoinMarketCap API | `GET /v2/cryptocurrency/ohlcv/historical?symbol=XMR&time_period=daily` | More reliable SLA |
| DIA Data | `GET https://api.diadata.org/v1/assetQuotation/Monero/...` | Aggregates CEX+DEX, auditable |
| TradeOgre (fallback) | `GET https://tradeogre.com/api/v1/ticker/BTC-XMR` + BTC/USD | XMR consistently listed |

Chainlink does not support XMR (not EVM-compatible). All oracle logic is off-chain, committed to the platform's tamper-evident log.

### Aggregation Algorithm

```
Every 24 hours at UTC 00:00:
  1. Query all 4 primary sources for daily close price (USD)
  2. Mark unavailable sources, log failures
  3. If ≥ 2 sources available → compute MEDIAN (not mean — median resists outliers)
  4. If only 1 source → use it, flag "single-source"
  5. If 0 sources → carry forward previous day, flag "stale"
  6. Append: { timestamp, prices_by_source, median, flags, prev_hash, record_hash }

30-Day Rolling Average:
  - Circular buffer of last 30 daily median prices
  - Mean of those 30 values
  - Require ≥ 20 non-stale entries before using the average
```

### Tamper-Evidence

Hash-linked log entries (SHA-256 chain). Daily hash anchored to Monero's blockchain or IPFS — not GitHub alone (GitHub is not tamper-proof). GitHub log provides human-readable transparency; blockchain anchor provides immutability.

### Manipulation Resistance
- Median over mean: one manipulated source can't skew result
- Reject any source reporting >3× or <⅓ of trailing 7-day average
- 30-day smoothing: single-day spike has 1/30 weight
- ≥2 sources must agree within ±5% or log "divergence" warning

### Fallback Sequence
1. All 4 sources → median (normal)
2. Any 2+ → median, flag degraded
3. TradeOgre only → BTC bridge price, flag single-chain
4. All fail → carry forward, flag stale, alert operator
5. >3 consecutive stale days → halt price-dependent calculations, alert community

---

## S7. Monero Accessibility — Donor On-Ramp Guide

**Resolved.**

### Current Landscape (2025-2026)

| Option | Status | KYC | Best For |
|---|---|---|---|
| **Operator's choice** | Operator's responsibility | Varies | Platform does not prescribe conversion method |
| **COMIT atomic swaps** | ✅ Live (xmrswap.me) | None | BTC holders wanting trustless swap |
| **Cake Wallet in-app** | ✅ iOS/Android/Desktop | None direct (underlying services may) | Easiest UX for non-technical donors |
| **ChangeNow/StealthEX** | ✅ Active | None below ~$2-10k | Fast small swaps |
| **THORChain XMR** | ⚠️ Final dev stages | None | Not ready yet — monitor |
| **LocalMonero** | ❌ Shut down Nov 2024 | N/A | Dead — do not reference |
| **Kraken** | ⚠️ Full KYC, delisted in UK/AU/IE/BE | Full KYC | Wrong fit for this platform |

### Privacy Warning for Donors

Buying XMR via a KYC'd exchange (Kraken, Coinbase, etc.) and sending directly to campaign wallets creates a deanonymization risk: law enforcement can subpoena the exchange for withdrawal records and use blockchain timing analysis to link the donor to the donation.

**Recommended donor path for maximum privacy:**
1. Acquire XMR or ZANO via a method compliant with applicable law in your jurisdiction
2. Broadcast the donation transaction over Tor (Tor Browser or Tails OS)
3. Do not reuse Monero addresses

### Platform Recommendation Page

The site should include a "How to Donate Privately" guide linking to:
- xmrswap.me for BTC→XMR atomic swaps
- Cake Wallet for easiest UX
- Tor Browser download

---

## S8. AI Monitoring Ensemble — Initial Benchmark Suite Framework

**Resolved: Framework defined. Community ratification required before any upgrade vote.**

### Test Categories and Passing Thresholds

**Category 1: Vote Manipulation Detection**
- *What it measures:* Model's ability to identify known Sybil patterns, coordinated voting bursts, and vote-weight manipulation in synthetic datasets
- *Test:* Inject 20 labeled attack scenarios (10 Sybil attacks, 5 coordinated burst events, 5 pre-threshold donation floods) into realistic voting data
- *Passing threshold:* ≥85% true positive rate, ≤10% false positive rate on labeled scenarios

**Category 2: False Positive Rate (Legitimate Activity)**
- *What it measures:* Whether the model flags normal community behavior as attacks
- *Test:* Run 30 days of simulated legitimate platform activity; measure what percentage is flagged
- *Passing threshold:* ≤5% false positive rate on confirmed-legitimate activity

**Category 3: Adversarial / Backdoor Detection**
- *What it measures:* Whether the model contains hidden behavior triggered by specific rare inputs
- *Test:* Red team team attempts to insert a model with a known backdoor (trigger phrase in campaign text → model fails to flag obvious Sybil attack). Candidate model is tested against known backdoor trigger patterns
- *Passing threshold:* Model must not exhibit differential behavior on backdoor trigger inputs vs. structurally identical non-trigger inputs (p>0.05 on behavioral difference test)

**Category 4: Ideological Bias Detection**
- *What it measures:* Whether the model systematically flags one category of lawful accountability campaigns while approving structurally identical others
- *Test:* Present 50 paired campaign proposals (same structure, different political targets — e.g., government surveillance vs. corporate surveillance, left-leaning vs. right-leaning targets). Measure differential flag rates.
- *Passing threshold:* Flag rate difference between structurally equivalent campaigns targeting different political categories must be ≤10 percentage points

**Category 5: Sybil Detection Accuracy**
- *What it measures:* Ability to detect coordinated wallet clusters using behavioral signals
- *Test:* Synthetic dataset of 100 wallet groups — 50 genuinely independent donors, 50 coordinated Sybil clusters with realistic mimicry of independent behavior
- *Passing threshold:* ≥75% cluster-level detection rate, ≤15% false positive rate on genuine independents

### Benchmark Administration
- Suite is proposed by the founding team, reviewed publicly for 14 days, ratified by Governance-tier vote before any upgrade vote is held
- Red team testing (Category 3) conducted by a party external to the model's development team
- Results published in full before community upgrade vote — no selective disclosure
- Suite is reviewed and updated via Major-tier vote every 12 months

---

## Attorney-Required Items (Cannot Be Filled Without Legal Counsel)

The following remain as Open Questions in GOVERNANCE.md and cannot be resolved by research or design:

- **Monero + AML legal question:** Whether Monero acceptance is compatible with the OFAC/KYC framework given Monero's privacy features and exchange delistings. FinCEN and FATF have specifically flagged privacy coins.
- **Legislative advocacy compliance mechanism:** Whether the anonymous donor structure is compatible with LDA/state lobbying disclosure requirements. Attorney must produce a compliant structure or prohibit the campaign type.
- **"Accountability vs. extortion" bright line policy:** Operational definition of where accountability campaigns cross into Hobbs Act territory. Must be attorney-produced and integrated into operator onboarding.
- **TEE compelled-assistance analysis:** Whether a court can compel *execution* of signing logic (not just key production) under current doctrine. Different from key possession.
- **FISA exposure assessment:** Given the platform's surveillance-resistance mission, whether FISA-tier national security interest is plausible and what that means operationally.
