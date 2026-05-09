# ATTORNEY BRIEF
## Citeback — Surveillance Accountability Crowdfunding Platform
### Pre-Launch Legal Review Request

**Prepared by:** Platform Operators, Citeback  
**Date:** April 30, 2026  
**Status:** Pre-launch — No live wallets or active campaigns  
**Repository:** github.com/citeback/citebackwebsite  
**Confidentiality:** Public document — published on GitHub for transparency. No attorney-client privilege claimed. This document contains open legal questions for attorney review and is intentionally public as part of Citeback's commitment to governance transparency.

---

## EXECUTIVE SUMMARY

Citeback is a pre-launch anonymous crowdfunding platform designed to fund surveillance accountability campaigns — including FOIA litigation, legal defense funds, billboard campaigns, and legislative advocacy — targeting government surveillance programs and their contracted vendors. The platform accepts Monero (XMR) and Zano (ZANO) cryptocurrency exclusively; contributors are fully anonymous by architectural design.

**The platform operates under a direct wallet model.** A Wyoming DAO LLC (the human operator) handles site management, campaign proposal review, operator onboarding, and OFAC pre-screening of operators. Campaign operators post their own XMR/ZANO wallet addresses — contributions flow directly to operator-controlled wallets. **Citeback never holds funds, never has access to private keys, and never executes automated disbursements.** The platform uses view keys (read-only) to verify campaign wallet balances and contribution activity. This model introduces an identifiable legal entity (the Wyoming DAO LLC) into the compliance analysis while eliminating platform custody entirely — a materially cleaner regulatory posture than TEE-custody or traditional escrow models.

**Platform funding model (noted for attorney review):** The platform charges no fee on campaign funds. 100% of contributions are disbursed directly to operators. Platform infrastructure is funded by (a) founding operator capital contributions to the Wyoming DAO LLC and (b) voluntary user tips to the LLC — optional contributions users may make to support platform operations, entirely separate from campaign donations. Tips have no effect on campaign funds or governance weight. The MSB/FinCEN, tax, and charitable solicitation analyses should reflect this model: the platform does not receive any percentage of campaign funds; income to the LLC consists solely of voluntary tips and founder capital contributions.

We are seeking comprehensive pre-launch legal review across twelve distinct legal risk areas before any wallets go live or public access is granted. The urgency is high: several of these issues — particularly FinCEN/MSB classification, OFAC compliance gaps, and potential 18 U.S.C. § 1960 exposure — carry federal criminal liability, and no operational activity should commence until written legal guidance is in hand.

---

## PLATFORM OVERVIEW

Citeback is an anonymous crowdfunding infrastructure platform built to finance civil liberties campaigns focused on government surveillance accountability. The platform enables donors to contribute Monero (XMR) or Zano (ZANO) cryptocurrency to per-campaign wallet addresses without creating accounts, providing identity, or undergoing any KYC process. Campaign operators — individuals or organizations running qualifying campaigns — are privately identity-verified by the platform's legal entity, but their identities are never published publicly. Contributions go directly to operator-controlled XMR/ZANO wallet addresses upon campaign approval. Operators complete milestones and withdraw from their own wallets; Citeback never holds or transfers funds. The platform charges no fee on campaign funds — 100% of contributions reach the operator. Platform infrastructure is funded by founding operator capital contributions to the Wyoming DAO LLC and voluntary user tips to the LLC. The platform operates under community governance weighted by proof-of-contribution and publishes all governance logic as open-source code. Qualifying campaign types include FOIA lawsuits, legal defense funds, billboard campaigns, ordinance advocacy, and counter-database projects.

The platform restricts campaign targets to government entities and government-contracted surveillance vendors only; campaigns targeting private individuals are prohibited. Named vendor targets in the current taxonomy include Clearview AI, Flock Safety, and Palantir. Governance is documented in GOVERNANCE.md (v0.7 Active) and GOVERNANCE-SUPPLEMENTS.md. The platform is currently pre-launch: no wallets are live, no campaigns are active, and no public access has been granted. The operators have identified nine areas of legal concern and have taken documented good-faith steps prior to engaging counsel, which are enumerated in the Self-Assessment section below.

**Operational Responsibilities (Direct Wallet Model):**  
- *Wyoming DAO LLC (Human Operator):* Site management; campaign proposal review and approval; operator onboarding including OFAC pre-screening; legal compliance; enforcement of campaign taxonomy; community governance oversight; removal of non-compliant content; view key monitoring for early drain detection; operator ban enforcement.
- *Campaign Operators:* Create and control their own XMR/ZANO wallets; post wallet addresses and view keys at campaign approval; complete campaign obligations; withdraw from their own wallets after milestone verification; self-report and remit platform fees.

Citeback acts as a coordination and accountability platform — not a financial custodian. The human operator makes content and operator-eligibility judgments; operators control their own campaign finances entirely.

---

## LEGAL QUESTIONS FOR ATTORNEY REVIEW

### 1. MSB / FinCEN Classification

**Issue:**  
The platform coordinates cryptocurrency contributions to campaign operators but does not accept, hold, or transmit funds at any point. Contributions go directly from contributors to operator-owned wallet addresses — Citeback is not in the payment chain. This model may fall outside "money transmission" under 31 CFR § 1010.100(ff)(5), but the question requires written legal analysis. Operating an unregistered MSB (if the platform is deemed one) is a federal criminal offense under 18 U.S.C. § 1960, carrying up to five years imprisonment. FinCEN's 2019 guidance on convertible virtual currencies (FIN-2019-G001) acknowledged that some non-custodial coordination models may fall outside traditional money transmission.

**Direct Wallet Model Impact:**  
The direct wallet model (operators post their own wallets; Citeback never holds funds) presents a potentially cleaner non-custodial posture than TEE-custody or traditional escrow. FinCEN's analysis of "money transmission" focuses on entities that receive, transmit, or control funds. Citeback does none of these. The Wyoming DAO LLC can register as an MSB if required and maintain BSA-required recordkeeping for operator relationships even if contributor anonymity remains an architectural constraint. **This does not resolve the question; it changes the framing in ways that may reduce or eliminate custodial exposure.**

**Key Question:**  
Does the direct wallet model — in which Citeback never receives, holds, or transmits funds, and contributors send directly to operator-controlled wallet addresses — eliminate or materially reduce the money transmission nexus under 31 CFR § 1010.100(ff)? Does the platform qualify as a payment facilitator, advertising/listing service, or any other non-MSB category? How does the Wyoming DAO LLC's role as identified human operator change the MSB classification analysis? If the platform is deemed an MSB, what AML program structure is required given that contributor anonymity is an architectural constraint that cannot be modified without destroying the platform's core function?

**What We Need:**  
A written legal opinion on MSB classification under current FinCEN guidance and BSA regulations, analyzed against the direct wallet model (Wyoming DAO LLC coordinates; operators hold their own funds). If registration is required, specific guidance on the registration process, minimum AML program elements, and whether an operator-side KYC program (conducted by the LLC) provides adequate BSA compliance where contributor-side KYC is architecturally impossible. If an exemption applies, a documented legal basis sufficient to withstand regulatory scrutiny. This opinion should address whether the platform's operators, directors, or technical contributors face personal liability under § 1960 during the pre-launch period. **Recommend obtaining a written MSB opinion directed to the Wyoming DAO LLC by name.**

---

### 2. State Money Transmission Licenses (MTLs)

**Issue:**  
Forty-nine or more states require separate money transmission licenses for entities operating within their jurisdictions, and most state MTL regimes now expressly cover cryptocurrency. New York's BitLicense (23 NYCRR Part 200) is among the most demanding, requiring a $5,000 application fee, surety bond, capital requirements, and extensive disclosure. California's DFPI administers the Money Transmission Act (Cal. Fin. Code § 2030 et seq.) and has issued guidance extending it to virtual currency. Texas (Tex. Fin. Code § 151) and Florida (Fla. Stat. § 560) similarly require licensure for virtual currency transmission. Because the platform's donor model is fully anonymous and technically cannot geoblock any U.S. state, donors from all fifty states could contribute to any campaign, potentially triggering licensure obligations in every jurisdiction simultaneously. Penalties for unlicensed money transmission include criminal prosecution at the state level in addition to federal exposure.

**Key Question:**  
Does the non-custodial, direct-to-operator wallet architecture, or the Monero-only contribution model (given Monero's untraceable transaction design), materially alter the MTL analysis under state law? Is there a viable multi-state compliance path that preserves the platform's anonymous architecture? Does the platform's restriction to cryptocurrency (no fiat handling) affect the MTL analysis in states with narrower statutory definitions?

**What We Need:**  
A written analysis of MTL exposure across New York, California, Texas, Florida, and Illinois as primary jurisdictions, with a summary assessment of the remaining state landscape. A recommended compliance path or, if multi-state licensure is not feasible concurrent with the anonymous architecture, a structural recommendation (including potential alternative legal structures or jurisdictional approaches) that achieves compliance without abandoning donor anonymity.

---

### 3. OFAC Compliance — Anonymous Donor Architecture

**Issue:**  
The Office of Foreign Assets Control (OFAC) administers sanctions programs that prohibit U.S. persons from receiving funds from Specially Designated Nationals (SDNs) and blocked persons, regardless of intent. OFAC enforcement is strict liability for certain violations — good faith is a mitigating factor but not a complete defense. The platform cannot screen donors for SDN status because Monero transactions are cryptographically untraceable: sender identity, transaction amount, and transaction history are all concealed by default at the protocol level. If an SDN donates to a campaign, the platform, the operator, and potentially the platform's legal entity and officers could face OFAC civil or criminal liability. The platform has added Terms of Service language explicitly prohibiting donations from OFAC-sanctioned individuals and entities, but ToS language alone has never been recognized by OFAC as a sufficient compliance mechanism.

**Split-Model Impact:**  
The Wyoming DAO LLC now performs human OFAC pre-screening of campaign operators at the time of onboarding. This is a materially stronger compliance posture than pure ToS reliance or fully autonomous screening. Operators — the identifiable parties who receive disbursements — are screened against the SDN list by a human compliance function before any wallet is created for their campaign. This mirrors standard platform-side KYC/OFAC processes that OFAC has treated as adequate good-faith compliance for the operator-facing side of similar platforms. **The gap that remains — and which the attorney must address — is the donor side: anonymous XMR/ZANO donors still cannot be screened, and SDN donations from anonymous donors remain architecturally undetectable.** However, the cleaner operator-side compliance story may shift OFAC's enforcement focus and reduce the platform's good-faith exposure on the documented-process prong.

**Key Question:**  
Does the combination of (a) human OFAC pre-screening of operators at onboarding by the Wyoming DAO LLC and (b) ToS-based prohibition of SDN donors constitute adequate good-faith compliance under OFAC's enforcement framework for the operator-facing and donor-facing sides respectively? Are there zero-knowledge proof (ZKP) mechanisms — such as ZK-SNARK-based SDN screening that verifies non-SDN status without revealing donor identity — that OFAC would recognize as compliant for the donor side? Does incorporating the platform's legal entity outside U.S. jurisdiction meaningfully reduce OFAC exposure for the platform entity itself (as distinct from U.S.-person operators and donors)? What is the current OFAC enforcement posture toward anonymous cryptocurrency platforms?

**What We Need:**  
A written assessment of OFAC exposure given the anonymous donor architecture and the human operator pre-screening process, including the maximum potential civil penalty exposure per transaction. A recommended mitigation strategy that takes the Monero-only donor model as a constraint (not subject to change). A specific opinion on whether the current ToS prohibition language plus human operator onboarding screening constitutes legally cognizable good-faith compliance. If ZKP-based screening is legally viable and operationally feasible, a description of the compliance standard it would need to meet. Guidance on documenting the human OFAC screening process for the operator-onboarding function in a way that maximizes regulatory good-faith value.

---

### 4. Defamation Exposure — Named Surveillance Vendors

**Issue:**  
The platform's campaign taxonomy explicitly names Clearview AI, Flock Safety, and Palantir as permissible targets for vendor accountability campaigns. Qualifying campaign types include billboard campaigns that may make public factual claims about these companies' surveillance practices. The Wyoming DAO LLC (human operator) reviews and approves campaign proposals before any wallet is created or funding accepted; operators must attest to factual accuracy for billboard campaigns. Clearview AI, Flock Safety, and Palantir are private companies with substantial legal resources; Clearview AI in particular has demonstrated willingness to pursue aggressive litigation against critics. A billboard campaign making a false factual claim about one of these vendors could expose the platform to defamation liability (libel per se if the claim is facially defamatory).

**Split-Model Impact:**  
Human editorial review by the Wyoming DAO LLC before campaign approval — as opposed to fully automated rule-based approval — follows the standard platform editorial-judgment model that § 230 doctrine was designed to analyze. The "accountability vs. extortion" bright line can be applied by a human operator exercising legal judgment (e.g., does this billboard claim assert a documented fact vs. a fabricated allegation designed to coerce a settlement?), which is a legally recognized and defensible function. This does not eliminate defamation exposure, but it places the platform on more familiar legal terrain. **The tradeoff: more active human review may cut toward the *Roommates.com* material contribution concern (see Issue 6) — the attorney should address both sides of that tension.**

**Key Question:**  
Does Section 230 of the Communications Decency Act (47 U.S.C. § 230) protect the platform from defamation liability for content submitted by operators and reviewed and funded by the Wyoming DAO LLC? Does the human operator's review and funding-approval process constitute "development" of third-party content sufficient to defeat Section 230 protection under the "material contribution" test of *Fair Housing Council v. Roommates.com*? What specific attestation language in operator agreements would strengthen the platform's Section 230 posture? What is the functional distinction between protected opinion and actionable defamatory fact in the surveillance accountability context, and what review criteria should the human operator apply?

**What We Need:**  
A Section 230 analysis specific to the human-operator funding-platform model (as distinct from a traditional hosting model or a fully autonomous AI approval system). Recommended attestation language for operator campaign submission agreements that maximizes Section 230 coverage and shifts liability to operators. Bright-line guidance on what campaign content — specific claim types, phrasing structures, factual allegations — creates defamation exposure versus what is clearly protected. An assessment of what human review criteria and documentation the Wyoming DAO LLC should maintain for billboard content approvals to maximize legal defensibility.

---

### 5. Money Laundering Risk — Disbursement Chain

**Issue:**  
The complete disbursement chain is: anonymous XMR/ZANO donations → directly to the operator's own XMR/ZANO wallet (operators post their own addresses; the platform never holds, receives, or controls funds at any point) → fiat conversion by the operator using a method of their choice. The platform is never in the payment chain. This chain could be characterized by DOJ or FinCEN as a money laundering typology under 18 U.S.C. § 1956 (laundering of monetary instruments) or § 1957 (engaging in monetary transactions in criminally derived property), even where the underlying campaign is entirely legitimate. The platform previously included recommendations for specific fiat conversion services — including RetoSwap, a peer-to-peer, no-KYC exchange. All such recommendations have been removed from platform documentation. The platform now takes a neutral stance on operator conversion methods and places conversion responsibility entirely on operators. The structural chain — anonymous funds flowing directly from contributors to an identified operator who then converts — is cleaner than a platform-custodied model, as there is no platform intermediary receiving or controlling funds at any point. The question remains whether even a coordination-only platform that facilitates this chain has § 1956 exposure.

**Key Question:**  
Does placing fiat conversion responsibility on operators, with the platform adopting a neutral stance on conversion methodology and removing all conversion-service recommendations, adequately separate the platform from money laundering exposure under 18 U.S.C. § 1956? What additional documentation, policy, or operational control would further strengthen this separation? Is the disbursement chain itself — absent any fraudulent or criminal source — sufficient to trigger a § 1956 prosecution theory, and if so, what is the platform's best-available defense?

**What We Need:**  
A written assessment of platform exposure under 18 U.S.C. §§ 1956 and 1957, distinguishing platform-level exposure from operator-level exposure. A recommended operator disbursement policy that preserves maximum privacy for operators while minimizing platform liability for the downstream conversion step. Specific documentation and policy language the platform should maintain regarding the removal of conversion-service recommendations and the operator's independent responsibility for compliance.

---

### 6. Section 230 Safe Harbor — Scope and Limits

**Issue:**  
The platform hosts, reviews, and funds operator-submitted campaign content, including FOIA target lists, billboard claims, and legal strategy descriptions. Section 230 of the CDA provides broad immunity to interactive computer services (ICS) for third-party content, but that immunity has defined limits. Section 230(e) expressly excludes federal criminal statutes, intellectual property claims, and ECPA violations from the safe harbor. Additionally, the "development" exception established in *Roommates.com* removes Section 230 protection when a platform materially contributes to the unlawful nature of content — not merely hosting it passively but actively shaping it. Under the split model, the Wyoming DAO LLC (not the TEE) now performs campaign proposal review — a human operator making editorial judgments, not an automated system applying rules blindly.

**Split-Model Impact:**  
Human editorial review by an identified operator is the posture that most § 230 case law was written to analyze. The *Roommates.com* material contribution test distinguishes between platforms that passively host content and those that actively shape its unlawful character. Human review of campaign types, factual claims, and target eligibility — conducted by the Wyoming DAO LLC applying documented governance criteria — is standard platform editorial judgment that courts have generally treated under the § 230 framework rather than defeating it. The key question shifts from "does an autonomous AI system constitute an ICS?" (novel and unresolved) to the better-established "does this review posture cross the *Roommates.com* material contribution line?" (standard analysis). **This is legally cleaner ground, though not without risk.**

**Key Question:**  
Does the Wyoming DAO LLC's human campaign review process — including operator identity verification, cost breakdown review, campaign type approval against the permitted taxonomy, and milestone-based disbursement — constitute "development" of content under the *Roommates.com* material contribution standard, thereby reducing or eliminating Section 230 protection? What specific review procedures preserve maximum Section 230 coverage (i.e., what can the human operator review without crossing into development)? What categories of claims — OFAC violations, federal criminal statutes — remain unprotected regardless of Section 230?

**What We Need:**  
A Section 230 analysis specific to the human-operator campaign review and funding-approval model (as distinct from autonomous AI review). A recommended review process design that maintains meaningful quality control (to satisfy governance obligations) while preserving maximum Section 230 protection. An enumeration of the specific federal statutes and claim types for which Section 230 provides no protection, so that the platform can maintain separate compliance procedures for those categories.

---

### 7. Legislative Advocacy Campaigns — LDA / FARA

**Issue:**  
The platform's permitted campaign taxonomy includes legislative advocacy: funding operator participation in public testimony, drafting and distributing model bills, submitting public comments to administrative agencies, and coordinating public comment campaigns. Depending on the scope of activities and funding, operators may trigger registration obligations under the Lobbying Disclosure Act (2 U.S.C. § 1603), which requires registration for individuals who spend more than 20% of their time on lobbying activities for a client and receive more than $3,000 in compensation in a quarterly period, among other thresholds. Additionally, the Foreign Agents Registration Act (22 U.S.C. § 611 et seq.) requires registration for persons acting at the direction or control of foreign principals engaged in political activities in the United States. Because the platform cannot screen donors for nationality, foreign contributions to legislative advocacy campaigns cannot be identified or blocked — creating a FARA exposure gap that the platform cannot close architecturally.

**Key Question:**  
At what point does platform-funded legislative advocacy activity trigger LDA registration obligations for the operator, and does the operator's funding source (anonymous cryptocurrency) affect the LDA analysis? Does the anonymous foreign donor gap — the platform's inability to screen out or identify foreign contributions to legislative advocacy campaigns — create FARA exposure for operators, for the platform, or for both? Is there a campaign-design or governance mechanism that would reduce FARA exposure without requiring donor identity disclosure?

**What We Need:**  
A threshold analysis of LDA applicability to operators funded through the platform's campaign model. A FARA exposure assessment given the architectural impossibility of screening for foreign donor involvement. Recommended governance controls or campaign-type restrictions — if any are legally necessary — that would reduce FARA exposure.

---

### 8. Operator Identity — Compelled Disclosure Risk

**Issue:**  
Operator identities are verified by the platform's legal entity and held in private storage that is not publicly disclosed. This creates a single compelled-disclosure risk point: a government agency could serve a subpoena, a FISA order (50 U.S.C. § 1881a), or a National Security Letter (NSL) (18 U.S.C. § 2709) on the platform's legal entity to obtain operator identity records. NSLs carry mandatory gag orders prohibiting the recipient from disclosing the existence of the NSL to any person, including the affected operator — meaning the platform could be compelled to produce operator identities while legally prohibited from warning them. FISA orders are similarly gag-restricted. This structure creates a genuine risk that operators could be identified to government agencies without their knowledge, potentially exposing them to retaliation for campaigns targeting those same agencies. This risk is particularly acute given that the platform's express purpose is adversarial to government surveillance programs.

**Key Question:**  
What corporate structure — including jurisdiction of incorporation, attorney-as-verifier arrangements (to extend privilege over identity records), or offshore entity structures — would minimize compelled-disclosure risk while preserving the legal entity's ability to operate? Is a warrant canary (a public notice that is removed upon receipt of a gag-order legal process) legally viable under current case law, and does it provide meaningful protection? What is the recommended NSL and FISA response policy for the platform's legal entity? What is the safest jurisdiction for the platform's legal entity given its adversarial relationship with U.S. government surveillance programs?

**What We Need:**  
A structural recommendation for minimizing compelled operator identity disclosure, including jurisdiction of incorporation analysis and attorney-privilege-based verification options. A written legal opinion on warrant canary viability under current Ninth Circuit and federal precedent. A recommended NSL/FISA response policy, including whether to proactively retain specialized national security counsel. An assessment of whether the legal entity's officers face personal contempt or criminal exposure for refusing to comply with gag-restricted legal process.

---

### 9. Insurance Requirements — Coverage Type

**Issue:**  
The platform's governance documentation requires operators running campaigns above the $100,000 cap to maintain $1,000,000 in general liability insurance. The current documentation does not specify the type of coverage required, the required endorsements, or whether the platform must be named as an additional insured. Standard general liability (CGL) policies routinely exclude intentional acts, defamation, civil rights claims, and professional liability — all of which are categories of risk directly associated with the platform's campaign types. An operator running a billboard campaign alleging surveillance misconduct by Clearview AI, for example, would face potential defamation liability that a standard CGL policy might not cover. Similarly, civil rights campaign activity may require civil rights or errors-and-omissions coverage that is not standard in a CGL form. Operators who obtain technically compliant insurance that does not actually cover their campaign activities would be inadequately protected.

**Key Question:**  
What specific insurance coverage types are necessary and appropriate for operators running surveillance accountability campaigns above the $100,000 threshold, given the actual risk profile (defamation, civil rights claims, intentional act allegations)? What standard policy exclusions would leave operators — and potentially the platform — exposed despite nominally compliant coverage? Should the platform require itself to be named as an additional insured on operator policies, and if so, what are the implications?

**What We Need:**  
A minimum coverage specification for the $100,000-and-above operator tier, including required coverage types (CGL, E&O, media liability, umbrella, etc.), minimum limits, and required endorsements. An identification of standard policy exclusions that would render operator coverage inadequate for the platform's campaign risk profile. Recommended contractual language requiring the platform as an additional insured on operator policies. Guidance on whether the platform itself should carry media liability, directors and officers (D&O), or other institutional coverage given its role in funding potentially contentious campaigns.

---

### 10. Securities Law — Proof-of-Donation Governance Rights

**Issue:**  
The platform's governance model grants donors weighted voting rights proportional to their contributions (0.5%–20% of campaign goal, with diminishing returns above 8%). If these governance rights have exchange value, confer influence over platform operations, or create any expectation of profit, the DOJ or SEC could characterize them as securities under the *Howey* test (*SEC v. W.J. Howey Co.*, 328 U.S. 293 (1946)) or the *Reves* "family resemblance" test for notes. The SEC has aggressively applied *Howey* to cryptocurrency governance tokens. Unregistered securities offerings carry serious civil and criminal liability under the Securities Act of 1933 (15 U.S.C. § 77a et seq.) and the Securities Exchange Act of 1934.

**Key Question:**  
Do proof-of-donation governance rights constitute a security under *Howey* or *Reves*? If so, does any exemption apply (Regulation D, Regulation CF, or another)? Can the governance structure be modified to clearly fall outside the securities definition without compromising the platform's decentralization model?

**What We Need:**  
A written opinion on whether the governance model creates securities exposure. If exposure exists, recommended structural modifications. If an exemption applies, the documented legal basis for that exemption.

---

### 11. State Charitable Solicitation Registration Laws

**Issue:**  
Forty-plus states require organizations to register with the state attorney general before soliciting charitable contributions from residents of that state. Many apply this requirement regardless of whether the organization holds 501(c)(3) status. The platform's mission — funding civil liberties and public accountability campaigns — has the surface appearance of charitable activity, even if the platform does not seek tax-exempt status. Because donors are anonymous and the platform cannot geoblock any state, it may be soliciting charitable contributions in all 50 states simultaneously. Violations are strict liability in many states.

**Key Question:**  
Does the platform's crowdfunding model constitute charitable solicitation under applicable state laws? If so, which states' registration requirements apply, and is multi-state registration feasible alongside the platform's anonymous architecture? Does the platform's zero-fee coordination model — funded by voluntary user tips to the Wyoming DAO LLC rather than any percentage of campaign funds — affect the charitable solicitation analysis? Is a platform that accepts voluntary tips from users while facilitating campaigns more or less likely to trigger charitable solicitation registration requirements than a fee-based model?

**What We Need:**  
An assessment of charitable solicitation exposure across at minimum NY, CA, TX, FL, and IL. A recommended compliance path or structural recommendation to avoid triggering registration requirements.

---

### 12. Tax Treatment, Entity Structure, and Constructive Receipt

**Issue:**  
The platform operates through the Wyoming DAO LLC as its legal entity. This creates several tax and entity structure questions: (a) voluntary user tips received by the Wyoming DAO LLC constitute income to the LLC — as a single-member Wyoming DAO LLC (pass-through entity), tips flow to the founder as self-employment income; understanding the tax treatment of voluntary tips (as distinct from service fees) and available LLC operational expense deductions is required; (b) the direct wallet model eliminates constructive receipt concerns for campaign funds — the platform never receives, holds, or exercises dominion over campaign contributions at any point; campaign funds are never in the LLC's control; (c) if any campaign type is structured to allow donors to claim charitable deductions, 501(c)(3) status and IRS compliance are required — operating without this status while donors take deductions creates donor-side and platform-side liability; (d) operators receiving XMR or ZANO disbursements have cryptocurrency income reporting obligations under IRS Notice 2014-21 and subsequent guidance, regardless of whether conversion to fiat occurs.

**Key Question:**  
What is the tax treatment of voluntary tips received by a single-member Wyoming DAO LLC — are they treated as self-employment income, ordinary income, or something else? What LLC operational expense deductions are available to offset tip income? Does the zero-fee, tips-funded model reduce or eliminate charitable solicitation exposure compared to a fee-based model? Should the platform explicitly disclaim charitable status in donor communications and tip prompts to avoid 501(c)(3)-adjacent expectations?

**What We Need:**  
A tax analysis of voluntary tip income received by the Wyoming DAO LLC: characterization, pass-through treatment, and available operational expense deductions. Confirmation that the direct wallet model (no platform custody at any point) eliminates constructive receipt concerns for campaign funds under current IRS doctrine. Template disclaimer language for tip prompts and donor communications making clear that tips are not tax-deductible charitable contributions and that campaign contributions are not deductible.

---

## SELF-ASSESSMENT — GOOD FAITH STEPS TAKEN PRIOR TO ATTORNEY ENGAGEMENT

The platform has taken the following documented steps prior to launching operations or engaging legal counsel:

1. **Established Wyoming DAO LLC as identified human operator.** A Wyoming DAO LLC has been formed as the platform's legal entity and designated human operator. The LLC handles site management, campaign proposal review, operator onboarding, OFAC pre-screening, and legal compliance — functions that were previously planned as fully autonomous AI operations. This introduces a known, identified legal entity into the compliance analysis.

2. **Implemented human OFAC pre-screening of operators.** The Wyoming DAO LLC pre-screens campaign operators against the OFAC SDN list at the time of onboarding, prior to wallet creation. This is a documented human compliance process, not ToS reliance alone.

3. **Removed all fiat conversion service recommendations.** All references to specific fiat conversion services, including RetoSwap (a P2P, no-KYC exchange), have been removed from all platform documentation and governance materials. The platform takes a neutral, non-directive stance on operator conversion methods.

4. **Added OFAC ToS prohibition (donor side).** The platform's Terms of Service explicitly prohibits donations from OFAC-sanctioned individuals and entities. The platform acknowledges this covers the donor-anonymous side and is a partial measure, supplemented by the human operator pre-screening on the operator side.

5. **Implemented private operator identity verification.** Operators are verified by the platform's legal entity with identity records stored privately. Identity is never publicly disclosed. The platform acknowledges the compelled-disclosure risk this creates.

6. **Restricted campaign targets.** Campaign targets are restricted to government entities and government-contracted surveillance vendors. Campaigns targeting private individuals are expressly prohibited and enforced at the human operator review level.

7. **Implemented tiered operator requirements.** Operator requirements scale with campaign size: higher tiers require legal entity status and $1M liability insurance. The platform acknowledges the insurance specification is incomplete pending attorney guidance.

8. **Open-sourced all governance logic.** Governance documentation (GOVERNANCE.md v0.7, GOVERNANCE-SUPPLEMENTS.md) is publicly available for community review. No governance changes are made unilaterally by operators.

9. **Documented unresolved legal questions in governance materials.** The platform has not represented to any party that it is legally compliant. All known unresolved legal questions are documented in GOVERNANCE.md prior to launch.

10. **Deferred launch.** No wallets are live. No public access has been granted. No campaigns are active. The platform has withheld launch specifically pending this legal review.

**Issues Made Easier by Split Model (attorney should confirm):**
- MSB/FinCEN: Known legal entity (Wyoming DAO LLC) can register as MSB if required; AML program can be built around operator-side verification.
- OFAC: Human operator pre-screening of operators is a documented compliance process; better posture than autonomous AI screening.
- §230: Human editorial review of campaigns by identified operator is standard platform-liability analysis, not novel autonomous-AI territory.
- Accountability bright line: Human operator can apply legal judgment to campaign approval; reduces risk of inadvertent extortion-adjacent content.

**Issues That Remain Open (attorney must still address):**
- Monero/Zano AML compatibility with BSA program requirements
- State MTL obligations across all 50 states
- FISA/NSL exposure for operator identity records held by Wyoming DAO LLC
- Anonymous donor OFAC gap (donor-side XMR transactions still untraceable)

---

## RECOMMENDED ATTORNEY SPECIALIZATIONS

Given the breadth and depth of the issues described above, the platform recommends engagement with counsel holding experience in one or more of the following areas:

- **FinCEN / Bank Secrecy Act / MSB law** — Primary; FinCEN registration, AML program design, § 1960 criminal exposure (ideally with cryptocurrency-specific practice experience post-2019 FinCEN guidance)
- **State money transmission licensing** — Multi-state MTL analysis; experience with NY BitLicense, CA DFPI, and similar regimes
- **OFAC and sanctions compliance** — Experience with voluntary self-disclosure, anonymous-architecture platforms, and cryptocurrency sanctions enforcement
- **Section 230 / Internet law** — Familiarity with post-*Roommates.com* development doctrine and modern platform liability cases
- **First Amendment / defamation** — Experience with media liability, public-figure defamation standards, and surveillance accountability litigation
- **National security law / FISA / NSL** — Experience with NSL gag orders, warrant canary legality, and compelled disclosure defense
- **Lobbying disclosure / FARA** — Experience with LDA thresholds and FARA exposure for domestically-operated advocacy platforms
- **Corporate structure / offshore entities** — Jurisdiction analysis for compelled-disclosure minimization
- **Securities / crypto law** — Howey/Reves analysis for governance token structures; SEC enforcement experience
- **Tax / entity structure** — Tax treatment of voluntary tips to a Wyoming DAO LLC; pass-through implications for single-member DAO LLC; entity formation for anonymous-architecture platforms; charitable solicitation compliance

A single firm with a multidisciplinary practice covering FinCEN/BSA, OFAC, and Section 230 would be preferred. National security counsel may need to be engaged separately given the specialized nature of FISA/NSL issues.

---

## CONTACT

**Platform:** Citeback  
**Repository:** github.com/citeback/citebackwebsite  
**Governance Documentation:** GOVERNANCE.md (v0.8 Active), GOVERNANCE-SUPPLEMENTS.md  
**Primary Contact:** citeback@proton.me — pseudonymous platform contact address; personal identities of operators are maintained privately by the Wyoming DAO LLC and available to legal counsel under NDA on request  
**Preferred Response Format:** Written legal opinion letters for each numbered issue, suitable for retention in platform compliance records  
**Urgency:** High — No launch activity will proceed until written guidance is received on Items 1 (MSB/FinCEN) and 3 (OFAC) at minimum

---

*This document was prepared by platform operators in anticipation of attorney engagement. Work product protection is claimed as of the date of preparation. Attorney-client privilege attaches upon formal retention of counsel. This document does not constitute legal advice and should not be relied upon as such.*
