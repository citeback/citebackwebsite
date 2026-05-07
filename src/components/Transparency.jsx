import { CheckCircle, ExternalLink, FileText, Coins, Shield } from 'lucide-react'
import { ThreatDisclosure } from './VerificationTiers'
import FollowTheMoney from './FollowTheMoney'

const disbursements = []

const principles = [
  { title: 'One Wallet Per Campaign', body: 'Every campaign will have dedicated Monero (XMR) and Zano (ZANO) wallets. Funds cannot be commingled. No wallet addresses are published until all launch prerequisites are met and the wallet architecture is publicly verified.' },
  { title: 'Receipt Before Release', body: 'Operators submit vendor receipts and photo proof before any disbursement is triggered. A 48-hour public challenge window follows — the community can contest any release.' },
  { title: 'No Human Keyholders', body: 'The target architecture: no human holds wallet keys — not operators, not the founder. The wallet system architecture is published openly before any funds go live. Wallets activate at Phase 2 launch after all prerequisites are publicly verified.' },
  { title: 'Full Public Record', body: 'Once live, every campaign receipt, disbursement, and governance action will be logged permanently and publicly verifiable. The governance rules governing this process are published now.' },
  { title: 'Zero Platform Fee', body: 'Citeback takes nothing from campaigns. No percentage, no deduction, no operations cut. Every dollar contributed goes directly to the campaign operator\'s wallet. Operating costs are covered by the founding operator personally. This model was chosen deliberately — a platform that skims campaigns has an extractive relationship with the causes it exists to support.' },
  { title: 'Community Governed', body: 'Rules change only through public GitHub PRs, community votes, and time-locks. Pre-launch, the founder acts as the platform operator with defined responsibilities — but no ability to touch wallet keys. After Phase 2 launch and LLC formation, the founder has identical permissions to every other participant.' },
  { title: 'Transparent Operator', body: 'The platform is being organized as a Wyoming DAO LLC — formation is a hard launch prerequisite. Operator identity, responsibilities, and limitations are published in the governance spec. The operator manages the platform and reviews campaign proposals — the operator cannot access wallet keys. The wallet architecture enforces this by design.' },
]

export default function Transparency({ setTab }) {
  return (
    <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Transparency</h2>
        <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14, maxWidth: 560, lineHeight: 1.6 }}>
          Every dollar funded, every receipt submitted, every action taken — public record. Forever.
        </p>
      </div>

      {/* Principles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 48 }}>
        {principles.map((p, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 0, padding: 20 }}>
            <div style={{ width: 2, height: 16, background: 'var(--red)', marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{p.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65 }}>{p.body}</p>
          </div>
        ))}
      </div>

      {/* Data Sources */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Data Sources
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 20, maxWidth: 560 }}>
          Citeback is built on public data. Here's exactly where it comes from.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 48 }}>
          {[
            {
              name: 'OpenStreetMap Contributors',
              url: 'https://www.openstreetmap.org',
              what: '92,008 ALPR camera locations mapped by volunteers worldwide.',
              note: 'Public dataset — © OpenStreetMap contributors, ODbL',
            },
            {
              name: 'EFF Atlas of Surveillance',
              url: 'https://atlasofsurveillance.org',
              what: 'Surveillance technology deployed by law enforcement agencies across the US.',
              note: 'Public API and dataset',
            },
            {
              name: 'CourtListener / RECAP',
              url: 'https://www.courtlistener.com',
              what: 'Active surveillance litigation — federal and state court filings.',
              note: 'Public API and dataset',
            },
            {
              name: 'USASpending.gov',
              url: 'https://www.usaspending.gov',
              what: 'Federal contracts with surveillance vendors — amounts, agencies, award dates.',
              note: 'Public federal dataset',
            },
            {
              name: 'Senate LDA (Lobbying Disclosure)',
              url: 'https://lda.senate.gov',
              what: 'Federal lobbying filings for surveillance vendors — Senate Office of Public Records, Lobbying Disclosure Act.',
              note: 'Live API — no auth required',
            },
            {
              name: 'OpenStates',
              url: 'https://openstates.org',
              what: 'State surveillance legislation — bills, status, sponsors, and votes.',
              note: 'Public API and dataset',
            },
            {
              name: 'Footnote4a',
              url: 'https://footnote4a.org',
              what: 'ALPR journalism and investigative reporting sourced in the Activity Ticker.',
              note: 'Journalism attribution',
            },
          ].map((src, i) => (
            <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 0, padding: 20 }}>
              <div style={{ width: 2, height: 16, background: 'var(--border)', marginBottom: 12 }} />
              <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fg)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                  {src.name} <ExternalLink size={11} style={{ verticalAlign: 'middle', opacity: 0.5 }} />
                </a>
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{src.what}</p>
              <p style={{ color: 'var(--muted)', fontSize: 11, opacity: 0.6, fontFamily: 'var(--mono)' }}>{src.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What if we don't launch */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 0, borderLeft: '3px solid var(--green)', padding: '20px 24px', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Shield size={20} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: '#6ee7b7', marginBottom: 8, fontSize: 15 }}>
              What happens if Citeback doesn't launch?
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Campaign wallets are controlled by the published wallet architecture — not by us. No wallet addresses will be published until launch prerequisites are fully met. No published address means there is nowhere to send — and nothing to return.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
              Once wallets are live: if a campaign is abandoned, its wallet balance is governed by the community — the wallet system can only disburse per the coded rules. No funds can be redirected to us. The governance doc specifies exactly what happens to stranded campaign funds.
            </p>
          </div>
        </div>
      </div>

      <ThreatDisclosure />

      {/* Follow the Money — federal surveillance vendor contracts */}
      <FollowTheMoney />

      {/* Disbursement log */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Completed Disbursements
        </div>

        <div style={{
          textAlign: 'center', padding: '40px 32px', color: 'var(--muted)', fontSize: 14,
          border: '1px dashed var(--border)', borderRadius: 0, lineHeight: 1.8,
        }}>
          No disbursements yet — wallets are pending activation.<br />
          <span style={{ fontSize: 12, opacity: 0.65 }}>Every completed campaign will be logged here with receipt and XMR transaction ID. Forever.</span>
        </div>
      </div>

      {/* CTA */}
      {setTab && (
        <div style={{
          marginTop: 32, padding: '24px', borderRadius: 0,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Transparency only means something if campaigns exist.</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>Browse the campaigns that will create this public record.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setTab('campaigns')}
              style={{
                background: 'var(--fg)', color: 'var(--bg)', border: 'none',
                padding: '10px 22px', fontSize: 13, fontWeight: 600,
                letterSpacing: '0.03em', cursor: 'pointer',
                fontFamily: 'var(--font)', flexShrink: 0,
              }}
            >
              Browse Campaigns →
            </button>
            <button
              onClick={() => setTab('governance')}
              style={{
                background: 'transparent', color: 'var(--fg)',
                border: '1px solid var(--border)', padding: '10px 22px',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font)', flexShrink: 0,
              }}
            >
              How Disbursement Works →
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
