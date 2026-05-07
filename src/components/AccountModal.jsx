import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AccountModal({ onClose, initialTab = 'login' }) {
  const { login, createAccount } = useAuth()
  const [tab, setTab] = useState(initialTab) // 'login' | 'create'
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(null) }

  // Client-side password strength (mirrors server logic)
  const pwStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' }
    if (pw.length < 8) return { score: 1, label: 'Too short', color: '#e63946' }
    const hasLower = /[a-z]/.test(pw)
    const hasUpper = /[A-Z]/.test(pw)
    const hasDigit = /[0-9]/.test(pw)
    const hasSymbol = /[^a-zA-Z0-9]/.test(pw)
    const charsetSize = (hasLower?26:0)+(hasUpper?26:0)+(hasDigit?10:0)+(hasSymbol?32:0)
    const entropy = Math.log2(charsetSize||1) * pw.length
    if (entropy < 40) return { score: 1, label: 'Weak', color: '#e63946' }
    if (entropy < 55) return { score: 2, label: 'Fair', color: '#f4a261' }
    if (entropy < 70) return { score: 3, label: 'Good', color: '#2a9d8f' }
    return { score: 4, label: 'Strong', color: '#6ee7b7' }
  }
  const strength = tab === 'create' ? pwStrength(form.password) : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return
    setLoading(true)
    setError(null)
    try {
      if (tab === 'login') {
        await login(form.username, form.password)
        setSuccess('Logged in!')
        setTimeout(onClose, 800)
      } else {
        await createAccount(form.username, form.password)
        setSuccess('Account created!')
        setTimeout(onClose, 800)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  }
  const modal = {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 400,
    position: 'relative',
  }
  const inputStyle = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '11px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.04em',
  }

  const content = (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, borderRadius: 6 }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', marginBottom: 6 }}>
            {tab === 'login' ? 'Welcome back' : 'Join Citeback'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
            {tab === 'login'
              ? 'Sign in to track your surveillance sightings and reputation score.'
              : 'No email. No real name. Just a username and password.'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg3)', borderRadius: 8, padding: 4 }}>
          {['login', 'create'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setSuccess(null) }}
              style={{
                flex: 1, padding: '8px', borderRadius: 6, border: 'none',
                background: tab === t ? 'var(--bg2)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
                fontWeight: tab === t ? 700 : 500, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {t === 'login' ? 'Log In' : 'Create Account'}
            </button>
          ))}
        </div>

        {success ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 10 }}>
            <CheckCircle size={20} style={{ color: 'var(--green)', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>{success}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                <input
                  style={{ ...inputStyle, paddingLeft: 34 }}
                  placeholder="e.g. alpr_watcher"
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                  autoComplete="username"
                  autoFocus
                  maxLength={20}
                  required
                />
              </div>
              {tab === 'create' && (
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  3–20 characters, letters/numbers/underscores only
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingLeft: 34, paddingRight: 40 }}
                  placeholder={tab === 'create' ? 'At least 8 characters' : 'Your password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent)' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.username || !form.password}
              style={{
                background: (!loading && form.username && form.password) ? 'var(--accent)' : 'var(--bg3)',
                border: 'none',
                color: (!loading && form.username && form.password) ? '#fff' : 'var(--muted)',
                padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 14,
                cursor: (!loading && form.username && form.password) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Working…</> : (tab === 'login' ? 'Log In' : 'Create Account')}
            </button>

            {tab === 'create' && form.password.length >= 1 && strength && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(strength.score/4)*100}%`, background: strength.color, borderRadius: 2, transition: 'width 0.2s, background 0.2s' }} />
                </div>
                <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, minWidth: 40 }}>{strength.label}</span>
              </div>
            )}
            {tab === 'create' && (
              <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
                No email required. No personal info stored. Your password is hashed and never readable.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
