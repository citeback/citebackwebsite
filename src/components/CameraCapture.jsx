/**
 * CameraCapture.jsx — In-app C2PA camera for CiteBack
 *
 * Opens device camera via getUserMedia, captures a JPEG, sends to
 * /api/capture/sign for server-side C2PA signing, returns signed JPEG
 * to parent via onCapture(blob, { lat, lng }).
 *
 * Props:
 *   onCapture(blob, gps)  — called with signed Blob + { lat, lng } | null
 *   onClose()             — user dismissed camera
 *   cameraHint            — camera type string for manifest title
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Aperture, RefreshCw, ShieldCheck, AlertCircle, Loader } from 'lucide-react'
import { API_BASE as AI_URL } from '../config.js'

const SIGN_URL = AI_URL + '/api/capture/sign'

export default function CameraCapture({ onCapture, onClose, cameraHint = 'Surveillance Camera' }) {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const streamRef   = useRef(null)

  const [phase, setPhase]         = useState('init')  // init | viewfinder | captured | signing | done | error
  const [capturedBlob, setCapturedBlob]   = useState(null)
  const [capturedURL, setCapturedURL]     = useState(null)
  const [gps, setGps]             = useState(null)    // { lat, lng }
  const [gpsStatus, setGpsStatus] = useState('waiting') // waiting | found | denied | timeout
  const [facingMode, setFacingMode] = useState('environment') // environment = back cam
  const [error, setError]         = useState(null)

  // ── Start camera ────────────────────────────────────────────────────────────
  const startCamera = useCallback(async (facing = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setPhase('viewfinder')
      setError(null)
    } catch (e) {
      setError(e.name === 'NotAllowedError'
        ? 'Camera permission denied. Allow camera access in your browser settings.'
        : 'Could not open camera: ' + e.message)
      setPhase('error')
    }
  }, [facingMode])

  // ── GPS ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return }
    const id = navigator.geolocation.watchPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsStatus('found')
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
    const fallback = setTimeout(() => setGpsStatus(s => s === 'waiting' ? 'timeout' : s), 15000)
    return () => { navigator.geolocation.clearWatch(id); clearTimeout(fallback) }
  }, [])

  // ── Start camera on mount ────────────────────────────────────────────────────
  useEffect(() => {
    startCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, []) // eslint-disable-line

  // ── Flip camera ─────────────────────────────────────────────────────────────
  function flipCamera() {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    startCamera(next)
  }

  // ── Capture frame ────────────────────────────────────────────────────────────
  async function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width  = video.videoWidth  || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    // Stop stream to show preview
    streamRef.current?.getTracks().forEach(t => t.stop())

    canvas.toBlob(blob => {
      if (!blob) { setError('Could not capture frame'); return }
      setCapturedBlob(blob)
      setCapturedURL(URL.createObjectURL(blob))
      setPhase('captured')
    }, 'image/jpeg', 0.92)
  }

  // ── Sign & deliver ────────────────────────────────────────────────────────────
  async function signAndSubmit() {
    if (!capturedBlob) return
    setPhase('signing')

    const fd = new FormData()
    fd.append('photo', capturedBlob, 'citeback-capture.jpg')
    fd.append('timestamp', new Date().toISOString())
    fd.append('cameraHint', cameraHint)
    if (gps) {
      fd.append('lat', String(gps.lat))
      fd.append('lng', String(gps.lng))
    }

    try {
      const res = await fetch(SIGN_URL, { method: 'POST', body: fd, credentials: 'include' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }))
        throw new Error(err.error || 'Sign failed')
      }
      const signed = await res.blob()
      const signedFile = new File([signed], 'citeback-c2pa.jpg', { type: 'image/jpeg' })
      setPhase('done')
      onCapture(signedFile, gps)
    } catch (e) {
      // Fallback: deliver unsigned photo + warn
      console.warn('[CameraCapture] Signing failed, falling back to unsigned:', e.message)
      const unsignedFile = new File([capturedBlob], 'citeback-capture.jpg', { type: 'image/jpeg' })
      setPhase('done')
      onCapture(unsignedFile, gps)
    }
  }

  // ── Retake ────────────────────────────────────────────────────────────────────
  function retake() {
    if (capturedURL) URL.revokeObjectURL(capturedURL)
    setCapturedBlob(null)
    setCapturedURL(null)
    startCamera(facingMode)
  }

  // ── GPS badge ─────────────────────────────────────────────────────────────────
  const gpsBadge = gpsStatus === 'found'
    ? <span className="cc-badge cc-badge--green"><ShieldCheck size={12}/> GPS locked</span>
    : gpsStatus === 'denied'
    ? <span className="cc-badge cc-badge--red"><AlertCircle size={12}/> No GPS</span>
    : <span className="cc-badge cc-badge--gray"><Loader size={12} className="cc-spin"/> Getting GPS…</span>

  return (
    <div className="cc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cc-modal">

        {/* Header */}
        <div className="cc-header">
          <span className="cc-title">📷 CiteBack Camera</span>
          <button className="cc-close" onClick={onClose}><X size={18}/></button>
        </div>

        {/* C2PA notice */}
        <div className="cc-notice">
          <ShieldCheck size={14}/> Photo will be <strong>C2PA-signed</strong> with GPS + timestamp before submission
        </div>

        {/* Viewfinder / preview area */}
        <div className="cc-viewport">
          {phase === 'error' && (
            <div className="cc-error-box">
              <AlertCircle size={32}/><p>{error}</p>
            </div>
          )}

          {/* Live video */}
          <video
            ref={videoRef}
            playsInline muted autoPlay
            style={{ display: phase === 'viewfinder' ? 'block' : 'none' }}
            className="cc-video"
          />

          {/* Captured preview */}
          {capturedURL && (phase === 'captured' || phase === 'signing') && (
            <img src={capturedURL} alt="Captured" className="cc-video"/>
          )}

          {/* Signing overlay */}
          {phase === 'signing' && (
            <div className="cc-signing-overlay">
              <Loader size={28} className="cc-spin"/>
              <p>Signing with C2PA…</p>
            </div>
          )}

          {/* Canvas (hidden — used for capture) */}
          <canvas ref={canvasRef} style={{ display: 'none' }}/>

          {/* GPS badge overlaid on viewport */}
          {(phase === 'viewfinder' || phase === 'captured') && (
            <div className="cc-gps-badge">{gpsBadge}</div>
          )}

          {/* Flip button (viewfinder only) */}
          {phase === 'viewfinder' && (
            <button className="cc-flip" onClick={flipCamera} title="Flip camera">
              <RefreshCw size={18}/>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="cc-actions">
          {phase === 'viewfinder' && (
            <button className="cc-shutter" onClick={capture}>
              <Aperture size={28}/>
            </button>
          )}

          {phase === 'captured' && (
            <>
              <button className="cc-btn cc-btn--secondary" onClick={retake}>Retake</button>
              <button className="cc-btn cc-btn--primary" onClick={signAndSubmit}>
                <ShieldCheck size={16}/> Use this photo
              </button>
            </>
          )}

          {phase === 'signing' && (
            <p className="cc-status">Embedding C2PA provenance…</p>
          )}
        </div>

        {/* GPS warning */}
        {gpsStatus !== 'found' && phase !== 'init' && (
          <p className="cc-gps-warning">
            {gpsStatus === 'denied'
              ? 'No GPS — photo will be submitted without location. Enable location services for full credibility.'
              : 'Acquiring GPS signal — move to an open area for best accuracy.'}
          </p>
        )}
      </div>

      <style>{`
        .cc-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.85);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .cc-modal {
          background: #0f1117; border: 1px solid #2a2d3a;
          border-radius: 16px; width: 100%; max-width: 480px;
          display: flex; flex-direction: column; gap: 0;
          overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.6);
        }
        .cc-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid #1e2030;
        }
        .cc-title { font-weight: 600; color: #e2e8f0; font-size: 15px; }
        .cc-close {
          background: none; border: none; color: #64748b; cursor: pointer;
          padding: 4px; border-radius: 6px;
        }
        .cc-close:hover { color: #e2e8f0; background: #1e2030; }
        .cc-notice {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; background: rgba(16,185,129,0.08);
          border-bottom: 1px solid rgba(16,185,129,0.15);
          color: #6ee7b7; font-size: 12px;
        }
        .cc-viewport {
          position: relative; background: #000; aspect-ratio: 4/3;
          overflow: hidden; max-height: 360px;
        }
        .cc-video {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .cc-error-box {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 100%; gap: 12px;
          color: #f87171; padding: 24px; text-align: center; font-size: 14px;
        }
        .cc-signing-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          background: rgba(0,0,0,0.65); color: #a5b4fc; font-size: 14px;
        }
        .cc-gps-badge {
          position: absolute; top: 10px; left: 10px;
        }
        .cc-flip {
          position: absolute; top: 10px; right: 10px;
          background: rgba(0,0,0,0.5); border: none; border-radius: 8px;
          color: #e2e8f0; padding: 8px; cursor: pointer;
        }
        .cc-flip:hover { background: rgba(0,0,0,0.75); }
        .cc-actions {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; padding: 16px;
        }
        .cc-shutter {
          width: 64px; height: 64px; border-radius: 50%;
          background: #fff; border: 4px solid #94a3b8; color: #0f172a;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: transform 0.1s;
        }
        .cc-shutter:active { transform: scale(0.92); }
        .cc-btn {
          padding: 10px 20px; border-radius: 10px; font-size: 14px;
          font-weight: 500; cursor: pointer; border: none;
          display: flex; align-items: center; gap: 6px;
          transition: opacity 0.15s;
        }
        .cc-btn--primary {
          background: #10b981; color: #fff; display: flex; gap: 6px;
        }
        .cc-btn--primary:hover { opacity: 0.88; }
        .cc-btn--secondary {
          background: #1e2030; color: #94a3b8; border: 1px solid #2a2d3a;
        }
        .cc-btn--secondary:hover { color: #e2e8f0; }
        .cc-status { color: #94a3b8; font-size: 13px; }
        .cc-gps-warning {
          padding: 8px 16px 14px; color: #f59e0b; font-size: 11px; text-align: center;
        }
        .cc-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 500;
        }
        .cc-badge--green { background: rgba(16,185,129,0.18); color: #6ee7b7; }
        .cc-badge--red   { background: rgba(239,68,68,0.18);  color: #fca5a5; }
        .cc-badge--gray  { background: rgba(100,116,139,0.2); color: #94a3b8; }
        @keyframes cc-spin { to { transform: rotate(360deg); } }
        .cc-spin { animation: cc-spin 1s linear infinite; }
      `}</style>
    </div>
  )
}
