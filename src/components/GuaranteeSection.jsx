const facts = [
  'Citeback never holds funds — contributions go directly to the operator\'s own wallet. Platform monitors balance via view key (read-only).',
  'View key verification — every campaign wallet publishes a read-only view key so anyone can independently verify the balance in real time',
  'Early drain = permanent ban — operators who withdraw funds before campaign completion are permanently blacklisted with a public misconduct record',
  'Wyoming DAO LLC formation — a hard launch prerequisite before wallets activate',
  'Accepts only XMR and ZANO — no credit cards, no identity, no bank',
  'OFAC screening on all operators — required before any campaign goes live and again at each disbursement',
  'Architecture specification published — open for community review before any funds are accepted',
];

export default function GuaranteeSection({ setTab }) {
  return (
    <section className="guarantee-section">
      <div className="guarantee-inner">
      <div className="guarantee-grid">
        {/* Left: text */}
        <div>
          <div className="guarantee-eyebrow">
            The Guarantee
          </div>

          <div className="guarantee-headline">
            Citeback never holds funds. Contributions go directly to operators. Platform monitors via view key.
          </div>

          <div className="guarantee-paragraphs">
            {[
              'Operators hold their own campaign wallets under the direct wallet model. Citeback never holds, pools, or touches campaign funds.',
              'Every campaign wallet publishes a view key — a read-only key that lets anyone independently verify the balance. Citeback monitors via the same view key and permanently bans any operator who drains early.',
              "This isn't a promise. The wallet architecture and accountability model are published and open for anyone to audit before launch.",
            ].map((para, i) => (
              <p key={i} className="guarantee-para">{para}</p>
            ))}
          </div>
        </div>

        {/* Right: facts + CTA */}
        <div className="guarantee-facts">
          {facts.map((fact, i) => (
            <div key={i} className="guarantee-fact-row">
              <span className="guarantee-fact-arrow">→</span>
              <span>{fact}</span>
            </div>
          ))}
          {setTab && (
            <div className="guarantee-cta-row">
              <button
                onClick={() => setTab('campaigns')}
                className="guarantee-cta-primary"
              >
                Browse Campaigns →
              </button>
              <button
                onClick={() => setTab('trust')}
                className="guarantee-cta-secondary"
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
