import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react'

import { API_BASE as AI_URL } from '../config.js'

export default function ResetPasswordPage({ setTab }) {
  const [token, setToken] = useState(null)
  const [tokenId, setTokenId] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get('token'))
    setTokenId(params.get('id'))
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
  const canSubmit = !loading && strength.score >= 3 && confirmPassword && passwordsMatch

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || !token || !tokenId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${AI_URL}/account/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, id: tokenId, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed')
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token || !tokenId) {
    return (
      <section className="rp2-page">
        <div className="rp2-alert-box rp2-alert-box--error">
          <AlertCircle size={18} style={{ color: '#e63946', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="rp2-alert-title">Invalid reset link</p>
            <p className="rp2-alert-text">This link is missing required parameters. Request a new one from the login screen.</p>
          </div>
        </div>
        <button onClick={() => setTab('home')} className="rp2-go-home-btn">
          Go home
        </button>
      </section>
    )
  }

  if (done) {
    return (
      <section className="rp2-page">
        <div className="rp2-alert-box--success">
          <CheckCircle size={22} style={{ color: '#6ee7b7', flexShrink: 0 }} />
          <div>
            <p className="rp2-alert-title">Password updated</p>
            <p className="rp2-alert-text">You can now log in with your new password.</p>
          </div>
        </div>
        <button onClick={() => setTab('home')} className="rp2-go-home-btn-accent">
          Go to home
        </button>
      </section>
    )
  }

  return (
    <section className="rp2-page">
      <div className="rp2-heading-section">
        <h1 className="rp2-heading">Reset your password</h1>
        <p className="rp2-heading-desc">Choose a new password. Must be Good or stronger.</p>
      </div>

      <form onSubmit={handleSubmit} className="rp2-form">
        <div>
          <label className="rp2-label">New Password</label>
          <div className="rp2-input-wrapper">
            <Lock size={14} className="rp2-input-icon" />
            <input
              type={showPw ? 'text' : 'password'}
              className="rp2-input"
              style={{ paddingLeft: 34, paddingRight: 40 }}
              placeholder="At least 8 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              autoComplete="new-password"
              autoFocus
              required
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="rp2-pw-toggle">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {password.length > 0 && (
          <div className="rp2-strength-row">
            <div className="rp2-strength-track">
              <div style={{ height: '100%', width: `${(strength.score/4)*100}%`, background: strength.color, borderRadius: 2, transition: 'width 0.2s, background 0.2s' }} />
            </div>
            <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, minWidth: 44 }}>{strength.label}</span>
          </div>
        )}

        <div>
          <label className="rp2-label">Confirm New Password</label>
          <div className="rp2-input-wrapper">
            <Lock size={14} className="rp2-input-icon" />
            <input
              type={showPw ? 'text' : 'password'}
              className="rp2-input"
              style={{ paddingLeft: 34, borderColor: confirmPassword && !passwordsMatch ? '#e63946' : undefined }}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(null) }}
              autoComplete="new-password"
              required
            />
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="rp2-pw-mismatch">Passwords don't match</p>
          )}
        </div>

        {error && (
          <div className="rp2-error-box">
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <button type="submit" disabled={!canSubmit}
          style={{
            background: canSubmit ? 'var(--accent)' : 'var(--bg3)',
            border: 'none',
            color: canSubmit ? '#fff' : 'var(--muted)',
            padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 14,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          {loading ? <><Loader size={15} className="spinning" /> Updating…</> : 'Set New Password'}
        </button>
      </form>
    </section>
  )
}
