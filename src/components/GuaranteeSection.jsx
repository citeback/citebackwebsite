const facts = [
  'Minimum 3 TEE instances across independent hardware providers',
  '2-of-3 threshold signatures required — one compromised node cannot unlock funds',
  'No human will ever hold a wallet key — keys are generated inside the TEE enclave and never leave',
  'Being structured as a Wyoming DAO LLC — spending governed by code, not humans',
  'Accepts only XMR and ZANO — no credit cards, no identity, no bank',
  'Mission encoded in TEE code — not governance documents that can be quietly amended',
  'Architecture specification published — open for community audit before launch',
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
            No human holds the keys.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              'Every campaign wallet will live inside a Trusted Execution Environment — hardware-level isolation where keys are generated inside the enclave and never leave.',
              'The platform has two layers: the operator manages campaigns, and the TEE manages money. What no one can do — no founder, no operator, no court order — is produce keys that exist only inside the enclave.',
              "This isn't a policy. It isn't a promise. It's the architecture — and the code is public for anyone to audit before launch.",
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
    </section>
  );
}
