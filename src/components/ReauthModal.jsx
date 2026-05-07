import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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

  return createPortal(
    <div
      onClick={onCancel}
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(8px, 3vw, 24px)',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reauth-heading"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 18, padding: 'clamp(20px, 5vw, 32px)',
          maxWidth: 400, width: '100%',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ShieldCheck size={18} color="var(--accent)" />
            </div>
            <div>
              <h2 id="reauth-heading" style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>
                Confirm Your Password
              </h2>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                Required to {actionLabel}
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cancel"
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              cursor: 'pointer', padding: 8, minWidth: 36, minHeight: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Explanation */}
        <div style={{
          background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 20,
          fontSize: 12, color: 'var(--muted)', lineHeight: 1.65,
        }}>
          <strong style={{ color: 'var(--text)' }}>Logged in as @{user?.username}.</strong>{' '}
          Re-enter your password to confirm this action. This protects your account if someone has access to your session.
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Password field */}
          <div style={{ position: 'relative' }}>
            <label htmlFor="reauth-password" style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'var(--muted)', marginBottom: 6,
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--muted)', pointerEvents: 'none',
              }} />
              <input
                id="reauth-password"
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="Your account password"
                autoComplete="current-password"
                style={{
                  width: '100%', background: 'var(--bg3)',
                  border: `1px solid ${error ? 'rgba(230,57,70,0.6)' : 'var(--border)'}`,
                  color: 'var(--text)', padding: '11px 40px 11px 36px',
                  borderRadius: 8, fontSize: 14, outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--muted)',
                  cursor: 'pointer', padding: 4,
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
              borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--accent)',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '11px', borderRadius: 10,
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password || loading}
              style={{
                flex: 2,
                background: (password && !loading) ? 'var(--accent)' : 'var(--bg3)',
                border: 'none',
                color: (password && !loading) ? '#fff' : 'var(--muted)',
                padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                cursor: (password && !loading) ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
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
