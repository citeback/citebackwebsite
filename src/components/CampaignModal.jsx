import { X, Copy, CheckCircle, MapPin, Clock, ExternalLink, Rocket, Bell, Camera, Lock, GitMerge, Zap, Award } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { typeColors } from '../data/campaigns'
import { useState } from 'react'

function getDaysLeft(deadline) {
  return Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
}

export default function CampaignModal({ campaign, onClose }) {
  const [copied, setCopied] = useState(false)
  const [walletTab, setWalletTab] = useState('address')
  const [interested, setInterested] = useState(false)
  const pct = campaign.walletXMR ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0
  const tc = typeColors[campaign.type]
  const funded = campaign.status === 'funded'
  const prelaunch = !campaign.walletXMR
  const daysLeft = getDaysLeft(campaign.deadline)

  const copyWallet = () => {
    navigator.clipboard.writeText(campaign.walletXMR)
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
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 20, maxWidth: 560, width: '100%',
        maxHeight: '92vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <span style={{
              background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
              padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{tc.label}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>{campaign.title}</h2>
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
        <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px' }}>
                {prelaunch ? 'Pre-Launch' : `$${campaign.raised.toLocaleString()}`}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                {prelaunch ? 'Wallet pending — collecting interest' : `of $${campaign.goal.toLocaleString()} goal`}
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
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {campaign.type === 'verify' ? (
            /* Verification Bounty — full game theory breakdown */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                Verifiers apply through the Human Registry. All payouts in XMR — anonymous, instant, no bank required.
              </div>

              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, textAlign: 'center' }}>
                <strong style={{ color: 'var(--text)' }}>No notifications — by design.</strong><br />
                Citeback doesn't collect emails or contact info. Bookmark this page — bounties will appear here when the wallet activates.
              </div>
            </div>

          ) : prelaunch ? (
            /* Pre-launch state */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.2)',
                borderRadius: 12, padding: 18,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 8 }}>
                  <Rocket size={16} style={{ color: 'var(--accent)' }} /> Pre-Launch Campaign
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  This campaign is verified and ready to launch. A dedicated Monero wallet will be published
                  directly on this page once the human operator is confirmed and funding opens.
                </p>
              </div>

              <div style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, textAlign: 'center',
              }}>
                <strong style={{ color: 'var(--text)' }}>No notifications — by design.</strong><br />
                Citeback doesn't collect emails or contact info. When the wallet activates,
                the XMR address will appear right here. Bookmark this page and check back.
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
            /* Active — fund with Monero */
            <>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 10, padding: 4 }}>
                <button style={tabStyle(walletTab === 'address')} onClick={() => setWalletTab('address')}>Wallet Address</button>
                <button style={tabStyle(walletTab === 'qr')} onClick={() => setWalletTab('qr')}>QR Code</button>
              </div>

              {walletTab === 'address' ? (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Monero (XMR) — This Campaign Only
                  </div>
                  <div style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                    padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 11,
                    wordBreak: 'break-all', color: '#aaa', lineHeight: 1.7, marginBottom: 12,
                    userSelect: 'all',
                  }}>
                    {campaign.walletXMR}
                  </div>
                  <button onClick={copyWallet} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center',
                    background: copied ? 'var(--green)' : 'var(--accent)',
                    border: 'none', color: '#fff', padding: '12px 20px', borderRadius: 9,
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  }}>
                    {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy Wallet Address</>}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <div style={{ background: 'white', padding: 16, borderRadius: 12 }}>
                    <QRCodeSVG value={`monero:${campaign.walletXMR}`} size={180} />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
                    Scan with any Monero wallet app. Amount is up to you.
                  </p>
                </div>
              )}

              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text)' }}>New to Monero?</strong>{' '}
                Get XMR at <a href="https://www.kraken.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Kraken</a> or{' '}
                <a href="https://localmonero.co" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>LocalMonero</a> (no KYC).
                Use <a href="https://cakewallet.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Cake Wallet</a> on mobile.
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
    </div>
  )
}
