import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader, Fingerprint } from 'lucide-react'
import { startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { useAuth } from '../context/AuthContext'
import { API_BASE as AI_URL } from '../config.js'

export default function AccountModal({ onClose, initialTab = 'login', singleMode = false }) {
  const { login, createAccount } = useAuth()
  const modalRef = useRef(null)
  const [tab, setTab] = useState(initialTab) // 'login' | 'create' | 'recover' | 'forgot-username'
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', email: '' })
  const [recoverUsername, setRecoverUsername] = useState('')
  const [recoverSent, setRecoverSent] = useState(false)
  const [forgotUsernameEmail, setForgotUsernameEmail] = useState('')
  const [forgotUsernameSent, setForgotUsernameSent] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [passkeyLoading, setPasskeyLoading] = useState(false)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(null) }

  // Focus trap + Escape handler
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab') {
        const els = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus() }
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true)
    setError(null)
    try {
      // Get auth options (no username for discoverable credentials)
      const optRes = await fetch(`${AI_URL}/passkey/auth-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username || undefined }),
      })
      const { options, tempId } = await optRes.json()
      if (!optRes.ok) throw new Error(options?.error || 'Failed to start passkey auth')
      // Invoke browser WebAuthn
      const credential = await startAuthentication({ optionsJSON: options })
      // Verify with server
      const verRes = await fetch(`${AI_URL}/passkey/auth-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response: credential, tempId }),
      })
      const verData = await verRes.json()
      if (!verRes.ok) throw new Error(verData.error || 'Passkey verification failed')
      setSuccess('Logged in!')
      setTimeout(onClose, 800)
    } catch (err) {
      if (err?.name === 'AbortError') {
        setError('Passkey login cancelled.')
      } else if (err?.name === 'NotAllowedError' || err?.message?.includes('No credentials') || err?.message?.includes('No available')) {
        setError('No passkey found on this device. Log in with your password first, then add a passkey from your account dashboard.')
      } else {
        setError('Passkey failed — try logging in with your password instead.')
      }
    } finally {
      setPasskeyLoading(false)
    }
  }

  const handleRecover = async (e) => {
    e.preventDefault()
    if (!recoverUsername) return
    setLoading(true)
    try {
      await fetch(`${AI_URL}/account/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: recoverUsername }),
      })
      setRecoverSent(true)
    } catch {}
    setLoading(false)
  }

  const handleForgotUsername = async (e) => {
    e.preventDefault()
    if (!forgotUsernameEmail) return
    setLoading(true)
    try {
      await fetch(`${AI_URL}/account/forgot-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotUsernameEmail }),
      })
      setForgotUsernameSent(true)
    } catch {}
    setLoading(false)
  }

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
  const passwordsMatch = form.password === form.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return
    if (tab === 'create' && !passwordsMatch) return
    setLoading(true)
    setError(null)
    try {
      if (tab === 'login') {
        await login(form.username, form.password)
        setSuccess('Logged in!')
        setTimeout(onClose, 800)
      } else {
        await createAccount(form.username, form.password, form.email || null)
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
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '16px', overflowY: 'auto',
  }
  const modal = {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 400,
    position: 'relative', margin: 'auto',
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
    <div style={overlay} role="presentation" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-heading"
        style={modal}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, borderRadius: 6 }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 id="account-modal-heading" style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', marginBottom: 6 }}>
            {tab === 'login' ? 'Welcome back' : tab === 'create' ? 'Join Citeback' : 'Recover your account'}
          </h2>
          {tab !== 'recover' && (
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
              {tab === 'login'
                ? 'Sign in to track your surveillance sightings and reputation score.'
                : 'No email. No real name. Just a username and password.'}
            </p>
          )}
        </div>

        {/* Tabs — only shown when not in single mode */}
        {tab !== 'recover' && !singleMode && (
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
        )}

        {/* Forgot password / recover flow */}
        {tab === 'forgot-username' && (
          <div>
            <button onClick={() => { setTab('login'); setForgotUsernameSent(false); setForgotUsernameEmail('') }}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: '0 0 16px 0' }}>
              ← Back to login
            </button>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Forgot your username?</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Enter your recovery email. If it matches an account, we’ll send your username.
            </p>
            {forgotUsernameSent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 10 }}>
                <CheckCircle size={20} style={{ color: '#6ee7b7', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>If that email matches an account, the username’s on its way.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotUsername} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  id="account-forgot-username-email"
                  type="email"
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '11px 14px', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  placeholder="your@email.com"
                  value={forgotUsernameEmail}
                  onChange={e => setForgotUsernameEmail(e.target.value)}
                  aria-label="Recovery email to find username"
                  autoFocus
                  required
                />
                <button type="submit" disabled={loading || !forgotUsernameEmail}
                  style={{ background: forgotUsernameEmail ? 'var(--accent)' : 'var(--bg3)', border: 'none', color: forgotUsernameEmail ? '#fff' : 'var(--muted)', padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: forgotUsernameEmail ? 'pointer' : 'not-allowed' }}>
                  {loading ? 'Sending…' : 'Send Username'}
                </button>
              </form>
            )}
          </div>
        )}

        {tab === 'recover' && (
          <div>
            <button onClick={() => { setTab('login'); setRecoverSent(false); setRecoverUsername('') }}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: '0 0 16px 0' }}>
              ← Back to login
            </button>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Forgot your password?</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Enter your username. If your account has a recovery email, we’ll send a reset link valid for 30 minutes.
            </p>
            {recoverSent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 10 }}>
                <CheckCircle size={20} style={{ color: '#6ee7b7', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>If a recovery email exists, it’s on its way.</span>
              </div>
            ) : (
              <form onSubmit={handleRecover} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  id="account-recover-username"
                  style={{ ...inputStyle }}
                  placeholder="Your username"
                  value={recoverUsername}
                  onChange={e => setRecoverUsername(e.target.value)}
                  aria-label="Username for account recovery"
                  autoFocus
                  required
                />
                <button type="submit" disabled={loading || !recoverUsername}
                  style={{ background: recoverUsername ? 'var(--accent)' : 'var(--bg3)', border: 'none', color: recoverUsername ? '#fff' : 'var(--muted)', padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: recoverUsername ? 'pointer' : 'not-allowed' }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        )}

        {tab !== 'recover' && tab !== 'forgot-username' && success ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 10 }}>
            <CheckCircle size={20} style={{ color: 'var(--green)', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>{success}</span>
          </div>
        ) : tab !== 'recover' && tab !== 'forgot-username' ? (
          <>
          {tab === 'login' && browserSupportsWebAuthn() && (
            <div style={{ marginBottom: 4 }}>
              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={passkeyLoading}
                aria-label="Sign in with a passkey (Touch ID, Face ID, or security key)"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
                  padding: '11px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                  cursor: passkeyLoading ? 'not-allowed' : 'pointer', marginBottom: 12,
                  opacity: passkeyLoading ? 0.6 : 1,
                }}
              >
                {passkeyLoading
                  ? <><Loader size={15} className="spinning" /> Waiting for passkey…</>
                  : <><Fingerprint size={15} /> Use a passkey</>}
              </button>
              <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', margin: '-8px 0 12px', lineHeight: 1.5 }}>
                No passkey yet? Log in with password below, then add one from your account dashboard.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>or sign in with password</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="account-username" style={labelStyle}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                <input
                  id="account-username"
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
              <label htmlFor="account-password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                <input
                  id="account-password"
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
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {tab === 'create' && (
              <div>
                <label htmlFor="account-confirm-pw" style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                  <input
                    id="account-confirm-pw"
                    type={showPw ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingLeft: 34, borderColor: form.confirmPassword && !passwordsMatch ? '#e63946' : undefined }}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                {form.confirmPassword && !passwordsMatch && (
                  <p style={{ fontSize: 11, color: '#e63946', marginTop: 4 }}>Passwords don't match</p>
                )}
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent)' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {tab === 'create' && form.password.length >= 1 && strength && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(strength.score/4)*100}%`, background: strength.color, borderRadius: 2, transition: 'width 0.2s, background 0.2s' }} />
                </div>
                <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, minWidth: 40 }}>{strength.label}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.username || !form.password || (tab === 'create' && (!strength || strength.score < 3 || !passwordsMatch || !form.confirmPassword))}
              style={{
                background: (!loading && form.username && form.password && (tab !== 'create' || (strength && strength.score >= 3 && passwordsMatch && form.confirmPassword))) ? 'var(--accent)' : 'var(--bg3)',
                border: 'none',
                color: (!loading && form.username && form.password && (tab !== 'create' || (strength && strength.score >= 3 && passwordsMatch && form.confirmPassword))) ? '#fff' : 'var(--muted)',
                padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 14,
                cursor: (!loading && form.username && form.password && (tab !== 'create' || (strength && strength.score >= 3 && passwordsMatch && form.confirmPassword))) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              {loading ? <><Loader size={15} className="spinning" /> Working…</> : (tab === 'login' ? 'Log In' : 'Create Account')}
            </button>

            {tab === 'create' && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label htmlFor="account-email" style={labelStyle}>
                    Recovery Email{' '}
                    <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional — required to run campaigns)</span>
                  </label>
                  <input
                    id="account-email"
                    type="email"
                    style={inputStyle}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
                  AES-256 encrypted · never shared · used only for password recovery
                </p>
                {/* Warning shown only when user leaves email blank */}
                {!form.email && (
                  <div style={{
                    background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.35)',
                    borderRadius: 8, padding: '10px 12px',
                    fontSize: 12, color: '#f4a261', lineHeight: 1.65,
                  }}>
                    <strong style={{ display: 'block', marginBottom: 3 }}>⚠️ No recovery email</strong>
                    If you forget your password, your account and reputation cannot be recovered.
                    A recovery email is also required before you can accept campaign contributions.
                    You can add one later in your account settings.
                  </div>
                )}
              </div>
            )}
            {tab === 'login' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button type="button" onClick={() => { setTab('recover'); setError(null) }}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, textAlign: 'left', padding: 0, textDecoration: 'underline' }}>
                  Forgot your password?
                </button>
                <button type="button" onClick={() => { setTab('forgot-username'); setError(null) }}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, textAlign: 'left', padding: 0, textDecoration: 'underline' }}>
                  Forgot your username?
                </button>
              </div>
            )}
            {singleMode && (
              <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>
                {tab === 'login' ? (
                  <>Don't have an account?{' '}
                    <button type="button" onClick={() => { setTab('create'); setError(null) }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: 0, textDecoration: 'underline', fontFamily: 'inherit' }}>
                      Join
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => { setTab('login'); setError(null) }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: 0, textDecoration: 'underline', fontFamily: 'inherit' }}>
                      Log in
                    </button>
                  </>
                )}
              </p>
            )}
            {tab === 'create' && (
              <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
                Scouts don't need an email — browse and report anonymously. Email is only required if you want to run campaigns.
              </p>
            )}
            {tab === 'create' && (
              <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                By creating an account you agree to our{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 600 }}
                  onClick={e => e.stopPropagation()}
                >
                  Terms of Use
                </a>
                .
              </p>
            )}
          </form>
          </>
        ) : null}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
