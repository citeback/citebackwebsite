import { useState } from 'react'
import { ShieldCheck, CreditCard, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import './CryptoPrimer.css'

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
        label: 'Buy on an exchange (US-accessible)',
        detail: 'Kraken is the most reputable US-based exchange that still lists XMR. Requires KYC but straightforward for first-time buyers.',
        links: [
          { text: 'Kraken', url: 'https://kraken.com' },
        ],
      },
      {
        label: 'Swap without an account (no KYC)',
        detail: 'These services let you swap BTC, ETH, or other coins into XMR with no account or ID. All accessible to US users. Trocador aggregates multiple providers and filters by KYC policy.',
        links: [
          { text: 'Trocador', url: 'https://trocador.app' },
          { text: 'Cake Wallet (built-in swap)', url: 'https://cakewallet.com' },
          { text: 'ChangeNow', url: 'https://changenow.io' },
          { text: 'StealthEX', url: 'https://stealthex.io' },
          { text: 'SimpleSwap', url: 'https://simpleswap.io' },
        ],
      },
      {
        label: 'Or trade peer-to-peer (maximum privacy)',
        detail: 'Haveno-Reto is a decentralized P2P exchange running over Tor — no account, no KYC, no central server. Slower but the most private option.',
        links: [
          { text: 'Haveno-Reto', url: 'https://github.com/retoaccess1/haveno-reto/releases' },
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
        label: 'Buy on an exchange (US-accessible)',
        detail: 'TradeOgre is the go-to no-KYC exchange for ZANO — available to US users with no account restrictions.',
        links: [
          { text: 'TradeOgre', url: 'https://tradeogre.com' },
        ],
      },
      {
        label: 'Swap without an account (no KYC)',
        detail: 'Swap BTC, ETH, or other coins into ZANO — no account or ID required. All accessible to US users.',
        links: [
          { text: 'Trocador', url: 'https://trocador.app' },
          { text: 'ChangeNow', url: 'https://changenow.io' },
          { text: 'StealthEX', url: 'https://stealthex.io' },
          { text: 'SimpleSwap', url: 'https://simpleswap.io' },
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
    <div className="cp-coin-panel">
      {/* Header */}
      <div className={`cp-coin-header${open ? ' cp-coin-header--open' : ''}`}>
        <div className="cp-coin-dot" style={{ background: coin.color }} />
        <div className="cp-coin-meta">
          <div className="cp-coin-name-row">
            <span className="cp-coin-name">{coin.name}</span>
            <span className="cp-coin-ticker" style={{ color: coin.color }}>{coin.ticker}</span>
          </div>
          <div className="cp-coin-tagline">{coin.tagline}</div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="cp-coin-toggle"
        >
          {open ? 'Hide' : 'How to get it'}
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="cp-coin-body">
          <p className="cp-coin-what">{coin.what}</p>
          <div className="cp-coin-steps">
            {coin.getSteps.map((step, i) => (
              <div key={i} className="cp-coin-step">
                <div
                  className="cp-step-num"
                  style={{ border: `1px solid ${coin.color}`, color: coin.color }}
                >{i + 1}</div>
                <div>
                  <div className="cp-step-label">{step.label}</div>
                  <div className="cp-step-detail">{step.detail}</div>
                  <div className="cp-step-links">
                    {step.links.map((link, j) => (
                      <a
                        key={j}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cp-step-link"
                        style={{
                          color: coin.color,
                          borderBottom: `1px solid ${coin.color}44`,
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
          <div
            className="cp-send-note"
            style={{ borderLeft: `3px solid ${coin.color}` }}
          >
            <strong className="cp-send-note-strong">Once you have {coin.ticker}:</strong> Open the campaign you want to fund, copy the wallet address shown, open your {coin.name} wallet, and paste the address into the Send field. Enter the amount and confirm. No login, no account, no receipt — by design.
          </div>
        </div>
      )}
    </div>
  )
}

export default function CryptoPrimer() {
  return (
    <section className="cp-section">
      <div className="cp-inner">

        {/* Eyebrow */}
        <div className="cp-eyebrow">New to privacy coins?</div>

        <h2 className="cp-heading">
          Why no credit card — and how to contribute anyway
        </h2>

        <p className="cp-intro">
          Citeback accepts only Monero (XMR) and Zano — two privacy cryptocurrencies. No credit card, no PayPal, no bank transfer.
          This is intentional: traditional payment rails identify you, and your identity has no place in a surveillance resistance campaign.
        </p>

        {/* Why cards */}
        <div className="cp-why-grid">
          {WHY.map((w, i) => (
            <div key={i} className="cp-why-card">
              <div className="cp-why-icon">{w.icon}</div>
              <h3 className="cp-why-title">{w.title}</h3>
              <p className="cp-why-body">{w.body}</p>
            </div>
          ))}
        </div>

        {/* Coin panels */}
        <div className="cp-coins-label">Supported coins</div>
        <div className="cp-coins-list">
          {COINS.map(coin => (
            <CoinPanel key={coin.ticker} coin={coin} />
          ))}
        </div>

        {/* Footer note */}
        <p className="cp-footer-note">
          Both coins are legal to buy and use in the United States. Citeback never holds or touches contributor funds — your XMR or ZANO goes directly to the operator's wallet. A view-only key lets the platform verify balances without spending authority.
        </p>

      </div>
    </section>
  )
}
