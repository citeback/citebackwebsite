import { X, Copy, CheckCircle, MapPin, Clock, ExternalLink, Rocket, Camera, Lock, GitMerge, Zap, Award, ThumbsUp, Share2, Users, Wallet } from 'lucide-react'
import { API_BASE } from '../config.js'
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
  const AI_URL = API_BASE
  const { isLoggedIn, user } = useAuth()
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
        credentials: 'include',
      })
      const d = await r.json()
      if (!r.ok) { setClaimError(d.error || 'Claim failed'); setClaiming(false); return }
      // Refresh single campaign via targeted endpoint
      const cr = await fetch(`${AI_URL}/api/campaigns/${campaign.id}`)
      if (cr.ok) { const updated = await cr.json(); setCampaign(updated) }
      setClaiming(false)
    } catch (e) { setClaimError('Network error — try again'); setClaiming(false) }
  }

  const handleSaveOperator = async () => {
    setSavingWallet(true); setSaveError(''); setSaveSuccess(false)
    try {
      const r = await fetch(`${AI_URL}/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(operatorForm),
      })
      const d = await r.json()
      if (!r.ok) { setSaveError(d.error || 'Save failed'); setSavingWallet(false); return }
      // Refresh single campaign via targeted endpoint
      const cr = await fetch(`${AI_URL}/api/campaigns/${campaign.id}`)
      if (cr.ok) { const updated = await cr.json(); setCampaign(updated) }
      setSaveSuccess(true); setSavingWallet(false)
    } catch (e) { setSaveError('Network error — try again'); setSavingWallet(false) }
  }

  const copyWallet = () => {
    navigator.clipboard.writeText(activeWallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClose}
      role="presentation"
      className="cm-backdrop"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={e => e.stopPropagation()}
        className="cm-container"
      >
        {/* Header */}
        <div className="cm-header">
          <div className="cm-header-top">
            <span
              className="cm-type-badge"
              style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text }}
            >{tc.label}</span>
            <button onClick={onClose} aria-label="Close campaign details" className="cm-close-btn">
              <X size={20} />
            </button>
          </div>
          <h2 id={headingId} className="cm-title">{campaign.title}</h2>
          <p className="cm-description">{campaign.description}</p>
          {campaign.source && (
            <a href={campaign.source} target="_blank" rel="noopener noreferrer" className="cm-source-link">
              <ExternalLink size={11} /> Source / public record
            </a>
          )}
        </div>

        {/* Progress */}
        <div className="cm-progress-section">
          <div className="cm-progress-row">
            <div>
              <div className="cm-progress-raised">
                {unclaimed ? 'Seeking Operator' : prelaunch ? 'Pre-Launch' : `$${campaign.raised.toLocaleString()}`}
              </div>
              <div className="cm-progress-label">
                {unclaimed ? 'Campaign available to claim' : prelaunch ? 'Wallet pending — being set up' : `of $${campaign.goal.toLocaleString()} goal`}
              </div>
            </div>
            <div className="cm-progress-right">
              <div className="cm-progress-goal">
                ${campaign.goal.toLocaleString()}
              </div>
              <div className="cm-progress-label">funding goal</div>
            </div>
          </div>
          <div className="cm-progress-track">
            <div className="cm-progress-fill" style={{ width: prelaunch ? '0%' : `${pct}%` }} />
          </div>
          <div className="cm-progress-meta">
            <span className="cm-progress-meta-item"><MapPin size={11} />{campaign.location}</span>
            <span className="cm-progress-meta-item"><Clock size={11} />
              {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="cm-body">

          {/* Win condition — all non-verify campaigns */}
          {campaign.type !== 'verify' && campaign.winCondition && (
            <div className="cm-win-condition">
              <div className="cm-section-label--green">Win Condition</div>
              <div className="cm-win-condition-text">{campaign.winCondition}</div>
            </div>
          )}

          {/* Milestones */}
          {campaign.milestones && campaign.milestones.length > 0 && (
            <div className="cm-milestones">
              <div className="cm-section-label">Funding Milestones</div>
              {campaign.milestones.map((m, i) => (
                <div key={i} className="cm-milestone-item">
                  <div className="cm-milestone-row">
                    <div className="cm-milestone-label">{m.label}</div>
                    <div className="cm-milestone-amount">${m.amount.toLocaleString()}</div>
                  </div>
                  <div className="cm-milestone-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          )}

          {campaign.type === 'verify' ? (
            /* Verification Bounty — full game theory breakdown */
            <div className="cm-flex-col-16">

              {/* Phase 2 architecture notice */}
              <div className="cm-phase2-notice">
                <span className="cm-phase2-icon">⚙️</span>
                <div>
                  <div className="cm-phase2-title">Phase 2 Architecture — In Development</div>
                  <div className="cm-phase2-desc">
                    The anti-fraud system below describes the planned verification infrastructure. Staking, consensus, and IPFS storage are not yet live. This campaign opens when the system is built and audited.
                  </div>
                </div>
              </div>


              {/* How it works */}
              <div className="cm-how-it-works">
                <div className="cm-how-it-works-title">
                  <Zap size={15} /> How Verification Bounties Work
                </div>
                <div className="cm-steps-list">
                  {[
                    { icon: <Camera size={13} />, label: 'Spot a camera', desc: 'Submit GPS-tagged photo. Hash committed first — prevents copying.' },
                    { icon: <Lock size={13} />, label: 'Stake to verify', desc: `Put up ${campaign.verifyMeta?.stakeRequired || 0.25} XMR stake. Fraud = lose stake. Makes lying expensive.` },
                    { icon: <GitMerge size={13} />, label: '3-of-3 consensus', desc: 'Three independent verifiers must agree. Byzantine fault tolerant — one bad actor can\'t fake it.' },
                    { icon: <Award size={13} />, label: 'Earn bounty', desc: `$${campaign.verifyMeta?.bountyPerCamera || 1.50} per confirmed camera. Bonus $${campaign.verifyMeta?.bonusNewArea || 2.00} for unmapped areas.` },
                  ].map((s, i) => (
                    <div key={i} className="cm-step-row">
                      <div className="cm-step-icon">{s.icon}</div>
                      <div>
                        <div className="cm-step-label">{s.label}</div>
                        <div className="cm-step-desc">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-fraud stack */}
              <div className="cm-antifraud-box">
                <div className="cm-antifraud-title">Anti-Fraud Stack</div>
                <div className="anti-fraud-grid">
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
                    <div key={i} className="cm-antifraud-item">
                      <CheckCircle size={11} className="cm-antifraud-check" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="cm-stats-grid">
                {[
                  { label: 'Cameras targeted', value: (campaign.verifyMeta?.camerasTargeted || 0).toLocaleString() },
                  { label: 'Bounty per camera', value: `$${campaign.verifyMeta?.bountyPerCamera || 1.50}` },
                  { label: 'Confirmations req.', value: `${campaign.verifyMeta?.confirmationsRequired || 3}-of-3` },
                ].map((s, i) => (
                  <div key={i} className="cm-stat-item">
                    <div className="cm-stat-value">{s.value}</div>
                    <div className="cm-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="cm-wallet-pending-text">
                Wallets pending activation. Fund this campaign to open the bounty pool.
                Verifiers apply through the Expert Directory. All payouts in XMR — anonymous, instant, no bank required.
              </div>

              <div className="cm-info-box">
                <strong className="cm-strong-text">No notifications — by design.</strong><br />
                Citeback doesn't collect emails or contact info. Bookmark this page — bounties will appear here when the wallet activates.
              </div>
            </div>

          ) : unclaimed ? (
            /* Unclaimed — needs an operator */
            <div className="cm-flex-col-16">
              <div className="cm-unclaimed-banner">
                <div className="cm-banner-header">
                  <Users size={16} className="cm-icon-purple" /> This Campaign Needs an Operator
                </div>
                <p className="cm-muted-text">
                  This is a suggested campaign — fully researched and ready to run. An Operator claims it, adds their own
                  XMR and ZANO wallet addresses, and runs the campaign. All contributions go directly to the operator's wallet.
                  Citeback never holds funds.
                </p>
                {campaign.operatorName && (
                  <p className="cm-operator-name">Operator: <strong className="cm-strong-text">{campaign.operatorName}</strong></p>
                )}
              </div>

              {!isLoggedIn ? (
                <div className="cm-info-box">
                  <strong className="cm-strong-text">Log in to claim this campaign.</strong><br />
                  You need an Operator account (10+ reputation points).
                </div>
              ) : !canClaim ? (
                <div className="cm-info-box">
                  <strong className="cm-strong-text">Operator tier required.</strong><br />
                  Earn 10+ reputation points by submitting verified camera sightings. You have {user?.reputation || 0} pts ({10 - (user?.reputation || 0)} more needed).
                </div>
              ) : (
                <div className="cm-flex-col-10">
                  {claimError && <div className="cm-claim-error">{claimError}</div>}
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="cm-claim-btn"
                  >
                    <Users size={16} />
                    {claiming ? 'Claiming…' : 'Claim this Campaign'}
                  </button>
                  <p className="cm-claim-note">
                    After claiming, add your XMR and ZANO wallet addresses to activate the campaign.
                  </p>
                </div>
              )}
            </div>

          ) : isUserOperator && !hasWallet ? (
            /* Operator — needs to add wallet */
            <div className="cm-flex-col-14">
              <div className="cm-unclaimed-banner">
                <div className="cm-banner-header">
                  <Wallet size={16} className="cm-icon-purple" /> You're the Operator — Add Your Wallets
                </div>
                <p className="cm-muted-text">
                  Add your XMR and ZANO wallet addresses to activate this campaign. Contributors will send funds directly to your wallets — Citeback never holds funds.
                </p>
              </div>

              {[['Monero (XMR) wallet address', 'walletXmr', 'Your XMR address…'], ['Zano (ZANO) wallet address', 'walletZano', 'Your ZANO address…'], ['Your name or alias (public)', 'operatorName', 'e.g. Taos Privacy Coalition'], ['About you / this effort (public)', 'operatorBio', 'Brief background on who\'s running this campaign…']].map(([label, key, placeholder]) => (
                <div key={key} className="cm-form-field">
                  <label className="cm-form-label">{label}</label>
                  {key === 'operatorBio' ? (
                    <textarea
                      value={operatorForm[key]} onChange={e => setOperatorForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder} rows={3}
                      className="cm-form-textarea"
                    />
                  ) : (
                    <input
                      value={operatorForm[key]} onChange={e => setOperatorForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="cm-form-input"
                    />
                  )}
                </div>
              ))}

              {saveError && <div className="cm-save-error">{saveError}</div>}
              {saveSuccess && <div className="cm-save-success">✓ Saved! Campaign will activate once both wallets are set.</div>}

              <button
                onClick={handleSaveOperator}
                disabled={savingWallet || (!operatorForm.walletXmr && !operatorForm.walletZano && !operatorForm.operatorName && !operatorForm.operatorBio)}
                className="cm-save-btn"
              >
                {savingWallet ? 'Saving…' : 'Save & Activate'}
              </button>
            </div>

          ) : !hasWallet ? (
            /* Pre-launch state (generic — claimed by someone else, no wallet yet) */
            <div className="cm-flex-col-14">
              <div className="cm-prelaunch-banner">
                <div className="cm-banner-header">
                  <Rocket size={16} className="cm-icon-accent" /> Pre-Launch Campaign
                </div>
                <p className="cm-muted-text">
                  This campaign has been claimed and is being prepared for launch. The operator is setting up their wallet addresses. Check back soon.
                </p>
              </div>

              {/* Interest signal */}
              <div className="cm-actions">
                <button
                  onClick={handleInterest}
                  disabled={interested}
                  aria-label={interested ? 'Interest recorded' : 'Signal interest in this campaign'}
                  className={`cm-interest-btn${interested ? ' cm-interest-btn--recorded' : ''}`}
                >
                  <ThumbsUp size={15} />
                  {interested ? 'Interest Recorded' : 'Signal Interest — helps prioritize launch order'}
                  {interestCount > 0 && (
                    <span
                      className={`cm-interest-count${interested ? ' cm-interest-count--active' : ''}`}
                    >
                      {interestCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share this campaign"
                  className={`cm-share-btn${shared ? ' cm-share-btn--shared' : ''}`}
                >
                  <Share2 size={14} />
                  {shared ? 'Copied!' : 'Share'}
                </button>
              </div>

              <div className="cm-info-box">
                <strong className="cm-strong-text">No notifications — by design.</strong><br />
                Anonymous interest signal only. When wallets activate,
                both XMR and ZANO addresses will appear right here. Bookmark this page and check back.
              </div>
            </div>

          ) : funded ? (
            /* Funded state */
            <div className="cm-flex-col-14">
              <div className="cm-funded-notice">
                <CheckCircle size={18} /> Fully funded. Action in progress.
              </div>
              <div className="cm-funded-box">
                <div className="cm-proof-label">Proof of Execution</div>
                <div className="cm-muted-text">
                  Receipt, vendor invoice, and photo documentation will be posted here upon completion.
                </div>
              </div>
            </div>

          ) : (
            /* Active — fund with XMR or ZANO */
            <>
              {/* Currency selector */}
              <div className="cm-wallet-tabs">
                {hasXMR && (
                  <button className={`cm-wallet-tab${currency === 'XMR' ? ' cm-wallet-tab--active' : ''}`} onClick={() => { setCurrency('XMR'); setCopied(false) }}>
                    ⬛ Monero (XMR)
                  </button>
                )}
                {hasZano && (
                  <button className={`cm-wallet-tab${currency === 'ZANO' ? ' cm-wallet-tab--active' : ''}`} onClick={() => { setCurrency('ZANO'); setCopied(false) }}>
                    🟣 Zano (ZANO)
                  </button>
                )}
              </div>

              {/* Address / QR tabs */}
              <div className="cm-wallet-tabs">
                <button className={`cm-wallet-tab${walletTab === 'address' ? ' cm-wallet-tab--active' : ''}`} onClick={() => setWalletTab('address')}>Wallet Address</button>
                <button className={`cm-wallet-tab${walletTab === 'qr' ? ' cm-wallet-tab--active' : ''}`} onClick={() => setWalletTab('qr')}>QR Code</button>
              </div>

              {walletTab === 'address' ? (
                <div>
                  <div className="cm-wallet-label">
                    {currency === 'XMR' ? 'Monero (XMR)' : 'Zano (ZANO)'} — This Campaign Only
                  </div>
                  <div className="cm-wallet-address">
                    {activeWallet}
                  </div>
                  <button onClick={copyWallet} className={`cm-copy-btn${copied ? ' cm-copy-btn--copied' : ''}`}>
                    {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy {currency} Address</>}
                  </button>
                </div>
              ) : (
                <div className="cm-qr-container">
                  <div className="cm-qr-box">
                    <QRCodeSVG
                      value={currency === 'XMR' ? `monero:${activeWallet}` : `zano:${activeWallet}`}
                      size={180}
                    />
                  </div>
                  <p className="cm-qr-desc">
                    Scan with any {currency === 'XMR' ? 'Monero' : 'Zano'} wallet app. Amount is up to you.
                  </p>
                </div>
              )}

              <div className="cm-wallet-note">
                {currency === 'XMR' ? (
                  <><strong className="cm-strong-text">New to Monero?</strong>{' '}
                  Download <a href="https://cakewallet.com" target="_blank" rel="noopener noreferrer" className="cm-link">Cake Wallet</a> (iOS/Android),{' '}
                  <a href="https://monerujo.io" target="_blank" rel="noopener noreferrer" className="cm-link">Monerujo</a> (Android), or{' '}
                  <a href="https://featherwallet.org" target="_blank" rel="noopener noreferrer" className="cm-link">Feather Wallet</a> (desktop — built-in Tor).{' '}
                  Get XMR via <a href="https://haveno.exchange" target="_blank" rel="noopener noreferrer" className="cm-link">Haveno</a> (P2P DEX, no KYC) or{' '}
                  <a href="https://xmrswap.me" target="_blank" rel="noopener noreferrer" className="cm-link">atomic swap</a> (BTC→XMR, no KYC). For maximum privacy, broadcast your transaction over Tor.</>
                ) : (
                  <><strong className="cm-strong-text">New to Zano?</strong>{' '}
                  Download the <a href="https://zano.org/downloads" target="_blank" rel="noopener noreferrer" className="cm-link">Zano Wallet</a> (desktop) or{' '}
                  <a href="https://cakewallet.com" target="_blank" rel="noopener noreferrer" className="cm-link">Cake Wallet</a> (mobile — Zano supported).{' '}
                  Get ZANO at <a href="https://tradeogre.com" target="_blank" rel="noopener noreferrer" className="cm-link">TradeOgre</a> (no KYC) or{' '}
                  <a href="https://www.kucoin.com" target="_blank" rel="noopener noreferrer" className="cm-link">KuCoin</a> (KYC required).</>
                )}
              </div>

              {/* Official domains disclaimer */}
              <div className="cm-disclaimer">
                ⚠️ <strong className="cm-strong-warn">Only contribute to campaigns from an official Citeback domain.</strong>{' '}
                Official sites: citeback.com · citeback.net · citeback.org
              </div>
            </>
          )}

          {/* Tags */}
          <div className="cm-tags">
            {campaign.tags.map(t => (
              <span key={t} className="cm-tag">#{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
