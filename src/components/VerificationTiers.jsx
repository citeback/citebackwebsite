/**
 * Verification Tier System — Citeback
 *
 * Tier 0: OSM Community  — community-mapped, coordinates verified physically by someone
 * Tier 1: Submitted      — community submission pending review
 * Tier 2: Consensus      — 3-of-3 Expert Directory verifiers confirmed independently
 * Tier 3: C2PA Gold      — cryptographic photo proof, impossible to fake with AI
 *
 * Adversarial threat model:
 * Well-resourced actors (surveillance vendors, law enforcement PR) may attempt to:
 * - Flood submissions with AI-generated fake cameras to discredit dataset
 * - Submit cameras that don't exist to make Citeback look unreliable
 * - Deny cameras that DO exist by submitting conflicting data
 *
 * Defense: tiered trust, economic staking, C2PA cryptographic verification
 */

export const TIERS = {
  osm: {
    id: 'osm',
    label: 'OSM Community',
    color: '#e63946',
    colorRaw: '230,57,70',
    icon: '📡',
    description: 'Physically spotted and logged by the OpenStreetMap community. Real person, real location.',
    trust: 'High — community verified',
  },
  submitted: {
    id: 'submitted',
    label: 'Submitted',
    color: '#f39c12',
    colorRaw: '243,156,18',
    icon: '⏳',
    description: 'Community submission pending 3-of-3 Expert Directory verification.',
    trust: 'Pending — under review',
  },
  consensus: {
    id: 'consensus',
    label: '3-of-3 Verified',
    color: '#2ecc71',
    colorRaw: '46,204,113',
    icon: '✅',
    description: 'Three independent Expert Directory verifiers confirmed this camera on-site.',
    trust: 'Strong — consensus verified',
  },
  c2pa: {
    id: 'c2pa',
    label: 'C2PA Authenticated',
    color: '#f1c40f',
    colorRaw: '241,196,15',
    icon: '🏆',
    description: 'Cryptographic proof from a real physical camera. GPS, timestamp, and image integrity are mathematically guaranteed. AI-generated images cannot pass this check.',
    trust: 'Maximum — cryptographically proven',
  },
}

import { Shield, AlertTriangle, CheckCircle, Lock, Eye } from 'lucide-react'

export function TierBadge({ tier, size = 'sm' }) {
  const t = TIERS[tier] || TIERS.osm
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: `rgba(${t.colorRaw},0.12)`,
      border: `1px solid rgba(${t.colorRaw},0.3)`,
      color: t.color,
      padding: size === 'sm' ? '2px 8px' : '5px 12px',
      borderRadius: 100,
      fontSize: size === 'sm' ? 11 : 13,
      fontWeight: 700,
    }}>
      {t.icon} {t.label}
    </span>
  )
}

export function ThreatDisclosure() {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--red)', borderRadius: 0, padding: 24, marginBottom: 28,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <AlertTriangle size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <div style={{ fontWeight: 800, fontSize: 15 }}>Adversarial Threat Disclosure</div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 16 }}>
        Citeback documents surveillance infrastructure operated by well-funded government and corporate entities.
        These actors have legal teams, PR resources, and technical capabilities to attempt to discredit this platform.
        Known attack vectors include flooding submissions with AI-generated fake cameras, submitting false locations
        to corrupt the dataset, and coordinated denial of real cameras.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { icon: <Eye size={14} />, title: 'AI Photo Spoofing', body: 'Generative AI can produce photorealistic fake camera images. Defense: C2PA cryptographic authentication from real camera hardware.' },
          { icon: <Lock size={14} />, title: 'GPS Metadata Forgery', body: 'EXIF data is trivially editable. Defense: C2PA embeds GPS at capture time, cryptographically signed and tamper-evident.' },
          { icon: <Shield size={14} />, title: 'Sybil Attacks', body: 'One actor, multiple fake verifier identities. Defense: Expert Directory reputation stake — fraud costs real XMR or ZANO.' },
          { icon: <CheckCircle size={14} />, title: 'Our Response', body: 'Tiered verification, economic staking, C2PA authentication, and public disclosure of all verification methods.' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 0, padding: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>
              {item.icon} {item.title}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function C2PAExplainer() {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--gray)', borderRadius: 0, padding: 18,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🏆</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6, color: '#f1c40f' }}>
            C2PA Authentication — The Gold Standard
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, marginBottom: 12 }}>
            C2PA (Coalition for Content Provenance and Authenticity) is a cryptographic standard
            backed by Adobe, Google, Microsoft, Sony, and Qualcomm. When you take a photo with a
            C2PA-enabled camera app, it embeds a tamper-proof signature proving:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {[
              'The photo was taken by a real physical camera — not AI-generated',
              'The GPS coordinates match where the photo was actually taken',
              'The timestamp is real and unmodified',
              'The image has not been edited in any way since capture',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'var(--text)' }}>
                <CheckCircle size={12} style={{ color: '#f1c40f', flexShrink: 0, marginTop: 2 }} />
                {item}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>How to get a C2PA photo:</strong>{' '}
            <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" style={{ color: '#f1c40f' }}>Proofmode</a>{' '}
            (iOS/Android, free — built by Guardian Project for human rights evidence) ·{' '}
            Samsung Galaxy S24+ · Google Pixel 10
          </div>
        </div>
      </div>
    </div>
  )
}
