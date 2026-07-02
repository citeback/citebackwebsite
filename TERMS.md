# Citeback - Terms of Service
> **DRAFT - Requires attorney review before publication**
> Draft version: 0.2 | Prepared: 2026-05-05 | Revised: 2026-07-02 (individual-operator model; DAO/governance-vote framing removed)
> Contact: citeback@proton.me
> ⚠️ THIS DOCUMENT IS A DRAFT. It has NOT been reviewed by an attorney. It MUST NOT be published on the live site until a qualified attorney has reviewed and approved it. Specific items marked [ATTORNEY REVIEW REQUIRED] need particular attention before publication.

---

## Terms of Service - Citeback

**Effective Date:** [DATE - to be set on attorney-approved publication]
**Operator:** Scott Hughes, individual operator [ATTORNEY REVIEW REQUIRED - whether/what business entity to form before accepting funds]
**Contact:** citeback@proton.me
**Governing Law:** [ATTORNEY REVIEW REQUIRED - previously drafted as Wyoming under a DAO LLC plan; operator is an individual resident of New Mexico]

---

### 1. Acceptance of Terms

By accessing or using the Citeback platform at citeback.com (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.

These Terms constitute a binding agreement between you and the Platform Operator, Scott Hughes ("Platform Operator," "we," "us," or "our").

---

### 2. Platform Description and Pre-Launch Status

Citeback is a surveillance accountability crowdfunding platform that enables anonymous cryptocurrency contributions to campaigns focused on documenting, challenging, and resisting government surveillance programs and their contracted vendors.

**⚠️ PRE-LAUNCH DISCLOSURE:** At the time these Terms are first published, the Platform is in a pre-launch operational state. Specifically:

- **Direct wallet model is in use.** Campaign operators post their own XMR/ZANO wallet addresses. Contributions go directly from contributors to operator wallets. The Platform never holds, receives, or transmits campaign funds. The Platform monitors balances via read-only view keys provided by operators.
- **No campaign wallet addresses are currently published.** The Platform does not accept contributions until all governance launch prerequisites are met.
- **Wallet addresses displayed on the Platform as "null" or "not yet assigned" reflect the Platform's pre-launch status** - they are not errors.
- The Platform Operator will publish a notice when the Platform transitions to operational status.

The Platform's rules — including disbursement rules and organizer requirements — are published in plain language on GitHub at github.com/citeback/citebackwebsite (GOVERNANCE.md). Material rule changes are announced publicly at least 7 days before taking effect.

---

### 3. Eligibility

You may use the Platform only if:

(a) You are at least 18 years of age.

(b) You are not located in a country subject to a United States Government embargo or designated by the U.S. Government as a "terrorist supporting" country.

(c) You are not listed on any United States Government list of prohibited or restricted parties, including the Office of Foreign Assets Control (OFAC) Specially Designated Nationals (SDN) list, the OFAC Consolidated Sanctions List, or any equivalent list.

(d) Your use of the Platform complies with all applicable laws and regulations in your jurisdiction.

If you do not meet these eligibility requirements, you are prohibited from using the Platform.

---

### 4. Prohibited Uses

You may not use the Platform to:

(a) **Violate OFAC sanctions.** Contributions from persons or entities listed on the OFAC SDN list or any U.S. sanctions list are expressly prohibited. By sending any contribution to a Platform campaign wallet, you represent that you are not an OFAC-sanctioned individual or entity. [ATTORNEY REVIEW REQUIRED - verify this representation is adequate given the structural limitation in §5 below]

(b) **Fund illegal activity.** Campaigns must target government entities, government programs, or government-contracted surveillance vendors. Campaigns targeting private individuals, funding criminal defense (as defined in the Platform governance), or funding activity that violates applicable law are prohibited.

(c) **Interfere with surveillance equipment.** Campaigns to disable, damage, tamper with, or interfere with any physical surveillance device are expressly prohibited and will not be funded by the Platform under any circumstances. This prohibition is immutable and cannot be modified by community governance.

(d) **Engage in money laundering or financial crime.** You may not use the Platform to launder money, evade taxes, circumvent financial regulations, or finance terrorism.

(e) **Harass, defame, or target private individuals.** Campaign targets are restricted to government entities, government programs, and government-contracted surveillance vendors. The Platform does not fund campaigns targeting private individuals.

(f) **Manipulate governance.** You may not attempt to manipulate community governance processes through Sybil attacks, vote manipulation, artificial reputation inflation, or other means.

(g) **Circumvent OFAC screening.** You may not use structuring, multiple transactions, or other techniques to circumvent the Platform's operator-level OFAC screening processes.

---

### 5. OFAC Compliance Disclosure - Anonymous Contributor Limitation

**This section describes a structural limitation of the Platform's privacy architecture that you must understand before making any contribution.**

The Platform accepts Monero (XMR) and Zano (ZANO) cryptocurrency exclusively. These cryptocurrencies use cryptographic privacy protocols that make it technically impossible to link incoming contributions to a sender's identity. Specifically:

- **The Platform cannot screen contributors for OFAC SDN list status.** Monero's RingCT and stealth address protocols conceal sender identity, transaction amounts, and transaction history at the protocol level. No technology currently exists that can screen anonymous Monero contributors against the OFAC SDN list without destroying the privacy guarantee that makes the Platform possible.
- **OFAC compliance at the operator level:** The Platform does perform OFAC pre-screening of campaign operators (the organizations and individuals who receive disbursements) before any campaign wallet is created. Operators are screened against the SDN list by the Platform Operator at the time of onboarding. This is the Platform's primary OFAC compliance mechanism.
- **Contributor-level OFAC compliance relies on your representation:** By contributing to any campaign wallet, you represent that you are not an OFAC-sanctioned individual or entity and that your contribution does not violate applicable OFAC sanctions.

**The Platform makes no representation that anonymous contributor contributions are screened for OFAC compliance.** If you are subject to OFAC sanctions, you are prohibited from contributing to the Platform and doing so may constitute a violation of federal law for which you - not the Platform - bear responsibility.

[ATTORNEY REVIEW REQUIRED - attorney must confirm this disclosure adequately documents the good-faith compliance posture and whether additional language is needed.]

---

### 6. Campaign Contributions - No Refund Policy

**All contributions to Citeback campaigns are final and non-refundable.** This policy exists by design and is inherent to the Platform's privacy architecture.

Monero's privacy protocol does not expose sender addresses. The Platform has no technical mechanism to identify contributors for the purpose of processing refunds. Requiring contributors to provide a return address at contribution time would require partial deanonymization and is inconsistent with the Platform's core privacy guarantees.

**What happens if a campaign does not reach its goal?**

If a campaign deadline passes without meeting its funding goal, contributions redirect to the highest-priority active campaign in the same category (e.g., FOIA funds redirect to another FOIA campaign; billboard funds redirect to another billboard campaign). This redirect policy is disclosed on each campaign card on the Platform and is governed by the Platform's published governance framework.

**What happens if a campaign is cancelled or rejected?**

In the event a campaign is cancelled or rejected after funds have been received, contributions will be redirected per the same policy above. No refunds will be issued.

By contributing to any campaign wallet, you acknowledge and accept this no-refund policy.

---

### 7. Campaign Goals and Platform Fees

**No platform fee.** The Platform charges no fee on campaign funds. 100% of donated funds are disbursed directly to the campaign operator. No percentage is deducted at disbursement.

**Platform funding:** Infrastructure costs are covered personally by the Platform Operator and by voluntary tips from users who support the platform. Tips are entirely separate from campaign contributions, are not required, and have no effect on campaign funds or platform decisions.

**Campaign goals include a transaction buffer:** Published campaign goals include a 2% buffer for Monero network transaction fee variance. This buffer is disclosed transparently on each campaign card. Any unused buffer amount is disbursed to the operator at campaign close alongside campaign funds.

**Operational transparency:** All tip inflows and operational expenditures are documented in the Platform's quarterly transparency report.

---

### 8. Operator Responsibilities

Campaign operators are independent contractors, not agents or employees of the Platform Operator. Platform approval of a campaign does not constitute endorsement, partnership, or joint liability.

Operators are solely responsible for:

(a) The accuracy of all factual claims made in campaign descriptions and billboard campaign content.

(b) Compliance with all applicable laws in their jurisdiction, including lobbying disclosure laws (LDA), FARA (if applicable), local permit requirements for billboard campaigns, and all applicable tax obligations.

(c) Compliance with the Platform's operator agreement and governance framework.

(d) OFAC compliance for their own disbursement activities and any downstream use of campaign funds.

(e) Proper reporting of cryptocurrency income received as campaign disbursements to applicable tax authorities. The Platform makes no representation about the tax treatment of disbursements. [ATTORNEY REVIEW REQUIRED - add IRS Notice 2014-21 reference and appropriate disclaimer]

Operators engaging in legislative advocacy acknowledge that they - not the Platform - are responsible for compliance with the Lobbying Disclosure Act and FARA where applicable. [ATTORNEY REVIEW REQUIRED - confirm this adequately shifts FARA/LDA responsibility]

---

### 9. Platform Limitations and No Warranty

**THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.**

In particular, and without limiting the foregoing:

(a) **Pre-launch status:** Until the Platform transitions to operational status, no contributions are accepted. After launch, the Platform makes no warranty that it is free from security vulnerabilities or technical failure. The Platform's security model is publicly documented in the published threat model.

(b) **No guarantee of campaign success:** The Platform does not guarantee that funded campaigns will achieve their stated goals. FOIA requests may be denied. Legislation may fail. Billboard permits may be refused. The Platform's role is to facilitate funding, not to guarantee outcomes.

(c) **No guarantee of fund recovery:** Because contributions go directly to operator wallets, the Platform has no ability to reverse or recover funds once sent. Contributors accept all custody and recovery risk. In the event of operator misconduct, the Platform's sole remedy is banning the operator from future campaigns.

(d) **Network congestion and transaction fees:** Monero and Zano network fees are set by network conditions outside the Platform’s control. The 2% transaction fee buffer included in campaign goals is an estimate, not a guarantee.

(e) **Regulatory risk:** The Platform operates in a rapidly evolving regulatory environment. Changes in applicable law - including cryptocurrency regulation, OFAC enforcement posture, or MSB classification rules - could affect the Platform's operations. The Platform makes no warranty of regulatory stability.

---

### 10. Limitation of Liability

[ATTORNEY REVIEW REQUIRED - this section needs jurisdiction-specific carve-outs and caps. Below is a placeholder framework.]

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PLATFORM OPERATOR AND ITS MEMBERS, MANAGERS, OFFICERS, CONTRACTORS, AND AGENTS SHALL NOT BE LIABLE FOR:

(a) Any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform;

(b) Loss of cryptocurrency contributions due to campaign failure, operator misconduct, or network conditions;

(c) Any third-party claims arising from campaign content created and submitted by operators;

(d) Regulatory enforcement actions against you arising from your own use of the Platform in violation of applicable law;

(e) Any damages arising from reliance on the Platform's published legal analyses or governance documentation, which do not constitute legal advice.

---

### 11. Section 230 Notice

The Platform is an interactive computer service within the meaning of 47 U.S.C. §230 of the Communications Decency Act. The Platform hosts, reviews, and facilitates operator-submitted campaign content. The Platform's publication of operator-submitted campaign content does not constitute the Platform's endorsement of that content or its adoption as the Platform's own speech.

Platform review of campaign proposals is limited to eligibility determination (campaign type, target legitimacy, documentation adequacy) and does not constitute the Platform's authorship or development of operator campaign content.

[ATTORNEY REVIEW REQUIRED - §230 analysis specific to this platform model (human-operator funding review) is required. This section should reflect attorney's guidance on what review posture preserves §230 protection under the Roommates.com material contribution standard.]

---

### 12. Governing Law and Dispute Resolution

[ATTORNEY REVIEW REQUIRED - governing law and dispute resolution. Prior draft specified Wyoming under a DAO LLC plan that is no longer current; the Platform Operator is an individual resident of New Mexico. Attorney should advise on governing law, venue, mandatory arbitration, and class action waiver.]

---

### 13. Privacy

The Platform is designed to protect your privacy. Specifically:

(a) **No contributor identification:** The Platform does not collect, store, or publish contributor identity information. Monero and Zano transactions do not expose sender identity to the Platform.

(b) **Operator identity:** Operator identities are collected and verified by the Platform Operator for OFAC pre-screening purposes. Operator identities are stored privately and are not published publicly. Operator identity records may be subject to compelled disclosure in response to lawful legal process (subpoenas, court orders, National Security Letters, FISA orders). See the Platform's published governance documentation for more information on this risk.

(c) **No tracking pixels or advertising:** The Platform does not use advertising networks, tracking pixels, or behavioral analytics.

(d) **Privacy-preserving infrastructure:** The Platform uses Bunny Fonts (not Google Fonts) to prevent IP logging by font CDN. Security headers (CSP, X-Frame-Options, Referrer-Policy) are implemented per published configuration.

(e) **Visitor IP and third-party APIs:** Certain site features may involve client-side API calls to third-party services (CourtListener, OpenStreetMap, etc.) which may receive your IP address as a byproduct of the request. See the Platform's privacy architecture documentation for current status.

---

### 14. Campaign Content - Accuracy and Attestation

Operators are required to attest to the accuracy of all factual claims in campaign descriptions at the time of submission. For billboard campaigns, operators must provide source URLs or documents supporting each specific factual claim.

The Platform reviews attestations for completeness but does not independently verify the accuracy of every factual claim. Responsibility for the accuracy of campaign content rests with the operator.

If you believe campaign content contains a materially false statement of fact, contact citeback@proton.me with specific documentation.

---

### 15. Immutable Platform Rules

Certain Platform rules cannot be modified by ordinary rule updates and can only be changed by a fork of the Platform software. These include:

- Platform never holds wallet private keys (direct wallet model — operators hold their own keys)
- Criminal defense funding prohibition
- Illegal activity funding prohibition
- Camera tampering or interference prohibition
- No individual distribution of operations wallet surplus
- Minimum contribution threshold floor

These rules are published in the Platform's rules on GitHub and cannot be overridden by the Platform Operator or any other mechanism short of a platform fork.

---

### 16. Campaign Failure and Fund Redirection

If a campaign reaches its deadline without achieving its funding goal, all contributions are redirected to the highest-priority active campaign in the same category. This redirect:

- Is logged publicly in the Platform's append-only action log
- Is governed by the unfunded-redirect rules defined in the Platform's published rules
- Does not require contributor consent, because by contributing to any campaign you accept this redirect policy under these Terms

There are no refunds in any circumstance. See §6.

---

### 17. Organizer Onboarding and Vetting

Campaign organizers must be verified professionals — attorneys, registered nonprofits, licensed healthcare professionals, or university/government staff. Verification is performed against public registries (state bar records, IRS/EIN records, the CMS NPI registry) or via institutional (.edu/.gov) email confirmation, plus OFAC pre-screening, before any campaign wallet is created. This process:

- Requires real identity/credential documentation from the organizer
- Includes OFAC SDN list screening by the Platform Operator
- Is a condition precedent to any campaign wallet being activated

Organizer identity records are held privately by the Platform Operator and are never published; only a credential badge (e.g., "Verified Attorney — NM") is shown publicly. Passing pre-screening does not constitute a legal representation by the Platform that the organizer's campaign activities are lawful. Organizers are solely responsible for their own legal compliance.

---

### 18. Modifications to Terms

The Platform Operator may modify these Terms. Material changes will be announced publicly on the Platform website at least 7 days before taking effect. Continued use of the Platform after a change takes effect constitutes acceptance of the modified Terms.

---

### 19. Termination

The Platform Operator may suspend or terminate access to the Platform for any user or organizer who violates these Terms. Organizers whose campaigns are rejected or who are suspended retain any record in the Platform's public action log.

The Platform may be discontinued. In the event of Platform discontinuation, outstanding campaign funds will be handled per the wind-down procedures in the published platform rules.

---

### 20. Contact

**Platform Operator:** Scott Hughes
**Contact:** citeback@proton.me
**Repository:** github.com/citeback/citebackwebsite

For legal service of process: contact citeback@proton.me. [ATTORNEY REVIEW REQUIRED - service-of-process address / registered agent once entity decision is made]

---

### 21. Entire Agreement

These Terms, together with the Platform's published Platform Rules (GOVERNANCE.md) and Organizer Agreement (if applicable), constitute the entire agreement between you and the Platform Operator regarding your use of the Platform.

---

**DRAFT NOTES FOR ATTORNEY REVIEW:**

The following items require specific attorney attention before this ToS is published:

1. **§4 and §5 - OFAC contributor-side disclosure:** Confirm the self-representation approach is a legally cognizable good-faith compliance mechanism and revise language if needed.

2. **§8 - Operator tax obligations:** Add IRS Notice 2014-21 reference and appropriate crypto income reporting disclaimer.

3. **§8 - FARA/LDA shift:** Confirm that ToS language adequately shifts legislative advocacy compliance responsibility to operators.

4. **§10 - Limitation of Liability:** Jurisdiction-specific drafting needed. Operator is currently an individual (no entity liability shield) — advise on entity formation. Cap amounts?

5. **§11 - §230 posture:** Revise to reflect attorney's analysis of the Roommates.com material contribution standard as applied to this platform's review-and-fund model.

6. **§12 - Dispute Resolution:** Governing law TBD (operator is a New Mexico resident; prior Wyoming choice was tied to abandoned DAO LLC plan). Arbitration? Class action waiver? Venue selection?

7. **§17 - Organizer pre-screening:** Confirm credential-registry verification + OFAC screening creates the documented compliance process OFAC analysis requires.

8. **Pre-launch to operational transition:** How does the ToS update when Platform goes live? Consider a clearly versioned system.

9. **International users:** international users may have GDPR or other rights. Consider whether EU users need additional disclosure.

10. **Entity decision:** Operator currently operates as an individual. Advise whether to form an LLC (and where) before any funds are accepted; update Operator, governing law, liability, and service-of-process sections accordingly.

---

*DRAFT v0.2 - Prepared 2026-05-05, revised 2026-07-02 | NOT APPROVED FOR PUBLICATION | Requires attorney review before any live use*
