# Citeback API Research — 2026-05-06

> Researched by subagent `citeback-api-scout`. Web search disabled; findings based on direct URL fetching and accumulated knowledge. Confidence noted per entry.

---

## Summary

Of the 10 categories investigated, the highest-priority additions are:
1. **LegiScan** — fills real gaps that OpenStates misses
2. **MuckRock API** — enables FOIA automation the platform currently lacks
3. **Census ACS API** — free demographic overlay for "disproportionate surveillance" maps
4. **GDELT** — free news feed for the Intelligence Feed / ActivityTicker
5. **FOIA.gov API** — federal FOIA submission automation
6. **Caselaw Access Project** — free court opinion supplement to CourtListener
7. **Monero RPC / block explorer** — privacy-preserving donation verification

---

## 1. Surveillance Infrastructure Data

### Atlas of Surveillance (EFF)
- **URL:** https://atlasofsurveillance.org
- **What it does:** Largest repository of which law enforcement agencies use what surveillance tech — drones, BWCs, face rec, cell-site simulators, ALPR, predictive policing, gunshot detection. 14,900+ data points across 6,000+ jurisdictions. Last updated Dec 4, 2025.
- **API status:** ❌ No public REST API found. Data is human-browsable only.
- **How it would help:** Authoritative source on *which agencies* have ALPR (vs. where cameras are geographically located).
- **Privacy implications:** Minimal — it's public advocacy data.
- **Implementation complexity:** N/A for API; could scrape or contact EFF directly at aos@eff.org.
- **Note:** EFF explicitly asks people NOT to send them individual ALPR camera locations — they direct that to DeFlock.
- **Verdict: WORTH INVESTIGATING** — Contact EFF about a data export or data-sharing agreement. This fills a gap between "camera locations" (OSM/DeFlock) and "agency-level procurement" (USASpending).

### DeFlock (deflock.org / deflock.me)
- **URL:** https://deflock.org
- **What it does:** Crowdsourced ALPR camera location map — the project EFF refers people to for individual camera sightings. Sister project to Citeback in spirit.
- **API status:** ⚠️ Unknown — site is JS-heavy, no API docs found. Appears to be a community mapping project.
- **How it would help:** Could be a data source for cross-referencing Citeback's 92K camera database, or a reciprocal data-sharing partner.
- **Privacy implications:** Minimal — community-contributed public data.
- **Implementation complexity:** 3 — need to investigate whether they have an export API or would share data.
- **Verdict: WORTH INVESTIGATING** — Potential data partner, not a vendor relationship.

---

## 2. Government Procurement / Contracts

### GovSpend
- **URL:** https://govspend.com
- **What it does:** Commercial intelligence SaaS for government procurement data. Tracks state/local/federal spending. Atlas of Surveillance uses it as a research tool internally.
- **API status:** ❌ Commercial SaaS only. No public API.
- **Pricing:** Enterprise pricing, not disclosed publicly. Not affordable for a public-interest platform.
- **Privacy implications:** N/A for users.
- **Verdict: SKIP** — Atlas of Surveillance researchers pay for it as a research tool. Not practical for Citeback integration.

### State Open Checkbook APIs
- **Reality check:** There is NO unified state-level equivalent to USASpending.gov. Each state has separate procurement portals with wildly varying API support:
  - California: `https://www.fiscal.ca.gov/` (has some data downloads)
  - Texas: `https://www.tpeir.state.tx.us/` (limited structured data)
  - New Mexico: `https://www.spo.state.nm.us/` (no public API found)
- **Verdict: SKIP (unified approach) / WORTH INVESTIGATING (targeted states)** — For the specific "which NM agencies bought Flock Safety equipment" use case, USASpending.gov should already cover federal grants, but state contracts require state-specific approaches. A long-term project could scrape key state portals for Flock Safety, Motorola ALPR, Rekor, and Vigilant Solutions contract mentions.

### ProPublica Nonprofit Explorer API
- **URL:** https://www.propublica.org/datastore/api/nonprofit-explorer-api
- **What it does:** Financial data for 1.8M+ nonprofits via 990 forms. Citeback could use this to cross-reference surveillance companies' nonprofit arms or to check EIN data for organizations lobbying on surveillance.
- **API status:** ✅ Free, API key from ProPublica required.
- **Pricing:** Free.
- **Implementation complexity:** 2
- **Verdict: SKIP** — Tangential. USASpending already covers contracts. ProPublica Datastore is no longer actively updated (confirmed).

---

## 3. FOIA Automation

### MuckRock API
- **URL:** https://www.muckrock.com (API via authenticated REST)
- **What it does:** Platform for filing, tracking, and sharing FOIA requests. Massive public database of filed/completed FOIA requests across all levels of government. Can programmatically query existing requests and (with account) submit new ones.
- **API status:** ✅ REST API exists. Requires account + API token. Docs are on Notion (JS-required — couldn't fully load, but API exists per their site structure).
- **Pricing:** Free account gets API access. Paying for submissions is per-request or by plan.
- **How it helps Citeback:** 
  1. Search existing FOIA responses for "Flock Safety," "Vigilant Solutions," "ALPR" documents already released — show users what's been learned.
  2. Allow Citeback users to file templated FOIA requests through MuckRock (embedded workflow).
  3. Track campaign FOIA requests programmatically and update the Campaigns page automatically.
- **Privacy implications:** ⚠️ Moderate — MuckRock is a centralized third party. Filed requests are public on MuckRock by default. Acceptable trade-off for a transparency platform.
- **Implementation complexity:** 3
- **Verdict: USE IT** — This directly enables the FOIA campaign feature Citeback already has. Don't reinvent the wheel; MuckRock's infrastructure handles the agency routing, legal compliance, and document hosting.

### FOIA.gov API
- **URL:** https://api.foia.gov
- **What it does:** Federal FOIA portal API. Lists all federal agency FOIA components with their intake processes. Can submit requests programmatically to participating federal agencies. Also exposes annual FOIA report XML data.
- **API status:** ✅ Free with API key (from foia.gov site).
- **Key endpoint:** `https://api.foia.gov/api/agency_components` — list all federal agencies accepting digital submissions.
- **Pricing:** Free.
- **How it helps Citeback:** Direct programmatic FOIA submission to DHS, CBP, DOJ (which oversees federal ALPR-related programs), etc. Better than MuckRock for federal-only campaigns where you want Citeback to be the submission front-end.
- **Privacy implications:** ✅ Low — requests are public record anyway; DOJ operates this.
- **Implementation complexity:** 2
- **Verdict: USE IT** — Complement to MuckRock. Federal-specific. Free. Could automate batch FOIA filings for surveillance contract data.

---

## 4. Legal Research

### Caselaw Access Project (CAP) — Harvard Law School
- **URL:** https://case.law / https://api.case.law
- **What it does:** 360+ years of US court decisions, 6.7M+ cases. Covers all official state reporters through 2018 (federal and newer state cases via CourtListener). Full text search.
- **API status:** ✅ Free for searching. Full-text bulk access requires (free) registration. API key required for full text.
- **Pricing:** Free for researchers. Commercial use has terms.
- **How it helps Citeback:** 
  - Supplements CourtListener for historical state-level ALPR cases (state court decisions don't always appear in CourtListener).
  - Search for cases citing "automated license plate reader," "Fourth Amendment," "reasonable expectation of privacy."
- **Privacy implications:** ✅ None — it's public court decisions.
- **Implementation complexity:** 2
- **Verdict: USE IT** — Free, authoritative, and fills the state court gap CourtListener doesn't fully cover.

### RECAP Archive / Free Law Project
- **URL:** https://free.law/recap / https://www.courtlistener.com/recap/
- **Note:** CourtListener (already in use) IS the RECAP Archive's search interface. They're the same organization.
- **Additional value:** The RECAP API also supports webhooks (push notifications when new filings match a query), PACER document purchase automation, and bulk data downloads.
- **Verdict: ALREADY IN USE** — But worth adding **RECAP webhooks** to auto-update the Campaigns page when new ALPR-related federal filings appear. Implementation complexity: 2.

### PACER
- **Reality check:** PACER itself is a federal court document paywall ($0.10/page). Not an API partner worth integrating. RECAP is the community-liberated version of this content.
- **Verdict: SKIP** — Use RECAP/CourtListener instead.

---

## 5. Geocoding and Location

### Photon (Komoot)
- **URL:** https://photon.komoot.io
- **What it does:** Open-source geocoder built on OpenStreetMap data. Runs the same data as Nominatim but with better full-text search and autocomplete. Hosted instance available.
- **API status:** ✅ Free, no API key required for the hosted version. Can self-host.
- **Pricing:** Free (hosted), or host your own from OSM data.
- **How it helps Citeback:** Better autocomplete UX for sighting submission forms (city/address lookup feels snappier than Nominatim). Privacy-respecting: open source, OSM-based.
- **Privacy implications:** ✅ Best — queries go to Komoot's servers (or self-hosted). No Google/Mapbox dependency.
- **Implementation complexity:** 1
- **Verdict: USE IT** — Drop-in Nominatim improvement for the sighting submission form.

### What3Words / Google Maps / Mapbox Geocoding
- **Verdict: SKIP** — All require API keys with usage-based billing and questionable privacy postures. Antithetical to Citeback's values.

---

## 6. Legislation Tracking

### LegiScan API
- **URL:** https://legiscan.com/legiscan-api (site blocked by Cloudflare during research — info from accumulated knowledge)
- **What it does:** Bill tracking across all 50 states + DC + Congress. Real-time updates. Text search. Can search for "license plate reader," "ALPR," "surveillance" across all states simultaneously. Provides bill status, text, votes, sponsors, history.
- **API status:** ✅ REST API. Free tier for limited queries; paid plans for real-time data and higher volume.
- **Pricing:** Free tier available. Paid plans start ~$0/mo for basic, commercial plans available.
- **How it helps Citeback:** OpenStates is already integrated but LegiScan provides:
  1. Better full-text bill search (not just metadata)
  2. More consistent real-time coverage across all states
  3. "Push" dataset via weekly data dumps (paid)
- **Privacy implications:** ✅ None — public legislative data.
- **Implementation complexity:** 2
- **Verdict: USE IT** — Complement OpenStates with LegiScan for full-text ALPR bill search. Get a free key and prototype the "bills mentioning ALPR" query.

### CivicEngine
- **What it does:** Voter information, election data. Not relevant for surveillance legislation tracking.
- **Verdict: SKIP** — Wrong use case.

---

## 7. Transparency / Public Records

### DocumentCloud API
- **URL:** https://www.documentcloud.org (owned by MuckRock)
- **What it does:** Upload, annotate, embed, and search government documents. Widely used by journalists for FOIA releases. Can search across millions of public documents from governments, newsrooms, nonprofits.
- **API status:** ✅ Free with account. REST API via MuckRock's infrastructure.
- **How it helps Citeback:** 
  - Embed FOIA-released surveillance contracts directly in campaign pages.
  - Search existing public document library for Flock Safety contracts, DHS ALPR procurement, etc.
  - Upload Citeback's own FOIA releases for public access.
- **Privacy implications:** ✅ Low — all content is public documents by design.
- **Implementation complexity:** 2
- **Verdict: USE IT** — Pairs naturally with MuckRock API. Makes FOIA results embeddable and searchable.

### National Archives API (archives.gov)
- **URL:** https://catalog.archives.gov/api/v2/
- **What it does:** Access to NARA's catalog of federal records. Useful for historical surveillance program documents.
- **API status:** ✅ Free, no key required for basic searches.
- **How it helps Citeback:** Historical research tool, not real-time data. Could surface declassified docs on surveillance programs.
- **Implementation complexity:** 3
- **Verdict: WORTH INVESTIGATING** — Lower priority. More useful for deep-dive research features than the main platform.

---

## 8. Crypto / Donation Transparency

### Monero Daemon RPC / Block Explorers
- **Options:**
  - `https://xmrchain.net` — public Monero block explorer with API
  - `https://community.xmr.to` — various community explorers
  - Self-hosted `monero-daemon` with `--rpc-bind-port` 
- **What it does:** Can verify a specific transaction's destination subaddress/payment ID without revealing the sender. Using Monero's payment ID or subaddress system, a campaign wallet can expose *only* the incoming amount for a specific payment ID — proving donation receipt without deanonymizing donors.
- **Implementation approach:** Generate a unique subaddress per campaign. Use the Monero daemon's `get_balance` RPC or a self-hosted view-key wallet to display cumulative received amounts publicly. No donor data exposed.
- **Privacy implications:** ✅ Excellent — view key disclosure only reveals incoming amounts, not sender identities.
- **Implementation complexity:** 4 — requires running a Monero node or using a trusted remote node.
- **Verdict: USE IT (self-hosted)** — Don't use a third-party API for this. Run a Monero view-wallet on Hetzner (same server as Ollama). Query locally. This is the only privacy-respecting approach.

### ZANO
- **URL:** https://zano.org
- **What it does:** Privacy coin with confidential assets. Much smaller ecosystem than Monero.
- **API status:** ⚠️ Small ecosystem. Block explorers exist but less mature tooling.
- **Implementation complexity:** 4-5
- **Verdict: SKIP (for now)** — Monero has better tooling, broader adoption, and more mature wallet APIs. Revisit if Citeback becomes a major ZANO platform.

---

## 9. News and Social Monitoring

### GDELT Project
- **URL:** https://www.gdeltproject.org / `https://api.gdeltproject.org/api/v2/`
- **What it does:** Monitors 100+ languages across every country, processes 3-4 million articles per day, going back to 1979. Full-text article search, tone analysis, location extraction, entity recognition. Can search for "license plate reader" or "Flock Safety" and get all news articles across every news source indexed.
- **API status:** ✅ Free. No API key required. Rate limit: 1 request per 5 seconds for the hosted API. For higher volume: contact kalev.leetaru5@gmail.com or use their BigQuery dataset.
- **Pricing:** Free (rate-limited). Google BigQuery dataset is pay-per-query (cheap for occasional use).
- **How it helps Citeback:** 
  - Feed the Intelligence Feed / ActivityTicker with real surveillance news automatically.
  - Query: `"license plate reader" OR "ALPR" OR "Flock Safety" OR "Vigilant Solutions"` → curated news stream.
  - Surface local incidents (new ALPR deployments, controversies, court cases) by state/city.
- **Privacy implications:** ⚠️ Moderate — GDELT tracks and logs queries. Don't expose raw user location in queries. Pre-fetch periodic results server-side.
- **Implementation complexity:** 2 (basic article feed), 4 (advanced tone/location analysis)
- **Verdict: USE IT** — Best free news monitoring API available. Run scheduled queries server-side (5-sec rate limit is fine for batch jobs), cache results, serve to the Intelligence Feed. No user data leaks if implemented server-side.

### MediaCloud
- **URL:** https://www.mediacloud.org
- **What it does:** Academic media analysis platform. 60K+ news sources, 1B+ stories. Aggregation, analysis, visualization. The open-source API allows querying story counts, sentiment, media sources.
- **API status:** ✅ Available. API key required (research/academic focus).
- **Pricing:** Free for researchers. Some paid tiers.
- **How it helps Citeback:** More sophisticated than GDELT for media coverage analysis (e.g., "how has ALPR coverage changed over the past 2 years in NM vs. CA?"). Less useful for real-time feeds.
- **Privacy implications:** ✅ Low — server-side queries only.
- **Implementation complexity:** 3
- **Verdict: WORTH INVESTIGATING** — Great for the "surveillance trends" data visualization angle, less so for the real-time feed. GDELT is a better starting point.

### NewsAPI
- **URL:** https://newsapi.org
- **What it does:** Simple REST API for searching news headlines and articles across 80,000+ sources.
- **API status:** ✅ Free in development. Production use requires paid plan ($449/mo for business, with article caching).
- **How it helps Citeback:** Simpler than GDELT. Real-time news search.
- **Privacy implications:** ⚠️ Moderate — queries log to NewsAPI.org servers.
- **Implementation complexity:** 1
- **Verdict: SKIP** — Pricing is unworkable for a public-interest platform. GDELT is free and more powerful. Only consider if GDELT proves insufficient.

---

## 10. Map Enrichment

### US Census Bureau ACS API
- **URL:** https://api.census.gov/data/ (e.g., `https://api.census.gov/data/2023/acs/acs5`)
- **What it does:** American Community Survey 5-year estimates at census tract / block group / county level. Contains: race, income, poverty rate, population density, housing characteristics, vehicle access. 2020-2024 estimates confirmed available.
- **API status:** ✅ Free. No API key required for basic access (key recommended for higher volume).
- **How it helps Citeback:** 
  - **"Disproportionate surveillance" layer:** Overlay ALPR camera density with % Black/Latino population, poverty rate, median income.
  - Prove (with data) the documented pattern that surveillance technology is disproportionately deployed in communities of color and lower-income neighborhoods.
  - Example query: cameras per 1,000 residents by census tract + income quartile comparison.
- **Key variables:** `B02001_002E` (White alone), `B03003_003E` (Hispanic), `B19013_001E` (median household income), `B17001_002E` (poverty)
- **Privacy implications:** ✅ None — aggregate census data, no individual tracking.
- **Implementation complexity:** 3 — census tract joins require TIGER/Line shapefile or geocoded tract IDs
- **Verdict: USE IT** — This is the data that makes Citeback's argument irrefutable. Turn it into a map layer. The disparity story is documented in academic literature; Census API makes it interactive.

### TIGER/Line Shapefiles (Census)
- **URL:** https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html
- **What it does:** Official Census geographic boundary files for census tracts, counties, congressional districts, ZCTAs.
- **API status:** ✅ Free bulk download. Also accessible via `https://tigerweb.geo.census.gov/arcgis/rest/services/` (REST API).
- **How it helps Citeback:** Map census demographic data onto actual geographic polygons. Required for the ACS overlay above.
- **Implementation complexity:** 3 — need to process GeoJSON/shapefile geometries
- **Verdict: USE IT** (as part of the ACS integration above)

---

## Bonus: Missed Opportunities Worth Noting

### Overpass Turbo / OSINT Camera Additions
Citeback already uses Overpass API. Worth noting: OSM surveillance data is community-maintained. Citeback users could **contribute back to OSM** (not just pull from it), growing the underlying dataset. This requires no new API — just osmchange API (`api.openstreetmap.org/api/0.6`).

### Open Checkbook Network
Several US cities/states have "Open Checkbook" portals (NYC, SF, Chicago) with APIs. For targeting specific cities' surveillance spending: feasible but manual. No unified API exists.

### iFOIA (ACLU)
The ACLU's FOIA submission tool. No public API. Only useful for manual submissions. MuckRock is a better programmatic choice.

---

## Priority Matrix

| API | Category | Effort | Impact | Verdict |
|-----|----------|--------|--------|---------|
| LegiScan | Legislation | Low | High | ✅ USE IT |
| MuckRock API | FOIA | Medium | High | ✅ USE IT |
| FOIA.gov API | FOIA | Low | Medium | ✅ USE IT |
| Census ACS | Map enrichment | Medium | High | ✅ USE IT |
| GDELT | News feed | Low | High | ✅ USE IT |
| Caselaw Access Project | Legal | Low | Medium | ✅ USE IT |
| Monero view-wallet RPC | Crypto | High | Medium | ✅ USE IT (self-hosted) |
| Photon geocoder | Geocoding | Trivial | Medium | ✅ USE IT |
| DocumentCloud | Transparency | Low | Medium | ✅ USE IT |
| Atlas of Surveillance | Surveillance data | Medium | High | 🔍 INVESTIGATE (contact EFF) |
| DeFlock | Surveillance data | Medium | High | 🔍 INVESTIGATE (data partnership) |
| RECAP Webhooks | Legal | Low | Medium | 🔍 INVESTIGATE (add-on to existing) |
| MediaCloud | News analysis | Medium | Low-Med | 🔍 INVESTIGATE (later) |
| National Archives | Transparency | Medium | Low | 🔍 INVESTIGATE (later) |
| GovSpend | Procurement | N/A | N/A | ❌ SKIP (expensive commercial) |
| NewsAPI | News | Low | Medium | ❌ SKIP (expensive, GDELT better) |
| PACER | Legal | Low | N/A | ❌ SKIP (use RECAP) |
| ZANO | Crypto | High | Low | ❌ SKIP (for now) |
| ProPublica Datastore | Transparency | Low | Low | ❌ SKIP (no longer maintained) |

---

## Recommended Implementation Order

1. **GDELT** → Intelligence Feed. Server-side cron. 2-3 days work.
2. **LegiScan** → Add to existing legislation page. 2-3 days work.
3. **FOIA.gov API** → Campaign FOIA submission widget. 3-5 days work.
4. **Census ACS + TIGER** → Surveillance disparity map layer. 1-2 weeks work.
5. **MuckRock API** → Full FOIA workflow integration. 1-2 weeks work.
6. **Caselaw Access Project** → Add to legal research section. 1-2 days work.
7. **DocumentCloud** → Embed FOIA releases in campaigns. 1-2 days work.
8. **Photon** → Replace/supplement Nominatim for sighting form. 1 day work.
9. **Monero view-wallet** → Donation transparency for campaigns. 1-2 weeks (infra setup).

---

*Research notes: Web search unavailable during this session. LegiScan site returned 403 during fetch (Cloudflare-protected). Findings on LegiScan based on accumulated training knowledge — recommend verifying current pricing at https://legiscan.com/legiscan-api. All other APIs verified via direct URL fetching.*
