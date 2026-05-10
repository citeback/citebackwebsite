import { MapPin, Clock, CheckCircle, Share2, Flame, Rocket, ExternalLink, Users } from 'lucide-react'
import { typeColors } from '../data/campaigns'
import { useState } from 'react'

function getDaysLeft(deadline) {
  return Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
}

export default function CampaignCard({ campaign, onClick }) {
  const [shared, setShared] = useState(false)
  const unclaimed = campaign.status === 'unclaimed'
  const claimed = campaign.status === 'claimed'
  const prelaunch = unclaimed || claimed || !campaign.walletXMR
  const pct = prelaunch ? 0 : Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))
  const tc = typeColors[campaign.type]
  const funded = campaign.status === 'funded'
  const daysLeft = getDaysLeft(campaign.deadline)
  const urgent = !funded && !prelaunch && daysLeft <= 14

  const dataStatus = funded ? 'funded' : urgent ? 'urgent' : prelaunch ? 'prelaunch' : 'default'

  const handleShare = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/#campaign-${campaign.id}`)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div
      onClick={onClick}
      className="campaign-card"
      data-status={dataStatus}
    >
      {/* Top row */}
      <div className="card-top">
        <span
          className="card-type-badge"
          style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text }}
        >
          {tc.label}
        </span>

        <div className="card-badges">
          {funded && (
            <span className="card-badge card-badge--funded">
              <CheckCircle size={13} /> Funded
            </span>
          )}
          {unclaimed && (
            <span className="card-badge card-badge--operator">
              <Users size={12} /> Seeking Operator
            </span>
          )}
          {claimed && !unclaimed && (
            <span className="card-badge card-badge--pending">
              <Rocket size={12} /> Wallet Pending
            </span>
          )}
          {!unclaimed && !claimed && prelaunch && (
            <span className="card-badge card-badge--pending">
              <Rocket size={12} /> Pre-Launch
            </span>
          )}
          {urgent && (
            <span className="card-badge card-badge--urgent">
              <Flame size={12} /> {daysLeft}d left
            </span>
          )}
          <button
            onClick={handleShare}
            aria-label={shared ? 'Link copied' : 'Copy campaign link'}
            className="card-share-btn"
            className={`card-share-btn${shared ? ' card-share-btn--shared' : ' card-share-btn--idle'}`}
          >
            {shared ? <CheckCircle size={14} /> : <Share2 size={14} />}
          </button>
        </div>
      </div>

      {/* Title + desc */}
      <div>
        <h3 className="card-title">{campaign.title}</h3>
        <p className="card-desc">{campaign.description}</p>
      </div>

      {/* Progress */}
      <div>
        <div className="card-progress-row">
          <span className={`card-raised-label${prelaunch ? ' card-raised-label--prelaunch' : ' card-raised-label--active'}`}>
            {unclaimed
              ? 'Awaiting operator'
              : claimed
              ? 'Wallet pending'
              : prelaunch
              ? 'Pre-launch'
              : `$${campaign.raised.toLocaleString()} raised`}
          </span>
          <span className="card-goal-label">${campaign.goal.toLocaleString()} goal</span>
        </div>
        <div className="card-progress-track">
          <div
            className={`card-progress-fill ${funded ? 'card-progress-fill--funded' : 'card-progress-fill--active'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="card-meta">
        <div className="card-meta-left">
          <span className="card-meta-item">
            <MapPin size={11} />
            {campaign.location}
          </span>
          <span className="card-meta-item">
            <Clock size={11} />
            {funded
              ? 'Complete'
              : unclaimed
              ? 'Open to claim'
              : prelaunch
              ? 'Launching soon'
              : `${daysLeft} days left`}
          </span>
        </div>
        {campaign.source && (
          <a
            href={campaign.source}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="card-source-link"
          >
            Source <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  )
}
