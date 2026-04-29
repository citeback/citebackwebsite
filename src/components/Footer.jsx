import { Scale } from 'lucide-react'

export default function Footer({ setTab }) {
  const link = (label, tab) => (
    <div
      key={label}
      onClick={() => setTab && setTab(tab)}
      style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 9, cursor: 'pointer', transition: 'color 0.15s' }}
      onMouseEnter={e => e.target.style.color = 'var(--text)'}
      onMouseLeave={e => e.target.style.color = 'var(--muted)'}
    >{label}</div>
  )

  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border)',
      padding: '48px 24px 32px',
      background: 'var(--bg2)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div style={{ maxWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Scale size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>Citeback</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.75 }}>
              Decentralized legal resistance to mass surveillance.
              The Fourth Amendment enforced by the people who live under it.
            </p>
            <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--border)' }}>
              citeback.com
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 14, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Platform</div>
              {link('Campaigns', 'campaigns')}
              {link('Camera Map', 'map')}
              {link('Human Registry', 'registry')}
              {link('Transparency', 'transparency')}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 14, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Learn</div>
              <a href="https://www.eff.org/pages/automated-license-plate-readers-alpr" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: 'var(--muted)', fontSize: 13, marginBottom: 9 }}>What is ALPR?</a>
              <a href="https://deflock.me" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: 'var(--muted)', fontSize: 13, marginBottom: 9 }}>Deflock Camera Map</a>
              <a href="https://www.getmonero.org" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: 'var(--muted)', fontSize: 13, marginBottom: 9 }}>How Monero Works</a>
              <a href="https://www.eff.org" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: 'var(--muted)', fontSize: 13, marginBottom: 9 }}>EFF — Digital Rights</a>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 14, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Principles</div>
              {['No Logs. Ever.', 'No Accounts Required', 'Open Source', 'Anonymous Funding', 'Legal Actions Only'].map(t => (
                <div key={t} style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 9 }}>{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Citeback is not a law firm. All campaigns are independently executed by registered human operators.
            Donations are not tax-deductible. Citeback is not a nonprofit or political organization.
          </div>
          <div style={{ fontSize: 11, color: 'var(--border)', fontFamily: 'var(--mono)' }}>
            © 2026 Citeback · Powered by Monero · No tracking
          </div>
        </div>
      </div>
    </footer>
  )
}
