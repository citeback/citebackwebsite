import { useState, useCallback, useRef } from 'react'
import { CheckCircle, AlertCircle, Eye, MapPin, Loader, Shield, Star, Camera, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AccountModal from './AccountModal'

const AI_URL = 'https://ai.citeback.com'

async function geocodeAddress(address, city, state) {
  const q = encodeURIComponent([address, city, state, 'USA'].filter(Boolean).join(', '))
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'User-Agent': 'citeback.com surveillance map' } }
    )
    const data = await res.json()
    if (data[0]) return { lat: data[0].lat, lng: data[0].lon, display: data[0].display_name }
  } catch {}
  return null
}

const CAMERA_TYPES = [
  { id: 'alpr', label: 'ALPR / License Plate Reader', desc: 'Flock Safety, Motorola, Genetec, or similar' },
  { id: 'shotspotter', label: 'ShotSpotter / Gunshot Detection', desc: 'Acoustic sensor on poles or rooftops' },
  { id: 'facial', label: 'Facial Recognition Camera', desc: 'Fixed camera with visible processing hardware' },
  { id: 'cctv', label: 'CCTV / General Surveillance', desc: 'City-owned or police-affiliated camera' },
  { id: 'drone', label: 'Police Drone / UAV', desc: 'Aerial surveillance deployment observed' },
  { id: 'unknown', label: 'Unknown / Unsure', desc: "Looks like surveillance infrastructure but I'm not certain" },
]

export default function SightingForm({ setTab }) {
  const { user, isLoggedIn, token } = useAuth()
  const [repEarned, setRepEarned] = useState(null)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [form, setForm] = useState({ cameraType: '', address: '', city: '', state: '', notes: '', honeypot: '' })
  const [geo, setGeo] = useState(null)
  const [geoStatus, setGeoStatus] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null) // string | null
  const fileInputRef = useRef(null)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (['address', 'city', 'state'].includes(k)) { setGeo(null); setGeoStatus(null) }
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
    setError(null)
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const resolveLocation = useCallback(async () => {
    if (!form.address || !form.city || !form.state) return
    setGeoStatus('resolving')
    setGeo(null)
    const result = await geocodeAddress(form.address, form.city, form.state)
    if (result) { setGeo(result); setGeoStatus('resolved') }
    else setGeoStatus('failed')
  }, [form.address, form.city, form.state])

  const canSubmit = form.cameraType && form.address && form.city && form.state && photoFile && !sending

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.honeypot) return
    if (!canSubmit) return
    setSending(true)
    setError(null)

    let coords = geo
    if (!coords) {
      coords = await geocodeAddress(form.address, form.city, form.state)
      if (coords) { setGeo(coords); setGeoStatus('resolved') }
    }

    try {
      const fd = new FormData()
      fd.append('cameraType', form.cameraType)
      fd.append('address', form.address)
      fd.append('city', form.city)
      fd.append('state', form.state)
      fd.append('notes', form.notes)
      fd.append('lat', coords?.lat ?? '')
      fd.append('lng', coords?.lng ?? '')
      fd.append('photo', photoFile)

      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      // Note: do NOT set Content-Type — browser sets it with multipart boundary automatically

      const res = await fetch(`${AI_URL}/sighting`, { method: 'POST', headers, body: fd })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        if (data.reputationAwarded) {
          setRepEarned({
            points: data.reputationAwarded,
            newReputation: data.newReputation,
            newTier: data.newTier,
            tierName: data.tierName,
            newCamera: data.newCamera,
          })
        }
        setSubmitted(true)
      } else if (res.status === 422) {
        // C2PA not detected
        setError('c2pa')
      } else {
        setError('generic')
      }
    } catch {
      setError('generic')
    }
    setSending(false)
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '11px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.04em',
  }

  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 5vw, 24px)', maxWidth: 600, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
          borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16,
        }}>
          <Eye size={11} /> Community Intelligence
        </div>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>
          Report a Surveillance Sighting
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 520 }}>
          Spotted a license plate reader, ShotSpotter, or surveillance camera?
          Submit a C2PA-verified photo. It goes live on the map instantly — no review queue.
        </p>

        {/* Auth / C2PA info banner */}
        {isLoggedIn ? (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16,
            background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6,
          }}>
            <Shield size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: 'var(--text)' }}>Signed in as {user?.username}</strong>
              {' '}· C2PA photo = <strong style={{ color: '#10b981' }}>+1 pt</strong> (existing camera) or{' '}
              <strong style={{ color: '#10b981' }}>+2 pts</strong> (new discovery).<br />
              Shoot with{' '}
              <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a>{' '}
              (iOS/Android, free) · Samsung Galaxy S24+ · Google Pixel 10
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16,
            background: 'rgba(46,204,113,0.05)', border: '1px solid rgba(46,204,113,0.15)',
            borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6,
          }}>
            <CheckCircle size={13} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
            <span>
              <strong style={{ color: 'var(--text)' }}>Anonymous submissions accepted.</strong>{' '}
              <button onClick={() => setTab('reputation')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: 0 }}>Create an account</button>{' '}
              to earn reputation points for verified sightings.
            </span>
          </div>
        )}
      </div>

      {/* ── Success screen ── */}
      {submitted ? (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>

          {/* Tier unlock */}
          {repEarned?.newTier > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(230,57,70,0.12), rgba(245,158,11,0.12))',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 12, padding: '16px', marginBottom: 20,
            }}>
              <Star size={28} style={{ color: '#f59e0b', marginBottom: 8 }} />
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em', marginBottom: 4 }}>
                🎉 Tier {repEarned.newTier} Unlocked!
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                You're now a <strong style={{ color: 'var(--text)' }}>{repEarned.tierName}</strong>.
                {repEarned.newTier === 1 && ' Campaign access up to $500 is now available.'}
              </div>
            </div>
          )}

          <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
            {repEarned?.newCamera ? '📍 New Camera Documented' : '✅ Sighting Verified'}
          </h2>

          {/* Rep earned */}
          {repEarned && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, justifyContent: 'center', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '10px 14px' }}>
              <Shield size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                +{repEarned.points} pt{repEarned.points !== 1 ? 's' : ''}{' '}
                {repEarned.newCamera ? '— new camera, not in any existing database' : '— confirmed existing camera location'}{' '}
                · {repEarned.newReputation} total · {repEarned.tierName}
              </span>
            </div>
          )}

          {/* Anonymous claim prompt */}
          {!isLoggedIn && (
            <div style={{ background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🏅 Earn reputation for future sightings</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px', lineHeight: 1.6 }}>
                Create an account and shoot with{' '}
                <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a>{' '}
                (iOS/Android, free), Galaxy S24+, or Pixel 10. 10 points unlocks Tier 1 operator access.
              </p>
              <button onClick={() => setShowClaimModal(true)} style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '9px 16px', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Shield size={13} /> Create Account →
              </button>
            </div>
          )}

          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 24px' }}>
            C2PA signature verified. This camera is now live on the map.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setForm({ cameraType: '', address: '', city: '', state: '', notes: '', honeypot: '' }); setSubmitted(false); setRepEarned(null); clearPhoto() }}
              style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Report Another
            </button>
            <button onClick={() => setTab('map')} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              View the Map
            </button>
          </div>
          {showClaimModal && <AccountModal onClose={() => setShowClaimModal(false)} />}
        </div>

      ) : (
        /* ── Form ── */
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Spam trap */}
          <input type="text" value={form.honeypot} onChange={e => set('honeypot', e.target.value)}
            style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
            tabIndex={-1} aria-hidden="true" autoComplete="off" />

          {/* Camera type */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 10 }}>What did you spot?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CAMERA_TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => set('cameraType', t.id)} style={{
                  background: form.cameraType === t.id ? 'rgba(230,57,70,0.08)' : 'var(--bg3)',
                  border: `1px solid ${form.cameraType === t.id ? 'rgba(230,57,70,0.4)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '12px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="sighting-address" style={labelStyle}>Street Address or Intersection</label>
            <input id="sighting-address" style={inputStyle} placeholder="e.g. 200 Central Ave NW"
              value={form.address} onChange={e => set('address', e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label htmlFor="sighting-city" style={labelStyle}>City</label>
              <input id="sighting-city" style={inputStyle} placeholder="Albuquerque"
                value={form.city} onChange={e => set('city', e.target.value)} required />
            </div>
            <div>
              <label htmlFor="sighting-state" style={labelStyle}>State</label>
              <input id="sighting-state" style={inputStyle} placeholder="NM" maxLength={2}
                value={form.state} onChange={e => set('state', e.target.value.toUpperCase())}
                onBlur={() => form.address && form.city && form.state.length === 2 && resolveLocation()} required />
            </div>
          </div>

          {geoStatus === 'resolving' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Resolving location…
            </div>
          )}
          {geoStatus === 'resolved' && geo && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              <MapPin size={12} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
              <span><strong style={{ color: 'var(--text)' }}>Location confirmed</strong> · {geo.display.split(',').slice(0, 3).join(',')}</span>
            </div>
          )}
          {geoStatus === 'failed' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              <AlertCircle size={12} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              <span>Couldn't auto-locate — double-check the address. You can still submit; coordinates will be stored with what we have.</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="sighting-notes" style={labelStyle}>
              Additional Notes <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            </label>
            <textarea id="sighting-notes" style={{ ...inputStyle, height: 90, resize: 'vertical' }}
              placeholder="Vendor branding visible? Mounted on a pole or building? Facing which direction?"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {/* ── Photo upload — required ── */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 10 }}>
              C2PA-Verified Photo <span style={{ color: 'var(--accent)', fontWeight: 700 }}>required</span>
            </label>

            {!photoFile ? (
              <>
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                  width: '100%', background: 'var(--bg3)', border: '2px dashed var(--border)',
                  borderRadius: 10, padding: '24px', cursor: 'pointer', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Camera size={24} style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Tap to attach photo</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>JPEG, PNG, WEBP, HEIC · max 12MB</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic"
                  style={{ display: 'none' }} onChange={handlePhoto} />
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.12)', borderRadius: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text)' }}>Shoot with a C2PA-capable app or device:</strong><br />
                  📱{' '}
                  <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a>{' '}
                  — iOS & Android, free, built by Guardian Project for human rights evidence<br />
                  📲 Samsung Galaxy S24+ or Google Pixel 10 — signs photos automatically
                </div>
              </>
            ) : (
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {/* Preview */}
                <div style={{ position: 'relative' }}>
                  <img src={photoPreview} alt="Sighting preview" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={clearPhoto} style={{
                    position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                    border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <X size={14} />
                  </button>
                </div>
                <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photoFile.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{(photoFile.size / 1024 / 1024).toFixed(1)} MB · C2PA check runs on upload</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error states */}
          {error === 'c2pa' && (
            <div style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                <AlertCircle size={14} /> C2PA signature not detected
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                This photo doesn't contain a C2PA cryptographic signature. Only verified photos are accepted.<br />
                Shoot with{' '}
                <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a>{' '}
                (iOS/Android), Samsung Galaxy S24+, or Google Pixel 10, then try again.
              </p>
            </div>
          )}
          {error === 'generic' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent)' }}>
              <AlertCircle size={14} /> Submission failed — please try again.
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={!canSubmit} style={{
            background: canSubmit ? 'var(--accent)' : 'var(--bg3)',
            border: 'none',
            color: canSubmit ? '#fff' : 'var(--muted)',
            padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15,
            cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {sending
              ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying &amp; uploading…</>
              : !photoFile
                ? 'Attach a C2PA photo to submit'
                : 'Submit Verified Sighting'
            }
          </button>

          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
            Only publicly visible surveillance infrastructure. Do not submit information about private residences or individuals.
          </p>
        </form>
      )}
    </section>
  )
}
