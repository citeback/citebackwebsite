import { CheckCircle, ExternalLink, FileText, Coins, Shield } from 'lucide-react'
import { ThreatDisclosure } from './VerificationTiers'
import FollowTheMoney from './FollowTheMoney'

const disbursements = []

const principles = [
  { title: 'One Wallet Per Campaign', body: 'Every campaign has dedicated Monero (XMR) and Zano (ZANO) wallets created inside a hardware-secured TEE enclave. Funds cannot be commingled. You know exactly where your crypto goes.' },
  { title: 'Receipt Before Release', body: 'Operators submit vendor receipts and photo proof before any disbursement is triggered. A 48-hour public challenge window follows — the community can contest any release.' },
  { title: 'TEE-Secured — No Human Keyholders', body: 'No human holds wallet keys — not operators, not the community council, not the founder. Funds live in a Trusted Execution Environment. Rules are code. Code is public.' },
  { title: 'Full Public Record', body: 'Every completed campaign, receipt, disbursement, and governance action is logged permanently. Signed by the TEE attestation key. Nothing is hidden.' },
  { title: 'Graduated Platform Fee', body: 'A platform fee funds operations — infrastructure, Monero and Zano nodes. Fees are graduated by operator volume: 5% (under $10k), 4.5% ($10k–$25k), 4% ($25k–$50k), 3% (above $50k). See GOVERNANCE.md §7.3 for the full schedule. Ops wallets are TEE-secured with public view keys. Any surplus goes to a community vote.' },
  { title: 'Community Governed', body: 'Rules change only through public GitHub PRs, community votes, and time-locks. The founder has no special access post-launch. Same permissions as everyone else.' },
]

export default function Transparency() {
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
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginBottom: 12 }} />
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
            <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--muted)', opacity: 0.5, marginBottom: 12 }} />
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
        background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.2)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Shield size={20} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: '#6ee7b7', marginBottom: 8, fontSize: 15 }}>
              What happens if Citeback doesn't launch?
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Campaign wallets are controlled by the TEE — not by us. If the platform shuts down before wallets activate, no funds have been accepted and there is nothing to return. We won't accept a single XMR or ZANO until the launch prerequisites are fully met.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
              Once wallets are live: if a campaign is abandoned, its wallet balance is governed by the community — the TEE can only disburse per the coded rules. No funds can be redirected to us. The governance doc specifies exactly what happens to stranded campaign funds.
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
          border: '1px dashed var(--border)', borderRadius: 12, lineHeight: 1.8,
        }}>
          No disbursements yet — wallets are pending activation.<br />
          <span style={{ fontSize: 12, opacity: 0.65 }}>Every completed campaign will be logged here with receipt and XMR transaction ID. Forever.</span>
        </div>
      </div>
    </section>
  )
}
