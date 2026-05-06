import { useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Eye, MapPin, Loader, Shield, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AccountModal from './AccountModal'

const AI_URL = 'https://ai.citeback.com'

// Client-side geocoding via Nominatim — resolves address to lat/lng before submit
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
  const { user, isLoggedIn, authHeaders } = useAuth()
  const [repEarned, setRepEarned] = useState(null) // { points, newReputation, newTier, tierName }
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [form, setForm] = useState({
    cameraType: '',
    address: '',
    city: '',
    state: '',
    notes: '',
    honeypot: '', // never shown to user — spam trap
  })
  const [geo, setGeo] = useState(null)       // { lat, lng, display } — resolved coords
  const [geoStatus, setGeoStatus] = useState(null) // null | 'resolving' | 'resolved' | 'failed'
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    // Reset geo when location fields change
    if (['address', 'city', 'state'].includes(k)) {
      setGeo(null)
      setGeoStatus(null)
    }
  }

  // Resolve location to coordinates when address+city+state are all filled
  const resolveLocation = useCallback(async () => {
    if (!form.address || !form.city || !form.state) return
    setGeoStatus('resolving')
    setGeo(null)
    const result = await geocodeAddress(form.address, form.city, form.state)
    if (result) {
      setGeo(result)
      setGeoStatus('resolved')
    } else {
      setGeoStatus('failed')
    }
  }, [form.address, form.city, form.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.honeypot) return // bot caught
    if (!form.cameraType || !form.address || !form.city || !form.state) return
    setSending(true)
    setError(false)

    // Ensure we have coordinates — geocode now if not already resolved
    let coords = geo
    if (!coords) {
      coords = await geocodeAddress(form.address, form.city, form.state)
      if (coords) { setGeo(coords); setGeoStatus('resolved') }
    }

    try {
      const res = await fetch(`${AI_URL}/sighting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          cameraType: form.cameraType,
          address: form.address,
          city: form.city,
          state: form.state,
          notes: form.notes,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.reputationAwarded) {
          setRepEarned({ points: data.reputationAwarded, newReputation: data.newReputation, newTier: data.newTier, tierName: data.tierName })
        }
        setSubmitted(true)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
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
          Spotted a license plate reader, ShotSpotter mic, or surveillance camera that isn't on the map?
          Submit it here. Anonymous, no account, no contact info required.
        </p>
        {isLoggedIn ? (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16,
            background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6,
          }}>
            <Shield size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ marginBottom: 6 }}>
                <strong style={{ color: 'var(--text)' }}>Signed in as {user?.username}</strong>
                {' '}· Include a <strong style={{ color: 'var(--text)' }}>C2PA-verified photo</strong> to earn reputation points.
              </div>
              <div style={{ lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text)' }}>📱 Any iPhone or Android:</strong>{' '}
                <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a>{' '}
                — built by Guardian Project for human rights evidence. Free, open source, C2PA-signed.
              </div>
              <div style={{ marginTop: 4, opacity: 0.7 }}>
                <strong style={{ color: 'var(--text)' }}>📲 Hardware-native:</strong> Samsung Galaxy S24+ or Google Pixel 10 sign photos automatically.
              </div>
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
              <strong style={{ color: 'var(--text)' }}>Nothing is collected about you.</strong>{' '}
              No IP address is logged. No cookies. No account required.{' '}
              <button onClick={() => setTab('reputation')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: 0 }}>Create an account</button>{' '}
              and add a C2PA photo to earn reputation points.
            </span>
          </div>
        )}
      </div>

      {submitted ? (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 32, textAlign: 'center',
        }}>
          {/* Tier unlock banner — #6 */}
          {repEarned?.newTier > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(230,57,70,0.12), rgba(245,158,11,0.12))',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 12, padding: '16px', marginBottom: 20, textAlign: 'center',
            }}>
              <Star size={28} style={{ color: '#f59e0b', marginBottom: 8 }} />
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em', marginBottom: 4 }}>
                🎉 Tier {repEarned.newTier} Unlocked!
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                You're now a <strong style={{ color: 'var(--text)' }}>{repEarned.tierName}</strong>.
                {repEarned.newTier === 1 && ' You now have access to campaigns up to $500.'}
              </div>
            </div>
          )}

          <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Sighting Submitted</h2>

          {/* Rep earned banner (logged in) */}
          {repEarned && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, justifyContent: 'center', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '10px 14px' }}>
              <Shield size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                +{repEarned.points} reputation point{repEarned.points !== 1 ? 's' : ''} earned · {repEarned.newReputation} total · {repEarned.tierName}
              </span>
            </div>
          )}

          {/* Claim prompt (anonymous) — #5 */}
          {!isLoggedIn && (
            <div style={{
              background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
              borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🏅 Earn reputation for future sightings</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px', lineHeight: 1.6 }}>
                Create an account and shoot through{' '}
                <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Proofmode</a>{' '}
                (iOS + Android, free) or on a Samsung Galaxy S24+ / Google Pixel 10. 10 points unlocks Tier 1.
              </p>
              <button
                onClick={() => setShowClaimModal(true)}
                style={{
                  background: 'var(--accent)', border: 'none', color: '#fff',
                  padding: '9px 16px', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Shield size={13} /> Create Account →
              </button>
            </div>
          )}

          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 24px' }}>
            Your report is in the moderation queue. Once reviewed, it will appear on the map
            as a community-verified sighting.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setForm({ cameraType: '', address: '', city: '', state: '', notes: '', honeypot: '' }); setSubmitted(false); setRepEarned(null) }}
              style={{
                background: 'var(--accent)', border: 'none', color: '#fff',
                padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              Report Another
            </button>
            <button
              onClick={() => setTab('map')}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
                padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              View the Map
            </button>
          </div>
          {showClaimModal && <AccountModal onClose={() => setShowClaimModal(false)} />}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Spam trap — hidden from real users */}
          <input
            type="text"
            value={form.honeypot}
            onChange={e => set('honeypot', e.target.value)}
            style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
          />

          {/* Camera type */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 10 }}>What did you spot?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CAMERA_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set('cameraType', t.id)}
                  style={{
                    background: form.cameraType === t.id ? 'rgba(230,57,70,0.08)' : 'var(--bg3)',
                    border: `1px solid ${form.cameraType === t.id ? 'rgba(230,57,70,0.4)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="sighting-address" style={labelStyle}>Street Address or Intersection</label>
            <input
              id="sighting-address"
              style={inputStyle}
              placeholder="e.g. 200 Central Ave NW"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label htmlFor="sighting-city" style={labelStyle}>City</label>
              <input
                id="sighting-city"
                style={inputStyle}
                placeholder="Albuquerque"
                value={form.city}
                onChange={e => set('city', e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="sighting-state" style={labelStyle}>State</label>
              <input
                id="sighting-state"
                style={inputStyle}
                placeholder="NM"
                maxLength={2}
                value={form.state}
                onChange={e => set('state', e.target.value.toUpperCase())}
                onBlur={() => form.address && form.city && form.state.length === 2 && resolveLocation()}
                required
              />
            </div>
          </div>

          {/* Location resolution status */}
          {geoStatus === 'resolving' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
              Resolving location…
            </div>
          )}
          {geoStatus === 'resolved' && geo && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)',
              borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5,
            }}>
              <MapPin size={12} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
              <span><strong style={{ color: 'var(--text)' }}>Location confirmed</strong> · {geo.display.split(',').slice(0, 3).join(',')}</span>
            </div>
          )}
          {geoStatus === 'failed' && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)',
              borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5,
            }}>
              <AlertCircle size={12} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              <span>Couldn't auto-locate this address — double-check the street name, city, and state. Your sighting will still be submitted for manual review.</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="sighting-notes" style={labelStyle}>
              Additional Notes <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            </label>
            <textarea
              id="sighting-notes"
              style={{ ...inputStyle, height: 90, resize: 'vertical' }}
              placeholder="Vendor branding visible? Mounted on a pole or building? Facing which direction?"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent)',
            }}>
              <AlertCircle size={14} />
              Submission failed. Please try again in a moment.
            </div>
          )}

          <button
            type="submit"
            disabled={!form.cameraType || !form.address || !form.city || !form.state || sending}
            style={{
              background: (form.cameraType && form.address && form.city && form.state && !sending) ? 'var(--accent)' : 'var(--bg3)',
              border: 'none',
              color: (form.cameraType && form.address && form.city && form.state && !sending) ? '#fff' : 'var(--muted)',
              padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15,
              cursor: (form.cameraType && form.address && form.city && form.state && !sending) ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            {sending ? 'Submitting…' : 'Submit Sighting'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
            Only publicly visible surveillance infrastructure. Do not submit information about private residences or individuals.
          </p>
        </form>
      )}
    </section>
  )
}
