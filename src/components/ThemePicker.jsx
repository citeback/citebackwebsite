import { useTheme } from '../ThemeContext'
import { Palette, X } from 'lucide-react'
import { useState } from 'react'

export default function ThemePicker() {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 999 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 56, left: 0,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 16, width: 220,
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Choose Theme
          </div>
          {Object.entries(themes).map(([key, t]) => (
            <button key={key} onClick={() => { setTheme(key); setOpen(false) }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: theme === key ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: `1px solid ${theme === key ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 9, padding: '10px 12px', cursor: 'pointer',
              transition: 'all 0.15s', textAlign: 'left',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: t.preview, flexShrink: 0,
                boxShadow: theme === key ? `0 0 8px ${t.preview}` : 'none',
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.desc}</div>
              </div>
              {theme === key && (
                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              )}
            </button>
          ))}
        </div>
      )}

      <button onClick={() => setOpen(!open)} style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', opacity: 0.5,
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
      >
        {open ? <X size={14} color="var(--muted)" /> : <Palette size={14} color="var(--muted)" />}
      </button>
    </div>
  )
}
