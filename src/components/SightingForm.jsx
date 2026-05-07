import { useState, useRef } from 'react'
import { CheckCircle, AlertCircle, Eye, Loader, Shield, Star, Camera, X, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AccountModal from './AccountModal'
import * as Exifr from 'exifr'

const AI_URL = 'https://ai.citeback.com'

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
  const [cameraType, setCameraType] = useState('')
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoGPS, setPhotoGPS] = useState(null)   // { lat, lng }
  const [gpsStatus, setGpsStatus] = useState(null)  // null | 'reading' | 'found' | 'none'
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)          // null | 'c2pa' | 'no_gps' | 'generic'
  const fileInputRef = useRef(null)

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoGPS(null)
    setGpsStatus('reading')
    setError(null)

    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)

    try {
      const gps = await Exifr.gps(file)
      if (gps?.latitude && gps?.longitude) {
        setPhotoGPS({ lat: String(gps.latitude), lng: String(gps.longitude) })
        setGpsStatus('found')
      } else {
        setGpsStatus('none')
      }
    } catch {
      setGpsStatus('none')
    }
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoGPS(null)
    setGpsStatus(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const canSubmit = cameraType && photoFile && gpsStatus === 'found' && !sending

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSending(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('cameraType', cameraType)
      fd.append('notes', notes)
      fd.append('lat', photoGPS.lat)
      fd.append('lng', photoGPS.lng)
      fd.append('photo', photoFile)

      const headers = token ? { Authorization: `Bearer ${token}` } : {}
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
          Take a C2PA-verified photo of the camera. The location is read directly from the photo — no manual entry.
          Verified sightings go live on the map instantly.
        </p>

        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16, background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            <Shield size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: 'var(--text)' }}>Signed in as {user?.username}</strong>
              {' '}· C2PA photo = <strong style={{ color: '#10b981' }}>+1 pt</strong> (existing camera) or <strong style={{ color: '#10b981' }}>+2 pts</strong> (new discovery)<br />
              Shoot with <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a> (iOS/Android, free) · Samsung Galaxy S24+ · Google Pixel 10
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16, background: 'rgba(46,204,113,0.05)', border: '1px solid rgba(46,204,113,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            <CheckCircle size={13} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
            <span>
              Anonymous submissions accepted.{' '}
              <button onClick={() => setTab('reputation')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: 0 }}>Create an account</button>{' '}
              to earn reputation points for verified sightings.
            </span>
          </div>
        )}
      </div>

      {/* Success */}
      {submitted ? (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
          {repEarned?.newTier > 0 && (
            <div style={{ background: 'linear-gradient(135deg, rgba(230,57,70,0.12), rgba(245,158,11,0.12))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <Star size={28} style={{ color: '#f59e0b', marginBottom: 8 }} />
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em', marginBottom: 4 }}>🎉 Tier {repEarned.newTier} Unlocked!</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>You're now a <strong style={{ color: 'var(--text)' }}>{repEarned.tierName}</strong>.{repEarned.newTier === 1 && ' Campaign access up to $500 is now available.'}</div>
            </div>
          )}

          <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
            {repEarned?.newCamera ? '📍 New Camera Documented' : '✅ Sighting Verified'}
          </h2>

          {repEarned && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, justifyContent: 'center', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '10px 14px' }}>
              <Shield size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                +{repEarned.points} pt{repEarned.points !== 1 ? 's' : ''}{' '}
                {repEarned.newCamera ? '— new camera, not in any existing database' : '— confirmed existing camera'}{' '}
                · {repEarned.newReputation} total · {repEarned.tierName}
              </span>
            </div>
          )}

          {!isLoggedIn && (
            <div style={{ background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🏅 Earn reputation for future sightings</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px', lineHeight: 1.6 }}>
                Create an account and shoot with <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a> (iOS/Android, free), Galaxy S24+, or Pixel 10. 10 points unlocks Tier 1.
              </p>
              <button onClick={() => setShowClaimModal(true)} style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '9px 16px', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Shield size={13} /> Create Account →
              </button>
            </div>
          )}

          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 24px' }}>
            C2PA signature verified. Location read from photo. Camera is live on the map.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setCameraType(''); setNotes(''); setSubmitted(false); setRepEarned(null); clearPhoto() }}
              style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Report Another
            </button>
            <button onClick={() => setTab('map')}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              View the Map
            </button>
          </div>
          {showClaimModal && <AccountModal onClose={() => setShowClaimModal(false)} />}
        </div>

      ) : (
        /* Form */
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Camera type */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 10 }}>What did you spot?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CAMERA_TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => setCameraType(t.id)} style={{
                  background: cameraType === t.id ? 'rgba(230,57,70,0.08)' : 'var(--bg3)',
                  border: `1px solid ${cameraType === t.id ? 'rgba(230,57,70,0.4)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '12px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo — the location source */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 10 }}>
              C2PA Photo <span style={{ color: 'var(--accent)', fontWeight: 700 }}>required</span>
              <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>— GPS read from photo automatically</span>
            </label>

            {!photoFile ? (
              <>
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                  width: '100%', background: 'var(--bg3)', border: '2px dashed var(--border)',
                  borderRadius: 10, padding: '28px', cursor: 'pointer', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Camera size={28} style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Tap to attach photo</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>JPEG · PNG · WEBP · HEIC · max 12MB</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic"
                  style={{ display: 'none' }} onChange={handlePhoto} />

                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.12)', borderRadius: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text)' }}>Shoot with a C2PA app or device — location must be enabled:</strong><br />
                  📱 <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a> — iOS & Android, free, built by Guardian Project for human rights evidence<br />
                  📲 Samsung Galaxy S24+ or Google Pixel 10 — signs photos automatically
                </div>
              </>
            ) : (
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <img src={photoPreview} alt="Sighting" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={clearPhoto} style={{
                    position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                    border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <X size={14} />
                  </button>
                </div>

                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photoFile.name}</div>

                  {gpsStatus === 'reading' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                      <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Reading location from photo…
                    </div>
                  )}
                  {gpsStatus === 'found' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                      <MapPin size={12} />
                      {parseFloat(photoGPS.lat).toFixed(6)}, {parseFloat(photoGPS.lng).toFixed(6)} — location confirmed from photo
                    </div>
                  )}
                  {gpsStatus === 'none' && (
                    <div style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>No GPS found in this photo</div>
                      <div style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                        This photo doesn't have GPS coordinates embedded. Make sure location access is enabled in Proofmode before shooting, then try again.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="sighting-notes" style={labelStyle}>
              Notes <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            </label>
            <textarea id="sighting-notes" style={{ ...inputStyle, height: 80, resize: 'vertical' }}
              placeholder="Vendor branding? Pole or building mount? Direction it faces?"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Errors */}
          {error === 'c2pa' && (
            <div style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                <AlertCircle size={14} /> C2PA signature not detected
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                This photo doesn't contain a verified C2PA signature. Shoot with{' '}
                <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a>,{' '}
                Samsung Galaxy S24+, or Google Pixel 10, then try again.
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
              ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying & uploading…</>
              : !photoFile ? 'Attach a C2PA photo to continue'
              : gpsStatus === 'reading' ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Reading location…</>
              : gpsStatus === 'none' ? 'No GPS in photo — retake with location enabled'
              : !cameraType ? 'Select camera type above'
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
