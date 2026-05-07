// All campaigns based on verified public records and news reporting.
// Sources: KOB 4 Investigates (Jan 2026), ProgressNow NM (Mar 2026),
// NM Legislature records, 404 Media, ACLU of Massachusetts

// Platform rules (enforced by TEE wallet agent)
export const platformRules = {
  // Citeback takes zero platform fee from campaigns.
  // All donated funds go directly to the campaign operator's wallet.
  // See ARCHITECTURE-REPUTATION.md for the full platform sustainability model.
  platformFeePercent: 0,          // Zero. No platform fee. Ratified 2026-05-06.
  networkFeeBufferPercent: 2,     // 2% buffer for Monero/Zano network tx fee variance (NOT a platform fee)
  xmrTxFeeEstimate: 0.01,        // ~$0.01 per transaction (USD) — Monero fees set by RandomX PoW network
  zanoTxFeeEstimate: 0.01,       // ~$0.01 per transaction (USD) — Zano fees on hybrid PoW+PoS network
  maxExtensionsPerCampaign: 2,
  extensionWindowPercent: 0.25,   // extensions only in last 25% of campaign window
  challengeWindowHours: 48,
  disbursementVoteThreshold: 0.60, // 60% majority to BLOCK a disbursement
  campaignApprovalThreshold: 0.51, // simple majority to approve campaign
  unfundedRedirect: 'highest-priority-same-category',

  // Camera reputation (sighting points) gates initial campaign ACCESS
  // Campaign success score (separate counter) gates higher CAPS
  cameraReputationTiers: [
    { minScore: 0,  maxScore: 9,   canRunCampaigns: false },  // Scout — build rep first
    { minScore: 10, maxScore: Infinity, canRunCampaigns: true, maxGoalUSD: 1000 }, // Operator+
  ],
  campaignSuccessCaps: [
    { successfulCampaigns: 0,  maxGoalUSD: 1000,      entityRequired: false },
    { successfulCampaigns: 10, maxGoalUSD: 7500,      entityRequired: false },
    { successfulCampaigns: 10, maxGoalUSD: 30000,     entityRequired: true  }, // entity unlocks this
    { successfulCampaigns: 10, maxGoalUSD: 125000,    entityRequired: true, legalReviewRequired: true },
    { successfulCampaigns: 10, maxGoalUSD: Infinity,  entityRequired: true, communityVoteRequired: true },
  ],

  reputationEvents: {
    campaignCompleted:         +10,
    challengeFiled_upheld:     -25,
    challengeFiled_rejected:   +5,
    extensionGranted_completed: +3,
    misconductConfirmed:       -50,
  },
}

export const campaigns = [
  {
    id: 1,
    type: 'foia',
    title: 'FOIA — Bernalillo County Sheriff Flock Contract',
    description: 'The Bernalillo County Sheriff\'s Office has used Flock Safety since 2024. In 2025, a deputy was caught improperly accessing plate data — and was given only a written reprimand. We\'re filing for the full contract, data retention policy, third-party sharing agreements, and the complete audit log of who accessed what and when.',
    winCondition: 'Full Flock contract, data retention policy, third-party sharing agreements, and complete access audit log published as public record',
    location: 'Albuquerque, NM',
    goal: 1200,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-06-15',
    tags: ['FOIA', 'ALPR', 'Bernalillo County', 'New Mexico'],
    source: 'https://www.kob.com/new-mexico/4-investigates-the-push-to-regulate-new-mexicos-mass-surveillance-tools/',
    contractContext: 'Flock Safety (FLOCK GROUP INC) has $252K in federal contracts on record — local police deals are untracked and far larger. Source: USASpending.gov',
  },
  {
    id: 2,
    type: 'billboard',
    title: 'Billboard — Taos Plaza, 18 Cameras Since 2023',
    description: 'Public records confirm 18 Flock cameras installed near Taos Plaza and along residential streets since 2023 — without a public disclosure process or community notification. A billboard at the plaza\'s main entrance will change that — directly notifying thousands of tourists and locals that their plates are being scanned and stored.',
    winCondition: 'Physical billboard installed at Taos Plaza main entrance — permanent public notice reaching thousands of visitors and residents every week',
    location: 'Taos, NM',
    goal: 4500,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-06-01',
    tags: ['billboard', 'ALPR', 'Taos', 'New Mexico'],
    source: 'https://progressnownm.org/privacy-first-heres-how-nm-can-set-guardrails-on-flock-cameras-and-surveillance-tech/',
    contractContext: 'Flock Safety holds federal contracts with US Park Police in DC metro. Taos and other NM deployments are local contracts not captured in federal data. Source: USASpending.gov',
  },
  {
    id: 3,
    type: 'billboard',
    title: 'Billboard — Las Cruces PTZ Camera Network',
    description: 'Las Cruces has deployed up to 37 cameras — including PTZ units that can remotely follow vehicles and zoom in on faces in real time. This isn\'t passive scanning. This is active tracking. A billboard on the main corridor warns everyone entering the city.',
    winCondition: 'Physical billboard on main Las Cruces corridor — permanent public notice of active PTZ tracking for every driver entering the city',
    location: 'Las Cruces, NM',
    goal: 800,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-06-20',
    tags: ['billboard', 'ALPR', 'PTZ', 'Las Cruces', 'New Mexico'],
    source: 'https://progressnownm.org/privacy-first-heres-how-nm-can-set-guardrails-on-flock-cameras-and-surveillance-tech/',
    contractContext: 'Flock Safety + Peregrine AI integration is named in Las Cruces PTZ records. Vigilant Solutions (Motorola) operates the DRN — a 12B+ scan commercial ALPR database ICE accesses without warrants. Local deployments like Las Cruces feed into this nationwide commercial surveillance stack. Source: USASpending.gov / EFF reporting',
  },
  {
    id: 4,
    type: 'legal',
    title: 'Legal Fund — NM State ALPR Privacy Bill',
    description: 'Albuquerque PD keeps your license plate scan for 365 days. The bill backed by State Senator Peter Wirth would cap that at 30 days and require a warrant before any agency can query the database — a 12x reduction in your exposure window and a hard legal barrier to warrantless location tracking. We\'re funding attorney preparation, expert witness coordination, and testimony for the 2027 session. This bill is winnable. The time to build the advocacy record is now — before the session opens. ⚠️ Legislative advocacy campaigns require pre-launch attorney sign-off on lobbying disclosure (LDA) and foreign-agent (FARA) compliance before this campaign goes live — see GOVERNANCE.md §3.2.',
    winCondition: 'ALPR Privacy Act passes: warrant requirement + 30-day retention cap. APD\'s 365-day hold on your location history drops to 30.',
    milestones: [
      { amount: 2000, label: 'Attorney retainer secured', desc: 'Retain counsel to draft bill analysis and prepare initial testimony brief for Senate Judiciary Committee' },
      { amount: 5000, label: 'Expert witnesses briefed', desc: 'Bring in privacy law experts and ALPR researchers to testify. Coordinate with ACLU NM and EFF on coalition strategy' },
      { amount: 8000, label: 'Full advocacy package', desc: 'Legislator briefings, coalition outreach, public hearing testimony, and post-session documentation regardless of outcome' },
    ],
    location: 'Santa Fe, NM',
    goal: 8000,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-09-01',
    tags: ['legal', 'legislation', 'New Mexico', 'Fourth Amendment'],
    source: 'https://www.kob.com/new-mexico/4-investigates-the-push-to-regulate-new-mexicos-mass-surveillance-tools/',
    contractContext: 'Palantir ($3.8B+ in federal contracts) and Clearview AI ($8.9M) both have active DHS/ICE relationships — federal data-sharing with NM law enforcement is a real risk this bill would constrain. Source: USASpending.gov',
  },
  {
    id: 5,
    type: 'foia',
    title: 'FOIA — Albuquerque PD 1-Year Data Retention',
    description: 'APD retains every plate scan for 365 days — 12x longer than Bernalillo County Sheriff policy. We\'re demanding the full data sharing agreements: who outside APD can query a year\'s worth of your location history, and under what conditions. Immigration enforcement, federal agencies, private entities — we want it all on record.',
    winCondition: 'All APD data sharing agreements published — federal, state, and private — with the complete list of outside agencies that can query a year of your location history',
    location: 'Albuquerque, NM',
    goal: 1000,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-06-30',
    tags: ['FOIA', 'ALPR', 'Albuquerque', 'data retention', 'New Mexico'],
    source: 'https://www.kob.com/new-mexico/4-investigates-the-push-to-regulate-new-mexicos-mass-surveillance-tools/',
    contractContext: 'Flock Safety (FLOCK GROUP INC) holds federal ALPR contracts. APD\'s 365-day retention exposes residents to federal data-sharing requests under agreements we\'re fighting to expose. Source: USASpending.gov',
  },
  {
    id: 6,
    type: 'foia',
    title: 'FOIA — Otero County & Alamogordo New Deployment',
    description: 'Otero County Sheriff and Alamogordo PD just signed a new Flock Safety deal — and the public hasn\'t seen the contract. Otero County borders Holloman Air Force Base, giving this local deployment a rare federal-military adjacency that could feed data into DHS and DoD infrastructure. We\'re filing for the full contract before a single camera goes live: cost, retention period, data sharing terms, and the exact list of outside agencies with query access. FOIA requests filed pre-deployment create binding disclosure records. Wait until the infrastructure is entrenched, and unwinding it becomes exponentially harder.',
    winCondition: 'Full Flock contract published before deployment — cost, retention period, and third-party access list on public record before a single camera is operational',
    location: 'Alamogordo, NM',
    goal: 800,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-06-30',
    tags: ['FOIA', 'ALPR', 'Otero County', 'New Mexico'],
    source: 'https://progressnownm.org/privacy-first-heres-how-nm-can-set-guardrails-on-flock-cameras-and-surveillance-tech/',
    contractContext: 'Flock Safety (FLOCK GROUP INC) holds federal ALPR contracts. Otero County sits adjacent to Holloman AFB — federally adjacent deployments may feed into broader DHS/DoD surveillance infrastructure. Vigilant Solutions (Motorola) also sells ICE/CBP access to commercial plate scan databases that absorb local ALPR data. Source: USASpending.gov',
  },

  // Verification Bounty Campaign
  {
    id: 7,
    type: 'verify',
    title: 'Verification Bounty — New Mexico',
    description: '872 ALPR cameras are mapped across New Mexico — but mapped isn\'t verified. Unconfirmed data weakens every lawsuit, news story, and legislative hearing that cites it. Community members physically confirm camera locations with GPS-tagged photos and earn reputation points. Each confirmed camera becomes a permanent, litigation-grade, citable record. C2PA-authenticated photos earn gold-tier status instantly. Standard submissions require 3-of-3 independent consensus. Economic staking makes fraud costly — a well-resourced adversary cannot manufacture false confirmations without burning real money.',
    winCondition: '872 OSM-mapped cameras verified, GPS-confirmed, and permanently citable across litigation, journalism, and legislation',
    location: 'New Mexico (Statewide)',
    goal: 1500,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-07-01',
    tags: ['verification', 'bounty', 'New Mexico', 'ALPR', 'community'],
    source: 'https://www.openstreetmap.org',
    verifyMeta: {
      camerasTargeted: 872,
      repPointsPerCamera: 2,  // verifiers earn +2 reputation points per confirmed camera
      confirmationsRequired: 3,
      stakeRequired: 0.25,
      bonusNewArea: 2.00,
    },
  },
]

export const typeColors = {
  billboard: { bg: 'rgba(230,57,70,0.1)', border: 'rgba(230,57,70,0.3)', text: '#ff6b6b', label: 'Billboard' },
  legal: { bg: 'rgba(52,152,219,0.1)', border: 'rgba(52,152,219,0.3)', text: '#5dade2', label: 'Legal Fund' },
  foia: { bg: 'rgba(155,89,182,0.1)', border: 'rgba(155,89,182,0.3)', text: '#bb8fce', label: 'FOIA' },
  verify: { bg: 'rgba(243,156,18,0.1)', border: 'rgba(243,156,18,0.3)', text: '#f39c12', label: 'Verification Bounty' },
}
