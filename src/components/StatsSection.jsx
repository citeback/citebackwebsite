import { useEffect, useRef, useState } from 'react';

const CAMERA_TARGET = 92847;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatsSection() {
  const [cameraCount, setCameraCount] = useState(0);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const tickTimeoutRef = useRef(null);
  const currentCountRef = useRef(0);
  const DURATION = 2800;

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOutCubic(progress);
      const count = Math.floor(eased * CAMERA_TARGET);
      currentCountRef.current = count;
      setCameraCount(count);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        currentCountRef.current = CAMERA_TARGET;
        setCameraCount(CAMERA_TARGET);
        scheduleTick();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current);
    };
  }, []);

  function scheduleTick() {
    const delay = 4000 + Math.random() * 3000;
    tickTimeoutRef.current = setTimeout(() => {
      currentCountRef.current += 1;
      setCameraCount(currentCountRef.current);
      scheduleTick();
    }, delay);
  }

  const stats = [
    {
      value: null,
      isLive: true,
      label: 'surveillance cameras documented',
    },
    {
      value: '0',
      isLive: false,
      label: 'humans with wallet key access',
    },
    {
      value: '5',
      isLive: false,
      label: 'governance audit rounds completed',
    },
    {
      value: 'v0.7',
      isLive: false,
      label: 'governance version — active',
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '0 48px',
              borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
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
                  fontSize: '48px',
                  fontWeight: 200,
                  lineHeight: 1,
                  color: 'var(--fg)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.isLive ? cameraCount.toLocaleString() : stat.value}
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
      `}</style>
    </section>
  );
}
