import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, AlertCircle, Eye, Loader, Shield, Star, Camera, X, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AccountModal from './AccountModal'
import * as Exifr from 'exifr'

import { API_BASE as AI_URL } from '../config.js'

const CAMERA_TYPES = [
  { id: 'alpr', label: 'ALPR / License Plate Reader', desc: 'Flock Safety, Motorola, Genetec, or similar' },
  { id: 'shotspotter', label: 'ShotSpotter / Gunshot Detection', desc: 'Acoustic sensor on poles or rooftops' },
  { id: 'facial', label: 'Facial Recognition Camera', desc: 'Fixed camera with visible processing hardware' },
  { id: 'cctv', label: 'CCTV / General Surveillance', desc: 'City-owned or police-affiliated camera' },
  { id: 'drone', label: 'Police Drone / UAV', desc: 'Aerial surveillance deployment observed' },
  { id: 'unknown', label: 'Unknown / Unsure', desc: "Looks like surveillance infrastructure but I'm not certain" },
]

export default function SightingForm({ setTab }) {
  const { user, isLoggedIn } = useAuth()
  const [repEarned, setRepEarned] = useState(null)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [cameraType, setCameraType] = useState('')
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoGPS, setPhotoGPS] = useState(null)   // { lat, lng }
  const [gpsStatus, setGpsStatus] = useState(null)  // null | 'reading' | 'found' | 'none' | 'device_reading'
  const [gpsSource, setGpsSource] = useState(null)   // null | 'exif' | 'device'
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)          // null | 'c2pa' | 'no_gps' | 'generic'
  const [checklistOpen, setChecklistOpen] = useState(false)
  const fileInputRef = useRef(null)

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoGPS(null)
    setGpsStatus('reading')
    setError(null)

    const isZip = file.type.includes('zip') || file.name.toLowerCase().endsWith('.zip')

    if (isZip) {
      // Zip from Proofmode — show a generic icon, GPS will be extracted server-side from proof.json
      setPhotoPreview(null)
      // Try to read GPS from proof.json inside the zip using JSZip if available,
      // otherwise mark as 'zip_pending' and let the server handle it
      setGpsStatus('found')   // server will extract GPS from proof.json; trust the zip
      setGpsSource('zip')
      setPhotoGPS({ lat: 'zip', lng: 'zip' })  // sentinel — server replaces with real coords
      return
    }

    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)

    try {
      const gps = await Exifr.gps(file)
      if (gps?.latitude && gps?.longitude) {
        setPhotoGPS({ lat: String(gps.latitude), lng: String(gps.longitude) })
        setGpsStatus('found')
        setGpsSource('exif')
      } else {
        setGpsStatus('none')
        setGpsSource(null)
      }
    } catch {
      setGpsStatus('none')
      setGpsSource(null)
    }
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoGPS(null)
    setGpsStatus(null)
    setGpsSource(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const useDeviceLocation = () => {
    if (!navigator.geolocation) return
    setGpsStatus('device_reading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPhotoGPS({ lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) })
        setGpsStatus('found')
        setGpsSource('device')
      },
      () => {
        setGpsStatus('none')
        setGpsSource(null)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
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
      if (photoGPS.lat !== 'zip') fd.append('lat', photoGPS.lat)
      if (photoGPS.lng !== 'zip') fd.append('lng', photoGPS.lng)
      fd.append('photo', photoFile)

      const res = await fetch(`${AI_URL}/sighting`, { method: 'POST', credentials: 'include', body: fd })
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

  return (
    <>
    <Helmet>
      <title>Report a Camera | Citeback — Submit C2PA-Verified Surveillance Sightings</title>
      <meta name="description" content="Spotted an ALPR, facial recognition camera, or ShotSpotter? Submit a C2PA-verified sighting to the Citeback surveillance map. Anonymous, no account required." />
      <meta property="og:title" content="Report a Camera | Citeback — Submit C2PA-Verified Surveillance Sightings" />
      <meta property="og:description" content="Spotted an ALPR, facial recognition camera, or ShotSpotter? Submit a C2PA-verified sighting to the Citeback surveillance map. Anonymous, no account required." />
    </Helmet>
    <section className="sf-page">

      {/* Header */}
      <div className="sf-header">
        <div className="sf-eyebrow">
          <Eye size={11} /> Community Intelligence
        </div>
        <h1 className="sf-title">
          Report a Surveillance Sighting
        </h1>
        <p className="sf-subtitle">
          Take a C2PA-verified photo of the camera. The location is read directly from the photo — no manual entry.
          Verified sightings go live on the map instantly.
        </p>

        {isLoggedIn ? (
          <div className="sf-status-bar sf-status-bar--auth">
            <Shield size={13} className="sf-status-icon" style={{ color: 'var(--accent)' }} />
            <div>
              <strong style={{ color: 'var(--text)' }}>Signed in as {user?.username}</strong>
              {' '}· C2PA photo = <strong style={{ color: '#10b981' }}>+1 pt</strong> (existing camera) or <strong style={{ color: '#10b981' }}>+2 pts</strong> (new discovery)<br />
              Shoot with <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a> (iOS/Android, free) · Samsung Galaxy S24+ · Google Pixel 10
            </div>
          </div>
        ) : (
          <div className="sf-status-bar sf-status-bar--anon">
            <CheckCircle size={13} className="sf-status-icon" style={{ color: 'var(--green)' }} />
            <span>
              Anonymous submissions accepted.{' '}
              <button onClick={() => setTab('reputation')} className="sf-link-btn">Create an account</button>{' '}
              to earn reputation points for verified sightings.
            </span>
          </div>
        )}
      </div>

      {/* Pre-form checklist */}
      {!submitted && (
        <div className="sighting-checklist">
          <button
            type="button"
            onClick={() => setChecklistOpen(o => !o)}
            className="sighting-checklist-toggle"
          >
            <span className="sighting-checklist-arrow">{checklistOpen ? '▾' : '▸'}</span>
            What you'll need
          </button>
          {checklistOpen && (
            <div className="sighting-checklist-body">
              <ul>
                <li>
                  <span className="check-mark">✓</span>
                  <span>
                    <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode app</a>{' '}
                    (iOS/Android, free) — or Samsung Galaxy S24+ or Pixel 10
                  </span>
                </li>
                <li>
                  <span className="check-mark">✓</span>
                  <span>Location services enabled in the app before you take the photo</span>
                </li>
                <li>
                  <span className="check-mark">✓</span>
                  <span>A publicly visible surveillance camera to photograph (ALPR, CCTV, ShotSpotter, etc.)</span>
                </li>
              </ul>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, marginBottom: 0, lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>Why C2PA?</strong>{' '}
                C2PA is an open standard that cryptographically signs photos at capture — proving the image wasn't manipulated and embedding GPS, time, and device metadata. Proofmode adds a second layer: a verifiable proof bundle tied to your photo.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Success */}
      {submitted ? (
        <div className="sf-success-card">
          {repEarned?.newTier > 0 && (
            <div className="sf-tier-unlock">
              <Star size={28} style={{ color: '#f59e0b', marginBottom: 8 }} />
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em', marginBottom: 4 }}>🎉 Tier {repEarned.newTier} Unlocked!</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>You're now a <strong style={{ color: 'var(--text)' }}>{repEarned.tierName}</strong>.{repEarned.newTier === 1 && ' Campaign access up to $1,000 is now available.'}</div>
            </div>
          )}

          <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
            {repEarned?.newCamera ? '📍 New Camera Documented' : '✅ Sighting Verified'}
          </h2>

          {repEarned && (
            <div className="sf-rep-badge">
              <Shield size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                +{repEarned.points} pt{repEarned.points !== 1 ? 's' : ''}{' '}
                {repEarned.newCamera ? '— new camera, not in any existing database' : '— confirmed existing camera'}{' '}
                · {repEarned.newReputation} total · {repEarned.tierName}
              </span>
            </div>
          )}

          {!isLoggedIn && (
            <div className="sf-promo-box">
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
        <form onSubmit={handleSubmit} className="sf-form">

          {/* Camera type */}
          <div className="sf-field">
            <label className="sf-label" style={{ marginBottom: 10 }}>What did you spot?</label>
            <div className="sf-camera-type-grid">
              {CAMERA_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCameraType(t.id)}
                  className={`sf-camera-type-option${cameraType === t.id ? ' sf-camera-type-option--selected' : ''}`}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo — the location source */}
          <div className="sf-field">
            <label className="sf-label" style={{ marginBottom: 10 }}>
              C2PA Photo <span style={{ color: 'var(--accent)', fontWeight: 700 }}>required</span>
              <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>— GPS read from photo automatically</span>
            </label>

            {!photoFile ? (
              <>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="sf-photo-drop">
                  <Camera size={28} style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Tap to attach photo</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Proofmode ZIP · JPEG · PNG · WEBP · HEIC · max 12MB</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,application/zip,application/x-zip-compressed,.zip"
                  style={{ display: 'none' }} onChange={handlePhoto} />

                <div className="sf-photo-hint">
                  <strong style={{ color: 'var(--text)' }}>Shoot with a C2PA app or device — location must be enabled:</strong><br />
                  📱 <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a> — iOS &amp; Android, free, built by Guardian Project for human rights evidence<br />
                  📲 Samsung Galaxy S24+ or Google Pixel 10 — signs photos automatically
                </div>
              </>
            ) : (
              <div className="sf-photo-preview">
                <div style={{ position: 'relative' }}>
                  <img src={photoPreview} alt="Sighting" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={clearPhoto} aria-label="Remove photo" className="sf-photo-clear">
                    <X size={14} />
                  </button>
                </div>

                <div style={{ padding: '12px 14px' }}>
                  <div className="sf-photo-filename">{photoFile.name}</div>

                  {gpsStatus === 'reading' && (
                    <div className="sf-gps-status sf-gps-status--reading">
                      <Loader size={12} className="spinning" /> Reading location from photo…
                    </div>
                  )}
                  {gpsStatus === 'found' && (
                    <div className="sf-gps-status sf-gps-status--found">
                      <MapPin size={12} />
                      {gpsSource === 'zip'
                        ? 'Proofmode bundle — GPS will be read from proof.json'
                        : gpsSource === 'device'
                          ? `${parseFloat(photoGPS.lat).toFixed(6)}, ${parseFloat(photoGPS.lng).toFixed(6)} — location from your device`
                          : `${parseFloat(photoGPS.lat).toFixed(6)}, ${parseFloat(photoGPS.lng).toFixed(6)} — location from photo`
                      }
                    </div>
                  )}
                  {gpsStatus === 'device_reading' && (
                    <div className="sf-gps-status sf-gps-status--reading">
                      <Loader size={12} className="spinning" /> Getting your device location…
                    </div>
                  )}
                  {gpsStatus === 'none' && (
                    <div className="sf-gps-none">
                      <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>No GPS found in this photo</div>
                      <div style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10 }}>
                        GPS was stripped from this photo (common on iOS). You can use your device's current location instead, or retake with location enabled in Proofmode.
                      </div>
                      <button
                        type="button"
                        onClick={useDeviceLocation}
                        style={{
                          background: 'var(--accent)', border: 'none', color: '#fff',
                          padding: '8px 14px', borderRadius: 7, fontWeight: 700,
                          fontSize: 12, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <MapPin size={12} /> Use my current location
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="sf-field">
            <label htmlFor="sighting-notes" className="sf-label">
              Notes <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            </label>
            <textarea id="sighting-notes" className="sf-input sf-textarea"
              placeholder="Vendor branding? Pole or building mount? Direction it faces?"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Errors */}
          {error === 'c2pa' && (
            <div className="sf-error-box">
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
            <div className="sf-error-generic">
              <AlertCircle size={14} /> Submission failed — please try again.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="sf-submit-btn"
            style={{
              background: canSubmit ? 'var(--accent)' : 'var(--bg3)',
              color: canSubmit ? '#fff' : 'var(--muted)',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {sending
              ? <><Loader size={16} className="spinning" /> Verifying &amp; uploading…</>
              : !photoFile ? 'Attach a C2PA photo to continue'
              : gpsStatus === 'reading' ? <><Loader size={16} className="spinning" /> Reading location…</>
              : gpsStatus === 'none' ? 'No GPS in photo — retake with location enabled'
              : !cameraType ? 'Select camera type above'
              : 'Submit Verified Sighting'
            }
          </button>

          <p className="sf-submit-hint">
            Only publicly visible surveillance infrastructure. Do not submit information about private residences or individuals.
          </p>
        </form>
      )}
    </section>
    </>
  )
}
