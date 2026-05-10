import { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle, XCircle, Clock, MapPin, RefreshCw, Lock, AlertCircle, CheckSquare, Scale, ShieldCheck, MessageSquare } from 'lucide-react'

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

const CAMPAIGN_STATUSES = ['unclaimed', 'claimed', 'active', 'funded']

function shortWallet(addr) {
  if (!addr || addr.length < 16) return addr || null
  return addr.slice(0, 8) + '…' + addr.slice(-8)
}

function SightingCard({ sighting, onModerate, loading }) {
  const hasCoords = sighting.lat && sighting.lng
  const mapsUrl = hasCoords
    ? `https://maps.google.com/maps?q=${sighting.lat},${sighting.lng}&z=17`
    : null

  return (
    <div className="ap-card">
      {/* Header row */}
      <div className="ap-card-header">
        <div className="ap-card-title-block">
          <div className="ap-card-title">
            {CAMERA_TYPE_LABELS[sighting.cameraType] || sighting.cameraType}
          </div>
          <div className="ap-card-location">
            <MapPin size={11} />
            {[sighting.address, sighting.city, sighting.state].filter(Boolean).join(', ')}
          </div>
        </div>
        <div className="ap-card-meta-time">
          {new Date(sighting.ts).toLocaleString()}<br />
          <span className="ap-card-id">{sighting.id}</span>
        </div>
      </div>

      {/* Notes */}
      {sighting.notes && (
        <div className="ap-card-notes">{sighting.notes}</div>
      )}

      {/* Meta tags */}
      <div className="ap-card-tags">
        <span className={`ap-tag ${hasCoords ? 'ap-tag--green' : 'ap-tag--red'}`}>
          {hasCoords ? '📍 Has coords' : '❌ No coords'}
        </span>
        {sighting.hasC2PA && (
          <span className="ap-tag ap-tag--purple">🔐 C2PA</span>
        )}
        {sighting.userId && (
          <span className="ap-tag ap-tag--accent">👤 Authenticated</span>
        )}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="ap-tag ap-tag--blue ap-tag--link">
            🗺 View on Maps
          </a>
        )}
      </div>

      {/* Action buttons */}
      <div className="ap-card-actions">
        <button
          onClick={() => onModerate(sighting.id, 'approve')}
          disabled={loading}
          className="ap-btn-approve"
        >
          <CheckCircle size={14} /> Approve
        </button>
        <button
          onClick={() => onModerate(sighting.id, 'reject')}
          disabled={loading}
          className="ap-btn-reject"
        >
          <XCircle size={14} /> Reject
        </button>
      </div>


      {/* ─── PROPOSALS SECTION ─── */}
      {adminSection === 'proposals' && (
        <>
          <div className="ap-section-header">
            <div>
              <h1 className="ap-h1">Campaign Proposals</h1>
              <div className="ap-subtitle">{proposals.length} proposal{proposals.length !== 1 ? 's' : ''} submitted</div>
            </div>
            <button onClick={fetchProposals} className="ap-refresh-btn" disabled={proposalsLoading}>
              {proposalsLoading ? '⧗ Loading…' : '↻ Refresh'}
            </button>
          </div>
          {proposalsLoading ? (
            <div className="ap-empty-state">Loading proposals…</div>
          ) : proposals.length === 0 ? (
            <div className="ap-empty-state">No proposals yet.</div>
          ) : (
            <div className="ap-card">
              <table className="ap-table">
                <thead><tr>
                  <th>Type</th><th>Title</th><th>Location</th><th>Goal</th><th>Submitted</th>
                </tr></thead>
                <tbody>
                  {proposals.map((p, i) => (
                    <tr key={i}>
                      <td><span className="ap-badge ap-badge--pending">{p.type}</span></td>
                      <td>{p.title}</td>
                      <td className="ap-cell-muted">{p.location}</td>
                      <td className="ap-cell-muted">${(p.goal || 0).toLocaleString()}</td>
                      <td className="ap-cell-muted">{p.ts ? new Date(p.ts).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── REGISTRY SECTION ─── */}
      {adminSection === 'registry' && (
        <>
          <div className="ap-section-header">
            <div>
              <h1 className="ap-h1">Expert Directory Applications</h1>
              <div className="ap-subtitle">{registry.length} application{registry.length !== 1 ? 's' : ''} submitted</div>
            </div>
            <button onClick={fetchRegistry} className="ap-refresh-btn" disabled={registryLoading}>
              {registryLoading ? '⧗ Loading…' : '↻ Refresh'}
            </button>
          </div>
          {registryLoading ? (
            <div className="ap-empty-state">Loading registry…</div>
          ) : registry.length === 0 ? (
            <div className="ap-empty-state">No registry applications yet.</div>
          ) : (
            <div className="ap-card">
              <table className="ap-table">
                <thead><tr>
                  <th>Role</th><th>Location</th><th>Background</th><th>Submitted</th>
                </tr></thead>
                <tbody>
                  {registry.map((r, i) => (
                    <tr key={i}>
                      <td><span className="ap-badge ap-badge--approved">{r.role}</span></td>
                      <td className="ap-cell-muted">{r.location}</td>
                      <td className="ap-cell-break">{r.background?.slice(0, 200)}{r.background?.length > 200 ? '…' : ''}</td>
                      <td className="ap-cell-muted">{r.ts ? new Date(r.ts).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
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
    <div className="ap-card">
      <div className="ap-card-header">
        <div className="ap-card-title-block">
          <div className="ap-attorney-name">{app.full_name}</div>
          <div className="ap-attorney-sub">
            {app.bar_state}{app.bar_number ? ` • Bar #${app.bar_number}` : ''} • {app.location}
          </div>
        </div>
        <div className="ap-attorney-meta">
          {new Date(app.submitted_at).toLocaleString()}<br />
          <span className="ap-attorney-status" style={{ color: statusColor }}>{app.status}</span>
          {app.status === 'approved' && (
            <span className={`ap-attorney-acct ${app.account_created ? 'ap-attorney-acct--created' : 'ap-attorney-acct--missing'}`}>
              {app.account_created ? '✓ acct created' : 'no acct'}
            </span>
          )}
        </div>
      </div>

      {barResult && (
        <div className={`ap-bar-result ${barResult.status === 'found' ? 'ap-bar-result--found' : 'ap-bar-result--warn'}`}>
          {barResult.status === 'found'
            ? <><ShieldCheck size={12} className="ap-inline-icon" /><strong>Bar verified:</strong> {barResult.name}{barResult.active !== undefined && ` — ${barResult.active ? 'Active' : 'Inactive'}`}</>
            : barResult.status === 'not_found'
              ? <><XCircle size={12} className="ap-inline-icon" />Bar # not found in CA State Bar</>
              : <><Clock size={12} className="ap-inline-icon" />{app.bar_state} — manual verification required</>}
        </div>
      )}

      <div className="ap-card-notes">{app.background}</div>

      {app.notes && (
        <div className="ap-attorney-admin-notes">
          <MessageSquare size={11} className="ap-inline-icon" />{app.notes}
        </div>
      )}

      {isReviewable && (
        <>
          <input
            placeholder="Optional admin note…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="ap-form-input"
          />
          <div className="ap-card-actions">
            <button onClick={() => onReview(app.id, 'approve', notes)} disabled={loading} className="ap-btn-approve">
              <CheckCircle size={14} /> Approve
            </button>
            <button onClick={() => onReview(app.id, 'reject', notes)} disabled={loading} className="ap-btn-reject">
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
  const [activeTab, setActiveTab] = useState('pending')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [adminSection, setAdminSection] = useState('sightings')
  const [attorneyData, setAttorneyData] = useState(null)
  const [attorneyTab, setAttorneyTab] = useState('pending')
  const [attorneyLoading, setAttorneyLoading] = useState(false)
  const [reviewingAttorney, setReviewingAttorney] = useState(false)

  // Campaign state
  const [campaigns, setCampaigns] = useState([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [campaignStatusUpdating, setCampaignStatusUpdating] = useState(null)

  // Proposals state
  const [proposals, setProposals] = useState([])
  const [proposalsLoading, setProposalsLoading] = useState(false)

  // Registry state
  const [registry, setRegistry] = useState([])
  const [registryLoading, setRegistryLoading] = useState(false)

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

  const fetchProposals = useCallback(async () => {
    setProposalsLoading(true)
    try {
      const res = await fetch(`${AI_URL}/admin/proposals`, { credentials: 'include' })
      if (res.status === 401) { setAuthed(false); return }
      const json = await res.json()
      setProposals(json.proposals ?? [])
    } catch { showToast('Failed to load proposals', false) }
    finally { setProposalsLoading(false) }
  }, [])

  const fetchRegistry = useCallback(async () => {
    setRegistryLoading(true)
    try {
      const res = await fetch(`${AI_URL}/admin/registry`, { credentials: 'include' })
      if (res.status === 401) { setAuthed(false); return }
      const json = await res.json()
      setRegistry(json.entries ?? [])
    } catch { showToast('Failed to load registry', false) }
    finally { setRegistryLoading(false) }
  }, [])

  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true)
    try {
      const res = await fetch(`${AI_URL}/admin/campaigns`, { credentials: 'include' })
      if (res.status === 401) { setAuthed(false); return }
      const json = await res.json()
      setCampaigns(Array.isArray(json) ? json : (json.campaigns ?? []))
    } catch {
      showToast('Failed to load campaigns', false)
    } finally {
      setCampaignsLoading(false)
    }
  }, [])

  const handleCampaignStatus = async (id, status) => {
    setCampaignStatusUpdating(id)
    try {
      const res = await fetch(`${AI_URL}/admin/campaigns/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Status update failed')
      showToast(`Campaign status → ${status}`, true)
      await fetchCampaigns()
    } catch {
      showToast('Status update failed', false)
    } finally {
      setCampaignStatusUpdating(null)
    }
  }

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
    setCampaigns([])
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

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="ap-page">
        <div className="ap-login-wrapper">
          <div className="ap-login-title">
            <Lock size={20} className="ap-icon-accent" />
            <h1>Citeback Admin</h1>
          </div>
          <form onSubmit={handleAuth} className="ap-login-form">
            <input
              type="password"
              className="ap-form-input ap-form-input--lg"
              placeholder="Admin secret"
              value={secret}
              onChange={e => { setSecret(e.target.value.trim()); setAuthError(false) }}
              autoFocus
              required
            />
            {authError && (
              <div className="ap-error-msg">
                <AlertCircle size={14} /> Invalid secret
              </div>
            )}
            {authLocked && (
              <div className="ap-locked-msg">
                <AlertCircle size={14} /> Too many attempts — locked out for 15 minutes
              </div>
            )}
            <button type="submit" disabled={authLocked} className={`ap-btn-unlock ${authLocked ? 'ap-btn-unlock--disabled' : ''}`}>
              Unlock
            </button>
            <p className="ap-login-hint">
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
  const pendingAttorneyCount = attorneyData?.pending?.length ?? 0

  return (
    <div className="ap-page">
      {/* Toast */}
      {toast && (
        <div className={`ap-toast ${toast.ok ? 'ap-toast--ok' : 'ap-toast--err'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header row */}
      <div className="ap-header">
        <div className="ap-header-info">Session active · auto-locks after 30 min inactivity</div>
        <button onClick={handleLogout} className="ap-lock-btn">
          Lock Panel
        </button>
      </div>

      {/* Section switcher */}
      <div className="ap-section-switcher">
        <button
          onClick={() => setAdminSection('sightings')}
          className={`ap-switcher-btn ${adminSection === 'sightings' ? 'ap-switcher-btn--active' : ''}`}
        >
          📸 Sightings
          {(data?.pending?.length ?? 0) > 0 && (
            <span className="ap-count-badge ap-count-badge--amber">{data.pending.length}</span>
          )}
        </button>
        <button
          onClick={() => { setAdminSection('attorneys'); fetchAttorneyData() }}
          className={`ap-switcher-btn ${adminSection === 'attorneys' ? 'ap-switcher-btn--active' : ''}`}
        >
          <Scale size={13} /> Attorney Queue
          {pendingAttorneyCount > 0 && (
            <span className="ap-count-badge ap-count-badge--red">{pendingAttorneyCount}</span>
          )}
        </button>
        <button
          onClick={() => { setAdminSection('campaigns'); fetchCampaigns() }}
          className={`ap-switcher-btn ${adminSection === 'campaigns' ? 'ap-switcher-btn--active' : ''}`}
        >
          🎯 Campaigns
          {campaigns.length > 0 && (
            <span className="ap-count-badge ap-count-badge--blue">{campaigns.length}</span>
          )}
        </button>
        <button
          onClick={() => { setAdminSection('proposals'); fetchProposals() }}
          className={`ap-switcher-btn ${adminSection === 'proposals' ? 'ap-switcher-btn--active' : ''}`}
        >
          💡 Proposals
          {proposals.length > 0 && (
            <span className="ap-count-badge ap-count-badge--blue">{proposals.length}</span>
          )}
        </button>
        <button
          onClick={() => { setAdminSection('registry'); fetchRegistry() }}
          className={`ap-switcher-btn ${adminSection === 'registry' ? 'ap-switcher-btn--active' : ''}`}
        >
          📋 Registry
          {registry.length > 0 && (
            <span className="ap-count-badge ap-count-badge--blue">{registry.length}</span>
          )}
        </button>
      </div>

      {/* ─── SIGHTINGS SECTION ─── */}
      {adminSection === 'sightings' && (
        <>
          <div className="ap-section-header">
            <div>
              <h1 className="ap-h1">Sighting Moderation</h1>
              <div className="ap-subtitle">
                {data?.total ?? '–'} total ·{' '}
                <span className="ap-color-pending">{data?.pending?.length ?? 0} pending</span> ·{' '}
                <span className="ap-color-approved">{data?.approved?.length ?? 0} approved</span> ·{' '}
                <span className="ap-color-rejected">{data?.rejected?.length ?? 0} rejected</span>
              </div>
            </div>
            <div className="ap-action-row">
              {pendingWithCoords.length > 0 && (
                <button onClick={handleApproveAll} disabled={bulkLoading} className="ap-btn-approve-all">
                  <CheckSquare size={14} /> Approve All ({pendingWithCoords.length} with coords)
                </button>
              )}
              <button onClick={fetchData} disabled={loading} className="ap-btn-refresh">
                <RefreshCw size={13} className={loading ? 'ap-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="ap-tabs">
            {['pending', 'approved', 'rejected'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`ap-tab ${activeTab === t ? `ap-tab--active ap-tab--${t}` : ''}`}
              >
                {t} <span className="ap-tab-count">({data?.[t]?.length ?? 0})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="ap-empty">Loading…</div>
          ) : currentSightings.length === 0 ? (
            <div className="ap-empty">No {activeTab} sightings.</div>
          ) : (
            <div className="ap-list">
              {currentSightings.map(s => (
                <SightingCard key={s.id} sighting={s} onModerate={handleModerate} loading={moderating} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── ATTORNEY SECTION ─── */}
      {adminSection === 'attorneys' && (
        <>
          <div className="ap-section-header">
            <div>
              <h1 className="ap-h1">Attorney Applications</h1>
              <div className="ap-subtitle">
                {attorneyData?.total ?? '–'} total ·{' '}
                <span className="ap-color-pending">{attorneyData?.pending?.length ?? 0} pending</span> ·{' '}
                <span className="ap-color-approved">{attorneyData?.approved?.length ?? 0} approved</span> ·{' '}
                <span className="ap-color-rejected">{attorneyData?.rejected?.length ?? 0} rejected</span>
              </div>
            </div>
            <button onClick={fetchAttorneyData} disabled={attorneyLoading} className="ap-btn-refresh">
              <RefreshCw size={13} className={attorneyLoading ? 'ap-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="ap-tabs">
            {['pending', 'approved', 'rejected'].map(t => (
              <button
                key={t}
                onClick={() => setAttorneyTab(t)}
                className={`ap-tab ${attorneyTab === t ? `ap-tab--active ap-tab--${t}` : ''}`}
              >
                {t} <span className="ap-tab-count">({attorneyData?.[t]?.length ?? 0})</span>
              </button>
            ))}
          </div>

          {attorneyLoading ? (
            <div className="ap-empty">Loading…</div>
          ) : currentAttorneys.length === 0 ? (
            <div className="ap-empty">No {attorneyTab} attorney applications.</div>
          ) : (
            <div className="ap-list">
              {currentAttorneys.map(a => (
                <AttorneyCard key={a.id} app={a} onReview={handleAttorneyReview} loading={reviewingAttorney} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── CAMPAIGNS SECTION ─── */}
      {adminSection === 'campaigns' && (
        <>
          <div className="ap-section-header">
            <div>
              <h1 className="ap-h1">Campaigns</h1>
              <div className="ap-subtitle">{campaigns.length} total campaigns</div>
            </div>
            <button onClick={fetchCampaigns} disabled={campaignsLoading} className="ap-btn-refresh">
              <RefreshCw size={13} className={campaignsLoading ? 'ap-spin' : ''} />
              Refresh
            </button>
          </div>

          {campaignsLoading ? (
            <div className="ap-empty">Loading…</div>
          ) : campaigns.length === 0 ? (
            <div className="ap-empty">No campaigns found.</div>
          ) : (
            <div className="ap-section">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Status</th>
                    <th>Wallet</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="ap-campaign-name">{c.name || c.title || c.id}</div>
                        {c.slug && <div className="ap-campaign-slug">/{c.slug}</div>}
                      </td>
                      <td>
                        <select
                          className="ap-status-select"
                          value={c.status || 'unclaimed'}
                          disabled={campaignStatusUpdating === c.id}
                          onChange={e => handleCampaignStatus(c.id, e.target.value)}
                        >
                          {CAMPAIGN_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {(c.walletXMR || c.walletZANO)
                          ? <span className="ap-wallet">{shortWallet(c.walletXMR || c.walletZANO)}</span>
                          : <span className="ap-wallet ap-wallet--empty">—</span>
                        }
                      </td>
                      <td className="ap-cell-muted">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
