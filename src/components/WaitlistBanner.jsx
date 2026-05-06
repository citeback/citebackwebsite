import { useState } from 'react'

export default function WaitlistBanner() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(false)
    try {
      const formData = new FormData()
      formData.append('form-name', 'waitlist')
      formData.append('email', email)
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    }
  }

  return (
    <section style={{
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '40px 24px',
      background: 'var(--bg2)',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12,
        }}>
          Pre-Launch · Targeting Fall 2026 · 6 of 10 Prerequisites Remaining
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Get notified when campaigns go live.
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24, maxWidth: 460, margin: '0 auto 24px' }}>
          No wallets activate until all 10 public prerequisites are met. Leave your email and we'll notify you the moment Citeback launches — no spam, one email.
        </p>

        {submitted ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e',
            fontSize: 14, fontWeight: 600,
          }}>
            ✓ You're on the list. We'll reach out at launch.
          </div>
        ) : (
          <form
            name="waitlist"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <input name="form-name" value="waitlist" type="hidden" />
            <input name="bot-field" type="hidden" />
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                fontSize: 14,
                fontFamily: 'var(--font)',
                outline: 'none',
                minWidth: 240,
                flex: 1,
                maxWidth: 320,
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--fg)', color: 'var(--bg)',
                border: 'none', padding: '12px 24px',
                fontSize: 13, fontWeight: 600,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'var(--font)',
                whiteSpace: 'nowrap',
              }}
            >
              Notify Me
            </button>
          </form>
        )}
        {error && (
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--red)' }}>
            Something went wrong. Email citeback@proton.me to join manually.
          </p>
        )}
        <p style={{ marginTop: 14, fontSize: 11, color: 'var(--muted)', opacity: 0.65 }}>
          One email only. No marketing. Unsubscribe by replying "remove".
        </p>
      </div>
    </section>
  )
}
