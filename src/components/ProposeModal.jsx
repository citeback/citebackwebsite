import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ReauthModal from './ReauthModal'
import { API_BASE as AI_URL } from '../config.js'
import './ProposeModal.css'

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
      const res = await fetch(`${AI_URL}/submit`, {
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

  const isSubmitActive = form.title && form.location && form.description && form.goal && !sending && !needsEmail

  return (
    <>
    {showReauth && (
      <ReauthModal
        actionLabel="submit campaign proposal"
        onSuccess={() => { setShowReauth(false); doSubmit() }}
        onCancel={() => setShowReauth(false)}
      />
    )}
    <div onClick={onClose} role="presentation" className="pm-overlay">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={e => e.stopPropagation()}
        className="pm-container"
      >
        {/* Header */}
        <div className="pm-header">
          <div>
            <h2 id={headingId} className="pm-title">Propose a Campaign</h2>
            <div className="pm-step-label">Step {step} of 2</div>
          </div>
          <button onClick={onClose} aria-label="Close proposal form" className="pm-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="pm-progress-track">
          <div className="pm-progress-fill" style={{ width: `${step * 50}%` }} />
        </div>

        {submitted ? (
          <div className="pm-success">
            <CheckCircle size={48} color="var(--green)" className="pm-success-icon" />
            <h3 className="pm-success-title">Proposal Submitted</h3>
            <p className="pm-success-desc">
              Your proposal is saved. Operator onboarding and campaign review open at platform launch — submitted proposals are first in line.
            </p>
            <div className="pm-success-note">
              <div className="pm-success-note-text">
                <strong className="pm-success-strong">Pending launch:</strong> Operator identity verification, campaign approval, and wallet activation are part of the platform's launch sequence. Proposals submitted now are queued and will be reviewed when that system goes live.
              </div>
            </div>
            <button onClick={onClose} className="pm-done-btn">Done</button>
          </div>
        ) : step === 1 ? (
          <div className="pm-step1">
            <div className="pm-type-label">What type of action?</div>
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => set('type', t.id)}
                className={`pm-type-btn${form.type === t.id ? ' pm-type-btn--active' : ''}`}
              >
                <div className="pm-type-btn-title">{t.label}</div>
                <div className="pm-type-btn-desc">{t.desc}</div>
              </button>
            ))}

            <div className="pm-legal-note">
              <AlertCircle size={13} className="pm-legal-icon" />
              <p className="pm-legal-note-text">
                All campaigns must be legal, public-facing actions. No illegal activity will be funded.
                Community review ensures compliance before any wallet is generated.
              </p>
            </div>

            <button
              onClick={() => form.type && setStep(2)}
              disabled={!form.type}
              className={`pm-continue-btn${form.type ? ' pm-continue-btn--active' : ' pm-continue-btn--disabled'}`}
            >
              Continue →
            </button>
          </div>
        ) : (
          <div className="pm-step2">
            <div>
              <label htmlFor="prop-title" className="pm-label">Campaign Title</label>
              <input id="prop-title" className="pm-input" placeholder="e.g. Billboard - US-54 & Main St, Tucumcari NM"
                value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="prop-location" className="pm-label">Location</label>
              <input id="prop-location" className="pm-input" placeholder="City, State"
                value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label htmlFor="prop-description" className="pm-label">Description</label>
              <textarea id="prop-description" className="pm-textarea"
                placeholder="Describe the action, why it matters, and what the funds will specifically cover..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div>
              <label htmlFor="prop-goal" className="pm-label">Funding Goal (USD)</label>
              <input id="prop-goal" className="pm-input" type="number" placeholder="e.g. 750"
                value={form.goal} onChange={e => set('goal', e.target.value)} />
            </div>
            <div className="pm-contact-note">
              To follow up on your submission, email <strong className="pm-success-strong">citeback@proton.me</strong> from a privacy-preserving email. For maximum anonymity, use Tor Browser.
            </div>

            {/* Email gate — logged-in operators must have a recovery email */}
            {needsEmail && (
              <div className="pm-email-gate">
                <Mail size={15} className="pm-email-icon" />
                <div className="pm-email-gate-body">
                  <strong className="pm-email-gate-title">Recovery email required to propose campaigns</strong>
                  Operators must have a recovery email on file — not for identity, but so you can't lose access to an active campaign.
                  A disposable address is fine.{' '}
                  <a href="/reputation" onClick={onClose} className="pm-email-gate-link">
                    Add one in your account settings →
                  </a>
                </div>
              </div>
            )}

            <div className="pm-actions">
              <button onClick={() => setStep(1)} className="pm-back-btn">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={!isSubmitActive}
                className={`pm-submit-btn${isSubmitActive ? ' pm-submit-btn--active' : ' pm-submit-btn--disabled'}`}
              >
                {sending ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
            {submitError && (
              <div className="pm-error">
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
