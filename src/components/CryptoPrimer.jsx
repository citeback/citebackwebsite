import { useState } from 'react'
import { ShieldCheck, CreditCard, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

const WHY = [
  {
    icon: <CreditCard size={18} />,
    title: 'Credit cards leave a paper trail',
    body: 'Every card payment ties your name, bank, and IP address to a transaction. In a surveillance lawsuit or camera-reporting campaign, that trail can be subpoenaed, leaked, or sold. Privacy coins make that trail cryptographically impossible — not just policy-blocked.',
  },
  {
    icon: <ShieldCheck size={18} />,
    title: 'Privacy at the protocol level',
    body: 'Monero and Zano don\'t just hide your name — they make the sender, recipient, and amount invisible on-chain by default. Even Citeback cannot see who contributed to a campaign. This is a technical guarantee, not a promise.',
  },
]

const COINS = [
  {
    name: 'Monero',
    ticker: 'XMR',
    color: '#f26822',
    tagline: 'The most widely-used privacy cryptocurrency',
    what: 'Monero is an open-source cryptocurrency with privacy built in at the protocol level. Every transaction automatically hides the sender, recipient, and amount using ring signatures, stealth addresses, and RingCT. It\'s been live since 2014 and is battle-tested.',
    getSteps: [
      {
        label: 'Buy on an exchange',
        detail: 'Kraken and Cake Wallet\'s built-in swap are the easiest starting points. Kraken lets you buy XMR directly with a bank transfer or card.',
        links: [
          { text: 'Kraken', url: 'https://kraken.com' },
          { text: 'Cake Wallet (iOS/Android)', url: 'https://cakewallet.com' },
        ],
      },
      {
        label: 'Or trade peer-to-peer',
        detail: 'Haveno is a decentralized exchange — no account, no KYC. Slower but maximally private.',
        links: [
          { text: 'Haveno', url: 'https://haveno.exchange' },
        ],
      },
      {
        label: 'Get a wallet',
        detail: 'Cake Wallet (mobile) or the official Monero GUI wallet (desktop) are both solid. Your wallet generates a receive address — that\'s what you use to send.',
        links: [
          { text: 'Cake Wallet', url: 'https://cakewallet.com' },
          { text: 'Official Monero Wallet', url: 'https://www.getmonero.org/downloads/' },
        ],
      },
    ],
  },
  {
    name: 'Zano',
    ticker: 'ZANO',
    color: '#00b4d8',
    tagline: 'Privacy coin with confidential assets and PoW/PoS hybrid',
    what: 'Zano is a privacy-focused cryptocurrency with confidential transactions, hidden amounts, and stealth addresses. It supports confidential assets and uses a hybrid Proof-of-Work / Proof-of-Stake consensus. Less mainstream than Monero but strong privacy guarantees.',
    getSteps: [
      {
        label: 'Buy on TradeOgre',
        detail: 'TradeOgre is the most liquid market for ZANO. No KYC required for basic trading.',
        links: [
          { text: 'TradeOgre', url: 'https://tradeogre.com' },
        ],
      },
      {
        label: 'Swap via ExchangeNow or ChangeNow',
        detail: 'You can swap BTC, ETH, or other coins into ZANO without an account.',
        links: [
          { text: 'ChangeNow', url: 'https://changenow.io' },
        ],
      },
      {
        label: 'Get the Zano wallet',
        detail: 'Download the official Zano desktop wallet from zano.org. It generates your wallet address for receiving ZANO.',
        links: [
          { text: 'Zano Wallet', url: 'https://zano.org/downloads' },
        ],
      },
    ],
  },
]

function CoinPanel({ coin }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      border: '1px solid var(--border)',
      background: 'var(--bg2)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '20px 24px',
        borderBottom: open ? '1px solid var(--border)' : 'none',
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: coin.color,
          flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{coin.name}</span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: coin.color,
              fontFamily: 'var(--font-mono, monospace)',
            }}>{coin.ticker}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{coin.tagline}</div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            color: 'var(--fg)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font)',
            letterSpacing: '0.04em',
          }}
        >
          {open ? 'Hide' : 'How to get it'}
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, marginBottom: 20 }}>
            {coin.what}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {coin.getSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: `1px solid ${coin.color}`,
                  color: coin.color,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 8 }}>{step.detail}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {step.links.map((link, j) => (
                      <a
                        key={j}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 11,
                          color: coin.color,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          borderBottom: `1px solid ${coin.color}44`,
                          paddingBottom: 1,
                        }}
                      >
                        {link.text}
                        <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Send step — always shown */}
          <div style={{
            marginTop: 20,
            padding: '14px 16px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${coin.color}`,
            fontSize: 12,
            color: 'var(--muted)',
            lineHeight: 1.75,
          }}>
            <strong style={{ color: 'var(--fg)' }}>Once you have {coin.ticker}:</strong> Open the campaign you want to fund, copy the wallet address shown, open your {coin.name} wallet, and paste the address into the Send field. Enter the amount and confirm. No login, no account, no receipt — by design.
          </div>
        </div>
      )}
    </div>
  )
}

export default function CryptoPrimer() {
  return (
    <section style={{
      padding: '80px 24px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Eyebrow */}
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--red)',
          marginBottom: 12,
        }}>
          New to privacy coins?
        </div>

        <h2 style={{
          fontSize: 'clamp(22px, 3.5vw, 34px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: 12,
        }}>
          Why no credit card — and how to contribute anyway
        </h2>

        <p style={{
          fontSize: 15,
          color: 'var(--muted)',
          lineHeight: 1.75,
          maxWidth: 620,
          marginBottom: 48,
        }}>
          Citeback accepts only Monero (XMR) and Zano — two privacy cryptocurrencies. No credit card, no PayPal, no bank transfer.
          This is intentional: traditional payment rails identify you, and your identity has no place in a surveillance resistance campaign.
        </p>

        {/* Why cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {WHY.map((w, i) => (
            <div key={i} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              padding: '20px 22px',
            }}>
              <div style={{
                width: 38,
                height: 38,
                background: 'rgba(230,57,70,0.06)',
                border: '1px solid rgba(230,57,70,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--red)',
                marginBottom: 14,
              }}>{w.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{w.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>{w.body}</p>
            </div>
          ))}
        </div>

        {/* Coin panels */}
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--gray)',
          marginBottom: 12,
        }}>
          Supported coins
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COINS.map(coin => (
            <CoinPanel key={coin.ticker} coin={coin} />
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 24,
          fontSize: 12,
          color: 'var(--muted)',
          lineHeight: 1.7,
          borderLeft: '2px solid var(--border)',
          paddingLeft: 14,
        }}>
          Both coins are legal to buy and use in the United States. Citeback never holds or touches contributor funds — your XMR or ZANO goes directly to the operator\'s wallet. A view-only key lets the platform verify balances without spending authority.
        </p>

      </div>
    </section>
  )
}
