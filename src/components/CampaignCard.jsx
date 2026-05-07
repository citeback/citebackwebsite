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
    navigator.clipboard.writeText(`${window.location.origin}/#campaign-${campaign.id}`)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div onClick={onClick} style={{
      background: 'var(--card-bg)',
      backdropFilter: 'var(--card-blur)',
      border: `1px solid ${funded ? 'rgba(46,204,113,0.25)' : prelaunch ? 'rgba(230,57,70,0.15)' : urgent ? 'rgba(230,57,70,0.25)' : 'var(--card-border)'}`,
      borderRadius: 'var(--radius)',
      padding: 22,
      cursor: 'pointer',
      transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)'
      e.currentTarget.style.borderColor = 'rgba(230,57,70,0.4)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.borderColor = funded ? 'rgba(46,204,113,0.25)' : prelaunch ? 'rgba(230,57,70,0.15)' : urgent ? 'rgba(230,57,70,0.25)' : 'var(--card-border)'
    }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
          padding: '3px 10px', borderRadius: 0, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{tc.label}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {funded && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: 12, fontWeight: 600 }}><CheckCircle size={13} /> Funded</span>}
          {unclaimed && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9b59b6', fontSize: 11, fontWeight: 700 }}><Users size={12} /> Seeking Operator</span>}
          {claimed && !unclaimed && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f39c12', fontSize: 11, fontWeight: 700 }}><Rocket size={12} /> Wallet Pending</span>}
          {!unclaimed && !claimed && prelaunch && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f39c12', fontSize: 11, fontWeight: 700 }}><Rocket size={12} /> Pre-Launch</span>}
          {urgent && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f39c12', fontSize: 11, fontWeight: 700 }}><Flame size={12} /> {daysLeft}d left</span>}
          <button onClick={handleShare} aria-label={shared ? 'Link copied' : 'Copy campaign link'} style={{ background: 'none', border: 'none', color: shared ? 'var(--green)' : 'var(--muted)', cursor: 'pointer', padding: 8, minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {shared ? <CheckCircle size={14} /> : <Share2 size={14} />}
          </button>
        </div>
      </div>

      {/* Title + desc */}
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, marginBottom: 6 }}>{campaign.title}</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {campaign.description}
        </p>
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13 }}>
          <span style={{ fontWeight: 700, color: prelaunch ? 'var(--muted)' : 'var(--text)' }}>
            {unclaimed ? 'Awaiting operator' : claimed ? 'Wallet pending' : prelaunch ? 'Pre-launch' : `$${campaign.raised.toLocaleString()} raised`}
          </span>
          <span style={{ color: 'var(--muted)' }}>${campaign.goal.toLocaleString()} goal</span>
        </div>
        <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 0, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: funded ? 'var(--green)' : 'var(--red)',
            borderRadius: 0,
          }} />
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{campaign.location}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />
            {funded ? 'Complete' : unclaimed ? 'Open to claim' : prelaunch ? 'Launching soon' : `${daysLeft} days left`}
          </span>
        </div>
        {campaign.source && (
          <a href={campaign.source} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--accent)', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
            Source <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  )
}
