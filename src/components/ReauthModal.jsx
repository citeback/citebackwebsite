import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './ReauthModal.css'

/**
 * ReauthModal — step-up authentication for high-stakes actions.
 *
 * Usage:
 *   <ReauthModal
 *     onSuccess={() => proceed()}
 *     onCancel={() => setShowReauth(false)}
 *     actionLabel="Submit Campaign Proposal"
 *   />
 *
 * Props:
 *   onSuccess   — called when password is verified (reauthUntil is set in AuthContext)
 *   onCancel    — called when user dismisses
 *   actionLabel — describes the action being gated (shown in UI)
 */
export default function ReauthModal({ onSuccess, onCancel, actionLabel = 'continue' }) {
  const { reauth, user } = useAuth()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Trap focus inside modal
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return
    const handleKey = (e) => {
      if (e.key === 'Escape') { onCancel(); return }
      if (e.key === 'Tab') {
        const focusable = modal.querySelectorAll(
          'button, input, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus() }
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || loading) return
    setLoading(true)
    setError(null)
    try {
      await reauth(password)
      onSuccess()
    } catch (err) {
      setError(err.message || 'Incorrect password')
      setPassword('')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const isActive = password && !loading

  return createPortal(
    <div onClick={onCancel} role="presentation" className="rm-overlay">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reauth-heading"
        onClick={e => e.stopPropagation()}
        className="rm-container"
      >
        {/* Header */}
        <div className="rm-header">
          <div className="rm-header-left">
            <div className="rm-icon">
              <ShieldCheck size={18} color="var(--accent)" />
            </div>
            <div>
              <h2 id="reauth-heading" className="rm-title">
                Confirm Your Password
              </h2>
              <div className="rm-subtitle">
                Required to {actionLabel}
              </div>
            </div>
          </div>
          <button onClick={onCancel} aria-label="Cancel" className="rm-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Explanation */}
        <div className="rm-info-box">
          <strong>Logged in as @{user?.username}.</strong>{' '}
          Re-enter your password to confirm this action. This protects your account if someone has access to your session.
        </div>

        <form onSubmit={handleSubmit} className="rm-form">
          {/* Password field */}
          <div className="rm-field">
            <label htmlFor="reauth-password" className="rm-label">
              Password
            </label>
            <div className="rm-input-wrap">
              <Lock size={14} className="rm-lock-icon" />
              <input
                id="reauth-password"
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="Your account password"
                autoComplete="current-password"
                className={`rm-input${error ? ' rm-input--error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="rm-toggle-pw"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rm-error">
              <AlertCircle size={14} className="rm-error-icon" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="rm-actions">
            <button type="button" onClick={onCancel} className="rm-cancel-btn">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isActive}
              className={`rm-submit-btn${isActive ? ' rm-submit-btn--active' : ' rm-submit-btn--disabled'}`}
            >
              {loading ? 'Verifying…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
