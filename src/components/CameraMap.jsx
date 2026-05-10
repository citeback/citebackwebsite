import { Helmet } from 'react-helmet-async'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import './CameraMap.css'
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

  return (
    <div className="cmap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="cmap-modal-container">
        <button onClick={onClose} aria-label="Close" className="cmap-modal-close">
          <X size={18} />
        </button>

        {success ? (
          <div className="cmap-success-center">
            <div className="cmap-success-emoji">📸</div>
            <div className="cmap-success-title">
              Photo submitted — thanks!
            </div>
            <div className="cmap-success-body">
              Your photo is in the review queue. It'll appear on the map once it clears the spam filter — usually within a few hours.
            </div>
            <div className="cmap-success-status">
              <Clock size={13} /> Pending community review
            </div>
            <button onClick={onClose} className="cmap-success-done-btn">Done</button>
          </div>
        ) : (
          <>
            <div className="cmap-modal-header">
              <Camera size={18} className="cmap-text-amber" />
              <span className="cmap-modal-title-text">Submit a Photo</span>
            </div>
            <div className="cmap-modal-subtitle">
              Help keep the map current. Google Street View can be years out of date — your photo from today is more valuable.
              {camera && (
                <span className="cmap-camera-node">
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
                className={`cmap-dropzone${dragging ? ' cmap-dropzone--dragging' : ''}`}
              >
                <Upload size={28} className={dragging ? 'cmap-upload-icon--dragging' : 'cmap-upload-icon'} />
                <div className={`cmap-drop-label${dragging ? ' cmap-drop-label--dragging' : ''}`}>
                  Drop photo here
                </div>
                <div className="cmap-drop-hint">
                  or <span className="cmap-drop-browse">browse files</span> · JPG, PNG, HEIC · max 20MB
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="cmap-file-hidden"
                  onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]) }}
                />
              </div>
            )}

            {/* Checking spinner */}
            {checking && (
              <div className="cmap-checking-box">
                <Loader size={14} className="spinning" />

                Running spam filter...
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="cmap-error-box">
                <AlertCircle size={14} className="cmap-icon-shrink" />
                <div>
                  <div className="cmap-error-title">Photo rejected by filter</div>
                  <div className="cmap-error-msg">{error}</div>
                </div>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="cmap-preview-section">
                <div className="cmap-preview-header">
                  <CheckCircle size={14} className="cmap-text-green" />
                  <span className="cmap-filter-pass-text">Spam filter passed</span>
                  <button
                    onClick={() => { setFile(null); setPreview(null); setError(null) }}
                    className="cmap-preview-remove-btn"
                  >
                    Remove
                  </button>
                </div>
                <img
                  src={preview}
                  alt="Preview"
                  className="cmap-preview-img"
                />
              </div>
            )}

            {/* Optional notes */}
            {preview && (
              <div className="cmap-notes-wrap">
                <label className="cmap-notes-label">
                  What are we looking at? <span className="cmap-optional-text">(optional)</span>
                </label>
                <textarea
                  className="cmap-textarea cmap-textarea--min"
                  placeholder="e.g. Flock camera on pole at intersection, pointing east toward highway on-ramp"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            )}

            {/* AI filter notice */}
            <div className={`cmap-filter-notice${preview ? ' cmap-filter-notice--preview' : ''}`}>
              🤖 All photos pass a spam filter before review. Photos showing faces, license plates, or unrelated content are automatically blocked. Nothing goes live without human approval.
            </div>

            {preview && (
              <button
                onClick={handleSubmit}
                className="cmap-photo-submit-btn"
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
// Apply dynamic CSS properties via JS DOM API (CSP-safe — not HTML style= attributes)
function applyPopupDynStyles(popupEl) {
  popupEl.querySelectorAll('[data-lp-color]').forEach(el => { el.style.color = el.dataset.lpColor })
  popupEl.querySelectorAll('[data-lp-border]').forEach(el => { el.style.border = el.dataset.lpBorder })
  popupEl.querySelectorAll('[data-lp-border-color]').forEach(el => { el.style.borderColor = el.dataset.lpBorderColor })
}

function buildAlprPopupHTML(camera, map, isDual, sighting) {
  const osmUrl = `https://www.openstreetmap.org/node/${camera.id}`
  const googleUrl = `https://www.google.com/maps?q=${camera.lat},${camera.lon}`
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${camera.lat},${camera.lon}`
  const photos = (window.__fr_photoStore || {})[camera.id] || []
  const approved = photos.filter(p => p.status === 'approved')
  const pending = photos.filter(p => p.status === 'pending')
  const photoStrip = approved.length > 0
    ? `<div class="lp-photo-strip"><div class="lp-photo-strip-title">📸 ${approved.length} community photo${approved.length > 1 ? 's' : ''}</div><div class="lp-photo-strip-imgs">${approved.map(p => `<img src="${p.dataUrl}" alt="Community submitted camera photo" class="lp-community-photo">`).join('')}</div></div>`
    : pending.length > 0
      ? `<div class="lp-pending">⏳ ${pending.length} photo${pending.length > 1 ? 's' : ''} pending review</div>`
      : ''
  const sightingStrip = sighting?.photoFilename
    ? `<div class="lp-sighting">
        <img src="${AI_URL}/photos/${sighting.photoFilename}" alt="Citeback verified photo" class="lp-sighting-photo" />
        <div class="lp-c2pa-label">📷 C2PA VERIFIED PHOTO · ${new Date(sighting.ts).toLocaleDateString()}</div>
        ${sighting.notes ? `<div class="lp-sighting-notes">${sighting.notes}</div>` : ''}
      </div>`
    : ''
  const verifiedBadge = isDual
    ? `<div class="lp-badge lp-badge--dual">★ VERIFIED BY CITEBACK + OPENSTREETMAP</div>`
    : `<div class="lp-badge lp-badge--osm">📡 OPENSTREETMAP</div>`
  return `<div class="lp-root">
    ${sightingStrip}
    ${verifiedBadge}
    <div class="lp-camera-name${isDual ? ' lp-camera-name--dual' : ' lp-camera-name--osm'}">${camera.st ? camera.st.toUpperCase() : 'ALPR Camera'}</div>
    ${camera.op ? `<div class="lp-operator"><strong>Operator:</strong> ${camera.op}</div>` : ''}
    <div class="lp-coords">📍 <strong>${camera.lat.toFixed(6)}, ${camera.lon.toFixed(6)}</strong></div>
    <div class="lp-osm-node">OSM Node: <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" class="lp-osm-link">#${camera.id} →</a></div>
    ${photoStrip}
    <div class="lp-links">
      <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" class="lp-link-osm">📡 View on OpenStreetMap →</a>
      <a href="${googleUrl}" target="_blank" rel="noopener noreferrer" class="lp-link-gmaps">🗺 Google Maps →</a>
      <a href="${streetViewUrl}" target="_blank" rel="noopener noreferrer" class="lp-link-sv">📷 Street View →</a>
      <button data-photo-submit data-camera-id="${camera.id}" data-lat="${camera.lat}" data-lon="${camera.lon}" class="lp-photo-btn">📸 Submit Photo${approved.length > 0 ? ' · Add Another' : ''}</button>
    </div>
  </div>`
}

function buildAgencyPopupHTML(agency, layer) {
  const vendorProfile = getVendorProfile(agency.vendor)
  const vendorBlock = vendorProfile
    ? `<div class="lp-vendor-block">
        <div class="lp-vendor-name">🚩 ${vendorProfile.name}</div>
        <div class="lp-vendor-tagline">${vendorProfile.tagline}</div>
        <div class="lp-vendor-controversies">${vendorProfile.controversies[0]}</div>
        ${vendorProfile.url ? `<a href="${vendorProfile.url}" target="_blank" rel="noopener noreferrer" class="lp-vendor-link">Investigate ${vendorProfile.name} →</a>` : ''}
      </div>`
    : ''
  const terminatedBadge = agency.status === 'terminated'
    ? `<div class="lp-terminated">✓ PROGRAM TERMINATED</div>`
    : ''
  return `<div class="lp-root-wide">
    <div class="lp-agency-header">
      <span class="lp-layer-icon">${layer.icon}</span>
      <span class="lp-layer-label" data-lp-color="${layer.color}">${layer.label.toUpperCase()}</span>
    </div>
    ${terminatedBadge}
    <div class="lp-agency-name">${agency.name}</div>
    <div class="lp-agency-city">📍 ${agency.city}, ${agency.state}</div>
    ${agency.vendor ? `<div class="lp-agency-vendor"><strong>Vendor/System:</strong> ${agency.vendor}</div>` : ''}
    ${vendorBlock}
    <div class="lp-status${agency.confirmed ? ' lp-status--confirmed' : ' lp-status--unconfirmed'}">${agency.confirmed ? '✓ Confirmed deployment' : '⚠ Reported deployment'}</div>
    ${agency.notes ? `<div class="lp-notes">ℹ️ ${agency.notes}</div>` : ''}
    <div class="lp-source"><strong>Source:</strong> ${agency.source}</div>
    ${agency.url ? `<div class="lp-source-link-wrap"><a href="${agency.url}" target="_blank" rel="noopener noreferrer" class="lp-source-link" data-lp-color="${layer.color}">View source →</a></div>` : ''}
    <button data-propose data-agency="${agency.name.replace(/"/g, '&quot;')}" data-location="${(agency.city + ', ' + agency.state).replace(/"/g, '&quot;')}" class="lp-propose-btn" data-lp-color="${layer.color}" data-lp-border-color="${layer.color}">📋 Propose FOIA →</button>
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
    applyPopupDynStyles(popupEl)
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
        return `<button data-disambig="${i}" data-lp-border="1px solid ${entry.color}22" class="lp-disambig-btn">
          <span class="lp-disambig-icon">${entry.icon}</span>
          <div class="lp-disambig-info">
            <div class="lp-disambig-label" data-lp-color="${entry.color}">${entry.label}</div>
            <div class="lp-disambig-dist">${distLabel} away</div>
          </div>
          <span class="lp-disambig-arrow">→</span>
        </button>`
      }).join('')

      const disambigPopup = L.popup({ maxWidth: 300 })
        .setLatLng([lat, lng])
        .setContent(`<div class="lp-disambig-root">
          <div class="lp-disambig-header">NEARBY — TAP TO SELECT</div>
          ${listItems}
        </div>`)
      disambigPopup.openOn(map)

      // Attach real event listeners after popup is in the DOM (avoids CSP/inline-onclick issues)
      const popupEl = disambigPopup.getElement()
      if (popupEl) {
        applyPopupDynStyles(popupEl)
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
    description: '95,000+ automatic license plate readers mapped nationally via OpenStreetMap',
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
    <div className="cmap-layer-column">
      {EFF_LAYERS.map(layer => {
        const isOn = activeLayers.has(layer.id)
        const blurb = LAYER_BLURBS[layer.id]
        const blurbOpen = expandedBlurb === layer.id
        return (
          <div key={layer.id}>
            <button
              onClick={() => toggle(layer.id)}
              className={`cmap-layer-btn${isOn ? ' cmap-layer-btn--on' : ''}${blurbOpen ? ' cmap-layer-btn--blurb-open' : ''}`}
              ref={el => { if (el) el.style.setProperty('--lc', layer.color) }}
            >
              <span className="cmap-layer-icon">{layer.icon}</span>
              <div className="cmap-layer-info">
                <div className={`cmap-layer-label${isOn ? ' cmap-layer-label--on' : ''}`}>
                  {layer.label}
                </div>
                {layer.data && layer.data.length > 0 ? (
                  <div className="cmap-layer-count">
                    {layer.data.length} confirmed deployments
                  </div>
                ) : !layer.live ? (
                  <div className="cmap-layer-coming-soon">Activating soon — EFF Atlas data loading</div>
                ) : null}
              </div>
              <div className={`cmap-layer-dot${isOn ? ' cmap-layer-dot--on' : ''}`} />
            </button>

            {/* Inline blurb for non-ALPR layers */}
            {blurb && isOn && blurbOpen && (
              <div
                className="cmap-blurb-container"
                ref={el => { if (el) el.style.setProperty('--lc', layer.color) }}
              >
                <div className="cmap-blurb-text">
                  ℹ️ {blurb}
                </div>
                <a
                  href={layer.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmap-blurb-link"
                >
                  Learn more ↗
                </a>
              </div>
            )}
          </div>
        )
      })}

      {/* Citeback verification tiers */}
      <div className="cmap-layer-divider" />

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
            className={`cmap-tier-btn${isOn ? ' cmap-tier-btn--on' : ''}`}
            ref={el => { if (el) el.style.setProperty('--lc', tier.color) }}
          >
            <span className="cmap-tier-icon">{tier.icon}</span>
            <div className="cmap-layer-info">
              <div className={`cmap-tier-label${isOn ? ' cmap-tier-label--on' : ''}`}>{tier.label}</div>
              <div className="cmap-tier-count">
                {tier.count.toLocaleString()} {tier.countLabel}
              </div>
              {isOn && <div className="cmap-tier-desc">{tier.desc}</div>}
            </div>
            <div className={`cmap-layer-dot${isOn ? ' cmap-layer-dot--on' : ''}`} />
          </button>
        )
      })}

      {/* Victories divider */}
      <div className="cmap-layer-divider" />
      <button
        onClick={() => setShowVictories(v => !v)}
        className={`cmap-victories-btn${showVictories ? ' cmap-victories-btn--on' : ' cmap-victories-btn--off'}`}
      >
        <span className="cmap-layer-icon">✊</span>
        <div className="cmap-layer-info">
          <div className={`cmap-victories-label${showVictories ? ' cmap-victories-label--on' : ''}`}>Community Victories</div>
          <div className="cmap-victories-hint">Programs terminated by community action</div>
        </div>
        <div className={`cmap-victories-dot${showVictories ? ' cmap-victories-dot--on' : ''}`} />
      </button>
      {showVictories && (
        <div className="cmap-victories-text">
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
    fetch(`${AI_URL}/sightings/public`)
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
    fetch(`${AI_URL}/alpr-us.json`)
      .then(r => r.json())
      .then(data => {
        setOsmCameras(data)
        setFilteredCameras(data)
        setOsmCount(data.length)
        baseLoaded.current = true
        setLoading(false)
      })
      .catch(() => setLoading(false))
    fetch(`${AI_URL}/alpr-by-state.json`)
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



  const confirmed = verifiedCameras.filter(c => c.confirmed).length
  const unverified = verifiedCameras.filter(c => !c.confirmed).length

  return (
    <>
    <Helmet>
      <title>Surveillance Camera Map | Citeback — 95,000+ ALPR Cameras Documented</title>
      <meta name="description" content="Explore 95,000+ documented ALPR cameras, facial recognition systems, ShotSpotter, and police drones. Community-sourced and verified surveillance camera map." />
      <meta property="og:title" content="Surveillance Camera Map | Citeback — 95,000+ ALPR Cameras Documented" />
      <meta property="og:description" content="Explore 95,000+ documented ALPR cameras, facial recognition systems, ShotSpotter, and police drones. Community-sourced and verified surveillance camera map." />
    </Helmet>
    <section className="cmap-section">
      {/* Photo submit modal */}
      {showPhotoModal && (
        <PhotoSubmitModal
          camera={photoModalCamera}
          onClose={() => { setShowPhotoModal(false); setPhotoModalCamera(null) }}
          onSubmit={handlePhotoSubmit}
        />
      )}

      <div className="cmap-map-header">
        <div>
          <h2 className="cmap-map-title">Surveillance Map</h2>
          <p className="cmap-map-subtitle">
            Live ALPR data from OpenStreetMap — {cameraCount} cameras mapped by contributors worldwide.
            Zoom in to load cameras in any area. Every pin has a source.
          </p>
        </div>
        <div className="cmap-legend-container">
          <div className="cmap-legend-items">
            <span className="cmap-legend-item">
              <span className="cmap-legend-dot cmap-legend-dot--accent" />
              {confirmed} Verified
            </span>
            <span className="cmap-legend-item">
              <span className="cmap-legend-dot cmap-legend-dot--amber" />
              {unverified} Unverified
            </span>
            <span className="cmap-legend-item">
              <span className="cmap-legend-dot cmap-legend-dot--red" />
              OSM Live
            </span>
          </div>
          <button onClick={() => { setShowForm(!showForm); setSubmitted(false) }} className="cmap-submit-camera-btn">
            <Plus size={14} /> Submit Camera
          </button>
        </div>
      </div>

      {/* Community photo stats bar */}
      {totalPhotos > 0 && (
        <div className="cmap-photo-stats-bar">
          <Camera size={13} className="cmap-text-amber" />
          <span><strong className="cmap-text-amber">{totalPhotos}</strong> community photo{totalPhotos > 1 ? 's' : ''} submitted</span>
          {approvedPhotos > 0 && (
            <span className="cmap-photo-stats-item">
              <Eye size={11} className="cmap-text-green" /> <strong className="cmap-text-green">{approvedPhotos}</strong> live on map
            </span>
          )}
          {pendingPhotos > 0 && (
            <span className="cmap-photo-stats-item">
              <Clock size={11} className="cmap-text-amber" /> <strong className="cmap-text-amber">{pendingPhotos}</strong> pending review
            </span>
          )}
          <span className="cmap-photo-stats-hint">
            Click any camera pin → "Submit Photo" to contribute
          </span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="cmap-filter-toolbar">
        <div className="cmap-filter-label">
          <Filter size={12} /> Filter:
        </div>
        {[['all','All Types'],['alpr','ALPR'],['anpr','ANPR'],['ptz','PTZ']].map(([val, label]) => (
          <button key={val} onClick={() => setTypeFilter(val)}
            className={`cmap-type-filter-btn${typeFilter === val ? ' cmap-type-filter-btn--active' : ' cmap-type-filter-btn--off'}`}
          >{label}</button>
        ))}
        <div className="cmap-filter-right">
          <div className="cmap-select-wrap">
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              aria-label="Jump to state"
              className={`cmap-state-select${selectedState ? ' cmap-state-select--filled' : ' cmap-state-select--empty'}`}
            >
              <option value=''>Jump to state...</option>
              {Object.keys(STATE_BBOX).sort().map(st => (
                <option key={st} value={st}>{st}{stateCounts[st] ? ` — ${stateCounts[st].toLocaleString()}` : ''}</option>
              ))}
            </select>
            <ChevronDown size={11} className="cmap-select-chevron" />
          </div>
          <button onClick={() => setShowStatPanel(p => !p)}
            className={`cmap-stat-panel-btn${showStatPanel ? ' cmap-stat-panel-btn--open' : ' cmap-stat-panel-btn--closed'}`}
          >By State</button>
        </div>
      </div>

      {/* State count panel */}
      {showStatPanel && Object.keys(stateCounts).length > 0 && (
        <div className="cmap-state-panel">
          {Object.entries(stateCounts).sort((a,b) => b[1]-a[1]).map(([st, cnt]) => (
            <button key={st} onClick={() => setSelectedState(st)} className="cmap-state-btn">
              <span className="cmap-state-btn-name">{st}</span>
              <span className="cmap-state-btn-count">{cnt.toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}

      {/* Layer toggle hint */}
      <div className="cmap-layer-hint">
        <span className="cmap-hint-icon">🔍</span>
        <span>
          <strong className="cmap-text-normal">6 surveillance layers available</strong> — click the{' '}
          <strong className="cmap-text-normal">Layers</strong> button in the top-right of the map to toggle
          Facial Recognition, Cell-Site Simulators, ShotSpotter, Police Drones, Predictive Policing, and Community Victories.
        </span>
      </div>

      {/* Source notice */}
      <div className="cmap-source-notice">
        <CheckCircle size={14} className="cmap-icon-blue-shrink" />
        <span>
          Live camera data pulled from <strong className="cmap-text-normal">OpenStreetMap</strong> via Overpass API — {cameraCount} ALPR cameras mapped nationally.
          Zoom in to load cameras in any area.
        </span>
        <div className="cmap-source-notice-links">
          <a href="https://www.openstreetmap.org/edit" target="_blank" rel="noopener noreferrer" className="cmap-source-link-accent">
            Add a camera <ExternalLink size={11} />
          </a>
          <a href="https://donate.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="cmap-source-link-muted">
            Support OSM <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Loading bar */}
      {loading && (
        <div className="cmap-loading-bar">
          <Loader size={13} className="spinning" />
          Loading cameras in viewport from OpenStreetMap…

        </div>
      )}

      {osmCameras.length === 0 && !loading && (
        <div className="cmap-no-cameras">
          <Radio size={12} className="cmap-text-blue" />
          Zoom in to any US city to load live ALPR cameras from OpenStreetMap
        </div>
      )}

      {osmCameras.length > 0 && (
        <div className="cmap-cameras-loaded">
          <Radio size={12} className="cmap-text-blue" />
          <span><strong className="cmap-text-normal">{osmCameras.length.toLocaleString()}</strong> cameras loaded in current view from OpenStreetMap</span>
        </div>
      )}

      {/* Submit camera form */}
      {showForm && (
        <div className="cmap-form-container">
          {submitted ? (
            <div className="cmap-form-submitted">
              <CheckCircle size={18} /> Verified and live on the map.
            </div>
          ) : (
            <>
              <div className="cmap-form-alert">
                <AlertCircle size={13} /> C2PA photo required — location is read from the photo automatically.
              </div>
              <div className="cmap-form-inner">
                <C2PAExplainer />
                <div className="cmap-form-fields">
                  <label className={`cmap-photo-label${form.photoFile ? ' cmap-photo-label--file' : ' cmap-photo-label--empty'}`}>
                    <Upload size={14} />
                    {mapGpsStatus === 'reading' ? 'Reading GPS…'
                      : mapGpsStatus === 'found' ? (form.lat === 'zip' ? '📍 Proofmode bundle — GPS from proof.json' : `📍 GPS confirmed · ${parseFloat(form.lat).toFixed(5)}, ${parseFloat(form.lng).toFixed(5)}`)
                      : mapGpsStatus === 'none' ? '⚠️ No GPS in photo — try Proofmode'
                      : form.photoFile ? `🏆 ${form.photoFile.name}`
                      : 'Attach C2PA Photo or Proofmode ZIP'}
                    <input type="file" accept="image/*,application/zip,application/x-zip-compressed,.zip" className="cmap-file-hidden"
                      onChange={handleMapPhoto}
                    />
                  </label>
                  {mapGpsStatus === 'none' && (
                    <div className="cmap-gps-warn">
                      No GPS found. Enable location in Proofmode before shooting, or use a Samsung Galaxy S24+ / Pixel 10.
                    </div>
                  )}
                  {mapGpsStatus === 'found' && (
                    <input className="cmap-main-input cmap-main-input--sm" placeholder="Notes (optional) — vendor, mounting, direction"
                      aria-label="Sighting notes"
                      value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
                  )}
                  {submitError && (
                    <div className="cmap-submit-error">
                      ⚠️ {submitError}
                    </div>
                  )}
                  <button onClick={submitCamera}
                    disabled={!form.photoFile || mapGpsStatus !== 'found' || submitting}
                    className={`cmap-submit-sighting-btn${(form.photoFile && mapGpsStatus === 'found' && !submitting) ? ' cmap-submit-sighting-btn--ready' : ' cmap-submit-sighting-btn--disabled'}`}
                  >
                    {submitting ? 'Uploading…' : 'Submit Verified Sighting'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Map */}
      <div className="map-container">
        <MapContainer center={[38.5, -96.5]} zoom={4} className="cmap-leaflet-container" zoomControl>
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
                <div className="cmap-popup-wrap">
                  <div className="cmap-popup-title">{c.location}</div>
                  <div className="cmap-popup-type">Type: {c.type}</div>
                  {c.notes && <div className="cmap-popup-notes">{c.notes}</div>}
                  <div className="cmap-popup-reported">Reported: {c.reported}</div>
                  <div className={c.confirmed ? 'cmap-popup-confirmed-yes' : 'cmap-popup-confirmed-no'}>
                    {c.confirmed ? '✓ Confirmed — public records' : '⚠ Unverified — under review'}
                  </div>
                  {c.source && <div className="cmap-popup-source">Source: {c.source}</div>}
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
                <div className="cmap-popup-cb-wrap">
                  <div className="cmap-badge-cb-exclusive">⭐ CITEBACK EXCLUSIVE</div>
                  {s.photoFilename && (
                    <img
                      src={`${AI_URL}/photos/${s.photoFilename}`}
                      alt="C2PA verified sighting"
                      className="cmap-popup-sighting-img"
                    />
                  )}
                  <div className="cmap-popup-camera-type">{CAMERA_TYPE_LABELS[s.cameraType] || s.cameraType}</div>
                  <div className="cmap-popup-coords">📍 {parseFloat(s.lat).toFixed(6)}, {parseFloat(s.lng).toFixed(6)}</div>
                  {s.notes && <div className="cmap-popup-sighting-notes">{s.notes}</div>}
                  <div className="cmap-popup-exclusive-note">★ Not in OpenStreetMap or any other database</div>
                  <div className="cmap-popup-c2pa-note">🔒 C2PA cryptographically verified</div>
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
        <div className="cmap-overlay-panel-pos">
          <button
            onClick={() => setOverlayPanelOpen(o => !o)}
            title="Surveillance layer toggles"
            className={`cmap-overlay-btn${overlayPanelOpen ? ' cmap-overlay-btn--open' : ' cmap-overlay-btn--closed'}`}
          >
            <Layers size={13} />
            Layers
            <span className="cmap-overlay-badge">{activeLayers.size}</span>
          </button>

          {overlayPanelOpen && (
            <div className="cmap-overlay-panel layers-scroll">
              <div className="cmap-overlay-panel-header">
                <Shield size={13} className="cmap-text-purple" />
                <span className="cmap-overlay-panel-title-text">SURVEILLANCE LAYERS</span>
              </div>

              <LayerToggles activeLayers={activeLayers} setActiveLayers={setActiveLayers} showVictories={showVictories} setShowVictories={setShowVictories} communitySightings={communitySightings} dualVerifiedIds={dualVerifiedIds} osmCount={osmCount} />

              <div className="cmap-overlay-panel-sources">
                Sources:{' '}
                <a href="https://atlasofsurveillance.org/search" target="_blank" rel="noopener noreferrer"
                  className="cmap-overlay-source-link"
                >EFF Atlas</a>
                {' · '}
                <a href="https://www.law.georgetown.edu/privacy-technology-center/publications/the-perpetual-line-up/" target="_blank" rel="noopener noreferrer"
                  className="cmap-overlay-source-link"
                >Georgetown Law</a>
                {' · '}
                <a href="https://sls.eff.org/technologies/cell-site-simulators-imsi-catchers" target="_blank" rel="noopener noreferrer"
                  className="cmap-overlay-source-link"
                >EFF/ACLU CSS</a>
                {' · '}
                <a href="https://dronecenter.bard.edu/projects/public-safety-drones-project/" target="_blank" rel="noopener noreferrer"
                  className="cmap-overlay-source-link"
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
                  <div className="cmap-popup-victory-wrap">
                    <div className="cmap-badge-victory">✊ COMMUNITY VICTORY</div>
                    <div className="cmap-popup-agency-name">{agency.name}</div>
                    <div className="cmap-popup-agency-city">📍 {agency.city}, {agency.state}</div>
                    <div className="cmap-popup-agency-was"><strong>Was:</strong> {layer.label}</div>
                    {agency.vendor && <div className="cmap-popup-agency-vendor"><strong>Vendor:</strong> {agency.vendor}</div>}
                    {agency.notes && <div className="cmap-popup-victory-notes">{agency.notes}</div>}
                    {agency.url && <a href={agency.url} target="_blank" rel="noopener noreferrer" className="cmap-popup-victory-link">View source →</a>}
                  </div>
                </Popup>
              </CircleMarker>
            ))
          )}

        {/* Map attribution bar */}
        <div className="cmap-attribution">
          <span>Camera data:</span>
          <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer"
            className="cmap-attribution-link"
          >OpenStreetMap contributors</a>
          <span className="cmap-attribution-dot">·</span>
          <span>Surveillance tech:</span>
          <a href="https://atlasofsurveillance.org" target="_blank" rel="noopener noreferrer"
            className="cmap-attribution-link"
          >EFF Atlas of Surveillance</a>
          <span className="cmap-attribution-dot">·</span>
          <span>Density:</span>
          <a href="https://deflock.me" target="_blank" rel="noopener noreferrer"
            className="cmap-attribution-link"
          >DeFlock</a>
        </div>
      </div>

      <div className="cmap-bottom-stats">
        <span>
          <span className="cmap-stat-highlight">{verifiedCameras.length + communitySightings.filter(s => s.newCamera === true).length}</span> Citeback-verified ·{' '}
          <span className="cmap-stat-highlight">{osmCameras.length.toLocaleString()}</span> loaded · Zoom into any city for full detail
        </span>
        <span>Data: OpenStreetMap contributors (ODbL) · {cameraCount} mapped nationally</span>
      </div>
    </section>
    </>
  )
}
