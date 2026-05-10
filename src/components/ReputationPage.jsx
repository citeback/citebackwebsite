import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Shield, Star, CheckCircle, Clock, XCircle, TrendingUp, Eye, ChevronRight, AlertCircle, Loader, Mail, Fingerprint, Trash2, Scale, Plus, LogOut, ShieldAlert, Lock } from 'lucide-react'
import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser'

// Detect likely platform for a smarter default passkey name
function detectPlatformName() {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) return 'Android'
  if (/Mac OS X/.test(ua) && !/like Mac OS/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Windows PC'
  if (/Linux/.test(ua)) return 'Linux'
  return ''
}
import { useAuth } from '../context/AuthContext'
import AccountModal from './AccountModal'

import { API_BASE as AI_URL } from '../config.js'

function PasskeyManager() {
  const [passkeys, setPasskeys] = useState(null)
  const [adding, setAdding] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    fetch(`${AI_URL}/passkey/list`, { credentials: 'include' })
      .then(r => r.json()).then(d => setPasskeys(d.passkeys || [])).catch(() => setPasskeys([]))
  }
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    setAdding(true); setErr(null); setOk(null)
    // Use user-entered name, fall back to platform detection, then null
    const resolvedName = deviceName.trim() || detectPlatformName() || null
    try {
      const optRes = await fetch(`${AI_URL}/passkey/register-options`, { credentials: 'include' })
      const { options, tempId } = await optRes.json()
      if (!optRes.ok) throw new Error(options?.error || 'Failed to get options')
      const credential = await startRegistration({ optionsJSON: options })
      const verRes = await fetch(`${AI_URL}/passkey/register-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response: credential, tempId, deviceName: resolvedName }),
      })
      const verData = await verRes.json()
      if (!verRes.ok) throw new Error(verData.error || 'Registration failed')
      setOk(`Passkey added${resolvedName ? ` (${resolvedName})` : ''}!`)
      setDeviceName('')
      load()
    } catch (e) {
      if (e?.name === 'AbortError') setErr('Passkey setup cancelled.')
      else if (e?.name === 'NotAllowedError') setErr('Passkey setup cancelled or not allowed.')
      else setErr(e.message || 'Failed to add passkey')
    } finally { setAdding(false) }
  }

  const handleDelete = async (credentialId) => {
    if (!window.confirm('Remove this passkey?')) return
    setDeleting(credentialId)
    try {
      const res = await fetch(`${AI_URL}/passkey/${encodeURIComponent(credentialId)}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      load()
    } catch (e) { setErr(e.message) }
    finally { setDeleting(null) }
  }

  return (
    <div className="rp-section">
      <div className="rp-section-header">
        <div className="rp-icon-label">
          <Fingerprint size={14} className="rp-icon-muted" />
          <span className="rp-label">Passkeys</span>
          {ok && <span className="rp-success-text">✓ {ok}</span>}
        </div>
        <button
          onClick={handleAdd}
          disabled={adding}
          className={`rp-add-passkey-btn${adding ? ' rp-btn--loading' : ''}`}
        >
          {adding ? <Loader size={11} className="spinning" /> : <Plus size={11} />}
          Add passkey
        </button>
      </div>

      {adding && (
        <div className="rp-adding-wrapper">
          <label htmlFor="rp-device-name" className="rp-sr-label">Device name</label>
          <input
            id="rp-device-name"
            placeholder="Device name (optional, e.g. MacBook Touch ID)"
            value={deviceName}
            onChange={e => setDeviceName(e.target.value)}
            className="rp-input"
            autoFocus
          />
          <p className="rp-muted-text">Your browser will prompt you to use Touch ID, Face ID, or a security key. Follow the browser prompt, then the passkey will be saved.</p>
        </div>
      )}

      {err && (
        <div className="rp-error-box">
          <AlertCircle size={12} /> {err}
        </div>
      )}

      {passkeys === null ? (
        <div className="rp-loading"><Loader size={12} className="spinning" /> Loading...</div>
      ) : passkeys.length === 0 ? (
        <p className="rp-muted-text">No passkeys yet. Add one to sign in without a password using Touch ID, Face ID, or a hardware key.</p>
      ) : (
        <div className="rp-passkey-list">
          {passkeys.map(pk => (
            <div key={pk.id} className="rp-passkey-item">
              <Fingerprint size={13} className="rp-icon-muted-shrink" />
              <div className="rp-flex1">
                <div className="rp-label">{pk.device_name || 'Passkey'}</div>
                <div className="rp-passkey-date">Added {new Date(pk.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <button
                onClick={() => handleDelete(pk.credential_id)}
                disabled={deleting === pk.credential_id}
                className={`rp-passkey-delete-btn${deleting === pk.credential_id ? ' rp-btn--deleting' : ''}`}
                title="Remove passkey"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmailManager({ onEmailSaved }) {
  const { isReauthed, reauth } = useAuth()
  const [emailInfo, setEmailInfo] = useState(null) // { hasEmail, maskedEmail }
  const [editing, setEditing] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState(null)
  const [reauthPw, setReauthPw] = useState('')
  const [reauthing, setReathing] = useState(false)

  useEffect(() => {
    fetch(`${AI_URL}/account/email`, { credentials: 'include' })
      .then(r => r.json()).then(d => setEmailInfo(d)).catch(() => {})
  }, [])

  const handleReauth = async (e) => {
    e.preventDefault()
    setReathing(true); setErr(null)
    try {
      await reauth(reauthPw)
      setReauthPw('')
    } catch (e) { setErr(e.message) }
    finally { setReathing(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const res = await fetch(`${AI_URL}/account/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: newEmail }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to save')
      setEmailInfo({ hasEmail: !!newEmail, maskedEmail: newEmail ? newEmail.replace(/^(.{2}).*@/, '$1***@') : null })
      setEditing(false); setSaved(true); setNewEmail('')
      setTimeout(() => setSaved(false), 3000)
      if (newEmail && onEmailSaved) onEmailSaved()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  if (!emailInfo) return null

  return (
    <div className="rp-section">
      <div className={`rp-section-header${!editing ? ' rp-section-header--mb0' : ''}`}>
        <div className="rp-icon-label">
          <Mail size={14} className="rp-icon-muted" />
          <span className="rp-label">Recovery Email</span>
          {saved && <span className="rp-success-text">✓ Saved</span>}
        </div>
        {!editing && emailInfo.hasEmail && (
          <button onClick={() => { setEditing(true); setNewEmail('') }} className="rp-btn-sm">
            Change
          </button>
        )}
      </div>
      {!editing && (
        emailInfo.hasEmail ? (
          <p className="rp-email-info">
            {emailInfo.maskedEmail} · <span className="rp-recovery-enabled">Recovery enabled</span>
          </p>
        ) : (
          <div className="rp-email-warning">
            <p className="rp-email-warning-title">
              ⚠️ No recovery email set
            </p>
            <p className="rp-email-warning-desc">
              Without a recovery email, a forgotten password means permanent loss of your account and reputation.
              A recovery email is also <strong className="rp-color-fg">required before you can propose or accept campaign contributions</strong> - to prevent operators from claiming a lost account after receiving funds.
              A disposable email address is fine.
            </p>
            <button
              onClick={() => { setEditing(true); setNewEmail('') }}
              className="rp-email-warning-btn"
            >
              Add Recovery Email
            </button>
          </div>
        )
      )}
      {editing && !isReauthed() && (
        <form onSubmit={handleReauth} className="rp-form-col">
          <p className="rp-muted-text">
            Confirm your password to change your recovery email.
          </p>
          <label htmlFor="rp-reauth-pw" className="rp-sr-label">Password</label>
          <input id="rp-reauth-pw" type="password" placeholder="Your password" value={reauthPw} onChange={e => setReauthPw(e.target.value)}
            className="rp-input-field"
            autoFocus />
          {err && <p className="rp-error-text">{err}</p>}
          <div className="rp-btn-row">
            <button type="submit" disabled={reauthing} className="rp-btn-primary-sm">
              {reauthing ? 'Verifying...' : 'Verify'}
            </button>
            <button type="button" onClick={() => { setEditing(false); setErr(null); setReauthPw('') }} className="rp-btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}
      {editing && isReauthed() && (
        <form onSubmit={handleSave} className="rp-form-col">
          <label htmlFor="rp-recovery-email" className="rp-sr-label">Recovery email address</label>
          <input id="rp-recovery-email" type="email" placeholder="your@email.com" value={newEmail} onChange={e => setNewEmail(e.target.value)}
            className="rp-input-field"
            autoFocus />
          <p className="rp-hint">
            Encrypted with AES-256 · never shared · used only for password recovery
          </p>
          {err && <p className="rp-error-text">{err}</p>}
          <div className="rp-btn-row">
            <button type="submit" disabled={saving} className="rp-btn-primary-sm">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => { setEditing(false); setErr(null) }} className="rp-btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

const TIER_NAMES = ['Scout', 'Operator', 'Verifier', 'Guardian']
const TIER_THRESHOLDS = [0, 10, 50, 200]
const TIER_COLORS = ['#6b7280', '#e63946', '#f59e0b', '#10b981']
const TIER_DESCRIPTIONS = [
  'Submit camera sightings to build your reputation score.',
  'Run campaigns up to $1,000. After 10 successful campaigns, cap rises to $7,500 - no legal entity required.',
  'Unlock verification bounties. Vote on camera classification disputes - your reputation backs your call.',
  'Full operator access. Vote on campaign disbursements with proof-of-donation weight (logarithmic, capped at 9.0).',
]

const CAMERA_TYPE_LABELS = {
  alpr: 'ALPR / Plate Reader',
  shotspotter: 'ShotSpotter',
  facial: 'Facial Recognition',
  cctv: 'CCTV / Surveillance',
  drone: 'Police Drone / UAV',
  unknown: 'Unknown',
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: '#f59e0b', label: 'Pending Review' },
  approved: { icon: CheckCircle, color: '#10b981', label: 'Approved' },
  rejected: { icon: XCircle, color: '#e63946', label: 'Rejected' },
}

function TierBadge({ tier }) {
  return (
    <span
      className="rp-tier-badge"
      style={{
        background: `${TIER_COLORS[tier]}18`,
        border: `1px solid ${TIER_COLORS[tier]}40`,
        color: TIER_COLORS[tier],
      }}
    >
      <Shield size={10} />
      Tier {tier} · {TIER_NAMES[tier]}
    </span>
  )
}

function ProgressBar({ rep, tier }) {
  const current = TIER_THRESHOLDS[tier] || 0
  const next = TIER_THRESHOLDS[tier + 1]
  if (next == null) {
    return (
      <div className="rp-muted-text">
        Maximum tier reached 🏆
      </div>
    )
  }
  const pct = Math.min(100, ((rep - current) / (next - current)) * 100)
  const pointsToNext = next - rep
  return (
    <div>
      <div className="rp-progress-row">
        <span className="rp-muted-text">Progress to Tier {tier + 1} · {TIER_NAMES[tier + 1]}</span>
        <span className="rp-progress-pts">{pointsToNext} pts to go</span>
      </div>
      <div className="rp-progress-track">
        <div style={{
          height: '100%', borderRadius: 100,
          background: `linear-gradient(90deg, ${TIER_COLORS[tier]}, ${TIER_COLORS[tier + 1]})`,
          width: `${pct}%`, transition: 'width 0.6s ease',
        }} />
      </div>
      <div className="rp-progress-labels">
        <span>{current} pts</span>
        <span>{next} pts</span>
      </div>
    </div>
  )
}

function SightingRow({ sighting }) {
  const cfg = STATUS_CONFIG[sighting.status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <div className="rp-sighting-row">
      <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
      <div className="rp-sighting-content">
        <div className="rp-sighting-title">
          {CAMERA_TYPE_LABELS[sighting.cameraType] || sighting.cameraType}
        </div>
        <div className="rp-sighting-addr">
          {[sighting.address, sighting.city, sighting.state].filter(Boolean).join(', ')}
        </div>
      </div>
      <div className="rp-sighting-status">
        <div style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
        {sighting.points > 0 && (
          <div className="rp-pts-badge">+{sighting.points} pts</div>
        )}
      </div>
    </div>
  )
}

function PasswordManager() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(false)
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr(null) }

  // Mirrors server entropy check
  const strength = (pw) => {
    if (!pw) return null
    if (pw.length < 8) return { label: 'Too short', color: '#e63946', ok: false }
    const cs = (/[a-z]/.test(pw)?26:0)+(/[A-Z]/.test(pw)?26:0)+(/[0-9]/.test(pw)?10:0)+(/[^a-zA-Z0-9]/.test(pw)?32:0)
    const e = Math.log2(cs||1)*pw.length
    if (e < 40) return { label: 'Weak', color: '#e63946', ok: false }
    if (e < 55) return { label: 'Fair', color: '#f59e0b', ok: false }
    if (e < 70) return { label: 'Good', color: '#2a9d8f', ok: true }
    return { label: 'Strong', color: '#6ee7b7', ok: true }
  }
  const str = strength(form.next)
  const match = form.next && form.confirm && form.next === form.confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!str?.ok) return
    if (!match) { setErr('Passwords do not match'); return }
    setLoading(true); setErr(null)
    try {
      const res = await fetch(`${AI_URL}/account/change-password`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setOk(true)
      setForm({ current: '', next: '', confirm: '' })
      setTimeout(() => { setOk(false); setOpen(false) }, 2500)
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="rp-section">
      <div className={`rp-section-header${open ? ' rp-section-header--mb14' : ' rp-section-header--mb0'}`}>
        <div className="rp-icon-label">
          <Lock size={14} className="rp-icon-muted" />
          <span className="rp-label">Change Password</span>
          {ok && <span className="rp-success-text">✓ Password updated</span>}
        </div>
        <button onClick={() => { setOpen(o => !o); setErr(null) }} className="rp-btn-sm-text">
          {open ? 'Cancel' : 'Change'}
        </button>
      </div>
      {open && (
        <form onSubmit={handleSubmit} className="rp-form-col">
          <label htmlFor="rp-current-pw" className="rp-sr-label">Current password</label>
          <input id="rp-current-pw" type="password" className="rp-input-pw" placeholder="Current password" value={form.current}
            onChange={e => set('current', e.target.value)} autoComplete="current-password" required />
          <div>
            <input type="password" className="rp-input-pw rp-input-mb4" placeholder="New password" value={form.next}
              onChange={e => set('next', e.target.value)} autoComplete="new-password" required />
            {str && <div className="rp-pw-strength-label" style={{ color: str.color }}>{str.label}</div>}
          </div>
          <input type="password" className="rp-input-pw" placeholder="Confirm new password" value={form.confirm}
            onChange={e => set('confirm', e.target.value)} autoComplete="new-password" required />
          {form.confirm && !match && <div className="rp-pw-mismatch">Passwords don't match</div>}
          {err && <div className="rp-error-text">{err}</div>}
          <button type="submit" disabled={loading || !str?.ok || !match}
            className={`rp-pw-submit-btn${str?.ok && match ? ' rp-pw-submit-btn--active' : ' rp-pw-submit-btn--disabled'}`}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          <p className="rp-hint">Changing your password signs out all other devices.</p>
        </form>
      )}
    </div>
  )
}

function SessionManager() {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState(null)

  const handleLogoutAll = useCallback(async () => {
    if (!window.confirm('This will sign you out on all devices - including this one. Continue?')) return
    setLoading(true); setErr(null)
    try {
      const res = await fetch(`${AI_URL}/account/logout-all`, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setDone(true)
      setTimeout(logout, 1200)
    } catch (e) {
      setErr(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [logout])

  return (
    <div className="rp-section">
      <div className="rp-session-header">
        <ShieldAlert size={14} className="rp-icon-muted" />
        <span className="rp-label">Session Security</span>
      </div>
      <p className="rp-session-desc">
        Sign out of all devices at once. Use this if you think your account may be compromised.
        Changing your password has the same effect.
      </p>
      {done ? (
        <div className="rp-session-done">✓ All sessions invalidated. Signing you out...</div>
      ) : (
        <button
          onClick={handleLogoutAll}
          disabled={loading}
          className={`rp-logout-btn${loading ? ' rp-btn--loading' : ''}`}
        >
          {loading ? <Loader size={13} className="spinning" /> : <LogOut size={13} />}
          {loading ? 'Signing out...' : 'Sign out all devices'}
        </button>
      )}
      {err && <p className="rp-session-error">{err}</p>}
    </div>
  )
}

export default function ReputationPage({ setTab }) {
  const { user, isLoggedIn, refreshUser } = useAuth()
  const [sightings, setSightings] = useState(null)
  const [sightingsLoading, setSightingsLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (isLoggedIn) refreshUser()
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return
    setSightingsLoading(true)
    fetch(`${AI_URL}/account/sightings`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setSightings(d.sightings || []); setSightingsLoading(false) })
      .catch(() => setSightingsLoading(false))
  }, [isLoggedIn])

  // Not logged in
  if (!isLoggedIn) {
    return (
      <section className="rp-page-guest">
        <div className="rp-hero-intro">
          <div className="rp-reputation-badge">
            <Shield size={11} /> Community Reputation
          </div>
          <h1 className="rp-hero-title">
            Earn Trust. Unlock Access.
          </h1>
          <p className="rp-hero-desc">
            Submit surveillance sightings to build your reputation score. Reach Tier 1 to access campaigns and verification bounties.
          </p>
        </div>

        {/* Tier ladder */}
        <div className="rp-tier-ladder">
          {TIER_NAMES.map((name, i) => (
            <div key={i} className="rp-tier-item">
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${TIER_COLORS[i]}18`, border: `1px solid ${TIER_COLORS[i]}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 15, color: TIER_COLORS[i],
              }}>{i}</div>
              <div className="rp-tier-info">
                <div className="rp-tier-name">
                  Tier {i} · {name}
                  {i === 0 && <span className="rp-tier-starting">starting point</span>}
                </div>
                <div className="rp-tier-desc">{TIER_DESCRIPTIONS[i]}</div>
              </div>
              {i > 0 && (
                <div className="rp-tier-pts">
                  {TIER_THRESHOLDS[i]} pts
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rp-hero-btns">
          <button
            onClick={() => setShowAuthModal(true)}
            className="rp-btn-primary"
          >
            <Shield size={15} /> Create Free Account
          </button>
          <button
            onClick={() => setTab('report')}
            className="rp-btn-secondary"
          >
            Submit Anonymously
          </button>
        </div>

        {showAuthModal && <AccountModal onClose={() => setShowAuthModal(false)} />}
      </section>
    )
  }

  // Logged in
  return (
    <>
    <Helmet>
      <title>Your Account | Citeback</title>
      <meta name="description" content="View your Citeback reputation score, verified sightings, campaign contributions, and account settings. Privacy-first identity built on contributions." />
      <meta property="og:title" content="Your Account | Citeback" />
      <meta property="og:description" content="View your Citeback reputation score, verified sightings, campaign contributions, and account settings." />
    </Helmet>
    <section className="rp-page">
      {/* Profile header */}
      <div className="rp-profile-card">
        <div className="rp-profile-header">
          <div>
            <div className="rp-avatar-row">
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${TIER_COLORS[user.tier]}18`, border: `1px solid ${TIER_COLORS[user.tier]}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 16, color: TIER_COLORS[user.tier],
              }}>
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="rp-username-row">
                  <div className="rp-username">{user.username}</div>
                  {user.attorney_verified ? (
                    <span className="rp-attorney-badge">
                      <Scale size={10} /> Attorney
                    </span>
                  ) : null}
                </div>
                <TierBadge tier={user.tier || 0} />
              </div>
            </div>
          </div>

          <div className="rp-score-col">
            <div className="rp-rep-score">
              {user.reputation || 0}
            </div>
            <div className="rp-rep-label">
              Reputation
            </div>
          </div>
        </div>

        <ProgressBar rep={user.reputation || 0} tier={user.tier || 0} />
      </div>

      {/* Tier perk */}
      {user.tierPerk && (
        <div
          className="rp-tier-perk"
          style={{
            background: `${TIER_COLORS[user.tier || 0]}08`,
            border: `1px solid ${TIER_COLORS[user.tier || 0]}20`,
          }}
        >
          <Star size={13} style={{ color: TIER_COLORS[user.tier || 0], flexShrink: 0 }} />
          <span className="rp-color-muted">
            <strong className="rp-color-fg">Your access:</strong> {user.tierPerk}
          </span>
        </div>
      )}

      {/* How to earn more */}
      <div className="rp-section">
        <div className="rp-section-title">
          How to Earn Points
        </div>
        <div className="rp-earn-list">
          {[
            { label: 'C2PA-verified photo (Proofmode, Galaxy S24+, or Pixel 10)', pts: '+1 pt' },
            { label: 'Non-C2PA photos accepted but earn no points', pts: '0 pts', soon: false },
            { label: 'New camera not in any existing database', pts: '+2 pts', soon: true },
            { label: 'Community corroboration (Phase 2)', pts: '+3 pts', soon: true },
          ].map((item, i) => (
            <div key={i} className="rp-earn-item">
              <TrendingUp size={12} className="rp-icon-muted-shrink" />
              <span className={`rp-earn-label${item.soon ? ' rp-earn-label--soon' : ''}`}>
                {item.label}
                {item.soon && <span className="rp-soon-badge">soon</span>}
              </span>
              <span className={item.soon ? 'rp-earn-pts--soon' : 'rp-earn-pts'}>{item.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Email recovery management */}
      <EmailManager onEmailSaved={refreshUser} />

      {/* Passkey management */}
      <PasskeyManager />

      {/* Change password */}
      <PasswordManager />

      {/* Session security */}
      <SessionManager />

      {/* CTA */}
      <button
        onClick={() => setTab('report')}
        className="rp-cta-btn"
      >
        <Eye size={16} /> Submit a Sighting (+1 pt)
        <ChevronRight size={15} />
      </button>

      {/* Submission history */}
      <div className="rp-section-last">
        <div className="rp-section-title">
          Your Sightings
        </div>

        {sightingsLoading && (
          <div className="rp-sightings-loading">
            <Loader size={14} className="spinning" />
            Loading…
          </div>
        )}

        {!sightingsLoading && sightings && sightings.length === 0 && (
          <div className="rp-empty-state">
            No sightings yet.{' '}
            <button
              onClick={() => setTab('report')}
              className="rp-inline-link"
            >
              Submit your first one →
            </button>
          </div>
        )}

        {!sightingsLoading && sightings && sightings.length > 0 && (
          <div>
            {sightings.map(s => <SightingRow key={s.id} sighting={s} />)}
          </div>
        )}
      </div>
    </section>
    </>
  )
}
