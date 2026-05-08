import { Menu, X, ChevronDown, Shield, LogOut } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import AccountModal from './AccountModal'

const primaryLinks = [
  { id: 'home', label: 'Home' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'frontline', label: 'Frontline Funds' },
  { id: 'map', label: 'Map' },
  { id: 'trust', label: 'How It Works' },
  { id: 'governance', label: 'Governance' },
]

const moreLinks = [
  { id: 'operators', label: 'Run a Campaign' },
  { id: 'transparency', label: 'Transparency' },
  { id: 'registry', label: 'Expert Directory' },
  { id: 'feed', label: 'Intelligence Feed' },
  { id: 'report', label: 'Report a Sighting' },
  { id: 'reputation', label: 'My Reputation' },
]

export default function Nav({ tab, setTab }) {
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState('create')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const moreRef = useRef(null)
  const userRef = useRef(null)
  const { user, isLoggedIn, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!moreOpen) return
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [moreOpen])

  useEffect(() => {
    if (!userMenuOpen) return
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  return (
    <nav aria-label="Main navigation" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'var(--nav-bg)',
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
              aria-haspopup="true"
              aria-expanded={moreOpen}
              aria-label="More navigation links"
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
                background: 'var(--nav-dropdown-bg)',
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
          {isLoggedIn ? (
            <div ref={userRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                style={{
                  background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
                  color: 'var(--accent)', borderRadius: 8, padding: '7px 12px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
                }}
              >
                <Shield size={13} />
                {user?.username}
                <span style={{ fontSize: 11, opacity: 0.7 }}>· {user?.reputation || 0}pts</span>
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6,
                  background: 'var(--nav-dropdown-bg)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 0', minWidth: 160,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
                }}>
                  <button
                    onClick={() => { setTab('reputation'); setUserMenuOpen(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--gray)', padding: '8px 16px', fontFamily: 'var(--font)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.background = 'none' }}
                  >
                    My Reputation
                  </button>
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--gray)', padding: '8px 16px', fontFamily: 'var(--font)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.background = 'none' }}
                  >
                    <LogOut size={12} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 0, marginRight: 8 }}>
              <button
                onClick={() => { setAuthTab('login'); setShowAuth(true) }}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  color: 'var(--gray)', borderRadius: '6px 0 0 6px', padding: '7px 14px',
                  fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer',
                  fontFamily: 'var(--font)', fontWeight: 500, transition: 'all 0.15s',
                  borderRight: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                Log In
              </button>
              <button
                onClick={() => { setAuthTab('create'); setShowAuth(true) }}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  color: 'var(--gray)', borderRadius: '0 6px 6px 0', padding: '7px 14px',
                  fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer',
                  fontFamily: 'var(--font)', fontWeight: 500, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--fg)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                Join
              </button>
            </div>
          )}
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
          background: 'var(--nav-dropdown-bg)',
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
      {showAuth && <AccountModal onClose={() => setShowAuth(false)} initialTab={authTab} />}
    </nav>
  )
}
