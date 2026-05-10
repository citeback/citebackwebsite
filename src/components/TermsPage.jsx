import { Helmet } from 'react-helmet-async'

const TERMS_LAST_UPDATED = 'May 9, 2026'

export default function TermsPage() {
  return (
    <>
    <Helmet>
      <title>Terms of Use | Citeback</title>
      <meta name="description" content="Citeback terms of use: platform rules, operator obligations, contributor rights, and legal framework for anonymous surveillance resistance crowdfunding." />
      <meta property="og:title" content="Terms of Use | Citeback" />
      <meta property="og:description" content="Citeback terms of use: platform rules, operator obligations, contributor rights, and legal framework for anonymous surveillance resistance crowdfunding." />
    </Helmet>
    <section className="legal-page-section">
      {/* Draft disclaimer — top of page, prominent */}
      <div className="legal-draft-notice">
        <strong className="legal-draft-notice-title">⚠ These terms are in draft form pending legal review.</strong>
        They are published for community transparency. They have <em>not</em> been reviewed by legal counsel and are subject to change before platform launch.
        No funds go live until attorney review is complete. Full draft with OFAC disclosures, operator obligations, and §230 notice:{' '}
        <a href="https://github.com/citeback/citebackwebsite/blob/main/TERMS.md" target="_blank" rel="noopener noreferrer"
          className="legal-draft-notice-link">TERMS.md on GitHub</a>.
      </div>

      <div className="legal-page-tag">Legal</div>
      <h1 className="legal-page-heading">
        Terms of Use
      </h1>
      <p className="legal-page-subtitle">
        Last updated: <time dateTime="2026-05-09">{TERMS_LAST_UPDATED}</time>
        {' '}· Citeback (Wyoming DAO LLC, in formation)
        {' '}· Draft v0.1
      </p>

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
          body: `As of the date of this draft, no campaign wallets have been activated and no funds are being accepted. This site is in a pre-launch state. Wallet addresses will only be published after all 10 public launch prerequisites are verified and disclosed (see GOVERNANCE.md Launch Prerequisites for the full list). Do not send funds to any address claiming to represent Citeback until official wallet addresses are published through the verified GitHub repository.`,
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
• Contribute to campaign wallets (once activated)

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
          body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CITEBACK AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SITE OR CONTRIBUTION TO ANY CAMPAIGN.

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
        <div key={title} className="legal-page-article">
          <h2 className="legal-page-article-title">{title}</h2>
          <div className="legal-page-article-body">{body}</div>
        </div>
      ))}
    </section>
    </>
  )
}
