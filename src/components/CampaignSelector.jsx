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
    <section style={{ padding: '80px clamp(16px, 4vw, 24px)' }}>
      <div
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--red)',
          fontWeight: 500,
          marginBottom: '40px',
        }}
      >
        Six Ways to Push Back
      </div>

      <div className="campaign-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
        {/* Left: list */}
        <div>
          {campaigns.map((c, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              onMouseEnter={(e) => {
                if (i !== active) {
                  e.currentTarget.querySelector('.arrow').style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (i !== active) {
                  e.currentTarget.querySelector('.arrow').style.opacity = '0';
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '18px 0',
                fontSize: '15px',
                fontFamily: 'inherit',
                color: i === active ? 'var(--fg)' : 'var(--gray)',
                fontWeight: i === active ? 500 : 400,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{c.name}</span>
              <span
                className="arrow"
                style={{
                  color: 'var(--red)',
                  opacity: i === active ? 1 : 0,
                  transition: 'opacity 0.15s',
                  fontSize: '15px',
                }}
              >
                →
              </span>
            </button>
          ))}
        </div>

        {/* Right: detail panel */}
        <div
          key={animKey}
          style={{
            animation: 'campaignFadeIn 0.28s ease both',
          }}
        >
          <div
            style={{
              fontSize: '26px',
              fontWeight: 300,
              color: 'var(--fg)',
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            {campaign.name}
          </div>
          <div
            style={{
              fontSize: '15px',
              color: 'var(--gray)',
              fontWeight: 300,
              lineHeight: 1.65,
              marginBottom: '28px',
            }}
          >
            {campaign.description}
          </div>
          <div
            style={{
              borderLeft: '2px solid var(--red)',
              paddingLeft: '16px',
              fontSize: '13px',
              color: 'var(--fg)',
              lineHeight: 1.55,
            }}
          >
            {campaign.highlight}
          </div>
        </div>
      </div>

      {setTab && (
        <div style={{ marginTop: 48, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setTab('campaigns')}
            style={{
              background: 'var(--fg)', color: 'var(--bg)', border: 'none',
              padding: '12px 28px', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'var(--font)', minHeight: 44,
            }}
          >
            Browse Active Campaigns →
          </button>
          <button
            onClick={() => setTab('operators')}
            style={{
              background: 'transparent', color: 'var(--fg)',
              border: '1px solid var(--border)', padding: '12px 28px',
              fontSize: 13, fontWeight: 500, letterSpacing: '0.05em',
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'var(--font)', minHeight: 44,
            }}
          >
            Run a Campaign →
          </button>
        </div>
      )}

      <style>{`
        @keyframes campaignFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .campaign-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
