/**
 * CameraCapture.jsx — Full-screen native camera for CiteBack
 *
 * Mobile-first design:
 *   • Fills the entire screen (position: fixed, z-index: 99999)
 *   • Controls overlaid ON the video — never off-screen
 *   • Pinch-to-zoom + tap +/− buttons
 *   • Native track zoom (Android) with CSS-scale fallback (iOS)
 *   • Safe-area insets for notch / home bar
 *   • Props: onCapture(blob, {lat,lng}), onClose(), cameraHint
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, RefreshCw, ShieldCheck, AlertCircle, Loader } from 'lucide-react'
import { API_BASE as AI_URL } from '../config.js'

const SIGN_URL = AI_URL + '/api/capture/sign'

export default function CameraCapture({ onCapture, onClose, cameraHint = 'Surveillance Camera' }) {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const streamRef   = useRef(null)
  const trackRef    = useRef(null)
  const pinchRef    = useRef({ active: false, startDist: 0, startZoom: 1 })
  const zoomTimerRef = useRef(null)

  const [phase, setPhase]           = useState('init')       // init | viewfinder | captured | signing | done | error
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [capturedURL, setCapturedURL]   = useState(null)
  const [gps, setGps]               = useState(null)
  const [gpsStatus, setGpsStatus]   = useState('waiting')    // waiting | found | denied | timeout
  const [facingMode, setFacingMode] = useState('environment')
  const [error, setError]           = useState(null)
  const [zoom, setZoom]             = useState(1)
  const [showZoomHint, setShowZoomHint] = useState(false)
  const [nativeZoomRange, setNativeZoomRange] = useState(null)  // { min, max } if device supports it

  // ── Apply zoom ────────────────────────────────────────────────────────────
  const applyZoom = useCallback((raw) => {
    const clamped = Math.min(Math.max(raw, 1), nativeZoomRange ? nativeZoomRange.max : 5)
    setZoom(clamped)
    // Show hint briefly
    clearTimeout(zoomTimerRef.current)
    setShowZoomHint(true)
    zoomTimerRef.current = setTimeout(() => setShowZoomHint(false), 1200)

    // Try native track zoom (Android Chrome / some desktop)
    const track = trackRef.current
    if (track) {
      try {
        const caps = track.getCapabilities?.()
        if (caps?.zoom) {
          track.applyConstraints({ advanced: [{ zoom: clamped }] }).catch(() => {})
          return
        }
      } catch (_) {}
    }

    // CSS transform fallback (iOS Safari)
    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${clamped})`
      videoRef.current.style.transformOrigin = 'center center'
    }
  }, [nativeZoomRange])

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async (facing) => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing ?? facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      const track = stream.getVideoTracks()[0]
      trackRef.current = track

      // Detect native zoom support
      try {
        const caps = track.getCapabilities?.()
        if (caps?.zoom) setNativeZoomRange({ min: caps.zoom.min ?? 1, max: caps.zoom.max ?? 5 })
      } catch (_) {}

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.style.transform = 'scale(1)'
        await videoRef.current.play().catch(() => {})
      }
      setZoom(1)
      setPhase('viewfinder')
      setError(null)
    } catch (e) {
      setError(
        e.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access in your browser or device settings.'
          : `Could not open camera: ${e.message}`
      )
      setPhase('error')
    }
  }, [facingMode])

  // ── GPS ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return }
    const id = navigator.geolocation.watchPosition(
      pos => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus('found') },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
    const t = setTimeout(() => setGpsStatus(s => s === 'waiting' ? 'timeout' : s), 15000)
    return () => { navigator.geolocation.clearWatch(id); clearTimeout(t) }
  }, [])

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    startCamera(facingMode)
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      clearTimeout(zoomTimerRef.current)
      if (capturedURL) URL.revokeObjectURL(capturedURL)
    }
  }, []) // eslint-disable-line

  // Prevent body scroll while camera is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── Pinch-to-zoom ─────────────────────────────────────────────────────────
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = { active: true, startDist: Math.hypot(dx, dy), startZoom: zoom }
    }
  }
  function onTouchMove(e) {
    if (!pinchRef.current.active || e.touches.length !== 2) return
    e.preventDefault()
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const ratio = Math.hypot(dx, dy) / pinchRef.current.startDist
    applyZoom(pinchRef.current.startZoom * ratio)
  }
  function onTouchEnd() { pinchRef.current.active = false }

  // ── Flip ──────────────────────────────────────────────────────────────────
  function flip() {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    startCamera(next)
  }

  // ── Capture ───────────────────────────────────────────────────────────────
  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width  = video.videoWidth  || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')

    // If using CSS-scale zoom, crop to the zoomed region so the photo matches what was seen
    if (zoom > 1 && !nativeZoomRange) {
      const sw = canvas.width / zoom
      const sh = canvas.height / zoom
      const sx = (canvas.width - sw) / 2
      const sy = (canvas.height - sh) / 2
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    } else {
      ctx.drawImage(video, 0, 0)
    }

    streamRef.current?.getTracks().forEach(t => t.stop())

    canvas.toBlob(blob => {
      if (!blob) { setError('Could not capture frame'); return }
      const url = URL.createObjectURL(blob)
      setCapturedBlob(blob)
      setCapturedURL(url)
      setPhase('captured')
    }, 'image/jpeg', 0.92)
  }

  // ── Sign & deliver ────────────────────────────────────────────────────────
  async function signAndSubmit() {
    if (!capturedBlob) return
    setPhase('signing')
    const fd = new FormData()
    fd.append('photo', capturedBlob, 'citeback-capture.jpg')
    fd.append('timestamp', new Date().toISOString())
    fd.append('cameraHint', cameraHint)
    if (gps) { fd.append('lat', String(gps.lat)); fd.append('lng', String(gps.lng)) }

    try {
      const res = await fetch(SIGN_URL, { method: 'POST', body: fd, credentials: 'include' })
      if (!res.ok) throw new Error('Sign failed')
      const signed = await res.blob()
      onCapture(new File([signed], 'citeback-c2pa.jpg', { type: 'image/jpeg' }), gps)
    } catch (e) {
      console.warn('[CameraCapture] Signing failed, delivering unsigned:', e.message)
      onCapture(new File([capturedBlob], 'citeback-capture.jpg', { type: 'image/jpeg' }), gps)
    }
  }

  // ── Retake ────────────────────────────────────────────────────────────────
  function retake() {
    if (capturedURL) URL.revokeObjectURL(capturedURL)
    setCapturedBlob(null)
    setCapturedURL(null)
    startCamera(facingMode)
  }

  // ── GPS indicator ─────────────────────────────────────────────────────────
  const gpsIndicator =
    gpsStatus === 'found'    ? { dot: 'cc2-dot cc2-dot--green', label: 'GPS ✓' } :
    gpsStatus === 'denied'   ? { dot: 'cc2-dot cc2-dot--red',   label: 'No GPS' } :
                               { dot: 'cc2-dot cc2-dot--amber',  label: 'GPS…' }

  const content = (
    <>
      {/* ── Full-screen container ── */}
      <div
        className="cc2-root"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <canvas ref={canvasRef} className="cc2-hidden" />

        {/* Live video */}
        {(phase === 'viewfinder' || phase === 'init') && (
          <video
            ref={videoRef}
            playsInline muted autoPlay
            className="cc2-video"
          />
        )}

        {/* Captured preview */}
        {capturedURL && (phase === 'captured' || phase === 'signing') && (
          <img src={capturedURL} alt="Preview" className="cc2-video" />
        )}

        {/* Error state */}
        {phase === 'error' && (
          <div className="cc2-error">
            <AlertCircle size={44} />
            <p>{error}</p>
            <button className="cc2-err-btn" onClick={onClose}>Close</button>
          </div>
        )}

        {/* Signing overlay */}
        {phase === 'signing' && (
          <div className="cc2-overlay-center">
            <Loader size={36} className="cc2-spin" />
            <p>Signing with C2PA…</p>
          </div>
        )}

        {/* Zoom label (appears briefly) */}
        {showZoomHint && (
          <div className="cc2-zoom-hint">{zoom.toFixed(1)}×</div>
        )}

        {/* ── TOP BAR ── */}
        <div className="cc2-top-bar">
          <button className="cc2-icon-btn" onClick={onClose} aria-label="Close camera">
            <X size={22} />
          </button>

          <div className="cc2-badge-c2pa">
            <ShieldCheck size={12} />
            C2PA
          </div>

          <div className="cc2-gps-pill">
            <span className={gpsIndicator.dot} />
            <span className="cc2-gps-text">{gpsIndicator.label}</span>
          </div>
        </div>

        {/* ── BOTTOM BAR — viewfinder ── */}
        {phase === 'viewfinder' && (
          <div className="cc2-bottom-bar">
            {/* Zoom out */}
            <button
              className="cc2-icon-btn cc2-zoom-btn cc2-zoomout-pos"
              onClick={() => applyZoom(Math.max(1, zoom - 0.5))}
              aria-label="Zoom out"
            >
              <span className="cc2-zoom-sym">−</span>
            </button>

            {/* Shutter — absolutely centered like native iOS camera */}
            <button className="cc2-shutter" onClick={capture} aria-label="Take photo">
              <span className="cc2-shutter-inner" />
            </button>

            {/* Flip */}
            <button className="cc2-icon-btn cc2-flip-pos" onClick={flip} aria-label="Flip camera">
              <RefreshCw size={20} />
            </button>
          </div>
        )}

        {/* ── BOTTOM BAR — captured ── */}
        {phase === 'captured' && (
          <div className="cc2-bottom-bar cc2-bottom-bar--preview">
            <button className="cc2-retake-btn" onClick={retake}>Retake</button>
            <button className="cc2-use-btn" onClick={signAndSubmit}>
              <ShieldCheck size={16} />
              Use Photo
            </button>
          </div>
        )}

        {/* Zoom +/- hint overlay (viewfinder only) */}
        {phase === 'viewfinder' && zoom > 1 && (
          <div className="cc2-zoom-bar">
            <button
              className="cc2-zoom-step-btn"
              onClick={() => applyZoom(Math.max(1, zoom - 0.5))}
              aria-label="Zoom out"
            >−</button>
            <span className="cc2-zoom-bar-val">{zoom.toFixed(1)}×</span>
            <button
              className="cc2-zoom-step-btn"
              onClick={() => applyZoom(Math.min(nativeZoomRange?.max ?? 5, zoom + 0.5))}
              aria-label="Zoom in"
            >+</button>
          </div>
        )}
      </div>

      {/* ── Styles (scoped, no external file needed) ── */}
      <style>{`
        /* Root — true full-screen, above everything including nav */
        .cc2-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #000;
          touch-action: none;
          -webkit-user-select: none;
          user-select: none;
          overflow: hidden;
        }

        /* Video fills screen */
        .cc2-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform-origin: center center;
          will-change: transform;
        }

        .cc2-hidden { display: none; }

        /* Error */
        .cc2-error {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: #f87171;
          padding: 32px;
          text-align: center;
          font-size: 15px;
          line-height: 1.5;
        }
        .cc2-err-btn {
          margin-top: 8px;
          padding: 12px 28px;
          background: #1e2030;
          color: #e2e8f0;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          cursor: pointer;
        }

        /* Signing overlay */
        .cc2-overlay-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: rgba(0,0,0,0.65);
          color: #a5b4fc;
          font-size: 15px;
          z-index: 20;
        }

        /* Zoom hint — fades in the center */
        .cc2-zoom-hint {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.55);
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 12px;
          pointer-events: none;
          z-index: 30;
          animation: cc2-zoom-fade 1.2s ease forwards;
        }
        @keyframes cc2-zoom-fade {
          0%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }

        /* ─ TOP BAR ─ */
        .cc2-top-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          padding: max(env(safe-area-inset-top, 0px) + 12px, 20px) 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%);
          z-index: 10;
        }
        .cc2-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
        }
        .cc2-badge-c2pa {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6ee7b7;
          font-size: 12px;
          font-weight: 700;
          background: rgba(0,0,0,0.45);
          padding: 5px 12px;
          border-radius: 20px;
          letter-spacing: 0.03em;
        }
        .cc2-gps-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.45);
          padding: 5px 12px;
          border-radius: 20px;
        }
        .cc2-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .cc2-dot--green { background: #10b981; }
        .cc2-dot--red   { background: #ef4444; }
        .cc2-dot--amber {
          background: #f59e0b;
          animation: cc2-pulse 1.2s ease infinite;
        }
        @keyframes cc2-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        .cc2-gps-text {
          font-size: 11px;
          font-weight: 600;
          color: #e2e8f0;
        }

        /* ─ BOTTOM BAR ─ */
        /* Viewfinder mode: fixed-height strip, children absolutely positioned so
           the shutter is PERFECTLY centered horizontally (native camera style). */
        .cc2-bottom-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 140px;
          padding-bottom: max(env(safe-area-inset-bottom, 0px), 16px);
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
          z-index: 10;
        }
        .cc2-bottom-bar--preview {
          height: auto;
          padding: 20px 32px max(calc(env(safe-area-inset-bottom, 0px) + 20px), 32px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        /* Shutter — dead center at the bottom */
        .cc2-shutter {
          position: absolute;
          left: 50%;
          bottom: max(calc(env(safe-area-inset-bottom, 0px) + 24px), 32px);
          transform: translateX(-50%);
          width: 70px; height: 70px;
          border-radius: 50%;
          border: 4px solid rgba(255,255,255,0.85);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.1s;
          flex-shrink: 0;
        }
        .cc2-shutter:active { transform: translateX(-50%) scale(0.88); }
        .cc2-shutter-inner {
          display: block;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
        }

        /* Side buttons — independently positioned so they never push the shutter */
        .cc2-flip-pos {
          position: absolute;
          right: 32px;
          bottom: max(calc(env(safe-area-inset-bottom, 0px) + 38px), 46px);
        }
        .cc2-zoomout-pos {
          position: absolute;
          left: 32px;
          bottom: max(calc(env(safe-area-inset-bottom, 0px) + 38px), 46px);
        }

        /* Zoom button (−/+) */
        .cc2-zoom-btn {
          background: rgba(0,0,0,0.45);
        }
        .cc2-zoom-sym {
          font-size: 24px;
          font-weight: 300;
          line-height: 1;
          color: #fff;
        }

        /* Preview mode buttons */
        .cc2-retake-btn {
          padding: 14px 28px;
          background: rgba(15,17,27,0.85);
          color: #94a3b8;
          border: 1px solid rgba(100,116,139,0.35);
          border-radius: 50px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .cc2-use-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 30px;
          background: #10b981;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        /* Zoom bar (shown while zoomed in) */
        .cc2-zoom-bar {
          position: absolute;
          bottom: calc(max(env(safe-area-inset-bottom, 0px) + 20px, 32px) + 96px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0,0,0,0.5);
          padding: 6px 16px;
          border-radius: 30px;
          z-index: 10;
        }
        .cc2-zoom-step-btn {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          font-size: 20px;
          font-weight: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .cc2-zoom-bar-val {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          min-width: 36px;
          text-align: center;
        }

        /* Spinner */
        @keyframes cc2-spin { to { transform: rotate(360deg); } }
        .cc2-spin { animation: cc2-spin 1s linear infinite; }
      `}</style>
    </>
  )

  return createPortal(content, document.body)
}
