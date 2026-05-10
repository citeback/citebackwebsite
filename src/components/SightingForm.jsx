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
            <Shield size={13} className="sf-status-icon" />
            <div>
              <strong className="sf-status-user">Signed in as {user?.username}</strong>
              {' '}· C2PA photo = <strong className="sf-green-highlight">+1 pt</strong> (existing camera) or <strong className="sf-green-highlight">+2 pts</strong> (new discovery)<br />
              Shoot with <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" className="sf-accent-link">Proofmode</a> (iOS/Android, free) · Samsung Galaxy S24+ · Google Pixel 10
            </div>
          </div>
        ) : (
          <div className="sf-status-bar sf-status-bar--anon">
            <CheckCircle size={13} className="sf-status-icon" />
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
                    <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" className="sf-accent-link">Proofmode app</a>{' '}
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
              <p className="sf-checklist-note">
                <strong>Why C2PA?</strong>{' '}
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
              <Star size={28} className="sf-tier-star" />
              <div className="sf-tier-title">🎉 Tier {repEarned.newTier} Unlocked!</div>
              <div className="sf-tier-subtitle">You're now a <strong>{repEarned.tierName}</strong>.{repEarned.newTier === 1 && ' Campaign access up to $1,000 is now available.'}</div>
            </div>
          )}

          <CheckCircle size={48} color="var(--green)" className="sf-success-icon" />
          <h2 className="sf-success-title">
            {repEarned?.newCamera ? '📍 New Camera Documented' : '✅ Sighting Verified'}
          </h2>

          {repEarned && (
            <div className="sf-rep-badge">
              <Shield size={14} className="sf-rep-icon" />
              <span className="sf-rep-text">
                +{repEarned.points} pt{repEarned.points !== 1 ? 's' : ''}{' '}
                {repEarned.newCamera ? '— new camera, not in any existing database' : '— confirmed existing camera'}{' '}
                · {repEarned.newReputation} total · {repEarned.tierName}
              </span>
            </div>
          )}

          {!isLoggedIn && (
            <div className="sf-promo-box">
              <div className="sf-promo-title">🏅 Earn reputation for future sightings</div>
              <p className="sf-promo-text">
                Create an account and shoot with <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" className="sf-accent-link">Proofmode</a> (iOS/Android, free), Galaxy S24+, or Pixel 10. 10 points unlocks Tier 1.
              </p>
              <button onClick={() => setShowClaimModal(true)} className="sf-promo-btn">
                <Shield size={13} /> Create Account →
              </button>
            </div>
          )}

          <p className="sf-verified-msg">
            C2PA signature verified. Location read from photo. Camera is live on the map.
          </p>

          <div className="sf-action-btns">
            <button onClick={() => { setCameraType(''); setNotes(''); setSubmitted(false); setRepEarned(null); clearPhoto() }}
              className="sf-btn-primary">
              Report Another
            </button>
            <button onClick={() => setTab('map')}
              className="sf-btn-secondary">
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
            <label className="sf-label sf-label--spaced">What did you spot?</label>
            <div className="sf-camera-type-grid">
              {CAMERA_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCameraType(t.id)}
                  className={`sf-camera-type-option${cameraType === t.id ? ' sf-camera-type-option--selected' : ''}`}
                >
                  <div className="sf-camera-label">{t.label}</div>
                  <div className="sf-camera-desc">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo — the location source */}
          <div className="sf-field">
            <label className="sf-label sf-label--spaced">
              C2PA Photo <span className="sf-required-tag">required</span>
              <span className="sf-label-hint">— GPS read from photo automatically</span>
            </label>

            {!photoFile ? (
              <>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="sf-photo-drop">
                  <Camera size={28} className="sf-drop-icon" />
                  <span className="sf-drop-title">Tap to attach photo</span>
                  <span className="sf-drop-hint-text">Proofmode ZIP · JPEG · PNG · WEBP · HEIC · max 12MB</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,application/zip,application/x-zip-compressed,.zip"
                  className="sf-photo-hidden" onChange={handlePhoto} />

                <div className="sf-photo-hint">
                  <strong>Shoot with a C2PA app or device — location must be enabled:</strong><br />
                  📱 <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" className="sf-accent-link">Proofmode</a> — iOS &amp; Android, free, built by Guardian Project for human rights evidence<br />
                  📲 Samsung Galaxy S24+ or Google Pixel 10 — signs photos automatically
                </div>
              </>
            ) : (
              <div className="sf-photo-preview">
                <div className="sf-photo-relative">
                  <img src={photoPreview} alt="Sighting" className="sf-preview-img" />
                  <button type="button" onClick={clearPhoto} aria-label="Remove photo" className="sf-photo-clear">
                    <X size={14} />
                  </button>
                </div>

                <div className="sf-photo-info">
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
                      <div className="sf-gps-none-title">No GPS found in this photo</div>
                      <div className="sf-gps-none-text">
                        GPS was stripped from this photo (common on iOS). You can use your device's current location instead, or retake with location enabled in Proofmode.
                      </div>
                      <button
                        type="button"
                        onClick={useDeviceLocation}
                        className="sf-use-location-btn"
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
              Notes <span className="sf-optional-tag">(optional)</span>
            </label>
            <textarea id="sighting-notes" className="sf-input sf-textarea"
              placeholder="Vendor branding? Pole or building mount? Direction it faces?"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Errors */}
          {error === 'c2pa' && (
            <div className="sf-error-box">
              <div className="sf-error-heading">
                <AlertCircle size={14} /> C2PA signature not detected
              </div>
              <p className="sf-error-text">
                This photo doesn't contain a verified C2PA signature. Shoot with{' '}
                <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" className="sf-accent-link">Proofmode</a>,{' '}
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
            className={`sf-submit-btn${canSubmit ? ' sf-submit-btn--active' : ''}`}
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
