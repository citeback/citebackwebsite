import { CheckCircle, ExternalLink, FileText, Coins } from 'lucide-react'
import { ThreatDisclosure } from './VerificationTiers'

const disbursements = []

const principles = [
  { title: 'One Wallet Per Campaign', body: 'Every campaign has a dedicated Monero wallet created inside a hardware-secured TEE enclave. Funds cannot be commingled. You know exactly where your XMR goes.' },
  { title: 'Receipt Before Release', body: 'Operators submit vendor receipts and photo proof before any disbursement is triggered. A 48-hour public challenge window follows — the community can contest any release.' },
  { title: 'TEE-Secured — No Human Keyholders', body: 'No human holds wallet keys — not operators, not the community council, not the founder. Funds live in a Trusted Execution Environment. Rules are code. Code is public.' },
  { title: 'Full Public Record', body: 'Every completed campaign, receipt, disbursement, and governance action is logged permanently. Signed by the TEE attestation key. Nothing is hidden.' },
  { title: '1% Platform Fee', body: '1% of every donation funds platform operations (infrastructure, Monero node). The ops wallet is also TEE-secured with a public view key. Any surplus is put to a community vote.' },
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

      <ThreatDisclosure />

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
