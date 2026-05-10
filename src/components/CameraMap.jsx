import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Plus, AlertCircle, Crosshair, CheckCircle, ExternalLink, Loader, Radio, Filter, ChevronDown, Upload, X, Camera, Eye, Clock, Layers, Shield, MapPin } from 'lucide-react'
import * as Exifr from 'exifr'
import { C2PAExplainer, ThreatDisclosure } from './VerificationTiers'
import {
  facialRecognitionAgencies,
  stingrays,
  shotspotter,
  policeDrones,
  predictivePolicing,
} from '../data/surveillanceLayers'
import { getVendorProfile } from '../data/vendorProfiles'
import { useCameraCount } from '../context/CameraCount'
import { API_BASE as AI_URL } from '../config.js'

// Hardcoded verified NM cameras (our own sourced data)
const verifiedCameras = [
  {
    id: 'v1', lat: 36.7072, lng: -105.5769,
    type: 'Flock ALPR', confirmed: true, source_type: 'verified',
    location: 'Taos Plaza area, Taos NM',
    notes: '18 cameras total near plaza and residential streets. Public records confirmed.',
    source: 'NM Legislature records / ProgressNow NM Mar 2026',
    reported: '2023',
  },
  {
    id: 'v2', lat: 36.7200, lng: -105.5800,
    type: 'Flock ALPR', confirmed: true, source_type: 'verified',
    location: 'Paseo del Pueblo Norte, Taos NM',
    notes: 'Part of 18-camera Taos network along main corridor.',
    source: 'NM Legislature records',
    reported: '2023',
  },
  {
    id: 'v3', lat: 32.3199, lng: -106.7637,
    type: 'Flock ALPR + PTZ', confirmed: true, source_type: 'verified',
    location: 'Main St corridor, Las Cruces NM',
    notes: 'Las Cruces has up to 37 cameras including PTZ units that remotely track vehicles and zoom in on faces.',
    source: 'Public records review / ProgressNow NM Mar 2026',
    reported: '2024–present',
  },
  {
    id: 'v4', lat: 32.3100, lng: -106.7800,
    type: 'Flock ALPR + PTZ', confirmed: true, source_type: 'verified',
    location: 'US-70 W corridor, Las Cruces NM',
    notes: 'Part of Las Cruces 37-camera network. PTZ cameras integrated with Peregrine AI.',
    source: 'Public records / ProgressNow NM',
    reported: '2024–present',
  },
  {
    id: 'v5', lat: 35.0844, lng: -106.6504,
    type: 'Flock ALPR', confirmed: true, source_type: 'verified',
    location: 'Bernalillo County, Albuquerque NM',
    notes: 'BCSO has used Flock Safety + Axon since 2024. Deputy caught misusing data — given written reprimand only.',
    source: 'KOB 4 Investigates Jan 2026 / Sheriff Allen testimony',
    reported: '2024',
  },
  {
    id: 'v6', lat: 35.0953, lng: -106.5441,
    type: 'Flock ALPR', confirmed: true, source_type: 'verified',
    location: 'Albuquerque PD network, Albuquerque NM',
    notes: 'APD retains plate scan data for 365 days — 12× longer than county policy.',
    source: 'KOB 4 Investigates Jan 2026',
    reported: 'ongoing',
  },
  {
    id: 'v7', lat: 32.8995, lng: -105.9603,
    type: 'Flock ALPR', confirmed: false, source_type: 'verified',
    location: 'Alamogordo / Otero County NM',
    notes: 'Otero County Sheriff and Alamogordo PD recently announced new Flock agreement.',
    source: 'Alamogordo PD Facebook / ProgressNow NM',
    reported: '2025–2026',
  },
]

// ─── Photo spam filter ────────────────────────────────────────────────────────
async function validatePhoto(file) {
  if (!file.type.startsWith('image/'))
    return { ok: false, reason: 'Not an image file. Please upload a JPG, PNG, or HEIC photo.' }
  if (file.size > 20 * 1024 * 1024)
    return { ok: false, reason: 'File too large. Max 20MB.' }

  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width < 50 || img.height < 50)
        return resolve({ ok: false, reason: 'Image too small to be useful.' })

      const canvas = document.createElement('canvas')
      canvas.width = Math.min(img.width, 120)
      canvas.height = Math.min(img.height, 120)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

      let totalR = 0, totalG = 0, totalB = 0, count = 0
      for (let i = 0; i < data.length; i += 4) {
        totalR += data[i]; totalG += data[i + 1]; totalB += data[i + 2]; count++
      }
      const avgBrightness = (totalR + totalG + totalB) / (count * 3)

      let variance = 0
      for (let i = 0; i < data.length; i += 4) {
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
        variance += Math.pow(lum - avgBrightness, 2)
      }
      variance /= count

      if (variance < 80)
        return resolve({ ok: false, reason: 'Image appears blank or is a solid color. Please submit a real photo of the camera.' })

      resolve({ ok: true })
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ ok: false, reason: 'Could not read image file.' }) }
    img.src = url
  })
}

// Resize + compress before storing (keeps localStorage lean)
async function compressImage(file, maxW = 900, maxH = 675, quality = 0.78) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxW / img.width, maxH / img.height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = url
  })
}

// ─── Photo Submit Modal ───────────────────────────────────────────────────────
function PhotoSubmitModal({ camera, onClose, onSubmit }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [notes, setNotes] = useState('')
  const inputRef = useRef()

  const processFile = async (f) => {
    setError(null)
    setFile(null)
    setPreview(null)
    setChecking(true)
    const result = await validatePhoto(f)
    if (!result.ok) {
      setChecking(false)
      setError(result.reason)
      return
    }
    const compressed = await compressImage(f)
    setChecking(false)
    setFile(f)
    setPreview(compressed)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const handleSubmit = () => {
    if (!preview) return
    onSubmit(camera.id, {
      id: Date.now().toString(),
      dataUrl: preview,
      notes: notes.trim(),
      timestamp: Date.now(),
      status: 'pending',
    })
    setSuccess(true)
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  }
  const modalStyle = {
    background: '#141210', border: '1px solid #292524',
    borderRadius: 16, padding: 28, width: '100%', maxWidth: 520,
    position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
  }
  const inputStyle = {
    width: '100%', background: '#0a0908', border: '1px solid #292524',
    color: '#fafaf9', padding: '10px 12px', borderRadius: 8, fontSize: 13,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    resize: 'vertical',
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modalStyle}>
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', color: 'var(--muted)',
          cursor: 'pointer', padding: 4, borderRadius: 6,
          display: 'flex', alignItems: 'center',
        }}>
          <X size={18} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>
              Photo submitted — thanks!
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 20px' }}>
              Your photo is in the review queue. It'll appear on the map once it clears the spam filter — usually within a few hours.
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              fontSize: 12, color: '#f59e0b', fontWeight: 600,
            }}>
              <Clock size={13} /> Pending community review
            </div>
            <button onClick={onClose} style={{
              marginTop: 20, background: '#f59e0b', border: 'none', color: '#000',
              padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
            }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Camera size={18} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>Submit a Photo</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Help keep the map current. Google Street View can be years out of date — your photo from today is more valuable.
              {camera && (
                <span style={{ display: 'block', marginTop: 4, color: 'var(--muted)' }}>
                  📍 Camera node #{camera.id}
                </span>
              )}
            </div>

            {/* Drop zone */}
            {!preview && (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? '#f59e0b' : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'rgba(245,158,11,0.05)' : 'var(--bg)',
                  transition: 'all 0.15s',
                  marginBottom: 14,
                }}
              >
                <Upload size={28} style={{ color: dragging ? '#f59e0b' : 'var(--muted)', marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: dragging ? '#f59e0b' : 'var(--muted)', marginBottom: 4 }}>
                  Drop photo here
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  or <span style={{ color: '#f59e0b', textDecoration: 'underline' }}>browse files</span> · JPG, PNG, HEIC · max 20MB
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]) }}
                />
              </div>
            )}

            {/* Checking spinner */}
            {checking && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px', borderRadius: 10,
                background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
                marginBottom: 14, fontSize: 13, color: '#f59e0b',
              }}>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                Running spam filter...
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                marginBottom: 14, fontSize: 13, color: '#ef4444',
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Photo rejected by filter</div>
                  <div style={{ opacity: 0.85 }}>{error}</div>
                </div>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <CheckCircle size={14} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Spam filter passed</span>
                  <button
                    onClick={() => { setFile(null); setPreview(null); setError(null) }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}
                  >
                    Remove
                  </button>
                </div>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', maxHeight: 220, objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Optional notes */}
            {preview && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>
                  What are we looking at? <span style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60 }}
                  placeholder="e.g. Flock camera on pole at intersection, pointing east toward highway on-ramp"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            )}

            {/* AI filter notice */}
            <div style={{
              fontSize: 11, color: 'var(--muted)', lineHeight: 1.6,
              borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: preview ? 16 : 0,
            }}>
              🤖 All photos pass a spam filter before review. Photos showing faces, license plates, or unrelated content are automatically blocked. Nothing goes live without human approval.
            </div>

            {preview && (
              <button
                onClick={handleSubmit}
                style={{
                  width: '100%', background: '#f59e0b', border: 'none', color: '#000',
                  padding: '12px', borderRadius: 9, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Camera size={15} /> Submit for Review
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── OSM Overpass fetch ───────────────────────────────────────────────────────
async function fetchOSMCameras(bounds) {
  const { _southWest: sw, _northEast: ne } = bounds
  const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`
  const query = `
    [out:json][timeout:25][bbox:${bbox}];
    (
      node["surveillance:type"="ALPR"];
      node["surveillance:type"="ANPR"];
      node["surveillance:type"="alpr"];
      node["camera:type"="ALPR"];
      node["man_made"="surveillance"]["surveillance:type"];
    );
    out body;
  `
  const res = await fetch('/.netlify/functions/proxy?service=overpass', { method: 'POST', body: query })
  const data = await res.json()
  return data.elements || []
}

function MapEventHandler({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds(), map.getZoom()),
    zoomend: () => onBoundsChange(map.getBounds(), map.getZoom()),
  })
  return null
}

function distanceM(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ─── OSM Canvas Layer ─────────────────────────────────────────────────────────
// ─── Popup HTML builders ────────────────────────────────────────────────────
function buildAlprPopupHTML(camera, map, isDual, sighting) {
  const osmUrl = `https://www.openstreetmap.org/node/${camera.id}`
  const googleUrl = `https://www.google.com/maps?q=${camera.lat},${camera.lon}`
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${camera.lat},${camera.lon}`
  const photos = (window.__fr_photoStore || {})[camera.id] || []
  const approved = photos.filter(p => p.status === 'approved')
  const pending = photos.filter(p => p.status === 'pending')
  const photoStrip = approved.length > 0
    ? `<div style="margin:10px 0 6px"><div style="font-size:11px;font-weight:700;color:#10b981;margin-bottom:6px">📸 ${approved.length} community photo${approved.length > 1 ? 's' : ''}</div><div style="display:flex;gap:4px;flex-wrap:wrap">${approved.map(p => `<img src="${p.dataUrl}" alt="Community submitted camera photo" style="width:80px;height:55px;object-fit:cover;border-radius:5px;border:1px solid #292524">`).join('')}</div></div>`
    : pending.length > 0
      ? `<div style="font-size:11px;color:#f59e0b;margin:8px 0">⏳ ${pending.length} photo${pending.length > 1 ? 's' : ''} pending review</div>`
      : ''
  const sightingStrip = sighting?.photoFilename
    ? `<div style="margin-bottom:10px">
        <img src="https://ai.citeback.com/photos/${sighting.photoFilename}" alt="Citeback verified photo" style="width:100%;max-height:140px;object-fit:cover;border-radius:6px;display:block;margin-bottom:6px" />
        <div style="font-size:10px;color:#f97316;font-weight:700;letter-spacing:0.05em">📷 C2PA VERIFIED PHOTO · ${new Date(sighting.ts).toLocaleDateString()}</div>
        ${sighting.notes ? `<div style="font-size:11px;color:#888;margin-top:3px;line-height:1.4">${sighting.notes}</div>` : ''}
      </div>`
    : ''
  const verifiedBadge = isDual
    ? `<div style="display:inline-flex;align-items:center;gap:5px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.35);border-radius:5px;padding:3px 8px;font-size:10px;font-weight:700;color:#f97316;margin-bottom:8px;letter-spacing:0.05em">★ VERIFIED BY CITEBACK + OPENSTREETMAP</div>`
    : `<div style="display:inline-flex;align-items:center;gap:5px;background:rgba(230,57,70,0.1);border:1px solid rgba(230,57,70,0.3);border-radius:5px;padding:3px 8px;font-size:10px;font-weight:700;color:#e63946;margin-bottom:8px;letter-spacing:0.05em">📡 OPENSTREETMAP</div>`
  return `<div style="font-family:Inter,sans-serif;padding:4px">
    ${sightingStrip}
    ${verifiedBadge}
    <div style="font-weight:800;font-size:14px;margin-bottom:6px;color:${isDual ? '#f97316' : '#e63946'}">${camera.st ? camera.st.toUpperCase() : 'ALPR Camera'}</div>
    ${camera.op ? `<div style="font-size:12px;margin-bottom:4px"><strong>Operator:</strong> ${camera.op}</div>` : ''}
    <div style="font-size:11px;color:#888;margin-bottom:4px">📍 <strong>${camera.lat.toFixed(6)}, ${camera.lon.toFixed(6)}</strong></div>
    <div style="font-size:11px;color:#888;margin-bottom:10px">OSM Node: <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" style="color:#5dade2">#${camera.id} →</a></div>
    ${photoStrip}
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
      <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;font-weight:600;color:#5dade2;text-decoration:none">📡 View on OpenStreetMap →</a>
      <a href="${googleUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;font-weight:600;color:#e63946;text-decoration:none">🗺 Google Maps →</a>
      <a href="${streetViewUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;font-weight:600;color:#2ecc71;text-decoration:none">📷 Street View →</a>
      <button data-photo-submit data-camera-id="${camera.id}" data-lat="${camera.lat}" data-lon="${camera.lon}" style="font-size:12px;font-weight:700;color:#000;background:#f59e0b;border:none;border-radius:6px;padding:7px 10px;cursor:pointer;text-align:left;margin-top:2px">📸 Submit Photo${approved.length > 0 ? ' · Add Another' : ''}</button>
    </div>
  </div>`
}

function buildAgencyPopupHTML(agency, layer) {
  const vendorProfile = getVendorProfile(agency.vendor)
  const vendorBlock = vendorProfile
    ? `<div style="background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.2);border-radius:6px;padding:8px 10px;margin-bottom:8px">
        <div style="font-size:11px;font-weight:800;color:#ef4444;margin-bottom:3px">🚩 ${vendorProfile.name}</div>
        <div style="font-size:11px;color:#888;margin-bottom:4px;line-height:1.4">${vendorProfile.tagline}</div>
        <div style="font-size:10px;color:#666;line-height:1.5">${vendorProfile.controversies[0]}</div>
        ${vendorProfile.url ? `<a href="${vendorProfile.url}" target="_blank" rel="noopener noreferrer" style="font-size:10px;color:#ef4444;font-weight:600;display:block;margin-top:4px">Investigate ${vendorProfile.name} →</a>` : ''}
      </div>`
    : ''
  const terminatedBadge = agency.status === 'terminated'
    ? `<div style="font-size:10px;font-weight:700;color:#2ecc71;background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3);border-radius:4px;padding:2px 7px;margin-bottom:6px;display:inline-block;letter-spacing:0.08em">✓ PROGRAM TERMINATED</div>`
    : ''
  return `<div style="font-family:Inter,sans-serif;min-width:260px;max-width:320px;padding:4px">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <span style="font-size:16px">${layer.icon}</span>
      <span style="font-weight:800;font-size:13px;color:${layer.color}">${layer.label.toUpperCase()}</span>
    </div>
    ${terminatedBadge}
    <div style="font-weight:700;font-size:13px;margin-bottom:4px">${agency.name}</div>
    <div style="font-size:12px;color:#666;margin-bottom:4px">📍 ${agency.city}, ${agency.state}</div>
    ${agency.vendor ? `<div style="font-size:12px;color:#555;margin-bottom:4px"><strong>Vendor/System:</strong> ${agency.vendor}</div>` : ''}
    ${vendorBlock}
    <div style="font-size:11px;font-weight:700;color:${agency.confirmed ? '#10b981' : '#f59e0b'};margin-bottom:6px">${agency.confirmed ? '✓ Confirmed deployment' : '⚠ Reported deployment'}</div>
    ${agency.notes ? `<div style="font-size:11px;color:#444;line-height:1.55;background:#f8f6f2;border:1px solid #e5e0d8;border-radius:6px;padding:6px 8px;margin-bottom:8px">ℹ️ ${agency.notes}</div>` : ''}
    <div style="font-size:10px;color:#777;line-height:1.5;border-top:1px solid #eee;padding-top:6px;margin-bottom:8px"><strong>Source:</strong> ${agency.source}</div>
    ${agency.url ? `<div style="margin-bottom:8px"><a href="${agency.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px;font-weight:600;color:${layer.color};text-decoration:none">View source →</a></div>` : ''}
    <button data-propose data-agency="${agency.name.replace(/"/g, '&quot;')}" data-location="${(agency.city + ', ' + agency.state).replace(/"/g, '&quot;')}"" style="width:100%;padding:7px 10px;background:transparent;border:1px solid ${layer.color};border-radius:6px;color:${layer.color};font-size:11px;font-weight:700;cursor:pointer">📋 Propose FOIA →</button>
  </div>`
}

function openItemPopup(map, entry, latlng) {
  const html = entry.type === 'alpr'
    ? buildAlprPopupHTML(entry.item, map, entry.isDual, entry.matchingSighting)
    : buildAgencyPopupHTML(entry.item, entry.layer)
  const lat = entry.type === 'alpr' ? entry.item.lat : entry.item.lat
  const lng = entry.type === 'alpr' ? entry.item.lon : entry.item.lng
  const popup = L.popup({ maxWidth: 320 }).setLatLng([lat, lng]).setContent(html)
  popup.openOn(map)

  const popupEl = popup.getElement()
  if (popupEl) {
    const photoBtn = popupEl.querySelector('[data-photo-submit]')
    if (photoBtn) {
      photoBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = photoBtn.getAttribute('data-camera-id')
        const plat = parseFloat(photoBtn.getAttribute('data-lat'))
        const plon = parseFloat(photoBtn.getAttribute('data-lon'))
        if (window.__fr_openPhotoSubmit) window.__fr_openPhotoSubmit(id, plat, plon)
      })
    }
    const proposeBtn = popupEl.querySelector('[data-propose]')
    if (proposeBtn) {
      proposeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        window.dispatchEvent(new CustomEvent('openPropose', {
          detail: {
            agency: proposeBtn.getAttribute('data-agency'),
            location: proposeBtn.getAttribute('data-location')
          }
        }))
      })
    }
  }
}

// ─── Unified tap handler + ALPR canvas renderer ──────────────────────────────
function OSMCanvasLayer({ cameras, effLayers, activeLayers, dualVerifiedIds, osmCount, communitySightings }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      const zoom = map.getZoom()
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
      const touchMultiplier = isTouchDevice ? 2.5 : 1
      const clickRadiusM = (50000 / Math.pow(2, zoom - 4)) * touchMultiplier

      const nearby = []

      // ALPR cameras (canvas layer)
      if (cameras.length && (activeLayers.has('alpr') || activeLayers.has('dual'))) {
        let nearest = null, minDist = Infinity
        for (const c of cameras) {
          const d = distanceM(lat, lng, c.lat, c.lon)
          if (d < minDist) { minDist = d; nearest = c }
        }
        if (nearest && minDist <= clickRadiusM) {
          const isDual = dualVerifiedIds && dualVerifiedIds.has(nearest.id)
          // Find matching Citeback sighting within 100m for this camera
          const matchingSighting = isDual && communitySightings
            ? communitySightings.find(s => s.lat && s.lng && distanceM(parseFloat(s.lat), parseFloat(s.lng), nearest.lat, nearest.lon) <= 150)
            : null
          nearby.push({ type: 'alpr', item: nearest, dist: minDist, isDual, matchingSighting, label: nearest.st ? nearest.st.toUpperCase() : 'ALPR Camera', icon: isDual ? '🟠' : '📡', color: isDual ? '#f97316' : '#e63946' })
        }
      }

      // Non-ALPR overlay layers
      for (const layer of (effLayers || [])) {
        if (layer.id === 'alpr' || !layer.data || !activeLayers.has(layer.id)) continue
        let nearest = null, minDist = Infinity
        for (const a of layer.data) {
          if (a.status === 'terminated') continue
          const d = distanceM(lat, lng, a.lat, a.lng)
          if (d < minDist) { minDist = d; nearest = a }
        }
        if (nearest && minDist <= clickRadiusM) {
          nearby.push({ type: 'agency', layer, item: nearest, dist: minDist, label: nearest.name, icon: layer.icon, color: layer.color })
        }
      }

      if (nearby.length === 0) return

      if (nearby.length === 1) {
        openItemPopup(map, nearby[0])
        return
      }

      // Disambiguation: multiple layer types nearby — let user pick
      nearby.sort((a, b) => a.dist - b.dist)

      const listItems = nearby.map((entry, i) => {
        const distLabel = entry.dist < 1000 ? `${Math.round(entry.dist)}m` : `${(entry.dist / 1000).toFixed(1)}km`
        return `<button data-disambig="${i}" style="width:100%;display:flex;align-items:center;gap:8px;padding:8px 10px;background:transparent;border:1px solid ${entry.color}22;border-radius:8px;cursor:pointer;text-align:left;margin-bottom:6px">
          <span style="font-size:16px">${entry.icon}</span>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700;color:${entry.color}">${entry.label}</div>
            <div style="font-size:10px;color:#888">${distLabel} away</div>
          </div>
          <span style="font-size:11px;color:#aaa">→</span>
        </button>`
      }).join('')

      const disambigPopup = L.popup({ maxWidth: 300 })
        .setLatLng([lat, lng])
        .setContent(`<div style="font-family:Inter,sans-serif;padding:4px">
          <div style="font-size:11px;font-weight:700;color:#666;margin-bottom:10px;letter-spacing:0.05em">NEARBY — TAP TO SELECT</div>
          ${listItems}
        </div>`)
      disambigPopup.openOn(map)

      // Attach real event listeners after popup is in the DOM (avoids CSP/inline-onclick issues)
      const popupEl = disambigPopup.getElement()
      if (popupEl) {
        popupEl.querySelectorAll('[data-disambig]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            const idx = parseInt(btn.getAttribute('data-disambig'))
            map.closePopup()
            openItemPopup(map, nearby[idx])
          })
        })
      }
    }
  })

  const layerRef = useRef(null)
  useEffect(() => {
    if (!map || cameras.length === 0) return
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null }
    const renderer = L.canvas({ padding: 0.5 })
    const touch = window.matchMedia('(pointer: coarse)').matches
    const geojson = {
      type: 'FeatureCollection',
      features: cameras.map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
        properties: { id: c.id },
      }))
    }
    const layer = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => {
        const dual = dualVerifiedIds && dualVerifiedIds.has(feature.properties.id)
        // If this is a dual-verified camera but that layer is off, hide it or show as OSM-only
        const showAsDual = dual && activeLayers.has('dual')
        const showAsOSM = !dual && activeLayers.has('alpr')
        const showAsDualAsOSM = dual && !activeLayers.has('dual') && activeLayers.has('alpr')
        const visible = showAsDual || showAsOSM || showAsDualAsOSM
        return L.circleMarker(latlng, {
          renderer,
          radius: touch ? 8 : 5,
          fillColor: showAsDual ? '#f97316' : '#e63946',
          fillOpacity: visible ? (showAsDual ? 0.9 : 0.65) : 0,
          color: visible ? (showAsDual ? 'rgba(249,115,22,0.5)' : 'rgba(230,57,70,0.35)') : 'transparent',
          weight: touch ? 2 : 1,
          interactive: visible,
        })
      },
    })
    layer.addTo(map)
    layerRef.current = layer
    return () => { if (layerRef.current) map.removeLayer(layerRef.current) }
  }, [map, cameras])

  return null
}

// ─── State bbox lookup ────────────────────────────────────────────────────────
const STATE_BBOX = {
  'AL':[30.14,-88.48,35.01,-84.89],'AK':[54.56,-169.12,71.5,-129.98],
  'AZ':[31.33,-114.82,37.0,-109.05],'AR':[33.0,-94.62,36.5,-89.64],
  'CA':[32.53,-124.48,42.01,-114.13],'CO':[36.99,-109.06,41.0,-102.04],
  'CT':[40.95,-73.73,42.05,-71.78],'DE':[38.45,-75.79,39.84,-75.05],
  'FL':[24.52,-87.63,31.0,-80.03],'GA':[30.36,-85.61,35.0,-80.84],
  'HI':[18.91,-160.25,22.24,-154.8],'ID':[41.99,-117.24,49.0,-111.04],
  'IL':[36.97,-91.51,42.51,-87.02],'IN':[37.77,-88.1,41.77,-84.78],
  'IA':[40.38,-96.64,43.5,-90.14],'KS':[36.99,-102.05,40.0,-94.59],
  'KY':[36.5,-89.57,39.15,-81.96],'LA':[28.92,-94.04,33.02,-88.82],
  'ME':[43.06,-71.08,47.46,-66.95],'MD':[37.91,-79.49,39.72,-74.99],
  'MA':[41.24,-73.51,42.89,-69.93],'MI':[41.7,-90.42,48.31,-82.41],
  'MN':[43.5,-97.24,49.38,-89.49],'MS':[30.17,-91.66,35.01,-88.1],
  'MO':[35.99,-95.77,40.61,-89.1],'MT':[44.36,-116.05,49.0,-104.04],
  'NE':[40.0,-104.05,43.0,-95.31],'NV':[35.0,-120.01,42.0,-114.04],
  'NH':[42.7,-72.56,45.31,-70.61],'NJ':[38.93,-75.56,41.36,-73.89],
  'NM':[31.33,-109.05,37.0,-103.0],'NY':[40.5,-79.76,45.02,-71.86],
  'NC':[33.84,-84.32,36.59,-75.46],'ND':[45.94,-104.05,49.0,-96.55],
  'OH':[38.4,-84.82,41.98,-80.52],'OK':[33.62,-103.0,37.0,-94.43],
  'OR':[41.99,-124.62,46.24,-116.46],'PA':[39.72,-80.52,42.27,-74.69],
  'RI':[41.15,-71.9,42.02,-71.12],'SC':[32.03,-83.35,35.22,-78.55],
  'SD':[42.48,-104.06,45.95,-96.44],'TN':[34.99,-90.31,36.68,-81.65],
  'TX':[25.84,-106.65,36.5,-93.51],'UT':[37.0,-114.05,42.0,-109.04],
  'VT':[42.73,-73.44,45.02,-71.5],'VA':[36.54,-83.68,39.47,-75.24],
  'WA':[45.54,-124.77,49.0,-116.91],'WV':[37.2,-82.65,40.64,-77.72],
  'WI':[42.5,-92.9,47.08,-86.25],'WY':[40.99,-111.06,45.01,-104.05],
  'DC':[38.79,-77.12,38.99,-76.91],
}

function ZoomToState({ target }) {
  const map = useMapEvents({})
  useEffect(() => {
    if (!target || !STATE_BBOX[target]) return
    const [s, w, n, e] = STATE_BBOX[target]
    map.fitBounds([[s, w], [n, e]], { padding: [20, 20] })
  }, [target, map])
  return null
}

const CAMERA_TYPE_LABELS = {
  alpr: 'ALPR / License Plate Reader',
  shotspotter: 'ShotSpotter / Gunshot Detection',
  facial: 'Facial Recognition',
  cctv: 'CCTV / General Surveillance',
  drone: 'Police Drone / UAV',
  unknown: 'Unknown / Unidentified',
}

// ─── EFF Atlas Overlay Definitions ──────────────────────────────────────────
const EFF_LAYERS = [
  {
    id: 'alpr',
    label: 'ALPR Cameras',
    icon: '📷',
    color: '#e63946',
    source: 'OpenStreetMap',
    sourceUrl: 'https://openstreetmap.org',
    active: true,
    live: true,
    data: null,
    description: '92,000+ automatic license plate readers mapped nationally via OpenStreetMap',
  },
  {
    id: 'facial',
    label: 'Facial Recognition',
    icon: '👁️',
    color: '#a855f7',
    source: 'Georgetown Law / EFF / ACLU / Clearview AI leak',
    sourceUrl: 'https://atlasofsurveillance.org/search',
    active: false,
    live: true,
    data: facialRecognitionAgencies,
    description: `${facialRecognitionAgencies.length} confirmed agencies — facial recognition deployments from Georgetown Law, EFF Atlas, ACLU trackers, and investigative reporting`,
  },
  {
    id: 'stingray',
    label: 'Cell-Site Simulators',
    icon: '📡',
    color: '#f97316',
    source: 'ACLU / EFF Atlas of Surveillance',
    sourceUrl: 'https://sls.eff.org/technologies/cell-site-simulators-imsi-catchers',
    active: false,
    live: true,
    data: stingrays,
    description: `${stingrays.length} confirmed agencies — Stingray/IMSI catcher deployments from ACLU national tracker, EFF Atlas, and FOIA records`,
  },
  {
    id: 'shotspotter',
    label: 'ShotSpotter',
    icon: '🔊',
    color: '#eab308',
    source: 'AP Investigation / MacArthur Justice Ctr / USASpending',
    sourceUrl: 'https://endpolicesurveillance.com',
    active: false,
    live: true,
    data: shotspotter,
    description: `${shotspotter.length} confirmed cities — gunshot detection microphone networks from AP investigation, city contracts, and USASpending`,
  },
  {
    id: 'drones',
    label: 'Police Drones',
    icon: '🚁',
    color: '#06b6d4',
    source: 'Bard College Drone Center / EFF Atlas / FAA',
    sourceUrl: 'https://dronecenter.bard.edu/projects/public-safety-drones-project/',
    active: false,
    live: true,
    data: policeDrones,
    description: `${policeDrones.length} confirmed agencies — drone programs from Bard College Drone Center, EFF Atlas, FAA records, and FOIA`,
  },
  {
    id: 'predictive',
    label: 'Predictive Policing',
    icon: '🧠',
    color: '#ec4899',
    source: 'PredPol client lists / The Markup / Brennan Center',
    sourceUrl: 'https://themarkup.org/prediction-bias/2023/10/02/predictive-policing-software-terrible-at-predicting-crimes',
    active: false,
    live: true,
    data: predictivePolicing,
    description: `${predictivePolicing.length} confirmed deployments — algorithmic policing from PredPol client lists, Palantir contracts, The Markup, and Brennan Center`,
  },
]

// ─── Inline layer blurbs for non-ALPR types ─────────────────────────────────
const LAYER_BLURBS = {
  facial: 'AI that matches your face against a police database — often without your knowledge.',
  stingray: 'Fake cell towers that force every phone in range to reveal its identity and location.',
  shotspotter: 'Microphones that claim to detect gunshots — ~70% of alerts find no evidence of gunfire.',
  drones: 'Unmanned aircraft that can carry cameras, thermal sensors, and even Stingrays.',
  predictive: 'Algorithms that score residents as future criminals, directing police based on bias-amplifying data.',
}

function LayerToggles({ activeLayers, setActiveLayers, showVictories, setShowVictories, communitySightings, dualVerifiedIds, osmCount }) {
  const [expandedBlurb, setExpandedBlurb] = useState(null)

  const toggle = (id) => {
    setActiveLayers(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        // Auto-expand blurb when turning on a non-ALPR layer
        if (id !== 'alpr') setExpandedBlurb(id)
      }
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {EFF_LAYERS.map(layer => {
        const isOn = activeLayers.has(layer.id)
        const blurb = LAYER_BLURBS[layer.id]
        const blurbOpen = expandedBlurb === layer.id
        return (
          <div key={layer.id}>
            <button
              onClick={() => toggle(layer.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: isOn ? `${layer.color}14` : 'transparent',
                border: `1px solid ${isOn ? `${layer.color}40` : 'var(--border)'}`,
                borderRadius: blurbOpen ? '8px 8px 0 0' : 8, padding: '8px 10px',
                cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 14 }}>{layer.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: isOn ? 'var(--fg)' : 'var(--muted)', lineHeight: 1.2 }}>
                  {layer.label}
                </div>
                {layer.data && layer.data.length > 0 ? (
                  <div style={{ fontSize: 10, color: layer.color, marginTop: 2, opacity: 0.8 }}>
                    {layer.data.length} confirmed deployments
                  </div>
                ) : !layer.live ? (
                  <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 2 }}>Activating soon — EFF Atlas data loading</div>
                ) : null}
              </div>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: isOn ? layer.color : 'var(--border)',
                flexShrink: 0, transition: 'background 0.15s',
              }} />
            </button>

            {/* Inline blurb for non-ALPR layers */}
            {blurb && isOn && blurbOpen && (
              <div style={{
                background: `${layer.color}0e`,
                border: `1px solid ${layer.color}30`,
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                padding: '8px 10px 10px',
              }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 6 }}>
                  ℹ️ {blurb}
                </div>
                <a
                  href={layer.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: layer.color, fontSize: 11, fontWeight: 600,
                    textDecoration: 'none', display: 'inline-block',
                  }}
                >
                  Learn more ↗
                </a>
              </div>
            )}
          </div>
        )
      })}

      {/* Citeback verification tiers */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 6px' }} />

      {[{
        id: 'cb-exclusive',
        color: '#f59e0b',
        icon: '⭐',
        label: 'Citeback Exclusive',
        desc: 'Discovered only by Citeback community — not in OpenStreetMap or any other database',
        count: communitySightings.filter(s => s.newCamera).length,
        countLabel: 'unique discoveries',
      }, {
        id: 'dual',
        color: '#f97316',
        icon: '🟠',
        label: 'OSM + Citeback',
        desc: 'Verified by both OpenStreetMap and a Citeback C2PA field submission',
        count: dualVerifiedIds?.size || 0,
        countLabel: 'dual-verified cameras',
      }, {
        id: 'alpr',
        color: '#e63946',
        icon: '🔴',
        label: 'OSM Only',
        desc: 'Documented by OpenStreetMap contributors — not yet Citeback-verified',
        count: osmCount - (dualVerifiedIds?.size || 0),
        countLabel: 'cameras in database',
      }].map(tier => {
        const isOn = activeLayers.has(tier.id)
        return (
          <button key={tier.id}
            onClick={() => toggle(tier.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: isOn ? `${tier.color}14` : 'transparent',
              border: `1px solid ${isOn ? `${tier.color}55` : 'var(--border)'}`,
              borderRadius: 8, padding: '8px 10px', marginBottom: 4,
              cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 13 }}>{tier.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: isOn ? 'var(--text)' : 'var(--muted)', lineHeight: 1.2 }}>{tier.label}</div>
              <div style={{ fontSize: 10, color: tier.color, marginTop: 2, opacity: 0.85 }}>
                {tier.count.toLocaleString()} {tier.countLabel}
              </div>
              {isOn && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{tier.desc}</div>}
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: isOn ? tier.color : 'var(--border)', flexShrink: 0, transition: 'background 0.15s' }} />
          </button>
        )
      })}

      {/* Victories divider */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 6px' }} />
      <button
        onClick={() => setShowVictories(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: showVictories ? 'rgba(46,204,113,0.1)' : 'transparent',
          border: `1px solid ${showVictories ? 'rgba(46,204,113,0.4)' : 'var(--border)'}`,
          borderRadius: 8, padding: '8px 10px',
          cursor: 'pointer', width: '100%', textAlign: 'left',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 14 }}>✊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: showVictories ? '#2ecc71' : 'var(--muted)', lineHeight: 1.2 }}>Community Victories</div>
          <div style={{ fontSize: 10, color: '#2ecc71', marginTop: 2, opacity: 0.8 }}>Programs terminated by community action</div>
        </div>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: showVictories ? '#2ecc71' : 'var(--border)',
          flexShrink: 0, transition: 'background 0.15s',
        }} />
      </button>
      {showVictories && (
        <div style={{ fontSize: 11, color: '#86efac', lineHeight: 1.55, padding: '6px 10px', background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 6, marginTop: 2 }}>
          ✅ Green dots = programs the community successfully shut down. Proof that resistance works.
        </div>
      )}
    </div>
  )
}

// ─── Main CameraMap component ─────────────────────────────────────────────────
export default function CameraMap() {
  const cameraCount = useCameraCount()
  const [overlayPanelOpen, setOverlayPanelOpen] = useState(false)
  const [activeLayers, setActiveLayers] = useState(() => new Set(['alpr', 'dual', 'cb-exclusive', 'facial', 'stingray', 'shotspotter', 'drones', 'predictive']))
  const [communitySightings, setCommunitySightings] = useState([])
  const [sightingVersion, setSightingVersion] = useState(0)
  const [showVictories, setShowVictories] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ lat: '', lng: '', location: '', notes: '', source: '', hasC2PA: false, photoFile: null })
  const [mapGpsStatus, setMapGpsStatus] = useState(null) // null | 'reading' | 'found' | 'none'
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [locating, setLocating] = useState(false)
  const [osmCameras, setOsmCameras] = useState([])
  const [filteredCameras, setFilteredCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [osmCount, setOsmCount] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedState, setSelectedState] = useState('')
  const [stateCounts, setStateCounts] = useState({})
  const [showStatPanel, setShowStatPanel] = useState(false)
  const fetchTimeout = useRef(null)
  const baseLoaded = useRef(false)

  // ── Photo submission state ──
  const [photoStore, setPhotoStore] = useState({})   // { [cameraId]: [{id, dataUrl, notes, timestamp, status}] }
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [photoModalCamera, setPhotoModalCamera] = useState(null)

  // Load photos from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('fr_photos') || '{}')
      setPhotoStore(stored)
    } catch (_) {}
  }, [])

  // Keep localStorage + global ref in sync
  useEffect(() => {
    window.__fr_photoStore = photoStore
    try {
      localStorage.setItem('fr_photos', JSON.stringify(photoStore))
    } catch (_) {}
  }, [photoStore])

  // Global callback: Leaflet popup "Submit Photo" button calls this
  useEffect(() => {
    window.__fr_openPhotoSubmit = (cameraId, lat, lon) => {
      setPhotoModalCamera({ id: String(cameraId), lat, lon })
      setShowPhotoModal(true)
    }
    return () => { delete window.__fr_openPhotoSubmit }
  }, [])

  const handlePhotoSubmit = (cameraId, photo) => {
    setPhotoStore(prev => {
      const existing = prev[cameraId] || []
      return { ...prev, [cameraId]: [...existing, photo] }
    })
  }

  // Load community sightings — re-runs whenever sightingVersion bumps (post-submit)
  useEffect(() => {
    fetch('https://ai.citeback.com/sightings/public')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.sightings)) setCommunitySightings(d.sightings) })
      .catch(() => {})
  }, [sightingVersion])

  // Compute which OSM cameras have a Citeback-verified sighting within 50m
  const dualVerifiedIds = useMemo(() => {
    const ids = new Set()
    for (const s of communitySightings) {
      if (!s.lat || !s.lng) continue
      const slat = parseFloat(s.lat), slng = parseFloat(s.lng)
      for (const c of osmCameras) {
        if (distanceM(slat, slng, c.lat, c.lon) <= 100) { ids.add(c.id); break }
      }
    }
    return ids
  }, [communitySightings, osmCameras])

  // Load base dataset
  useEffect(() => {
    fetch('https://ai.citeback.com/alpr-us.json')
      .then(r => r.json())
      .then(data => {
        setOsmCameras(data)
        setFilteredCameras(data)
        setOsmCount(data.length)
        baseLoaded.current = true
        setLoading(false)
      })
      .catch(() => setLoading(false))
    fetch('https://ai.citeback.com/alpr-by-state.json')
      .then(r => r.json())
      .then(setStateCounts)
      .catch(() => {})
  }, [])

  // Apply type filter
  useEffect(() => {
    if (typeFilter === 'all') { setFilteredCameras(osmCameras); return }
    setFilteredCameras(osmCameras.filter(c => c.st?.toLowerCase().includes(typeFilter)))
  }, [typeFilter, osmCameras])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleMapPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    set('photoFile', file)
    set('hasC2PA', true)
    const isZip = file.type.includes('zip') || file.name.toLowerCase().endsWith('.zip')
    if (isZip) {
      // Proofmode zip — GPS extracted server-side from proof.json
      setMapGpsStatus('found')
      setForm(f => ({ ...f, lat: 'zip', lng: 'zip' }))
      return
    }
    setMapGpsStatus('reading')
    try {
      const gps = await Exifr.gps(file)
      if (gps?.latitude && gps?.longitude) {
        setForm(f => ({ ...f, lat: String(gps.latitude), lng: String(gps.longitude) }))
        setMapGpsStatus('found')
      } else {
        setMapGpsStatus('none')
      }
    } catch { setMapGpsStatus('none') }
  }

  const detectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => { set('lat', pos.coords.latitude.toFixed(6)); set('lng', pos.coords.longitude.toFixed(6)); setLocating(false) },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          // Geolocation denied — user can enter coordinates manually
          set('lat', '')
          set('lng', '')
        }
        // For POSITION_UNAVAILABLE or TIMEOUT, silently fall back
      }
    )
  }

  const submitCamera = async () => {
    if (!form.photoFile) { return }
    setSubmitError(null)
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('cameraType', 'unknown')
      if (form.lat !== 'zip') fd.append('lat', form.lat)
      if (form.lng !== 'zip') fd.append('lng', form.lng)
      fd.append('notes', form.notes || '')
      fd.append('photo', form.photoFile)
      const res = await fetch(`${AI_URL}/sighting`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(data.error || `Server error ${res.status}`)
        setSubmitting(false)
        return
      }
      setSubmitted(true)
      setSightingVersion(v => v + 1) // refresh map layer
    } catch (err) {
      // submission error — silent fail, user sees form error state
      setSubmitError(`Network error: ${err.message}`)
    }
    setSubmitting(false)
  }

  const handleBoundsChange = useCallback((bounds, zoom) => {
    if (zoom < 9) return
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current)
    fetchTimeout.current = setTimeout(async () => {
      setLoading(true)
      try {
        const elements = await fetchOSMCameras(bounds)
        setOsmCameras(prev => {
          const ids = new Set(prev.map(c => c.id))
          const newOnes = elements.filter(e => !ids.has(e.id))
          return [...prev, ...newOnes]
        })
        setOsmCount(prev => Math.max(prev, elements.length))
      } catch (_) {}
      setLoading(false)
    }, 600)
  }, [])

  // Count community photos across all cameras
  const totalPhotos = Object.values(photoStore).reduce((sum, arr) => sum + arr.length, 0)
  const approvedPhotos = Object.values(photoStore).reduce((sum, arr) => sum + arr.filter(p => p.status === 'approved').length, 0)
  const pendingPhotos = totalPhotos - approvedPhotos

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '9px 12px', borderRadius: 7, fontSize: 13,
    outline: 'none', fontFamily: 'inherit',
  }

  const confirmed = verifiedCameras.filter(c => c.confirmed).length
  const unverified = verifiedCameras.filter(c => !c.confirmed).length

  return (
    <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Photo submit modal */}
      {showPhotoModal && (
        <PhotoSubmitModal
          camera={photoModalCamera}
          onClose={() => { setShowPhotoModal(false); setPhotoModalCamera(null) }}
          onSubmit={handlePhotoSubmit}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Surveillance Map</h2>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14, lineHeight: 1.6, maxWidth: 480 }}>
            Live ALPR data from OpenStreetMap — {cameraCount} cameras mapped by contributors worldwide.
            Zoom in to load cameras in any area. Every pin has a source.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--muted)', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              {confirmed} Verified
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f39c12', display: 'inline-block' }} />
              {unverified} Unverified
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e63946', display: 'inline-block' }} />
              OSM Live
            </span>
          </div>
          <button onClick={() => { setShowForm(!showForm); setSubmitted(false) }} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', border: 'none', color: '#fff',
            padding: '9px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            <Plus size={14} /> Submit Camera
          </button>
        </div>
      </div>

      {/* Community photo stats bar */}
      {totalPhotos > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 14,
          fontSize: 12, color: 'var(--muted)',
        }}>
          <Camera size={13} style={{ color: '#f59e0b' }} />
          <span><strong style={{ color: '#f59e0b' }}>{totalPhotos}</strong> community photo{totalPhotos > 1 ? 's' : ''} submitted</span>
          {approvedPhotos > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Eye size={11} style={{ color: '#10b981' }} /> <strong style={{ color: '#10b981' }}>{approvedPhotos}</strong> live on map
            </span>
          )}
          {pendingPhotos > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={11} style={{ color: '#f59e0b' }} /> <strong style={{ color: '#f59e0b' }}>{pendingPhotos}</strong> pending review
            </span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
            Click any camera pin → "Submit Photo" to contribute
          </span>
        </div>
      )}

      {/* Filter toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
          <Filter size={12} /> Filter:
        </div>
        {[['all','All Types'],['alpr','ALPR'],['anpr','ANPR'],['ptz','PTZ']].map(([val, label]) => (
          <button key={val} onClick={() => setTypeFilter(val)} style={{
            background: typeFilter === val ? 'var(--accent)' : 'var(--bg3)',
            border: `1px solid ${typeFilter === val ? 'var(--accent)' : 'var(--border)'}`,
            color: typeFilter === val ? '#fff' : 'var(--muted)',
            padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>{label}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: selectedState ? 'var(--text)' : 'var(--muted)',
                padding: '6px 28px 6px 10px', borderRadius: 7, fontSize: 12,
                outline: 'none', cursor: 'pointer', appearance: 'none',
              }}
            >
              <option value=''>Jump to state...</option>
              {Object.keys(STATE_BBOX).sort().map(st => (
                <option key={st} value={st}>{st}{stateCounts[st] ? ` — ${stateCounts[st].toLocaleString()}` : ''}</option>
              ))}
            </select>
            <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
          </div>
          <button onClick={() => setShowStatPanel(p => !p)} style={{
            background: showStatPanel ? 'rgba(230,57,70,0.15)' : 'var(--bg3)',
            border: `1px solid ${showStatPanel ? 'rgba(230,57,70,0.4)' : 'var(--border)'}`,
            color: showStatPanel ? 'var(--accent)' : 'var(--muted)',
            padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
          }}>By State</button>
        </div>
      </div>

      {/* State count panel */}
      {showStatPanel && Object.keys(stateCounts).length > 0 && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16, marginBottom: 12,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 6,
          maxHeight: 240, overflowY: 'auto',
        }}>
          {Object.entries(stateCounts).sort((a,b) => b[1]-a[1]).map(([st, cnt]) => (
            <button key={st} onClick={() => setSelectedState(st)} style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 7, padding: '7px 10px', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{st}</span>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{cnt.toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}

      {/* Layer toggle hint */}
      <div style={{
        background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 10,
        fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 14 }}>🔍</span>
        <span>
          <strong style={{ color: 'var(--text)' }}>6 surveillance layers available</strong> — click the{' '}
          <strong style={{ color: 'var(--text)' }}>Layers</strong> button in the top-right of the map to toggle
          Facial Recognition, Cell-Site Simulators, ShotSpotter, Police Drones, Predictive Policing, and Community Victories.
        </span>
      </div>

      {/* Source notice */}
      <div style={{
        background: 'rgba(52,152,219,0.05)', border: '1px solid rgba(52,152,219,0.15)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 16,
        fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        <CheckCircle size={14} style={{ color: '#5dade2', flexShrink: 0, marginTop: 1 }} />
        <span>
          Live camera data pulled from <strong style={{ color: 'var(--text)' }}>OpenStreetMap</strong> via Overpass API — {cameraCount} ALPR cameras mapped nationally.
          Zoom in to load cameras in any area.
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <a href="https://www.openstreetmap.org/edit" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            Add a camera <ExternalLink size={11} />
          </a>
          <a href="https://donate.openstreetmap.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            Support OSM <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Loading bar */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, color: 'var(--accent)' }}>
          <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
          Loading cameras in viewport from OpenStreetMap...
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {osmCameras.length === 0 && !loading && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Radio size={12} style={{ color: '#5dade2' }} />
          Zoom in to any US city to load live ALPR cameras from OpenStreetMap
        </div>
      )}

      {osmCameras.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, color: 'var(--muted)' }}>
          <Radio size={12} style={{ color: '#5dade2' }} />
          <span><strong style={{ color: 'var(--text)' }}>{osmCameras.length.toLocaleString()}</strong> cameras loaded in current view from OpenStreetMap</span>
        </div>
      )}

      {/* Submit camera form */}
      {showForm && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          {submitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--green)', fontWeight: 600 }}>
              <CheckCircle size={18} /> Verified and live on the map.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 13, marginBottom: 12 }}>
                <AlertCircle size={13} /> C2PA photo required — location is read from the photo automatically.
              </div>
              <div style={{ marginTop: 12 }}>
                <C2PAExplainer />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    background: form.photoFile ? 'rgba(241,196,15,0.1)' : 'var(--bg3)',
                    border: `1px solid ${form.photoFile ? 'rgba(241,196,15,0.4)' : 'var(--border)'}`,
                    padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    color: form.photoFile ? '#f1c40f' : 'var(--muted)',
                  }}>
                    <Upload size={14} />
                    {mapGpsStatus === 'reading' ? 'Reading GPS…'
                      : mapGpsStatus === 'found' ? (form.lat === 'zip' ? '📍 Proofmode bundle — GPS from proof.json' : `📍 GPS confirmed · ${parseFloat(form.lat).toFixed(5)}, ${parseFloat(form.lng).toFixed(5)}`)
                      : mapGpsStatus === 'none' ? '⚠️ No GPS in photo — try Proofmode'
                      : form.photoFile ? `🏆 ${form.photoFile.name}`
                      : 'Attach C2PA Photo or Proofmode ZIP'}
                    <input type="file" accept="image/*,application/zip,application/x-zip-compressed,.zip" style={{ display: 'none' }}
                      onChange={handleMapPhoto}
                    />
                  </label>
                  {mapGpsStatus === 'none' && (
                    <div style={{ fontSize: 11, color: '#f59e0b', padding: '6px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: 6, lineHeight: 1.5 }}>
                      No GPS found. Enable location in Proofmode before shooting, or use a Samsung Galaxy S24+ / Pixel 10.
                    </div>
                  )}
                  {mapGpsStatus === 'found' && (
                    <input style={{ ...inputStyle, fontSize: 12 }} placeholder="Notes (optional) — vendor, mounting, direction"
                      value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
                  )}
                  {submitError && (
                    <div style={{ fontSize: 12, color: 'var(--accent)', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 6, padding: '8px 12px' }}>
                      ⚠️ {submitError}
                    </div>
                  )}
                  <button onClick={submitCamera}
                    disabled={!form.photoFile || mapGpsStatus !== 'found' || submitting}
                    style={{
                      background: (form.photoFile && mapGpsStatus === 'found' && !submitting) ? 'var(--accent)' : 'var(--bg3)',
                      border: 'none',
                      color: (form.photoFile && mapGpsStatus === 'found' && !submitting) ? '#fff' : 'var(--muted)',
                      padding: '9px 18px', borderRadius: 7, fontWeight: 700, fontSize: 13,
                      cursor: (form.photoFile && mapGpsStatus === 'found' && !submitting) ? 'pointer' : 'not-allowed',
                    }}>
                    {submitting ? 'Uploading…' : 'Submit Verified Sighting'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Map */}
      <div className="map-container" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', height: 520, position: 'relative' }}>
        <MapContainer center={[38.5, -96.5]} zoom={4} style={{ height: '100%', width: '100%' }} zoomControl>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com">CARTO</a> | ALPR data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          />
          <MapEventHandler onBoundsChange={handleBoundsChange} />
          <ZoomToState target={selectedState} />

          {verifiedCameras.map(c => (
            <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={c.confirmed ? 10 : 8}
              pathOptions={{
                fillColor: c.confirmed ? '#e63946' : '#f39c12',
                fillOpacity: 0.95,
                color: c.confirmed ? 'rgba(230,57,70,0.4)' : 'rgba(243,156,18,0.4)',
                weight: 12,
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 230, padding: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{c.location}</div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Type: {c.type}</div>
                  {c.notes && <div style={{ fontSize: 12, color: '#555', marginBottom: 8, lineHeight: 1.5 }}>{c.notes}</div>}
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Reported: {c.reported}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.confirmed ? '#2ecc71' : '#f39c12', marginBottom: 6 }}>
                    {c.confirmed ? '✓ Confirmed — public records' : '⚠ Unverified — under review'}
                  </div>
                  {c.source && <div style={{ fontSize: 10, color: '#777', lineHeight: 1.4 }}>Source: {c.source}</div>}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          <OSMCanvasLayer cameras={filteredCameras} effLayers={EFF_LAYERS} activeLayers={activeLayers} dualVerifiedIds={dualVerifiedIds} osmCount={osmCount} communitySightings={communitySightings} />

          {/* Community sightings: only show Citeback-EXCLUSIVE cameras (red)
              Dual-verified ones are shown on the OSM layer as gold — no double markers */}
          {activeLayers.has('cb-exclusive') && communitySightings
            .filter(s => s.newCamera === true && s.lat && s.lng)
            .map((s, i) => (
            <CircleMarker
              key={`community-${i}`}
              center={[parseFloat(s.lat), parseFloat(s.lng)]}
              radius={9}
              pathOptions={{
                fillColor: '#f59e0b',
                fillOpacity: 0.9,
                color: 'rgba(245,158,11,0.5)',
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 230, padding: 4 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 5, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#f59e0b', marginBottom: 8, letterSpacing: '0.05em' }}>
                    ⭐ CITEBACK EXCLUSIVE
                  </div>
                  {s.photoFilename && (
                    <img
                      src={`https://ai.citeback.com/photos/${s.photoFilename}`}
                      alt="C2PA verified sighting"
                      style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }}
                    />
                  )}
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{CAMERA_TYPE_LABELS[s.cameraType] || s.cameraType}</div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>📍 {parseFloat(s.lat).toFixed(6)}, {parseFloat(s.lng).toFixed(6)}</div>
                  {s.notes && <div style={{ fontSize: 12, color: '#666', marginBottom: 6, lineHeight: 1.5 }}>{s.notes}</div>}
                  <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>★ Not in OpenStreetMap or any other database</div>
                  <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>🔒 C2PA cryptographically verified</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Non-ALPR surveillance overlay layers */}
          {EFF_LAYERS.filter(l => l.id !== 'alpr' && l.data && activeLayers.has(l.id)).map(layer =>
            layer.data.filter(a => a.status !== 'terminated').map((agency, i) => (
              <CircleMarker
                key={`${layer.id}-${i}`}
                center={[agency.lat, agency.lng]}
                radius={agency.status === 'terminated' ? 8 : 7}
                pathOptions={{
                  fillColor: agency.status === 'terminated' ? '#2ecc71' : layer.color,
                  fillOpacity: agency.status === 'terminated' ? 0.9 : 0.75,
                  color: agency.status === 'terminated' ? '#27ae60' : layer.color,
                  weight: agency.status === 'terminated' ? 2 : 1.5,
                  opacity: agency.status === 'terminated' ? 0.9 : 0.6,
                }}
              />
            ))
          )}
        </MapContainer>

        {/* Surveillance overlay toggle panel */}
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 800,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
        }}>
          <button
            onClick={() => setOverlayPanelOpen(o => !o)}
            title="Surveillance layer toggles"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: overlayPanelOpen ? 'rgba(168,85,247,0.12)' : 'var(--card-bg)',
              border: `1px solid ${overlayPanelOpen ? 'rgba(168,85,247,0.5)' : 'var(--border)'}`,
              color: overlayPanelOpen ? '#a855f7' : 'var(--fg)',
              padding: '7px 12px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            <Layers size={13} />
            Layers
            <span style={{
              background: 'rgba(168,85,247,0.25)', color: '#a855f7',
              borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700,
            }}>{activeLayers.size}</span>
          </button>

          {overlayPanelOpen && (
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 14, width: 260, maxWidth: 'calc(100vw - 20px)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              maxHeight: 460, overflowY: 'auto',
              scrollbarWidth: 'thin', scrollbarColor: 'var(--accent) transparent',
            }} className="layers-scroll">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Shield size={13} style={{ color: '#a855f7' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)', letterSpacing: '0.04em' }}>SURVEILLANCE LAYERS</span>
              </div>

              <LayerToggles activeLayers={activeLayers} setActiveLayers={setActiveLayers} showVictories={showVictories} setShowVictories={setShowVictories} communitySightings={communitySightings} dualVerifiedIds={dualVerifiedIds} osmCount={osmCount} />

              <div style={{
                marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)',
                fontSize: 10, color: 'var(--muted)', lineHeight: 1.6,
              }}>
                Sources:{' '}
                <a href="https://atlasofsurveillance.org/search" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#6b7280', textDecoration: 'underline' }}
                >EFF Atlas</a>
                {' · '}
                <a href="https://www.law.georgetown.edu/privacy-technology-center/publications/the-perpetual-line-up/" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#6b7280', textDecoration: 'underline' }}
                >Georgetown Law</a>
                {' · '}
                <a href="https://sls.eff.org/technologies/cell-site-simulators-imsi-catchers" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#6b7280', textDecoration: 'underline' }}
                >EFF/ACLU CSS</a>
                {' · '}
                <a href="https://dronecenter.bard.edu/projects/public-safety-drones-project/" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#6b7280', textDecoration: 'underline' }}
                >Bard Drone Ctr</a>
              </div>
            </div>
          )}
        </div>

          {/* Community Victories overlay — shown only when toggled on */}
          {showVictories && EFF_LAYERS.filter(l => l.id !== 'alpr' && l.data).map(layer =>
            layer.data.filter(a => a.status === 'terminated').map((agency, i) => (
              <CircleMarker
                key={`victory-${layer.id}-${i}`}
                center={[agency.lat, agency.lng]}
                radius={9}
                pathOptions={{ fillColor: '#2ecc71', fillOpacity: 0.92, color: '#27ae60', weight: 2, opacity: 1 }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 240, maxWidth: 300, padding: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#2ecc71', background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 4, padding: '2px 7px', marginBottom: 8, display: 'inline-block', letterSpacing: '0.08em' }}>✊ COMMUNITY VICTORY</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{agency.name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>📍 {agency.city}, {agency.state}</div>
                    <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}><strong>Was:</strong> {layer.label}</div>
                    {agency.vendor && <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}><strong>Vendor:</strong> {agency.vendor}</div>}
                    {agency.notes && <div style={{ fontSize: 11, color: '#444', background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 4, padding: '6px 8px', marginBottom: 8, lineHeight: 1.5 }}>{agency.notes}</div>}
                    {agency.url && <a href={agency.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#2ecc71', fontWeight: 600, textDecoration: 'none' }}>View source →</a>}
                  </div>
                </Popup>
              </CircleMarker>
            ))
          )}

        {/* Map attribution bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 800,
          background: 'rgba(8,6,4,0.75)',
          backdropFilter: 'blur(4px)',
          padding: '5px 12px',
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
          fontSize: 10, color: 'rgba(200,196,190,0.7)',
          pointerEvents: 'auto',
        }}>
          <span>Camera data:</span>
          <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(200,196,190,0.85)', textDecoration: 'underline' }}
          >OpenStreetMap contributors</a>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Surveillance tech:</span>
          <a href="https://atlasofsurveillance.org" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(200,196,190,0.85)', textDecoration: 'underline' }}
          >EFF Atlas of Surveillance</a>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Density:</span>
          <a href="https://deflock.me" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(200,196,190,0.85)', textDecoration: 'underline' }}
          >DeFlock</a>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{verifiedCameras.length + communitySightings.filter(s => s.newCamera === true).length}</span> Citeback-verified ·{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{osmCameras.length.toLocaleString()}</span> loaded · Zoom into any city for full detail
        </span>
        <span>Data: OpenStreetMap contributors (ODbL) · {cameraCount} mapped nationally</span>
      </div>
    </section>
  )
}
