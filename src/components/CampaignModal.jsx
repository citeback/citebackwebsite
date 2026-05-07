import { X, Copy, CheckCircle, MapPin, Clock, ExternalLink, Rocket, Camera, Lock, GitMerge, Zap, Award, ThumbsUp, Share2, Users, Wallet } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { typeColors } from '../data/campaigns'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

function getDaysLeft(deadline) {
  return Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
}

export default function CampaignModal({ campaign: initialCampaign, onClose }) {
  const [campaign, setCampaign] = useState(initialCampaign)
  const [copied, setCopied] = useState(false)
  const [walletTab, setWalletTab] = useState('address')
  const [currency, setCurrency] = useState('XMR')
  const [interested, setInterested] = useState(() => {
    try { return !!localStorage.getItem(`cb_int_${initialCampaign.id}`) } catch { return false }
  })
  const [interestCount, setInterestCount] = useState(0)
  const [shared, setShared] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [operatorForm, setOperatorForm] = useState({ walletXmr: '', walletZano: '', operatorName: '', operatorBio: '' })
  const [savingWallet, setSavingWallet] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const modalRef = useRef(null)
  const AI_URL = 'https://ai.citeback.com'
  const { isLoggedIn, user, token } = useAuth()
  const headingId = 'campaign-modal-heading'

  useEffect(() => {
    fetch(`${AI_URL}/interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'counts' }),
    })
      .then(r => r.json())
      .then(d => { if (d.counts) setInterestCount(d.counts[campaign.id] || 0) })
      .catch(() => {})
  }, [campaign.id])

  const handleInterest = async () => {
    if (interested) return
    try {
      const r = await fetch(`${AI_URL}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment', campaignId: campaign.id }),
      })
      const d = await r.json()
      setInterestCount(d.count || interestCount + 1)
    } catch { setInterestCount(c => c + 1) }
    try { localStorage.setItem(`cb_int_${campaign.id}`, '1') } catch {}
    setInterested(true)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/campaigns/${campaign.id}`
    if (navigator.share) {
      navigator.share({ title: campaign.title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).catch(() => {})
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab') {
        const focusableNow = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstNow = focusableNow[0]
        const lastNow = focusableNow[focusableNow.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === firstNow) { e.preventDefault(); lastNow?.focus() }
        } else {
          if (document.activeElement === lastNow) { e.preventDefault(); firstNow?.focus() }
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])
  const pct = campaign.walletXMR ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0
  const tc = typeColors[campaign.type]
  const funded = campaign.status === 'funded'
  const unclaimed = campaign.status === 'unclaimed'
  const prelaunch = !campaign.walletXMR
  const daysLeft = getDaysLeft(campaign.deadline)
  const isUserOperator = isLoggedIn && user && campaign.operatorId === user.id
  const canClaim = isLoggedIn && user && (user.tier >= 1) && unclaimed

  const activeWallet = currency === 'XMR' ? campaign.walletXMR : campaign.walletZANO
  const hasZano = !!campaign.walletZANO
  const hasXMR = !!campaign.walletXMR
  const hasWallet = hasXMR || hasZano

  const handleClaim = async () => {
    setClaiming(true); setClaimError('')
    try {
      const r = await fetch(`${AI_URL}/api/campaigns/${campaign.id}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const d = await r.json()
      if (!r.ok) { setClaimError(d.error || 'Claim failed'); setClaiming(false); return }
      // Refresh campaign data
      const cr = await fetch(`${AI_URL}/api/campaigns`)
      const all = await cr.json()
      const updated = all.find(c => c.id === campaign.id)
      if (updated) setCampaign(updated)
      setClaiming(false)
    } catch (e) { setClaimError('Network error — try again'); setClaiming(false) }
  }

  const handleSaveOperator = async () => {
    setSavingWallet(true); setSaveError(''); setSaveSuccess(false)
    try {
      const r = await fetch(`${AI_URL}/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(operatorForm),
      })
      const d = await r.json()
      if (!r.ok) { setSaveError(d.error || 'Save failed'); setSavingWallet(false); return }
      // Refresh campaign
      const cr = await fetch(`${AI_URL}/api/campaigns`)
      const all = await cr.json()
      const updated = all.find(c => c.id === campaign.id)
      if (updated) setCampaign(updated)
      setSaveSuccess(true); setSavingWallet(false)
    } catch (e) { setSaveError('Network error — try again'); setSavingWallet(false) }
  }

  const copyWallet = () => {
    navigator.clipboard.writeText(activeWallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabStyle = (active) => ({
    flex: 1, padding: '8px', borderRadius: 7, fontWeight: 600, fontSize: 13,
    background: active ? 'var(--bg)' : 'transparent',
    border: active ? '1px solid var(--border)' : '1px solid transparent',
    color: active ? 'var(--text)' : 'var(--muted)',
    cursor: 'pointer',
  })

  return (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(8px, 3vw, 24px)',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 20, maxWidth: 560, width: '100%',
          maxHeight: '92vh', overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: 'clamp(16px, 4vw, 24px) clamp(16px, 5vw, 28px) 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <span style={{
              background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
              padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{tc.label}</span>
            <button onClick={onClose} aria-label="Close campaign details" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 8, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          </div>
          <h2 id={headingId} style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>{campaign.title}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: 14 }}>{campaign.description}</p>
          {campaign.source && (
            <a href={campaign.source} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              color: 'var(--muted)', fontSize: 12, marginTop: 12,
              borderBottom: '1px solid var(--border)',
            }}>
              <ExternalLink size={11} /> Source / public record
            </a>
          )}
        </div>

        {/* Progress */}
        <div style={{ padding: '18px clamp(16px, 5vw, 28px)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px' }}>
                {unclaimed ? 'Seeking Operator' : prelaunch ? 'Pre-Launch' : `$${campaign.raised.toLocaleString()}`}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                {unclaimed ? 'Campaign available to claim' : prelaunch ? 'Wallet pending — being set up' : `of $${campaign.goal.toLocaleString()} goal`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)' }}>
                ${campaign.goal.toLocaleString()}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>funding goal</div>
            </div>
          </div>
          <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 100, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{
              width: prelaunch ? '0%' : `${pct}%`, height: '100%',
              background: 'linear-gradient(90deg, var(--accent), #ff6b6b)',
              borderRadius: 100,
            }} />
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{campaign.location}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />
              {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(16px, 4vw, 24px) clamp(16px, 5vw, 28px)', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Win condition — all non-verify campaigns */}
          {campaign.type !== 'verify' && campaign.winCondition && (
            <div style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Win Condition</div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>{campaign.winCondition}</div>
            </div>
          )}

          {/* Milestones */}
          {campaign.milestones && campaign.milestones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Funding Milestones</div>
              {campaign.milestones.map((m, i) => (
                <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>${m.amount.toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          )}

          {campaign.type === 'verify' ? (
            /* Verification Bounty — full game theory breakdown */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Phase 2 architecture notice */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 10, padding: '12px 14px',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚙️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#818cf8', marginBottom: 3 }}>Phase 2 Architecture — In Development</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                    The anti-fraud system below describes the planned verification infrastructure. Staking, consensus, and IPFS storage are not yet live. This campaign opens when the system is built and audited.
                  </div>
                </div>
              </div>


              {/* How it works */}
              <div style={{ background: 'rgba(243,156,18,0.06)', border: '1px solid rgba(243,156,18,0.2)', borderRadius: 12, padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: '#f39c12', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={15} /> How Verification Bounties Work
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: <Camera size={13} />, label: 'Spot a camera', desc: 'Submit GPS-tagged photo. Hash committed first — prevents copying.' },
                    { icon: <Lock size={13} />, label: 'Stake to verify', desc: `Put up ${campaign.verifyMeta?.stakeRequired || 0.25} XMR stake. Fraud = lose stake. Makes lying expensive.` },
                    { icon: <GitMerge size={13} />, label: '3-of-3 consensus', desc: 'Three independent verifiers must agree. Byzantine fault tolerant — one bad actor can\'t fake it.' },
                    { icon: <Award size={13} />, label: 'Earn bounty', desc: `$${campaign.verifyMeta?.bountyPerCamera || 1.50} per confirmed camera. Bonus $${campaign.verifyMeta?.bonusNewArea || 2.00} for unmapped areas.` },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ color: '#f39c12', marginTop: 1, flexShrink: 0 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-fraud stack */}
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Anti-Fraud Stack</div>
                <div className="anti-fraud-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    'Commit-reveal scheme',
                    'GPS metadata required',
                    '72hr time-lock on photos',
                    'Perceptual hash dedup',
                    'Stake slashing on fraud',
                    'Reputation multiplier',
                    'Geographic diversity bonus',
                    'IPFS permanent storage',
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
                      <CheckCircle size={11} style={{ color: 'var(--green)', flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'Cameras targeted', value: (campaign.verifyMeta?.camerasTargeted || 0).toLocaleString() },
                  { label: 'Bounty per camera', value: `$${campaign.verifyMeta?.bountyPerCamera || 1.50}` },
                  { label: 'Confirmations req.', value: `${campaign.verifyMeta?.confirmationsRequired || 3}-of-3` },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#f39c12', letterSpacing: '-0.5px' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, padding: '0 2px' }}>
                Wallets pending activation. Fund this campaign to open the bounty pool.
                Verifiers apply through the Expert Directory. All payouts in XMR — anonymous, instant, no bank required.
              </div>

              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, textAlign: 'center' }}>
                <strong style={{ color: 'var(--text)' }}>No notifications — by design.</strong><br />
                Citeback doesn't collect emails or contact info. Bookmark this page — bounties will appear here when the wallet activates.
              </div>
            </div>

          ) : unclaimed ? (
            /* Unclaimed — needs an operator */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(155,89,182,0.07)', border: '1px solid rgba(155,89,182,0.25)', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 8 }}>
                  <Users size={16} style={{ color: '#9b59b6' }} /> This Campaign Needs an Operator
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  This is a suggested campaign — fully researched and ready to run. An Operator claims it, adds their own
                  XMR and ZANO wallet addresses, and runs the campaign. All contributions go directly to the operator\'s wallet.
                  Citeback never holds funds.
                </p>
                {campaign.operatorName && (
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Operator: <strong style={{ color: 'var(--text)' }}>{campaign.operatorName}</strong></p>
                )}
              </div>

              {!isLoggedIn ? (
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Log in to claim this campaign.</strong><br />
                  You need an Operator account (10+ reputation points).
                </div>
              ) : !canClaim ? (
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Operator tier required.</strong><br />
                  Earn 10+ reputation points by submitting verified camera sightings. You have {user?.reputation || 0} pts ({10 - (user?.reputation || 0)} more needed).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {claimError && <div style={{ color: 'var(--accent)', fontSize: 13, textAlign: 'center' }}>{claimError}</div>}
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    style={{
                      background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.4)',
                      color: '#bb8fce', borderRadius: 10, padding: '14px 20px',
                      fontWeight: 700, fontSize: 15, cursor: claiming ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    <Users size={16} />
                    {claiming ? 'Claiming…' : 'Claim this Campaign'}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
                    After claiming, add your XMR and ZANO wallet addresses to activate the campaign.
                  </p>
                </div>
              )}
            </div>

          ) : isUserOperator && !hasWallet ? (
            /* Operator — needs to add wallet */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(155,89,182,0.07)', border: '1px solid rgba(155,89,182,0.25)', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 8 }}>
                  <Wallet size={16} style={{ color: '#9b59b6' }} /> You\'re the Operator — Add Your Wallets
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  Add your XMR and ZANO wallet addresses to activate this campaign. Contributors will send funds directly to your wallets — Citeback never holds funds.
                </p>
              </div>

              {[['Monero (XMR) wallet address', 'walletXmr', 'Your XMR address…'], ['Zano (ZANO) wallet address', 'walletZano', 'Your ZANO address…'], ['Your name or alias (public)', 'operatorName', 'e.g. Taos Privacy Coalition'], ['About you / this effort (public)', 'operatorBio', 'Brief background on who\'s running this campaign…']].map(([label, key, placeholder]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</label>
                  {key === 'operatorBio' ? (
                    <textarea
                      value={operatorForm[key]} onChange={e => setOperatorForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder} rows={3}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <input
                      value={operatorForm[key]} onChange={e => setOperatorForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                    />
                  )}
                </div>
              ))}

              {saveError && <div style={{ color: 'var(--accent)', fontSize: 13 }}>{saveError}</div>}
              {saveSuccess && <div style={{ color: 'var(--green)', fontSize: 13 }}>✓ Saved! Campaign will activate once both wallets are set.</div>}

              <button
                onClick={handleSaveOperator}
                disabled={savingWallet || (!operatorForm.walletXmr && !operatorForm.walletZano && !operatorForm.operatorName && !operatorForm.operatorBio)}
                style={{
                  background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.4)',
                  color: '#bb8fce', borderRadius: 10, padding: '12px 20px',
                  fontWeight: 700, fontSize: 14, cursor: savingWallet ? 'default' : 'pointer',
                }}
              >
                {savingWallet ? 'Saving…' : 'Save & Activate'}
              </button>
            </div>

          ) : !hasWallet ? (
            /* Pre-launch state (generic — claimed by someone else, no wallet yet) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.2)',
                borderRadius: 12, padding: 18,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 8 }}>
                  <Rocket size={16} style={{ color: 'var(--accent)' }} /> Pre-Launch Campaign
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  This campaign has been claimed and is being prepared for launch. The operator is setting up their wallet addresses. Check back soon.
                </p>
              </div>

              {/* Interest signal */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  onClick={handleInterest}
                  disabled={interested}
                  aria-label={interested ? 'Interest recorded' : 'Signal interest in this campaign'}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: interested ? 'rgba(46,204,113,0.1)' : 'var(--bg3)',
                    border: `1px solid ${interested ? 'rgba(46,204,113,0.3)' : 'var(--border)'}`,
                    color: interested ? 'var(--green)' : 'var(--text)',
                    borderRadius: 10, padding: '12px 16px', fontWeight: 600, fontSize: 14,
                    cursor: interested ? 'default' : 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <ThumbsUp size={15} />
                  {interested ? 'Interest Recorded' : 'Signal Interest — helps prioritize launch order'}
                  {interestCount > 0 && (
                    <span style={{
                      background: interested ? 'rgba(46,204,113,0.2)' : 'var(--bg2)',
                      border: '1px solid var(--border)',
                      borderRadius: 100, padding: '1px 8px', fontSize: 11, fontWeight: 700,
                    }}>
                      {interestCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share this campaign"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    color: shared ? 'var(--green)' : 'var(--muted)',
                    borderRadius: 10, padding: '12px 16px', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}
                >
                  <Share2 size={14} />
                  {shared ? 'Copied!' : 'Share'}
                </button>
              </div>

              <div style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, textAlign: 'center',
              }}>
                <strong style={{ color: 'var(--text)' }}>No notifications — by design.</strong><br />
                Anonymous interest signal only. When wallets activate,
                both XMR and ZANO addresses will appear right here. Bookmark this page and check back.
              </div>
            </div>

          ) : funded ? (
            /* Funded state */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.25)',
                borderRadius: 10, padding: 16, color: 'var(--green)', fontWeight: 600,
              }}>
                <CheckCircle size={18} /> Fully funded. Action in progress.
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Proof of Execution</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  Receipt, vendor invoice, and photo documentation will be posted here upon completion.
                </div>
              </div>
            </div>

          ) : (
            /* Active — fund with XMR or ZANO */
            <>
              {/* Currency selector */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 10, padding: 4 }}>
                {hasXMR && (
                  <button style={tabStyle(currency === 'XMR')} onClick={() => { setCurrency('XMR'); setCopied(false) }}>
                    ⬛ Monero (XMR)
                  </button>
                )}
                {hasZano && (
                  <button style={tabStyle(currency === 'ZANO')} onClick={() => { setCurrency('ZANO'); setCopied(false) }}>
                    🟣 Zano (ZANO)
                  </button>
                )}
              </div>

              {/* Address / QR tabs */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 10, padding: 4 }}>
                <button style={tabStyle(walletTab === 'address')} onClick={() => setWalletTab('address')}>Wallet Address</button>
                <button style={tabStyle(walletTab === 'qr')} onClick={() => setWalletTab('qr')}>QR Code</button>
              </div>

              {walletTab === 'address' ? (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {currency === 'XMR' ? 'Monero (XMR)' : 'Zano (ZANO)'} — This Campaign Only
                  </div>
                  <div style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                    padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 11,
                    wordBreak: 'break-all', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12,
                    userSelect: 'all',
                  }}>
                    {activeWallet}
                  </div>
                  <button onClick={copyWallet} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center',
                    background: copied ? 'rgba(46,204,113,0.8)' : 'var(--accent)',
                    border: 'none', color: '#fff', padding: '12px 20px', borderRadius: 9,
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  }}>
                    {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy {currency} Address</>}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <div style={{ background: 'white', padding: 16, borderRadius: 12 }}>
                    <QRCodeSVG
                      value={currency === 'XMR' ? `monero:${activeWallet}` : `zano:${activeWallet}`}
                      size={180}
                    />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
                    Scan with any {currency === 'XMR' ? 'Monero' : 'Zano'} wallet app. Amount is up to you.
                  </p>
                </div>
              )}

              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                {currency === 'XMR' ? (
                  <><strong style={{ color: 'var(--text)' }}>New to Monero?</strong>{' '}
                  Download <a href="https://cakewallet.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Cake Wallet</a> (iOS/Android),{' '}
                  <a href="https://monerujo.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Monerujo</a> (Android), or{' '}
                  <a href="https://featherwallet.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Feather Wallet</a> (desktop — built-in Tor).{' '}
                  Get XMR via <a href="https://haveno.exchange" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Haveno</a> (P2P DEX, no KYC) or{' '}
                  <a href="https://xmrswap.me" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>atomic swap</a> (BTC→XMR, no KYC). For maximum privacy, broadcast your transaction over Tor.</>
                ) : (
                  <><strong style={{ color: 'var(--text)' }}>New to Zano?</strong>{' '}
                  Download the <a href="https://zano.org/downloads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Zano Wallet</a> (desktop) or{' '}
                  <a href="https://cakewallet.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Cake Wallet</a> (mobile — Zano supported).{' '}
                  Get ZANO at <a href="https://tradeogre.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>TradeOgre</a> (no KYC) or{' '}
                  <a href="https://www.kucoin.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>KuCoin</a> (KYC required).</>
                )}
              </div>

              {/* Official domains disclaimer */}
              <div style={{ background: 'rgba(243,156,18,0.06)', border: '1px solid rgba(243,156,18,0.2)', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>
                ⚠️ <strong style={{ color: '#f39c12' }}>Only contribute to campaigns from an official Citeback domain.</strong>{' '}
                Official sites: citeback.com · citeback.net · citeback.org
              </div>
            </>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {campaign.tags.map(t => (
              <span key={t} style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                padding: '3px 10px', borderRadius: 100, fontSize: 11, color: 'var(--muted)',
              }}>#{t}</span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .anti-fraud-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
