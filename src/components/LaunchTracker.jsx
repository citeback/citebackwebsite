import { CheckCircle, Circle, Clock } from 'lucide-react'
import { useCameraCount } from '../context/CameraCount'

const milestonesBase = [
  { done: true,    label: 'Governance framework published' },
  { done: true,    label: 'CAMERA_COUNT_PLACEHOLDER' },
  { done: true,    label: 'Expert directory launched — attorney, FOIA, and technical contributor applications open' },
  { done: true,    label: 'Campaign proposals published publicly (GitHub repo is public)' },
  { done: true,    label: 'Account system live — passkeys, reputation tiers, operator access' },
  { done: true,    label: 'Attorney credential verification live — CA State Bar auto-lookup, all other states manual review' },
  { done: true,    label: 'Security audit complete — rate limits, CSP headers, passkeys, encrypted email at rest, fail2ban, VPS hardened' },
  { done: false,   label: 'Wyoming DAO LLC incorporated — filing at wyomingbusiness.gov ($100)' },
  { done: false,   label: 'FinCEN MSB compliance opinion obtained from attorney' },
  { done: false,   label: 'Operator wallet framework live — operators self-custody campaign funds via their own XMR/ZANO wallets; Citeback never holds funds' },
  { done: false,   label: 'View-key balance verification live — read-only wallet monitoring and drain detection' },
  { done: false,   label: 'OFAC attorney guidance obtained; operator pre-screening framework operational' },
  { done: false,   label: 'First campaign wallet activated' },
]

export default function LaunchTracker() {
  const cameraCount = useCameraCount()
  const milestones = milestonesBase.map(m =>
    m.label === 'CAMERA_COUNT_PLACEHOLDER'
      ? { ...m, label: `Surveillance camera database live (${cameraCount} cameras)` }
      : m
  )
  const done = milestones.filter(m => m.done).length
  const total = milestones.length
  const pct = Math.round((done / total) * 100)
  return (
    <div className="lt-wrapper">
      <div className="lt-header-row">
        <div>
          <p className="lt-title">Launch Progress</p>
          <p className="lt-subtitle">We go live when every prerequisite is met — not before.</p>
        </div>
        <div className="lt-pct-display">
          <div className="lt-pct-number">{pct}%</div>
          <div className="lt-pct-label">{done}/{total} complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="lt-progress-track">
        <div className="lt-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Milestone list */}
      <div className="lt-milestone-list">
        {milestones.map((m, i) => (
          <div key={i} className="lt-milestone-row">
            {m.done
              ? <CheckCircle size={16} className="lt-check-done" />
              : <Circle size={16} className="lt-check-pending" />}
            <span className={`lt-milestone-text${m.done ? ' lt-milestone-text--done' : ' lt-milestone-text--pending'}`}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      <div className="lt-footer">
        <Clock size={12} />
        No wallet addresses will be published until all 10 prerequisites are met and publicly verifiable. No address means nowhere to send.
      </div>
    </div>
  )
}
