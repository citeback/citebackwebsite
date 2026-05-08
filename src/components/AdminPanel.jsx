import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, MapPin, Eye, RefreshCw, Lock, AlertCircle, CheckSquare } from 'lucide-react'

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

export default function AdminPanel() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [moderating, setModerating] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('pending') // pending | approved | rejected
  const [bulkLoading, setBulkLoading] = useState(false)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async (sec = secret) => {
    setLoading(true)
    try {
      const res = await fetch(`${AI_URL}/admin/sightings?secret=${encodeURIComponent(sec)}`)
      if (res.status === 401) { setAuthError(true); return }
      const json = await res.json()
      setData(json)
      setAuthed(true)
      setAuthError(false)
    } catch {
      showToast('Failed to load sightings', false)
    } finally {
      setLoading(false)
    }
  }, [secret])

  const handleAuth = async (e) => {
    e.preventDefault()
    await fetchData(secret)
  }

  const handleModerate = async (id, action) => {
    setModerating(true)
    try {
      const res = await fetch(`${AI_URL}/admin/sightings/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: secret, id, action }),
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

  const handleApproveAll = async () => {
    if (!window.confirm(`Approve all ${data?.pending?.length || 0} pending sightings with coordinates?`)) return
    setBulkLoading(true)
    try {
      const res = await fetch(`${AI_URL}/admin/sightings/approve-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: secret }),
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
              onChange={e => { setSecret(e.target.value); setAuthError(false) }}
              autoFocus
              required
            />
            {authError && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--accent)', fontSize: 13 }}>
                <AlertCircle size={14} /> Invalid secret
              </div>
            )}
            <button type="submit" style={{
              background: 'var(--accent)', border: 'none', color: '#fff',
              padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              Unlock
            </button>
          </form>
        </div>
      </div>
    )
  }

  const currentSightings = data?.[activeTab] || []
  const pendingWithCoords = (data?.pending || []).filter(s => s.lat && s.lng)

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

      {/* Header */}
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
            <button
              onClick={handleApproveAll}
              disabled={bulkLoading}
              style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981', borderRadius: 8, padding: '9px 14px',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <CheckSquare size={14} />
              Approve All ({pendingWithCoords.length} with coords)
            </button>
          )}
          <button
            onClick={() => fetchData()}
            disabled={loading}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
              borderRadius: 8, padding: '9px 14px', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg2)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {['pending', 'approved', 'rejected'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 16px', borderRadius: 7, border: 'none',
              background: activeTab === t ? 'var(--bg3)' : 'transparent',
              color: activeTab === t ? STATUS_COLORS[t] : 'var(--muted)',
              fontWeight: activeTab === t ? 700 : 500, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
            }}
          >
            {t} <span style={{ opacity: 0.6, fontSize: 11 }}>({data?.[t]?.length ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Sightings list */}
      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 14, padding: 24 }}>Loading…</div>
      ) : currentSightings.length === 0 ? (
        <div style={{ color: 'var(--muted)', fontSize: 14, padding: 24, textAlign: 'center' }}>
          No {activeTab} sightings.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
          {currentSightings.map(s => (
            <SightingCard
              key={s.id}
              sighting={s}
              onModerate={activeTab === 'pending' ? handleModerate : null}
              loading={moderating}
            />
          ))}
        </div>
      )}
    </div>
  )
}
