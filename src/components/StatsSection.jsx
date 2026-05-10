import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../config.js';

// Camera count is fetched once on mount from the API (/stats endpoint).
// The API reflects the latest OSM dataset loaded by the nightly Hetzner cron.
// This is a point-in-time dataset count — NOT a live feed or real-time tracker.
// Do NOT add a pulsing 'live' indicator or a ticking counter — that would
// misrepresent static dataset data as real-time surveillance tracking (FTC risk).
// Fallback if the API is unreachable: CAMERA_COUNT_FALLBACK.
const CAMERA_COUNT_FALLBACK = 95045;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatsSection() {
  const [cameraCount, setCameraCount] = useState(0);
  const [targetCount, setTargetCount] = useState(CAMERA_COUNT_FALLBACK);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const DURATION = 2800;

  // Fetch live count from API once on mount (reflects latest OSM dataset)
  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then(r => r.json())
      .then(d => { if (d.cameraCount) setTargetCount(d.cameraCount); })
      .catch(() => { /* fallback stays */ });
  }, []);

  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startTimeRef.current = null;
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOutCubic(progress);
      const count = Math.floor(eased * targetCount);
      setCameraCount(count);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCameraCount(targetCount);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetCount]);

  const stats = [
    {
      value: targetCount.toLocaleString(),
      isLive: false,
      isAnimated: true,
      label: 'ALPR (Automated License Plate Reader) surveillance cameras mapped in public dataset',
    },
    {
      value: '0',
      isLive: false,
      label: 'platform fees deducted from campaigns',
    },
    {
      value: '10',
      isLive: false,
      label: 'launch prerequisites before wallets activate',
    },
    {
      value: 'XMR + ZANO',
      isLive: false,
      label: 'Monero + Zano — privacy coins only. No credit card. No identity. No KYC.',
    },
  ];

  return (
    <section className="stats-section">
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stats-cell">
            <div className="stats-value-row">
              <span className="stats-big-num">
                {stat.isAnimated ? cameraCount.toLocaleString() : stat.value}
              </span>
              {stat.isLive && (
                <span className="stats-live-badge">
                  <span className="stats-live-dot" />
                  <span className="stats-live-label">live</span>
                </span>
              )}
            </div>
            <div className="stats-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
