export default function Manifesto() {
  return (
    <section style={{
      padding: '80px 24px',
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
          color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 32,
        }}>// citeback.com — mission statement</div>

        <blockquote style={{
          fontSize: 'clamp(20px, 3vw, 26px)',
          fontWeight: 700,
          lineHeight: 1.6,
          letterSpacing: '-0.3px',
          marginBottom: 40,
          color: 'var(--text)',
        }}>
          "The right of the people to be secure in their persons, houses, papers, and effects,
          against unreasonable searches and seizures, shall not be violated."
        </blockquote>

        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 48, fontFamily: 'var(--mono)' }}>
          — Fourth Amendment, United States Constitution
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2,
          textAlign: 'left', marginBottom: 48,
        }}>
          {[
            ['They built the cage.', 'We document every bar.'],
            ['They scan without consent.', 'We expose without apology.'],
            ['They share your data freely.', 'We fund the lawsuits to stop it.'],
            ['They count on your silence.', 'We put billboards next to their cameras.'],
          ].map(([them, us], i) => (
            <div key={i} style={{
              padding: '20px 24px',
              background: i % 2 === 0 ? 'rgba(230,57,70,0.05)' : 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: i === 0 ? '12px 0 0 0' : i === 1 ? '0 12px 0 0' : i === 2 ? '0 0 0 12px' : '0 0 12px 0',
            }}>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>{them}</div>
              <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>{us}</div>
            </div>
          ))}
        </div>

        <p style={{
          color: 'var(--muted)', fontSize: 15, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 32px',
        }}>
          Citeback exists because the legal system moves slow and the surveillance state moves fast.
          We use anonymous Monero funding to put pressure where it hurts — in public, in court, and on the record.
          No politics. No ideology. Just the Constitution, enforced by the people who live under it.
        </p>

        <div style={{
          background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.12)',
          borderRadius: 14, padding: '24px 28px', maxWidth: 520, margin: '0 auto',
          textAlign: 'left',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>// who runs this?</div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>No one.</strong>{' '}
            Citeback has no founder, no executive team, no corporate structure, and no operator.
            It is a protocol — a set of verified public records, campaign wallets, and human operators
            coordinated by the platform itself. There is no one to sue, depose, pressure, or silence.
            The system runs. The cameras get documented. The billboards go up. The FOIAs get filed.
            With or without anyone at the helm.
          </p>
        </div>
      </div>
    </section>
  )
}
