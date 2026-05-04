// vendorProfiles.js — Mini dossiers on surveillance vendors
// Keyed by lowercase partial match. Use getVendorProfile(vendorString) for fuzzy lookup.

const vendorProfiles = {
  palantir: {
    name: 'Palantir Technologies',
    tagline: 'CIA venture-backed data analytics company. ICE\'s primary deportation tool.',
    flag: 'Co-founded by Peter Thiel. Received early investment from In-Q-Tel, the CIA\'s venture arm. Built the \'deportation machine\' for ICE. Operates in 20+ countries. $3.8B+ in US government contracts.',
    founded: 2003,
    revenue: '$2.2B (2023)',
    contracts: '$3.8B+ in US government contracts including ICE, US Army, NHS (UK)',
    controversies: [
      'Secret 6-year NOPD predictive policing program exposed by FOIA',
      'LAPD Operation LASER — 65,000 \'chronic offender bulletins\' targeting minorities',
      'ICE deportation workflows — documented by The Intercept',
      'IPO\'d on NYSE 2020 despite repeated civil liberties violations',
    ],
    url: 'https://www.brennancenter.org/our-work/research-reports/predictive-policing-explained',
  },

  clearview: {
    name: 'Clearview AI',
    tagline: 'Reportedly scraped 30+ billion faces without consent. Sells access to 3,000+ law enforcement agencies.',
    flag: 'Built a facial recognition database from photos scraped from Facebook, LinkedIn, Venmo — without permission. Banned in Canada, Australia, UK, France, Italy. Settled ACLU lawsuit in Illinois.',
    founded: 2017,
    revenue: 'Private (est. $30M+)',
    contracts: '3,000+ law enforcement agencies including federal, state, and local police',
    controversies: [
      '30B+ photos reportedly scraped from social media without consent or knowledge (Clearview CEO claim, 2023)',
      'Sold to 600+ law enforcement agencies before being exposed by BuzzFeed in 2020',
      'Banned in multiple countries for GDPR/biometric law violations',
      // LEGAL NOTE: "ties to far-right networks" is a characterization. Softened to documented, sourced fact.
      'CEO Hoan Ton-That had prior associations with far-right media figures including Milo Yiannopoulos before founding Clearview — reported by The New York Times (Jan 2020)',
    ],
    url: 'https://www.nytimes.com/2020/01/18/technology/clearview-privacy-facial-recognition.html',
  },

  shotspotter: {
    name: 'ShotSpotter / SoundThinking',
    tagline: 'Sells \'gunshot detection\' to cities for millions per year. Rebranded when scrutiny got too hot.',
    flag: 'Formerly ShotSpotter — rebranded as SoundThinking in 2023. AP/MacArthur Justice Center investigation found 40,000+ ShotSpotter alerts in Chicago over 21 months led to no evidence of a gun crime.',
    founded: 1996,
    revenue: '$100M+ (2023)',
    contracts: 'Chicago ($33M+), NYC, Oakland, and 100+ other cities',
    controversies: [
      'Studies show 70–89% of alerts lead to no evidence of gunfire depending on jurisdiction (89% in Chicago per MacArthur Justice Center 2021; AP “Shots Fired” investigation 2021 confirmed pattern)',
      'Modified audio evidence in a Chicago murder trial — documented by The Intercept',
      'Chicago paid $33M+ for the system',
      'Rebranded as \'SoundThinking\' to escape negative press coverage',
      'Acquired HunchLab predictive policing — now does both surveillance AND prediction',
    ],
    url: 'https://endpolicesurveillance.com',
  },

  soundthinking: {
    name: 'ShotSpotter / SoundThinking',
    tagline: 'Sells \'gunshot detection\' to cities for millions per year. Rebranded when scrutiny got too hot.',
    flag: 'Formerly ShotSpotter — rebranded as SoundThinking in 2023. AP/MacArthur Justice Center investigation found 40,000+ ShotSpotter alerts in Chicago over 21 months led to no evidence of a gun crime.',
    founded: 1996,
    revenue: '$100M+ (2023)',
    contracts: 'Chicago ($33M+), NYC, Oakland, and 100+ other cities',
    controversies: [
      'Studies show 70–89% of alerts lead to no evidence of gunfire depending on jurisdiction (89% in Chicago per MacArthur Justice Center 2021; AP “Shots Fired” investigation 2021 confirmed pattern)',
      'Modified audio evidence in a Chicago murder trial — documented by The Intercept',
      'Chicago paid $33M+ for the system',
      'Rebranded as \'SoundThinking\' to escape negative press coverage',
      'Acquired HunchLab predictive policing — now does both surveillance AND prediction',
    ],
    url: 'https://endpolicesurveillance.com',
  },

  flock: {
    name: 'Flock Safety',
    tagline: 'America\'s fastest-growing ALPR company. Quietly granted federal law enforcement access.',
    // LEGAL NOTE: Prior tagline "Sharing your plate data with ICE" and flag statement
    // "Shares data with federal agencies including ICE" removed. Source
    // (footnote4a.org/news/fbi-access) documents FBI access specifically.
    // ICE access may exist via fusion center sharing but lacks a citable primary source.
    // Restore only with a direct, verifiable citation. Potential defamation risk.
    flag: 'Privately held, valued at $3.8B (2022 funding round — current valuation unconfirmed). Deployed 90,000+ cameras in 4,000+ communities. Granted FBI access despite publicly promising no federal contracts — documented by Footnote4a (2023).',
    founded: 2017,
    revenue: 'Private (est. $150M+)',
    contracts: '4,000+ communities, 90,000+ cameras across the US',
    controversies: [
      'Quietly granted FBI access after promising communities it had no federal contracts (Footnote4a 2023)',
      'A Bernalillo County deputy was caught misusing ALPR data — given only a written reprimand',
      'Flock\'s \'Nova\' product combines plate data with commercial databases and breach records',
      'Taos Plaza: 18 cameras installed without a public disclosure process or community notification (2023)',
    ],
    url: 'https://footnote4a.org/news/fbi-access',
  },

  predpol: {
    name: 'PredPol / Geolitica',
    tagline: 'Predictive policing algorithm that sent police to over-police communities of color for 9 years.',
    flag: 'Used by LAPD 2011–2020 before a racial bias audit terminated the contract. Deployed in 150+ cities at peak. Now rebranded as Geolitica after widespread criticism.',
    founded: 2012,
    revenue: 'Bankrupt (filed 2023)',
    contracts: '150+ cities at peak, including LAPD, Atlanta PD, Santa Cruz PD',
    controversies: [
      'LAPD racial bias audit found algorithm directed officers disproportionately toward communities of color',
      'Rebranded as \'Geolitica\' after The Markup investigation',
      'Sold to dozens of cities with no peer-reviewed evidence of effectiveness',
      'Filed for bankruptcy in 2023',
    ],
    url: 'https://themarkup.org/prediction-bias/2023/10/02/predictive-policing-software-terrible-at-predicting-crimes',
  },

  geolitica: {
    name: 'PredPol / Geolitica',
    tagline: 'Predictive policing algorithm that sent police to over-police communities of color for 9 years.',
    flag: 'Used by LAPD 2011–2020 before a racial bias audit terminated the contract. Deployed in 150+ cities at peak. Now rebranded as Geolitica after widespread criticism.',
    founded: 2012,
    revenue: 'Bankrupt (filed 2023)',
    contracts: '150+ cities at peak, including LAPD, Atlanta PD, Santa Cruz PD',
    controversies: [
      'LAPD racial bias audit found algorithm directed officers disproportionately toward communities of color',
      'Rebranded as \'Geolitica\' after The Markup investigation',
      'Sold to dozens of cities with no peer-reviewed evidence of effectiveness',
      'Filed for bankruptcy in 2023',
    ],
    url: 'https://themarkup.org/prediction-bias/2023/10/02/predictive-policing-software-terrible-at-predicting-crimes',
  },

  dataworks: {
    name: 'DataWorks Plus',
    tagline: 'Facial recognition vendor for 600+ law enforcement agencies. Almost invisible to the public.',
    flag: 'One of the largest facial recognition providers you\'ve never heard of. Provides ID verification for law enforcement in 35+ states. Integrated with DMV databases in multiple states.',
    founded: 2000,
    revenue: 'Private',
    contracts: '600+ law enforcement agencies, 35+ state DMV integrations',
    controversies: [
      'Identified in Georgetown Law \'The Perpetual Line-Up\' as one of the primary vendors with zero public oversight',
      'Integration with state DMV databases means your driver\'s license photo is in a searchable biometric database',
      'No publicly known accuracy audits — no independent assessment published as of last known public record',
    ],
    url: 'https://www.perpetuallineup.org',
  },

  hunchlab: {
    name: 'HunchLab (now SoundThinking)',
    tagline: 'Predictive policing software. Now owned by ShotSpotter\'s parent company.',
    flag: 'Acquired by ShotSpotter/SoundThinking — the same company doing acoustic surveillance. Combined acoustic + predictive = full-spectrum surveillance system.',
    founded: 2012,
    revenue: 'Acquired (private)',
    contracts: 'Philadelphia PD, Baltimore PD, and others before acquisition',
    controversies: [
      'Philadelphia PD used HunchLab to predict crime hot spots — studies found no significant crime reduction',
      'Acquisition by SoundThinking creates vertically integrated surveillance: detect → predict → respond',
      'Limited transparency on algorithm inputs or accuracy',
    ],
    url: 'https://www.brennancenter.org/our-work/research-reports/predictive-policing-explained',
  },

  harris: {
    name: 'L3Harris / Harris Corporation',
    tagline: 'Defense contractor that manufactures StingRay, KingFish, and Hailstorm cell-site simulators.',
    flag: 'Sells Stingray devices to US law enforcement under NDAs that require agencies to hide the technology\'s use from courts and defendants.',
    founded: 1895,
    revenue: '$21B+ (2023)',
    contracts: 'Hundreds of US law enforcement agencies; sold under NDA to conceal use',
    controversies: [
      'Contractually requires law enforcement purchasers to sign NDAs covering Stingray use',
      'Devices used without warrants in hundreds of documented cases',
      'NDAs have caused prosecutors to DROP CHARGES rather than disclose Stingray use in court',
    ],
    url: 'https://sls.eff.org/technologies/cell-site-simulators-imsi-catchers',
  },

  stingray: {
    name: 'L3Harris / Harris Corporation',
    tagline: 'Defense contractor that manufactures StingRay, KingFish, and Hailstorm cell-site simulators.',
    flag: 'Sells Stingray devices to US law enforcement under NDAs that require agencies to hide the technology\'s use from courts and defendants.',
    founded: 1895,
    revenue: '$21B+ (2023)',
    contracts: 'Hundreds of US law enforcement agencies; sold under NDA to conceal use',
    controversies: [
      'Contractually requires law enforcement purchasers to sign NDAs covering Stingray use',
      'Devices used without warrants in hundreds of documented cases',
      'NDAs have caused prosecutors to DROP CHARGES rather than disclose Stingray use in court',
    ],
    url: 'https://sls.eff.org/technologies/cell-site-simulators-imsi-catchers',
  },
}

/**
 * Fuzzy match a vendor string against the profiles lookup.
 * Returns the matching profile object or null.
 * @param {string} vendorString
 * @returns {object|null}
 */
export function getVendorProfile(vendorString) {
  if (!vendorString) return null
  const lower = vendorString.toLowerCase()

  if (lower.includes('palantir')) return vendorProfiles.palantir
  if (lower.includes('clearview')) return vendorProfiles.clearview
  if (lower.includes('soundthinking')) return vendorProfiles.soundthinking
  if (lower.includes('shotspotter')) return vendorProfiles.shotspotter
  if (lower.includes('flock')) return vendorProfiles.flock
  if (lower.includes('geolitica')) return vendorProfiles.geolitica
  if (lower.includes('predpol')) return vendorProfiles.predpol
  if (lower.includes('dataworks')) return vendorProfiles.dataworks
  if (lower.includes('hunchlab')) return vendorProfiles.hunchlab
  if (lower.includes('stingray') || lower.includes('kingfish') || lower.includes('hailstorm')) return vendorProfiles.stingray
  if (lower.includes('harris')) return vendorProfiles.harris

  return null
}

export default vendorProfiles
