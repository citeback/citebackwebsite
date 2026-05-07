export default function TermsPage() {
  return (
    <section style={{ padding: '64px 24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12,
      }}>Legal</div>
      <h1 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
        Terms of Use
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
        Last updated: May 2026 · Citeback (Wyoming DAO LLC, in formation)
      </p>
      <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 24, lineHeight: 1.6 }}>
        This page is a summary of key terms. The full draft Terms of Use (including OFAC disclosures, operator obligations,
        §230 notice, immutable platform rules, and fund redirection mechanics) is available at{' '}
        <a href="https://github.com/citeback/citebackwebsite/blob/main/TOS_DRAFT.md" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--accent)' }}>TOS_DRAFT.md on GitHub</a>.
        These terms will be expanded and consolidated following attorney review prior to launch.
      </p>

      {/* Attorney review banner */}
      <div style={{
        background: 'rgba(243,156,18,0.08)',
        border: '1px solid rgba(243,156,18,0.3)',
        borderLeft: '3px solid #f39c12',
        padding: '16px 20px',
        marginBottom: 48,
        fontSize: 13,
        color: 'var(--muted)',
        lineHeight: 1.7,
      }}>
        <strong style={{ color: '#f39c12' }}>⚠ Pending Attorney Review</strong>
        <br />
        These Terms of Use are a public draft. They are published for community transparency and review. They have not yet been reviewed by legal counsel and are subject to change prior to platform launch. No funds go live until attorney review is complete.
      </div>

      {[
        {
          title: '1. Acceptance of Terms',
          body: `By accessing or using citeback.com (the "Site"), browsing its content, submitting any form, or sending funds to any campaign wallet address published by Citeback, you agree to be bound by these Terms of Use.

If you do not agree to these terms, do not use the Site or send funds to any campaign wallet.`,
        },
        {
          title: '2. What Citeback Is',
          body: `Citeback is a pre-launch crowdfunding platform designed to fund surveillance resistance campaigns — including FOIA requests, legal challenges, and ordinance campaigns — using privacy cryptocurrencies (Monero XMR and Zano ZANO). Citeback is organized as a Wyoming DAO LLC (formation is a pre-launch prerequisite and has not yet been completed as of this writing).

Citeback is not a charitable organization. Contributions are not tax-deductible. Citeback does not provide legal services and nothing on this Site constitutes legal advice.`,
        },
        {
          title: '3. No Wallets Are Live',
          body: `As of the date of this draft, no campaign wallets have been activated and no funds are being accepted. This site is in a pre-launch state. Wallet addresses will only be published after all 16 public launch prerequisites are verified and disclosed (see GOVERNANCE.md Launch Prerequisites for the full list). Do not send funds to any address claiming to represent Citeback until official wallet addresses are published through the verified GitHub repository.`,
        },
        {
          title: '4. Contribution Terms',
          body: `When campaign wallets activate:

• All contributions are final and non-refundable. Monero's privacy model makes identifying senders technically infeasible; Citeback will not ask contributors to deanonymize themselves to facilitate refunds.
• If a campaign does not reach its goal by the deadline, funds redirect to the highest-priority active campaign in the same category. Operators or community members may request an extension vote. After two extensions, redirect is automatic.
• Contributions are not tax-deductible. Citeback is a Wyoming DAO LLC, not a 501(c)(3) exempt organization.
• Citeback takes no platform fee from campaign contributions. Zero percent is deducted. All campaign funds go directly to the campaign operator\'s wallet. Citeback does not hold, pool, or direct campaign funds under any circumstances.`,
        },
        {
          title: '5. OFAC Compliance',
          body: `Contributions from individuals or entities on the U.S. Treasury OFAC Specially Designated Nationals (SDN) list are strictly prohibited. By sending funds to any campaign wallet, you represent that you are not a Specially Designated National or otherwise subject to U.S. sanctions.

OFAC gap disclosure: Because Monero and Zano transactions are private at the protocol level, the platform has no technical ability to screen anonymous contributors against the OFAC SDN list. This structural limitation is documented in GOVERNANCE.md §9.3. The Terms prohibition is a binding legal condition; on-chain enforcement is not possible on the contributor side. Campaign disbursement recipients (operators) are separately screened against the OFAC SDN list before onboarding and at every disbursement event.

No campaign wallets go live until written attorney guidance on this gap is received.`,
        },
        {
          title: '6. Permitted Uses',
          body: `You may use this Site to:
• Learn about surveillance technologies and resistance strategies
• Browse campaign proposals and governance documentation
• Submit camera locations for the community map (accurate, good-faith submissions only)
• Propose campaigns through the official proposal form
• Apply to the expert registry
• Donate to campaign wallets (once activated)

You may not use this Site to:
• Submit false, fraudulent, or malicious camera locations or campaign proposals
• Attempt to identify contributors, operators, or other participants
• Interfere with the wallet system or governance mechanisms
• Use the platform to fund activities that are unlawful in the relevant jurisdiction
• Violate OFAC sanctions or any applicable financial sanctions regime`,
        },
        {
          title: '7. Campaign Operator Obligations',
          body: `Campaign operators are subject to separate operator agreements. Operators must:
• Verify identity with the Citeback legal entity (identity is held privately and not published)
• Pass OFAC SDN screening at onboarding and at each disbursement
• Submit verified proof of campaign completion before disbursement is released
• Comply with applicable local, state, and federal law in executing campaigns
• Disclose any lobbying-adjacent activities to the platform and register as required by applicable law

Fraudulent proof submissions result in permanent misconduct flags and forfeiture of all campaign funds. Campaign operators are solely responsible for the lawfulness of their campaigns in their jurisdiction.`,
        },
        {
          title: '8. No Legal Advice',
          body: `Nothing on this Site constitutes legal advice. FOIA requests, litigation, ordinance campaigns, and other legal activities described on this Site may have jurisdiction-specific requirements. Citeback is not a law firm. Consult qualified legal counsel before undertaking legal action.`,
        },
        {
          title: '9. Limitation of Liability',
          body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CITEBACK AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SITE OR DONATION TO ANY CAMPAIGN.

Citeback charges no platform fee on campaign contributions. Citeback's total liability for any claim arising out of these Terms shall not exceed US $10.00.`,
        },
        {
          title: '10. Modifications',
          body: `These Terms may be updated prior to platform launch. After launch, material changes to Terms require community governance votes per GOVERNANCE.md. The current version of these Terms is always available at citeback.com/terms. Continued use of the Site after a change constitutes acceptance of the updated Terms.`,
        },
        {
          title: '11. Governing Law',
          body: `These Terms are governed by the laws of the State of Wyoming, without regard to conflict of law principles. Any dispute arising out of these Terms shall be resolved by binding arbitration in Wyoming, except that either party may seek injunctive relief in any court of competent jurisdiction.`,
        },
        {
          title: '12. Contact',
          body: `Legal notices and questions: citeback@proton.me`,
        },
      ].map(({ title, body }) => (
        <div key={title} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{title}</h2>
          <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{body}</div>
        </div>
      ))}
    </section>
  )
}
