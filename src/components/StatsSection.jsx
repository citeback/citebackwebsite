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
      label: 'ALPR surveillance cameras in public dataset',
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
    <section
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 0',
      }}
    >
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stats-cell"
            style={{
              padding: '0 48px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(28px, 8vw, 48px)',
                  fontWeight: 200,
                  lineHeight: 1,
                  color: 'var(--fg)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.isAnimated ? cameraCount.toLocaleString() : stat.value}
              </span>
              {stat.isLive && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--red)',
                      display: 'inline-block',
                      animation: 'pulse 1.8s ease-in-out infinite',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--red)',
                      fontWeight: 500,
                    }}
                  >
                    live
                  </span>
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--gray)',
                lineHeight: 1.4,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .stats-cell {
          border-left: none;
        }
        .stats-cell + .stats-cell {
          border-left: 1px solid var(--border);
        }
        @media (max-width: 700px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stats-cell {
            padding: 24px 20px !important;
            border-left: none !important;
            border-bottom: 1px solid var(--border);
          }
          .stats-cell:nth-child(even) {
            border-left: 1px solid var(--border) !important;
          }
        }
        @media (max-width: 420px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .stats-cell:nth-child(even) {
            border-left: none !important;
          }
        }
      `}</style>
    </section>
  );
}
