import { useState } from 'react';

const campaigns = [
  {
    name: 'Public Records Litigation',
    description:
      'Force disclosure through FOIA litigation. Every case creates a permanent, citable record that feeds future campaigns — and warns other agencies watching.',
    highlight:
      'Brennan Center v. NYPD exposed an entire covert surveillance unit.',
    highlightLabel: 'Example',
  },
  {
    name: 'Ordinance Campaigns',
    description:
      'City council campaigns to ban or regulate surveillance locally. More than 50 cities have passed bans since Oakland\'s 2018 ordinance.',
    highlight:
      "Ban the Scan's model legislation has been adopted in cities across the US.",
    highlightLabel: 'Example',
  },
  {
    name: 'Vendor Accountability',
    description:
      'Target Clearview AI, Flock Safety, Palantir, and ShotSpotter directly. Cancel contracts — not just file complaints.',
    highlight:
      'Amazon pulled Rekognition from law enforcement after sustained pressure campaigns.',
    highlightLabel: 'Result',
  },
  {
    name: 'Counter-Database Projects',
    description:
      'Map and document surveillance infrastructure publicly. The data that fuels litigation, journalism, and legislation.',
    highlight:
      "EFF's Atlas of Surveillance shifted procurement conversations in dozens of cities.",
    highlightLabel: 'Example',
  },
  {
    name: 'Insurance Pressure',
    description:
      'Document harms to the liability insurers of surveillance contractors. Make surveillance tech uninsurable — the most underused lever in this fight.',
    highlight:
      'Cities carry direct liability when surveillance tech triggers wrongful arrests.',
    highlightLabel: 'Fact',
  },
  {
    name: 'Verification Bounties',
    description:
      'Fund community verification of mapped surveillance infrastructure. Contributors earn XMR for GPS-tagged, cryptographically signed camera confirmation. C2PA-authenticated photos earn gold-tier status instantly.',
    highlight:
      '872 ALPR cameras mapped across New Mexico — open for ground-truth verification.',
    highlightLabel: 'Live',
  },
];

export default function CampaignSelector({ setTab }) {
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  function handleSelect(i) {
    if (i === active) return;
    setActive(i);
    setAnimKey((k) => k + 1);
  }

  const campaign = campaigns[active];

  return (
    <section className="cs-section">
      <div className="cs-eyebrow">
        Six Ways to Push Back
      </div>

      <div className="cs-grid">
        {/* Left: list */}
        <div>
          {campaigns.map((c, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`cs-campaign-btn${i === active ? ' cs-campaign-btn--active' : ''}`}
            >
              <span>{c.name}</span>
              <span className="cs-arrow">→</span>
            </button>
          ))}
        </div>

        {/* Right: detail panel */}
        <div key={animKey} className="cs-detail-panel">
          <div className="cs-detail-name">{campaign.name}</div>
          <div className="cs-detail-desc">{campaign.description}</div>
          <div className="cs-detail-highlight">{campaign.highlight}</div>
        </div>
      </div>

      {setTab && (
        <div className="cs-cta-row">
          <button onClick={() => setTab('campaigns')} className="cs-btn-primary">
            Browse Active Campaigns →
          </button>
          <button onClick={() => setTab('operators')} className="cs-btn-secondary">
            Run a Campaign →
          </button>
        </div>
      )}
    </section>
  );
}
