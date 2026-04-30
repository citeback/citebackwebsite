import { Scale, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { id: 'home', label: 'Home' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'trust', label: 'How It Works' },
  { id: 'operators', label: 'Run a Campaign' },
  { id: 'transparency', label: 'Transparency' },
  { id: 'registry', label: 'Expert Directory' },
  { id: 'map', label: 'Camera Map' },
  { id: 'governance', label: 'Governance' },
]

export default function Nav({ tab, setTab }) {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,11,0.96)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        {/* Logo */}
        <button onClick={() => setTab('home')} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(230,57,70,0.4)' }}>
            <Scale size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px' }}>Citeback</span>
        </button>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {links.map(l => (
            <button key={l.id} onClick={() => setTab(l.id)} style={{
              background: tab === l.id ? 'var(--bg3)' : 'none',
              border: tab === l.id ? '1px solid var(--border)' : '1px solid transparent',
              color: tab === l.id ? 'var(--text)' : 'var(--muted)',
              padding: '6px 14px', borderRadius: 7, fontWeight: 500, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (tab !== l.id) e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { if (tab !== l.id) e.currentTarget.style.color = 'var(--muted)' }}
            >{l.label}</button>
          ))}
          <button onClick={() => setTab('campaigns')} style={{
            marginLeft: 6,
            background: 'var(--accent)', border: 'none', color: '#fff',
            padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13,
            cursor: 'pointer', boxShadow: '0 0 14px rgba(230,57,70,0.25)',
          }}>Fund a Campaign</button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', cursor: 'pointer' }} className="mobile-btn">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map(l => (
            <button key={l.id} onClick={() => { setTab(l.id); setOpen(false) }} style={{
              background: 'none', border: 'none', color: tab === l.id ? 'var(--text)' : 'var(--muted)',
              padding: '10px 16px', textAlign: 'left', fontWeight: 500, fontSize: 15, cursor: 'pointer',
            }}>{l.label}</button>
          ))}
          <div style={{ padding: '8px 16px' }}>
            <button onClick={() => { setTab('campaigns'); setOpen(false) }} style={{
              width: '100%', background: 'var(--accent)', border: 'none', color: '#fff',
              padding: '11px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Fund a Campaign</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          nav > div > div:nth-child(2) { display: none !important; }
          .mobile-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
