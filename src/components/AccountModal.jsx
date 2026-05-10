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

  // Compute submit button enabled state
  const submitEnabled = !loading && form.username && form.password &&
    (tab !== 'create' || (strength && strength.score >= 3 && passwordsMatch && form.confirmPassword))

  const content = (
    <div className="am-overlay" role="presentation" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-heading"
        className="am-modal"
      >
        {/* Close */}
        <button onClick={onClose} aria-label="Close" className="am-close-btn">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="am-header">
          <h2 id="account-modal-heading" className="am-title">
            {tab === 'login' ? 'Welcome back' : tab === 'create' ? 'Join Citeback' : 'Recover your account'}
          </h2>
          {tab !== 'recover' && (
            <p className="am-subtitle">
              {tab === 'login'
                ? 'Sign in to track your surveillance sightings and reputation score.'
                : 'No email. No real name. Just a username and password.'}
            </p>
          )}
        </div>

        {/* Tabs — only shown when not in single mode */}
        {tab !== 'recover' && !singleMode && (
          <div className="am-tabs">
            {['login', 'create'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); setSuccess(null) }}
                className={`am-tab${tab === t ? ' am-tab--active' : ''}`}
              >
                {t === 'login' ? 'Log In' : 'Create Account'}
              </button>
            ))}
          </div>
        )}

        {/* Forgot username flow */}
        {tab === 'forgot-username' && (
          <div>
            <button onClick={() => { setTab('login'); setForgotUsernameSent(false); setForgotUsernameEmail('') }}
              className="am-back-btn">
              ← Back to login
            </button>
            <h3 className="am-recover-title">Forgot your username?</h3>
            <p className="am-recover-desc">
              Enter your recovery email. If it matches an account, we'll send your username.
            </p>
            {forgotUsernameSent ? (
              <div className="am-success">
                <CheckCircle size={20} className="am-success-icon" />
                <span className="am-success-text">If that email matches an account, the username's on its way.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotUsername} className="am-recover-form">
                <input
                  id="account-forgot-username-email"
                  type="email"
                  className="am-input"
                  placeholder="your@email.com"
                  value={forgotUsernameEmail}
                  onChange={e => setForgotUsernameEmail(e.target.value)}
                  aria-label="Recovery email to find username"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !forgotUsernameEmail}
                  className="am-submit-btn"
                >
                  {loading ? 'Sending…' : 'Send Username'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Recover / forgot-password flow */}
        {tab === 'recover' && (
          <div>
            <button onClick={() => { setTab('login'); setRecoverSent(false); setRecoverUsername('') }}
              className="am-back-btn">
              ← Back to login
            </button>
            <h3 className="am-recover-title">Forgot your password?</h3>
            <p className="am-recover-desc">
              Enter your username. If your account has a recovery email, we'll send a reset link valid for 30 minutes.
            </p>
            {recoverSent ? (
              <div className="am-success">
                <CheckCircle size={20} className="am-success-icon" />
                <span className="am-success-text">If a recovery email exists, it's on its way.</span>
              </div>
            ) : (
              <form onSubmit={handleRecover} className="am-recover-form">
                <input
                  id="account-recover-username"
                  className="am-input"
                  placeholder="Your username"
                  value={recoverUsername}
                  onChange={e => setRecoverUsername(e.target.value)}
                  aria-label="Username for account recovery"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !recoverUsername}
                  className="am-submit-btn"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        )}

        {tab !== 'recover' && tab !== 'forgot-username' && success ? (
          <div className="am-success">
            <CheckCircle size={20} className="am-success-icon--green" />
            <span className="am-success-text">{success}</span>
          </div>
        ) : tab !== 'recover' && tab !== 'forgot-username' ? (
          <>
          {tab === 'login' && browserSupportsWebAuthn() && (
            <div className="am-passkey-section">
              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={passkeyLoading}
                aria-label="Sign in with a passkey (Touch ID, Face ID, or security key)"
                className="am-passkey-btn"
              >
                {passkeyLoading
                  ? <><Loader size={15} className="spinning" /> Waiting for passkey…</>
                  : <><Fingerprint size={15} /> Use a passkey</>}
              </button>
              <p className="am-passkey-hint">
                No passkey yet? Log in with password below, then add one from your account dashboard.
              </p>
              <div className="am-or-divider">
                <div className="am-or-line" />
                <span className="am-or-text">or sign in with password</span>
                <div className="am-or-line" />
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="am-form">
            <div>
              <label htmlFor="account-username" className="am-label">Username</label>
              <div className="am-input-wrapper">
                <User size={14} className="am-input-icon" />
                <input
                  id="account-username"
                  className="am-input am-input--padded-l"
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
                <p className="am-pw-hint">
                  3–20 characters, letters/numbers/underscores only
                </p>
              )}
            </div>

            <div>
              <label htmlFor="account-password" className="am-label">Password</label>
              <div className="am-input-wrapper">
                <Lock size={14} className="am-input-icon" />
                <input
                  id="account-password"
                  type={showPw ? 'text' : 'password'}
                  className="am-input am-input--padded-lr"
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
                  className="am-pw-toggle"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {tab === 'create' && (
              <div>
                <label htmlFor="account-confirm-pw" className="am-label">Confirm Password</label>
                <div className="am-input-wrapper">
                  <Lock size={14} className="am-input-icon" />
                  <input
                    id="account-confirm-pw"
                    type={showPw ? 'text' : 'password'}
                    className={`am-input am-input--padded-l${form.confirmPassword && !passwordsMatch ? ' am-input--error' : ''}`}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                {form.confirmPassword && !passwordsMatch && (
                  <p className="am-pw-mismatch">Passwords don't match</p>
                )}
              </div>
            )}

            {error && (
              <div className="am-error">
                <AlertCircle size={14} className="am-error-icon" />
                {error}
              </div>
            )}

            {tab === 'create' && form.password.length >= 1 && strength && (
              <div className="am-strength-row">
                <div className="am-strength-bar-track">
                  <div
                    className="am-strength-bar-fill"
                    style={{ width: `${(strength.score/4)*100}%`, background: strength.color }}
                  />
                </div>
                <span className="am-strength-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!submitEnabled}
              className="am-submit-btn"
            >
              {loading ? <><Loader size={15} className="spinning" /> Working…</> : (tab === 'login' ? 'Log In' : 'Create Account')}
            </button>

            {tab === 'create' && (
              <div className="am-divider">
                <div>
                  <label htmlFor="account-email" className="am-label">
                    Recovery Email{' '}
                    <span className="am-label-optional">(optional — required to run campaigns)</span>
                  </label>
                  <input
                    id="account-email"
                    type="email"
                    className="am-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <p className="am-email-hint">
                  AES-256 encrypted · never shared · used only for password recovery
                </p>
                {/* Warning shown only when user leaves email blank */}
                {!form.email && (
                  <div className="am-email-warning">
                    <strong className="am-email-warning-title">⚠️ No recovery email</strong>
                    If you forget your password, your account and reputation cannot be recovered.
                    A recovery email is also required before you can accept campaign contributions.
                    You can add one later in your account settings.
                  </div>
                )}
              </div>
            )}
            {tab === 'login' && (
              <div className="am-link-row">
                <button type="button" onClick={() => { setTab('recover'); setError(null) }}
                  className="am-link-btn">
                  Forgot your password?
                </button>
                <button type="button" onClick={() => { setTab('forgot-username'); setError(null) }}
                  className="am-link-btn">
                  Forgot your username?
                </button>
              </div>
            )}
            {singleMode && (
              <p className="am-single-mode-note">
                {tab === 'login' ? (
                  <>Don't have an account?{' '}
                    <button type="button" onClick={() => { setTab('create'); setError(null) }}
                      className="am-link-btn--accent">
                      Join
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => { setTab('login'); setError(null) }}
                      className="am-link-btn--accent">
                      Log in
                    </button>
                  </>
                )}
              </p>
            )}
            {tab === 'create' && (
              <p className="am-scouts-note">
                Scouts don't need an email — browse and report anonymously. Email is only required if you want to run campaigns.
              </p>
            )}
            {tab === 'create' && (
              <p className="am-tos-note">
                By creating an account you agree to our{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="am-tos-link"
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
