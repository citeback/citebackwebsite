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
import './VerificationTiers.css'

export function TierBadge({ tier, size = 'sm' }) {
  const t = TIERS[tier] || TIERS.osm
  return (
    <span
      className={`vt-badge vt-badge--${size === 'sm' ? 'sm' : 'lg'}`}
      style={{
        background: `rgba(${t.colorRaw},0.12)`,
        border: `1px solid rgba(${t.colorRaw},0.3)`,
        color: t.color,
      }}
    >
      {t.icon} {t.label}
    </span>
  )
}

export function ThreatDisclosure() {
  return (
    <div className="vt-threat">
      <div className="vt-threat-header">
        <AlertTriangle size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <div className="vt-threat-title">Adversarial Threat Disclosure</div>
      </div>

      <p className="vt-threat-body">
        Citeback documents surveillance infrastructure operated by well-funded government and corporate entities.
        These actors have legal teams, PR resources, and technical capabilities to attempt to discredit this platform.
        Known attack vectors include flooding submissions with AI-generated fake cameras, submitting false locations
        to corrupt the dataset, and coordinated denial of real cameras.
      </p>

      <div className="vt-threat-grid">
        {[
          { icon: <Eye size={14} />, title: 'AI Photo Spoofing', body: 'Generative AI can produce photorealistic fake camera images. Defense: C2PA cryptographic authentication from real camera hardware.' },
          { icon: <Lock size={14} />, title: 'GPS Metadata Forgery', body: 'EXIF data is trivially editable. Defense: C2PA embeds GPS at capture time, cryptographically signed and tamper-evident.' },
          { icon: <Shield size={14} />, title: 'Sybil Attacks', body: 'One actor, multiple fake verifier identities. Defense: Expert Directory reputation stake — fraud costs real XMR or ZANO.' },
          { icon: <CheckCircle size={14} />, title: 'Our Response', body: 'Tiered verification, economic staking, C2PA authentication, and public disclosure of all verification methods.' },
        ].map((item, i) => (
          <div key={i} className="vt-threat-card">
            <div className="vt-threat-card-header">
              {item.icon} {item.title}
            </div>
            <p className="vt-threat-card-body">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function C2PAExplainer() {
  return (
    <div className="vt-c2pa">
      <div className="vt-c2pa-inner">
        <span className="vt-c2pa-emoji">🏆</span>
        <div>
          <div className="vt-c2pa-title">
            C2PA Authentication — The Gold Standard
          </div>
          <p className="vt-c2pa-intro">
            C2PA (Coalition for Content Provenance and Authenticity) is a cryptographic standard
            backed by Adobe, Google, Microsoft, Sony, and Qualcomm. When you take a photo with a
            C2PA-enabled camera app, it embeds a tamper-proof signature proving:
          </p>
          <div className="vt-c2pa-list">
            {[
              'The photo was taken by a real physical camera — not AI-generated',
              'The GPS coordinates match where the photo was actually taken',
              'The timestamp is real and unmodified',
              'The image has not been edited in any way since capture',
            ].map((item, i) => (
              <div key={i} className="vt-c2pa-list-item">
                <CheckCircle size={12} style={{ color: '#f1c40f', flexShrink: 0, marginTop: 2 }} />
                {item}
              </div>
            ))}
          </div>
          <div className="vt-c2pa-footer">
            <strong style={{ color: 'var(--text)' }}>How to get a C2PA photo:</strong>{' '}
            <a href="https://proofmode.org" target="_blank" rel="noopener noreferrer" className="vt-c2pa-link">Proofmode</a>{' '}
            (iOS/Android, free — built by Guardian Project for human rights evidence) ·{' '}
            Samsung Galaxy S24+ · Google Pixel 10
          </div>
        </div>
      </div>
    </div>
  )
}
