import { useState, useEffect } from 'react'
import { Shield, Star, CheckCircle, Clock, XCircle, TrendingUp, Eye, ChevronRight, AlertCircle, Loader, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AccountModal from './AccountModal'

import { API_BASE as AI_URL } from '../config.js'

function EmailManager({ token, onEmailSaved }) {
  const [emailInfo, setEmailInfo] = useState(null) // { hasEmail, maskedEmail }
  const [editing, setEditing] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetch(`${AI_URL}/account/email`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setEmailInfo(d)).catch(() => {})
  }, [token])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const res = await fetch(`${AI_URL}/account/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editing ? 12 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={14} style={{ color: 'var(--muted)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Recovery Email</span>
          {saved && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Saved</span>}
        </div>
        {!editing && emailInfo.hasEmail && (
          <button onClick={() => { setEditing(true); setNewEmail('') }}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
            Change
          </button>
        )}
      </div>
      {!editing && (
        emailInfo.hasEmail ? (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
            {emailInfo.maskedEmail} · <span style={{ color: '#10b981' }}>Recovery enabled</span>
          </p>
        ) : (
          <div style={{
            marginTop: 10,
            background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.35)',
            borderRadius: 8, padding: '12px 14px',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f4a261', marginBottom: 4 }}>
              ⚠️ No recovery email set
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 10 }}>
              Without a recovery email, a forgotten password means permanent loss of your account and reputation.
              A recovery email is also <strong style={{ color: 'var(--text)' }}>required before you can propose or accept campaign contributions</strong> — to prevent operators from claiming a lost account after receiving funds.
              A disposable email address is fine.
            </p>
            <button
              onClick={() => { setEditing(true); setNewEmail('') }}
              style={{
                background: '#f4a261', border: 'none', color: '#000',
                padding: '8px 16px', borderRadius: 7, fontWeight: 700,
                fontSize: 12, cursor: 'pointer',
              }}
            >
              Add Recovery Email
            </button>
          </div>
        )
      )}
      {editing && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="email" placeholder="your@email.com" value={newEmail} onChange={e => setNewEmail(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', width: '100%' }}
            autoFocus />
          <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            Encrypted with AES-256 · never shared · used only for password recovery
          </p>
          {err && <p style={{ fontSize: 12, color: '#e63946' }}>{err}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{ flex: 1, background: 'var(--accent)', border: 'none', color: '#fff', padding: '9px', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => { setEditing(false); setErr(null) }}
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '9px', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
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
  'Run campaigns up to $1,000. After 10 successful campaigns, cap rises to $7,500 — no legal entity required.',
  'Unlock verification bounties + enhanced governance weight.',
  'Full operator access + governance voting weight.',
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
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: `${TIER_COLORS[tier]}18`,
      border: `1px solid ${TIER_COLORS[tier]}40`,
      borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase', color: TIER_COLORS[tier],
    }}>
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
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
        Maximum tier reached 🏆
      </div>
    )
  }
  const pct = Math.min(100, ((rep - current) / (next - current)) * 100)
  const pointsToNext = next - rep
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Progress to Tier {tier + 1} · {TIER_NAMES[tier + 1]}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{pointsToNext} pts to go</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 100,
          background: `linear-gradient(90deg, ${TIER_COLORS[tier]}, ${TIER_COLORS[tier + 1]})`,
          width: `${pct}%`, transition: 'width 0.6s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--muted)' }}>
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
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
          {CAMERA_TYPE_LABELS[sighting.cameraType] || sighting.cameraType}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {[sighting.address, sighting.city, sighting.state].filter(Boolean).join(', ')}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
        {sighting.points > 0 && (
          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>+{sighting.points} pts</div>
        )}
      </div>
    </div>
  )
}

export default function ReputationPage({ setTab }) {
  const { user, token, isLoggedIn, refreshUser } = useAuth()
  const [sightings, setSightings] = useState(null)
  const [sightingsLoading, setSightingsLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (isLoggedIn) refreshUser()
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn || !token) return
    setSightingsLoading(true)
    fetch(`${AI_URL}/account/sightings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setSightings(d.sightings || []); setSightingsLoading(false) })
      .catch(() => setSightingsLoading(false))
  }, [isLoggedIn, token])

  // Not logged in
  if (!isLoggedIn) {
    return (
      <section style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 5vw, 24px)', maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16,
          }}>
            <Shield size={11} /> Community Reputation
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Earn Trust. Unlock Access.
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 520 }}>
            Submit surveillance sightings to build your reputation score. Reach Tier 1 to access campaigns and verification bounties.
          </p>
        </div>

        {/* Tier ladder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {TIER_NAMES.map((name, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${TIER_COLORS[i]}18`, border: `1px solid ${TIER_COLORS[i]}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 15, color: TIER_COLORS[i],
              }}>{i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>
                  Tier {i} · {name}
                  {i === 0 && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>starting point</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{TIER_DESCRIPTIONS[i]}</div>
              </div>
              {i > 0 && (
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', flexShrink: 0 }}>
                  {TIER_THRESHOLDS[i]} pts
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              background: 'var(--accent)', border: 'none', color: '#fff',
              padding: '13px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Shield size={15} /> Create Free Account
          </button>
          <button
            onClick={() => setTab('report')}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
              padding: '13px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
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
    <section style={{ padding: 'clamp(32px, 6vw, 64px) clamp(16px, 5vw, 24px)', maxWidth: 640, margin: '0 auto', width: '100%' }}>
      {/* Profile header */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '24px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${TIER_COLORS[user.tier]}18`, border: `1px solid ${TIER_COLORS[user.tier]}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 16, color: TIER_COLORS[user.tier],
              }}>
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{user.username}</div>
                <TierBadge tier={user.tier || 0} />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1 }}>
              {user.reputation || 0}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>
              Reputation
            </div>
          </div>
        </div>

        <ProgressBar rep={user.reputation || 0} tier={user.tier || 0} />
      </div>

      {/* Tier perk */}
      {user.tierPerk && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          background: `${TIER_COLORS[user.tier || 0]}08`,
          border: `1px solid ${TIER_COLORS[user.tier || 0]}20`,
          borderRadius: 10, padding: '10px 14px', fontSize: 13,
        }}>
          <Star size={13} style={{ color: TIER_COLORS[user.tier || 0], flexShrink: 0 }} />
          <span style={{ color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Your access:</strong> {user.tierPerk}
          </span>
        </div>
      )}

      {/* How to earn more */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px', marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
          How to Earn Points
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'C2PA-verified photo (Proofmode, Galaxy S24+, or Pixel 10)', pts: '+1 pt' },
            { label: 'Non-C2PA photos accepted but earn no points', pts: '0 pts', soon: false },
            { label: 'New camera not in any existing database', pts: '+2 pts', soon: true },
            { label: 'Community corroboration (Phase 2)', pts: '+3 pts', soon: true },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <TrendingUp size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <span style={{ flex: 1, color: item.soon ? 'var(--muted)' : 'var(--text)' }}>
                {item.label}
                {item.soon && <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--bg3)', borderRadius: 4, padding: '1px 5px', color: 'var(--muted)' }}>soon</span>}
              </span>
              <span style={{ fontWeight: 700, fontSize: 12, color: item.soon ? 'var(--muted)' : '#10b981' }}>{item.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Email recovery management */}
      <EmailManager token={token} onEmailSaved={refreshUser} />

      {/* CTA */}
      <button
        onClick={() => setTab('report')}
        style={{
          width: '100%', background: 'var(--accent)', border: 'none', color: '#fff',
          padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 24,
        }}
      >
        <Eye size={16} /> Submit a Sighting (+1 pt)
        <ChevronRight size={15} />
      </button>

      {/* Submission history */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
          Your Sightings
        </div>

        {sightingsLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, padding: '16px 0' }}>
            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Loading…
          </div>
        )}

        {!sightingsLoading && sightings && sightings.length === 0 && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            No sightings yet.{' '}
            <button
              onClick={() => setTab('report')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}
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
  )
}
