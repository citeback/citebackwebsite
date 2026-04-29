import { Scale, Megaphone, FileSearch, Shield, Plus, CheckCircle, X } from 'lucide-react'
import { useState } from 'react'

const typeConfig = {
  attorney: { icon: <Scale size={20} />, color: '#5dade2', colorRaw: '93,173,226', label: 'Attorney' },
  billboard: { icon: <Megaphone size={20} />, color: '#ff6b6b', colorRaw: '255,107,107', label: 'Billboard Operator' },
  foia: { icon: <FileSearch size={20} />, color: '#bb8fce', colorRaw: '187,143,206', label: 'FOIA Specialist' },
  verifier: { icon: <Shield size={20} />, color: '#f39c12', colorRaw: '243,156,18', label: 'Camera Verifier' },
}

const roles = [
  { id: 'attorney', label: '⚖️ Attorney', desc: 'Civil liberties, Fourth Amendment, FOIA litigation' },
  { id: 'billboard', label: '📋 Billboard Operator', desc: 'Billboard rental, vendor relationships, placement' },
  { id: 'foia', label: '🗂 FOIA Specialist', desc: 'Public records requests, tracking, escalation' },
  { id: 'verifier', label: '📸 Camera Verifier', desc: 'Physical verification of ALPR cameras with GPS-tagged photos' },
  { id: 'other', label: '🛠 Other', desc: 'Any other skill useful to funded campaigns' },
]

function ApplyModal({ onClose }) {
  const [form, setForm] = useState({ role: '', location: '', background: '', contact: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inputStyle = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '11px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }

  const handleSubmit = async () => {
    if (!form.role || !form.location || !form.background) return
    setSending(true)
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'registry-application', ...form }).toString(),
      })
    } catch (_) {}
    setSending(false)
    setSubmitted(true)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 18, padding: 32, maxWidth: 520, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20 }}>Apply to the Registry</h2>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>No identity required — contact optional</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Application Received</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 360, margin: '0 auto 24px' }}>
              Community review takes 48–72 hours. Verified operators are added to the registry
              and become eligible to receive funded campaigns.
            </p>
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

            <div>
              <label style={labelStyle}>Location / Region</label>
              <input style={inputStyle} placeholder="e.g. New Mexico, Southwest US, Remote"
                value={form.location} onChange={e => set('location', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Background & Experience</label>
              <textarea style={{ ...inputStyle, height: 110, resize: 'vertical' }}
                placeholder="Describe your relevant experience. No identifying info required — focus on what you've done and what you can execute."
                value={form.background} onChange={e => set('background', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Contact (optional — Monero address, Signal handle, or ProtonMail)</label>
              <input style={inputStyle} placeholder="How to reach you if approved. Never shared publicly."
                value={form.contact} onChange={e => set('contact', e.target.value)} />
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

            <button
              onClick={handleSubmit}
              disabled={!form.role || !form.location || !form.background || sending}
              style={{
                background: (form.role && form.location && form.background && !sending) ? 'var(--accent)' : 'var(--bg3)',
                border: 'none',
                color: (form.role && form.location && form.background && !sending) ? '#fff' : 'var(--muted)',
                padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: (form.role && form.location && form.background && !sending) ? 'pointer' : 'not-allowed',
              }}>
              {sending ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HumanRegistry() {
  const [showApply, setShowApply] = useState(false)

  return (
    <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {showApply && <ApplyModal onClose={() => setShowApply(false)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Human Registry</h2>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14, maxWidth: 480, lineHeight: 1.6 }}>
            Vetted operators who execute funded campaigns — attorneys, billboard operators, FOIA specialists.
            Verified by peer vouching, not identity documents. No names. No dox. Just track records.
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

      {/* How verification works */}
      <div style={{
        background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
        borderRadius: 12, padding: 18, marginBottom: 28,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <Shield size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text)' }}>No identity verification required.</strong>{' '}
          Verified badge = 3 or more community vouches from people who've worked with them.
          Funds are released only after campaign completion and receipt submission.
          Operators work under their own LLC or as independent contractors — Citeback never employs anyone.
        </p>
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
              <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                No verified operators yet. Be the first.
              </div>
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
