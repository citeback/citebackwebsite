// All campaigns based on verified public records and news reporting.
// Sources: KOB 4 Investigates (Jan 2026), ProgressNow NM (Mar 2026),
// NM Legislature records, 404 Media, ACLU of Massachusetts

// Platform rules (enforced by TEE wallet agent)
export const platformRules = {
  platformFeePercent: 1,          // 1% of all donations → ops wallet
  feeBufferPercent: 2,            // 2% added to campaign goals for tx fee variance
  xmrTxFeeEstimate: 0.01,        // ~$0.01 per transaction (USD)
  maxExtensionsPerCampaign: 2,
  extensionWindowPercent: 0.25,   // extensions only in last 25% of campaign window
  challengeWindowHours: 48,
  disbursementVoteThreshold: 0.60, // 60% majority to BLOCK a disbursement
  campaignApprovalThreshold: 0.51, // simple majority to approve campaign
  unfundedRedirect: 'highest-priority-same-category',

  reputationCaps: [
    { minScore: 0,   maxScore: 20,  maxGoalUSD: 500 },
    { minScore: 21,  maxScore: 50,  maxGoalUSD: 2000 },
    { minScore: 51,  maxScore: 100, maxGoalUSD: 10000 },
    { minScore: 101, maxScore: Infinity, maxGoalUSD: Infinity },
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
  },
  {
    id: 2,
    type: 'billboard',
    title: 'Billboard — Taos Plaza, 18 Cameras Since 2023',
    description: 'Public records confirm 18 Flock cameras installed near Taos Plaza and along residential streets since 2023. Residents have no idea. A billboard at the plaza\'s main entrance will change that — directly notifying thousands of tourists and locals that their plates are being scanned and stored.',
    location: 'Taos, NM',
    goal: 750,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-06-01',
    tags: ['billboard', 'ALPR', 'Taos', 'New Mexico'],
    source: 'https://progressnownm.org/privacy-first-heres-how-nm-can-set-guardrails-on-flock-cameras-and-surveillance-tech/',
  },
  {
    id: 3,
    type: 'billboard',
    title: 'Billboard — Las Cruces PTZ Camera Network',
    description: 'Las Cruces has deployed up to 37 cameras — including PTZ units that can remotely follow vehicles and zoom in on faces in real time. This isn\'t passive scanning. This is active tracking. A billboard on the main corridor warns everyone entering the city.',
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
  },
  {
    id: 4,
    type: 'legal',
    title: 'Legal Fund — NM State ALPR Privacy Bill',
    description: 'State Senator Peter Wirth has been pushing legislation requiring warrants for ALPR data access and capping retention at 30 days. Albuquerque PD currently holds your data for a full year. We\'re funding legal advocacy and testimony support to get this bill across the line in the 2027 session.',
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
  },
  {
    id: 5,
    type: 'foia',
    title: 'FOIA — Albuquerque PD 1-Year Data Retention',
    description: 'APD retains every plate scan for 365 days — 12x longer than Bernalillo County Sheriff policy. We\'re demanding the full data sharing agreements: who outside APD can query a year\'s worth of your location history, and under what conditions. Immigration enforcement, federal agencies, private entities — we want it all on record.',
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
  },
  {
    id: 6,
    type: 'foia',
    title: 'FOIA — Otero County & Alamogordo New Deployment',
    description: 'Otero County Sheriff and Alamogordo PD recently announced a new Flock agreement. We want the full contract before a single camera goes live — cost, data sharing terms, retention policy, and which outside agencies will have access. Stop the expansion before it\'s entrenched.',
    location: 'Alamogordo, NM',
    goal: 800,
    raised: 0,
    walletXMR: null,
    walletZANO: null,
    status: 'prelaunch',
    backers: 0,
    deadline: '2026-05-20',
    tags: ['FOIA', 'ALPR', 'Otero County', 'New Mexico'],
    source: 'https://progressnownm.org/privacy-first-heres-how-nm-can-set-guardrails-on-flock-cameras-and-surveillance-tech/',
  },

  // Verification Bounty Campaign
  {
    id: 7,
    type: 'verify',
    title: 'Verification Bounty — New Mexico',
    description: 'Fund physical verification of the 872 OSM-mapped ALPR cameras across New Mexico. Verifiers earn XMR for submitting GPS-tagged photos with independent confirmation. C2PA-authenticated photos receive gold-tier status instantly. Standard submissions require 3-of-3 Expert Directory consensus. Fraud-resistant by design — well-resourced adversaries cannot fake C2PA cryptographic signatures or defeat economic staking.',
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
      bountyPerCamera: 1.50,
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
