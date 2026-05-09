import { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle, XCircle, Clock, MapPin, Eye, RefreshCw, Lock, AlertCircle, CheckSquare, Scale, ShieldCheck, MessageSquare } from 'lucide-react'

import { API_BASE as AI_URL } from '../config.js'

const CAMERA_TYPE_LABELS = {
  alpr: 'ALPR / Plate Reader',
  shotspotter: 'ShotSpotter',
  facial: 'Facial Recognition',
  cctv: 'CCTV / Surveillance',
  drone: 'Police Drone / UAV',
  unknown: 'Unknown',
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#e63946',
}

function SightingCard({ sighting, onModerate, loading }) {
  const [mapOpen, setMapOpen] = useState(false)
  const hasCoords = sighting.lat && sighting.lng
  const mapsUrl = hasCoords
    ? `https://maps.google.com/maps?q=${sighting.lat},${sighting.lng}&z=17`
    : null

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
            {CAMERA_TYPE_LABELS[sighting.cameraType] || sighting.cameraType}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} />
            {[sighting.address, sighting.city, sighting.state].filter(Boolean).join(', ')}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0, textAlign: 'right' }}>
          {new Date(sighting.ts).toLocaleString()}<br />
          <span style={{ fontSize: 10, opacity: 0.6 }}>{sighting.id}</span>
        </div>
      </div>

      {/* Notes */}
      {sighting.notes && (
        <div style={{
          background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px',
          fontSize: 13, color: 'var(--muted)', lineHeight: 1.6,
        }}>
          {sighting.notes}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
        <span style={{
          background: hasCoords ? 'rgba(16,185,129,0.1)' : 'rgba(230,57,70,0.1)',
          color: hasCoords ? '#10b981' : '#e63946',
          border: `1px solid ${hasCoords ? 'rgba(16,185,129,0.25)' : 'rgba(230,57,70,0.25)'}`,
          borderRadius: 6, padding: '2px 8px', fontWeight: 600,
        }}>
          {hasCoords ? '📍 Has coords' : '❌ No coords'}
        </span>
        {sighting.hasC2PA && (
          <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>
            🔐 C2PA
          </span>
        )}
        {sighting.userId && (
          <span style={{ background: 'rgba(230,57,70,0.08)', color: 'var(--accent)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>
            👤 Authenticated
          </span>
        )}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
            background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 6, padding: '2px 8px', fontWeight: 600,
            textDecoration: 'none', fontSize: 11,
          }}>
            🗺 View on Maps
          </a>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onModerate(sighting.id, 'approve')}
          disabled={loading}
          style={{
            flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            color: '#10b981', borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <CheckCircle size={14} /> Approve
        </button>
        <button
          onClick={() => onModerate(sighting.id, 'reject')}
          disabled={loading}
          style={{
            flex: 1, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
            color: '#e63946', borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <XCircle size={14} /> Reject
        </button>
      </div>
    </div>
  )
}

// ── Attorney application card ─────────────────────────────────────────────
function AttorneyCard({ app, onReview, loading }) {
  const [notes, setNotes] = useState('')
  let barResult = null
  try { barResult = app.bar_result ? JSON.parse(app.bar_result) : null } catch {}
  const isReviewable = app.status === 'pending'
  const statusColor = { pending: '#f59e0b', approved: '#10b981', rejected: '#e63946' }[app.status] || 'var(--muted)'

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{app.full_name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {app.bar_state}{app.bar_number ? ` • Bar #${app.bar_number}` : ''} • {app.location}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)' }}>
          {new Date(app.submitted_at).toLocaleString()}<br />
          <span style={{
            display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 6,
            fontWeight: 700, fontSize: 10, textTransform: 'uppercase', color: statusColor,
          }}>{app.status}</span>
        </div>
      </div>

      {barResult && (
        <div style={{
          padding: '8px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.5,
          ...(barResult.status === 'found'
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }
            : { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }),
        }}>
          {barResult.status === 'found'
            ? <><ShieldCheck size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /><strong>Bar verified:</strong> {barResult.name}{barResult.active !== undefined && ` — ${barResult.active ? 'Active' : 'Inactive'}`}</>
            : barResult.status === 'not_found'
              ? <><XCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Bar # not found in CA State Bar</>            
              : <><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{app.bar_state} — manual verification required</>}
        </div>
      )}

      <div style={{
        background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px',
        fontSize: 13, color: 'var(--muted)', lineHeight: 1.6,
      }}>{app.background}</div>

      {app.notes && (
        <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
          <MessageSquare size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{app.notes}
        </div>
      )}

      {isReviewable && (
        <>
          <input
            placeholder="Optional admin note…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
              padding: '8px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onReview(app.id, 'approve', notes)} disabled={loading}
              style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Approve
            </button>
            <button onClick={() => onReview(app.id, 'reject', notes)} disabled={loading}
              style={{ flex: 1, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946', borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <XCircle size={14} /> Reject
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminPanel() {
  const [secret, setSecret] = useState('')
  const [remember, setRemember] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [authLocked, setAuthLocked] = useState(false)
  const inactivityTimer = useRef(null)
  const INACTIVITY_MS = 30 * 60 * 1000 // 30 min

  // Reset inactivity timer on any interaction
  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      setAuthed(false)
      fetch(`${AI_URL}/admin/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
    }, INACTIVITY_MS)
  }, [])

  useEffect(() => {
    if (!authed) return
    resetInactivity()
    const events = ['mousemove', 'keydown', 'click', 'scroll']
    events.forEach(e => window.addEventListener(e, resetInactivity, { passive: true }))
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivity))
      clearTimeout(inactivityTimer.current)
    }
  }, [authed, resetInactivity])

  // On mount, check if we already have a valid session cookie
  useEffect(() => {
    fetch(`${AI_URL}/admin/verify-session`, { credentials: 'include' })
      .then(r => { if (r.ok) setAuthed(true) })
      .catch(() => {})
  }, [])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [moderating, setModerating] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('pending') // pending | approved | rejected
  const [bulkLoading, setBulkLoading] = useState(false)
  // Section toggle: sightings | attorneys
  const [adminSection, setAdminSection] = useState('sightings')
  const [attorneyData, setAttorneyData] = useState(null)
  const [attorneyTab, setAttorneyTab] = useState('pending')
  const [attorneyLoading, setAttorneyLoading] = useState(false)
  const [reviewingAttorney, setReviewingAttorney] = useState(false)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${AI_URL}/admin/sightings`, { credentials: 'include' })
      if (res.status === 401) { setAuthed(false); return }
      const json = await res.json()
      setData(json)
    } catch {
      showToast('Failed to load sightings', false)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAttorneyData = useCallback(async () => {
    setAttorneyLoading(true)
    try {
      const res = await fetch(`${AI_URL}/admin/attorney-applications`, { credentials: 'include' })
      if (res.status === 401) { setAuthed(false); return }
      const json = await res.json()
      setAttorneyData(json)
    } catch {
      showToast('Failed to load attorney applications', false)
    } finally {
      setAttorneyLoading(false)
    }
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    const trimmed = secret.trim()
    setAuthError(false)
    setAuthLocked(false)
    try {
      const res = await fetch(`${AI_URL}/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: trimmed }),
      })
      if (res.status === 429) { setAuthLocked(true); return }
      if (!res.ok) { setAuthError(true); return }
      setAuthed(true)
      setSecret('')
      await fetchData()
      await fetchAttorneyData()
    } catch {
      setAuthError(true)
    }
  }

  const handleLogout = async () => {
    await fetch(`${AI_URL}/admin/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
    setAuthed(false)
    setData(null)
    setAttorneyData(null)
  }

  const handleModerate = async (id, action) => {
    setModerating(true)
    try {
      const res = await fetch(`${AI_URL}/admin/sightings/moderate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      const json = await res.json()
      if (json.ok) {
        showToast(`Sighting ${action}d`, true)
        await fetchData()
      } else {
        showToast('Action failed', false)
      }
    } catch {
      showToast('Network error', false)
    } finally {
      setModerating(false)
    }
  }

  const handleAttorneyReview = async (id, action, notes) => {
    setReviewingAttorney(true)
    try {
      const res = await fetch(`${AI_URL}/admin/attorney-applications/review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, notes }),
      })
      const json = await res.json()
      if (json.ok) {
        showToast(`Application ${action}d`, true)
        await fetchAttorneyData()
      } else {
        showToast('Review failed', false)
      }
    } catch {
      showToast('Network error', false)
    } finally {
      setReviewingAttorney(false)
    }
  }

  const handleApproveAll = async () => {
    if (!window.confirm(`Approve all ${data?.pending?.length || 0} pending sightings with coordinates?`)) return
    setBulkLoading(true)
    try {
      const res = await fetch(`${AI_URL}/admin/sightings/approve-all`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      showToast(`Approved ${json.approved} sightings`, true)
      await fetchData()
    } catch {
      showToast('Bulk approve failed', false)
    } finally {
      setBulkLoading(false)
    }
  }

  const s = {
    page: {
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 32px)',
      fontFamily: 'var(--font)',
    },
    input: {
      width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
      color: 'var(--text)', padding: '12px 14px', borderRadius: 8, fontSize: 14,
      outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    },
  }

  if (!authed) {
    return (
      <div style={s.page}>
        <div style={{ maxWidth: 400, margin: '80px auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Lock size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Citeback Admin</h1>
          </div>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              style={s.input}
              placeholder="Admin secret"
              value={secret}
              onChange={e => { setSecret(e.target.value.trim()); setAuthError(false) }}
              autoFocus
              required
            />
            {authError && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--accent)', fontSize: 13 }}>
                <AlertCircle size={14} /> Invalid secret
              </div>
            )}
            {authLocked && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#f59e0b', fontSize: 13 }}>
                <AlertCircle size={14} /> Too many attempts — locked out for 15 minutes
              </div>
            )}
            <button type="submit" disabled={authLocked} style={{
              background: authLocked ? 'var(--border)' : 'var(--accent)', border: 'none', color: '#fff',
              padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 14,
              cursor: authLocked ? 'not-allowed' : 'pointer',
            }}>
              Unlock
            </button>
            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              Session lasts 4 hours · Auto-locks after 30 min inactivity
            </p>
          </form>
        </div>
      </div>
    )
  }

  const currentSightings = data?.[activeTab] || []
  const pendingWithCoords = (data?.pending || []).filter(s => s.lat && s.lng)
  const currentAttorneys = attorneyData?.[attorneyTab] || []

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.ok ? 'rgba(16,185,129,0.95)' : 'rgba(230,57,70,0.95)',
          color: '#fff', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 13,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Session active · auto-locks after 30 min inactivity</div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          Lock Panel
        </button>
      </div>

      {/* Section switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg2)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        <button onClick={() => setAdminSection('sightings')} style={{
          padding: '9px 18px', borderRadius: 9, border: 'none',
          background: adminSection === 'sightings' ? 'var(--bg3)' : 'transparent',
          color: adminSection === 'sightings' ? 'var(--text)' : 'var(--muted)',
          fontWeight: adminSection === 'sightings' ? 700 : 500, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          📸 Sightings
          {(data?.pending?.length ?? 0) > 0 && (
            <span style={{ background: '#f59e0b', color: '#000', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>
              {data.pending.length}
            </span>
          )}
        </button>
        <button onClick={() => { setAdminSection('attorneys'); fetchAttorneyData() }} style={{
          padding: '9px 18px', borderRadius: 9, border: 'none',
          background: adminSection === 'attorneys' ? 'var(--bg3)' : 'transparent',
          color: adminSection === 'attorneys' ? 'var(--text)' : 'var(--muted)',
          fontWeight: adminSection === 'attorneys' ? 700 : 500, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Scale size={13} /> Attorney Queue
          {(attorneyData?.pending?.length ?? 0) > 0 && (
            <span style={{ background: '#5dade2', color: '#000', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>
              {attorneyData.pending.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── SIGHTINGS SECTION ─── */}
      {adminSection === 'sightings' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', marginBottom: 4 }}>Sighting Moderation</h1>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {data?.total ?? '–'} total ·{' '}
                <span style={{ color: STATUS_COLORS.pending }}>{data?.pending?.length ?? 0} pending</span> ·{' '}
                <span style={{ color: STATUS_COLORS.approved }}>{data?.approved?.length ?? 0} approved</span> ·{' '}
                <span style={{ color: STATUS_COLORS.rejected }}>{data?.rejected?.length ?? 0} rejected</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {pendingWithCoords.length > 0 && (
                <button onClick={handleApproveAll} disabled={bulkLoading} style={{
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', borderRadius: 8, padding: '9px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <CheckSquare size={14} /> Approve All ({pendingWithCoords.length} with coords)
                </button>
              )}
              <button onClick={() => fetchData()} disabled={loading} style={{
                background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
                borderRadius: 8, padding: '9px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg2)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {['pending', 'approved', 'rejected'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '8px 16px', borderRadius: 7, border: 'none',
                background: activeTab === t ? 'var(--bg3)' : 'transparent',
                color: activeTab === t ? STATUS_COLORS[t] : 'var(--muted)',
                fontWeight: activeTab === t ? 700 : 500, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s', textTransform: 'capitalize',
              }}>
                {t} <span style={{ opacity: 0.6, fontSize: 11 }}>({data?.[t]?.length ?? 0})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ color: 'var(--muted)', fontSize: 14, padding: 24 }}>Loading…</div>
          ) : currentSightings.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 14, padding: 24, textAlign: 'center' }}>No {activeTab} sightings.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
              {currentSightings.map(s => (
                <SightingCard key={s.id} sighting={s} onModerate={activeTab === 'pending' ? handleModerate : null} loading={moderating} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── ATTORNEY SECTION ─── */}
      {adminSection === 'attorneys' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', marginBottom: 4 }}>Attorney Applications</h1>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {attorneyData?.total ?? '–'} total ·{' '}
                <span style={{ color: '#f59e0b' }}>{attorneyData?.pending?.length ?? 0} pending</span> ·{' '}
                <span style={{ color: '#10b981' }}>{attorneyData?.approved?.length ?? 0} approved</span> ·{' '}
                <span style={{ color: '#e63946' }}>{attorneyData?.rejected?.length ?? 0} rejected</span>
              </div>
            </div>
            <button onClick={() => fetchAttorneyData()} disabled={attorneyLoading} style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
              borderRadius: 8, padding: '9px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <RefreshCw size={13} style={{ animation: attorneyLoading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg2)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {['pending', 'approved', 'rejected'].map(t => (
              <button key={t} onClick={() => setAttorneyTab(t)} style={{
                padding: '8px 16px', borderRadius: 7, border: 'none',
                background: attorneyTab === t ? 'var(--bg3)' : 'transparent',
                color: attorneyTab === t ? ({ pending: '#f59e0b', approved: '#10b981', rejected: '#e63946' }[t]) : 'var(--muted)',
                fontWeight: attorneyTab === t ? 700 : 500, fontSize: 13, cursor: 'pointer',
                textTransform: 'capitalize',
              }}>
                {t} <span style={{ opacity: 0.6, fontSize: 11 }}>({attorneyData?.[t]?.length ?? 0})</span>
              </button>
            ))}
          </div>

          {attorneyLoading ? (
            <div style={{ color: 'var(--muted)', fontSize: 14, padding: 24 }}>Loading…</div>
          ) : currentAttorneys.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 14, padding: 24, textAlign: 'center' }}>No {attorneyTab} attorney applications.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
              {currentAttorneys.map(a => (
                <AttorneyCard key={a.id} app={a} onReview={handleAttorneyReview} loading={reviewingAttorney} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
