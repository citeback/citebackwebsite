/**
 * ARCameraOverlay.jsx
 * WebXR-style Augmented Reality Surveillance Camera Overlay
 *
 * Shows nearby documented surveillance cameras as floating labels
 * overlaid on the live device camera feed, oriented by compass heading.
 *
 * Fallback: 2D radar view when camera/orientation unavailable.
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

// ─────────────────────────────────────────────
// Known NM surveillance cameras (verified)
// ─────────────────────────────────────────────
const KNOWN_CAMERAS = [
  { lat: 36.7072, lng: -105.5769, type: 'Flock ALPR',       location: 'Taos Plaza' },
  { lat: 36.7200, lng: -105.5800, type: 'Flock ALPR',       location: 'Paseo del Pueblo Norte, Taos' },
  { lat: 32.3199, lng: -106.7637, type: 'Flock ALPR + PTZ', location: 'Main St, Las Cruces' },
  { lat: 35.0853, lng: -106.6504, type: 'Flock ALPR',       location: 'Albuquerque Central' },
  { lat: 35.1174, lng: -106.6195, type: 'Flock ALPR',       location: 'Albuquerque East' },
];

// ─────────────────────────────────────────────
// Geo helpers
// ─────────────────────────────────────────────

/** Haversine distance in metres between two lat/lng points */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // earth radius in metres
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Bearing from point 1 to point 2 in degrees (0 = North, clockwise) */
function bearing(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Normalize an angle to [-180, 180] */
function normalizeDelta(angle) {
  let a = angle % 360;
  if (a > 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

/** Generate pseudo-random demo cameras near a user position */
function generateDemoCameras(lat, lng, count = 50) {
  const cameras = [];
  const types = [
    'Flock ALPR', 'PTZ Camera', 'Ring Doorbell', 'CCTV',
    'License Plate Reader', 'Axis Network Cam', 'ShotSpotter Node',
  ];
  const locations = [
    'Intersection', 'Parking Lot', 'Transit Stop', 'School Zone',
    'Business District', 'Residential Block', 'Highway On-ramp',
    'Convenience Store', 'Bank Entrance', 'City Hall',
  ];

  // Seed based on lat/lng for consistent results per location
  let seed = Math.floor((lat + lng + 180) * 1000) % 9999;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    const dist = 50 + rand() * 950; // 50–1000m
    const angle = rand() * 2 * Math.PI;
    // Approximate offset — 1 deg lat ≈ 111,000 m
    const dLat = (dist * Math.cos(angle)) / 111000;
    const dLng =
      (dist * Math.sin(angle)) / (111000 * Math.cos((lat * Math.PI) / 180));
    cameras.push({
      lat: lat + dLat,
      lng: lng + dLng,
      type: types[Math.floor(rand() * types.length)],
      location: `${locations[Math.floor(rand() * locations.length)]} #${i + 1}`,
      isDemo: true,
    });
  }
  return cameras;
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function ARCameraOverlay({ onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const watchIdRef = useRef(null);
  const orientationListenerRef = useRef(null);

  const [status, setStatus] = useState('init'); // init | requesting | ar | radar | error
  const [errorMsg, setErrorMsg] = useState('');
  const [userPos, setUserPos] = useState(null); // { lat, lng, accuracy }
  const [heading, setHeading] = useState(null); // degrees, 0 = North
  const [allCameras, setAllCameras] = useState([]);
  const [visibleCameras, setVisibleCameras] = useState([]);
  const [nearbyCameras, setNearbyCameras] = useState([]);
  const [cameraMode, setCameraMode] = useState(false); // true = live video running
  const [orientationAvailable, setOrientationAvailable] = useState(false);
  const [permissionState, setPermissionState] = useState({
    geo: false,
    camera: false,
    orientation: false,
  });

  // Field of view half-angle (degrees) — labels visible if within this range
  const FOV_HALF = 30;
  const MAX_DISTANCE = 1000; // metres

  // ── Build camera list once user position is known ──────────────────
  useEffect(() => {
    if (!userPos) return;
    const nearby = [
      ...KNOWN_CAMERAS,
      ...generateDemoCameras(userPos.lat, userPos.lng, 50),
    ].map((cam) => ({
      ...cam,
      distance: haversineDistance(userPos.lat, userPos.lng, cam.lat, cam.lng),
      bearing: bearing(userPos.lat, userPos.lng, cam.lat, cam.lng),
    })).filter((cam) => cam.distance <= MAX_DISTANCE)
      .sort((a, b) => a.distance - b.distance);

    setAllCameras(nearby);
    setNearbyCameras(nearby);
  }, [userPos]);

  // ── Recompute visible cameras on heading change ─────────────────────
  useEffect(() => {
    if (heading === null) {
      // Show all nearby when no heading (radar mode shows them all)
      setVisibleCameras(nearbyCameras.slice(0, 20));
      return;
    }
    const visible = nearbyCameras.filter((cam) => {
      const delta = normalizeDelta(cam.bearing - heading);
      return Math.abs(delta) <= FOV_HALF;
    });
    setVisibleCameras(visible);
  }, [heading, nearbyCameras]);

  // ── Request permissions and start experience ───────────────────────
  const startAR = useCallback(async () => {
    setStatus('requesting');

    // 1. Geolocation
    let pos = null;
    try {
      pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      setUserPos({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      setPermissionState((p) => ({ ...p, geo: true }));

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } catch (err) {
      // Use a fallback position (Albuquerque, NM) for demo purposes
      console.warn('Geolocation failed, using demo position:', err.message);
      setUserPos({ lat: 35.0853, lng: -106.6504, accuracy: 999 });
    }

    // 2. Camera feed
    let videoStarted = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      videoStarted = true;
      setCameraMode(true);
      setPermissionState((p) => ({ ...p, camera: true }));
    } catch (err) {
      console.warn('Camera not available, using radar fallback:', err.message);
    }

    // 3. Device orientation (compass)
    const handleOrientation = (e) => {
      let h = null;
      if (e.webkitCompassHeading != null) {
        // iOS Safari — already corrected
        h = e.webkitCompassHeading;
      } else if (e.absolute && e.alpha != null) {
        // Android absolute — convert alpha to compass bearing
        h = (360 - e.alpha) % 360;
      } else if (e.alpha != null) {
        // Relative — best effort
        h = (360 - e.alpha) % 360;
      }
      if (h !== null) {
        setHeading(h);
        setOrientationAvailable(true);
        setPermissionState((p) => ({ ...p, orientation: true }));
      }
    };

    // Try absolute first (Android), fall back to relative (iOS / others)
    if (typeof DeviceOrientationEvent !== 'undefined') {
      // iOS 13+ requires permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const result = await DeviceOrientationEvent.requestPermission();
          if (result === 'granted') {
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            window.addEventListener('deviceorientation', handleOrientation, true);
            orientationListenerRef.current = handleOrientation;
          }
        } catch {
          // Permission denied — no compass
        }
      } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
        orientationListenerRef.current = handleOrientation;
      }
    }

    setStatus(videoStarted ? 'ar' : 'radar');
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (orientationListenerRef.current) {
        window.removeEventListener('deviceorientationabsolute', orientationListenerRef.current, true);
        window.removeEventListener('deviceorientation', orientationListenerRef.current, true);
      }
    };
  }, []);

  // ── Auto-start on mount ─────────────────────────────────────────────
  useEffect(() => {
    startAR();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────

  /** Horizontal position (% from left) for a camera label in AR mode */
  function labelLeft(cam) {
    if (heading === null) return 50;
    const delta = normalizeDelta(cam.bearing - heading); // -30 to +30
    // Map [-FOV_HALF, +FOV_HALF] → [5%, 95%]
    return 50 + (delta / FOV_HALF) * 40;
  }

  /** Vertical position: closer = lower on screen (more prominent) */
  function labelTop(cam) {
    // closer = higher percentage down the screen (lower = more dominant in frame)
    // 50m → ~80%, 1000m → ~15%
    const pct = 15 + ((MAX_DISTANCE - cam.distance) / MAX_DISTANCE) * 65;
    return Math.max(10, Math.min(85, pct));
  }

  /** Color by camera type */
  function typeColor(type) {
    if (type.includes('ALPR') || type.includes('License Plate')) return '#ff4444';
    if (type.includes('PTZ')) return '#ff8800';
    if (type.includes('ShotSpotter')) return '#cc44ff';
    if (type.includes('Ring')) return '#4488ff';
    return '#ff4444';
  }

  function formatDistance(m) {
    if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
    return `${Math.round(m)}m`;
  }

  // ─────────────────────────────────────────────
  // Radar view: 2D top-down compass overlay
  // ─────────────────────────────────────────────
  const RadarView = () => {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.85;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = cx - 20;

    const compassRotation = heading !== null ? -heading : 0;

    return (
      <div style={styles.radarContainer}>
        <div style={styles.radarLabel}>📡 Radar Mode — Point device to orient</div>
        <svg
          width={size}
          height={size}
          style={{ ...styles.radarSvg, transform: `rotate(${compassRotation}deg)` }}
        >
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={maxR * r}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
          ))}
          {/* Cardinal directions */}
          {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([label, deg]) => {
            const rad = (deg * Math.PI) / 180;
            const lx = cx + Math.sin(rad) * (maxR + 8);
            const ly = cy - Math.cos(rad) * (maxR + 8);
            return (
              <text
                key={label}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={label === 'N' ? '#ff4444' : 'rgba(255,255,255,0.6)'}
                fontSize={label === 'N' ? 16 : 12}
                fontWeight="bold"
                fontFamily="monospace"
              >
                {label}
              </text>
            );
          })}
          {/* Camera dots */}
          {nearbyCameras.map((cam, i) => {
            const rad = (cam.bearing * Math.PI) / 180;
            const r = (cam.distance / MAX_DISTANCE) * maxR;
            const px = cx + Math.sin(rad) * r;
            const py = cy - Math.cos(rad) * r;
            const color = typeColor(cam.type);
            return (
              <g key={i}>
                <circle cx={px} cy={py} r={5} fill={color} opacity={0.85} />
                <circle cx={px} cy={py} r={8} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />
              </g>
            );
          })}
          {/* User dot */}
          <circle cx={cx} cy={cy} r={7} fill="#00ffcc" />
          <circle cx={cx} cy={cy} r={12} fill="none" stroke="#00ffcc" strokeWidth={2} opacity={0.5} />
          {/* Heading cone */}
          {heading !== null && (
            <path
              d={`M ${cx} ${cy} L ${cx - 20} ${cy - maxR * 0.5} L ${cx + 20} ${cy - maxR * 0.5} Z`}
              fill="rgba(0,255,204,0.08)"
              stroke="rgba(0,255,204,0.3)"
              strokeWidth={1}
            />
          )}
        </svg>
        <div style={styles.radarDistLabels}>
          <span style={{ opacity: 0.4 }}>250m</span>
          <span style={{ opacity: 0.4 }}>500m</span>
          <span style={{ opacity: 0.4 }}>750m</span>
          <span style={{ opacity: 0.6 }}>1km</span>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // AR overlay labels
  // ─────────────────────────────────────────────
  const ARLabels = () => (
    <>
      {visibleCameras.map((cam, i) => {
        const left = labelLeft(cam);
        const top = labelTop(cam);
        const color = typeColor(cam.type);
        const opacity = Math.max(0.5, 1 - cam.distance / MAX_DISTANCE);

        return (
          <div
            key={i}
            style={{
              ...styles.arLabel,
              left: `${left}%`,
              top: `${top}%`,
              transform: 'translate(-50%, -50%)',
              opacity,
              borderColor: color,
            }}
          >
            <span style={{ ...styles.arDot, backgroundColor: color }} />
            <div style={styles.arLabelText}>
              <div style={styles.arLabelType}>{cam.type}</div>
              <div style={styles.arLabelLocation}>{cam.location}</div>
              <div style={{ ...styles.arLabelDist, color }}>
                {formatDistance(cam.distance)}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );

  // ─────────────────────────────────────────────
  // Loading / permission screen
  // ─────────────────────────────────────────────
  if (status === 'init' || status === 'requesting') {
    return (
      <div style={styles.loadScreen}>
        <div style={styles.loadContent}>
          <div style={styles.loadIcon}>📡</div>
          <div style={styles.loadTitle}>Activating AR Mode</div>
          <div style={styles.loadSubtitle}>Requesting permissions…</div>
          <div style={styles.permList}>
            <PermRow label="Location" granted={permissionState.geo} />
            <PermRow label="Camera" granted={permissionState.camera} />
            <PermRow label="Compass" granted={permissionState.orientation} />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={styles.loadScreen}>
        <div style={styles.loadContent}>
          <div style={styles.loadIcon}>⚠️</div>
          <div style={styles.loadTitle}>Could Not Start AR</div>
          <div style={styles.loadSubtitle}>{errorMsg}</div>
          <button style={styles.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Main AR / Radar view
  // ─────────────────────────────────────────────
  return (
    <div style={styles.root}>
      {/* Live camera feed background */}
      {cameraMode && (
        <video
          ref={videoRef}
          style={styles.video}
          autoPlay
          playsInline
          muted
        />
      )}

      {/* Dark overlay tint when no camera */}
      {!cameraMode && <div style={styles.darkBg} />}

      {/* Radar fallback */}
      {status === 'radar' && <RadarView />}

      {/* AR labels */}
      {status === 'ar' && <ARLabels />}

      {/* Scan line effect */}
      {status === 'ar' && <div style={styles.scanLine} />}

      {/* Top HUD bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <span style={styles.recordDot} />
          <span style={styles.topBarTitle}>
            {status === 'ar' ? 'AR MODE' : 'RADAR MODE'} — Surveillance Camera Overlay
          </span>
        </div>
        <div style={styles.topBarRight}>
          {heading !== null && (
            <span style={styles.headingBadge}>
              {Math.round(heading)}°{' '}
              {['N','NE','E','SE','S','SW','W','NW'][Math.round(heading / 45) % 8]}
            </span>
          )}
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Bottom info bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomStats}>
          <StatPill
            label={status === 'ar' ? 'IN VIEW' : 'NEARBY'}
            value={status === 'ar' ? visibleCameras.length : nearbyCameras.length}
            color="#ff4444"
          />
          <StatPill label="TOTAL NEARBY" value={nearbyCameras.length} color="#888" />
          {userPos && (
            <StatPill
              label="GPS ACC"
              value={`±${Math.round(userPos.accuracy || 0)}m`}
              color="#00ffcc"
            />
          )}
        </div>
        {!orientationAvailable && status === 'ar' && (
          <div style={styles.orientHint}>
            ↕ Enable compass for directional overlay
          </div>
        )}
        {status === 'radar' && (
          <div style={styles.orientHint}>
            📷 Camera unavailable — showing radar view
          </div>
        )}
      </div>

      {/* Crosshair for AR mode */}
      {status === 'ar' && heading !== null && (
        <div style={styles.crosshair}>
          <div style={styles.crosshairH} />
          <div style={styles.crosshairV} />
          <div style={styles.crosshairCircle} />
        </div>
      )}

      {/* Corner grid decorations */}
      <CornerDecorations />
    </div>
  );
}

// ─────────────────────────────────────────────
// Small UI sub-components
// ─────────────────────────────────────────────

function PermRow({ label, granted }) {
  return (
    <div style={styles.permRow}>
      <span style={{ color: granted ? '#00ffcc' : '#888', marginRight: 8 }}>
        {granted ? '✓' : '○'}
      </span>
      <span style={{ color: granted ? '#fff' : '#888' }}>{label}</span>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={styles.statPill}>
      <span style={{ ...styles.statValue, color }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function CornerDecorations() {
  const corners = [
    { top: 60, left: 0 },
    { top: 60, right: 0 },
    { bottom: 80, left: 0 },
    { bottom: 80, right: 0 },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            width: 24,
            height: 24,
            pointerEvents: 'none',
            borderTop: i < 2 ? '2px solid rgba(0,255,204,0.35)' : 'none',
            borderBottom: i >= 2 ? '2px solid rgba(0,255,204,0.35)' : 'none',
            borderLeft: i % 2 === 0 ? '2px solid rgba(0,255,204,0.35)' : 'none',
            borderRight: i % 2 === 1 ? '2px solid rgba(0,255,204,0.35)' : 'none',
          }}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    overflow: 'hidden',
    backgroundColor: '#000',
    fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
    userSelect: 'none',
  },
  video: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  darkBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #0a0a0f 0%, #050510 100%)',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.3), transparent)',
    animation: 'scanline 3s linear infinite',
    pointerEvents: 'none',
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    zIndex: 10,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    overflow: 'hidden',
  },
  topBarTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  recordDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#ff4444',
    flexShrink: 0,
    boxShadow: '0 0 6px #ff4444',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  headingBadge: {
    color: '#00ffcc',
    fontSize: 12,
    fontWeight: 700,
    background: 'rgba(0,255,204,0.12)',
    padding: '3px 8px',
    borderRadius: 4,
    border: '1px solid rgba(0,255,204,0.25)',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: 6,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    backdropFilter: 'blur(8px)',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
    padding: '16px 12px 24px',
    zIndex: 10,
  },
  bottomStats: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  statPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '6px 14px',
    backdropFilter: 'blur(8px)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  orientHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },

  // AR labels
  arLabel: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    background: 'rgba(0,0,0,0.72)',
    border: '1px solid',
    borderRadius: 8,
    padding: '6px 10px',
    backdropFilter: 'blur(12px)',
    maxWidth: 160,
    zIndex: 5,
    boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
  },
  arDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginTop: 3,
    flexShrink: 0,
    boxShadow: '0 0 8px currentColor',
  },
  arLabelText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  arLabelType: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.03em',
  },
  arLabelLocation: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    lineHeight: 1.3,
  },
  arLabelDist: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 2,
  },

  // Crosshair
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 60,
    height: 60,
    pointerEvents: 'none',
    zIndex: 6,
  },
  crosshairH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    background: 'rgba(0,255,204,0.4)',
    transform: 'translateY(-50%)',
  },
  crosshairV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    background: 'rgba(0,255,204,0.4)',
    transform: 'translateX(-50%)',
  },
  crosshairCircle: {
    position: 'absolute',
    inset: 10,
    borderRadius: '50%',
    border: '1px solid rgba(0,255,204,0.4)',
  },

  // Radar
  radarContainer: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  radarLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    letterSpacing: '0.08em',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  radarSvg: {
    transition: 'transform 0.3s ease-out',
  },
  radarDistLabels: {
    display: 'flex',
    gap: '28%',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 4,
    letterSpacing: '0.05em',
  },

  // Load screen
  loadScreen: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'linear-gradient(135deg, #08080f 0%, #020208 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
  },
  loadContent: {
    textAlign: 'center',
    padding: 24,
    maxWidth: 300,
  },
  loadIcon: {
    fontSize: 48,
    marginBottom: 16,
    filter: 'drop-shadow(0 0 16px rgba(0,255,204,0.5))',
  },
  loadTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
    letterSpacing: '0.05em',
  },
  loadSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 20,
    letterSpacing: '0.04em',
  },
  permList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'flex-start',
    margin: '0 auto',
    width: 'fit-content',
  },
  permRow: {
    fontSize: 14,
    letterSpacing: '0.04em',
    display: 'flex',
    alignItems: 'center',
  },
};

/*
  CSS animations — inject once if not already present.
  In a Vite/CRA project you'd put these in a .css file instead.
*/
if (typeof document !== 'undefined' && !document.getElementById('ar-overlay-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'ar-overlay-styles';
  styleEl.textContent = `
    @keyframes scanline {
      0%   { top: 0; opacity: 1; }
      90%  { opacity: 0.6; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(0.8); }
    }
  `;
  document.head.appendChild(styleEl);
}
