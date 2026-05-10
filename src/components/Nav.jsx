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
    <nav aria-label="Main navigation" className={`nav-root${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Logo */}
        <button onClick={() => setTab('home')} className="nav-logo-btn" aria-label="Citeback home">
          <span className="nav-logo-cite">CITE</span>
          <span className="nav-logo-back">BACK</span>
        </button>

        {/* Desktop Nav */}
        <div className="nav-desktop">
          {primaryLinks.map(l => (
            <button
              key={l.id}
              onClick={() => setTab(l.id)}
              className={`nav-link-btn${tab === l.id ? ' active' : ''}`}
            >
              {l.label}
            </button>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className="nav-more-wrapper">
            <button
              onClick={() => setMoreOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={moreOpen}
              aria-label="More navigation links"
              className={`nav-more-btn${moreOpen ? ' active' : ''}`}
            >
              More <ChevronDown size={12} />
            </button>
            {moreOpen && (
              <div className="nav-dropdown" role="menu">
                {moreLinks.map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setTab(l.id); setMoreOpen(false) }}
                    className={`nav-dropdown-item${tab === l.id ? ' active' : ''}`}
                    role="menuitem"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <div ref={userRef} className="nav-user-wrapper">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="nav-user-btn"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <Shield size={13} />
                {user?.username}
                <span className="nav-pts-label">&middot; {user?.reputation || 0}pts</span>
              </button>
              {userMenuOpen && (
                <div className="nav-user-menu" role="menu">
                  <button
                    onClick={() => { setTab('reputation'); setUserMenuOpen(false) }}
                    className="nav-dropdown-item"
                    role="menuitem"
                  >
                    My Reputation
                  </button>
                  <div className="nav-divider" />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false) }}
                    className="nav-user-menu-logout"
                    role="menuitem"
                  >
                    <LogOut size={12} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-btns">
              <button
                onClick={() => { setAuthTab('login'); setShowAuth(true) }}
                className="nav-auth-login"
              >
                Log In
              </button>
              <button
                onClick={() => { setAuthTab('create'); setShowAuth(true) }}
                className="nav-auth-register"
              >
                Join
              </button>
            </div>
          )}

          <button
            onClick={() => setTab('campaigns')}
            className="nav-fund-btn"
          >
            Fund a Campaign
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="nav-mobile-drawer">
          <div className="nav-mobile-links">
            {[...primaryLinks, ...moreLinks].filter((l, i, arr) => arr.findIndex(x => x.id === l.id) === i).map(l => (
              <button
                key={l.id}
                onClick={() => { setTab(l.id); setOpen(false) }}
                className={`nav-mobile-link${tab === l.id ? ' active' : ''}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="nav-mobile-auth">
            <button
              onClick={() => { setTab('campaigns'); setOpen(false) }}
              className="nav-mobile-fund-btn"
            >
              Fund a Campaign
            </button>
          </div>
        </div>
      )}

      {showAuth && <AccountModal onClose={() => setShowAuth(false)} initialTab={authTab} singleMode />}
    </nav>
  )
}
