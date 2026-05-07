import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ReauthModal from './ReauthModal'

const types = [
  { id: 'billboard', label: '📋 Billboard', desc: 'Place a public awareness sign next to a surveillance camera' },
  { id: 'legal', label: '⚖️ Legal Fund', desc: 'Fund attorney fees for lawsuits or legislative advocacy' },
  { id: 'foia', label: '🗂 FOIA Request', desc: 'Public records campaign to expose surveillance contracts' },
  { id: 'verify', label: '📸 Verification Bounty', desc: 'Fund physical verification of OSM-mapped cameras with XMR bounties' },
  { id: 'other', label: '🛠 Other Action', desc: 'Any other legal, public-facing resistance action' },
]

export default function ProposeModal({ onClose, prefill = {} }) {
  const { isLoggedIn, isReauthed, user } = useAuth()
  const needsEmail = isLoggedIn && user && !user.hasEmail
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ type: prefill.type || '', title: prefill.title || '', location: prefill.location || '', description: prefill.description || '', goal: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [showReauth, setShowReauth] = useState(false)
  const modalRef = useRef(null)
  const headingId = 'propose-modal-heading'

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

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const doSubmit = async () => {
    setSending(true)
    setSubmitError(false)
    try {
      const res = await fetch('https://ai.citeback.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: form.type, title: form.title, location: form.location, description: form.description, goal: form.goal }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setSubmitError(true)
      }
    } catch (_) {
      setSubmitError(true)
    }
    setSending(false)
  }

  const handleSubmit = () => {
    if (!form.title || !form.location || !form.description || !form.goal) return
    // Logged-in users must re-authenticate before submitting (step-up auth)
    if (isLoggedIn && !isReauthed()) {
      setShowReauth(true)
      return
    }
    doSubmit()
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '11px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
  }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }

  return (
    <>
    {showReauth && (
      <ReauthModal
        actionLabel="submit campaign proposal"
        onSuccess={() => { setShowReauth(false); doSubmit() }}
        onCancel={() => setShowReauth(false)}
      />
    )}
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(8px, 3vw, 24px)',
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
          borderRadius: 18, padding: 'clamp(20px, 5vw, 32px)', maxWidth: 560, width: '100%',
          maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 id={headingId} style={{ fontWeight: 800, fontSize: 20 }}>Propose a Campaign</h2>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>Step {step} of 2</div>
          </div>
          <button onClick={onClose} aria-label="Close proposal form" style={{ background: 'none', border: 'none', color: 'var(--muted)', padding: 8, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 100, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ width: `${step * 50}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease', borderRadius: 100 }} />
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Proposal Submitted</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 20px' }}>
              Your proposal is saved. Operator onboarding and campaign review open at platform launch — submitted proposals are first in line.
            </p>
            <div style={{
              textAlign: 'left', maxWidth: 380, margin: '0 auto 20px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text)' }}>Pending launch:</strong> Operator identity verification, campaign approval, and wallet activation are part of the platform’s launch sequence. Proposals submitted now are queued and will be reviewed when that system goes live.
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'var(--accent)', border: 'none', color: '#fff',
              padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15,
            }}>Done</button>
          </div>
        ) : step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>What type of action?</div>
            {types.map(t => (
              <button key={t.id} onClick={() => set('type', t.id)} style={{
                background: form.type === t.id ? 'rgba(230,57,70,0.1)' : 'var(--bg3)',
                border: `1px solid ${form.type === t.id ? 'rgba(230,57,70,0.5)' : 'var(--border)'}`,
                borderRadius: 10, padding: '14px 18px', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.desc}</div>
              </button>
            ))}

            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8,
              background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <AlertCircle size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                All campaigns must be legal, public-facing actions. No illegal activity will be funded.
                Community review ensures compliance before any wallet is generated.
              </p>
            </div>

            <button
              onClick={() => form.type && setStep(2)}
              disabled={!form.type}
              style={{
                marginTop: 8, background: form.type ? 'var(--accent)' : 'var(--bg3)',
                border: 'none', color: form.type ? '#fff' : 'var(--muted)',
                padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: form.type ? 'pointer' : 'not-allowed',
              }}>
              Continue →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label htmlFor="prop-title" style={labelStyle}>Campaign Title</label>
              <input id="prop-title" style={inputStyle} placeholder="e.g. Billboard - US-54 & Main St, Tucumcari NM"
                value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="prop-location" style={labelStyle}>Location</label>
              <input id="prop-location" style={inputStyle} placeholder="City, State"
                value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label htmlFor="prop-description" style={labelStyle}>Description</label>
              <textarea id="prop-description" style={{ ...inputStyle, height: 100, resize: 'vertical' }}
                placeholder="Describe the action, why it matters, and what the funds will specifically cover..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div>
              <label htmlFor="prop-goal" style={labelStyle}>Funding Goal (USD)</label>
              <input id="prop-goal" style={inputStyle} type="number" placeholder="e.g. 750"
                value={form.goal} onChange={e => set('goal', e.target.value)} />
            </div>
            <div style={{
              background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
              borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7,
            }}>
              To follow up on your submission, email <strong style={{ color: 'var(--text)' }}>citeback@proton.me</strong> from a privacy-preserving email. For maximum anonymity, use Tor Browser.
            </div>

            {/* Email gate — logged-in operators must have a recovery email */}
            {needsEmail && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.35)',
                borderRadius: 10, padding: '12px 14px',
              }}>
                <Mail size={15} style={{ color: '#f4a261', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>
                  <strong style={{ color: '#f4a261', display: 'block', marginBottom: 3 }}>Recovery email required to propose campaigns</strong>
                  Operators must have a recovery email on file — not for identity, but so you can't lose access to an active campaign.
                  A disposable address is fine.{' '}
                  <a
                    href="/reputation"
                    onClick={onClose}
                    style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                  >Add one in your account settings →</a>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '12px', borderRadius: 10, fontWeight: 600,
              }}>← Back</button>
              <button
                onClick={handleSubmit}
                disabled={!form.title || !form.location || !form.description || !form.goal || sending || needsEmail}
                style={{
                  flex: 2,
                  background: (form.title && form.location && form.description && form.goal && !sending && !needsEmail) ? 'var(--accent)' : 'var(--bg3)',
                  border: 'none',
                  color: (form.title && form.location && form.description && form.goal && !sending && !needsEmail) ? '#fff' : 'var(--muted)',
                  padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 15,
                  cursor: (form.title && form.location && form.description && form.goal && !sending && !needsEmail) ? 'pointer' : 'not-allowed',
                }}>
                {sending ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
            {submitError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
                background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent)' }}>
                <AlertCircle size={14} />
                Submission failed - please try again. If the problem persists, email citeback@proton.me.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>  
  )
}
