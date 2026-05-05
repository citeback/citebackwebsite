import { Menu, X, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const primaryLinks = [
  { id: 'home', label: 'Home' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'map', label: 'Map' },
  { id: 'trust', label: 'How It Works' },
  { id: 'transparency', label: 'Transparency' },
  { id: 'governance', label: 'Governance' },
]

const moreLinks = [
  { id: 'operators', label: 'Run a Campaign' },
  { id: 'registry', label: 'Expert Directory' },
  { id: 'feed', label: 'Intelligence Feed' },
]

export default function Nav({ tab, setTab }) {
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const moreRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!moreOpen) return
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [moreOpen])

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(250,250,250,0.92)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo */}
        <button
          onClick={() => setTab('home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: 0,
            lineHeight: 1,
          }}
        >
          <span style={{ color: 'var(--fg)' }}>CITE</span>
          <span style={{ color: 'var(--red)' }}>BACK</span>
        </button>

        {/* Desktop Nav */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {primaryLinks.map(l => (
            <button
              key={l.id}
              onClick={() => setTab(l.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                letterSpacing: '0.04em',
                color: tab === l.id ? 'var(--fg)' : 'var(--gray)',
                padding: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)' }}
              onMouseLeave={e => { if (tab !== l.id) e.currentTarget.style.color = 'var(--gray)' }}
            >
              {l.label}
            </button>
          ))}
          {/* More dropdown */}
          <div ref={moreRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMoreOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                letterSpacing: '0.04em',
                color: moreOpen ? 'var(--fg)' : 'var(--gray)',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)' }}
              onMouseLeave={e => { if (!moreOpen) e.currentTarget.style.color = 'var(--gray)' }}
            >
              More <ChevronDown size={12} />
            </button>
            {moreOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 8,
                background: 'rgba(250,250,250,0.98)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 0',
                minWidth: 160,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                zIndex: 200,
              }}>
                {moreLinks.map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setTab(l.id); setMoreOpen(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      letterSpacing: '0.03em',
                      color: tab === l.id ? 'var(--fg)' : 'var(--gray)',
                      padding: '8px 16px',
                      fontFamily: 'var(--font)',
                      transition: 'color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = 'var(--fg)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; if (tab !== l.id) e.currentTarget.style.color = 'var(--gray)' }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setTab('campaigns')}
            style={{
              background: 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              padding: '12px 28px',
              fontSize: 12,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              borderRadius: 0,
              fontFamily: 'var(--font)',
              fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--fg)' }}
          >
            Fund a Campaign
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="nav-mobile-btn"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--fg)',
            cursor: 'pointer',
            display: 'none',
            padding: 8,
            minWidth: 44,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'rgba(250,250,250,0.98)',
        }}>
          {[...primaryLinks, ...moreLinks].filter((l, i, arr) => arr.findIndex(x => x.id === l.id) === i).map(l => (
            <button
              key={l.id}
              onClick={() => { setTab(l.id); setOpen(false) }}
              style={{
                background: 'none',
                border: 'none',
                color: tab === l.id ? 'var(--fg)' : 'var(--gray)',
                padding: '10px 0',
                textAlign: 'left',
                fontSize: 14,
                letterSpacing: '0.03em',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              {l.label}
            </button>
          ))}
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => { setTab('campaigns'); setOpen(false) }}
              style={{
                width: '100%',
                background: 'var(--fg)',
                color: 'var(--bg)',
                border: 'none',
                padding: '13px',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                borderRadius: 0,
              }}
            >
              Fund a Campaign
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
