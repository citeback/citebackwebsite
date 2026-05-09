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

  const inputStyle = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '11px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  if (!userId || !token) {
    return (
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px', maxWidth: 440, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 10, padding: '16px' }}>
          <AlertCircle size={18} style={{ color: '#e63946', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Invalid activation link</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>This link is missing required parameters. Check your approval email for the correct link.</p>
          </div>
        </div>
        <button onClick={() => setTab('home')} style={{ marginTop: 20, background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
          Go home
        </button>
      </section>
    )
  }

  if (done) {
    return (
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px', maxWidth: 440, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '20px', marginBottom: 20 }}>
          <CheckCircle size={22} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Account activated!</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
              You're now logged in as <strong style={{ color: 'var(--text)' }}>@{claimedUsername}</strong> with your attorney verification badge. Head to your reputation dashboard to add a passkey and set a recovery email.
            </p>
          </div>
        </div>
        <button onClick={() => setTab('reputation')} style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
          Go to My Account →
        </button>
      </section>
    )
  }

  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 16 }}>
          <Scale size={13} /> Attorney Account Activation
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>Set up your account</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Choose a username and password for your verified attorney account. You'll get your attorney badge immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.04em' }}>Username</label>
          <div style={{ position: 'relative' }}>
            <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              style={{ ...inputStyle, paddingLeft: 34, borderColor: username && !usernameValid ? '#e63946' : undefined }}
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
            <p style={{ fontSize: 11, color: '#e63946', marginTop: 4 }}>3–20 characters, letters, numbers, and underscores only</p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.04em' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
            <input
              type={showPw ? 'text' : 'password'}
              style={{ ...inputStyle, paddingLeft: 34, paddingRight: 40 }}
              placeholder="At least 8 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {password.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(strength.score/4)*100}%`, background: strength.color, borderRadius: 2, transition: 'width 0.2s, background 0.2s' }} />
            </div>
            <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, minWidth: 44 }}>{strength.label}</span>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.04em' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
            <input
              type={showPw ? 'text' : 'password'}
              style={{ ...inputStyle, paddingLeft: 34, borderColor: confirmPassword && !passwordsMatch ? '#e63946' : undefined }}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(null) }}
              autoComplete="new-password"
              required
            />
          </div>
          {confirmPassword && !passwordsMatch && (
            <p style={{ fontSize: 11, color: '#e63946', marginTop: 4 }}>Passwords don't match</p>
          )}
        </div>

        {error && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e63946' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <button type="submit" disabled={!canSubmit}
          style={{ background: canSubmit ? 'var(--accent)' : 'var(--bg3)', border: 'none', color: canSubmit ? '#fff' : 'var(--muted)', padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Activating…</> : 'Activate Account'}
        </button>
      </form>
    </section>
  )
}
