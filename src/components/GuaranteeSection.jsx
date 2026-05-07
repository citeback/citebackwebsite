const facts = [
  'No human holds the keys — wallet architecture is finalized and published before any funds go live',
  'Multi-party threshold signatures — a single compromised server cannot unlock funds',
  'Minimum 3 independent wallet nodes across separate hardware providers — a hard launch prerequisite',
  'Wyoming DAO LLC formation — a hard launch prerequisite before wallets activate',
  'Accepts only XMR and ZANO — no credit cards, no identity, no bank',
  'Disbursement rules are code, not policy — published openly for community audit before launch',
  'Architecture specification published — open for community review before any funds are accepted',
];

export default function GuaranteeSection({ setTab }) {
  return (
    <section
      style={{
        borderTop: '1px solid var(--border)',
        padding: '80px 0',
      }}
    >
      <style>{`
        @media (max-width: 700px) {
          .guarantee-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .guarantee-facts {
            padding-top: 0 !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <div className="guarantee-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
        {/* Left: text */}
        <div>
          <div
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--red)',
              fontWeight: 600,
              marginBottom: '28px',
            }}
          >
            The Guarantee
          </div>

          <div
            style={{
              fontSize: '36px',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--fg)',
              marginBottom: '36px',
            }}
          >
            At launch: no human holds the keys.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              'Every campaign wallet is controlled by an independent, hardware-secured system — not by the platform operator, not by the founder.',
              'The platform has two layers: the operator manages campaigns and reviews proposals. A separate, auditable wallet layer manages money. What no one can do — not the founder, not the operator, not a court order — is unilaterally move funds outside the published disbursement rules.',
              "This isn't a policy. It isn't a promise. The architecture is published and open for anyone to audit before launch.",
            ].map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: '15px',
                  color: 'var(--gray)',
                  fontWeight: 300,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Right: facts + CTA */}
        <div className="guarantee-facts" style={{ paddingTop: '56px' }}>
          {facts.map((fact, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '14px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: '14px',
                color: 'var(--fg)',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  color: 'var(--red)',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                →
              </span>
              <span>{fact}</span>
            </div>
          ))}
          {setTab && (
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setTab('campaigns')}
                style={{
                  background: 'var(--fg)', color: 'var(--bg)',
                  border: 'none', padding: '12px 24px',
                  fontSize: 13, letterSpacing: '0.05em', fontWeight: 600,
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'var(--font)', transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Browse Campaigns →
              </button>
              <button
                onClick={() => setTab('trust')}
                style={{
                  background: 'transparent', color: 'var(--fg)',
                  border: '1px solid var(--border)', padding: '12px 24px',
                  fontSize: 13, letterSpacing: '0.05em', fontWeight: 500,
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'var(--font)', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                How It Works →
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
