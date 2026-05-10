import { Scale, Megaphone, FileSearch, Shield, Plus, CheckCircle, X, Cpu, AlertCircle, Search, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_BASE } from '../config.js'

const typeConfig = {
  attorney: { icon: <Scale size={20} />, color: '#5dade2', colorRaw: '93,173,226', label: 'Legal Researcher' },
  billboard: { icon: <Megaphone size={20} />, color: '#ff6b6b', colorRaw: '255,107,107', label: 'Media Coordinator' },
  foia: { icon: <FileSearch size={20} />, color: '#bb8fce', colorRaw: '187,143,206', label: 'FOIA Specialist' },
  verifier: { icon: <Shield size={20} />, color: '#f39c12', colorRaw: '243,156,18', label: 'Camera Verifier' },
  technical: { icon: <Cpu size={20} />, color: '#2ecc71', colorRaw: '46,204,113', label: 'Technical Contributor' },
}

const roles = [
  { id: 'attorney', label: '⚖️ Attorney / Legal Researcher', desc: 'Licensed attorneys or paralegal researchers — Fourth Amendment analysis, FOIA escalation, legal research' },
  { id: 'billboard', label: '📋 Media Coordinator', desc: 'Verified vendor relationships with billboard and print media operators — identity confirmed privately, vendor access verified before campaigns go live' },
  { id: 'foia', label: '🗂 FOIA Specialist', desc: 'Public records requests, tracking, escalation' },
  { id: 'verifier', label: '📸 Camera Verifier', desc: 'Physical verification of ALPR cameras with GPS-tagged photos' },
  { id: 'technical', label: '🖥 Technical Contributor', desc: 'backend engineering, Zano/XMR RPC integration, frontend dev, FOIA automation — pseudonymous OK' },
  { id: 'other', label: '🛠 Other', desc: 'Any other skill useful to funded campaigns' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

function ApplyModal({ onClose, defaultRole = '' }) {
  const [form, setForm] = useState({ role: defaultRole, location: '', background: '', full_name: '', bar_state: '', bar_number: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [sending, setSending] = useState(false)
  // Bar verification state
  const [barLookup, setBarLookup] = useState(null)  // null | { status, name?, barNumber?, active?, reason? }
  const [barLooking, setBarLooking] = useState(false)
  const modalRef = useRef(null)
  const headingId = 'apply-modal-heading'

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

  const set = (k, v) => {
    if (k === 'bar_state' || k === 'bar_number') setBarLookup(null) // reset on change
    setForm(f => ({ ...f, [k]: v }))
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '11px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }

  const isAttorney = form.role === 'attorney'

  const handleBarLookup = async () => {
    if (!form.bar_state || !form.bar_number) return
    setBarLooking(true)
    setBarLookup(null)
    try {
      const res = await fetch(`${API_BASE}/verify-bar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: form.bar_state, barNumber: form.bar_number }),
      })
      if (res.status === 429) {
        setBarLookup({ status: 'rate_limited', reason: 'Too many lookups — wait a minute and try again' })
      } else {
        const json = await res.json()
        setBarLookup(json)
      }
    } catch {
      setBarLookup({ status: 'error', reason: 'Network error during lookup' })
    }
    setBarLooking(false)
  }

  // Attorney: can submit if bar_state is non-CA (manual review path) OR lookup result is known
  const attorneySubmittable = isAttorney && form.full_name && form.bar_state && form.location && form.background &&
    (form.bar_state !== 'CA' ? true : barLookup !== null)
  const regularSubmittable = !isAttorney && form.role && form.location && form.background
  const canSubmit = (isAttorney ? attorneySubmittable : regularSubmittable) && !sending

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSending(true)
    setSubmitError(false)
    try {
      let endpoint, payload
      if (isAttorney) {
        endpoint = `${API_BASE}/attorney/apply`
        payload = {
          full_name: form.full_name,
          bar_state: form.bar_state,
          bar_number: form.bar_number || undefined,
          location: form.location,
          background: form.background,
          email: form.email || undefined,
        }
      } else {
        endpoint = `${API_BASE}/registry`
        payload = { role: form.role, location: form.location, background: form.background, email: form.email || undefined }
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSubmitted(true)
      } else if (res.status === 401) {
        setSubmitError('login_required')
      } else {
        setSubmitError(true)
      }
    } catch (_) {
      setSubmitError(true)
    }
    setSending(false)
  }

  return (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 18, padding: 32, maxWidth: 520, width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 id={headingId} style={{ fontWeight: 800, fontSize: 20 }}>Apply to the Registry</h2>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>No identity required — contact optional</div>
          </div>
          <button onClick={onClose} aria-label="Close application form" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 8, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Application Received</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 360, margin: '0 auto 16px' }}>
              Your application is saved and queued for review.
            </p>
            <div style={{
              maxWidth: 360, margin: '0 auto 24px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 16px', textAlign: 'left',
            }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text)' }}>Pending launch:</strong> The expert directory and operator verification system open at platform launch. Applications submitted now are first in line when onboarding goes live.
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'var(--accent)', border: 'none', color: '#fff',
              padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>Done</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Your Role</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {roles.map(r => (
                  <button key={r.id} onClick={() => set('role', r.id)} style={{
                    background: form.role === r.id ? 'rgba(230,57,70,0.1)' : 'var(--bg3)',
                    border: `1px solid ${form.role === r.id ? 'rgba(230,57,70,0.5)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Attorney-specific fields */}
            {isAttorney && (
              <>
                <div style={{
                  background: 'rgba(93,173,226,0.06)', border: '1px solid rgba(93,173,226,0.2)',
                  borderRadius: 10, padding: '12px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7,
                }}>
                  <strong style={{ color: 'var(--text)' }}>Attorney verification</strong> — California attorneys can
                  auto-verify via the State Bar lookup. All other states go to manual review. No ID uploaded.
                </div>

                <div>
                  <label htmlFor="apply-fullname" style={labelStyle}>Full Legal Name <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <input id="apply-fullname" style={inputStyle} placeholder="e.g. Jane Smith"
                    value={form.full_name} onChange={e => set('full_name', e.target.value)} maxLength={200} />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: '0 0 120px' }}>
                    <label htmlFor="apply-barstate" style={labelStyle}>Bar State <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <select
                      id="apply-barstate"
                      value={form.bar_state}
                      onChange={e => set('bar_state', e.target.value)}
                      style={{ ...inputStyle, height: 44, cursor: 'pointer' }}
                    >
                      <option value="">State…</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="apply-barnum" style={labelStyle}>Bar Number {form.bar_state === 'CA' && <span style={{ color: 'var(--accent)' }}>*</span>}</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        id="apply-barnum"
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder={form.bar_state === 'CA' ? 'e.g. 123456' : 'optional'}
                        value={form.bar_number}
                        onChange={e => set('bar_number', e.target.value)}
                        maxLength={20}
                      />
                      {form.bar_state === 'CA' && (
                        <button
                          onClick={handleBarLookup}
                          disabled={!form.bar_number || barLooking}
                          title="Verify with CA State Bar"
                          style={{
                            flexShrink: 0, background: 'rgba(93,173,226,0.12)',
                            border: '1px solid rgba(93,173,226,0.3)', borderRadius: 8,
                            color: '#5dade2', padding: '0 14px', cursor: (!form.bar_number || barLooking) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600,
                          }}
                        >
                          {barLooking
                            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Checking…</>
                            : <><Search size={13} /> Verify</>}
                        </button>
                      )}
                    </div>
                    {/* Bar lookup result badge */}
                    {barLookup && (
                      <div style={{
                        marginTop: 8, padding: '8px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.5,
                        ...(barLookup.status === 'found'
                          ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }
                          : barLookup.status === 'not_found'
                            ? { background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946' }
                            : { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }),
                      }}>
                        {barLookup.status === 'found' && (
                          <><CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          <strong>Verified:</strong> {barLookup.name}{barLookup.active !== undefined && ` — ${barLookup.active ? 'Active' : 'Inactive'}`}</>
                        )}
                        {barLookup.status === 'not_found' && (
                          <><X size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          Bar number not found in CA State Bar records. Double-check the number.</>
                        )}
                        {barLookup.status === 'manual_review' && (
                          <>⏳ <strong>Manual review</strong> — will be verified by the team before approval</>
                        )}
                        {(barLookup.status === 'error' || barLookup.status === 'rate_limited') && (
                          <><AlertCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {barLookup.reason || 'Lookup failed — you can still submit for manual review'}</>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="apply-location" style={labelStyle}>Location / Region</label>
              <input id="apply-location" style={inputStyle} placeholder="e.g. New Mexico, Southwest US, Remote"
                value={form.location} onChange={e => set('location', e.target.value)} />
            </div>

            <div>
              <label htmlFor="apply-email" style={labelStyle}>Contact Email <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional — for status updates only, never published)</span></label>
              <input id="apply-email" type="email" style={inputStyle} placeholder="e.g. you@proton.me"
                value={form.email} onChange={e => set('email', e.target.value)} maxLength={200} />
            </div>

            <div>
              <label htmlFor="apply-background" style={labelStyle}>Background & Experience</label>
              <textarea id="apply-background" style={{ ...inputStyle, height: 110, resize: 'vertical' }}
                placeholder="Describe your relevant experience. No identifying info required — focus on what you've done and what you can execute."
                value={form.background} onChange={e => set('background', e.target.value)} />
            </div>

            <div style={{
              background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
              borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7,
            }}>
              To follow up on your submission, email <strong style={{ color: 'var(--text)' }}>citeback@proton.me</strong> from a privacy-preserving email. For maximum anonymity, use Tor Browser.
            </div>

            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
              borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6,
            }}>
              <Shield size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              Verification = 3 community vouches from people who've worked with you. No ID documents.
              All work executed under your own LLC or as an independent contractor.
            </div>

            {isAttorney && form.bar_state === 'CA' && !barLookup && (
              <div style={{
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 8, padding: '9px 13px', fontSize: 12, color: '#f59e0b', lineHeight: 1.6,
              }}>
                ⚠️ Enter your CA bar number above and click <strong>Verify</strong> before submitting.
                You can still submit without verifying — it will go to manual review.
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                background: canSubmit ? 'var(--accent)' : 'var(--bg3)',
                border: 'none',
                color: canSubmit ? '#fff' : 'var(--muted)',
                padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}>
              {sending ? 'Submitting...' : 'Submit Application'}
            </button>
            {submitError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
                background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent)' }}>
                <AlertCircle size={14} />
                {submitError === 'login_required'
                  ? 'You must be logged in to submit an attorney application. Create a free account first.'
                  : 'Submission failed — please try again. If the problem persists, email citeback@proton.me.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HumanRegistry() {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role') // 'attorney' | 'researcher' | null
  const [showApply, setShowApply] = useState(false)

  return (
    <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {showApply && <ApplyModal onClose={() => setShowApply(false)} defaultRole={roleParam === 'attorney' || roleParam === 'researcher' ? 'attorney' : ''} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Expert Directory</h2>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14, maxWidth: 480, lineHeight: 1.6 }}>
            Vetted operators who execute funded campaigns — legal researchers, media coordinators, FOIA specialists,
            and technical contributors. Real-world executors verify identity and vendor access privately with the platform — never published.
            Technical contributors register pseudonymously by XMR or ZANO address only. No public identity required for anyone.
          </p>
        </div>
        <button onClick={() => setShowApply(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--accent)', border: 'none', color: '#fff',
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>
          <Plus size={16} /> Apply to Registry
        </button>
      </div>

      {/* Context banners based on referral path */}
      {roleParam === 'attorney' && (
        <div style={{ background: 'rgba(93,173,226,0.07)', border: '1px solid rgba(93,173,226,0.3)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#5dade2', marginBottom: 8 }}>⚖️ Licensed Attorneys</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 12px' }}>
            Citeback connects funded campaigns with licensed legal counsel. Attorney verification is live — California attorneys auto-verify via State Bar lookup; all other states go to manual review. No ID uploaded.
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 14px' }}>
            <strong style={{ color: 'var(--text)' }}>How attorneys could help:</strong> Review campaign proposals for legal viability, assess jurisdiction-specific risk, draft demand letters, advise on FOIA strategy, or take cases directly from funded operators.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 14px', fontStyle: 'italic' }}>
            Apply below to join the registry. Verified attorneys receive a badge visible to campaign operators looking for legal help.
          </p>
          <button onClick={() => setShowApply(true)} style={{ background: '#5dade2', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Apply for Attorney Verification
          </button>
        </div>
      )}
      {roleParam === 'researcher' && (
        <div style={{ background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)', marginBottom: 8 }}>⚖️ Legal Researchers</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 14px' }}>
            Legal researchers help campaigns move from funded to filed — reviewing proposed actions for viability, drafting FOIA requests and demand letters, advising on Fourth Amendment strategy. No bar license required. Verification is by peer vouching from people who have worked with you.
          </p>
          <button onClick={() => setShowApply(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Apply as Legal Researcher
          </button>
        </div>
      )}

      {/* How verification works */}
      <div style={{
        background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
        borderRadius: 12, padding: 18, marginBottom: 28,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <Shield size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text)' }}>Registry listing requires peer vouching only — no public identity.</strong>{' '}
          Verified badge = 3 or more community vouches from people who’ve worked with them. No ID documents required to list.
          Funds are released only after campaign completion and receipt submission.
          Operators work under their own LLC or as independent contractors — Citeback never employs anyone.
        </p>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 4px', fontStyle: 'italic' }}>Note: operators who run campaigns undergo private OFAC/sanctions screening with real-name identity data held by the DAO legal entity (never published). KYC requirements scale with campaign tier per the governance spec.</p>
          <p style={{ margin: 0, fontStyle: 'italic' }}>Technical Contributors are exempt from real-name KYC — registration by XMR or ZANO address only. Privacy is respected for builder-track contributors.</p>
        </div>
      </div>

      {/* Role slots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <div key={key} style={{
            background: 'var(--bg2)', border: '1px dashed var(--border)',
            borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', gap: 14,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: `rgba(${cfg.colorRaw},0.08)`,
              border: `1px solid rgba(${cfg.colorRaw},0.2)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: cfg.color,
            }}>{cfg.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{cfg.label}</div>
              {key === 'technical' ? (
                <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                  backend engineers, Zano/XMR RPC integrators, frontend devs, FOIA automation.
                  <span style={{ display: 'block', marginTop: 6, color: `rgba(${cfg.colorRaw},0.9)`, fontWeight: 600 }}>
                    🔒 Pseudonymous — XMR or ZANO address as identity. No real name required.
                  </span>
                </div>
              ) : (
                <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                  No verified operators yet. Be the first.
                </div>
              )}
            </div>
            <button onClick={() => setShowApply(true)} style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '9px 18px', borderRadius: 8,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', width: '100%',
            }}>Apply as {cfg.label}</button>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: 13,
        border: '1px dashed var(--border)', borderRadius: 12, lineHeight: 1.7,
      }}>
        Registry opens with the first verified applicants.{' '}
        <button onClick={() => setShowApply(true)} style={{
          background: 'none', border: 'none', color: 'var(--accent)',
          fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0,
        }}>Apply now →</button>
      </div>
    </section>
  )
}
