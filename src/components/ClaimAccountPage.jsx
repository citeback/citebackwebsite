import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader, User, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { API_BASE as AI_URL } from '../config.js'

export default function ClaimAccountPage({ setTab }) {
  const { login } = useAuth()
  const [userId, setUserId] = useState(null)
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [claimedUsername, setClaimedUsername] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setUserId(params.get('id'))
    setToken(params.get('token'))
  }, [])

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

  const strength = pwStrength(password)
  const passwordsMatch = password === confirmPassword
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username)
  const canSubmit = !loading && usernameValid && strength.score >= 3 && confirmPassword && passwordsMatch

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || !userId || !token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${AI_URL}/claim-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, token, username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Activation failed')
      setClaimedUsername(data.username || username)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!userId || !token) {
    return (
      <section className="cla-page">
        <div className="cla-alert-box cla-alert-box--error">
          <AlertCircle size={18} className="cla-icon-error" />
          <div>
            <p className="cla-alert-title">Invalid activation link</p>
            <p className="cla-alert-text">This link is missing required parameters. Check your approval email for the correct link.</p>
          </div>
        </div>
        <button onClick={() => setTab('home')} className="cla-go-home-btn">
          Go home
        </button>
      </section>
    )
  }

  if (done) {
    return (
      <section className="cla-page">
        <div className="cla-alert-box cla-alert-box--success">
          <CheckCircle size={22} className="cla-icon-success" />
          <div>
            <p className="cla-alert-title">Account activated!</p>
            <p className="cla-alert-text">
              You're now logged in as <strong className="cla-claimed-username">@{claimedUsername}</strong> with your attorney verification badge. Head to your reputation dashboard to add a passkey and set a recovery email.
            </p>
          </div>
        </div>
        <button onClick={() => setTab('reputation')} className="cla-go-account-btn">
          Go to My Account →
        </button>
      </section>
    )
  }

  return (
    <section className="cla-page">
      <div className="cla-heading-section">
        <div className="cla-badge">
          <Scale size={13} /> Attorney Account Activation
        </div>
        <h1 className="cla-heading">Set up your account</h1>
        <p className="cla-heading-desc">
          Choose a username and password for your verified attorney account. You'll get your attorney badge immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="cla-form">
        <div>
          <label className="cla-label">Username</label>
          <div className="cla-input-wrapper">
            <User size={14} className="cla-input-icon" />
            <input
              type="text"
              className="cla-input cla-input--icon-left"
              style={{ borderColor: username && !usernameValid ? '#e63946' : undefined }}
              placeholder="3–20 chars, letters/numbers/_"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(null) }}
              autoComplete="username"
              autoFocus
              maxLength={20}
              required
            />
          </div>
          {username && !usernameValid && (
            <p className="cla-username-error">3–20 characters, letters, numbers, and underscores only</p>
          )}
        </div>

        <div>
          <label className="cla-label">Password</label>
          <div className="cla-input-wrapper">
            <Lock size={14} className="cla-input-icon" />
            <input
              type={showPw ? 'text' : 'password'}
              className="cla-input cla-input--icon-both"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="cla-pw-toggle">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {password.length > 0 && (
          <div className="cla-strength-row">
            <div className="cla-strength-track">
              <div className="cla-strength-fill" style={{ width: `${(strength.score/4)*100}%`, background: strength.color }} />
            </div>
            <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, minWidth: 44 }}>{strength.label}</span>
          </div>
        )}

        <div>
          <label className="cla-label">Confirm Password</label>
          <div className="cla-input-wrapper">
            <Lock size={14} className="cla-input-icon" />
            <input
              type={showPw ? 'text' : 'password'}
              className="cla-input cla-input--icon-left"
              style={{ borderColor: confirmPassword && !passwordsMatch ? '#e63946' : undefined }}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(null) }}
              autoComplete="new-password"
              required
            />
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="cla-pw-mismatch">Passwords don't match</p>
          )}
        </div>

        {error && (
          <div className="cla-error-box">
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <button type="submit" disabled={!canSubmit} className="cla-submit-btn"
          style={{
            background: canSubmit ? 'var(--accent)' : 'var(--bg3)',
            color: canSubmit ? '#fff' : 'var(--muted)',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}>
          {loading ? <><Loader size={15} className="spinning" /> Activating…</> : 'Activate Account'}
        </button>
      </form>
    </section>
  )
}
