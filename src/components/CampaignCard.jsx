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

  const handleShare = (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/campaigns/${campaign.id}`
    if (navigator.share) {
      navigator.share({ title: campaign.title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).catch(() => {})
    }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const cardStatus = funded ? 'funded' : urgent ? 'urgent' : prelaunch ? 'prelaunch' : 'default'

  return (
    <div
      onClick={onClick}
      className="campaign-card"
      data-status={cardStatus}
    >
      {/* Top row */}
      <div className="card-top">
        <span className="campaign-type-badge" style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text }}>
          {tc.label}
        </span>
        <div className="card-badges">
          {funded && <span className="card-badge card-badge--funded"><CheckCircle size={13} /> Funded</span>}
          {unclaimed && <span className="card-badge card-badge--operator"><Users size={12} /> Seeking Operator</span>}
          {claimed && !unclaimed && <span className="card-badge card-badge--pending"><Rocket size={12} /> Wallet Pending</span>}
          {!unclaimed && !claimed && prelaunch && <span className="card-badge card-badge--pending"><Rocket size={12} /> Pre-Launch</span>}
          {urgent && <span className="card-badge card-badge--urgent"><Flame size={12} /> {daysLeft}d left</span>}
          <button
            onClick={handleShare}
            aria-label={shared ? 'Link copied' : 'Share campaign link'}
            className="card-share-btn"
            style={{ color: shared ? 'var(--green)' : 'var(--muted)' }}
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
          <span style={{ fontWeight: 700, color: prelaunch ? 'var(--muted)' : 'var(--text)' }}>
            {unclaimed ? 'Awaiting operator' : claimed ? 'Wallet pending' : prelaunch ? 'Pre-launch' : `$${campaign.raised.toLocaleString()} raised`}
          </span>
          <span style={{ color: 'var(--muted)' }}>${campaign.goal.toLocaleString()} goal</span>
        </div>
        <div className="card-progress-track">
          <div
            className={`card-progress-fill card-progress-fill--${funded ? 'funded' : 'active'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="card-meta">
        <div className="card-meta-left">
          <span className="card-meta-item"><MapPin size={11} />{campaign.location}</span>
          <span className="card-meta-item"><Clock size={11} />
            {funded ? 'Complete' : unclaimed ? 'Open to claim' : prelaunch ? 'Launching soon' : `${daysLeft} days left`}
          </span>
        </div>
        {campaign.source && (
          <a href={campaign.source} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="card-source-link">
            Source <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  )
}
