import { ExternalLink, Shield } from 'lucide-react'
import { ThreatDisclosure } from './VerificationTiers'
import FollowTheMoney from './FollowTheMoney'
import { useCameraCount } from '../context/CameraCount'
import { Helmet } from 'react-helmet-async'

const principles = [
  { title: 'One Wallet Per Campaign', body: 'Every campaign will have dedicated Monero (XMR) and Zano (ZANO) wallets. Funds cannot be commingled. No wallet addresses are published until all launch prerequisites are met and the wallet architecture is publicly verified.' },
  { title: 'Receipt Before Release', body: 'Operators submit vendor receipts and photo proof before any disbursement is triggered. A 48-hour public challenge window follows — the community can contest any release.' },
  { title: 'Citeback Never Holds Funds', body: "Contributions go directly from contributors to the operator's own wallet — the platform has zero custody and zero spending access. The operator provides a Monero view key (read-only) so the platform and community can independently verify balances. Early withdrawal before a campaign goal is met results in immediate permanent ban." },
  { title: 'Full Public Record', body: 'Once live, every campaign receipt, disbursement, and governance action will be logged permanently and publicly verifiable. The governance rules governing this process are published now.' },
  { title: 'Zero Platform Fee', body: "Citeback takes nothing from campaigns. No percentage, no deduction, no operations cut. Every dollar contributed goes directly to the campaign operator's wallet. Operating costs are covered by the founding operator personally. This model was chosen deliberately — a platform that skims campaigns has an extractive relationship with the causes it exists to support." },
  { title: 'Community Governed', body: 'Rules change only through public GitHub PRs, community votes, and time-locks. Pre-launch, the founder acts as the platform operator with defined responsibilities — but no ability to touch wallet keys. After Phase 2 launch and LLC formation, the founder has identical permissions to every other participant.' },
  { title: 'Transparent Operator', body: "The platform is being organized as a Wyoming DAO LLC — formation is a hard launch prerequisite. Operator identity, responsibilities, and limitations are published in the governance spec. The platform reviews campaign proposals and monitors wallets via view keys — but Citeback never holds wallet keys or campaign funds. Operators self-custody their own wallets. The direct wallet architecture enforces this by design." },
]

const buildSources = (cameraCount) => [
  { name: 'OpenStreetMap Contributors', url: 'https://www.openstreetmap.org', what: `${cameraCount} ALPR camera locations mapped by volunteers worldwide.`, note: 'Public dataset — © OpenStreetMap contributors, ODbL' },
  { name: 'EFF Atlas of Surveillance', url: 'https://atlasofsurveillance.org', what: 'Surveillance technology deployed by law enforcement agencies across the US.', note: 'Public API and dataset' },
  { name: 'CourtListener / RECAP', url: 'https://www.courtlistener.com', what: 'Active surveillance litigation — federal and state court filings.', note: 'Public API and dataset' },
  { name: 'USASpending.gov', url: 'https://www.usaspending.gov', what: 'Federal contracts with surveillance vendors — amounts, agencies, award dates.', note: 'Public federal dataset' },
  { name: 'Senate LDA (Lobbying Disclosure)', url: 'https://lda.senate.gov', what: 'Federal lobbying filings for surveillance vendors — Senate Office of Public Records, Lobbying Disclosure Act.', note: 'Live API — no auth required' },
  { name: 'OpenStates', url: 'https://openstates.org', what: 'State surveillance legislation — bills, status, sponsors, and votes.', note: 'Public API and dataset' },
  { name: 'Footnote4a', url: 'https://footnote4a.org', what: 'ALPR journalism and investigative reporting sourced in the Activity Ticker.', note: 'Journalism attribution' },
]

export default function Transparency({ setTab }) {
  const cameraCount = useCameraCount()
  const sources = buildSources(cameraCount)

  return (
    <section className="tran-page">
      <Helmet>
        <title>Transparency | Citeback — Public Record of Every Campaign Action</title>
        <meta name="description" content="Every dollar funded, every receipt submitted, every disbursement — public record forever. Citeback never holds funds. View data sources and governance." />
      </Helmet>

      <div className="tran-header">
        <h2 className="tran-title">Transparency</h2>
        <p className="tran-subtitle">
          Every dollar funded, every receipt submitted, every action taken — public record. Forever.
        </p>
      </div>

      {/* Principles grid */}
      <div className="tran-grid tran-section">
        {principles.map((p, i) => (
          <div key={i} className="tran-card">
            <div className="tran-card-bar" />
            <h3 className="tran-card-title">{p.title}</h3>
            <p className="tran-card-body">{p.body}</p>
          </div>
        ))}
      </div>

      {/* Data Sources */}
      <div className="tran-section">
        <div className="tran-section-label">Data Sources</div>
        <p className="tran-section-desc">
          Citeback is built on public data. Here&apos;s exactly where it comes from.
        </p>
        <div className="tran-grid">
          {sources.map((src, i) => (
            <div key={i} className="tran-card">
              <div className="tran-card-bar tran-card-bar--muted" />
              <h3 className="tran-card-title tran-card-title--sm">
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="tran-source-link">
                  {src.name} <ExternalLink size={11} className="tran-ext-icon" />
                </a>
              </h3>
              <p className="tran-card-body">{src.what}</p>
              <p className="tran-source-note">{src.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Non-launch guarantee */}
      <div className="tran-guarantee tran-section">
        <Shield size={20} className="tran-guarantee-icon" />
        <div>
          <p className="tran-guarantee-title">What happens if Citeback doesn&apos;t launch?</p>
          <p className="tran-card-body">
            Campaign wallets are controlled by the published wallet architecture — not by us. No wallet addresses will be published until launch prerequisites are fully met. No published address means there is nowhere to send — and nothing to return.
          </p>
          <p className="tran-card-body">
            Once wallets are live: if a campaign is abandoned, its wallet balance is governed by the community — the wallet system can only disburse per the coded rules. No funds can be redirected to us. The governance doc specifies exactly what happens to stranded campaign funds.
          </p>
        </div>
      </div>

      <ThreatDisclosure />

      {/* Follow the Money */}
      <FollowTheMoney />

      {/* Disbursement log */}
      <div className="tran-section">
        <div className="tran-section-label">Completed Disbursements</div>
        <div className="tran-empty-state">
          No disbursements yet — wallets are pending activation.<br />
          <span className="tran-empty-note">Every completed campaign will be logged here with receipt and XMR transaction ID. Forever.</span>
        </div>
      </div>

      {/* CTA */}
      {setTab && (
        <div className="tran-cta">
          <div>
            <p className="tran-cta-title">Transparency only means something if campaigns exist.</p>
            <p className="tran-cta-body">Browse the campaigns that will create this public record.</p>
          </div>
          <div className="tran-cta-btns">
            <button onClick={() => setTab('campaigns')} className="tran-cta-btn tran-cta-btn--primary">
              Browse Campaigns →
            </button>
            <button onClick={() => setTab('governance')} className="tran-cta-btn tran-cta-btn--secondary">
              How Disbursement Works →
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
