import { useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Eye, MapPin, Loader } from 'lucide-react'

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
        headers: { 'Content-Type': 'application/json' },
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
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16,
          background: 'rgba(46,204,113,0.05)', border: '1px solid rgba(46,204,113,0.15)',
          borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6,
        }}>
          <CheckCircle size={13} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong style={{ color: 'var(--text)' }}>Nothing is collected about you.</strong>{' '}
            No IP address is logged. No cookies. No account. Your sighting goes into a moderation queue
            and is reviewed before appearing on the map.
          </span>
        </div>
      </div>

      {submitted ? (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 32, textAlign: 'center',
        }}>
          <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Sighting Submitted</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 24px' }}>
            Your report is in the moderation queue. Once reviewed, it will be added to the surveillance map
            and tagged as community-reported.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setForm({ cameraType: '', address: '', city: '', state: '', notes: '', honeypot: '' }); setSubmitted(false) }}
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
